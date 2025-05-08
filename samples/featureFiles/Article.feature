Feature: Article
Background: Log in to Storybook and go to Protons>Typography>Text Styles
    Given I'm at CMS

  @e2e-test
  Scenario: Create Article
    When I go to menu option: "Atoms>Typography>Heading>Heading 1"
