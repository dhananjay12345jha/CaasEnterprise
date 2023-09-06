export interface HttpResponse<T = unknown> {
    data: T;
    status: number;
}
