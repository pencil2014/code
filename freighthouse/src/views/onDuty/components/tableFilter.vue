<template>
  <div class="table-filter">

    <div class="table-filter-left">
      <el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary">
        新建值班
      </el-button>
    </div>

    <div class="table-filter-right">
      <div class="pulish-status">
        <el-radio-group v-model="tableQuery.flag" size="mini" @change="handleSearchByStatus">
          <el-radio-button size="mini" v-for="(item, index) in statusOptions" :key="index" :label="item.value">{{item.label}}</el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {}
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    // 接口传参
    tableQuery: {
      type: Object,
      default: () => ({})
    },
    callback: {
      type: Function,
      default: () => ({})
    }
  },
  created() {},
  mounted() {},
  computed: {
    statusOptions() {
      return [
        {
          label:'当前排班',
          value:'2,3'
        },
        {
          label:'排班记录',
          value:'1'
        }
      ]
    },
  },
  components: {},
  methods: {
    // 新建
    handleAdd() {
      this.callback('Add')
    },
    // 按发布状态查询
    handleSearchByStatus(value) {
      Object.assign(this.tableQuery, {
        flag: value
      })
      this.callback('SearchByOrderStatus')
    }
  }
}
</script>
<style scoped>
</style>  
