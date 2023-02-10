<template>
  <div
    class="finance-page"
    :class="{isNotSelf:!isSelf || isRecycle}"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-container">
      <div class="change-suc-box" v-if="orgNoticeDto.noticeStatus=='no'">
        <span>基本信息已修改</span>
        <i class="el-icon-close" @click="changeConfirm"></i>
      </div>
      <div
        class="refuse-box"
        v-if="
          baseInfo.orgVerifyDto && ['YES','yes'].includes(baseInfo.orgVerifyDto.showStatus)
          && baseInfo.orgVerifyDto.verifyStatus==='refuse'
        "
      >
        <el-tag>拒</el-tag>
        <span>你的审核已拒绝，拒绝原因：{{ dictMapObj.verifyRejection[baseInfo.orgVerifyDto.refuseReason] }}</span>
        <span
          v-if="baseInfo.orgVerifyDto.refuseRemark"
        >拒绝备注：{{ baseInfo.orgVerifyDto.refuseRemark }}</span>
        <i class="el-icon-close" @click="refuseConfirm"></i>
      </div>
      <div class="delay-box" v-if="isVer">
          <div v-if="isVer">
            <!-- <el-tag>审</el-tag> -->
            <span>{{ submitActive.name }}的活跃状态由休眠变为活跃,申请时间{{submitActive.approveTime}},请及时审核</span>
            <span class='delay'><button @click="subActive()">通过</button></span>
            <span class='delay'><button @click="refuseActive()">拒绝</button></span>
          </div>
      </div> 
      <div class="detail-header">
        <div class="left-cnt">
          <i class="el-icon-folder-remove"></i>
          <span class="detail-title">{{ baseInfo.name }}</span>
          <div class="white-box">
          <template v-if="baseInfo.backupInfo.activeStatus==='active'">
            <img src="~@/assets/active.png" alt="" />
            <span class="vri-name">活跃</span>
          </template>
          <template v-else>
            <img src="~@/assets/inactive.png" alt="" />
            <span class="vri-name">休眠</span>
          </template>
        </div>
        </div>
        <div>
          <el-button @click="toFrezz" size="mini" type="primary" v-if="baseInfo.backupInfo.isFreeze==='no' && isSps">冻结</el-button>
          <el-button @click="toUnFrezz" size="mini" type="primary" v-if="baseInfo.backupInfo.isFreeze==='yes' && isSps">解冻</el-button>
          <el-button @click="goBack" size="mini">返回</el-button>
          <!-- 业务改动内容 -->
          <el-button
            v-if="(isEdit || isRefused) && isSelf && !isRecycle"
            type="primary"
            icon="el-icon-check"
            @click="updateSubmit(true)"
            size="mini"
          >提交审核</el-button>
          <el-button v-if="isSps && !isRecycle" type="primary" @click="removeShow" size="mini">解绑</el-button>
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
          :isSupplier="true"
        />
      </keep-alive>
    </div>
    <CrmDialog :option="dialogRemove" @close="removeClose" v-if="dialogRemove.show" />
    <CrmDialog :option="dialogOption" @close="close" ref="dialogVerify" v-if="dialogOption.show" />
    <!-- 拒绝审核活跃状态 -->
    <CrmDialog :option="dialogActiveRefuse" @close="ActiveClose" v-if="dialogActiveRefuse.show"/>
    <!-- <CrmDialog :option="dialogOption" @close="close" ref="dialogVerify">
      <div slot="check-slot" class="check-slot">
        <CrmCard title="系统录入">
          <ul class="base-info-list">
            <li style="width:100%">
              企业名称：
              <strong :class="{isBad:false}">{{detailEditInfo.name}}</strong>
            </li>
            <li v-for="item in netSearchData" :key="item.prop" :class="{'block-li':item.block}">
              {{item.label}}：
              <span>{{detailEditInfo[item.prop]}}</span>
            </li>
          </ul>
        </CrmCard>
        <CrmCard title="网上查询">
          <ul class="base-info-list">
            <li style="width:100%">
              企业名称：
              <strong
                :class="{isBad:false,red:searchInfo.name!=detailEditInfo.name}"
              >{{searchInfo.name}}</strong>
            </li>
            <li v-for="item in netSearchData" :key="item.prop" :class="{'block-li':item.block}">
              {{item.label}}：
              <span
                :class="{red:searchInfo[item.prop]!=detailEditInfo[item.prop]}"
              >{{searchInfo[item.prop]}}</span>
            </li>
          </ul>
          <p v-show="noData" style="color:#cd4130;text-align:center">无此公司信息</p>
        </CrmCard>
      </div>
      <div slot="footer-slot" style="float:right;margin:20px 0 0">
        <el-button
          :disabled="dialogOption.btnLoading"
          type="primary"
          @click="verifySubmit('replace')"
          size="mini"
        >替换信息并提交</el-button>
        <el-button
          :disabled="dialogOption.btnLoading"
          type="primary"
          @click="verifySubmit('submit')"
          size="mini"
        >提交</el-button>
        <el-button @click="dialogOption.show=false" size="mini">取消</el-button>
      </div>
    </CrmDialog>-->
    <FixedBottom :baseInfo="baseInfo" v-show="activeItem == panes[0].name"/>
  </div>
