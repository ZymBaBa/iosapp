angular.module('starter.UserCtrl', [])
  .controller('UserCtrl', ['$scope', '$resource', '$state', '$ionicModal', '$cordovaCamera', '$rootScope', 'Storage', 'GpsService', 'YW', function ($scope, $resource, $state, $ionicModal, $cordovaCamera, $rootScope, Storage, GpsService, YW) {
    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.user = Storage.get(YW.userKey);
      console.log($scope.user);
      var newDate = new Date().getTime();
      $rootScope.userImg = YW.api + 'account/avatar?' + newDate;
      GpsService.setGps();
      $scope.$on('getGps.update', function () {
        $scope.GpsPosition = GpsService.getGps()
      });
    });
  }])
  //我的简历
  .controller('ResumeCtrl', ['$scope', '$state', '$ionicModal', '$cordovaCamera', '$resource', '$timeout', '$ionicActionSheet', '$cordovaImagePicker', '$cordovaFileTransfer', 'PromptService', 'Storage', 'YW', function ($scope, $state, $ionicModal, $cordovaCamera, $resource, $timeout, $ionicActionSheet, $cordovaImagePicker, $cordovaFileTransfer, PromptService, Storage, YW) {
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
        isArray: false
      },
      //简历编辑
      resumeModify: {
        url: url + 'resume/modify',
        method: 'POST',
        isArray: false
      },
      //照片列表
      imageGet: {
        url: url + 'resume/photo/list',
        method: 'GET',
        isArray: false
      }
    });
    $scope.resumeList = Storage.get(YW.userKey);
    //打开我的简历先判断是否已经有间历了，如果有简历了就把相应的信息取下来
    $scope.$on('$ionicView.beforeEnter', function () {
      //照片列表
      resumeUrl.imageGet(function (resp) {
        $scope.imageUser=resp.rows;
      });
      //简历信息
      resumeUrl.resumeLoad(function (resp) {
        $scope.resumeModify = resp;
        $scope.modifyList = resp.result;
        $scope.modifyData = {
          height: $scope.modifyList.height,
          weight: $scope.modifyList.weight,
          description: $scope.modifyList.description
        };
      })
    });
    $scope.nRTitle = {
      resume: '新增简历',
      modify: '编辑简历'
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
      photos: [],
      height: '',
      weight: '',
      description: ''
    };

    //保存简历请求
    $scope.preserveNr = function () {
      if ($scope.resumeModify.success === false) {
        //新增简历API请求
        resumeUrl.resumeAdd($scope.addData, function (resp) {
          if (resp.success) {
            PromptService.PromptMsg(resp.msg);
            $timeout(function () {
              $scope.closeNr();
              $scope.ionicView();
            }, 1500);
          } else {
            PromptService.PromptMsg(resp.msg);
          }
        })
      } else {
        //编辑简历API请求
        console.log($scope.modifyData);
        resumeUrl.resumeModify($scope.modifyData, function (resp) {
          if (resp.success) {
            PromptService.PromptMsg(resp.msg);
            $timeout(function () {
              $scope.closeNr();
            }, 1500);
          } else {
            PromptService.PromptMsg(resp.msg);
          }
        })
      }
    };

    //拍照
    $scope.picture = function () {
      $ionicActionSheet.show({
        buttons: [
          {text: '拍照'},
          {text: '相册'}
        ],
        cancelText: '取消',
        cancel: function () {
          return true;
        },
        buttonClicked: function (index) {
          switch (index) {
            case 0:
              takePhoto();
              break;
            case 1:
              pickImage();
              break;
            default:
              break;
          }
          return true;
        }
      });
    };
    //image picker
    var pickImage = function () {
      var options = {
        maximumImagesCount: 3,
        width: 800,
        height: 800,
        quality: 80
      };

      $cordovaImagePicker.getPictures(options)
        .then(function (results) {
          for(var i=0;i<results.length;i++){
            $scope.addData.photos.push(results[i])
          }
          console.log($scope.addData.photos);
          // $scope.images_list.push(results[0]);
          // console.log(results);
          upImage(results[0]);
        }, function (error) {
          // error getting photos
        });
    };
    var takePhoto = function () {
      var options = {
        //这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
        quality: 100,                                            //相片质量0-100
        destinationType: Camera.DestinationType.FILE_URI,        //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
        sourceType: Camera.PictureSourceType.CAMERA,             //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
        allowEdit: false,                                        //在选择之前允许修改截图
        encodingType: Camera.EncodingType.JPEG,                   //保存的图片格式： JPEG = 0, PNG = 1
        targetWidth: 200,                                        //照片宽度
        targetHeight: 200,                                       //照片高度
        mediaType: 0,                                             //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
        cameraDirection: 0,                                       //枪后摄像头类型：Back= 0,Front-facing = 1
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: true                                   //保存进手机相册
      };
      $cordovaCamera.getPicture(options).then(function (imageData) {
        // CommonJs.AlertPopup(imageData);
        //image.src = "data:image/jpeg;base64," + imageData;
        console.log(imageData);
        for(var i=$scope.addData.photos.length;i<$scope.addData.photos.length+1;i++){
          $scope.addData.photos.push(imageData)
        }
        console.log($scope.addData.photos);
        // upImage(imageData);
      }, function (err) {
        console.log('err')
      });
    };

    var upImage = function (imageUrl) {
      document.addEventListener('deviceready', function () {
        var url = "http://192.168.1.248/api/UserInfo/PostUserHead";
        var options = {};
        $cordovaFileTransfer.upload(url, imageUrl, options)
          .then(function (result) {
            console.log('成功');
          }, function (err) {
            console.log('失败');
          }, function (progress) {
            console.log('不知道是啥');
          });
      }, false);
    }

  }])

  //兼职历程
  .controller('CouresCtrl', ['$scope', '$resource', '$ionicPopover', '$ionicLoading', '$timeout', '$ionicPopup', '$rootScope', 'applyService', 'postOperationService','$state','YW', function ($scope, $resource, $ionicPopover, $ionicLoading, $timeout, $ionicPopup, $rootScope, applyService, postOperationService,$state,YW) {
    $ionicLoading.show({
      template: '入职邀请载入中，请稍等...',
      noBackdrop: true,
      delay: 300
    });
//页面加载时执行的代码-拉取待入职中的列表
    $scope.$on('$ionicView.beforeEnter', function () {
      applyService.get(YW.objList[2], YW.applyList[2]);
      $scope.$on('apply.list', function () {
        $scope.items = applyService.set();
        ($scope.items.length !== 0) ? $scope.tipShow = true : $scope.tipShow = false;
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
      applyService.get(YW.objList[2], YW.applyList[2]);
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
      $scope.jobList = item;
      console.log($scope.jobList)
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
          postOperationService.postOperation(YW.postOperationAdd[3], $scope.jobList.recruitId);
          $scope.$on('post.Operation', function () {
            $scope.tipOperation = postOperationService.postNotice();
          });
          $state.go("tab.coures",{},{reload:true})
        }
      })
    };
    //查看评价
    $scope.seeConfirm = function () {
      $scope.popover.hide();
      var alertPopup = $ionicPopup.alert({
        title: "兼职评价",
        template: "<div>" + $scope.jobList.checkInReviewModel.content + "</div>",
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
