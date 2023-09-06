import { BrandConfigCachedClient } from "./brand-config";
import { getBrandConfigCachedClient } from "./singleton";

describe("BrandConfigCachedClient client singleton", () => {
  describe("BrandConfigCachedClient()", () => {
    it("should return instance of BrandConfigCachedClient class", () => {
      const instance = getBrandConfigCachedClient();
      expect(instance).toBeInstanceOf(BrandConfigCachedClient);
    });

    it("should return the same singleton instance with next invocation", () => {
      const firstInstance = getBrandConfigCachedClient();
      const nextInstance = getBrandConfigCachedClient();

      expect(firstInstance).toStrictEqual(nextInstance);
    });
  });
});
