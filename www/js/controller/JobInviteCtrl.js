angular.module('starter.JobInvite', [])

  .controller('JobInvite', ['$scope', '$resource', '$ionicPopover', '$ionicLoading', '$timeout', '$ionicPopup', 'PromptService', 'applyService', 'postOperationService','$rootScope', 'YW', function ($scope, $resource, $ionicPopover, $ionicLoading, $timeout, $ionicPopup, PromptService, applyService,postOperationService, $rootScope, YW) {
    $ionicLoading.show({
      template: '面试信息载入中，请稍等...',
      noBackdrop: true,
      delay: 300
    });
//页面加载时执行的代码-拉取待面试的列表
    $scope.$on('$ionicView.beforeEnter', function () {
      console.log('jobinvite');
      applyService.get(YW.objList[1], YW.applyList[1]);
      $scope.$on('apply.list', function () {
        $scope.items = applyService.set();
        ($scope.items.length !== 0) ? $scope.tipShow = true : $scope.tipShow =false;
        console.log($scope.tipShow);
        console.log($scope.items);
        $ionicLoading.hide();
      })
    });
//下拉更新
    $scope.doRefresh = function () {
      $ionicLoading.show({
        template: '面试信息更新中，请稍等...',
        noBackdrop: true,
        delay: 300
      });
      applyService.get(YW.objList[1], YW.applyList[1]);
      $scope.$broadcast("scroll.refreshComplete")
    };
//Popover 弹出框代码
    $ionicPopover.fromTemplateUrl("jobInvite-popover.html", {
      scope: $scope
    })
      .then(function (popover) {
        $scope.popover = popover;
      });
    //打开对话框，并且取到相应对象的数据
    $scope.openPopover = function ($event, item) {
      $scope.popover.show($event);
      $scope.jobList = item;
    };
    //拨打电话
    $scope.dialPhone = function () {
      $scope.popover.hide();
      var telPhone = $ionicPopup.confirm({
        title: "拨打电话",
        template: "<p class='text-center' style='color:#10ac86'>" + $scope.jobList.recruitModel.contactPerson + "-" + $scope.jobList.recruitModel.contactPhone + "</p>",
        okText: "拨号",
        okType: "button-balanced",
        cancelText: '取消',
        cancelType: "button-light"
      });
      telPhone.then(function (resp) {
        if (resp) {

        }
      })
    };
    //拒绝面试
    $scope.acceptBtn = function () {
      $scope.popover.hide();
      var acceptJob = $ionicPopup.confirm({
        title: "拒绝面试",
        template: "<p class='text-center'>拒绝" + "<span class='assertive'>" + "</span>面试邀请</p>",
        okText: "确认",
        okType: "button-balanced",
        cancelText: '取消',
        cancelType: "button-light"
      });
      acceptJob.then(function (resp) {
        if (resp) {
          postOperationService.postOperation(YW.postOperationAdd[4],$scope.jobList.recruitId);
          $scope.$on('post.Operation',function () {
            $scope.tipOperation=postOperationService.postNotice();
            console.log($scope.tipOperation)
          });
        }
      })
    };
    $scope.$on('$destroy', function () {
      $rootScope.placeItem = [];
    })
  }]);
