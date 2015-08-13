'use strict';

/**
 * @ngdoc function
 * @name testProjectApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the testProjectApp
 */
angular.module('testProjectApp')
  .controller('AboutCtrl', function ($scope, radarData, $localStorage) {

    $scope.filterStatus = false;

    $scope.infoActive = true;

    $scope.visualization = "table";

    $scope.changeTableOrder = '-committers';

    $scope.changeOrderTable = function(value){
      $scope.changeTableOrder = value;
    }

    $scope.$watch(function () {
      return $localStorage.filterStatus;
    }, function (newVal, oldVal) {
      $scope.filterStatus = newVal;
    }, true);

    $scope.CambiarVis = function(nuevo) {
      $scope.visualization = nuevo;
    };

    radarData.then(function(data){
          $scope.radarData = data;
          $scope.headUnits = _.uniq(_.pluck($scope.radarData, 'subfamily'));

      });


  });
