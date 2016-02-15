app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// Sweet Home
		.when('/', {
			templateUrl: 'views/index.html',
			controller: 'QueryController'
		});

	$locationProvider.html5Mode(true);

}]);