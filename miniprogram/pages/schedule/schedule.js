// miniprogram/pages/index/schedule/schedule.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageopacity: 0,
        showDetail: false,
        detail: {},
        opacity: 0,
        detailtop: 0,
        imgurl: [
            "https://tc.skyone.host/skyone-for-wx/detail-img/00.png",
            "https://tc.skyone.host/skyone-for-wx/detail-img/01.png",
            "https://tc.skyone.host/skyone-for-wx/detail-img/02.png",
            "https://tc.skyone.host/skyone-for-wx/detail-img/03.png",
        ],
        cursor: app.globalData.thisweek,
        schedule: {},
        timetable: {},
        url: "",
        day: (new Date()).getDay()
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const data = wx.getSystemInfoSync();
        this.setData({
            windowHeight: data.windowHeight,
            windowWidth: data.windowWidth,
            width: data.windowWidth * 0.94 / 7 - 6,
            height: data.windowHeight * 0.96 / 11 - 6,
            height2: data.windowHeight * 1.92 / 11 - 6,
            detailtop: data.windowHeight + data.windowWidth / 3
        })
        app.dataTools.getSchedule({
            success: () => {
                wx.getStorageInfo({
                    success: (res) => {
                        if (res.keys.indexOf("lasttime") !== -1 &&
                            res.keys.indexOf("schedule") !== -1 &&
                            res.keys.indexOf("timetable") !== -1) {
                            this.getData();
                        }
                    },
                })
            }
        });
        const fsm = wx.getFileSystemManager();
        fsm.access({
            path: `${wx.env.USER_DATA_PATH}/schedule/`,
            success: () => {
                fsm.readdir({
                    dirPath: `${wx.env.USER_DATA_PATH}/schedule/`,
                    success: (result) => {
                        if (result.files.length > 0) {
                            let list = [];
                            for (let filename of result.files) {
                                list[list.length] = `${wx.env.USER_DATA_PATH}/schedule/${filename}`
                            };
                            this.setData({
                                imgurl: list
                            })
                        }
                    }
                })
            },
        });
        this.loadingTest();
    },

    loadingTest: function () {
        if (app.globalData.loading) {
            wx.showLoading({
                title: '正在加载课程表',
                mask: true
            })
        } else {
            wx.hideLoading()
        }
        setTimeout(() => {
            this.loadingTest()
        }, 200);
    },

    getData: function () {
        wx.getStorageInfo({
            success: (res) => {
                if (res.keys.indexOf("schedule") !== -1 && res.keys.indexOf("timetable") !== -1) {
                    const sToI = {}
                    const eToI = {}
                    const schedule = wx.getStorageSync('schedule');
                    const timetable = wx.getStorageSync('timetable');
                    for (let i of timetable) {
                        sToI[i.startTime] = i.id
                        eToI[i.endTime] = i.id
                    }
                    this.setData({
                        sToI: sToI,
                        eToI: eToI,
                    });
                    this.setData({
                        cursor: app.globalData.thisweek
                    })
                    this.setData({
                        schedule: schedule,
                        timetable: timetable,
                    })
                }
            },
        })
    },

    leftWeek: function () {
        if (this.data.cursor > 1) {
            this.setData({
                cursor: this.data.cursor - 1
            })
        }
    },
    rightWeek: function () {
        if (this.data.cursor < 20) {
            this.setData({
                cursor: this.data.cursor + 1
            })
        }
    },
    showDetail: function (event) {
        const insert = (str1, str2, point) => { return str1.slice(0, point) + str2 + str1.slice(point) };
        if ("course" in this.data.schedule[this.data.cursor][event.currentTarget.dataset.dayindex][event.currentTarget.dataset.timeindex]) {
            let data = this.data.schedule[this.data.cursor][event.currentTarget.dataset.dayindex][event.currentTarget.dataset.timeindex];
            data.imgurl = this.data.imgurl[Math.floor(Math.random() * this.data.imgurl.length)];
            if (data.time.start.toString().length > 2 && data.time.end.toString().length > 2) {
                data.timetext = insert(data.time.start.toString(), ":", -2) + "--" + insert(data.time.end.toString(), ":", -2);
            } else {
                data.timetext = "";
            }
            this.setData({
                showDetail: true,
                detail: data
            });
            setTimeout(() => {
                this.setData({
                    opacity: 1,
                    detailtop: this.data.windowHeight / 3
                })
            }, 10)
        }
    },
    closeDetail: function () {
        this.setData({
            opacity: 0,
            detailtop: this.data.windowHeight + this.data.windowWidth / 3
        });
        setTimeout(() => {
            this.setData({
                showDetail: false
            })
        }, 600)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        if (!app.globalData.loading) {
            wx.getNetworkType({
                success: (result) => {
                    if (result.networkType == "none") {
                        wx.getStorageInfo({
                            success: (res) => {
                                if (res.keys.indexOf("lasttime") !== -1 &&
                                    res.keys.indexOf("schedule") !== -1 &&
                                    res.keys.indexOf("timetable") !== -1) {
                                    this.getData();
                                    wx.stopPullDownRefresh();
                                }
                            },
                        })
                    } else {
                        app.dataTools.getSchedule({
                            success: () => {
                                this.getData();
                                wx.stopPullDownRefresh();
                            }
                        });
                    }
                },
            })
        } else {
            wx.stopPullDownRefresh();
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})