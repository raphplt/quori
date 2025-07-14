import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePreferenceDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  favoriteTone!: string;

  @IsString()
  @IsOptional()
  customContext?: string;

  @IsString()
  @IsOptional()
  preferredLanguage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  defaultOutputs?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hashtagPreferences?: string[];

  @IsObject()
  @IsOptional()
  @Type(() => Object)
  modelSettings?: Record<string, any>;
}
