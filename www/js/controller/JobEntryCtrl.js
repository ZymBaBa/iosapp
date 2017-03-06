angular.module('starter.JobEntry', [])
  .controller('JobEntry', ['$scope', '$resource', '$ionicPopover', '$ionicLoading', '$timeout', '$ionicPopup', 'PromptService', 'applyService','postOperationService', '$rootScope','$state','YW', function ($scope, $resource, $ionicPopover, $ionicLoading, $timeout, $ionicPopup, PromptService, applyService,postOperationService,$rootScope,$state, YW) {
    $ionicLoading.show({
      template: '入职邀请载入中，请稍等...',
      noBackdrop: true,
      delay: 300
    });

//页面加载时执行的代码-拉取待入职中的列表
    $scope.$on('$ionicView.beforeEnter', function () {
      applyService.get(YW.objList[2],YW.applyList[1]);
      $scope.$on('apply.list', function () {
        $scope.items = applyService.set();
        ($scope.items.length!==0) ? $scope.tipShow = true : $scope.tipShow = false;
        $ionicLoading.hide();
      })
    });
    //拨打电话
    $scope.telPhone=function ($event,mobilePhone) {
      window.open("tel:"+mobilePhone)
    };
//下拉更新
    $scope.doRefresh = function () {
      $ionicLoading.show({
        template: '入职邀请载入中，请稍等...',
        noBackdrop: true,
        delay: 300
      });
      applyService.get(YW.objList[2],YW.applyList[1]);
      $scope.$broadcast("scroll.refreshComplete")
    };
//Popover 弹出框代码
    $ionicPopover.fromTemplateUrl("jobEntry-popover.html", {
      scope: $scope
    })
      .then(function (popover) {
        $scope.popover = popover
      });
    $scope.openPopover = function ($event, item) {
      $scope.popover.show($event);
      $scope.jobList = item
    };

    //拒绝入职邀请
    $scope.refuseJob = function () {
      $scope.popover.hide();
      var clearPopup = $ionicPopup.confirm({
        title: "拒绝入职",
        template: "<p class='text-center'>确认" + "<span class='assertive'>" + "</span>拒绝入职</p>",
        okText: "确认",
        okType: "button-light",
        cancelText: '取消',
        cancelType: "button-balanced"
      });
      clearPopup.then(function (res) {
        if (res) {
          postOperationService.postOperation(YW.postOperationAdd[1],$scope.jobList.recruitId);
          $scope.$on('post.Operation',function () {
            $scope.tipOperation=postOperationService.postNotice();
          });
          $state.go("job-entry", {}, {reload: true})
        }
      })
    };
    //接受入职邀请
    $scope.acceptJob = function () {
      $scope.popover.hide();
      var clearPopup = $ionicPopup.confirm({
        title: "接受入职",
        template: "<p class='text-center'>确认" + "<span class='assertive'>" + "</span>接受入职</p>",
        okText: "确认",
        okType: "button-light",
        cancelText: '取消',
        cancelType: "button-balanced"
      });
      clearPopup.then(function (res) {
        if (res) {
          postOperationService.postOperation(YW.postOperationAdd[2],$scope.jobList.recruitId);
          $scope.$on('post.Operation',function () {
            $scope.tipOperation=postOperationService.postNotice();
          });
          $state.go("job-entry", {}, {reload: true})
        }
      })
    };
    //拨打电话
    $scope.dialPhone = function () {
      $scope.popover.hide();
      var telPhone = $ionicPopup.confirm({
        title: "拨打电话",
        template: "<p class='text-center' style='color:#10ac86'>" + $scope.userList.recruitModel.contactPerson + "-" + $scope.userList.recruitModel.contactPhone + "</p>",
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
    $scope.$on('$destroy', function () {
      $rootScope.placeItem = [];
    })
  }]);
