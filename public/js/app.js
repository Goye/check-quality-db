var app = angular.module('checkQualityDb', ['ngRoute', 'ngTable', 'cgBusy']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

  $routeProvider

    // Sweet Home
    .when('/', {
      templateUrl: 'views/index.html',
      controller: 'QueryController'
    });

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

}]);