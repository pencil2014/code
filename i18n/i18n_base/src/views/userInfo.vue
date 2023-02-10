<template>
  <div class="user-info">
    <div class="account-box">
      <div class="user-header">
        <img src="../assets/head.png" alt />
      </div>
      <div class="user-wish">
        <img src="../assets/userInfo/icon-sun.png" alt /> hello～{{
          userInfo.userName
        }}，{{$t('userInfo.wish')}}
      </div>
      <div class="user-des">
        <div class="company-box">
          <p>
            <img src="../assets/userInfo/icon-company.png" />{{$t('userInfo.compName')}}：{{
              userInfo.compName
            }}
          </p>
          <p>
            <img src="../assets/userInfo/icon-dept.png" /> {{$t('userInfo.deptName')}}：{{
              userInfo.deptName
            }}
          </p>
        </div>
        <div class="member-box">
          <p>
            <img src="../assets/userInfo/icon-user.png" /> {{$t('userInfo.account')}}：{{
              userInfo.loginAccount || '-'
            }}
          </p>
          <p>
            <i class="el-icon-s-grid" style="font-size: 14px"></i> {{$t('userInfo.sysUserId')}}：{{
              userInfo.sysUserId || '-'
            }}
          </p>
          <p>
            <img src="../assets/userInfo/icon-code.png" /> {{$t('userInfo.employeeNo')}}：{{
              userInfo.employeeNo || '-'
            }}
          </p>
          <p>
            <img src="../assets/userInfo/icon-tel.png" /> {{$t('userInfo.mobileNo')}}：{{
              userInfo.mobileNo || '-'
            }}
          </p>
          <p>
            <img src="../assets/userInfo/icon-telephone.png" /> {{$t('userInfo.telephone')}}：{{
              userInfo.telephone || '-'
            }}
          </p>
          <p>
            <img src="../assets/userInfo/icon-email.png" /> {{$t('userInfo.email')}}：{{
              userInfo.email || '-'
            }}
          </p>
          <p>
            <i class="el-icon-share" style="font-size: 14px"></i> {{$t('userInfo.invideCode')}}：{{
              userInfo.invideCode || '-'
            }}
          </p>
        </div>
      </div>
      <div class="user-list">
        <div class="item-box">
          <div class="title">{{$t('userInfo.departFullNames')}}</div>
          <ul>
            <li
              v-for="(item, index) in userInfo.departFullNames || []"
              :key="index"
            >
              {{ item }}
            </li>
          </ul>
        </div>
        <div class="item-box">
          <div class="title">{{$t('userInfo.roleNames')}}</div>
          <ul>
            <li v-for="(item, index) in userInfo.roleNames || []" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>
        <div class="item-box">
          <div class="title">{{$t('userInfo.companyNames')}}</div>
          <ul>
            <li
              v-for="(item, index) in userInfo.companyNames || []"
              :key="index"
            >
              {{ item }}
            </li>
          </ul>
        </div>
        <div class="item-box">
          <div class="title">{{$t('userInfo.systemLineNames')}}</div>
          <ul>
            <li
              v-for="(item, index) in userInfo.systemLineNames || []"
              :key="index"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import actions from '@/store'
export default {
  name: 'UserInfo',
  data() {
    return {}
  },
  computed: {
    userInfo() {
      let base = actions.getGlobalState('userInfo') || {}
      if (!base.userName) {
        base = JSON.parse(localStorage.getItem('userInfo') || '{}')
      }
      return base
    }
  }
}
</script>

<style lang="scss" scoped>
.user-info {
  padding-bottom: 10px;
  .account-box {
    text-align: center;
    .user-header {
      display: inline-block;
      width: 100px;
      height: 100px;
      border: 5px solid #f6f6f6;
      border-radius: 100%;
      overflow: hidden;
      margin: 30px auto 18px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .user-wish {
      line-height: 20px;
      font-size: 16px;
      color: #222;
      font-weight: 700;
      display: flex;
      justify-content: center;
      img {
        margin-right: 3px;
      }
    }
    .user-des {
      margin-top: 25px;
      .company-box,
      .member-box {
        display: flex;
        justify-content: center;
        p {
          margin-right: 24px;
          display: flex;
          align-items: center;
          line-height: 16px;
          img,i{
            margin-right: 5px;
            color: #000;
          }
        }
      }
      .member-box {
        margin: 8px;
      }
    }
    .user-list {
      margin-top: 50px;
      display: flex;
      justify-content: space-around;
      align-items: flex-start;
      .item-box {
        width: 20%;
        border-radius: 2px;
        border: 1px solid #4a4a4a;
        .title {
          height: 24px;
          line-height: 24px;
          background-color: #4a4a4a;
          color: #fff;
        }
        li {
          list-style: none;
          color: #4a4a4a;
          border-bottom: 1px solid #e9e9e9;
          line-height: 24px;
          height: 24px;
        }
      }
    }
  }
}
</style>
