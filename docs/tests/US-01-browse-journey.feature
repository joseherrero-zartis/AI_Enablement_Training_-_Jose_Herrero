Feature: US-01 Browse the baking journey
  As a home baker
  I want to see every challenge in the journey in order of difficulty, with its status
  So that I know where I am and what I'll learn next

  Background:
    Given the journey has 20 challenges, 5 at each level
    And the first challenge is "Banana bread" at the Beginner level

  @US-01 @AC-1
  Scenario: Challenges are listed in order and grouped by level
    When I open the journey page
    Then I see the level groups in this order: Beginner, Intermediate, Advanced, Master
    And each group lists its challenges in journey order
    And "Banana bread" is the first challenge in the Beginner group

  @US-01 @AC-2
  Scenario: Each challenge shows its details and status
    When I open the journey page
    Then every challenge shows its title, technique and status
    And every challenge appears under the group for its level

  @US-01 @AC-2
  Scenario Outline: A challenge shows the status that matches my progress
    Given "Banana bread" is <progress>
    When I open the journey page
    Then "Banana bread" shows the status "<status>"

    Examples:
      | progress                            | status      |
      | unlocked with no attempts           | Not started |
      | unlocked with at least one attempt  | In progress |
      | marked as mastered                  | Mastered    |

  @US-01 @AC-3
  Scenario: On a fresh start only the first challenge is unlocked
    Given I am using the app for the first time
    When I open the journey page
    Then "Banana bread" shows the status "Not started"
    And the other 19 challenges show the status "Locked"

  @US-01 @AC-4
  Scenario: A locked challenge can't be opened from the journey page
    Given "Chocolate chip cookies" is locked
    When I open the journey page
    Then I see "Chocolate chip cookies" in the list
    But I can't click it to open its page

  @US-01 @AC-4
  Scenario: Opening a locked challenge's address directly doesn't reveal it
    Given "Chocolate chip cookies" is locked
    When I go straight to the "Chocolate chip cookies" page by its address
    Then I see the message "Master the previous challenge to unlock this one."
    And I don't see its base recipe
    And I don't see its attempts

  @US-01 @AC-5
  Scenario: An unlocked challenge opens its detail page
    Given "Banana bread" is unlocked
    When I open the journey page
    And I click "Banana bread"
    Then I see the "Banana bread" page with its level, technique and description
    And I see a "Base recipe" section

  @US-01 @AC-5
  Scenario: A challenge without a base recipe says so
    Given "Banana bread" is unlocked
    And "Banana bread" has no base recipe written yet
    When I open the "Banana bread" page
    Then the "Base recipe" section shows "No base recipe written yet."

  @US-01
  Scenario: A challenge that doesn't exist shows a not found page
    When I go to the page of a challenge that doesn't exist
    Then I see a "not found" page
