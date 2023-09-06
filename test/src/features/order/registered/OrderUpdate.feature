@order @regression
Feature: OMS Order Update to CT
#WCAAS-2285 #WCAAS-2289
  Background:
    Given a cart exists in CT for brandA
    And User create payment successfully in CT
    And User add payment to cart successfully in CT
    And Adyen sent successful payment authorisation to payment webhook
    And Payment webhook response should be [accepted]
    And Order is successfully created in commercetools
    And User add Transaction successfully to Payment


  Scenario: CT receives order status update from OMS for 1 SKU Order
    Given OMS order update message has following order details
      | current | previous |
      | PLACED  | PLACED   |
    And  OMS order update message has following lineItems details
      | sku        | status | quantity | dispatchedQuantity |
      | LineItem_1 | PLACED | 1        | 1                  |
    When OMS send order status update to Order status Update webhook API
    Then Order status Update response should be returned with status code 200
    And Order is successfully updated in commercetools
    Then User Verify saved Order details in CT
#SHIPPED
    Given OMS order update message has following order details
      | current | previous | trackingUrl                                         | companyName | value | type |
      | SHIPPED | PLACED   | http://www.yodel.co.uk/tracking/JJD0002230720000043 | YODEL       | 2     | days |
    And  OMS order update message has following lineItems details
      | sku        | status  | quantity | dispatchedQuantity |
      | LineItem_1 | SHIPPED | 1        | 1                  |
    When OMS send order status update to Order status Update webhook API
    Then Order status Update response should be returned with status code 200
    And Order is successfully updated in commercetools
    Then User Verify saved Order details in CT
#COMPLETED
    Given OMS order update message has following order details
      | current   | previous | trackingUrl                                         | companyName | value | type |
      | COMPLETED | SHIPPED  | http://www.yodel.co.uk/tracking/JJD0002230720000043 | YODEL       | 2     | days |
    And  OMS order update message has following lineItems details
      | sku        | status    | quantity | dispatchedQuantity |
      | LineItem_1 | COMPLETED | 1        | 1                  |
    When OMS send order status update to Order status Update webhook API
    Then Order status Update response should be returned with status code 200
    And Order is successfully updated in commercetools
    Then User Verify saved Order details in CT

  #CANCELLED
    Given OMS order update message has following order details
      | current   | previous |
      | CANCELLED | PLACED   |
    And  OMS order update message has following lineItems details
      | sku        | status    | quantity | dispatchedQuantity |
      | LineItem_1 | CANCELLED | 1        | 0                  |
    When OMS send order status update to Order status Update webhook API
    Then Order status Update response should be returned with status code 200
    And Order is successfully updated in commercetools
    Then User Verify saved Order details in CT
