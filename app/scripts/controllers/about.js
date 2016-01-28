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
    $scope.visualization = "bubbles";

    $scope.CambiarVis = function(nuevo) {
      $scope.visualization = nuevo;
    }

    $scope.showInfo = function(){
      $scope.infoActive = !$scope.infoActive;
    }

  });
