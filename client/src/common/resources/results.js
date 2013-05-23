angular.module('resources.results', ['mongolabResource', 'resources.users', 'resources.lessons']);
angular.module('resources.results').factory('Results', ['mongolabResource', 'Users', 'Lessons', function (mongoResource, Users, Lessons) {

  var results = mongoResource('results');
  results.forTest = function (testId, userId) {
    return results.query({userId:userId});
  };
  

  return results;
}]);

