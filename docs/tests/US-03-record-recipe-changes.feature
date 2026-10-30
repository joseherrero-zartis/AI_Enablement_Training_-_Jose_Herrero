Feature: US-03 Record recipe changes for an attempt
  As a home baker
  I want to note what I changed in the recipe for an attempt, and how it turned out
  So that I learn which adjustments actually improve my bakes

  Background:
    Given "Banana bread" is unlocked

  @US-03 @AC-1
  Scenario: The form starts with a "Recipe changes (optional)" section and no rows
    When I open the "Banana bread" page
    Then the "Log attempt" form has a "Recipe changes (optional)" section
    And the section has no change rows
    And I can add a recipe change

  @US-03 @AC-1
  Scenario: Logging an attempt with a change and its outcome
    Given I am on the "Banana bread" page
    When I add a recipe change "hydration 65% → 70%" with the outcome "more open crumb"
    And I choose an overall rating of 4
    And I submit the form
    Then the attempt is saved with that change

  @US-03 @AC-1
  Scenario: A change needs only a description
    Given I am on the "Banana bread" page
    When I add a recipe change "less sugar" and leave the outcome empty
    And I choose an overall rating of 3
    And I submit the form
    Then the attempt is saved with the change "less sugar"

  @US-03 @AC-1
  Scenario: Logging an attempt with no changes works as before
    Given I am on the "Banana bread" page
    When I choose an overall rating of 4
    And I submit the form
    Then the attempt is saved
    And it shows no recipe changes

  @US-03 @AC-2
  Scenario: Removing a row before submitting
    Given I am on the "Banana bread" page
    And I have added two recipe changes, "less sugar" and "more salt"
    When I remove the first change
    And I choose an overall rating of 4
    And I submit the form
    Then only "more salt" is saved with the attempt

  @US-03 @AC-2
  Scenario: Removing a row after a rejected attempt keeps each other row's own text
    Given I am on the "Banana bread" page
    And I have added the changes "less sugar" with the outcome "denser", "more salt" with no outcome, and an empty row
    And I have submitted the form without an overall rating
    When I remove the first change
    Then the form shows "more salt" with no outcome, and an empty row
    When I choose an overall rating of 4
    And I submit the form
    Then only "more salt" is saved with the attempt

  @US-03 @AC-2
  Scenario: An error stays with its own row when I remove another row
    Given I am on the "Banana bread" page
    And I have added a change with only the outcome "denser", and a change "more salt"
    And I have submitted the form with an overall rating of 4
    And I see "Describe the change, or remove this row." under the first change
    When I remove the first change
    Then the change "more salt" shows no error

  @US-03 @AC-2
  Scenario: The form has no change rows after a successful submit
    Given I am on the "Banana bread" page
    And I have added a recipe change "less sugar"
    When I choose an overall rating of 4
    And I submit the form
    Then the form shows no recipe change rows

  @US-03 @AC-3
  Scenario: A rejected attempt saves nothing and keeps my changes in the form
    Given I am on the "Banana bread" page
    When I add a recipe change "less sugar" with the outcome "denser"
    And I submit the form without an overall rating
    Then I see the message "Choose an overall rating from 1 to 5."
    And no attempt is added to the attempts list
    And the change "less sugar" with the outcome "denser" is still in the form

  @US-03 @AC-4
  Scenario: A blank change row is not saved
    Given I am on the "Banana bread" page
    When I add a recipe change and leave both fields empty
    And I choose an overall rating of 4
    And I submit the form
    Then the attempt is saved
    And it shows no recipe changes

  @US-03 @AC-4
  Scenario: An outcome without a description is rejected
    Given I am on the "Banana bread" page
    When I add a recipe change with the outcome "denser" and no description
    And I choose an overall rating of 4
    And I submit the form
    Then I see the message "Describe the change, or remove this row."
    And no attempt is added to the attempts list

  @US-03 @AC-5
  Scenario: Saved changes appear under their attempt
    Given I have logged an attempt with the change "hydration 65% → 70%" and the outcome "more open crumb"
    When I open the "Banana bread" page
    Then the attempt shows "hydration 65% → 70% → more open crumb"

  @US-03 @AC-5
  Scenario: A change without an outcome shows only its description
    Given I have logged an attempt with the change "less sugar" and no outcome
    When I open the "Banana bread" page
    Then the attempt shows "less sugar" with no arrow or outcome
