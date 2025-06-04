@checkout @parameterized
Feature: Discount Calculator
  Scenario Outline: Apply discount <code>
    Given I have items totaling $<total>
    When I apply discount code "<code>"
    Then the final price should be $<final>

    Examples:
      | total | code   | final |
      | 100   | SAVE10 | 90    |
      | 200   | SAVE20 | 160   |

    Examples: VIP Customers
      | total | code    | final |
      | 500   | VIP30   | 350   |