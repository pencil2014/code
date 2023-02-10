<template>
  <div class="detail-dialog">
    <el-dialog :before-close="handleCancel" :loading="loading" :visible.sync="options.show" class="dialog" title="库存出库明细"
      :modal-append-to-body='false' width="1150px">
      <div>
        <FinanceSearch ref="searchComp" :searchOption="searchOption" @search="search" />
        <div class="finance-search-list-gap"></div>
        <FinanceTable :option="tableOption" @send-multi="sendMulti" @getData="getData" />
      </div>
      <div class="dialog-footer" slot="footer">
        <el-button @click="handleConfirm" size="mini" type="success">确定</el-button>
        <el-button @click="handleCancel" size="mini">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/mixins/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { queryGoodsDetail } from '@/api/wms/inBound.js'
export default {
  components: {
    FinanceTable,
    FinanceSearch,
  },
  props: {
    options: {
      type: Object,
      default: () => { }
    }
  },
  mixins: [mixin, mixin2],
  data () {
    return {
      loading: false,
      searchOption: {}, //查询参数
      tableOption: {}, //表格参数
      dataList: [], //列表数据
      multipleSelection: [], //复选框选中数据
    }
  },
  created () {
    // 设置查询配置参数
    this.setSearchOption()
    // 设置表格配置参数
    this.setTableOption()

  },
  mounted () {
    // 获取列表数据
    this.search()
  },
  methods: {
    /**
     * @description: 设置查询参数
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-16 11:39:15
     */
    setSearchOption () {
      let searchInputGroup = [
        { key: 'inboundNo', value: '', showType: '1' },
        { key: 'workOrderNo', value: '', showType: '2' },
        { key: 'inboundLicensePlate', value: '', showType: '3' },
        { key: 'marks', value: '', showType: '4' },
      ]
      let filterGroups = {
        inboundNo: { label: '入库号', type: 'input', showType: '1' },
        workOrderNo: { label: '客户入仓单号', type: 'input', showType: '2' },
        inboundLicensePlate: { label: '入库车牌', type: 'input', showType: '3' },
        marks: { label: '唛头', type: 'input', showType: '4' },
      }
      this.searchOption = {
        addFilter: {
          defaultSearchLength: 4,
          searchInputGroup,
          filterGroups,
          dateArr: ['inboundTime'],
          callback: true
        }
      }
    },
    /**
     * @description: 设置表格参数
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-16 17:14:47
     */
    setTableOption () {
      let columns = [
        {
          prop: 'inboundNo',
          label: "入库号",
          width: 130,
          input: 'text',
          type: "button",
          callback: (row) => {
            let query = {
              type: 'detail',
              title: '入库信息详情',
              id: row.inboundOrderId
            }
            this.$router.push({ path: '/wms/bound/inBoundDetail', query })
          },
        }, {
          prop: 'orderCustName',
          label: "客户名称",
          width: 180
        }, {
          prop: 'workOrderNo',
          label: "客户入仓单号",
          width: 150
        }, {
          prop: 'goodsName',
          label: "货物名称",
          width: 150
        }, {
          prop: 'specification',
          label: "规格",
          width: 150
        }, {
          prop: 'marks',
          label: "唛头",
          width: 150
        }, {
          prop: 'inboundLicensePlate',
          label: "入库车牌",
          width: 130
        }, {
          prop: 'inboundTime',
          label: "入库时间",
          width: 130,
          sType: "daterange",
          format: "yyyy-MM-dd"
        }, {
          prop: 'insideZoneName',
          label: "库位",
          width: 130
        }, {
          prop: 'estimatedQuantity',
          label: "入库数量",
          width: 100,
          formatter: ({ row }) => {
            return row.lockInventory + row.outboundQuantity
          }
        }, {
          prop: 'outboundQuantity',
          label: "已出数量",
          width: 100
        }, {
          prop: 'lockInventory',
          label: "库存数量",
          width: 100
        }
      ]
      // 分页配置
      let pagination = { ...this.option.pagination, show: true, pageSize: 20, isNew: true }
      // 整合列表配置参数
      this.tableOption = {
        ...this.option,
        id: 'tableOption',
        pagination,
        sortable: false,
        selection: {
          show: true,
          fixed: 'left'
        },
        index: {
          show: true
        },
        columns: [...columns],
        data: [],
        operationBtns: {
          show: false
        }
      }
    },
    /**
     * @description: 获取列表数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-31 14:56:07
     */
    getData (query) {
      let search = {}
      if (query && query.length) {
        query.forEach(item => {
          search[item.column] = item.value
        });
      }
      let data = {
        wmsWarehouseId: this.options.wmsWarehouseId || '',
        orderCustId: this.options.custId || '',
        inboundTime: this.options.inboundTime || '',
        ...search
      }
      queryGoodsDetail(data).then(({ code, data }) => {
        if (code === 0) {
          this.tableOption.data = data || []
        }
      })
        .finally(() => {
          this.loading = false
        })
    },
    // 分页页面数量change   有分页必写此方法
    handleSizeChange (val) {
      let query = this.$refs.searchComp.addFilterSearch()
      this.tableOption.pagination.pageSize = val
      this.getData(query)
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange (val, event) {
      let query = this.$refs.searchComp.addFilterSearch()
      this.tableOption.pagination.currPage = val
      this.getData(query)
    },
    // 搜索按钮
    search (query) {
      this.tableOption.pagination.currPage = 1
      this.getData(query)
    },
    /**
     * @description: 获取复选框选中的数据
     * @param {*} data
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-31 15:03:38
     */
    sendMulti (data) {
      this.multipleSelection = data
    },
    /**
     * @description: 确定选择
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-31 15:23:20
     */
    handleConfirm () {
      if (!this.multipleSelection.length) {
        return this.$message.error("请选择数据！")
      }
      this.$emit("sendData", this.multipleSelection)
      this.handleCancel()
    },
    handleCancel () {
      this.options.show = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
.detail-dialog {
  /deep/ .el-dialog__body {
    padding: 10px;
  }
}

</style>