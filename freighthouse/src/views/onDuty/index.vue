<template>
  <div class="app-container duty-index-container">
    <div class="search-container">
      <Search ref="search" :searchConditionHide="true" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
        <AddFilter :searchInputGroup="searchInputGroup" :allFilterGroups="allFilterGroups" :filterGroups="filterGroups" :defaultSearchLength="defaultSearchLength" :callback="searchCallBack" :index="index" :item="item" v-for="(item, index) in searchInputGroup" :key="'filter' + index" />
      </Search>
    </div>
    <div class="table-container table-layout" ref="tableCont">
      <el-table :data="tableData" style="width: 100%" border v-loading="loading" :span-method="arraySpanMethod" :cell-class-name="changeCellStyle" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
        <el-table-column prop="companyName" label="分公司" width="180" align="left">
        </el-table-column>
        <el-table-column prop="deptName" label="值班部门" width="120" align="left">
        </el-table-column>
        <el-table-column prop="name" label="值班时间" width="300" align="left">
          <template slot-scope="scope">
            {{scope.row.dutyTimeBegin.substring(0,16)}} 至 {{scope.row.dutyTimeEnd.substring(0,16)}}
          </template>
        </el-table-column>
        <el-table-column prop="employeeName" label="值班人" align="left">
        </el-table-column>
        <el-table-column prop="telephone" label="座机" align="left">
        </el-table-column>
        <el-table-column prop="mobileNo" label="手机" align="left">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" align="left">
        </el-table-column>
        <el-table-column prop="remark" label="备注" align="left">
          <template slot-scope="scope">
            <span class="column-text">{{scope.row.remark}}</span>
          </template>
        </el-table-column>
      </el-table>
      <table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { baseEmployeeListName, companyPageList } from '@/api/base'
import { departmentTreeList } from '@/api/companyResource'

import { dutyIndexList } from '@/api/duty'

const defaultPage = {
  pageSize: -1,
  currPage: 1
}
const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: ['dutyDate'],
  query: [],
  flag: '2,3' // 订单状态，默认展示未审核
}
const defaultSearchInputGroup = [
  {
    key: 'dutyDate',
    placeholder: '值班时间',
    category: 'all',
    queryValue: '',
    value:
      new Date().getFullYear() +
      '-' +
      (new Date().getMonth() + 1).toString().padStart(2, '0') +
      '-' +
      new Date().getDate().toString().padStart(2, '0')
  },
  {
    key: 'employeeId',
    value: '',
    placeholder: '值班人',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'deptCode',
    value: '',
    placeholder: '值班部门',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'companyCode',
    value: '',
    placeholder: '分公司',
    category: 'all',
    queryValue: ''
  }
]

