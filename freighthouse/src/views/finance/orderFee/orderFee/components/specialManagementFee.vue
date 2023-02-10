<template>
  <div class="one-kind-fee"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{moneyTitle2}}</div>
          <div class="money-total" v-for="(item, index) in moneyTotalPay" :key="'moneyTotalPay' + index">
            {{item.currency}}合计：<span :class="{'money-pay-color': moneyTitle2 === '应付' ? true : false}">{{item.sum}}</span>
          </div>
        </div>
        <div class="money-box-right">
          <el-button-group v-if="!isEditPay && !isFinCloseCombined">
            <el-button v-if="checkAuth(pageCode, 'tab-specialManagementFee', 'btn-edit')" class="finance-btn" @click="handleEdit('pay')" size="mini" type="warning">修改</el-button>
          </el-button-group>
          <el-button-group v-show="!hideSaveCnlBtn && isEditPay">
            <el-button class="finance-btn" @click="handleSave" type="primary" size="mini">保存</el-button>
          </el-button-group>
          <el-button-group v-show="!hideSaveCnlBtn && isEditPay">
            <el-button class="finance-btn" @click="handleCancel" size="mini">取消</el-button>
          </el-button-group>
          <!-- <el-button-group>
            <el-button class="finance-btn" @click="handleCustomColumns" size="mini">自定义表头</el-button>
          </el-button-group> -->
          <el-button-group v-if="!isFinCloseCombined">
            <el-button v-if="checkAuth(pageCode, 'tab-specialManagementFee', 'btn-addPay')" class="finance-btn" @click="addPay(null)" size="mini" type="primary">新增应付费用</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth(pageCode, 'tab-specialManagementFee', 'btn-confirmOrderFeePay')" class="finance-btn" @click="confirmOrderFeePrev('pay')" size="mini" type="success">应付确认</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth(pageCode, 'tab-specialManagementFee', 'btn-cancleConfirmOrderFeePay')" class="finance-btn" @click="cancleConfirmOrderFeePrev('pay')" size="mini" type="purple">撤销确认</el-button>
          </el-button-group>
          <el-button-group v-if="!isFinCloseCombined">
            <el-button v-if="checkAuth(pageCode, 'tab-specialManagementFee', 'btn-addPay')" class="finance-btn" @click="handleCopy('pay')" size="mini">复制</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth(pageCode, 'tab-specialManagementFee', 'btn-createSettlement')&&$route.name!=='BookDetail'" class="finance-btn" size="mini" type="primary" @click="createSettlement">生成结算单</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth(pageCode, 'tab-specialManagementFee', 'btn-feeClosedModifyFee') && isFinCloseCombined" class="finance-btn" size="mini" type="primary" @click="openModifyFeeDialog">关账调费</el-button>
          </el-button-group>
          <el-button-group>
            <!-- <el-button class="finance-btn" @click="openSaveTemplate" size="mini">另存模板</el-button>
            <el-button class="finance-btn" @click="alertTemplate" size="mini">选择模板导入</el-button> -->
            <div class="select-template-box" style="margin-left:8px;">
              <el-dropdown trigger="click" @command="handleCommandTemp">
                <span class="el-dropdown-link">
                  选择模板导入<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="'import'">
                    选择模板导入
                  </el-dropdown-item>
                  <el-dropdown-item :command="'save'">
                    另存模板
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <!-- v-if="myTemplateList.length === 0" -->
            <!-- <div v-if="myTemplateList.length > 0" class="select-template-box">
              <el-dropdown trigger="click" @command="handleCommand">
                <span class="el-dropdown-link">
                  选择模板导入
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(item, index) in myTemplateList" :key="'myTemplateList' + index"
                    :command="item.feeTempId">
                    {{item.tempName}}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div> -->
          </el-button-group>
          <!-- <el-button-group>
            <el-button v-if="checkAuth(pageCode, 'tab-specialManagementFee', 'btn-createSettlement')" class="finance-btn" @click="createSettlement" size="mini">生成结算单</el-button>
          </el-button-group> -->
          <el-button-group v-if="!isFinCloseCombined">
            <el-button v-if="checkAuth(pageCode, 'tab-specialManagementFee', 'btn-rowDelete')" class="finance-btn" @click="handleDelete('pay')" size="mini" type="danger">删除</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTable
        :option="option1"
        v-show="showTable1"
        ref="option1"
        @send-multi="sendMulti"/>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns 
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose"/>
    </div>
    <!-- <FeeClosedModifyFeeDialog
      :multiple-selection="multipleSelection"
      :dialog-visible="modifyFeeVisible"
      :is-special-fee="isSpecialFee"
      :air-cargo-states="airCargoStates"
      :container-count="containerCount"
      :tempType="'special'"
      :businessType="businessType" /> -->
    <PreviewDialog :dialogOption="previewDialog" />
    <SpecFeeMngApplyDialog
      :dialog-visible="specFeeMngApplyVisible"
      :fees="updateFees"
      :is-special-fee="isSpecialFee"
      :fee-save-verify-data="feeSaveVerifyData"
      :saveApplyCallback="saveApplyCallback"
      @cancel-edit="cancelEdit" />
    <el-dialog
      title="费用模板新增"
      :visible.sync="feeTemplateVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      class="finance-addfee-template"
      width="604px">
      <div class="modifyfee-detail-info finance-wider-el-input">
        <el-form ref="feeTemplateForm" :model="feeTemplateForm" label-width="80px" size="mini">
          <el-form-item label="模板名称" prop="feeTemplateName"
            :rules="[{required: true, message: '模板名称不能为空', trigger: 'focus'}]">
            <el-input
              v-model="feeTemplateForm.feeTemplateName"
              size="mini"
              placeholder="请输入模板名称"
              maxlength="50"
              show-word-limit>
            </el-input>
        </el-form-item>
        </el-form>
        <p class="finance-addfee-template-tip">最多只能添加{{maxTemplateCount}}个模板，如要添加新模板请删除历史模板</p>
        <!-- <ul class="finance-addfee-template-names">
          <li v-for="(item, index) in myTemplateList" :key="'myTemplateList' + index">
            <span>{{item.tempName}}</span>
            <i class="el-icon-close" @click="deleteTemplate(item.feeTempId)"></i>
          </li>
        </ul> -->
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveTemplate" size="mini">保 存</el-button>
        <el-button @click="feeTemplateVisible = false" size="mini">取 消</el-button>
      </span>
    </el-dialog>
    <div v-if="templateListVisible">
      <el-dialog
        title="选择模板导入"
        :visible.sync="templateListVisible"
        :close-on-click-modal="false"
        width="1000px">
        <UsableFeeTemplate ref="usableFeeTemplate" :tempType="'special'" :useNo="useNo" :businessType="businessType" @set-fee-template="setFeeTemplate" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="confirmFeeTemplate" size="mini" type="primary">确定</el-button>
          <el-button @click="templateListVisible = false" size="mini">关闭</el-button>
        </span>
      </el-dialog>
    </div>
    <el-dialog
      title="修改备注"
      :visible.sync="editRemarkVisible"
      :close-on-click-modal="false"
      custom-class="fin-edit-remark"
      width="540px">
      <div>
        <el-input v-model="rowRemark.remark" type="textarea" :maxlength="1000" show-word-limit />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveRemark" size="mini" type="primary">确定</el-button>
        <el-button @click="editRemarkVisible = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <BizDetailList :bizDetailVisible="bizDetailVisible" />
  </div>
