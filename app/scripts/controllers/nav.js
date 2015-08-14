/**
 * Created by sergiosantamaria on 17/07/15.
 */
'use strict';

angular.module('testProjectApp')

  .controller('navCtrl', function ($scope, $localStorage) {

    $localStorage.filterStatus = false;

    $scope.activeFiltersFunction = function(){

      if($localStorage.filterStatus == false) $localStorage.filterStatus = true;
      else $localStorage.filterStatus = false;

    }
  });
