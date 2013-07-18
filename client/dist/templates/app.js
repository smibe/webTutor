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
