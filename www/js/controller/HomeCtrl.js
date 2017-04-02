angular.module('starter.HomeCtrl', [])

  .controller('HomeCtrl', ['$scope', '$resource', '$ionicLoading', '$timeout', 'homeFactory', '$ionicModal', '$rootScope', '$state', '$sce', 'GpsService', 'CategoryFactory', 'PromptService', '$ionicPopup', 'YW', function ($scope, $resource, $ionicLoading, $timeout, homeFactory, $ionicModal, $rootScope, $state, $sce, GpsService, CategoryFactory, PromptService, $ionicPopup, YW) {
    //显示载入信息
    $ionicLoading.show({
      template: '数据载入中，请稍等......',
      noBackdrop: true,
      delay: 300
    });
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
      }
    });
    //获取当前城市招聘信息函数
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
            getData.getCityObj(getDataObj, function (resp) {
              $scope.items = resp.rows;
              console.log($scope.items);
              $ionicLoading.hide()
            })
          }
        });
      });
    });
    //   var cityJobs = function (success) {
    //   var getDataObj = {
    //     city: $rootScope.cityName.code,
    //     locationLng: $rootScope.GpsPosition.lng,
    //     locationLat: $rootScope.GpsPosition.lat
    //   };
    //   if (success) {
    //     getData.getCityObj(getDataObj, function (resp) {
    //       $scope.items = resp.rows;
    //       console.log($scope.items);
    //       $ionicLoading.hide()
    //     })
    //   }
    // };
    //用户打开页面获取相应坐标,并且根据坐标获取相应的城市招聘信息
    // GpsService.setGps();
    // $rootScope.$on('getGps.update', function () {
    //   $rootScope.GpsPosition = GpsService.getGps();
    //   getData.getCity({
    //     locationLng: $rootScope.GpsPosition.lng,
    //     locationLat: $rootScope.GpsPosition.lat
    //   }, function (resp) {
    //     $rootScope.cityName = resp.result;
    //     cityJobs(resp.success);
    //   });
    // });
    //下拉更新
    $scope.doRefresh = function () {
      //这里写下拉更新请求的代码
      $scope.$broadcast("scroll.refreshComplete")
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
          console.log($scope.PostLists)
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
          PromptService.PromptMsg(resp.msg);
          $timeout(function () {
            $scope.closeJob();
            $scope.applyJob.recruitIds.splice(0, $scope.applyJob.recruitIds.length);
            $scope.applyJob.checkInIds.splice(0, $scope.applyJob.checkInIds.length);
          }, 1500)
        })
      }
    };
    $scope.messageUrl = function () {
      console.log('1');
      $state.go("tab.message")
    }
  }])
  .controller('message', ['$scope', '$resource', '$ionicLoading', '$timeout', 'homeFactory', '$ionicModal', '$rootScope', '$state', '$ionicHistory', '$sce', 'GpsService', 'CategoryFactory', 'PromptService', '$ionicPopup', 'YW', function ($scope, $resource, $ionicLoading, $timeout, homeFactory, $ionicModal, $rootScope, $state, $ionicHistory, $sce, GpsService, CategoryFactory, PromptService, $ionicPopup, YW) {
    $scope.message = 'message';
    $scope.msClick=function () {
      alert('你点到我了')
    }
  }]);
