import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export declare type Maybe<T> = T | null;
export declare type InputMaybe<T> = Maybe<T>;
export declare type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export declare type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export declare type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export declare type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    AWSDate: string;
    AWSDateTime: string;
    AWSEmail: string;
    AWSIPAddress: string;
    AWSJSON: string;
    AWSPhone: string;
    AWSTime: string;
    AWSTimestamp: number;
    AWSURL: string;
};
export declare type Query = {
    __typename?: "Query";
    featureFlags: Array<Maybe<FeatureFlagBrand>>;
    getBrandAlias?: Maybe<BrandAlias>;
    getBrandMeta?: Maybe<BrandMeta>;
    getConfigMap?: Maybe<ConfigMap>;
    getEndpoint?: Maybe<Endpoint>;
    getExternalProvider?: Maybe<ExternalProvider>;
    getFeatureFlag?: Maybe<FeatureFlag>;
    getFeatureFlagBrand?: Maybe<FeatureFlagBrand>;
    getIdentityProvider?: Maybe<IdentityProvider>;
    getPrivateConfig: PrivateConfig;
    getPublicConfig: PublicConfig;
    getRoutingConfig: RoutingConfig;
    listBrandAliases?: Maybe<BrandAliasConnection>;
    listBrandMetas?: Maybe<BrandMetaConnection>;
    listConfigMap?: Maybe<ConfigMapConnection>;
    listEndpoints?: Maybe<EndpointConnection>;
    listExternalProviders?: Maybe<ExternalProviderConnection>;
    listFeatureFlagBrands?: Maybe<FeatureFlagBrandConnection>;
    listFeatureFlags?: Maybe<FeatureFlagConnection>;
    listIdentityProviders?: Maybe<IdentityProviderConnection>;
    privateEndpoints: Array<Maybe<Endpoint>>;
    publicEndpoints: Array<Maybe<Endpoint>>;
};
export declare type QueryFeatureFlagsArgs = {
    brandId: Scalars["ID"];
    filter?: InputMaybe<Array<Scalars["String"]>>;
};
export declare type QueryGetBrandAliasArgs = {
    aliasId: Scalars["ID"];
};
export declare type QueryGetBrandMetaArgs = {
    brandId: Scalars["ID"];
};
export declare type QueryGetConfigMapArgs = {
    brandId: Scalars["String"];
    type: Scalars["String"];
};
export declare type QueryGetEndpointArgs = {
    type: EndpointType;
    url: Scalars["String"];
};
export declare type QueryGetExternalProviderArgs = {
    brandId: Scalars["String"];
    type: Scalars["String"];
};
export declare type QueryGetFeatureFlagArgs = {
    name: Scalars["String"];
};
export declare type QueryGetFeatureFlagBrandArgs = {
    brandId: Scalars["ID"];
    name: Scalars["String"];
};
export declare type QueryGetIdentityProviderArgs = {
    region: Scalars["String"];
    userPoolId: Scalars["String"];
};
export declare type QueryGetPrivateConfigArgs = {
    brandId: Scalars["ID"];
};
export declare type QueryGetPublicConfigArgs = {
    brandId: Scalars["ID"];
};
export declare type QueryGetRoutingConfigArgs = {
    etld: Scalars["String"];
};
export declare type QueryListBrandAliasesArgs = {
    filter?: InputMaybe<TableBrandAliasFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
};
export declare type QueryListBrandMetasArgs = {
    filter?: InputMaybe<TableBrandMetaFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
};
export declare type QueryListConfigMapArgs = {
    filter?: InputMaybe<TableConfigMapFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
};
export declare type QueryListEndpointsArgs = {
    filter?: InputMaybe<TableEndpointFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
};
export declare type QueryListExternalProvidersArgs = {
    filter?: InputMaybe<TableExternalProviderFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
};
export declare type QueryListFeatureFlagBrandsArgs = {
    filter?: InputMaybe<TableFeatureFlagBrandFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
};
export declare type QueryListFeatureFlagsArgs = {
    filter?: InputMaybe<TableFeatureFlagFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
};
export declare type QueryListIdentityProvidersArgs = {
    filter?: InputMaybe<TableIdentityProviderFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
};
export declare type QueryPrivateEndpointsArgs = {
    brandId: Scalars["ID"];
    filter?: InputMaybe<Array<InputMaybe<EndpointType>>>;
};
export declare type QueryPublicEndpointsArgs = {
    brandId: Scalars["ID"];
    filter?: InputMaybe<Array<InputMaybe<EndpointType>>>;
};
export declare type FeatureFlagBrand = {
    __typename?: "FeatureFlagBrand";
    brandId: Scalars["ID"];
    description?: Maybe<Scalars["String"]>;
    enable: Scalars["Boolean"];
    name: Scalars["String"];
};
export declare type BrandAlias = {
    __typename?: "BrandAlias";
    aliasId: Scalars["ID"];
    brandId?: Maybe<Scalars["String"]>;
};
export declare type BrandMeta = {
    __typename?: "BrandMeta";
    brandId: Scalars["ID"];
    etld: Scalars["String"];
    tenantId: Scalars["ID"];
};
export declare type ConfigMap = {
    __typename?: "ConfigMap";
    brandId: Scalars["ID"];
    items?: Maybe<Array<Maybe<ConfigMapItem>>>;
    type: Scalars["String"];
};
export declare type ConfigMapItem = {
    __typename?: "ConfigMapItem";
    key: Scalars["String"];
    value: Scalars["String"];
};
export declare enum EndpointType {
    Auth = "AUTH",
    Commerceapi = "COMMERCEAPI",
    Graph = "GRAPH",
    WebCheckout = "WEB_CHECKOUT",
    WebStorefront = "WEB_STOREFRONT"
}
export declare type Endpoint = {
    __typename?: "Endpoint";
    brandId: Scalars["ID"];
    endpointScope: EndpointScope;
    token?: Maybe<Scalars["String"]>;
    type: EndpointType;
    url: Scalars["String"];
};
export declare enum EndpointScope {
    Private = "PRIVATE",
    Public = "PUBLIC"
}
export declare type ExternalProvider = {
    __typename?: "ExternalProvider";
    brandId: Scalars["ID"];
    providerConfigs?: Maybe<Array<Maybe<ExternalProviderConfig>>>;
    type: Scalars["String"];
};
export declare type ExternalProviderConfig = {
    __typename?: "ExternalProviderConfig";
    key: Scalars["String"];
    value?: Maybe<Scalars["String"]>;
};
export declare type FeatureFlag = {
    __typename?: "FeatureFlag";
    description?: Maybe<Scalars["String"]>;
    enable: Scalars["Boolean"];
    name: Scalars["String"];
};
export declare type IdentityProvider = {
    __typename?: "IdentityProvider";
    brandId: Scalars["ID"];
    clientId: Scalars["String"];
    clientSecret: Scalars["String"];
    endpoint: Scalars["String"];
    provider: Scalars["String"];
    region: Scalars["String"];
    userPoolId: Scalars["String"];
};
export declare type PrivateConfig = {
    __typename?: "PrivateConfig";
    brand?: Maybe<BrandMeta>;
    externalProviders?: Maybe<Array<Maybe<ExternalProvider>>>;
    identityProvider?: Maybe<IdentityProvider>;
};
export declare type PublicConfig = {
    __typename?: "PublicConfig";
    brand?: Maybe<BrandMeta>;
    configMap?: Maybe<Array<Maybe<ConfigMap>>>;
    featureFlags?: Maybe<Array<Maybe<FeatureFlagBrand>>>;
};
export declare type RoutingConfig = {
    __typename?: "RoutingConfig";
    brand?: Maybe<BrandMeta>;
    privateEndpoints?: Maybe<Array<Maybe<Endpoint>>>;
    publicEndpoints?: Maybe<Array<Maybe<Endpoint>>>;
};
export declare type TableBrandAliasFilterInput = {
    aliasId?: InputMaybe<TableStringFilterInput>;
};
export declare type TableStringFilterInput = {
    beginsWith?: InputMaybe<Scalars["String"]>;
    between?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
    contains?: InputMaybe<Scalars["String"]>;
    eq?: InputMaybe<Scalars["String"]>;
    ge?: InputMaybe<Scalars["String"]>;
    gt?: InputMaybe<Scalars["String"]>;
    le?: InputMaybe<Scalars["String"]>;
    lt?: InputMaybe<Scalars["String"]>;
    ne?: InputMaybe<Scalars["String"]>;
    notContains?: InputMaybe<Scalars["String"]>;
};
export declare type BrandAliasConnection = {
    __typename?: "BrandAliasConnection";
    items?: Maybe<Array<Maybe<BrandAlias>>>;
    nextToken?: Maybe<Scalars["String"]>;
};
export declare type TableBrandMetaFilterInput = {
    brandId?: InputMaybe<TableIdFilterInput>;
    etld?: InputMaybe<TableIdFilterInput>;
    tenantId?: InputMaybe<TableIdFilterInput>;
};
export declare type TableIdFilterInput = {
    beginsWith?: InputMaybe<Scalars["ID"]>;
    between?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
    contains?: InputMaybe<Scalars["ID"]>;
    eq?: InputMaybe<Scalars["ID"]>;
    ge?: InputMaybe<Scalars["ID"]>;
    gt?: InputMaybe<Scalars["ID"]>;
    le?: InputMaybe<Scalars["ID"]>;
    lt?: InputMaybe<Scalars["ID"]>;
    ne?: InputMaybe<Scalars["ID"]>;
    notContains?: InputMaybe<Scalars["ID"]>;
};
export declare type BrandMetaConnection = {
    __typename?: "BrandMetaConnection";
    items?: Maybe<Array<Maybe<BrandMeta>>>;
    nextToken?: Maybe<Scalars["String"]>;
};
export declare type TableConfigMapFilterInput = {
    brandId?: InputMaybe<TableStringFilterInput>;
    type?: InputMaybe<TableStringFilterInput>;
};
export declare type ConfigMapConnection = {
    __typename?: "ConfigMapConnection";
    items?: Maybe<Array<Maybe<ConfigMap>>>;
    nextToken?: Maybe<Scalars["String"]>;
};
export declare type TableEndpointFilterInput = {
    brandId?: InputMaybe<TableStringFilterInput>;
    token?: InputMaybe<TableStringFilterInput>;
    url?: InputMaybe<TableStringFilterInput>;
};
export declare type EndpointConnection = {
    __typename?: "EndpointConnection";
    items?: Maybe<Array<Maybe<Endpoint>>>;
    nextToken?: Maybe<Scalars["String"]>;
};
export declare type TableExternalProviderFilterInput = {
    brandId?: InputMaybe<TableStringFilterInput>;
    type?: InputMaybe<TableStringFilterInput>;
};
export declare type ExternalProviderConnection = {
    __typename?: "ExternalProviderConnection";
    items?: Maybe<Array<Maybe<ExternalProvider>>>;
    nextToken?: Maybe<Scalars["String"]>;
};
export declare type TableFeatureFlagBrandFilterInput = {
    brandId?: InputMaybe<TableIdFilterInput>;
    name?: InputMaybe<TableStringFilterInput>;
};
export declare type FeatureFlagBrandConnection = {
    __typename?: "FeatureFlagBrandConnection";
    items?: Maybe<Array<Maybe<FeatureFlagBrand>>>;
    nextToken?: Maybe<Scalars["String"]>;
};
export declare type TableFeatureFlagFilterInput = {
    description?: InputMaybe<TableStringFilterInput>;
    enable?: InputMaybe<TableBooleanFilterInput>;
};
export declare type TableBooleanFilterInput = {
    eq?: InputMaybe<Scalars["Boolean"]>;
    ne?: InputMaybe<Scalars["Boolean"]>;
};
export declare type FeatureFlagConnection = {
    __typename?: "FeatureFlagConnection";
    items?: Maybe<Array<Maybe<FeatureFlag>>>;
    nextToken?: Maybe<Scalars["String"]>;
};
export declare type TableIdentityProviderFilterInput = {
    brandId?: InputMaybe<TableStringFilterInput>;
    clientId?: InputMaybe<TableStringFilterInput>;
    clientSecret?: InputMaybe<TableStringFilterInput>;
    endpoint?: InputMaybe<TableStringFilterInput>;
    provider?: InputMaybe<TableStringFilterInput>;
    region?: InputMaybe<TableStringFilterInput>;
    userPoolId?: InputMaybe<TableStringFilterInput>;
};
export declare type IdentityProviderConnection = {
    __typename?: "IdentityProviderConnection";
    items?: Maybe<Array<Maybe<IdentityProvider>>>;
    nextToken?: Maybe<Scalars["String"]>;
};
export declare type Mutation = {
    __typename?: "Mutation";
    createBrandAlias?: Maybe<BrandAlias>;
    createBrandMeta?: Maybe<BrandMeta>;
    createConfigMap?: Maybe<ConfigMap>;
    createEndpoint?: Maybe<Endpoint>;
    createExternalProvider?: Maybe<ExternalProvider>;
    createFeatureFlag?: Maybe<FeatureFlag>;
    createFeatureFlagBrand?: Maybe<FeatureFlagBrand>;
    createIdentityProvider?: Maybe<IdentityProvider>;
    deleteBrandAlias?: Maybe<BrandAlias>;
    deleteBrandMeta?: Maybe<BrandMeta>;
    deleteConfigMap?: Maybe<ConfigMap>;
    deleteEndpoint?: Maybe<Endpoint>;
    deleteExternalProvider?: Maybe<ExternalProvider>;
    deleteFeatureFlag?: Maybe<FeatureFlag>;
    deleteFeatureFlagBrand?: Maybe<FeatureFlagBrand>;
    deleteIdentityProvider?: Maybe<IdentityProvider>;
    updateBrandMeta?: Maybe<BrandMeta>;
    updateEndpoint?: Maybe<Endpoint>;
    updateFeatureFlag?: Maybe<FeatureFlag>;
    updateFeatureFlagBrand?: Maybe<FeatureFlagBrand>;
    updateIdentityProvider?: Maybe<IdentityProvider>;
};
export declare type MutationCreateBrandAliasArgs = {
    input: CreateBrandAliasInput;
};
export declare type MutationCreateBrandMetaArgs = {
    input: CreateBrandMetaInput;
};
export declare type MutationCreateConfigMapArgs = {
    input: CreateConfigMapInput;
};
export declare type MutationCreateEndpointArgs = {
    input: CreateEndpointInput;
};
export declare type MutationCreateExternalProviderArgs = {
    input: CreateExternalProviderInput;
};
export declare type MutationCreateFeatureFlagArgs = {
    input: CreateFeatureFlagInput;
};
export declare type MutationCreateFeatureFlagBrandArgs = {
    input: CreateFeatureFlagBrandInput;
};
export declare type MutationCreateIdentityProviderArgs = {
    input: CreateIdentityProviderInput;
};
export declare type MutationDeleteBrandAliasArgs = {
    input: DeleteBrandAliasInput;
};
export declare type MutationDeleteBrandMetaArgs = {
    input: DeleteBrandMetaInput;
};
export declare type MutationDeleteConfigMapArgs = {
    input: DeleteConfigMapInput;
};
export declare type MutationDeleteEndpointArgs = {
    input: DeleteEndpointInput;
};
export declare type MutationDeleteExternalProviderArgs = {
    input: DeleteExternalProviderInput;
};
export declare type MutationDeleteFeatureFlagArgs = {
    input: DeleteFeatureFlagInput;
};
export declare type MutationDeleteFeatureFlagBrandArgs = {
    input: DeleteFeatureFlagBrandInput;
};
export declare type MutationDeleteIdentityProviderArgs = {
    input: DeleteIdentityProviderInput;
};
export declare type MutationUpdateBrandMetaArgs = {
    input: UpdateBrandMetaInput;
};
export declare type MutationUpdateEndpointArgs = {
    input: UpdateEndpointInput;
};
export declare type MutationUpdateFeatureFlagArgs = {
    input: UpdateFeatureFlagInput;
};
export declare type MutationUpdateFeatureFlagBrandArgs = {
    input: UpdateFeatureFlagBrandInput;
};
export declare type MutationUpdateIdentityProviderArgs = {
    input: UpdateIdentityProviderInput;
};
export declare type CreateBrandAliasInput = {
    aliasdId: Scalars["ID"];
};
export declare type CreateBrandMetaInput = {
    brandId: Scalars["ID"];
    etld: Scalars["String"];
    tenantId: Scalars["ID"];
};
export declare type CreateConfigMapInput = {
    brandId: Scalars["ID"];
    items?: InputMaybe<Array<InputMaybe<ConfigMapConfigInput>>>;
    type: Scalars["String"];
};
export declare type ConfigMapConfigInput = {
    key: Scalars["String"];
    value: Scalars["String"];
};
export declare type CreateEndpointInput = {
    brandId: Scalars["ID"];
    endpointScope: EndpointScope;
    token?: InputMaybe<Scalars["String"]>;
    type: EndpointType;
    url: Scalars["String"];
};
export declare type CreateExternalProviderInput = {
    brandId: Scalars["ID"];
    providerConfigs?: InputMaybe<Array<InputMaybe<ExternalProviderConfigInput>>>;
    type: Scalars["String"];
};
export declare type ExternalProviderConfigInput = {
    key: Scalars["String"];
    value?: InputMaybe<Scalars["String"]>;
};
export declare type CreateFeatureFlagInput = {
    description?: InputMaybe<Scalars["String"]>;
    enable: Scalars["Boolean"];
    name: Scalars["String"];
};
export declare type CreateFeatureFlagBrandInput = {
    brandId: Scalars["ID"];
    description?: InputMaybe<Scalars["String"]>;
    enable: Scalars["Boolean"];
    name: Scalars["String"];
};
export declare type CreateIdentityProviderInput = {
    brandId: Scalars["ID"];
    clientId: Scalars["String"];
    clientSecret: Scalars["String"];
    endpoint: Scalars["String"];
    provider: Scalars["String"];
    region: Scalars["String"];
    userPoolId: Scalars["String"];
};
export declare type DeleteBrandAliasInput = {
    aliasId: Scalars["ID"];
};
export declare type DeleteBrandMetaInput = {
    brandId: Scalars["ID"];
};
export declare type DeleteConfigMapInput = {
    brandId: Scalars["ID"];
    type: Scalars["String"];
};
export declare type DeleteEndpointInput = {
    brandId: Scalars["ID"];
    url: Scalars["String"];
};
export declare type DeleteExternalProviderInput = {
    brandId: Scalars["ID"];
    type: Scalars["String"];
};
export declare type DeleteFeatureFlagInput = {
    name: Scalars["String"];
};
export declare type DeleteFeatureFlagBrandInput = {
    brandId: Scalars["ID"];
    name: Scalars["String"];
};
export declare type DeleteIdentityProviderInput = {
    region: Scalars["String"];
    userPoolId: Scalars["String"];
};
export declare type UpdateBrandMetaInput = {
    brandId: Scalars["ID"];
    etld?: InputMaybe<Scalars["String"]>;
    tenantId?: InputMaybe<Scalars["ID"]>;
};
export declare type UpdateEndpointInput = {
    brandId: Scalars["ID"];
    token?: InputMaybe<Scalars["String"]>;
    url: Scalars["String"];
};
export declare type UpdateFeatureFlagInput = {
    default?: InputMaybe<Scalars["Boolean"]>;
    enable?: InputMaybe<Scalars["Boolean"]>;
    name: Scalars["String"];
};
export declare type UpdateFeatureFlagBrandInput = {
    brandId: Scalars["ID"];
    name: Scalars["String"];
};
export declare type UpdateIdentityProviderInput = {
    clientId?: InputMaybe<Scalars["String"]>;
    clientSecret?: InputMaybe<Scalars["String"]>;
    endpoint?: InputMaybe<Scalars["String"]>;
    provider?: InputMaybe<Scalars["String"]>;
    region: Scalars["String"];
    userPoolId: Scalars["String"];
};
export declare type Subscription = {
    __typename?: "Subscription";
    onCreateBrandAlias?: Maybe<BrandAlias>;
    onCreateBrandMeta?: Maybe<BrandMeta>;
    onCreateConfigMap?: Maybe<ConfigMap>;
    onCreateEndpoint?: Maybe<Endpoint>;
    onCreateExternalProvider?: Maybe<ExternalProvider>;
    onCreateFeatureFlag?: Maybe<FeatureFlag>;
    onCreateFeatureFlagBrand?: Maybe<FeatureFlagBrand>;
    onCreateIdentityProvider?: Maybe<IdentityProvider>;
    onDeleteBrandAlias?: Maybe<BrandAlias>;
    onDeleteBrandMeta?: Maybe<BrandMeta>;
    onDeleteConfigMap?: Maybe<ConfigMap>;
    onDeleteEndpoint?: Maybe<Endpoint>;
    onDeleteExternalProvider?: Maybe<ExternalProvider>;
    onDeleteFeatureFlag?: Maybe<FeatureFlag>;
    onDeleteFeatureFlagBrand?: Maybe<FeatureFlagBrand>;
    onDeleteIdentityProvider?: Maybe<IdentityProvider>;
    onUpdateBrandMeta?: Maybe<BrandMeta>;
    onUpdateEndpoint?: Maybe<Endpoint>;
    onUpdateFeatureFlag?: Maybe<FeatureFlag>;
    onUpdateFeatureFlagBrand?: Maybe<FeatureFlagBrand>;
    onUpdateIdentityProvider?: Maybe<IdentityProvider>;
};
export declare type SubscriptionOnCreateBrandAliasArgs = {
    aliasId: Scalars["ID"];
};
export declare type SubscriptionOnCreateBrandMetaArgs = {
    brandId?: InputMaybe<Scalars["ID"]>;
    etld?: InputMaybe<Scalars["String"]>;
    tenantId?: InputMaybe<Scalars["ID"]>;
};
export declare type SubscriptionOnCreateConfigMapArgs = {
    brandId: Scalars["ID"];
    configMap?: InputMaybe<Array<InputMaybe<ConfigMapConfigInput>>>;
    type: Scalars["String"];
};
export declare type SubscriptionOnCreateEndpointArgs = {
    token?: InputMaybe<Scalars["String"]>;
    url?: InputMaybe<Scalars["String"]>;
};
export declare type SubscriptionOnCreateExternalProviderArgs = {
    brandId: Scalars["ID"];
    providerConfigs?: InputMaybe<Array<InputMaybe<ExternalProviderConfigInput>>>;
    type: Scalars["String"];
};
export declare type SubscriptionOnCreateFeatureFlagArgs = {
    default?: InputMaybe<Scalars["Boolean"]>;
    enable?: InputMaybe<Scalars["Boolean"]>;
    name?: InputMaybe<Scalars["String"]>;
};
export declare type SubscriptionOnCreateFeatureFlagBrandArgs = {
    brandId?: InputMaybe<Scalars["ID"]>;
    name?: InputMaybe<Scalars["String"]>;
};
export declare type SubscriptionOnCreateIdentityProviderArgs = {
    clientId?: InputMaybe<Scalars["String"]>;
    clientSecret?: InputMaybe<Scalars["String"]>;
    endpoint?: InputMaybe<Scalars["String"]>;
    provider?: InputMaybe<Scalars["String"]>;
    region?: InputMaybe<Scalars["String"]>;
};
export declare type SubscriptionOnDeleteBrandAliasArgs = {
    aliasId: Scalars["ID"];
};
export declare type SubscriptionOnDeleteBrandMetaArgs = {
    brandId?: InputMaybe<Scalars["ID"]>;
    etld?: InputMaybe<Scalars["String"]>;
    tenantId?: InputMaybe<Scalars["ID"]>;
};
export declare type SubscriptionOnDeleteConfigMapArgs = {
    brandId: Scalars["ID"];
    configMap?: InputMaybe<Array<InputMaybe<ConfigMapConfigInput>>>;
    type: Scalars["String"];
};
export declare type SubscriptionOnDeleteEndpointArgs = {
    token?: InputMaybe<Scalars["String"]>;
    url?: InputMaybe<Scalars["String"]>;
};
export declare type SubscriptionOnDeleteExternalProviderArgs = {
    brandId: Scalars["ID"];
    providerConfigs?: InputMaybe<Array<InputMaybe<ExternalProviderConfigInput>>>;
    type: Scalars["String"];
};
export declare type SubscriptionOnDeleteFeatureFlagArgs = {
    default?: InputMaybe<Scalars["Boolean"]>;
    enable?: InputMaybe<Scalars["Boolean"]>;
    name?: InputMaybe<Scalars["String"]>;
};
export declare type SubscriptionOnDeleteFeatureFlagBrandArgs = {
    brandId?: InputMaybe<Scalars["ID"]>;
    name?: InputMaybe<Scalars["String"]>;
};
export declare type SubscriptionOnDeleteIdentityProviderArgs = {
    clientId?: InputMaybe<Scalars["String"]>;
    clientSecret?: InputMaybe<Scalars["String"]>;
    endpoint?: InputMaybe<Scalars["String"]>;
    provider?: InputMaybe<Scalars["String"]>;
    region?: InputMaybe<Scalars["String"]>;
};
export declare type SubscriptionOnUpdateBrandMetaArgs = {
    brandId?: InputMaybe<Scalars["ID"]>;
    etld?: InputMaybe<Scalars["String"]>;
    tenantId?: InputMaybe<Scalars["ID"]>;
};
export declare type SubscriptionOnUpdateEndpointArgs = {
    token?: InputMaybe<Scalars["String"]>;
    url?: InputMaybe<Scalars["String"]>;
};
export declare type SubscriptionOnUpdateFeatureFlagArgs = {
    default?: InputMaybe<Scalars["Boolean"]>;
    enable?: InputMaybe<Scalars["Boolean"]>;
    name?: InputMaybe<Scalars["String"]>;
};
export declare type SubscriptionOnUpdateFeatureFlagBrandArgs = {
    brandId?: InputMaybe<Scalars["ID"]>;
    name?: InputMaybe<Scalars["String"]>;
};
export declare type SubscriptionOnUpdateIdentityProviderArgs = {
    clientId?: InputMaybe<Scalars["String"]>;
    clientSecret?: InputMaybe<Scalars["String"]>;
    endpoint?: InputMaybe<Scalars["String"]>;
    provider?: InputMaybe<Scalars["String"]>;
    region?: InputMaybe<Scalars["String"]>;
};
export declare type TableFloatFilterInput = {
    between?: InputMaybe<Array<InputMaybe<Scalars["Float"]>>>;
    contains?: InputMaybe<Scalars["Float"]>;
    eq?: InputMaybe<Scalars["Float"]>;
    ge?: InputMaybe<Scalars["Float"]>;
    gt?: InputMaybe<Scalars["Float"]>;
    le?: InputMaybe<Scalars["Float"]>;
    lt?: InputMaybe<Scalars["Float"]>;
    ne?: InputMaybe<Scalars["Float"]>;
    notContains?: InputMaybe<Scalars["Float"]>;
};
export declare type TableIntFilterInput = {
    between?: InputMaybe<Array<InputMaybe<Scalars["Int"]>>>;
    contains?: InputMaybe<Scalars["Int"]>;
    eq?: InputMaybe<Scalars["Int"]>;
    ge?: InputMaybe<Scalars["Int"]>;
    gt?: InputMaybe<Scalars["Int"]>;
    le?: InputMaybe<Scalars["Int"]>;
    lt?: InputMaybe<Scalars["Int"]>;
    ne?: InputMaybe<Scalars["Int"]>;
    notContains?: InputMaybe<Scalars["Int"]>;
};
export declare type CreateBrandMetaMutationVariables = Exact<{
    input: CreateBrandMetaInput;
}>;
export declare type CreateBrandMetaMutation = {
    __typename?: "Mutation";
    createBrandMeta?: {
        __typename?: "BrandMeta";
        brandId: string;
        etld: string;
        tenantId: string;
    } | null;
};
export declare type CreateEndpointMutationVariables = Exact<{
    input: CreateEndpointInput;
}>;
export declare type CreateEndpointMutation = {
    __typename?: "Mutation";
    createEndpoint?: {
        __typename?: "Endpoint";
        brandId: string;
        endpointScope: EndpointScope;
        token?: string | null;
        type: EndpointType;
        url: string;
    } | null;
};
export declare type CreateFeatureFlagMutationVariables = Exact<{
    input: CreateFeatureFlagInput;
}>;
export declare type CreateFeatureFlagMutation = {
    __typename?: "Mutation";
    createFeatureFlag?: {
        __typename?: "FeatureFlag";
        description?: string | null;
        enable: boolean;
        name: string;
    } | null;
};
export declare type CreateFeatureFlagBrandMutationVariables = Exact<{
    input: CreateFeatureFlagBrandInput;
}>;
export declare type CreateFeatureFlagBrandMutation = {
    __typename?: "Mutation";
    createFeatureFlagBrand?: {
        __typename?: "FeatureFlagBrand";
        brandId: string;
        enable: boolean;
        name: string;
        description?: string | null;
    } | null;
};
export declare type CreateIdentityProviderMutationVariables = Exact<{
    input: CreateIdentityProviderInput;
}>;
export declare type CreateIdentityProviderMutation = {
    __typename?: "Mutation";
    createIdentityProvider?: {
        __typename?: "IdentityProvider";
        brandId: string;
        clientId: string;
        clientSecret: string;
        endpoint: string;
        provider: string;
        region: string;
        userPoolId: string;
    } | null;
};
export declare type CreateExternalProviderMutationVariables = Exact<{
    input: CreateExternalProviderInput;
}>;
export declare type CreateExternalProviderMutation = {
    __typename?: "Mutation";
    createExternalProvider?: {
        __typename?: "ExternalProvider";
        brandId: string;
        type: string;
        providerConfigs?: Array<{
            __typename?: "ExternalProviderConfig";
            key: string;
            value?: string | null;
        } | null> | null;
    } | null;
};
export declare type CreateConfigMapMutationVariables = Exact<{
    input: CreateConfigMapInput;
}>;
export declare type CreateConfigMapMutation = {
    __typename?: "Mutation";
    createConfigMap?: {
        __typename?: "ConfigMap";
        brandId: string;
        type: string;
        items?: Array<{
            __typename?: "ConfigMapItem";
            key: string;
            value: string;
        } | null> | null;
    } | null;
};
export declare type CreateBrandAliasMutationVariables = Exact<{
    input: CreateBrandAliasInput;
}>;
export declare type CreateBrandAliasMutation = {
    __typename?: "Mutation";
    createBrandAlias?: {
        __typename?: "BrandAlias";
        aliasId: string;
        brandId?: string | null;
    } | null;
};
export declare type DeleteBrandMetaMutationVariables = Exact<{
    input: DeleteBrandMetaInput;
}>;
export declare type DeleteBrandMetaMutation = {
    __typename?: "Mutation";
    deleteBrandMeta?: {
        __typename?: "BrandMeta";
        brandId: string;
        etld: string;
        tenantId: string;
    } | null;
};
export declare type DeleteEndpointMutationVariables = Exact<{
    input: DeleteEndpointInput;
}>;
export declare type DeleteEndpointMutation = {
    __typename?: "Mutation";
    deleteEndpoint?: {
        __typename?: "Endpoint";
        brandId: string;
        endpointScope: EndpointScope;
        token?: string | null;
        type: EndpointType;
        url: string;
    } | null;
};
export declare type DeleteFeatureFlagMutationVariables = Exact<{
    input: DeleteFeatureFlagInput;
}>;
export declare type DeleteFeatureFlagMutation = {
    __typename?: "Mutation";
    deleteFeatureFlag?: {
        __typename?: "FeatureFlag";
        description?: string | null;
        enable: boolean;
        name: string;
    } | null;
};
export declare type DeleteFeatureFlagBrandMutationVariables = Exact<{
    input: DeleteFeatureFlagBrandInput;
}>;
export declare type DeleteFeatureFlagBrandMutation = {
    __typename?: "Mutation";
    deleteFeatureFlagBrand?: {
        __typename?: "FeatureFlagBrand";
        brandId: string;
        enable: boolean;
        name: string;
        description?: string | null;
    } | null;
};
export declare type DeleteIdentityProviderMutationVariables = Exact<{
    input: DeleteIdentityProviderInput;
}>;
export declare type DeleteIdentityProviderMutation = {
    __typename?: "Mutation";
    deleteIdentityProvider?: {
        __typename?: "IdentityProvider";
        brandId: string;
        clientId: string;
        clientSecret: string;
        endpoint: string;
        provider: string;
        region: string;
        userPoolId: string;
    } | null;
};
export declare type DeleteExternalProviderMutationVariables = Exact<{
    input: DeleteExternalProviderInput;
}>;
export declare type DeleteExternalProviderMutation = {
    __typename?: "Mutation";
    deleteExternalProvider?: {
        __typename?: "ExternalProvider";
        brandId: string;
        type: string;
        providerConfigs?: Array<{
            __typename?: "ExternalProviderConfig";
            key: string;
            value?: string | null;
        } | null> | null;
    } | null;
};
export declare type DeleteConfigMapMutationVariables = Exact<{
    input: DeleteConfigMapInput;
}>;
export declare type DeleteConfigMapMutation = {
    __typename?: "Mutation";
    deleteConfigMap?: {
        __typename?: "ConfigMap";
        brandId: string;
        type: string;
        items?: Array<{
            __typename?: "ConfigMapItem";
            key: string;
            value: string;
        } | null> | null;
    } | null;
};
export declare type DeleteBrandAliasMutationVariables = Exact<{
    input: DeleteBrandAliasInput;
}>;
export declare type DeleteBrandAliasMutation = {
    __typename?: "Mutation";
    deleteBrandAlias?: {
        __typename?: "BrandAlias";
        aliasId: string;
    } | null;
};
export declare type UpdateBrandMetaMutationVariables = Exact<{
    input: UpdateBrandMetaInput;
}>;
export declare type UpdateBrandMetaMutation = {
    __typename?: "Mutation";
    updateBrandMeta?: {
        __typename?: "BrandMeta";
        brandId: string;
        etld: string;
        tenantId: string;
    } | null;
};
export declare type UpdateEndpointMutationVariables = Exact<{
    input: UpdateEndpointInput;
}>;
export declare type UpdateEndpointMutation = {
    __typename?: "Mutation";
    updateEndpoint?: {
        __typename?: "Endpoint";
        brandId: string;
        endpointScope: EndpointScope;
        token?: string | null;
        type: EndpointType;
        url: string;
    } | null;
};
export declare type UpdateFeatureFlagMutationVariables = Exact<{
    input: UpdateFeatureFlagInput;
}>;
export declare type UpdateFeatureFlagMutation = {
    __typename?: "Mutation";
    updateFeatureFlag?: {
        __typename?: "FeatureFlag";
        description?: string | null;
        enable: boolean;
        name: string;
    } | null;
};
export declare type UpdateFeatureFlagBrandMutationVariables = Exact<{
    input: UpdateFeatureFlagBrandInput;
}>;
export declare type UpdateFeatureFlagBrandMutation = {
    __typename?: "Mutation";
    updateFeatureFlagBrand?: {
        __typename?: "FeatureFlagBrand";
        brandId: string;
        enable: boolean;
        name: string;
        description?: string | null;
    } | null;
};
export declare type UpdateIdentityProviderMutationVariables = Exact<{
    input: UpdateIdentityProviderInput;
}>;
export declare type UpdateIdentityProviderMutation = {
    __typename?: "Mutation";
    updateIdentityProvider?: {
        __typename?: "IdentityProvider";
        brandId: string;
        clientId: string;
        clientSecret: string;
        endpoint: string;
        provider: string;
        region: string;
        userPoolId: string;
    } | null;
};
export declare type FeatureFlagsQueryVariables = Exact<{
    brandId: Scalars["ID"];
    filter?: InputMaybe<Array<Scalars["String"]> | Scalars["String"]>;
}>;
export declare type FeatureFlagsQuery = {
    __typename?: "Query";
    featureFlags: Array<{
        __typename?: "FeatureFlagBrand";
        brandId: string;
        enable: boolean;
        name: string;
        description?: string | null;
    } | null>;
};
export declare type GetBrandMetaQueryVariables = Exact<{
    brandId: Scalars["ID"];
}>;
export declare type GetBrandMetaQuery = {
    __typename?: "Query";
    getBrandMeta?: {
        __typename?: "BrandMeta";
        brandId: string;
        etld: string;
        tenantId: string;
    } | null;
};
export declare type GetPrivateConfigQueryVariables = Exact<{
    brandId: Scalars["ID"];
}>;
export declare type GetPrivateConfigQuery = {
    __typename?: "Query";
    getPrivateConfig: {
        __typename?: "PrivateConfig";
        brand?: {
            __typename?: "BrandMeta";
            brandId: string;
            etld: string;
            tenantId: string;
        } | null;
        identityProvider?: {
            __typename?: "IdentityProvider";
            brandId: string;
            clientId: string;
            clientSecret: string;
            endpoint: string;
            provider: string;
            region: string;
            userPoolId: string;
        } | null;
        externalProviders?: Array<{
            __typename?: "ExternalProvider";
            brandId: string;
            type: string;
            providerConfigs?: Array<{
                __typename?: "ExternalProviderConfig";
                key: string;
                value?: string | null;
            } | null> | null;
        } | null> | null;
    };
};
export declare type GetPublicConfigQueryVariables = Exact<{
    brandId: Scalars["ID"];
}>;
export declare type GetPublicConfigQuery = {
    __typename?: "Query";
    getPublicConfig: {
        __typename?: "PublicConfig";
        brand?: {
            __typename?: "BrandMeta";
            brandId: string;
            etld: string;
            tenantId: string;
        } | null;
        featureFlags?: Array<{
            __typename?: "FeatureFlagBrand";
            brandId: string;
            enable: boolean;
            name: string;
            description?: string | null;
        } | null> | null;
        configMap?: Array<{
            __typename?: "ConfigMap";
            brandId: string;
            type: string;
            items?: Array<{
                __typename?: "ConfigMapItem";
                key: string;
                value: string;
            } | null> | null;
        } | null> | null;
    };
};
export declare type GetRoutingConfigQueryVariables = Exact<{
    etld: Scalars["String"];
}>;
export declare type GetRoutingConfigQuery = {
    __typename?: "Query";
    getRoutingConfig: {
        __typename?: "RoutingConfig";
        brand?: {
            __typename?: "BrandMeta";
            brandId: string;
            etld: string;
            tenantId: string;
        } | null;
        privateEndpoints?: Array<{
            __typename?: "Endpoint";
            brandId: string;
            endpointScope: EndpointScope;
            token?: string | null;
            type: EndpointType;
            url: string;
        } | null> | null;
        publicEndpoints?: Array<{
            __typename?: "Endpoint";
            brandId: string;
            endpointScope: EndpointScope;
            token?: string | null;
            type: EndpointType;
            url: string;
        } | null> | null;
    };
};
export declare type GetEndpointQueryVariables = Exact<{
    type: EndpointType;
    url: Scalars["String"];
}>;
export declare type GetEndpointQuery = {
    __typename?: "Query";
    getEndpoint?: {
        __typename?: "Endpoint";
        brandId: string;
        endpointScope: EndpointScope;
        token?: string | null;
        type: EndpointType;
        url: string;
    } | null;
};
export declare type GetFeatureFlagQueryVariables = Exact<{
    name: Scalars["String"];
}>;
export declare type GetFeatureFlagQuery = {
    __typename?: "Query";
    getFeatureFlag?: {
        __typename?: "FeatureFlag";
        description?: string | null;
        enable: boolean;
        name: string;
    } | null;
};
export declare type GetFeatureFlagBrandQueryVariables = Exact<{
    brandId: Scalars["ID"];
    name: Scalars["String"];
}>;
export declare type GetFeatureFlagBrandQuery = {
    __typename?: "Query";
    getFeatureFlagBrand?: {
        __typename?: "FeatureFlagBrand";
        brandId: string;
        enable: boolean;
        name: string;
        description?: string | null;
    } | null;
};
export declare type GetIdentityProviderQueryVariables = Exact<{
    region: Scalars["String"];
    userPoolId: Scalars["String"];
}>;
export declare type GetIdentityProviderQuery = {
    __typename?: "Query";
    getIdentityProvider?: {
        __typename?: "IdentityProvider";
        brandId: string;
        clientId: string;
        clientSecret: string;
        endpoint: string;
        provider: string;
        region: string;
        userPoolId: string;
    } | null;
};
export declare type GetExternalProviderQueryVariables = Exact<{
    brandId: Scalars["String"];
    type: Scalars["String"];
}>;
export declare type GetExternalProviderQuery = {
    __typename?: "Query";
    getExternalProvider?: {
        __typename?: "ExternalProvider";
        brandId: string;
        type: string;
        providerConfigs?: Array<{
            __typename?: "ExternalProviderConfig";
            key: string;
            value?: string | null;
        } | null> | null;
    } | null;
};
export declare type GetConfigMapQueryVariables = Exact<{
    brandId: Scalars["String"];
    type: Scalars["String"];
}>;
export declare type GetConfigMapQuery = {
    __typename?: "Query";
    getConfigMap?: {
        __typename?: "ConfigMap";
        brandId: string;
        type: string;
        items?: Array<{
            __typename?: "ConfigMapItem";
            key: string;
            value: string;
        } | null> | null;
    } | null;
};
export declare type GetBrandAliasQueryVariables = Exact<{
    aliasId: Scalars["ID"];
}>;
export declare type GetBrandAliasQuery = {
    __typename?: "Query";
    getBrandAlias?: {
        __typename?: "BrandAlias";
        aliasId: string;
        brandId?: string | null;
    } | null;
};
export declare type ListBrandMetasQueryVariables = Exact<{
    filter?: InputMaybe<TableBrandMetaFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>;
export declare type ListBrandMetasQuery = {
    __typename?: "Query";
    listBrandMetas?: {
        __typename?: "BrandMetaConnection";
        nextToken?: string | null;
        items?: Array<{
            __typename?: "BrandMeta";
            brandId: string;
            etld: string;
            tenantId: string;
        } | null> | null;
    } | null;
};
export declare type ListEndpointsQueryVariables = Exact<{
    filter?: InputMaybe<TableEndpointFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>;
export declare type ListEndpointsQuery = {
    __typename?: "Query";
    listEndpoints?: {
        __typename?: "EndpointConnection";
        nextToken?: string | null;
        items?: Array<{
            __typename?: "Endpoint";
            brandId: string;
            endpointScope: EndpointScope;
            token?: string | null;
            type: EndpointType;
            url: string;
        } | null> | null;
    } | null;
};
export declare type ListFeatureFlagBrandsQueryVariables = Exact<{
    filter?: InputMaybe<TableFeatureFlagBrandFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>;
export declare type ListFeatureFlagBrandsQuery = {
    __typename?: "Query";
    listFeatureFlagBrands?: {
        __typename?: "FeatureFlagBrandConnection";
        nextToken?: string | null;
        items?: Array<{
            __typename?: "FeatureFlagBrand";
            brandId: string;
            enable: boolean;
            name: string;
            description?: string | null;
        } | null> | null;
    } | null;
};
export declare type ListFeatureFlagsQueryVariables = Exact<{
    filter?: InputMaybe<TableFeatureFlagFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>;
export declare type ListFeatureFlagsQuery = {
    __typename?: "Query";
    listFeatureFlags?: {
        __typename?: "FeatureFlagConnection";
        nextToken?: string | null;
        items?: Array<{
            __typename?: "FeatureFlag";
            description?: string | null;
            enable: boolean;
            name: string;
        } | null> | null;
    } | null;
};
export declare type ListIdentityProvidersQueryVariables = Exact<{
    filter?: InputMaybe<TableIdentityProviderFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>;
export declare type ListIdentityProvidersQuery = {
    __typename?: "Query";
    listIdentityProviders?: {
        __typename?: "IdentityProviderConnection";
        nextToken?: string | null;
        items?: Array<{
            __typename?: "IdentityProvider";
            brandId: string;
            clientId: string;
            clientSecret: string;
            endpoint: string;
            provider: string;
            region: string;
            userPoolId: string;
        } | null> | null;
    } | null;
};
export declare type ListExternalProvidersQueryVariables = Exact<{
    filter?: InputMaybe<TableExternalProviderFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>;
export declare type ListExternalProvidersQuery = {
    __typename?: "Query";
    listExternalProviders?: {
        __typename?: "ExternalProviderConnection";
        nextToken?: string | null;
        items?: Array<{
            __typename?: "ExternalProvider";
            brandId: string;
            type: string;
            providerConfigs?: Array<{
                __typename?: "ExternalProviderConfig";
                key: string;
                value?: string | null;
            } | null> | null;
        } | null> | null;
    } | null;
};
export declare type ListConfigMapQueryVariables = Exact<{
    filter?: InputMaybe<TableConfigMapFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>;
export declare type ListConfigMapQuery = {
    __typename?: "Query";
    listConfigMap?: {
        __typename?: "ConfigMapConnection";
        nextToken?: string | null;
        items?: Array<{
            __typename?: "ConfigMap";
            brandId: string;
            type: string;
            items?: Array<{
                __typename?: "ConfigMapItem";
                key: string;
                value: string;
            } | null> | null;
        } | null> | null;
    } | null;
};
export declare type ListBrandAliasesQueryVariables = Exact<{
    filter?: InputMaybe<TableBrandAliasFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>;
export declare type ListBrandAliasesQuery = {
    __typename?: "Query";
    listBrandAliases?: {
        __typename?: "BrandAliasConnection";
        nextToken?: string | null;
        items?: Array<{
            __typename?: "BrandAlias";
            aliasId: string;
            brandId?: string | null;
        } | null> | null;
    } | null;
};
export declare type PrivateEndpointsQueryVariables = Exact<{
    brandId: Scalars["ID"];
    filter?: InputMaybe<Array<InputMaybe<EndpointType>> | InputMaybe<EndpointType>>;
}>;
export declare type PrivateEndpointsQuery = {
    __typename?: "Query";
    privateEndpoints: Array<{
        __typename?: "Endpoint";
        brandId: string;
        endpointScope: EndpointScope;
        token?: string | null;
        type: EndpointType;
        url: string;
    } | null>;
};
export declare type PublicEndpointsQueryVariables = Exact<{
    brandId: Scalars["ID"];
    filter?: InputMaybe<Array<InputMaybe<EndpointType>> | InputMaybe<EndpointType>>;
}>;
export declare type PublicEndpointsQuery = {
    __typename?: "Query";
    publicEndpoints: Array<{
        __typename?: "Endpoint";
        brandId: string;
        endpointScope: EndpointScope;
        token?: string | null;
        type: EndpointType;
        url: string;
    } | null>;
};
export declare const CreateBrandMetaDocument: DocumentNode<CreateBrandMetaMutation, Exact<{
    input: CreateBrandMetaInput;
}>>;
export declare const CreateEndpointDocument: DocumentNode<CreateEndpointMutation, Exact<{
    input: CreateEndpointInput;
}>>;
export declare const CreateFeatureFlagDocument: DocumentNode<CreateFeatureFlagMutation, Exact<{
    input: CreateFeatureFlagInput;
}>>;
export declare const CreateFeatureFlagBrandDocument: DocumentNode<CreateFeatureFlagBrandMutation, Exact<{
    input: CreateFeatureFlagBrandInput;
}>>;
export declare const CreateIdentityProviderDocument: DocumentNode<CreateIdentityProviderMutation, Exact<{
    input: CreateIdentityProviderInput;
}>>;
export declare const CreateExternalProviderDocument: DocumentNode<CreateExternalProviderMutation, Exact<{
    input: CreateExternalProviderInput;
}>>;
export declare const CreateConfigMapDocument: DocumentNode<CreateConfigMapMutation, Exact<{
    input: CreateConfigMapInput;
}>>;
export declare const CreateBrandAliasDocument: DocumentNode<CreateBrandAliasMutation, Exact<{
    input: CreateBrandAliasInput;
}>>;
export declare const DeleteBrandMetaDocument: DocumentNode<DeleteBrandMetaMutation, Exact<{
    input: DeleteBrandMetaInput;
}>>;
export declare const DeleteEndpointDocument: DocumentNode<DeleteEndpointMutation, Exact<{
    input: DeleteEndpointInput;
}>>;
export declare const DeleteFeatureFlagDocument: DocumentNode<DeleteFeatureFlagMutation, Exact<{
    input: DeleteFeatureFlagInput;
}>>;
export declare const DeleteFeatureFlagBrandDocument: DocumentNode<DeleteFeatureFlagBrandMutation, Exact<{
    input: DeleteFeatureFlagBrandInput;
}>>;
export declare const DeleteIdentityProviderDocument: DocumentNode<DeleteIdentityProviderMutation, Exact<{
    input: DeleteIdentityProviderInput;
}>>;
export declare const DeleteExternalProviderDocument: DocumentNode<DeleteExternalProviderMutation, Exact<{
    input: DeleteExternalProviderInput;
}>>;
export declare const DeleteConfigMapDocument: DocumentNode<DeleteConfigMapMutation, Exact<{
    input: DeleteConfigMapInput;
}>>;
export declare const DeleteBrandAliasDocument: DocumentNode<DeleteBrandAliasMutation, Exact<{
    input: DeleteBrandAliasInput;
}>>;
export declare const UpdateBrandMetaDocument: DocumentNode<UpdateBrandMetaMutation, Exact<{
    input: UpdateBrandMetaInput;
}>>;
export declare const UpdateEndpointDocument: DocumentNode<UpdateEndpointMutation, Exact<{
    input: UpdateEndpointInput;
}>>;
export declare const UpdateFeatureFlagDocument: DocumentNode<UpdateFeatureFlagMutation, Exact<{
    input: UpdateFeatureFlagInput;
}>>;
export declare const UpdateFeatureFlagBrandDocument: DocumentNode<UpdateFeatureFlagBrandMutation, Exact<{
    input: UpdateFeatureFlagBrandInput;
}>>;
export declare const UpdateIdentityProviderDocument: DocumentNode<UpdateIdentityProviderMutation, Exact<{
    input: UpdateIdentityProviderInput;
}>>;
export declare const FeatureFlagsDocument: DocumentNode<FeatureFlagsQuery, Exact<{
    brandId: Scalars["ID"];
    filter?: InputMaybe<Array<Scalars["String"]> | Scalars["String"]>;
}>>;
export declare const GetBrandMetaDocument: DocumentNode<GetBrandMetaQuery, Exact<{
    brandId: Scalars["ID"];
}>>;
export declare const GetPrivateConfigDocument: DocumentNode<GetPrivateConfigQuery, Exact<{
    brandId: Scalars["ID"];
}>>;
export declare const GetPublicConfigDocument: DocumentNode<GetPublicConfigQuery, Exact<{
    brandId: Scalars["ID"];
}>>;
export declare const GetRoutingConfigDocument: DocumentNode<GetRoutingConfigQuery, Exact<{
    etld: Scalars["String"];
}>>;
export declare const GetEndpointDocument: DocumentNode<GetEndpointQuery, Exact<{
    type: EndpointType;
    url: Scalars["String"];
}>>;
export declare const GetFeatureFlagDocument: DocumentNode<GetFeatureFlagQuery, Exact<{
    name: Scalars["String"];
}>>;
export declare const GetFeatureFlagBrandDocument: DocumentNode<GetFeatureFlagBrandQuery, Exact<{
    brandId: Scalars["ID"];
    name: Scalars["String"];
}>>;
export declare const GetIdentityProviderDocument: DocumentNode<GetIdentityProviderQuery, Exact<{
    region: Scalars["String"];
    userPoolId: Scalars["String"];
}>>;
export declare const GetExternalProviderDocument: DocumentNode<GetExternalProviderQuery, Exact<{
    brandId: Scalars["String"];
    type: Scalars["String"];
}>>;
export declare const GetConfigMapDocument: DocumentNode<GetConfigMapQuery, Exact<{
    brandId: Scalars["String"];
    type: Scalars["String"];
}>>;
export declare const GetBrandAliasDocument: DocumentNode<GetBrandAliasQuery, Exact<{
    aliasId: Scalars["ID"];
}>>;
export declare const ListBrandMetasDocument: DocumentNode<ListBrandMetasQuery, Exact<{
    filter?: InputMaybe<TableBrandMetaFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>>;
export declare const ListEndpointsDocument: DocumentNode<ListEndpointsQuery, Exact<{
    filter?: InputMaybe<TableEndpointFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>>;
export declare const ListFeatureFlagBrandsDocument: DocumentNode<ListFeatureFlagBrandsQuery, Exact<{
    filter?: InputMaybe<TableFeatureFlagBrandFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>>;
export declare const ListFeatureFlagsDocument: DocumentNode<ListFeatureFlagsQuery, Exact<{
    filter?: InputMaybe<TableFeatureFlagFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>>;
export declare const ListIdentityProvidersDocument: DocumentNode<ListIdentityProvidersQuery, Exact<{
    filter?: InputMaybe<TableIdentityProviderFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>>;
export declare const ListExternalProvidersDocument: DocumentNode<ListExternalProvidersQuery, Exact<{
    filter?: InputMaybe<TableExternalProviderFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>>;
export declare const ListConfigMapDocument: DocumentNode<ListConfigMapQuery, Exact<{
    filter?: InputMaybe<TableConfigMapFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>>;
export declare const ListBrandAliasesDocument: DocumentNode<ListBrandAliasesQuery, Exact<{
    filter?: InputMaybe<TableBrandAliasFilterInput>;
    limit?: InputMaybe<Scalars["Int"]>;
    nextToken?: InputMaybe<Scalars["String"]>;
}>>;
export declare const PrivateEndpointsDocument: DocumentNode<PrivateEndpointsQuery, Exact<{
    brandId: Scalars["ID"];
    filter?: InputMaybe<Array<InputMaybe<EndpointType>> | InputMaybe<EndpointType>>;
}>>;
export declare const PublicEndpointsDocument: DocumentNode<PublicEndpointsQuery, Exact<{
    brandId: Scalars["ID"];
    filter?: InputMaybe<Array<InputMaybe<EndpointType>> | InputMaybe<EndpointType>>;
}>>;
