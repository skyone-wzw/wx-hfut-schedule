// miniprogram/pages/selfInfo/selfInfo.js

const app = getApp()

Page({
  data: {
    selfinfo: {},
    userinfo: {},
    nickname: '',
    isstudent: false,
  },


  onLoad: function (options) {
    this.getData();
  },

  getData: function () {
    this.setData({
      selfinfo: app.globalData.selfinfo || {},
      userinfo: app.globalData.userinfo || {},
      nickname: app.globalData.userinfo.nickName || "",
      isstudent: app.globalData.isstudent || false
    })
  },

  onPullDownRefresh: function () {
    this.getData();
    wx.stopPullDownRefresh();
  },
})