<template>
  <div class="app-container duty-container">
    <div class="search-container">
      <Search ref="search" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
        <AddFilter :searchInputGroup="searchInputGroup" :allFilterGroups="allFilterGroups" :filterGroups="filterGroups" :defaultSearchLength="defaultSearchLength" :callback="searchCallBack" :index="index" :item="item" v-for="(item, index) in searchInputGroup" :key="'filter' + index" />
        <div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
      </Search>
    </div>
    <div class="table-container" ref="tableCont">
      <TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
      <BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" v-loading="loading" />
    </div>
    <!-- 新建弹窗 -->
    <div v-if="createPopShow">
      <CreateDuty @close="createDutyPopClose" />
    </div>
    <div v-if="editPopShow">
      <EditDuty @close="editDutyPopClose" :createdItem="createdItem" />
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import CreateDuty from './components/createDuty'
import EditDuty from './components/editDuty'
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { departmentTreeList } from '@/api/companyResource'
import {
  baseEmployeeListName,
  columnWidthConfigInfo,
  columnWidthConfigSave
} from '@/api/base'

import { dutyList, dutySave, dutyEdit, dutyDelete } from '@/api/duty'

const defaultPage = {
  pageSize: -1,
  currPage: 1
}
const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: ['dutyTimeBegin'],
  query: [],
  flag: '2,3' // 订单状态，默认展示未审核
}
const defaultSearchInputGroup = [
  {
    key: 'dutyTimeBegin',
    value: '',
    placeholder: '值班时间',
    category: 'all',
    queryValue: ''
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
  }
]

