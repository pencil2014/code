<template>
  <div class="table-filter">

    <div class="table-filter-left">
      <el-button size="mini" ref="btnExport" @click="handleExport('Export')" plain>
        {{$t('charge.export')}}
      </el-button>
      <!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
    </div>
    
    <div class="table-filter-right">
      <div class="pulish-status">
        <el-radio-group v-model="tableQuery.tabVal" size="mini" @change="handleSearchByStatus">
          <el-tooltip :content="tabTipsObj[index]" placement="top" effect="dark" v-for="(item, index) in statusOptions" :key="index">
            <el-radio-button size="mini" :label="index" >{{item}}</el-radio-button>
          </el-tooltip>
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
      status: '0'
    }
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
  created() {
  },
  mounted() {
  },
  computed: {
    ...mapState({
      currRole: state => state.user.currRole,
      dictMap: state => state.dict.dictMap
    }),
    statusOptions() {
      return {
        "0": "全部",
        "1": "未完成",
        "2": "撤回申请",
        "3": "已完成"
      }
    },
    tabTipsObj() {
      return {
        '0': '包含订单状态：审核通过、完成、取消、终止',
        '1': '包含订单状态：审核通过、取消、终止',
        '2': '包含订单状态：审核通过、取消、终止',
        '3': '包含订单状态：审核通过、完成、取消、终止',
      }
		},
  },
  components: {
  },
  watch: {
  },
  methods: {
    // 导出
    handleExport() {
      this.$confirm('是否确认导出？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.callback('Export')
      })
    },

    // 自定义表头
    handleCustomColumns() {
      this.callback('CustomColumns')
    },

    // 按发布状态查询
    handleSearchByStatus(value) {
      this.$set(this.tableQuery, 'tabVal', value)
      this.callback('SearchByJointStatus')
    }
  }
}
</script>
<style scoped>

</style>  
