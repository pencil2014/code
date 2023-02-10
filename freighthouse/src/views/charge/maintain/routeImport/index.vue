<template>
  <div class="routeImport">
    <div class="components-container">
      <el-tabs v-model="activeName" @tab-click="changeComponent">
        <el-tab-pane v-for="(item,index) in label" :key="index" :label="item.name" >
        </el-tab-pane>
        <component :is="show" ></component>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import shipType from "./shipType"
import bargeType from "./bargeType"
export default {
  components:{ shipType, bargeType },
  name:"routeImport",
  data(){
    return {
      label:[{name:"大船类型"},{name:"驳船类型"}],
      activeName:this.show,
      show:"shipType",
    }
  },
  methods:{
    changeComponent(value){
      console.log(value);
      if(value.index == 0){
         this.show="shipType"
      }else if(value.index == 1){
        this.show = "bargeType"
      }
    }
  }
    
}
</script>

<style lang="scss" scoped>
.routeImport{
  padding:10px;
  .components-container {
    padding: 10px;
    background-color: #fff;
    position: relative;
  }
  /deep/ .el-tabs__header{
    margin: 0 0 10px;
  }
  /deep/ .el-tabs__item {
    height: 24px;
    line-height: 24px;
    padding: 0 24px;
    font-size: 14px;
    font-weight: 600;
    color:#BFBFBF;
    &.is-active {
      color: #222222;
    }
  }
  .el-table thead{
    color:#000000;
  }
}
</style>