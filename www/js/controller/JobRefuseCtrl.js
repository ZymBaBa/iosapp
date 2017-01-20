angular.module('starter.JobRefuse', [])

.controller('JobRefuse', ['$scope','$resource',function($scope,$resource) {
console.log('JobRefues');

  $scope.doRefresh = function () {
    //这里写下拉更新请求的代码
    $scope.$broadcast("scroll.refreshComplete")
  };
}]);
