app.factory('QueryService', QueryService);
QueryService.$inject = [
  '$http'
];
function QueryService($http){
  return {
    create: function(queryData){
      return $http.post('/api/v1/saveQuery', queryData);
    },
    get: function(id) {
      if (id) {
        return $http.get('/api/v1/execute/'+ id);
      } else {
        return $http.get('/api/v1/getQueries');
      }
    }
  };
}