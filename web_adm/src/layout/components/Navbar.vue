<template>
  <div class="navbar">
    <!-- <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" /> -->

    <!-- <breadcrumb class="breadcrumb-container" /> -->
    <div class="right-menu">
      <el-button v-if="host !== 'lsuat.com'" class="ls_btn" size="mini" @click="gotoBigData">大禹数据平台</el-button>
      
      <el-dropdown
        size="mini"
        class="avatar-container company-container"
        trigger="click"
        @command="refreshToken"
      >
        <div class="avatar-wrapper company-wrapper">
          <span>{{compName}}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown company-dropdown">
          <el-scrollbar>
            <div style="max-height: 80vh;">
              <el-dropdown-item
                v-for="company in companyList"
                :key="company.companyCode"
                :command="company"
              >
                <span>
                  {{company.name}}
                  <i class="el-icon" :class="company.companyCode===userInfo.settleCompanyCode?'el-icon-check':''"></i>
                </span>
              </el-dropdown-item>
            </div>
          </el-scrollbar>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown size="mini" class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <span class="name__container"><img src="../../assets/head.png" class="user-avatar" />{{name}}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>首页</el-dropdown-item>
          </router-link>
          <router-link to="/userInfo">
            <el-dropdown-item>个人信息</el-dropdown-item>
          </router-link>
          <!-- <router-link> -->
          <el-dropdown-item @click.native="alertPwdBtn">修改密码</el-dropdown-item>
          <!-- </router-link> -->
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog
      title="修改密码"
      :visible.sync="alertPwdShow"
      width="40%"
      class="finance-page pwd-dialog"
    >
      <!-- <ChangePassword /> -->
      <div class="alert-pwd-title">设置密码</div>
      <div class="alert-pwd-des">密码需至少包含数字、字母或特殊字符的两种，且长度在8-16位之间</div>
      <el-form
        :model="alertForm"
        ref="alertForm"
        :rules="alertFormRules"
        label-width
        :inline="false"
        size="mini"
      >
        <el-form-item label="原密码" prop="passWordOld">
          <el-input :type="pwdType[1]" v-model="alertForm.passWordOld">
            <i slot="suffix" @click="togglePwdType(1)">
              <svg-icon :icon-class="pwdType[1]=='password' ? 'eye' : 'eye-open'" />
            </i>
          </el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="passWordNew">
          <el-input :type="pwdType[2]" v-model="alertForm.passWordNew" @input="passWordNewInput">
            <i slot="suffix" @click="togglePwdType(2)">
              <svg-icon :icon-class="pwdType[2]=='password' ? 'eye' : 'eye-open'" />
            </i>
          </el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="passWordSure">
          <el-input :type="pwdType[3]" v-model="alertForm.passWordSure" @input="passWordSureInput">
            <i slot="suffix" @click="togglePwdType(3)">
              <svg-icon :icon-class="pwdType[3]=='password' ? 'eye' : 'eye-open'" />
            </i>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" type="primary" @click="alertSure">修改</el-button>
        <el-button size="mini" @click="alertPwdShow=false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { updatePassWord, refreshToken } from '@/api/base'
import { setToken } from '@/utils/auth'
import axios from 'axios'
import { randomString } from '@/utils'

