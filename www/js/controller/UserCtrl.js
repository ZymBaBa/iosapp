angular.module('starter.UserCtrl', [])
  .controller('UserCtrl', ['$scope', '$resource', '$state', '$ionicModal', '$cordovaCamera', '$rootScope', 'Storage', 'GpsService', 'YW', function ($scope, $resource, $state, $ionicModal, $cordovaCamera, $rootScope, Storage, GpsService, YW) {
    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.user = Storage.get(YW.userKey);
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
    $scope.imageUrl=YW.api+'resume/photo/img?id=';
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
      },
      //新增照片
      imagePost:{
        url:url+'resume/photo/add',
        method:'POST',
        isArray:false
      },
      //删除照片
      imageDel:{
        url:url+'resume/photo/del',
        method:'POST',
        isArray:false
      }
    });
    $scope.resumeList = Storage.get(YW.userKey);
    //打开我的简历先判断是否已经有间历了，如果有简历了就把相应的信息取下来
    $scope.$on('$ionicView.beforeEnter', function () {
      //照片列表
      resumeUrl.imageGet(function (resp) {
        $scope.imageUser = resp.rows;
      });
      //删除照片
      $scope.imgDelete = function (id) {
        resumeUrl.imageDel({ids:[id]},function (resp) {
          if(resp.success){
            resumeUrl.imageGet(function (resp) {
              $scope.imageUser = resp.rows;
            })
          }
        })
      };

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
      height: '',
      weight: '',
      description: ''
    };
    $scope.addDataImg={
      photos:[]
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
    //图片格式转Base64
    function convertImgToBase64URL(url, callback, outputFormat) {
      var canvas = document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'),
      img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        var dataURL;
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
        canvas = null;
      };
      img.src = url;
    };
    //image picker
    var pickImage = function () {
      $scope.addDataImg={
        photos:[]
      };
      var options = {
        maximumImagesCount:3-($scope.imageUser.length),
        width: 300,
        height: 300,
        quality: 100
      };
      //这是选择照片插入
        $cordovaImagePicker.getPictures(options)
          .then(function (results) {
            for (var i = 0; i < results.length; i++) {
              convertImgToBase64URL(results[i], function (base64Img) {
                $scope.addDataImg.photos.push(base64Img);
                upImage($scope.addDataImg.photos)
              });
            }
          });
    };
    var takePhoto = function () {
      $scope.addDataImg={
        photos:[]
      };
      $scope.show_camera = true;
      var options = {
        //这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
        quality: 100,                                            //相片质量0-100
        destinationType: Camera.DestinationType.DATA_URL,        //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
        sourceType: Camera.PictureSourceType.CAMERA,             //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
        allowEdit: false,                                        //在选择之前允许修改截图
        encodingType: Camera.EncodingType.JPEG,                   //保存的图片格式： JPEG = 0, PNG = 1
        targetWidth: 300,                                        //照片宽度
        targetHeight: 300,                                       //照片高度
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: true,                                 //保存进手机相册
        correctOrientation: true
      };
      $cordovaCamera.getPicture(options).then(function (imageData) {
        if ($scope.addDataImg.photos.length < 3) {
          $scope.addDataImg.photos.push(imageData);
          upImage($scope.addDataImg.photos)
        }
      });
    };

    var upImage = function (imageData) {
      resumeUrl.imagePost({photos: imageData}, function (resp) {
        if(resp.success){
          resumeUrl.imageGet(function (resp) {
            $scope.imageUser = resp.rows;
          })
        }
      });
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
              $state.go("tab.user");
            }, 1500);
          } else {
            PromptService.PromptMsg(resp.msg);
          }
        })
      } else {
        //编辑简历API请求
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
  }])

  //兼职历程
  .controller('CouresCtrl', ['$scope', '$resource', '$ionicPopover', '$ionicLoading', '$timeout', '$ionicPopup', '$rootScope', 'applyService', 'postOperationService', '$state', 'YW', function ($scope, $resource, $ionicPopover, $ionicLoading, $timeout, $ionicPopup, $rootScope, applyService, postOperationService, $state, YW) {

//页面加载时执行的代码-拉取待入职中的列表
    $scope.items=null;
    $scope.$on('$ionicView.beforeEnter', function () {
      applyService.get(YW.objList[2], YW.applyList[2]);
      $scope.$on('apply.list', function () {
        $scope.items = applyService.set();
        ($scope.items.length !== 0) ? $scope.tipShow = true : $scope.tipShow = false;
      })
    });
//下拉更新
    $scope.doRefresh = function () {
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
          applyService.get(YW.objList[2], YW.applyList[2]);
          $scope.$on('apply.list', function () {
            $scope.items = applyService.set();
            ($scope.items.length !== 0) ? $scope.tipShow = true : $scope.tipShow = false;
          });
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
  .controller('CollectionCtrl', ['$scope', '$resource', '$ionicLoading', 'PromptService', 'YW', function ($scope, $resource, $ionicLoading, PromptService, YW) {
    var Url = YW.api;
    var getUlr = $resource(Url, {}, {
      favList: {
        url: Url + 'recruit/fav/list',
        method: 'GET',
        isArray: false
      },
      notIconPost: {
        url: Url + 'recruit/fav/del',
        method: 'POST',
        isArray: false
      }
    });
    $scope.items=null;
    getUlr.favList(function (resp) {
      $scope.items = resp.rows;
    });
    $scope.delFav = function (id) {
      getUlr.notIconPost({recruitId: id}, function (resp) {
        if (resp.success) {
          PromptService.PromptMsg(resp.msg);
          getUlr.favList(function (resp) {
            $scope.items = resp.rows;
          });
        }
      })
    };
  }])
  //关于我们
  .controller('AboutCtrl', ['$scope','$ionicModal', function ($scope,$ionicModal) {
    $scope.tel = 15988368669;
    $scope.telPhone = function ($event, mobilePhone) {
      window.open("tel:" + mobilePhone);
    };
    //用户协议
    $scope.userAgrTile='用户协议';
    $ionicModal.fromTemplateUrl("about-agreement.html", {
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
  }]);
