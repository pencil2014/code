<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="handleClick" style="margin:0 14px">
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

<style>
</style>