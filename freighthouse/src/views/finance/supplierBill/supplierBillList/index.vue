<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div>
      <FinanceSearch :searchOption="searchOption1" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <el-button-group>
              <el-button v-if="checkAuth($route.name, 'btn-importAction')" class="finance-btn" @click="importAction" size="mini">导入供应商账单</el-button>
            </el-button-group>
            <div class="finance-btn select-template-box">
              <el-dropdown v-if="checkAuth($route.name, 'btn-supplierBillCompare')" trigger="click" @command="download">
                <span class="el-dropdown-link">导出模板<i class="el-icon-arrow-down el-icon--right"></i></span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="(item, index) in dictMap['supplierBillCompareStatementType']"
                    :key="'exportTypeList' + index"
                    :command="item"
                  >{{item.label}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <el-button-group>
              <el-button type="primary" v-if="checkAuth($route.name, 'btn-createSettlement2')" class="finance-btn" @click="createSettlement2('multi')" size="mini">生成多个结算单</el-button>
            </el-button-group>
            <el-button-group>
              <el-button type="primary" v-if="checkAuth($route.name, 'btn-createSettlement')" class="finance-btn" @click="createSettlement" size="mini">生成结算单</el-button>
            </el-button-group>
          </div>
          <div class="money-box-right">
            <el-button-group>
              <el-button
                class="finance-btn"
                @click="refreshListPage"
                size="mini"
                type="primary"
              >刷新</el-button>
            </el-button-group>
            <!-- <el-button-group>
            <el-button class="finance-btn" @click="openAccountChecking" size="mini">开始对账</el-button>
            </el-button-group>-->
            <!-- <el-button-group>
              <el-button class="finance-btn" @click="importAction" size="mini">导入供应商账单</el-button>
            </el-button-group>
            <el-button-group>
              <el-button class="finance-btn" @click="createSettlement" size="mini">生成结算单</el-button>
            </el-button-group>-->
          </div>
        </div>
        <FinanceTableMass :option="option1" @send-multi="sendMulti" />
      </div>
    </div>
    <div class="cancel-invoice-receivable-form">
      <el-dialog :title="'导入供应商账单'" :visible.sync="dialogVisible" width="950px">
        <div>
          <el-form
            :model="form"
            :rules="rules"
            ref="form"
            :inline="true"
            label-width="160px"
            size="mini"
          >
            <el-form-item label="结算单位" prop="settleCorpCode">
              <el-autocomplete
                v-model="form.settleCorpName"
                placeholder="请选择"
                clearable
                :select-when-unmatched="true"
                :fetch-suggestions="(queryString, cb) => {autocomplete1.querySearch && autocomplete1.querySearch(queryString, cb)}"
                @select="(value) => {autocomplete1.select && autocomplete1.select(value)}"
                @change="(value) => {autocomplete1.change && autocomplete1.change(value)}"
              ></el-autocomplete>
            </el-form-item>
            <!-- <el-form-item label="模板类型" prop="templateType">
            <el-select
              v-model="form.templateType"
              placeholder="请选择">
              <el-option
              v-for="(op, j) in dictMap['supplierBillCompareStatementType']"
              :key="'supplierBillCompareStatementType' + j"
              :label="op.label"
              :value="op.value">
              </el-option>
            </el-select>
            </el-form-item>-->
            <el-form-item label="收付类型" prop="payType">
              <el-select v-model="form.payType" placeholder="请选择">
                <el-option
                  v-for="(op, j) in dictMap['feeitemReceipayGroup']"
                  :key="'payType' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="解析模式" prop="parseMode">
              <el-select v-model="form.parseMode" placeholder="请选择">
                <el-option
                  v-for="(op, j) in dictMap['supplierBillParseMode']"
                  :key="'parseMode' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
              <!-- supplier_bill_compare_statement_type -->
            </el-form-item>
            <el-form-item label="模板类型" prop="templateType">
              <el-select v-model="form.templateType" placeholder="请选择">
                <el-option
                  v-for="(op, j) in dictMap['supplierBillCompareStatementType']"
                  :key="'templateType' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- supplier_bill_match_crop_code -->
            <el-form-item label="匹配分公司" prop="matchCropCode">
              <el-select v-model="form.matchCropCode" placeholder="请选择">
                <el-option
                  v-for="(op, j) in dictMap['supplierBillMatchCropCode']"
                  :key="'matchCropCode' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="业务日期范围" prop="bizDateRange">
              <el-date-picker
                v-model="form.bizDateRange"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              ></el-date-picker>
            </el-form-item>
            <!-- 添加v-if 解决再次进入仍会显示之前上传的文件 -->
            <el-form-item
              v-if="isShowUpload"
              label="附件"
              prop="fileNo"
              class="invoice-payment-add-form-upload"
              style="position:relative;"
            >
              <el-input
                v-model="form.fileNo"
                style="position:absolute;right:0;top:0;width:1px;height:1px;opacity:0;"
              ></el-input>
              <FinanceUploadEmbed
                :upload-api="uploadApi2"
                :upload-params="uploadParams2"
                :limit="1"
                @send-res-file-list="sendResFileList"
              />
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" size="mini" @click="confirmAction">确定</el-button>
          <el-button @click="dialogVisible = false" size="mini">取消</el-button>
        </span>
      </el-dialog>
    </div>
    <ResultDialog :option="resultDialogOption" @close="resultDialogOption.show = false">
      <div class="result-dialog-descript" slot="descript">
        <span v-for="item in settleOrderNos.split(',')" :key="item">{{item}}</span>
      </div>
    </ResultDialog>
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mapGetters } from 'vuex'
import { listPage, saveSupplierBill, settleOrderApply, settleOrderApplyGroup } from '@/api/fin/supplierBill'
import { dateFormat } from '@/views/finance/utils/finance'

