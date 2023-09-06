export interface CacheOptions {
    /**
     * Enable cache
     *
     * @type {boolean}
     * @memberof CacheConfig
     */
    enabled: boolean;
    /**
     * standard time to live in seconds. 0 = infinity
     *
     * @type {number}
     * @memberof CacheConfig
     */
    stdTTL?: number;
}
