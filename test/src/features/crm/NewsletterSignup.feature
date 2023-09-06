@newsletter @crm @regression
Feature: Newsletter Signup - Notification to Braze
#WCAAS-1632
@sanity
  Scenario Outline: User Optin : when a user opts-in for newsletter, then he is created in Braze as "Opted-in"
    Given a user signs up for a newsletter on "brandA" with below details
      | email        | timezone   | marketingPreference |
      | <randomUser> | <timezone> | opt_in              |
    When a "newsletter.signup.request" event is sent to "emc_transact_bus" for "brandA"
    Then a "newsletter.signup.request" notification is sent to correct BRAZE account for "brandA"
    And "newsletter" event details are correctly persisted in BRAZE
    And user is "opted_in" in BRAZE
    Examples:
      | timezone        |
      | Europe/London   |
#      | America/Newyork |

  Scenario: User Optout : when a user does not opt-in for newsletter, then he should not be created in Braze as "Opted-in"
    Given a user signs up for a newsletter on "brandA" with below details
      | email        | timezone      | marketingPreference |
      | <randomUser> | Europe/London | not_opt_in          |
    When a "newsletter.signup.request" event is sent to "emc_transact_bus" for "brandA"
    Then a "newsletter.signup.request" notification is sent to correct BRAZE account for "brandA"
    And "newsletter" event details are correctly persisted in BRAZE
    And user is "unsubscribed" in BRAZE

  @ignore
  Scenario: Same user data is sent twice to Braze -- only one user must exist
    Given a user signs up for a newsletter on "brandA" with below details
      | email        | timezone      | marketingPreference |
      | <randomUser> | Europe/London | not_opt_in          |
    And a user signs up for a newsletter on "brandA" with below details
      | email      | timezone      | marketingPreference |
      | <sameUser> | Europe/London | not_opt_in          |
    When a "newsletter.signup.request" event is sent to "emc_transact_bus" for "brandA"
    Then a "newsletter.signup.request" notification is sent to correct BRAZE account for "brandA"
    And "newsletter" event details are correctly persisted in BRAZE
    And user is "opted_in" in BRAZE 

#Scenario: User Optout : when a user does not opt-in for newsletter, then he should not be created in Braze as "Opted-in" 
#Scenario: Same user data is sent twice to Braze -- only one user must exist 
#manual : incorrect brandId - retries must happen 
