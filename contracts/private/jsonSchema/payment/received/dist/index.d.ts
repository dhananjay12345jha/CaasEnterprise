/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Index {
  version: string;
  id: string;
  "detail-type": "payment.order.auth.accepted";
  referenced?: boolean;
  source?: string;
  account?: string;
  time: string;
  region?: string;
  correlationId?: string;
  detail: {
    payload: {
      /**
       * Informs about the origin of the notification. The value is true when originating from the live environment, false for the test environment.
       */
      live: string;
      notificationItems: {
        NotificationRequestItem?: {
          additionalData: {
            PaymentAccountReference?: string;
            acquirerCode?: string;
            acquirerReference?: string;
            "acsRenderingType.acsInterface"?: string;
            "acsRenderingType.acsUiTemplate"?: string;
            alias?: string;
            aliasType?: string;
            arn?: string;
            authCode?: string;
            authenticationType?: string;
            authorisationMid?: string;
            authorisedAmountCurrency?: string;
            authorisedAmountValue?: string;
            avsResult?: string;
            avsResultRaw?: string;
            bankAccountNumber?: string;
            bankLocation?: string;
            bankLocationId?: string;
            bankName?: string;
            bankVerificationResult?: string;
            bankVerificationResultRaw?: string;
            bic?: string;
            "billingAddress.city"?: string;
            "billingAddress.houseNumberOrName"?: string;
            "billingAddress.postalCode"?: string;
            "billingAddress.stateOrProvince"?: string;
            "billingAddress.street"?: string;
            browserCode?: string;
            captureDelayHours?: string;
            captureMerchantRference?: string;
            capturePspReference?: string;
            cardBin?: string;
            cardIssuingBank?: string;
            cardIssuingCurrency?: string;
            cardIssuingCountry?: string;
            cardPaymentMethod?: string;
            cardSchemeEnhancedDataLevel?: string;
            cardSummary?: string;
            cavv?: string;
            cavvAlgorithm?: string;
            challengeCancel?: string;
            /**
             * Identifier of the payment session.
             */
            checkoutSessionId: string;
            cvcResult?: string;
            cvcResultRaw?: string;
            "deliveryAddress.city"?: string;
            "deliveryAddress.country"?: string;
            "deliveryAddress.houseNumberOrName"?: string;
            "deliveryAddress.postalCode"?: string;
            "deliveryAddress.stateOrProvince"?: string;
            "deliveryAddress.street"?: string;
            deviceType?: string;
            "directdebit_GB.dateOfSignature"?: string;
            "directdebit_GB.mandateId"?: string;
            "directdebit_GB.sequenceType"?: string;
            "directdebit_GB.serviceUserName"?: string;
            "directdebit_GB.serviceUserNumber"?: string;
            eci?: string;
            expiryDate?: string;
            extraCostsCurrency?: string;
            extraCostsValue?: string;
            "fraudCheck--"?: string;
            fraudManualReview?: string;
            fraudOffset?: string;
            fraudResultType?: string;
            fundingSource?: string;
            grossCurrency?: string;
            grossValue?: string;
            iDealConsumerAccountNumber?: string;
            iDealConsumerBIC?: string;
            iDealConsumerCity?: string;
            iDealConsumerIBAN?: string;
            iDealConsumerIban?: string;
            iDealConsumerName?: string;
            iDealTransactionId?: string;
            iban?: string;
            "installments.value"?: string;
            interactionCounter?: string;
            "issuerComments.cardholderName"?: string;
            issuerCountry?: string;
            "latestCard.bin"?: string;
            "latestCard.expiryDate"?: string;
            "latestCard.summary"?: string;
            liabilityShift?: string;
            metadata?: {
              [k: string]: unknown;
            };
            additionalProperties?: string;
            "networkToken.available"?: string;
            "networkToken.bin"?: string;
            "networkToken.tokenSummary"?: string;
            "nfc.expire"?: string;
            "nfc.issue"?: string;
            "nfc.pin.provided"?: string;
            "nvc.uid"?: string;
            "opi.transToken"?: string;
            ownerCity?: string;
            ownerName?: string;
            payULatamTrazabilityCode?: string;
            paymentLinkId?: string;
            paypalAddressStatus?: string;
            paypalBillingName?: string;
            paypalEmail?: string;
            paypalErrorCode?: string;
            paypalErrorDescription?: string;
            paypalPairingId?: string;
            paypalPayerId?: string;
            paypalPayerResidenceCountry?: string;
            payapPayerStatus?: string;
            paypalPhone?: string;
            paypalProtectionEligibility?: string;
            paypalRisk?: string;
            realtimeAccountUpdaterStatus?: string;
            "recurring.contractTypes"?: string;
            "recurring.firstPspReference"?: string;
            "recurring.recurringDetailReference"?: string;
            referred?: string;
            refusalReasonRaw?: string;
            riskProfile?: string;
            riskProfileReference?: string;
            "sepadirectdebit.dateOfSignature"?: string;
            "sepadirectdebit.mandateId"?: string;
            "sepadirectdebit.sequenceType"?: (
              | "OOFF"
              | "FIRST"
              | "RCUR"
              | "FNAL"
            )[];
            shopperCountry?: string;
            shopperIP?: string;
            shopperInteraction?: string;
            shopperLocale?: string;
            shopperSocialSecurityNumber?: string;
            shopperStatement?: string;
            shopperTelephone?: string;
            store?: string;
            tenderReference?: string;
            terminalId?: string;
            threeDAuthenticated?: string;
            threeDAuthenticatedResponse?: string;
            threeDOffered?: string;
            threeDOfferedResponse?: string;
            threeDVersion?: string;
            tokenTxVariant?: string;
            totalFraudScore?: string;
            untokenisedCardSummary?: string;
            xid?: string;
            [k: string]: unknown;
          };
          amount?: {
            currency?: string;
            value?: number;
            [k: string]: unknown;
          };
          eventCode?: string;
          eventDate?: string;
          merchantAccountCode?: string;
          /**
           * A reference to uniquely identify the payment. This maps to the emcOrderId stored in CommerceTools.
           */
          merchantReference: string;
          paymentMethod?: string;
          /**
           * Adyen's 16-character unique reference associated with the transaction/the request. This value is globally unique; quote it when communicating with us about this request.
           */
          pspReference: string;
          reason?: string;
          success: string;
          [k: string]: unknown;
        };
      }[];
    };
    metadata: {
      "x-emc-ubid": string;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}