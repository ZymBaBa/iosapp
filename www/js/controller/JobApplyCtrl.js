angular.module('starter.JobApply', [])
  .controller('JobApply', ['$scope', '$resource', '$ionicPopover', '$ionicLoading', '$timeout', '$ionicPopup', 'PromptService', 'applyService', 'postOperationService', '$rootScope', '$state', 'YW', function ($scope, $resource, $ionicPopover, $ionicLoading, $timeout, $ionicPopup, PromptService, applyService, postOperationService, $rootScope, $state, YW) {
    $scope.items=null;
    var getApply = function () {
      applyService.get(YW.objList[0], YW.applyList[0]);
      $scope.$on('apply.list', function () {
        $scope.items = applyService.set();
        ($scope.items.length !== 0) ? $scope.tipShow = true : $scope.tipShow = false;
      })
    };
//页面加载时执行的代码-拉取申请中的列表
    $scope.$on('$ionicView.beforeEnter', function () {
      getApply();
    });
    //拨打电话
    $scope.telPhone = function ($event, mobilePhone) {
      window.open("tel:" + mobilePhone)
    };
//下拉更新
    $scope.doRefresh = function () {
      applyService.get(YW.objList[0], YW.applyList[0]);
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
          //解决页面刷新，重新跳转和定位，但不是最好的办法；
          $state.go("job-apply", {}, {reload: true})
        }
      })
    };
    //查看详细地址
    $scope.addressAlert = function(address) {
      var alertPopup = $ionicPopup.alert({
        title: "<span class='bar-stable'>" +"工作地址</span>",
        template: "<span class='balanced'>" +address+"</span>",
        okText: "确认",
        okType: "button-balanced"
      });
    };
    $scope.$on('$destroy', function () {
      $rootScope.placeItem = [];
    })
  }]);
