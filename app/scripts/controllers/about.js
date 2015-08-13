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

    $scope.filterActivation = {
      'committers': true,
      'stars': true,
      'tech-blog-mentions': true,
      'analyst-blog-mentions':true,
      'summit-presentations':true,
      'summit-mentions': true
    }

    $localStorage.playAnimation = false;

    $scope.changeStatusFilter = function(filter, status){
      if( $scope.filterActivation[filter] != status){
        if($localStorage.playAnimation)$localStorage.playAnimation = false;
        else $localStorage.playAnimation = true;
      }
      $scope.filterActivation[filter] = status;
    }

    $scope.filterStatus = false;

    $scope.infoActive = true;

    $scope.visualization = "bubbles";

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
