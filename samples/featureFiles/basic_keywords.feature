@core @smoke
Feature: Basic Gherkin Keywords
  Demonstrates Given/When/Then/And/But

  Scenario: Successful login
    Given I am on the login page
    When I enter "test@example.com" and "validPass123"
    And I click the login button
    Then I should see the dashboard
    But I should not see "Error"

  Scenario: Failed login
    Given I am on the login page
    When I enter "test@example.com" and "wrongPass"
    Then I should see "Invalid credentials"