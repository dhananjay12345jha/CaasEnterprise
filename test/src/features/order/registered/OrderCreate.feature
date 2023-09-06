@regression
Feature: Order create in OMS and stock decrement on CT order create

#configure exlusive data for this test i.e. Product to correctly check stock 
# integ only test and cannot be run on QA1 as OMS connectivity exists there and stock for items might be changing
Scenario: brandA - 1sku - Order is successfully created in OMS when payment is successfully authorised 
    Given a cart exists in CT for brandA
    And a payment is added to above cart successfully
    And Adyen sent successful payment authorisation to payment webhook
    When Payment webhook response should be [accepted]
    Then Order is successfully created in commercetools
    And verify stock for SKU ordered is decremented in CT
    And Order is correctly created in OMS

# @tenancy
# Scenario: brandB - 1sku - Order is successfully created in OMS when payment is successfully authorised 
#     Given a cart exists in CT for "brandA"
#     And a payment is added to above cart successfully
#     And Adyen sent successful payment authorisation to payment webhook
#     And Payment webhook response should be [accepted]
#     And Order is successfully created in commercetools
#     # stock is decremented 
#     # And Order is correctly created in OMS

Scenario: brandA - 2sku - Order is successfully created in OMS when payment is successfully authorised 
    Given a cart exists with 2 items in CT for brandA
    And a payment is added to above cart successfully
    And Adyen sent successful payment authorisation to payment webhook
    When Payment webhook response should be [accepted]
    And Order is successfully created in commercetools
    And Order is correctly created in OMS

Scenario: Order will not be placed in OMS when the cart is incomplete : when cart details change after payment is added 
    Given a cart exists with 2 items in CT for brandA
    And a payment is added to above cart successfully
    And user deletes "a lineItem" from cart 
    And Adyen sent successful payment authorisation to payment webhook
    When Payment webhook response should be [accepted]
    Then Order is not created in commercetools
    And Order is not created in OMS

Scenario: Order will not be placed in OMS when the cart is incomplete : when no line items exist
    Given a cart exists in CT for brandA
    And a payment is added to above cart successfully
    And user deletes "a lineItem" from cart 
    And Adyen sent successful payment authorisation to payment webhook
    When Payment webhook response should be [accepted]
    Then Order is not created in commercetools
    And Order is not created in OMS

# ToDo: Order will not be placed , if stock of an item becomes 0 just before placing an order
