<template>
  <div class="foreign-detail-box">
    <div class="tab-box">
      <div class="title">To be shown as Consignee on MBL</div>
      <el-row :gutter="5">
        <el-col :span="3" class="form-title">
          <span>Prepaid contract(rate)</span>
        </el-col>
        <el-col :span="21">
          <div v-for="(prepaidItem, prepaidIndex) in foreignPeerInfo.prepaidContractList" :key="prepaidIndex" class="form-box">
            <el-row :gutter="5">
              <el-col :lg="6" :md="12">
                <span>Country: {{ prepaidItem.countryEname }}</span>
              </el-col>
              <el-col :lg="6" :md="12">
                <span>Company name: {{ prepaidItem.companyName }}</span>
              </el-col>
              <el-col :lg="12" :md="24">
                <span>CNPJ number/RUT number/TAX ID number/other ID number: {{ prepaidItem.cnpjNumber }}</span>
              </el-col>
              <el-col :lg="6" :md="12">
                <span>POD: {{ prepaidItem.pod }}</span>
              </el-col>
              <el-col :lg="6" :md="12">
                <span>AOD: {{ prepaidItem.aod }}</span>
              </el-col>
            </el-row>
            <el-row :gutter="5">
              <el-col :span="24">
                <span>Address: {{ prepaidItem.address }}</span>
              </el-col>
              <el-col :span="24">
                <span>Contact person: {{ prepaidItem.contact }}</span>
              </el-col>
              <el-col :lg="6" :md="12">
                <span>Tel: {{ prepaidItem.tel }}</span>
              </el-col>
               <el-col :lg="6" :md="12">
                <span>Fax: {{ prepaidItem.fax }}</span>
              </el-col>
              <el-col :lg="6" :md="12">
                <span>Contact email: {{ prepaidItem.email }}</span>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="5">
        <el-col :span="3" class="form-title">
          <span>Carrier/Collect contract(rate)</span>
        </el-col>
        <el-col :span="21">
          <div v-for="(collectItem, collectIndex) in foreignPeerInfo.collectContractList" :key="collectIndex" class="form-box">
            <el-row :gutter="5">
              <el-col :lg="6" :md="12">
                <span>Carrier(sea): {{ collectItem.carrierSea }}</span>
              </el-col>
              <el-col :lg="18" :md="12">
                <span>Collect contract: {{ collectItem.collectContract }}</span>
              </el-col>
              <el-col :lg="6" :md="12">
                <span>Country: {{ collectItem.countryEname }}</span>
              </el-col>
              <el-col :lg="6" :md="12">
                <span>Company name: {{ collectItem.companyName }}</span>
              </el-col>
              <el-col :lg="12" :md="24">
                <span>CNPJ number/RUT number/TAX ID number/other ID number: {{ collectItem.cnpjNumber }}</span>
              </el-col>
              <el-col :lg="6" :md="12">
                <span>POD: {{ collectItem.pod }}</span>
              </el-col>
              <el-col :lg="6" :md="12">
                <span>AOD: {{ collectItem.aod }}</span>
              </el-col>
            </el-row>
            <el-row :gutter="5">
              <el-col :span="24">
                <span>Address: {{ collectItem.address }}</span>
              </el-col>
              <el-col :span="24">
                <span>Contact person: {{ collectItem.contact }}</span>
              </el-col>
              <el-col :lg="6" :md="12">
                <span>Tel: {{ prepaidItem.tel }}</span>
              </el-col>
               <el-col :lg="6" :md="12">
                <span>Fax: {{ prepaidItem.fax }}</span>
              </el-col>
              <el-col :lg="6" :md="12">
                <span>Contact email: {{ prepaidItem.email }}</span>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
    </div>
    <el-form :inline="true" :model="foreignPeerInfo" label-width="135px" size="mini">
      <div class="finance-search-list-gap"></div>
      <div class="tab-box">
        <div class="title">Agent Background</div>

        <el-row :gutter="10">
          <el-col :span="3" class="form-title">
            <span>Introduced By</span>
          </el-col>
          <el-col :span="21">
            <el-row :gutter="10">
              <el-col :span="3">
                <el-checkbox v-model="foreignPeerInfo.introduced.isLsbd" true-label="Y" false-label="N" disabled>LS BD</el-checkbox>
              </el-col>
              <el-col :span="21">
                <span>Name of Person: {{ foreignPeerInfo.introduced.namePerson }}</span>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="3">
                <el-checkbox v-model="foreignPeerInfo.introduced.isLsAgent" true-label="Y" false-label="N" disabled>LS Agent</el-checkbox>
              </el-col>
              <el-col :span="21">
                <span>Name of Agent: {{ foreignPeerInfo.introduced.nameAgent }}</span>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="3">
                <el-checkbox v-model="foreignPeerInfo.introduced.isOthers" true-label="Y" false-label="N" disabled>Others</el-checkbox>
              </el-col>
              <el-col :span="21">
                <span>Pls specify the source: {{ foreignPeerInfo.introduced.specifySource }}</span>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
      <div class="finance-search-list-gap"></div>
      <div class="tab-box">
        <div class="title">Briefs</div>
        <div class="form-box-content">
          <el-row :gutter="10">
            <el-col :span="6" class="textR">
              <span>Main POL/POD, commodity, volume:</span>
            </el-col>
            <el-col :span="18">
              <span>{{ foreignPeerInfo.briefs.mainPol }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="6" class="textR">
              <span>Belongs to any group/association/network/membership:</span>
            </el-col>
            <el-col :span="18">
              <span>{{ foreignPeerInfo.briefs.membership }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="6" class="textR">
              <span>Competitor:</span>
            </el-col>
            <el-col :span="18">
              <span>{{ foreignPeerInfo.briefs.competitor }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="6" class="textR">
              <span>Biz scope:</span>
            </el-col>
            <el-col :span="18">
              <span>{{ foreignPeerInfo.briefs.bizScope }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="6" class="textR">
              <span>Others:</span>
            </el-col>
            <el-col :span="18">
              <span>{{ foreignPeerInfo.briefs.otherBriefs }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
      <div class="finance-search-list-gap"></div>
      <div class="tab-box">
        <div class="title">Shipping Instruction</div>
        <div class="form-box-content">
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Preferred Carrier(sea):</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.shippingInstruction.preferredCarrierSea}}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Preferred Carrier(air):</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.shippingInstruction.preferredCarrierAir }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Approved Co-loader:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.shippingInstruction.approvedCoLoader }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
      <div class="finance-search-list-gap"></div>
      <div class="tab-box">
        <!-- <div class="title">Documentation Arrangement</div>
        <div class="docArrangement dottedLine">
          <el-checkbox v-model="foreignPeerInfo.billingMethod.isLading" true-label="Y" false-label="N" disabled>Original Master Bills of
            Lading</el-checkbox>
          <el-checkbox v-model="foreignPeerInfo.billingMethod.isLadingTr" true-label="Y" false-label="N" disabled>Master Bills of Lading
            with T/R(telex releasing)</el-checkbox>
          <el-checkbox v-model="foreignPeerInfo.billingMethod.isLadingReleasing" true-label="Y" false-label="N" disabled>Master Bills of
            Lading releasing at destination</el-checkbox>
          <el-checkbox v-model="foreignPeerInfo.billingMethod.isSeawayBills" true-label="Y" false-label="N" disabled>Seaway Bills
          </el-checkbox>
          <el-checkbox v-model="foreignPeerInfo.billingMethod.isOtherBills" true-label="Y" false-label="N" disabled>others</el-checkbox>
          <el-form-item v-if="foreignPeerInfo.billingMethod.isOtherBills" true-label="Y" false-label="N" class="other-bills-item">
            <el-input type="textarea" v-model="foreignPeerInfo.billingMethod.othersBills" maxlength="128" autosize disabled></el-input>
          </el-form-item>
        </div> -->
        <div class="title">If Original MBL</div>
        <div class="form-box-content">
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Use agent courier a/c on cc:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.billingMethod.useAgentCourier }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Use LS courier and debit to agent:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.billingMethod.useLsCourier }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Share courier cost with agent:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.billingMethod.shareCourier }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
      <div class="finance-search-list-gap"></div>
      <div class="tab-box">
        <div class="title">Profit Sharing</div>
        <div class="form-box-content">
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Agent Nomination:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.profitSharing.agentNomination }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>LS Free hand to agent:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.profitSharing.lsFreeAgent }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Joint routed cargo via sales lead:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.profitSharing.jointRouted }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
      <!-- <div class="finance-search-list-gap"></div> -->
      <!-- <div class="tab-box"> -->
        <!-- <div class="title">Accounting Instructions</div>
        <div class="form-box-content">
          <el-row :gutter="10" class="dottedLine">
            <el-col :span="4" class="textR">
              <span>Invoicing:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.accountingInstructions.invoicing }}</span>
            </el-col>
          </el-row>
          <div class="title">Monthly SOA</div>
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Attention:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.accountingInstructions.attention }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Credit Period:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.accountingInstructions.creditPeriod }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Credit Amount Limit:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.accountingInstructions.creditAmountLimit }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Explanation if necessary:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.accountingInstructions.explanation }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Other Remarks:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.accountingInstructions.otherRemarks }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" class="textR">
              <span>Bank Details for any transference.:</span>
            </el-col>
            <el-col :span="20">
              <span>{{ foreignPeerInfo.accountingInstructions.bankDetails }}</span>
            </el-col>
          </el-row>
        </div> -->
      <!-- </div> -->
    </el-form>
    <div class="finance-search-list-gap"></div>
    <div class="tab-box">
      <div class="title">交接资料</div>
      <CrmFile ref="crmFile" type="primary" text="上传附件" :btnHide="true" :tableData="customerSuppleList" :isDisabled="true"></CrmFile>
    </div>
  </div>
