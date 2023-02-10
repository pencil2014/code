<template>
  <div class="row-cont" style="margin-bottom:10px" id="overseasInfo">
    <div class="row-cont-tit">
      <span class="tit ft12">海外信息</span>
      <div class="row-cont-rt">
        <span class="expand" @click="isHide=!isHide"> {{ isHide ? '收起' : '展开' }}<i :class="isHide ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
      </div>
    </div>
    <el-form :model="formData" :rules="rules" ref="overseasInfoForm" :show-message="false">
      <div v-show="isHide" class="overseasInfo-form">
        <el-row :gutter="0">
          <el-col :span="6">
            <el-form-item label="报价方案" label-width="60px">
              <el-input placeholder="请选择报价方案" @focus="changePlan" v-model="schemeNumbers" clearable :disabled="disabledStateSchemeNumber" @clear="delSchemeNumbers">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="3" v-if="isEditSchemeNumber">
            <div class="edit-schemeNumber-btn">
              <el-button size="mini" @click="handleEditSchemeNumber">修改</el-button>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-form>
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
      <QuotationSchemePop @close="closeQuotationScheme" :schemeNumber="schemeNumbers" :bdId="airOrderInfo.bdEmployeeId" :polCode="polCode" :podCode="podCode" :businessType="businessType"></QuotationSchemePop>
    </div>
    <div v-if="addFeePop">
      <AddFeePop :feeData="feeData" :selectSchemeNumber="selectSchemeNumber" :serviceList="airOrderInfo.serviceInfoList" @close="closeFeeData"></AddFeePop>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ChangeOverseasServiceType from './changeOverseasServiceType.vue'
import QuotationSchemePop from './quotationSchemePop.vue'
import AddFeePop from './addFeePop.vue'
import { viewQuotationSchemeAll } from '@/api/charge'
import { getDictLabel } from '@/utils/tools'
import { standEdit } from '@/api/order/list'
import { accAdd } from '@/utils/index'
import store from '@/store'
const dateObj = {}
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
      feeData: [],
      addFeePop: false,
      schemeNumbers: '',
      editType: '',
      getDictLabel: getDictLabel,
      offerRecordList: [],
      showQuotationSchemePop: false,
      isHide: true,
      overseasServiceTypePopShow: false,
      serviceShangeType: '',
      supplierList: [],
      rules: {},
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
      default: () => {}
    },
    formData: {
      type: Object,
      default: () => dateObj
    },
    orderStatus: {
      type: String,
      default: ''
    },
    isPricing: {
      type: Boolean,
      default: false
    },
    isBd: {
      type: Boolean,
      default: false
    },
    isOp: {
      type: Boolean,
      default: false
    },
    isEcs: {
      type: Boolean,
      default: false
    },
    isEpricing: {
      type: Boolean,
      default: false
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
  computed: {
    showCreateFee() {
      if (this.airOrderInfo.businessType === 'air_export') {
        if (
          this.airOrderInfo.orderStatus === 'pass' &&
          (this.isEpricing || this.isEcs)
        ) {
          return true
        } else {
          return false
        }
      } else {
        if (
          this.airOrderInfo.orderStatus === 'pass' &&
          (this.isEpricing || this.isEcs || this.isOp)
        ) {
          return true
        } else {
          return false
        }
      }
    },
    isEditSchemeNumber() {
      return (this.isBd || this.isPricing || this.isOp) && ['submit', 'pass'].includes(this.orderStatus)
    },
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      overseasStatus: (state) => state.airTransport.overseasStatus,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      roles: (state) => state.user.roles,
      userId: (state) => state.user.userId
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
    disabledStateSchemeNumber() {
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        // 业务可以填写部分的权限
        if (this.isBd) {
          if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
            return true
          } else {
            return false
          }
        } else if (this.isPricing) {
          if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      }
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
        bd: '', //this.airOrderInfo.bdEmployeeId
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
        if (this.businessType === 'air_export') {
          msg = '目的地'
        } else {
          msg = '卸货港'
        }
        this.$message.warning(`请先选择起运港和${msg}`)
        return
      }
      this.showQuotationSchemePop = true
      this.editType = 1
    },
    validateForm() {
      return new Promise((resolve, reject) => {
        this.$refs.overseasInfoForm.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            console.log(valid)
            reject()
          }
        })
      })
    },
    clearValidate() {
      this.$refs.overseasInfoForm.clearValidate()
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
// .el-form-item__content {
//   height: 20px;
// }
.overseasInfo-select-plan {
  width: 100%;
  height: 20px;
  background-color: #ffffff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
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
  .flex-content-box {
    display: flex;
  }
  .offer-content-title {
    display: inline-block;
    width: 120px;
    text-align: right;
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