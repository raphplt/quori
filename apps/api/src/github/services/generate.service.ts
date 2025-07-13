import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { GenerateDto, GenerateResultDto } from '../dto/generate.dto';

interface QuotaInfo {
  date: string;
  count: number;
}

@Injectable()
export class GenerateService {
  private openai: OpenAI;
  private quotas = new Map<string, QuotaInfo>();

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    this.openai = new OpenAI({ apiKey });
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
    const output = options?.output?.join(', ');

    const stats = event.diffStats
      .map(
        (s) =>
          `${s.filePath}: +${s.additions} -${s.deletions} (Δ ${s.changes})`,
      )
      .join('\n');

    return [
      `Contexte : dépôt ${event.repoFullName}, ${event.commitCount} commits, date ${event.timestamp}.`,
      `Titre : ${event.title}`,
      `Description : ${event.desc}`,
      `Fichiers modifiés : ${event.filesChanged.join(', ')}`,
      `Statistiques :\n${stats}`,
      `Langue : ${lang}. Ton : ${tone}.`,
      output ? `Sortie attendue : ${output}.` : '',
      'Instructions : résumé en 3 phrases, puis une leçon à retenir, terminer par une question.',
      'IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide, sans backticks, sans ```json, sans autre texte.',
      'Format exact attendu : {"summary": "texte du résumé", "post": "texte du post"}',
    ]
      .filter(Boolean)
      .join('\n');
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

  async generate(userId: string, dto: GenerateDto): Promise<GenerateResultDto> {
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
}
