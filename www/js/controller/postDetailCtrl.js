angular.module('starter.postDetailCtrl', [])

  .controller('postDetail', ['$scope', '$resource', '$ionicGesture', '$stateParams', '$resource', '$ionicModal', '$ionicLoading', '$timeout', '$state', '$rootScope', 'PromptService', 'YW', function ($scope, $resource, $ionicGesture, $stateParams, $resource, $ionicModal, $ionicLoading, $timeout, $state, $rootScope, PromptService, YW) {
    $scope.name = '兼职详细';
    $scope.applyTitle = '岗位申请';
    console.log($stateParams);
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
      }
    });
    $ionicLoading.show({
      template: '数据载入中，请稍等......',
      noBackdrop: true,
      delay: 500
    });
    $timeout(function () {
      getUlr.recruitLoad({id: id}, function (resp) {
        $scope.item = resp.result;
        $scope.jobDate = {
          startDate: $scope.item.jobStartTime.substring(0, 10),
          endDate: $scope.item.jobEndTime.substring(0, 10)
        };
        console.log('岗位信息:');
        console.log($scope.item)
      });
      $ionicLoading.hide()
    }, 1500);
    $ionicModal.fromTemplateUrl("applying.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.apply = modal
    });
    //页面加载的时候就去获取当前这个用户是否登录，如果登录了就去获取相应成功入职记录
    $scope.$on('$ionicView.beforeEnter', function () {
      if ($rootScope.state) {
        getUlr.checkInIdsLoad({status: 'SUCCESS'}, function (resp) {
          console.log(resp);
          $scope.chin = resp;
          $scope.checkList = resp.rows;
        })
      }
    });
    /*
     * 1、判断用户是否登录、是否有成功入职记录，则打开申请列表；
     * 2、判断用户是否登录，没有成功入职记录的，则发送该岗位的记录
     * 3、用户没登录的话，测打开登录对话框*/
    $scope.applyData={
      recruitId: id,
      checkInIds:[]
    };
    $scope.openApply = function () {
      if ($rootScope.state) {
        if ($scope.chin.total !== 0) {
          console.log($scope.chin.total);
          $scope.apply.show();
        } else {
          getUlr.applyPost($scope.applyData, function (resp) {
            console.log(resp);
            PromptService.PromptMsg(resp.msg)
          })
        }
      } else {
        $state.go("login")
      }
    };
    //用户发送兼职申请请求
    $scope.addApply = function () {
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
    //关闭入职成功记录界面
    $scope.closeApply = function () {
      $scope.apply.hide()
    };
    $scope.devList = [
      {text: "HTML5", checked: false},
      {text: "CSS3", checked: false},
      {text: "JavaScript", checked: false}
    ];

    $scope.pushNotificationChange = function () {
      console.log('Push Notification Change', $scope.pushNotification.checked);
    };
    $scope.pushNotification = {checked: true};
    $scope.emailNotification = 'Subscribed'
  }]);

