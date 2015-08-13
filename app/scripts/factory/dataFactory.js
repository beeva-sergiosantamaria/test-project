/**
 * Created by sergiosantamaria on 22/07/15.
 */
angular.module('testProjectApp')

  .factory('bruteData', function($q, $http) {
    var datos = $http.get('data/datos.json').then(function(response){
      return response.data;
    });
    return datos;

  })
  .factory('filteredData', function($q, $http) {
    var datos = $http.get('data/dataFiltered2.json').then(function(response){
      return response.data;
    });
    return datos;
  })
  .factory('cpRelations', function($q, $http) {
    var datos = $http.get('data/CPS.json').then(function(response){
      return response.data;
    });
    return datos;
  })
  .factory('vectorWords', function($q, $http) {
    var datos = $http.get('data/words2.json').then(function(response){
      return response.data;
    });
    return datos;
  })
  .factory('radarData', function($q, $http) {
    var datos = $http.get('data/radarData600.json').then(function(response){
      return response.data;
    });
    return datos;
  })
