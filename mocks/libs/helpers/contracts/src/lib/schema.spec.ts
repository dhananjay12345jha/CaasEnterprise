import { getSchemaPath, getVendoredSchemaPath } from "./schema";
import { join, resolve } from "path";
import * as findWorkspaceRoot from "find-yarn-workspace-root";

const contractsDir = join(findWorkspaceRoot(), "contracts");
describe("getSchemaPath", () => {
  const expected = resolve(
    join(contractsDir, "private", "schemas", "test", "schema.graphql")
  );
  it("should work", () => {
    expect(getSchemaPath("test")).toEqual(expected);
  });
});

describe("getVendoredSchemaPath", () => {
  const expected = resolve(
    join(contractsDir, "vendored", "test", "schema.graphql")
  );
  it("should work", () => {
    expect(getVendoredSchemaPath("test")).toEqual(expected);
  });
});
