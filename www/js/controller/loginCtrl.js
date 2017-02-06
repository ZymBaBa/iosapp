angular.module('starter.login', [])

  .controller('LoginCtrl', ['$scope', '$ionicModal', '$interval', '$ionicActionSheet', '$resource', '$state', '$timeout', '$rootScope', 'Storage', 'PromptService', 'User', 'YW', function ($scope, $ionicModal, $interval, $ionicActionSheet, $resource, $state, $timeout, $rootScope, Storage, PromptService, User, YW) {
    var url = YW.api;
    var userUrl = $resource(
      url,
      {},
      {
        submitLogin: {url: url + 'register', method: 'POST', isArray: false},
        phoneDate: {url: url + 'phone/validate', method: 'GET', isArray: false},
        sendDate: {
          url: url + 'sms/send',
          method: 'POST',
          params: {type: '@type', cellPhone: '@cellPhone'},
          isArray: false
        },
        postFg:{url:url+'forget',method:'POST',isArray:false}
      }
    );
    $scope.goHome=function () {
      $state.go("tab.home")
    };
    //公共的数据
    $scope.data = {
      telName: '获取验证码',
      isDisable: false
    };
    //注册-监听手机格式是否正确
    $scope.$watch("loginData.cellPhone", function (newVular, oldVular) {
      if (newVular) {
        $scope.data.isDisable = false;
      } else {
        $scope.data.isDisable = true;
      }
    });
    var time = 60;
    var stop;
    //发送验证码及接收验证码的验证。
    $scope.minute = function (type,phone) {
      var data = {
        cellPhone: phone
      };
      userUrl.phoneDate(data, function (res) {
        if (res.success) {
          userUrl.sendDate({type: type, cellPhone: data.cellPhone}, function (res) {
            //手机号码格式通过验证并且返回值是true的情况下发送短信
            console.log(res);
            if (res.success) {
              $interval.cancel(stop);
              stop = $interval(
                function () {
                  if (time > 0) {
                    time--;
                    $scope.data.telName = time + "秒后重新发送";
                    $scope.data.isDisable = true;
                  } else {
                    $scope.data.telName = '重新发送';
                    time = 60;
                    $scope.data.isDisable = false;
                    $interval.cancel(stop);
                  }
                  //短信发送成功给出提示
                  PromptService.PromptMsg(res.msg);
                }, 1000);
            } else {
              //手机号码格式通过验证并且返回值是false的情况下给出提示
              PromptService.PromptMsg(res.msg);
            }
          }, function (error) {
            //如何报错，给出报错的提示
            PromptService.PromptMsg(error.msg);
          });
        } else {
          //如果手机格式不正常给出提示
          PromptService.PromptMsg('手机格式有误，请检查后重新输入！');
        }
      });
    };

    //用户注册
    $scope.unTitle = '用户注册';
    $ionicModal.fromTemplateUrl("register-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.register = modal
    });
    $scope.openRegister = function () {
      $scope.register.show();
      Storage.remove(YW.userKey);
    };
    $scope.closeRegister = function () {
      $scope.register.hide()
    };
    $scope.loginData = {
      userName: '',
      cellPhone: '',
      password: '',
      locationLat: 32.127,
      locationLng: 120.2312,
      smsCode: ''
      // locationLat:$scope.locationLat,
      // locationLng:$scope.locationLng
    };
    $scope.SubmitLogin = function () {
      userUrl.submitLogin($scope.loginData, function (data) {
        console.log(data)
      })
    };

    //忘记密码
    $scope.fgTitle = '密码找回';
    $ionicModal.fromTemplateUrl("forget-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.forgetModal = modal
    });
    $scope.openForget = function () {
      $scope.forgetModal.show();
    };
    $scope.closeForget = function () {
      $scope.forgetModal.hide()
    };
    $scope.fgData = {
      cellPhone: '',
      password: '',
      smsCode: ''
    };
    //找回密码
    $scope.postFg = function () {
        userUrl.postFg($scope.fgData,function (res) {
          if(res.success){
            PromptService.PromptMsg('密码修改成功！');
            $timeout(function () {
              $scope.forgetModal.hide()
            },1500)
          }else{
            PromptService.PromptMsg(res.msg);
          }
        })
    };
    //密码找回-监听手机格式是否正确
    $scope.$watch("fgData.cellPhone", function (newVular, oldVular) {
      if (newVular) {
        $scope.data.isDisable = false;
      } else {
        $scope.data.isDisable = true;
      }
    });

    //用户登录
    $scope.user = {
      username: '',
      password: ''
    };
    //key的名称
    var storageKey = 'user';
    $scope.signIn = function () {
      //把User传到服务中去，然后把中设置了监听回传事件
      User.login($scope.user.username, $scope.user.password);
    };
    //接收服务中的监听回传事件
    $scope.$on('User.loginUpdated', function () {
      var userRel = User.getCurrentUser();
      if (userRel.success == false) {//登陆失败
        //    alert(userRel.message);
        PromptService.PromptMsg(userRel.msg);
      } else {
        //使用set把userRel数据插入到key的值中去
        Storage.set(storageKey, userRel.result);
        $rootScope.isLogin = true;
        var items = Storage.get('user');
        console.log(items);
        $state.go("tab.home");  //路由跳转
      }
    });
  }]);