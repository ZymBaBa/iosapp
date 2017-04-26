angular.module('starter.login', [])

  .controller('LoginCtrl', ['$scope', '$ionicModal', '$interval', '$ionicActionSheet', '$resource', '$state', '$timeout', '$rootScope', 'Storage', 'PromptService', 'GpsService', 'User', 'jpushService', 'YW', function ($scope, $ionicModal, $interval, $ionicActionSheet, $resource, $state, $timeout, $rootScope, Storage, PromptService, GpsService, User, jpushService, YW) {
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
        postFg: {url: url + 'forget', method: 'POST', isArray: false}
      }
    );
    $scope.goHome = function () {
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
    $scope.minute = function (type, phone) {
      var data = {
        cellPhone: phone
      };
      userUrl.phoneDate(data, function (resp) {
        console.log(resp);
        if (resp.success) {
          userUrl.sendDate({type: type, cellPhone: data.cellPhone}, function (resp) {
            //手机号码格式通过验证并且返回值是true的情况下发送短信
            if (resp.success) {
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
                  PromptService.PromptMsg(resp.msg);
                }, 1000);
            } else {
              //手机号码格式通过验证并且返回值是false的情况下给出提示
              PromptService.PromptMsg(resp.msg);
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
      smsCode: '',
      locationLat: $rootScope.GpsPosition.lat,
      locationLng: $rootScope.GpsPosition.lng
    };
    $scope.SubmitLogin = function () {
      userUrl.submitLogin($scope.loginData, function (resp) {
        PromptService.PromptMsg(resp.msg);
        if (resp.success == true) {
          $timeout(function () {
            $scope.closeRegister();
            $scope.loginData = "";
            $scope.data.password = "";
            $scope.loginData.password = "";
          }, 2500)
        }
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
    //用户协议
    $scope.userAgrTile = '用户协议';
    $ionicModal.fromTemplateUrl("user-agreement.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.userAgr = modal
    });
    $scope.openAgr = function () {
      $scope.userAgr.show();
    };
    $scope.closeAgr = function () {
      $scope.userAgr.hide()
    };
    //找回密码
    $scope.postFg = function () {
      userUrl.postFg($scope.fgData, function (resp) {
        PromptService.PromptMsg(resp.msg);
        if (resp.success) {
          $timeout(function () {
            $scope.forgetModal.hide()
          }, 2500)
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
      password: '',
      locationLng: $rootScope.GpsPosition.lng,
      locationLat: $rootScope.GpsPosition.lat
    };
    //极光推送设置tags和alias的值
    var setTagsWithAlias = function (tags, alias) {
      jpushService.setTagsWithAlias(tags, alias);
    };
    //key的名称
    var storageKey = 'user';
    $scope.signIn = function () {
      //把User传到服务中去，然后把中设置了监听回传事件
      User.login($scope.user.username, $scope.user.password, $scope.user.locationLng, $scope.user.locationLat);
    };
    //接收服务中的监听回传事件
    $scope.$on('User.loginUpdated', function () {
      var userRel = User.getCurrentUser();
      if (userRel.success == false) {//登陆失败
        PromptService.PromptMsg(userRel.msg);
      } else {
        //使用set把userRel数据插入到key的值中去
        Storage.set(storageKey, userRel.result);
        $rootScope.isLogin = true;
        //清空账号和密码
        $scope.user = {
          username: '',
          password: ''
        };
        // var items = Storage.get('user');
        //设置推送Tags\Alias
        var tagArr = userRel.result.userModel.userName.split(',');
        if (tagArr.length == 0) {
          tagArr = null;
        }
        var alias = userRel.result.userModel.userName;
        if (alias === '') {
          alias = null;
        }
        setTagsWithAlias(tagArr, alias);
        $state.go("tab.home");  //路由跳转
      }
    });
  }]);
