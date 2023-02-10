<template>
<div class="finance-page"
  v-loading="loading"
  :element-loading-text="eLoadingText"
  :element-loading-spinner="eLoadingSpinner"
  :element-loading-background="eLoadingBackground">
  <FinanceSearch
    :searchOption="searchOption1"
    @search="search"/>
  <div class="finance-search-list-gap">
  </div>
  <div class="finance-list-container">
    <div class="money-box">
      <div class="money-box-left">
        <el-button-group>
          <el-button
            v-if="checkAuth($route.name, 'btn-importSettlementBill')"
            type="primary"
            class="finance-btn"
            size="mini"
            @click="importSettlementBill()"
          >导入客户账单</el-button>
        </el-button-group>
      </div>
      <div class="money-box-right">
        <el-button
          class="finance-btn"
          @click="refreshListPage"
          size="mini"
          type="primary"
        >{{$t('Common.refresh')}}</el-button>
      </div>
    </div>
    <FinanceTableMass
      :option="option1"
      @send-multi="sendMulti"/>
  </div>
  <el-dialog
    title="导入客户账单"
    :visible.sync="importDialogVisible"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    class="finance-settlementbill-merge"
    width="515px">
    <div>
      <el-form ref="mergeForm" :model="mergeForm" :rules="mergeFormRules" label-width="110px" size="mini">
        <!-- <el-form-item
          label="大掌柜账单"
          prop="fileUid"
          style="position:relative;">
          <el-input v-model="mergeForm.fileUid" style="position:absolute;right:0;top:0;width:1px;height:1px;opacity:0;"></el-input>
          <FinanceUploadEmbed
            :width="290"
            :limit="1"
            :acceptTypes="['xls', 'xlsx']"
            :acceptSelf="acceptSelf"
            :autoUpload="false"
            @send-file-list="receiveFileList" />
          <span v-show="!mergeForm.fileUid && fileUploadIsNull" style="position:absolute;right:-29px;top:0;color:#ff4949">必填</span>
        </el-form-item>
        <el-form-item
          label="大掌柜账单类型"
          prop="billType">
          <el-select v-model="mergeForm.billType"
            placeholder="请选择大掌柜账单类型"
            class="finance-bill-detail-selectshow-fields2">
            <el-option label="汇总" value="sum"></el-option>
            <el-option label="明细" value="detail"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item
          label="结算单号"
          prop="settleOrderNos">
          <el-input v-model="mergeForm.settleOrderNos"
            placeholder="请输入结算单号，多个以英文逗号分隔"
            clearable>
          </el-input>
        </el-form-item>
        <el-form-item
          label="银行账号"
          prop="settleUnitBankAcctIds">
          <el-select v-model="mergeForm.settleUnitBankAcctIds"
            multiple
            class="finance-bill-detail-selectshow-fields2"
            placeholder="请选择银行账号"
            filterable
            collapse-tags
            @visible-change="(value) => {if(value) companyBankAccountList('')}"
            @change="(value) => {companyBankAccountChange(value)}">
            <!-- remote
            :remote-method="(queryString) => {companyBankAccountList(queryString)}" -->
            <el-option
              v-for="(item, index) in bankAccountSelectOptions3"
              :key="'bankAccountSelectOptions3' + index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="账单抬头"
          prop="longsailTitle">
            <el-select
              v-model="mergeForm.longsailTitle"
              class="finance-bill-detail-selectshow-fields2"
              placeholder="请选择账单抬头"
              @visible-change="longsailTitleVisible"
              @change="longsailTitleChange">
              <el-option
                v-for="(item, index) in getLongsailTitleList"
                :key="'longsailTitleList' + index"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item
          label="显示字段"
          prop="showOptions">
          <el-select v-model="showOptions"
            multiple
            class="finance-bill-detail-selectshow-fields2"
            placeholder="请选择显示字段"
            collapse-tags
            @change="showOptionsChange">
            <el-option label="所属公司" value="settleCompNameShow"></el-option>
            <el-option label="业务员" value="bdEmployeeNameShow"></el-option>
            <el-option :label="$t('FeeList.settleCorp')" value="settleCorpNameShow"></el-option>
            <el-option label="工作号" value="sourceBizNoShow"></el-option>
            <el-option label="账单号" value="billNoShow"></el-option>
            <el-option v-show="lang === 'zh'" label="客户委托号" value="customerNoShow"></el-option>
            <el-option label="箱号" value="containerNoShow"></el-option>
            <el-option v-show="lang === 'zh'" label="SO NO" value="soNoShow"></el-option>
            <el-option v-show="lang === 'zh'" label="航线" value="sysLienNameShow"></el-option>
            <el-option label="船名航次" value="vesselVoyageShow"></el-option>
            <el-option label="起运港" value="polEnameShow"></el-option>
            <el-option label="目的港" value="podEnameShow"></el-option>
            <el-option label="箱型箱量" value="boxSizeShow"></el-option>
            <el-option label="开航日期" value="etdShow"></el-option>
            <el-option label="到港日期" value="etaShow"></el-option>
            <el-option label="实际开航日期" value="atdShow"></el-option>
            <el-option label="币种" value="currencyShow"></el-option>
            <el-option label="未收" value="reciTotalAmtShow"></el-option>
            <el-option label="未付" value="payTotalAmtShow"></el-option>
            <el-option label="HBL" value="hblShow"></el-option>
            <el-option label="MBL" value="mblShow"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="语言"
          prop="lang">
          <el-select v-model="mergeForm.lang"
            placeholder="请选择语言"
            class="finance-bill-detail-selectshow-fields2">
            <el-option label="中文" value="zh"></el-option>
            <el-option label="English" value="en"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="mergeSubmit" size="mini" :loading="loading">{{$t('Common.submit')}}</el-button>
      <el-button @click="importDialogVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
    </span>
  </el-dialog>
