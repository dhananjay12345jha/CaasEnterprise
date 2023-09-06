@payment @regression
Feature: Payment Authorisation and update to order
#WCAAS-3216 and others 

  Scenario: brandA : Cart is converted to order when payment authorisation is successful
    Given a cart exists in CT for brandA
    And a payment is added to above cart successfully
    When Adyen sent successful payment authorisation to payment webhook
    Then Payment webhook response should be [accepted]
    And Order is successfully created in commercetools
    And payment details are correctly persisted in the order

  # @tenancy
  # Scenario: brandB : Cart is converted to order when payment authorisation is successful
    # Given a cart exists in CT for "brandB"
    # And a payment is added to above cart successfully
    # When Adyen sent successful payment authorisation to payment webhook
    # Then Payment webhook response should be [accepted]
    # And Order is successfully created in commercetools
    # And payment details are correctly persisted in the order

  Scenario Outline: Cart remains in Active state when payment is not authorised : <eventCode>
    Given a cart exists in CT for brandA
    And a payment is added to above cart successfully
    When Adyen sent unsuccessful payment authorisation to payment webhook
      | field     | value       |
      | eventCode | <eventCode> |
    Then Payment webhook response should be [accepted]
    And Order is not created in commercetools
    And payment details are correctly persisted in the cart

    Examples:
      | eventCode                |
      | CANCELLATION             |
      | AUTHORISATIO             |
      | authorisation            |
      | AUTHORISATION_ADJUSTMENT |
      | CANCEL_OR_REFUND         |
      | CAPTURE                  |
      | CAPTURE_FAILED           |
      | ORDER_CLOSED             |
      | ORDER_OPENED             |
      | REFUND                   |
      | REFUNDED_REVERSED        |
      | REFUND_FAILED            |
      | REFUND_WITH_DATA         |
      | REPORT_AVAILABLE         |
      | TECHNICAL_CANCEL         |
      | VOID_PENDING_REFUND      |

  # Scenario: User can place an order, if authoristaion is successful after a failed one

  Scenario Outline: Scenario Outline name: Payment webhook must fail when the request is not valid : <test> : <value>
    Given a cart exists in CT for brandA
    And a payment is added to above cart successfully
    When Adyen sent unsuccessful payment authorisation to payment webhook
      | field   | value   |
      | <field> | <value> |
    Then Payment webhook response should be [accepted]
    And Order is not created in commercetools
    # And payment details are correctly persisted in the cart

    Examples:
      | test                             | field               | value                                                            |
      | not a valid brandId              | brandId             | not-valid                                                        |
      | non-existent brandId             | brandId             | af86b424-47e8-4cdf-a251-0fef71a06aa3                             |
      | non-existent cart ID             | cartId              | af86b424-47e8-4cdf-a251-0fef71a06aa3                             |
      | not a valid hmacSig              | hmacSignature       | Qby3uduIznfV+db5+tkV6El8UcnyYbiD+OoLl193YaE=                     |
      | not a valid cart digest          | cartDigest          | 7e16a779e52c65a8154fe4e35d4173e6ef560a73a9431df9f1685985ef7e860f |
      | invalid merchant reference       | merchantReference   | TestPayment-1407325143704                                        |
      | invalid merchant account code    | merchantAccountCode | TestPayment_Test_code                                            |
      | invalid supported payment method | paymentMethod       | discover                                                         |
      | invalid cart total               | cartTotal           | 800                                                              |
      | invalid currency                 | currency            | USD                                                              |
      # manual- invalid json payload 


