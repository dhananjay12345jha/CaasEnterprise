import { CartResponse } from "../response/CartResponse";
import {
  generateCartHash,
  generateCartHMACSig,
} from "../../support/utils/helpers";
import { v4 as uuidv4 } from "uuid";

export class PaymentWebhook {
  live = "false";
  notificationItems: NotificationItem[];

  constructor(cart: CartResponse, brandId: string, interactionId: string) {
    let additionalData = new AdditionalData();
    let notificationItem = new NotificationItem();
    let notificationRequestItem = new NotificationRequestItem();
    let notificationItems = new Array<NotificationItem>();
    let amount = new Amount();
    additionalData["metadata.cartId"] = cart.id;
    additionalData["metadata.brandId"] = `${brandId}`;
    additionalData["metadata.cartDigest"] = generateCartHash(cart);

    // additionalData["hmacSignature"] = generateCartHMACSig(cart,notificationRequestItem.merchantReference);

    additionalData.checkoutSessionId = interactionId;

    amount.value = cart.totalPrice.centAmount;
    notificationRequestItem.amount = amount;
    notificationRequestItem.additionalData = additionalData;
    notificationItem.NotificationRequestItem = notificationRequestItem;
    notificationItems.push(notificationItem);
    this.notificationItems = notificationItems;
  }
}

export class NotificationItem {
  NotificationRequestItem: NotificationRequestItem;
}

export class NotificationRequestItem {
  additionalData: AdditionalData;
  amount: Amount;
  eventCode = "AUTHORISATION";
  operations = ["CANCEL", "CAPTURE", "REFUND"];
  paymentMethod = "visa";
  reason = "063267:0002:03/2030";
  success = "true";

  eventDate = new Date().toISOString();
  pspReference = `ZPAUTO${Math.random().toString(36).slice(2).toUpperCase()}`;
  merchantAccountCode = "TEST_TEST";
  merchantReference = uuidv4();
}

export class AdditionalData {
  "riskdata.cvcFieldLog" = "fo@102,KN@108,KN@110,KN@111";
  cardSummary = "0002";
  "riskdata.clientData" =
    "eyJ2ZXJzaW9uIjoiMS4wLjAiLCJkZXZpY2VGaW5nZXJwcmludCI6IkRwcXdVNHpFZE4wMDUwMDAwMDAwMDAwMDAwQlRXRGZZWlZSMzAwMzkzNzI4NzA1V3BZV2lLekJHQ0RmY3hDeTNGVEJpeDdSWDNhejgwMDJyS2tFSzFIYThQMDAwMDBZVnhFcjAwMDAwaEVmaTIzR1paWGlaQ3FuSTRsc2s6NDAiLCJwZXJzaXN0ZW50Q29va2llIjpbXSwiY29tcG9uZW50cyI6eyJ1c2VyQWdlbnQiOiIxMmE1NTRkNTU4NGUxOTlmMGY3ZTUwZDhhY2I1MTg4MCIsIndlYmRyaXZlciI6MCwibGFuZ3VhZ2UiOiJlbi1HQiIsImNvbG9yRGVwdGgiOjMwLCJwaXhlbFJhdGlvIjoyLCJoYXJkd2FyZUNvbmN1cnJlbmN5Ijo4LCJzY3JlZW5XaWR0aCI6OTAwLCJzY3JlZW5IZWlnaHQiOjE0NDAsImF2YWlsYWJsZVNjcmVlbldpZHRoIjo4MTEsImF2YWlsYWJsZVNjcmVlbkhlaWdodCI6MTQ0MCwidGltZXpvbmVPZmZzZXQiOi02MCwidGltZXpvbmUiOiJFdXJvcGUvTG9uZG9uIiwiaW5kZXhlZERiIjoxLCJhZGRCZWhhdmlvciI6MCwib3BlbkRhdGFiYXNlIjoxLCJwbGF0Zm9ybSI6Ik1hY0ludGVsIiwicGx1Z2lucyI6IjI5Y2Y3MWUzZDgxZDc0ZDQzYTViMGViNzk0MDViYTg3IiwiY2FudmFzIjoiZDQ1MTEzZTAyNjBmN2RkZGJlNTUxNjY3NDMzOWRmYTMiLCJ3ZWJnbCI6IjJiY2ViYmY1OWM2YmQ1MjlkZTdmNmUxZWMzNDdlZTI0Iiwid2ViZ2xWZW5kb3JBbmRSZW5kZXJlciI6Ikdvb2dsZSBJbmMuIChBcHBsZSl+QU5HTEUgKEFwcGxlLCBBcHBsZSBNMSwgT3BlbkdMIDQuMSBNZXRhbCAtIDcxLjcuMS";
  shopperCountry = "GB";
  shopperIP = "152.37.73.23";
  eci = "N/A";
  threeDSVersion = "1.0.2";
  expiryDate = "03/2030";
  "riskdata.numberFieldKeyCount" = "2";
  xid = "N/A";
  cavvAlgorithm = "N/A";
  cardBin = "419935";
  threeDAuthenticated = "false";
  shopperInteraction = "Ecommerce";
  "riskdata.numberFieldClickCount" = "1";
  acquirerReference = "04555841886";
  "riskdata.referrer" =
    "https=//checkoutshopper-test.adyen.com/checkoutshopper/securedfields/test_RQ43RRYPGJGEPKP4RSRVORLYEEXBKEXI/3.9.0/securedFields.html?type=card&d=aHR0cDovL2NoZWNrb3V0LndwcGNhYXMubG9jYWw6MzAwMA==";
  liabilityShift = "false";
  authCode = "063267";
  cardHolderName = "ertert";
  threeDOffered = "true";
  checkoutSessionId: string;
  threeDOfferedResponse = "N";
  "riskdata.numberFieldFocusCount" = "1";
  issuerCountry = "FR";
  cavv = "N/A";
  "riskdata.initializeCount" = "1";
  threeDAuthenticatedResponse = "N/A";
  "riskdata.numberFieldLog" = "fo@15,cl@16,KU@77,KL@79";
  "metadata.cartId": string;
  "metadata.brandId": string;
  "metadata.cartDigest": string;
}

export class Amount {
  currency = "GBP";
  value;
  number;
}
