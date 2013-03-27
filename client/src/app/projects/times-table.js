angular.module('timesTable', ['resources.projects'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/timesTable', {
    templateUrl:'projects/times-table.tpl.html',
    controller:'TimesTableCtrl',
  });
}])

.controller('TimesTableCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.operators = ["*"];
    $scope.operator = $scope.operators[0];
    $scope.a = Math.floor(Math.random() * 10);
    $scope.b = Math.floor(Math.random() * 10);
    $scope.result = -1;
    $scope.okCount = 0;
    $scope.errorCount = 0;
    
    $scope.newValues = function(){
        $scope.a = Math.floor(Math.random() * 10);
        $scope.b = Math.floor(Math.random() * 10);
        $scope.result = -1;
    };
    
    $scope.haveErrors = function() {
        return $scope.errorCount > 0;
    };
    
    $scope.calculate = function calculate() {
        return $scope.a * $scope.b;
    };
    $scope.resultText = function resultText() {
        if ($scope.result == $scope.calculate())
            return "richtig";

        if ($scope.result === null)
            return "";
        return "";
    };
    
    $scope.submit = function submit() {
        if ($scope.result == $scope.calculate()){
            $scope.okCount++;
        }
        else {
            $scope.errorCount++; 
        }
        $scope.newValues();
    };
}]);
