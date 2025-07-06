import { Injectable } from '@nestjs/common';
import { PaginationStrategy, PaginationArgs } from './pagination.strategy';
import { PageDto } from '../dto/page.dto';
import { PageMetaDto } from '../dto/page-meta.dto';

@Injectable()
export class PaginationService<T> {
  constructor(private readonly strategy: PaginationStrategy<T>) {}

  async paginate(args: PaginationArgs): Promise<PageDto<T>> {
    const { items, total } = await this.strategy.paginate(args);
    const meta = new PageMetaDto(
      total,
      items.length,
      args.limit,
      Math.ceil(total / args.limit),
      args.page,
    );
    return new PageDto(items, meta);
  }
}
