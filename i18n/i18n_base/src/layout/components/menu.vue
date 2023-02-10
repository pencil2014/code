<template>
  <div class="menu-cnt">
    <ul>
      <li
        v-for="(item, index) in menuList"
        :key="index"
        @click="goSub(item)"
        :class="{ active: state.activeTag.activeMenu === item.activeMenu }"
      >
        <span>{{ $t(`tobBar.menu.${item.title}`) }}</span>
        <i v-if="state.activeTag.activeMenu === item.activeMenu" class="el-icon-caret-top"></i>
      </li>
    </ul>
    
  </div>
</template>
<script>
import actions from '@/store'
export default {
  data() {
    return {
      menuList: [
        {
          title: 'home',
          activeMenu: 'Home',
          url: '/home',
        },
        {
          title: 'crm',
          activeMenu: 'Crm',
          url: '/crm/customerManagement/custList',
        },
        {
          title: 'order',
          activeMenu: 'Order',
          url: '/order/order/orderList',
        },
        {
          title: 'finance',
          activeMenu: 'Finance',
          url: '/finance/settlement/feeList',
        },
      ],
      state: {
        activeMenu: 'Home'
      },
    }
  },
  created () {
    this.state = actions.getGlobalState()
  },
  methods: {
    goSub(item) {
      let { url } = item
      actions.setGlobalState({
        activeTag: item,
      })
      history.pushState(null, '', `/#${url}`)
    },
  },
}
</script>

<style lang="scss" scoped>
.menu-cnt {
  ul {
    display: flex;
    align-items: center;
    margin-left: 45px;
    li {
      list-style: none;
      height: 60px;
      line-height: 60px;
      cursor: pointer;
      color: #fff;
      font-size: 14px;
      flex-basis: 180px;
      text-align: center;
      display: flex;
      flex-direction: column;
      position: relative;
      i {
        color: #F0F2F5;
        left: 50%;
        font-size: 20px;
        top: 50%;
        position: absolute;
        transform: translate(-50%, 18px);
      }
      &.active {
        font-weight: bold;
      }
    }
  }
}
</style>
