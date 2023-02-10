<template>
  <div>
    <div class="table-filter">
      <div class="table-filter-left">
        <el-button size="mini" ref="btnCreate" @click="handleAction('Add')" type="primary"> Add Inquiry </el-button>
        <el-button size="mini" v-if="checkAuth($route.name, 'btn-export')" ref="btnExport" @click="handleAction('Export')" plain> Export </el-button>
      </div>
      <div class="table-filter-right">

        <div class="pulish-status">
          <el-radio-group v-model="tableQuery.status" size="mini" @change="handleSearchByStatus">
            <el-radio-button size="mini" v-for="(item, index) in statusOptions" :key="index" :label="index">{{ item }}</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>
    <div class="count-data-containers">
      <div class="count-data">
        Total number of inquiries:<span>{{ overSeasSumData.count }}</span>；Unsuccessful bids:<span class="red">{{ overSeasSumData.unBidCount }}</span>；Won bids:<span class="green">{{ overSeasSumData.bidCount }}</span>；Unquoted bids:<span class="red">{{ overSeasSumData.unQuoteCount }}</span>；Quoted bids:<span class="green">{{ overSeasSumData.quoteCount }}</span>
      </div>
      <el-checkbox v-model="tableQuery.isUnread" true-label="Y" false-label="N" @change="handleIsUnread">View unread records only</el-checkbox>
    </div>
  </div>

</template>
<script>
import BtnMultiOperate from '@/components/Base/Table/btnMultiOperate'
import { checkAuth } from '@/utils/checkAuth'
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
    },
    overSeasSumData: {
      type: Object,
      default: () => ({})
    }
  },
  created() {},
  mounted() {},
  computed: {
    statusOptions() {
      return {
        ALL: 'All',
        INIT: 'Not quoted',
        QUOTED: 'Quoted',
        BREAK: 'Terminated',
        SUCCESS: 'Awarded'
      }
    }
  },
  components: {
    BtnMultiOperate
  },
  methods: {
    // 按发布状态查询
    handleSearchByStatus(value) {
      Object.assign(this.tableQuery, {
        status: value
      })
      console.log(this.tableQuery.status)

      this.callback('SearchByOrderStatus')
    },
    checkAuth(pageCode, moduleCode, subModuleCode) {
      return checkAuth(pageCode, moduleCode, subModuleCode)
    },
    // 新建
    handleAction(type) {
      this.callback(type)
    },
    handleIsUnread() {
      this.callback('IsUnread')
    }
  }
}
</script>
<style lang="scss" scoped>
.count-data {
  height: 20px;
  display: flex;
  align-items: center;
  margin-right: 20px;
  span{
    display: inline-block;
    padding-left: 4px;
  }
}
.count-data-containers{
	display: flex;
	justify-content: flex-end;
	padding-bottom: 4px;
}
</style>
