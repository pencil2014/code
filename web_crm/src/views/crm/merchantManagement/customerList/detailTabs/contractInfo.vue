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
        <span class="sub-title">合同类型：</span>
        {{dictMapObj['customerContractType'][info.contractType]}}
      </div>
      <div class="base-item">
        <span class="sub-title">合同编号：</span>
        {{info.contractNo}}
      </div>
      <div class="base-item">
        <span class="sub-title">有效时间：</span>
        {{info.effectStartDate}} - {{info.effectEndDate === '9999-12-31' ? '永久有效': info.effectEndDate}}
      </div>
      <div class="base-item">
        <span class="sub-title">业务类型：</span>
        <span>{{info.contractBusinessTypeList_multiValue}}</span>
      </div>
      <div class="base-item">
        <span class="sub-title">共享公司：</span>
        <el-tooltip :content="info.contractRelCustList_multiValue" placement="top">
          <p class="text-over">{{ info.contractRelCustList_multiValue || '无' }}</p>
        </el-tooltip>
      </div>
      <div class="base-item">
        <span class="sub-title">我司分公司：</span>
        <el-tooltip :content="info.contractCompanyList_multiValue" placement="top">
          <p class="text-over">{{ info.contractCompanyList_multiValue || '无' }}</p>
        </el-tooltip>
      </div>
      <div class="base-item flex-item">
        <span class="sub-title">附件：</span>
        <div class="file-box">
          <el-button
            :key="item.fileNo"
            @click="handleView(item)"
            class="download"
            style="font-size:12px;padding:0;"
            type="text"
            v-for="item in info.contractFileList"
          >{{item.fileName}}</el-button>
        </div>
      </div>
      <div class="base-item flex-item">
        <span class="sub-title">备注：</span>
        {{ info.remark || '无'}}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { contractDetail } from '@/api/crm/control'
export default {
  props: {
    infoData: {
      type: Object,
      default: () => {}
    },
    custid: {
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
  computed: {
    ...mapGetters(['dictMap','dictMapObj'])
  },
  activated() {
    this.getData()
  },
  methods: {
    // 获取合同详情
    getData() {
      const { contractId } = this.infoData
      const data = {
        contractId,
        custid: this.custid,
      }
      this.lsLoading = true
      contractDetail(data)
        .then(res => {
          if (res.code === 0) {
            // 合同信息
            let { contractBusinessTypeList, contractCompanyList, contractRelCustList} = res.data
            const contractBusinessTypeList_multiValue = contractBusinessTypeList
              .map(item => this.dictMapObj['baseBusinessType'][item.businessType])
              .join('，')
            const contractCompanyList_multiValue = contractCompanyList
              .map(item => item.companyName)
              .join('，')
            const contractRelCustList_multiValue = contractRelCustList.map(item => item.relCustName)
              .join('，')
            this.info = Object.assign({}, res.data, {
              contractBusinessTypeList_multiValue,
              contractCompanyList_multiValue,
              contractRelCustList_multiValue
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
      fileName = fileName.replace(/[\[|\]|\{|\}|\%|`]/g,'')
      const href = `/base/fileView/preview/${fileNo}/${fileName}`
      window.open(href)
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
      flex-basis: calc(50% - 10px);
      margin-bottom: 10px;
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
