<template>
<div>
  <div class="finance-page base-data"
    v-loading="loading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground"
  >
    <div>
      <FinanceSearch :searchOption="searchOption1" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-right">
             <el-button-group>
              <el-button class="finance-btn" @click="roleSaveShow()" size="mini" type="primary">新增</el-button>
            </el-button-group>
            <el-button-group>
              <el-button  class="finance-btn" @click="roleActived('valid')" size="mini" type="success">启用</el-button>
            </el-button-group>
            <el-button-group>
              <el-button class="finance-btn" @click="roleActived('invalid')" size="mini" type="danger">失效</el-button>
            </el-button-group>
          </div>
        </div>
        <FinanceTableMass ref="tablex01" :option="option1" @send-multi="sendMulti" />
      </div>
    </div>
  </div>
  <RoleSave v-if="roleSaveVisable" ref="roleSave" @refreshDataList="search"/>
  <EmployeeSave v-if="employeeSaveVisable" ref="employeeSave" @refreshDataList="search"/>
  <PrivilegeSave v-if="privilegeSaveVisable" ref="privilegeSave" @refreshDataList="search"/>
</div>
  
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import {sysUserList,sysUserActived,sysUserSave,employeeSelectlist,sysUserRoleInfo} from '@/api/companyResource'
import {roleList,roleActived,roleSave} from '@/api/permission'
import { dateFormat } from '@/views/finance/utils/finance'
import RoleSave from './roleSave'
import EmployeeSave from './employeeSave'
import PrivilegeSave from './privilegeSave'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      roleSaveVisable:false,
      employeeSaveVisable:false,
      privilegeSaveVisable:false,
      option1: {},
      searchOption1: {},
      table1DataBackup: [],
      multipleSelection1: [],
      multipleSelection2: [],
      orderBillId: '',
      source: 'createSettlement',
      loading: false,
    }
  },
  created() {
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: [
          { key: 'roleName', value: '', showType: '1' },
          { key: 'state', value: '', showType: '2' },
          { key: 'hasJobDefine', value: '', showType: '3' },
        ],
        filterGroups: {
          roleName: { label: '角色名称', type: 'input', showType: '1' },
          state: { label: '是否有效', type: 'select', showType: '2',
           selectOptions: [
              { label: '是', value: 'valid' },
              { label: '否', value: 'invalid' }
            ]
          },
          hasJobDefine: { label: '是否为岗位', type: 'select', showType: '6',
            selectOptions: [
              { label: '是', value: 'yes' },
              { label: '否', value: 'no' }
            ]
          }
        }
      }
    }
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'roleList',
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
        prop: 'roleName',
        label: '角色名称',
        type: 'button',
        width: 130,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.roleSaveShow(row)
          },
        },
      },
      {
        prop: 'roleCode',
        label: '角色编码',
        type: 'text',
        width: 100
      },
      {
        prop: 'decription',
        label: '描述',
        type: 'text',
        width: 200
      },
      {
        prop: 'hasJobDefine',
        label: '是否为岗位',
        type: 'text',
        width: 80,
        formatter: ({cellValue}) => {
          if (cellValue === 'yes') {
            return '是'
          } else if (cellValue === 'no') {
            return '否'
          }
         }
       },
      {
        prop: 'state',
        label: '是否有效',
        type: 'text',
        width: 80,
        specialCellClassName:"base-data-enable-class",
        formatter: ({cellValue}) => {
          if (cellValue === 'valid') {
            return '是'
          } else if (cellValue === 'invalid') {
            return '否'
          }
         }
       },
      {
        prop: 'permission',
        label: '权限',
        type: 'button',
        width: 130,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.privilegeSaveShow(row)
          },
        },
        formatter: ({cellValue}) => {
          return "查看"
        },
      },
      {
        prop: 'employees',
        label: '员工',
        type: 'button',
        width: 130,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.employeeSaveShow(row)
          },
        },
        formatter: ({cellValue}) => {
          return "查看"
        },
      },
       {
        prop: 'createdName',
        label: '创建人',
        type: 'text',
        width: 100,
      },
      {
        prop: 'createdTime',
        label: '创建时间',
        type: 'text',
        width: 150,
      },
        {
        prop: 'updatedName',
        label: '修改人',
        type: 'text',
        width: 100,
      },
        {
        prop: 'updatedTime',
        label: '修改时间',
        type: 'text',
        width: 150,
      },
    ]
    this.option1.columns = columns
  },
  methods: {
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString).then((data) => {
        cb(data)
      })
    },
    queryJobList(queryString, cb) {
      this.$store.dispatch('dict/queryJobList', queryString).then((data) => {
        cb(data)
      })
    },
    queryRoleList(queryString,cb) {
      this.$store.dispatch('dict/queryRoleList', queryString).then((data) => {
        cb(data)
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
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
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
      roleList(data).then((res) => {
        if (res.code === 0) {
          let { list } = res.data
          let data = []
          list.forEach((item) => {
            if(item.state==='invalid'){
                item.hasSpecialCellClassName = true
            }
            // if (item.money && item.money.receive) {
            //   let keys1 = Object.keys(item.money.receive)
            //   let receive = keys1.reduce((str, cur, index) => {
            //     if (index === 0) {
            //       return str + cur + item.money.receive[cur]
            //     } else {
            //       return str + ' ' + cur + item.money.receive[cur] // &nbsp;&nbsp;
            //     }
            //   }, '')
            //   item.receive = receive
            // }
            // if (item.money && item.money.pay) {
            //   let keys2 = Object.keys(item.money.pay)
            //   let pay = keys2.reduce((str, cur, index) => {
            //     if (index === 0) {
            //       return str + cur + item.money.pay[cur]
            //     } else {
            //       return str + ' ' + cur + item.money.pay[cur] // &nbsp;&nbsp;
            //     }
            //   }, '')
            //   item.pay = pay
            // }
            // item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
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
    roleActived(state) {
      let operation=(state==='valid'?"启用":"失效")
      if (this.multipleSelection1.length !== 1) {
          this.$message({
            message: '请选择一个角色进行'+operation,
            type: 'error',
            showClose: true,
          })
          return
      }
      if (this.multipleSelection1[0].state===state){
         this.$message({
            message:operation+'的角色不能进行'+operation+'操作',
            type: 'error',
            showClose: true,
          })
          return
      }
      this.$confirm('是否'+operation+'该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						sysRoleId:this.multipleSelection1[0].sysRoleId,
						state: state,
					}
					return roleActived(data)
				})
				.then(response => {
					this.$message({
						message: operation+'成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
						
							this.search()
						}
					})
				})
				.catch(() => {
					this.search()
				})
    },
    // showDetail(row) {
    //   this.routerPush('BillDetail', { source: 'billListPage', billId: row.orderBillId })
    // },
    //岗位配置
    roleSaveShow(row){
      this.roleSaveVisable = true;
      this.$nextTick(() => {
        this.$refs.roleSave.init(row);
      });
    },
  
    //菜单权限配置
    employeeSaveShow(row){
      this.employeeSaveVisable = true;
      this.$nextTick(() => {
        this.$refs.employeeSave.init(row);
      });
    },
    //全局权限配置
    privilegeSaveShow(row){
      this.privilegeSaveVisable = true;
      this.$nextTick(() => {
        this.$refs.privilegeSave.init(row);
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
    sendMulti(data, option) {
      console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    RoleSave,
    EmployeeSave,
    PrivilegeSave
  }
}
</script>
<style lang="scss" >
.base-data-enable-class{
  color:red !important;
}

</style>