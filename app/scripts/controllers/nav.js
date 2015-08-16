/**
 * Created by sergiosantamaria on 17/07/15.
 */
'use strict';

angular.module('testProjectApp')

  .controller('navCtrl', function ($scope, $localStorage) {

    $localStorage.openTendences = true;

    $localStorage.filterStatus = false;

    $scope.openTendences = function(){
      if($localStorage.openTendences == false)$localStorage.openTendences = true;
      else $localStorage.openTendences = false;
    }

    $scope.activeFiltersFunction = function(){

      if($localStorage.filterStatus == false) $localStorage.filterStatus = true;
      else $localStorage.filterStatus = false;

    }
  });
