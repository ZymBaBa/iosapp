angular.module('starter.PromptService', [])
//GPS服务
  .factory('GpsService', ['$cordovaGeolocation', '$rootScope', function ($cordovaGeolocation, $rootScope) {
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
            postGps.lat = postion.coords.latitude;
            postGps.lng = postion.coords.longitude;
            $rootScope.$broadcast('getGps.update')
          },function (err) {
            //拒绝定位后，默认的城市为嘉兴；
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
  //用户弹框提示
  .factory('PromptService', ['$ionicLoading', '$timeout', function ($ionicLoading, $timeout) {
    return {
      PromptMsg: function (msg) {
        $ionicLoading.show({
          template: msg,
          noBackdrop: true,
          delay: 500
        });
        $timeout(function () {
          $ionicLoading.hide()
        }, 1500);
      }
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
      get: function (reAddress,reParameter) {
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
    $rootScope.postJudge =[];
    return {
      postOperation: function (address, recruitId) {
        var postOperationUrl = $resource(apiUrl+address, {}, {
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
    $rootScope.messageJudge =[];
    return {
      postOperation: function (address, messageId) {
        var messageOperationUrl = $resource(apiUrl+address, {}, {
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
      login: function (username, password,locationLng,locationLat) {
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
  }]);
