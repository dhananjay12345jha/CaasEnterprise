export interface GraphQLResponse<T> {
    data: T;
    errors: GraphQLErrorResponse[];
}
export interface GraphQLErrorResponse {
    message: string;
    locations: GraphQLErrorResponseLocation[];
    path: string[];
}
export interface GraphQLErrorResponseLocation {
    line: number;
    column: number;
}
