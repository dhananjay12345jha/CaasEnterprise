export class OMSNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, OMSNotFoundError.prototype);
    this.name = "OMSNotFoundError";
  }
}

export class OMSTransientError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, OMSTransientError.prototype);
    this.name = "OMSTransientError";
  }
}

export class OMSPermanentError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, OMSPermanentError.prototype);
    this.name = "OMSPermanentError";
  }
}
