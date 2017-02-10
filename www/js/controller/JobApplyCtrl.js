angular.module('starter.JobApply', [])
  .controller('JobApply', ['$scope', '$resource', '$ionicPopover', '$ionicLoading', '$timeout', '$ionicPopup','PromptService','YW', function ($scope, $resource, $ionicPopover, $ionicLoading, $timeout, $ionicPopup,PromptService,YW) {
    var url = 'json/jobapply.json';
    var getUlr = $resource(url);

    $ionicLoading.show({
      template: '数据载入中，请稍等......',
      noBackdrop: true,
      delay: 300
    });
    $timeout(function () {
      getUlr.get(function (data) {
        $scope.items = data.rows;
        console.log($scope.items)
      });
      $ionicLoading.hide()
    }, 1000);

//下拉更新
    $scope.doRefresh = function () {
      //your code
      $scope.$broadcast("scroll.refreshComplete")
    };
//Popover 弹出框代码
    $ionicPopover.fromTemplateUrl("jobApply-popover.html", {
      scope: $scope
    })
      .then(function (popover) {
        $scope.popover = popover
      });
    $scope.openPopover = function ($event, item) {
      $scope.popover.show($event);
      $scope.jobList = item
    };

    //取消申请
    $scope.showConfirm = function () {
      $scope.popover.hide();
      var clearPopup = $ionicPopup.confirm({
        title: "撤消申请",
        template: "<p class='text-center'>撤消 " + "<span class='assertive'>" + $scope.jobList.name + "</span> 申请</p>",
        okText: "撤消",
        okType: "button-light",
        cancelText: '取消',
        cancelType: "button-balanced"
      });
      clearPopup.then(function (res) {
          if(res)
          {
            //这里写取消申请的代码
            console.log('你确认了；')
          }else{
            // console.log('你取消了；')
          }
      })
    };
  }]);
