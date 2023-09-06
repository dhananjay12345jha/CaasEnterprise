"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicEndpointsDocument = exports.PrivateEndpointsDocument = exports.ListBrandAliasesDocument = exports.ListConfigMapDocument = exports.ListExternalProvidersDocument = exports.ListIdentityProvidersDocument = exports.ListFeatureFlagsDocument = exports.ListFeatureFlagBrandsDocument = exports.ListEndpointsDocument = exports.ListBrandMetasDocument = exports.GetBrandAliasDocument = exports.GetConfigMapDocument = exports.GetExternalProviderDocument = exports.GetIdentityProviderDocument = exports.GetFeatureFlagBrandDocument = exports.GetFeatureFlagDocument = exports.GetEndpointDocument = exports.GetRoutingConfigDocument = exports.GetPublicConfigDocument = exports.GetPrivateConfigDocument = exports.GetBrandMetaDocument = exports.FeatureFlagsDocument = exports.UpdateIdentityProviderDocument = exports.UpdateFeatureFlagBrandDocument = exports.UpdateFeatureFlagDocument = exports.UpdateEndpointDocument = exports.UpdateBrandMetaDocument = exports.DeleteBrandAliasDocument = exports.DeleteConfigMapDocument = exports.DeleteExternalProviderDocument = exports.DeleteIdentityProviderDocument = exports.DeleteFeatureFlagBrandDocument = exports.DeleteFeatureFlagDocument = exports.DeleteEndpointDocument = exports.DeleteBrandMetaDocument = exports.CreateBrandAliasDocument = exports.CreateConfigMapDocument = exports.CreateExternalProviderDocument = exports.CreateIdentityProviderDocument = exports.CreateFeatureFlagBrandDocument = exports.CreateFeatureFlagDocument = exports.CreateEndpointDocument = exports.CreateBrandMetaDocument = exports.EndpointScope = exports.EndpointType = void 0;
var EndpointType;
(function (EndpointType) {
    EndpointType["Auth"] = "AUTH";
    EndpointType["Commerceapi"] = "COMMERCEAPI";
    EndpointType["Graph"] = "GRAPH";
    EndpointType["WebCheckout"] = "WEB_CHECKOUT";
    EndpointType["WebStorefront"] = "WEB_STOREFRONT";
})(EndpointType = exports.EndpointType || (exports.EndpointType = {}));
var EndpointScope;
(function (EndpointScope) {
    EndpointScope["Private"] = "PRIVATE";
    EndpointScope["Public"] = "PUBLIC";
})(EndpointScope = exports.EndpointScope || (exports.EndpointScope = {}));
exports.CreateBrandMetaDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "createBrandMeta" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "CreateBrandMetaInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "createBrandMeta" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "etld" } },
                                { kind: "Field", name: { kind: "Name", value: "tenantId" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.CreateEndpointDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "createEndpoint" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "CreateEndpointInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "createEndpoint" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endpointScope" },
                                },
                                { kind: "Field", name: { kind: "Name", value: "token" } },
                                { kind: "Field", name: { kind: "Name", value: "type" } },
                                { kind: "Field", name: { kind: "Name", value: "url" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.CreateFeatureFlagDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "createFeatureFlag" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "CreateFeatureFlagInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "createFeatureFlag" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "description" } },
                                { kind: "Field", name: { kind: "Name", value: "enable" } },
                                { kind: "Field", name: { kind: "Name", value: "name" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.CreateFeatureFlagBrandDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "createFeatureFlagBrand" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "CreateFeatureFlagBrandInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "createFeatureFlagBrand" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "enable" } },
                                { kind: "Field", name: { kind: "Name", value: "name" } },
                                { kind: "Field", name: { kind: "Name", value: "description" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.CreateIdentityProviderDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "createIdentityProvider" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "CreateIdentityProviderInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "createIdentityProvider" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "clientId" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "clientSecret" },
                                },
                                { kind: "Field", name: { kind: "Name", value: "endpoint" } },
                                { kind: "Field", name: { kind: "Name", value: "provider" } },
                                { kind: "Field", name: { kind: "Name", value: "region" } },
                                { kind: "Field", name: { kind: "Name", value: "userPoolId" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.CreateExternalProviderDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "createExternalProvider" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "CreateExternalProviderInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "createExternalProvider" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "type" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "providerConfigs" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            { kind: "Field", name: { kind: "Name", value: "key" } },
                                            { kind: "Field", name: { kind: "Name", value: "value" } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.CreateConfigMapDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "createConfigMap" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "CreateConfigMapInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "createConfigMap" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "type" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "items" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            { kind: "Field", name: { kind: "Name", value: "key" } },
                                            { kind: "Field", name: { kind: "Name", value: "value" } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.CreateBrandAliasDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "createBrandAlias" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "CreateBrandAliasInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "createBrandAlias" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "aliasId" } },
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.DeleteBrandMetaDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "deleteBrandMeta" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "DeleteBrandMetaInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "deleteBrandMeta" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "etld" } },
                                { kind: "Field", name: { kind: "Name", value: "tenantId" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.DeleteEndpointDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "deleteEndpoint" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "DeleteEndpointInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "deleteEndpoint" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endpointScope" },
                                },
                                { kind: "Field", name: { kind: "Name", value: "token" } },
                                { kind: "Field", name: { kind: "Name", value: "type" } },
                                { kind: "Field", name: { kind: "Name", value: "url" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.DeleteFeatureFlagDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "deleteFeatureFlag" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "DeleteFeatureFlagInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "deleteFeatureFlag" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "description" } },
                                { kind: "Field", name: { kind: "Name", value: "enable" } },
                                { kind: "Field", name: { kind: "Name", value: "name" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.DeleteFeatureFlagBrandDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "deleteFeatureFlagBrand" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "DeleteFeatureFlagBrandInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "deleteFeatureFlagBrand" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "enable" } },
                                { kind: "Field", name: { kind: "Name", value: "name" } },
                                { kind: "Field", name: { kind: "Name", value: "description" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.DeleteIdentityProviderDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "deleteIdentityProvider" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "DeleteIdentityProviderInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "deleteIdentityProvider" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "clientId" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "clientSecret" },
                                },
                                { kind: "Field", name: { kind: "Name", value: "endpoint" } },
                                { kind: "Field", name: { kind: "Name", value: "provider" } },
                                { kind: "Field", name: { kind: "Name", value: "region" } },
                                { kind: "Field", name: { kind: "Name", value: "userPoolId" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.DeleteExternalProviderDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "deleteExternalProvider" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "DeleteExternalProviderInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "deleteExternalProvider" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "type" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "providerConfigs" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            { kind: "Field", name: { kind: "Name", value: "key" } },
                                            { kind: "Field", name: { kind: "Name", value: "value" } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.DeleteConfigMapDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "deleteConfigMap" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "DeleteConfigMapInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "deleteConfigMap" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "type" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "items" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            { kind: "Field", name: { kind: "Name", value: "key" } },
                                            { kind: "Field", name: { kind: "Name", value: "value" } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.DeleteBrandAliasDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "deleteBrandAlias" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "DeleteBrandAliasInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "deleteBrandAlias" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "aliasId" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.UpdateBrandMetaDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "updateBrandMeta" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "UpdateBrandMetaInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "updateBrandMeta" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "etld" } },
                                { kind: "Field", name: { kind: "Name", value: "tenantId" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.UpdateEndpointDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "updateEndpoint" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "UpdateEndpointInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "updateEndpoint" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endpointScope" },
                                },
                                { kind: "Field", name: { kind: "Name", value: "token" } },
                                { kind: "Field", name: { kind: "Name", value: "type" } },
                                { kind: "Field", name: { kind: "Name", value: "url" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.UpdateFeatureFlagDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "updateFeatureFlag" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "UpdateFeatureFlagInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "updateFeatureFlag" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "description" } },
                                { kind: "Field", name: { kind: "Name", value: "enable" } },
                                { kind: "Field", name: { kind: "Name", value: "name" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.UpdateFeatureFlagBrandDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "updateFeatureFlagBrand" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "UpdateFeatureFlagBrandInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "updateFeatureFlagBrand" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "enable" } },
                                { kind: "Field", name: { kind: "Name", value: "name" } },
                                { kind: "Field", name: { kind: "Name", value: "description" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.UpdateIdentityProviderDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "updateIdentityProvider" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "UpdateIdentityProviderInput" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "updateIdentityProvider" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "input" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "input" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "clientId" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "clientSecret" },
                                },
                                { kind: "Field", name: { kind: "Name", value: "endpoint" } },
                                { kind: "Field", name: { kind: "Name", value: "provider" } },
                                { kind: "Field", name: { kind: "Name", value: "region" } },
                                { kind: "Field", name: { kind: "Name", value: "userPoolId" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.FeatureFlagsDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "featureFlags" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "brandId" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "filter" },
                    },
                    type: {
                        kind: "ListType",
                        type: {
                            kind: "NonNullType",
                            type: {
                                kind: "NamedType",
                                name: { kind: "Name", value: "String" },
                            },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "featureFlags" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "brandId" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "brandId" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "filter" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "filter" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "enable" } },
                                { kind: "Field", name: { kind: "Name", value: "name" } },
                                { kind: "Field", name: { kind: "Name", value: "description" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.GetBrandMetaDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "getBrandMeta" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "brandId" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "getBrandMeta" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "brandId" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "brandId" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "etld" } },
                                { kind: "Field", name: { kind: "Name", value: "tenantId" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.GetPrivateConfigDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "getPrivateConfig" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "brandId" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "getPrivateConfig" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "brandId" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "brandId" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "brand" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "etld" } },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "tenantId" },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "identityProvider" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "clientId" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "clientSecret" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "endpoint" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "provider" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "region" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "userPoolId" },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "externalProviders" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "type" } },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "providerConfigs" },
                                                selectionSet: {
                                                    kind: "SelectionSet",
                                                    selections: [
                                                        {
                                                            kind: "Field",
                                                            name: { kind: "Name", value: "key" },
                                                        },
                                                        {
                                                            kind: "Field",
                                                            name: { kind: "Name", value: "value" },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.GetPublicConfigDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "getPublicConfig" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "brandId" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "getPublicConfig" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "brandId" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "brandId" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "brand" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "etld" } },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "tenantId" },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "featureFlags" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "enable" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "name" } },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "description" },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "configMap" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "type" } },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "items" },
                                                selectionSet: {
                                                    kind: "SelectionSet",
                                                    selections: [
                                                        {
                                                            kind: "Field",
                                                            name: { kind: "Name", value: "key" },
                                                        },
                                                        {
                                                            kind: "Field",
                                                            name: { kind: "Name", value: "value" },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.GetRoutingConfigDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "getRoutingConfig" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: { kind: "Variable", name: { kind: "Name", value: "etld" } },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "String" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "getRoutingConfig" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "etld" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "etld" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "brand" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "etld" } },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "tenantId" },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "privateEndpoints" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "endpointScope" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "token" } },
                                            { kind: "Field", name: { kind: "Name", value: "type" } },
                                            { kind: "Field", name: { kind: "Name", value: "url" } },
                                        ],
                                    },
                                },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "publicEndpoints" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "endpointScope" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "token" } },
                                            { kind: "Field", name: { kind: "Name", value: "type" } },
                                            { kind: "Field", name: { kind: "Name", value: "url" } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.GetEndpointDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "getEndpoint" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: { kind: "Variable", name: { kind: "Name", value: "type" } },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "EndpointType" },
                        },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: { kind: "Variable", name: { kind: "Name", value: "url" } },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "String" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "getEndpoint" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "type" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "type" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "url" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "url" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endpointScope" },
                                },
                                { kind: "Field", name: { kind: "Name", value: "token" } },
                                { kind: "Field", name: { kind: "Name", value: "type" } },
                                { kind: "Field", name: { kind: "Name", value: "url" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.GetFeatureFlagDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "getFeatureFlag" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "String" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "getFeatureFlag" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "name" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "name" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "description" } },
                                { kind: "Field", name: { kind: "Name", value: "enable" } },
                                { kind: "Field", name: { kind: "Name", value: "name" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.GetFeatureFlagBrandDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "getFeatureFlagBrand" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "brandId" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "String" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "getFeatureFlagBrand" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "brandId" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "brandId" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "name" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "name" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "enable" } },
                                { kind: "Field", name: { kind: "Name", value: "name" } },
                                { kind: "Field", name: { kind: "Name", value: "description" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.GetIdentityProviderDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "getIdentityProvider" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "region" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "String" },
                        },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "userPoolId" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "String" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "getIdentityProvider" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "region" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "region" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "userPoolId" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "userPoolId" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "clientId" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "clientSecret" },
                                },
                                { kind: "Field", name: { kind: "Name", value: "endpoint" } },
                                { kind: "Field", name: { kind: "Name", value: "provider" } },
                                { kind: "Field", name: { kind: "Name", value: "region" } },
                                { kind: "Field", name: { kind: "Name", value: "userPoolId" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.GetExternalProviderDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "getExternalProvider" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "brandId" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "String" },
                        },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: { kind: "Variable", name: { kind: "Name", value: "type" } },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "String" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "getExternalProvider" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "brandId" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "brandId" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "type" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "type" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "type" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "providerConfigs" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            { kind: "Field", name: { kind: "Name", value: "key" } },
                                            { kind: "Field", name: { kind: "Name", value: "value" } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.GetConfigMapDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "getConfigMap" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "brandId" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "String" },
                        },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: { kind: "Variable", name: { kind: "Name", value: "type" } },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "String" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "getConfigMap" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "brandId" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "brandId" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "type" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "type" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                { kind: "Field", name: { kind: "Name", value: "type" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "items" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            { kind: "Field", name: { kind: "Name", value: "key" } },
                                            { kind: "Field", name: { kind: "Name", value: "value" } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.GetBrandAliasDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "getBrandAlias" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "aliasId" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "getBrandAlias" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "aliasId" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "aliasId" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "aliasId" } },
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.ListBrandMetasDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "listBrandMetas" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "filter" },
                    },
                    type: {
                        kind: "NamedType",
                        name: { kind: "Name", value: "TableBrandMetaFilterInput" },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "limit" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "nextToken" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "listBrandMetas" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "filter" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "filter" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "limit" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "limit" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "nextToken" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "nextToken" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "items" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "etld" } },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "tenantId" },
                                            },
                                        ],
                                    },
                                },
                                { kind: "Field", name: { kind: "Name", value: "nextToken" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.ListEndpointsDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "listEndpoints" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "filter" },
                    },
                    type: {
                        kind: "NamedType",
                        name: { kind: "Name", value: "TableEndpointFilterInput" },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "limit" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "nextToken" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "listEndpoints" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "filter" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "filter" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "limit" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "limit" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "nextToken" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "nextToken" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "items" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "endpointScope" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "token" } },
                                            { kind: "Field", name: { kind: "Name", value: "type" } },
                                            { kind: "Field", name: { kind: "Name", value: "url" } },
                                        ],
                                    },
                                },
                                { kind: "Field", name: { kind: "Name", value: "nextToken" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.ListFeatureFlagBrandsDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "listFeatureFlagBrands" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "filter" },
                    },
                    type: {
                        kind: "NamedType",
                        name: { kind: "Name", value: "TableFeatureFlagBrandFilterInput" },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "limit" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "nextToken" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "listFeatureFlagBrands" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "filter" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "filter" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "limit" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "limit" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "nextToken" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "nextToken" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "items" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "enable" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "name" } },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "description" },
                                            },
                                        ],
                                    },
                                },
                                { kind: "Field", name: { kind: "Name", value: "nextToken" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.ListFeatureFlagsDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "listFeatureFlags" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "filter" },
                    },
                    type: {
                        kind: "NamedType",
                        name: { kind: "Name", value: "TableFeatureFlagFilterInput" },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "limit" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "nextToken" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "listFeatureFlags" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "filter" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "filter" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "limit" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "limit" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "nextToken" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "nextToken" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "items" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "description" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "enable" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "name" } },
                                        ],
                                    },
                                },
                                { kind: "Field", name: { kind: "Name", value: "nextToken" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.ListIdentityProvidersDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "listIdentityProviders" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "filter" },
                    },
                    type: {
                        kind: "NamedType",
                        name: { kind: "Name", value: "TableIdentityProviderFilterInput" },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "limit" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "nextToken" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "listIdentityProviders" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "filter" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "filter" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "limit" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "limit" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "nextToken" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "nextToken" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "items" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "clientId" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "clientSecret" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "endpoint" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "provider" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "region" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "userPoolId" },
                                            },
                                        ],
                                    },
                                },
                                { kind: "Field", name: { kind: "Name", value: "nextToken" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.ListExternalProvidersDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "listExternalProviders" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "filter" },
                    },
                    type: {
                        kind: "NamedType",
                        name: { kind: "Name", value: "TableExternalProviderFilterInput" },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "limit" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "nextToken" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "listExternalProviders" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "filter" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "filter" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "limit" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "limit" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "nextToken" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "nextToken" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "items" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "type" } },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "providerConfigs" },
                                                selectionSet: {
                                                    kind: "SelectionSet",
                                                    selections: [
                                                        {
                                                            kind: "Field",
                                                            name: { kind: "Name", value: "key" },
                                                        },
                                                        {
                                                            kind: "Field",
                                                            name: { kind: "Name", value: "value" },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                { kind: "Field", name: { kind: "Name", value: "nextToken" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.ListConfigMapDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "listConfigMap" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "filter" },
                    },
                    type: {
                        kind: "NamedType",
                        name: { kind: "Name", value: "TableConfigMapFilterInput" },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "limit" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "nextToken" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "listConfigMap" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "filter" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "filter" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "limit" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "limit" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "nextToken" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "nextToken" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "items" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                            { kind: "Field", name: { kind: "Name", value: "type" } },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "items" },
                                                selectionSet: {
                                                    kind: "SelectionSet",
                                                    selections: [
                                                        {
                                                            kind: "Field",
                                                            name: { kind: "Name", value: "key" },
                                                        },
                                                        {
                                                            kind: "Field",
                                                            name: { kind: "Name", value: "value" },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                { kind: "Field", name: { kind: "Name", value: "nextToken" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.ListBrandAliasesDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "listBrandAliases" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "filter" },
                    },
                    type: {
                        kind: "NamedType",
                        name: { kind: "Name", value: "TableBrandAliasFilterInput" },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "limit" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "nextToken" },
                    },
                    type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "listBrandAliases" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "filter" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "filter" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "limit" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "limit" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "nextToken" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "nextToken" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "items" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "aliasId" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "brandId" },
                                            },
                                        ],
                                    },
                                },
                                { kind: "Field", name: { kind: "Name", value: "nextToken" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.PrivateEndpointsDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "privateEndpoints" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "brandId" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "filter" },
                    },
                    type: {
                        kind: "ListType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "EndpointType" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "privateEndpoints" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "brandId" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "brandId" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "filter" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "filter" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endpointScope" },
                                },
                                { kind: "Field", name: { kind: "Name", value: "token" } },
                                { kind: "Field", name: { kind: "Name", value: "type" } },
                                { kind: "Field", name: { kind: "Name", value: "url" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
exports.PublicEndpointsDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "query",
            name: { kind: "Name", value: "publicEndpoints" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "brandId" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "filter" },
                    },
                    type: {
                        kind: "ListType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "EndpointType" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "publicEndpoints" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "brandId" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "brandId" },
                                },
                            },
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "filter" },
                                value: {
                                    kind: "Variable",
                                    name: { kind: "Name", value: "filter" },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                { kind: "Field", name: { kind: "Name", value: "brandId" } },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endpointScope" },
                                },
                                { kind: "Field", name: { kind: "Name", value: "token" } },
                                { kind: "Field", name: { kind: "Name", value: "type" } },
                                { kind: "Field", name: { kind: "Name", value: "url" } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
//# sourceMappingURL=typed-document-nodes.js.map