jpushdemo.controller('mainCtrl', ['$scope','$ionicPopup','$stateParams','$state','jpushService',
  function ($scope,$ionicPopup,$stateParams,$state,jpushService) {
    $scope.message="";

    $scope.options={
      tags:"",
      alias:""
    };

    $scope.result="";

    // $scope.$on('$ionicView.beforeEnter',function(){
    //     var url=$stateParams.url;
    //     if(url){
    //         $state.go(url);
    //     }
    // });

    $scope.init=function(){
      jpushService.init();
      // window.alert('执行启动');
    };

    $scope.stopPush=function(){
      jpushService.stopPush();
      // window.alert('执行停止');
    };

    $scope.resumePush=function(){
      jpushService.resumePush();
      // window.alert('执行重启');
    };
  //检查是否是启动状态，这个可以用在设置的时候
    $scope.getPushState=function(){
      jpushService.isPushStopped(function(data){
        if(data!==0){
          //data如果不等于0的时候，设置Tag名称
          window.alert('启动');
        }else{
          //data如果等于0的时候，设置代码
          window.alert('停止');
        }
      });
    };
    //设置Tags
    $scope.setTags=function(){
      var tagArr=$scope.options.tags.split(',');
      setTagsWithAlias(tagArr,null);
      //jpushService.setTags(tagArr);
    };
    //设置Alias
    $scope.setAlias=function(){
      var alias=$scope.options.alias;
      setTagsWithAlias(null,alias);
      //jpushService.setAlias(alias);
    };
    //同时设置设置Tags\Alias
    var setTagsWithAlias=function(tags,alias){
      jpushService.setTagsWithAlias(tags,alias);
    };
    $scope.setTagsWithAlias=function(){
      var tagArr=$scope.user.userModel.userName;
      if(tagArr.length==0){
        tagArr=null;
      }
      var alias=$scope.user.userModel.userName;
      if(alias===''){
        alias=null;
      }
      setTagsWithAlias(tagArr,alias);
    };
    //清空
    $scope.cleanTagAndAlias=function(){
      var tags=[];
      var alias="";
      setTagsWithAlias(tags,alias);
    }
  }])

  .controller('listCtrl', ['$scope','noticeService' ,function ($scope,noticeService) {
    $scope.items=noticeService.notices;
  }])

  .controller('detailCtrl', ['$scope','$stateParams', function ($scope,$stateParams) {
    var id=$stateParams.id;
    $scope.message='消息id：'+id;
  }]);
