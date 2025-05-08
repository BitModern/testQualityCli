Feature: User Management

  Scenario: Add multiple users
    Given the following users exist:
      | name       | email                | age |
      | John Doe   | john.doe@example.com | 30  |
      | Jane Smith | jane.smith@example.com | 25 |
    When I retrieve the user list
    Then the user list should include:
      | name       | email                | age |
      | John Doe   | john.doe@example.com | 30  |
      | Jane Smith | jane.smith@example.com | 25 |
