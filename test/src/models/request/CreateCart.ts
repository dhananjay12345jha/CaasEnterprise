export class CreateCart {
  get getCurrency(): string {
    return this.currency;
  }

  set setCurrency(value: string) {
    this.currency = value;
  }

  get getLineItems(): LineItem[] {
    return this.lineItems;
  }

  set setLineItems(value: LineItem[]) {
    this.lineItems = value;
  }

  private currency!: string;
  private lineItems!: LineItem[];
}

export class LineItem {
  get getQuantity(): number {
    return this.quantity;
  }

  set setQuantity(value: number) {
    this.quantity = value;
  }

  get getSku(): string {
    return this.sku;
  }

  set setSku(value: string) {
    this.sku = value;
  }

  private sku!: string;
  private quantity!: number;
}
