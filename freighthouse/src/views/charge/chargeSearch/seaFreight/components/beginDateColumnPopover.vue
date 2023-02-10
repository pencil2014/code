<template>
  <span class="review-row-table-header-container">
    <el-tooltip placement="top" v-if="subRouteList && subRouteList.length">
      <div slot="content" >
        <div class="payment-advance" >
          <div class="payment-advance-list" v-for="(sItem, index) in subRouteList" :key="'sItem' + index">
            {{sItem.beginDate}}~{{sItem.endDate}}
          </div>
       </div>
      </div>
      <div class="info cnt-box">{{param[item.prop]}}</div>
    </el-tooltip>
    <el-tooltip placement="top" v-else :content="`${param.beginDate}~${param.endDate}`">
      <div class="cnt-box">{{param[item.prop]}}</div>
    </el-tooltip>
  </span>
</template>

<script>
export default {
  data() {
    return {
    }
  },
  props: ['param', 'item'],
  created() {
    
  },
  mounted() {
  },
  computed: {
    subRouteList() {
      const res = new Map();
      let result=[];
      if(this.param['subRouteList'].length>0){
        result = this.param['subRouteList'].filter((item) => !res.has(`${item.beginDate}~${item.endDate}`) && res.set(`${item.beginDate}~${item.endDate}`, 1))
      }
      console.log('result', result)
      return result
    }
  },
  watch: {
  },
  components: {
  },
  methods: {
  }
};
</script>

<style lang="scss" scoped>
.review-row-table-header-container{
  white-space: normal;
  overflow: hidden;
  .info{
    height: 26px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 26px;
    position: relative;
  }
}
.el-tooltip__popper.is-dark{
  transform: translateY(10px);
}
.cnt-box{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>