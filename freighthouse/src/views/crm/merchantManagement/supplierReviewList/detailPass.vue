<template>
  <div class="finance-page isCustReview">
    <div class="finance-container">
      <div
        class="refuse-box"
        v-if="
          baseInfo.orgVerifyDto && ['YES','yes'].includes(baseInfo.orgVerifyDto.showStatus)
          && baseInfo.orgVerifyDto.verifyStatus==='refuse'
        "
      >
        <el-tag>拒</el-tag>
        <span>拒绝原因：{{ dictMapObj.verifyRejection[baseInfo.orgVerifyDto.refuseReason] }}</span>
        <span>拒绝备注：{{ baseInfo.orgVerifyDto.refuseRemark }}</span>
        <!-- <i class="el-icon-close" @click="refuseConfirm"></i> -->
      </div>
      <div class="detail-header">
        <div>
          <i class="el-icon-folder-remove"></i>
          <span class="detail-title">{{ baseInfo.name }}</span>
        </div>
        <div>
          <el-button class="finance-class" @click="goBack" size="mini">返回</el-button>
          <el-button
            v-if="baseInfo.supplierBd && (isSps || isManager)"
            type="primary"
            @click="removeShow"
            size="mini"
          >解绑</el-button>
          <!-- <el-button
            v-if="!isHideBtn"
            type="danger"
            @click="blackOption.show=true"
            size="mini"
          >列入黑名单</el-button>-->
          <!-- <el-button
            v-if="isBlack"
            type="primary"
            @click="releaseOption.show=true"
            size="mini"
          >解除黑名单</el-button>-->
        </div>
      </div>
      <div class="finance-search-list-gap"></div>
      <el-tabs class="fin-el-tabs" v-model="activeItem">
        <el-tab-pane v-for="item in panes" :key="item.name" :label="item.label" :name="item.name"></el-tab-pane>
      </el-tabs>
      <!-- :detailId="detailId"
      :userId="userId"-->
      <keep-alive>
        <component
          :custid="custid"
          :is="component"
          :isJumpRouteFromPage.sync="isJumpRouteFromPage"
          :isSelf="false"
          :reviewInfo="baseInfo"
          :isSupplier="true"
        />
      </keep-alive>
      <!-- :orgid="orgid" -->
    </div>
    <CrmDialog :option="releaseOption" @close="releaseOp" />
    <CrmDialog :option="blackOption" @close="blackOp" />
    <CrmDialog :option="dialogRemove" @close="removeClose" />
    <FixedBottom :baseInfo="baseInfo" v-show="activeItem == panes[0].name"/>
  </div>
</template>
<script>
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import CrmDialog from '@/views/crm/components/crmDialog'
import FixedBottom from '@/views/crm/merchantManagement/customerReviewList/components/fixedBottom'
import SUPPLIER from '@/api/crm/supplier'
import { baseEmployeeList, listByRole } from '@/api/base'
import BLACK from '@/api/crm/blackList'
import FOLLOW from '@/api/crm/orgCommunication'
import { mapGetters, mapState } from 'vuex'
const NLIST = []
const ELIST = []
/******** 自动引入组件  --begin  省去修改文件名后需要做一系列改动 ******** */
// 更改或添加组件，需遵循文件命名规则，以'Tab.vue'结尾
// 用法 https://webpack.js.org/guides/dependency-management/#require-with-expression
const context = require.context('../customerList/detailTabs', false, /Tab.vue$/)
const panes = context
  .keys()
  .map((item) => context(item).default)
  .filter((item) => !item.hidden)
  .filter((item) => !item.hidden && item.supplierShow)
