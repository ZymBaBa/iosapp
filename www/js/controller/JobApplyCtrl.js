angular.module('starter.JobApply', [])
  .controller('JobApply', ['$scope', '$resource', '$ionicPopover', '$ionicLoading', '$timeout', '$ionicPopup', 'PromptService', 'applyService', 'postOperationService', '$rootScope', 'YW', function ($scope, $resource, $ionicPopover, $ionicLoading, $timeout, $ionicPopup, PromptService, applyService, postOperationService, $rootScope, YW) {
    $ionicLoading.show({
      template: '申请记录载入中，请稍等...',
      noBackdrop: true,
      delay: 300
    });
//页面加载时执行的代码-拉取申请中的列表
    $scope.$on('$ionicView.beforeEnter', function () {
      applyService.get(YW.objList[0], YW.applyList[0]);
      $scope.$on('apply.list', function () {
        $scope.items = applyService.set();
        ($scope.items.length !== 0) ? $scope.tipShow = true : $scope.tipShow = false;
        console.log($scope.items);
        $ionicLoading.hide();
      })
    });
//下拉更新
    $scope.doRefresh = function () {
      $ionicLoading.show({
        template: '申请记录更新中，请稍等...',
        noBackdrop: true,
        delay: 300
      });
      applyService.get(YW.objList[0], YW.applyList[0]);
      $ionicLoading.hide();
      $scope.$broadcast("scroll.refreshComplete")
    };
//Popover 弹出框代码
    $ionicPopover.fromTemplateUrl("jobApply-popover.html", {
      scope: $scope
    })
      .then(function (popover) {
        $scope.popover = popover
      });
    $scope.openPopover = function ($event, item) {
      $scope.popover.show($event);
      $scope.jobList = item
    };

    //取消申请
    $scope.showConfirm = function () {
      $scope.popover.hide();
      var clearPopup = $ionicPopup.confirm({
        title: "取消申请",
        template: "<p class='text-center'>撤消" + "<span class='assertive'>" + $scope.jobList.recruitModel.positionModel.name + "</span>申请</p>",
        okText: "确认",
        okType: "button-light",
        cancelText: '取消',
        cancelType: "button-balanced"
      });
      clearPopup.then(function (res) {
        if (res) {
          postOperationService.postOperation(YW.postOperationAdd[0], $scope.jobList.recruitId);
          $scope.$on('post.Operation', function () {
            $scope.type = postOperationService.postNotice();
          });
          applyService.get(YW.applyList[0]);
        }
      })
    };
    $scope.$on('$destroy', function () {
      $rootScope.placeItem = [];
    })
  }]);
