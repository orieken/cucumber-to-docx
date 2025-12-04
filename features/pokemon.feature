Feature: Register a new pokemon to user account

  Trainers want to be able to register new pokemon to their user accounts so that they can keep track of their collection.
  when new pokemon are registered, they should be associated with the correct user account and stored in the users library.
  A user can have multiple active pokemon teams, a pokemon is not active unless it is assigned to one of the teams.

    Scenario: Register a new pokemon to user account
        Given I am a user with an active account
        And I am visiting "http://www.pokemin-trainer.hq"
        And on the pokeminHQ login enter username "AshKetchum"
        And on the pokeminHQ login enter password "Pikachu123"
        And I click on the "Login" button
        And I get redirected to the user dashboard
        When I navigate to the "Add Pokemon" section
        And I enter "Pikachu" in the "Pokemon Name" field
        And I select "Electric" from the "Type" dropdown
        And I enter "25" in the "Level" field
        And I click on the "Register Pokemon" button
        Then I should see a confirmation message "Pokemon registered successfully!"
        And the new pokemon "Pikachu" should be listed in my pokemon library
        And the pokemon "Pikachu" should not be assigned to any active team
      
    Scenario: Register a new pokemon and assign to active team
        Given I am a user with an active account
        And I am visiting "http://www.pokemin-trainer.hq"
        And on the pokeminHQ login enter username "AshKetchum"
        And on the pokeminHQ login enter password "Pikachu123"
        And I click on the "Login" button
        And I get redirected to the user dashboard
        When I navigate to the "Add Pokemon" section
        And I enter "Charizard" in the "Pokemon Name" field
        And I select "Fire/Flying" from the "Type" dropdown
        And I enter "36" in the "Level" field
        And I select "Team Alpha" from the "Assign to Team" dropdown
        And I click on the "Register Pokemon" button
        Then I should see a confirmation message "Pokemon registered successfully!"
        And the new pokemon "Charizard" should be listed in my pokemon library
        And the pokemon "Charizard" should be assigned to the active team "Team Alpha"
