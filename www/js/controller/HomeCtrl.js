angular.module('starter.HomeCtrl', [])

  .controller('HomeCtrl', ['$scope', '$resource', '$ionicLoading', '$timeout', 'homeFactory', '$ionicModal', '$rootScope', '$state', '$sce', 'GpsService', 'YW', function ($scope, $resource, $ionicLoading, $timeout, homeFactory, $ionicModal, $rootScope, $state, $sce, GpsService, YW) {
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
        url: Url + 'recruit/list',
        method: 'GET',
        params: {city: '@city', locationLng: '@locationLng', locationLat: '@locationLat'},
        isArray: false
      }
    });
    //获取当前城市招聘信息函数
    var cityJobs=function (success) {
      var getDataObj = {
        city: $rootScope.cityName.code,
        locationLng: $rootScope.GpsPosition.lng,
        locationLat: $rootScope.GpsPosition.lat
      };
      if(success){
        getData.getCityObj(getDataObj,function (resp) {
          $scope.items=resp.rows;
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
        // var getDataObj = {
        //   city: $rootScope.cityName.code,
        //   locationLng: $rootScope.GpsPosition.lng,
        //   locationLat: $rootScope.GpsPosition.lat
        // };
        // if(resp.success){
        //   getData.getCityObj(getDataObj,function (resp) {
        //     $scope.items=resp.rows;
        //   })
        // }
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
    var jobUrl = 'json/joblist.json';
    var getJobUlr = $resource(jobUrl);
    $timeout(function () {
      getJobUlr.get(function (data) {
        $scope.jobs = data.rows;
      });
      $ionicLoading.hide()
    }, 1000);
    //分类选择
    $ionicModal.fromTemplateUrl("sorts-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.sorts = modal
    });
    $scope.openSorts = function () {
      if ($rootScope.state) {
        $scope.sorts.show();
      } else {
        $state.go("login")
      }
    };
    $scope.closeSorts = function () {
      $scope.sorts.hide()
    };
    //薪酬选择
    $ionicModal.fromTemplateUrl("send-modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.send = modal
    });
    $scope.openSend = function () {
      $scope.send.show();
    };
    $scope.closeSend = function () {
      $scope.send.hide();
    };
    $scope.ret = {choice: "推广员"};
    //列表
    $scope.devList = [
      {text: "嘉兴禾码科技服务有限公司", checked: false},
      {text: "浙江禾码教育咨询科技服务有限公司", checked: false},
      {text: "上海圣龙马科技服务有限公司", checked: false}
    ];
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
