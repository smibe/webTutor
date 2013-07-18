/*! angular-app - v0.0.1-SNAPSHOT - 2013-05-23
 * https://github.com/angular-app/angular-app
 * Copyright (c) 2013 Pawel Kozlowski & Peter Bacon Darwin;
 * Licensed MIT
 */
angular.module('admin', ['admin-lessons', 'admin-users', 'admin-results']);

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
angular.module('admin-users-edit',['services.crud', 'services.i18nNotifications', 'resources.users'])

.controller('UsersEditCtrl', ['$scope', '$location', 'i18nNotifications', 'user', function ($scope, $location, i18nNotifications, user) {

  $scope.user = user;
  $scope.password = user.password;

  $scope.onSave = function (user) {
    i18nNotifications.pushForNextRoute('crud.user.save.success', 'success', {id : user.$id()});
    $location.path('/admin/users');
  };

  $scope.onError = function() {
    i18nNotifications.pushForCurrentRoute('crud.user.save.error', 'error');
  };

  $scope.onRemove = function(user) {
    i18nNotifications.pushForNextRoute('crud.user.remove.success', 'success', {id : user.$id()});
    $location.path('/admin/users');
  };

}])

/**
 * A validation directive to ensure that the model contains a unique email address
 * @param  Users service to provide access to the server's user database
  */
.directive('uniqueEmail', ["Users", function (Users) {
  return {
    require:'ngModel',
    restrict:'A',
    link:function (scope, el, attrs, ctrl) {

      //TODO: We need to check that the value is different to the original
      
      //using push() here to run it as the last parser, after we are sure that other validators were run
      ctrl.$parsers.push(function (viewValue) {

        if (viewValue) {
          Users.query({email:viewValue}, function (users) {
            if (users.length === 0) {
              ctrl.$setValidity('uniqueEmail', true);
            } else {
              ctrl.$setValidity('uniqueEmail', false);
            }
          });
          return viewValue;
        }
      });
    }
  };
}])

/**
 * A validation directive to ensure that this model has the same value as some other
 */
.directive('validateEquals', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {

      function validateEqual(myValue, otherValue) {
        if (myValue === otherValue) {
          ctrl.$setValidity('equal', true);
          return myValue;
        } else {
          ctrl.$setValidity('equal', false);
          return undefined;
        }
      }

      scope.$watch(attrs.validateEquals, function(otherModelValue) {
        ctrl.$setValidity('equal', ctrl.$viewValue === otherModelValue);
      });

      ctrl.$parsers.push(function(viewValue) {
        return validateEqual(viewValue, scope.$eval(attrs.validateEquals));
      });

      ctrl.$formatters.push(function(modelValue) {
        return validateEqual(modelValue, scope.$eval(attrs.validateEquals));
      });
    }
  };
});
angular.module('admin-users', ['admin-users-edit', 'services.crud', 'services.i18nNotifications', 'directives.gravatar'])

.config(['crudRouteProvider', 'securityAuthorizationProvider', function (crudRouteProvider, securityAuthorizationProvider) {

  crudRouteProvider.routesFor('Users', 'admin')
    .whenList({
      users: ['Users', function(Users) { return Users.all(); }],
      currentUser: securityAuthorizationProvider.requireAdminUser
    })
    .whenNew({
      user: ['Users', function(Users) { return new Users(); }],
      currentUser: securityAuthorizationProvider.requireAdminUser
    })
    .whenEdit({
      user:['$route', 'Users', function ($route, Users) {
        return Users.getById($route.current.params.itemId);
      }],
      currentUser: securityAuthorizationProvider.requireAdminUser
    });
}])

.controller('UsersListCtrl', ['$scope', 'crudListMethods', 'users', 'i18nNotifications', function ($scope, crudListMethods, users, i18nNotifications) {
  $scope.users = users;

  angular.extend($scope, crudListMethods('/admin/users'));

  $scope.remove = function(user, $index, $event) {
    // Don't let the click bubble up to the ng-click on the enclosing div, which will try to trigger
    // an edit of this item.
    $event.stopPropagation();

    // Remove this user
    user.$remove(function() {
      // It is gone from the DB so we can remove it from the local list too
      $scope.users.splice($index,1);
      i18nNotifications.pushForCurrentRoute('crud.user.remove.success', 'success', {id : user.$id()});
    }, function() {
      i18nNotifications.pushForCurrentRoute('crud.user.remove.error', 'error', {id : user.$id()});
    });
  };
}]);
angular.module('app', [
  'welcome',
  'dashboard',
  'timesTable',
  'numbers',
  'admin',
  'services.breadcrumbs',
  'services.i18nNotifications',
  'services.httpRequestTracker',
  'security',
  'directives.crud',
  'templates.app',
  'templates.common']);

angular.module('app').constant('MONGOLAB_CONFIG', {
  baseUrl: '/databases/',
  dbName: 'angular-test'
});

//TODO: move those messages to a separate module
angular.module('app').constant('I18N.MESSAGES', {
  'errors.route.changeError':'Route change error',
  'crud.user.save.success':"A user with id '{{id}}' was saved successfully.",
  'crud.user.remove.success':"A user with id '{{id}}' was removed successfully.",
  'crud.user.remove.error':"Something went wrong when removing user with id '{{id}}'.",
  'crud.user.save.error':"Something went wrong when saving a user...",
  'crud.lesson.save.success':"A project with id '{{id}}' was saved successfully.",
  'crud.lesson.remove.success':"A project with id '{{id}}' was removed successfully.",
  'crud.lesson.save.error':"Something went wrong when saving a project...",
  'login.reason.notAuthorized':"You do not have the necessary access permissions.  Do you want to login as someone else?",
  'login.reason.notAuthenticated':"You must be logged in to access this part of the application.",
  'login.error.invalidCredentials': "Login failed.  Please check your credentials and try again.",
  'login.error.serverError': "There was a problem with authenticating: {{exception}}."
});

angular.module('app').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.otherwise({redirectTo:'/welcomePage'});
}]);

angular.module('app').run(['security', function(security) {
  // Get the current user when the application starts
  // (in case they are still logged in from a previous session)
  security.requestCurrentUser();
}]);

angular.module('app').controller('AppCtrl', ['$scope', 'i18nNotifications', 'localizedMessages', function($scope, i18nNotifications) {

  $scope.notifications = i18nNotifications;

  $scope.removeNotification = function (notification) {
    i18nNotifications.remove(notification);
  };

  $scope.$on('$routeChangeError', function(event, current, previous, rejection){
    i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
  });
}]);

angular.module('app').controller('HeaderCtrl', ['$scope', '$location', '$route', 'security', 'breadcrumbs', 'notifications', 'httpRequestTracker',
  function ($scope, $location, $route, security, breadcrumbs, notifications, httpRequestTracker) {
  $scope.location = $location;
  $scope.breadcrumbs = breadcrumbs;

  $scope.isAuthenticated = security.isAuthenticated;
  $scope.isAdmin = security.isAdmin;

  $scope.home = function () {
    if (security.isAuthenticated()) {
      $location.path('/dashboard');
    } else {
      $location.path('/welcomePage');
    }
  };

  $scope.isNavbarActive = function (navBarPath) {
    return navBarPath === breadcrumbs.getFirst().name;
  };

  $scope.hasPendingRequests = function () {
    return httpRequestTracker.hasPendingRequests();
  };
}]);

angular.module('dashboard', ['resources.lessons', 'resources.tasks'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl:'dashboard/dashboard.tpl.html',
    controller:'DashboardCtrl'
  });
}])

