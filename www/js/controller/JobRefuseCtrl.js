angular.module('starter.JobRefuse', [])
  .controller('JobRefuse', ['$scope', '$resource', '$ionicPopover', '$ionicLoading', '$timeout', '$ionicPopup', '$ionicModal', 'PromptService', 'applyService', 'messageOperationService', 'YW', function ($scope, $resource, $ionicPopover, $ionicLoading, $timeout, $ionicPopup, $ionicModal, PromptService, applyService, messageOperationService, YW) {
    var Url = YW.api;
    var getUlr = $resource(Url, {}, {
      //发送兼职申请
      applyPost: {
        url: Url + 'interviewApply/apply',
        method: 'POST',
        isArray: false
      },
      //用户入职信息拉取
      checkInIdsLoad: {
        url: Url + 'checkin/list',
        method: 'GET',
        isArray: false,
        params: {status: '@status'}
      }
    });

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
        ($scope.items.length !== 0) ? $scope.tipShow = true : $scope.tipShow = false;
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
    //Popover 弹出框代码
    $ionicPopover.fromTemplateUrl("jobRefuse-popover.html", {
      scope: $scope
    })
      .then(function (popover) {
        $scope.popover = popover
      });
    $scope.openPopover = function ($event, item) {
      $scope.popover.show($event);
      $scope.jobList = item
    };
    //删除信息
    $scope.delJob = function () {
      $scope.popover.hide();
      var clearPopup = $ionicPopup.confirm({
        title: "删除推荐",
        template: "<p class='text-center'>确认" + "<span class='assertive'>" + "</span>推荐岗位</p>",
        okText: "确认",
        okType: "button-light",
        cancelText: '取消',
        cancelType: "button-balanced"
      });
      clearPopup.then(function (res) {
        if (res) {
          messageOperationService.postOperation(YW.postOperationAdd[5], $scope.jobList.messageId);
          $scope.$on('post.Operation', function () {
            $scope.tipOperation = postOperationService.postNotice();
            if ($scope.tipOperation.success) {
              $state.go("job-refuse", {}, {reload: true})
            }
          });
        }
      })
    };


    //岗位申请modal
    $ionicModal.fromTemplateUrl("applying.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.apply = modal
    });
    //页面加载的时候去获取用户的入职信息
    $scope.$on('$ionicView.beforeEnter', function () {
      getUlr.checkInIdsLoad({status: 'SUCCESS'}, function (resp) {
        $scope.chin = resp;
        $scope.checkList = resp.rows;
      })
    });
    //发送的数据
    $scope.applyData = {
      recruitIds: [],
      checkInIds: []
    };
    //岗位申请(无兼职记录的情况下)
    $scope.openApply = function () {
      $scope.popover.hide();
      var clearPopup = $ionicPopup.confirm({
        title: "接受入职",
        template: "<p class='text-center'>确认" + "<span class='assertive'>" + $scope.jobList.recruitModel.positionModel.name + "</span>岗位申请</p>",
        okText: "确认",
        okType: "button-light",
        cancelText: '取消',
        cancelType: "button-balanced"
      });
      clearPopup.then(function (res) {
        $scope.applyData.recruitIds = [$scope.jobList.recruitId];
        if (res) {
          if ($scope.chin.total !== 0 && $scope.jobList.recruitModel.interviewApplyModel == null) {
            $scope.apply.show();
          } else {
            getUlr.applyPost($scope.applyData, function (resp) {
              PromptService.PromptMsg(resp.msg);
            })
          }
        }
      })
    };
    //关闭入职成功记录界面
    $scope.closeApply = function () {
      $scope.apply.hide()
    };
    //有兼职经验的
    $scope.addApply = function () {
      if ($scope.applyData.checkInIds.length === 0) {
        showConfirm()
      } else {
        sendApply()
      }
    };
    var sendApply = function () {
      getUlr.applyPost($scope.applyData, function (resp) {
        if (resp.success) {
          PromptService.PromptMsg(resp.msg);
          $timeout(function () {
            $scope.apply.hide()
          }, 1500)
        } else {
          PromptService.PromptMsg(resp.msg)
        }
      })
    };
    var showConfirm = function () {
      var clearPopup = $ionicPopup.confirm({
        title: "信息确认",
        template: "<p class='text-center'>" + "<span class='assertive'>" + "是否不发送您的兼职经历？" + "</span></p>",
        okText: "确认",
        okType: "button-light",
        cancelText: '取消',
        cancelType: "button-balanced"
      });
      clearPopup.then(function (res) {
        if (res) {
          sendApply()
        }
      })
    };
    //岗位申请(有兼职记录的情况下)

    // $scope.acceptJob = function () {
    //   $scope.popover.hide();
    //   var clearPopup = $ionicPopup.confirm({
    //     title: "接受入职",
    //     template: "<p class='text-center'>确认" + "<span class='assertive'>" + "</span>岗位申请</p>",
    //     okText: "确认",
    //     okType: "button-light",
    //     cancelText: '取消',
    //     cancelType: "button-balanced"
    //   });
    //   clearPopup.then(function (res) {
    //     if (res) {
    //       postOperationService.postOperation(YW.postOperationAdd[2],$scope.jobList.recruitId);
    //       $scope.$on('post.Operation',function () {
    //         $scope.tipOperation=postOperationService.postNotice();
    //       });
    //       $state.go("job-refuse", {}, {reload: true})
    //     }
    //   })
    // };
    //查看详细地址
    $scope.addressAlert = function (address) {
      var alertPopup = $ionicPopup.alert({
        title: "<span class='bar-stable'>" + "工作地址</span>",
        template: "<span class='balanced'>" + address + "</span>",
        okText: "确认",
        okType: "button-balanced"
      });
    };
    //拨打电话
    $scope.telPhone = function ($event, mobilePhone) {
      window.open("tel:" + mobilePhone)
    };


  }]);
