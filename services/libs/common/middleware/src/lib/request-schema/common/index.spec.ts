import { z, ZodError } from "zod";
import {
  buildEventMetaSchema,
  buildEventSchema,
  detailSchema,
  eventDetailSchema,
  metadataSchema,
} from "./index";

describe("buildEventMetaSchema", () => {
  const testSchema = buildEventMetaSchema("test-detailtype");
  type TestSchemaType = z.infer<typeof testSchema>;

  test("test-detailtype is assignable ", () => {
    // this test case is just testing the type, not runtime code

    const concreteDetailType: TestSchemaType["detail-type"] = "test-detailtype";

    expect(concreteDetailType).toBeDefined(); // dummy assert
  });

  test("not-test-detailtype is not assignable", () => {
    // this test case is just testing the type, not runtime code

    // @ts-expect-error expect not-test-detailtype not to be assignable
    const concreteDetailType: TestSchemaType["detail-type"] =
      "not-test-detailtype";

    expect(concreteDetailType).toBeDefined(); // dummy assert
  });

  const goodInput = {
    version: "ver1",
    id: "id1",
    "detail-type": "test-detailtype",
    source: "source1",
    account: "account1",
    time: "1",
    region: "region1",
    extra: "ignored",
  };

  test("good input is parsed", () => {
    const parsed: TestSchemaType = testSchema.parse(goodInput);

    expect(parsed).toEqual({
      version: "ver1",
      id: "id1",
      "detail-type": "test-detailtype",
      source: "source1",
      account: "account1",
      time: "1",
      region: "region1",
    });
  });

  test.each([
    [{ ...goodInput, region: undefined }],
    [{ ...goodInput, account: undefined }],
    [{ ...goodInput, source: undefined }],
  ])("input omitting optional properties is parsed - i:%# - %p", (input) => {
    expect(testSchema.parse(input)).toBeDefined();
  });

  test.each([
    [{ ...goodInput, version: "" }],
    [{ ...goodInput, version: undefined }],
    [{ ...goodInput, id: "" }],
    [{ ...goodInput, id: undefined }],
    [{ ...goodInput, time: "" }],
    [{ ...goodInput, time: undefined }],
    [{ ...goodInput, "detail-type": "not-test-detailtype" }],
  ])(
    "input violating validation rules throws zod error - i:%# - %p",
    (input) => {
      expect(() => testSchema.parse(input)).toThrowError(ZodError);
    }
  );
});

describe("metadataSchema", () => {
  const goodInput = {
    "x-emc-ubid": "test-ubid",
    "x-amzn-RequestId": "test-amz-req-id",
    "x-lambda-RequestId": "test-lam-req-id",
    extra: "ignored",
  };

  test("good input is parsed", () => {
    const parsed: z.infer<typeof metadataSchema> =
      metadataSchema.parse(goodInput);

    expect(parsed).toEqual({
      "x-emc-ubid": "test-ubid",
      "x-amzn-RequestId": "test-amz-req-id",
      "x-lambda-RequestId": "test-lam-req-id",
    });
  });

  test.each([
    [{ ...goodInput, "x-amzn-RequestId": undefined }],
    [{ ...goodInput, "x-lambda-RequestId": undefined }],
  ])("input omitting optional properties is parsed - i:%# - %p", (input) => {
    expect(metadataSchema.parse(input)).toBeDefined();
  });

  test.each([
    [{ ...goodInput, "x-emc-ubid": "" }],
    [{ ...goodInput, "x-emc-ubid": undefined }],
  ])(
    "input violating validation rules throws zod error - i:%# - %p",
    (input) => {
      expect(() => metadataSchema.parse(input)).toThrowError(ZodError);
    }
  );
});

describe("detailSchema", () => {
  const goodInput = {
    referenced: true,
    correlationId: "26815318-33ba-4ed3-8636-34c577b9d47a",
    extra: "ignored",
  };

  test("good input is parsed", () => {
    const parsed: z.infer<typeof detailSchema> = detailSchema.parse(goodInput);

    expect(parsed).toEqual({
      referenced: true,
      correlationId: "26815318-33ba-4ed3-8636-34c577b9d47a",
    });
  });

  test.each([
    [{ ...goodInput, referenced: undefined }],
    [{ ...goodInput, correlationId: undefined }],
  ])("input omitting optional properties is parsed - i:%# - %p", (input) => {
    expect(detailSchema.parse(input)).toBeDefined();
  });

  test.each([[{ ...goodInput, correlationId: "not-a-uuid" }]])(
    "input violating validation rules throws zod error - i:%# - %p",
    (input) => {
      expect(() => detailSchema.parse(input)).toThrowError(ZodError);
    }
  );
});

describe("eventDetailSchema", () => {
  test("that it merges the types of detail + metadata + the payload schema", async () => {
    // this test case is just testing the type, not runtime code

    const testSchema = z.object({ testProp: z.string() });

    const detailSchema = eventDetailSchema(testSchema);

    type TestDetailSchemaType = z.infer<typeof detailSchema>;

    // check expected properties are assignable
    const testObj: TestDetailSchemaType = {
      correlationId: "",
      metadata: { "x-emc-ubid": "" },
      referenced: true,
      payload: { testProp: "" },
    };

    expect(testObj).toBeDefined(); // dummy assert
  });
});

describe("buildEventSchema", () => {
  test("that expected properties are assignable to the event schema type", async () => {
    // this test case is just testing the type, not runtime code

    const testSchema = z.object({ testProp: z.string() });

    const detailSchema = buildEventSchema("test-detailtype", testSchema);

    type TestDetailSchemaType = z.infer<typeof detailSchema>;

    // check expected properties are assignable
    const testObj: TestDetailSchemaType = {
      "detail-type": "test-detailtype",
      source: "",
      time: "",
      account: "",
      id: "",
      version: "",
      region: "",
      detail: {
        correlationId: "",
        metadata: { "x-emc-ubid": "" },
        referenced: true,
        payload: { testProp: "" },
      },
    };

    expect(testObj).toBeDefined(); // dummy assert
  });
});
