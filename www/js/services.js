angular.module('starter.services', [])
  //文章列表
  .factory('homeFactory', ['$rootScope', '$resource', 'YW', function ($rootScope, $resource, YW) {
    var ApiUrl = YW.api,
      topics = [],
      catid = 20;
    var resource = $resource(ApiUrl, {}, {
      query: {
        method: 'get',
        params: {
          a: '@getPortalList',
          catid: '@catid',
          page: '@page'
        },
        timeout: 20000
      }
    });

    return {
      //获取第一页的数据，请求地址从外面传进来
      getTopTopic:function (type) {
        // var hasNextPage = true; //是否有下一页
        resource.query({
          a: type,
          catid: catid,
          page: 1
        }, function (data) {
          topics= data.result;

          // if (data.result.length < 20){
          //   hasNextPage = false;  //来判断是否有下一页数据
          // }
          // topics[catid]={
          //   'ngetPage':2,
          //   'hasNextPage':hasNextPage,
          //   'data':data.result
          // };
          //请求完成后，通知controller
          $rootScope.$broadcast('to-parent')
        })
      },
      getArticles:function () {
        if(topics===undefined){
          return false
        }
        return topics
      }
    }
  }])
  //文章详情
  .factory('NewsCategoryCtrlFactory',['$resource','$rootScope','YW',function ($resource,$rootScope,YW) {
    var ApiUrl=YW.api,
      topic='';
    var resource=$resource(ApiUrl,{},{
      query:{
        method:'get',
        params:{
          a:'getPortalArticle',
          aid:'@aid'
        },
        timeout:20000
      }
    });
    return{
      get:function (aid) {
        return resource.query({
          aid:aid
        },function (data) {
          topic=data.result;
          $rootScope.$broadcast('top-news')
        })
      },
      getPortal:function () {
        return topic;
      }
    }
  }]);
