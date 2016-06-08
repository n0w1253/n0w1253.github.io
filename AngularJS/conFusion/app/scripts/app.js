'use strict';

angular.module('confusionApp', ['ui.router', 'ngResource'])
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider

                    // route for the home page
                    .state('app', {
                        url: '/',
                        views: {
                            'header': {
                                templateUrl: 'views/header.html',
                            },
                            'content': {
                                templateUrl: 'views/home.html',
                                controller: 'IndexController'
                            },
                            'footer': {
                                templateUrl: 'views/footer.html',
                            }
                        }

                    })

                    // route for the aboutus page
                    .state('app.aboutus', {
                        url: 'aboutus',
                        views: {
                            'content@': {
                                templateUrl: 'views/aboutus.html',
                                controller: 'AboutController'
                            }
                        }
                    })

                    // route for the contactus page
                    .state('app.contactus', {
                        url: 'contactus',
                        views: {
                            'content@': {
                                templateUrl: 'views/contactus.html',
                                controller: 'ContactController'
                            }
                        }
                    })

                    // route for the menu page
                    .state('app.menu', {
                        url: 'menu',
                        views: {
                            'content@': {
                                templateUrl: 'views/menu.html',
                                controller: 'MenuController'
                            }
                        }
                    })

                    // route for the dishdetail page
                    .state('app.dishdetails', {
                        url: 'menu/:id',
                        views: {
                            'content@': {
                                templateUrl: 'views/dishdetail.html',
                                controller: 'DishDetailController'
                            }
                        }
                    });

            $urlRouterProvider.otherwise('/');
        }).factory('errorInterceptor', ['$q', '$rootScope', '$location',
    function ($q, $rootScope, $location) {
        return {
            request: function (config) {
                console.log("config "+config)
                return config || $q.when(config);
            },
            requestError: function(request){
                return $q.reject(request);
            },
            response: function (response) {
                return response || $q.when(response);
            },
            responseError: function (response) {
                if (response && response.status === 302) {
                    console.log("response.data "+response.data)
                }
                if (response && response.status === 404) {
                    console.log("404 response.data "+response.data)
                }
                if (response && response.status >= 500) {
                    console.log("500 response.data "+response.data)
                }
                return $q.reject(response);
            }
        };
}])
        
                .factory('myHttpResponseInterceptor', ['$q', '$location', function ($q, $location) {
        return {
            response: function (response) {
                return $q(
                        function success(response) {
                            return response;
                        },
                        function error(response) {
                            console.log("response.data "+response.data)
                            if (typeof response.data === 'string') {
                                
                                return $q.reject(response);
                            } else {
                                return $q.reject(response);
                            }
                        });
            }
        }
    }])

        .config(['$httpProvider', function ($httpProvider) {
                $httpProvider.interceptors.push('errorInterceptor');
            }]);