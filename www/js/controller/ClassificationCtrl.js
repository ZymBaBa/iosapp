angular.module('starter.Classification', [])

  .controller('Classification', ['$scope', '$resource', '$ionicLoading', '$timeout', '$stateParams', 'homeFactory', '$ionicModal', '$rootScope', 'GpsService', 'YW', function ($scope, $resource, $ionicLoading, $timeout, $stateParams, homeFactory, $ionicModal, $rootScope, GpsService, YW) {
    //配置
    $scope.title=$stateParams.name;
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
    $scope.items=null;
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
              if(resp.success){
                $scope.items = resp.rows;
              }
            });
          }
        });
      });
    });
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
