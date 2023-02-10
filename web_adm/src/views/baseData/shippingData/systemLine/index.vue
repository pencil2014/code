<template>
<div>
  <div class="finance-page" style="margin-top:0"
    v-loading="loading"
  >
      <div>
        <FinanceSearch :searchOption="searchOption1" @search="search" @cancel="search" />
        <div class="finance-search-list-gap"></div>
        <div class="finance-list-container">
          <div class="money-box">
            <div class="money-box-right">
              <el-button-group>
                <el-button class="finance-btn" @click="sysLineSaveShow()" size="mini" type="primary">新增小航线</el-button>
              </el-button-group>
            </div>
          </div>
          <FinanceTable ref="tablex01" :option="option1" />
        </div>
      </div>
       <SysLineSave v-if="sysLineSaveVisable" ref="sysLineSave" @refreshDataList="search"/>
    </div>
    <Log v-if="logOption.show" :logOption='logOption' />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { systemLineList } from "@/api/baseData";
import { dateFormat } from '@/views/finance/utils/finance'
import SysLineSave from './sysLineSave'
import { mapGetters } from 'vuex'
import { sysLinePermissionGroupList } from '@/api/permission'
import Log from '@/views/baseData/components/log.vue'
export default {
  mixins: [mixin, mixin2, routerMixin],
   computed: {
    ...mapGetters([
      'userId','dictMap'
    ])
  },
  data() {
    return {
      sysLineSaveVisable:false,
      option1: {},
      searchOption1: {},
      table1DataBackup: [],
      loading: false,
      // 日志
      logOption: {
        show: false,
        title:'航线变更日志',
        code: '',
        tableName: 'BaseSystemLine',
        columns: []
      }
    }
  },
  created() {
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: [
          { key: 'name', value: '', showType: '1' },
          { key: 'state', value: '', showType: '2' },
          { key: 'lineType', value: '', showType: '3' },
        ],
        filterGroups: {
          name: { label: '航线名称', type: 'input', showType: '1' },
          sysLineCode: { label: '航线代码', type: 'input', showType: '1' },
          managerId: { 
            label: '航线经理',
            type: 'remoteSelect',
            clearable: true,
            showType: '3',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList({name:queryString,roleCodes:'pricing'}, item),
            visibleChange: (queryString, item) => this.getEmployeeList({name:queryString,roleCodes:'pricing'}, item),
           },
           sysLineGroupCode: { 
            label: '所属大航线',
            type: 'remoteSelect',
            clearable: true,
            showType: '3',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.majorRouteRemoteMethod(queryString, item),
            visibleChange: (queryString, item) => this.majorRouteRemoteMethod(queryString, item),
           },
          state: { label: '是否启用', type: 'select', showType: '2',
            selectOptions: [
              { label: '是', value: 'valid' },
              { label: '否', value: 'invalid' }
            ]
          },
          lineType : { showType: '3', prop: 'lineType', label: '航线类型', type: 'select' }
        }
      }
    }
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
    })
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: 100,
      fixed: 'right',
			show: true,
      data: [
        {
          label: '查看',
          type: 'text',
          show: true,
          action: 'Info'
        },
        {
          label: '日志',
          type: 'text',
          show: true,
          action: 'Log'
        },
      ],
      callback: (action, $index, row, item) => {
        if (action === 'Info') {
          this.sysLineSaveShow(row)
        }
        if (action === 'Log') {
          this.handleLog(row)
        }
      },
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'sysUserList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
    })
    let columns = [
      {
        prop: 'sysLineCode',
        label: '航线代码',
        type: 'text',
      },
      {
        prop: 'cname',
        label: '航线中文名称',
        type: 'text',
      },
      {
        prop: 'ename',
        label: '航线英文名称',
        type: 'text',
      },
      {
        prop: 'managerName',
        label: '航线经理',
        type: 'text',
      },
      { label: '航线类型', prop: 'lineType', type: 'select', propInDict: 'lineType' },
      { label: '所属大航线', prop: 'sysLineGroupName', width: 120, type: 'text' },
      {
        prop: 'remark',
        label: '航线说明',
        type: 'text',
      },
      {
        prop: 'state',
        label: '是否启用',
        type: 'text',
        formatter: ({cellValue}) => {
          if (cellValue === 'valid') {
            return '是'
          } else if (cellValue === 'invalid') {
            return '否'
          }
        }
       },
       {
          prop: 'updatedName',
          label: '更新人',
          type: 'text',
        },
        {
          prop: 'updatedTime',
          label: '更新时间',
          type: 'text',
          formatter: ({ cellValue }) => cellValue.replace('T', ' '),
        },
      // {
      //   prop: 'operation',
      //   label: '操作',
      //   type: 'button',
      //   width: 150,
      //   operationBtns: {
      //     show: true,
      //     callback: (fn, index, row, option) => {
      //       this.sysLineSaveShow(row)
      //     },
      //   },
      //   formatter: (val) => {
      //     return "查看"
      //   },
      // },
    ]
    this.option1.columns = columns
  },
  methods: {
    handleLog (row) {
      let { sysLineCode: code } = row
      this.logOption.columns = this.option1.columns
      this.logOption.code = code
      this.logOption.show = true
    },
    majorRouteRemoteMethod(val, item) {
      let params = {
        columns: [],
        currPage: 1,
        pageSize: 50,
        query: [
          {
            column: 'name',
            type: 'like',
            value: val || ''
          },
          {
            column: 'state',
            type: 'eq',
            value: 'valid'
          }
        ]
      }

      sysLinePermissionGroupList(params).then((res) => {
        let list = res.data.map((item) => ({ label: `${item.sysLineGroupCname}`, value: item.sysLineGroupCode }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList.splice(0, 1000, ...list)
      })
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData(isSearch) {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value, columnReq } = item
        if (columnReq && item[columnReq]) {
          data.query.push({
            column: columnReq,
            type: 'eq',
            value: item[columnReq]
          })
        } else if (value && value !== '') {
          if (key === 'createdDate') {
            data.query.push({
              column: 'beginDate',
              type: 'eq',
              value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
            })
            data.query.push({
              column: 'endDate',
              type: 'eq',
              value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
            })
          } else {
            data.query.push({
              column: key,
              type: 'eq',
              value: value
            })
          }
        }
      })
      if(isSearch){
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      this.loading = true
      systemLineList(data).then((res) => {
        if (res.code === 0) {
          let { list } = res.data
          let data = []
          list.forEach((item) => {
            data.push(item)
          })
          this.option1.data = data
          this.table1DataBackup = [...this.option1.data]
          this.option1.pagination.currPage = res.data.currPage
          this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount
        }
      }).finally(() => {
        this.loading = false
      })
    },
   
      //角色配置
    sysLineSaveShow(row){
      this.sysLineSaveVisable = true;
      this.$nextTick(() => {
        this.$refs.sysLineSave.init(row);
      });
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
   
  },
  components: {
    FinanceTable,
    FinanceSearch,
    SysLineSave,
    Log
  }
}
</script>
<style>
</style>