.controller('DashboardCtrl', ['$scope', '$location', function ($scope, $location) {
}]);
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
angular.module('directives.crud', ['directives.crud.buttons', 'directives.crud.edit']);

angular.module('directives.crud.buttons', [])

.directive('crudButtons', function () {
  return {
    restrict:'E',
    replace:true,
    template:
      '<div>' +
      '  <button type="button" class="btn btn-primary save" ng-disabled="!canSave()" ng-click="save()">Speichern</button>' +
      '  <button type="button" class="btn btn-warning revert" ng-click="revertChanges()" ng-disabled="!canRevert()">Abbrechen</button>'+
      '  <button type="button" class="btn btn-danger remove" ng-click="remove()" ng-show="canRemove()">L&ouml;schen</button>'+
      '</div>'
  };
});
angular.module('directives.crud.edit', [])

// Apply this directive to an element at or below a form that will manage CRUD operations on a resource.
// - The resource must expose the following instance methods: $saveOrUpdate(), $id() and $remove()
.directive('crudEdit', ['$parse', function($parse) {
  return {
    // We ask this directive to create a new child scope so that when we add helper methods to the scope
    // it doesn't make a mess of the parent scope.
    // - Be aware that if you write to the scope from within the form then you must remember that there is a child scope at the point
    scope: true,
    // We need access to a form so we require a FormController from this element or a parent element
    require: '^form',
    // This directive can only appear as an attribute
    link: function(scope, element, attrs, form) {
      // We extract the value of the crudEdit attribute
      // - it should be an assignable expression evaluating to the model (resource) that is going to be edited
      var resourceGetter = $parse(attrs.crudEdit);
      var resourceSetter = resourceGetter.assign;
      // Store the resource object for easy access
      var resource = resourceGetter(scope);
      // Store a copy for reverting the changes
      var original = angular.copy(resource);

      var checkResourceMethod = function(methodName) {
        if ( !angular.isFunction(resource[methodName]) ) {
          throw new Error('crudEdit directive: The resource must expose the ' + methodName + '() instance method');
        }
      };
      checkResourceMethod('$saveOrUpdate');
      checkResourceMethod('$id');
      checkResourceMethod('$remove');

      // This function helps us extract the callback functions from the directive attributes
      var makeFn = function(attrName) {
        var fn = scope.$eval(attrs[attrName]);
        if ( !angular.isFunction(fn) ) {
          throw new Error('crudEdit directive: The attribute "' + attrName + '" must evaluate to a function');
        }
        return fn;
      };
      // Set up callbacks with fallback
      // onSave attribute -> onSave scope -> noop
      var userOnSave = attrs.onSave ? makeFn('onSave') : ( scope.onSave || angular.noop );
      var onSave = function(result, status, headers, config) {
        // Reset the original to help with reverting and pristine checks
        original = result;
        userOnSave(result, status, headers, config);
      };
      // onRemove attribute -> onRemove scope -> onSave attribute -> onSave scope -> noop
      var onRemove = attrs.onRemove ? makeFn('onRemove') : ( scope.onRemove || onSave );
      // onError attribute -> onError scope -> noop
      var onError = attrs.onError ? makeFn('onError') : ( scope.onError || angular.noop );

      // The following functions should be triggered by elements on the form
      // - e.g. ng-click="save()"
      scope.save = function() {
        resource.$saveOrUpdate(onSave, onSave, onError, onError);
      };
      scope.revertChanges = function() {
        resource = angular.copy(original);
        resourceSetter(scope, resource);
      };
      scope.remove = function() {
        if(resource.$id()) {
          resource.$remove(onRemove, onError);
        } else {
          onRemove();
        }
      };

      // The following functions can be called to modify the behaviour of elements in the form
      // - e.g. ng-disable="!canSave()"
      scope.canSave = function() {
        return form.$valid && !angular.equals(resource, original);
      };
      scope.canRevert = function() {
        return !angular.equals(resource, original);
      };
      scope.canRemove = function() {
        return resource.$id();
      };
      /**
       * Get the CSS classes for this item, to be used by the ng-class directive
       * @param {string} fieldName The name of the field on the form, for which we want to get the CSS classes
       * @return {object} A hash where each key is a CSS class and the corresponding value is true if the class is to be applied.
       */
      scope.getCssClasses = function(fieldName) {
        var ngModelContoller = form[fieldName];
        return {
          error: ngModelContoller.$invalid && !angular.equals(resource, original),
          success: ngModelContoller.$valid && !angular.equals(resource, original)
        };
      };
      /**
       * Whether to show an error message for the specified error
       * @param {string} fieldName The name of the field on the form, of which we want to know whether to show the error
       * @param  {string} error - The name of the error as given by a validation directive
       * @return {Boolean} true if the error should be shown
       */
      scope.showError = function(fieldName, error) {
        return form[fieldName].$error[error];
      };
    }
  };
}]);
angular.module('directives.gravatar', [])

// A simple directive to display a gravatar image given an email
.directive('gravatar', ['md5', function(md5) {

  return {
    restrict: 'E',
    template: '<img ng-src="http://www.gravatar.com/avatar/{{hash}}{{getParams}}"/>',
    replace: true,
    scope: {
      email: '=',
      size: '=',
      defaultImage: '=',
      forceDefault: '='
    },
    link: function(scope, element, attrs) {
      scope.options = {};
      scope.$watch('email', function(email) {
        if ( email ) {
          scope.hash = md5(email.trim().toLowerCase());
        }
      });
      scope.$watch('size', function(size) {
        scope.options.s = (angular.isNumber(size)) ? size : undefined;
        generateParams();
      });
      scope.$watch('forceDefault', function(forceDefault) {
        scope.options.f = forceDefault ? 'y' : undefined;
        generateParams();
      });
      scope.$watch('defaultImage', function(defaultImage) {
        scope.options.d = defaultImage ? defaultImage : undefined;
        generateParams();
      });
      function generateParams() {
        var options = [];
        scope.getParams = '';
        angular.forEach(scope.options, function(value, key) {
          if ( value ) {
            options.push(key + '=' + encodeURIComponent(value));
          }
        });
        if ( options.length > 0 ) {
          scope.getParams = '?' + options.join('&');
        }
      }
    }
  };
}])

