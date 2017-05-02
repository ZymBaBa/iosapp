angular.module('starter.HomeCtrl', [])

  .controller('HomeCtrl', ['$scope', '$resource', '$ionicLoading', '$timeout', 'homeFactory', '$ionicModal', '$rootScope', '$state', '$sce', 'GpsService', 'CategoryFactory', 'PromptService', '$ionicPopup', 'jpushService', 'YW', function ($scope, $resource, $ionicLoading, $timeout, homeFactory, $ionicModal, $rootScope, $state, $sce, GpsService, CategoryFactory, PromptService, $ionicPopup, jpushService, YW) {
    /*
     * 1、getCity 根据坐标请求城市信息
     * 2、getCityObj 根据城市+坐标请求招聘信息
     * */
    var Url = YW.api;
    var getData = $resource(Url, {}, {
      getCity: {
        url: Url + 'district/load',
        method: 'GET',
        params: {locationLng: '@locationLng', locationLat: '@locationLat'},
        isArray: false
      },
      getCityObj: {
        url: Url + 'recruit/near/list',
        method: 'GET',
        params: {city: '@city', locationLng: '@locationLng', locationLat: '@locationLat'},
        isArray: false
      },
      checkInIdsLoad: {
        url: Url + 'checkin/list',
        method: 'GET',
        params: {status: '@status'},
        isArray: false
      },
      requestJob: {
        url: Url + 'recruit/recommend/list',
        method: 'GET',
        params: {
          city: '@city',
          locationLng: '@locationLng',
          locationLat: '@locationLat',
          positionId: '@positionId',
          salary: '@salary'
        },
        isArray: false
      },
      interviewApply: {
        url: Url + 'interviewApply/apply',
        method: 'POST',
        isArray: false
      },
      updateLocation: {
        url: Url + 'updateLocation',
        method: 'POST',
        isArray: false
      }
    });
    //GoMesaage
    $scope.goMessage = function () {
      if ($rootScope.state) {
        $state.go("tab.message");
      } else {
        $state.go("login")
      }
    };
    $scope.items = null;
    $scope.$on('$ionicView.beforeEnter', function () {
      GpsService.setGps();
      $rootScope.$on('getGps.update', function () {
        $rootScope.GpsPosition = GpsService.getGps();
        getData.getCity({
          locationLng: $rootScope.GpsPosition.lng,
          locationLat: $rootScope.GpsPosition.lat
        }, function (resp) {
          if (resp.success) {
            $rootScope.cityName = resp.result;
            var getDataObj = {
              city: $rootScope.cityName.code,
              locationLng: $rootScope.GpsPosition.lng,
              locationLat: $rootScope.GpsPosition.lat
            };
            var postLocation = {
              lat: $rootScope.GpsPosition.lat,
              lng: $rootScope.GpsPosition.lng
            };
            getData.getCityObj(getDataObj, function (resp) {
              $scope.items = resp.rows;
            });
            getData.updateLocation(postLocation, function (resp) {
            })
          }
        });
      });

    });
    //下拉更新
    $scope.doRefresh = function () {
      //这里写下拉更新请求的代码
      var getDataObj = {
        city: $rootScope.cityName.code,
        locationLng: $rootScope.GpsPosition.lng,
        locationLat: $rootScope.GpsPosition.lat
      };
      getData.getCityObj(getDataObj, function (resp) {
        $scope.items = resp.rows;
      });
      $scope.$broadcast("scroll.refreshComplete");
    };
    //上拉更新
    $scope.load_more = function () {
      //这里放上拉更新请求的代码
      $scope.$broadcast("scroll.infiniteScrollComplete")
    };
    //城市选择页面弹出
    $ionicModal.fromTemplateUrl("city-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.city = modal
    });
    $scope.openCity = function () {
      $scope.city.show();
    };
    $scope.closeCity = function () {
      $scope.city.hide();
    };
    //分类选择页面弹出
    $ionicModal.fromTemplateUrl("sorts-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.sorts = modal
    });
    //薪酬选择弹出界面
    $scope.closeSend = function () {
      $scope.send.hide();
    };
    $ionicModal.fromTemplateUrl("send-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.send = modal
    });
    //推荐岗位
    $ionicModal.fromTemplateUrl("jobGroom-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.jobGroom = modal
    });
    $scope.closeJob = function () {
      $scope.jobGroom.hide();
      $state.go("tab.home")
    };
    //帮我找兼职
    //标题
    $scope.Title = {
      sorts: '岗位选择',
      send: '薪酬要求',
      city: '选择城市',
      job: '推荐岗位'
    };

    //岗位类型
    $scope.applyJob = {
      formatJob: [],
      checkInIds: [],
      pay: '15',
      recruitIds: []
    };
    //发送申请岗位的ID及兼职经验ID
    var interviewApplyData = {
      recruitIds: $scope.applyJob.recruitIds,
      checkInIds: $scope.applyJob.checkInIds
    };

    //"帮我找兼职"按钮功能
    $scope.openSorts = function () {
      if ($rootScope.state) {
        //获得岗位和岗位分类列表
        CategoryFactory.CateItem();
        CategoryFactory.PostItem();
        $scope.$on('cateGory.list', function () {
          $scope.CateLists = CategoryFactory.getCate();
          console.log($scope.CateLists)
        });
        $scope.$on('postGory.list', function () {
          $scope.PostLists = CategoryFactory.getPost();
        });
        $scope.sorts.show();
      } else {
        $state.go("login")
      }
    };

    $scope.closeSorts = function () {
      $scope.sorts.hide()
    };
    //选择岗位类别后：下一步
    $scope.openSend = function () {
      if ($scope.applyJob.formatJob.length !== 0) {
        $scope.send.show();
        getData.checkInIdsLoad({status: 'SUCCESS'}, function (resp) {
          $scope.chin = resp;
          $scope.checkList = resp.rows;
          console.log(resp);
        });
      } else {
        PromptService.PromptMsg('请选择您想要的兼职岗位！')
      }
    };

    //兼职经验选择
    //Start 插入兼职经验ID
    var updateSelected = function (action, id) {
      if (action == 'add' && $scope.applyJob.checkInIds.indexOf(id) == -1) {
        $scope.applyJob.checkInIds.push(id);
      }
      if (action == 'remove' && $scope.applyJob.checkInIds.indexOf(id) != -1) {
        var idx = $scope.applyJob.checkInIds.indexOf(id);
        $scope.applyJob.checkInIds.splice(idx, 1);
      }
    };
    $scope.updateSelection = function ($event, id) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, id);
    };
    $scope.isSelected = function (id) {
      return $scope.applyJob.checkInIds.indexOf(id) >= 0;
    };
    //End

    //Start 插入推荐岗位的ID
    var jobUpdateSelected = function (action, id) {
      if (action == 'add' && $scope.applyJob.recruitIds.indexOf(id) == -1) {
        $scope.applyJob.recruitIds.push(id);
      }
      if (action == 'remove' && $scope.applyJob.recruitIds.indexOf(id) != -1) {
        var Jobs = $scope.applyJob.recruitIds.indexOf(id);
        $scope.applyJob.recruitIds.splice(Jobs, 1);
      }
    };
    $scope.jobUpdateSelection = function ($event, id) {
      var checkBoxes = $event.target;
      var actions = (checkBoxes.checked ? 'add' : 'remove');
      jobUpdateSelected(actions, id);
    };
    $scope.jobIsSelected = function (id) {
      return $scope.applyJob.recruitIds.indexOf(id) >= 0;
    };
    //End

    //发送帮我找兼职的请求
    $scope.addApply = function () {
      if ($scope.applyJob.pay.length == '') {
        PromptService.PromptMsg('请输入您的薪酬要求！')
      } else {
        getData.requestJob(
          {
            city: $rootScope.cityName.code,
            locationLng: $rootScope.GpsPosition.lng,
            locationLat: $rootScope.GpsPosition.lat,
            positionId: $scope.applyJob.formatJob,
            salary: $scope.applyJob.pay
          }, function (resp) {
            console.log(resp);
            $scope.FristJobGrooms = resp.result.recommendList;
            $scope.SecondJobGrooms = resp.result.sysRecommendList;
            if ($scope.FristJobGrooms.length === 0 && $scope.SecondJobGrooms.length === 0) {
              PromptService.PromptMsg('没有符合您要求的岗位！')
            } else {
              //关闭分类和薪酬界面
              $scope.sorts.hide();
              $scope.send.hide();
              //打开兼职申请界面
              $scope.jobGroom.show();

            }
          });
      }
    };
