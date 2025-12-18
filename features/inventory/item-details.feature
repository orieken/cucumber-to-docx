Feature: Item details
    As a shopper
    I want to view item details on the demo web app
    So that I can see more information about a product

    Background:
        Given the demo web app is running
        And I am on the demo shop home page
        And I have a product selected

    Scenario: View item details from home page
        When I click on the first product's details link
        Then I should see the product details page with name, price, and description