.factory('md5', function() {
  function md5cycle(x, k) {
    var a = x[0],
      b = x[1],
      c = x[2],
      d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);

  }

  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }

  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }

  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  function md51(s) {
    txt = '';
    var n = s.length,
      state = [1732584193, -271733879, -1732584194, 271733878],
      i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    }
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) {
        tail[i] = 0;
      }
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  /* there needs to be support for Unicode here,
   * unless we pretend that we can redefine the MD-5
   * algorithm for multi-byte characters (perhaps
   * by adding every four 16-bit characters and
   * shortening the sum to 32 bits). Otherwise
   * I suggest performing MD-5 as if every character
   * was two bytes--e.g., 0040 0025 = @%--but then
   * how will an ordinary MD-5 sum be matched?
   * There is no way to standardize text to something
   * like UTF-8 before transformation; speed cost is
   * utterly prohibitive. The JavaScript standard
   * itself needs to look at this: it should start
   * providing access to strings as preformed UTF-8
   * 8-bit unsigned value arrays.
   */

  function md5blk(s) { /* I figured global was faster.   */
    var md5blks = [],
      i; /* Andy King said do it this way. */
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  var hex_chr = '0123456789abcdef'.split('');

  function rhex(n) {
    var s = '', j = 0;
    for (; j < 4; j++) {
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
    }
    return s;
  }

  function hex(x) {
    for (var i = 0; i < x.length; i++) {
      x[i] = rhex(x[i]);
    }
    return x.join('');
  }

  function md5(s) {
    return hex(md51(s));
  }

  /* this function is much faster,
  so if possible we use it. Some IEs
  are the only ones I know of that
  need the idiotic second function,
  generated by an if clause.  */

  add32 = function(a, b) {
    return (a + b) & 0xFFFFFFFF;
  };

  if (md5('hello') !== '5d41402abc4b2a76b9719d911017c592') {
    add32 = function (x, y) {
      var lsw = (x & 0xFFFF) + (y & 0xFFFF),
        msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xFFFF);
    };
  }

  return md5;
});
angular.module('directives.modal', []).directive('modal', ['$parse',function($parse) {
  var backdropEl;
  var body = angular.element(document.getElementsByTagName('body')[0]);
  var defaultOpts = {
    backdrop: true,
    escape: true
  };
  return {
    restrict: 'ECA',
    link: function(scope, elm, attrs) {
      var opts = angular.extend(defaultOpts, scope.$eval(attrs.uiOptions || attrs.bsOptions || attrs.options));
      var shownExpr = attrs.modal || attrs.show;
      var setClosed;

      if (attrs.close) {
        setClosed = function() {
          scope.$apply(attrs.close);
        };
      } else {
        setClosed = function() {
          scope.$apply(function() {
            $parse(shownExpr).assign(scope, false);
          });
        };
      }
      elm.addClass('modal');

      if (opts.backdrop && !backdropEl) {
        backdropEl = angular.element('<div class="modal-backdrop"></div>');
        backdropEl.css('display','none');
        body.append(backdropEl);
      }

      function setShown(shown) {
        scope.$apply(function() {
          model.assign(scope, shown);
        });
      }

      function escapeClose(evt) {
        if (evt.which === 27) { setClosed(); }
      }
      function clickClose() {
        setClosed();
      }

      function close() {
        if (opts.escape) { body.unbind('keyup', escapeClose); }
        if (opts.backdrop) {
          backdropEl.css('display', 'none').removeClass('in');
          backdropEl.unbind('click', clickClose);
        }
        elm.css('display', 'none').removeClass('in');
        body.removeClass('modal-open');
      }
      function open() {
        if (opts.escape) { body.bind('keyup', escapeClose); }
        if (opts.backdrop) {
          backdropEl.css('display', 'block').addClass('in');
          backdropEl.bind('click', clickClose);
        }
        elm.css('display', 'block').addClass('in');
        body.addClass('modal-open');
      }

      scope.$watch(shownExpr, function(isShown, oldShown) {
        if (isShown) {
          open();
        } else {
          close();
        }
      });
    }
  };
}]);

angular.module('resources.productbacklog', ['mongolabResource']);
angular.module('resources.productbacklog').factory('ProductBacklog', ['mongolabResource', function (mongolabResource) {
  var ProductBacklog = mongolabResource('productbacklog');

  ProductBacklog.forProject = function (projectId) {
    return ProductBacklog.query({projectId:projectId});
  };

  return ProductBacklog;
}]);

angular.module('resources.lessons', ['mongolabResource']);
angular.module('resources.lessons').factory('Lessons', ['mongolabResource', function (mongoResource) {

  var results = mongoResource('lessons');

  return results;
}]);

angular.module('resources.projects', ['mongolabResource']);
angular.module('resources.projects').factory('Projects', ['mongolabResource', function ($mongolabResource) {

  var Projects = $mongolabResource('projects');

  Projects.forUser = function(userId, successcb, errorcb) {
    //TODO: get projects for this user only (!)
    return Projects.query({}, successcb, errorcb);
  };

  Projects.prototype.isProductOwner = function (userId) {
    return this.productOwner === userId;
  };
  Projects.prototype.canActAsProductOwner = function (userId) {
    return !this.isScrumMaster(userId) && !this.isDevTeamMember(userId);
  };
  Projects.prototype.isScrumMaster = function (userId) {
    return this.scrumMaster === userId;
  };
  Projects.prototype.canActAsScrumMaster = function (userId) {
    return !this.isProductOwner(userId);
  };
  Projects.prototype.isDevTeamMember = function (userId) {
    return this.teamMembers.indexOf(userId) >= 0;
  };
  Projects.prototype.canActAsDevTeamMember = function (userId) {
    return !this.isProductOwner(userId);
  };

  Projects.prototype.getRoles = function (userId) {
    var roles = [];
    if (this.isProductOwner(userId)) {
      roles.push('PO');
    } else {
      if (this.isScrumMaster(userId)){
        roles.push('SM');
      }
      if (this.isDevTeamMember(userId)){
        roles.push('DEV');
      }
    }
    return roles;
  };

  return Projects;
}]);
angular.module('resources.results', ['mongolabResource', 'resources.users', 'resources.lessons']);
angular.module('resources.results').factory('Results', ['mongolabResource', 'Users', 'Lessons', function (mongoResource, Users, Lessons) {

  var results = mongoResource('results');
  results.forTest = function (testId, userId) {
    return results.query({userId:userId});
  };
  

  return results;
}]);


angular.module('resources.sprints', ['mongolabResource']);
angular.module('resources.sprints').factory('Sprints', ['mongolabResource', function (mongolabResource) {

  var Sprints = mongolabResource('sprints');
  Sprints.forProject = function (projectId) {
    return Sprints.query({projectId:projectId});
  };
  return Sprints;
}]);
angular.module('resources.tasks', ['mongolabResource']);
angular.module('resources.tasks').factory('Tasks', ['mongolabResource', function (mongolabResource) {

  var Tasks = mongolabResource('tasks');

  Tasks.statesEnum = ['TODO', 'IN_DEV', 'BLOCKED', 'IN_TEST', 'DONE'];

  Tasks.forProductBacklogItem = function (productBacklogItem) {
    return Tasks.query({productBacklogItem:productBacklogItem});
  };

  Tasks.forSprint = function (sprintId) {
    return Tasks.query({sprintId:sprintId});
  };

  Tasks.forUser = function (userId) {
    return Tasks.query({userId:userId});
  };

  Tasks.forProject = function (projectId) {
    return Tasks.query({projectId:projectId});
  };

  return Tasks;
}]);
angular.module('resources.users', ['mongolabResource']);
angular.module('resources.users').factory('Users', ['mongolabResource', function (mongoResource) {

  var userResource = mongoResource('users');
  userResource.prototype.getFullName = function () {
    return this.lastName + " " + this.firstName + " (" + this.email + ")";
  };

  return userResource;
}]);

angular.module('security.authorization', ['security.service'])

// This service provides guard methods to support AngularJS routes.
// You can add them as resolves to routes to require authorization levels
// before allowing a route change to complete
.provider('securityAuthorization', {

  requireAdminUser: ['securityAuthorization', function(securityAuthorization) {
    return securityAuthorization.requireAdminUser();
  }],

  requireAuthenticatedUser: ['securityAuthorization', function(securityAuthorization) {
    return securityAuthorization.requireAuthenticatedUser();
  }],

  $get: ['security', 'securityRetryQueue', function(security, queue) {
    var service = {

      // Require that there is an authenticated user
      // (use this in a route resolve to prevent non-authenticated users from entering that route)
      requireAuthenticatedUser: function() {
        var promise = security.requestCurrentUser().then(function(userInfo) {
          if ( !security.isAuthenticated() ) {
            return queue.pushRetryFn('unauthenticated-client', service.requireAuthenticatedUser);
          }
        });
        return promise;
      },

      // Require that there is an administrator logged in
      // (use this in a route resolve to prevent non-administrators from entering that route)
      requireAdminUser: function() {
        var promise = security.requestCurrentUser().then(function(userInfo) {
          if ( !security.isAdmin() ) {
            return queue.pushRetryFn('unauthorized-client', service.requireAdminUser);
          }
        });
        return promise;
      }

    };

    return service;
  }]
});
// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security', [
  'security.service',
  'security.interceptor',
  'security.login',
  'security.authorization']);

