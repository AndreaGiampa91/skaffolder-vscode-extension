app.controller("ReportGenerationController", [
  "$scope",
  "DataService",
  function($scope, DataService) {
    // Get data
    DataService.getLogs().then(data => {
      $scope.logs = data;
    });
  }
]);
