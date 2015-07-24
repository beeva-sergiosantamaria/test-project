'use strict';

/**
 * @ngdoc function
 * @name testProjectApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the testProjectApp
 */
angular.module('testProjectApp')

  .controller('MainCtrl', function ($scope) {

    var vm = this;

    vm.title = 'some title';

    $scope.$watch(function () {
      return vm.title;
    }, function (newVal, oldVal) {
    });

    $scope.changeValue = function(){
      vm.title= 'viaje';
    }

  })