angular.module('security.interceptor', ['security.retryQueue'])

// This http interceptor listens for authentication failures
.factory('securityInterceptor', ['$injector', 'securityRetryQueue', function($injector, queue) {
  return function(promise) {
    // Intercept failed requests
    return promise.then(null, function(originalResponse) {
      if(originalResponse.status === 401) {
        // The request bounced because it was not authorized - add a new request to the retry queue
        promise = queue.pushRetryFn('unauthorized-server', function retryRequest() {
          // We must use $injector to get the $http service to prevent circular dependency
          return $injector.get('$http')(originalResponse.config);
        });
      }
      return promise;
    });
  };
}])

// We have to add the interceptor to the queue as a string because the interceptor depends upon service instances that are not available in the config block.
.config(['$httpProvider', function($httpProvider) {
  $httpProvider.responseInterceptors.push('securityInterceptor');
}]);
angular.module('security.login.form', ['services.localizedMessages'])

// The LoginFormController provides the behaviour behind a reusable form to allow users to authenticate.
// This controller and its template (login/form.tpl.html) are used in a modal dialog box by the security service.
.controller('LoginFormController', ['$scope', 'security', 'localizedMessages', function($scope, security, localizedMessages) {
  // The model for this form 
  $scope.user = {};

  // Any error message from failing to login
  $scope.authError = null;

  // The reason that we are being asked to login - for instance because we tried to access something to which we are not authorized
  // We could do something diffent for each reason here but to keep it simple...
  $scope.authReason = null;
  if ( security.getLoginReason() ) {
    $scope.authReason = ( security.isAuthenticated() ) ?
      localizedMessages.get('login.reason.notAuthorized') :
      localizedMessages.get('login.reason.notAuthenticated');
  }

  // Attempt to authenticate the user specified in the form's model
  $scope.login = function() {
    // Clear any previous security errors
    $scope.authError = null;

    // Try to login
    security.login($scope.user.email, $scope.user.password).then(function(loggedIn) {
      if ( !loggedIn ) {
        // If we get here then the login failed due to bad credentials
        $scope.authError = localizedMessages.get('login.error.invalidCredentials');
      }
    }, function(x) {
      // If we get here then there was a problem with the login request to the server
      $scope.authError = localizedMessages.get('login.error.serverError', { exception: x });
    });
  };

  $scope.clearForm = function() {
    user = {};
  };

  $scope.cancelLogin = function() {
    security.cancelLogin();
  };
}]);
angular.module('security.login', ['security.login.form', 'security.login.toolbar']);
angular.module('security.login.toolbar', [])

// The loginToolbar directive is a reusable widget that can show login or logout buttons
// and information the current authenticated user
.directive('loginToolbar', ['security', function(security) {
  var directive = {
    templateUrl: 'security/login/toolbar.tpl.html',
    restrict: 'E',
    replace: true,
    scope: true,
    link: function($scope, $element, $attrs, $controller) {
      $scope.isAuthenticated = security.isAuthenticated;
      $scope.login = security.showLogin;
      $scope.logout = security.logout;
      $scope.$watch(function() {
        return security.currentUser;
      }, function(currentUser) {
        $scope.currentUser = currentUser;
      });
    }
  };
  return directive;
}]);
angular.module('security.retryQueue', [])

// This is a generic retry queue for security failures.  Each item is expected to expose two functions: retry and cancel.
.factory('securityRetryQueue', ['$q', '$log', function($q, $log) {
  var retryQueue = [];
  var service = {
    // The security service puts its own handler in here!
    onItemAddedCallbacks: [],
    
    hasMore: function() {
      return retryQueue.length > 0;
    },
    push: function(retryItem) {
      retryQueue.push(retryItem);
      // Call all the onItemAdded callbacks
      angular.forEach(service.onItemAddedCallbacks, function(cb) {
        try {
          cb(retryItem);
        } catch(e) {
          $log.error('securityRetryQueue.push(retryItem): callback threw an error' + e);
        }
      });
    },
    pushRetryFn: function(reason, retryFn) {
      // The reason parameter is optional
      if ( arguments.length === 1) {
        retryFn = reason;
        reason = undefined;
      }

      // The deferred object that will be resolved or rejected by calling retry or cancel
      var deferred = $q.defer();
      var retryItem = {
        reason: reason,
        retry: function() {
          // Wrap the result of the retryFn into a promise if it is not already
          $q.when(retryFn()).then(function(value) {
            // If it was successful then resolve our deferred
            deferred.resolve(value);
          }, function(value) {
            // Othewise reject it
            deferred.reject(value);
          });
        },
        cancel: function() {
          // Give up on retrying and reject our deferred
          deferred.reject();
        }
      };
      service.push(retryItem);
      return deferred.promise;
    },
    retryReason: function() {
      return service.hasMore() && retryQueue[0].reason;
    },
    cancelAll: function() {
      while(service.hasMore()) {
        retryQueue.shift().cancel();
      }
    },
    retryAll: function() {
      while(service.hasMore()) {
        retryQueue.shift().retry();
      }
    }
  };
  return service;
}]);

// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security.service', [
  'security.retryQueue',    // Keeps track of failed requests that need to be retried once the user logs in
  'security.login',         // Contains the login form template and controller
  'ui.bootstrap.dialog'     // Used to display the login form as a modal dialog.
])

