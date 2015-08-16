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
    var datos = $http.get('data/lince_data_real.json').then(function(response){
      return response.data;
    });
    return datos;
  })
  .factory('d3Service', ['$document', '$q', '$rootScope', function($document, $q, $rootScope) {
    var d = $q.defer();
    function onScriptLoad() {
      // Load client in the browser
      $rootScope.$apply(function() { d.resolve(window.d3); });
    }
    // Create a script tag with d3 as the source
    // and call our onScriptLoad callback when it
    // has been loaded
    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = 'bower_components/d3/d3.js';
    scriptTag.onreadystatechange = function () {
      if (this.readyState === 'complete') { onScriptLoad(); }
    };
    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    return {
      d3: function() { return d.promise; }
    };
  }])
