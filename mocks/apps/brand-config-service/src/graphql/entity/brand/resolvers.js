const { brandMetaData, externalProviders, brandAliasMap } = require("./data");
const { getEtld } = require("../utils");

module.exports = {
  Query: {
    brandMeta: (o, a, c, i) => {
      return brandMetaData[getEtld(a.hostname)];
    },
    getPrivateConfig: (o, a, c, i) => {
      const { brandId } = a;
      const foundExternalProviderEntry = Object.values(externalProviders).find(
        (entry) => entry.brandId === brandId
      );

      return {
        externalProviders: foundExternalProviderEntry?.externalProviders || [],
      };
    },
    getPublicConfig: (o, a, c, i) => {
      const { brandId } = a;
      const foundBrandMeta = brandMetaData.find(
        (entry) => entry.brandId === brandId
      );

      return {
        brand: foundBrandMeta,
      };
    },
    getBrandAlias: (o, a, c, i) => {
      const { aliasId } = a;
      return {
        brandId: brandAliasMap[aliasId],
        aliasId,
      };
    },
  },
};
