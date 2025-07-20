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
import { Template } from '../../templates/entities/template.entity';
import { PreferencesService } from '../../preferences/preferences.service';

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
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    private readonly preferencesService: PreferencesService,
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
    // Nettoyer la réponse pour extraire le JSON valide
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    return jsonMatch[0];
  }

  private validateGenerateResult(data: unknown): GenerateResultDto {
    if (!data || typeof data !== 'object') {
      throw new Error('Response is not a valid object');
    }

    const result = data as Record<string, unknown>;

    if (typeof result.summary !== 'string' || !result.summary.trim()) {
      throw new Error('Invalid or missing summary field');
    }

    if (typeof result.post !== 'string' || !result.post.trim()) {
      throw new Error('Invalid or missing post field');
    }

    return {
      summary: result.summary,
      post: result.post,
    };
  }

  private async savePostToDatabase(
    generatedContent: GenerateResultDto,
    openaiResponse: OpenAI.Chat.Completions.ChatCompletion,
    installationId?: number,
    eventDeliveryId?: string,
    options?: { lang?: string; tone?: string; output?: string[] },
    templateName?: string,
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
    post.template = templateName;

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

    let template: Template | null = null;
    if (dto.templateId) {
      template = await this.templateRepository.findOne({
        where: { id: dto.templateId },
        relations: ['installation'],
      });
      if (!template) {
        throw new BadRequestException('Template not found');
      }
      if (
        template.installation &&
        installationId &&
        template.installation.id !== installationId
      ) {
        throw new ForbiddenException('Template not allowed for installation');
      }
    }

    // Préférences utilisateur (fallback sur valeurs globales)
    let preferences:
      | import('../../preferences/entities/preference.entity').Preference
      | null = null;
    try {
      preferences = await this.preferencesService.findByUserId(userId);
    } catch {
      preferences = null; // NotFound = pas de préférences, fallback sur défauts
    }

    // Appliquer les préférences ou fallback
    const lang: string =
      preferences?.preferredLanguage || dto.options?.lang || 'français';
    const tone: string =
      preferences?.favoriteTone ||
      dto.options?.tone ||
      'accessible, professionnel, léger humour';
    const outputs: string[] = preferences?.defaultOutputs ||
      dto.options?.output || ['summary', 'post'];
    const hashtags: string[] = preferences?.hashtagPreferences || [];
    const customContext: string = preferences?.customContext || '';
    const modelSettings: Record<string, unknown> =
      preferences?.modelSettings || {};

    // Fusionner dans le DTO/options pour buildPrompt
    const promptDto = {
      ...dto,
      options: {
        ...dto.options,
        lang,
        tone,
        output: outputs,
        hashtags,
        customContext,
        ...modelSettings,
      },
    };

    let prompt = this.buildPrompt(promptDto);
    if (template?.promptModifier) {
      prompt += `\n${template.promptModifier}`;
    }
    console.debug('DEBUG ▶ prompt', prompt);

    try {
      const res = await this.openai.chat.completions.create({
        model: (modelSettings.model as string) || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: (modelSettings.temperature as number) ?? 0.7,
        top_p: (modelSettings.top_p as number) || undefined,
      });

      const content = res.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('No content received from OpenAI');
      }

      console.debug('DEBUG ▶ raw response', content);
      const cleaned = this.cleanJsonResponse(content);
      console.debug('DEBUG ▶ cleaned response', cleaned);

      const parsed = this.validateGenerateResult(JSON.parse(cleaned));

      await this.savePostToDatabase(
        parsed,
        res,
        installationId,
        eventDeliveryId,
        promptDto.options,
        template?.name,
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
