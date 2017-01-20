angular.module('starter.Classification', [])

  .controller('Classification', ['$scope', '$resource', '$ionicLoading', '$timeout','$stateParams', 'homeFactory', '$ionicModal','YW', function ($scope, $resource, $ionicLoading, $timeout,$stateParams, homeFactory, $ionicModal,YW) {
    console.log($stateParams);
    var id=$stateParams.id;
    var Url=YW.api;
    var getUlr = $resource(Url+'recruit/list',{positionId:'@positionId',city:'@city',locationLng:'@locationLng',locationLat:'@locationLat',status:'@NORMAL'});
    $ionicLoading.show({
      template: '数据载入中，请稍等......',
      noBackdrop: true,
      delay: 500
    });
    $timeout(function () {
      getUlr.get({positionId:id,city:330400,locationLng:120,locationLat:32,status:'NORMAL'},function (data) {
        console.log(data);
        $scope.items = data.rows;
      });
      $ionicLoading.hide()
    }, 1500);
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



  }]);
