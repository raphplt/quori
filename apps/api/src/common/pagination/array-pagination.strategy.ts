import { Injectable } from '@nestjs/common';
import {
  PaginationStrategy,
  PaginationArgs,
  PaginationResult,
} from './pagination.strategy';

@Injectable()
export class ArrayPaginationStrategy<T> implements PaginationStrategy<T> {
  constructor(private readonly dataSource: () => Promise<T[]>) {}

  async paginate(args: PaginationArgs): Promise<PaginationResult<T>> {
    const { page, limit, sortBy, order, filters } = args;
    let items = await this.dataSource();

    // filtres
    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        items = items.filter((item) =>
          String(item[field])
            .toLowerCase()
            .includes(String(value).toLowerCase()),
        );
      });
    }

    // tri
    if (sortBy) {
      items = items.sort((a, b) => {
        const va = a[sortBy as keyof T],
          vb = b[sortBy as keyof T];
        if (va == vb) return 0;
        const cmp = va > vb ? 1 : -1;
        return order === 'ASC' ? cmp : -cmp;
      });
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return { items: paged, total };
  }
}
