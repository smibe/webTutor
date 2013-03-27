angular.module('welcome', [], ['$routeProvider', function($routeProvider){

  $routeProvider.when('/welcomePage', {
    templateUrl:'projectsinfo/welcome.tpl.html',
    controller:'WelcomeCtrl',
    resolve:{
      projects:['Projects', function(Projects){
        return Projects.all();
      }]
    }
  });
}]);

angular.module('welcome').controller('WelcomeCtrl', ['$scope', 'projects', function($scope, projects){
  $scope.projects = projects;
}]);