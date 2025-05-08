Feature: Example of Doc String

  Scenario: Using a Doc String as an argument
    Given the following JSON payload:
      """
      {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "age": 30
      }
      """
    When the payload is sent to the API
    Then the response status code should be 200
