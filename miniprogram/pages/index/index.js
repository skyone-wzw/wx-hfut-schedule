// miniprogram/pages/index/index.js
const app = getApp();

Page({
    data: {
        opacity: 0,
        isuser: true,
        isstudent: true,
        greet: "欢迎使用Skyone小站！",
        left: -500

    },
    greetlist: [
        ["早上好！一日之计在于晨，美好的一天就要开始了。", "早上好！又是活力满满的一天呢！"],
        ["上午好！学习顺利嘛，不要久坐，多起来走动走动哦！"],
        ["中午了，学习了一个上午，现在是午餐时间！"],
        ["午后很容易犯困呢，今天的学习目标完成了吗？"],
        ["傍晚了！窗外夕阳的景色很美丽呢～", "差不多要吃晚饭了吧，想吃些什么呢？"],
        ["晚上好，今天过得怎么样？", "晚上好，忙了一天，要好好犒劳一下自己哦~"],
        ["已经这么晚了呀，早点休息吧，晚安～", "深夜时要爱护眼睛呀！"],
        ["你是夜猫子呀？这么晚还不睡觉，明天起的来嘛？", "熬夜伤身体哦，快去睡觉吧！"]
    ],

    onLoad: function (options) {
        if (app.globalData.initing) {
            setTimeout(this.onLoad, 50);
        } else {
            this.getData();
        }
    },

    onReady: function () {

    },

    onShow: function () {
        if (!app.globalData.initing) {
            this.getData();
        }
        this.setData({
            opacity: 1,
            left: 0
        })
    },

    onHide: function () {
        this.setData({
            opacity: 0,
            left: -500
        })
    },

    onUnload: function () {

    },

    getData: function () {
        const now = new Date().getHours();
        let text = "欢迎使用Skyone小站！"
        if (now > 5 && now <= 7) text = this.greetlist[0];
        else if (now > 7 && now <= 11) text = this.greetlist[1];
        else if (now > 11 && now <= 13) text = this.greetlist[2];
        else if (now > 13 && now <= 17) text = this.greetlist[3];
        else if (now > 17 && now <= 19) text = this.greetlist[4];
        else if (now > 19 && now <= 21) text = this.greetlist[5];
        else if (now > 21 && now <= 23) text = this.greetlist[6];
        else text = this.greetlist;
        text = text[Math.floor(Math.random() * text.length)];
        this.setData({
            greet: text,
            isuser: app.globalData.isuser,
            isstudent: app.globalData.isstudent
        })
    },

    onPullDownRefresh: function () {
        app.flush({
            success: () => {
                this.getData();
                wx.stopPullDownRefresh();
            }
        })
    },

    onReachBottom: function () {

    },

    onShareAppMessage: function () {

    }
})