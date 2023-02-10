<template>
  <div class="finance-page finance-summay-cnt">
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="summary-bill-cnt finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button class="finance-btn" size="mini" type="primary" @click="handleAdd"
            >新增</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="danger" class="finance-btn" @click="handledel" size="mini">删除</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button
            class="finance-btn"
            @click="refreshListPage"
            size="mini"
            type="primary"
          >刷新</el-button>
        </div>
      </div>
      <FinanceTable :option="option1" :autoMax="true" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
    <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{ key: 'prop', label: 'label' }"
        @close="customColumnsPopClose"
      />
    </div>
    <div v-if="addDialogVisible">
      <el-dialog
        :title="form.systemLineManagerId ? '修改' : '新增'"
        :visible.sync="addDialogVisible"
        :close-on-click-modal="false"
        width="600px">
        <el-form :model="form" ref="form" :inline="true" label-width="100px"  >
          <el-form-item label="组织名称" prop="orgCode" :rules="{ required: true,  message: ' ',  trigger: 'blur'}">
            <el-cascader
              filterable
              size="mini"
              :options="orgList"
              v-model="form.orgCode"
              @change="handleOrgCodeChange"
              :props="cascaderProps"
              placeholder="请选择组织名称"
              change-on-select
              expandTrigger="click"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="大航线" prop="sysLineGroupCode" :rules="{ required: true,  message: ' ',  trigger: 'blur'}">
            <el-select
              v-model="form.sysLineGroupCode"
              placeholder="请选择大航线"
              filterable
              remote
              :remote-method=" (queryString) => sysLineGroupList(queryString) "
              @visible-change=" (value) => value && sysLineGroupList() "
              @change=" (value) => sysLineGroupListChange(value) "
            >
              <el-option
                v-for="(item, index) in sysLineGroupListOptions"
                :key="'sysLineGroupListOptions' + index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="小航线" prop="" v-if="orgObj.type === 'company'">
            <el-select
              v-model="form.sysLineCode"
              placeholder="请选择小航线"
              filterable
              remote
              :remote-method=" (queryString) => baseSystemLineListSearch(queryString) "
              @visible-change=" (value) => value && baseSystemLineListSearch() "
            >
              <el-option
                v-for="(item, index) in baseSystemLineListLineQuery"
                :key="'sysLineGroupListOptions' + index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="组织类型" prop="orgType" :rules="{ required: true,  message: ' ',  trigger: 'blur'}">
            <el-select v-model="form.orgType"  placeholder="请选择组织类别">
              <el-option
                v-for="(item, index) in dictMap['approveOrgType']"
                :key="'orgType' + index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item> -->
          
          <el-form-item label="航线经理" prop="managerId" :rules="{ required: true,  message: ' ',  trigger: 'blur'}">
            <el-select
              v-model="form.managerId"
              placeholder="请选择航线经理"
              filterable
              remote
              :noRemote="true"
              :remote-method=" (queryString) => sysLineManagerList(queryString) "
              @visible-change=" (value) => value && sysLineManagerList() "
              @change=" (value) => sysLineManagerListSelectChange(value) "
            >
              <el-option
                v-for="(item, index) in listSysLineManagerListOptions"
                :key="'listSysLineManagerListOptions' + index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="是否启用" prop="state" :rules="{ required: true,  message: ' ',  trigger: 'blur'}">
            <el-select v-model="form.state"  placeholder="请选择是否启用">
              <el-option
                v-for="(item, index) in dictMap['orgTypeYesNo']"
                :key="'orgType' + index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item> -->
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" :loading='form.loading' @click="sysLineGroupSubmit" size="mini">确定</el-button>
          <el-button @click="handleCancel" size="mini">取消</el-button>
        </span>
      </el-dialog>
    </div>
    
  </div>
</template>

