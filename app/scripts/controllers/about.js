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

    $localStorage.nodeDatasBubbles = {};
    $localStorage.activeDetails = false;

    $scope.infoActive = true;

    $scope.visualization = "bubbles";

    $scope.InfoType = 'tendences';

    $scope.changeTableOrder = '-pc.score';

    $scope.filterActivation = {
      'committers': true,
      'stars': true,
      'tech-blog-mentions': true,
      'analyst-blog-mentions':true,
      'summit-presentations':true,
      'summit-mentions': true
    }


    $localStorage.filterStatus = false;

    $scope.CambiarVis = function(nuevo) {
      $scope.visualization = nuevo;
      $scope.goToDetails();
    };

    $scope.activeFiltersFunction = function(){

      if($localStorage.filterStatus == false) $localStorage.filterStatus = true;
      else $localStorage.filterStatus = false;

    }

    $scope.closeInfo = function(){
      $scope.infoActive = false;
      $localStorage.openTendences = false;
    }

    $localStorage.playAnimation = false;

    $scope.changeStatusFilter = function(filter){

      if($localStorage.playAnimation)$localStorage.playAnimation = false;
      else $localStorage.playAnimation = true;

      if($scope.filterActivation[filter] == true ) $scope.filterActivation[filter] = false;
      else $scope.filterActivation[filter] = true;
    }

    $scope.changeOrderTable = function(value){
      if($scope.changeTableOrder == '-'+value){
        $scope.changeTableOrder = value;
      } else  $scope.changeTableOrder = '-'+value;
    }
    $scope.goToDetails = function(datas){
      if(datas == undefined){
        $localStorage.nodeDatasBubbles = undefined;
        $scope.InfoType = 'tendences';
      } else $localStorage.nodeDatasBubbles = datas;
    }

    $scope.$watch(function () {
      return $localStorage.filterStatus;
    }, function (newVal, oldVal) {
      $scope.filterStatus = newVal;
    }, true);

    $scope.$watch(function () {
      return $localStorage.openTendences;
    }, function (newVal, oldVal) {
      if($scope.InfoType == 'tendences') $scope.infoActive = $localStorage.openTendences;
      else $scope.InfoType = 'tendences';
    }, true);

    $scope.$watch(function () {
      return $localStorage.nodeDatasBubbles;
    }, function (newVal, oldVal) {
      console.log(newVal, oldVal);
      if(newVal != oldVal && newVal!=undefined){
        $scope.detailsDatas = $localStorage.nodeDatasBubbles;
        $scope.infoActive = true;
        $scope.InfoType = 'details'
        console.log('detalles: ', $scope.detailsDatas );
      }
    }, true);

    radarData.then(function(data){
          $scope.radarData = data;
          $scope.headUnits = _.uniq(_.pluck($scope.radarData, 'subfamily'));

      });


  });
