<template>
  <div>
    <el-dialog :before-close="handleCancel" :loading="loading" :visible.sync="options.show" class="dialog" title="选择费用模板"
      :modal-append-to-body='false' width="900px">
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
import { feeTemplateQueryPage } from '@/api/wms'
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
        { key: 'templateName', value: '', showType: '1' },
      ]
      this.searchOption = {
        addFilter: {
          defaultSearchLength: 1,
          plusShow: false,
          searchInputGroup,
          filterGroups: { templateName: { label: '模版名称', type: 'input', showType: '2' } },
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
          prop: 'feeTemplateId',
          label: '模板编号',
          type: 'text',
          width: 80
        },
        {
          prop: 'templateName',
          label: '模板名称',
          type: 'text',
          width: 130
        },
        {
          prop: 'templateType',
          label: '模板类型',
          type: 'text',
          width: 120,
          formatter: ({ cellValue }) => {
            return cellValue === 'customer_template' ? '客户模板' : cellValue === 'common_template' ? '通用模板' : cellValue
          }
        },
        {
          prop: 'custName',
          label: '客户名称',
          type: 'text',
          width: 150
        },

        {
          prop: 'warehouseName',
          label: '仓库名称',
          type: 'text',
          width: 150
        },
        {
          prop: 'enabled',
          label: '启用状态',
          type: 'text',
          formatter: ({ cellValue }) => {
            return cellValue === 'yes' ? '<span style="color:#33B18A;" >启用</span>' : cellValue === 'no' ? '<span style="color:#CD4130;">禁用</span>' : cellValue
          }
        },
        {
          prop: 'priority',
          label: '优先级',
          type: 'text'
        },
        {
          prop: 'remark',
          label: '备注',
          type: 'text',
          width: 130
        },
        ,
        {
          prop: 'createdName',
          label: '创建人',
          type: 'text'
        },
        {
          prop: 'createdTime',
          label: '创建时间',
          type: 'text',
          width: 130
        },
        {
          prop: 'updatedName',
          label: '更新人',
          type: 'text'
        },
        {
          prop: 'updatedTime',
          label: '更新时间',
          type: 'text',
          width: 130
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
      let data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: [
          { column: "custId", type: "in", value: this.options.custId },
          { column: "warehouseId", type: "eq", value: this.options.warehouseId },
          { column: "enabled", type: "eq", value: 'yes' }
        ],
        descColumns: ["priority"]
      }
      data.query = [...data.query, ...query || []]
      this.loading = true
      feeTemplateQueryPage(data).then(({ code, data }) => {
        if (code === 0) {
          this.tableOption.data = data.list || []
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
      } else if (this.multipleSelection.length > 1) {
        return this.$message.error("只能选择一条费用模板数据！")
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
</style>