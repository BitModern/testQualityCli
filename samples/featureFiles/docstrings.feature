@api @v2
Feature: Product API with Doc Strings
  Scenario: Create product
    Given I send a POST request to "/products" with body:
      """
      {
        "name": "Wireless Earbuds",
        "price": 129.99,
        "stock": 50
      }
      """
    Then the response should contain:
      """
      {
        "id": "prod_123",
        "status": "created"
      }
      """