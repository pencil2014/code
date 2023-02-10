<template>
  <div v-if="routeArr.includes($route.name)">
    <!-- 存在两个以上角色的显示角色切换按钮 -->
    <div class="role-container" v-if="roles.length > 1">
      <template v-for="(item, index) in roles">
        <el-button 
          :key="'role' + index"
          type="default" 
          size="mini" 
          :class="item === ordDetRole ? 'active' : ''"
          @click="handleChangeRole(item)"
        >
        {{rolesObj[item]}}视角
        </el-button>
      </template>
    </div>
  </div>
</template>
<script>
import store from "@/store"
import {mapState} from 'vuex'
import {orderMixin} from '@/views/order/order/mixins/orderMixin'
export default {
  mixins: [orderMixin],
  // filters: {
  //   roleFilter(role) {
  //     if (role === 'obd') role = 'bd'
  //     let allRoles = store.state.order.orderList.roleCodesOptions
  //     let findItem = allRoles.find(item => item.value === role)
  //     return findItem ? findItem.label : ''
  //   }
  // },
  data() {
    return {
      routeArr: ['OrderDetail', 'OrderBook'],
      rolesObj: {
        bd: '业务',
        obd: '业务助理',
        asst: '下单助理',
        op: '操作',
        op_truck: '拖车操作',
        op_customs: '关务操作',
        op_wh: '仓储操作',
        line_cs: '航线客服',
        doc: '文件',
        csc: '单证',
        ac: '应收财务',
        eac: '海外应收财务',
        bkg: '订舱',
        epricing: '海外商务',
        ecs: '海外客服',
      }
    }
  },
  props: {
    serviceType: {
      type: String,
      default: ''
    }
  },
  activated() {
  },
  created() {
    // console.log('11111111111111', this.userEditRoles, this.ordDetRole)
  },
  mounted() {
  },
  computed: {
    roles() {
      // 在OrderDetail、OrderBook这两个组件中会有角色切换。如果同时存在op、op_truck、,op_customs,op_wh,line_cs,则只显示op角色，不用显示切换按钮。
      // 进口拼箱业务如果同时存在op、op_truck,line_cs,bkg不显示切换按钮。这几个权限同op一致
      let arr = []
      let userEditRolesArr = this.userEditRoles.filter(el=>el!=='pricing')
      for(let i=0;i<userEditRolesArr.length;i++){
        if(['op','line_cs','op_truck','op_customs','op_wh'].includes(userEditRolesArr[i])){
          if(!arr.includes('op')){
            arr.push('op')
          }
        } else {
          arr.push(userEditRolesArr[i])
        }
      }
      console.log('arr', arr);
      return arr
      // if (['st11', 'st12'].includes(this.serviceType)) {
      //   return this.userEditRoles.filter(item => item !== 'line_cs')
      // }
      // return this.userEditRoles.filter(item => item !== 'op_truck' && item !== 'line_cs')
    }
  },
  components: {
  },
  watch: {
  },
  methods: {
    // 切换角色
		handleChangeRole(item) {
      if (item === 'eac') item = 'ac'
      if (item === 'line_cs') item = 'op'
      this.$store.dispatch('order/setRole', item)
      // this.$emit('callback')
		},
  }
}
</script>
<style lang="scss" scoped>
.role-container {
  padding-left: 8px;
  /deep/ .el-button{
    height: 20px;
    padding: 0 8px;
    margin-bottom: 4px;
    &.active{
      color: #3E80F5;
      border-color: #3E80F5;
    }
  }
}
</style>