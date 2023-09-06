@order
Feature: Newsletter Signup - Notification to Braze
#WCAAS-1632

  Scenario: User Optin : when a user opts-in for newsletter, then he is created in Braze as "Opted-in"
    # Given a user signs up for a newsletter --ToDo:generate payload as part of this step 
    When a "newsletter.signup.request" event is sent to "emc_transact_bus" for "brandA"
    # Then a notification is sent to correct BRAZE account for "brandA"
    # And user details are correctly persisted in BRAZE


#Scenario: User Optout : when a user does not opt-in for newsletter, then he should not be created in Braze as "Opted-in" 
#Scenario: Same user data is sent twice to Braze -- only one user must exist 
#manual : incorrect brandId - retries must happen 