.factory('security', ['$http', '$q', '$location', 'securityRetryQueue', '$dialog', function($http, $q, $location, queue, $dialog) {

  // Redirect to the given url (defaults to '/')
  function redirect(url) {
    url = url || '/';
    $location.path(url);
  }

  // Login form dialog stuff
  var loginDialog = null;
  function openLoginDialog() {
    if ( !loginDialog ) {
      loginDialog = $dialog.dialog();
      loginDialog.open('security/login/form.tpl.html', 'LoginFormController').then(onLoginDialogClose);
    }
  }
  function closeLoginDialog(success) {
    if (loginDialog) {
      loginDialog.close(success);
      loginDialog = null;
    }
  }
  function onLoginDialogClose(success) {
    if ( success ) {
      queue.retryAll();
    } else {
      queue.cancelAll();
      redirect();
    }
  }

  // Register a handler for when an item is added to the retry queue
  queue.onItemAddedCallbacks.push(function(retryItem) {
    if ( queue.hasMore() ) {
      service.showLogin();
    }
  });

  // The public API of the service
  var service = {

    // Get the first reason for needing a login
    getLoginReason: function() {
      return queue.retryReason();
    },

    // Show the modal login dialog
    showLogin: function() {
      openLoginDialog();
    },

    // Attempt to authenticate a user by the given email and password
    login: function(email, password) {
      var request = $http.post('/login', {email: email, password: password});
      return request.then(function(response) {
        service.currentUser = response.data.user;
        if ( service.isAuthenticated() ) {
          closeLoginDialog(true);
        }
      });
    },

    // Give up trying to login and clear the retry queue
    cancelLogin: function() {
      closeLoginDialog(false);
      redirect();
    },

    // Logout the current user and redirect
    logout: function(redirectTo) {
      $http.post('/logout').then(function() {
        service.currentUser = null;
        redirect(redirectTo);
      });
    },

    // Ask the backend to see if a user is already authenticated - this may be from a previous session.
    requestCurrentUser: function() {
      if ( service.isAuthenticated() ) {
        return $q.when(service.currentUser);
      } else {
        return $http.get('/current-user').then(function(response) {
          service.currentUser = response.data.user;
          return service.currentUser;
        });
      }
    },

    // Information about the current user
    currentUser: null,

    // Is the current user authenticated?
    isAuthenticated: function(){
      return !!service.currentUser;
    },
    
    // Is the current user an adminstrator?
    isAdmin: function() {
      return !!(service.currentUser && service.currentUser.admin);
    }
  };

  return service;
}]);
angular.module('services.breadcrumbs', []);
angular.module('services.breadcrumbs').factory('breadcrumbs', ['$rootScope', '$location', function($rootScope, $location){

  var breadcrumbs = [];
  var breadcrumbsService = {};

  //we want to update breadcrumbs only when a route is actually changed
  //as $location.path() will get updated imediatelly (even if route change fails!)
  $rootScope.$on('$routeChangeSuccess', function(event, current){

    var pathElements = $location.path().split('/'), result = [], i;
    var breadcrumbPath = function (index) {
      return '/' + (pathElements.slice(0, index + 1)).join('/');
    };

    pathElements.shift();
    for (i=0; i<pathElements.length; i++) {
      result.push({name: pathElements[i], path: breadcrumbPath(i)});
    }

    breadcrumbs = result;
  });

  breadcrumbsService.getAll = function() {
    return breadcrumbs;
  };

  breadcrumbsService.getFirst = function() {
    return breadcrumbs[0] || {};
  };

  return breadcrumbsService;
}]);
angular.module('services.crud', ['services.crudRouteProvider']);
angular.module('services.crud').factory('crudEditMethods', function () {

  return function (itemName, item, formName, successcb, errorcb) {

    var mixin = {};

    mixin[itemName] = item;
    mixin[itemName+'Copy'] = angular.copy(item);

    mixin.save = function () {
      this[itemName].$saveOrUpdate(successcb, successcb, errorcb, errorcb);
    };

    mixin.canSave = function () {
      return this[formName].$valid && !angular.equals(this[itemName], this[itemName+'Copy']);
    };

    mixin.revertChanges = function () {
      this[itemName] = angular.copy(this[itemName+'Copy']);
    };

    mixin.canRevert = function () {
      return !angular.equals(this[itemName], this[itemName+'Copy']);
    };

    mixin.remove = function () {
      if (this[itemName].$id()) {
        this[itemName].$remove(successcb, errorcb);
      } else {
        successcb();
      }
    };

    mixin.canRemove = function() {
      return item.$id();
    };

    /**
     * Get the CSS classes for this item, to be used by the ng-class directive
     * @param {string} fieldName The name of the field on the form, for which we want to get the CSS classes
     * @return {object} A hash where each key is a CSS class and the corresponding value is true if the class is to be applied.
     */
    mixin.getCssClasses = function(fieldName) {
      var ngModelContoller = this[formName][fieldName];
      return {
        error: ngModelContoller.$invalid && ngModelContoller.$dirty,
        success: ngModelContoller.$valid && ngModelContoller.$dirty
      };
    };

    /**
     * Whether to show an error message for the specified error
     * @param {string} fieldName The name of the field on the form, of which we want to know whether to show the error
     * @param  {string} error - The name of the error as given by a validation directive
     * @return {Boolean} true if the error should be shown
     */
    mixin.showError = function(fieldName, error) {
      return this[formName][fieldName].$error[error];
    };

    return mixin;
  };
});

angular.module('services.crud').factory('crudListMethods', ['$location', function ($location) {

  return function (pathPrefix) {

    var mixin = {};

    mixin['new'] = function () {
      $location.path(pathPrefix+'/new');
    };

    mixin['edit'] = function (itemId) {
      $location.path(pathPrefix+'/'+itemId);
    };

    return mixin;
  };
}]);
(function() {

  function crudRouteProvider($routeProvider) {

    // This $get noop is because at the moment in AngularJS "providers" must provide something
    // via a $get method.
    // When AngularJS has "provider helpers" then this will go away!
    this.$get = angular.noop;

    // Again, if AngularJS had "provider helpers" we might be able to return `routesFor()` as the
    // crudRouteProvider itself.  Then we would have a much cleaner syntax and not have to do stuff
    // like:
    //
    // ```
    // myMod.config(function(crudRouteProvider) {
    //   var routeProvider = crudRouteProvider.routesFor('MyBook', '/myApp');
    // });
    // ```
    //
    // but instead have something like:
    //
    //
    // ```
    // myMod.config(function(crudRouteProvider) {
    //   var routeProvider = crudRouteProvider('MyBook', '/myApp');
    // });
    // ```
    //
    // In any case, the point is that this function is the key part of this "provider helper".
    // We use it to create routes for CRUD operations.  We give it some basic information about
    // the resource and the urls then it it returns our own special routeProvider.
    this.routesFor = function(resourceName, urlPrefix, routePrefix) {
      var baseUrl = urlPrefix + '/' + resourceName.toLowerCase();
      routePrefix = routePrefix || urlPrefix;
      var baseRoute = '/' + routePrefix + '/' + resourceName.toLowerCase();

      // Create the templateUrl for a route to our resource that does the specified operation.
      var templateUrl = function(operation) {
        return baseUrl + '/' + resourceName.toLowerCase() +'-'+operation.toLowerCase()+'.tpl.html';
      };
      // Create the controller name for a route to our resource that does the specified operation.
      var controllerName = function(operation) {
        return resourceName + operation +'Ctrl';
      };

      // This is the object that our `routesFor()` function returns.  It decorates `$routeProvider`,
      // delegating the `when()` and `otherwise()` functions but also exposing some new functions for
      // creating CRUD routes.  Specifically we have `whenList(), `whenNew()` and `whenEdit()`.
      var routeBuilder = {
        // Create a route that will handle showing a list of items
        whenList: function(resolveFns) {
          routeBuilder.when(baseRoute, {
            templateUrl: templateUrl('List'),
            controller: controllerName('List'),
            resolve: resolveFns
          });
          return routeBuilder;
        },
        // Create a route that will handle creating a new item
        whenNew: function(resolveFns) {
          routeBuilder.when(baseRoute +'/new', {
            templateUrl: templateUrl('Edit'),
            controller: controllerName('Edit'),
            resolve: resolveFns
          });
          return routeBuilder;
        },
        // Create a route that will handle editing an existing item
        whenEdit: function(resolveFns) {
          routeBuilder.when(baseRoute+'/:itemId', {
            templateUrl: templateUrl('Edit'),
            controller: controllerName('Edit'),
            resolve: resolveFns
          });
          return routeBuilder;
        },
        // Pass-through to `$routeProvider.when()`
        when: function(path, route) {
          $routeProvider.when(path, route);
          return routeBuilder;
        },
        // Pass-through to `$routeProvider.otherwise()`
        otherwise: function(params) {
          $routeProvider.otherwise(params);
          return routeBuilder;
        },
        // Access to the core $routeProvider.
        $routeProvider: $routeProvider
      };
      return routeBuilder;
    };
  }
  // Currently, v1.0.3, AngularJS does not provide annotation style dependencies in providers so,
  // we add our injection dependencies using the $inject form
  crudRouteProvider.$inject = ['$routeProvider'];

  // Create our provider - it would be nice to be able to do something like this instead:
  //
  // ```
  // angular.module('services.crudRouteProvider', [])
  //   .configHelper('crudRouteProvider', ['$routeProvider, crudRouteProvider]);
  // ```
  // Then we could dispense with the $get, the $inject and the closure wrapper around all this.
  angular.module('services.crudRouteProvider', []).provider('crudRoute', crudRouteProvider);
})();
angular.module('services.exceptionHandler', ['services.i18nNotifications']);

