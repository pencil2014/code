<template>
  <div class="finance-page finance-summay-cnt staff-duty">
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="summary-bill-cnt finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button class="finance-btn" size="mini" type="primary" @click="handleAdd"
            >新增</el-button>
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
      <el-dialog
        :title="form.oid ? '修改' : '新增'"
        :visible.sync="addDialogVisible"
        :close-on-click-modal="false"
        width="400px">
        <el-form :model="form" ref="formData" :inline="true" label-width="100px"  >
          <el-form-item label="员工姓名" prop="employeeName" :rules="{ required: true,  message: ' ',  trigger: 'blur'}">
            <el-select
              style="width:225px"
              v-model="form.employeeName"
              placeholder="请选择员工姓名"
              filterable
              remote
              :remote-method=" (queryString) => employeeNameList(queryString) "
              @visible-change=" (value) => value && employeeNameList() "
              @change=" (value) => employeeNameListChange(value) "
            >
              <el-option
                v-for="(item, index) in employeeNameListOptions"
                :key="'employeeNameListOptions' + index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="代班员工姓名" prop="dutyEmployeeName" :rules="{ required: true,  message: ' ',  trigger: 'blur'}">
            <el-select
              style="width:225px"
              v-model="form.dutyEmployeeName"
              placeholder="请选择代班员工姓名"
              filterable
              remote
              :remote-method=" (queryString) => dutyEmployeeNameList(queryString) "
              @visible-change=" (value) => value && dutyEmployeeNameList() "
              @change=" (value) => dutyEmployeeNameListChange(value) "
            >
              <el-option
                v-for="(item, index) in dutyEmployeeNameListOptions"
                :key="'dutyEmployeeNameListOptions' + index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="代班类型" prop="type" :rules="{ required: true,  message: ' ',  trigger: 'blur'}">
            <el-select v-model="form.type" style="width:225px" placeholder="请选择是否启用">
              <el-option
                v-for="(item, index) in dictMap['employeeReplaceDutyType']"
                :key="'orgType' + index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.type === 'temp'" label="代班时间" prop="beginEndDete" :rules="{ required: true,  message: ' ',  trigger: 'blur'}">
              <el-date-picker
                v-model="form.beginEndDete"
                size="mini"
                type="daterange"
                style="width:225px"
                :value-format="'yyyy-MM-dd'"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :clearable="false"
              ></el-date-picker>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" :loading='form.loading' @click="sureSubmit" size="mini">确定</el-button>
          <el-button @click="handleCancel" size="mini">取消</el-button>
        </span>
      </el-dialog>
    
  </div>
</template>

