<template>
<div class="finance-page prepay-detail"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="finance-approve-detail finance-detail-page">
      <div class="money-box money-box-border-bottom" style="background: #ffffff">
        <div class="money-box-left">
          <div class="money-title">{{$t('PayApplyList.refundApplyDetail')}}</div>
        </div>
        <div class="money-box-right">
            <el-button  @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div>
    </div>
    <div class="order-detail">
    <div class="finance-approve-detail">
      <div class="finance-approve-btns-box">
        <div class="finance-approve-btns-left">{{$t('PayApplyList.recvDetail')}}</div>
      </div>
      <DetailDiv   :label="$t('PayApplyList.refundApplyNo')" :content="infoData.applyNo"/>
      <DetailDiv   :label="$t('PayApplyList.associatePayNo')"  :isSlot="true">
        <span style="color:#1890ff;cursor:pointer;" @click="jumpToRoute('OrderDetails', infoData.payOrderNo)">{{infoData.payOrderNo}}</span>
      </DetailDiv>
      <DetailDiv   :label="$t('PayApplyList.refundApprovalTime')" :content="infoData.createdTime"/>
      <DetailDiv   :label="$t('PayApplyList.refundApprovalTime')" :content="infoData.confirmTime"/>
      <DetailDiv   :label="$t('PayApplyList.realRefundAmt')" :content="infoData.realRefundAmt"/>
      <DetailDiv   :label="$t('PayApplyList.refundCurrency')" :content="infoData.refundCurrency"/>
      <DetailDiv   :label="$t('PayApplyList.refundApplicant')" :content="infoData.createdName"/>
      <DetailDiv   :label="$t('PayApplyList.refundApprover')" :content="infoData.confirmName"/>
      <DetailDiv   :label="$t('PayApplyList.transferFeeAmt')" :content="infoData.transferFeeAmt"/>
      <DetailDiv   :label="$t('PayApplyList.transferFeeCurrency')" :content="infoData.transferFeeCurrency"/>
      <DetailDiv   :label="$t('PayApplyList.handlingFeeBearer')" :content="infoData.transferChargerName" :isTooltip="true"/><!-- 手续费承担人 -->
      <DetailDiv   :label="$t('PayApplyList.refundType')" :content="dictMapObj.refundType[infoData.refundType]"/>
      <DetailDiv   :label="$t('PayApplyList.refundStatus')" :content="dictMapObj.payStatusType[infoData.payStatus]"/><!-- 退款状态：-->
      <DetailDiv   :label="$t('PayApplyList.refundPayApprovalSt')" :content="dictMapObj.auditStatus[infoData.payOrderConfirmStatus]"/><!-- 付款审批状态 -->
      <div class="base-item-column">
        <span style="width: 136px;text-align: right; display: inline-block;">{{$t('PayApplyList.transferFeeAllocOrder')}}：</span><!-- 手续费分摊单号 -->
        <div style="display:inline-block;vertical-align:middle;cursor:pointer;width:126px;">
          <ColumnTipIntegration :item="finBillNoColumn" :row="finBillNoColumnTipRow" />
        </div>
      </div>
      <!-- <DetailDiv   label="我司账号：" :content="infoData.payAccountNo"/> -->
      <DetailDiv :label="$t('PayApplyList.refuseReason')" :content="infoData.refuseReason" :isFull="true"/><!-- 拒绝原因 -->
      <DetailDiv :label="$t('PayApplyList.remark')" :content="infoData.remark" :isFull="true"/><!-- 退款说明 -->
    </div>
    <div class="finance-approve-detail" style="border-top: 1px solid #e9e9e9">
      <div class="finance-approve-btns-box">
        <div class="finance-approve-btns-left">{{$t('PayApplyList.recvRegInfo')}}</div>
        <div class="finance-approve-btns-right">
        </div>
      </div>
      <DetailDiv   :label="$t('Collect.receivableRegNo')" :isSlot="true">
        <span style="color:#1890ff;cursor:pointer;" @click="jumpToRoute('WriteoffRecvDetail', payInfo.receivableRegNo)">{{payInfo.receivableRegNo}}</span>
      </DetailDiv>
      <DetailDiv   :label="$t('PayApplyList.bankSeqNo')" :content="payInfo.bankSeqNo" :isTooltip="true"/><!-- 银行流水号 -->
      <DetailDiv   :label="$t('PayApplyList.receivePayDate')" :content="payInfo.recvDate"/><!-- 收付日期 -->
      <DetailDiv   :label="$t('PayApplyList.ourAccountName')" :content="infoData.payAccountName" :isTooltip="true"/><!-- 我司户名 -->
      <DetailDiv   :label="$t('PayApplyList.ourBankName')" :content="infoData.payBankName"/><!-- 我司开户行 -->
      <DetailDiv   :label="$t('PayApplyList.recvBankName')" :content="payInfo.accountShortName" :isTooltip="true"/><!-- 收款银行 -->
      <DetailDiv   :label="$t('Settle.recvAccountNo')" :content="payInfo.accountNo"/>
      <DetailDiv   :label="$t('PayApplyList.realRecvAmt')" :content="payInfo.realAmt"/>
      <DetailDiv   :label="$t('PayApplyList.recvCurrency')" :content="payInfo.currency"/>
      <DetailDiv   :label="$t('PayApplyList.payAccountName')" :content="payInfo.payAccountName"/><!-- 付款人 -->
      <DetailDiv   :label="$t('PayApplyList.payBankName')" :content="payInfo.payBankName" :isTooltip="true"/><!-- 付款开户行 -->
      <DetailDiv   :label="$t('PayApplyList.payAccountNo')" :content="payInfo.payAccountNo"/>
      <DetailDiv   :label="$t('PayApplyList.payAccountPublicType')" :content="dictMapObj.accountType[payInfo.payAccountPublicType]"/>
      <DetailDiv   :label="$t('FeeList.settleCorp')" :content="payInfo.settleCorpName" :isTooltip="true"/>
      <DetailDiv   :label="$t('PayApplyList.custName')" :content="payInfo.payAccountName" :isTooltip="true"/>
      <DetailDiv   :label="$t('PayApplyList.createdName2')" :content="payInfo.createdName"/>
      <DetailDiv   :label="$t('PayApplyList.createdTime2')" :content="payInfo.createdTime"/>
      <!-- <div class="base-item-column">
        <span style="width: 95px;text-align: right; display: inline-block;">退款委托书：</span>
        <div style="display:inline-block;vertical-align:middle;cursor:pointer;width:160px;">
          <ColumnTipIntegration :item="fileNameColumn" :row="fileNameColumnTipRow" />
        </div>
      </div> -->
      <DetailDiv :label="$t('PayApplyList.refundLetter')+'：'" :isSlot="true" ><!-- 退款委托书 -->
        <span class="detail__content">
          <ColumnTipIntegration :item="fileNameColumn" :row="fileNameColumnTipRow" />
        </span>
      </DetailDiv>
      <DetailDiv :label="$t('Collect.paymentWaterBill')" :isSlot="true">
          <span  v-if="payBankseqFile.trustFileName" class="detail__content">
        <el-tooltip  :content="payBankseqFile.trustFileName" placement="top-start">
            <span style="color: #1890ff;" @click="bankseqFilePaths(payBankseqFile.trustFileNo)">{{ payBankseqFile.trustFileName }}</span>
        </el-tooltip>
          </span>
      </DetailDiv>
      <div class="finance-table-container">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">{{moneyTitle1}}</div>
          </div>
          <div class="money-box-right">
            <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">{{showTable1 ? $t('Common.expand') : $t('Common.collapse')}}<i :class="{'el-icon-arrow-up': showTable1, 'el-icon-arrow-down': !showTable1}"></i></el-button>
          </div>
        </div>
        <FinanceTable
        v-if="!showTable1"
        :option="option1"/>
      </div>
    </div>
  </div>
  </div>
  
