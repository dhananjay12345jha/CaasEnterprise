import { CartResponse } from "../response/CartResponse";

export class CTPaymentRequest {
  amountPlanned: AmountPlanned;
  paymentMethodInfo: PaymentMethodInfo;
  transactions: Transaction[];

  constructor(cart: CartResponse) {
    let amount = new Amount();
    amount.centAmount = cart.totalPrice.centAmount;
    let amountPlanned = new AmountPlanned();
    amountPlanned.centAmount = cart.totalPrice.centAmount;
    let transaction = new Transaction();
    transaction.amount = amount;
    let transactions = new Array<Transaction>();
    transactions.push(transaction);
    this.amountPlanned = amountPlanned;
    this.transactions = transactions;
  }
}

export class AmountPlanned {
  type = "centPrecision";
  currencyCode = "GBP";
  centAmount: number;
  fractionDigits = 2;
}

export class PaymentMethodInfo {
  paymentInterface = "Adyen";
}

export class Transaction {
  amount: Amount;
  timestamp: string;
  type: string;
  interactionId: string;
  state: string;

  constructor() {
    this.timestamp = new Date().toISOString();
    this.type = "Authorization";
    this.interactionId = `CS3AUTO${Math.random()
      .toString(36)
      .slice(2)
      .toUpperCase()}`; //ToDo:parameterize
    this.state = "Initial";
  }
}

export class Amount {
  type = "centPrecision";
  currencyCode = "GBP";
  centAmount: number;
  fractionDigits = 2;
}
