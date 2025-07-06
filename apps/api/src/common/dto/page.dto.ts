import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
  constructor(
    public readonly data: T[],
    public readonly meta: PageMetaDto,
  ) {}
}
