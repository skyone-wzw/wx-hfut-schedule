//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    name: "点击授权",
    userinfo: {},
    isuser: false,
    isstudent: false,
  },

  onLoad: function () {
    this.getData();
    if (!this.data.isstudent) {
      setTimeout(() => {
        this.getData()
      }, 500)
    }
  },


  onShow: function () {
    if (!this.data.isstudent && this.data.isuser) {
      app.flush({ success: this.getData })
    }
  },

  getData: function () {
    this.setData({
      "name": app.globalData.username,
      "avatarUrl": app.globalData.userinfo.avatarUrl,
      "userinfo": app.globalData.userinfo,
      "isuser": app.globalData.isuser,
      "isstudent": app.globalData.isstudent
    })
  },

  onPullDownRefresh: function () {
    app.flush({
      success: () => {
        this.getData();
        wx.stopPullDownRefresh()
      }
    });
  },

  onGetUserInfo: function (e) {
    if (app.globalData.isuser) {
      if (!app.globalData.isstudent) {
        wx.navigateTo({
          url: '../bindStudentCount/bindStudentCount'
        })
      }
    } else {
      app.flush({ success: this.getData });
    }
  },

  onShowSelfInfo: function (e) {
    if (app.globalData.isuser) {
      if (app.globalData.isstudent) {
        wx.navigateTo({
          url: '../selfInfo/selfInfo'
        })
      } else {
        wx.navigateTo({
          url: '../bindStudentCount/bindStudentCount'
        })
      }
    } else {
      app.flush({ success: this.getData });
    }
  },

  //清空本地缓存
  cleanData: function () {
    wx.clearStorageSync()
  },

  test: function() {
    wx.showModal()
  }
})
