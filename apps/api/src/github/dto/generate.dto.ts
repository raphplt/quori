import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DiffStatDto {
  @IsString()
  filePath!: string;

  @IsNumber()
  additions!: number;

  @IsNumber()
  deletions!: number;

  @IsNumber()
  changes!: number;
}

export class EventDto {
  @IsString()
  title!: string;

  @IsString()
  desc!: string;

  @IsArray()
  @IsString({ each: true })
  filesChanged!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiffStatDto)
  diffStats!: DiffStatDto[];

  @IsString()
  repoFullName!: string;

  @IsNumber()
  commitCount!: number;

  @IsDateString()
  timestamp!: string;
}

export class GenerateOptionsDto {
  @IsOptional()
  @IsString()
  lang?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  output?: string[];
}

export class GenerateDto {
  @ValidateNested()
  @Type(() => EventDto)
  event!: EventDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GenerateOptionsDto)
  options?: GenerateOptionsDto;

  @IsOptional()
  @IsNumber()
  templateId?: number;
}

export class GenerateResultDto {
  @IsString()
  summary!: string;

  @IsString()
  post!: string;
}
