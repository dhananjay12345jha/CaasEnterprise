import {
  CommerceServiceErrorDetails,
  CommerceServiceErrorTypes,
} from "../interfaces";

export class InternalCommerceServiceError
  extends Error
  implements CommerceServiceErrorDetails
{
  readonly errorType: string;
  readonly metadata?: { [key: string]: unknown };
  readonly message: string;

  constructor(
    errorType: CommerceServiceErrorTypes | string,
    message: string,
    metadata?: { [key: string]: unknown }
  ) {
    super();

    this.message = message;
    this.errorType = errorType;
    this.metadata = metadata ?? {};
  }
}
