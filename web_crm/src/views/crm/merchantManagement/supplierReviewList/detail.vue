<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-container">
      <div class="refuse-box" v-if="status == 'valid' || baseInfo.orgVerifyDto.modifyReason">
        <span>信息已修改，请及时审核</span>
        <span>申请人：{{baseInfo.orgVerifyDto.createdName}}</span>
        <span>申请时间：{{baseInfo.orgVerifyDto.createdTime}}</span>
        <span>修改原因：{{baseInfo.orgVerifyDto.modifyReason}}</span>
      </div>
      <div class="detail-header">
        <div>
          <i class="el-icon-folder-remove"></i>
          <span class="detail-title">{{ baseInfo.name }}</span>
        </div>
        <OpBtnDialog :custid="custid" :isSupplier="true" />
      </div>
      <div class="finance-search-list-gap"></div>
      <InfoList :updateInfo="updateInfo" :custInfo="baseInfo" :bottomB="true" :isSupplier="true">
        <div v-if="$store.state.user.roles.includes('sps')">
          <el-tooltip content="大陆以外的供应商不支持联网对比，请自行查询" placement="bottom">
              <i class="el-icon-question"></i>
            </el-tooltip>
          <el-button size="mini" @click="check">联网对比</el-button>
        </div>
      </InfoList>
      <div style="height:10px"></div>
      <TitleTable title="联系人" :data="linkData" :columns="linkColumns" />
      <TitleTable title="银行信息" :data="bankData" :columns="bankColumns" />
      <TitleTable title="附件信息" :data="attachData" :columns="attachColumns" />
    </div>
    <FixedBottom :baseInfo="baseInfo" />
  </div>
