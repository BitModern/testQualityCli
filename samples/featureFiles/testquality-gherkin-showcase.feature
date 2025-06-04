@smoke @login
# This is a comment
Feature: User login

  As a user, I want to login so that I can access my dashboard.

  Background:
    Given the user is on the homepage
    And the user is logged out

  Scenario: Successful login
    Given the user has a valid username and password
    When they submit the login form
    Then they should see the dashboard

  Scenario: Failed login
    Given the user has an invalid username or password
    When they submit the login form
    Then they should see an error message

  Scenario Outline: Multiple failed attempts
    Given the user enters username "<username>" and password "<password>"
    When they submit the login form
    Then they should see an error message

    Examples:
      | username | password  |
      | john     | wrong123  |
      | alice    | passfail  |

  Scenario: View blog post with doc string
    Given a blog post named "Intro" with Markdown body
      """markdown
      # Welcome Post
      This is an introduction to our blog.
      """

  Scenario: Bulk user creation
    Given the following users exist:
      | name   | email              |
      | Alice  | alice@example.com  |
      | Bob    | bob@example.com    |

  Scenario: Shopping checklist
    Given I am out shopping
    * I have eggs
    * I have milk
    * I have bread

# language: fr
Fonctionnalité: Connexion utilisateur

  Scénario: Connexion réussie
    Étant donné que l'utilisateur est sur la page de connexion
    Quand il saisit ses identifiants
    Alors il voit son tableau de bord