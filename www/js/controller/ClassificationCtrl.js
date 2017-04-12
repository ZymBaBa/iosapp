angular.module('starter.Classification', [])

  .controller('Classification', ['$scope', '$resource', '$ionicLoading', '$timeout', '$stateParams', 'homeFactory', '$ionicModal', '$rootScope', 'GpsService', 'YW', function ($scope, $resource, $ionicLoading, $timeout, $stateParams, homeFactory, $ionicModal, $rootScope, GpsService, YW) {
    console.log($stateParams);
    //配置
    $scope.title=$stateParams.name;
    $ionicLoading.show({
      template: '数据载入中，请稍等......',
      noBackdrop: true,
      delay: 500
    });
    var id = $stateParams.id;
    var Url = YW.api;
    var getData = $resource(Url, {}, {
      getCity: {
        url: Url + 'district/load',
        method: 'GET',
        params: {locationLng: '@locationLng', locationLat: '@locationLat'},
        isArray: false
      },
      getClassObj: {
        url: Url + 'recruit/list',
        method: 'GET',
        params: {
          positionId: '@positionId',
          city: '@city',
          locationLng: '@locationLng',
          locationLat: '@locationLat',
          status: '@status'
        },
        isArray: false
      }
    });

//当页面加载时
    $scope.$on('$ionicView.beforeEnter',function () {
      GpsService.setGps();
      $rootScope.$on('getGps.update', function () {
        $rootScope.GpsPosition = GpsService.getGps();
        getData.getCity({
          locationLng: $rootScope.GpsPosition.lng,
          locationLat: $rootScope.GpsPosition.lat
        }, function (resp) {
          if(resp.success){
            $rootScope.cityName = resp.result;
            var getDataObjClass = {
              positionId: id,
              city: $rootScope.cityName.code,
              locationLng: $rootScope.GpsPosition.lng,
              locationLat: $rootScope.GpsPosition.lat,
              status: 'NORMAL'
            };
            getData.getClassObj(getDataObjClass, function (resp) {
              $scope.items = resp.rows;
              console.log($scope.items);
            });
            $ionicLoading.hide()
          }
        });
      });
    });
    //获取用户当时的GPS地址，并且通过函数cityJobs函数获取招聘信息
    // GpsService.setGps();
    // $rootScope.$on('getGps.update', function () {
    //   $rootScope.GpsPosition = GpsService.getGps();
    //   getData.getCity({
    //     locationLng: $rootScope.GpsPosition.lng,
    //     locationLat: $rootScope.GpsPosition.lat
    //   }, function (resp) {
    //     $rootScope.cityName = resp.result;
    //     cityJobs(resp.success);
    //     $ionicLoading.hide()
    //   });
    // });
    //获取当前分类和城市的相关招聘信息函数
    // var cityJobs = function (success) {
    //   var getDataObj = {
    //     positionId: id,
    //     city: $rootScope.cityName.code,
    //     locationLng: $rootScope.GpsPosition.lng,
    //     locationLat: $rootScope.GpsPosition.lat,
    //     status: 'NORMAL'
    //   };
    //   if (success) {
    //     getData.getCityObj(getDataObj, function (resp) {
    //       console.log(resp);
    //       $scope.items = resp.rows;
    //     })
    //   }
    // };

    //下拉更新
    $scope.doRefresh = function () {
      GpsService.setGps();
      $scope.$broadcast("scroll.refreshComplete")
    };
    //上拉更新
    $scope.load_more = function () {
      //这里放上拉更新请求的代码
      $scope.$broadcast("scroll.infiniteScrollComplete")
    };


  }]);
