angular.module('starter.postDetailCtrl', [])

  .controller('postDetail', ['$scope', '$resource', '$ionicGesture','$ionicHistory', '$stateParams', '$ionicModal', '$ionicLoading', '$timeout', '$state', '$rootScope', '$ionicPopup', 'PromptService', 'postOperationService', 'YW', function ($scope, $resource, $ionicGesture,$ionicHistory, $stateParams, $ionicModal, $ionicLoading, $timeout, $state, $rootScope, $ionicPopup,PromptService, postOperationService, YW) {
    $scope.name = '兼职详细';
    $scope.applyTitle = '岗位申请';
    var Url = YW.api;
    var id = $stateParams.id;
    var getUlr = $resource(Url, {}, {
      //获取岗位ID
      recruitLoad: {
        url: Url + 'recruit/load',
        method: 'GET',
        isArray: false,
        params: {id: '@id'}
      },
      //用户入职信息拉取
      checkInIdsLoad: {
        url: Url + 'checkin/list',
        method: 'GET',
        isArray: false,
        params: {status: '@status'}
      },
      //发送兼职申请
      applyPost: {
        url: Url + 'interviewApply/apply',
        method: 'POST',
        isArray: false
      },
      //兼职收藏
      addIconPost: {
        url: Url + 'recruit/fav/add',
        method: 'POST',
        isArray: false
      },
      //取消收藏
      delIconPost: {
        url: Url + 'recruit/fav/del',
        method: 'POST',
        isArray: false
      }
    });
    $ionicLoading.show({
      template: '数据载入中，请稍等......',
      noBackdrop: true,
      delay: 500
    });
    //页面加载的时候就去获取当前这个用户是否登录，如果登录了就去获取相应成功入职记录
    $scope.$on('$ionicView.beforeEnter', function () {
      if ($rootScope.state) {
        getUlr.checkInIdsLoad({status: 'SUCCESS'}, function (resp) {
          $scope.chin = resp;
          $scope.checkList = resp.rows;
        })
      }
    });
    //右滑返回
    $scope.swipeRight=function () {
      $ionicHistory.goBack();
    };

    $timeout(function () {
      getUlr.recruitLoad({id: id}, function (resp) {
        $scope.item = resp.result;
        console.log($scope.item);
        $scope.jobDate = {
          startDate: $scope.item.jobStartTime.substring(0, 10),
          endDate: $scope.item.jobEndTime.substring(0, 10)
        };
      });
      $ionicLoading.hide()
    }, 1500);

    //岗位收藏
    $scope.iconIs = function (objId) {
      if ($rootScope.state) {
        if ($scope.chin.total !== 0 && $scope.item.interviewApplyModel == null) {
          $scope.apply.show();
        } else {
          if ($scope.item.fav===false) {
            getUlr.addIconPost({recruitId: objId}, function (resp) {
              console.log(resp);
              if(resp.success){
                $scope.item.fav=true
              }
              PromptService.PromptMsg(resp.msg);
            })
          } else {
            getUlr.delIconPost({recruitId: objId}, function (resp) {
              if(resp.success){
                $scope.item.fav=false
              }
              PromptService.PromptMsg(resp.msg);
            })
          }
        }
      } else {
        $state.go("login")
      }
    };
    //岗位申请
    $ionicModal.fromTemplateUrl("applying.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.apply = modal
    });
    /*
     * 1、判断用户是否登录、是否有成功入职记录，则打开申请列表；
     * 2、判断用户是否登录，没有成功入职记录的，则发送该岗位的记录
     * 3、用户没登录的话，测打开登录对话框*/
    $scope.applyData = {
      recruitIds: [id],
      checkInIds: []
    };
    $scope.openApply = function () {
      if ($rootScope.state) {
        if ($scope.chin.total !== 0 && $scope.item.interviewApplyModel == null) {
          $scope.apply.show();
        } else {
          getUlr.applyPost($scope.applyData, function (resp) {
            PromptService.PromptMsg(resp.msg);
          })
        }
      } else {
        $state.go("login")
      }
    };
    //拨打电话
    $scope.telPhone = function ($event, mobilePhone) {
      window.open("tel:" + mobilePhone)
    };
    //用户发送兼职申请请求
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
    //用户发送兼职申请请求判断入职记录是否等于0
    $scope.addApply = function () {
      if ($scope.applyData.checkInIds.length === 0) {
        showConfirm()
      } else {
        sendApply()
      }
    };
    //关闭入职成功记录界面
    $scope.closeApply = function () {
      $scope.apply.hide()
    };
    //Start 插入兼职经验ID
    var updateSelected = function (action, id) {
      if (action == 'add' && $scope.applyData.checkInIds.indexOf(id) == -1) {
        $scope.applyData.checkInIds.push(id);
      }
      if (action == 'remove' && $scope.applyData.checkInIds.indexOf(id) != -1) {
        var idx = $scope.applyData.checkInIds.indexOf(id);
        $scope.applyData.checkInIds.splice(idx, 1);
      }
    };
    $scope.updateSelection = function ($event, id) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, id);
    };
    $scope.isSelected = function (id) {
      return $scope.applyData.checkInIds.indexOf(id) >= 0;
    };
  }]);

