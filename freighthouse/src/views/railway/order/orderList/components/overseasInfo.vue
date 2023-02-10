<template>
  <div class="row-cont" style="margin-bottom:10px">
    <div class="row-cont-tit">
      <span class="tit ft12">海外信息</span>
    </div>
    <div class="overseasInfo-form">
      <el-row :gutter="0">
        <el-col :span="6">
          <el-form-item label="报价方案" label-width="60px">
            <el-input placeholder="请选择报价方案" @focus="changePlan" v-model="schemeNumbers" clearable :disabled="disabledStateSchemeNumber" @clear="delSchemeNumbers"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="3" v-if="isEditSchemeNumber">
          <div class="edit-schemeNumber-btn">
            <el-button size="mini" @click="handleEditSchemeNumber">修改</el-button>
          </div>
        </el-col>
      </el-row>
    </div>
    <div style="padding:10px 24px" v-if="isHide && offerRecordList.length">
      <div class="offer-record">
        <div v-for="(el,index) in offerRecordList" :key="index">
          <div class="offer-item">
            <div class="offer-item-title">
              <div class="left">
                <!-- <div class="freight-item-surrender">
                  <img src="../../../../../assets/head.png" alt="">
                </div> -->
                <div class="bidder">Quoter：{{el.createdName}}</div>
                <div class="bidder-number">Inquiry No.：{{el.enquiryNo}}</div>
                <div class="bidder-number">Quotation No.：{{el.quotationNumber}}</div>
                <div class="bidder-number">Quotation scheme No.：{{el.schemeNumber}}</div>
              </div>
              <div class="right-btns">
                <el-button v-if="showCreateFee" @click="handleAddFee(el)" size="mini" type="primary">一键生成费用</el-button>
              </div>
            </div>
            <div class="offer-info">
              <div class="offer-content">
                <el-table :data="el.feeList" style="width: 100%">
                  <el-table-column prop="feeName" label="Fee name" align="center" width="135">
                  </el-table-column>
                  <el-table-column prop="feeQuantity" label="Number" align="center">
                  </el-table-column>
                  <el-table-column prop="feePrice" label="unit Price" align="center">
                  </el-table-column>
                  <el-table-column prop="feeCurrency" label="Currency" align="center">
                  </el-table-column>
                  <el-table-column prop="feeTotal" label="Total" align="center">
                  </el-table-column>
                  <el-table-column prop="feeUnit" label="Billing unit" align="center" width="135">
                    <template slot-scope="scope">
                      {{scope.row.feeUnit | feeUnitEn }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="remark" label="Remarks" align="center" width="150">
                  </el-table-column>
                </el-table>
                <div class="fee-total">Fee Total：<span v-for="(item,i) in totalAmount(el.feeList)" :key="i">{{item.value}} {{item.label}}<span v-if="totalAmount(el.feeList).length>0&&index<totalAmount(el.feeList).length-1">+</span></span></div>
                <div class="others-info">
                  <el-row>
                    <el-col :span="12" v-if="!['rail_export_fcl','rail_export_lcl'].includes( el.businessType) && el.carrier">
                      <div class="flex-content-box"><span class="offer-content-title">Carrier：</span><span class="flex-content-offer-value">{{el.carrier}}</span></div>
                    </el-col>
                    <el-col :span="12" v-if="['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes( el.businessType)">
                      <div class="flex-content-box"><span class="offer-content-title">T/T：</span><span class="flex-content-offer-value">{{el.tT}}</span></div>
                    </el-col>
                    <el-col :span="12" v-if="['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes( el.businessType)">
                      <div class="flex-content-box"><span class="offer-content-title">ETD：</span><span class="flex-content-offer-value">{{el.etd}}</span></div>
                    </el-col>
                    <!-- <el-col :span="12" v-if="['ship_export_fcl', 'ship_export_lcl', 'air_export','rail_export_fcl','rail_export_lcl','ship_bulk_ro'].includes( el.businessType) && el.categoryName">
                      <div class="flex-content-box"><span class="offer-content-title">Supplier：</span><span class="flex-content-offer-value">{{el.categoryName}}</span></div>
                    </el-col> -->
                    <el-col :span="12">
                      <div class="flex-content-box"><span class="offer-content-title">POD (ADVISED)：</span><span v-if="['air_export','air_import'].includes(el.businessType)" class="flex-content-offer-value">{{el.podRecommendCode}}</span><span v-else class="flex-content-offer-value">{{el.podRecommendName}}</span></div>
                    </el-col>
                    <el-col :span="12">
                      <div class="flex-content-box"><span class="offer-content-title">Validity Date Type：</span><span class="flex-content-offer-value">{{getDictLabel('validityDateType', el.validityDateType)}}</span></div>
                    </el-col>
                    <el-col :span="12">
                      <div class="flex-content-box"><span class="offer-content-title">Validity Date：</span><span class="flex-content-offer-value">{{el.startDateValidity}}~{{el.endDateValidity}}</span></div>
                    </el-col>
                  </el-row>
                  <!-- <div v-for="(item,i) in formatFileList(el.fileNameStr, el.fileNoStr)" :key="item.fileNo">
                    <div class="file-item"><span class="inquiryn-content-title">ANNEX({{i+1}})：</span><span title="点击下载" class="file-name" @click="handleDownload(item.fileName,item.fileNo)">{{item.fileName}}</span></div>
                  </div> -->
                  <div class="flex-content-box"><span class="offer-content-title">Remarks：</span><span class="flex-content-offer-value" v-html="formatRemarke(el.quoteRemark)"></span></div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showQuotationSchemePop">
      <QuotationSchemePop @close="closeQuotationScheme" :schemeNumber="schemeNumbers" :bdId="orderInfoDataObj.main.bdEmployeeId" :polCode="polCode" :podCode="podCode" :businessType="businessType"></QuotationSchemePop>
    </div>
    <div v-if="addFeePop">
      <AddFeePop :feeData="feeData" :selectSchemeNumber="selectSchemeNumber" :serviceList="orderInfoDataObj.serviceInfoList" @close="closeFeeData"></AddFeePop>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ChangeOverseasServiceType from './changeOverseasServiceType.vue'
import { arrayHasDuplicateValue, accAdd } from '@/utils/index'
import QuotationSchemePop from '@/views/airTransport/order/orderList/components/quotationSchemePop'
import { viewQuotationSchemeAll } from '@/api/charge'
import AddFeePop from '@/views/airTransport/order/orderList/components/addFeePop'
import {
  overseasTips,
  abroadCompanyList,
  overseasCanModify,
  standEdit
} from '@/api/order/list'
import { getDictLabel } from '@/utils/tools'
import store from '@/store'
export default {
  filters: {
    formatValidity(val) {
      return val.replace(',', '~')
    },
    feeUnitEn(val) {
      let item = store.state.dict.dictMap.feeUnit.find((el) => el.value === val)
      if (item) {
        return item.en
      } else {
        return ''
      }
    }
  },
  data() {
    return {
      selectSchemeNumber: '',
      addFeePop: false,
      feeData: [],
      schemeNumbers: '',
      editType: '',
      getDictLabel: getDictLabel,
      isHide: true,
      offerRecordList: [],
      showQuotationSchemePop: false,
      abroadCompanyList: [],
      serviceShangeType: '',
      supplierList: [],
      isCanModify: true,
      overseasAgentList: []
    }
  },
  props: {
    quoteList: {
      type: Array,
      default: () => []
    },
    createItem: {
      type: Object,
      default: () => ({})
    },
    orderStatus: {
      type: String,
      default: ''
    },
    bdId: {
      type: [String, Number],
      default: ''
    },
    polCode: {
      type: [String, Number],
      default: ''
    },
    podCode: {
      type: [String, Number],
      default: ''
    },
    businessType: {
      type: String,
      default: ''
    }
  },
  created() {},
  computed: {
    showCreateFee() {
      if (this.orderStatus === 'pass' && (this.isEpricing || this.isEcs)) {
        return true
      } else {
        return false
      }
    },
    isEditSchemeNumber() {
      return (this.isBd || this.isPricing || this.isOp) && ['submit', 'pass'].includes(this.orderStatus)
    },
    overseasAgentNames() {
      let arr = []
      if (this.createItem.overseasFirstAgentName) {
        arr.push(this.createItem.overseasFirstAgentName)
      }
      if (this.createItem.overseasSecondAgentName) {
        arr.push(this.createItem.overseasSecondAgentName)
      }
      return arr.join('，')
    },
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.railway.ordDetRole,
      userEditRoles: (state) => state.railway.userEditRoles,
      orderInfoDataObj: (state) => state.railway.orderInfoDataObj
    }),
    ecsName() {
      let { workAssign } = this.createItem
      let bdItem = workAssign && workAssign.find((el) => el.jobCode === 'ecs')
      if (bdItem && bdItem.employeeName) {
        return bdItem.employeeName
      } else {
        return ''
      }
    },
    hasDestination() {
      return arrayHasDuplicateValue(
        [
          'pod_change_doc',
          'pod_ltl_delivery',
          'pod_fcl_delivery',
          'pod_comm_clearance',
          'pod_warehouse'
        ],
        this.createItem.serviceList
      )
    },
    overseasAgentIsRequired() {
      return arrayHasDuplicateValue(
        ['pod_ltl_delivery', 'pod_fcl_delivery', 'pod_comm_clearance'],
        this.createItem.serviceList
      )
    },
    disabledStateSchemeNumber() {
      // 建单人和操作可以修改
      if (this.isBd) {
        if (['draft', 'refuse'].includes(this.orderStatus)) {
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    },
    overseasAgentDisabledState() {
      // 建单人，海外商务，海外客服可以修改 海外代理字段
      if (this.isBd) {
        if (!['draft', 'refuse'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else if (this.isEpricing || this.isEcs) {
        return false
      } else {
        return true
      }
    },
    isOp() {
      return this.ordDetRole === 'op'
    },
    isPricing() {
      return this.ordDetRole === 'pricing'
    },
    isBkg() {
      return this.ordDetRole === 'bkg'
    },
    isBd() {
      return (
        this.ordDetRole === 'bd' ||
        this.ordDetRole === 'obd' ||
        this.ordDetRole === 'asst'
      )
    },
    isEpricing() {
      return this.userEditRoles.includes('epricing')
    },
    isEcs() {
      return this.userEditRoles.includes('ecs')
    }
  },
  watch: {
    schemeNumbers(val){
      if(!val){
         this.offerRecordList = []
      }
    },
    quoteList: {
      handler: function (val) {
        if (val) {
          let arr = []
          for (let i = 0; i < val.length; i++) {
            arr.push(val[i].schemeNumber)
          }
          this.schemeNumbers = arr.join(',')
          this.getList()
        } else {
          this.offerRecordList = []
          this.schemeNumbers = ''
        }
      },
      immediate: true
    },
    polCode() {
      this.$emit('setQuoteList', [])
    },
    podCode() {
      this.$emit('setQuoteList', [])
    }
  },
  components: {
    ChangeOverseasServiceType,
    QuotationSchemePop,
    AddFeePop
  },
  methods: {
    totalAmount(data = []) {
      let arr = []
      for (let i = 0; i < data.length; i++) {
        if (data[i].feeTotal && data[i].feeCurrency) {
          if (!arr.find((el) => el.label == data[i].feeCurrency)) {
            arr.push({
              value: data[i].feeTotal,
              label: data[i].feeCurrency
            })
          } else {
            let index = arr.findIndex((el) => el.label == data[i].feeCurrency)
            arr[index].value = accAdd(arr[index].value, data[i].feeTotal)
          }
        }
      }
      return arr
    },
    formatFileList(otherFileName, otherFileNo) {
      let otherFileNameArr = otherFileName ? otherFileName.split(',') : []
      let otherFileNoArr = otherFileNo ? otherFileNo.split(',') : []
      let arr = []
      for (let i = 0; i < otherFileNameArr.length; i++) {
        arr.push({
          fileNo: otherFileNoArr[i],
          fileName: otherFileNameArr[i]
        })
      }
      return arr
    },
    closeFeeData() {
      this.addFeePop = false
    },
    handleAddFee(data) {
      this.feeData = data.feeList
      this.selectSchemeNumber = data.schemeNumber
      this.addFeePop = true
    },
    delSchemeNumbers() {
      this.$emit('setQuoteList', [])
    },
    formatRemarke(val) {
      return val.replace(/\n|\r\n/g, '<br>')
    },
    handleEditSchemeNumber() {
      this.showQuotationSchemePop = true
      this.editType = 2
    },
    getList() {
      let params = {
        bd: '', // this.orderInfoDataObj.main.bdEmployeeId
        // polCode: this.polCode,
        // podCode: this.podCode,
        businessType: this.businessType,
        enquiryId: '',
        quotationNumber: '',
        schemeNumber: this.schemeNumbers,
        quotationId: '',
        category: '',
        validity: ''
      }
      if (!this.schemeNumbers) {
        return
      }
      viewQuotationSchemeAll(params).then((res) => {
        if (
          Array.isArray(res.data.woInquiryList) &&
          res.data.woInquiryList.length
        ) {
          this.offerRecordList = res.data.woInquiryList
        } else {
          this.offerRecordList = []
        }
      })
    },
    closeQuotationScheme(action, value) {
      if (action === 'Confirm') {
        // value =数组
        let quoteList = [] // 报价方案需要提交的节点
        for (let i = 0; i < value.length; i++) {
          quoteList.push({
            quotationNumber: value[i].quotationNumber,
            schemeNumber: value[i].schemeNumber,
            enquiryNo: value[i].enquiryNo
          })
        }
        if (this.editType == 2) {
          // 直接修改
          standEdit({
            orderNo: this.$route.query.orderNo,
            editType: 'OVERSEA_INQUIRY',
            editValueList: quoteList
          }).then((res) => {
            this.$message.success('修改成功')
            this.$emit('setQuoteList', quoteList)
          })
        } else {
          this.$emit('setQuoteList', quoteList)
        }
      }
      this.showQuotationSchemePop = false
    },
    changePlan(val) {
      if (!this.polCode || !this.podCode) {
        let msg = ''
        if (this.businessType === 'ship_import_lcl') {
          msg = '卸货港'
        } else {
          msg = '目的地'
        }
        this.$message.warning(`请先选择起运港和${msg}`)
        return
      }
      this.showQuotationSchemePop = true
      this.editType = 1
    },
    getOverseasTips() {
      overseasTips({ orderNo: this.$route.query.orderNo }).then((res) => {
        if (res.data) {
          this.$store.dispatch('order/setOverseasTipMsg', res.data)
        } else {
          this.$store.dispatch('order/setOverseasTipMsg', '')
        }
      })
    }
  }
}
</script>

<style  lang="scss">
.overseasInfo-form {
  padding: 0 20px;
  .el-form-item__content {
    flex: 1;
  }
  .el-form-item {
    margin-bottom: 4px;
  }
  .overseasInfo-item {
    display: flex;
  }
}
.offer-record {
  .fee-total {
    margin-top: 4px;
    color: #409eff;
  }
  .bidder-number {
    margin-right: 20px;
  }
  .offer-record-empty {
    padding-top: 48px;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
  }
  .offer-item {
    background: #ffffff;
    border-radius: 2px;
    border: 1px solid #d9d9d9;
    margin-bottom: 16px;
    cursor: pointer;
    .offer-item-title {
      height: 40px;
      background: #ebeef3;
      border-radius: 2px 2px 0px 0px;
      border-bottom: 1px solid #d9d9d9;
      display: flex;
      align-items: center;
      padding: 0 16px;
      font-weight: bold;
      color: #222222;
      justify-content: space-between;
      .left {
        display: flex;
        align-items: center;
        .freight-item-surrender {
          margin-right: 8px;
          img {
            width: 28px;
            height: 28px;
            border-radius: 14px;
          }
        }
        .bidder {
          margin-right: 12px;
        }
      }
      .right-btns {
        display: flex;
        // .extend-time {
        //   width: 92px;
        //   height: 28px;
        //   background: #ffffff;
        //   border-radius: 2px;
        //   color: #4a4a4a;
        //   margin-right: 16px;
        //   text-align: center;
        //   line-height: 28px;
        // }
        // .invalid-time {
        //   width: 56px;
        //   height: 28px;
        //   background: #cd4130;
        //   border-radius: 2px;
        //   color: #fff;
        //   text-align: center;
        //   line-height: 28px;
        // }
        .offer-btn {
          cursor: pointer;
        }
      }
    }
    .offer-info {
      padding: 16px;
      .offer-content {
        line-height: 18px;
        color: #666;
        border-radius: 10px;
        position: relative;
        .others-info {
          color: #4a4a4a;
          line-height: 20px;
          margin-bottom: 4px;
          margin-top: 8px;
        }
        .offer-cost {
          border-left: 1px solid #d9d9d9;
          .offer-cost-item-name {
            background: #ebeef3;
            box-shadow: inset 0px 1px 0px 0px #d9d9d9;
            display: flex;
            font-weight: bold;
            color: #222222;
            .cost-name {
              width: 40%;
              text-align: center;
              line-height: 20px;
              padding: 6px;
            }
            .amount {
              width: 20%;
              text-align: center;
              line-height: 20px;
              padding: 6px;
            }
          }
          .offer-cost-line {
            display: flex;
            background: #fff;
            box-sizing: border-box;
            .cost-name {
              width: 40%;
              padding: 6px;
              display: flex;
              align-items: center;
            }
            .amount {
              width: 20%;
              padding: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }
      }
    }
  }
  .right-border {
    border-right: 1px solid #d9d9d9;
  }
  .left-border {
    border-left: 1px solid #d9d9d9;
  }
  .top-border {
    border-top: 1px solid #d9d9d9;
  }
  .bottom-border {
    border-bottom: 1px solid #d9d9d9;
  }
  .is-self-offer {
    border: 1px solid #3e80f5;
    .offer-item-title {
      background: #3e80f5;
      border: 0;
      border-radius: 0;
      color: #fff;
    }
    .offer-info {
      background: #eff4fd;
    }
  }
  .flex-content-box {
    display: flex;
  }
  .offer-content-title {
    display: inline-block;
    width: 120px;
    text-align: right;
  }
  .flex-content-box {
    display: flex;
  }
  .flex-content-offer-value {
    max-width: calc(100% - 120px);
    word-wrap: break-word;
  }
}
.el-form-item__label {
  padding-right: 4px !important;
}
.edit-schemeNumber-btn {
  // height: 30px;
  display: flex;
  align-items: center;
}
.overseasInfo-form {
  padding-top: 8px;
  .el-form-item__content,
  .el-form-item__label {
    line-height: 20px !important;
  }
}
</style>