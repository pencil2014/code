<template>
  <div class="role-container">
    <div v-if="showRoles.length>1">
      <template v-for="(item, index) in showRoles">
        <el-button 
          :key="'role' + index"
          type="default" 
          size="mini" 
          :class="item.value === currRole ? 'active' : ''"
          @click="handleChangeRole(item)"
        >
        {{item.label}}视角
        </el-button>
      </template>
    </div>
  </div>
</template>
<script>
// import store from "@/store"
import {orderMixin} from '@/views/order/order/mixins/orderMixin'
export default {
  mixins: [orderMixin],
  data() {
    return {
    }
  },
  props: {
  },
  activated() {
  },
  created() {
    // console.log('currRole', this.currRole)
  },
  mounted() {
  },
  computed: {
    showRoles(){
      return this.roleCodesOptions.filter(el => this.shipRoles.includes(el.value))
    },
    shipRoles(){
      let arr=[]
      for(let i=0;i<this.roles.length;i++){
        if(['bd','obd','asst'].includes(this.roles[i])){
          if(!arr.includes('bd')){
            arr.push('bd')
          }
        }else if(['op','line_cs','op_truck','op_customs','op_wh'].includes(this.roles[i])){
          if(!arr.includes('op')){
            arr.push('op')
          }
        }else if(['ac','eac'].includes(this.roles[i])){
          if(!arr.includes('ac')){
            arr.push('ac')
          }
        }else{
          arr.push(this.roles[i])
        }
      }
      return arr
    }
  },
  components: {
  },
  watch: {
  },
  methods: {
    // roleShow(item) {
    //   let role = item.value
    //   // bd,obd显示业务
    //   if ( role === 'bd' && (this.roles.includes('bd') || this.roles.includes('obd')) ) {
    //     return true
    //   }
    //   // op,line_cs显示操作
    //   if ( role === 'op' && (this.roles.includes('op') || this.roles.includes('line_cs')) ) {
    //     return true
    //   }
    //   // ac,eac显示财务
    //   if ( role === 'ac' && (this.roles.includes('ac') || this.roles.includes('eac')) ) {
    //     return true
    //   }
    //   // 文件下单助理等
    //   if ( this.roles.includes(role) ) {
    //     return true
    //   }
    //   return false
    //   // return this.roles.toString().indexOf(item.value) > -1
    // },
    // 切换角色
		handleChangeRole(item) {
      // this.$store.dispatch('user/changeRole', item.value)
      this.$store.dispatch('order/setCurrRole', item.value)
      this.$emit('callback')
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