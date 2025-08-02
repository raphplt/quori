import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { Template } from '../templates/entities/template.entity';
import { GenerateService } from './services/generate.service';

const mockCalls: any[] = [];
vi.mock('openai', () => ({
  OpenAI: class {
    chat = {
      completions: {
        create: (...args: any[]) => {
          mockCalls.push(args);
          return Promise.resolve({
            choices: [{ message: { content: '{"summary":"s","post":"p"}' } }],
          });
        },
      },
    };
  },
}));

describe('GenerateService template integration', () => {
  let service: GenerateService;

  beforeEach(() => {
    const config = {
      get: (key: string) => {
        if (key === 'OPENAI_API_KEY') return 'test';
        if (key === 'GENERATE_PROMPT') return 'Base prompt';
        return undefined;
      },
    } as unknown as ConfigService;

    service = new GenerateService(
      config,
      { save: vi.fn() } as any,
      { findOne: vi.fn() } as any,
      { findOne: vi.fn(), update: vi.fn() } as any,
      {
        findOne: vi.fn().mockResolvedValue({
          id: 1,
          name: 'Formel',
          promptModifier: 'ADD THIS',
          installation: null,
        } as Template),
      } as any,
      { findByUserId: vi.fn().mockResolvedValue(null) } as any,
      { publish: vi.fn() } as any,
    );
  });

  it('appends template prompt modifier', async () => {
    await service.generate('u1', {
      event: {
        title: 't',
        desc: 'd',
        filesChanged: [],
        diffStats: [],
        repoFullName: 'r',
        commitCount: 1,
        timestamp: 'now',
      },
      templateId: 1,
    });
    const prompt = mockCalls[0][0].messages[0].content;
    expect(prompt).toContain('ADD THIS');
  });
});