angular.module('services.exceptionHandler').factory('exceptionHandlerFactory', ['$injector', function($injector) {
  return function($delegate) {

    return function (exception, cause) {
      // Lazy load notifications to get around circular dependency
      //Circular dependency: $rootScope <- notifications <- i18nNotifications <- $exceptionHandler
      var i18nNotifications = $injector.get('i18nNotifications');

      // Pass through to original handler
      $delegate(exception, cause);

      // Push a notification error
      i18nNotifications.pushForCurrentRoute('error.fatal', 'error', {}, {
        exception:exception,
        cause:cause
      });
    };
  };
}]);

angular.module('services.exceptionHandler').config(['$provide', function($provide) {
  $provide.decorator('$exceptionHandler', ['$delegate', 'exceptionHandlerFactory', function ($delegate, exceptionHandlerFactory) {
    return exceptionHandlerFactory($delegate);
  }]);
}]);

angular.module('services.httpRequestTracker', []);
angular.module('services.httpRequestTracker').factory('httpRequestTracker', ['$http', function($http){

  var httpRequestTracker = {};
  httpRequestTracker.hasPendingRequests = function() {
    return $http.pendingRequests.length > 0;
  };

  return httpRequestTracker;
}]);
angular.module('services.i18nNotifications', ['services.notifications', 'services.localizedMessages']);
angular.module('services.i18nNotifications').factory('i18nNotifications', ['localizedMessages', 'notifications', function (localizedMessages, notifications) {

  var prepareNotification = function(msgKey, type, interpolateParams, otherProperties) {
     return angular.extend({
       message: localizedMessages.get(msgKey, interpolateParams),
       type: type
     }, otherProperties);
  };

  var I18nNotifications = {
    pushSticky:function (msgKey, type, interpolateParams, otherProperties) {
      return notifications.pushSticky(prepareNotification(msgKey, type, interpolateParams, otherProperties));
    },
    pushForCurrentRoute:function (msgKey, type, interpolateParams, otherProperties) {
      return notifications.pushForCurrentRoute(prepareNotification(msgKey, type, interpolateParams, otherProperties));
    },
    pushForNextRoute:function (msgKey, type, interpolateParams, otherProperties) {
      return notifications.pushForNextRoute(prepareNotification(msgKey, type, interpolateParams, otherProperties));
    },
    getCurrent:function () {
      return notifications.getCurrent();
    },
    remove:function (notification) {
      return notifications.remove(notification);
    }
  };

  return I18nNotifications;
}]);
angular.module('services.localizedMessages', []).factory('localizedMessages', ['$interpolate', 'I18N.MESSAGES', function ($interpolate, i18nmessages) {

  var handleNotFound = function (msg, msgKey) {
    return msg || '?' + msgKey + '?';
  };

  return {
    get : function (msgKey, interpolateParams) {
      var msg =  i18nmessages[msgKey];
      if (msg) {
        return $interpolate(msg)(interpolateParams);
      } else {
        return handleNotFound(msg, msgKey);
      }
    }
  };
}]);
angular.module('services.notifications', []).factory('notifications', ['$rootScope', function ($rootScope) {

  var notifications = {
    'STICKY' : [],
    'ROUTE_CURRENT' : [],
    'ROUTE_NEXT' : []
  };
  var notificationsService = {};

  var addNotification = function (notificationsArray, notificationObj) {
    if (!angular.isObject(notificationObj)) {
      throw new Error("Only object can be added to the notification service");
    }
    notificationsArray.push(notificationObj);
    return notificationObj;
  };

  $rootScope.$on('$routeChangeSuccess', function () {
    notifications.ROUTE_CURRENT.length = 0;

    notifications.ROUTE_CURRENT = angular.copy(notifications.ROUTE_NEXT);
    notifications.ROUTE_NEXT.length = 0;
  });

  notificationsService.getCurrent = function(){
    return [].concat(notifications.STICKY, notifications.ROUTE_CURRENT);
  };

  notificationsService.pushSticky = function(notification) {
    return addNotification(notifications.STICKY, notification);
  };

  notificationsService.pushForCurrentRoute = function(notification) {
    return addNotification(notifications.ROUTE_CURRENT, notification);
  };

  notificationsService.pushForNextRoute = function(notification) {
    return addNotification(notifications.ROUTE_NEXT, notification);
  };

  notificationsService.remove = function(notification){
    angular.forEach(notifications, function (notificationsByType) {
      var idx = notificationsByType.indexOf(notification);
      if (idx>-1){
        notificationsByType.splice(idx,1);
      }
    });
  };

  notificationsService.removeAll = function(){
    angular.forEach(notifications, function (notificationsByType) {
      notificationsByType.length = 0;
    });
  };

  return notificationsService;
}]);
angular.module('templates.app', ['admin/lessons/lessons-edit.tpl.html', 'admin/lessons/lessons-list.tpl.html', 'admin/results/results-list.tpl.html', 'admin/users/users-edit.tpl.html', 'admin/users/users-list.tpl.html', 'dashboard/dashboard.tpl.html', 'header.tpl.html', 'notifications.tpl.html', 'projects/numbers.tpl.html', 'projects/times-table.tpl.html', 'projectsinfo/welcome.tpl.html']);

angular.module("admin/lessons/lessons-edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("admin/lessons/lessons-edit.tpl.html",
    "<div class=\"well\">" +
    "    <form name=\"form\" crud-edit=\"lesson\">" +
    "        <legend>Lesson</legend>" +
    "        <div class=\"row-fluid\">" +
    "            <div class=\"span6\">" +
    "                <label>Name</label>" +
    "                <input type=\"text\" name=\"name\" ng-model=\"lesson.name\" class=\"span10\" required autofocus>" +
    "                <label>Description</label>" +
    "                <textarea rows=\"10\" cols=\"10\" ng-model=\"lesson.desc\" class=\"span10\">" +
    "                </textarea>" +
    "            </div>" +
    "        </div>" +
    "        <div class=\"row-fluid\">" +
    "            <hr>" +
    "            <crud-buttons class=\"span12\"></crud-buttons>" +
    "        </div>" +
    "    </form>" +
    "</div>");
}]);

angular.module("admin/lessons/lessons-list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("admin/lessons/lessons-list.tpl.html",
    "<table class=\"table table-bordered table-condensed table-striped table-hover\">" +
    "    <thead>" +
    "    <tr>" +
    "        <th>Name</th>" +
    "        <th>Beschreibung</th>" +
    "        <th>ID</th>" +
    "    </tr>" +
    "    </thead>" +
    "    <tbody>" +
    "    <tr ng-repeat=\"lesson in lessons\" ng-click=\"edit(lesson.$id())\">" +
    "        <td>{{lesson.name}}</td>" +
    "        <td>{{lesson.desc}}</td>" +
    "        <td>{{lesson._id.$oid}}</td>" +
    "    </tr>" +
    "    </tbody>" +
    "</table>" +
    "<div class=\"well\">" +
    "    <button class=\"btn\" ng-click=\"new()\">Neue Lektion</button>" +
    "</div>" +
    "");
}]);