</template>

<script>
import CrmFile from '@/views/crm/components/crmFile'
import { mapState } from 'vuex'
import ATTACH from '@/api/crm/attachment'
export default {
  components: { CrmFile },
  props: {
    isForeignPeer: {
      type: Boolean,
      default: false
    },
    baseInfo: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      foreignPeerInfo: {
        prepaidContractList: [
          {
            countryEname: '',
            countryCode: '',
            pod: '',
            aod: '',
            podPortCode: [],
            aodPortCode: [],
            companyName: '',
            cnpjNumber: '',
            address: '',
            contact: '',
            tel:'',
            fax:'',
            email:'',
            flag: 'prepaid'
          }
        ],
        collectContractList: [
          {
            carrierSea: '',
            collectContract: '',
            countryEname: '',
            countryCode: '',
            pod: '',
            aod: '',
            podPortCode: [],
            aodPortCode: [],
            companyName: '',
            cnpjNumber: '',
            address: '',
            contact: '',
            tel:'',
            fax:'',
            email:'',
            flag: 'carrier'
          }
        ],
        introduced: {
          isLsAgent: "N",
          isLsbd: "N",
          isOthers: "N",
          nameAgent: "",
          namePerson: "",
          specifySource: ""
        },
        briefs: {
          mainPol: '',
          membership: '',
          competitor: '',
          bizScope: '',
          otherBriefs: ''
        },
        shippingInstruction: {
          preferredCarrierSea: "",
          preferredCarrierAir: "",
          preferredCarrierSeaArr: [],
          preferredCarrierAirArr: [],
          approvedCoLoader: "",
          approvedCoLoaderArr: []
        },
        billingMethod: {
          isLading: "N",
          isLadingTr: "N",
          isLadingReleasing: "N",
          isSeawayBills: "N",
          isOtherBills: "N",
          othersBills: '',
          useAgentCourier: '',
          useLsCourier: '',
          shareCourier: ''
        },
        profitSharing: {
          agentNomination: '',
          lsFreeAgent: '',
          jointRouted: ''
        },
        accountingInstructions: {
          invoicing: '',
          attention: '',
          creditPeriod: '',
          creditAmountLimit: '',
          explanation: '',
          otherRemarks: '',
          bankDetails: ''
        }
      },
      customerSuppleList: [], //客户补充资料列表
      updateForeignPeerInfo: {}
    }
  },
  created () { },
  mounted () {
    if (this.isForeignPeer) {
      this.getCustomerSuppleFileList()
    }
  },
  computed: {
    ...mapState("crm", {
      c_allBaseInfoReview: (state) => state.allBaseInfoReview,
    }),
    allBaseInfoReview () {
      return this.c_allBaseInfoReview
    }
  },
  watch: {
    allBaseInfoReview: {
      handler (nval, oval) {
        let data = nval
        let objArr = ['contract', 'introduced', 'briefs', 'shippingInstruction', 'billingMethod', 'profitSharing', 'accountingInstructions']
        objArr.forEach(oKey => {
          this.foreignPeerInfo[oKey] = data[oKey] || this.$options.data.call(this).foreignPeerInfo[oKey]
          // if (data[oKey]) {
          //   if (data.customerDto.status === 'create') {
          //     this.foreignPeerInfo[oKey] = data[oKey]
          //   }
          // }
        })
        // if (data.customerDto.status === 'valid') {
        //   this.foreignPeerInfo['contract'] = data['updateContract']
        //   this.foreignPeerInfo['introduced'] = data['updateIntroduced']
        //   this.foreignPeerInfo['briefs'] = data['updateBriefs']
        //   this.foreignPeerInfo['shippingInstruction'] = data['updateShippingInstruction']
        //   this.foreignPeerInfo['billingMethod'] = data['updateBillingMethod']
        //   this.foreignPeerInfo['profitSharing'] = data['updateProfitSharing']
        //   this.foreignPeerInfo['accountingInstructions'] = data['updateAccountingInstructions']
        // }
        let contract = this.foreignPeerInfo['contract']
        if (contract && contract.length) {
          this.foreignPeerInfo.prepaidContractList = contract.filter(item => item.flag === 'prepaid')
          this.foreignPeerInfo.collectContractList = contract.filter(item => item.flag === 'carrier')
        }
        this.$forceUpdate()
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description: 获取客户补充资料列表信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-09 11:07:54
     */
    getCustomerSuppleFileList () {
      let data = {
        custid: this.baseInfo.custid,
        type: "attachment_overseas"
      }
      ATTACH['customerOverseas'](data)
        .then((res) => this.customerSuppleList.splice(0, 1000, ...res.data))
        .catch(() => { })
    }
  }
}
</script>
<style lang="scss" scoped>
.textR {
  text-align: right;
}
.tab-box {
  margin: 8px;
  .title {
    color: #222;
    font-weight: 600;
    font-size: 14px;
    margin: 10px 0;
  }
  .form-title {
    text-align: right;
    font-weight: bold;
  }
}
.form-box {
  background: #f3f3f3;
  padding: 5px 10px;
  margin-bottom: 10px;
  span {
    line-height: 20px;
  }
}
.form-box-content {
  span {
    line-height: 20px;
  }
}
.docArrangement {
  /deep/ .el-checkbox {
    margin-right: 50px !important;
  }
}
.dottedLine {
  border-bottom: 1px dashed #dddddd;
  padding-bottom: 10px;
}
.text-link {
  text-decoration: underline;
  font-size: 12px;
  cursor: pointer;
  color: #1890ff;
}
</style>