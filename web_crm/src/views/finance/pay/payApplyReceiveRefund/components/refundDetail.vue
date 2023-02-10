<template>
<div class="finance-page prepay-detail"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="finance-approve-detail finance-detail-page">
      <div class="money-box money-box-border-bottom" style="background: #ffffff">
        <div class="money-box-left">
          <div class="money-title">退款申请详情</div>
        </div>
        <div class="money-box-right">
            <el-button  @click="cancel" size="mini">返回</el-button>
        </div>
      </div>
    </div>
    <div class="order-detail">
    <div class="finance-approve-detail">
      <div class="finance-approve-btns-box">
        <div class="finance-approve-btns-left">收款详情</div>
      </div>
      <DetailDiv   label="退款申请单号：" :content="infoData.applyNo"/>
      <DetailDiv   label="关联付款单号："  :isSlot="true">
        <span style="color:#1890ff;cursor:pointer;" @click="jumpToRoute('OrderDetails', infoData.payOrderNo)">{{infoData.payOrderNo}}</span>
      </DetailDiv>
      <DetailDiv   label="退款申请时间：" :content="infoData.createdTime"/>
      <DetailDiv   label="退款审批时间：" :content="infoData.confirmTime"/>
      <DetailDiv   label="实退金额：" :content="infoData.realRefundAmt"/>
      <DetailDiv   label="退款币种：" :content="infoData.refundCurrency"/>
      <DetailDiv   label="退款申请人：" :content="infoData.createdName"/>
      <DetailDiv   label="退款审批人：" :content="infoData.confirmName"/>
      <DetailDiv   label="手续费金额：" :content="infoData.transferFeeAmt"/>
      <DetailDiv   label="手续费币种：" :content="infoData.transferFeeCurrency"/>
      <DetailDiv   label="手续费承担人：" :content="infoData.transferChargerName" :isTooltip="true"/>
      <DetailDiv   label="退款类型：" :content="dictMapObj.refundType[infoData.refundType]"/>
      <DetailDiv   label="退款状态：" :content="dictMapObj.payStatusType[infoData.payStatus]"/>
      <DetailDiv   label="付款审批状态：" :content="dictMapObj.auditStatus[infoData.payOrderConfirmStatus]"/>
      <div class="base-item-column">
        <span style="width: 96px;text-align: right; display: inline-block;">手续费分摊单号：</span>
        <div style="display:inline-block;vertical-align:middle;cursor:pointer;width:160px;">
          <ColumnTipIntegration :item="finBillNoColumn" :row="finBillNoColumnTipRow" />
        </div>
      </div>
      <!-- <DetailDiv   label="我司账号：" :content="infoData.payAccountNo"/> -->
      <DetailDiv   label="拒绝原因：" :content="infoData.refuseReason" :isFull="true"/>
      <DetailDiv   label="退款说明：" :content="infoData.remark" :isFull="true"/>
    </div>
    <div class="finance-approve-detail" style="border-top: 1px solid #e9e9e9">
      <div class="finance-approve-btns-box">
        <div class="finance-approve-btns-left">收款登记详情</div>
        <div class="finance-approve-btns-right">
        </div>
      </div>
      <DetailDiv   label="收款登记号：" :isSlot="true">
        <span style="color:#1890ff;cursor:pointer;" @click="jumpToRoute('WriteoffRecvDetail', payInfo.receivableRegNo)">{{payInfo.receivableRegNo}}</span>
      </DetailDiv>
      <DetailDiv   label="银行流水号：" :content="payInfo.bankSeqNo" :isTooltip="true"/>
      <DetailDiv   label="收付日期：" :content="payInfo.recvDate"/>
      <DetailDiv   label="我司户名：" :content="infoData.payAccountName" :isTooltip="true"/>
      <DetailDiv   label="我司开户行：" :content="infoData.payBankName"/>
      <DetailDiv   label="收款银行：" :content="payInfo.accountShortName" :isTooltip="true"/>
      <DetailDiv   label="收款账号：" :content="payInfo.accountNo"/>
      <DetailDiv   label="实收金额：" :content="payInfo.realAmt"/>
      <DetailDiv   label="收款币种：" :content="payInfo.currency"/>
      <DetailDiv   label="付款人：" :content="payInfo.payAccountName"/>
      <DetailDiv   label="付款开户行：" :content="payInfo.payBankName" :isTooltip="true"/>
      <DetailDiv   label="付款账号：" :content="payInfo.payAccountNo"/>
      <DetailDiv   label="付款人账户类型：" :content="dictMapObj.accountType[payInfo.payAccountPublicType]"/>
      <DetailDiv   label="结算单位：" :content="payInfo.settleCorpName" :isTooltip="true"/>
      <DetailDiv   label="委托单位：" :content="payInfo.payAccountName" :isTooltip="true"/>
      <DetailDiv   label="创建人：" :content="payInfo.createdName"/>
      <DetailDiv   label="创建时间：" :content="payInfo.createdTime"/>
      <!-- <div class="base-item-column">
        <span style="width: 95px;text-align: right; display: inline-block;">退款委托书：</span>
        <div style="display:inline-block;vertical-align:middle;cursor:pointer;width:160px;">
          <ColumnTipIntegration :item="fileNameColumn" :row="fileNameColumnTipRow" />
        </div>
      </div> -->
      <DetailDiv   label="退款委托书："  :isSlot="true" >
        <span class="detail__content">
          <ColumnTipIntegration :item="fileNameColumn" :row="fileNameColumnTipRow" />
        </span>
      </DetailDiv>
      <DetailDiv   label="客户付款水单："  :isSlot="true">
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
            <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">{{showTable1 ? '展开' : '收起'}}<i :class="{'el-icon-arrow-up': showTable1, 'el-icon-arrow-down': !showTable1}"></i></el-button>
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
      moneyTitle1: '手续费',
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
        label: '内外扣类型',
        type: 'select',
        propInDict: 'transferFeeType'
      },
      {
        prop: 'currency',
        label: '币种',
        type: 'select',
        key: 'currency',
        propInDict: 'validCurrency'
      },
      { 
        prop: 'amt', 
        label: '金额', 
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
