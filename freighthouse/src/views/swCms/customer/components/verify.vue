<template>
  <el-dialog
    title="审核"
    :visible.sync="option.show"
    width="1000px"
    v-loading="loading"
    :before-close="cancel"
  >
    <div class="tips"  v-show="isCrm && crm.isRecycle==='yes'">
      当前客户在CRM公海中, 请先到公海给客户分配维护人, 再进行审核 !
    </div>
    <div class="customer-box">
      <div class="title">审核信息</div>
      <Customer :customer="customerData" v-if="showCustomer" ref="customer" />
    </div>
    <div class="compare-box">
      <!-- <template v-if="isCrm">
        <div class="title">CRM数据信息</div>
        <Crm :crm="crm" v-if="crm" />
      </template> -->
      <template v-if="showNetwork">
        <div class="title">天眼查数据信息</div>
        <Network :network="network" v-if="network" @changeNetwork="changeNetwork" />
      </template>
    </div>
    <div slot="footer">
      <el-button @click="cancel" size="mini">取 消</el-button>
      <el-button type="primary" @click="submit" size="mini">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Customer from './customer'
import Crm from './crm'
import Network from './network'
import { customerDetail, tycDetail, customerVerify, customerRefuse } from '@/api/swcms/index'
export default {
  props: {
    option: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    Customer,
    Crm,
    Network,
  },
  data() {
    return {
      showNetwork: false,
      showCustomer: false,
      isCrm: false,
      customer: {},
      crm: {},
      network: {},
      loading: false,
    }
  },
  created() {
    this.getCustomerDetail()
  },
  computed: {
    customerData() {
      let customer = this.customer
      let crm = this.crm
      let network = this.network
      let isCrm = this.isCrm
      return {
        customer,
        crm,
        network,
        isCrm,
      }
    },
  },
  methods: {
    changeNetwork(data) {
      this.network = data
    },
    getCustomerDetail() {
      let { oid } = this.option.data
      let data = {
        oid,
      }
      this.loading = true
      customerDetail(data)
        .then((res) => {
          let { crmDetail, submitDetail } = res.data
          Object.assign(this.customer, submitDetail)
          Object.assign(this.crm, crmDetail)
          this.isCrm = !!crmDetail
          if (this.isCrm) {
            this.showCustomer = true
          } else {
            // this.getTycDetail(this.customer.uscc || this.customer.corpName)
            this.network = {
              uscc: this.customer.uscc
            }
            this.showNetwork = true
            this.showCustomer = true
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    getTycDetail(str) {
      let data = {
        keywords: str,
      }
      tycDetail(data)
        .then((res) => {
          if (res.code === 0) {
            Object.assign(this.network, res.data)
            this.showNetwork = true
            this.showCustomer = true
          }
        })
        .catch(() => {})
    },
    submit() {
      this.$refs['customer'].$refs['customerForm'].validate((valid) => {
        if (valid) {
          let row = this.$refs['customer'].$data.form
          if (this.isCrm && this.crm.isRecycle==='yes' && row.confirmStatus === 'pass') {
            return this.$msgErrClose('当前客户在CRM公海中, 请先到公海给客户分配维护人, 再进行审核 !')
          }
          this.submitFn()
        } else {
          return false
        }
      })
    },
    cancel() {
      this.$parent.verifyOption.show = false
    },
    submitFn() {
      let row = this.$refs['customer'].$data.form
      let countyOption = this.$refs['customer'].countyOption
      console.log(11, row)
      let countyItem = countyOption.find(item => item.countryCode === row.countryCode)
      console.log(11, countyOption, countyItem)
      let time = ''
      if (row.setupDate) {
        if (!/^\d{4}$/.test(row.setupDate) && !/^\d{4}[-][0,1][0-9]$/.test(row.setupDate) && !/^\d{4}[-][0,1][0-9][-][0-3][0-9]$/.test(row.setupDate)) {
          return this.$msgErrClose('成立日期输入有误，仅支持yyyy/yyyy-mm/yyyy-mm-dd三种格式！')
        } else if (/^\d{4}$/.test(row.setupDate)) { //只输入了年 yyyy 默认加上“-01-01”
          time = row.setupDate + '-01-01'
          row.setupDateType = 'year'
        } else if (/^\d{4}[-][0,1][0-9]$/.test(row.setupDate)) { //只输入了年月 yyyy-mm 默认加上 “-01”
          time = row.setupDate + '-01'
          row.setupDateType = 'month'
        } else if (/^\d{4}[-][0,1][0-9][-][0-3][0-9]$/.test(row.setupDate)) { //输入年月日 yyyy-mm-dd
          time = row.setupDate
          row.setupDateType = ''
        }
      }
      let { 
        confirmStatus, 
        oid, 
        groupCode, 
        companyCategory, 
        bdEmployeeId, 
        refuseReason, 
        setupDateType, 
        corpName, 
        emplName, 
        mobile,
        uscc,
        industry,
        scale,
        address,
        roleTypes,
        shortName,
        shortEname,
        countryCode,
        indexAddr,
        entType,
        legalPerson,
        regCapital,
        registerAddress
      } = row
      let api = confirmStatus === 'pass' ? customerVerify : customerRefuse
      let data =
        confirmStatus === 'pass'
          ? {
              oid,
              groupCode,
              companyCategory,
              bdEmployeeId,
              crmCustSyncDto: {
                setupDate: time,
                setupDateType,
                custid: this.crm && this.crm.custid ? this.crm.custid : '',
                companyName: corpName,
                emplName,
                mobile,
                uscc,
                industry,
                scale,
                detailAddr: address,
                roleTypes,
                companyCategory,
                shortName,
                shortEname,
                countryCode,
                country: countyItem ? countyItem.cname : '',
                province: indexAddr[0]? indexAddr[0]: '',
                city: indexAddr[1] ? indexAddr[1]: '',
                district: indexAddr[2] ? indexAddr[2]: '',
                entType,
                legalPerson,
                regCapital,
                registerAddress
              }
            }
          : {
              oid,
              groupCode,
              refuseReason,
            }
      // console.log(1, row)
      // console.log(2, data)
      // console.log(api)
      api(data)
        .then((res) => {
          if (res.code === 0) {
            let text = confirmStatus === 'pass' ? '客户审核通过' : '客户审核拒绝'
            this.$msgSucClose(text)
            this.$parent.getData()
            this.cancel()
          }
        })
        .catch(() => {})
    },
  },
}
</script>

<style lang="scss" scoped>
.tips{
  color: #e93f3f;
  font-size: 12px;
  margin-top: -10px;
  margin-bottom: 10px;
}
.title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #000;
}
/deep/ .customer-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  .el-checkbox__label {
    font-size: 12px;
  }
  .el-form-item {
    margin-right: 0;
    flex-basis: 33%;
    display: flex;
    .el-form-item__content {
      flex: 1;
      .el-select,
      .el-cascader {
        width: 100%;
      }
    }
    &.flex-item {
      flex-basis: 100%;
    }
  }
}
.compare-box {
  margin-top: 10px;
}
</style>
