export class CTPaymentResponse {
  id: string;
  version: number;
  versionModifiedAt: string;
  lastMessageSequenceNumber: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: LastModifiedBy;
  createdBy: CreatedBy;
  amountPlanned: AmountPlanned;
  paymentMethodInfo: PaymentMethodInfo;
  paymentStatus: PaymentStatus;
  transactions: Transaction[];
  classInteractions: any[];
}

export class LastModifiedBy {
  clientId: string;
  isPlatformClient: boolean;
}

export class CreatedBy {
  clientId: string;
  isPlatformClient: boolean;
}

export class AmountPlanned {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class PaymentMethodInfo {
  paymentInterface: string;
}

export class PaymentStatus {}

export class Transaction {
  id: string;
  timestamp: string;
  type: string;
  amount: Amount;
  interactionId: string;
  state: string;
}

export class Amount {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}
