<template>
  <div class="row-cont" style="margin-bottom:10px">
    <div class="row-cont-tit">
      <span class="tit ft12">海外信息</span>
    </div>
    <div class="overseasInfo-form">
      <el-row :gutter="0">
        <el-col :span="6">
          <el-form-item label="报价方案" label-width="60px">
            <el-input placeholder="请选择报价方案" @focus="changePlan" v-model="createItem.schemeNumber" clearable :disabled="disabledStateSchemeNumber" @clear="createItem.schemeNumber='';createItem.quotationNumber=''"></el-input>
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
                <div class="bidder">报价人：{{el.createdName}}</div>
                <div class="bidder-number">报价编号：{{el.quotationNumber}}</div>
                <div class="bidder-number">方案编号：{{el.schemeNumber}}</div>
              </div>
              <div class="right-btns">
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
                  <el-table-column prop="feeTotal" label="Total">
                  </el-table-column>
                  <el-table-column prop="feeUnit" label="Billing unit" align="center" width="135">
                    <template slot-scope="scope">
                      {{getDictLabel('inquiryQuoteFeeUnit',scope.row.feeUnit) || getDictLabel('containerTypeShiporder',scope.row.feeUnit)}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="remark" label="Remarks" align="center" width="150">
                  </el-table-column>
                </el-table>
                <div class="others-info">
                  <div v-if="['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes( el.businessType)" class="flex-content-box"><span class="offer-content-title">Carrier：</span><span class="flex-content-offer-value">{{el.carrier}}</span></div>
                  <div v-if="['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes( el.businessType)" class="flex-content-box"><span class="offer-content-title">T/T：</span><span class="flex-content-offer-value">{{el.tT}}</span></div>
                  <div v-if="['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes( el.businessType)" class="flex-content-box"><span class="offer-content-title">ETD：</span><span class="flex-content-offer-value">{{el.etd}}</span></div>
                  <div v-if="['ship_export_fcl', 'ship_export_lcl', 'air_export','rail_export_fcl','rail_export_lcl','ship_bulk_ro'].includes( el.businessType)" class="flex-content-box"><span class="offer-content-title">Supplier：</span><span class="flex-content-offer-value">{{el.categoryName}}</span></div>
                  <div class="flex-content-box"><span class="offer-content-title">Validity：</span><span class="flex-content-offer-value">{{el.startDateValidity}}至{{el.endDateValidity}}</span></div>
                  <div class="flex-content-box"><span class="offer-content-title">Remarks：</span><span class="flex-content-offer-value">{{el.quoteRemark}}</span></div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 取消订单弹窗 -->
    <div v-if="overseasServiceTypePopShow">
      <ChangeOverseasServiceType @close="changeOverseasServiceTypePopClose" :abroadCompanyList="abroadCompanyList" :changeType="serviceShangeType" :ecsName="ecsName" :overseasCompanyCode="createItem.overseasCompanyCode" :overseasCompanyName="createItem.overseasCompanyName" />
    </div>
    <div v-if="showQuotationSchemePop">
      <QuotationSchemePop @close="closeQuotationScheme" :schemeNumber="createItem.schemeNumber" :bdId="orderInfoDataObj.bdEmployeeId" :polCode="polCode" :podCode="podCode" :businessType="businessType"></QuotationSchemePop>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ChangeOverseasServiceType from './changeOverseasServiceType.vue'
import { arrayHasDuplicateValue, unique } from '@/utils/index'
// import QuotationSchemePop from '@/views/airTransport/order/orderList/components/quotationSchemePop'
import { viewQuotationScheme } from '@/api/charge'
import {
  updateOverseasInfo,
  overseasTips,
  abroadCompanyList,
  overseasCanModify,
  standEdit
} from '@/api/order/list'
import { getDictLabel } from '@/utils/tools'
export default {
  filters: {
    formatValidity(val) {
      return val.replace(',', '至')
    }
  },
  data() {
    return {
      editType: '',
      getDictLabel: getDictLabel,
      isHide: true,
      offerRecordList: [],
      showQuotationSchemePop: false,
      abroadCompanyList: [],
      overseasServiceTypePopShow: false,
      serviceShangeType: '',
      supplierList: [],
      isCanModify: true,
      overseasAgentList: []
    }
  },
  props: {
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
  created() {
    this.getOverseasCanModify()
    this.getAbroadCompanyList()
    if (
      this.createItem.overseasAgentIds &&
      this.createItem.overseasAgentIds.length
    ) {
      for (let i = 0; i < this.createItem.overseasAgentIds.length; i++) {
        this.supplierList.push({
          value: this.createItem.overseasAgentIds[i],
          label: this.createItem.overseasAgentIds[i].split('####')[1]
        })
      }
    }
  },
  computed: {
    isEditSchemeNumber() {
      return this.isBd && ['submit', 'pass'].includes(this.orderStatus)
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
      ordDetRole: (state) => state.order.orderList.ordDetRole,
      userEditRoles: (state) => state.order.orderList.userEditRoles,
      overseasTipMsg: (state) => state.order.overseasTipMsg,
      overseasStatus: (state) => state.airTransport.overseasStatus,
      orderInfoDataObj: (state) => state.order.orderInfoDataObj
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
    disabledState() {
      // 建单人和操作可以修改
      if (this.overseasTipMsg) {
        // 海外客服还没审核通过或者拒绝之前，不能再次修改
        return true
      } else {
        if (this.isBd) {
          if (['draft', 'refuse'].includes(this.orderStatus)) {
            return false
          } else {
            return true
          }
        } else if (this.isOp) {
          if (
            (this.orderStatus === 'break' &&
              this.createItem.finCloseStatus !== 'yes') ||
            this.orderStatus === 'pass'
          ) {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      }
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
    'createItem.schemeNumber': {
      handler: function (val) {
        if (val) {
          this.getList()
        } else {
          this.offerRecordList = []
        }
      },
      immediate: true
    },
    polCode() {
      this.createItem.schemeNumber = ''
      this.createItem.quotationNumber = ''
    },
    podCode() {
      this.createItem.schemeNumber = ''
      this.createItem.quotationNumber = ''
    }
  },
  components: {
    ChangeOverseasServiceType,
    QuotationSchemePop
  },
  methods: {
    handleEditSchemeNumber() {
      this.showQuotationSchemePop = true
      this.editType = 2
    },
    getTotal(type, n1, n2, n3, n4, n5, n6) {
      let total = 0
      if (type === 'PER_CONTAINER') {
        if (n1 && n4) {
          total += n1 * n4
        }
        if (n2 && n5) {
          total += n2 * n5
        }
        if (n3 && n6) {
          total += n3 * n6
        }
      } else {
        if (n1) {
          total += n1 * 1
        }
        if (n2) {
          total += n2 * 1
        }
        if (n3) {
          total += n3 * 1
        }
      }
      return Number(total).fixed(2)
    },
    getList() {
      let params = {
        bd: this.orderInfoDataObj.bdEmployeeId,
        polCode: this.polCode,
        podCode: this.podCode,
        businessType: this.businessType,
        enquiryId: '',
        quotationNumber: '',
        schemeNumber: this.createItem.schemeNumber,
        quotationId: '',
        category: '',
        validity: ''
      }
      viewQuotationScheme(params).then((res) => {
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
        this.createItem.schemeNumber = value.schemeNumber
        this.createItem.quotationNumber = value.quotationNumber

        if (this.editType == 2) {
          // 直接修改
          standEdit({
            orderNo: this.$route.query.orderNo,
            editType: 'OVERSEA_INQUIRY',
            editValue: {
              quotationNumber: value.quotationNumber,
              schemeNumber: value.schemeNumber
            }
          }).then((res) => {
            this.$message.success('修改成功')
          })
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
    updataWorker() {
      let overseasStatus = this.overseasStatus + 1
      this.$store.dispatch('airTransport/setOverseasStatus', overseasStatus)
    },
    getOverseasCanModify() {
      // 若还未录入结算单位为“海外分公司”或者“海外代理”的费用，则可以变更“海外服务类型”；
      overseasCanModify({
        orderNo: this.$route.query.orderNo
      }).then((res) => {
        this.isCanModify = res.data
      })
    },
    getAbroadCompanyList() {
      // 海外分公司
      abroadCompanyList({ isAbroad: 'yes' }).then((res) => {
        if (res.data) {
          this.abroadCompanyList = res.data
        }
      })
    },
    getOverseasTips() {
      overseasTips({ orderNo: this.$route.query.orderNo }).then((res) => {
        if (res.data) {
          this.$store.dispatch('order/setOverseasTipMsg', res.data)
        } else {
          this.$store.dispatch('order/setOverseasTipMsg', '')
        }
      })
    },
    updateOverseasInfo(obj) {
      let params = {
        orderNo: this.$route.query.orderNo,
        overseasServiceType: this.createItem.overseasServiceType,
        overseasFirstAgentId: this.createItem.overseasFirstAgentId,
        overseasFirstAgentName: this.createItem.overseasFirstAgentName,
        overseasSecondAgentId: this.createItem.overseasSecondAgentId,
        overseasSecondAgentName: this.createItem.overseasSecondAgentName
      }
      if (obj) {
        params.ecsEmployeeId = obj.ecsEmployeeId
        params.epricingEmployeeId = obj.epricingEmployeeId
        params.overseasCompanyCode = ''
        params.overseasCompanyName = ''

        if (obj.overseasCompanyCode) {
          params.overseasCompanyCode = obj.overseasCompanyCode
          params.overseasCompanyName = obj.overseasCompanyName
        }
      }
      updateOverseasInfo(params).then((res) => {
        this.getOverseasTips()
        this.$message.success('已发起申请')
        this.updataWorker()
        // this.$emit('updateGetInfo')
        // 还没修改成功的海外服务类型信息先还原回去
        this.createItem.overseasServiceType =
          this.orderInfoDataObj.overseasServiceType

        this.createItem.overseasCompanyCode =
          this.orderInfoDataObj.overseasCompanyCode

        this.createItem.overseasCompanyName =
          this.orderInfoDataObj.overseasCompanyName
      })
    },
    changeOverseasCompany(val) {
      if (!this.isOp) {
        return
      }
      this.serviceShangeType = '1'
      this.overseasServiceTypePopShow = true
      // dosomething 回选 海外分公司名称
      // let item = this.abroadCompanyList.find((el) => el.companyCode === val)
      // this.createItem.overseasCompanyName = item.companyName
      // if (!this.isOp) {
      //   return
      // }
      // let ecsName=this.ecsName?`（${this.ecsName}）`:''
      // this.$confirm(
      //   `变更海外分公司为${this.createItem.overseasCompanyName}，需提交给海外客服${ecsName}审核，是否确定变更？`,
      //   '提示',
      //   {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }
      // )
      //   .then(() => {
      //     this.updateOverseasInfo({
      //       overseasCompanyCode: this.createItem.overseasCompanyCode,
      //       overseasCompanyName: this.createItem.overseasCompanyName
      //     })
      //   })
      //   .catch(() => {
      //     this.createItem.overseasServiceType =
      //       this.orderInfoDataObj.overseasServiceType

      //     this.createItem.overseasCompanyCode =
      //       this.orderInfoDataObj.overseasCompanyCode

      //     this.createItem.overseasCompanyName =
      //       this.orderInfoDataObj.overseasCompanyName
      //   })
    },
    changeOverseasServiceTypePopClose(action, value) {
      this.overseasServiceTypePopShow = false
      if (action === 'Confirm') {
        this.updateOverseasInfo(value)
      } else {
        this.createItem.overseasServiceType =
          this.orderInfoDataObj.overseasServiceType

        this.createItem.overseasCompanyCode =
          this.orderInfoDataObj.overseasCompanyCode

        this.createItem.overseasCompanyName =
          this.orderInfoDataObj.overseasCompanyName
      }
    },
    changeOverseasServiceType(val) {
      if (!this.isOp) {
        return
      }
      if (val === 'company') {
        this.serviceShangeType = '1'
        this.overseasServiceTypePopShow = true
      } else {
        this.serviceShangeType = '2'
        this.overseasServiceTypePopShow = true
      }
      // if (val === 'agent') {
      //   let ecsName=this.ecsName?`（${this.ecsName}）`:''
      //   this.$confirm(
      //     `变更海外服务类型为“海外代理做海外服务”，需要提交给海外客服${ecsName}审核，是否确定提交？`,
      //     '提示',
      //     {
      //       confirmButtonText: '确定',
      //       cancelButtonText: '取消',
      //       type: 'warning'
      //     }
      //   )
      //     .then(() => {
      //       this.updateOverseasInfo()
      //     })
      //     .catch(() => {
      //       this.createItem.overseasServiceType =
      //         this.orderInfoDataObj.overseasServiceType

      //       this.createItem.overseasCompanyCode =
      //         this.orderInfoDataObj.overseasCompanyCode

      //       this.createItem.overseasCompanyName =
      //         this.orderInfoDataObj.overseasCompanyName
      //     })
      // }
    },
    handleSelectSupplierName(val) {
      let arr = val || []
      let result = []
      for (let i = 0; i < arr.length; i++) {
        result.push({
          value: arr[i],
          label: arr[i].split('####')[1]
        })
      }
      this.overseasAgentList = result

      if (val[0]) {
        this.createItem.overseasFirstAgentId = Number(val[0].split('####')[0])
        this.createItem.overseasFirstAgentName = val[0].split('####')[1]
      } else {
        this.createItem.overseasFirstAgentId = null
        this.createItem.overseasFirstAgentName = ''
      }

      if (val[1]) {
        this.createItem.overseasSecondAgentId = Number(val[1].split('####')[0])
        this.createItem.overseasSecondAgentName = val[1].split('####')[1]
      } else {
        this.createItem.overseasSecondAgentId = null
        this.createItem.overseasSecondAgentName = ''
      }
    },
    supplierFilterMehod(val) {
      this.getSupplierList(val)
    },
    supplierVisibleChange(val) {
      if (val) {
        this.getSupplierList()
      }
    },
    getSupplierList(val = '') {
      this.$store
        .dispatch('dict/querySupplierList', {
          category: 'category',
          value: 'overseas_agent',
          queryString: val
        })
        .then((data) => {
          this.supplierList = data.list
          this.supplierList.forEach((item) => {
            Object.assign(item, {
              label: item.name,
              value: `${item.supplierId}####${item.name}`
            })
          })

          this.supplierList = unique(
            [...this.overseasAgentList, ...this.supplierList],
            'value'
          )
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
        .extend-time {
          width: 92px;
          height: 28px;
          background: #ffffff;
          border-radius: 2px;
          color: #4a4a4a;
          margin-right: 16px;
          text-align: center;
          line-height: 28px;
        }
        .invalid-time {
          width: 56px;
          height: 28px;
          background: #cd4130;
          border-radius: 2px;
          color: #fff;
          text-align: center;
          line-height: 28px;
        }
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
          margin-top: 16px;
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
    width: 112px;
    text-align: right;
  }
  .flex-content-box {
    display: flex;
  }
  .flex-content-offer-value {
    max-width: calc(100% - 112px);
    word-wrap: break-word;
  }
}
.el-form-item__label {
  padding-right: 4px !important;
}
.edit-schemeNumber-btn {
  display: flex;
  align-items: center;
}
.overseasInfo-form {
  padding-top:8px;
  .el-form-item__content,
  .el-form-item__label {
    line-height: 20px !important;
  }
}
</style>