</div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { billMixin } from '@/views/finance/mixins/billMixin'
import { employeeSelectlist } from '@/api/companyResource'
import { mergeBillListPage, mergeDzgBill } from '@/api/fin/settleOrderBill'
import { dateFormat } from '@/views/finance/utils/finance'
import { companyBillBankAccountList } from '@/api/fin/settleUnitBankAcct'

export default {
  mixins: [mixin, mixin2, routerMixin, billMixin],
  data() {
    return {
      keyDownActive: true,
      option1: {},
      searchOption1: {},
      loading: false,
      employeeOptions: [],
      mergeForm: {
        fileUid: '',
        settleOrderNos: '',
        settleUnitBankAcctIds: [],
        showOptions: [],
        lang: 'zh',
        longsailTitle: '',
        billType: ''
      },
      mergeFormRules: {
        fileUid: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
        settleOrderNos: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
        settleUnitBankAcctIds: [
          { required: true, message: ' ', trigger: ['blur'] }
        ],
        showOptions: [
          { required: true, message: ' ', trigger: ['blur', 'change'] }
        ],
        lang: [
          { required: true, message: '', trigger: 'blur' }
        ],
        longsailTitle: [
          { required: true, message: ' ', trigger: ['blur'] }
        ],
        billType: [
          { required: true, message: ' ', trigger: 'blur' }
        ]
      },
      fileList: [],
      file: '',
      importDialogVisible: false,
      showUploadBtn: true,
      bankAccountSelectOptions3: [],
      acceptSelf: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
      showOptions: [],
      allShowOptions: ['settleCompNameShow', 'bdEmployeeNameShow', 'settleCorpNameShow', 'sourceBizNoShow', 'billNoShow', 'customerNoShow', 'containerNoShow', 'soNoShow', 'sysLienNameShow', 'vesselVoyageShow', 'polEnameShow', 'podEnameShow', 'boxSizeShow', 'etdShow', 'etaShow', 'atdShow', 'currencyShow', 'reciTotalAmtShow', 'payTotalAmtShow', 'hblShow', 'mblShow'],
      zhDefaultShowOptions: ['settleCompNameShow', 'sourceBizNoShow', 'billNoShow', 'customerNoShow', 'containerNoShow', 'soNoShow', 'polEnameShow', 'podEnameShow', 'boxSizeShow', 'etdShow', 'etaShow', 'currencyShow', 'reciTotalAmtShow', 'payTotalAmtShow'], // 'settleCorpNameShow'
      enDefaultShowOptions: ['settleCompNameShow', 'sourceBizNoShow', 'billNoShow', 'containerNoShow', 'polEnameShow', 'podEnameShow', 'boxSizeShow', 'etdShow', 'etaShow', 'currencyShow', 'reciTotalAmtShow', 'payTotalAmtShow'], //'settleCorpNameShow'
      lang: 'zh',
      fileUploadIsNull: false,
      longsailTitle: '',
      showTitleDropdown: false,
      bankAccountList: [],
      // longsailTitleList: [],
      longsailTitle: '',
    }
  },
  created() {
    let selection = {
      show: false
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      show: false
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true, isNew: true
    })
    this.searchOption1 = {
      saveDefault: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: [
          { key: 'mergeNo', value: '', showType: '1' },
          { key: 'settleOrderNo', value: '', showType: '2' },
          { key: 'settleCorpCode', value: '', showType: '3' },
          { key: 'createdBy', value: '', showType: '4' },
          { key: 'createdTime', value: '', showType: '5' },
        ],
        filterGroups: {
          mergeNo: { label: '合并编号', type: 'input', placeholder:  this.$t('Common.plEnter'), showType: '1' },
          settleOrderNo: { label: this.$t('FeeList.settleOrderNo'), type: 'input', placeholder:  this.$t('Common.plEnter'), showType: '2' },
          settleCorpCode: { label: this.$t('FeeList.settleCorp'), prop: 'settleCorpCode', type: 'remoteSelect', showType: '3',
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({queryString, unitTypes: ''}, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({queryString, unitTypes: ''}, item)     
            },
            remoteSelectList: [],
          },
          createdBy: { label: '合并人', prop: 'employeeId', type: 'remoteSelect', showType: '4',
            remoteMethod: this.getEmployeeList,
            remoteSelectList: this.employeeOptions,
          },
          createdTime: { label: '合并时间', type: 'daterange', placeholder:  this.$t('Common.plSelect'), showType: '5' },
        }
      }
    }
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'SettlementBillMergeList',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection,
      operationBtns,
      pagination
    })
    let columns = [
      { prop: 'mergeNo', label: '合并编号', type: 'text' },
      { prop: 'settleOrderNos', label: this.$t('FeeList.settleOrderNo'), type: 'columnTip',
        width: 130,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showColumnDetail({
              type: 'settleOrderNo',
              no,
              componentProps,
            })
          }
        }
      },
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text' },
      { prop: 'fileNo', label: '合并后账单', type: 'button',
        operationBtns: {
          data: [{ label: '下载', action: 'Download' }],
          callback: (action, rowIndex, row, option) => {
            this['handle' + action](row)
          }
        } },
      { prop: 'createdName', label: '合并人', type: 'text' },
      { prop: 'createdTime', label: '合并时间', type: 'text' },
    ]
    this.option1.columns = columns
    this.initShowOptions()
  },
  methods: {
    getData(isSearch) {
      this.loading = true
      let data = {
        "currPage": this.option1.pagination.currPage,
        "pageSize": this.option1.pagination.pageSize,
        "query": []
      }
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value } = item
        if (value) {
          if (value instanceof Array) {
            if (value.length === 0) {
              return
            }
            if (key === 'createdTime') {
              data.query.push({
                column: 'createdTimeBegin',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
              })
              data.query.push({
                column: 'createdTimeEnd',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
              })
            }
          } else {
            data.query.push({
              column: key,
              type: 'eq',
              value: value,
            })
          }
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      mergeBillListPage(data).then(res => {
        let { list } = res.data
        list.forEach(item => {
          item.settleOrderNos_multiValue = item.settleOrderNos.split(',')
        })
        this.option1.data = list
        Object.assign(this.option1.pagination, res.data)
        // this.option1.pagination.currPage = res.data.currPage
        // this.option1.pagination.pageSize = res.data.pageSize
        // this.option1.pagination.totalCount = res.data.totalCount
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.loading = false
      })
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params)
    },
    importSettlementBill() {
      this.importDialogVisible = true
    },
    receiveFileList(val) {
      // console.log(val)
      if (val && val.length) {
        this.file = val[0]
        this.mergeForm.fileUid = this.file.uid
      } else {
        this.file = ''
        this.mergeForm.fileUid = ''
      }
    },
    receiveFile(val) {
      console.log(val)
      this.file = val
      this.mergeForm.fileUid = val.uid
    },
    removeFile(val) {
      // console.log(val)
      if (this.file.uid === val.uid) {
        this.file = ''
        this.mergeForm.fileUid = ''
      }
    },
    initShowOptions() {
      this.mergeForm.showOptions = this.showOptions = this.lang === 'zh' ? this.zhDefaultShowOptions : this.enDefaultShowOptions // this.allShowOptions
    },
    showOptionsChange(val) {
      this.mergeForm.showOptions.splice(0, 1000, ...this.showOptions)
    },
    mergeSubmit() {
      this.$refs.mergeForm.validate((valid, fields) => {
        if (valid) {
          const form = new FormData()
          form.append('file', this.file)
          let data = {
            settleOrderNos: this.mergeForm.settleOrderNos,
            settleUnitBankAcctIds: this.mergeForm.settleUnitBankAcctIds,
            settleCompNameShow: this.showOptions.includes('settleCompNameShow') ? '01' : '00',
            bdEmployeeNameShow: this.showOptions.includes('bdEmployeeNameShow') ? '01' : '00',
            settleCorpNameShow: this.showOptions.includes('settleCorpNameShow') ? '01' : '00',
            sourceBizNoShow: this.showOptions.includes('sourceBizNoShow') ? '01' : '00',
            billNoShow: this.showOptions.includes('billNoShow') ? '01' : '00',
            customerNoShow: this.showOptions.includes('customerNoShow') ? '01' : '00',
            containerNoShow: this.showOptions.includes('containerNoShow') ? '01' : '00',
            soNoShow: this.showOptions.includes('soNoShow') ? '01' : '00',
            sysLienNameShow: this.showOptions.includes('sysLienNameShow') ? '01' : '00',
            vesselVoyageShow: this.showOptions.includes('vesselVoyageShow') ? '01' : '00',
            polEnameShow: this.showOptions.includes('polEnameShow') ? '01' : '00',
            podEnameShow: this.showOptions.includes('podEnameShow') ? '01' : '00',
            boxSizeShow: this.showOptions.includes('boxSizeShow') ? '01' : '00',
            etdShow: this.showOptions.includes('etdShow') ? '01' : '00',
            etaShow: this.showOptions.includes('etaShow') ? '01' : '00',
            atdShow: this.showOptions.includes('atdShow') ? '01' : '00',
            currencyShow: this.showOptions.includes('currencyShow') ? '01' : '00',
            reciTotalAmtShow: this.showOptions.includes('reciTotalAmtShow') ? '01' : '00',
            payTotalAmtShow: this.showOptions.includes('payTotalAmtShow') ? '01' : '00',
            hblShow: this.showOptions.includes('hblShow') ? '01' : '00',
            mblShow: this.showOptions.includes('mblShow') ? '01' : '00',
            lang: this.mergeForm.lang === 'zh' ? 'CN' : 'US',
            longsailTitle: this.longsailTitle,
            billType: this.mergeForm.billType
          }
          form.append('data', JSON.stringify(data))
          form.append('reqTime', dateFormat('yyyy/mm/dd HH:MM:SS', new Date()))
          this.loading = true
          this.$store.dispatch('user/import', {
            uri: '/fin/settleOrderBill/mergeDzgBill',
            params: form
          }).then(res => {
            if (res.data.code === 0) {
              this.$message({
                type: 'success',
                message: '提交成功!',
                showClose: true
              })
              this.getData()
              this.importDialogVisible = false
            }
          }).catch(error => {
            console.log(error)
          }).finally(() => {
            this.loading = false
          })
        } else {
          let labels = []
          // if (fields.fileUid) {
          //   labels.push('大掌柜账单')
          //   this.fileUploadIsNull = true
          // } 
          // if (fields.settleOrderNos) { // 边框爆红显示
          //   labels.push('结算单号')
          // } 
          // if (fields.settleUnitBankAcctIds) {
          //   labels.push('银行账号')
          // }
          // if (fields.showOptions) {
          //   labels.push('显示字段')
          // }
          // this.$message({
          //   type: 'error',
          //   message: `${labels.join('、')}必填`,
          //   showClose: true
          // })
        }
      })
    },
    handleDownload(row) {
      this.$message({
        showClose: true,
        message: '导出中，请留意下载的区域',
        duration: 5000
      })
      let fileNo = row.fileNo
      let name = row.fileName
      this.$store.dispatch('finance/downloadBlobFile', {
        uri: '/base/webapi/file/download',
        params: {
          fileNo
        }
      }).then(res => {
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(res)
        link.download = name
        link.click()
      })
    },
    getEmployeeList(queryString) {
      employeeSelectlist({ name: queryString }).then((res) => {
        let list = res.data.map((item) => ({ ...item, label: `${item.cname} (${item.employeeNo})`, value: item.employeeId }))
        this.employeeOptions.splice(0, 1000, ...list)
      })
    },
    longsailTitleVisible(val) {
      if (val && !this.bankAccountList.length) {
        this.$message({
          type: 'error',
          message: '请先选择银行账号',
          showClose: true
        })
      }
    },
    longsailTitleChange(val) {
      let f = this.getLongsailTitleList.find(item => {
        return item.value == val
      })
      if (f) {
        this.longsailTitle = f.label
      }
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
      setTimeout(() => {
        this.showUploadBtn = true
      }, 1000)
      this.settlementDetailForm.fileId = ''
      this.settlementDetailForm.fileNo = ''
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    },
    handleExceed(files, fileList) {
      this.$message.warning(this.$t('Hedge.onlyTips'));
    },
    fileChange(file, fileList) {
      console.log('file.raw:', file.raw)
      console.log('fileList:', fileList)
      this.file = file.raw
      this.showUploadBtn = false
    },
    companyBankAccountList(queryString) {
      let data = {
        // "accountName": queryString // 默认查询出自己分公司的账号
      }
      companyBillBankAccountList(data).then(res => {
        if (res.code === 0) {
          this.bankAccountSelectOptions3 = res.data.map(item => {
            item.value = item.settleUnitBankAcctId
            item.label = item.accountShortName
            return item
          })
        }
      })
    },
    // companyBankAccountChange(value) {
    //   this.bankAccountList = []
    //   value.forEach(id => {
    //     let obj = this.bankAccountSelectOptions3.find(subItem => {
    //       return subItem.settleUnitBankAcctId === id
    //     })
    //     this.bankAccountList.push(obj)
    //     // this.bankAccountList.push({
    //     //   bankName: obj && obj.bankName,
    //     //   bankEname: obj && obj.bankEname,
    //     //   accountNo: obj && obj.accountNo,
    //     //   accountName: obj && obj.accountName,
    //     //   accountEname: obj && obj.accountEname,
    //     //   accountShortName: obj && obj.accountShortName,
    //     //   settleUnitBankAcctId: obj && obj.settleUnitBankAcctId,
    //     //   currency: obj && obj.currency,
    //     //   swiftCode: obj && obj.swiftCode
    //     // })
    //   })
    // },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    handleSizeChange(val){
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val){
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
    }
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    FinanceUploadEmbed
  },
  computed: {
    getLongsailTitleList() {
      let companyNameList = []
      if (this.lang === 'zh') {
        companyNameList = this.bankAccountList.map(item => {
          return item.accountName
        })
        companyNameList = [... new Set(companyNameList)]
        if (companyNameList.length === 0) {
          // companyNameList = ['深圳市长帆国际物流股份有限公司']
        }
      } else if (this.lang === 'en') {
        companyNameList = this.bankAccountList.map(item => {
          return item.accountEname
        })
        companyNameList = [... new Set(companyNameList)]
        if (companyNameList.length === 0) {
          // companyNameList = ['LONG SAIL INTERNATIONAL LOGISTICS CO.,LTD.']
        }
      }
      // if (this.bankAccountSelectChange) {
      //   this.longsailTitle = companyNameList.join(',')
      // }
      let longsailTitleList = []
      if (companyNameList.length) {
        if (companyNameList.length > 1) {
          longsailTitleList.push({
            label: companyNameList.join(','),
            value: 'join'
          })
        }
        companyNameList.forEach((item, index) => {
          longsailTitleList.push({
            label: item,
            value: index
          })
        })
        longsailTitleList.push({
          label: 'LONGSAIL SUPPLY CHAIN CO., LTD.',
          value: 'lsSupply'
        })
      }
      // return companyNameList
      return longsailTitleList
    },
  },
  watch: {
    importDialogVisible(newVal) {
      if (newVal) {
        this.mergeForm = {
          fileUid: '',
          settleOrderNos: '',
          settleUnitBankAcctIds: [],
          lang: 'zh',
          longsailTitle: ''
        }
        this.file = ''
        this.fileList = []
        this.initShowOptions()
        this.$refs.mergeForm && this.$refs.mergeForm.clearValidate()
        this.fileUploadIsNull = false
        this.bankAccountList = []
      }
    }
  }
}
</script>
<style lang="scss">
@import '~@/views/finance/style/bill.scss';
</style>