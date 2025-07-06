import { IsInt, Min, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class PageOptionsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @Matches(/^(ASC|DESC)$/i)
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  filters?: Record<string, any>;
}
