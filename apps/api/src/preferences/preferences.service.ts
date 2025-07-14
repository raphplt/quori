import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preference } from './entities/preference.entity';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Injectable()
export class PreferencesService {
  private readonly logger = new Logger(PreferencesService.name);

  constructor(
    @InjectRepository(Preference)
    private readonly preferenceRepository: Repository<Preference>,
  ) {}

  async create(createPreferenceDto: CreatePreferenceDto): Promise<Preference> {
    this.logger.log(
      `Creating preferences for user ${createPreferenceDto.userId}`,
    );
    const existing = await this.preferenceRepository.findOne({
      where: { userId: createPreferenceDto.userId },
    });
    if (existing) {
      throw new BadRequestException('Preferences already exist for this user');
    }
    const preference = this.preferenceRepository.create(createPreferenceDto);
    return this.preferenceRepository.save(preference);
  }

  async findByUserId(userId: string): Promise<Preference> {
    this.logger.log(`Fetching preferences for user ${userId}`);
    const preference = await this.preferenceRepository.findOne({
      where: { userId },
    });
    if (!preference) {
      throw new NotFoundException('Preferences not found for this user');
    }
    return preference;
  }

  async updateByUserId(
    userId: string,
    updateDto: UpdatePreferenceDto,
  ): Promise<Preference> {
    this.logger.log(`Updating preferences for user ${userId}`);
    const preference = await this.preferenceRepository.findOne({
      where: { userId },
    });
    if (!preference) {
      throw new NotFoundException('Preferences not found for this user');
    }
    Object.assign(preference, updateDto);
    return this.preferenceRepository.save(preference);
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.logger.log(`Deleting preferences for user ${userId}`);
    const result = await this.preferenceRepository.delete({ userId });
    if (result.affected === 0) {
      throw new NotFoundException('Preferences not found for this user');
    }
  }
}
