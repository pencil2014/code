<template>
  <span class="review-row-table-header-container">
    <el-tooltip placement="top" v-if="subRouteList && subRouteList.length">
      <div slot="content" >
        <div class="payment-advance" >
          <div class="payment-advance-list"  v-for="(sItem, index) in subRouteList" :key="'sItem' + index">
            {{sItem.polEname}}({{sItem.schedule}}){{sItem.carrierService?"("+sItem.carrierService+")":""}}{{sItem.voyage}}天
          </div>
       </div>
      </div>
      <div class="info cnt-box">{{param.polEname}}({{param.schedule}}){{param.carrierService?"("+param.carrierService+")":""}}{{param.voyage}}天</div>
    </el-tooltip>
    <el-tooltip placement="top" v-else :content="`${param.polEname}(${param.schedule})${param.carrierService ? `(${param.carrierService})`:''}${param.voyage}天`">
      <div class="cnt-box">{{param.polEname}}({{param.schedule}}){{param.carrierService?"("+param.carrierService+")":""}}{{param.voyage}}天</div>
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
      const res = new Map();
      let result=[];
      if(this.param['subRouteList'].length>0){
           result= this.param['subRouteList'].filter((item) => !res.has(item.schedule) && res.set(item.schedule, 1))
      }
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