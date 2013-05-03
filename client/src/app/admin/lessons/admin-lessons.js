angular.module('admin-lessons', [
  'resources.lessons',
  'resources.users',
  'services.crud',
  'security.authorization'
])

.config(['crudRouteProvider', 'securityAuthorizationProvider', function (crudRouteProvider, securityAuthorizationProvider) {

  var getAllUsers = ['Lessons', 'Users', '$route', function(Lessons, Users, $route){
    return Users.all();
  }];

  crudRouteProvider.routesFor('Lessons', 'admin')
    .whenList({
      lessons: ['Lessons', function(Lessons) { return Lessons.all(); }],
      adminUser: securityAuthorizationProvider.requireAdminUser
    })
    .whenNew({
      lesson: ['Lessons', function(Lessons) { return new Lessons(); }],
      users: getAllUsers,
      adminUser: securityAuthorizationProvider.requireAdminUser
    })
    .whenEdit({
      lesson: ['Lessons', 'Users', '$route', function(Lessons, Users, $route) { return Lessons.getById($route.current.params.itemId); }],
      users: getAllUsers,
      adminUser: securityAuthorizationProvider.requireAdminUser
    });
}])

.controller('LessonsListCtrl', ['$scope', 'crudListMethods', 'lessons', function($scope, crudListMethods, lessons) {
  $scope.lessons = lessons;

  angular.extend($scope, crudListMethods('/admin/lessons'));
}])

.controller('LessonsEditCtrl', ['$scope', '$location', 'i18nNotifications', 'users', 'lesson', function($scope, $location, i18nNotifications, users, lesson) {

  $scope.lesson = lesson;

  $scope.users = users;
  //prepare users lookup, just keep references for easier lookup
  $scope.usersLookup = {};
  angular.forEach(users, function(value, key) {
    $scope.usersLookup[value.$id()] = value;
  });

  $scope.onSave = function(lesson) {
    i18nNotifications.pushForNextRoute('crud.lesson.save.success', 'success', {id : lesson.$id()});
    $location.path('/admin/lessons');
  };

  $scope.onError = function() {
    i18nNotifications.pushForCurrentRoute('crud.lesson.save.error', 'error');
  };
}]);