angular.module("admin/results/results-list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("admin/results/results-list.tpl.html",
    "<table class=\"table table-bordered table-condensed table-striped table-hover\">" +
    "    <thead>" +
    "    <tr>" +
    "        <th>Datum</th>" +
    "        <th>&Uuml;bung</th>" +
    "        <th>Benutzer</th>" +
    "        <th>Richtig</th>" +
    "        <th>Falsch</th>" +
    "        <th>Zeit (s)</th>" +
    "    </tr>" +
    "    </thead>" +
    "    <tbody>" +
    "    <tr ng-repeat=\"result in results\">" +
    "        <td>{{getDate(result)}}</td>" +
    "        <td>{{result.lesson}}</td>" +
    "        <td>{{result.user}}</td>" +
    "        <td>{{result.okCount}}</td>" +
    "        <td>{{result.errorCount}}</td>" +
    "        <td>{{getUsedTime(result)}}</td>" +
    "        <td><button class=\"btn btn-danger remove\" ng-click=\"remove(result, $index, $event)\">L&ouml;schen</button></td>" +
    "    </tr>" +
    "    </tbody>" +
    "</table>" +
    "");
}]);

angular.module("admin/users/users-edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("admin/users/users-edit.tpl.html",
    "<div class=\"well\">" +
    "    <form name=\"form\" novalidate crud-edit=\"user\">" +
    "        <legend>User</legend>" +
    "        <gravatar email=\"user.email\" size=\"200\" class=\"img-polaroid pull-right\"></gravatar>" +
    "        <label for=\"email\">E-mail</label>" +
    "        <input class=\"span6\" type=\"email\" id=\"email\" name=\"email\" ng-model=\"user.email\" required unique-email>" +
    "        <span ng-show=\"showError('email', 'required')\" class=\"help-inline\">This field is required.</span>" +
    "        <span ng-show=\"showError('email', 'email')\" class=\"help-inline\">Please enter a valid email address.</span>" +
    "        <span ng-show=\"showError('email', 'uniqueEmail')\" class=\"help-inline\">This email address is not available - please enter another.</span>" +
    "        <label for=\"lastName\">Last name</label>" +
    "        <input class=\"span6\" type=\"text\" id=\"lastName\" name=\"lastName\" ng-model=\"user.lastName\" required>" +
    "        <span ng-show=\"showError('lastName', 'required')\" class=\"help-inline\">This field is required.</span>" +
    "        <label for=\"firstName\">First name</label>" +
    "        <input class=\"span6\" type=\"text\" id=\"firstName\" name=\"firstName\" ng-model=\"user.firstName\" required>" +
    "        <span ng-show=\"showError('firstName', 'required')\" class=\"help-inline\">This field is required.</span>" +
    "        <label for=\"password\">Password</label>" +
    "        <input class=\"span6\" type=\"password\" id=\"password\" name=\"password\" ng-model=\"user.password\" required>" +
    "        <span ng-show=\"showError('password', 'required')\" class=\"help-inline\">This field is required.</span>" +
    "        <span ng-show=\"showError('passwordRepeat', 'equal')\" class=\"help-inline\">Passwords do not match.</span>" +
    "        <label for=\"passwordRepeat\">Password (repeat)</label>" +
    "        <input class=\"span6\" type=\"password\" id=\"passwordRepeat\" name=\"passwordRepeat\" ng-model=\"password\" required validate-equals=\"user.password\">" +
    "        <span ng-show=\"showError('passwordRepeat', 'required')\" class=\"help-inline\">This field is required.</span>" +
    "        <span ng-show=\"showError('passwordRepeat', 'equal')\" class=\"help-inline\">Passwords do not match.</span>" +
    "        <label>Admin</label>" +
    "        <input type=\"checkbox\" ng-model=\"user.admin\">" +
    "        <hr>" +
    "        <crud-buttons></crud-buttons>" +
    "    </form>" +
    "</div>");
}]);

angular.module("admin/users/users-list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("admin/users/users-list.tpl.html",
    "<table class=\"table table-bordered table-condensed table-striped table-hover\">" +
    "    <thead>" +
    "    <tr>" +
    "        <th></th>" +
    "        <th>E-mail</th>" +
    "        <th>Last name</th>" +
    "        <th>First name</th>" +
    "    </tr>" +
    "    </thead>" +
    "    <tbody>" +
    "    <tr ng-repeat=\"user in users\" ng-click=\"edit(user.$id())\">" +
    "        <td><gravatar email=\"user.email\" size=\"50\" default-image=\"'monsterid'\"></gravatar></td>" +
    "        <td>{{user.email}}</td>" +
    "        <td>{{user.lastName}}</td>" +
    "        <td>{{user.firstName}}</td>" +
    "        <td><button class=\"btn btn-danger remove\" ng-click=\"remove(user, $index, $event)\">L&ouml;schen</button></td>" +
    "    </tr>" +
    "    </tbody>" +
    "</table>" +
    "<div class=\"well\">" +
    "    <button class=\"btn\" ng-click=\"new()\">New User</button>" +
    "</div>" +
    "");
}]);

angular.module("dashboard/dashboard.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/dashboard.tpl.html",
    "<h4>Meine Fächer</h4>" +
    "<div>" +
    "<p>Rechnen</p>" +
    "<p>Ein mal eins</p>" +
    "</div>");
}]);

angular.module("header.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("header.tpl.html",
    "<div class=\"navbar\" ng-controller=\"HeaderCtrl\">" +
    "    <div class=\"navbar-inner\">" +
    "        <a class=\"brand\" ng-click=\"home()\">WebTutor</a>" +
    "" +
    "        <ul class=\"nav\" ng-show=\"isAuthenticated()\">" +
    "            <li ng-class=\"{active:isNavbarActive('timesTable')}\"><a href=\"/timesTable\">Ein mal eins</a></li>" +
    "            <li ng-class=\"{active:isNavbarActive('numbers')}\"><a href=\"/numbers\">Rechnen</a></li>" +
    "            <li class=\"dropdown\" ng-class=\"{active:isNavbarActive('admin'), open:isAdminOpen}\" ng-show=\"isAdmin()\">" +
    "                <a id=\"adminmenu\" role=\"button\" class=\"dropdown-toggle\" ng-click=\"isAdminOpen=!isAdminOpen\">Admin<b class=\"caret\"></b></a>" +
    "                <ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"adminmenu\">" +
    "                    <li><a tabindex=\"-1\" href=\"/admin/lessons\" ng-click=\"isAdminOpen=false\">Manage Lessons</a></li>" +
    "                    <li><a tabindex=\"-1\" href=\"/admin/users\" ng-click=\"isAdminOpen=false\">Manage Users</a></li>" +
    "                </ul>" +
    "            </li>" +
    "            <li class=\"nav pull-right\"><a href=\"/admin/results\">Meine Ergebnisse</a></li>" +
    "        </ul>" +
    "        <ul class=\"nav pull-right\" ng-show=\"hasPendingRequests()\">" +
    "            <li class=\"divider-vertical\"></li>" +
    "            <li><a href=\"#\"><img src=\"/static/img/spinner.gif\"></a></li>" +
    "        </ul>" +
    "        <login-toolbar></login-toolbar>" +
    "    </div>" +
    "    <div style=\"visibility: hidden\">" +
    "        <ul class=\"breadcrumb\">" +
    "            <li ng-repeat=\"breadcrumb in breadcrumbs.getAll()\">" +
    "                <span class=\"divider\">/</span>" +
    "                <ng-switch on=\"$last\">" +
    "                    <span ng-switch-when=\"true\">{{breadcrumb.name}}</span>" +
    "                    <span ng-switch-default><a href=\"{{breadcrumb.path}}\">{{breadcrumb.name}}</a></span>" +
    "                </ng-switch>" +
    "            </li>" +
    "        </ul>" +
    "    </div>" +
    "</div>");
}]);

