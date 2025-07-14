import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenAI } from 'openai';
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
  private promptTemplate: string;
  private quotas = new Map<string, QuotaInfo>();

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

    this.promptTemplate = (
      this.config.get<string>('GENERATE_PROMPT') ?? ''
    ).trim();
    if (!this.promptTemplate) {
      throw new Error(
        'GENERATE_PROMPT environment variable is missing or empty',
      );
    }
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

    const statsBlock = event.diffStats
      .map(
        (s) =>
          `• ${s.filePath}: +${s.additions} −${s.deletions} (Δ${s.changes})`,
      )
      .join('\n');

    // Replace placeholders in the prompt template
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
    // Strip markdown code fences
    const codeBlockPattern = /```(?:json)?\s*([\s\S]*?)\s*```/g;
    const match = codeBlockPattern.exec(content);
    if (match) {
      return match[1].trim();
    }
    // Fallback: extract JSON object
    const jsonPattern = /\{[\s\S]*\}/;
    const jsonMatch = content.match(jsonPattern);
    return jsonMatch ? jsonMatch[0] : content.trim();
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
    post.tone = options?.tone;

    if (installationId) {
      const inst = await this.installationRepository.findOne({
        where: { id: installationId },
      });
      if (inst) {
        post.installation = inst;
      }
    }

    if (eventDeliveryId) {
      const ev = await this.eventRepository.findOne({
        where: { delivery_id: eventDeliveryId },
      });
      if (ev) {
        post.event = ev;
        await this.eventRepository.update(
          { delivery_id: eventDeliveryId },
          { status: 'processed', processed_at: new Date() },
        );
      }
    }

    return this.postRepository.save(post);
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
      const cleaned = this.cleanJsonResponse(content);
      console.debug('DEBUG ▶ cleaned response', cleaned);

      const parsed = JSON.parse(cleaned) as GenerateResultDto;
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
      if (e instanceof BadRequestException) throw e;
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
    const where: Partial<Post> = {};
    if (
      status &&
      ['draft', 'ready', 'scheduled', 'published', 'failed'].includes(status)
    ) {
      where.status = status as PostStatus;
    }
    const [posts, total] = await this.postRepository.findAndCount({
      where,
      relations: ['installation', 'event'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });
    return { posts, total, page, limit };
  }

  async getPostById(id: number): Promise<Post | null> {
    return this.postRepository.findOne({
      where: { id },
      relations: ['installation', 'event'],
    });
  }

  async updatePostStatus(id: number, status: PostStatus): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
    });
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    post.status = status;
    if (status === 'published') {
      post.publishedAt = new Date();
    }
    return this.postRepository.save(post);
  }
}
