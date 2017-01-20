angular.module('starter.JobInvite', [])

.controller('JobInvite', ['$scope','$resource','$ionicPopover','$ionicLoading','$timeout','$ionicPopup',function($scope,$resource, $ionicPopover,$ionicLoading,$timeout,$ionicPopup) {
  var url = 'json/jobapply.json';
  var getUlr = $resource(url);

  $ionicLoading.show({
    template: '数据载入中，请稍等......',
    noBackdrop: true,
    delay:300
  });
  $timeout(function () {
    getUlr.get(function (data) {
      $scope.items = data.rows;
    });
    $ionicLoading.hide()
  }, 1000);

//下拉更新
  $scope.doRefresh = function () {
    //you code
    $scope.$broadcast("scroll.refreshComplete")
  };
//Popover 弹出框代码
  $ionicPopover.fromTemplateUrl("jobInvite-popover.html",{
    scope:$scope
  })
    .then(function (popover) {
      $scope.popover=popover;
      console.log(popover)
    });
  //打开对话框，并且取到相应对象的数据
  $scope.openPopover=function ($event,item) {
    $scope.popover.show($event);
    $scope.userList=item;
  };
  //拨打电话
  $scope.dialPhone=function (touchName,phone) {
    $scope.popover.hide();
    $ionicPopup.confirm({
      title:"再次联系",
      template:"<p class='text-center' style='color:#10ac86'>"+touchName+"-"+phone+"</p>",
      okText:"拨号",
      okType:"button-balanced",
      cancelText:'取消',
      cancelType:"button-light"
    })
  };
}]);
