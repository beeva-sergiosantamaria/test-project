'use strict';

/**
 * @ngdoc function
 * @name testProjectApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the testProjectApp
 */
angular.module('testProjectApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.visualization = "radar";

    $scope.CambiarVis = function(nuevo) {
      $scope.visualization = nuevo;
    }

  });
