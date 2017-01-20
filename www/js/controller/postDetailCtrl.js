angular.module('starter.postDetailCtrl', [])

  .controller('postDetail', ['$scope', '$resource', '$ionicGesture', '$stateParams', '$resource', '$ionicModal', '$ionicLoading', '$timeout', '$state', '$rootScope', 'YW', function ($scope, $resource, $ionicGesture, $stateParams, $resource, $ionicModal, $ionicLoading, $timeout, $state, $rootScope, YW) {
    $scope.name = '兼职详细';
    $scope.applyTitle = '岗位申请';
    console.log($stateParams);
    var Url = YW.api;
    var id = $stateParams.id;
    var getUlr = $resource(Url + 'recruit/load', {id: '@id'});
    $ionicLoading.show({
      template: '数据载入中，请稍等......',
      noBackdrop: true,
      delay: 500
    });
    $timeout(function () {
      getUlr.get({id: id}, function (res) {
        $scope.item = res.result;
        $scope.jobDate = {
          startDate: $scope.item.jobStartTime.substring(0, 10),
          endDate: $scope.item.jobEndTime.substring(0, 10)
        };
        console.log($scope.item)
      });
      $ionicLoading.hide()
    }, 1500);
    $ionicModal.fromTemplateUrl("applying.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function (modal) {
      $scope.apply = modal
    });

    $scope.openApply = function () {
      if ($rootScope.state) {
        $scope.apply.show();
      } else {
        $state.go("login")
      }
    };

    $scope.closeApply = function () {
      $scope.apply.hide()
    };

    $scope.devList = [
      {text: "HTML5", checked: false},
      {text: "CSS3", checked: false},
      {text: "JavaScript", checked: false}
    ];

    $scope.pushNotificationChange = function () {
      console.log('Push Notification Change', $scope.pushNotification.checked);
    };
    $scope.pushNotification = {checked: true};
    $scope.emailNotification = 'Subscribed'
  }]);

