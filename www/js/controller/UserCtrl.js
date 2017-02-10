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
  .controller('CouresCtrl', ['$scope', '$resource', '$ionicPopover', '$ionicLoading', '$timeout', '$ionicPopup', function ($scope, $resource, $ionicPopover, $ionicLoading, $timeout, $ionicPopup) {
    var url = 'json/coures.json';
    var getUlr = $resource(url);
    $ionicLoading.show({
      template: '数据载入中，请稍等......',
      noBackdrop: true,
      delay: 300
    });
    $timeout(function () {
      getUlr.get(function (data) {
        $scope.items = data.rows;
      });
      $ionicLoading.hide()
    }, 1000);

//下拉更新
    $scope.doRefresh = function () {
      //you code
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
      $scope.userList = item;
    };
    //拨打电话
    $scope.dialPhone = function (touchName, phone) {
      $scope.popover.hide();
      $ionicPopup.confirm({
        title: "联系面试官",
        template: "<p class='text-center' style='color:#10ac86'>" + touchName + "-" + phone + "</p>",
        okText: "拨号",
        okType: "button-balanced",
        cancelText: '取消',
        cancelType: "button-light"
      })
    };
    //查看评价
    $scope.seeConfirm = function (data) {
      $scope.popover.hide();
      $ionicPopup.alert({
        title: "兼职评价",
        template: "<div>" + data + "</div>",
        okText: "知了",
        okType: "button-balanced"
      })
    };
  }])
  //兼职收藏
  .controller('CollectionCtrl', ['$scope', function ($scope) {
    $scope.name = 'CollectionCtrl';
  }])
  //关于我们
  .controller('AboutCtrl', ['$scope', function ($scope) {
    $scope.name = 'AboutCtrl';
  }]);
