app.controller('QueryController', QueryController);
QueryController.$inject = [
  'QueryService',
  'NgTableParams'
];
function QueryController(QueryService, NgTableParams){
  var vm = this;
  vm.busy = {
    delay: 0,
    minDuration: 0,
    message: 'Cargando...',
    backdrop: true,
    promise: null
  };
  // Create new query
  vm.validateQuery = function() {
      formData = {
        title: vm.title,
        queryValue: vm.queryValue,
      };
      QueryService.create(formData)
        .success(function(data) {
            vm.success = true;
            vm.tableParams.reload();
            vm.result = data.result;
        })
        .error(function(error) {
            console.log('Error: ' + error);
            vm.success = false;
            vm.result = error.message;
        });
  };

  vm.tableParams = new NgTableParams({}, { getData: function($defer, params) {
    vm.busy.promise = QueryService.get(vm.id)
      .success(function(data) {
          $defer.resolve(data);
      })
      .error(function(error) {
          console.log('Error: ' + error);
      });
      vm.id = 0;
  }});

  vm.executeQuery = function(id) {
    vm.id = id;
    vm.tableParams.reload();
  };

  vm.convertUnixTime = function(unixTimestamp){
    var date = new Date(unixTimestamp*1000);
    var fullDate = date.getFullYear() + '-' + date.getMonth() +'-' + date.getDate();
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    if (unixTimestamp) {
      return fullDate + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    } else {
      return  'Not errors was found';
    }
    
  };


}