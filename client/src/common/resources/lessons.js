angular.module('resources.lessons', ['mongolabResource']);
angular.module('resources.lessons').factory('Lessons', ['mongolabResource', function (mongoResource) {

  var results = mongoResource('lessons');

  return results;
}]);
