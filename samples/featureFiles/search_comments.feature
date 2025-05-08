Feature: Searching comments
  As an user of the typicode API
  I want to be able to search posts comments
  In order to know user's opinions

    Example: Fetch all the comments made using a given email
      Given Ricardo wants to get all the comments made by an user using his email
      When He searches for the comments made with email "Jennings_Pouros@erica.biz"
      Then He should get a list of the comments found by the search query

    Example: Fetch all the comments made with a given name
      Given Ricardo wants to get all the comments made by an user using his name
      When He searches for the comments made with name "qui quidem sed"
      Then He should get a list of the comments found by the search query

    Example: When no comments matches the search query an empty list should be returned
      Given Ricardo wants to get all the comments made by an user using his email
      When He searches for the comments made with email "non_existing_mail@test.com"
      Then He should get an empty list of comments

    Example: Fetch the comments made to a post given its id using query parameter
      Given Ricardo wants to get all the comments made to a post using a query parameter search strategy
      When He searches for the comments made with postId "17"
      Then He should get a list of the comments found by the search query

    Scenario: Search comments made to a post given its ID using nested queries
      Given Ricardo wants to get all the comments made to a post using a nested query strategy
      When He searches for the comments made with postId "27"
      Then He should get a list of the comments found by the search query

    Example: Fetch all the comments made to the posts created by an user given his username
      Given Ricardo wants to get all the comments made to the posts of an user
      When He searches for the comments made to the posts of the user with username "Delphine"
      Then He should get all the comments made to the posts of the user

    Example: Fetch all the comments made to the posts created by an user given his name
      Given Ricardo wants to get all the comments made to the posts of an user
      When He searches for the comments made to the posts of the user with name "Clementina DuBuque"
      Then He should get all the comments made to the posts of the user

    Example: Fetch the information of an existing comment given its ID
      Given Ricardo wants to get the comment of a post
      When He searches for the comment with ID "35"
      Then He should get the information of the comment

    Example: Fetch the information of a non-existing comment
      Given Ricardo wants to get the comment of a post
      When He searches for the comment with ID "35454"
      Then He should get a not found response