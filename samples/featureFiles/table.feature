Feature: User Registration

  Scenario Outline: Register a new user with valid details
    Given the user is on the registration page
    When the user enters "<username>" as the username
    And the user enters "<email>" as the email
    And the user enters "<password>" as the password
    Then the user should see a success message

    Examples:
      | username  | email                  | password   |
      | johndoe   | john.doe@example.com   | pass1234   |
      | janedoe   | jane.doe@example.com   | securepass |
      | testuser  | test.user@example.com  | testpass   |
