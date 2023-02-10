<template>
  <div class="login-container">
    <el-form v-show="forgetView === 'default'" ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" label-position="right">
      <!-- <div class="title-container">
        <h3 class="title">Login Form</h3>
      </div> -->
      <div class="forget-title-container">
        <span class="forget-title">请输入旧密码和新密码，以进行密码修改</span>
      </div>
      <el-form-item prop="oldPassWord">
        <!-- <span class="svg-container">
          <svg-icon icon-class="password" />
        </span> -->
        <el-input
          :key="passwordType"
          ref="oldPassWord"
          v-model="loginForm.oldPassWord"
          :type="passwordType"
          placeholder="旧密码"
          name="oldPassWord"
          tabindex="2"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <el-form-item prop="newPassWord1">
        <!-- <span class="svg-container">
          <svg-icon icon-class="password" />
        </span> -->
        <el-input
          :key="passwordType"
          ref="newPassWord1"
          v-model="loginForm.newPassWord1"
          :type="passwordType"
          placeholder="新密码"
          name="newPassWord1"
          tabindex="2"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <el-form-item prop="newPassWord2">
        <!-- <span class="svg-container">
          <svg-icon icon-class="password" />
        </span> -->
        <input type="text" style="display: none;">
        <el-input
          :key="passwordType"
          ref="newPassWord2"
          v-model="loginForm.newPassWord2"
          :type="passwordType"
          placeholder="确认新密码"
          name="newPassWord2"
          tabindex="2"
          @keyup.enter.native="handleChange"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleChange">下一步</el-button>
      <div class="tips">
        <router-link class="forget-password" to="/">返回首页</router-link>
      </div>
    </el-form>
    <div v-show="forgetView === 'changeSuccess'" class="email-success-tip">
      <p><i class="el-icon-circle-check"></i>已成功修改密码</p>
      <p>密码修改已成功，您可以用新密码登录系统。<el-button type="text" class="forget-go-login" @click="logout">登录系统</el-button></p>
    </div>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { updatePassWord } from '@/api/base'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 8) {
        callback(new Error('The password can not be less than 8 digits'))
      } else {
        callback()
      }
    }
    return {
      emailForm: {
        username: '',
        email: ''
      },
      loginForm: {
        tokenCode: '',
        oldPassWord: '',
        newPassWord1: '',
        newPassWord2: ''
      },
      emailRules: {
        username: [{ required: true, trigger: 'blur'}],
        email: [{ required: true, trigger: 'blur' }]
      },
      loginRules: {
        newPassWord: [{ required: true, trigger: 'blur'}]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      forgetView: 'default',
      code: ''
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    console.log('created-')
    let forgetView = this.$route.query.forgetView
    this.forgetView = forgetView ? forgetView : this.forgetView
    let code = this.$route.query.code
    this.code = code ? code : this.code
  },
  // activated() {
  //   console.log('activated-')
  //   this.forgetView = this.$route.query.forgetView
  //   this.code = this.$route.query.code
  // },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleChange() {
      let sha256 = require('js-sha256').sha256
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          if (this.loginForm.newPassWord1 !== this.loginForm.newPassWord2) {
            return this.$message({ type: 'error', message: '新密码输入不一致！', showClose: true })
          }
          let data = {
            orgLoginPassWord: sha256(this.loginForm.oldPassWord),
            newloginPassWord: sha256(this.loginForm.newPassWord1)
          }
          this.loading = true
          updatePassWord(data).then(res => {
            this.loading = false
            if (res.code === 0) {
              this.forgetView = 'changeSuccess'
            }
          }).catch(err => {
            console.log(err)
            this.loading = false
            // this.forgetView = 'changeSuccess'
          })
        }
      })
    },
    logout() {
      this.$store.dispatch('user/logout').then(() => {
        this.$router.push('/login')
        // this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      })
    },
    handleEmail() {
      this.$refs.emailForm.validate(valid => {
        if (valid) {
          let data = {
            loginAccount: this.emailForm.username,
            email: this.emailForm.email
          }
          this.loading = true
          sendResetPasswordEmail(data).then(res => {
            this.loading = false
            if (res.code === 0) {
              this.forgetView = 'emailSuccess'
            }
          }).catch(err => {
            console.log(err)
            this.loading = false
          })
        }
      })
    },
    handleLogin() {
      let sha256 = require("js-sha256").sha256
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', Object.assign(this.loginForm, {
            password: sha256(this.loginForm.password)
          })).then(() => {
            this.$router.push({ path: this.redirect || '/' })
            // 需要重新刷新页面 请求 菜单 和 用户信息
            location.reload();
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // setParams() {
    //   console.log('search:', search)
    //   let search = window.location.search
    //   if (search) {
    //     search = search.replace('?', '')
    //     let arr = search.split('&')
    //     arr.forEach(item => {
    //       let arr2 = item.split('=')
    //       if (arr2[0] === 'forgetView') {
    //         this.forgetView = arr2[1]
    //       } else if (arr2[0] === 'code') {
    //         console.log('code arr:', arr2)
    //         let arr2_2 = arr2.filter((item, index) => {
    //           return index > 0
    //         })
    //         this.code = arr2_2.join('')
    //       }
    //     })
    //   }
    // },
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      // color: $light_gray;
      color: #4a4a4a;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        // box-shadow: 0 0 0px 1000px $bg inset !important;
        box-shadow: 0 0 0px 1000px #FFF inset !important;
        // -webkit-text-fill-color: $cursor !important;
        -webkit-text-fill-color: #4a4a4a !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .email-success-tip {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
    text-align: center;
    p:first-of-type {
      font-size: 16px;
      color: #1890ff;
      margin-bottom: 20px;
      line-height: 24px;
      .el-icon-circle-check {
        font-size: 22px;
        vertical-align: middle;
      }
    }
    p:nth-of-type(2) {
      font-size: 12px;
      color: #FFF;
    }
    .forget-go-login {
      font-size: 12px;
      color: #1890ff;
    }
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    position: relative;
    min-height: 16px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
    .forget-password {
      position: absolute;
      right: 0;
      opacity: 0.4;
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .forget-title-container {
    font-size: 16px;
    color: #fff;
    margin-bottom: 28px;
    text-indent: 40px;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
