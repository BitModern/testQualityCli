Feature: User Login Functionality

  Scenario Outline: Successful login with valid credentials
    Given the user navigates to the login page
    When the user enters username "<username>" and password "<password>"
    Then the user should be redirected to the dashboard

    Examples:
      | username | password  |
      | alice    | password1 |
      | bob      | password2 |
      | charlie  | password3 |