</template>
<script>
import FinanceTable from '../../../components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns/index'
// import FeeClosedModifyFeeDialog from './components/feeClosedModifyFeeDialog'
import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
import { orderFeeList, confirmOrderFee, cancleConfirmOrderFee, saveAsTemplate, myTemplate, deleteTemplate } from '@/api/fin/fee'
import { specFeeSaveVerify, saveOrderSpecialFee } from '@/api/fin/specfee'
import { usableFeeTemplate, getTemplateItem } from '@/api/fin/feeTemp'
import { mixin } from '../mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { orderFeeMixin } from '@/views/finance/orderFee/orderFee/components/components/orderFeeMixin'
// import { decimalFixed2 } from '@/views/finance/utils/finance'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import SpecFeeMngApplyDialog from '@/views/finance/orderFee/orderFee/components/components/specFeeMngApplyDialog'
import UsableFeeTemplate from '@/views/finance/orderFee/feeTemplateList/components/usableFeeTemplate'
import { saveOrderSpecialFee as saveOrderSpecialFeeAdjust } from '@/api/fin/feeAdjust'
import BizDetailList from '@/views/finance/orderFee/orderFee/components/components/bizDetailList'

export default {
  mixins: [mixin, routerMixin, orderFeeMixin],
  props: {
    hideSaveCnlBtn: {
      type: Boolean,
      default: false
    },
    orderInfo: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    let pageCode = '' // this.$route.name === 'SiDetail' ? 'SiDetailFee' : this.$route.name
    if (this.$route.name === 'SiDetail') {
      pageCode = 'SiDetailFee'
    } else {
      pageCode = 'OrderFee'
    }
    return {
      option1: {},
      option2: {},
      isEditPay: false,
      moneyTitle1: '应收',
      moneyTitle2: '应付',
      showTable1: true,
      showTable2: true,
      table1DataBackup: [],
      table2DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      orderNo: '',
      currency: this.$store.state.dict.dictMap.currency,
      moneyTotalReceive: [],
      moneyTotalPay: [],
      modifyFeeVisible: {
        show: false
      },
      multipleSelection: [],
      // isFinCloseCombined: true, // 调试才打开
      feeSettleCompany: null,
      client: null,
      deleteSelection: [],
      timer1: null,
      previewDialog: {
        show: false,
        title: '凭证预览',
        seqNo: '',
      },
      loading: false,
      isSpecialFee: true,
      jointNo: '',
      useNo: '',
      bkgAgent: null, // 订单代理信息（应付费用的默认结算单位）
      containerCount: '',
      pageCode,
      specFeeMngApplyVisible: {
        show: false
      },
      updateFees: [],
      myTemplateList: [],
      feeTemplateVisible: false,
      feeTemplateForm: {
        feeTemplateName: ''
      },
      templateListVisible: false,
      myTemplateList: [],
      maxTemplateCount: 20,
      ship: true,
      air: false,
      rail: false,
      feeSaveVerifyData: {},
      saveApplyCallback: null,
      airCargoStates: {},
    }
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        // {
        //   label: '删除',
        //   type: 'text',
        //   // show: true,
        //   showFn: () => this.checkAuth(this.pageCode, 'tab-specialManagementFee', 'btn-rowDelete'),
        //   action: 'Delete'
        // },
        {
          label: '备注',
          style: {color: '#edb534'},
          type: 'text',
          show: true,
          action: 'Remark'
        },
        {
          label: '详情',
          type: 'text',
          show: true,
          action: 'BizDetail'
        }
      ],
      width: 100,
      // show: !this.isFinCloseCombined
      show: true // 改成批量删除，20211206
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'specialManagementFee',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      sortable: true,
      sortChange: this.sortChange,
      index: {
        show: true
      },
      noCheckWhenEdit: true,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns
      },
      isSort: false,
    })

    this.getOrderNo()
    this.getData()
    this.getOrderMainInfo()
    // this.fetchTemplate() // 现不需请求
    // this.getValidCurrencyList()
  },
  activated() {
    this.getOrderNo()
    if(this.$route.meta.refresh){
      this.$route.meta.refresh = false
      this.getData()
    }
  },
  components: {
    FinanceTable,
    CustomColumns,
    // FeeClosedModifyFeeDialog,
    PreviewDialog,
    SpecFeeMngApplyDialog,
    UsableFeeTemplate,
    BizDetailList
  },
  methods: {
    getData(params) {
      this.loading = true
      let prop = params && params.prop
      if (prop === 'serviceCode') prop = 'serviceName'
      let data = { 
        "orderNo": this.useNo, // this.orderNo,
        "viewGroupType": "Special",
        "isException": "no",
        "columns": this.customColumnsKeys,
        "ascColumns": params && params.order === 'ascending' ? [prop] : [],
        "descColumns": params && params.order === 'descending' ? [prop] : (params && params.order === 'ascending' ? [] : []), // 'createdTime'
        "currPage": 1,
        "pageSize": 1000
      }
      orderFeeList(data).then(res => {
        this.loading = false
        if (res.code === 0) {
          let { configColumns, list, originalCurrencyStat, feeSettleCompany, client, bkgAgent, containerCount = '', maxTemplateCount = 20 } = res.data
          this.feeSettleCompany = feeSettleCompany
          this.client = client
          this.bkgAgent = bkgAgent ? bkgAgent : {}
          this.containerCount = containerCount + ''
          this.maxTemplateCount = maxTemplateCount
          // let columns = ['settleCompName', 'settleCorpName', 'serviceCode', 'feeName', 'feeEnName', 'feeAmt', 'currency', 'remark']
          this.columns = configColumns.length > 0 ? configColumns : this.defaultColumns
          this.columns = [...this.columns]
          // columns = this.customColumnsKeys.length > 0 ? this.customColumnsKeys : this.defaultColumns // 本地开发加上这行，否则注释这行
          let serviceCodeIndex = this.columns.findIndex(item => item === 'serviceCode')
          if (serviceCodeIndex > -1) {
            this.columns.splice(serviceCodeIndex, 1, 'serviceName')
          }
          this.columns = [...new Set(this.columns)]
          this.columns = this.columns.filter(item => item !== 'acctVoucherNos') // 去掉凭证号, 20220907, 如自定义表头含有去掉
          let arr = []
          this.columns.forEach(value => {
            let obj = this.columnsBaseLocal.find(item => {
              return item.prop === value
            })
            if (obj) {
              if (obj.prop === 'feeAmt') { // 将业务费用的金额设置不可输入 || obj.prop === 'unitCount'
                obj = Object.assign({}, obj, {
                  type: 'text'
                })
              } else if (obj.prop === 'receipayType' || obj.prop === 'settleStatus' || obj.prop === 'invoiceStatus' || obj.prop === 'writeoffStatus' || obj.prop === 'settleCycle') {
                obj = Object.assign({}, obj, {
                  readOnly: true
                })
              } else if (obj.prop === 'settleCorpName') {
                obj = Object.assign({}, obj, {
                  querySearch: (queryString, cb, row, item) => {
                    this.selectedOptionItem = ''
                    if (!queryString) return // 为空时不查询
                    this.querySettleUnit({
                      queryString,
                      unitTypes: 'customer,supplier,company',
                      isAdd: true, 
                      isForbid: true,
                      receipayType: row.receipayType,
                    }, cb)
                    // 应无必要
                    // if (!row.serviceCode) {
                    //   return this.$message({
                    //     message: '应付的结算单位，须先选择费用名称、服务项',
                    //     type: 'error',
                    //     duration: 5000,
                    //     showClose: true,
                    //     offset: 160
                    //   })
                    // }
                    // this.queryFinSupplierList({
                    //   queryString,
                    //   serviceCode: row.serviceCode,
                    //   size: 20
                    // }, cb)
                  }
                })
              }
              arr.push(obj)
            }
          })
          let findIndex = arr.findIndex(item => {
            return item.prop === 'feeName'
          })
          list.forEach((item, index) => {
            // item.feeUnit = item.feeUnit.toLowerCase() // 现字段有大写，小写，无法统一处理成小写
            item.settleOrderNos_multiValue = item.settleOrderNos.split(',')
            item.writeoffNos_multiValue = item.writeoffNos.split(',')
            item.settleTimes_multiValue = item.settleTimes.split(',')
            // item.invoiceNos_multiValue = item.invoiceNos.split(',')
            item.payApplySettleNos_multiValue = item.payApplySettleNos.split(',')
            item.payOrderNos_multiValue = item.payOrderNos.split(',')
            item.acctVoucherNos_multiValue = item.acctVoucherNos.split(',').map(subItem => {
              let arr = subItem.split('/')
              return arr[1] ? arr[1] : arr[0]
            })
            item.voucherSeqNos_multiValue = item.acctVoucherNos.split(',').map(subItem => {
              let arr = subItem.split('/')
              return arr[0]
            })
            item.invoiceNos_multiValue = item.invoiceNos.split(',').map(subItem => {
							let arr = subItem.split('/')
							return arr[1] ? arr[1] : arr[0]
						})
						item.invoiceReceivableIds_multiValue = item.invoiceNos.split(',').map(subItem => {
							let arr = subItem.split('/')
							return arr[0]
						})
          })
          let data = list
          if (!this.isSort) {
            this.option1.columns = arr
          }
          this.isSort = false
          this.option1.data = data
          // this.computeMoneyTotal(originalCurrencyStat)
          this.computeMoneyTotalFront({'pay': 'option1', 'receive': 'option2'})
          // 备份一下原始的数据，以备删除
          // this.table1DataBackup = [
          //   ... this.option1.data
          // ]
          this.table1DataBackup = JSON.parse(JSON.stringify(this.option1.data))
        }
      }).catch(err => {
        console.log(err)
        this.loading = false
      })
    },
    getOrderNo() {
      this.orderNo = this.$route.query.orderNo
      this.jointNo = this.$route.query.jointNo
      this.useNo = this.jointNo ? this.jointNo : this.orderNo
      let businessBroad = this.$route.query.businessBroad
			businessBroad = businessBroad ? businessBroad : ''
			this.ship = businessBroad.includes('ship') || !businessBroad
			this.air = businessBroad.includes('air') ? true : false
			this.rail = businessBroad.includes('rail') ? true : false
    },
    handleCommandTemp(command) {
      if (command === 'import') {
        this.alertTemplate()
      } else if (command === 'save') {
        this.openSaveTemplate()
      }
    },
    openSaveTemplate() {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          type: 'error',
          message: '请先选择费用！',
          showClose: true
        })
        return
      }
      let bool = this.multipleSelection1.some(item => {
        return !item.orderFeeId || item.edit
      })
      if (bool) {
        this.$message({
          type: 'error',
          message: '未保存的费用，不能另存模板!',
          showClose: true
        })
        return
      }
      this.feeTemplateVisible = true
    },
    saveTemplate() {
      this.$refs.feeTemplateForm.validate(valid => {
        if (valid) {
          let orderFeeIds = []
          this.multipleSelection1.forEach(item => {
            orderFeeIds.push(item.orderFeeId)
          })
          let data = {
            "orderNo": this.useNo, // this.orderNo,
            "name": this.feeTemplateForm.feeTemplateName,
            orderFeeIds,
            "tempType": "special"
          }
          saveAsTemplate(data).then(res => {
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: '另存模板成功!',
                showClose: true
              })
              // this.fetchTemplate()
              this.feeTemplateVisible = false
            } else {
              this.$message({
                type: 'error',
                message: '另存模板失败!',
                showClose: true
              })
            }
          })
        }
      })
    },
    fetchTemplate() {
      let data = {
        "tempType": "special",
        // "businessType":"", // 可不加
      }
      // myTemplate(data).then(res => {
      usableFeeTemplate(data).then(res => {
        if (res.code === 0) {
          this.myTemplateList = res.data
        }
      })
    },
    confirmFeeTemplate() {
      this.$refs.usableFeeTemplate.confirmFeeTemplate()
    },
    setFeeTemplate(data) {
      this.templateListVisible = false
      let param = null
      if (data[0].tempNo) {
        param = data[0].tempNo
      } else {
        param = data
      }
      // let tempNo = data[0].tempNo
      this.handleCommand(param) // tempNo
    },
    alertTemplate() {
      // if (this.myTemplateList.length === 0) {
      //   return this.$message({
      //     type: 'error',
      //     message: '当前未有模板，请先另存模板',
      //     showClose: true
      //   })
      // } else {
      //   this.templateListVisible = true
      // }
      this.templateListVisible = true // 不管有否，都显示
    },
    deleteTemplate(feeTempId) {
      this.$confirm('是否确认删除模板？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          feeTempId
        }
        deleteTemplate(data).then(res => {
          if (res.code === 0) {
            this.myTemplateList = this.myTemplateList.filter(item => {
              return item.feeTempId !== feeTempId
            })
            this.$message({
              type: 'success',
              message: '删除成功！',
              showClose: true
            })
          }
        })
      }).catch(() => {         
      })
    },
    handleCommand(command) {
      if (typeof command === 'string') {
        this.$store.dispatch('dict/queryBusinessServiceList', {}).then(data => {
        })
        let data = { 
          // "feeTempId": command
          tempNo: command,
          orderNo: this.useNo
        }
        // getTemplateFee(data).then(res => {
        getTemplateItem(data).then(res => {
          if (res.code === 0) {
            this.handleTemplateItem(res.data)
            if (res.data && res.data.length === 0) {
            // if (res.data.feeTemplateItemList && res.data.feeTemplateItemList.length === 0) {
              this.$message({
                message: '该模板无数据，无法导入费用！',
                type: 'error',
                showClose: true
              })
            }
            this.templateListVisible = false
          }
        })
      } else {
        this.handleTemplateItem(command)
      }
      
    },
    handleTemplateItem(data) {
      data.forEach(item => {
      // res.data.feeTemplateItemList.forEach(item => {
        // 处理有的数据返回大写的问题
        // item.feeUnit = item.feeUnit.toLowerCase() // 现字段有大写，小写，无法统一处理成小写
        // 如果模板里面的服务项不在订单的服务项里面
        // 放开，不这样处理
        // if (!this.$store.state.dict.dictMap.serviceCode.find(subItem => {
        //   if (subItem.value === item.serviceCode) {
        //     item.serviceName = subItem.label
        //   }
        //   return subItem.value === item.serviceCode
        // })) {
        //   item.serviceCode = ''
        //   item.serviceName = ''
        // }
        let feeItemList = []
        this.querySpecialFeeItemList({ orderNo: this.useNo, receipayType: item.receipayType, queryString: '', size: 10000, operation: 'add' }).then(data => { // orderNo: this.$store.state.finance.orderNo, businessType: this.dictMap['orderFeeBusinessType'], serviceCode: item.serviceCode,
          feeItemList = data
          let find = feeItemList.find(fee => {
            return fee.feeCode === item.feeCode
          })
          if (find) {
            item.orderServices = find.orderServices
            if (item.orderServices && item.orderServices.length) {
              if (item.orderServices.some(s => {
                if (s.serviceCode === item.serviceCode) {
                  item.serviceName = s.serviceName
                }
                return s.serviceCode === item.serviceCode
              })) {
              } else if (item.orderServices.length === 1) {
                item.serviceCode = item.orderServices[0].serviceCode
                item.serviceName = item.orderServices[0].serviceName
              } else {
                item.serviceCode = ''
                item.serviceName = ''
              }
            } else {
              item.serviceCode = ''
              item.serviceName = ''
            }
          }
        })
        this.setUnitCount(item, this.containerCount)
        if (item.receipayType === 'receive') {
          this.addReceive(item)
        } else if (item.receipayType === 'pay') {
          this.addPay(item, true)
        }
      })
    },
    addPay(feeItem, isTemplate) {
      if (this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: '订单已预关账，不能新增费用!',
          showClose: true
        })
        return
      }
      let obj = { canEdit: true }
      if (feeItem) {
        obj = feeItem
        delete obj.orderFeeId
        // if (isTemplate) {
        //   obj['settleCorpName'] = this.bkgAgent.unitName ? this.bkgAgent.unitName : ''
        //   obj['settleCorpCode'] = this.bkgAgent.unitCode ? this.bkgAgent.unitCode : ''
        //   obj['unitCount'] = this.containerCount // ''
        // }
      } else {
        this.option1.columns.forEach(item => {
          obj[item.prop] = ''
        })
        // obj['settleCompName'] = this.$store.state.user.userInfo.settleCompanyName // 带出分公司显示，但分公司code不传后台
        // obj['settleCorpName'] = this.client ? this.client.unitName : '' // client其实是委托单位，并不是应付的结算单位
        // obj['settleCorpCode'] = this.client ? this.client.unitCode : ''
        obj['settleCorpName'] = this.bkgAgent.unitName ? this.bkgAgent.unitName : ''
        obj['settleCorpCode'] = this.bkgAgent.unitCode ? this.bkgAgent.unitCode : ''
        obj['unitCount'] = '' // this.containerCount ---> 改成根据计费单位来决定
        obj['unitPrice'] = ''
        obj['receipayType'] = 'pay'
      }
      obj['settleCompName'] = this.feeSettleCompany ? this.feeSettleCompany.settleCompName : this.$store.state.user.userInfo.settleCompanyName // 带出分公司的显示，但分公司code不传后台
      obj['settleCompCode'] = this.feeSettleCompany ? this.feeSettleCompany.settleCompCode : this.$store.state.user.userInfo.settleCompanyCode
      obj['feeAmt'] = ''
      obj.edit = true
      obj.isAddFee = true
      obj.index = this.option1.data.length
      this.option1.data.unshift(obj)
      this.option1.edit = true
      this.isEditPay = true
      this.isAddPay = true
      this.getFeesCanEdit(this.option1.data, false, true)
    },
    addReceive() {
    },
    createSettlement() {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: '请选择需要生成结算单的费用！',
          type: 'error',
          showClose: true
        })
        return
      }
      let feeIds = this.multipleSelection1.map(item => {
        return item.feeId
      })

      // let _this = this
      // this.isJumpRouteFromPage = true
      // Vue.prototype.$NotRouteBeforeRouteLeave = function(to, from) {
      //   _this.commonRoute(to, from)
      // }
      // this.$router.push({
      //   path: '/finance/settlement/createSettlement',
      //   query: {
      //     source: 'createSettlementFromOrderFeeIds',
      //     feeIds: JSON.stringify(feeIds),
      //     orderNo: this.orderNo
      //   }
      // })
      let routeUrl = this.$router.resolve({
        name: 'CreateSettlement',
        query: {
          source: 'createSettlementFromOrderFeeIds',
          feeIds: JSON.stringify(feeIds), // JSON.stringify(feeIds1.concat(feeIds2)),
          // feeSourceType,
          orderNo: this.orderNo,
          newWdo: true
        }
      })
      window.open(routeUrl.href, '_blank')
    },
    // getValidCurrencyList() {
    //   this.$store.dispatch('dict/currencyList', {code: '', state: 'valid'})
    // },
    // sendMulti(data, option) {
    //   // console.log(data, option)
    //   if (option === this.option1) this.multipleSelection1 = data
    //   // if (option === this.option2) this.multipleSelection2 = data
    //   this.computeMoneyTotalFront({'pay': 'option1', 'receive': 'option2'})
    // },
    sendMulti(data, option) {
      // console.log(data, option.data)
      if (option === this.option1) this.multipleSelection1 = data
      // 当处于总的编辑状态下
      if (this.isEditPay) {
        // 改成按点击来判断，不按勾选来判断
        option.data.forEach(item => {
          if (item.edit && item.$isRowClick && !item.isAddFee) { // 如果费用处于编辑状态，点击行，退出编辑，使费用重置回原来的数据
            let tableDataBackup = option.id === 'option1' ? this.table1DataBackup : this.table2DataBackup
            let rowBackup = tableDataBackup.find(row => {
              return row.feeId === item.feeId
            })
            if (rowBackup) {
              item = Object.assign(item, rowBackup)
            }
            this.$set(item, 'edit', false)
          } else if (item.canEdit && item.$isRowClick && !item.$isRowDelete) { // 如果点击的费用是可编辑的且没有正在删除，使其处于可编辑状态
            this.$set(item, 'edit', true)
            this.$set(option, 'edit', true) // 将option的edit置为可编辑，因如果编辑option1，option2没编辑，此时点击option2的费用不起作用
          } else if (item.$isRowClick && item.$isRowDelete) { // 点击删除中的费用，去除删除状态
            this.$set(item, '$isRowDelete', false)
          }
        })
      }
      this.computeMoneyTotalFront({ 'pay': 'option1' })
    },
    // handleEdit(type) {
    //   if (type === 'edit') {
    //     if (this.isFinCloseCombined) {
    //       this.$message({
    //         type: 'error',
    //         message: '订单已关账，不能修改费用!',
    //         showClose: true
    //       })
    //       return
    //     }
    //     // 改为显示可修改的费用
    //     if (this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0) {
    //       this.option1.data.forEach(item => {
    //         let bool = this.editGuard([item], false)
    //         if (bool) {
    //           item.canEdit = true
    //           this.multipleSelection1.push(item)
    //         } else {
    //           item.canEdit = false
    //         }
    //       })
    //     } else {
    //       this.getFeesCanEdit()
    //     }
    //     let someCanEdit = this.multipleSelection1.some(item => {
    //       return item.canEdit
    //     }) || this.multipleSelection2.some(item => {
    //       return item.canEdit
    //     })
    //     if (!someCanEdit) {
    //       this.$message({
    //         message:  '没有可修改的费用',
    //         type: 'error',
    //         showClose: true
    //       })
    //     } else { // 如果有可编辑的费用
    //       this.option1.edit = true // 如果有可编辑的费用，两个edit都置为true，因为开始可能没勾选某一个option的行，但后面点击它的某行时，我们需要进入编辑状态
    //       if (this.multipleSelection1.length > 0) {
    //         this.table1DataBackup = JSON.parse(JSON.stringify(this.option1.data)) // 备份数据，用于修改恢复
    //         this.option1.data.forEach(item => {
    //           item.edit = false
    //         })
    //         this.multipleSelection1.forEach(item => {
    //           if (item.canEdit) {
    //             item.edit = true
    //           } else {
    //           }
    //         })
    //         this.isEditPay = true
    //       }
    //     }
    //   }
    //   if (type === 'cancel') {
    //     this.option1.data = JSON.parse(JSON.stringify(this.table1DataBackup))
    //     this.multipleSelection1 = []
    //     this.isAddReceive = false
    //     this.isAddPay = false
    //     this.option1.edit = false
    //     this.isEditPay = false
    //   }
    //   if (type === 'save') {
    //     let arr1 = this.option1.data.filter(item => {
    //       item.receipayType = 'pay' // 'receive
    //       return item.edit
    //     })
    //     let arr = arr1
    //     arr.forEach(item => {
    //       item.operation = 'update'
    //     })

    //     // 改成通过$isRowDelete标识来获取
    //     let deleteSelectionExist = this.option1.data.filter(item => {
    //       return item.$isRowDelete
    //     })
    //     deleteSelectionExist.forEach(item => {
    //       item.operation = 'delete'
    //     })
    //     arr = arr.concat(deleteSelectionExist)
    //     if (arr.length === 0) {
    //       this.option1.edit = false
    //       this.isEditPay = false
    //       this.setFeeSaveSuccessCount(1) // 用于补料费用等跨系统的费用保存状态设置
    //     } else {
    //       this.saveOrderSpecialFee(arr)
    //     }
    //   }
    // },
    handleEdit(type) {
      if (this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: '订单已关账，不能修改费用!',
          showClose: true
        })
        return
      }
      if (type === 'pay') {
        // 改为显示可修改的费用
        if (this.multipleSelection1.length === 0) {
          this.option1.data.forEach(item => {
            let bool = this.editGuard([item], false)
            if (bool) {
              item.canEdit = true
              this.multipleSelection1.push(item)
            } else {
              item.canEdit = false
            }
          })
        } else {
        }
        if (!this.getFeesCanEdit(this.multipleSelection1)) {
        } else { // 如果有可修改的费用
          this.option1.edit = true
          if (this.multipleSelection1.length > 0) {
            this.table1DataBackup = JSON.parse(JSON.stringify(this.option1.data))
            this.option1.data.forEach(item => {
              item.edit = false
            })
            this.multipleSelection1.forEach(item => {
              if (item.canEdit) {
                item.edit = true
              } else {
              }
            })
            this.isEditPay = true
          }
        }
      }
    },
    handleSave() {
      let arr1 = this.option1.data.filter(item => {
        item.receipayType = 'pay'
        return item.edit
      })
      let arr = arr1
      arr.forEach(item => {
        item.operation = 'update'
      })
      // 改成通过$isRowDelete标识来获取
      let deleteSelectionExist = this.option1.data.filter(item => {
        return item.$isRowDelete
      })
      deleteSelectionExist.forEach(item => {
        item.operation = 'delete'
      })
      this.$set(this.option1, 'showIsError', true) // 用于显示必填
      arr = arr.concat(deleteSelectionExist)
      if (arr.length === 0) {
        this.option1.edit = false
        this.isEditPay = false
        this.setFeeSaveSuccessCount(1) // 用于补料费用等跨系统的费用保存状态设置
      } else {
        this.saveOrderSpecialFee(arr)
      }
    },
    saveOrderSpecialFee(arr) {
      // this.specFeeMngApplyVisible.show = true // 开发调试用
      // return
      let data = {
        "orderNo": this.useNo, // this.orderNo,
        "jointNo": this.jointNo, // 20220124负数开发额外增加
        "fees": arr
      }
      if (!this.validate(data, ['orderNo'])) {
        return
      }
      if (!this.validate(data.fees)) {
        return
      }
      let validateData = data.fees.filter(item => {
        return item.operation !== 'delete'
      })
      if (validateData && validateData.length > 0) {
        if (!this.validate(data.fees, ['feeName', 'feeCode', 'serviceName', 'serviceCode', 'settleCorpCode', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
          return
        }
      }
      try {
        data.fees.forEach(item => {
          if (!this.validateMoney(item.unitPrice)) {
            throw new Error('ending')
          }
          let unitPrice = Number(item.unitPrice)
          item.unitCount = Number(item.unitCount) // 防止后台报错
          let unitCount = item.unitCount
          item.feeAmt = new LSnum(unitPrice).times(unitCount).toNum(2) // decimalFixed2(unitPrice * item.unitCount) // 提交时再算一遍，防止后台未计算直接录入数据
          if (item.unitPrice < 0 && item.operation !== 'delete') {
            if (item.receipayType === 'pay') {
              if ((!item.negativeType || !item.negativeFollowerId) && !['TZFY'].includes(item.feeCode)) {
                this.$message({
                  message: `录入应付负数，须录入负数类型和跟进人`,
                  type: 'error',
                  duration: 5000,
                  showClose: true,
                  offset: 108
                })
                this.$set(item, 'negativeType_required', true) // 用于显示负数类型必填
                this.$set(item, 'negativeFollowerId_required', true) // 用于显示负数跟进人必填
                throw new Error('ending')
              }
            }
          } else if (item.unitPrice >= 0 && item.operation !== 'delete') {
            if (item.receipayType === 'pay') {
              if (item.negativeType || item.negativeFollowerId) {
                this.$message({
                  message: `录入应付正数，无需录入负数类型和跟进人`,
                  type: 'error',
                  showClose: true,
                  offset: 108
                })
                throw new Error('ending')
              }
            }
          }
          if (item.feeCode === 'TZFY' && item.unitPrice >= 0) {
            this.$message({
              message: '“调整费用”须录入负数',
              type: 'error',
              showClose: true,
              offset: 108
            })
            throw new Error('ending')
          }
        })
      } catch (e) {
        if (e.message === 'ending') {
          console.log(e.message)
          return
        }
      }
      let data2 = {
        orderNo: this.orderNo,
        jointNo: this.jointNo,
        fees: data.fees.reverse()
      }
      this.loading = true
      specFeeSaveVerify(data2).then(res => {
        if (res.code === 0) {
          let validateData = data2.fees.filter(item => {
            return item.operation !== 'delete'
          })
          if (validateData && validateData.length > 0) {
            // 再次校验非空
            if (!this.validate(validateData, ['feeName', 'feeCode', 'serviceName', 'serviceCode', 'settleCorpCode', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
              return
            }
          }
          if (res.data.applyAble === 'no') {
            // let validateData = data2.fees.filter(item => {
            //   return item.operation !== 'delete'
            // })
            // if (validateData && validateData.length > 0) {
            //   // 再次校验非空
            //   if (!this.validate(validateData, ['feeName', 'feeCode', 'serviceName', 'serviceCode', 'settleCorpCode', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
            //     return
            //   }
            // }
            this.loading = true
            saveOrderSpecialFee(data).then(res => {
              this.$message({
                message: '保存成功！',
                type: 'success',
                showClose: true
              })
              this.option1.edit = false
              this.isEditPay = false
              this.option1.showIsError = false
              this.deleteSelection = []
              this.getData()
              this.setFeeSaveSuccessCount(2) // 用于补料费用等跨系统的费用保存状态设置
              // 从专项管理费列表进入此页面
              this.jumpRouteFromToList.forEach(item => {
                if(item.from.name === 'MySpecialList'){
                  item.from.meta.refresh = true
                } 
              })
              // 未从专项管理费列表进入此页面，tabs有专项管理列表
              this.$store.state.tagsView.visitedViews.forEach(item => {
                if(item.name === 'MySpecialList'){
                  item.meta.refresh = true
                }
              })
            }).catch(err => {
              console.log(err)
              this.setFeeSaveErrorCount(1) // 用于补料费用等跨系统的费用保存状态设置
            }).finally(() => {
              this.loading = false
            })
          } else if (res.data.applyAble === 'yes') {
            this.updateFees = data.fees
            this.feeSaveVerifyData = res.data
            this.specFeeMngApplyVisible.show = true
            let $this = this
            this.saveApplyCallback = (function() {
              return function() {
                let data2 = {
                  orderNo: $this.orderNo,
                  jointNo: $this.jointNo,
                  remark: $this.feeSaveVerifyData.remark,
                  applyType: $this.feeSaveVerifyData.applyType,
                  fees: $this.feeSaveVerifyData.fees
                }
                // let validateData = data2.fees.filter(item => {
                //   return item.operation !== 'delete'
                // })
                // if (validateData && validateData.length > 0) {
                //   // 再次校验非空
                //   if (!$this.validate(validateData, ['feeName', 'feeCode', 'serviceName', 'serviceCode', 'settleCorpCode', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
                //     return new Promise((resolve, reject) => {
                //       resolve()
                //     })
                //   }
                // }
                return saveOrderSpecialFeeAdjust(data2).then(res => { // specFeeMngApply
                  $this.$message({
                    message: '提交成功',
                    type: 'success',
                    showClose: true
                  })
                  $this.option1.edit = false
                  $this.isEditPay = false
                  this.option1.showIsError = false
                  $this.deleteSelection = []
                  $this.getData()
                })
              }
            })()
          }
        }                
      }).finally(() => {
        this.loading = false
      })
    },
    handleCancel() {
      this.option1.data = JSON.parse(JSON.stringify(this.table1DataBackup))
      this.multipleSelection1 = []
      this.isAddReceive = false
      this.isAddPay = false
      this.option1.edit = false
      this.isEditPay = false
      this.option1.showIsError = false
    },
    handleCopy(type) {
      if (this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: '订单已关账，不能复制费用!',
          showClose: true
        })
        return
      }
      if (type === 'pay') {
        if (!this.multipleSelection1.length) {
          this.$message({
            type: 'error',
            message: '请至少选择一条应付费用进行复制',
            showClose: true
          })
          return
        }
        this.multipleSelection1.forEach(row => {
          this.copySingleFee(row)
        })
      }
    },
    copySingleFee(row) {
      let { settleCorpName, settleCorpCode, settleCompName, settleCompCode, feeName, feeCode, feeEnName, serviceName, serviceCode, receipayType, prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency, taxRate } = row
      let feeItem = { settleCorpName, settleCorpCode, settleCompName, settleCompCode, feeName, feeCode, feeEnName, serviceName, serviceCode, receipayType, prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency }
      if (receipayType === 'pay') { // if (option.id === 'option2')
        feeItem.taxRate = taxRate
        this.addPay(feeItem)
      }
    },
    // handleDelete($index, row, option) {
    //   if (this.isFinCloseCombined) {
    //     this.$message({
    //       type: 'error',
    //       message: '订单已关账，不能删除费用!',
    //       showClose: true
    //     })
    //     return
    //   }
    //   if (row.isAddFee) { // 新增的费用从列表删除
    //     option.data.splice($index, 1)
    //   } else { // 已存在的费用，显示删除的划线
    //     let bool = this.editGuard([row], true)
    //     if (!bool) return
    //     row.edit = false
    //     this.$set(row, '$isRowDelete', !row.$isRowDelete)
    //   }
    //   this.isEditPay = true
    //   this.getFeesCanEdit()
    // },
    handleDelete(type) {
      if (this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: '订单已关账，不能删除费用!',
          showClose: true
        })
        return
      }
      if (type === 'pay') {
        if (!this.multipleSelection1.length) {
          this.$message({
            type: 'error',
            message: '请至少选择一条应付费用进行删除',
            showClose: true
          })
          return
        }
        this.getFeesCanEdit(this.multipleSelection1)
        this.multipleSelection1.forEach(row => {
          let $index = this.option1.data.findIndex(item => item === row)
          this.deleteSingleFee($index, row, this.option1)
        })
        this.$nextTick(() => {
          let m = this.multipleSelection1
          for(let i = 0; i < m.length; i++) {
            if (m[i].isAddFee) {
              m.splice(i--, 1)
            }
          }
        })
      }
    },
    deleteSingleFee($index, row, option) {
      if (row.isAddFee) { // 新增的费用从列表删除
        option.data.splice($index, 1)
      } else { // 已存在的费用，显示删除的划线
        let bool = this.editGuard([row], false) // true
        if (!bool) return
        row.edit = false
        this.$set(row, '$isRowDelete', !row.$isRowDelete)
      }
      this.isEditPay = true
      // this.getFeesCanEdit()
    },
    cancelEdit() {
      this.option1.data = JSON.parse(JSON.stringify(this.table1DataBackup))
      this.multipleSelection1 = []
      this.isAddReceive = false
      this.isAddPay = false
      this.option1.edit = false
      this.isEditPay = false
    },
    // 获取各个费用的可编辑状态，用于点击这些费用时是否进入编辑
    getFeesCanEdit (data, showMessage = false, noSomeCanEdit) {
      // this.option1.data.forEach(item => {
      //   let bool = this.editGuard([item], showMessage)
      //   if (bool) {
      //     item.canEdit = true
      //   } else {
      //     item.canEdit = false
      //   }
      // })
      data.forEach(item => {
        let bool = this.editGuard([item], false)
        if (bool) {
          item.canEdit = true
        } else {
          item.canEdit = false
        }
      })
      if (!noSomeCanEdit) {
        let someCanEdit = data.some(item => {
          return item.canEdit || item.isAddFee // 复制的费用不受限
        })
        if (!someCanEdit) {
          this.$message({
            message: `因已进入结算或已确认或已关账，没有可修改的费用`,
            type: 'error',
            showClose: true,
            duration: 4000
          })
          return false
        } else {
          return true
        }
      }
    },
    openModifyFeeDialog() {
      // this.modifyFeeVisible.show = true // 开发调试用
      // return
      if (!this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: '订单未预关账，不能申请关账调费!',
          showClose: true
        })
        return
      }
      this.multipleSelection = this.multipleSelection1.concat(this.multipleSelection2)
      // this.modifyFeeVisible.show = true
      let modifyFeeProps = {
        multipleSelection: this.multipleSelection,
        dialogVisible: this.modifyFeeVisible,
        isSpecialFee: true,
        airCargoStates: this.airCargoStates,
        containerCount: this.containerCount,
        tempType: 'special',
        businessType: this.businessType,
        orderNo: this.orderNo,
        jointNo: this.jointNo,
        businessBroad: this.$route.query.businessBroad || this.businessType2
      }
      let finLStorage = localStorage.getItem('finLStorage')
      finLStorage = finLStorage ? JSON.parse(finLStorage) : {}
      finLStorage.modifyFeeProps = modifyFeeProps
      localStorage.setItem('finLStorage', JSON.stringify(finLStorage))
      let routeUrl = this.$router.resolve({
        name: 'FeeClosedModifyFeeApply'
      })
      window.open(routeUrl.href, '_blank')
    },
    confirmOrderFeePrev(receipayType) {
      if (this.isEditPay) {
        this.$message({
          message: '请先保存费用，再进行操作！',
          type: 'error',
          showClose: true
        })
        return
      }
      if (this.option1.data && this.option1.data.length === 0) { // 专项管理费的option1, multipleSelection1为应付
        this.$message({
          message: '无费用可确认！',
          type: 'error',
          showClose: true
        })
        return
      }
      if (this.multipleSelection1.length === 0) {
        return this.$message({
          message: '请选择需要确认的费用！',
          type: 'error',
          showClose: true
        })
        // this.$confirm('是否确认全部应付？', '提示', {
        //   confirmButtonText: '确定',
        //   cancelButtonText: '取消',
        //   type: 'warning'
        // }).then(() => {
        //   this.confirmOrderFee(receipayType, true)
        // }).catch(() => {         
        // })
      } else {
        this.confirmOrderFee(receipayType, false)
      }
    },
    confirmOrderFee(receipayType, noSelect) {
      let orderFeeIds = []
      if (receipayType === 'receive') {
        if (noSelect) {
          if (!this.validateFinDate(this.option2.data)) return
          this.option2.data.forEach(item => {
            orderFeeIds.push(item.orderFeeId)
          })
        } else {
          if (!this.validateFinDate(this.multipleSelection2)) return
          this.multipleSelection2.forEach(item => {
            orderFeeIds.push(item.orderFeeId)
          })
        }
      } else if (receipayType === 'pay') {
        if (noSelect) {
          if (!this.validateFinDate(this.option1.data)) return
          this.option1.data.forEach(item => {
            orderFeeIds.push(item.orderFeeId)
          })
        } else {
          if (!this.validateFinDate(this.multipleSelection1)) return
          this.multipleSelection1.forEach(item => {
            orderFeeIds.push(item.orderFeeId)
          })
        }
      }
      let data = { 
        "orderNo": this.useNo, // this.orderNo,
        "payOrReceive": receipayType,
        orderFeeIds
      }
      confirmOrderFee(data).then(res => {
        if (res.code === 0) {
          this.$message({
            message: `确认${receipayType === 'receive' ? '应收' : '应付'}成功！`,
            type: 'success',
            showClose: true
          })
          this.getData()
        } else {
          this.$message({
            message: `确认${receipayType === 'receive' ? '应收' : '应付'}失败！`,
            type: 'error',
            showClose: true
          });
        }
      })
    },
    validateFinDate(data) {
      try {
        data.forEach(item => {
          if (!item.finDate) {
            this.$message({ 
              message: '无财务日期的费用，不能进行费用确认！',
              type: 'error',
              showClose: true
            })
            throw new Error('ending')
          }
        })
        return true
      } catch(err) {
        if (err.message === 'ending') {
          return false
        }
      }
    },
    cancleConfirmOrderFeePrev(receipayType) {
      if (receipayType === 'pay') {
        if (this.isEditPay) {
          this.$message({ 
            message: '请先保存费用，再进行操作！',
            type: 'error',
            showClose: true
          })
          return
        }
        if (this.option1.data && this.option1.data.length === 0) {
          this.$message({
            message: '无费用可撤销确认！',
            type: 'error',
            showClose: true
          })
          return
        }
        if (this.multipleSelection1.length === 0) {
          return this.$message({
            message: '需勾选费用进行撤销确认！',
            type: 'error',
            showClose: true
          })
        } else {
          let bool = this.multipleSelection1.some(item => {
            return item.confirmStatus === 'no'
          })
          if (bool) {
            return this.$message({
              message: '包含未确认的费用，不能撤销确认',
              type: 'error',
              showClose: true
            })
          }
          bool = this.multipleSelection1.some(item => {
            return item.precloseStatus === 'yes' || item.closeStatus === 'yes' || item.settleLock === 'lock' || item.finUseStatus === 'yes'
          })
          if (bool) {
            return this.$message({
              message: '已进入结算或已关账的费用，不能撤销确认',
              type: 'error',
              showClose: true
            })
          }
          this.$confirm('是否确认撤销该费用？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.cancleConfirmOrderFee(receipayType, false)
          }).catch((err) => {
            console.log(err)
          })
        }
      }
    },
    cancleConfirmOrderFee(receipayType) {
      let orderFeeIds = []
      if (receipayType === 'pay') {
        this.multipleSelection1.forEach(item => {
          orderFeeIds.push(item.orderFeeId)
        })
      }
      let data = { 
        orderNo: this.useNo, // this.orderNo,
        payOrReceive: receipayType,
        orderFeeIds
      }
      cancleConfirmOrderFee(data).then(res => {
        if (res.code === 0) {
          this.$message({
            message: '撤销成功！',
            type: 'success',
            showClose: true
          })
          this.getData()
        }
      })
    },
    sortChange(column, prop, order) {
      if (this.isEditPay) {
        this.$message({
          type: 'error',
          message: '请先保存数据！',
          showClose: true
        })
        return
      }
      this.isSort = true
      this.getData({prop, order})
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params, { isTab: true, from: 'OrderFee' })
    },
    ...mapMutations('finance', ['setFeeSaveSuccessCount', 'setFeeSaveErrorCount'])
  },
  computed: {
    businessType() {
      return this.orderInfo && this.orderInfo.businessType
    },
    ...mapState({
      defaultColumns: state => state.finance.columns.defaultColumns,
      columnsBase: state => state.finance.columns.columnsBase,
      isFinCloseCombined: state => state.finance.isFinCloseCombined
    })
  },
  watch: {
    'option1.data': {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          clearTimeout(this.timer1)
          this.timer1 = setTimeout(() => {
            newVal.forEach(row => {
              if (row.edit) {
                let unitPrice = row.unitPrice !== '-' ? Number(row.unitPrice) : 0
                let unitCount = Number(row.unitCount)
                row.feeAmt = new LSnum(unitPrice).times(unitCount).toNum(2) // decimalFixed2(unitPrice * unitCount)
              }
            })
          }, 500)
        }
      },
      deep: true
    },
    feeTemplateVisible(newVal, oldVal) {
      if (newVal) {
        this.feeTemplateForm.feeTemplateName = ''
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.select-template-box {
  float: left;
}
.select-template-box .el-dropdown{
  margin-left: 0;
  margin-bottom: 0;
  border-radius: 0;
  font-size: 12px;
  border-top: 1px solid #DCDFE6; // #D9D9D9;
  border-bottom: 1px solid #DCDFE6; // #D9D9D9;
  border-left: none;
  border-right: none;
}
.select-template-box:last-child .el-dropdown {
  border-right: 1px solid #DCDFE6;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
}
.select-template-box:first-child .el-dropdown {
  border-left: 1px solid #DCDFE6;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
}
.select-template-box:hover .el-dropdown {
  background: rgb(236, 245, 255);
  color: rgb(64, 158, 255);
}
.select-template-box .el-dropdown-link {
  cursor: pointer;
  padding: 0 7px;
  line-height: 18px;
}
.select-template-box .el-dropdown-link:focus{
  outline: none;
}
</style>