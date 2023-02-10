<template>
  <div class="wrap finance-page" ref="layout">
    <group-tree :style="treeStyle" ref="organizeTree" @bindSelectData="getSelectTree" />
    <div class="memberinfo" ref="right">
      <div
        v-loading="loading"
        :element-loading-text="eLoadingText"
        :element-loading-spinner="eLoadingSpinner"
        :element-loading-background="eLoadingBackground"
      >
        <div class="prepay">
          <FinanceSearch :searchOption="searchOption" @search="search" />
          <div class="finance-search-list-gap"></div>
          <div class="finance-list-container">
            <div class="money-box">
              <div class="money-box-left">
                <el-button size="mini" type="primary" @click="showDetail()">新增分摊组别</el-button>
              </div>
              <div class="money-box-right"></div>
            </div>
            <FinanceTableMass :option="option1" @send-multi="sendMulti" />
          </div>
        </div>
      </div>
    </div>
    <UpdateDialog :option="dialogOption" @close="dialogClose" />
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import GroupTree from './groupTree'
import UpdateDialog from '@/views/baseData/commonData/taxRate/baseDialog'
import API from '@/api/fin/cmsBd.js'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
const TREELIST = []
export default {
  mixins: [mixin, mixin2],
  data() {
    return {
      allotGroupId: '',
      searchOption: {},
      option1: {},
      // 初始表头
      selfColumnsBase: [
        { disabled: true, prop: 'allotGroupName', label: '分摊组别名称', width: '140px' },
        { prop: 'enable', label: '是否有效', type: 'select', propInDict: 'yesNo' },
        { prop: 'createdName', label: '创建人', type: 'text' },
        { prop: 'createdTime', label: '创建时间', type: 'text', minWidth: 130 },
        { prop: 'updatedName', label: '修改人', type: 'text' },
        { prop: 'updatedTime', label: '修改时间', type: 'text', minWidth: 130 },
      ],
      flatTree: [],
      dialogOption: {
        show: false,
        title: '',
        padding: '0',
        labelWidth: '118px',
        inputFull: true,
        form: { allotGroupName: '', enable: 'yes', parentAllotGroupId: '' },
        formItems: [
          {
            label: '分摊组别名称',
            prop: 'allotGroupName',
            type: 'input',
            rules: { required: true, message: ' ', trigger: 'blur' },
          },
          {
            label: '是否有效',
            prop: 'enable',
            propInDict: 'yesNo',
            type: 'select',
            rules: { required: true, message: ' ', trigger: 'blur' },
          },
          {
            label: '上级分摊组别',
            prop: 'parentAllotGroupId',
            type: 'cascader',
            cascaderList: TREELIST,
            cascaderProps: { children: 'subAllotGroup', label: 'allotGroupName', value: 'allotGroupId', checkStrictly: true },
            disabled: false,
          },
        ],
      },
      loading: false,
      treeStyle: { height: 0 },
    }
  },
  components: { UpdateDialog, GroupTree, FinanceTableMass, FinanceSearch },
  watch: {
    'dialogOption.show': {
      handler(newVal) {
        !newVal && this.initDialogTree()
      },
      immediate: true,
    },
  },
  created() {
    // 搜索配置
    let searchArr = ['allotGroupName', 'enable']
    this.searchOption = {
      addFilter: {
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          allotGroupName: { label: '分摊组别名称', type: 'input' },
          // createdName: { label: '创建时间', type: 'daterange' },
          // createdTime: { label: '创建人', type: 'input' },
          // updatedName: { label: '修改时间', type: 'daterange' },
          // updatedTime: { label: '修改人', type: 'input' },
          enable: { label: '是否有效', type: 'select', prop: 'yesNo' },
        },
      },
    }
    let pagination = Object.assign({}, this.option.pagination, { show: true })
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [{ label: '查看', type: 'text', show: true, action: 'showDetail' }],
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: { text: '', show: false },
      pagination,
      operationBtns,
      selection: false,
      maxHeight: this.getFinanceTableMaxHeight,
    })
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    // console.log(this.configColumns)
    this.selfColumnsBase.forEach((item) => (item.sortable = true))
    this.option1.columns = columns
  },
  mounted() {
    this.getData()
    this.getTreeData()
  },
  methods: {
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    getTreeData() {
      this.$refs.organizeTree.requestTreeData()
    },
    getSelectTree(data, checked, indeterminate, addSelectedOption) {
      if (data) {
        this.allotGroupId = data.allotGroupId
        this.search()
      }
    },
    getData(isSearch) {
      this.loading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      const filterGroups = this.searchOption.addFilter.filterGroups
      this.searchOption.addFilter.searchInputGroup.forEach((item) => {
        let { key: column, range, value } = item
        let min = range.min.trim()
        let max = range.max.trim()
        if (range && (min !== '' || max !== '')) {
          min && data.query.push({ column, type: 'ge', value: min })
          max && data.query.push({ column, type: 'le', value: max })
          return
        }
        if (!value) return
        if (value instanceof Array) {
          if (!value.length) return
          if (filterGroups[column].type === 'daterange') {
            data.query.push({ column, type: 'ge', value: value[0] })
            data.query.push({ column, type: 'le', value: value[1] })
          } else {
            data.query.push({ column, type: 'in', value: value.join(',') })
          }
        } else if (value.trim()) {
          data.query.push({ column, type: filterGroups[column].type === 'select' ? 'eq' : 'like', value: value.trim() })
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      this.allotGroupId && data.query.push({ column: 'allotGroupId', type: 'eq', value: this.allotGroupId })
      API.allotgroupList(data)
        .then((res) => {
          this.option1.data = res.data ? res.data.list : []
          this.option1.pagination.currPage = res.data.currPage
          this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 新增 / 修改
    showDetail(data) {
      this.dialogOption.title = data ? '编辑' : '新增'
      this.dialogOption.form = { allotGroupName: '', enable: 'yes', parentAllotGroupId: [] }
      this.dialogOption.show = true
      if (data) {
        let parentAllotGroupId = []
        this.getParents(data, parentAllotGroupId)
        console.log(data.parentAllotGroupId)
        console.log(parentAllotGroupId)
        this.$nextTick(() => Object.assign(this.dialogOption.form, data, { parentAllotGroupId }))
      }
    },
    // 表单搜索
    search(data, reset) {
      if (reset === true) {
        this.allotGroupId = ''
      }
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    sendMulti(data, option) {},
    dialogClose(tag) {
      if (!tag) {
        this.dialogOption.show = false
        return
      }
      let data = { ...this.dialogOption.form }
      data.parentAllotGroupId = data.parentAllotGroupId[data.parentAllotGroupId.length - 1] || -1
      API.allotgroupSave(data)
        .then((res) => {
          this.$msgSucClose((data.allotGroupId ? '编辑' : '新增') + '成功！')
          this.dialogOption.show = false
          this.getTreeData()
          this.getData()
        })
        .catch(() => (this.loading = false))
    },
    getParents(data, res) {
      if (data.parentAllotGroupId > 0) {
        let find = this.flatTree.find((v) => v.allotGroupId === data.parentAllotGroupId)
        if (find) {
          res.unshift(data.parentAllotGroupId)
          this.getParents(find, res)
        }
      }
    },
    // 部门下拉框
    initDialogTree() {
      this.flatTree = []
      API.allotgroupTree({}).then((res) => {
        TREELIST.splice(0, 1000, ...this.getTreeData2(res.data || []))
        console.log(this.flatTree.map((item) => item.parentAllotGroupId + ',' + item.allotGroupId))
      })
    },
    // 转化children的空数组为undefined
    getTreeData2(data) {
      data.forEach((item) => {
        this.flatTree.push({ ...item, subAllotGroup: undefined })
        item.subAllotGroup = item.subAllotGroup.length ? this.getTreeData2(item.subAllotGroup) : undefined
      })
      return data
    },
  },
}
</script>

<style lang="scss" scoped>
.finance-page ::v-deep {
  // margin: 14px 0 !important;
  .el-dialog__body .el-form-item__content {
    width: 100% !important;
  }
  .search-input .el-input__inner {
    padding-left: 20px !important;
  }
}
.wrap {
  // 树结构
  .organize-tree {
    background: #f5f5f5;
    border: 1px solid #ccc;
    ::v-deep .el-tree {
      color: #232326;
    }
    // 搜索框
    ::v-deep.el-input__inner,
    ::-webkit-input-placeholder {
      color: #666;
      font-weight: 400;
    }

    // 目录
    ::v-deep.custom-tree-node {
      font-size: 12px;
    }
    // 选中效果
    ::v-deep.el-tree-node_bgc {
      background: #0080e1 !important;
      color: #fff !important;
    }
  }
  .operation-btns-box {
    padding-left: 10px;
  }
}

.memberinfo {
  overflow: hidden;
  ::v-deep .el-card__body {
    padding-bottom: 0;
  }
}
</style>