export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: listPage('geturl'),
      keyDownActive: true,
      // exportTypeList:[{label:'明细',value:'detail'},{label:'总额',value:'total'},],
      option1: {},
      searchOption1: {},
      multipleSelection1: [],
      form: {
        settleCorpName: '',
        settleCorpCode: '',
        matchCropCode: '',
        templateType: '',
        payType: '',
        parseMode: '',
        bizDateRange: '',
        templateType: '',
        fileNo: '',
        fileId: '',
      },
      autocomplete1: {},
      dialogVisible: false,
      supplierBillId: '',
      rules: {
        settleCorpCode: [{ required: true, message: '结算单位不能为空', trigger: 'change' }],
        matchCropCode: [{ required: true, message: '匹配分公司不能为空', trigger: 'change' }],
        payType: [{ required: true, message: '收付类型不能为空', trigger: 'change' }],
        parseMode: [{ required: true, message: '匹配模式不能为空', trigger: 'change' }],
        templateType: [{ required: true, message: '模板类型不能为空', trigger: 'change' }],
        bizDateRange: [{ required: true, message: '业务日期范围不能为空', trigger: 'change' }],
        fileNo: [{ required: true, message: '附件不能为空', trigger: 'change' }],
      },
      uploadApi2: '/base/webapi/file/upload',
      uploadParams2: {},
      isShowUpload: true,
      resultDialogOption: {
        show: false,
        title: '生成成功',
        resultType: 'success',
        text_cancel: '关闭',
        titleText: '生成多个结算单成功！',
      },
      settleOrderNos: '',
    }
  },
  created() {
    this.searchOption1 = {
      saveDefault: true,
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: [
          { key: 'supplierBillNo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'supplierCorpCode', value: '', showType: '2', range: { min: '', max: '' } },
          { key: 'receipayType', value: '', showType: '3', range: { min: '', max: '' } },
          { key: 'created', value: '', showType: '4', range: { min: '', max: '' } },
        ],
        filterGroups: {
          supplierBillNo: { label: '对账单编号', type: 'input', showType: '1' },
          settleOrderNo: { label: '结算单号', type: 'input', showType: '1' },
          supplierCorpCode: {
            label: '结算单位',
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            remoteSelectList: [],
          },
          receipayType: { label: '收付类型', type: 'select', prop: 'receipayGroup', propInDict: 'feeitemReceipayGroup' },
          created: { label: '对账时间', type: 'daterange', showType: '1', format: 'yyyy-MM-dd' },
        },
      },
    }
    // let _this = this
    // this.autocomplete1 = {
    //   querySearch: (queryString, cb) => {
    //     _this.querySettleUnit({ queryString, unitTypes: 'supplier' }, cb)
    //   },
    //   select: (optionItem, row) => {
    //     _this.form.settleCorpCode = optionItem.key
    //   },
    // }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '100px',
      data: [
        { label: '账单数据', type: 'text', show: true, action: 'showDetail' },
        // {
        //   label: '对账',
        //   type: 'text',
        //   show: true,
        //   action: 'Edit',
        // },
      ],
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'SupplierBillList',
      data: [...this.option.data],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      emptyText: '数据将在查询后显示',
      pagination,
    })
    let columns = [
      {
        prop: 'supplierBillNo',
        label: '对账单编号',
        width: '140px',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => this.showDiff(row),
        },
      },
      { prop: 'supplierCorpName', label: '结算单位', width: '140px', type: 'text' },
      { prop: 'receipayType', label: '收付类型', type: 'select', propInDict: 'feeitemReceipayGroup', width: 80 },
      { prop: 'parseMode', label: '解析模式', type: 'select', propInDict: 'supplierBillParseMode', width: 80 },
      { prop: 'templateType', label: '对比方式', type: 'select', propInDict: 'supplierBillCompareStatementType', width: 80 },
      { prop: 'matchCompType', label: '匹配分公司', type: 'select', propInDict: 'supplierBillMatchCropCode', width: 80 },
      { prop: 'matchDateType', label: '日期类型', type: 'select', propInDict: 'supplierBillMatchDateType', width: 80 },
      {
        prop: 'bizDateRange',
        label: '日期范围',
        type: 'text',
        width: '170px',
        formatter: ({ row }) =>row.bizDateStart||row.bizDateEnd ? (row.bizDateStart||'-') + '至' +(row.bizDateEnd||'-') :'',
      },
      { prop: 'matchFeeSourceType', label: '对账费用来源', type: 'select', propInDict: 'supplierBillFeeSourceType', width: 100 },
      { prop: 'hasSettleOrder', label: '是否生成结算单', type: 'select', propInDict: 'yesNo', width: 100 },
      {
        prop: 'settleOrderNo',
        label: '结算单号',
        width: '190px',
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.routerPush('SettlementDetail', { source: 'settlementDetail', settleOrderNo: no })
          },
        },
      },
      { prop: 'createdName', label: '对账人', type: 'text', width: 100 },
      { prop: 'createdTime', label: '对账时间', type: 'text', width: 130 },
      {
        prop: 'matchResult',
        label: '系统核对结果',
        width: 100,
        type: 'button',
        callback: (row) => this.showDiff(row),
        formatter: ({ row }) => this.dictMapObj['supplierBillCompareMatchResult'][row.matchResult] || row.matchResult,
      },
    ]
    this.option1.columns = columns
    // this.getData()
    console.log(this.dictMapObj['supplierBillCompareMatchResult'])
  },
  methods: {
    importAction() {
      this.routerPush('SupplierBillImport')
      // this.dialogVisible = true
    },
    confirmAction() {
      // console.log('form:', this.form)
      this.$refs.form.validate((valid) => {
        if (valid) {
          let data = {
            settleCorpName: this.form.settleCorpName,
            settleCorpCode: this.form.settleCorpCode,
            templateType: this.form.templateType,
            payType: this.form.payType,
            parseMode: this.form.parseMode,
            matchCropCode: this.form.matchCropCode,
            bizDateStart: dateFormat('yyyy-mm-dd', this.form.bizDateRange[0]),
            bizDateEnd: dateFormat('yyyy-mm-dd', this.form.bizDateRange[1]),
            fileNo: this.form.fileNo,
          }
          saveSupplierBill(data).then((res) => {
            this.$message({
              message: '导入成功！',
              type: 'success',
              showClose: true,
            })
            this.isShowUpload = false
            this.dialogVisible = false
            this.$nextTick(() => {
              this.isShowUpload = true
            })
            this.form.settleCorpName = ''
            this.$refs.form.resetFields()
            this.getData()
            // this.showDetail({ supplierBillId: res.data })
          })
        }
      })
    },
    createSettlement2(type) {
      if (this.multipleSelection1.length !== 1) {
        return this.$message({
          message: '请勾选1个对账单！',
          type: 'error',
          showClose: true,
        })
      }
      this.$confirmWarn('确认生成多个结算单吗？', () => this.createSettlement(type))
    },
    // 生成结算单
    createSettlement(type) {
      if (this.multipleSelection1.length !== 1) {
        return this.$message({
          message: '请勾选1个对账单！',
          type: 'error',
          showClose: true,
        })
      }
      // if (this.multipleSelection1[0].matchResult !== 'all') {
      //   return this.$msgErrClose('部分匹配不能生成结算单!')
      // }
      this.lsLoading = true
      let method = type !== 'multi' ? settleOrderApply : settleOrderApplyGroup
      method({ supplierBillId: this.multipleSelection1[0].supplierBillId })
        .then((res) => {
          if (res.data.settleOrderNos) {
            this.settleOrderNos = res.data.settleOrderNos
            this.resultDialogOption.show = true
            return
          }
          this.$store.state._feeToSettleParams = res
          // localStorage.setItem('_feeToSettleParams', JSON.stringify(res))
          this.isJumpRouteFromPage = true
          this.$router.push({
            path: '/finance/settlement/createSettlement',
            query: {
              source: 'createSettlementFromFeeSearch',
              isSupplier: true,
              supplierBillNo: this.multipleSelection1[0].supplierBillNo,
            },
          })
        })
        .finally(() => (this.lsLoading = false))
      return
      // this.routerPush('CreateSettlement', {
      //   source: 'createSettlementFromSupplierBill',
      //   supplierBillId: this.multipleSelection1[0].supplierBillId,
      //   supplierBillNo: this.multipleSelection1[0].supplierBillNo,
      // })
    },
    sendResFileList(val) {
      this.form.fileId = val && val.length > 0 ? val[0].fileNo : ''
      this.form.fileNo = val && val.length > 0 ? val[0].fileNo : ''
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
      let filterGroups = this.searchOption1.addFilter.filterGroups
      this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
        let { key, value, range, req, valueReq } = item
        if (range && (range.min || range.max)) {
          range.min && data.query.push({ column: key + 'Min', type: 'eq', value: range.min })
          range.max && data.query.push({ column: key + 'Max', type: 'eq', value: range.max })
          return
        }
        if (valueReq) {
          data.query.push({ column: valueReq, type: 'eq', value: valueReq })
          return
        }
        if (value instanceof Array) {
          if (value.length === 0) {
            return
          }
          if (filterGroups[key].type == 'daterange') {
            data.query.push({ column: key + 'TimeStart', type: 'eq', value: value[0] })
            data.query.push({ column: key + 'TimeEnd', type: 'eq', value: value[1] })
            return
          }
          if (filterGroups[key].multiple) {
            data.query.push({ column: key, type: 'in', value: value.join(',') })
            return
          }
        }
        if(value){
          if(filterGroups[key].type == 'input'){
            data.query.push({ column: key, type: 'like', value: value.replace(/[\s+,+，+]+/g, ' ') })
          }else{
            data.query.push({ column: key, type: 'eq', value })
          }
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      // console.log('data:', data)
      this.lsLoading = true
      listPage(data)
        .then((res) => {
          this.option1.data = res.data.list
          this.$set(this.option1, 'emptyText', '未查询到任何数据')
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
    },
    // 显示账单数据
    showDetail(row) {
      this.routerPush('SupplierBillListDetail', { supplierBillId: row.supplierBillId })
    },
    // 显示对账页面
    handleEdit(row) {
      this.routerPush('SupplierBillListCheck', { supplierBillId: row.supplierBillId })
    },
    // 系统核对结果
    showDiff({ supplierBillId, lastCompareId, matchResult }) {
      this.routerPush('SupplierBillListResult', { supplierBillId, lastCompareId, matchResult })
    },
    // 下载
    download({ value: templateType, label }) {
      this.$store
        .dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/supplierBill/templateDownload',
          data: { data: { templateType } },
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = `供应商账单模板-${label}.xlsx`
          link.click()
        })
    },
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    FinanceUploadEmbed,
  },
}
</script>
<style lang="scss" scoped>
.finance-page ::v-deep .el-table .cell {
  padding-left: 2px;
  padding-right: 2px;
}
.finance-page ::v-deep .money-box-left .money-title {
  margin-right: 6px;
}
.finance-page ::v-deep .el-dialog__body .el-input--mini,
.finance-page ::v-deep .el-dialog__body .el-date-editor.el-input__inner {
  width: 220px;
}
.finance-page ::v-deep .upload-file-cont,
.finance-page ::v-deep .el-upload {
  width: 600px !important;
}
.result-dialog-descript {
  margin-top: 12px;
  span {
    font-size: 12px;
    display: inline-block;
    color: #222;
    width: 33%;
    margin-top: 8px;
    float: left;
    text-align: left;
  }
}
.select-template-box{
  margin-left: 10px;
  float: left;
  // display: inline-block;
}
.select-template-box .el-dropdown{
  margin-left: 0;
  margin-bottom: 0;
  border-radius: 0;
  font-size: 12px;
  /* line-height: 26px; */
  border: 1px solid #D9D9D9;
//   border-right: none;
  border-radius: 4px;
}
.select-template-box:hover .el-dropdown{
  background: rgb(236, 245, 255);
  color: rgb(64, 158, 255);
}
.select-template-box .el-dropdown-link {
  cursor: pointer;
  padding-left: 5px;
  line-height: 18px;
  display: inline-block;
}
.select-template-box .el-icon--right{
  margin-left: 0;
}
.select-template-box .el-dropdown-link:focus{
  outline: none;
}
</style>