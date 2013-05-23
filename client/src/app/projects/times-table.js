angular.module('timesTable', ['resources.projects'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/timesTable', {
    templateUrl:'projects/times-table.tpl.html',
    controller:'TimesTableCtrl'
  });
}])

.controller('TimesTableCtrl', ['$scope', 'Results', 'security', '$location', function ($scope, Results, security, $location) {
    $scope.operators = ["*"];
    $scope.operator = $scope.operators[0];
    $scope.a = Math.floor(Math.random() * 10);
    $scope.b = Math.floor(Math.random() * 10);
    $scope.result = -1;
    $scope.okCount = 0;
    $scope.errorCount = 0;
    $scope.startDate = new Date();
    
    $scope.newValues = function(){
        if ($scope.startDate == null)
        {
          $scope.startDate = new Date();
        }
        
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
        if ($scope.result === $scope.calculate()){
            return "richtig";
        }

        if ($scope.result === null){
            return "";
        }
        return "";
    };
    
    $scope.submit = function submit() {
        if ($scope.result === $scope.calculate()){
            $scope.okCount++;
        }
        else {
            $scope.errorCount++; 
        }
        $scope.newValues();
    };
    $scope.storeResult = function storeResult() {
      var result = new Results();
      result.lessonId = '51832e10e4b05ae7fdf2efee';
      result.userId = security.currentUser.id;
      result.okCount = $scope.okCount;
      result.errorCount = $scope.errorCount;
      result.date = new Date();
      
      if ($scope.startDate != null) {
        result.timeUsed = result.date.getTime() - $scope.startDate.getTime();
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
