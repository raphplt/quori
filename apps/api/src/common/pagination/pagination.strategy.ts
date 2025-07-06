export interface PaginationArgs {
  page: number;
  limit: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
}

export interface PaginationStrategy<T> {
  paginate(args: PaginationArgs): Promise<PaginationResult<T>>;
}
