'use strict';
angular.module('confusionApp')
        .constant("baseURL", "http://localhost:3000/")

        .service('menuFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

                this.getDishes = function () {
                    return $resource(baseURL + "dishes/:id", null, {'update': {method: 'PUT'}});
                };

                // implement a function named getPromotion
                // that returns a resource that enables the fetching of the promotion data from
                // the server.
                this.getPromotion = function () {
                    return $resource(baseURL + "promotions/:id");
                };
            }])

        .factory('corporateFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

                var corpfac = {};

                // return the resource for the leadership
                corpfac.getLeaders = function () {
                    return $resource(baseURL + "leadership/:id");
                };

                return corpfac;
            }])

        .service('feedbackFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
                //return the resource for the feedback
                this.getFeedback = function () {
                    return $resource(baseURL + "feedback/:id");
                };

            }]);