angular.module("notifications.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("notifications.tpl.html",
    "<div ng-class=\"['alert', 'alert-'+notification.type]\" ng-repeat=\"notification in notifications.getCurrent()\">" +
    "    <button class=\"close\" ng-click=\"removeNotification(notification)\">x</button>" +
    "    {{notification.message}}" +
    "</div>" +
    "");
}]);

angular.module("projects/numbers.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("projects/numbers.tpl.html",
    "<style type=\"text/css\">" +
    "input::-webkit-outer-spin-button," +
    "input::-webkit-inner-spin-button {" +
    "    /* display: none; <- Crashes Chrome on hover */" +
    "    -webkit-appearance: none;" +
    "    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */" +
    "}" +
    "form span.error {" +
    "   color: red;" +
    "}" +
    "" +
    "form.ng-invalid input.ng-invalid {" +
    "   border-color: red;" +
    "   outline-color: red;" +
    "}" +
    "</style>" +
    "" +
    "<div  style=\"margin: 10px 10px\">" +
    "<h1>Plus/Minus Training</h1>" +
    "<p>" +
    "    <div style=\"font-size: x-large\">" +
    "<form name=\"pageForm\" ng-submit=\"submit()\" style=\"font-size: x-large\">" +
    "        <span width=\"20px\">{{a}}</span>" +
    "        <span width=\"5\"> {{operator}} </span>" +
    "        <span width=\"20\">{{b}}</span>" +
    "        <span width=\"5\"> = </span>" +
    "        <input id=\"result\" ng-model=\"result\"  style=\"font-size: x-large;height:28px\" type=\"number\" min=\"0\" max=\"2000\" ng-pattern=\"/[0-9]+/\" />" +
    "     <button ng-show=\"false\" type=\"submit\" id=\"submit\">" +
    "      </button>" +
    "        <span ng-show=\"false\" id=\"result\" width=\"20\">{{resultText()}}</span>" +
    "    <span class=\"error\" ng-show=\"pageForm.a.$error.required\">" +
    "        Bitte gib eine Zahl ein!</span>" +
    "   <span class=\"error\" ng-show=\"pageForm.a.$error.valid\">" +
    "     Bitte eine g&uuml;ltige Zahl eingeben!</span>" +
    "</form>" +
    "    " +
    "    <p style=\"font-size: large\">" +
    "      <span style=\"color: green\">Richtig: {{okCount}} </span><br/>" +
    "      <span ng-show=\"errorCount > 0\" style=\"color: red\">Falsch: {{errorCount}} </span>" +
    "    </p>" +
    "    <p>" +
    "     <button id=\"saveResult\" ng-click=\"storeResult()\">Ergebnis speichern" +
    "      </button>" +
    "     </p>" +
    "    </div>" +
    "</p>" +
    "</div>");
}]);

angular.module("projects/times-table.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("projects/times-table.tpl.html",
    "<style type=\"text/css\">" +
    "input::-webkit-outer-spin-button," +
    "input::-webkit-inner-spin-button {" +
    "    /* display: none; <- Crashes Chrome on hover */" +
    "    -webkit-appearance: none;" +
    "    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */" +
    "}" +
    "form span.error {" +
    "   color: red;" +
    "}" +
    "" +
    "form.ng-invalid input.ng-invalid {" +
    "   border-color: red;" +
    "   outline-color: red;" +
    "}" +
    "</style>" +
    "<div style=\"margin: 10px 10px\">" +
    "<h1>Ein-Mal-Eins Training.</h1>" +
    "<p>" +
    "    <div style=\"font-size: x-large\">" +
    "<form name=\"pageForm\" ng-submit=\"submit()\">" +
    "        <span width=\"20px\">{{a}}</span>" +
    "        <span width=\"5\"> {{operator}} </span>" +
    "        <span width=\"20\">{{b}}</span>" +
    "        <span width=\"5\"> = </span>" +
    "        <input style=\"font-size: x-large;height:28px\" id=\"result\" ng-model=\"result\" type=\"number\" min=\"0\" max=\"100\" ng-pattern=\"/[0-9]+/\" />" +
    "</form>" +
    "    <p style=\"font-size: large\">" +
    "      <span style=\"color: green\">Richtig: {{okCount}} </span><br/>" +
    "      <span ng-show=\"haveErrors()\" style=\"color: red\">Falsch: {{errorCount}} </span>" +
    "    </p>" +
    "     <button id=\"saveResult\" ng-click=\"storeResult()\">Ergebnis speichern" +
    "      </button>" +
    "    </div>" +
    "</p>" +
    "</div>");
}]);

angular.module("projectsinfo/welcome.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("projectsinfo/welcome.tpl.html",
    "<h3>Willkommen zum WebTutor</h3>" +
    "<div>" +
    "Um WebTutor zu benutzen musst du dich erst anmelden." +
    "</div>");
}]);

angular.module('templates.common', ['security/login/form.tpl.html', 'security/login/toolbar.tpl.html']);

angular.module("security/login/form.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("security/login/form.tpl.html",
    "<form name=\"form\" novalidate class=\"login-form\">" +
    "    <div class=\"modal-header\">" +
    "        <h4>Anmeldung</h4>" +
    "    </div>" +
    "    <div class=\"modal-body\">" +
    "        <div class=\"alert alert-warning\" ng-show=\"authReason\">" +
    "            {{authReason}}" +
    "        </div>" +
    "        <div class=\"alert alert-error\" ng-show=\"authError\">" +
    "            {{authError}}" +
    "        </div>" +
    "        <div class=\"alert alert-info\">Bitte Anmeldedaten eingeben</div>" +
    "        <label>E-mail</label>" +
    "        <input name=\"login\" type=\"email\" ng-model=\"user.email\" required autofocus>" +
    "        <label>Kennwort</label>" +
    "        <input name=\"pass\" type=\"password\" ng-model=\"user.password\" required>" +
    "    </div>" +
    "    <div class=\"modal-footer\">" +
    "        <button class=\"btn btn-primary login\" ng-click=\"login()\" ng-disabled='form.$invalid'>Anmelden</button>" +
    "        <button class=\"btn clear\" ng-click=\"clearForm()\">Entfernen</button>" +
    "        <button class=\"btn btn-warning cancel\" ng-click=\"cancelLogin()\">Abbrechen</button>" +
    "    </div>" +
    "</form>" +
    "");
}]);

angular.module("security/login/toolbar.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("security/login/toolbar.tpl.html",
    "<ul class=\"nav pull-right\">" +
    "  <li class=\"divider-vertical\"></li>" +
    "  <li ng-show=\"isAuthenticated()\">" +
    "      <a href=\"#\">{{currentUser.firstName}} {{currentUser.lastName}}</a>" +
    "  </li>" +
    "  <li ng-show=\"isAuthenticated()\" class=\"logout\">" +
    "      <form class=\"navbar-form\">" +
    "          <button class=\"btn logout\" ng-click=\"logout()\">Abmelden</button>" +
    "      </form>" +
    "  </li>" +
    "  <li ng-hide=\"isAuthenticated()\" class=\"login\">" +
    "      <form class=\"navbar-form\">" +
    "          <button class=\"btn login\" ng-click=\"login()\">Anmelden</button>" +
    "      </form>" +
    "  </li>" +
    "</ul>");
}]);
