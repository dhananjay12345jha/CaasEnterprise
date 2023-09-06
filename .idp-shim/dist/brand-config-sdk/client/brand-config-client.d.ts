import { CacheOptions } from "../interfaces/cache-options";
import { GetBrandAliasQuery, GetPrivateConfigQuery, GetPublicConfigQuery, GetRoutingConfigQuery } from "../models/typed-document-nodes";
export declare class BrandConfigClient {
    private cacheOptions;
    private readonly appSyncClient;
    constructor(endpoint: string, cacheOptions: CacheOptions);
    getPrivateConfig(brandId: string): Promise<GetPrivateConfigQuery>;
    getRoutingConfig(etld: string): Promise<GetRoutingConfigQuery>;
    getPublicConfig(brandId: string): Promise<GetPublicConfigQuery>;
    getBrandForAlias(aliasId: string, aliasType: string): Promise<GetBrandAliasQuery>;
    private validateGraphQLResponse;
    private getBrandPrivateConfigQuery;
    private getBrandRoutingConfigQuery;
    private getBrandPublicConfigQuery;
    private getBrandAliasQuery;
}
