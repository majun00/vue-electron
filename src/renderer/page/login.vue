<template>
  <div class="login_page fillcontain">
    <transition
      name="form-fade"
      mode="in-out"
    >
      <section
        class="form_contianer"
        v-show="showLogin"
      >
        <div class="manage_tip">
          <p>后台管理系统</p>
        </div>
        <el-form
          :model="loginForm"
          :rules="rules"
          ref="loginForm"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
            ><span>dsfsf</span></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              placeholder="密码"
              v-model="loginForm.password"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm('loginForm')"
              class="submit_btn"
            >登陆</el-button>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="submitTest"
              class="submit_btn"
            >test</el-button>
          </el-form-item>
        </el-form>
        <p class="tip">温馨提示：</p>
        <p class="tip">未登录过的新用户，自动注册</p>
        <p class="tip">注册过的用户可凭账号密码登录</p>
      </section>
    </transition>
  </div>
</template>

<script>
import { login, getAdminInfo } from '@/api/getData'
import { mapActions, mapState } from 'vuex'
let trayOn = false

export default {
  data() {
    return {
      showLogin: false,
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          {
            require: true,
            message: '请输入账号',
            trigger: 'blur'
          }
        ],
        password: [
          {
            require: true,
            message: '请输入密码',
            trigger: 'blue'
          }
        ]
      }
    }
  },

  mounted() {
    this.showLogin = true
    if (!this.adminInfo.id) {
      this.getAdminData()
    }
  },

  computed: {
    ...mapState(['adminInfo'])
  },

  watch: {
    adminInfo(newValue) {
      if (newValue.id) {
        this.$message({
          type: 'success',
          message: '已登录'
        })
        this.$router.push('manage')
      }
    }
  },

  methods: {
    ...mapActions(['getAdminData']),

    async submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          const res = await login({ username: this.loginForm.username, password: this.loginForm.password })
          if (res.status == 1) {
            this.$message({
              type: 'success',
              message: '登录成功'
            })
            this.$router.push('manage')
          } else {
            this.$message({
              type: 'error',
              message: res.message
            })
          }
        } else {
          this.$notify.error({
            title: 'error',
            message: '请输入正确格式的账号密码',
            offset: 100
          })
          return false
        }
      })
    },

    submitTest() {
      // 新建窗口
      //   const { BrowserWindow } = require('electron').remote
      //   let win = new BrowserWindow({ width: 800, height: 600, frame:false })
      //   win.on('close', () => { win = null })
      //   win.loadURL('https://github.com')
      //   win.show()

      // 上下文菜单
      // const { ipcRenderer } = require('electron')
      // ipcRenderer.send('show-context-menu')

      // 在文件管理器中打开路径
      //   const { shell } = require('electron')
      //   const os = require('os')
      //   shell.showItemInFolder(os.homedir())
      // 打开外部链接
      //   shell.openExternal('http://electron.atom.io')

      // 桌面通知
      const path = require('path')
      const notification = {
        title: '通知test',
        body: '通知test内容',
        icon: path.join(__dirname, '../assets/programming.png')
      }
      const myNotification = new window.Notification(notification.title, notification)
      myNotification.onclick = () => {
        console.log('通知被点击')
      }

      // 打开文件或目录
      //   const { ipcRenderer } = require('electron')
      //   ipcRenderer.send('open-file-dialog')
      //   ipcRenderer.on('selected-directory', (event, path) => {
      //     console.log(`你已选择: ${path}`)
      //   })
      // 错误对话框
      //   ipcRenderer.send('open-error-dialog')
      // 信息对话框
      //   ipcRenderer.send('open-information-dialog')
      //   ipcRenderer.on('information-dialog-selection', (event, index) => {
      //     let message = '你已选择 '
      //     if (index === 0) message += '是.'
      //     else message += '否.'
      //     console.log(message)
      //   })
      // 保存对话框
      //   ipcRenderer.send('save-dialog')
      //   ipcRenderer.on('saved-file', (event, path) => {
      //     if (!path) path = '无路径'
      //     console.log(`已选择的路径: ${path}`)
      //   })

      // 托盘
      // const ipc = require('electron').ipcRenderer
      // if (trayOn) {
      //   trayOn = false
      //   console.log('')
      //   ipc.send('remove-tray')
      // } else {
      //   trayOn = true
      //   console.log('再次点击示例按钮移除托盘.')
      //   ipc.send('put-in-tray')
      // }
      // // 从图标上下文菜单中删除托盘
      // ipc.on('tray-removed', function () {
      //   trayOn = false
      //   console.log('')
      //   ipc.send('remove-tray')
      // })

      // 异步消息
      // const { ipcRenderer } = require('electron')
      // ipcRenderer.send('asynchronous-message', 'ping')
      // ipcRenderer.on('asynchronous-reply', (event, arg) => {
      //   console.log(`异步消息回复: ${arg}`)
      // })

      // 同步消息
      // const { ipcRenderer } = require('electron')
      // const reply = ipcRenderer.sendSync('synchronous-message', 'ping')
      // console.log(`同步消息回复: ${reply}`)

      // 与隐藏窗口通信


      // 获取应用信息
      // const { ipcRenderer } = require('electron')
      // ipcRenderer.send('get-app-path')
      // ipcRenderer.on('got-app-path', (event, path) => {
      //   console.log(`当前应用程序位于: ${path}`)
      // })

      // 获取版本信息
      // const electronVersion = process.versions.electron
      // console.log(`当前应用正在使用的 Electron 版本: ${electronVersion}`)
      // 返回正在使用的 Chromium 版本 process.versions.chrome
      // 返回正在使用的 V8 版本 process.versions.v8
      // 返回正在使用的 Node 版本 process.versions.node

      // 获取系统信息
      // const os = require('os')
      // const homeDir = os.homedir()
      // console.log(`当前系统主目录是: ${homeDir}`)

      // 获取屏幕信息
      // const { screen } = require('electron')
      // const size = screen.getPrimaryDisplay().size
      // console.log(`当前屏幕是: ${size.width}px x ${size.height}px`)

      // 打印到PDF
      // const { ipcRenderer } = require('electron')
      // ipcRenderer.send('print-to-pdf')
      // ipcRenderer.on('wrote-pdf', (event, path) => {
      //   console.log(`PDF 保存到: ${path}`)
      // })

      // 屏幕截屏
      // const { desktopCapturer, screen, shell } = require('electron')
      // const fs = require('fs')
      // const os = require('os')
      // const path = require('path')
      // const thumbSize = determineScreenShotSize()
      // let options = { types: ['screen'], thumbnailSize: thumbSize }

      // desktopCapturer.getSources(options, (error, sources) => {
      //   if (error) return console.log(error)
      //   sources.forEach((source) => {
      //     if (source.name === 'Entire screen' || source.name === 'Screen 1') {
      //       const screenshotPath = path.join(os.tmpdir(), 'screenshot.png')
      //       fs.writeFile(screenshotPath, source.thumbnail.toPNG(), (error) => {
      //         if (error) return console.log(error)
      //         shell.openExternal(`file://${screenshotPath}`)
      //         console.log(`截图保存到: ${screenshotPath}`)
      //       })
      //     }
      //   })
      // })

      // function determineScreenShotSize() {
      //   const screenSize = screen.getPrimaryDisplay().workAreaSize
      //   const maxDimension = Math.max(screenSize.width, screenSize.height)
      //   return {
      //     width: maxDimension * window.devicePixelRatio,
      //     height: maxDimension * window.devicePixelRatio
      //   }
      // }

    }
  }
}
</script>

<style lang="less" scoped>
@import "../style/mixin";
.login_page {
  background-color: #324057;
}
.manage_tip {
  position: absolute;
  width: 100%;
  top: -100px;
  left: 0;
  p {
    font-size: 34px;
    color: #fff;
  }
}
.form_contianer {
  .wh(320px, 210px);
  .ctp(320px, 210px);
  padding: 25px;
  border-radius: 5px;
  text-align: center;
  background-color: #fff;
  .submit_btn {
    width: 100%;
    font-size: 16px;
  }
}
.tip {
  font-size: 12px;
  color: red;
}
.form-fade-enter-active,
.form-fade-leave-active {
  transition: all 1s;
}
.form-fade-enter,
.form-fade-leave-active {
  transform: translate3d(0, -50px, 0);
  opacity: 0;
}
</style>
