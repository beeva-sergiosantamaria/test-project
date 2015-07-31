'use strict';

/**
 * @ngdoc overview
 * @name testProjectApp
 * @description
 * # testProjectApp
 *
 * Main module of the application.
 */
angular
  .module('testProjectApp', [
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngFx',
    'MassAutoComplete',
    'ngStorage'

  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controllerAs:'mainC',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/nav', {
        templateUrl: 'views/nav.html',
        controller: 'navCtrl'
      })
      .when('/scroll', {
        templateUrl: 'views/scroll.html',
        controller: 'scrollCtrl'
      })
      .when('/virtual', {
        templateUrl: 'views/virtual3D.html',
        controller: 'virtualCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