export default {
  data() {
    return {
      createdItem: {
        deptCode: '',
        dutyTimeBegin: '',
        dutyTimeEnd: '',
        remark: '',
        employeeId: '',
        telephone: '',
        mobileNo: '',
        email: ''
      },
      createPopShow: false,
      editPopShow: false,
      defaultColumns: [
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
      orderNo: '',
      defaultSearchLength: 0, // 默认显示搜索框的个数
      allFilterGroups: {
        all: this.filterGroups
      },
      // 查询条件下拉选项
      filterGroups: {
        dutyTimeBegin: {
          label: '值班时间',
          key: 'dutyTimeBegin',
          type: 'date',
          searchType: 'eq',
          value: '',
          category: 'datetimerange',
          format: 'yyyy-MM-dd HH:mm'
        },
        employeeId: {
          key: 'employeeId',
          label: '值班人',
          type: 'remoteSelect',
          searchType: 'in',
          // multiple: true,
          // 'collapse-tags': true,
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
        // deptCode: {
        //   key: 'deptCode',
        //   label: '值班部门',
        //   propInDict: 'dutyDeptList',
        //   type: 'select',
        //   searchType: 'in',
        //   filterable:true,
        //   // multiple: true,
        //   // 'collapse-tags': true,
        //   value: '',
        //   data: [],
        //   saveList: [],
        //   nonDictionary: true
        // },
        deptCode: {
          label: '值班部门',
          key: 'deptCode',
          type: 'cascader',
          searchType: 'like',
          cascaderList: [],
          saveList: [],
          cascaderProps: {
            children: 'childList',
            label: 'deptCname',
            value: 'deptCode',
            checkStrictly: true
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
          show: true,
          callback: (action, $index, row, item) => {
            if (action === 'Edit') {
              this.handleEdit(row)
            }
            if (action === 'Delete') {
              this.handleDelete(row)
            }
          },
          data: [
            {
              label: '修改',
              type: 'text',
              show: (item, row) => {
                if (this.tableQuery.flag === '2,3') {
                  return true
                }
                return false
              },
              className: 'yellow',
              action: 'Edit'
            },
            {
              label: '删除',
              type: 'text',
              show: (item, row) => {
                if (this.tableQuery.flag === '2,3') {
                  return true
                }
                return false
              },
              className: 'red',
              action: 'Delete'
            }
          ]
        },
        // 操作提示
        tips: {
          text: '',
          show: false
        },
        // 分页
        pagination: {
          show: true,
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
        }
      },
      tableColumnsWidthList: [],
      resDefaConfList: [], // 后端配置的默认搜索模板
      bdRemarkParam: {}
    }
  },
  deactivated() {
    window.removeEventListener('keydown', this.handleKeyDown)
  },
  created() {
    this.init()
    this.getList()
    this.getDeptList()
    // this.$store.dispatch('dict/queryDutyDeptList')
    window.addEventListener('keydown', this.handleKeyDown)
  },
  mounted() {},

  computed: {
    ...mapState('user', ['deptCode']),
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    })
  },
  watch: {},
  components: {
    Search,
    AddFilter,
    BaseTableMuti,
    BaseDialog,
    CustomColumns,
    TableFilter,
    CreateDuty,
    EditDuty
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
    // 值班部门下拉框
    getDeptList() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        let departmentList=[]
        departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
        this.$set(this.filterGroups, 'deptCode', {
          label: '值班部门',
          key: 'deptCode',
          type: 'cascader',
          searchType: 'like',
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
    // 增加一条搜索条件
    handleAddFilter() {
      this.searchInputGroup.push({
        key: '',
        value: '',
        category: 'all',
        queryValue: ''
      })
    },
    // 新建订单关闭回调
    createDutyPopClose(action, value) {
      if (action === 'Confirm') {
        this.handleCreateDuty(value)
      } else {
        this.createPopShow = false
      }
    },
    handleCreateDuty(value) {
      dutySave(value)
        .then((res) => {
          this.getList()
          this.$message.success('添加成功')
          this.createPopShow = false
        })
        .catch(() => {
          this.createPopShow = false
        })
    },
    // 新建
    handleAdd() {
      this.createPopShow = true
    },
    // 编辑订单关闭回调
    editDutyPopClose(action, value) {
      if (action === 'Confirm') {
        this.handleEditDuty(value)
      } else {
        this.editPopShow = false
      }
    },
    handleEditDuty(value) {
      let params = {
        oid: value.oid,
        deptCode: value.deptCode,
        dutyTimeBegin: value.dutyTimeBegin,
        dutyTimeEnd: value.dutyTimeEnd,
        remark: value.remark,
        employeeId: value.employeeId,
        telephone: value.telephone,
        mobileNo: value.mobileNo,
        email: value.email
      }
      dutyEdit(params)
        .then((res) => {
          this.getList()
          this.$message.success('编辑成功')
          this.editPopShow = false
        })
        .catch(() => {
          this.editPopShow = false
        })
    },
    // 编辑
    handleEdit(item) {
      console.log(item)
      this.createdItem = item
      this.editPopShow = true
    },
    // 获取员工name
    getEmployeeName(val, item) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : ''
      }
      baseEmployeeListName(data).then((res) => {
        let filterArr = res.data.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.employeeId)
        )
        let itemList = filterArr.map((ele) => {
          return {
            ...ele,
            label: this.$language === 'en' ? ele.ename : ele.cname,
            value: ele.employeeId ? Number(ele.employeeId) : ''
          }
        })
        item.data = [...item.saveList, ...itemList]
      })
    },
    // 自定义列宽查询
    getTableColumnWidthInfo() {
      columnWidthConfigInfo({
        scenesCode: this.$route.name
      }).then((res) => {
        let { columnWidthList } = res.data
        // table列宽重新渲染
        this.tableConfig.columns.map((item) => {
          let findItem = columnWidthList.find((ele) => ele.column === item.prop)
          // 服务器返回的新的列宽宽度
          let newWidth = findItem ? findItem.width : ''
          return Object.assign(item, { width: newWidth || item.width })
        })
        this.tableColumnsWidthList = this.getTableColumnsWidth()
      })
    },
    // 获取本地table列表的字段和宽为数组集合
    getTableColumnsWidth() {
      let result = this.tableConfig.columns.map((item) => {
        return { column: item.prop, width: item.width }
      })
      return result
    },
    // 自定义列宽度保存
    handleSaveColumnWidth(params) {
      let data = this.tableColumnsWidthList.map((item) => {
        if (item.column === params.prop) {
          item.width = params.width
        }
        return { ...item }
      })
      columnWidthConfigSave({
        scenesCode: this.$route.name,
        columnWidthList: data
      })
        .then((res) => {})
        .finally(() => {})
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
        // console.log(window.event.target)
        // 阻止分页的页码enter键触发全局的监听事件
        let className = window.event.target.parentNode.className
        if (
          window.event.target.id === 'bdRemark' ||
          className.includes('el-pagination__editor')
        )
          return
        //触发的事件
        this.searchCallBack('Search')
      }
    },

    // 获取列表请求参数
    getListQuery() {
      let statusQuery = []
      if (this.tableQuery.flag === '2,3') {
        statusQuery = [{ column: 'flag', type: 'in', value: '2,3' }]
      } else if (this.tableQuery.flag === '1') {
        statusQuery = [{ column: 'flag', type: 'eq', value: '1' }]
      }
      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(statusQuery)
      })
      delete data.flag

      return data
    },

    // 列表数据
    async getList() {
      this.loading = true
      let query = this.getListQuery()
      let { data } = await columnWidthConfigInfo({
        scenesCode: this.$route.name
      })
      let { columnWidthList } = data
      dutyList(query)
        .then((response) => {
          let { list, totalCount, pageSize, allColumns, configColumns } =
            response.data
          this.tableConfig.list = list
          this.tableQuery.pageSize = pageSize
          this.tableConfig.pagination.total = totalCount

          this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
          this.tableConfig.pagination.hasPreviousPage =
            response.data.hasPreviousPage
          this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
          this.tableConfig.pagination.isLastPage = response.data.isLastPage
          this.tableQuery.currPage = response.data.currPage

          this.tableConfig.configColumns = configColumns.length
            ? configColumns
            : this.defaultColumns
          this.tableConfig.configColumns = new Set(
            this.tableConfig.configColumns
          )
          this.tableConfig.configColumns = Array.from(
            this.tableConfig.configColumns
          )
          this.handleFilterColumns(this.tableConfig.configColumns)
          this.tableConfig.columns.map((item) => {
            // 取服务器返回的宽度
            let findItem = columnWidthList.find(
              (ele) => ele.column === item.prop
            )
            let newWidth = findItem ? findItem.width : ''
            return Object.assign(item, { width: newWidth || item.width })
          })
          this.tableColumnsWidthList = this.getTableColumnsWidth()
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 查询组件回调
    searchCallBack(action, param) {
      let query = []
      // console.log('this.searchInputGroup', this.searchInputGroup)
      if (action === 'Search') {
        // 新增的查询条件组装tableQuery参数
        if (this.searchInputGroup.length) {
          this.searchInputGroup.forEach((item, index) => {
            let tempItem = {}

            if (item.key) {
              // 非自动补全的查询参数从item.value中取值合并到query
              if (this.filterGroups[item.key].type === 'cascader') {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value ? item.value[item.value.length - 1] : ''
                  })
                }else if (this.filterGroups[item.key].type !== 'autocomplete') {
                // 中转港
                if (
                  this.filterGroups[item.key].type === 'remoteSelect' &&
                  this.filterGroups[item.key].multiple
                ) {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value ? item.value.toString() : ''
                  })
                } else if (
                  this.filterGroups[item.key].category === 'datetimerange'
                ) {
                  // 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
                  if (item.value)
                    query.push(
                      {
                        column: 'dutyTimeBegin',
                        type: 'ge',
                        value: item.value[0]
                      },
                      {
                        column: 'dutyTimeEnd',
                        type: 'le',
                        value: item.value[1]
                      }
                    )
                } else {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value
                  })
                }
              } else {
                Object.assign(tempItem, {
                  column: item.key,
                  type: this.filterGroups[item.key].searchType || 'eq',
                  value: this.filterGroups[item.key].queryValue
                })
              }
              query.push(tempItem)
            }
          })
        }

        Object.assign(this.tableQuery, {
          query: query.filter((item) => {
            return item.value
          }),
          currPage: 1
        })
        // console.log('serach:', this.tableQuery)
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
    // 删除订单
    handleDelete(row) {
      this.$confirm(`是否删除此值班数据?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          dutyDelete({ oid: row.oid }).then((res) => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 1000,
              onClose: () => {
                let totalPage = Math.ceil(
                  (this.tableConfig.pagination.total - 1) /
                    this.tableQuery.pageSize
                )
                let currPage =
                  this.tableQuery.currPage > totalPage
                    ? totalPage
                    : this.tableQuery.currPage
                this.tableQuery.currPage = currPage < 1 ? 1 : currPage
                this.getList()
              }
            })
          })
        })
        .catch((err) => {
          console.log('err')
        })
    },
    // 按订单状态筛选
    handleSearchByOrderStatus() {
      this.tableQuery.currPage = 1
      this.getList()
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
.duty-container .filter-flex {
  width: 360px;
  .filter-search .item.width120 {
    min-width: 90px;
  }
}
</style>
