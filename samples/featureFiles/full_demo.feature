@regression @full
Feature: Comprehensive Gherkin Demo
  Background:
    Given I open the application
    And I clear all test data

  Scenario: User registration
    When I register with:
      | Field | Value         |
      | Email | user@test.com |
      | Pass  | Secure123!    |
    Then I see "Registration successful"

  Scenario Outline: Search for <term>
    Given I am on the search page
    When I search for "<term>"
    Then I see at least <results> results

    Examples:
      | term      | results |
      | "laptop"  | 10      |
      | "monitor" | 5       |

  @error
  Scenario: Invalid payment
    When I submit payment with:
      """
      {
        "card": "4111111111111111",
        "expiry": "13/2025"
      }
      """
    Then I see "Invalid expiry date"