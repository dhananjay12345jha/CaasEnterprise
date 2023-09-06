@order
Feature: OMS Order Update to CT Validation
#WCAAS-2285 #WCAAS-2289

   Scenario Outline: CT receives order status update from OMS for 1 SKU Order
    Given Order exists for brandA
    Given OMS order update message has following invalid order details
      | current   | previous | trackingUrl                                         | companyName | value | type |
      | COMPLETED | SHIPPED  | http://www.yodel.co.uk/tracking/JJD0002230720000043 | YODEL       | 2     | days |
    And  OMS order update message has following lineItems details
      | sku        | status | quantity | dispatchedQuantity |
      | LineItem_1 | PLACED | 1        | 1                  |
    When OMS send order status update to Order status Update webhook API
    Then Order status Update response should be returned with status code 400
    And Order status Update Response message should have
      | json_path_parameter              | json_path_parameter_value |
      | $.error.details[0].message       | <message>                 |
      | $.error.details[0].errorType     | <errorType>               |
      | $.error.details[0].metadata.code | <code>                    |
      | $.error.details[0].metadata.path | <path>                    |

    Examples:
      | current | previous | quantity | updateType | time                     | message                                                                       | errorType       | code               | path            |
      | 3401    | 45345234 | 10       | decrement  | 2022-06-14T09:35:29.373Z | Unregistered OMS brand provided                                               | ValidationError | custom             | body,brand      |
      | 3401    | 45345234 | -10      | decrement  | 2022-06-14T09:35:29.373Z | Number must be greater than or equal to 0                                     | ValidationError | too_small          | body,quantity   |
      | 3401    | 45345234 | a        | decrement  | 2022-06-14T09:35:29.373Z | Expected number, received string                                              | ValidationError | invalid_type       | body,quantity   |
      | 3401    | 45345234 | 10       | dEcrement  | 2022-06-14T09:35:29.373Z | Invalid enum value. Expected 'increment' \| 'decrement', received 'dEcrement' | ValidationError | invalid_enum_value | body,updateType |
