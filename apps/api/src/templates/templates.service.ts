import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Template } from './entities/template.entity';

@Injectable()
export class TemplatesService implements OnModuleInit {
  constructor(
    @InjectRepository(Template) private readonly repo: Repository<Template>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaults();
  }

  async ensureDefaults() {
    const count = await this.repo.count();
    if (count > 0) return;
    const templates = [
      {
        name: 'Formel',
        description: 'Ton professionnel, structuré',
        promptModifier: 'Utilise un ton professionnel et structuré.',
      },
      {
        name: 'Décontracté',
        description: 'Ton conversationnel, familier',
        promptModifier: 'Adopte un style convivial et familier.',
      },
      {
        name: 'Humoristique',
        description: "Ton léger, touche d'humour",
        promptModifier: "Ajoute une touche d'humour et de légèreté.",
      },
      {
        name: 'Technique',
        description: 'Ton détaillé, axé code',
        promptModifier:
          "Sois précis et mets l'accent sur les aspects techniques.",
      },
    ];
    await this.repo.insert(templates);
  }

  findAvailable(installationId?: number) {
    return this.repo.find({
      where: [
        { installation: IsNull() },
        ...(installationId ? [{ installation: { id: installationId } }] : []),
      ],
      order: { id: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['installation'] });
  }
}