// 兼职申请
    $scope.interviewApplyBtn = function () {
      if ($scope.applyJob.recruitIds.length == 0) {
        PromptService.PromptMsg('请选择您要兼职的岗位!')
      } else {
        getData.interviewApply(interviewApplyData, function (resp) {
          if (resp.result == '1002') {
            PromptService.PromptMsg('请至"我的"-"个人安全中心"进行实名认证');
          } else if (resp.result == '1003') {
            PromptService.PromptMsg('请至"我的"-"个人简历"进行完善');
          } else {
            PromptService.PromptMsg(resp.msg);
            $timeout(function () {
              $scope.closeJob();
              $scope.applyJob.recruitIds.splice(0, $scope.applyJob.recruitIds.length);
              $scope.applyJob.checkInIds.splice(0, $scope.applyJob.checkInIds.length);
            }, 1500)
          }
          // PromptService.PromptMsg(resp.msg);
          // $timeout(function () {
          //   $scope.closeJob();
          //   $scope.applyJob.recruitIds.splice(0, $scope.applyJob.recruitIds.length);
          //   $scope.applyJob.checkInIds.splice(0, $scope.applyJob.checkInIds.length);
          // }, 1500)
        })
      }
    };
    $scope.messageUrl = function () {
      $state.go("tab.message")
    }
  }])
  .controller('message', ['$scope', '$resource', '$ionicLoading', '$timeout', 'homeFactory', '$ionicModal', '$rootScope', '$state', '$ionicHistory', '$sce', 'GpsService', 'CategoryFactory', 'PromptService', '$ionicPopup', 'YW', function ($scope, $resource, $ionicLoading, $timeout, homeFactory, $ionicModal, $rootScope, $state, $ionicHistory, $sce, GpsService, CategoryFactory, PromptService, $ionicPopup, YW) {
    var Url = YW.api;
    var getMessage = $resource(Url, {}, {
      messageList: {
        url: Url + 'message/list',
        method: 'GET',
        isArray: false
      },
      delMessage: {
        url: Url + 'message/del',
        method: 'POST',
        isArray: false
      }
    });
    $scope.tipShow = false;
    $scope.messageGroups = null;
    $scope.$on('$ionicView.beforeEnter', function () {
      getMessage.messageList(function (resp) {
        console.log(resp);
        if (resp.success || resp.rows.length !== 0) {
          $scope.messageGroups = resp.rows;
          $scope.tipShow = true;
        } else if (resp.code === 'E0002' || resp.code === 'E0001') {
          $state.go("login")
        }
        if (resp.rows.length == 0) {
          $scope.tipShow = false;
        }
      })
    });
    $scope.msClick = function (id) {
      var confirmPopup = $ionicPopup.confirm({
        title: '删除消息',
        template: '是否确认删除？',
        okText: "删除",
        okType: "button-light",
        cancelText: '取消',
        cancelType: "button-balanced"
      });
      confirmPopup.then(function (res) {
        if (res) {
          getMessage.delMessage({id: id}, function (resp) {
            console.log(resp);
            if (resp.success) {
              $scope.messageGroups = null;
              PromptService.PromptMsg(resp.msg);
              getMessage.messageList(function (resp) {
                if (resp.success || resp.rows.length !== 0) {
                  $scope.messageGroups = resp.rows;
                  $scope.tipShow = true;
                }
                if (resp.rows.length == 0) {
                  $scope.tipShow = false;
                }
              })
            }
          })
        }
      });
    };
  }]);
