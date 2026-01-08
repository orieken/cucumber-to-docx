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
  