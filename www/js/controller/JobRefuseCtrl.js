angular.module('starter.JobRefuse', [])
  .controller('JobRefuse', ['$scope', '$resource', '$ionicPopover', '$ionicLoading', '$timeout', '$ionicPopup', 'PromptService', 'YW', function ($scope, $resource, $ionicPopover, $ionicLoading, $timeout, $ionicPopup, PromptService, YW) {
    $scope.doRefresh = function () {
      //这里写下拉更新请求的代码
      $scope.$broadcast("scroll.refreshComplete")
    };
  }]);
