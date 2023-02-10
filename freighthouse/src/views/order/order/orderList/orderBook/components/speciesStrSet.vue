<template>
  <div>
      <el-button @click="set" size="mini">特殊字符配置</el-button>
      <el-dialog title="特殊字符配置" :visible.sync="visible">
           <el-input v-model="value" type="textarea" placeholder="请输入"></el-input>
           <div class="tip">* 多个特殊字符请用英文逗号隔开，M单不支持该配置</div>
           <div class="foot-class">
               <el-button size="mini" @click="cancel">取消</el-button>
               <el-button size="mini" type="primary" @click="submit">确定</el-button>
           </div>
          
      </el-dialog>
  </div>
</template>

<script>
export default {
   data() {
       return {
           visible: false,
           value: '',
           initData: '³,×,°'
       }
   },
   created() {
       let speciesStr = localStorage.getItem('speciesStrStrage')
       if(speciesStr) {
           this.value = speciesStr
       } else {
           this.value = this.initData
       }
       this.$store.dispatch('order/setSpeciesStr', this.value)
   },
   methods: {
       set() {
           this.visible = true
       },
       cancel() {
           this.visible = false
       },
       submit() {
           localStorage.setItem('speciesStrStrage',this.value)
           this.$store.dispatch('order/setSpeciesStr', this.value)
           this.visible = false
       }
   }
}
</script>

<style lang="scss" scoped>
.tip {
    color: red;
}
.foot-class {
   margin-top:10px;
   text-align:right;
   font-size: 12px;
}
</style>