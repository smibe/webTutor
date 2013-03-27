angular.module('numbers', ['resources.projects'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/numbers', {
    templateUrl:'projects/numbers.tpl.html',
    controller:'MathNumbersCtrl',
  });
}])

.controller('MathNumbersCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.operators = ["+", "-"];
    $scope.operator = $scope.operators[0];
    $scope.a = Math.floor(Math.random() * 1000);
    $scope.b = Math.floor(Math.random() * 1000);
    $scope.result = -1;
    $scope.okCount = 0;
    $scope.errorCount = 0;
    
    $scope.newValues = function(){
        $scope.a = Math.floor(Math.random() * 1000);
        $scope.b = Math.floor(Math.random() * 1000);
        $scope.operator = $scope.operators[Math.floor(Math.random() * 2)];
        $scope.result = -1;
        if ($scope.operator == "-" && $scope.a < $scope.b) {
            var temp = $scope.a;
            $scope.a = $scope.b;
            $scope.b = temp;
        }
    };
    
    $scope.calculate = function calculate() {
        if ($scope.operator == "-"){
            return $scope.a - $scope.b;
        }
        return $scope.a + $scope.b;
    };
    
    $scope.checkResult = function() {
        return $scope.result == $scope.calculate();
    };
    $scope.resultText = function resultText() {
        if ($scope.result == $scope.calculate()){
            return "richtig";
        }
        if ($scope.result === null)
            return "";
        return "";
    };
    
    $scope.submit = function submit() {
        if ($scope.checkResult()){
            $scope.okCount++;
        }
        else {
            $scope.errorCount++; 
        }
        $scope.newValues();
    };
}]);
