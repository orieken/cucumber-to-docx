Feature: Odd scenarios for testing edge cases

  Scenario: passing a data table in login
    Given User is on the Login Page
    When User enters the following credentials
      | username | password |
      | testuser | secret123 |
    And User clicks the login button
    Then Message displayed Login Successfully 
    And User is redirected to the Home Page

  Scenario Outline: making simple api calls
  Given I have a payload for <api_endpoint_name>
  When I make a <http_method> to the url <apiRoute>
  Then I should get a status code of <status_code>
  And the response should contain valid data

  Examples:
      | api_endpoint_name | http_method | apiRoute | status_code |
      | GetUserData       | GET         | /user    | 200         |
      | CreatePost        | POST        | /post    | 201         |  
      | DeleteComment     | DELETE      | /comment | 204         |
  
  Scenario: passing a single-row data table
    Given User is on the Landing Page
    When User enters the following in the search box
      | abc | 123 |
    And User clicks the search button
    Then Message displayed Search Successfully 
    And there are results are displayed

  Scenario: multiple steps with different data tables
    Given User is on the Registration Page
    When User enters the following personal information
      | firstName | lastName | email |
      | John      | Doe      | john.doe@example.com |
      | Jane      | Smith    | jane.smith@example.com |
    And User selects the following preferences
      | newsletter | notifications |
      | true       | false         |
    And User enters payment details
      | cardNumber | cvv | expiryDate |
      | 4111111111111111 | 123 | 12/25 |
      | 5500000000000004 | 456 | 06/26 |
    Then Account should be created successfully
    And User should receive a confirmation email