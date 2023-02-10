<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="water-mark-box"></div>
    <FinanceSearch :searchOption="searchOption1" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="money-box">
        <div>
          <el-button v-if="isCS" type="primary" @click="addHandle" size="mini">新增</el-button>
          <el-button v-if="isCS" type="primary" @click="handleEdit('multi')" size="mini">解除</el-button>
          <el-button @click="handleExport" size="mini">导出</el-button>
          <!-- <el-button type="primary" @click="importShow=true" size="mini">导入黑名单</el-button>
          <el-button @click="downLoad" size="mini">下载模板</el-button>-->
        </div>
        <el-radio-group v-model="methodStr" size="mini" @change="handleCurrentChange(1)">
          <el-radio-button v-if="!isCS || isCS2" label="customer">客户</el-radio-button>
          <el-radio-button v-if="!isCS || isCS2" label="supplier">供应商</el-radio-button>
        </el-radio-group>
      </div>
      <FinanceTable :option="option1" :autoMax="true" @send-multi="sendMulti" />
    </div>
    <!-- <CrmDialog v-if="addDialog.show" :option="addDialog" @close="closeDialogAdd" /> -->
    <CrmDialog v-if="releaseDialog.show" :option="releaseDialog" @close="closeDialogRelease" />
    <SearchFormDialog ref="addDialog" :option="addDialog" @close="closeDialogAdd" />
    <el-dialog title="导入黑名单" :visible.sync="importShow" class="self-dialog" width="40%">
      <UploadFile v-if="importShow" @getFile="getFile" :acceptTypes="['xls','xlsx']" :limit="1"></UploadFile>
      <span slot="footer">
        <el-button size="mini" type="primary" @click="close(true)">确定</el-button>
        <el-button size="mini" @click="close(false)">取消</el-button>
      </span>
    </el-dialog>
    <CrmDialog v-if="changeDialog.show" :option="changeDialog" @close="closeChangeDialog" />
    <!-- 填写解除原因 -->
    <CrmDialog v-if="releaseReasonDialog.show" :option="releaseReasonDialog" @close="confirmReleaseReason"></CrmDialog>
  </div>
</template>
<script>
// import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CrmDialog from '@/views/crm/components/crmDialog'
import SearchFormDialog from '@/views/crm/components/searchFormDialog'
import UploadFile from '@/views/crm/components/common/uploadFile.vue'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { baseEmployeeList, listByRole } from '@/api/base'
import { blackListTable } from '@/views/crm/data'
import CUSTOMER from '@/api/crm/customer'
import SUPPLIER from '@/api/crm/supplier'
import BLACK from '@/api/crm/blackList'
import watermark from '@/utils/watermark'
const NLIST = []

