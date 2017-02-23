angular.module('starter.HomeCtrl', [])

  .controller('HomeCtrl', ['$scope', '$resource', '$ionicLoading', '$timeout', 'homeFactory', '$ionicModal', '$rootScope', '$state', '$sce', 'GpsService', 'CategoryFactory', 'PromptService', 'YW', function ($scope, $resource, $ionicLoading, $timeout, homeFactory, $ionicModal, $rootScope, $state, $sce, GpsService, CategoryFactory, PromptService, YW) {
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
      }
    });
    //获取当前城市招聘信息函数
    var cityJobs = function (success) {
      var getDataObj = {
        city: $rootScope.cityName.code,
        locationLng: $rootScope.GpsPosition.lng,
        locationLat: $rootScope.GpsPosition.lat
      };
      if (success) {
        getData.getCityObj(getDataObj, function (resp) {
          console.log(resp);
          $scope.items = resp.rows;
        })
      }
    };
    //用户打开页面获取相应坐标,并且根据坐标获取相应的城市招聘信息
    GpsService.setGps();
    $rootScope.$on('getGps.update', function () {
      $rootScope.GpsPosition = GpsService.getGps();
      console.log($rootScope.GpsPosition);
      getData.getCity({
        locationLng: $rootScope.GpsPosition.lng,
        locationLat: $rootScope.GpsPosition.lat
      }, function (resp) {
        $rootScope.cityName = resp.result;
        cityJobs(resp.success);
      });
    });
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

    //帮我找兼职
    //标题
    $scope.Title = {
      sorts: '岗位选择',
      send: '薪酬要求',
      city: '选择城市'
    };


    //岗位类型
    $scope.formatJob = [];
    //薪酬要求
    $scope.pay = 5;
    //兼职经验ID
    $scope.checkInIds = [];

    //分类选择页面弹出
    $ionicModal.fromTemplateUrl("sorts-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.sorts = modal
    });
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
      if ($scope.formatJob.length !== 0) {
        console.log($scope.formatJob[0]);
        $scope.send.show();
        getData.checkInIdsLoad({status: 'SUCCESS'}, function (resp) {
          $scope.chin = resp;
          $scope.checkList = resp.rows;
        });
      } else {
        PromptService.PromptMsg('请选择您想要的兼职岗位！')
      }

    };
    //薪酬选择
    $scope.closeSend = function () {
      $scope.send.hide();
    };
    $ionicModal.fromTemplateUrl("send-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.send = modal
    });
    //兼职经验选择
    //Start 插入兼职经验ID
    var updateSelected = function (action, id) {
      if (action == 'add' && $scope.checkInIds.indexOf(id) == -1) {
        $scope.checkInIds.push(id);
      }
      if (action == 'remove' && $scope.checkInIds.indexOf(id) != -1) {
        var idx = $scope.checkInIds.indexOf(id);
        $scope.checkInIds.splice(idx, 1);
      }
    };
    $scope.updateSelection = function ($event, id) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, id);
    };
    $scope.isSelected = function (id) {
      return $scope.checkInIds.indexOf(id) >= 0;
    };
    //End
    //发送帮我的兼职请求
    $scope.addApply = function () {

      getData.requestJob(
        {
          city: $rootScope.cityName.code,
          locationLng: $rootScope.GpsPosition.lng,
          locationLat: $rootScope.GpsPosition.lat,
          positionId: $scope.formatJob[0],
          salary: $scope.pay
        }, function (resp) {
          console.log(resp)
        });
    };


    //城市选择
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
    var cityUrl = 'json/citylist.json';
    var getCityUlr = $resource(cityUrl);
    $timeout(function () {
      getCityUlr.get(function (data) {
        $scope.cityItems = data.rows;
      });
      $ionicLoading.hide()
    }, 1000);
  }]);
