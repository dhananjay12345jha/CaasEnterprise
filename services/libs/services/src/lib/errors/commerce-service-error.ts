import {
  CommerceServiceErrorDetails,
  CommerceServiceErrorInterface,
} from "../interfaces";

export class CommerceServiceError
  extends Error
  implements CommerceServiceErrorInterface
{
  readonly requestParameters;
  readonly requestHeaders;
  readonly details: CommerceServiceErrorDetails[];

  constructor(
    requestParameters: object,
    requestHeaders: object,
    details: Array<CommerceServiceErrorDetails>
  ) {
    super();
    this.requestParameters = requestParameters;
    this.requestHeaders = requestHeaders;
    this.details = details;
  }
}
