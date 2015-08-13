'use strict';

/**
 * @ngdoc function
 * @name testProjectApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the testProjectApp
 */
angular.module('testProjectApp')
  .controller('AboutCtrl', function ($scope, radarData) {
    $scope.visualization = "radar";

    $scope.CambiarVis = function(nuevo) {
      $scope.visualization = nuevo;
    };

    radarData.then(function(data){

          $scope.radarData = data;

          console.log('data: ',data);

          _.each($scope.radarData, function(key, value){
              console.log('elem: ', key, value);
            });

          $scope.headUnits = _.uniq(_.pluck($scope.radarData, 'subfamily'));

          console.log($scope.headUnits);
      });


  });
