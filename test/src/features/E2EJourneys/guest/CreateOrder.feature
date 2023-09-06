@order
Feature: Guest user Create Order
#WCAAS-1632

  Scenario: Guest user Creates Order with one sku successfully
    Given a guest user is navigating site for brandA
    When User request Create cart with following line items and currency <fromConfig>
      | sku        | quantity |
      | LineItem_1 | 1        |
    Then Cart response should be returned with status code 201
    When User set following Shipping address to active cart
      | id | key         | title | salutation | firstName | lastName | streetName   | streetNumber | additionalStreetInfo | postalCode | city    | region | country      | company   | department | building             | apartment | pOBox | additionalAddressInfo | email         | phone         | mobile        |
      | 1  | AS0Zrb_N8B0 | MR    | SIR        | JAMES     | BOND     | Clarendon Rd | 007          | OPP CHURCH           | WD17 1JJ   | WATFORD | HERTS  | <fromConfig> | EVERYMILE | IT         | Greater london house | N/A       | 555   | NEAR HIGH STREET      | test@test.com | +448007747775 | +447399938749 |
    Then Shipping address response should be returned with status code 200
    When User set following Billing address to active cart
      | id | key         | title | salutation | firstName | lastName | streetName   | streetNumber | additionalStreetInfo | postalCode | city    | region | country      | company   | department | building             | apartment | pOBox | additionalAddressInfo | email         | phone         | mobile        |
      | 1  | AS0Zrb_N8B0 | MR    | SIR        | JAMES     | BOND     | Clarendon Rd | 007          | OPP CHURCH           | WD17 1JJ   | WATFORD | HERTS  | <fromConfig> | EVERYMILE | IT         | Greater london house | N/A       | 555   | NEAR HIGH STREET      | test@test.com | +448007747776 | +447399938740 |
    Then Billing address response should be returned with status code 200
    And User selects "Standard" shipping method
    When User request Create payment session for active Cart for the brand
    Then Payment session response should be returned with status code 201
    When User request get cart for active cart
    And Adyen sent successful payment authorisation to payment webhook
    Then Payment webhook response should be [accepted]
    Given Order is successfully created in commercetools
    Then Verify Order details with cart details
    And Verify Success payment reference
    Given User Get Order details from OMS
    Then Verify CT order details with OMS order details

  Scenario: Guest user Creates Order with two sku successfully
    Given a guest user is navigating site for brandA
    When User request Create cart with following line items and currency <fromConfig>
      | sku        | quantity |
      | LineItem_1 | 2        |
      | LineItem_2 | 1        |
    Then Cart response should be returned with status code 201
    When User set following Shipping address to active cart
      | id | key         | title | salutation | firstName | lastName | streetName   | streetNumber | additionalStreetInfo | postalCode | city    | region | country      | company   | department | building             | apartment | pOBox | additionalAddressInfo | email         | phone         | mobile        |
      | 1  | AS0Zrb_N8B0 | MR    | SIR        | Chris     | lewis    | Clarendon Rd | 007          | OPP CHURCH           | WD17 1JJ   | WATFORD | HERTS  | <fromConfig> | EVERYMILE | IT         | Greater london house | N/A       | 555   | NEAR HIGH STREET      | test@test.com | +448007747775 | +447399938749 |
    Then Shipping address response should be returned with status code 200
    When User set following Billing address to active cart
      | id | key         | title | firstName | lastName | streetName | streetNumber | additionalStreetInfo | postalCode | city    | region    | country      | company   | department | building     | apartment | pOBox | additionalAddressInfo | email         | phone         | mobile        |
      | 1  | AS0Zrb_N8B0 | MRS   | Jenny     | Daniel   | London Rd  | 009          | OPP Park             | E20 5LL    | Telford | Shopshire | <fromConfig> | EVERYMILE | ENGG       | Fuller house | N/A       | 666   | NEAR HIGH STREET      | test@test.com | +448007747776 | +447399938740 |
    Then Billing address response should be returned with status code 200
    And User selects "Standard" shipping method
    When User request Create payment session for active Cart for the brand
    Then Payment session response should be returned with status code 201
    When User request get cart for active cart
    And Adyen sent successful payment authorisation to payment webhook
    Then Payment webhook response should be [accepted]
    Given Order is successfully created in commercetools
    Then Verify Order details with cart details
    And Verify Success payment reference
    Given User Get Order details from OMS
    Then Verify CT order details with OMS order details

  @ignore
  Scenario: Guest user Creates Order successfully
    Given a guest user is navigating site for brandB
    When User request Create cart with following line items and currency <fromConfig>
      | sku          | quantity |
      | <fromConfig> | 1        |
    Then Cart response should be returned with status code 201
    When User set following Shipping address to active cart
      | id | key         | title | salutation | firstName | lastName | streetName   | streetNumber | additionalStreetInfo | postalCode | city    | region | country      | company   | department | building             | apartment | pOBox | additionalAddressInfo | email         | phone         | mobile        |
      | 1  | AS0Zrb_N8B0 | MR    | SIR        | JAMES     | BOND     | Clarendon Rd | 007          | OPP CHURCH           | WD17 1JJ   | WATFORD | HERTS  | <fromConfig> | EVERYMILE | IT         | Greater london house | N/A       | 555   | NEAR HIGH STREET      | test@test.com | +448007747775 | +447399938749 |
    Then Shipping address response should be returned with status code 200
    When User set following Billing address to active cart
      | id | key         | title | salutation | firstName | lastName | streetName   | streetNumber | additionalStreetInfo | postalCode | city    | region | state | country      | company   | department | building             | apartment | pOBox | additionalAddressInfo | email         | phone         | mobile        |
      | 1  | AS0Zrb_N8B0 | MR    | SIR        | JAMES     | BOND     | Clarendon Rd | 007          | OPP CHURCH           | WD17 1JJ   | WATFORD | NORTH  | HERTS | <fromConfig> | EVERYMILE | IT         | Greater london house | N/A       | 555   | NEAR HIGH STREET      | test@test.com | +448007747776 | +447399938740 |
    Then Billing address response should be returned with status code 200
    When User request Create payment session for active Cart for the brand
    Then Payment session response should be returned with status code 201
    When User request get cart for active cart
    And Adyen sent successful payment authorisation to payment webhook
    Given Order is successfully created in commercetools
    Then Verify Order details with cart details


  Scenario: Guest user tried to Creates Order without Line Items
    Given a guest user is navigating site for brandA
    When User request Create Cart for the brand
    Then Cart response should be returned with status code 201
    When User request get cart for active cart
    And Adyen sent successful payment authorisation to payment webhook
    Given Order is not created in commercetools


  Scenario: Guest user tried to Creates Order without shipping addresses
    Given a guest user is navigating site for brandA
    When User request Create cart with following line items and currency <fromConfig>
      | sku          | quantity |
      | <fromConfig> | 1        |
    Then Cart response should be returned with status code 201
    When User request get cart for active cart
    And Adyen sent successful payment authorisation to payment webhook
     And Order is not created in commercetools


  Scenario Outline: Guest user tried to Creates Order with incorrect eventCode
    Given a guest user is navigating site for brandA
    When User request Create cart with following line items and currency <fromConfig>
      | sku          | quantity |
      | <fromConfig> | 1        |
    Then Cart response should be returned with status code 201
    When User set following Shipping address to active cart
      | id | key         | title | salutation | firstName | lastName | streetName   | streetNumber | additionalStreetInfo | postalCode | city    | region | country      | company   | department | building             | apartment | pOBox | additionalAddressInfo | email         | phone         | mobile        |
      | 1  | AS0Zrb_N8B0 | MR    | SIR        | JAMES     | BOND     | Clarendon Rd | 007          | OPP CHURCH           | WD17 1JJ   | WATFORD | HERTS  | <fromConfig> | EVERYMILE | IT         | Greater london house | N/A       | 555   | NEAR HIGH STREET      | test@test.com | +448007747775 | +447399938749 |
    Then Shipping address response should be returned with status code 200
    When User set following Billing address to active cart
      | id | key         | title | salutation | firstName | lastName | streetName   | streetNumber | additionalStreetInfo | postalCode | city    | region | state | country      | company   | department | building             | apartment | pOBox | additionalAddressInfo | email         | phone         | mobile        |
      | 1  | AS0Zrb_N8B0 | MR    | SIR        | JAMES     | BOND     | Clarendon Rd | 007          | OPP CHURCH           | WD17 1JJ   | WATFORD | NORTH  | HERTS | <fromConfig> | EVERYMILE | IT         | Greater london house | N/A       | 555   | NEAR HIGH STREET      | test@test.com | +448007747776 | +447399938740 |
    Then Billing address response should be returned with status code 200
    When User request Create payment session for active Cart for the brand
    Then Payment session response should be returned with status code 201
    When User request get cart for active cart
    And Adyen sent unsuccessful payment authorisation to payment webhook
      | eventCode   |
      | <eventCode> |
   And Order is not created in commercetools

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


  Scenario: Guest user tried to Creates Order with eventCode CANCELLATION
    Given a guest user is navigating site for brandA
    When User request Create cart with following line items and currency <fromConfig>
      | sku          | quantity |
      | <fromConfig> | 1        |
    Then Cart response should be returned with status code 201
    When User set following Shipping address to active cart
      | id | key         | title | salutation | firstName | lastName | streetName   | streetNumber | additionalStreetInfo | postalCode | city    | region | country      | company   | department | building             | apartment | pOBox | additionalAddressInfo | email         | phone         | mobile        |
      | 1  | AS0Zrb_N8B0 | MR    | SIR        | JAMES     | BOND     | Clarendon Rd | 007          | OPP CHURCH           | WD17 1JJ   | WATFORD | HERTS  | <fromConfig> | EVERYMILE | IT         | Greater london house | N/A       | 555   | NEAR HIGH STREET      | test@test.com | +448007747775 | +447399938749 |
    Then Shipping address response should be returned with status code 200
    When User set following Billing address to active cart
      | id | key         | title | salutation | firstName | lastName | streetName   | streetNumber | additionalStreetInfo | postalCode | city    | region | state | country      | company   | department | building             | apartment | pOBox | additionalAddressInfo | email         | phone         | mobile        |
      | 1  | AS0Zrb_N8B0 | MR    | SIR        | JAMES     | BOND     | Clarendon Rd | 007          | OPP CHURCH           | WD17 1JJ   | WATFORD | NORTH  | HERTS | <fromConfig> | EVERYMILE | IT         | Greater london house | N/A       | 555   | NEAR HIGH STREET      | test@test.com | +448007747776 | +447399938740 |
    Then Billing address response should be returned with status code 200
    When User request Create payment session for active Cart for the brand
    Then Payment session response should be returned with status code 201
    When User request get cart for active cart
    And Adyen sent unsuccessful payment authorisation to payment webhook
      | success |
      | false   |
   And Order is not created in commercetools