export default {
  name: 'bdRemoveLog',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CrmDialog,
    UploadFile,
    SearchFormDialog,
  },
  data() {
    return {
      defaultRules: { required: true, message: ' ', trigger: ['blur', 'change'] },
      methodStr: 'customer',
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      multipleSelection1: [],
      addDialog2: {
        title: '新增黑名单',
        show: false,
        showClear: true,
        form: { name: '', custid: '', uscc: '', supplierId: '', blackReason: [], blackRemark: '' },
        formItems: [
          {
            label: '企业名称',
            type: 'autocomplete',
            // remote: true,
            prop: 'name',
            rules: this.defaultRules,
            querySearch: (name, cb, formItems, form) => {
              let methodStr = this.methodStr == 'customer' ? CUSTOMER.list : SUPPLIER.list
              let query = [{ column: 'status', type: 'eq', value: 'valid' }]
              name && query.push({ column: 'name', type: 'like', value: name })
              methodStr({ currPage: 1, pageSize: 1000, query })
                .then((res) => {
                  cb(res.data.list.map((v) => ({ ...v, value: v.custid || v.supplierId, label: v.name })))
                })
                .catch(() => {
                  callback()
                })
            },
            select: (val, form) => {
              this.$nextTick(() => {
                form.custid = val.custid
                form.uscc = val.uscc
                form.supplierId = val.supplierId
              })
            },
            change: (val, form) => {
              form.custid = form.uscc = form.supplierId = ''
            },
            // remoteSelectList: [],
            // DIY: { key: 'code' },
            // remoteMethod: (name, item) => {
            //   let methodStr = this.methodStr == 'customer' ? CUSTOMER.list : SUPPLIER.list
            //   methodStr({ currPage: 1, pageSize: 20, verifyStatus: 'all', name }).then((res) => {
            //     item.remoteSelectList = res.data.list.map((v) => ({ ...v, value: v.custid || v.supplierId, label: v.name }))
            //   })
            // },
          },
          {
            label: '拉黑原因',
            prop: 'blackReason',
            type: 'select',
            multiple: true,
            rules: this.defaultRules,
            propInDict: 'blacklistReason',
          },
          { label: '拉黑备注', prop: 'blackRemark', type: 'textarea', maxlength: 512 },
        ],
      },
      releaseDialog: { //已放弃
        title: '解除黑名单',
        show: false,
        showClear: true,
        form: { belongEmployee: '', deptCname: '' },
        formItems: [
          {
            label: '维护BD',
            prop: 'belongEmployee',
            type: 'select',
            remoteSelectList: NLIST,
            DIY: { key: 'employeeId' },
            remote: true,
            rules: { ...this.defaultRules },
            remoteMethod: (name) => {
              let query = [{ column: 'roleCode', type: 'in', value: 'bd,obd' }]
              name && query.push({ column: 'name', type: 'eq', value: name })
              listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data: { list } }) => {
                NLIST.splice(0, 1000, ...list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId })))
              })
              // let query = []
              // name && query.push({ column: 'name', type: 'eq', value: name })
              // baseEmployeeList({ currPage: 1, pageSize: 20, query }).then(({ data: { list } }) => {
              //   NLIST.splice(0, 100, ...list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId })))
              // })
            },
          },
          { label: '维护部门', prop: 'deptCname', type: 'input', disabled: true, rules: { ...this.defaultRules } },
          // { label: '解除原因', prop: 'releaseReason', type: 'input', rules: this.defaultRules },
          // { label: '解除备注', prop: 'releaseRemark', type: 'textarea' },
        ],
      },
      addDialog: {
        show: false,
        title: '新增黑名单',
        width: '780px',
        form: { country: '', name: '', blackReason: '', blackRemark: '', limitFee: '' },
        methodStr: '',
        selections: [],
        rules: {
          country: { required: true, message: ' ', trigger: 'change' },
          name: { required: true, message: ' ', trigger: 'change' },
          blackReason: { required: true, message: ' ', trigger: 'change' },
          blackRemark: { required: true, message: ' ', trigger: 'change' },
          limitFee: { required: true, message: ' ', trigger: 'change' }
        },
        tableOption: {
          title: '企业信息',
          diyEmpty: true,
          selection: { show: true, fixed: true },
          tips: { show: false, text: '' },
          maxHeight: '400px',
          columns: [
            { prop: 'name', label: '企业名称', width: 160 },
            { prop: 'uscc', label: '社信统一代码', width: 140 },
            {
              prop: 'createdName',
              label: '维护人',
              width: 138,
              formatter: ({ row }) => {
                if (this.methodStr !== 'customer') {
                  return row.mtEmployeeName
                }
                let employeeVos = row.customerBds || []
                // return (employeeVos || []).reduce((cur, next) => {
                //   if (!next) return cur
                //   return cur + next.deptCname + '，' + next.cname + ' '
                // }, '')
                return employeeVos.map(item => {
                  return  item.bdDeptName ? `${item.bdEmployeeName}(${item.bdDeptName})` : item.bdEmployeeName
                }).join('，')
              },
            },
            {
              prop: 'roleTypeInfo',
              width: 130,
              type: 'select',
              label: '企业类别',
              propInDict: 'customerRole',
              multi: true,
              noDict: true,
            },
            {
              prop: 'custMode',
              label: '新建类型',
              type: 'select',
              selectOptions: [
                { value: 'order', label: '下单客户' },
                { value: 'potential', label: '潜在客户' },
              ],
              hide: false,
            },
          ],
          data: [],
        },
      },
      changeDialog: {
        show: false,
        showClear: true,
        title: '修改费用录入',
        form: { limitFee: [] },
        formItems: [
          {
            label: '不可录入费用',
            type: 'select',
            prop: 'limitFee',
            multiple: true,
            rules: { required: true, message: ' ', trigger: ['blur', 'change']},
          }
        ],
      },
      importShow: false,
      fileList: [],
      isCts: false, // 客户部
      isSps: false, // 供应部
      isCS: false, // 供应部或客户部
      isCS2: false, // 既是供应部又是客户部
      // 解除原因
      releaseReasonDialog: {
        title: '解除黑名单',
        show: false,
        showClear: true,
        btnLoading: false,
        formItems: [
          {
            label: '解除原因',
            type: 'select',
            prop: 'releaseReason',
            propInDict: 'blacklistRelieveReason',
            rules:
              [
                { required: true, message: '解除原因必填', trigger: 'change'}
              ],
            style: 'margin-bottom: 15px !important'
          },
          {
            label: '备注',
            type: 'textarea',
            prop: 'releaseRemark',
            maxlength: 512,
            rules:
              [
                { max: 512, message: '备注最大长度限制512位', trigger: 'blur' }
              ]
          }
        ],
        form: { releaseReason: '', releaseRemark: ''}
      },
      oids: '' //解除ids
    }
  },
  watch: {
    'releaseDialog.form.belongEmployee'(val) {
      this.releaseDialog.form.belongEmployeeId = val.employeeId
      this.releaseDialog.form.belongDeptCode = val.deptCode
      this.releaseDialog.form.deptCname = val.deptCname
    },
    methodStr: {
      handler(val) {
        this.$nextTick(() => {
          this.releaseDialog.formItems.forEach((item) => {
            item.rules.required = val !== 'customer'
          })
        })
      },
      immediate: true,
    },
  },
  created() {
    let roles = this.$store.state.user.roles || []
    this.isCts = roles.includes('cts')
    this.isSps = roles.includes('sps')
    this.isCS = this.isCts || this.isSps
    this.isCS2 = this.isCts && this.isSps
    if (this.isCS) {
      this.methodStr = this.isCts ? 'customer' : 'supplier'
    }
    // 搜索配置
    let searchObj = {}
    blackListTable.forEach((v) => {
      searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
    })
    this.searchOption1 = {
      saveDefault: true,
      addFilter: {
        defaultSearchLength: 2,
        searchInputGroup: [
          { key: 'name', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'createdTime', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['createdTime', 'releaseTime'],
        callback: true,
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    let operationBtns = {
      ...this.option.operationBtns,
      width: '150px',
      data: [
        // { label: '详情', action: 'showDetail', show: true },
        { label: '切换费用权限', action: 'Delete', showFn: (row) => row.orgid && (row.state === 'valid') },
        // 随意加的注释 ----解除合并失效的问题 
        { label: '解除', action: 'Edit', showFn: (row) => row.state === 'valid' }
      ],
    }
    this.option1 = { 
      ...this.option, 
      id: 'option1', 
      pagination, 
      operationBtns, 
      multiRow: true,
      multiKey: 'blacklistHistoryList',
      multiId: 'oid',
      border: true
    }
    if (!this.isCS) {
      this.option1.operationBtns.show = false
      this.option1.selection = false
      this.option1.rootTipsHide = true
    }
    console.log("123", this.option1.data)
    this.option1.columns = [...blackListTable]
    // this.getData()
  },
  mounted() {
    // 初始化水印
    this.reloadWathermark()
    // 监听缩放重新渲染水印
    window.addEventListener('resize', this.reloadWathermark)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.reloadWathermark)
  },
  methods: {
      // 渲染水印
    reloadWathermark () {
      // 删除之前的水印
      document.querySelector('.water-mark-box').innerHTML = ''
      // 重新渲染水印
      let userInfo = this.$store.state.user.userInfo
      let { deptName, userName, mobileNo = '', employeeNo } = userInfo
      // let text = `${deptName}_${userName}_${mobileNo.slice(-4) || employeeNo}`
      // watermark({watermark_txt: text, className:'water-mark-box',watermark_alpha: '0.3'})
      let text = `${userName}_${employeeNo}`
      watermark({
        watermark_txt: text, 
        className:'water-mark-box', 
        watermark_zindex: 6, 
      })
    },
    handleDelete(index,row) {
      let limitFee =[]
      if(row.allowFeeAr==='no'){
        limitFee.push('receivables')
      }
      if(row.allowFeeAp==='no'){
        limitFee.push('cope')
      }
      this.changeDialog.form.limitFee = limitFee
      this.changeDialog.form.oid = row.oid
      this.changeDialog.show = true
    },
    // 确定切换
    closeChangeDialog(tag){
      if (!tag) {
        return this.closeChangeDia()
      }
      let dataItem = this.changeDialog.form
      if(dataItem.limitFee){
          if(dataItem.limitFee.includes('receivables')){
            dataItem.allowFeeAr='no'
          }else{
            dataItem.allowFeeAr='yes'
          }
          if(dataItem.limitFee.includes('cope')){
            dataItem.allowFeeAp='no'
          }else{
            dataItem.allowFeeAp='yes'
          }
        }
      this.changeDialog.form.oids = [this.changeDialog.form.oid]
      BLACK.allowFee({...this.changeDialog.form}).then(res => {
        if (res.code === 0) {
          this.$msgSucClose('修改成功')
          this.getData()
          this.closeChangeDia()
        }
      }).catch(()=>{})
    },
    // 关闭切换框
    closeChangeDia(){
      this.changeDialog.show = false
      this.changeDialog.form = {
        limitFee: [],
      }
    },
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 搜索按钮
    search(query) {
      this.option1.pagination.currPage = 1
      this.getData(query)
    },
    // 封装请求参数并请求列表
    getData(query) {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
      }
      if (query) {
        this.searchBackup = query
      }
      data.query = this.searchBackup || []
      this._exportSearchData = data
      BLACK[this.methodStr + 'List'](data)
        .then(({ data }) => {
          // this.option1.data = data.list
          this.option1.data = data.list.map((item) => ({ ...item, toggle: false }))
          if (this.option1.data.length) {
            this.option1.data.forEach(item => {
              if (item.state === 'invalid') {
                item._disabled = true
              }
              if (item.allowFee && item.blacklistHistoryList.length) {
                item.blacklistHistoryList[0].allowFee = item.allowFee
              }
                item.blacklistHistoryList[0].allowFeeAp = item.allowFeeAp
                item.blacklistHistoryList[0].allowFeeAr = item.allowFeeAr
              // 针对无历史记录的老数据，手动插入一条
              if (!item.blacklistHistoryList.length) {
                item.blacklistHistoryList.push(item)
              }
            })
            this.option1.operationBtns.show = this.option1.data.some(item => item.state === 'valid') //如果全是已解除状态，不显示操作列
          }
          this.option1.pagination.currPage = data.currPage
          this.option1.pagination.pageSize = data.pageSize
          this.option1.pagination.totalCount = data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    handleExport() {
      BLACK[this.methodStr + 'Export'](this._exportSearchData).then((res) => {
        window.open(res.data.filePath)
        this.$msgSucClose('导出成功！')
      })
    },
    showDetail(row) {
      // 利用customerReviewList/detailPass & supplierReviewList/detailPass组件
      let name = this.methodStr == 'customer' ? 'Customer' : 'Supplier'
      this.routerPush('BlackListDetail' + name, { orgid: row.orgId, black: true })
    },
    sendMulti(data) {
      this.multipleSelection1 = data
    },
    // 解除
    handleEdit(row) {
      if (row === 'multi' && !this.multipleSelection1.length) {
        return this.$msgErrClose('请选择需要解除的企业！')
      }
      this.oids = row === 'multi' ? this.multipleSelection1.map((v) => v.oid) : [row.oid]
      this.releaseReasonDialog.show = true
    },
    // 确认解除
    confirmReleaseReason (tag) {
      if (!tag) {
        return this.closeReleaseReason()
      }
      let data = {
        oids: this.oids,
        ...this.releaseReasonDialog.form
      }
      this.releaseReasonDialog.btnLoading = true
      BLACK[this.methodStr + 'Release'](data).then((res) => {
        this.releaseReasonDialog.btnLoading = false
        this.$msgSucClose('解除成功！')
        this.handleCurrentChange(1)
        this.closeReleaseReason()
      }).catch(() => {
        this.releaseReasonDialog.btnLoading = false
      })
    },
    // 关闭填写解除原因弹框
    closeReleaseReason () {
      this.releaseReasonDialog.show = false
      this.releaseReasonDialog.form.releaseReason = ""
      this.releaseReasonDialog.form.releaseRemark = ""
    },
    // 显示添加弹框
    addHandle() {
      this.addDialog.show = true
      this.addDialog.tableOption.selections = []
      this.addDialog.methodStr = this.methodStr
      this.addDialog.tableOption.data.splice(0, 1000)
      let columns = this.addDialog.tableOption.columns
      if (this.methodStr === 'customer') {
        columns[3] = { ...columns[3], label: '客户类型', prop: 'roleTypeInfo', propInDict: 'customerRole', width: 130 }
        columns[4].hide = false
      } else {
        columns[3] = { ...columns[3], label: '供应商类型', prop: 'categoryInfo', propInDict: 'crmCategory', width: '' }
        columns[4].hide = true
      }
      this.addDialog.tableOption = Object.assign({}, this.addDialog.tableOption)
    },
    // 确认添加
    closeDialogAdd(tag) {
      let option = this.addDialog
      if (!tag) return (option.show = false)
      // 新增之前，判断是否有关联系公司要一起拉黑
      let blackReason = option.form.blackReason && option.form.blackReason.join(',')
      let data = option.selections.map((item) => {
        let { name, uscc, custid, supplierId } = item
        let obj = this.methodStr == 'customer' ? { custid } : { supplierId }
        return { ...option.form, ...obj, blackReason, name: name || option.form.name, uscc }
      })
      if (data.length) {
        let custidArr = data.map(ele => {
          let { custid, name, supplierId  } = ele
          let obj = this.methodStr == 'customer' ? { custid } : { supplierId }
          return { ...obj, name }
        })
        BLACK[this.methodStr + 'RelationRecord'](custidArr).then((res) => {
          if (res.code === 0) {
            let list = res.data || []
            if (list.length) {
              let isRelationArr = list.filter(item => item.relationFlag === 'Y') //所选拉黑的公司存在关联公司
              if (isRelationArr.length) {
                let msg = ""
                isRelationArr.forEach((rItem, rIndex) => {
                  msg += `${rItem.name}已关联`
                  if (rItem.rRecords && rItem.rRecords.length) {
                    rItem.rRecords.forEach ((subrItem, subrIndex) => {
                      if (subrIndex === rItem.rRecords.length - 1) {
                        msg += `${subrItem.name}`
                      } else {
                        msg += `${subrItem.name}，`
                      }
                    })
                  }
                  if (rIndex !== isRelationArr.length - 1) {
                    msg += "；"
                  }
                })
                msg += "，是否将关联公司一起拉黑？"
                this.$confirm(msg, '提示', {
                  confirmButtonText: '是',
                  cancelButtonText: '否',
                  type: 'warning'
                }).then(() => {
                  this.closeDialogAddApi(data, 'Y')
                }).catch(() => {
                  this.closeDialogAddApi(data, 'N')        
                });
              } else {
                this.closeDialogAddApi(data, 'N')
              }
            }
          }
        })
      }
    },
    /**
     * @description: 调用拉黑接口
     * @param {*} data
     * @param {*} isBlackRelationFlag 是否有关联公司的标记
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-21 16:31:40
     */
    closeDialogAddApi (data, isBlackRelationFlag) {
      data.forEach(dataItem => {
        dataItem.isBlackRelationFlag = isBlackRelationFlag
        if(dataItem.limitFee){
          if(dataItem.limitFee.includes('receivables')){
            dataItem.allowFeeAr='no'
          }else{
            dataItem.allowFeeAr='yes'
          }
          if(dataItem.limitFee.includes('cope')){
            dataItem.allowFeeAp='no'
          }else{
            dataItem.allowFeeAp='yes'
          }
        }
      })
      BLACK[this.methodStr + 'Add'](data).then((res) => {
        if (res.code === 0) {
          this.$msgSucClose('添加成功！')
          this.handleCurrentChange(1)
          this.addDialog.show = false
        }
      })
    },
    // 确认解除
    closeDialogRelease(type, tag) {
      let option = this.releaseDialog
      if (!tag) return (option.show = false)
      BLACK[this.methodStr + 'Release']({ ...option.form, blackReason, name, uscc }).then((res) => {
        this.$msgSucClose('解除成功！')
        this.handleCurrentChange(1)
        option.show = false
      })
    },
    close(tag) {
      if (!tag) return (this.importShow = false)
      if (!this.fileList.length) return this.$msgErrClose('请上传文件！')
      const formData = new FormData()
      formData.append('fileName', this.fileList[0].raw)
      BLACK[this.methodStr + 'Import'](formData).then((res) => {
        this.$msgSucClose('导入成功!')
        this.importShow = false
        this.handleCurrentChange(1)
      })
    },
    getFile(fileList) {
      this.fileList = fileList
    },
    downLoad() {
      BLACK.download({}, { folder: 'excel', fileName: 'blacklist_temp.xlsx' }, { responseType: 'blob' }).then((res) => {
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(res)
        link.download = '黑名单模板.xlsx'
        link.click()
        this.$msgSucClose('下载成功！')
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-page ::v-deep {
  .el-dialog__body {
    padding: 20px;
  }
  .el-dialog__footer {
    padding: 0 20px 20px;
  }
  .el-table th {
    padding: 4px 0;
  }
  .el-table--border th,
  .el-table--border td {
    border-right: 1px solid #dfe6ec !important;
    border-bottom: 1px solid #dfe6ec !important;
  }
  .el-table__body .el-table__row {
    height: auto !important;
    td:nth-of-type(4),
    td:nth-of-type(5),
    td:nth-of-type(6),
    td:nth-of-type(7),
    td:nth-of-type(8),
    td:nth-of-type(9),
    td:nth-of-type(10),
    td:nth-of-type(11),
    td:nth-of-type(12), 
    td:nth-of-type(13) {
      padding: 0;
      & > div {
        padding: 0;
        & > div {
          .el-tooltip{
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          min-height: 22px;
          line-height: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid #dfe6ec;
          &:nth-last-of-type(1),
          &.noBorder:nth-of-type(1) {
            border: none;
          }
        }
      }
    }
  }
}
</style>