angular.module('starter.collection', [])

  .controller('CollectionCtrl', ['$scope','$resource','$ionicLoading','$timeout',function ($scope,$resource,$ionicLoading,$timeout) {
   $scope.name='CollectionCtrl';
    var url = 'json/collection.json';
    var getUlr = $resource(url);
    $ionicLoading.show({
      template: '数据载入中，请稍等......',
      noBackdrop: true,
      delay:300
    });
    $scope.more=true;
    $timeout(function () {
      getUlr.get(function (data) {
        $scope.items = data.rows;
        console.log($scope.items)
      });
      $ionicLoading.hide();
      $scope.more=false;
    }, 1000);
  }]);
