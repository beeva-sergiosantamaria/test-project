/**
 * Created by sergiosantamaria on 17/07/15.
 */
'use strict';

/**
 * @ngdoc function
 * @name testProjectApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the testProjectApp
 */
angular.module('testProjectApp')

  .controller('scrollCtrl', function ($scope, vectorWords, $localStorage) {
    $scope.dirty = {};
    var states = [];

    $localStorage. searchValue = 'wea';

    vectorWords.then(function(data){
      $.each(data, function(index, value) {
          if ($.inArray(value.word, states) === -1) {
            states.push(value.word);
          }
        })
      console.log('states: ',states);
      });
    function suggest_state(term) {
      var q = term.toLowerCase().trim();
      var results = [];

      // Find first 30 states that start with `term`.
      for (var i = 0; i < states.length && results.length < 30; i++) {
        var state = states[i];
        if (state.toLowerCase().indexOf(q) === 0)
          results.push({ label: state, value: state });
      }

      return results;
    }

    $scope.autocomplete_options = {
      suggest: suggest_state
    };

  });
