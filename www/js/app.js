angular.module('starter',
  [
    'ionic',
    'ipCookie',
    'starter.HomeCtrl',
    'starter.CategoryCtrl',
    'starter.PositionCtrl',
    'starter.UserCtrl',
    'starter.JobApply',
    'starter.JobInvite',
    'starter.JobEntry',
    'starter.JobRefuse',
    'starter.NewsCategoryCtrl',
    'starter.hubs',
    'starter.postDetailCtrl',
    'starter.services',
    'starter.PromptService',
    'starter.Classification',
    'starter.login',
    'starter.config',
    'ngCordova',
    'ngFileUpload',
    'ngResource'
  ])

  .run(['$ionicPlatform', '$rootScope', '$ionicHistory', '$state', 'Storage', '$resource', '$timeout', 'GpsService','jpushService','YW', function ($ionicPlatform, $rootScope, $ionicHistory, $state, Storage, $resource, $timeout, GpsService,jpushService,YW) {
    //根据浏览器获取坐标



    //打开APP的时候把省、市的信息优先保存下来
    $rootScope.cities = [];
    $rootScope.provinces = [];
    var url = YW.api + 'district/list';
    $rootScope.cities = Storage.get(YW.cityKey);
    $rootScope.provinces = Storage.get(YW.provinceKey);
    var runObj = $resource(url, {}, {
        getObj: {
          url: url,
          method: 'GET',
          params: {type: '@type'},
          isArray: false
        }
      }
    );
    if ($rootScope.provinces == null) {
      runObj.getObj({type: 'PROVINCE'}, function (resp) {
        Storage.set(YW.provinceKey, resp.rows)
      })
    }
    if ($rootScope.cities == null) {
      runObj.getObj({type: 'CITY'}, function (resp) {
        Storage.set(YW.cityKey, resp.rows)
      })
    }

    //用于判断是否需要跳转登录页面
    var needLoginView = ["tab.user", "tab.position", "tab.hubs"];//需要登录的页面state
    var userKey = 'user';
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
      $rootScope.state = Storage.get(userKey);
      if (needLoginView.indexOf(toState.name) >= 0 && !$rootScope.state) {//判断当前是否登录
        $state.go("login");//跳转到登录页
        event.preventDefault(); //阻止默认事件，即原本页面的加载
      }
    });
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
      //极光推送代码
      //设置成功之后弹出的
      var setTagsWithAliasCallback = function (event) {
        // console.log(event)
      //   window.alert('result code:' + event.resultCode + ' tags:' + event.tags + ' alias:' + event.alias);
      };
      //界面跳转
      var openNotificationInAndroidCallback = function (data) {
        if($rootScope.isLogin){
          $state.go("tab.message");
        }else{
          $state.go("tab.home");
        }
        // console.log(JSON.stringify(data));
        // var json = data;
        // window.alert(JSON.stringify(json));
        // if (typeof data === 'string') {
        //   json = JSON.parse(data);
        // }
        // var id = json.extras['cn.jpush.android.EXTRA'].id;
        // window.alert(id);
        // var alert = json.extras['cn.jpush.android.ALERT'];
        // $state.go('detail', {id: id + alert});
      };
      var config = {
        stac: setTagsWithAliasCallback,
        oniac: openNotificationInAndroidCallback
      };

      jpushService.init(config);
      //启动极光推送服务
      window.plugins.jPushPlugin.init();
      window.plugins.jPushPlugin.setDebugMode(true);
    });
  }])
  //控制状态栏的显示或隐藏
  .controller('DashCtrl', function ($scope, $state, $ionicPopup, AuthService, $rootScope) {
    $scope.$on('$ionicView.enter', function () {
      $rootScope.hideTabs = false;
    });
    $scope.logout = function () {
      AuthService.logout();
      $state.go('login');
    };
  })
  //控制跳转隐藏下面的状态栏
  .directive('hideTabs', function ($rootScope) {
    return {
      restrict: 'A',
      link: function (scope, element, attributes) {
        scope.$on('$ionicView.beforeEnter', function () {
          scope.$watch(attributes.hideTabs, function (value) {
            $rootScope.hideTabs = value;
          });
        });
        scope.$on('$ionicView.beforeLeave', function () {
          $rootScope.hideTabs = false;
        });
      }
    };
  })
  //小红点
  .directive('headRedPoint', function($compile, $timeout){
    return {
      restrict: 'A',
      replace: false,
      link: function(scope, element, attrs, controller) {
        var key = attrs.headRedPoint || false;
        var template ="<span ng-class={true:'tabs-red-point',false:''}["+key+"]></span>";
        var html = $compile(template)(scope);
        $timeout(function() {
          var test = angular.element(element).parent().append(html)
        },100)
      }
    };
  })
  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
    //cookie请求头配置
    // $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.headers.common['Authorization'] = "89757";
    $httpProvider.defaults.headers.common['HM-Requested-With'] = "www.icewnet.com";
    //系统配置
    $ionicConfigProvider.views.transition('ios');
    $ionicConfigProvider.views.maxCache(10);
    $ionicConfigProvider.backButton.previousTitleText(true);
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.backButton.icon('ion-ios-arrow-left');
    //找不到页面跳到首页
    $urlRouterProvider.otherwise('/tab/home');

    $stateProvider

      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })
      //home
      .state('tab.home', {
        url: '/home',
        views: {
          'tab-home': {
            templateUrl: 'templates/home/home.html',
            controller: 'HomeCtrl'
          }
        }
      })
      //信息
      .state('tab.message', {
        url: '/message',
        views: {
          'tab-home': {
            templateUrl: 'templates/home/message.html',
            controller: 'message'
          }
        }
      })
      //岗位详细页-首页
      .state('tab.postDetail', {
        url: '/postDetail/:id',
        views: {
          'tab-home': {
            templateUrl: 'templates/public/postDetail.html',
            controller: 'postDetail'
          }
        }
      })
      //category 分类
      .state('tab.category', {
        url: '/category',
        views: {
          'tab-category': {
            templateUrl: 'templates/category/category.html',
            controller: 'CategoryCtrl'
          }
        }
      })
      //分类列表
      .state('tab.Classification', {
        url: '/Classification/:id/:name',
        views: {
          'tab-category': {
            templateUrl: 'templates/public/Classification.html',
            controller: 'Classification'
          }
        }
      })
      //岗位详细页-列表
      .state('tab.postlist', {
        url: '/postlist/:id',
        cache:'false',
        views: {
          'tab-category': {
            templateUrl: 'templates/public/postDetail.html',
            controller: 'postDetail'
          }
        }
      })
      //岗位详细页
      .state('postDetail', {
        url: '/postDetail/:aid',
        templateUrl: 'templates/public/postDetail.html',
        controller: 'postDetail'
      })
      //用户登录、注册、忘记密码
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })
      //position
      .state('tab.position', {
        url: '/position',
        cache:'false',
        views: {
          'tab-position': {
            templateUrl: 'templates/position/position.html',
            controller: 'PositionCtrl'
          }
        }
      })
      /*
       * positions
       * job-apply
       * job-invite
       * job-refuse
       * */
      .state('job-apply', {
        url: '/job-apply',
        parent: 'tab.position',
        cache:'false',
        views: {
          'job-apply': {
            templateUrl: 'templates/position/job-apply.html',
            controller: 'JobApply'
          }
        }
      })
      .state('job-invite', {
        url: '/job-invite',
        cache:'false',
        parent: 'tab.position',
        views: {
          'job-invite': {
            templateUrl: 'templates/position/job-invite.html',
            controller: 'JobInvite'
          }
        }
      })
      .state('job-entry', {
        url: '/job-entry',
        cache:'false',
        parent: 'tab.position',
        views: {
          'job-entry': {
            templateUrl: 'templates/position/job-entry.html',
            controller: 'JobEntry'
          }
        }
      })
      .state('job-refuse', {
        url: '/job-refuse',
        cache:'false',
        parent: 'tab.position',
        views: {
          'job-refuse': {
            templateUrl: 'templates/position/job-refuse.html',
            controller: 'JobRefuse'
          }
        }
      })
      //user 我的
      .state('tab.user', {
        url: '/user',
        views: {
          'tab-user': {
            templateUrl: 'templates/user/user.html',
            controller: 'UserCtrl'
          }
        }
      })
      //hubs 个人中心
      .state('tab.hubs', {
        url: '/hubs',
        views: {
          'tab-user': {
            templateUrl: 'templates/user/hubs.html',
            controller: 'HubsCtrl'
          }
        }
      })
      //reume 我的简历
      .state('tab.reume', {
        url: '/reume',
        views: {
          'tab-user': {
            templateUrl: 'templates/user/reume.html',
            controller: 'ResumeCtrl'
          }
        }
      })
      //coures 兼职历程
      .state('tab.coures', {
        url: '/coures',
        views: {
          'tab-user': {
            templateUrl: 'templates/user/coures.html',
            controller: 'CouresCtrl'
          }
        }
      })
      //collection 兼职收藏
      .state('tab.collection', {
        url: '/collection',
        views: {
          'tab-user': {
            templateUrl: 'templates/user/collection.html',
            controller: 'CollectionCtrl'
          }
        }
      })
      //about 关于我们
      .state('tab.about', {
        url: '/about',
        views: {
          'tab-user': {
            templateUrl: 'templates/user/about.html',
            controller: 'AboutCtrl'
          }
        }
      })
  });
