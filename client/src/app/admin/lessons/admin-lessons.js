angular.module('admin-lessons', [
  'resources.lessons',
  'resources.users',
  'resources.results',
  'services.crud',
  'security.authorization'
])

.config(['crudRouteProvider', 'securityAuthorizationProvider', function (crudRouteProvider, securityAuthorizationProvider) {

  var getAllLessons = ['Lessons', '$route', function(Lessons, $route){
    return Lessons.all();
  }];

  crudRouteProvider.routesFor('Lessons', 'admin')
    .whenList({
      lessons: ['Lessons', function(Lessons) { return Lessons.all(); }],
      adminUser: securityAuthorizationProvider.requireAdminUser
    })
    .whenNew({
      lesson: ['Lessons', function(Lessons) { return new Lessons(); }],
      adminUser: securityAuthorizationProvider.requireAdminUser
    })
    .whenEdit({
      lesson: ['Lessons', 'Users', '$route', function(Lessons, Users, $route) { return Lessons.getById($route.current.params.itemId); }],
      adminUser: securityAuthorizationProvider.requireAdminUser
    });
}])

.controller('LessonsListCtrl', ['$scope', 'crudListMethods', 'lessons', function($scope, crudListMethods, lessons) {
  $scope.lessons = lessons;

  angular.extend($scope, crudListMethods('/admin/lessons'));
}])

.controller('LessonsEditCtrl', ['$scope', '$location', 'i18nNotifications', 'users', 'lesson', function($scope, $location, i18nNotifications, users, lesson) {

  $scope.lesson = lesson;

  $scope.onSave = function(lesson) {
    i18nNotifications.pushForNextRoute('crud.lesson.save.success', 'success', {id : lesson.$id()});
    $location.path('/admin/lessons');
  };

  $scope.onError = function() {
    i18nNotifications.pushForCurrentRoute('crud.lesson.save.error', 'error');
  };
}]);
