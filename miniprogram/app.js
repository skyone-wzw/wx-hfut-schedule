//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {
      initing: true,
      connected: false,
      loading: false,
      isstudent: false,
      isuser: false,
      thisweek: 1,
      username: undefined,
      userinfo: {},
      selfinfo: {},
      openid: undefined,
      setting: undefined,
      server: "https://api.skyone.host:3200"
    }

    //登录相关函数
    this.loginTools = {
      //写入userInfo到globalData
      setUserInfoSync: (userinfo) => {
        this.globalData.userinfo = userinfo;
        this.globalData.username = userinfo.nickName;
        this.globalData.isuser = true;
        //缓存
        wx.setStorage({
          data: userinfo,
          key: 'userinfo',
          success: () => {
            wx.setStorage({
              data: true,
              key: 'isuser'
            })
          }
        })
      },
      setUserInfo: (e = { userinfo, success: () => { } }) => {
        const callback = e.success;
        //写入userInfo到globalData
        this.globalData.userinfo = e.userinfo;
        this.globalData.username = e.userinfo.nickName;
        this.globalData.isuser = true;
        //缓存
        wx.setStorage({
          data: e.userinfo,
          key: 'userinfo',
          success: () => {
            wx.setStorage({
              data: true,
              key: 'isuser'
            })
          }
        })
        callback();
      },

      setSelfInfoSync: (selfinfo) => {
        //写入selfinfo到globalData
        this.globalData.selfinfo = selfinfo;
        this.globalData.username = selfinfo.name;
        this.globalData.isstudent = true;
        //缓存
        wx.setStorage({
          data: selfinfo,
          key: 'selfinfo',
          success: () => {
            wx.setStorage({
              data: true,
              key: 'isstudent'
            })
          }
        })
      },
      setSelfInfo: (e = { selfinfo, success: () => { } }) => {
        const callback = e.success;
        //写入selfinfo到globalData
        this.globalData.selfinfo = e.selfinfo;
        this.globalData.username = e.selfinfo.name;
        this.globalData.isstudent = true;
        //缓存
        wx.setStorage({
          data: e.selfinfo,
          key: 'selfinfo',
          success: () => {
            wx.setStorage({
              data: true,
              key: 'isstudent'
            })
          }
        })
        callback();
      },

      //使用云函数获取openid
      getOpenid: async (success) => {
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: (res) => {
            let openid = res.result.openid
            console.log('[云函数] [login] user openid: ', openid);
            this.globalData.openid = openid;
            if (success) {
              success(openid);
            }
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err);
          }
        })
      },
    }
    //数据相关函数
    this.dataTools = {
      getSchedule: async (e = { success: () => { } }) => {
        if (this.globalData.initing) {
          setTimeout(() => {
            this.dataTools.getSchedule(e)
          }, 100);
        } else {
          if (this.globalData.isuser && this.globalData.isstudent) {
            this.globalData.loading = true;
            const callback = () => {
              this.globalData.loading = false;
              e.success();
            };
            const db = wx.cloud.database();
            const thisTime = new Date();
            wx.getStorageInfo({
              success: async (result) => {
                if (result.keys.indexOf("weektable") === -1) {
                  db.collection("static").where({
                    "type": "week table"
                  }).get({
                    success: (res) => {
                      if (res.data.length > 0) {
                        wx.setStorageSync('weektable', res.data[0].data);
                        ///////////////////////////////////////////
                        //  这里是周数的计算 每学期不一样 需要及时修改  //
                        ///////////////////////////////////////////
                        this.globalData.thisweek = res.data[0].data[thisTime.getFullYear()][thisTime.getMonth() + 1][thisTime.getDay()][0];
                        if (this.globalData.thisweek > 20 || this.globalData.thisTime < 1) this.globalData.thisweek = 1;
                        ///////////////////////////////////////////
                        if (result.keys.indexOf("lasttime") !== -1) {
                          if (wx.getStorageSync('lasttime') !== this.globalData.thisweek) {
                            this.dataTools.updateSchedule({ success: callback });
                          } else {
                            if (result.keys.indexOf("schedule") === -1 || result.keys.indexOf("timetable") === -1) {
                              this.dataTools.updateSchedule({ success: callback });
                            } else {
                              callback();
                              // FIXME
                              // this.dataTools.getScheduleFromLocal({ success: callback });
                            }
                          }
                        } else {
                          this.dataTools.updateSchedule({ success: callback });
                        }
                      } else {
                        db.collection("errorLog").add({
                          usecode: this.globalData.selfinfo.userCode || "",
                          name: this.globalData.username,
                          time: new Date(),
                          error: res,
                          msg: "获取周表失败"
                        })
                      }
                    },
                    fail: () => (err) => {
                      db.collection("errorLog").add({
                        usecode: this.globalData.selfinfo.userCode || "",
                        name: this.globalData.username,
                        time: new Date(),
                        error: err,
                        msg: "获取周表失败"
                      })
                    }
                  })
                } else {
                  const weektable = wx.getStorageSync('weektable');
                  ///////////////////////////////////////////
                  //  这里是周数的计算 每学期不一样 需要及时修改  //
                  ///////////////////////////////////////////
                  this.globalData.thisweek = weektable[thisTime.getFullYear()][thisTime.getMonth() + 1][thisTime.getDay()][0];
                  if (this.globalData.thisweek > 20 || this.globalData.thisTime < 1) this.globalData.thisweek = 1;
                  ///////////////////////////////////////////
                  if (result.keys.indexOf("lasttime") !== -1) {
                    if (wx.getStorageSync('lasttime') !== this.globalData.thisweek) {
                      this.dataTools.updateSchedule({ success: callback })
                    } else {
                      if (result.keys.indexOf("schedule") === -1 || result.keys.indexOf("timetable") === -1) {
                        this.dataTools.updateSchedule({ success: callback });
                      } else {
                        callback();
                        // FIXME
                        // this.dataTools.getScheduleFromLocal({ success: callback });
                      }
                    }
                  } else {
                    this.dataTools.updateSchedule({ success: callback });
                  }
                }
              }
            })
          } else {
            e.success();
          }
        }
      },
      updateSchedule: async (e = { success: () => { } }) => {
        const callback = e.success;
        const db = wx.cloud.database();
        wx.request({
          url: this.globalData.server + '/login',
          data: {
            username: this.globalData.selfinfo.userCode,
            vpnpassword: this.globalData.selfinfo.vpnpassword,
            password: this.globalData.selfinfo.password
          },
          method: "GET",
          success: (res) => {
            const token = res.data.token;
            if (res.data.status === 0) {
              wx.request({
                url: this.globalData.server + '/schedule',
                data: {
                  username: this.globalData.selfinfo.userCode,
                  token: token
                },
                method: "GET",
                success: (res) => {
                  if (res.data.status === 0) {
                    const schedule = res.data.data;
                    wx.setStorage({
                      data: schedule.schedule,
                      key: 'schedule',
                      success: () => {
                        wx.setStorage({
                          data: schedule.timeTable,
                          key: 'timetable',
                          success: () => {
                            wx.setStorage({
                              data: this.globalData.thisweek,
                              key: 'lasttime'
                            })
                            callback();
                          },
                          fail: (err) => {
                            db.collection("errorLog").add({
                              usecode: this.globalData.selfinfo.userCode || "",
                              name: this.globalData.username,
                              time: new Date(),
                              error: err,
                              msg: "缓存时间表失败"
                            })
                          }
                        })
                      },
                      fail: (err) => {
                        db.collection("errorLog").add({
                          usecode: this.globalData.selfinfo.userCode || "",
                          name: this.globalData.username,
                          time: new Date(),
                          error: err,
                          msg: "缓存课程表失败"
                        })
                      }
                    })
                  } else {
                    db.collection("errorLog").add({
                      usecode: this.globalData.selfinfo.userCode || "",
                      name: this.globalData.username,
                      time: new Date(),
                      error: res,
                      msg: "获取课程表失败"
                    })
                  }
                },
                fail: (err) => {
                  db.collection("errorLog").add({
                    usecode: this.globalData.selfinfo.userCode || "",
                    name: this.globalData.username,
                    time: new Date(),
                    error: res,
                    msg: "获取课程表失败，可能是网络错误"
                  })
                }
              })
            } else {
              //登录错误处理
              db.collection("errorLog").add({
                usecode: this.globalData.selfinfo.userCode || "",
                name: this.globalData.username,
                time: new Date(),
                error: res,
                msg: "登录失败"
              })
            }
          }
        })
      },
      // getScheduleFromLocal: async (e = { weektable: {}, success: () => { } }) => {}
    }
    this.functionTools = {

    }

    this.initData = async (e = { success: () => { } }) => {
      const callback = () => {
        this.globalData.initing = false;
        e.success();
      };
      //获取用户授权信息
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            //已经授权，直接获取用户信息
            wx.getUserInfo({
              success: res => {
                //写入globalData
                this.loginTools.setUserInfoSync(res.userInfo);
                //缓存头像
                const fsm = wx.getFileSystemManager();
                fsm.access({
                  path: `${wx.env.USER_DATA_PATH}/user/`,
                  success: () => {
                    wx.downloadFile({
                      url: res.userInfo.avatarUrl,
                      filePath: `${wx.env.USER_DATA_PATH}/user/avatar.jpg`,
                    });
                  },
                  fail: () => {
                    fsm.mkdir({
                      dirPath: `${wx.env.USER_DATA_PATH}/user/`,
                      success: () => {
                        wx.downloadFile({
                          url: res.userInfo.avatarUrl,
                          filePath: `${wx.env.USER_DATA_PATH}/user/avatar.jpg`,
                        });
                      }
                    })
                  }
                })
                //获取openid
                this.loginTools.getOpenid((openid) => {
                  //从云数据库获取selfinfo
                  const db = wx.cloud.database()
                  db.collection("users").where({
                    _openid: openid,
                  }).get({
                    success: res => {
                      if (res.data.length >= 1) {
                        if ("name" in res.data[0].selfInfo) {
                          this.loginTools.setSelfInfoSync(res.data[0].selfInfo)
                          callback();
                        } else {
                          if (res.data[0].name != this.globalData.userInfo.nickName) {
                            db.collection("users").doc(res.data[0]._id).update({
                              data: {
                                name: this.globalData.userinfo.nickName,
                                selfInfo: this.globalData.selfinfo
                              }
                            })
                          }
                          wx.setStorage({
                            key: "isstudent",
                            data: false,
                            complete: () => {
                              wx.setStorage({
                                key: "selfinfo",
                                data: {}
                              })
                            }
                          });
                          callback();
                        }
                      } else {
                        db.collection("users").add({
                          data: {
                            name: this.globalData.userinfo.nickName,
                            selfInfo: this.globalData.selfinfo
                          }
                        });
                        wx.setStorage({
                          key: "isstudent",
                          data: false,
                          complete: () => {
                            wx.setStorage({
                              key: "selfinfo",
                              data: {}
                            })
                          }
                        });
                        callback();
                      }
                    }
                  })
                })
              }
            })
          } else {
            // 未授权，缓存
            wx.setStorage({
              key: "schedule",
              data: {},
              complete: () => {
                wx.setStorage({
                  key: "timetable",
                  data: {},
                  complete: () => {
                    wx.setStorage({
                      key: "lasttime",
                      data: 0,
                      complete: () => {
                        wx.setStorage({
                          key: "selfinfo",
                          data: {},
                          complete: () => {
                            wx.setStorage({
                              key: "userinfo",
                              data: {},
                              complete: () => {
                                wx.setStorage({
                                  key: "isstudent",
                                  data: false,
                                  complete: () => {
                                    wx.setStorage({
                                      key: "isuser",
                                      data: false,
                                      complete: () => {
                                        callback()
                                      }
                                    })
                                  }
                                })
                              }
                            })
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        },
      });
      const fsm = wx.getFileSystemManager();
      const saveFile = () => {
        const imgurl = [
          "https://tc.skyone.host/skyone-for-wx/detail-img/00.png",
          "https://tc.skyone.host/skyone-for-wx/detail-img/01.png",
          "https://tc.skyone.host/skyone-for-wx/detail-img/02.png",
          "https://tc.skyone.host/skyone-for-wx/detail-img/03.png",
        ];
        let index = 0;
        for (const url of imgurl) {
          wx.downloadFile({
            url: url,
            filePath: `${wx.env.USER_DATA_PATH}/schedule/${index}.png`,
            success: (res) => {
              console.log(res);
            },
            fail: (err) => {
              console.log(err);
            }
          });
          index++;
        }
      }
      fsm.access({
        path: `${wx.env.USER_DATA_PATH}/schedule/`,
        success: () => {
          fsm.readdir({
            dirPath: `${wx.env.USER_DATA_PATH}/schedule/`,
            success: (result) => {
              if (result.files.length = 0) {
                saveFile();
              }
            }
          })
        },
        fail: () => {
          fsm.mkdir({
            dirPath: `${wx.env.USER_DATA_PATH}/schedule/`,
            recursive: true,
            success: saveFile
          })
        }
      });
    }
    this.initDataFromLocal = async (e = { success: () => { } }) => {
      const callback = () => {
        this.globalData.initing = false;
        e.success()
      };
      wx.getStorageInfo({
        success: (res) => {
          if (res.keys.indexOf("userinfo") !== -1 &&
            res.keys.indexOf("isuser") !== -1) {
            this.globalData.userinfo = wx.getStorageSync("userinfo");
            this.globalData.isuser = wx.getStorageSync("isuser");
            const fsm = wx.getFileSystemManager();
            fsm.access({
              path: `${wx.env.USER_DATA_PATH}/user/`,
              success: () => {
                fsm.readdir({
                  dirPath: `${wx.env.USER_DATA_PATH}/user/`,
                  success: (result) => {
                    if (result.files.indexOf("avatar.jpg") !== -1) {
                      this.globalData.userinfo.avatarUrl = `${wx.env.USER_DATA_PATH}/user/avatar.jpg`
                    }
                  }
                })
              },
            })
            if (res.keys.indexOf("selfinfo") !== -1 &&
              res.keys.indexOf("isstudent") !== -1
            ) {
              this.globalData.isstudent = wx.getStorageSync("isstudent");
              this.globalData.selfinfo = wx.getStorageSync("selfinfo");
            }
            this.globalData.username = this.globalData.selfinfo.name || this.globalData.userinfo.nickName;
          }
          callback()
        },
      });
    }

    this.flush = (e = { success: () => { } }) => {
      const callback = e.success
      wx.getNetworkType({
        success: (result) => {
          if (result.networkType != "none") {
            if (!this.globalData.isstudent) {
              if (this.globalData.isuser) {
                //从云数据库获取selfinfo
                const db = wx.cloud.database()
                db.collection("users").where({
                  _openid: this.globalData.openid,
                }).get({
                  success: res => {
                    if (res.data.length >= 1) {
                      if ("name" in res.data[0].selfInfo) {
                        this.globalData.selfinfo = res.data[0].selfInfo;
                        this.globalData.username = res.data[0].selfInfo.name;
                        this.globalData.isstudent = true;
                      }
                      callback();
                    }
                  }
                })
              } else {
                this.initData(e);
              }
            } else {
              callback();
            }
          } else {
            this.initDataFromLocal(e)
          }
        },
      })
    }

    wx.getNetworkType({
      success: (result) => {
        if (result.networkType != "none") {
          //网络连接正常
          this.initData({ success: this.dataTools.getSchedule })
        } else {
          //未连接网络，使用本地缓存
          this.initDataFromLocal()
        }
      },
    })
  }
})
