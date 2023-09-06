export interface BrazeApiClientConfig {
  baseURL: string;
  apiKey: string;
  shouldRetry: boolean;
  retryCount?: number;
  retryDelay?: number;
  logRetryRequests?: boolean;
}
