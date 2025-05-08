Feature: DemoReport

  Scenario: Load initial set of data
    Given provided all the feature level parameters from file

  @simple-get @csvson-example @ep
  Scenario: Read user infos - Example - api call
    Given a user perform a api action
    And add request with given header params
      | contentType | application/json |
    When a user get application/json in /persons/bgates resource on ep
    Then the status code is 200
    And verify api response csvson includes in the response
      | dateOfBirth,firstName,lastName,lastTimeOnline,spokenLanguages/additionalProp1:additionalProp2:additionalProp3,username |
      | 1955-10-28,Bill,Gates,2020-08-30T20:28:36.267Z,Tamil:English:Spanish,bgates                                            |

  @test_empty @queryparam @single-field-validation @ep
  Scenario: Read pet by customer by query params - api call
    Given a user perform a api action
    And add request with given query params
      | tags | validateEmpty |
    And add request with given header params
      | contentType | application/json |
    When a user get application/json in /pets/findByTags resource on ep
    Then the status code is 200
    And verify api response csvson includes in the response
      | id,name, category/id:name,status |
      | i~201,,i~200:Bulldog,available   |
    And verify across response includes following in the response
      | status | available |

  @test_null @queryparam @ep
  Scenario: Read pet by customer by query params - api call
    Given a user perform a api action
    And add request with given query params
      | tags | validateNull |
    And add request with given header params
      | contentType | application/json |
    When a user get application/json in /pets/findByTags resource on ep
    Then the status code is 200
    And verify api response csvson includes in the response
      | id,category/id:name,status    |
      | i~201,i~200:Bulldog,available |
    And verify across response includes following in the response
      | name==null | true      |
      | status     | available |
