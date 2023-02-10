<template>
  <div class="hbl-page-manage">
    <el-tabs v-model="activeName" @tab-click="handleClick" class="fin-el-tabs">
      <el-tab-pane 
         v-for="(item, index) in tabsList"
         :key = "index"
         :label="item.label" 
         :name="item.value"
         class="fin-el-tab-pane"
       ></el-tab-pane>
    </el-tabs>
    <keep-alive>
      <component
        :is="activeName"
      />
    </keep-alive>
  </div>
</template>

<script>
import pageManage from './pageManage/pageManage.vue'
import transferRecords from './pageManage/transferRecoreds.vue'
export default {
   data() {
     return {
       activeName: 'pageManage',
       tabsList: [
        {
          label: 'HBL提单纸',
          value: 'pageManage'
        },
        {
          label: 'HBL转移记录',
          value: 'transferRecords'
        },
       ]
     }
   },
   components: {
     pageManage,
     transferRecords
   },
   methods: {
    handleClick() {

    }
   }
}
</script>

<style lang="scss" scoped>
.hbl-page-manage {
  font-size: 12px;
  margin: 14px;
  min-height: calc(100vh - 58px);
  background: #FFF;
}
</style>