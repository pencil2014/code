<template>
  <div class="table-filter">
    <div class="table-filter-left">
      <div class="tit bold"></div>
    </div>
    <div class="table-filter-right">
      <div class="pulish-status">
        <el-radio-group v-model="tableQuery.orderStatus" size="mini" @change="handleSearchByStatus">
          <el-radio-button size="mini" v-for="(item, index) in statusOptions" :key="index" :label="index" >{{item}}</el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>
<script>
import {mapState} from 'vuex'

export default {
  data () {
    return {
    }
  },
  props: {
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
  created() {
  },
  mounted() {
    console.log(this.dictMap);
  },
  computed: {
    ...mapState({
      currRole: state => state.order.currRole,
      dictMap: state => state.dict.dictMap
    }),
    statusOptions() {
      return {
        all: '全部',
        todo: '未完成',
        done: '已完成',
      }
    },
  },
  components: {
  },
  methods: {
    // 按状态查询
    handleSearchByStatus(value) {
      Object.assign(this.tableQuery, {
        orderStatus: value
      })
      this.callback('SearchByStatus')
    }
  }
}
</script>
<style scoped>

</style>  
