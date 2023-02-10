<template>
  <div class="cnt-box">
    <el-tabs v-model="activeName" @tab-click="handleClick" class="tab">
      <el-tab-pane label="小航线" name="SmallRoute"></el-tab-pane>
      <el-tab-pane label="大航线" name="MajorRoute"></el-tab-pane>
    </el-tabs>
    <div>
    <component :is="activeName"></component>
  </div>
  </div>
</template>

<script>
import SmallRoute from './index.vue'
import MajorRoute from '@/views/permission/data/shippingLine/index'
export default {
  data() {
    return {
      activeName: 'SmallRoute'
    }
  },
  methods:{
    handleClick(){}
  },
  components:{
    SmallRoute,
    MajorRoute
  }
}
</script>

<style lang="scss" scoped>
.cnt-box{
  background-color: #fff;
  .tab{
    padding: 0 10px;
  }
}
</style>>