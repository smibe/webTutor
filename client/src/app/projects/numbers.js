angular.module('numbers', [
    'resources.lessons',
    'resources.results',
    'services.crud'
    ])

.config(['$routeProvider', 'crudRouteProvider', function ($routeProvider, crudRouteProvider) {
  $routeProvider.when('/numbers', {
    templateUrl:'projects/numbers.tpl.html',
    controller:'MathNumbersCtrl'
  });
}])

.controller('MathNumbersCtrl', ['$scope', 'Results', 'security', '$location', function ($scope, Results, security, $location) {
    $scope.operators = ["+", "-"];
    $scope.operator = $scope.operators[0];
    $scope.a = Math.floor(Math.random() * 1000);
    $scope.b = Math.floor(Math.random() * 1000);
    $scope.result = -1;
    $scope.okCount = 0;
    $scope.newResult = null;
    $scope.errorCount = 0;
    $scope.startDate = new Date();
    
    $scope.newValues = function(){
        if ($scope.startDate == null)
        {
          $scope.startDate = new Date();
        }
          
        $scope.a = Math.floor(Math.random() * 1000);
        $scope.b = Math.floor(Math.random() * 1000);
        $scope.operator = $scope.operators[Math.floor(Math.random() * 2)];
        $scope.result = -1;
        if ($scope.operator === "-" && $scope.a < $scope.b) {
            var temp = $scope.a;
            $scope.a = $scope.b;
            $scope.b = temp;
        }
    };
    
    $scope.calculate = function calculate() {
        if ($scope.operator === "-"){
            return $scope.a - $scope.b;
        }
        return $scope.a + $scope.b;
    };
    
    $scope.checkResult = function() {
        return $scope.result === $scope.calculate();
    };
    $scope.resultText = function resultText() {
        if ($scope.result === $scope.calculate()){
            return "richtig";
        }
        if ($scope.result === null){
            return "";
        }
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
    
    $scope.storeResult = function storeResult() {
      var result = new Results();
      result.lessonId = '51832df8e4b05ae7fdf2efe7';
      result.userId = security.currentUser.id;
      result.okCount = $scope.okCount;
      result.errorCount = $scope.errorCount;
      result.date = new Date();
      
      if ($scope.startDate != null) {
        result.timeUsed = result.date - $scope.startDate;
      }
      result.$save(saveSuccess, saveError);
    };
      var saveSuccess = function(result) {
        $scope.errorCount = 0;
        $scope.okCount = 0;
        $scope.startDate = null;
      };
    var saveError = function() {
    };
}]);
