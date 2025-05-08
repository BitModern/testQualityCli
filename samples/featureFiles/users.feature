@Users
Feature: LS-519 - Check the correct behaviour of the add user functionality
    As a user
    I want to verify add user functionality

    Background: User enter on lansweeper home page and go to Users from Configuration navigation menu.
        Given I login
            And I click on "Configuration" icon from main menu
            And I click on "Users" from navigation menu

    # ADD
    Scenario: I as a user want to click on Add new user and I will see Add User page
        When I click on "Add new user" from navigation menu
        Then I should be at the userName-"configuration/users/add" page

    Scenario: I as a user I want to add a new user with only required fields populated and i will see it on the user list
        Given I click on "Add new user" from navigation menu
            And I fill "email" field with "qaTester@yopmail.com"
            And I fill "first_name" field with "qaTesterName"
        When I click on Save Changes button from user form
        Then I should see "qaTester@yopmail.com" in the user list

    # Needs to be active only when it is not possible to create multiple users with same name as otherwise it forces manual management 
    Scenario: (FIX LS-1167) I as a user want to add the same user that before added and I will not be able to add it and I will continue in the users/add page        
        When I click on "Add new user" from navigation menu
            And I fill "email" field with "qaTester@yopmail.com"
            And I fill "first_name" field with "qaTesterName"
        When I click on Save Changes button from user form
        Then I should be at the userName-"configuration/users/add" page

    Scenario: I as a user want to add a new user with all fields populated and i will see it on the user list
        When I click on "Add new user" from navigation menu
            And I fill "first_name" field with "qaTester2FirstName"
            And I fill "last_name" field with "qaTester2 Last name"
            And I fill "title" field with "qaTester2 Title"
            And I fill "email" field with "qaTester2@yopmail.com"
        # And I fill on "roleList" field with "Administrator"
        # And I click on "roleList" field
        # And I fill on "groupList" field with "Administrator"
        When I click on Save Changes button from user form
        Then I should see "qaTester2@yopmail.com" in the user list
            And I should see "qaTester2FirstName qaTester2 Last name" in the user list
            And I should see "qaTester2 Title" in the user list

    Scenario: I as a user want to add a new user without fill required fields and i will see a error
        Given I click on "Add new user" from navigation menu        
        When I click on Save Changes button from user form
        Then I see "Please enter a valid email!" error message

    Scenario: I as a user want to open Add a new user form and then click on cross button and I will back to user page
        When I click on "Add new user" from navigation menu
            And I click on cross button from edit user view
        Then I should be at the userName-"configuration/users" page

    # EDIT
    Scenario: (FIX LS-1399) I as a user want to edit a user and then I will see the changes on the user list
        When I click on edit action from "users" list of the "qaTester2FirstName" item
            And I fill "first_name" field with "Edit"
            And I fill "last_name" field with "Edit"
            And I fill "title" field with "Edit"
        When I click on Save Changes button from user form
        Then I should be at the userName-"configuration/users" page
            And I should see "qaTester2FirstNameEdit qaTester2 Last nameEdit" in the user list
            And I should see "qaTester2 TitleEdit" in the user list

    Scenario: I as a user want to edit a user and then click on cross button and I will back to user page
        When I click on edit action from "users" list of the "qaTester2FirstNameEdit qaTester2 Last nameEdit" item
            And I click on cross button from edit user view
        Then I should be at the userName-"configuration/users" page

    # DELETE
    Scenario: I as a user want to open delete modal and click NO then I will see that this user appears on user list yet
        When I click on delete action from "users" list of the "qaTester2FirstNameEdit qaTester2 Last nameEdit" item
            And I click on "No" from modal Are you sure you want to delete this "user"?
        Then I should see "qaTester2FirstNameEdit qaTester2 Last nameEdit" in the user list

    Scenario: I as a user want to delete the user and then I to see that this user is missing in the list
        When I click on delete action from "users" list of the "qaTester2FirstNameEdit qaTester2 Last nameEdit" item
            And I click on "Yes" from modal Are you sure you want to delete this "user"?
        Then I should not see "qaTester2FirstNameEdit qaTester2 Last nameEdit" in the user list

    Scenario: (FIX-by LS1167) I as a user want to delete a user
        When I click on delete action from "users" list of the "qaTesterName" item
            And I click on "Yes" from modal Are you sure you want to delete this "user"?
        Then I should not see "qaTesterName" in the user list