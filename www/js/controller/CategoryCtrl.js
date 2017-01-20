angular.module('starter.CategoryCtrl', [])
//分类页
  .controller('CategoryCtrl', ['$scope', '$resource',  '$ionicLoading', '$timeout','CategoryFactory', 'YW', function ($scope, $resource,  $ionicLoading, $timeout, CategoryFactory,YW) {
    $ionicLoading.show({
      template: '数据载入中，请稍等......',
      noBackdrop: true,
      delay: 500
    });
    $timeout(function () {
      CategoryFactory.CateItem();
      CategoryFactory.PostItem();
      $scope.$on('cateGory.list',function () {
        $scope.CateLists=CategoryFactory.getCate();
      });
      $scope.$on('postGory.list',function () {
        $scope.PostLists=CategoryFactory.getPost();
      });
      $ionicLoading.hide()
    },1500);

    $scope.doRefresh = function () {
      //这里写下拉更新请求的代码
      $scope.$broadcast("scroll.refreshComplete")
    };
    $scope.toggleGroup = function (group) {
      group.show = !group.show;
    };
    $scope.isGroupShown = function (group) {
      return group.show;
    };
  }]);
