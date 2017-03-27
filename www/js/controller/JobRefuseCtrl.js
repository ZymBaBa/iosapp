angular.module('starter.JobRefuse', [])
  .controller('JobRefuse', ['$scope', '$resource', '$ionicPopover', '$ionicLoading', '$timeout', '$ionicPopup', 'PromptService','applyService', 'YW', function ($scope, $resource, $ionicPopover, $ionicLoading, $timeout, $ionicPopup, PromptService,applyService,YW) {
    $ionicLoading.show({
      template: '面试信息载入中，请稍等...',
      noBackdrop: true,
      delay: 300
    });
    $scope.$on('$ionicView.beforeEnter', function () {
      applyService.get(YW.objList[3], YW.applyList[5]);
      $scope.$on('apply.list', function () {
        $scope.items = applyService.set();
        console.log($scope.items);
        ($scope.items.length!==0) ? $scope.tipShow = true : $scope.tipShow =false;
        $ionicLoading.hide();
      })
    });
    $scope.doRefresh = function () {
      $ionicLoading.show({
        template: '面试信息更新中，请稍等...',
        noBackdrop: true,
        delay: 300
      });
      applyService.get(YW.objList[3], YW.applyList[5]);
      $scope.$broadcast("scroll.refreshComplete")
    };


  }]);
