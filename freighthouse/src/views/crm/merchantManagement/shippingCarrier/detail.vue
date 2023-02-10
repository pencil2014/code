<template>
  <div
    class="finance-page"
    :class="{isNotSelf:!isSelf}"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-container">
      <!-- <div class="change-suc-box" v-if="orgNoticeDto.noticeStatus=='no'">
        <span>基本信息已修改</span>
        <i class="el-icon-close" @click="changeConfirm"></i>
      </div> -->
      <!-- <div
        class="refuse-box"
        v-if="baseInfo.orgVerifyDto&&baseInfo.orgVerifyDto.showStatus === 'yes'"
      >
        <el-tag>拒</el-tag>
        <span>你的审核已拒绝，拒绝原因：{{ dictMapObj.verifyRejection[baseInfo.orgVerifyDto.refuseReason] }}</span>
        <span
          v-if="baseInfo.orgVerifyDto.refuseRemark"
        >拒绝备注：{{ baseInfo.orgVerifyDto.refuseRemark }}</span>
        <i class="el-icon-close" @click="refuseConfirm"></i>
      </div> -->
      <div class="detail-header">
        <div>
          <i class="el-icon-folder-remove"></i>
          <span class="detail-title">{{ baseInfo.backupInfo.shippingCarrierCode }}</span>
        </div>
        <div>
          <el-button @click="goBack" size="mini">返回</el-button>
          <!-- 业务改动内容 -->
          <!-- <el-button
            v-if="(isEdit || isRefused) && isSelf && !isRecycle"
            type="primary"
            icon="el-icon-check"
            @click="updateSubmit(true)"
            size="mini"
          >提交审核</el-button> -->
          <!-- <el-button v-if="isSps && !isRecycle" type="primary" @click="removeShow" size="mini">解绑</el-button> -->
        </div>
      </div>
      <div class="finance-search-list-gap"></div>
      <el-tabs class="fin-el-tabs" v-model="activeItem">
      <el-tab-pane v-for="item in panes" :key="item.name" :label="item.label" :name="item.name"></el-tab-pane>
      </el-tabs>
      <keep-alive>
        <component
          :ref="activeItem"
          :isEdit.sync="isEdit"
          :custid="custid"
          :orgid="baseInfo.orgid"
          :companyName="baseInfo.name"
          :is="component"
          :isJumpRouteFromPage.sync="isJumpRouteFromPage"
          :isManager="isManager"
          :isSelf="isSelf && !isRecycle"
          :isShipC="true"
          :isValid="baseInfo.status"
        />
      </keep-alive>
    </div>
    <!-- <CrmDialog :option="dialogOption" @close="close" ref="dialogVerify" v-if="dialogOption.show" /> -->
    <FixedBottom :baseInfo="baseInfo" v-show="activeItem == panes[0].name"/>
  </div>
</template>
<script>
import { netSearchData } from '@/views/crm/data'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import CrmDialog from '@/views/crm/components/crmDialog'
import CrmCard from '@/views/crm/components/card'
import FixedBottom from '@/views/crm/merchantManagement/customerReviewList/components/fixedBottom'
import { shippingCarrierInfo } from '@/api/crm/shippingCarrier'
import SUPPLIER from '@/api/crm/supplier'
import { mapGetters, mapState } from 'vuex'
import FOLLOW from '@/api/crm/orgCommunication'
import CUSTOMER from '@/api/crm/customer'
import { parseTime } from '@/utils'
import { listByRole } from '@/api/base'
// 审核人列表
const RLIST = []
const context = require.context('../customerList/detailTabs', false, /Tab.vue$/)
const panes = context
  .keys()
  .map((item) => context(item).default)
  .filter((item) => !item.hidden && item.shipperShow)
