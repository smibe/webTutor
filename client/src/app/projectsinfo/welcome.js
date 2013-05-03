angular.module('welcome', [], ['$routeProvider', function($routeProvider){

  $routeProvider.when('/welcomePage', {
    templateUrl:'projectsinfo/welcome.tpl.html',
    controller:'WelcomeCtrl',
    resolve:{
      lessons:['Lessons', function(Lessons){
        return Lessons.all();
      }]
    }
  });
}]);

angular.module('welcome').controller('WelcomeCtrl', ['$scope', 'lessons', function($scope, lessons){
  $scope.lessons = lessons;
}]);