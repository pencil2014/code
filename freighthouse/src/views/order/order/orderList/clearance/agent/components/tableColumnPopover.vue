<template>
  <span class="review-row-table-header-container">
    <el-tooltip placement="top" v-if="surchargeList && surchargeList.length">
      <div class="tableColumnPopover" slot="content">
        <ul v-for="(s, i) in param.soList.list" :key="i">
          <li>SO：{{s.so}}</li>
          <li>箱号：{{s.cn}}</li>
        </ul>
      </div>
      <div>{{param.containers}}</div>
      <!-- <el-button type="text" size="mini">{{param.label}}</el-button> -->
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
    surchargeList() {
      let {prop} = this.item
      return this.param[prop]
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
.tableColumnPopover ul {
  padding: 0 10px;
  list-style: none;
  margin: 5px 0 10px;
}
.review-row-table-header-container{
  white-space: normal;
}
</style>
