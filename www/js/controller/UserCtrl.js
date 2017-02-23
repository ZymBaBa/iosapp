angular.module('starter.UserCtrl', [])
  .controller('UserCtrl', ['$scope', '$resource', '$state', '$ionicModal', '$cordovaCamera', 'Storage', 'GpsService', 'YW', function ($scope, $resource, $state, $ionicModal, $cordovaCamera, Storage, GpsService, YW) {
    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.user = Storage.get(YW.userKey);
      console.log($scope.user);
      GpsService.setGps();
      $scope.$on('getGps.update', function () {
        $scope.GpsPosition = GpsService.getGps()
      });
    });
  }])
  //我的简历
  .controller('ResumeCtrl', ['$scope', '$state', '$ionicModal', '$cordovaCamera', '$resource', '$timeout','PromptService', 'Storage', 'YW', function ($scope, $state, $ionicModal, $cordovaCamera, $resource,$timeout, PromptService, Storage, YW) {
    var url = YW.api;
    var resumeUrl = $resource(url, {}, {
      //简历加载
      resumeLoad: {
        url: url + 'resume/load',
        method: 'GET',
        isArray: false
      },
      //简历新增
      resumeAdd: {
        url: url + 'resume/add',
        method: 'POST',
        isArray: false,
        params: {
          height: '@height',
          weight: '@weight',
          description: '@description',
          photos: '@photos'
        }
      },
      //简历编辑
      resumeModify: {
        url: url + 'resume/modify',
        method: 'POST',
        isArray: false,
        params: {
          height: '@height',
          weight: '@weight',
          description: '@description',
          photos: '@photos'
        }
      }
    });
    $scope.resumeList=Storage.get(YW.userKey);
    console.log($scope.resumeList);
    //打开我的简历先判断是否已经有间历了，如果有简历了就把相应的信息取下来
      $scope.$on('$ionicView.beforeEnter', function () {
        resumeUrl.resumeLoad(function (resp) {
          $scope.resumeModify=resp;
          $scope.modifyList=resp.result;
          $scope.modifyData={
            height: $scope.modifyList.height,
            weight: $scope.modifyList.weight,
            description:$scope.modifyList.description
          };
        })
      });
    $scope.nRTitle ={
      resume:'新增简历',
      modify:'编辑简历'
    };
    $scope.delImg = function (data) {
      alert(data)
    };

    $ionicModal.fromTemplateUrl("newReume-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.newReume = modal
    });
    //新增简历
    $scope.openNr = function () {
      $scope.newReume.show();
    };
    //关闭按钮
    $scope.closeNr = function () {
      $scope.newReume.hide()
    };

    $scope.addData = {
      height: '',
      weight: '',
      description: ''
    };

    //保存简历请求
    $scope.preserveNr = function () {
        if($scope.resumeModify.success===false){
        //新增简历API请求
        resumeUrl.resumeAdd($scope.addData, function (resp) {
          if(resp.success){
            PromptService.PromptMsg(resp.msg);
            $timeout(function () {
              $scope.closeNr();
              $scope.ionicView();
            },1500);
          }else{
            PromptService.PromptMsg(resp.msg);
          }
        })
      }else{
        //编辑简历API请求
          console.log($scope.modifyData);
        resumeUrl.resumeModify($scope.modifyData,function(resp){
          if(resp.success){
            PromptService.PromptMsg(resp.msg);
            $timeout(function () {
              $scope.closeNr();
            },1500);
          }else{
            PromptService.PromptMsg(resp.msg);
          }
        })
      }
    };
  }])
  //兼职历程
  .controller('CouresCtrl', ['$scope', '$resource', '$ionicPopover', '$ionicLoading', '$timeout', '$ionicPopup','$rootScope','applyService', 'postOperationService','YW',function ($scope, $resource, $ionicPopover, $ionicLoading, $timeout, $ionicPopup,$rootScope,applyService,postOperationService,YW) {
    $ionicLoading.show({
      template: '入职邀请载入中，请稍等...',
      noBackdrop: true,
      delay: 300
    });

//页面加载时执行的代码-拉取待入职中的列表
    $scope.$on('$ionicView.beforeEnter', function () {
      applyService.get(YW.objList[2],YW.applyList[2]);
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
        template: '入职邀请载入中，请稍等...',
        noBackdrop: true,
        delay: 300
      });
      applyService.get(YW.objList[2],YW.applyList[2]);
      $scope.$broadcast("scroll.refreshComplete")
    };
//Popover 弹出框代码
    $ionicPopover.fromTemplateUrl("jobCoures-popover.html", {
      scope: $scope
    })
      .then(function (popover) {
        $scope.popover = popover
      });
    $scope.openPopover = function ($event, item) {
      $scope.popover.show($event);
      $scope.jobList = item
    };
    //删除记录
    $scope.delConfirm = function () {
      $scope.popover.hide();
      var clearPopup = $ionicPopup.confirm({
        title: "删除记录",
        template: "<p class='text-center'>确认" + "<span class='assertive'>" + "</span>删除入职记录</p>",
        okText: "确认",
        okType: "button-light",
        cancelText: '取消',
        cancelType: "button-balanced"
      });
      clearPopup.then(function (res) {
        if (res) {
          postOperationService.postOperation(YW.postOperationAdd[3],$scope.jobList.recruitId);
          $scope.$on('post.Operation',function () {
            $scope.tipOperation=postOperationService.postNotice();
            console.log($scope.tipOperation)
          });
        }
      })
    };
    //查看评价
    $scope.seeConfirm = function () {
      $scope.popover.hide();
      $ionicPopup.alert({
        title: "兼职评价",
        template: "<div>" + 我是评价 + "</div>",
        okText: "知了",
        okType: "button-balanced"
      })
    };
    //监听清空数据
    $scope.$on('$destroy', function () {
      $rootScope.placeItem = [];
    });
  }])
  //兼职收藏
  .controller('CollectionCtrl', ['$scope', function ($scope) {
    $scope.name = 'CollectionCtrl';
  }])
  //关于我们
  .controller('AboutCtrl', ['$scope', function ($scope) {
    $scope.name = 'AboutCtrl';
  }]);
