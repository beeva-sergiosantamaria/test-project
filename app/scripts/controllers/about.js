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

    $scope.visualization = "bubbles";

    $scope.InfoType = 'tendences';

    $scope.changeTableOrder = '-committers';

    $scope.filterActivation = {
      'committers': true,
      'stars': true,
      'tech-blog-mentions': true,
      'analyst-blog-mentions':true,
      'summit-presentations':true,
      'summit-mentions': true
    }


    $localStorage.filterStatus = false;

    $scope.activeFiltersFunction = function(){

      if($localStorage.filterStatus == false) $localStorage.filterStatus = true;
      else $localStorage.filterStatus = false;

    }

    $localStorage.playAnimation = false;

    $scope.changeStatusFilter = function(filter){
      if( $scope.filterActivation[filter] != status){
        if($localStorage.playAnimation)$localStorage.playAnimation = false;
        else $localStorage.playAnimation = true;
      }
      if($scope.filterActivation[filter] == true ) $scope.filterActivation[filter] = false;
      else $scope.filterActivation[filter] = true;
    }

    $scope.changeOrderTable = function(value){
      $scope.changeTableOrder = value;
    }

    $scope.$watch(function () {
      return $localStorage.filterStatus;
    }, function (newVal, oldVal) {
      $scope.filterStatus = newVal;
    }, true);

    $scope.$watch(function () {
      return $localStorage.activeDetails;
    }, function (newVal, oldVal) {
      console.log(newVal, oldVal);
      if(newVal != oldVal){
        $scope.detailsDatas = $localStorage.nodeDatasBubbles;
        $scope.infoActive = true;
        $scope.InfoType = 'details'
      }
    }, true);

    $scope.CambiarVis = function(nuevo) {
      $scope.visualization = nuevo;
    };

    radarData.then(function(data){
          $scope.radarData = data;
          $scope.headUnits = _.uniq(_.pluck($scope.radarData, 'subfamily'));

      });


  });
