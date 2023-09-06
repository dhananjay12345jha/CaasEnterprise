import { join, resolve } from "path";
import * as findWorkspaceRoot from "find-yarn-workspace-root";

const contractsDir =
  process.env.CONTRACTS_DIR || join(findWorkspaceRoot(), "contracts");

export function getSchemaPath(
  schema: string,
  privateSchema = true,
  fileName = "schema.graphql"
): string {
  return resolve(
    join(
      contractsDir,
      `${privateSchema ? "private" : "public"}/schemas`,
      schema,
      fileName
    )
  );
}

export function getVendoredSchemaPath(
  schema: string,
  version = "",
  fileName = "schema.graphql"
): string {
  return resolve(join(contractsDir, `vendored`, schema, version, fileName));
}
