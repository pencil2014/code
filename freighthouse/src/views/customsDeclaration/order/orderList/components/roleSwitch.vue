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
      return this.cdRoleCodesOptions.filter(el => this.shipRoles.includes(el.value))
    },
    shipRoles(){
      let arr=[]
      for(let i=0;i<this.roles.length;i++){
        if(['bd','obd','asst'].includes(this.roles[i])){
          if(!arr.includes('bd')){
            arr.push('bd')
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
}
.role-container .el-button{
	height: 20px;
	padding: 0 8px;
	margin-bottom: 4px;
}
.role-container .el-button.active{
	color: #3E80F5;
	border-color: #3E80F5;
}
</style>