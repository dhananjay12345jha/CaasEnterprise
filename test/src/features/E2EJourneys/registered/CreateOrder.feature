@order
Feature: Registered user Create Order
#WCAAS-1632

  Scenario: Registered user Creates Order with one sku successfully
    Given user signed in to brandA with below details
      | username                   | password     |
      | autobesignin@everymile.com | <fromConfig> |
    When User request Create cart with following line items and currency <fromConfig>
      | sku        | quantity |
      | LineItem_1 | 1        |
    Then Cart response should be returned with status code 201
    And Cart Response message should match
      | json_path_parameter | json_path_parameter_value             |
      | $.customerId        | \b(uuid:){0,1}\s*([a-f0-9\\-]*){1}\s* |
    When User set following Shipping address to active cart
      | firstName | lastName | streetName   | streetNumber | postalCode | city    | region | country | email                      | phone         | mobile        |
      | JAMES     | BOND     | Clarendon Rd | 007          | WD17 1JJ   | WATFORD | HERTS  | GB      | autobesignin@everymile.com | +448007747776 | +447399938740 |
    Then Shipping address response should be returned with status code 200
    When User set following Billing address to active cart
      | firstName | lastName | streetName   | streetNumber | postalCode | city    | region | country | email                      | phone         | mobile        |
      | JAMES     | BOND     | Clarendon Rd | 007          | WD17 1JJ   | WATFORD | HERTS  | GB      | autobesignin@everymile.com | +448007747776 | +447399938740 |
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


  Scenario: Registered user Creates Order with two sku with different shipping and billing successfully
    Given user signed in to brandA with below details
      | username                   | password     |
      | autobesignin@everymile.com | <fromConfig> |
    When User request Create cart with following line items and currency <fromConfig>
      | sku        | quantity |
      | LineItem_1 | 1        |
      | LineItem_2 | 2        |
    Then Cart response should be returned with status code 201
    And Cart Response message should match
      | json_path_parameter | json_path_parameter_value             |
      | $.customerId        | \b(uuid:){0,1}\s*([a-f0-9\\-]*){1}\s* |
    When User set following Shipping address to active cart
      | firstName | lastName | streetName   | streetNumber | postalCode | city    | region | country | email                      | phone         | mobile        |
      | CHRIS     | HENRY    | Clarendon Rd | 008          | WD17 1JJ   | WATFORD | HERTS  | GB      | autobesignin@everymile.com | +448007747776 | +447399938740 |
    Then Shipping address response should be returned with status code 200
    When User set following Billing address to active cart
      | firstName | lastName | streetName       | streetNumber | postalCode | city   | region | country | email                      | phone         | mobile        |
      | JAMES     | Harris   | Westminister Way | 009          | E15 3AB    | LONDON | LONDON | GB      | autobesignin@everymile.com | +448007748886 | +447377738740 |
    Then Billing address response should be returned with status code 200
    And User selects "Standard" shipping method
    When User request Create payment session for active Cart for the brand
    Then Payment session response should be returned with status code 201
    When User request get cart for active cart
    And Adyen sent successful payment authorisation to payment webhook
    Then Payment webhook response should be [accepted]
    And Order is successfully created in commercetools
    Then Verify Order details with cart details
    And Verify Success payment reference
    Given User Get Order details from OMS
    Then Verify CT order details with OMS order details


  Scenario: Registered user tried to Creates Order without Line Items
    Given user signed in to brandA with below details
      | username                   | password     |
      | autobesignin@everymile.com | <fromConfig> |
    When User request Create Cart for the brand
    Then Cart response should be returned with status code 201
    And Cart Response message should match
      | json_path_parameter | json_path_parameter_value             |
      | $.customerId        | \b(uuid:){0,1}\s*([a-f0-9\\-]*){1}\s* |
    When User request get cart for active cart
    And Adyen sent successful payment authorisation to payment webhook
    And Order is not created in commercetools


  Scenario: Registered user tried to Creates Order without shipping addresses
    Given user signed in to brandA with below details
      | username                   | password     |
      | autobesignin@everymile.com | <fromConfig> |
    When User request Create cart with following line items and currency <fromConfig>
      | sku        | quantity |
      | LineItem_1 | 1        |
    Then Cart response should be returned with status code 201
    And Cart Response message should match
      | json_path_parameter | json_path_parameter_value             |
      | $.customerId        | \b(uuid:){0,1}\s*([a-f0-9\\-]*){1}\s* |
    When User request get cart for active cart
    And Adyen sent successful payment authorisation to payment webhook
    And Order is not created in commercetools


  Scenario: Registered user tried to Creates Order with eventCode CANCELLATION
    Given user signed in to brandA with below details
      | username                   | password     |
      | autobesignin@everymile.com | <fromConfig> |
    When User request Create cart with following line items and currency <fromConfig>
      | sku        | quantity |
      | LineItem_1 | 1        |
    Then Cart response should be returned with status code 201
    And Cart Response message should match
      | json_path_parameter | json_path_parameter_value             |
      | $.customerId        | \b(uuid:){0,1}\s*([a-f0-9\\-]*){1}\s* |
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
      | eventCode    |
      | CANCELLATION |
    And Order is not created in commercetools


  Scenario: Registered user tried to Creates Order with eventCode CANCELLATION
    Given user signed in to brandA with below details
      | username                   | password     |
      | autobesignin@everymile.com | <fromConfig> |
    When User request Create cart with following line items and currency <fromConfig>
      | sku        | quantity |
      | LineItem_1 | 1        |
    Then Cart response should be returned with status code 201
    And Cart Response message should match
      | json_path_parameter | json_path_parameter_value             |
      | $.customerId        | \b(uuid:){0,1}\s*([a-f0-9\\-]*){1}\s* |
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
