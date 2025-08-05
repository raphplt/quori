import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GenerateOptionsDto } from './generate.dto';

export class RepositoryInfoDto {
  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  stars!: number;

  @IsNumber()
  forks!: number;

  @IsNumber()
  openIssues!: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsArray()
  @IsString({ each: true })
  topics!: string[];

  @IsDateString()
  timestamp!: string;
}

export class GenerateRepositoryDto {
  @ValidateNested()
  @Type(() => RepositoryInfoDto)
  repository!: RepositoryInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GenerateOptionsDto)
  options?: GenerateOptionsDto;
}
