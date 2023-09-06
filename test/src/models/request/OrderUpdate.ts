export class OrderUpdate {
  time: string;
  brand: string;
  orderId: string;
  status: Status;
  delivery: Delivery;
}

export class Status {
  // getPrevious(): string {
  //     return this.previous;
  // }
  //
  // setPrevious(value: string) {
  //     this.previous = value;
  // }
  //
  // getCurrent(): string {
  //     return this.current;
  // }
  //
  // setCurrent(value: string) {
  //     this.current = value;
  // }

  current: string;
  previous: string;
}

export class Delivery {
  // getTrackingUrl(): string {
  //     return this.trackingUrl;
  // }
  //
  // setTrackingUrl(value: string) {
  //     this.trackingUrl = value;
  // }

  trackingUrl: string;
  courier: Courier;
  expectedDeliveryWindow: ExpectedDeliveryWindow;
  lineItems: LineItem[];
}

export class Courier {
  // getCompanyName(): string {
  //     return this.companyName;
  // }
  //
  // setCompanyName(value: string) {
  //     this.companyName = value;
  // }

  companyName: string;
}

export class ExpectedDeliveryWindow {
  // getType(): string {
  //     return this.type;
  // }
  //
  // setType(value: string) {
  //     this.type = value;
  // }
  //
  // getValue(): number {
  //     return this.value;
  // }
  //
  // setValue(value: number) {
  //     this.value = value;
  // }

  value: number;
  type: string;
}

export class LineItem {
  // getDispatchedQuantity(): number {
  //     return this.dispatchedQuantity;
  // }
  //
  // setDispatchedQuantity(value: number) {
  //     this.dispatchedQuantity = value;
  // }
  //
  // getQuantity(): number {
  //     return this.quantity;
  // }
  //
  // setQuantity(value: number) {
  //     this.quantity = value;
  // }
  //
  // getStatus(): string {
  //     return this.status;
  // }
  //
  // setStatus(value: string) {
  //     this.status = value;
  // }
  //
  // getSku(): string {
  //     return this.sku;
  // }
  //
  // setSku(value: string) {
  //     this.sku = value;
  // }

  sku: string;
  status: string;
  quantity: number;
  dispatchedQuantity: number;
}