export default {
  data() {
    return {
      tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      },
      tableData: [],
      defaultColumns: [
        'companyName',
        'deptName',
        'dutyTimeBegin',
        'employeeName',
        'telephone',
        'mobileNo',
        'email',
        'remark'
      ],
      isSameCode: false,
      loading: true,
      state: '',
      defaultSearchLength: 4, // 默认显示搜索框的个数
      allFilterGroups: {
        all: this.filterGroups
      },
      // 查询条件下拉选项
      filterGroups: {
        dutyDate: {
          label: '值班时间',
          key: 'dutyDate',
          type: 'date',
          searchType: 'eq',
          value: '',
          format: 'yyyy-MM-dd'
        },
        employeeId: {
          key: 'employeeId',
          label: '值班人',
          type: 'remoteSelect',
          searchType: 'like',
          // multiple: true,
          // 'collapse-tags': true,
          'allow-create': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getEmployeeName('', item)
          },
          filterMehod: (val, item) => {
            this.getEmployeeName(val, item)
          }
        },
        deptCode: {
          label: '值班部门',
          key: 'deptCode',
          type: 'cascader',
          searchType: 'eq',
          cascaderList: [],
          saveList: [],
          cascaderProps: {
            children: 'childList',
            label: 'deptCname',
            value: 'deptCode',
            checkStrictly: true
          }
        },
        companyCode: {
          key: 'companyCode',
          label: '分公司',
          type: 'remoteSelect',
          searchType: 'eq',
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            if (val) this.getCompanyList('', item)
          },
          filterMehod: (val, item) => {
            this.getCompanyList(val, item)
          }
        }
      },
      // 默认展示的搜索条件，搜索条件分类
      searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
      searchConfig: [],

      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      // table复选框多选的值
      selectedCheckbox: [],
      // table基础组件
      tableConfig: {
        style: {},
        tableIndex: {
          show: false
        },
        options: {
          // 是否支持解锁列表修改,默认锁定列表不可更改
          lockState: true,
          // 是否支持列表项选中功能
          mutiSelect: false,
          // 多选框状态判断 {false不可选, true可选}
          checkSelectable() {
            return false
          }
        },
        list: [],
        configColumns: [],
        columns: [],
        allColumns: [
          {
            label: '分公司',
            key: 'companyName',
            prop: 'companyName',
            disabled: false,
            width: '120'
          },
          {
            label: '值班部门',
            key: 'deptName',
            prop: 'deptName',
            disabled: false,
            width: '120'
          },
          {
            label: '值班时间',
            key: 'dutyTimeBegin',
            prop: 'dutyTimeBegin',
            disabled: false,
            width: '300',
            formatter: (row, column) => {
              return `${row.dutyTimeBegin.substring(
                0,
                16
              )} 至 ${row.dutyTimeEnd.substring(0, 16)}`
            }
          },
          {
            label: '值班人',
            key: 'employeeName',
            prop: 'employeeName',
            disabled: false
            // width: '120'
          },
          {
            label: '座机',
            key: 'telephone',
            prop: 'telephone',
            disabled: false
            // width: '120'
          },
          {
            label: '手机',
            key: 'mobileNo',
            prop: 'mobileNo',
            disabled: false
            // width: '120'
          },
          {
            label: '邮箱',
            key: 'email',
            prop: 'email',
            disabled: false,
            width: '120'
          },
          {
            label: '备注',
            key: 'remark',
            prop: 'remark',
            disabled: false
            // width: '120'
          }
        ].map((item) => {
          return { ...item, minWidth: item.width }
        }),
        // 操作按钮组
        operationBtns: {
          minWidth: '120',
          fixed: 'right',
          show: false,
          callback: (action, $index, row, item) => {
            // if (action === 'Edit') {
            //   this.handleEdit(row)
            // }
            // if (action === 'Delete') {
            //   this.handleDelete(row)
            // }
          },
          data: []
        },
        // 操作提示
        tips: {
          text: '',
          show: false
        },
        // 分页
        pagination: {
          show: false,
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
        }
      },
      tableColumnsWidthList: [],
      resDefaConfList: [], // 后端配置的默认搜索模板
      bdRemarkParam: {},
      // 合并的长度
      colSpanArr: [],
      needMergeArr: ['companyCode', 'deptCode'], // 有合并项的列
      rowMergeArrs: {} // 包含需要一个或多个合并项信息的对象
    }
  },
  deactivated() {
    window.removeEventListener('keydown', this.handleKeyDown)
  },
  created() {
    this.init()
    this.getList()
    // this.$store.dispatch('dict/queryDutyDeptList')
    this.getDeptList()
    window.addEventListener('keydown', this.handleKeyDown)
  },
  mounted() {},

  computed: {
    ...mapState('user', ['deptCode']),
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    }),
    timeDefault() {
      let date =
        new Date().getFullYear() +
        '-' +
        (new Date().getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        new Date().getDate().toString().padStart(2, '0')
      return date
    }
  },
  watch: {},
  components: {
    Search,
    AddFilter,
    BaseTableMuti,
    BaseDialog,
    CustomColumns,
    TableFilter
  },
  methods: {
    getTreeData(data) {
      data.forEach(
        (item) =>
          (item.childList = item.childList.length
            ? this.getTreeData(item.childList)
            : undefined)
      )
      return data
    },
    // 值班部门
    getDeptList() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        let departmentList=[]
        departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
        this.$set(this.filterGroups, 'deptCode', {
          label: '值班部门',
          key: 'deptCode',
          type: 'cascader',
          searchType: 'eq',
          cascaderList: departmentList,
          saveList: [],
          cascaderProps: {
            children: 'childList',
            label: 'deptCname',
            value: 'deptCode',
            checkStrictly: true
          }
        })
      })
    },
    // 单元格合并
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'companyName')
        return this.mergeAction('companyCode', rowIndex, column)
      if (column.property === 'deptName')
        return this.mergeAction('deptCode', rowIndex, column)
    },
    mergeAction(val, rowIndex, colData) {
      if (!this.rowMergeArrs[val]) {
        return
      }
      let _row = this.rowMergeArrs[val].rowArr[rowIndex]
      let _col = _row > 0 ? 1 : 0
      return [_row, _col]
    },
    rowMergeHandle(arr, data) {
      if (!Array.isArray(arr) && !arr.length) return false
      if (!Array.isArray(data) && !data.length) return false
      let needMerge = {}
      arr.forEach((i) => {
        needMerge[i] = {
          rowArr: [],
          rowMergeNum: 0
        }
        data.forEach((item, index) => {
          if (index === 0) {
            needMerge[i].rowArr.push(1)
            needMerge[i].rowMergeNum = 0
          } else {
            if (item[i] === data[index - 1][i]) {
              needMerge[i].rowArr[needMerge[i].rowMergeNum] += 1
              needMerge[i].rowArr.push(0)
            } else {
              needMerge[i].rowArr.push(1)
              needMerge[i].rowMergeNum = index
            }
          }
        })
      })
      return needMerge
    },
    // 鼠标移入cell
    showTooltip(row, column, cell) {
      this.tableCellMouse.cellDom = cell
      this.tableCellMouse.row = row
      this.tableCellMouse.hidden = false
    },
    // 鼠标移出cell
    hiddenTooltip() {
      this.tableCellMouse.hidden = true
    },
    changeCellStyle(row, column, rowIndex, columnIndex) {
      if (row.column.label === '分公司' || row.column.label === '值班部门') {
        return 'duty-column'
      }
    },
    // 分公司下拉
    getCompanyList(val, item) {
      let data = {
        query: [
          { column: 'companyName', type: 'like', value: val },
          { column: 'state', type: 'eq', value: 'valid' }
        ],
        pageSize: 1000
      }
      companyPageList(data).then((res) => {
        let filterArr = res.data.list.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.companyCode)
        )
        let itemList = filterArr.map((ele) => {
          return {
            ...ele,
            label: ele.name,
            value: ele.companyCode || ''
          }
        })
        item.data = [...item.saveList, ...itemList]
      })
    },
    // 获取员工name
    getEmployeeName(val, item) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : ''
      }
      baseEmployeeListName(data).then((res) => {
        console.log(res)
        console.log(item)
        let itemList = res.data.map((ele) => {
          return {
            ...ele,
            label: this.$language === 'en' ? ele.ename : ele.cname,
            value: this.$language === 'en' ? ele.ename : ele.cname
          }
        })
        let formatArr = () => {
          let map = new Map()
          for (let item of itemList) {
            if (!map.has(item.value)) {
              map.set(item.value, item)
            }
          }
          return [...map.values()]
        }
        let newArr = formatArr()
        item.data = newArr
      })
    },
    init() {
      // 默认展示全部
      this.tableQuery.flag = '2,3'

      Object.assign(this.allFilterGroups, {
        all: this.filterGroups
      })
      this.searchInputGroup = JSON.parse(
        JSON.stringify(defaultSearchInputGroup)
      )
    },
    // enter按键事件
    handleKeyDown(e) {
      let key = null
      if (window.event === undefined) {
        key = e.keyCode
      } else {
        key = window.event.keyCode
      }
      if (key === 13) {
        this.searchCallBack('Search')
      }
    },

    // 列表数据
    getList() {
      this.rowMergeArrs = {}
      if (!this.searchInputGroup[0].value) {
        this.searchInputGroup[0].value = this.timeDefault
      }
      this.loading = true
      let params = {
        dutyDate: this.searchInputGroup[0].value || this.timeDefault,
        employeeName: this.searchInputGroup[1].value,
        deptCode: this.searchInputGroup[2].value?this.searchInputGroup[2].value[this.searchInputGroup[2].value.length - 1]:'',
        companyCode: this.searchInputGroup[3].value
      }
      dutyIndexList(params)
        .then((response) => {
          this.tableData = response.data || []
          this.rowMergeArrs = this.rowMergeHandle(
            this.needMergeArr,
            this.tableData
          )
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 查询组件回调
    searchCallBack(action, param) {
      // console.log('this.searchInputGroup', this.searchInputGroup)
      if (action === 'Search') {
        this.getList()
      }
      if (action === 'Reset') {
        this.handleSearchValueReset()
      }
      // 模板加载后修改搜索组件的数组
      if (action === 'Update') {
        this.searchInputGroup = param.length
          ? [...param]
          : [...defaultSearchInputGroup]
      }
    },
    handleSearchValueReset() {
      this.searchInputGroup.map((item) => {
        item.value = ''
        return { ...item }
      })
      // console.log('重置')
    },
    // 多选
    handleMuti(arr) {
      this.selectedCheckbox = arr
    },

    handleSizeChange() {
      this.getList()
    },

    handleCurrentChange(val) {
      this.getList()
    },

    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    // 排序
    handleSort(query) {
      this.getList()
    },

    // 过滤显示自定义的表头
    handleFilterColumns(value) {
      let { allColumns, columns } = this.tableConfig
      let temp = []
      let arr = []
      temp = allColumns.filter((item, index) => {
        return value.includes(item.prop)
      })

      // 排序 temp
      temp.sort((prev, next) => {
        const p = value.indexOf(prev.prop)
        const n = value.indexOf(next.prop)
        return p - n
      })

      temp.map((item) => {
        arr.push(item.prop)
      })

      Object.assign(this.tableConfig, {
        columns: temp,
        configColumns: arr
      })
      // console.log('tableColumns:', this.tableConfig.columns);
    }
  }
}
</script>
<style lang="scss">
.duty-index-container .filter-flex {
  width: 300px;
  .filter-search .item.width120 {
    min-width: 100px;
  }
}
.duty-index-container {
  .el-table .duty-column {
    border-right: 1px solid #e9e9e9 !important;
  }
}
</style>
