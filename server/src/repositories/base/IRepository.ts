export interface PaginationOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
}

export interface IRepository<T, CreateInput, UpdateInput> {
  findById(id: number): Promise<T | null>;
  findMany(options?: {
    where?: Record<string, unknown>;
    include?: Record<string, boolean>;
    pagination?: PaginationOptions;
  }): Promise<PaginatedResult<T>>;
  findFirst(options?: {
    where?: Record<string, unknown>;
    include?: Record<string, boolean>;
  }): Promise<T | null>;
  create(data: CreateInput): Promise<T>;
  update(id: number, data: UpdateInput): Promise<T>;
  delete(id: number): Promise<T>;
  count(where?: Record<string, unknown>): Promise<number>;
  exists(id: number): Promise<boolean>;
}