</template>
<script>
import { mapGetters } from 'vuex'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapState } from 'vuex'
import { payApplyReceiveRefundInfo } from '@/api/fin/receivableReg'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import ColumnTipIntegration from '@/views/finance/components/financeColumnTip/columnTipIntegration'
import Vue from 'vue'
export default {
  name:'RefundDetail',
  mixins: [mixin,routerMixin],
  data() {
    return {
      loading:false,
      dialogVisible:false,
      multipleSelection:[],
      receivableRegId:0,
      payApplyReceiveRefundId:0,
      fileNameColumn: {} ,
      fileNameColumnTipRow: {},
      finBillNoColumn: {} ,
      finBillNoColumnTipRow: {},
      showTable1:false,
      multipleSelection1: [],
      option1: {},
      moneyTitle1: this.$t('PayApplyList.handlingFee'), // '手续费',
      infoData: {},
      payInfo: {},
      rejectDialogVisible: false,
      payBankseqFile: {},
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'RefundDetail',
      edit: true,
      data: [
        ... this.option.data
      ],
      tips: {
        text: '',
        show: false
      },
      operationBtns: {
        text: '',
        show: false
      },
      selection: {
        show: false
      }
    })
    const columns1 = [
      {
        prop: 'cutType',
        label: this.$t('PayApplyList.transferFeeType'), // '内外扣类型',
        type: 'select',
        propInDict: 'transferFeeType'
      },
      {
        prop: 'currency',
        label: this.$t('FeeList.currency'),
        type: 'select',
        key: 'currency',
        propInDict: 'validCurrency'
      },
      { 
        prop: 'amt', 
        label: this.$t('FeeList.feeAmt'), 
        type: 'text', 
        key: 'amt'
      }
    ]
    this.option1.columns = columns1

    this.fileNameColumn = {
			prop: 'fileName',
			component: 'ColumnTip',
			componentProps: {
				show: false,
				data: [],
				row: {},
				callback: (no, componentProps, index, row) => {
					let fileNo = row.fileNo.split(',')[index]
					this.bankseqFilePaths(fileNo)
				},
			}
		}
    this.finBillNoColumn = {
			prop: 'finBillNo',
			component: 'ColumnTip',
			componentProps: {
				show: false,
				data: [],
				row: {},
				callback: (no, componentProps, index, row) => {
					let finBillNo = row.finBillNo.split(',')[index]
					console.log(finBillNo);
          this.isJumpRouteFromPage = true
          this.$router.push({
            name: 'FinBillListDetail',
            query: {
              finBillNo
            }
          })
				},
			}
		}
  },
  methods: {
    bankseqFilePaths(fileNo){
      // let href = `/base/webapi/file/download?fileNo=${payInfo.trustFilePath}`
      let href = `/base/fileView/preview/${fileNo}/sowoll`
      window.open(href)
    },
    getData() {
      this.loading = true
      payApplyReceiveRefundInfo({applyNo:this.applyNo,payApplyReceiveRefundId:this.payApplyReceiveRefundId}).then(res => {
        if (res.code === 0) {
          this.infoData = res.data

          let { trustFileList,finBillNo } = res.data
          this.payBankseqFile = trustFileList.filter(item => item.trustFileType === 'payBankseqFile')[0] || {}
          trustFileList = trustFileList.filter(item => item.trustFileType === 'payProxyFile')
          let fileNo = trustFileList.map(item=> item.trustFileNo).toString()
          let trustFileName = trustFileList.map(item=> item.trustFileName);
          this.fileNameColumnTipRow = { fileName_multiValue: trustFileName, fileNo }

          let finBillNoName = finBillNo.map(item=> item).toString()
          let finBillNos = finBillNo.map(item=> item)
          this.finBillNoColumnTipRow = { finBillNo_multiValue: finBillNos, finBillNo:finBillNoName }

          this.payInfo = res.data.receivableRegDetail
          let list = res.data.receivableRegDetail && res.data.receivableRegDetail.transferFeeAllotList ? res.data.receivableRegDetail.transferFeeAllotList : []
          let data = []
          list.forEach(item => {
            data.push(item)
          })
          this.option1.data = data
        }
      }).catch(err=>{
        this.delVisitedView()
        this.cancel()
      }).finally(()=>{
        this.loading = false
      })
    },
    handleCollapse() {
      this.showTable1 = !this.showTable1
    },
    cancel(refresh) {
      this.routerBack(refresh)
    },
    // 详情路由跳转
    jumpToRoute(type) {
      this.isJumpRouteFromPage = true
      if(type == 'OrderDetails'){
        this.$router.push({
          name: 'OrderDetails',
          query: {
            payOrderNo: this.infoData.payOrderNo,
          }
        })
      }else if(type == 'WriteoffRecvDetail'){
        this.$router.push({
          name: 'WriteoffRecvDetail',
          query: {
            source: 'createSettlementFromReceivableRegId',
            receivableRegId: this.infoData.receivableRegId
          }
        })
      }
    },
    
  },
  activated() {
    if (!this.$route.meta.isUseCache ) {
      this.applyNo = this.$route.query.applyNo
      this.receivableRegId = this.$route.query.receivableRegId
      this.payApplyReceiveRefundId = this.$route.query.payApplyReceiveRefundId
      this.getData()
    }
  },
  components: {
    FinanceTable,
    ColumnTipIntegration
  },
  computed: {
    ... mapState({
      defaultColumns: state => state.finance.columns.defaultColumns,
      columnsBase: state => state.finance.columns.columnsBase2
    }),
    ...mapGetters([
      'dictMap',
    ])
  },
  watch: {
  }
}
</script>
<style scoped lang="scss">
  .order-detail{
    padding: 0 10px;
    .modifyfee-h2{
    font-size: 18px;
    font-weight: 600;
    color: #222222;
    line-height: 25px;
    margin-top: 8px;
    }
    .finance-table-container{
      margin: 0px;
    }
  }
</style>
<style lang="scss" scoped>
.finance-approve-btns-box{
  display: flex;
  justify-content: space-between;
  height: 36px;
  border-radius: 4px 4px 0px 0px;
}
.finance-approve-btns-left{
  font-size: 14px;
  color: #222222;
  line-height: 24px;
  margin-top: 8px;
  font-weight: bold;
}
.finance-approve-btns-right{
  margin-top: 6px;
}

.base-item-column{
  width: 262px;
  display: inline-block;
}
</style>
