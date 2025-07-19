export class PageOptionsDto {
  page?: number = 1;
  limit?: number = 10;
  sortBy?: string;
  order?: 'ASC' | 'DESC' = 'ASC';
  filters?: Record<string, any>;
}
