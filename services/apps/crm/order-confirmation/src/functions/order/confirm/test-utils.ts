import {
  Address,
  LineItem,
  TypedMoney,
} from "@everymile-schemas/order-created";
import { faker } from "@faker-js/faker";

export function generateFakeMoney(currencyCode?: string): TypedMoney {
  return {
    currencyCode: currencyCode ?? faker.finance.currencyCode(),
    centAmount: faker.datatype.number(100),
    fractionDigits: faker.datatype.number(3),
    type: "centPrecision",
  };
}

export function generateFakeAddress(country?: string): Address {
  return {
    id: faker.datatype.string(),
    title: faker.name.prefix(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    company: faker.company.name(),
    streetNumber: faker.address.streetAddress(),
    streetName: faker.address.street(),
    additionalStreetInfo: faker.address.secondaryAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    postalCode: faker.address.zipCode(),
    country: country ?? "GB",
    county: faker.address.county(),
  };
}

export function generateFakeLineItem(
  locale: string,
  currencyCode?: string
): LineItem {
  return {
    id: "line-id-1",
    taxRate: { amount: 0.1 },
    quantity: faker.datatype.number(10),
    name: {
      [locale]: faker.commerce.productName(),
    },
    price: {
      value: generateFakeMoney(currencyCode),
    },
    totalPrice: generateFakeMoney(currencyCode),
    variant: {
      images: [
        {
          url: faker.internet.url(),
          label: "main",
        },
        {
          url: faker.internet.url(),
          label: "thumbnail",
        },
      ],
      sku: faker.commerce.product(),
      attributes: [
        {
          name: faker.commerce.productAdjective(),
          value: {
            [locale]: faker.commerce.productDescription(),
          },
        },
      ],
    },
  };
}
