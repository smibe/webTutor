angular.module('admin-results', [
  'resources.lessons',
  'resources.users',
  'resources.results',
  'services.crud',
  'security.authorization'
])

.config(['crudRouteProvider', 'securityAuthorizationProvider', function (crudRouteProvider, securityAuthorizationProvider) {

  var getAllUsers = ['Lessons', 'Users', '$route', function(Lessons, Users, $route){
    return Users.all();
  }];

  crudRouteProvider.routesFor('Results', 'admin')
    .whenList({
      results: ['Results', function(Results) { return Results.all(); }],
      adminUser: securityAuthorizationProvider.requireAuthenticatedUser
    });
}])

.controller('ResultsListCtrl', ['$scope', 'Users', 'Lessons', 'crudListMethods', 'results', function($scope, Users, Lessons, crudListMethods, results) {
  
   var users = {};
  var lessons = {};

  $scope.getUser = function(id, cb) {
    if (id == null) {
      return;
    }
    var user = users[id];
    if (user != null) {
      cb(user);
    }
    Users.getById(id, cb);
  };
 $scope.getLesson = function(id, cb) {
    if (id == null) {
      return;
    }
    var lesson = lessons[id];
    if (lesson != null) {
      cb(lesson);
    }
    Lessons.getById(id, cb);
  };
  
  $scope.setUser = function(result) {
      $scope.getUser(result.userId, function(user) {
        if (user != null) {
          result.user = user.firstName;
          users[user.id] = user;
        }
      });    
  };
  
  $scope.setLesson = function(result) {
      $scope.getLesson(result.lessonId, function (lesson) {
        if (lesson != null) {
          result.lesson = lesson.name;
          lessons[lesson.id] = lesson;
        }
      });
  };
  
  $scope.getUsedTime = function(result) {
    return Math.round(result.timeUsed / 1000);
  };
  
  $scope.getDate = function(result) {
    if (result.date == null) {
      return "";
    }
    var date = new Date(result.date);
    return date.toLocaleString();    
  };

  $scope.getAll = function () {
    for (var i = 0; i < results.length; i++) {
      var result = results[i];

      $scope.setUser(result);
      $scope.setLesson(result);
    }
    return results;
  };  
   $scope.remove = function(result, $index, $event) {
    // Don't let the click bubble up to the ng-click on the enclosing div, which will try to trigger
    // an edit of this item.
    $event.stopPropagation();

    // Remove this user
    result.$remove(function() {
      // It is gone from the DB so we can remove it from the local list too
      $scope.results.splice($index,1);
      i18nNotifications.pushForCurrentRoute('crud.result.remove.success', 'success', {id : result.$id()});
    }, function() {
      i18nNotifications.pushForCurrentRoute('crud.result.remove.error', 'error', {id : result.$id()});
    });
  };

  $scope.results = $scope.getAll();
  angular.extend($scope, crudListMethods('/admin/results'));

}]);