<template>
  <div
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    class="contract-info"
    v-loading="lsLoading"
  >
    <div class="top-box">
      <div class="title">合同信息</div>
      <div class="but-box">
        <el-button-group>
          <el-button @click="cancel" size="mini" type="primary">返回</el-button>
        </el-button-group>
      </div>
    </div>
    <div class="info-box">
      <div class="base-item">
        <span class="sub-title">合同信息编号：</span>
        {{ info.contractCode }}
      </div>
      <div class="base-item">
        <span class="sub-title">合同编号：</span>
        {{ info.contractNo }}
      </div>
      <div class="base-item">
        <span class="sub-title">合同类型：</span>
        {{  dictMapObj['supplierContractTypes'][info.contractType] }}
      </div>
        <div class="base-item">
        <span class="sub-title">合同签署类型：</span>
        {{  dictMapObj['supplierContractSignType'][info.contractSignType] }}
      </div>
      <div class="base-item" v-if="info.isPayDeposit">
        <span class="sub-title">是否交押金：</span>
        {{ info.isPayDeposit | formatIsPayDeposit(info) }}
      </div>
      <div class="base-item">
        <span class="sub-title">是否有效：</span>
        {{ dictMapObj['commonStatus'][info.status] }}
      </div>
      <div class="base-item">
        <span class="sub-title">我司分公司：</span>
        <el-tooltip :content="info.companies_multiValue" placement="top">
          <p class="text-over">{{ info.companies_multiValue }}</p>
        </el-tooltip>
      </div>
      <div class="base-item">
        <span class="sub-title">签订人：</span>
        {{ info.signEmployeeName }}<span v-if="info.signEmployeeId">({{ info.signEmployeeId || '' }})</span>
      </div>
      <div class="base-item">
        <span class="sub-title">有效时间：</span>
        {{ info.effectBeginDate }} -
        {{
          info.effectEndDate === '9999-12-31' ? '永久有效' : info.effectEndDate
        }}
      </div>
      <div class="base-item">
        <span class="sub-title">结算周期：</span>
        {{ dictMapObj['supplierContractSettleCycle'][info.settleCycle] }}
      </div>
      <div class="base-item">
        <span class="sub-title">信用额度CNY：</span>
        {{ info.creditAmountCny }}
      </div>
      <div class="base-item">
        <span class="sub-title">信用额度USD：</span>
        {{ info.creditAmountUsd }}
      </div>
      <div class="base-item flex-item">
        <span class="sub-title">业务类型：</span>
        {{ info.businessTypes_multiValue }}
      </div>
      <div class="base-item flex-item">
        <span class="sub-title">附件：</span>
        <div class="file-box">
          <el-button
            :key="item.fileNo"
            @click="handleView(item)"
            class="download"
            style="font-size: 12px; padding: 0"
            type="text"
            v-for="item in info.files"
            >{{ item.fileName }}</el-button
          >
        </div>
      </div>
      <div class="base-item flex-item">
        <span class="sub-title">备注：</span>
        {{ info.remark }}
      </div>
      <div class="base-item">
        <span class="sub-title">创建人：</span>
        {{ info.createdName }}
      </div>
      <div class="base-item">
        <span class="sub-title">创建时间：</span>
        {{ info.createdTime }}
      </div>
      	      <!-- 新增两个字段 -->
      <div class="base-item">
        <span class="sub-title">到期提醒：</span>
        <span v-if="info.expireNoticeTime>0">还剩 {{ info.expireNoticeTime }} 天</span>
        <span v-else-if="info.expireNoticeTime===0">今天到期</span>
        <span v-else-if="info.effectEndDate==='9999-12-31'">---</span>
        <span v-else>已到期</span>
      </div>
      <div class="base-item">
        <span class="sub-title">到期状态：</span>
        <span v-if="info.expireStatus==='unexpired'">未到期</span>
        <span v-if="info.expireStatus==='expire'">到期</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { supContractDetail } from '@/api/crm/contract'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass
  },
  props: {
    infoData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      lsLoading: false,
      info: {}
    }
  },
  created() {
    this.getData()
  },
  activated() {
    this.getData()
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj'])
  },
  methods: {
    closeAddLine() {
      this.showLineOption.show = false
    },
    // 获取合同详情
    getData() {
      const { contractId } = this.infoData
      const data = {
        contractId
      }
      this.lsLoading = true
      supContractDetail(data)
        .then((res) => {
          if (res.code === 0) {
            const businessTypes_multiValue = res.data.businessTypes
              .map((item) => {
                return this.dictMapObj['baseBusinessType'][item]
              })
              .join(', ')
            const companies_multiValue = res.data.companies
              .map((item) => item.companyName)
              .join(', ')
            this.info = Object.assign({}, res.data, {
              businessTypes_multiValue,
              companies_multiValue
            })
          }
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
    // 返回
    cancel() {
      this.$emit('cancel')
    },
    // 附件预览
    handleView(file) {
      let { fileNo, fileName, suffix } = file
      fileName = fileName.includes('.') ? fileName : `${fileName}.${suffix}`
      fileName = fileName.replace(/[\[|\]|\{|\}|\%|`]/g, '')
      const href = `/base/fileView/preview/${fileNo}/${fileName}`
      window.open(href)
    }
  },
  filters: {
    formatIsPayDeposit(val, info) {
      if (!val) {
        return ''
      }
      const { depositAmount, depositCurrency } = info
      return val === 'yes'
        ? `是 (${depositAmount || ''}${depositCurrency || ''})`
        : '否'
    }
  }
}
</script>

<style lang="scss" scoped>
.contract-info {
  .top-box {
    display: flex;
    flex-wrap: nowrap;
    margin: 8px 8px 15px 8px;
    align-items: center;
    .title {
      font-weight: 600;
      font-size: 14px;
      flex: 1;
    }
  }
  .info-box {
    padding: 0 8px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    .base-item {
      flex-basis: calc(25% - 10px);
      margin-bottom: 15px;
      margin-right: 10px;
      display: flex;
      align-content: center;
      .sub-title {
        width: 105px;
        text-align: right;
        display: inline-block;
      }
    }
    .flex-item {
      flex-basis: 100%;
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      .file-box {
        flex: 1;
        .download {
          margin-right: 5px;
        }
      }
    }
    .text-over {
      display: inline-block;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      max-width: 240px;
    }
  }
  .creditQuota-box,
  .settlement-box {
    margin-top: 20px;
    .title {
      font-size: 14px;
      font-weight: 600;
      margin: 8px;
    }
  }
}
</style>
