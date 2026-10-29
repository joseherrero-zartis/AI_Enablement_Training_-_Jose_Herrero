Feature: US-08 See my overall progress
  As a home baker
  I want to see a dashboard of my overall progress and my next challenge
  So that I stay motivated and can jump straight back into baking

  Background:
    Given the journey has 20 challenges, 5 at each level
    And the challenges in journey order start with "Banana bread", "Chocolate chip cookies" and "Buttermilk scones"

  @US-08 @AC-1
  Scenario: A fresh start shows no challenges mastered
    Given I am using the app for the first time
    When I open the home page
    Then I see "0 / 20 mastered"
    And the progress bar is empty

  @US-08 @AC-1
  Scenario: The count and the progress bar reflect mastered challenges
    Given I have mastered "Banana bread" and "Chocolate chip cookies"
    When I open the home page
    Then I see "2 / 20 mastered"
    And the progress bar is 10% full

  @US-08 @AC-2
  Scenario: The current level is the level of my next challenge
    Given I have mastered all 5 Beginner challenges
    And the first Intermediate challenge is unlocked
    When I open the home page
    Then I see "Current level: Intermediate"

  @US-08 @AC-3
  Scenario: The next challenge is the first unlocked one I haven't mastered
    Given I have mastered "Banana bread"
    And "Chocolate chip cookies" is unlocked
    When I open the home page
    Then the "Next challenge" section shows "Chocolate chip cookies" and its technique

  @US-08 @AC-3
  Scenario: The next challenge links to its page
    Given "Banana bread" is my next challenge
    When I open the home page
    And I click the next challenge
    Then I see the "Banana bread" page

  @US-08 @AC-3
  Scenario: A challenge I'm working on stays my next challenge
    Given "Banana bread" is unlocked
    And I have logged an attempt at "Banana bread"
    When I open the home page
    Then the "Next challenge" section shows "Banana bread"

  @US-08 @AC-3
  Scenario: An earlier challenge whose mastery I undid comes back as my next challenge
    Given I had mastered "Banana bread" and "Chocolate chip cookies"
    And I have undone the mastery of "Banana bread"
    When I open the home page
    Then the "Next challenge" section shows "Banana bread"
    And I see "1 / 20 mastered"

  @US-08 @AC-4
  Scenario: Mastering the whole journey shows a completion message
    Given I have mastered all 20 challenges
    When I open the home page
    Then I see "20 / 20 mastered"
    And the progress bar is full
    And I see "You've mastered the whole journey."
    And I don't see a next challenge
    And I see "Current level: Master"

  @US-08 @AC-5
  Scenario Outline: The dashboard updates as soon as I go back to it
    Given I am on the home page
    When I <action>
    And I go back to the home page
    Then the dashboard shows <change> without me reloading the page

    Examples:
      | action                             | change                                         |
      | mark my next challenge as mastered | one more mastered challenge and a new next one |
      | undo the mastery of a challenge    | one less mastered challenge                    |
