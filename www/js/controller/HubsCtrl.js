angular.module('starter.hubs', [])

  .controller('HubsCtrl', ['$scope', '$ionicModal', '$interval', '$ionicActionSheet', '$state','$resource', '$timeout', '$cordovaCamera','$rootScope','Storage','$http', 'PromptService', 'YW', function ($scope, $ionicModal, $interval, $ionicActionSheet, $state, $resource, $timeout,$cordovaCamera,$rootScope,Storage,$http, PromptService, YW) {
    var url = YW.api;
    var userUrl = $resource(
      url,
      {},
      {
        //短信验证
        sendDate: {
          url: url + 'sms/send',
          method: 'POST',
          isArray: false
        },
        //修改密码
        revPassword: {
          url: url + 'account/changePwd',
          method: 'POST',
          isArray: false
        },
        //实名认证
        certification: {
          url: url + 'account/certify',
          method: 'POST',
          isArray: false
        },
        //上传头像
        postImg:{
          url:url+'account/uploadAvatar',
          method:'POST',
          // headers: {'Content-Type': undefined}/,
          // transformRequest: angular.identity,
          // params: {
          //   avatar: '@avatar'
          // },
          isArray:false
        }
      }
    );
    //上传头像
    $scope.goCamera=function(){
      $scope.show_camera=true;
      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 100,
        targetHeight: 100,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
        $scope.imageSrc="data:image/jpeg;base64," + imageData;
        // var data=new FormData();
        // data.append('avatar', imageData);
        userUrl.postImg({avatar:imageData},function (resp) {
          console.log(resp)
        });
        $scope.show_camera=false;
      }, function(err) {
        console.log("摄像头保存照片失败");
      });
    };




    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.localUser = Storage.get(YW.userKey);
      console.log($scope.localUser);
    });

    //公共的数据
    $scope.data = {
      configWord: '',
      userName: '',
      realName: '',
      realPassword: '',
      telName: '获取验证码',
      isDisable: false
    };
    var time = 10;
    var stop;
    //实名认证发送验证码
    $scope.minute = function (phone) {
      var postData = {
        type: 'CERTIFY',
        cellPhone: phone
      };
      userUrl.sendDate(postData, function (res) {
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
    };

    //修改密码Model
    $scope.pwTitle = '修改密码';
    $ionicModal.fromTemplateUrl("passWord-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.passWord = modal
    });
    $scope.openPW = function () {
      $scope.passWord.show();
    };
    $scope.closePW = function () {
      $scope.passWord.hide()
    };
    $scope.modifyPasswrod = {
      password: '',
      oldPassword: ''
    };
    //修改密码post请求
    $scope.revPassword = function () {
      userUrl.revPassword($scope.modifyPasswrod, function (resp) {
        console.log(resp);
        if (resp.success) {
          PromptService.PromptMsg(resp.msg);
          $timeout(function () {
            $scope.closePW();
            Storage.remove(YW.userKey);
            $state.go("login")
          }, 2000)
        } else {
          PromptService.PromptMsg(resp.msg);
        }
      })
    };


    //修改昵称
    $scope.unTitle = '修改昵称';
    $ionicModal.fromTemplateUrl("userName-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.userName = modal
    });
    $scope.openUn = function () {
      $scope.userName.show();
    };
    $scope.closeUn = function () {
      $scope.userName.hide()
    };

    //实名认证Model
    $scope.RnTitle = '实名认证';
    $ionicModal.fromTemplateUrl("realName-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.realName = modal
    });
    $scope.openRn = function () {
      $scope.realName.show();
    };
    $scope.closeRn = function () {
      $scope.realName.hide()
    };
    //实名认证post请求数据
    $scope.cerData = {
      name: '',
      idcard: '',
      smsCode: ''
    };
    $scope.certification = function (cerData) {
      userUrl.certification(cerData, function (resp) {
        console.log(resp);
        if (resp.success) {
          PromptService.PromptMsg(resp.msg);
          Storage.user.certifyStatus="SUCCESS";
          $timeout(function () {
            $scope.closeRn()
          }, 2000)
        } else {
          PromptService.PromptMsg(resp.msg);
        }
      })
    };
    //退出登录
    $scope.loginOff = function () {
      var hideSheet = $ionicActionSheet.show({
        cancelOnStateChange: true,
        cssClass: 'action_s',
        titleText: "退出后不会删除任何相关数据，下次登录依然可以使用本账号",
        cancelText: "取消",
        //取消的回调函数
        cancel: function () {
          return true
        },
        destructiveText: "退出登录",
        destructiveButtonClicked: function () {
          Storage.remove(YW.userKey);
          $state.go("tab.user");
          return true
        }
      })
    };
  }]);
