// miniprogram/pages/bindStudentCount/bindStudentCount.js
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userCode: '',
        vpnpsd: '',
        psd: '',
        msg: '',
        usernameLengthErrorToast: false,
        msgToast: false,
        loading: false,
    },


    bindInputUserCode: function (e) {
        this.setData({
            userCode: e.detail.value,
        })
    },
    bindInputVpnPsd: function (e) {
        this.setData({
            vpnpsd: e.detail.value,
        })
    },
    bindInputPsd: function (e) {
        this.setData({
            psd: e.detail.value,
        })
    },

    onSubmit: function () {
        const db = wx.cloud.database();
        if (app.globalData.isstudent) {
            wx.navigateBack();
        } else {
            if (this.data.userCode.length === 10) {
                //学号长度正确
                if (this.data.vpnpsd.length > 5 && this.data.psd.length > 5) {
                    //密码长度正确
                    //开始加载
                    this.setData({
                        loading: true
                    })
                    wx.request({
                        url: app.globalData.server + "/selfinfo",
                        data: {
                            username: this.data.userCode,
                            vpnpassword: this.data.vpnpsd,
                            password: this.data.psd
                        },
                        method: "GET",
                        success: (res) => {
                            if (res.data.success) {
                                //取消加载弹窗
                                this.setData({
                                    loading: false
                                })
                                if (res.data.data.class != "城市地下20-5班") {
                                    this.openMsgToast("抱歉，本小程序目前仅为城建五班服务")
                                } else {
                                    this.putDataToCloud(res.data.data);
                                }
                            } else {
                                wx.request({
                                    url: app.globalData.server + "/login",
                                    data: {
                                        username: this.data.userCode,
                                        vpnpassword: this.data.vpnpsd,
                                        password: this.data.psd
                                    },
                                    method: "GET",
                                    success: (res) => {
                                        if (res.data.status === 0) {
                                            wx.request({
                                                url: app.globalData.server + "/selfinfo",
                                                data: {
                                                    username: this.data.userCode,
                                                    vpnpassword: this.data.vpnpsd,
                                                    password: this.data.psd
                                                },
                                                method: "GET",
                                                success: (res) => {
                                                    //取消加载弹窗
                                                    this.setData({
                                                        loading: false
                                                    })
                                                    if (res.data.success) {
                                                        if (res.data.data.class != "城市地下20-5班") {
                                                            this.openMsgToast("抱歉，本小程序目前仅为城建五班服务")
                                                        } else {
                                                            this.putDataToCloud(res.data.data);
                                                        }
                                                    } else {
                                                        this.openMsgToast(res.data.msg);
                                                    }
                                                },
                                                fail: (err) => {
                                                    //取消加载弹窗
                                                    this.setData({
                                                        loading: false
                                                    })
                                                    this.openMsgToast("登陆失败，请检查网络连接");
                                                    db.collection("errorLog").add({
                                                        usecode: this.globalData.selfinfo.userCode || "",
                                                        name: this.globalData.username,
                                                        time: new Date(),
                                                        error: err,
                                                        msg: "登录失败，可能是网络错误"
                                                    })
                                                }
                                            })
                                        } else {
                                            //取消加载弹窗
                                            this.setData({
                                                loading: false
                                            })
                                            this.openMsgToast(res.data.msg);
                                        }
                                    },
                                    fail: (res) => {
                                        //取消加载弹窗
                                        this.setData({
                                            loading: false
                                        })
                                        this.openMsgToast("登陆失败，请检查网络连接");
                                        db.collection("errorLog").add({
                                            usecode: this.globalData.selfinfo.userCode || "",
                                            name: this.globalData.username,
                                            time: new Date(),
                                            error: err,
                                            msg: "登录失败，可能是网络错误"
                                        })
                                    }
                                })
                            }
                        },
                        fail: (err) => {
                            //取消加载弹窗
                            this.setData({
                                loading: false
                            })
                            this.openMsgToast("登陆失败，请检查网络连接");
                            db.collection("errorLog").add({
                                usecode: this.globalData.selfinfo.userCode || "",
                                name: this.globalData.username,
                                time: new Date(),
                                error: err,
                                msg: "登录失败，可能是网络错误"
                            })
                        }
                    })
                } else {
                    this.openMsgToast("请认真填写密码！")
                }
            } else {
                this.openUsernameLengthErrorToast();
            }
        }

    },

    putDataToCloud: function (data) {
        const db = wx.cloud.database();
        db.collection("users").where({
            _openid: app.globalData.openid
        }).get({
            success: (res) => {
                if (res.data.length > 0) {
                    db.collection("users").doc(res.data[0]._id).update({
                        data: {
                            "selfInfo": data
                        },
                        success: wx.navigateBack
                    })
                } else {
                    this.openMsgToast("出现未知错误！")
                }
            },
            fail: (err) => {
                this.openMsgToast("出现未知错误！");
                db.collection("errorLog").add({
                    usecode: this.globalData.selfinfo.userCode || "",
                    name: this.globalData.username,
                    time: new Date(),
                    error: err,
                    msg: "未知错误，登录完成但无法上传到数据库"
                })
            }
        })
    },

    openUsernameLengthErrorToast: function () {
        this.setData({
            usernameLengthErrorToast: true
        });
        setTimeout(() => {
            this.setData({
                usernameLengthErrorToast: false
            });
        }, 1800);
    },

    openMsgToast: function (msg) {
        this.setData({
            msg: msg,
            msgToast: true
        });
        setTimeout(() => {
            this.setData({
                msgToast: false
            });
        }, 1800);
    },

    onLoad: function (options) {
        if (app.globalData.isstudent) {
            wx.navigateBack();
        }
    },

    onReady: function () {

    },

    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
    },
})