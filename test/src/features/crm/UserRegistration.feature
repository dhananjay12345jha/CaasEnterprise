@crm @regression
Feature: User Registration - Notification to Braze
#WCAAS-1632

  @sanity
  Scenario: User signup : Notification is sent to Braze about new user
    Given a user signs up on "brandA" with below details
      | email        | firstName | lastName |
      | <randomUser> | Auto      | Test     |
    When a "user.registered" event is sent to "emc_transact_bus" for "brandA"
    Then a "user.registered" notification is sent to correct BRAZE account for "brandA"
    And "registration" event details are correctly persisted in BRAZE
    # And user is "opted_in" in BRAZE -- WCAAS-3665

# WCAAS-3665 pending 
#Scenario: User signup: Not_opt_in : when a user does not opt-in at sign-up, then he should not be created in Braze as "Opted-in" 

#manual : incorrect brandId - retries must happen 
