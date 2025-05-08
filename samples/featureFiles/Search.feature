@Search
Feature: Search
Background: Log in to Storybook and go to Protons>Typography>Text Styles
    Given I'm at Subsites - Help Center

  @e2e-test
  Scenario: Search field: can you type a search term?
    When I search the word "Board"
    Then at least 1 search result should be displayed
    And all results should include the word "Board"
	
	When I search the word "Beard"
    Then at least 1 search result should be displayed
    And all results should include the word "Beard"

  @e2e-test
  Scenario: Search General - Search for a term, do you see adequate results?
    When I search the word "Board"
    And I select "General" search results
    Then at least 1 search result should be displayed
    And all results should include the word "Board"

  @e2e-test
  Scenario: Search Business - Search for a term, do you see adequate results?
    When I search the word "Board"
    And I select "Business" search results
    Then at least 1 search result should be displayed
    And all results should include the word "Board"
