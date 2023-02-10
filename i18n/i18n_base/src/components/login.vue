<template>
  <div class="login-container">
    <div class="logo-cnt">
      <img class="" src="../assets/login/logo.png" />
    </div>
    <div class="login-form-container">
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        label-position="right"
      >
        <div class="title-container">
          <h3 class="title">{{ $t('login.title') }}</h3>
        </div>
        <el-form-item prop="username">
          <span class="svg-container">
            <img src="../assets/login/login-user.png" />
          </span>
          <el-input
            ref="username"
            v-model.trim="loginForm.username"
            :placeholder="$t('login.userName')"
            name="username"
            type="text"
            tabindex="1"
            auto-complete="on"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="password">
          <span class="svg-container">
            <img src="../assets/login/login-password.png" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model.trim="loginForm.password"
            :type="passwordType"
            :placeholder="$t('login.password')"
            name="password"
            tabindex="2"
            auto-complete="on"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>

        <div class="tips">
          <div class="langerage">
            <el-dropdown szie="mini" class="langerage-box">
              <span class="el-dropdown-link">
                {{ $t('tobBar.langerage.lan') }}：{{ langerage }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="changeLangerage('en-US')">
                  <!-- {{$t('tobBar.langerage.en')}} -->English
                </el-dropdown-item>
                <el-dropdown-item @click.native="changeLangerage('zh-CN')">
                  <!-- {{$t('tobBar.langerage.zh')}} -->中文
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class="forget">
            <a class="forget-password" href="" @click.prevent="goForget">{{
              $t('login.forgot')
            }}</a>
          </div>
        </div>

        <el-button
          :loading="loading"
          type="primary"
          class="submit"
          @click.native.prevent="handleLogin"
          >{{ $t('login.signIn') }}</el-button
        >
      </el-form>
    </div>
  </div>
</template>

<script>
import sha256 from 'js-sha256'
import actions from '@/store'
import { login, getInfo, getDictList } from '@/api'
import { setToken, getToken } from '@/utils'
export default {
  name: 'login',
  data() {
    return {
      loginForm: {
        username: '', // 'op',
        password: '', // '123456'
      },
      loginRules: {
        username: [{ required: true, message: this.$t('login.usernameRule'), trigger: 'blur' }],
        password: [{ required: true, message: this.$t('login.passwordRule'), trigger: 'blur' }],
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      expireTimes: '',
      token: '',
      langerage: this.$t('tobBar.langerage.en'),
    }
  },
  created() {
    let token = getToken()
    if (token && token !== 'undefined') {
      let expired_time = Math.round(new Date().getTime()) + this.expireTimes
      this.token = token
      localStorage.setItem('token', token)
      localStorage.setItem('expired_time', expired_time) // 过期时间
      localStorage.setItem('isLogin', true) // 过期时间
      setToken(token)
      actions.setGlobalState({
        token,
      })
      this.getUserInfo()
      // this.getDict()
    }
  },
  methods: {
    changeLangerage(langerage) {
      if (langerage.includes('zh')) {
        this.$i18n.locale = 'zh'
        this.langerage = this.$t('tobBar.langerage.zh')
      } else {
        this.$i18n.locale = 'en'
        this.langerage = this.$t('tobBar.langerage.en')
      }
      localStorage.setItem('locale', langerage)
      actions.setGlobalState({
        locale: langerage
      })
      // 切换语言刷新页面
      // sessionStorage.setItem('loginForm', JSON.stringify(this.loginForm))
      // window.location.reload()
    },
    goForget() {
      this.$router.push({ name: 'Forget' })
    },
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
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true
          let { username, password } = this.loginForm
          let data = {
            username,
            password: sha256(password),
          }
          login(data)
            .then((res) => {
              if (res.code === 0) {
                let token = res.data?.token || ''
                let expired_time = Math.round(new Date().getTime()) + this.expireTimes
                this.token = token
                localStorage.setItem('token', token)
                localStorage.setItem('expired_time', expired_time) // 过期时间
                localStorage.setItem('isLogin', true) // 过期时间
                setToken(token)
                // 设置token 和默认tag
                let tags = { title: this.$t('tags.home'), code: 'Home', activeMenu: 'Home', url: '/home' }
                actions.setGlobalState({
                  token,
                  tags: [tags],
                  activeTag: tags,
                })
                this.getUserInfo()
                // this.getDict()
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    getUserInfo() {
      getInfo(this.token)
        .then((res) => {
          if (res.code === 0) {
            let userInfo = res.data
            localStorage.setItem('userInfo', JSON.stringify(userInfo))
            actions.setGlobalState({
              userInfo,
            })
            this.$router.push({ name: 'Home' })
            // let url = sessionStorage.getItem('lastUrlNoLogin')
            // if (url && !url.includes('/login')) {
            //   location.href = url
            // } else {
            //   this.$router.push({ name: 'Home' })
            // }
          }
        })
        .catch(() => {})
        .finally(() => {})
    },
    getDict() {
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
    this.expireTimes = actions.getGlobalState('expireTimes')
    this.langerage =  this.$t(`tobBar.langerage.${this.$i18n.locale}`)
    // 切换语言刷新页面
    // let loginForm = sessionStorage.getItem('loginForm')
    // if (loginForm) {
    //   this.loginForm = JSON.parse(loginForm)
    //   sessionStorage.removeItem('loginForm')
    // }
  },
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
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
      // caret-color: $cursor;
      font-size: 14px;

      &:-webkit-autofill {
        // box-shadow: 0 0 0px 1000px $bg inset !important;
        box-shadow: 0 0 0px 1000px #fff inset !important;
        // -webkit-text-fill-color: $cursor !important;
        -webkit-text-fill-color: #4a4a4a !important;
      }
    }
  }

  .el-form-item {
    // border: 1px solid rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.1);
    // background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  // background-color: $bg;
  background: url('../assets/login/login-bg.webp');
  background-position: center;
  background-attachment: fixed;
  position: relative;
  .logo-cnt {
    padding: 64px;
  }
  .login-form-container {
    width: 480px;
    height: 495px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 240px;
    background: #fff;
    border-radius: 16px;
  }

  .login-form {
    position: relative;
    max-width: 100%;
    padding: 0 40px;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 22px; // 10px;
    position: relative;
    min-height: 12px; // 16px;
    display: flex;
    .langerage-box {
      font-size: 12px;
      color: rgba(0, 98, 196, 1);
    }
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
    .forget-password {
      position: absolute;
      right: 0;
      // opacity: 0.4;
      color: rgba(0, 98, 196, 1);
      text-decoration: none;
      font-size: 12px;
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .svg-container {
    // padding: 6px 5px 6px 15px;
    padding: 7px 8px 7px 8px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;
    padding-top: 60px;
    padding-bottom: 55px;
    .title {
      background-image: linear-gradient(297.22deg, #024486 -8.08%, #068ec9 42.51%, #0062c4 97.61%);
      background-clip: text;
      color: transparent;
      font-size: 48px;
    }
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

  .el-form-item {
    margin-bottom: 22px;
  }

  .login-container-modal {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: #fff;
  }
  .submit {
    background: #0062c4;
    border-radius: 8px;
    width: 100%;
    height: 60px;
    font-family: Arial;
    font-size: 18px;
    font-weight: 700;
  }
}
</style>
