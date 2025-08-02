import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRoleEnum } from './user.interface';
import { UserEntity } from './user.entity';
import { ScheduledPost } from '../scheduled_posts/entities/scheduled_post.entity';
import { Preference } from '../preferences/entities/preference.entity';
import * as crypto from 'crypto';

export interface GitHubProfile {
  id: string;
  username: string;
  displayName?: string;
  emails?: Array<{ value: string; primary?: boolean }>;
  photos?: Array<{ value: string }>;
}

@Injectable()
export class UsersService {
  private readonly secret =
    process.env.ENCRYPTION_KEY ||
    process.env.SESSION_SECRET ||
    'default-secret';

  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    @InjectRepository(ScheduledPost)
    private readonly scheduledPostRepo: Repository<ScheduledPost>,
    @InjectRepository(Preference)
    private readonly preferenceRepo: Repository<Preference>,
  ) {}

  private encrypt(value: string): string {
    const key = crypto.createHash('sha256').update(this.secret).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  private decrypt(payload: string): string {
    const [ivHex, tagHex, encHex] = payload.split(':');
    const key = crypto.createHash('sha256').update(this.secret).digest();
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  async findByRefreshToken(refreshToken: string): Promise<User | undefined> {
    const entity = await this.repo.findOne({
      where: { refresh_token: refreshToken },
    });
    return entity ? this.toUser(entity) : undefined;
  }

  async findByGithubId(githubId: string): Promise<User | undefined> {
    const entity = await this.repo.findOne({ where: { github_id: githubId } });
    return entity ? this.toUser(entity) : undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const entity = await this.repo.findOne({ where: { id: id } });
    return entity ? this.toUser(entity) : undefined;
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | undefined,
    refreshTokenExpires?: Date,
  ): Promise<void> {
    await this.repo.update(
      { id: id },
      {
        refresh_token: refreshToken,
        refresh_token_expires: refreshTokenExpires,
        updated_at: new Date(),
      },
    );
  }

  async create(
    githubProfile: GitHubProfile,
    githubAccessToken?: string,
  ): Promise<User> {
    const entity: UserEntity = {
      id: crypto.randomUUID(),
      github_id: githubProfile.id,
      username: githubProfile.username,
      email: githubProfile.emails?.[0]?.value || '',
      avatar_url: githubProfile.photos?.[0]?.value || '',
      name: githubProfile.displayName || githubProfile.username,
      role: UserRoleEnum.USER,
      github_access_token: githubAccessToken
        ? this.encrypt(githubAccessToken)
        : undefined,
      refresh_token: undefined,
      refresh_token_expires: undefined,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const saved = await this.repo.save(entity);
    return this.toUser(saved);
  }

  async update(
    id: string,
    updateData: Partial<User>,
  ): Promise<User | undefined> {
    const entity = await this.repo.findOne({ where: { id: id } });
    if (!entity) {
      return undefined;
    }

    if (updateData.username !== undefined)
      entity.username = updateData.username;
    if (updateData.email !== undefined) entity.email = updateData.email;
    if (updateData.avatarUrl !== undefined)
      entity.avatar_url = updateData.avatarUrl;
    if (updateData.name !== undefined) entity.name = updateData.name;
    if (updateData.role !== undefined) entity.role = updateData.role;
    if (updateData.linkedInId !== undefined)
      entity.linkedIn_id = updateData.linkedInId;
    if (updateData.githubAccessToken !== undefined) {
      entity.github_access_token = this.encrypt(updateData.githubAccessToken);
    }
    entity.updated_at = new Date();

    const saved = await this.repo.save(entity);
    return this.toUser(saved);
  }

  async updateLinkedInId(id: string, linkedInId: string | null): Promise<void> {
    await this.repo.update(
      { id: id },
      {
        linkedIn_id: linkedInId || undefined,
        updated_at: new Date(),
      },
    );
  }

  async updateLinkedInToken(id: string, accessToken: string): Promise<void> {
    await this.repo.update(
      { id: id },
      {
        linkedin_access_token: this.encrypt(accessToken),
        updated_at: new Date(),
      },
    );
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repo.find();
    return entities.map((e) => this.toUser(e));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  private toUser(entity: UserEntity): User {
    return {
      id: entity.id,
      githubId: entity.github_id,
      username: entity.username,
      email: entity.email,
      avatarUrl: entity.avatar_url,
      name: entity.name,
      role: entity.role,
      linkedInId: entity.linkedIn_id,
      linkedinAccessToken: entity.linkedin_access_token
        ? this.decrypt(entity.linkedin_access_token)
        : undefined,
      githubAccessToken: entity.github_access_token
        ? this.decrypt(entity.github_access_token)
        : undefined,
      refreshToken: entity.refresh_token,
      refreshTokenExpires: entity.refresh_token_expires,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  async deleteUserById(id: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    // Supprimer manuellement les entités liées pour s'assurer qu'elles sont bien supprimées
    // Note: Les cascades sont configurées au niveau de la base de données, mais on les supprime
    // explicitement ici pour plus de sécurité et de traçabilité

    // Supprimer les posts programmés
    await this.scheduledPostRepo.delete({ user_id: id });

    // Supprimer les préférences (normalement supprimées automatiquement par CASCADE)
    await this.preferenceRepo.delete({ userId: id });

    // Supprimer l'utilisateur (cela supprimera automatiquement OnboardingStatus grâce au cascade)
    await this.repo.remove(user);
  }
}