</template>
<script>
import { netSearchData } from '@/views/crm/data'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import CrmDialog from '@/views/crm/components/crmDialog'
import CrmCard from '@/views/crm/components/card'
import FixedBottom from '@/views/crm/merchantManagement/customerReviewList/components/fixedBottom'
import SUPPLIER from '@/api/crm/supplier'
import { mapGetters, mapState } from 'vuex'
import FOLLOW from '@/api/crm/orgCommunication'
import CUSTOMER from '@/api/crm/customer'
import { parseTime } from '@/utils'
import { listByRole } from '@/api/base'
// 审核人列表
const RLIST = []
const NLIST = []
/******** 自动引入组件  --begin  省去修改文件名后需要做一系列改动 ******** */
// 更改或添加组件，需遵循文件命名规则，以'Tab.vue'结尾
// 用法 https://webpack.js.org/guides/dependency-management/#require-with-expression
const context = require.context('../customerList/detailTabs', false, /Tab.vue$/)
const panes = context
  .keys()
  .map((item) => context(item).default)
  .filter((item) => !item.hidden && item.supplierShow)
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
      // console.log(this.baseInfo)
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
      // relationCfg: {
      //   // 是否已提交审核
      //   relationRefresh: false,
      //   // 存放客户关系母子公司的改动数据，增、删
      //   parentObj: {},
      //   // 存放客户关系关联公司的改动数据，增、删
      //   brotherObj: {},
      // },
      orgid: '',
      baseInfo: { orgVerifyDto: {}, backupInfo: {} },
      panes: panes,
      activeItem: panes[0].name,
      dialogOption: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '提交审核',
        width: '400px',
        // footerHide: true,
        formItems: [
          {
            label: '审核人',
            type: 'select',
            prop: 'verifier',
            // style: { width: '30%' },
            rules: this.defaultRules,
            remoteSelectList: RLIST,
            remote: true,
            remoteMethod: (name) => {
              this.getEmployeeRoles(name, '', RLIST)
            },
          },
          { label: '提交原因', type: 'textarea', prop: 'modifyReason', rules: this.defaultRules },
        ],
        form: { modifyReason: '', verifier: '' },
      },
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
            remoteSelectList: NLIST,
            remote: true,
            DIY: { key: 'employeeId' },
            rules: this.defaultRules,
            remoteMethod: (name) => this.getEmployeeRoles(name, '', NLIST, true),
          },
        ],
        form: { oldEmployeeId: '', newEmployeeId: '' },
      },
      // 拒绝活跃状态
      dialogActiveRefuse:{
        show: false,
        showClear: true,
        btnLoading: false,
        title: '审核拒绝',
        text: '确定',
        labelWidth: '100px',
        formItems: [
          {
            label: '拒绝原因',
            type: 'textarea',
            prop: 'refuseReason',
            maxlength:'500',
            rules: { ...this.defaultRules }
          },
        ],
        form: {
          refuseReason: '',
        }
      },
      detailId: '', //维护人id 没有维护人(新建未通过审核时)用创建人
      custid: '',
      hasData: false,
      noData: false,
      netSearchData,
      searchInfo: {},
      orgNoticeDto: {},
      isRecycle: false,
      isVer:false,
      submitActive:{}
    }
  },
  watch: {
    isEdit(VAL) {
      console.log(VAL)
    },
  },
  created() {
    // this.getEmployeeRoles()
    this.activeRecord()
  },
  methods: {
    // 联网查企业
    searchCustomer() {
      CUSTOMER.aiqichaDetail({ keywords: this.baseInfo.uscc || this.baseInfo.name })
        .then((res) => {
          this.hasData = true
          let searchInfo = res.data
          if (!searchInfo) return this.initNoData(true)
          searchInfo.estiblishTime = parseTime(searchInfo.estiblishTime, '{y}-{m}-{d}')
          let usccExpDate = searchInfo.toTime && parseTime(searchInfo.toTime, '{y}-{m}-{d}')
          this.searchInfo = {
            name: searchInfo.name,
            uscc: searchInfo.creditCode,
            taxId: searchInfo.creditCode,
            entType: searchInfo.companyOrgType,
            usccExpDate: usccExpDate,
            industry: searchInfo.industry,
            setupDate: searchInfo.estiblishTime,
            registerAddr: searchInfo.regLocation,
            // indexAddr: searchInfo.base,
            legalPerson: searchInfo.legalPerson,
            regCapital: searchInfo.regCapital,
          }
        })
        .catch((err) => {
          console.log(err)
          this.initNoData(true)
        })
    },
    // 初始化网络搜索无数据
    initNoData(noData) {
      this.noData = !!noData
      this.hasData = noData === false
    },
    // 供应商、可支持业务类型转换成显示内容
    convertRole(arr, dict, key) {
      return arr
        .map((v) => v[key].toLowerCase())
        .join('+')
        .replace(/\b(\w+)\b/g, (v) => dict[v] || '-')
    },
    // 返回的数据转换成请求和显示需要的结构和字段
    convertData({ org, biztypeDtos, categoryDtos, serviceItemDtos }) {
      console.log(this.dictMapObj)
      let { crmCategory, crmBusiness, crmService } = this.dictMapObj
      let _categoryDtos = this.convertRole(categoryDtos, crmCategory, 'category')
      let _biztypeDtos = this.convertRole(biztypeDtos, crmBusiness, 'businessType')
      let _serviceItemDtos = this.convertRole(serviceItemDtos, crmService, 'serviceCode')
      return { ...org, biztypeDtos, _biztypeDtos, categoryDtos, _categoryDtos, serviceItemDtos, _serviceItemDtos }
    },
    // 获取详情信息
    initData(custid) {
      this.lsLoading = true
      this.isEdit = false
      this.activeItem = panes[0].name
      let method = this.custid ? SUPPLIER.verifyInfo : FOLLOW.supplierOrgDetail
      let data = this.custid ? { supplierId: custid } : { orgid: custid }
      method(data)
        .then((res) => {
          let { organizationDto, biztypeDtos, categoryDtos, supplierDto, orgVerifyDto, serviceItemDtos } = res.data
          // 预设默认值时,值为null就会失效
          organizationDto = organizationDto || {}
          supplierDto = supplierDto || {}
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
          } = supplierDto
          if (isBlacklist === 'yes') return this.goBack()
          this.isRecycle = isRecycle === 'yes'
          this.orgNoticeDto = res.data.orgNoticeDto || {}
          this.custid = supplierDto.supplierId
          this.detailId = mtEmployeeId || createdBy
          this.backupType = biztypeDtos
          this.backupCategory = categoryDtos
          this.backupService = serviceItemDtos
          let { province, city, district } = organizationDto
          organizationDto.indexAddr = province ? (district ? [province, city, district] : [province, city]) : []
          let oldData = this.convertData({ org: organizationDto, biztypeDtos, categoryDtos, serviceItemDtos })
          // orgVerifyDto修改状态的信息（拒绝、原因等） verifyStatus 修改状态
          this.baseInfo = {
            backupInfo: supplierDto,
            ...oldData,
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
              updateBiztypeDtos: biztypeDtos,
              updateCategoryDtos: categoryDtos,
              updateServiceItemDtos: serviceItemDtos,
            } = res.data
            org = org || {}
            let { province, city, district } = org
            org.indexAddr = province ? (district ? [province, city, district] : [province, city]) : []
            this.baseInfo.updateInfo = this.convertData({ org, biztypeDtos, categoryDtos, serviceItemDtos })
          }
          console.log(this.baseInfo)
          this.$store.commit('crm/supplier/setDetailBaseInfo', this.baseInfo)
        })
        .finally(() => {
          this.lsLoading = false
        })
      // .catch(this.routerDelBack)
    },
    activeRecord(){
      SUPPLIER.activeRecord({supplierId:this.$route.query.custid}).then(res=>{
        if(res.data&&res.data.approveStatus === 'submit' && res.data.approveEmployeeId === this.userId){
          this.submitActive = res.data
          this.isVer = true
        }else{
          this.submitActive = {}
          this.isVer = false
        }
      })
    },
    goBack() {
      this.routerBack()
    },
    //冻结
    toFrezz(){
      this.$confirmWarn('你确定要冻结该供应商吗？', () => {
        SUPPLIER.freeze({supplierId:this.custid}).then(res=>{
          this.$msgSucClose('提交成功！')
          this.refreshView('SupplierList', 'from')
          this.initData(this.custid)
        })
      })
    },
    //解冻
    toUnFrezz(){
      this.$confirmWarn('你确定要解冻该供应商吗？', () => {
        SUPPLIER.unfreeze({supplierId:this.custid}).then(res=>{
          this.$msgSucClose('提交成功！')
          this.refreshView('SupplierList', 'from')
          this.initData(this.custid)
        })
      })
    },
    verifySubmit(type) {
      this.$refs.dialogVerify.$refs.form.validate((valid) => {
        if (!valid) return
        if (type === 'replace') {
          this.isReplace = true
        } else {
          this.isReplace = false
        }
        this.close(true)
      })
    },
    // 更新的数据与接口返回的数据进行比对，判断是否有oid
    convertBackup(data, key, backup, type) {
      data[key] = data['_' + key].map((item) => {
        item.supplierId = this.custid
        let find = backup.find((v) => v[type] == item[type])
        if (find) item.oid = find.oid
        return item
      })
      delete data['_' + key]
    },
    updateSubmit(flag) {
      if (flag === true) {
        if (this.$refs.CUST1) {
          this.$refs.CUST1.saveBaseInfo()
        }
        if (this.yesNoSumit === 'no') {
          !this.$refs.CUST1 && this.$msgErrClose('请补全基本信息必填项！')
          return
        }
        this.dialogOption.form.verifier = this.dialogOptionFormVerifier
        this.dialogOption.show = true
        // setTimeout(() => {
        //   this.dialogOption.form.verifier = this.dialogOptionFormVerifier
        // }, 200)
      } else {
        this.yesNoSumit = flag
      }
    },
    // 更新后提交申请
    close(tag) {
      // console.log(tag, this.detailEditInfo)
      if (!tag) return (this.dialogOption.show = false)
      // isEdit || parentEdit || brotherEdit
      // let editData = this.isEdit ? { ...this.detailEditInfo } : { ...this.baseInfo }
      // let custStructDtos = this.parentEdit ? Object.values(this.relationCfg.parentObj) : ''
      // let custRelationDtos = this.brotherEdit ? Object.values(this.relationCfg.brotherObj) : ''
      let data = { ...this.detailEditInfo, ...this.dialogOption.form, supplierId: this.custid }
      // let _categoryDtos = this.convertRole(categoryDtos, supplierCategory, 'category')
      // let _biztypeDtos = this.convertRole(biztypeDtos, supplierBizType, 'businessType')
      // this.backupType = biztypeDtos
      // this.backupCategory = categoryDtos
      this.convertBackup(data, 'biztypeDtos', this.backupType, 'businessType')
      this.convertBackup(data, 'categoryDtos', this.backupCategory, 'category')
      this.convertBackup(data, 'serviceItemDtos', this.backupService, 'serviceCode')
      // data.biztypeDtos = data._biztypeDtos.map((item) => {
      //   item.supplierId = this.custid
      //   let find = this.backupType.find((v) => v.businessType == item.businessType)
      //   if (find) item.oid = find.oid
      //   return item
      // })
      // data.categoryDtos = data._categoryDtos.map((item) => {
      //   item.supplierId = this.custid
      //   let find = this.backupCategory.find((v) => v.category == item.category)
      //   if (find) item.oid = find.oid
      //   return item
      // })
      // data.serviceItemDtos = data._serviceItemDtos.map((item) => {
      //   item.supplierId = this.custid
      //   let find = this.backupService.find((v) => v.serviceCode == item.serviceCode)
      //   if (find) item.oid = find.oid
      //   return item
      // })
      // delete data._categoryDtos
      // delete data._biztypeDtos
      // delete data._serviceItemDtos
      // if (this.isReplace) data = { ...data, ...this.searchInfo }
      this.dialogOption.btnLoading = true
      if (data.indexAddr && data.indexAddr.length) {
        data.province = data.indexAddr[0]
        data.city = data.indexAddr[1]
        data.district = data.indexAddr[2]
      }
      SUPPLIER.updateSubmit(data)
        .then((res) => {
          this.$msgSucClose('提交成功！')
          this.refreshView('SupplierList', 'from')
          this.refreshView('SupplierReviewList', 'from')
          this.dialogOption.show = false
          // 成功后，重新获取数据
          // this.$store.commit('crm/supplier/setDetailIsEdit', false)
          this.$store.commit('crm/supplier/setDetailEditInfo', {})
          // Object.keys(this.relationCfg.parentObj).forEach((key) => {
          //   this.$delete(this.relationCfg.parentObj, key)
          // })
          // Object.keys(this.relationCfg.brotherObj).forEach((key) => {
          //   this.$delete(this.relationCfg.brotherObj, key)
          // })
          // this.relationCfg.relationRefresh = true
          this.initData(this.custid)
        })
        .finally(() => {
          this.dialogOption.btnLoading = false
        })
    },
    // 关闭拒绝提醒弹框
    refuseConfirm() {
      SUPPLIER.refuseConfirm({ supplierId: this.custid }).then((res) => {
        this.baseInfo.orgVerifyDto.showStatus = 'no'
        this.$forceUpdate()
      })
    },
    // 关闭修改提醒弹框
    changeConfirm() {
      SUPPLIER.confirmPreview({ supplierId: this.custid }).then((res) => {
        this.orgNoticeDto.noticeStatus = 'yes'
        this.$forceUpdate()
      })
    },
    // 获取客户部员工列表
    async getEmployeeRoles(name, id, list, allEmployee) {
      let query = []
      id && query.push({ column: 'employeeId', type: 'eq', value: id })
      name && query.push({ column: 'name', type: 'eq', value: name })
      !allEmployee && query.push({ column: 'roleCode', type: 'eq', value: allEmployee ? 'sps' : 'sps_verifier' })
      let fn = (v) => ({
        ...v,
        label: allEmployee ? v.cname + ' ' + v.deptCname : v.cname + ' ' + v.employeeNo,
        value: v.employeeId,
      })
      listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data }) => {
        list.splice(0, 1000, ...data.list.map(fn))
        if (!allEmployee) {
          let verifier = this.dialogOption.form.verifier //是否有审核人
          let employeeIds =  RLIST.map(item => item.value) // 审核人是否在列表
          if (!verifier || !employeeIds.includes(verifier)) { // 如果审核人不在列表或者没有值，默认第一个
            this.dialogOption.form.verifier = RLIST[0].value
          }
        }
      })
    },
    // 解绑
    removeShow() {
      this.dialogRemove.show = true
      setTimeout(() => {
        this.dialogRemove.form.oldEmployeeId = this.baseInfo.supplierBdStr
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
    // 同意活跃状态
    subActive(){
      this.$confirmWarn(`是否确认该供应商状态变为活跃状态？`, () => {
        SUPPLIER.activeVerify({
          oid:this.submitActive.oid,
          supplierId: this.submitActive.supplierId,
          approveStatus:'pass',
        }).then((res) => {
          this.$msgSucClose('已同意!')
          this.initData(this.custid)
          this.activeRecord()
          this.refreshView('SupplierList', 'from')
        })
      })
    },
    //拒绝成为活跃状态按钮
    refuseActive(){
      this.dialogActiveRefuse.show = true     
    },
    //确定拒绝
    ActiveClose(tag){
      if (!tag) {
        return this.closeRefuseForm()
      }
      this.dialogActiveRefuse.btnLoading = true
      SUPPLIER.activeVerify({
        ...this.dialogActiveRefuse.form,
        oid:this.submitActive.oid,
        supplierId: this.submitActive.supplierId,
        approveStatus:'refuse',
      })
        .then((res) => {
          this.$msgSucClose('已拒绝！')
          this.initData(this.custid)
          this.activeRecord()
          this.refreshView('SupplierList', 'from')
          this.closeRefuseForm()
        })
        .finally(() => {
          this.dialogActiveRefuse.btnLoading = false
        })
    },
    closeRefuseForm(){
      this.dialogActiveRefuse.show = false
      this.dialogActiveRefuse.form = {
        refuseReason: '',
      }
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
.left-cnt {
  display: flex;
  line-height: 20px;
  .white-box {
    margin-left: 10px;
    display: flex;
    line-height: 20px;
    img {
      margin-right: 5px;
      width:24px;
      height:23px;
      vertical-align: middle;
    }
    .white-name {
      -webkit-text-stroke: 0.5px#000000;
    }
    .vri-name{
       -webkit-text-stroke: 0.2px#000000;
       transform: scale(0.9);
    }
    .qulityButton{
      margin-left:10px;
    }
  }
}
</style>
