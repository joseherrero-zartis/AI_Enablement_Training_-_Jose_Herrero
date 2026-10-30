Feature: US-02 Log a baking attempt
  As a home baker
  I want to log an attempt at a challenge with the date, my notes and a rating
  So that I keep a record of how each bake went

  Background:
    Given "Banana bread" is unlocked and has no attempts

  @US-02 @AC-1
  Scenario: An unlocked challenge has a "Log attempt" form
    When I open the "Banana bread" page
    Then I see a "Log attempt" form
    And the form asks for a date, notes, an overall rating, and taste, texture and appearance ratings
    And the date is today's date
    And only the overall rating is required

  @US-02 @AC-2
  Scenario: A valid attempt appears on the challenge page straight away
    Given I am on the "Banana bread" page
    When I fill in an overall rating of 4 and some notes
    And I submit the form
    Then I see the message "Attempt logged for" followed by the date of the bake
    And the attempt appears in the attempts list without me reloading the page
    And it shows the date, the notes and the rating "Overall 4/5"
    And the form is empty again, with today's date

  @US-02 @AC-2
  Scenario: A logged attempt is still there after restarting the app
    Given I have logged an attempt for "Banana bread"
    When I restart the app
    And I open the "Banana bread" page
    Then the attempt is still in the attempts list

  @US-02 @AC-2
  Scenario: Optional ratings are shown when I give them
    Given I am on the "Banana bread" page
    When I fill in an overall rating of 4, a taste rating of 5 and a texture rating of 3
    And I submit the form
    Then the attempt shows the taste and texture ratings

  @US-02 @AC-3
  Scenario: An attempt without an overall rating is rejected
    Given I am on the "Banana bread" page
    When I fill in some notes but leave the overall rating empty
    And I submit the form
    Then I see the message "Choose an overall rating from 1 to 5."
    And no attempt is added to the attempts list
    And my notes are still in the form

  @US-02 @AC-3
  Scenario: An overall rating outside 1 to 5 is rejected
    Given I am on the "Banana bread" page
    When I submit the form with an overall rating of 6
    Then I see the message "Choose an overall rating from 1 to 5."
    And no attempt is added to the attempts list

  @US-02 @AC-3
  Scenario: An optional rating outside 1 to 5 is rejected
    Given I am on the "Banana bread" page
    When I submit the form with an overall rating of 4 and a taste rating of 7
    Then I see the message "Taste rating must be from 1 to 5."
    And no attempt is added to the attempts list

  @US-02 @AC-3
  Scenario: My ratings are kept when the attempt is rejected
    Given I am on the "Banana bread" page
    When I fill in an overall rating of 4 and a taste rating of 5
    And I submit the form with a date that isn't valid
    Then I see the message "Enter a valid date."
    And the ratings still show 4 and 5

  @US-02 @AC-3
  Scenario: An attempt without a date is rejected
    Given I am on the "Banana bread" page
    When I clear the date and choose an overall rating of 4
    And I submit the form
    Then I see the message "Enter a valid date."
    And no attempt is added to the attempts list

  @US-02 @AC-3
  Scenario: An impossible date is rejected
    Given "Banana bread" is unlocked
    When an attempt for 30 February 2026 is sent without using the page
    Then I see the message "Enter a valid date."
    And no attempt is added to the attempts list

  @US-02 @AC-4
  Scenario: A locked challenge refuses an attempt even if the form is skipped
    Given "Chocolate chip cookies" is locked
    When an attempt for "Chocolate chip cookies" is sent without using the page
    Then I am told the challenge is locked
    And no attempt is added to "Chocolate chip cookies"

  @US-02 @AC-4
  Scenario: A locked challenge page has no form
    Given "Chocolate chip cookies" is locked
    When I go straight to the "Chocolate chip cookies" page by its address
    Then I don't see a "Log attempt" form

  @US-02 @AC-5
  Scenario: The first attempt changes the status to In progress
    Given "Banana bread" shows the status "Not started"
    When I log an attempt with an overall rating of 3
    Then "Banana bread" shows the status "In progress"
