import * as fnv from "fnv-plus";

import { getAllInfoByISO, getAllISOCodes } from "iso-country-currency";

export function formatCurrency(
  centAmount: number,
  fractionDigits: number,
  formatFractionDigits = 2
): string {
  return (centAmount / Math.pow(10, fractionDigits)).toFixed(
    formatFractionDigits
  );
}

export function calculateBasketTotal(
  lineItems: any[],
  fractionDigits: number,
  formatFractionDigits = 2
): string {
  const sumTotalCentAmount = lineItems
    .map((lineItem) => lineItem.totalPrice.centAmount)
    .reduce((a: number, b: number) => a + b);

  return formatCurrency(
    sumTotalCentAmount,
    fractionDigits,
    formatFractionDigits
  );
}

export function toFnv1a(
  value: string,
  bitLength: 32 | 64 | 128 | 256 | 512 | 1024
) {
  return fnv.hash(value, bitLength).str();
}

export function toFriendlyCountryName(countryCode: string) {
  console.log("countryCode:" + countryCode);
  return getAllInfoByISO(countryCode).countryName;
}

export function getSymbolFromCurrency(currencyCode: string) {
  return getAllISOCodes().find(({ currency }) => currency === currencyCode)
    .symbol;
}
