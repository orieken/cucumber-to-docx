Feature: Background Test

  Background: Setup the database
    Given I have a clean database
    And I insert some default data

  Scenario: A simple scenario
    When I query the data
    Then I should see the default data
