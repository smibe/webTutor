angular.module('dashboard', ['resources.lessons', 'resources.tasks'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl:'dashboard/dashboard.tpl.html',
    controller:'DashboardCtrl'
  });
}])

.controller('DashboardCtrl', ['$scope', '$location', function ($scope, $location) {
}]);