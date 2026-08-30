// Generic envelope for our Spring Boot API responses. Feature-specific
// payload shapes belong in their own feature, not here.
export interface ApiResponse<T> {
  readonly data: T;
  readonly meta?: Record<string, unknown>;
}

export interface ApiError {
  readonly status: number;
  readonly code: string;
  readonly message: string;
  readonly fieldErrors?: Record<string, string>;
}
