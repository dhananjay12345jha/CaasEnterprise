const path = require("path");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const { loadFilesSync } = require("@graphql-tools/load-files");

const typesArray = loadFilesSync(path.join(__dirname, "./**/*.graphql"));
const resolversArray = loadFilesSync(path.join(__dirname, "./**/resolvers.js"));

export const typeDefs = mergeTypeDefs(typesArray);
export const resolvers = mergeResolvers(resolversArray);
