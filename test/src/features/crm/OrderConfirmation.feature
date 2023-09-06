@orderConfirmation @regression @crm
Feature: Order Confirmation notification to Braze 
#WCAAS-1635

  @sanity
  Scenario: brandA : Registered user opts in at checkout and places and order 
    When a "registered" user "opts_in" at checkout 
    And user places an order for "brandA" 
    And a "order.created" event is sent to "emc_transact_bus" for "brandA"
    Then "order.created" notification is sent to correct BRAZE account for "brandA"
    And order event details are correctly persisted in BRAZE
    And user is "opted_in" in BRAZE 

  Scenario: brandA : Guest Order confirmation notification sent to BRAZE when an order is placed successfully 
    When a "guest" user "opts_in" at checkout
    And user places an order for "brandA"
    And a "order.created" event is sent to "emc_transact_bus" for "brandA"
    Then "order.created" notification is sent to correct BRAZE account for "brandA"
    And order event details are correctly persisted in BRAZE
    And user is "opted_in" in BRAZE  

  #Scenario: not_opt_in

  # Scenario: brandB : Order confirmation notification sent to BRAZE when an order is placed successfully 
  #   Given a guest user "does_not_opt_in" at checkout and places an order
  #   When a "order.created" event is sent to "emc_transact_bus" for "brandB"
  #   # Then a notification is sent to correct BRAZE account for "brandB"
  #   # And order details are correctly persisted in BRAZE
  #   # And user is opted_in in BRAZE --?? 

  # @tenancy 
  # Scenario: brandB : Order confirmation notification sent to BRAZE when an order is placed successfully 
  #   Given a registered user places an order 
  #   When a "order.created" event is sent to "emc_transact_bus" for "brandA"
  #   # Then a notification is sent to correct BRAZE account for "brandA"
  #   # And order details are correctly persisted in BRAZE

  # WCAAS-3665 -- Pending , enable below scenario then 
    # Given a user registers but does not opt_in 
    # And user "opts_in" at checkout and places an order 
    # When a "order.created" event is sent to "emc_transact_bus" for "brandA"
    # Then a notification is sent to correct BRAZE account for "brandA"
    # And order details are correctly persisted in BRAZE
    # And user is opted_in in BRAZE 

#manual : incorrect brandId - retries must happen 
#??same user registered for brandA and brandB -- how does BRAZE handle tenancy
