angular.module('starter.NewsCategoryCtrl', [])

  .controller('NewsCategoryCtrl', ['$scope','$stateParams','NewsCategoryCtrlFactory', function ($scope,$stateParams,NewsCategoryCtrlFactory) {
    var id=$stateParams.aid;
    NewsCategoryCtrlFactory.get(id);
    $scope.$on('top-news', function () {
      $scope.data = NewsCategoryCtrlFactory.getPortal();
    });
  }]);
