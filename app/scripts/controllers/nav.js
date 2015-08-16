/**
 * Created by sergiosantamaria on 17/07/15.
 */
'use strict';

angular.module('testProjectApp')

  .controller('navCtrl', function ($scope, $localStorage) {

    $scope.userProfile="Bussiness";

    $localStorage.openTendences = true;

    $localStorage.filterStatus = false;

    $scope.userSelect = false;

    $scope.showUser = function(){
      if($scope.userSelect == false)$scope.userSelect = true;
      else $scope.userSelect = false;
    }
    $scope.changeUser = function(value){
      $scope.userProfile = value;
      $scope.showUser();
    }

    $scope.fsState = false;
    $scope.fullScreen = function fullScreen(){
      function launchFS(element) {
        if (element.requestFullScreen) element.requestFullScreen();
        else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
        else if (element.webkitRequestFullScreen) element.webkitRequestFullScreen();
      }
      function cancelFS() {
        if (document.cancelFullScreen) document.cancelFullScreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
      }
      if($scope.fsState == false) launchFS(document.documentElement);
      else cancelFS(); $scope.fsState = !$scope.fsState;
    };

    $scope.openTendences = function(){
      if($localStorage.openTendences == false) $localStorage.openTendences = true;
      else $localStorage.openTendences = false;
    }

    $scope.activeFiltersFunction = function(){
      if($localStorage.filterStatus == false) $localStorage.filterStatus = true;
      else $localStorage.filterStatus = false;
    }
  });
