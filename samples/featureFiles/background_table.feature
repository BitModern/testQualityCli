@ecommerce
Feature: Shopping Cart with Background
  Background:
    Given I am logged in as "standard_user"
    And I have an empty cart

  Scenario: Add multiple items
    When I add the following items:
      | Item       | Qty | Price |
      | Laptop     | 1   | 999   |
      | Mouse      | 2   | 25    |
    Then the cart total should be $1049