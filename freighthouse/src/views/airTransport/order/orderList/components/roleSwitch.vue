<template>
  <div class="role-container" v-if="airRoles.length>1">
    <template v-for="(item, index) in roleCodesOptions">
      <el-button :key="'role' + index" type="default" size="mini" :class="item.value === currRole ? 'active' : ''" @click="handleChangeRole(item)" v-if="airRoles.includes(item.value)">
        {{item.label}}视角
      </el-button>
    </template>
  </div>
</template>
<script>
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
export default {
  mixins: [orderMixin],
  data() {
    return {}
  },
  props: {},
  activated() {},
  created() {
  },
  mounted() {},
  computed: {
    airRoles() {
      let arr = []
      for (let i = 0; i < this.roles.length; i++) {
        if (this.allRole.includes(this.roles[i])) {
          if (['bd', 'obd', 'asst'].includes(this.roles[i])) {
            if (!arr.includes('bd')) {
              arr.push('bd')
            }
          } else {
            arr.push(this.roles[i])
          }
        }
      }
      return arr
    }
  },
  components: {},
  watch: {},
  methods: {
    // 切换角色
    handleChangeRole(item) {
      this.$store.dispatch('user/changeRole', item.value)
      this.$emit('callback')
    }
  }
}
</script>
<style lang="scss" scoped>
.role-container {
  padding-left: 8px;
  /deep/ .el-button {
    height: 20px;
    padding: 0 8px;
    margin-bottom: 4px;
    &.active {
      color: #3e80f5;
      border-color: #3e80f5;
    }
  }
}
</style>