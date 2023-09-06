import {
  formatCurrency,
  calculateBasketTotal,
  getSymbolFromCurrency,
  toFnv1a,
  toFriendlyCountryName,
} from "./utils";

describe("utils", () => {
  describe("formatCurrency()", () => {
    it("should format given money input using default formatFractionDigits parameter value", () => {
      const centAmount = 1234;
      const fractionDigits = 2;

      const response = formatCurrency(centAmount, fractionDigits);

      expect(response).toBe("12.34");
    });

    it("should format given money input with overridding default formatFractionDigits input", () => {
      const centAmount = 1234;
      const fractionDigits = 2;

      const response = formatCurrency(centAmount, fractionDigits, 3);

      expect(response).toBe("12.340");
    });
  });

  describe("calculateBasketTotal()", () => {
    it("should calculate the sum total of values passed in", () => {
      const lineItems = [
        { totalPrice: { centAmount: 1000 } },
        { totalPrice: { centAmount: 2000 } },
        { totalPrice: { centAmount: 3549 } },
      ];
      const fractionDigits = 2;

      const response = calculateBasketTotal(lineItems, fractionDigits);
      expect(response).toBe("65.49");
    });
  });

  describe("toFnv1a()", () => {
    it("should genereate fnv1a hash of given input", () => {
      const response = toFnv1a("secret-code", 128);
      expect(response).toBe("552s5znysirak5txu3098ca9t");
    });
  });

  describe("toFriendlyCountryName()", () => {
    it("should convert country code to country name", () => {
      const response = toFriendlyCountryName("GB");
      expect(response).toBe("United Kingdom");
    });
  });

  describe("getSymbolFromCurrency()", () => {
    it("should convert currency code to symbol", () => {
      const response = getSymbolFromCurrency("GBP");
      expect(response).toBe("£");
    });
  });
});
