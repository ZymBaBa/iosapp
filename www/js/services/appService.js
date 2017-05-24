angular.module('starter.PromptService', [])
//GPS服务
  .factory('GpsService', ['$ionicPlatform', '$cordovaGeolocation', '$rootScope', function ($ionicPlatform,$cordovaGeolocation, $rootScope) {
    var postGps = {
      lat: '',
      lng: ''
    };
    return {
      setGps: function () {
          var posOptions = {timeout: 10000, enableHighAccuracy: false};
          $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (postion) {
              if('coords' in postion){
                postGps.lat = postion.coords.latitude;
                postGps.lng = postion.coords.longitude;
                $rootScope.$broadcast('getGps.update')
              }
            }, function (err) {
              postGps.lat = 30.744837;
              postGps.lng = 120.76092;
              $rootScope.$broadcast('getGps.update')
            })
      },
      getGps: function () {
        return postGps;
      }
    }
  }])



  //   .factory('GpsService', ['$cordovaGeolocation', '$rootScope', function ($cordovaGeolocation, $rootScope) {
  //     var postGps = {
  //       lat: '',
  //       lng: ''
  //     };
  //     return {
  //       setGps: function () {
  //         var posOptions = {timeout: 10000, enableHighAccuracy: false};
  //         $cordovaGeolocation
  //           .getCurrentPosition(posOptions)
  //           .then(function (postion) {
  //             postGps.lat = postion.coords.latitude;
  //             postGps.lng = postion.coords.longitude;
  //             $rootScope.$broadcast('getGps.update')
  //           }, function (err) {
  //             postGps.lat = 30.744837;
  //             postGps.lng = 120.76092;
  //             $rootScope.$broadcast('getGps.update')
  //           })
  //       },
  //       getGps: function () {
  //         return postGps;
  //       }
  //     }
  //   }])
  //   .factory('GpsService', ['$rootScope', function ($rootScope) {
  //     var postGps = {
  //       lat: '',
  //       lng: ''
  //     };
  //     return {
  //       setGps: function () {
  //         var map, geolocation;
  //         //加载地图，调用浏览器定位服务
  //         map = new AMap.Map('container', {
  //           resizeEnable: true
  //         });
  //         map.plugin('AMap.Geolocation', function () {
  //           geolocation = new AMap.Geolocation({
  //             enableHighAccuracy: true,//是否使用高精度定位，默认:true
  //             timeout: 10000,          //超过10秒后停止定位，默认：无穷大
  //             buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
  //             zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
  //             buttonPosition: 'RB'
  //           });
  //           map.addControl(geolocation);
  //           geolocation.getCurrentPosition();
  //           AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
  //           AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
  //         });
  //         //解析定位结果
  //         function onComplete(data) {
  //           postGps.lat = data.position.getLat();
  //           postGps.lng = data.position.getLng();
  //           console.log(data);
  //           $rootScope.$broadcast('getGps.update')
  //         }
  //         //解析定位错误信息
  //         function onError(data) {
  //           // postGps.lat = 30.744837;
  //           // postGps.lng = 120.76092;
  //           // $rootScope.$broadcast('getGps.update')
  //         }
  //       },
  //       getGps: function () {
  //         return postGps;
  //       }
  //     }
  //   }])
  //用户弹框提示
  .factory('PromptService', ['$ionicLoading', '$timeout', function ($ionicLoading, $timeout) {
    return {
      PromptMsg: function (msg) {
        $ionicLoading.show({
          template: msg,
          noBackdrop: true,
          delay: 500
        });
        // $rootScope.$broadcast('prompt:show')
        $timeout(function () {
          $ionicLoading.hide();
        }, 3000);
      }
      // PromptStrop:function () {
      // return  $timeout(function () {
      //     $ionicLoading.hide();
      //   }, 3000);
      // }
    }
  }])
  //将信息存入localStorage,key为名称，data为相应缓存的值
  .factory('Storage', function () {
    return {
      //在缓存中存入key及相应的data的值，并且将其保存成JSON格式
      set: function (key, data) {
        return window.localStorage.setItem(key, window.JSON.stringify(data));
      },
      //将缓存中的key(对象)取出来
      get: function (key) {
        return window.JSON.parse(window.localStorage.getItem(key));
      },
      //移除缓存中的key（对象）
      remove: function (key) {
        return window.localStorage.removeItem(key);
      }
    };
  })
  //岗位申请管理服务
  .factory('applyService', ['YW', '$resource', '$rootScope', function (YW, $resource, $rootScope) {
    var apiUrl = YW.api;
    $rootScope.placeItem = [];
    return {
      get: function (reAddress, reParameter) {
        var getList = $resource(apiUrl + reAddress, {}, {
          getApply: {
            url: apiUrl + reAddress,
            method: 'GET',
            params: {status: '@status'},
            isArray: false
          }
        });
        getList.getApply(apiUrl + reAddress, {status: reParameter}, function (resp) {
          $rootScope.placeItem = resp.rows;
          $rootScope.$broadcast('apply.list');
        })
      },
      set: function () {
        return $rootScope.placeItem;
      }
    }
  }])
  //申请中、待面试、被拒绝根据ID和地址封装服务，只传ID的服务
  .factory('postOperationService', ['YW', '$resource', '$rootScope', function (YW, $resource, $rootScope) {
    var apiUrl = YW.api;
    $rootScope.postJudge = [];
    return {
      postOperation: function (address, recruitId) {
        var postOperationUrl = $resource(apiUrl + address, {}, {
          postApply: {
            url: apiUrl + address,
            method: 'POST',
            isArray: false
          }
        });
        postOperationUrl.postApply(apiUrl + address, {recruitId: recruitId}, function (resp) {
          $rootScope.postJudge = resp;
          console.log($rootScope.postJudge);
        });
        $rootScope.$broadcast('post.Operation')
      },
      postNotice: function () {
        return $rootScope.postJudge;
      }
    }
  }])
  //信息处理（信息删除）
  .factory('messageOperationService', ['YW', '$resource', '$rootScope', function (YW, $resource, $rootScope) {
    var apiUrl = YW.api;
    $rootScope.messageJudge = [];
    return {
      postOperation: function (address, messageId) {
        var messageOperationUrl = $resource(apiUrl + address, {}, {
          postApply: {
            url: apiUrl + address,
            method: 'POST',
            isArray: false
          }
        });
        messageOperationUrl.postApply(apiUrl + address, {id: messageId}, function (resp) {
          $rootScope.messageJudge = resp;
          console.log($rootScope.messageJudge);
        });
        $rootScope.$broadcast('post.messageOperation')
      },
      postNotice: function () {
        return $rootScope.messageJudge;
      }
    }
  }])
  //用户登录
  .factory('User', ['YW', '$resource', 'Storage', '$rootScope', function (YW, $resource, Storage, $rootScope) {
    var apiUrl = YW.api;
    var storageKey = 'user';
    var resource = $resource(apiUrl + 'login');
    var user = Storage.get(storageKey) || {};
    // var user ='';
    return {
      login: function (username, password, locationLng, locationLat) {
        return resource.save({}, {
          userName: username,
          password: password,
          lng: locationLng,
          lat: locationLat
        }, function (response) {
          console.log(response);
          user = response;
          // user=response.result
          $rootScope.$broadcast('User.loginUpdated');
        });
      },
      logout: function () {
        user = {};
        Storage.remove(storageKey);
      },
      getCurrentUser: function () {
        return user;
      }
    };
  }])
  .factory('locationType', ['YW', '$resource', function (YW, $resource) {
    //获取用户坐标
    //获取用户坐标信息
  }])
  .factory('userCity', ['YW', '$resource', function (YW, $resource) {
    //获取用户城市
    //从前端提交坐标上来获取城市信息，然后return出去
  }])
  .factory('homeItem', ['YW', '$resource', function (YW, $resource) {
    var apiUrl = YW.api;
    var items = [];
    var resource = $resource(apiUrl + 'recruit/list', {}, {
      query: {
        method: 'get',
        params: {
          id: '@id',
          locationLng: '@locationLng',
          locationLat: '@locationLat'
        },
        timeout: 2000
      }
    });
    return {
      logItem: function (type) {
        resource.query({
          id: type.id,
          locationLng: type.locationLng,
          locationLat: type.locationLat
        }, function (resp) {
          items = resp.rows
        })
      },
      getItem: function () {
        if (items === undefined) {
          return false
        }
        return items
      }
    }
  }])
  .factory('CategoryFactory', ['YW', "$resource", '$rootScope', function (YW, $resource, $rootScope) {
    var apiUrl = YW.api;
    var cateItems = [];
    var postItems = [];
    var resource = {
      cateRes: $resource(apiUrl + 'position/type/list'),
      postRes: $resource(apiUrl + 'position/list')
    };
    return {
      CateItem: function () {
        resource.cateRes.get(function (resp) {
          cateItems = resp.rows;
          $rootScope.$broadcast('cateGory.list')
        })
      },
      PostItem: function () {
        resource.postRes.get(function (resp) {
          postItems = resp.rows;
          $rootScope.$broadcast('postGory.list')
        })
      },
      getCate: function () {
        return cateItems;
      },
      getPost: function () {
        return postItems;
      }
    }
  }])
  //极光推送服务
  .factory('jpushService', ['$http', '$window', '$document', function ($http, $window, $document) {
    var jpushServiceFactory = {};
    // var jpushapi=$window.plugins.jPushPlugin;
    //启动极光推送
    var _init = function (config) {
      $window.plugins.jPushPlugin.init();
      //设置tag和Alias触发事件处理
      document.addEventListener('jpush.setTagsWithAlias', config.stac, false);
      //打开推送消息事件处理
      $window.plugins.jPushPlugin.openNotificationInAndroidCallback = config.oniac;
      $window.plugins.jPushPlugin.setDebugMode(true);
    };
    //获取状态
    var _isPushStopped = function (fun) {
      $window.plugins.jPushPlugin.isPushStopped(fun)
    };

    //停止极光推送
    var _stopPush = function () {
      $window.plugins.jPushPlugin.stopPush();
    };

    //重启极光推送
    var _resumePush = function () {
      $window.plugins.jPushPlugin.resumePush();
    };

    //设置标签和别名
    var _setTagsWithAlias = function (tags, alias) {
      $window.plugins.jPushPlugin.setTagsWithAlias(tags, alias);
    };

    //设置标签
    var _setTags = function (tags) {
      $window.plugins.jPushPlugin.setTags(tags);
    };

    //设置别名
    var _setAlias = function (alias) {
      $window.plugins.jPushPlugin.setAlias(alias);
    };

    jpushServiceFactory.init = _init;
    jpushServiceFactory.isPushStopped = _isPushStopped;
    jpushServiceFactory.stopPush = _stopPush;
    jpushServiceFactory.resumePush = _resumePush;

    jpushServiceFactory.setTagsWithAlias = _setTagsWithAlias;
    jpushServiceFactory.setTags = _setTags;
    jpushServiceFactory.setAlias = _setAlias;

    return jpushServiceFactory;
  }]);
