import Schema from "./index";

describe("THE index module", () => {
  it("SHOULD export a draft 4 schema", () => {
    expect(Schema).toBeDefined();
    expect(Schema.constructor).toBe(Object);
    expect(Schema).toHaveProperty(
      "$schema",
      "http://json-schema.org/draft-04/schema#"
    );
  });
});
