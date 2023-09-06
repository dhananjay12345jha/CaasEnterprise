export class CTTransactionRequest {
  version: number;
  actions: Action[];
}

export class Action {
  action: string;
  transaction: Transaction;
}

export class Transaction {
  type = "Authorization";
  amount: Amount;
  interactionId = "CS32D5339270E04EDF";
}

export class Amount {
  currencyCode = "GBP";
  centAmount: number;
}
