@stock @regression
Feature: OMS Stock Update to CT
#WCAAS-2285
  @sanity
  Scenario Outline: CT receives increment stock update from OMS
    When OMS send following stock update to Stock Update API for brandA
      | brand       | sku        | quantity   | updateType | time                     |
      | oms_brandId | LineItem_3 | <quantity> | increment  | 2022-06-14T09:35:29.373Z |
    Then Stock Update response should be returned with status code 200
    Then Verify Inventory was updated as expected
    Examples:
      | quantity |
      | +5       |
      | -4       |
      | 0        |
      | +50      |


  Scenario Outline: CT Receives decrement stock update from OMS
    When OMS send following stock update to Stock Update API for brandA
      | brand       | sku        | quantity   | updateType | time                     |
      | oms_brandId | LineItem_3 | <quantity> | decrement  | 2022-06-14T09:35:29.373Z |
    Then Stock Update response should be returned with status code 200
    Then Verify Inventory was updated as expected
    Examples:
      | quantity |
      | +1       |
      | -1       |
      | 0        |


  Scenario Outline: CT receives invalid schema stock update from OMS
    When OMS send following Invalid stock update to Stock Update API for brandA
      | brand   | sku   | quantity   | updateType   | time   |
      | <brand> | <sku> | <quantity> | <updateType> | <time> |
    Then Stock Update response should be returned with status code 400
    And Stock Response message should have
      | json_path_parameter              | json_path_parameter_value |
      | $.error.details[0].message       | <message>                 |
      | $.error.details[0].errorType     | <errorType>               |
      | $.error.details[0].metadata.code | <code>                    |
      | $.error.details[0].metadata.path | <path>                    |

    Examples:
      | brand       | sku        | quantity | updateType | time                     | message                                                                       | errorType       | code               | path            |
      | 3401        | LineItem_3 | 10       | decrement  | 2022-06-14T09:35:29.373Z | Unregistered OMS brand provided                                               | ValidationError | custom             | body,brand      |
      | oms_brandId | LineItem_3 | -10      | decrement  | 2022-06-14T09:35:29.373Z | Number must be greater than or equal to 0                                     | ValidationError | too_small          | body,quantity   |
      | oms_brandId | LineItem_3 | a        | decrement  | 2022-06-14T09:35:29.373Z | Expected number, received string                                              | ValidationError | invalid_type       | body,quantity   |
      | oms_brandId | LineItem_3 | 10       | dEcrement  | 2022-06-14T09:35:29.373Z | Invalid enum value. Expected 'increment' \| 'decrement', received 'dEcrement' | ValidationError | invalid_enum_value | body,updateType |


  Scenario Outline: CT receives stock update from OMS without token or invalid token
    When OMS sends following stock update to Stock Update API for brandA with <token> token
      | brand       | sku        | quantity | updateType | time                     |
      | oms_brandId | LineItem_3 | 10       | decrement  | 2022-06-14T09:35:29.373Z |
    Then Stock Update response should be returned with status code 400
    And Stock Response message should have
      | json_path_parameter              | json_path_parameter_value |
      | $.error.details[0].message       | <message>                 |
      | $.error.details[0].errorType     | <errorType>               |
      | $.error.details[0].metadata.code | <code>                    |
      | $.error.details[0].metadata.path | <path>                    |

    Examples:
      | token   | message                               | errorType       | code         | path                  |
      | no      | Authorization header must be present. | ValidationError | invalid_type | headers,authorization |
      | invalid | Invalid PSK provided.                 | ValidationError | custom       | headers,authorization |
