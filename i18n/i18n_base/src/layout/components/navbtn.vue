<template>
  <div class="navbar">
    <!-- <el-button v-if="host !== 'lsuat.com'" size="mini" @click="gotoBigData"
      >大禹数据平台</el-button
    > -->
    <div class="fullscreen">
      <i class="el-icon-full-screen" @click="fullScreen" v-if="!isFullScreen"></i>
      <i class="el-icon-copy-document" @click="exitFull" v-else></i>
    </div>
    <el-dropdown
      size="mini"
      class="avatar-container company-container"
      trigger="click"
      @command="refreshTokenFn"
    >
      <div class="avatar-wrapper company-wrapper">
        <span class="company-name">{{ compName }}</span>
        <i class="el-icon-caret-bottom" />
      </div>
      <el-dropdown-menu slot="dropdown" class="user-dropdown company-dropdown">
        <el-scrollbar>
          <div style="max-height: 80vh">
            <el-dropdown-item
              v-for="company in userInfo.companyList"
              :key="company.companyCode"
              :command="company"
            >
              <span>
                {{ company.name }}
                <i
                  class="el-icon"
                  :class="company.companyCode === userInfo.settleCompanyCode ? 'el-icon-check' : ''"
                ></i>
              </span>
            </el-dropdown-item>
          </div>
        </el-scrollbar>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dropdown size="mini" class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <div class="name__container">
          <img src="../../assets/head.png" class="user-avatar" />{{ userInfo.userName }}
        </div>
        <i class="el-icon-caret-bottom" />
      </div>
      <el-dropdown-menu slot="dropdown" class="user-dropdown">
        <el-dropdown-item @click.native="goHome">{{ $t('tobBar.navBar.home') }}</el-dropdown-item>
        <el-dropdown-item @click.native="goUser">{{
          $t('tobBar.navBar.userInfo')
        }}</el-dropdown-item>
        <el-dropdown-item @click.native="showPwd">{{
          $t('tobBar.navBar.changePwd')
        }}</el-dropdown-item>
        <el-dropdown-item @click.native="emailBook">{{
          $t('tobBar.navBar.emailSub')
        }}</el-dropdown-item>
        <el-dropdown-item divided @click.native="logout">{{
          $t('tobBar.navBar.logout')
        }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <!-- <el-dropdown szie="mini" class="langerage-box" trigger="click">
      <div class="avatar-wrapper">
        <p class="langerage">{{ langerage }}</p>
        <i class="el-icon-caret-bottom" />
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item @click.native="changeLangerage('en-US')">{{
          $t('tobBar.langerage.en')
        }}</el-dropdown-item>
        <el-dropdown-item @click.native="changeLangerage('zh-CN')">{{
          $t('tobBar.langerage.zh')
        }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown> -->
    <ChangePassword
      v-if="diaologOption.show"
      :option="diaologOption"
      @cancel="cancel"
      @submit="submit"
    />
    <EmailBookPop v-if="emailBookOption.show" :option="emailBookOption" @cancel="cancelEmail" />
  </div>
</template>

<script>
import sha256 from 'js-sha256'
import actions from '@/store'
import { logOut, setToken, randomString, getToken, getLanguage } from '@/utils'
import { refreshToken, updatePassWord, getInfo, getDictList } from '@/api'
import ChangePassword from '@/components/changePassword'
import EmailBookPop from '@/components/emailBookPop'
import axios from 'axios'
export default {
  components: {
    ChangePassword,
    EmailBookPop,
  },
  data() {
    return {
      host: location.host,
      userInfo: {},
      state: {},
      diaologOption: {
        show: false,
      },
      emailBookOption: {
        show: false,
      },
      langerage: 'English',
      isFullScreen: false,
    }
  },
  computed: {
    compName() {
      let comp = this.userInfo.companyList?.find(
        (v) => v.companyCode === this.userInfo.settleCompanyCode
      )
      return comp && comp.name
    },
  },
  methods: {
    fullScreen () {
      this.isFull = true
      document.documentElement.requestFullscreen() //全屏显示
    },
    exitFull() {
      this.isFull = false
      document.exitFullscreen() //退出全屏显示
    },
    changeLangerage(langerage) {
      let locale = this.state.locale
      if (locale === langerage) {
        return
      }
      if (langerage.includes('zh')) {
        this.$i18n.locale = 'zh'
        this.langerage = this.$t('tobBar.langerage.zh')
      } else {
        this.$i18n.locale = 'en'
        this.langerage = this.$t('tobBar.langerage.en')
      }
      actions.setGlobalState({
        locale: langerage
      })
      localStorage.setItem('locale', langerage)
      
      // 跳转到首页
      // let tags = { title: this.$t('tags.home'), code: 'Home', url: '/home' }
      // actions.setGlobalState({
      //   locale: langerage,
      //   tags: [tags],
      //   activeTag: tags,
      //   activeCode: 'Home',
      // })
      // sessionStorage.setItem('store', JSON.stringify(actions.getGlobalState()))
      // if (location.hash.startsWith('#/home')) {
      //   window.location.reload()
      // } else {
      //   history.pushState('', '', '/#/home')
      // }
    },
    goUser() {
      this.routerGo({ title: this.$t('tags.userInfo'), url: '/userInfo', code: 'UserInfo', activeMenu: 'Home' })
    },
    goHome() {
      this.routerGo({ title: this.$t('tags.home'), url: '/home', code: 'Home', activeMenu: 'Home' })
    },
    routerGo({ title, url, activeMenu, code }) {
      let tag = { title, url, code, activeMenu }
      actions.setGlobalState({
        activeTag: tag
      })
      let codes = this.state.tags.map((ele) => ele.code)
      if (!codes.includes(code)) {
        actions.addGlobalTag(tag)
      }
      this.$router.push({ name: code })
    },
    logout() {
      logOut()
    },
    refreshTokenFn(company) {
      if (company.companyCode === this.userInfo.settleCompanyCode) {
        return
      }
      refreshToken({ companyCode: company.companyCode }).then((res) => {
        // 重新存储token和失效时间
        let token = res.data?.token || ''
        let expired_time = Math.round(new Date().getTime()) + this.expireTimes
        localStorage.setItem('token', token)
        localStorage.setItem('expired_time', expired_time) // 过期时间
        localStorage.setItem('isLogin', true) // 过期时间
        setToken(token)
        let { companyCode, companyName } = company
        Object.assign(
          this.userInfo,
          {
            settleCompanyCode: companyCode,
            settleCompanyName: companyName,
          },
          company
        )
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        actions.setGlobalState({
          token,
          userInfo: this.userInfo,
        })
      })
    },
    showPwd() {
      this.diaologOption.show = true
    },
    cancel() {
      this.diaologOption.show = false
    },
    submit(form) {
      let { passWordOld, passWordNew } = form
      let data = {
        orgLoginPassWord: sha256(passWordOld),
        newloginPassWord: sha256(passWordNew),
      }
      updatePassWord(data)
        .then((res) => {
          if (res.code === 0) {
            this.cancel()
            this.$msgSucClose(this.$t('login.resetPwd'))
          }
        })
        .catch(() => {})
        .finally(() => {})
    },
    emailBook() {
      this.emailBookOption.show = true
    },
    cancelEmail() {
      this.emailBookOption.show = false
    },
    gotoBigData() {
      // 协议会切换到https，动态获取协议再赋值
      // hash: "#/dashboard"
      // host: "localhost:7701"
      // hostname: "localhost"
      // href: "http://localhost:7701/#/dashboard"
      // origin: "http://localhost:7701"
      // pathname: "/"
      // port: "7701"
      // protocol: "http:"
      let protocol = location.protocol
      let host = location.hostname
      let ip = ''
      if (host === 'localhost') {
        host = 'www.bigdata-test.com'
        ip = '192.168.0.27:8100'
      } else if (host === 'ls.com') {
        host = 'www.bigdata-dev.com'
        ip = '192.168.0.26:8100'
      } else if (host === 'lstest.com') {
        host = 'www.bigdata-test.com'
        ip = '192.168.0.27:8100'
      } else if (host === 'lsuat.com') {
        host = 'www.bigdata-test.com'
        ip = '192.168.0.27:8100'
      } else {
        // host = 'http://bigdata.longsailing.net:7777'
        // ip = 'bigdata.longsailing.net:7777'
        host = 'bigdata.longsailing.net'
        ip = 'bigdata.longsailing.net'
      }
      // 跳转的腾讯云地址：http://81.71.10.108:8081/api-auth/oauth/authorize
      // http://192.168.1.13:9001/InvSvr
      let url = `${protocol}//${ip}/api-auth/oauth/authorize`
      axios
        .post(url, {
          clientId: 'BusinessSystem',
          clientSecret: 'admin',
          responseType: 'code',
          scope: ['all'],
          state: randomString(),
          businessToken: this.state.token,
        })
        .then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$msgErrClose(res.msg)
          } else {
            window.open(`${protocol}//${host}/sign?token=${res.data.accessToken}&from=yw`)
          }
          //         开发：http://www.bigdata-dev.com/sign?token=xxx&from=yw
          // 测试：http://www.bigdata-test.com/sign?token=xxx&from=yw
          // 生产：http://bigdata.longsailing.net:7777/sign?token=xxx&from=yw
        })
        .catch((error) => {
          console.log(error)
        })
    },
    getUserInfo() {
      let token = getToken()
      if (!token || token === 'undefined') {
        return
      }
      getInfo(token)
        .then((res) => {
          if (res.code === 0) {
            let userInfo = res.data
            localStorage.setItem('userInfo', JSON.stringify(userInfo))
            localStorage.setItem('token', token)
            actions.setGlobalState({
              userInfo,
              token,
            })
            this.userInfo = userInfo
          }
        })
        .catch(() => {})
        .finally(() => {})
    },
    getDict() {
      let token = getToken()
      if (!token) {
        return
      }
      getDictList()
        .then((res) => {
          let dictAll = res.data
          localStorage.setItem('dictAll', JSON.stringify(dictAll))
          actions.setGlobalState({
            dictAll,
          })
        })
        .catch(() => {})
    },
  },
  mounted() {
    this.state = actions.getGlobalState()
    this.getUserInfo()
    // this.getDict()
    let lang = getLanguage()
    this.langerage = this.$t(`tobBar.langerage.${lang}`)
    window.onresize = () => {
      // 可视区域的高度
      const clientHeight = document.documentElement.clientHeight || document.body.clientHeight 
      // screen是window的属性方法，window.screen可省略window，指的是窗口
      this.isFullScreen = screen.height == clientHeight
    }
  },
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;
  height: 60px;
  margin-right: 10px;
  .fullscreen{
    i {
      color: #fff;
      font-size: 16px;
      cursor: pointer;
    }
  }
  .avatar-wrapper {
    display: flex;
    align-items: center;
    color: #fff;
    margin-left: 10px;
    cursor: pointer;
    .company-name {
      font-size: 12px;
    }
    .name__container {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #fff;
      img {
        width: 24px;
        height: 24px;
        margin-right: 5px;
      }
    }
  }
}
.user-dropdown {
  text-align: center;
}
:deep(.company-dropdown) {
  .el-dropdown-menu__item {
    text-align: left;
  }
  .el-icon-check {
    color: #46a6ff;
    padding-left: 4px;
    font-weight: bold;
  }
}
.langerage-box {
  .langerage {
    font-size: 12px;
  }
}
</style>
