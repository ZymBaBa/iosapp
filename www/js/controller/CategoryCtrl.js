angular.module('starter.CategoryCtrl', [])
//分类页
  .controller('CategoryCtrl', ['$scope', '$resource',  '$ionicLoading', '$timeout','CategoryFactory', function ($scope, $resource,  $ionicLoading, $timeout, CategoryFactory) {
    $scope.CateLists=null;
    $scope.PostLists=null;
    $timeout(function () {
      CategoryFactory.CateItem();
      CategoryFactory.PostItem();
      $scope.$on('cateGory.list',function () {
        $scope.CateLists=CategoryFactory.getCate();
      });
      $scope.$on('postGory.list',function () {
        $scope.PostLists=CategoryFactory.getPost();
      });
    },1500);
    $scope.toggleGroup = function (group) {
      group.show = !group.show;
    };
    $scope.isGroupShown = function (group) {
      return group.show;
    };
  }]);