<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import {approvalOrgList} from '@/api/order/contract'
import { listPricingPage, getPricingListAmtSummary, listSysLineManagerSelect } from '@/api/fin/shBill'
import { lienGroupManager, systemLineManagerSave, baseSystemLineList,dictGroupShipLine,listByRole, deleteSysLineManager } from '@/api/base'
import { dateFormat } from '@/views/finance/utils/finance'
import Vue from 'vue'
var orgList = []
export default {
  name:'lienGroupManager',
  components: {
    FinanceSearch,
    FinanceTable,
    CustomColumns
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
        orgObj:{},
        form:{
          systemLineManagerId:'',
          sysLineGroupCode:'',
          sysLineGroupName:'',
          sysLineName:'',
          sysLineCode:'',
          orgType:'',
          orgCode:'',
          orgName:'',
          managerId:'',
          managerName:'',
          state:'',
        },
        cascaderProps: {
          children: 'childList',
          label: 'orgName',
          value: 'orgCode',
        },
        baseSystemLineListLineQuery:[],
        sysLineGroupListOptions:[],
        listSysLineManagerListOptions:[],
        addDialogVisible: false,
        orgList,
        loading: false,
        searchOption: {},
        option1: {},
        multipleSelection: [],
      // 升序
        ascColumns: [],
        // 降序
        descColumns: [],
        // 初始表头
        selfColumnsBase:[
            {
                prop: 'orgName',
                label: '组织名称',
                type: 'text',
                width: 130
            },
            {
                prop: 'sysLineGroupName',
                label: '大航线',
                type: 'text',
                width: 150
            },
            {
                prop: 'sysLineName',
                label: '小航线',
                type: 'text',
                width: 150
            },
            {
                prop: 'orgType',
                label: '组织类型',
                type: 'select',
                propInDict:'approveOrgType'
            },
            {
                prop: 'managerName',
                label: '航线经理',
                type: 'text'
            },
            // {
            //     prop: 'state',
            //     label: '是否启用',
            //     type: 'select',
            //     propInDict:'orgTypeYesNo'
            // },
            {
                prop: 'createdName',
                label: '创建人',
                type: 'text'
            },
            {
                prop: 'createdTime',
                label: '创建时间',
                type: 'text'
            },
        ]
    }   
  },
  created() {
    approvalOrgList({oid: ''}).then((res) => {
      this.orgList.splice(0, 1000, ...this.getTreeData(res.data || []))
    })
    console.log(this.orgList);
    this.searchOption = {
      saveDefault: true,
      saveShow: true,
      saveName: 'lienGroupManager',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: [
          {
            key: 'sysLineGroupCode',
            value: '',
            showType: '1'
          },
          {
            key: 'orgType',
            value: '',
            showType: '2'
          },
        ],
        filterGroups: {
          sysLineGroupCode: {
						label: '大航线',
						type: 'remoteSelect',
						remoteMethod: (val, item) => {
							this.sysLineQuerySearch(val, item)
						},
						visibleChange: (val, item) => {
							this.sysLineQuerySearch(val, item)
						},
						remoteSelectList: [],
					},
          orgType: {  label: '组织类型',  type: 'select',prop:"approveOrgType",  },
          orgCode: { label: '组织名称',  prop: 'deptCode',
            type: 'cascader',
            cascaderList: this.orgList,
            cascaderProps: {
              children: 'childList',
              label: 'orgName',
              value: 'orgCode',
              checkStrictly: true,
            },
          },
          // state: {  label: '是否启用',  type: 'select',prop:"orgTypeYesNo",  },
        }
      }
    }
    const pagination = Object.assign({}, this.option.pagination, {
      show: true
    })
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width:100,
      data: [
        {
          label: '修改',
          type: 'text',
          show: true,
          action: 'Edit'
        },
        {
          label: '删除',
          type: 'text',
          show: true,
          action: 'Detete',
           style:'color: #CD4130;'
        },
      ]
    })
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: ()=> this.handleCustomColumns()
      },
      id: 'option1', $name: 'lienGroupManagerList',
      data: [],
      tips: {
        text: '',
        show: false
      },
      sortable: true,
      operationBtns,
      sortChange: (column, prop, order) => {
				this.descColumns = order == 'descending' ? [prop] : []
				this.ascColumns = order == 'ascending' ? [prop] : []
				this.getData()
			},
      pagination,
      maxHeight: this.getFinanceTableMaxHeight,
    })
    const columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    let sortableList = []
    this.selfColumnsBase.forEach(item => (sortableList.includes(  item.prop ) ? item.sortable = true : item.sortable = false))
    this.option1.columns = columns
    // this.getData()
  },
  methods: {
    // 搜索
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 获取数据
    getData(isSearch) {
      this.option1.loading = true
      const data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        "ascColumns": this.ascColumns,
        "descColumns": this.descColumns,
        columns: [],
        query: []
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.searchOption.addFilter.searchInputGroup.forEach(item => {
        const { key, value, range, req, valueReq } = item
        if (range && (range.min || range.max)) {
          if (range.min) {
            data.query.push({
              column: key + 'Min',
              type: 'eq',
              value: range.min
            })
          }
          if (range.max) {
            data.query.push({
              column: key + 'Max',
              type: 'eq',
              value: range.max
            })
          }
          return
        }
        if (valueReq && item[valueReq]) {
          data.query.push({
            column: valueReq,
            type: 'eq',
            value: item[valueReq]
          })
          return
        }
        if (value) {
          if (value instanceof Array) {
            if (key === 'createdTime' || key === 'updatedTime') {
              data.query.push({
                column: key + 'Start',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
              })
              data.query.push({
                column: key + 'End',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
              })
            }
            if (key === 'yearMon') {
              data.query.push({
                column: key + 'Start',
                type: 'eq',
                value: value[0]
              })
              data.query.push({
                column: key + 'End',
                type: 'eq',
                value: value[1]
              })
            }
            if(key === 'sysLineCode'){
              if (!value.length) return
              data.query.push({
                column: key,
                type: 'eq',
                value: value.join(','),
              })
            }
            if(key === 'orgCode'){
              if(!value.length) return
              data.query.push({
                column:  key,
                type: 'eq',
                value: value[value.length-1],
              })
            }
          } else {
            data.query.push({
              column: key,
              value: value,
              type: 'eq'
            })
          }
        }
      })

      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      lienGroupManager(data)
        .then(res => {
          if (res.data.configColumns && res.data.configColumns.length) {
            let columns = res.data.configColumns
            this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
            this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            this.configColumns = res.data.configColumns
          }
          const datasource = res.data
          this.option1.data = datasource.list
          this.option1.pagination.currPage = datasource.currPage
          this.option1.pagination.pageSize = datasource.pageSize
          this.option1.pagination.totalCount = datasource.totalCount
          this.option1.loading = false
        })
        .catch(() => {})
    },
    // 分页方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 跳转月度详情页
    showSummaryDetail(row) {
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      const query = {
        shLienMonNo: row.shLienMonNo
      }
      this.routerPush('SummaryBillDetail', query)
    },
    // 表格选择
    sendMulti(data) {
      this.multipleSelection = data
    },
    handleAdd(){
        this.addDialogVisible = true;
        let form = {
          systemLineManagerId:'',
          sysLineGroupCode:'',
          sysLineGroupName:'',
          sysLineCode:'',
          sysLineName:'',
          orgType:'',
          orgCode:'',
          orgName:'',
          managerId:'',
          managerName:'',
          state:'',
        }
        Object.assign(this.form,form)
        this.orgObj = {}
    },
    // 自定义表头
    handleCustomColumns () {
        this.customColumnsPopShow = true
    },
    // 系统航线下拉列表自动补充的数据
		sysLineQuerySearch (queryString, item) {
      dictGroupShipLine(queryString, '').then(res => {
				let datasource = res.data.filter(item => item.sysLineGroupCode)
				item.remoteSelectList = datasource.map(item => {
					return {
						label: `${item.sysLineGroupCname}`,
						value: item.sysLineGroupCode
					}
				})
			})
		},
    // 转化children的空数组为undefined
    getTreeData(data) {
      console.log(data);
      data.forEach(
        (item) =>
          (item.childList = item.childList.length
            ? this.getTreeData(item.childList)
            : undefined)
      )
      return data
    },
    handleCancel(){
      this.$refs.form.resetFields()
      this.addDialogVisible = false
    },
    //航线经理下拉
    sysLineManagerList(queryString, item) {
      let query = [
        { column: 'roleCode', type: 'eq', value: 'pricing' },
        { column: 'employeeStatus', type: 'eq', value: 'all' },
      ] // column: 'roleCode', type: 'in', value: 'bd,obd'
      queryString && query.push({ column: 'name', type: 'eq', value: queryString })
      listByRole({ currPage: 1, pageSize: 50, query }).then(({ data: { list } }) => {
        if (
          this.remoteSelectCommon(
            item,
            list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
          )
        )
          return
        this.listSysLineManagerListOptions = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
      })
      // listSysLineManagerSelect({managerName:queryString,orgType:'group'} ).then(res => {
      //   this.listSysLineManagerListOptions = res.data.map(items => {
      //     return {
      //       label: items.managerName,
      //       value: items.managerId
      //     }
      //   })
      // })
    },
    sysLineManagerListSelectChange(val){
      console.log(val);
      console.log(this.listSysLineManagerListOptions);
      let op = this.listSysLineManagerListOptions.filter(item=>item.value == val)
      console.log(op.label);
      this.form.managerName = op[0].label.split('(')[0]
    },
    handleOrgCodeChange(val,ond){
      console.log(val[val.length-1]);
      this.getCheckedNodes(this.orgList,val[val.length-1]);
      console.log(this.orgObj)
    },
     getCheckedNodes(data, value) {
      data.forEach(item => {
        if (value === item.orgCode) {
          this.orgObj = item
        } else {
          if (item.childList && item.childList.length > 0) {
            this.getCheckedNodes(item.childList, value)
          }
        }
      })
    },
    sysLineGroupList(queryString) {
      dictGroupShipLine(queryString, '').then(res => {
				let datasource = res.data.filter(item => item.sysLineGroupCode)
				this.sysLineGroupListOptions = datasource.map(item => {
					return {
						label: `${item.sysLineGroupCname}`,
						value: item.sysLineGroupCode
					}
				})
			})
    },
    sysLineGroupListChange(){},
    //修改
    handleEdit(row){
      this.addDialogVisible = true;
      Object.assign(this.form,row)
      this.sysLineManagerList(this.form.managerName.split('(')[0])
      this.sysLineGroupList(this.form.sysLineGroupName)
      if(this.form.orgCode){
        this.getCheckedNodes(this.orgList,this.form.orgCode);
      }else{
        this.orgObj = {}
      }
    },
    handledel(){
      if (this.multipleSelection.length === 0) {
        return this.$message({
          message: '请勾选维护的项进行删除！',
          type: 'error',
          showClose: true,
        })
      }
      this.handleDetete()
    },
    handleDetete(row){
      let data = {
        systemLineManagerIds: row && row.systemLineManagerId ? [ row.systemLineManagerId ] : this.multipleSelection.map(item=>item.systemLineManagerId),
      }
      this.$confirm('是否确认删除数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        deleteSysLineManager(data).then(() => {
          this.$message({
            message: '删除成功！',
            type: 'success',
            showClose: true,
          })
          this.getData()
        })
      })
    },

    sysLineGroupSubmit(){
      let { systemLineManagerId, sysLineGroupCode, sysLineName, sysLineCode, sysLineGroupName, orgType, orgCode, orgName, managerId, managerName, state } = this.form
      if(this.orgObj.type !== 'company'){
        sysLineName =''
        sysLineCode =''
      }
      
      let data = {
        systemLineManagerId,
        sysLineGroupCode,
        sysLineGroupName,
        sysLineName,
        sysLineCode,
        orgType,
        orgCode:orgCode instanceof Array ? orgCode[orgCode.length-1] : orgCode,
        orgName,
        managerId,
        managerName,
        state,
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          systemLineManagerSave(data).then(res=>{
            this.$message({
              message: '提交成功！',
              type: 'success',
              showClose: true,
            })
            this.addDialogVisible = false;
            this.getData()
          })
        }
      })
    },
    // 系统小航线下拉列表自动补充的数据
    baseSystemLineListSearch(queryString, item) {
      this.$store
        .dispatch('dict/baseSystemLineList', { name: queryString, state: '' })
        .then(data => {
          if (this.remoteSelectCommon(item, data.map(item=>({label:item.value,value:item.key})))) return
          this.baseSystemLineListLineQuery = data.map(item => {
            return {
              label: item.value,
              value: item.key
            }
          })
        })
    },
  },
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    if (!this.$route.meta.isUseCache) {
      this.getData()
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
