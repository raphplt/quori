export class PageMetaDto {
  constructor(
    public readonly totalItems: number,
    public readonly itemCount: number,
    public readonly itemsPerPage: number,
    public readonly totalPages: number,
    public readonly currentPage: number,
  ) {}
}