//根据组件name属性最后一位数字进行排序 更改页面tab显示顺序需到组件内更改组件name值
panes.sort((a, b) => a.name.slice(-1).charCodeAt() - b.name.slice(-1).charCodeAt())
/******** 自动引入组件  --end  ******** */
export default {
  name: 'crmDetail',
  mixins: [routerMixin],
  components: {
    CrmDialog,
    CrmCard,
    FixedBottom,
  },
  // provide() {
  //   return {
  //     // relationCfg: this.relationCfg,
  //   }
  // },
  inject: ['defaultRules'],
  computed: {
    component() {
      return panes.find(({ name }) => this.activeItem === name)
    },
    ...mapGetters(['dictMapObj']),
    ...mapState('crm/supplier', ['detailEditInfo']),
    // ...mapState('crm/supplier', ['isEdit', 'detailEditInfo']),
    ...mapState('user', ['userId', 'deptCode']),
    // isLeader() {
    //   return this.detailId && this.userId != this.detailId
    // },
    isSelf() {
      return this.detailId && this.userId == this.detailId
    },
    isPass() {
      return this.baseInfo.verifyStatus == 'pass'
    },
    isSubmit() {
      return this.baseInfo.verifyStatus == 'submit'
    },
    isRefused() {
      return this.baseInfo.verifyStatus == 'refuse'
    },
  },
  data() {
    return {
      isManager: this.$store.state.user.roles.includes('manager'),
      isSps: this.$store.state.user.roles.includes('sps'),
      isEdit: false,
      orgid: '',
      baseInfo: { orgVerifyDto: {}, backupInfo: {} },
      panes: panes,
      activeItem: panes[0].name,
      detailId: '', //维护人id 没有维护人(新建未通过审核时)用创建人q
      custid: '',
      hasData: false,
      noData: false,
      netSearchData,
      searchInfo: {},
      orgNoticeDto: {},
      isRecycle: false,
    }
  },
  watch: {
    isEdit(VAL) {
      console.log(VAL)
    },
  },
  created() {
    // this.getEmployeeRoles()
  },
  methods: {
    // 初始化网络搜索无数据
    initNoData(noData) {
      this.noData = !!noData
      this.hasData = noData === false
    },
    // 获取详情信息
    initData(custid) {
      this.lsLoading = true
      this.isEdit = false
      this.activeItem = panes[0].name
      let data ={ shippingCarrierId: custid } 
      // let method = this.custid ? SUPPLIER.verifyInfo : FOLLOW.supplierOrgDetail
      // let data = this.custid ? { supplierId: custid } : { orgid: custid }
      shippingCarrierInfo(data)
        .then((res) => {

          console.log('res',res)
          let { organizationDto,shippingDto, orgVerifyDto } = res.data
          // 预设默认值时,值为null就会失效
          organizationDto = organizationDto || {}
          shippingDto = shippingDto || {}
          orgVerifyDto = orgVerifyDto || {}
          let {
            orgid,
            mtDate,
            verifyStatus,
            status,
            mtEmployeeId,
            mtEmployeeName,
            mtDeptName,
            updatedName,
            updatedTime,
            createdBy,
            isBlacklist,
            isRecycle,
          } = shippingDto
          if (isBlacklist === 'yes') return this.goBack()
          this.isRecycle = isRecycle === 'yes'
          this.orgNoticeDto = res.data.orgNoticeDto || {}
          this.custid = shippingDto.shippingCarrierId
          this.detailId = mtEmployeeId || createdBy
          // this.backupType = biztypeDtos
          // this.backupCategory = categoryDtos
          // this.backupService = serviceItemDtos
          let { province, city, district } = organizationDto
          organizationDto.indexAddr = province ? (district ? [province, city, district] : [province, city]) : []
          // let oldData = this.convertData({ org: organizationDto })
          // orgVerifyDto修改状态的信息（拒绝、原因等） verifyStatus 修改状态
          this.baseInfo = {
            backupInfo: shippingDto,
            ...organizationDto,
            orgid,
            mtDate,
            verifyStatus,
            status,
            orgVerifyDto,
            mtEmployeeName,
            supplierBd: { mtEmployeeName, mtDeptName },
            supplierBdStr: mtEmployeeName + ' ' + mtDeptName,
            updatedName,
            updatedTime,
          }
          this.dialogOptionFormVerifier = orgVerifyDto && orgVerifyDto.verifier
          if (verifyStatus == 'submit') {
            let {
              updateOrganizationDto: org,
            } = res.data
            org = org || {}
            let { province, city, district } = org
            org.indexAddr = province ? (district ? [province, city, district] : [province, city]) : []
            // this.baseInfo.updateInfo = this.convertData({ org, biztypeDtos, categoryDtos, serviceItemDtos })
          }
          console.log(`船司基本信息`, this.baseInfo.status)
          this.$store.commit('crm/supplier/setDetailBaseInfo', this.baseInfo)
        })
        .finally(() => {
          this.lsLoading = false
        })
      // .catch(this.routerDelBack)
    },
    goBack() {
      this.routerBack()
    },
    // verifySubmit(type) {
    //   this.$refs.dialogVerify.$refs.form.validate((valid) => {
    //     if (!valid) return
    //     if (type === 'replace') {
    //       this.isReplace = true
    //     } else {
    //       this.isReplace = false
    //     }
    //     this.close(true)
    //   })
    // },

    // updateSubmit(flag) {
    //   if (flag === true) {
    //     if (this.$refs.CUST1) {
    //       this.$refs.CUST1.saveBaseInfo()
    //     }
    //     if (this.yesNoSumit === 'no') {
    //       !this.$refs.CUST1 && this.$msgErrClose('请补全基本信息必填项！')
    //       return
    //     }
    //     // this.dialogOption.form.verifier = this.dialogOptionFormVerifier
    //     // this.dialogOption.show = true
    //     // setTimeout(() => {
    //     //   this.dialogOption.form.verifier = this.dialogOptionFormVerifier
    //     // }, 200)
    //   } else {
    //     this.yesNoSumit = flag
    //   }
    // },

  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      let { custid, orgid } = to.query
      if (to.meta.isUseCache == false) {
        console.log('custid',custid)
        vm.orgid = orgid
        vm.custid = custid
        vm.initData(custid || orgid)
        return
      }
      if (custid && custid != vm.custid) {
        vm.orgid = ''
        vm.custid = custid
        vm.initData(custid)
      } else if (orgid && orgid != vm.orgid) {
        vm.custid = ''
        vm.orgid = orgid
        vm.initData(orgid)
      }
    })
  },
}
</script>
<style lang="scss" scoped>
@import '../customerList/scss/detail.scss';
.finance-page ::v-deep .el-tabs__header {
  user-select: none;
}
// 管理者页面样式，用来控制管理者页面隐藏的元素
.isNotSelf ::v-deep {
  // .company-action,
  .notSelf-hide {
    display: none !important;
  }
}
.check-slot {
  display: flex;
  justify-content: space-between;
  & > div {
    margin: 0;
    width: 49%;
    font-size: 12px;
  }
  .base-info-list li {
    width: 50%;
    &.block-li {
      width: 100%;
    }
  }
}
</style>