</template>
<script>
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { addBaseLinkData, accountInfoColumns, baseAttachTable } from '@/views/crm/data'
import InfoList from '@/views/crm/components/infoList'
import TitleTable from '@/views/crm/components/titleTable'
import OpBtnDialog from '../customerReviewList/components/opBtnDialog'
import FixedBottom from '@/views/crm/merchantManagement/customerReviewList/components/fixedBottom'
import Company from '@/views/crm/components/company'
import SUPPLIER from '@/api/crm/supplier'
import { mapGetters, mapState } from 'vuex'
const ATTACHCOL = [...baseAttachTable]
ATTACHCOL[0] = { prop: 'name', label: '附件名称', type: 'button', callback: ({ fileNo, name,suffix }) => {
        name = name.replace(/[\[|\]|\{|\}|\%|`]/g,'')
        const href = `/base/fileView/preview/${fileNo}/${name}`
        window.open(href)
      }}
/******** 自动引入组件  --end  ******** */
export default {
  name: 'crmDetail',
  mixins: [routerMixin],
  components: { InfoList, TitleTable, OpBtnDialog, Company, FixedBottom },
  computed: {
    ...mapGetters(['dictMapObj']),
    ...mapState('user', ['userId', 'deptCode']),
    updateInfo() {
      return (this.baseInfo || {}).updateInfo || {}
    },
  },
  data() {
    return {
      orgid: '',
      baseInfo: { orgVerifyDto: {}, backupInfo: {} },
      linkData: [],
      linkColumns: addBaseLinkData,
      attachData: [],
      attachColumns: ATTACHCOL,
      bankData: [],
      bankColumns: accountInfoColumns,
      company: 'struct',
      custStruct: { old: {}, new: {} },
      custRelation: { old: [], new: [] },
      status: '',
      custid: '',
    }
  },
  // watch: {
  //   custid: {
  //     handler(val) {
  //       if (!val) return
  //       console.log(val)
  //       this.initData(val)
  //     },
  //     immediate: true,
  //   },
  // },
  methods: {
    // 客户类型转换成显示内容
    convertRole(arr, dict, key) {
      // console.log(arr, dict, key)
      return arr
        .map((v) => v[key].toLowerCase())
        .join('+')
        .replace(/\b(\w+)\b/g, (v) => dict[v] || '-')
    },
    // 返回的数据转换成请求和显示需要的结构和字段
    convertData({ org, biztypeDtos, categoryDtos, serviceItemDtos }) {
      // console.log(this.dictMapObj)
      let { crmCategory, crmBusiness, crmService } = this.dictMapObj
      let _categoryDtos = this.convertRole(categoryDtos, crmCategory, 'category')
      let _biztypeDtos = this.convertRole(biztypeDtos, crmBusiness, 'businessType')
      let _serviceItemDtos = this.convertRole(serviceItemDtos, crmService, 'serviceCode')
      return { ...org, biztypeDtos, _biztypeDtos, categoryDtos, _categoryDtos, serviceItemDtos, _serviceItemDtos }
    },
    // 获取详情信息
    initData(custid) {
      this.lsLoading = true
      SUPPLIER.verifyInfo({ supplierId: custid })
        .then((res) => {
          // let { organizationDto, roles, customerDto, bds, orgVerifyDto } = res.data
          let { organizationDto: org, biztypeDtos, categoryDtos, supplierDto, orgVerifyDto, serviceItemDtos } = res.data
          this.linkData = res.data.contact || []
          this.attachData = res.data.attachment || []
          this.bankData = res.data.account || []
          let { orgid, verifyStatus, status, updatedName, updatedTime, mtEmployeeName, mtDeptName } = supplierDto
          let oldData = this.convertData({ org, biztypeDtos, categoryDtos, serviceItemDtos })
          // orgVerifyDto修改状态的信息（拒绝、原因等） verifyStatus 修改状态
          this.baseInfo = {
            backupInfo: supplierDto,
            ...oldData,
            orgid,
            verifyStatus,
            orgVerifyDto,
            updatedName,
            updatedTime,
            custid,
          }
          this.baseInfo.supplierBd = !mtEmployeeName ? '' : { mtEmployeeName, mtDeptName }
          this.baseInfo.indexAddr = org.province && `${org.province}/${org.city}/${org.district}`
          console.log(this.baseInfo.supplierBd)
          this.status = status
          if (status == 'valid') {
            // let { updateOrganizationDto: org, updateRoles: roles } = res.data
            let {
              updateOrganizationDto: org,
              updateBiztypeDtos: biztypeDtos,
              updateCategoryDtos: categoryDtos,
              updateServiceItemDtos: serviceItemDtos,
            } = res.data
            this.baseInfo.updateInfo = this.convertData({ org, biztypeDtos, categoryDtos, serviceItemDtos })
            this.baseInfo.updateInfo.custid = custid
            this.baseInfo.updateInfo.indexAddr = org.province ? `${org.province}/${org.city}/${org.district}` : ''
          }
          console.log(this.baseInfo)
          this.lsLoading = false
        })
        .catch((err) => {
          this.lsLoading = false
          console.log(err)
          this.routerDelBack()
        })
    },
    check() {
      let country = this.updateInfo.country || this.baseInfo.country
      if (country !== '中国') {
        return this.$msgErrClose('大陆以外的供应商不支持联网对比，请自行查询')
      }
      console.log(this.status == 'valid' ? this.baseInfo.updateInfo : this.baseInfo)
      this.$store.commit('crm/supplier/setVerifyCheckBase', this.status == 'valid' ? this.baseInfo.updateInfo : this.baseInfo)
      this.routerPush('SupplierReviewCheckBase', { valid: this.status == 'valid' ? true : '', supplier: true })
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (!to.meta.isUseCache) {
        vm.custid = to.query.custid
        vm.initData(vm.custid)
      }
    })
  },
}
</script>
<style lang="scss" scoped>
@import '../customerList/scss/detail.scss';
.finance-page {
  border-bottom: 20px solid #f8f9fd;
}
.company-tree-container {
  overflow: auto;
  box-sizing: content-box;
  // height: 450px;
  // padding: 0 40px;
  user-select: none;
  text-align: center;
}
.el-icon-question{
  font-size: 16px;
  color: #aaa;
  cursor: pointer;
  margin-right: 5px;
}
</style>
