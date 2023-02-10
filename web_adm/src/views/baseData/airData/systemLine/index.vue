<template>
<div>
  <div class="finance-page"
    v-loading="loading"
  >
      <div>
        <FinanceSearch :searchOption="searchOption1" @search="search" />
        <div class="finance-search-list-gap"></div>
        <div class="finance-list-container">
          <div class="money-box">
            <div class="money-box-right">
              <el-button-group>
                <el-button class="finance-btn" @click="sysLineSaveShow()" size="mini">新增航线信息</el-button>
              </el-button-group>
            </div>
          </div>
          <FinanceTable ref="tablex01" :option="option1" />
        </div>
      </div>
    </div>
    <SysLineSave v-if="sysLineSaveVisable" ref="sysLineSave" @refreshDataList="search"/>
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
          managerId: { 
            label: '航线经理',
            type: 'remoteSelect',
            clearable: true,
            showType: '3',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList({name:queryString,roleCodes:'pricing'}, item),
            visibleChange: (queryString, item) => this.getEmployeeList({name:queryString,roleCodes:'pricing'}, item),
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
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'sysUserList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns:[],
      pagination,
    })
    let columns = [
      {
        prop: 'sysLineCode',
        label: '航线代码',
        type: 'text',
        width: 100
      },
      {
        prop: 'cname',
        label: '航线中文名称',
        type: 'text',
        width: 100
      },
      {
        prop: 'managerName',
        label: '航线经理',
        type: 'text',
        width: 100
      },
      {
        prop: 'ename',
        label: '航线英文名称',
        type: 'text',
        width: 100
      },
      { label: '航线类型', prop: 'lineType', type: 'select', propInDict: 'lineType' },
      {
        prop: 'remark',
        label: '航线说明',
        type: 'text',
        width: 100
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
        prop: 'operation',
        label: '操作',
        type: 'button',
        width: 150,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.sysLineSaveShow(row)
          },
        },
        formatter: (val) => {
          return "查看"
        },
      },
    ]
    this.option1.columns = columns
  },
  methods: {
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
  }
}
</script>
<style>
</style>