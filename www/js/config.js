angular.module('starter.config', [])
  .constant("YW", {
    //常规的配置项
    "debug": false,
    "api": "https://www.icewnet.com/app/api/",
    "imgUrl": "",
    "version": "1.0",
    "userKey": "user",
    "cityKey": "city",
    "provinceKey": "province",
    /*状态
     * 1、APPLYING 申请中
     * 2、WAIT 待入职
     * 3、SUCCESS 通过/入职
     * 4、FAIL 未通过/未入职
     * 5、CANCEL 取消*/
    "applyList": ['APPLYING', 'WAIT', 'SUCCESS', 'FAIL', 'CANCEL','ALL'],
    /*操作
     * 0、interviewApply/cancel 取消申请
     * 1、checkin/reject 拒绝入职
     * 2、checkin/accept 接受入职
     * 3、checkin/del 删除入职
     * 4、interview/reject 拒绝面试*/
    "postOperationAdd": ['interviewApply/cancel', 'checkin/reject', 'checkin/accept', 'checkin/del', 'interview/reject'],
    /*列表
     *0、岗位申请列表
     * 1、待面试列表
     * 2、待入职列表
     * 3、拒绝面试/入职列表*/
    "objList": ['interviewApply/list', 'interview/list', 'checkin/list','message/recommend/list']
  });


