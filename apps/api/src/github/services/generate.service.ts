import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { GenerateDto, GenerateResultDto } from '../dto/generate.dto';
import { Post, PostStatus } from '../entities/post.entity';
import { Installation } from '../entities/installation.entity';
import { Event } from '../entities/event.entity';

interface QuotaInfo {
  date: string;
  count: number;
}

@Injectable()
export class GenerateService {
  private openai: OpenAI;
  private quotas = new Map<string, QuotaInfo>();

  private promptTemplate: string;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Installation)
    private readonly installationRepository: Repository<Installation>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    this.openai = new OpenAI({ apiKey });

    // Charge le prompt depuis le fichier externe
    const promptPath = path.resolve(
      __dirname,
      '../prompts/generate-prompt.txt',
    );
    this.promptTemplate = fs.readFileSync(promptPath, 'utf-8');
  }

  private checkQuota(userId: string): void {
    const today = new Date().toISOString().slice(0, 10);
    const q = this.quotas.get(userId);
    if (q && q.date === today) {
      if (q.count >= 5) {
        throw new ForbiddenException('Daily quota exceeded');
      }
      q.count += 1;
    } else {
      this.quotas.set(userId, { date: today, count: 1 });
    }
  }

  private buildPrompt(dto: GenerateDto): string {
    const { event, options } = dto;
    const lang = options?.lang ?? 'français';
    const tone = options?.tone ?? 'accessible, professionnel, léger humour';
    const outputs = options?.output?.join(', ') ?? 'summary, post';

    // Prépare les stats en bloc
    const statsBlock = event.diffStats
      .map(
        (s) =>
          `• ${s.filePath}: +${s.additions} −${s.deletions} (Δ${s.changes})`,
      )
      .join('\n');

    // Remplacement des variables dans le template externe
    return this.promptTemplate
      .replace(/\{\{repoFullName\}\}/g, event.repoFullName)
      .replace(/\{\{commitCount\}\}/g, String(event.commitCount))
      .replace(/\{\{timestamp\}\}/g, event.timestamp)
      .replace(/\{\{title\}\}/g, event.title)
      .replace(/\{\{desc\}\}/g, event.desc)
      .replace(/\{\{filesChanged\}\}/g, event.filesChanged.join(', '))
      .replace(/\{\{statsBlock\}\}/g, statsBlock)
      .replace(/\{\{lang\}\}/g, lang)
      .replace(/\{\{tone\}\}/g, tone)
      .replace(/\{\{outputs\}\}/g, outputs);
  }

  private cleanJsonResponse(content: string): string {
    // Enlever les blocs de code markdown
    const codeBlockPattern = /```(?:json)?\s*([\s\S]*?)\s*```/g;
    const match = codeBlockPattern.exec(content);
    if (match) {
      return match[1].trim();
    }

    // Si pas de bloc de code, chercher JSON dans le texte
    const jsonPattern = /\{[\s\S]*\}/;
    const jsonMatch = content.match(jsonPattern);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    return content.trim();
  }

  private async savePostToDatabase(
    generatedContent: GenerateResultDto,
    openaiResponse: OpenAI.Chat.Completions.ChatCompletion,
    installationId?: number,
    eventDeliveryId?: string,
    options?: { lang?: string; tone?: string; output?: string[] },
  ): Promise<Post> {
    const post = new Post();
    post.summary = generatedContent.summary;
    post.postContent = generatedContent.post;
    post.rawResponse = {
      openai: openaiResponse,
      request_options: options,
      generated_at: new Date().toISOString(),
    };
    post.status = 'draft';
    post.tone = options?.tone || undefined;

    if (installationId) {
      const installation = await this.installationRepository.findOne({
        where: { id: installationId },
      });
      if (installation) {
        post.installation = installation;
      }
    }

    if (eventDeliveryId) {
      const event = await this.eventRepository.findOne({
        where: { delivery_id: eventDeliveryId },
      });
      if (event) {
        post.event = event;

        // Mettre à jour le statut de l'event à "processed" quand un post est généré
        await this.eventRepository.update(
          { delivery_id: eventDeliveryId },
          {
            status: 'processed',
            processed_at: new Date(),
          },
        );
      }
    }

    return await this.postRepository.save(post);
  }

  async generate(
    userId: string,
    dto: GenerateDto,
    installationId?: number,
    eventDeliveryId?: string,
  ): Promise<GenerateResultDto> {
    this.checkQuota(userId);
    const prompt = this.buildPrompt(dto);
    console.debug('DEBUG ▶ prompt', prompt);

    try {
      const res = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = res.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('No content received from OpenAI');
      }

      console.debug('DEBUG ▶ raw response', content);

      const cleanedContent = this.cleanJsonResponse(content);
      console.debug('DEBUG ▶ cleaned response', cleanedContent);

      const parsed = JSON.parse(cleanedContent) as GenerateResultDto;
      if (
        typeof parsed.summary !== 'string' ||
        typeof parsed.post !== 'string'
      ) {
        throw new Error('Invalid structure: missing summary or post');
      }

      await this.savePostToDatabase(
        parsed,
        res,
        installationId,
        eventDeliveryId,
        dto.options,
      );

      return parsed;
    } catch (e) {
      console.error('Error in generate service:', e);
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new BadRequestException(
        `Failed to parse OpenAI response: ${(e as Error).message}`,
      );
    }
  }

  async getPosts(
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    const whereCondition: Partial<Post> = {};
    if (
      status &&
      ['draft', 'ready', 'scheduled', 'published', 'failed'].includes(status)
    ) {
      whereCondition.status = status as PostStatus;
    }

    const [posts, total] = await this.postRepository.findAndCount({
      where: whereCondition,
      relations: ['installation', 'event'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async getPostById(id: number): Promise<Post | null> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['installation', 'event'],
    });
    return post;
  }

  async updatePostStatus(id: number, status: PostStatus): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new BadRequestException('Post not found');
    }

    post.status = status;
    if (status === 'published') {
      post.publishedAt = new Date();
    }

    return await this.postRepository.save(post);
  }
}
