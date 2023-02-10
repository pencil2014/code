<template>
  <div class="finance-page" style="padding-bottom:20px">
    <div class="detail-title">
      <span>联网对比</span>
      <OpBtnDialog
        ref="opBtn"
        backText="返回"
        :refuseHide="true"
        :custid="ruleForm.custid"
        :isValid="!!$route.query.valid"
        :isSupplier="!!$route.query.supplier"
        :closeLevel="2"
      />
    </div>
    <CrmCard title="系统录入" style="margin-bottom:20px">
      <ul class="base-info-list">
        <li style="width:100%">
          企业名称：
          <strong :class="{isBad:false}">{{ruleForm.name}}</strong>
        </li>
        <li
          v-for="item in netSearchData"
          :key="item.prop"
          :class="{'block-li':item.block}"
        >{{item.label}}：{{item.propInDict ? dictMapObj[item.propInDict][ruleForm[item.prop]] : ruleForm[item.prop]}}</li>
      </ul>
    </CrmCard>
    <CrmCard title="网上查询">
      <ul class="base-info-list" v-show="hasData">
        <li style="width:100%">
          企业名称：
          <strong :class="{isBad:false,red:searchInfo['name']!=ruleForm['name']}">{{searchInfo.name}}</strong>
        </li>
        <li v-for="item in netBaseSearchData" :key="item.prop" :class="{'block-li':item.block}">
          {{item.label}}：<span
          :class="{red:searchInfo[item.prop]!=ruleForm[item.prop]}"
          >{{searchInfo[item.prop]||'空'}}</span>
        </li>
      </ul>
      <p v-show="noData" style="color:#cd4130;text-align:center">无此公司信息</p>
    </CrmCard>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { netBaseData, netBaseSearchData } from '@/views/crm/data'
import CrmForm from '@/views/crm/components/crmForm'
import CrmCard from '@/views/crm/components/card'
import OpBtnDialog from './components/opBtnDialog'
import CUSTOMER from '@/api/crm/customer'
import { parseTime } from '@/utils'
import { formatIndustry } from '@/utils/crm'
export default {
  name: 'baseEdit',
  components: { CrmForm, CrmCard, OpBtnDialog },
  inject: ['telRules', 'emailRules'],
  data: function () {
    return {
      hasData: false,
      noData: false,
      netSearchData: netBaseData,
      netBaseSearchData,
      searchInfo: {},
      ruleForm: {},
    }
  },
  computed: {
    ...mapGetters(['dictMapObj']),
  },
  activated() {
    let crm = this.$store.state.crm
    console.log(crm)
    let verifyCheckBase = this.$route.query.supplier ? crm.supplier.verifyCheckBase : crm.verifyCheckBase
    if(crm.verifyCheckBase.industry){
      crm.verifyCheckBase.industry = formatIndustry(crm.verifyCheckBase.industry)
    }
    if (!Object.keys(verifyCheckBase).length) {
      return this.$refs.opBtn.back()
    }
    console.log(verifyCheckBase)
    this.ruleForm = { ...(verifyCheckBase || {}) }
    this.ruleForm.scale = this.ruleForm._scale
    this.searchCustomer(this.ruleForm.uscc || this.ruleForm.name)
    console.log('netSearchData',this.netSearchData)
    console.log('ruleForm',this.ruleForm)
    console.log('netBaseSearchData',this.netBaseSearchData)
  },
  created() {},
  methods: {
    searchCustomer(keywords) {
      CUSTOMER.aiqichaDetail({ keywords,isCompare:true })
        .then((res) => {
          let searchInfo = res.data
          if (!searchInfo) return this.initNoData(true)
          this.searchInfo = {
            name: searchInfo.name,
            uscc: searchInfo.creditCode,
            taxId: searchInfo.creditCode,
            entType: searchInfo.companyOrgType,
            industry: searchInfo.industry,
            usccExpDate: searchInfo.toTime && parseTime(searchInfo.toTime, '{y}-{m}-{d}'),
            setupDate: parseTime(searchInfo.estiblishTime, '{y}-{m}-{d}'),
            registerAddr: searchInfo.regLocation,
            indexAddr: searchInfo.base,
            legalPerson: searchInfo.legalPerson,
            regCapital: searchInfo.regCapital,
            socialStaffNum: searchInfo.socialStaffNum,
            // staffNumRange: searchInfo.staffNumRange,
            scale:searchInfo.staffNumRange
          }
          this.initNoData(false)
        })
        .catch((err) => {
          console.log(err)
          this.initNoData(true)
        })
    },
    initNoData(noData) {
      this.noData = !!noData
      this.hasData = noData === false
    },
  },
}
</script>
<style lang="scss" scoped>
.detail-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9e9e9;
  padding: 10px 20px;
  margin-bottom: 20px;
  & > span {
    font-size: 16px;
    font-weight: 600;
    color: #222222;
  }
  .el-button {
    margin-bottom: 0;
  }
}
.isBad::after {
  content: '（被执行人）';
  color: #cd4130;
}
.red {
  color: #cd4130;
}
</style>
