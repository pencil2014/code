<template>
  <div class="air-role-container">
    <div class="title">角色切换：</div>
    <div>
      <el-select v-model="roleValue" placeholder="请选择" size="mini" style="width:100px" @change="handleChangeRole">
        <el-option v-for="item in roleList" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'airRoleSwitch2',
  data() {
    return {
      roleValue: '' // 当前角色
    }
  },
  props: {},
  activated() {},
  created() {
    this.roleValue = this.ordDetRole
  },
  mounted() {},
  computed: {
    ...mapState({
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userId: (state) => state.user.userId,
      roleCodesOptions: (state) =>
        state.airTransport.orderList.roleCodesOptions,
      userEditRoles: (state) => state.airTransport.orderList.userEditRoles,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole
    }),
    roleList() {
      return this.roleCodesOptions.filter((el) =>
        this.userEditRoles.includes(el.value)
      )
    }
  },
  components: {},
  watch: {
    ordDetRole(val) {
      this.roleValue = val
    }
  },
  methods: {
    // 切换角色
    handleChangeRole(item) {
      this.$store.dispatch('airTransport/setRole', item)
    }
  }
}
</script>
<style lang="scss" scoped>
.air-role-container {
  display: flex;
  align-items: center;
  .title {
    font-weight: 600;
  }
}
</style>