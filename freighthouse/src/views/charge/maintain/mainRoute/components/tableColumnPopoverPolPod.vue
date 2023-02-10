<template>
  <span class="review-row-table-header-container">
    <el-tooltip placement="top" v-if="portlist && portlist.length > 1">
      <div slot="content">
        <span v-for="sItem in portlist" :key="sItem.ename">{{`${sItem.ename}(${sItem.cname})`}}<br/></span>
      </div>
      <div>
        <!-- <i class="recommend"></i> -->
        <span class="column-span">{{`${portlist[0].ename}(${portlist[0].cname})`}}</span>
      </div>
    </el-tooltip>
    <div v-else-if="portlist && portlist.length === 1">
      <!-- <i class="recommend"></i> -->
      <span class="column-span">{{`${portlist[0].ename}(${portlist[0].cname})`}}</span>
    </div>
    <!-- <div v-else>
      <i class="recommend"></i>
      <span class="column-span">-- → {{param.podCode ? `${param.podEname}(${param.podCname})` : '--'}}</span>
    </div> -->
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
    portlist() {
      let {popOverProp} = this.item
      // console.log(this.param[popOverProp]);
      return this.param[popOverProp]
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

<style lang="scss">
.review-row-table-header-container, .review-row-table-header-container .column-span{
  white-space: normal;
}
</style>