let rules = [{ required: true, message: ' ' }]
let rules2 = [
  ...rules,
  {
    validator: (rule, value, callback) => {
      value = value.trim()
      var regx = /^(?!([a-zA-Z]+|\d+|[`~!@#$%^&*()_+={};:'"|,<.>?]+)$)[a-zA-Z\d`~!@#$%^&*()_+={};:'"|,<.>?]{8,16}$/
      if (value.match(regx) == null) {
        return callback(new Error('密码格式错误！'))
      }
      return callback()
    },
    trigger: 'blur',
  },
]
export default {
  components: {
    Breadcrumb,
    Hamburger,
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'name', 'roles', 'role', 'userInfo']),
    compName(){
      let comp = this.companyList && this.companyList.find(v=> v.companyCode === this.userInfo.settleCompanyCode)
      return comp && comp.name
    },
    companyList() {
      // console.log(this.$store.state.user)
      return this.userInfo.companyList
    },
  },
  data() {
    return {
      alertPwdShow: false,
      alertForm: { passWordOld: '', passWordNew: '', passWordSure: '' },
      pwdType: { 1: 'password', 2: 'password', 3: 'password' },
      alertFormRules: { passWordOld: rules, passWordNew: rules2, passWordSure: rules2 },
      host: location.host
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    logout() {
      this.$store.dispatch('user/logout').then(() => {
        this.$router.push('/login')
        location.reload()
        // this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      })
    },
    alertPwdBtn() {
      this.alertPwdShow = true
      this.$nextTick(() => {
        this.$refs.alertForm.resetFields()
      })
    },
    passWordNewInput() {
      if (this.alertForm.passWordNew.length > 16) {
        this.$msgErrClose('最多输入16位')
        this.alertForm.passWordNew = this.alertForm.passWordNew.substring(0, 16)
      }
    },
    passWordSureInput() {
      if (this.alertForm.passWordSure.length > 16) {
        this.$msgErrClose('最多输入16位')
        this.alertForm.passWordSure = this.alertForm.passWordSure.substring(0, 16)
      }
    },
    alertSure() {
      let sha256 = require('js-sha256').sha256
      this.$refs.alertForm.validate((valid) => {
        if (valid) {
          if (this.alertForm.passWordNew !== this.alertForm.passWordSure) {
            return this.$msgErrClose('新密码输入不一致！')
          }
          let data = {
            orgLoginPassWord: sha256(this.alertForm.passWordOld.trim()),
            newloginPassWord: sha256(this.alertForm.passWordNew.trim()),
          }
          updatePassWord(data)
            .then((res) => {
              if (res.code === 0) {
                this.alertPwdShow = false
                this.rubbishConfirm()
              }
            })
            .catch((err) => {
              console.log(err)
            })
        }
      })
    },
    rubbishConfirm() {
      const h = this.$createElement
      this.$msgbox({
        message: h('div', { style: 'font-size:12px;text-align:center' }, [
          h('i', { class: 'el-icon-success', style: 'font-size: 30px;color:#13ce66;margin-top:20px' }),
          h('div', { style: 'font-weight: bold;color:#222222;padding:8px 0' }, '修改成功！'),
          h('div', { style: 'color: #4A4A4A' }, '已成功设置新密码，您可以使用新密码登录系统'),
        ]),
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: '关闭',
        showClose: false,
      })
    },
    togglePwdType(index) {
      this.pwdType[index] = this.pwdType[index] == 'password' ? 'text' : 'password'
    },
    refreshToken(company) {
      if (company.companyCode === this.userInfo.settleCompanyCode) {
        return
      }
      refreshToken({ companyCode: company.companyCode }).then((res) => {
        console.log(res)
        // 重新存储token和失效时间
        setToken(res.data.token)
        localStorage.setItem('expired_time', new Date().getTime())
        // this.$store.state.user.compCode = company.companyCode
        // this.$store.state.user.compName = company.companyName
        // this.$store.state.user.userInfo.compCode = company.companyCode
        // this.$store.state.user.userInfo.compName = company.companyName
        this.userInfo.settleCompanyCode = company.companyCode
        this.userInfo.settleCompanyName = company.companyName
        Object.assign(this.$store.state.user.userInfo, company)
        // location.reload()
        // console.log(this.$store.state.user);
      })
    },
    gotoBigData(){
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
      if(host === 'localhost'){
        host = 'www.bigdata-test.com'
        ip = '192.168.0.27:8100'
      }else if(host === 'ls.com'){
        host = 'www.bigdata-dev.com'
        ip = '192.168.0.26:8100'
      }else if(host === 'lstest.com'){
        host = 'www.bigdata-test.com'
        ip = '192.168.0.27:8100'
      }else if(host === 'lsuat.com'){
        host = 'www.bigdata-test.com'
        ip = '192.168.0.27:8100'
      }else{
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
        businessToken: this.$store.state.user.token,
      })
      .then(({data: res}) => {
        if(res.code !== 0){
          return this.$msgErrClose(res.msg)
        }else{
          window.open(`${protocol}//${host}/sign?token=${res.data.accessToken}&from=yw`)
        }
//         开发：http://www.bigdata-dev.com/sign?token=xxx&from=yw
// 测试：http://www.bigdata-test.com/sign?token=xxx&from=yw
// 生产：http://bigdata.longsailing.net:7777/sign?token=xxx&from=yw
        console.log(res);
      })
      .catch(error => {
        console.log(error);
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.navbar {
  // margin-left: -30px;
  float: right;
  height: 30px;
  overflow: hidden;
  position: relative;
  background: #2d3a5d;
  // box-shadow: 0 1px 4px rgba(0,21,41,.08);
  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }
  .breadcrumb-container {
    float: left;
  }
  .change-role {
    font-size: 12px;
    color: #fff;
    margin-right: 15px;
    cursor: pointer;
    // text-decoration: underline;
  }
  .right-menu {
    height: 100%;
    line-height: 30px;
    display: flex;
    &:focus {
      outline: none;
    }
    .ls_btn{
      line-height: 18px;
      padding: 0 8px;
      height: 20px;
      vertical-align: middle;
      margin: 5px 18px 0 0;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 16px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }
    .company-container {
      margin-right: 10px;
      .company-wrapper {
        color: #fff;
        & > span {
          text-align: right;
          max-width: 130px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    .name__container{
      text-align: right;
      max-width: 132px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .avatar-container {
      .avatar-wrapper {
        font-size: 12px;
        position: relative;
        display: flex;
        color: #fff;
        padding-right: 16px;
        cursor: pointer;
        .user-avatar {
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 10px;
          margin-right: 5px;
          vertical-align: middle;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: 2px;
          top: 8px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>

<style lang="scss" scoped>
// 修改密码弹框样式
.el-dailog,
.alert-pwd-title,
.alert-pwd-des {
  font-size: 12px;
}
.pwd-dialog ::v-deep {
  background: transparent;
  .el-dialog__body {
    padding: 24px 26px 18px;
  }
  .el-dialog__footer {
    padding-top: 0;
  }
}
.alert-pwd-title {
  color: #222;
  font-weight: bold;
  padding-bottom: 8px;
}
.alert-pwd-des {
  color: #969696;
  padding-bottom: 16px;
}
.form-label {
  color: #222;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 4px;
  ::v-deep .el-form-item__error {
    text-align: right;
    right: 0;
    font-size: 12px;
    bottom: 2px;
  }
}
.el-form-item ::v-deep {
  & > label,
  & > div {
    line-height: 20px;
  }
  .el-input.el-input--mini,
  .el-input__inner {
    height: 20px;
    line-height: 20px;
  }
  .el-input__suffix {
    width: 20px;
    cursor: pointer;
  }
}
.company-dropdown ::v-deep {
  .el-dropdown-menu__item {
    text-align: left;
  }
  .el-icon-check {
    color: #46a6ff;
    padding-left: 4px;
    font-weight: bold;
  }
  // .active{
  //   background-color: #e8f4ff;
  //   color: #46a6ff;
  // }
}
</style>
