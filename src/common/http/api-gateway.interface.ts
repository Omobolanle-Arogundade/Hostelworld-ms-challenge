export interface ApiGateway {
  get<T>(url: string, options?: any): Promise<T>;
}
