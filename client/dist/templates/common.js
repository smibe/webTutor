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