<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import {employeeSelectlist} from '@/api/companyResource'
import { dutyListPage, replaceDutySave, baseSystemLineList,dictGroupShipLine,listByRole, replaceDutyDelete } from '@/api/base'
import { dateFormat } from '@/views/finance/utils/finance'
import Vue from 'vue'
export default {
  name:'StaffDuty',
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
          oid:'',
          employeeId:'',
          employeeName:'',
          dutyEmployeeId:'',
          dutyEmployeeName:'',
          type:'temp',
          beginDate:'',
          endDate:'',
          beginEndDete:[],
          loading:false
        },
        baseSystemLineListLineQuery:[],
        employeeNameListOptions:[],
        dutyEmployeeNameListOptions:[],
        listSysLineManagerListOptions:[],
        addDialogVisible: false,
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
                prop: 'employeeName',
                label: '员工姓名',
                type: 'text',
            },
            {
                prop: 'dutyEmployeeName',
                label: '代班人姓名',
                type: 'text',
            },
            {
                prop: 'type',
                label: '类型',
                type: 'select',
                propInDict:'employeeReplaceDutyType'
            },
            {
                prop: 'beginDate',
                label: '代班开始时间',
                type: 'text'
            },
            {
                prop: 'endDate',
                label: '代班结束时间',
                type: 'text'
            },
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
    this.searchOption = {
      saveDefault: true,
      saveShow: true,
      saveName: 'StaffDuty',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 2,
        searchInputGroup: [
          {
            key: 'employeeId',
            value: '',
            showType: '1'
          },
          {
            key: 'dutyEmployeeId',
            value: '',
            showType: '2'
          },
        ],
        filterGroups: {
            employeeId: {
                label: '员工姓名',
                type: 'remoteSelect',
                remoteMethod: (val, item) => {
                    this.getEmployeeList(val, item)
                },
                visibleChange: (val, item) => {
                    this.getEmployeeList(val, item)
                },
                remoteSelectList: [],
            },
            dutyEmployeeId: {
                label: '代班人姓名',
                type: 'remoteSelect',
                remoteMethod: (val, item) => {
                    this.getEmployeeList(val, item)
                },
                visibleChange: (val, item) => {
                    this.getEmployeeList(val, item)
                },
                remoteSelectList: [],
            },
        }
      }
    }
    const pagination = Object.assign({}, this.option.pagination, {
      show: true
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
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
        show: false,
        handleCustomColumns: ()=> this.handleCustomColumns()
      },
      id: 'option1', $name: 'StaffDutyList',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: false,
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
      dutyListPage(data)
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
    // 表格选择
    sendMulti(data) {
      this.multipleSelection = data
    },
    handleAdd(){
      if (this.$refs.formData) this.$refs.formData.resetFields()
        this.addDialogVisible = true;
        let form = {
          oid:'',
          employeeId:'',
          employeeName:'',
          dutyEmployeeId:'',
          dutyEmployeeName:'',
          type:'temp',
          beginDate:'',
          endDate:'',
          beginEndDete: []
        }
        Object.assign(this.form,form)
    },
    // 自定义表头
    handleCustomColumns () {
        this.customColumnsPopShow = true
    },
    // 员工下拉
    getEmployeeList(queryString,item){
      employeeSelectlist({'name':queryString}).then(res=>{
          console.log(res.data);
          item.remoteSelectList = res.data.map(item => {
            return {
                    label: `${item.cname}`,
                    value: item.employeeId
                }
            })
      })
    },
    handleCancel(){
      // this.$refs.formData.resetFields()
      this.addDialogVisible = false
    },
    employeeNameList(queryString='') {
      let data = {
        currPage: 1,
        pageSize: 100,
        query: [
          {column: "employeeStatus", type: "eq", value: "all"},
          {column: 'name', type: 'eq', value: queryString}
        ]
      }
        listByRole(data).then(res=>{
          this.employeeNameListOptions = res.data.list.map(item => {
            return {
                    label: `${item.cname}(${item.deptCname})`,
                    value: item.employeeId
                }
            })
        })
    },
    dutyEmployeeNameList(queryString) {
        employeeSelectlist({'name':queryString}).then(res=>{
          this.dutyEmployeeNameListOptions = res.data.map(item => {
            return {
                label: `${item.cname}(${item.deptCname})`,
                value: item.employeeId
              }
            })
        })
    },
    employeeNameListChange(val){
        let employeeName = this.employeeNameListOptions.filter(item => item.value === val)
        if(employeeName.length){
            this.form.employeeName = employeeName[0].label
            this.form.employeeId = employeeName[0].value
        }
    },
    dutyEmployeeNameListChange(val){
        let dutyEmployeeName = this.dutyEmployeeNameListOptions.filter(item => item.value === val)
        if(dutyEmployeeName.length){
            this.form.dutyEmployeeName = dutyEmployeeName[0].label
            this.form.dutyEmployeeId = dutyEmployeeName[0].value
        }
    },
    //修改
    handleEdit(row){
      this.addDialogVisible = true;
      if (this.$refs.formData) this.$refs.formData.resetFields()
      Object.assign(this.form,row)
      if(row.beginDate && row.endDate) this.form.beginEndDete = [ row.beginDate,row.endDate] 
      
      // this.employeeNameList(this.form.employeeName)
      // this.dutyEmployeeNameList(this.form.dutyEmployeeName)
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
        oid: row.oid,
      }
      this.$confirm('是否确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        replaceDutyDelete(data).then(() => {
          this.$message({
            message: '删除成功！',
            type: 'success',
            showClose: true,
          })
          if (this.option1.data && this.option1.data.length === 1 && this.option1.pagination.currPage !== 1) {
             this.option1.pagination.currPage -= 1
          }
          this.getData()
        })
      })
    },

    sureSubmit(){
      let { oid, employeeId, employeeName, dutyEmployeeId, dutyEmployeeName, type, beginDate, endDate, beginEndDete} = this.form
  
      let data = {
        oid,
        employeeId,
        employeeName,
        dutyEmployeeId,
        dutyEmployeeName,
        type,
        beginDate:beginEndDete[0],
        endDate:beginEndDete[1],
        beginEndDete,
      }
      if(type !== 'temp'){
        data.beginDate = undefined
        data.endDate = undefined
      }
      console.log(data);
      this.$refs.formData.validate(valid => {
        if (valid) {
          if(employeeId === dutyEmployeeId){
            return  this.$msgErrClose('员工不可和代班人相同！')
          }
          replaceDutySave(data).then(res=>{
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
<style scoped lang="scss">
 .staff-duty {
   .el-date-editor{
     /deep/.el-range-separator{
      line-height: 18px !important;
    }
   }
 }
 
</style>