//根据组件name属性最后一位数字进行排序 更改页面tab显示顺序需到组件内更改组件name值
panes.sort((a, b) => a.name.slice(-1).charCodeAt() - b.name.slice(-1).charCodeAt())
/******** 自动引入组件  --end  ******** */
export default {
  name: 'crmReviewDetail',
  mixins: [routerMixin],
  components: {
    CrmDialog,
    FixedBottom,
  },
  provide() {
    return {
      relationCfg: {
        relationRefresh: false,
        parentObj: {},
        brotherObj: {},
      },
    }
  },
  inject: ['defaultRules'],
  computed: {
    component() {
      return panes.find(({ name }) => this.activeItem === name)
    },
    ...mapGetters(['dictMapObj']),
    // ...mapState('crm', ['isEdit', 'detailEditInfo']),
    ...mapState('user', ['userId', 'deptCode']),
    isHideBtn() {
      return this.baseInfo.verifyStatus === 'refuse' || this.isBlack
    },
  },
  data() {
    return {
      isManager: this.$store.state.user.roles.includes('manager'),
      isSps: this.$store.state.user.roles.includes('sps'),
      baseInfo: { orgVerifyDto: {}, backupInfo: {}, supplierBd: '' },
      panes: panes,
      activeItem: panes[0].name,
      brotherEdit: false,
      parentEdit: false,
      detailId: '', //维护人id
      blackOption: {
        show: false,
        showClear: true,
        title: '加入黑名单',
        form: { blackReason: '', blackRemark: '' },
        formItems: [
          { label: '拉黑原因', prop: 'blackReason', type: 'select', rules: this.defaultRules, propInDict: 'blacklistReason' },
          { label: '拉黑备注', prop: 'blackRemark', type: 'textarea' },
        ],
      },
      // 解除黑名单
      releaseOption: {
        show: false,
        showClear: true,
        title: '解除黑名单',
        form: { belongEmployee: '', deptCname: '' },
        formItems: [
          {
            label: '维护BD',
            prop: 'belongEmployee',
            type: 'select',
            rules: this.defaultRules,
            remoteSelectList: NLIST,
            DIY: { key: 'employeeId' },
            remote: true,
            remoteMethod: (name) => {
              let query = [{ column: 'roleCode', type: 'in', value: 'bd,obd' }]
              name && query.push({ column: 'name', type: 'eq', value: name })
              listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data: { list } }) => {
                NLIST.splice(0, 1000, ...list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId })))
              })
            },
          },
          { label: '维护部门', prop: 'deptCname', type: 'input', disabled: true, rules: this.defaultRules },
        ],
      },
      // 解绑
      dialogRemove: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '解绑',
        text: '解绑',
        formItems: [
          { label: '原维护人', type: 'input', prop: 'oldEmployeeId', disabled: true },
          {
            type: 'select',
            label: '维护人',
            prop: 'newEmployeeId',
            remoteSelectList: ELIST,
            remote: true,
            DIY: { key: 'employeeId' },
            rules: this.defaultRules,
            remoteMethod: (name) => this.getEmployeeRoles(name, '', ELIST, true),
          },
        ],
        form: { oldEmployeeId: '', newEmployeeId: '' },
      },
      custid: '',
      orgid: '',
      isBlack: false,
    }
  },
  watch: {
    'releaseOption.form.belongEmployee'(val) {
      this.releaseOption.form.belongEmployeeId = val.employeeId
      this.releaseOption.form.belongDeptCode = val.deptCode
      this.releaseOption.form.deptCname = val.deptCname
    },
  },
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
      let { crmCategory, crmBusiness, crmService } = this.dictMapObj
      let _categoryDtos = this.convertRole(categoryDtos, crmCategory, 'category')
      let _biztypeDtos = this.convertRole(biztypeDtos, crmBusiness, 'businessType')
      serviceItemDtos.map((item) => {
        item.newVal = item.serviceCode +'#'+ item.businessType
       })
      let _serviceItemDtos = this.convertRole(serviceItemDtos, crmService, 'newVal')
      // let _serviceItemDtos = this.convertRole(serviceItemDtos, crmService, 'serviceCode')
      return { ...org, biztypeDtos, _biztypeDtos, categoryDtos, _categoryDtos, serviceItemDtos, _serviceItemDtos }
    },
    // 获取详情信息
    initData(custid) {
      this.activeItem = panes[0].name
      let method = this.custid ? SUPPLIER.verifyInfo : FOLLOW.supplierOrgDetail
      let data = this.custid ? { supplierId: custid } : { orgid: custid }
      method(data).then((res) => {
        let { organizationDto, biztypeDtos, categoryDtos, supplierDto, orgVerifyDto, serviceItemDtos } = res.data
        // 预设默认值时,值为null就会失效
        organizationDto = organizationDto || {}
        supplierDto = supplierDto || {}
        let { orgid, mtDate, verifyStatus, mtEmployeeName, mtDeptName, updatedName, updatedTime } = supplierDto
        this.custid = supplierDto.supplierId
        this.orgid = supplierDto.orgid
        this.isBlack = supplierDto.isBlacklist == 'yes'
        let { province, city, district } = organizationDto
        organizationDto.indexAddr = province ? (district ? [province, city, district] : [province, city]) : []
        let oldData = this.convertData({ org: organizationDto, biztypeDtos, categoryDtos, serviceItemDtos })
        // orgVerifyDto修改状态的信息（拒绝、原因等） verifyStatus 修改状态
        orgVerifyDto = orgVerifyDto || {}
        this.baseInfo = {
          backupInfo: supplierDto,
          ...oldData,
          orgid,
          mtDate,
          verifyStatus,
          orgVerifyDto,
          updatedName,
          updatedTime,
        }
        this.baseInfo.supplierBd = !mtEmployeeName ? '' : { mtEmployeeName, mtDeptName }
        console.log(this.baseInfo)
      })
      // .catch(this.routerDelBack)
    },
    goBack() {
      this.routerBack()
    },
    // 关闭拒绝提醒弹框
    refuseConfirm() {
      SUPPLIER.refuseConfirm({ supplierId: this.custid }).then((res) => {
        this.baseInfo.orgVerifyDto.showStatus = 'no'
        this.$forceUpdate()
      })
    },
    // 加入黑名单
    blackOp(tag) {
      if (!tag) return (this.blackOption.show = false)
      let { name, uscc } = this.baseInfo
      // BLACK.supplierAdd({ supplierId: this.custid, name, uscc, ...this.blackOption.form }).then((res) => {
      BLACK.supplierAdd({ name, uscc, ...this.blackOption.form }).then((res) => {
        this.$msgSucClose('加入黑名单成功！')
        this.initData(this.custid)
        this.blackOption.show = false
        this.refreshView('SupplierReviewList', 'from')
        this.refreshView('BlackList', 'from')
        this.isBlack = true
      })
    },
    // 解除黑名单
    releaseOp(tag) {
      if (!tag) return (this.releaseOption.show = false)
      // console.log({ orgid: this.orgid, orgType: 'supplier', ...this.releaseOption.form })
      // return
      BLACK.supplierRelease({ orgid: this.orgid, orgType: 'supplier', ...this.releaseOption.form }).then((res) => {
        this.$msgSucClose('解除黑名单成功！')
        this.initData(this.custid)
        this.refreshView('SupplierReviewList', 'from')
        this.refreshView('BlackList', 'from')
        this.releaseOption.show = false
        this.isBlack = false
      })
    },
    // 获取客户部员工列表
    async getEmployeeRoles(name, id, list, allEmployee) {
      let query = []
      id && query.push({ column: 'employeeId', type: 'eq', value: id })
      name && query.push({ column: 'name', type: 'eq', value: name })
      !allEmployee && query.push({ column: 'roleCode', type: 'eq', value: 'sps' })
      let fn = (v) => ({
        ...v,
        label: allEmployee ? v.cname + ' ' + v.deptCname : v.cname + ' ' + v.employeeNo,
        value: v.employeeId,
      })
      listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data }) => {
        list.splice(0, 1000, ...data.list.map(fn))
      })
    },
    // 解绑
    removeShow() {
      this.dialogRemove.show = true
      setTimeout(() => {
        this.dialogRemove.form.oldEmployeeId = this.baseInfo.supplierBd && this.baseInfo.supplierBd.mtEmployeeName
      }, 100)
    },
    // 确认解绑
    removeClose(tag) {
      if (!tag) {
        return (this.dialogRemove.show = false)
      }
      let { newEmployeeId, oldEmployeeId } = this.dialogRemove.form
      if (newEmployeeId == this.detailId) {
        return this.$msgErrClose('维护人不能是原维护人！')
      }
      let data = {
        mtEmployeeId: newEmployeeId.employeeId,
        mtEmployeeName: newEmployeeId.cname,
        mtDeptCode: newEmployeeId.deptCode,
        mtDeptName: newEmployeeId.deptCname,
      }
      this.dialogRemove.btnLoading = true
      SUPPLIER.alterMaintainer({ supplierId: this.custid, ...data })
        .then((res) => {
          this.$msgSucClose('解绑成功！')
          this.initData(this.custid)
          this.refreshView('SupplierList', 'from')
          this.dialogRemove.show = false
        })
        .finally(() => {
          this.dialogRemove.btnLoading = false
        })
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      let { custid, orgid } = to.query
      if (to.meta.isUseCache == false) {
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
        vm.isBlack = true
        vm.initData(orgid)
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
.finance-page ::v-deep .el-tabs__header {
  user-select: none;
}
// 管理者页面样式，用来控制管理者页面隐藏的元素
.isCustReview ::v-deep {
  // .company-action,
  .notSelf-hide {
    display: none !important;
  }
}
</style>
