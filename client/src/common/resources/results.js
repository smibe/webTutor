angular.module('resources.results', ['mongolabResource']);
angular.module('resources.results').factory('Results', ['mongolabResource', function (mongoResource) {

  var results = mongoResource('results');
  results.forTest = function (testId, userId) {
    return results.query({userId:userId});
  };

  return results;
}]);

