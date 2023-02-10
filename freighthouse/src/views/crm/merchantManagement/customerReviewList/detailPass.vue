<template>
  <div
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    class="finance-page isCustReview"
    v-loading="lsLoading"
  >
    <div class="finance-container">
      <div
        class="refuse-box"
        v-if="
          baseInfo.orgVerifyDto && ['YES','yes'].includes(baseInfo.orgVerifyDto.showStatus)
          && baseInfo.orgVerifyDto.verifyStatus==='refuse'
        "
      >
        <el-tag>拒</el-tag>
        <!-- row[prop].replace(/\b(\w+)\b/g, (item2) => {
              if(item.noDict) return dict && dict[item2] || ''
              return (dict && dict[item2]) || rowProp
        })-->
        资质认证审核已拒绝,
        <span v-if="baseInfo.orgVerifyDto.refuseReason">拒绝原因：{{
            multiVal(
              baseInfo.orgVerifyDto.refuseReason,
              dictMapObj.verifyRejection,
            )
          }}</span
        >
        <span v-if="baseInfo.orgVerifyDto.refuseRemark">拒绝备注：{{ baseInfo.orgVerifyDto.refuseRemark }}</span>
        <!-- <i class="el-icon-close" @click="refuseConfirm"></i> -->
      </div>
      <div class="delay-box" v-if="isVer">
          <div v-if="isVer">
            <el-tag>延</el-tag>
            <span>{{delayVerifys.bdEmployeeName}}申请下单延长保有时间至{{delayVerifys.expectMtDate}}，申请原因：{{delayVerifys.delayReason}}，请及时审核</span>
            <span v-if="orderDelayTime" style="color:red">(最近审核通过的下单延期时间为：{{orderDelayTime}})</span>
            <span class='delay'><button @click="subDelay('order')">通过</button></span>
            <span class='delay'><button @click="refuseDelay('order')">拒绝</button></span>
          </div>
      </div> 
      <div class="delay-box" v-if="isVisitVer">
          <div v-if="isVisitVer">
            <el-tag>延</el-tag>
            <span>{{visitDelayVerifys.bdEmployeeName}}申请拜访保有时间至{{visitDelayVerifys.expectMtDate}}，申请原因：{{visitDelayVerifys.delayReason}}，请及时审核</span>
            <span v-if="visitDelayTime" style="color:red">(最近审核通过的延期时间为：{{visitDelayTime}})</span>
            <span class='delay'><button @click="subDelay('visit')">通过</button></span>
            <span class='delay'><button @click="refuseDelay('visit')">拒绝</button></span>
          </div>
      </div>
      <div class="delay-box" v-if="isOrderVer">
        <el-tag v-if="isOrderVer">审</el-tag>
        <div v-if="isOrderVer">
            <span>销售{{orderVerifys.employeeName}}申请成为下单维护人，新旧模式为：
            <span v-if="orderVerifys.verifyData==='new'">新模式</span>
            <span v-else-if="orderVerifys.verifyData==='old'">旧模式</span>
            <span v-else>无</span>
            ，请及时审核</span>
          <span class='delay'><button @click="subBeOrder()">通过</button></span>
          <span class='delay'><button @click="refuseBeOrder()">拒绝</button></span>
        </div>
      </div>
      <div class="notes-change" v-if="showNotesChange">
        <span class="tag" v-if="notesData.recycleTimes">{{
          notesData.recycleTimes
        }}</span>
        <span class="content">
          {{ notesData.updatedTime.split(' ')[0] }} 业务员：{{
            notesData.updatedName
          }}
          退回原因：{{
            notesData.custRecycleRecord.recycleReason
          }}，请及时分配。</span
        >
        <i class="el-icon-close" @click="showNotesChange = false"></i>
      </div>
      <div class="notes-refuse" v-if="showNotesRefuse">
        <span class="tag">拒</span>
        <span class="content">
          {{ notesData.updatedTime.split(' ')[0] }} 组长：{{
            notesData.updatedName
          }}, 拒绝备注：{{
            notesData.custRecycleAssign.refuseRemark || '无'
          }}，请及时分配。</span
        >
        <i class="el-icon-close" @click="showNotesRefuse = false"></i>
      </div>
      <div class="detail-header">
        <div class="left-cnt">
          <i class="el-icon-folder-remove"></i>
          <span class="detail-title" :class="{ 'is-white': isWhitelist }">{{
            baseInfo.name
          }}</span>
          <el-tooltip
            content="客户等级"
            effect="dark"
            placement="bottom"
            v-if="custGrade"
          >
            <span v-if="custGrade==='A'"  class="grade-img"><img src="~@/assets/A.png" alt=""/></span>
            <span v-else-if="custGrade==='A+'"  class="grade-img"><img src="~@/assets/A+.png" alt="" /></span>
            <span v-else-if="custGrade==='B'"  class="grade-img"><img src="~@/assets/B.png" alt=""/></span>
            <span v-else-if="custGrade==='B+'"  class="grade-img"><img src="~@/assets/B+.png" alt=""/></span>
            <span v-else  class="grade-img"><img src="~@/assets/C.png" alt=""/></span>
          </el-tooltip>
          <div class="white-box">
            <el-tooltip
              content="白名单客户"
              effect="dark"
              placement="bottom"
              v-if="isWhitelist"
            >
              <img src="~@/assets/white.png" alt="" />
            </el-tooltip>
            <!-- 需要展示特殊所属行业 -->
            <span class="white-name spacia" v-if="isSpcIndustry">{{isSpcIndustry}}</span>
            <template v-if="isCts && !isHideBtn && isUnordinary">
              <el-button
                size="mini"
                type="text"
                @click="recallWhitelist"
                v-if="isWhitelist"
                >撤销白名单</el-button
              >
              <el-button
                size="mini"
                type="text"
                @click="toBeWhite"
                v-else
                >设置白名单</el-button
              >
            </template>
          </div>

          <div class="white-box">
            <template v-if="isPass && isUnordinary">
              <img src="~@/assets/vpass.png" alt="" />
              <span class="vri-name">已认证</span>
              <el-button size="mini" @click="changeVerify()" class="qulityButton" v-if="isPass && !isBlack &&isCts"
                type="success">修改认证状态</el-button >
            </template>
            <template v-if="(isRefused || isSubmit || isCreate) && isUnordinary">
              <img src="~@/assets/vfail.png" alt="" />
              <span class="vri-name" v-if="isRefused">未认证通过</span>
              <span class="vri-name" v-if="isCreate">待认证</span>
              <span class="vri-name" v-if="isSubmit">认证中</span>
            </template>
          </div>
          <div class="white-box" v-if="isSowoll">
            <template>
              <span class="vri-name">客户来源：Sowoll</span>
            </template>
          </div>
        </div>
        <div>
          <!-- <el-button @click="goBack" class="finance-class" size="mini"
            >返回</el-button
          > -->
          <!-- <template v-if="this.baseInfo.bds">
            <el-button
              type="defualt"
              @click="removeCustomer"
              size="mini"
              v-show="this.baseInfo.bds.length"
            >解绑</el-button>
          </template>-->

          <!-- <el-button
            v-if="!isHideBtn"
            type="danger"
            @click="blackOption.show = true"
            size="mini"
          >列入黑名单</el-button>-->
          <!-- 从公海进入 -->
          <template v-if="custStatus">
            <el-button
              @click="recall"
              size="mini"
              type="danger"
              v-if="isCts && custStatus === 'to_mg_assign'"
              >撤回</el-button
            >
            <!-- <el-button
              @click="changeOption.show = true"
              size="mini"
              type="warning"
              v-if="showRecycleBtn"
              >更改维护人</el-button
            > -->
            <el-button
              @click="showAddDialog"
              size="mini"
              type="primary"
              v-if="showRecycleBtn"
              >新增维护人</el-button
            >
            <el-button
              @click="showRecycle"
              size="mini"
              type="primary"
              v-if="showAllotBtn"
              >分配</el-button
            >
          </template>
          <!-- 从客户列表进入 -->
          <template v-else>
            <el-button
              @click="showAddDialog"
              size="mini"
              type="primary"
              v-if="!isHideBtn && isCts"
              >新增维护人</el-button
            >
            <!-- <el-button
              @click="changeOption.show = true"
              size="mini"
              type="warning"
              v-if="isPotential && !isRecycle && isCts"
              >更改维护人</el-button
            > -->
            <!-- <el-button
            @click="distributeShow"
            size="mini"
            type="primary"
            v-if="isRecycle"
          >{{isDistribute?'分配':'认领'}}</el-button> -->
          </template>
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
        <el-tab-pane
          :key="item.name"
          :label="item.label"
          :name="item.name"
          v-for="item in orderPanes"
        ></el-tab-pane>
      </el-tabs>
      <!-- :detailId="detailId"
      :userId="userId"-->

      <keep-alive>
        <component
          :companyName="baseInfo.name"
          :custid="custid"
          :is="component"
          :isJumpRouteFromPage.sync="isJumpRouteFromPage"
          :isPotentialOrigin="isPotential"
          :isSelf="false"
          :orgid="baseInfo.orgid"
          :reviewInfo="baseInfo"
          :baseInfo="baseInfo"
          :isWhitelist="isWhitelist"
          :isBlacklist="isBlack"
          :isIndustry="isIndustry"
          :isForeignPeer.sync="isForeignPeer"
          :OPEmployeeList = "OPEmployeeList"
        />
      </keep-alive>
      <!-- :orgid="orgid" -->
    </div>
    <div
      class="finance-search-list-gap"
      v-if="activeItem == panes[0].name"
    ></div>
    <FixedBottom
      :baseInfo="baseInfo"
      :bds="true"
      :noChange="!isClient"
      :remove="!isPotential"
      @emitEvent="emitEvent"
      v-if="!isBlack"
      v-show="activeItem == panes[0].name"
    />
    <CrmDialog :option="dialogSubdelayLeader" @close="subDelayClose" v-if="dialogSubdelayLeader.show"/>
    <!-- 冻结 -->
    <CrmDialog :option="freezeOption" @close="subFrezz" v-if="freezeOption.show"/>
    <CrmDialog :option="dialogRefusedelayLeader" @close="refuseDelayClose" v-if="dialogRefusedelayLeader.show"/>
    <!-- 拒绝下单维护人 -->
    <CrmDialog :option="dialogRefuseBeOrderLeader" @close="refuseBeOrderClose" v-if="dialogRefuseBeOrderLeader.show"/>
    <CrmDialog :option="vipOption" @close="changeVip" />
    <CrmDialog :option="blackOption" @close="blackOp" v-if="blackOption.show" />
    <CrmDialog :option="releaseOption" @close="releaseOp" v-if="releaseOption.show"/>
    <CrmDialog :option="addOption" @close="addCustomer" v-if="addOption.show" >
      <!-- 支持范围solt：support-type -->
      <el-form-item slot="support-type" label="支持范围" prop="supportType">
        <!-- 类型 --> 
        <el-select v-model="addOption.form.supportType" placeholder="请选择" class="middle-item" @change='changeType' clearable>
          <el-option
            v-for="item in dictMap['supportRange']"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <!-- 航线 -->
        <el-select
            v-if="addOption.form.supportType==='pod_line'"
            v-model="addOption.form.podLines"
            value-key="sysLineCode"
            filterable
            clearable
            placeholder="请选择"
            multiple
            collapse-tags
            remote
            :remote-method="getSystemLineList"
            @visible-change="(v) => v && getSystemLineList()"
             class="middle-item"
          >
            <el-option
              v-for="(item, index) in sysLine"
              :key="item.sysLineCode + index"
              :label="item.cname"
              :value="item"
            ></el-option>
        </el-select>
        <!-- 出口口岸 -->
        <el-select
          v-if="addOption.form.supportType==='pol_name'"
          v-model="addOption.form.polNames"
          placeholder="请选择"
          filterable
          clearable
          multiple
          collapse-tags
          remote
          value-key="portCode"
          :remote-method="(str) => { getPort(str, 'port_of_basic')}
          "
          @visible-change="(v) => v && getPort('', 'port_of_basic')"
           class="middle-item"
        >
          <el-option
            :label="`${item.ename}(${item.cname})`"
            :value="item"
            :key="item.portCode"
            v-for="item in polList"
          ></el-option>
        </el-select>
        <!-- 业务类型 -->
        <el-select
          v-if="addOption.form.supportType==='business_type'"
          v-model="addOption.form.businessTypes"
          placeholder="请选择"
          class="middle-item"
          multiple
          collapse-tags>
          <el-option
            v-for="item in dictMap['businessGroup']"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <!-- 服务类型 -->
        <el-select
          v-if="addOption.form.supportType==='service_type_one'"
          v-model="addOption.form.serviceTypes"
          placeholder="请选择"
          class="middle-item"
          multiple
          collapse-tags>
          <el-option
            v-for="item in dictMap['serviceTypes']"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>

        <!-- 事业部 -->
        <el-input size="mini"
          v-if="addOption.form.supportType==='customer_department'"
          v-model="addOption.form.customerDepartment"
          placeholder="请填写"
          maxlength="128"
          class="middle-item">
        </el-input>
      </el-form-item>
    </CrmDialog>
    <CrmDialog
      :option="changeOption"
      @close="changeCustomer"
      v-if="changeOption.show"
    />
    <!-- <CrmDialog :option="distributeOption" @close="closeDialog" v-if="distributeOption.show" /> -->
    <CrmDialog :option="dialogRemove" @close="removeClose" v-if="dialogRemove.show"/>
    <CrmDialog :option="dialogRemoveLeader" @close="removeClose" v-if="dialogRemoveLeader.show"/>
    <CrmDialog :option="changeMode" @close="changeClose" v-if="changeMode.show"/>
    <RecycleDialog v-if="dialogOption.show" :recycleOption="dialogOption" @close="closeDialog" @submit="allotDialog"/>
    <CrmDialog :option="obdMode" @close="obdClose" v-if="obdMode.show" />
    <CrmDialog :option="whiteOption" @close="whiteClose" v-if="whiteOption.show"/>
    <!-- obd绑定bd -->
    <CrmDialog :option="bindBDOption" @close="bindBDClose" v-if="bindBDOption.show"/>
    <!-- 修改认证状态 -->
    <CrmDialog :option="changeVerifyMode" @close="changeVerifyClose" v-if="changeVerifyMode.show" />
  </div>
</template>
<script>
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import CrmDialog from '@/views/crm/components/crmDialog'
import FixedBottom from '@/views/crm/merchantManagement/customerReviewList/components/fixedBottom'
import RecycleDialog from '../recycleList/recycleDialog'
import CUSTOMER from '@/api/crm/customer'
import store from '@/store'
import BLACK from '@/api/crm/blackList'
import { mapGetters, mapState } from 'vuex'
import { baseEmployeeList, listByRole, portList, baseSystemLineList } from '@/api/base'
import FOLLOW from '@/api/crm/orgCommunication'
import RECYCLE from '@/api/crm/recycle'
// 新增维护人
const MIST = []
// 更改维护人
const LIST = []
// 解除黑名单
const NLIST = []
// 分配
const DLIST = []
// 审核人列表
const RLIST = []
// 之前的维护人列表
let OLIST = []
// 更新的维护人列表
const NLISTNEW = []
// 主管解绑后新维护人
const RNLIST = []
// 销售助理
const OBD = []
// 非冻结下单维护人
const ORDERBD = []
/** ****** 自动引入组件  --begin  省去修改文件名后需要做一系列改动 ******** */
// 更改或添加组件，需遵循文件命名规则，以'Tab.vue'结尾
// 用法 https://webpack.js.org/guides/dependency-management/#require-with-expression
const context = require.context('../customerList/detailTabs', false, /Tab.vue$/)
const panes = context
  .keys()
  .map((item) => context(item).default)
  .filter((item) => !item.hidden && !item.customerHide)
// 根据组件name属性最后一位数字进行排序 更改页面tab显示顺序需到组件内更改组件name值
panes.sort(
  (a, b) => a.name.slice(-1).charCodeAt() - b.name.slice(-1).charCodeAt()
)
/** ****** 自动引入组件  --end  ******** */
export default {
  name: 'crmReviewDetail',
  mixins: [routerMixin, mixin],
  components: {
    CrmDialog,
    FixedBottom,
    RecycleDialog
  },
  provide() {
    return {
      relationCfg: {
        relationRefresh: false,
        parentObj: {},
        brotherObj: {}
      },
      isReview: true
    }
  },
  inject: ['defaultRules'],
  computed: {
    component() {
      return panes.find(({ name }) => this.activeItem === name)
    },
    ...mapGetters(['dictMapObj', 'dictMap']),
    ...mapState('crm', ['isEdit', 'detailEditInfo']),
    ...mapState('user', ['userId', 'deptCode', 'roles']),
    //从客户列表进去，新增维护人,即使在公海的客户也可以加
        // this.isRecycle
    isHideBtn() {
      return this.isBlack 
    },
    isCts() {
      return (this.roles || []).includes('cts')
    },
    isManager() {
      return (this.roles || []).includes('manager')
    },
    isPass() {
      return this.baseInfo.verifyStatus == 'pass'
    },
    isSubmit() {
      return this.baseInfo.verifyStatus == 'submit'
    },
    isCreate() {
      return this.baseInfo.verifyStatus == 'create'
    },
    isRefused() {
      return this.baseInfo.verifyStatus == 'refuse'
    },
    isUnordinary(){
       return (this.baseInfo.roles || []).some(item => ['potential', 'client'].includes(item.roleType))
    },
    orderPanes() {
      // return this.isPotential ? panes.filter( v => !['CUSTd','CUSTa'].includes(v.name)) : panes
      if (this.$store.state.user.roles.includes('admin')) {
        return panes
      } else {
        const tabs = this.isPotentialOrigin
          ? panes.filter((v) => !['CUSTd', 'CUSTa'].includes(v.name))
          : panes
        const res = tabs.filter((item) =>
        // 客户部详情tab和客户详情共用一个权限控制
          // this.checkAuth(this.$route.name, `tab-${item.name}`)
          this.checkAuth('CustomerDetail', `tab-${item.name}`)
        )
        return res
      }
    },
    showAllotBtn() {
      const sta1 =
        this.isCts && ['recycled', 'refuse'].includes(this.custStatus)
      const sta2 = this.isManager && this.custStatus === 'to_mg_assign'
      return sta1 || sta2
    },
    showRecycleBtn() {
      return this.isCts && this.custStatus === 'assigned'
    },
    isWhitelist() {
      return this.baseInfo.backupInfo.isWhitelist === 'yes'
    },
    isSowoll(){
      return this.baseInfo.backupInfo.regSource ==='sowoll'
    },
    isIndustry() {
      return ['通信产业', '智能制造产业'].includes(this.baseInfo.industry)
    }
  },
  data() {
    let isDistribute
    const { jobCodes = [], roles = [] } = this.$store.state.user
    if (jobCodes.includes('manager') || roles.includes('cts')) {
      isDistribute = true
    }
    const removeCfg = {
      show: false,
      showClear: true,
      btnLoading: false,
      title: '客户交接',
      text: '客户交接'
    }
    return {
      isForeignPeer:false,
      delayVerifys:'',
      orderVerifys:'',
      visitDelayVerifys:'',
      isVer:false,
      isVisitVer:false,
      isOrderVer:false,
      subType:'',
      sysLine: [],
      polList: [],
      baseInfo: { orgVerifyDto: {}, backupInfo: {}},
      panes: panes,
      activeItem: panes[0].name,
      brotherEdit: false,
      parentEdit: false,
      custGrade:'',
      detailId: '', // 维护人id
      /* 客户部 */
      vipOption: {
        show: false,
        showClear: true,
        title: '修改级别',
        form: { custLevel: '' },
        formItems: [
          {
            label: '客户等级',
            prop: 'custLevel',
            type: 'select',
            rules: this.defaultRules
          }
        ]
      },
      // 加入黑名单
      blackOption: {
        show: false,
        showClear: true,
        title: '加入黑名单',
        btnType: 'danger',
        text: '加入',
        form: { blackReason: [], blackRemark: '' },
        formItems: [
          {
            label: '拉黑原因',
            prop: 'blackReason',
            type: 'select',
            multiple: true,
            rules: this.defaultRules,
            propInDict: 'blacklistReason'
          },
          { label: '拉黑备注', prop: 'blackRemark', type: 'textarea' }
        ]
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
            // rules: this.defaultRules,
            remoteSelectList: NLIST,
            DIY: { key: 'employeeId' },
            remote: true,
            remoteMethod: (name) => this.getEmployeeList(name, NLIST)
          },
          {
            label: '维护部门',
            prop: 'deptCname',
            type: 'input',
            disabled: true
          }
        ]
      },
      //新增维护人
      addOption: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '新增维护人',
        form: { customerBdSaveDtos: '', maintainerType: '', bdServiceMode: '', 
          supportType:'', podLines:[], polNames:[], businessTypes:[], customerDepartment:'',serviceTypes:[]},
        formItems: [
          {
            label: '维护人',
            prop: 'customerBdSaveDtos',
            type: 'select',
            rules: this.defaultRules,
            remoteSelectList: MIST,
            DIY: { key: 'employeeId' },
            remote: true,
            // multiple: true,
            disabled: false,
            remoteMethod: (name) =>
              this.getEmployeeList(name, MIST, true, '', true)
          },
          {
            label: '维护人类型',
            prop: 'maintainerType',
            // propInDict: 'custMaintainerType',
            selectOptions: [
              {
                label: '潜在维护人',
                value: 'potential'
              },
              {
                label: '普通维护人',
                value: 'general'
              }
            ],
            type: 'select',
            rules: this.defaultRules,
            disabled: false,
          }
        ],
        action: 'add',
      },
      changeOption: {
        show: false,
        showClear: true,
        title: '更改维护人',
        btnType: 'warning',
        text: '更改',
        form: { customerBdSaveDtos: '' },
        formItems: [
          {
            label: '维护人',
            prop: 'customerBdSaveDtos',
            type: 'select',
            rules: this.defaultRules,
            remoteSelectList: LIST,
            DIY: { key: 'employeeId' },
            remote: true,
            remoteMethod: (name) => this.getEmployeeList(name, LIST)
          }
        ]
      },
      // distributeOption: {
      //   title: '分配',
      //   show: false,
      //   showClear: true,
      //   form: {
      //     belongEmployeeId: '',
      //     belongEmployee: '',
      //     belongDeptCode: '',
      //     deptCname: ''
      //   },
      //   formItems: [
      //     {
      //       label: '维护BD',
      //       prop: 'belongEmployee',
      //       type: 'select',
      //       rules: this.defaultRules,
      //       remoteSelectList: DLIST,
      //       DIY: { key: 'employeeId' },
      //       remote: true,
      //       remoteMethod: name => this.getEmployeeList(name, DLIST)
      //       //   let query = []
      //       //   name && query.push({ column: 'name', type: 'eq', value: name })
      //       //   query.push({ column: 'roleCode', type: 'in', value: 'bd,obd' })
      //       //   listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data }) => {
      //       //     DLIST.splice(0, 1000, ...data.list.map((v) => ({ ...v, label: v.cname, value: v.employeeId })))
      //       //   })
      //       //   // let query = []
      //       //   // name && query.push({ column: 'name', type: 'eq', value: name })
      //       //   // baseEmployeeList({ currPage: 1, pageSize: 20, query }).then(({ data: { list } }) => {
      //       //   //   DLIST.splice(0, 100, ...list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId })))
      //       //   // })
      //       // },
      //     },
      //     {
      //       label: '维护部门',
      //       prop: 'deptCname',
      //       type: 'input',
      //       rules: this.defaultRules,
      //       disabled: true
      //     }
      //   ]
      // },
      // 分配
      dialogOption: {
        title: '分配',
        show: false,
        isCts: ''
      },
      custid: '',
      orgid: '',
      recycleId: '',
      isBlack: false,
      isRecycle: !!this.$route.query.recycle,
      isDistribute: isDistribute,
      isPotential: false,
      isPotentialDetail: false,
      isClient: false,
      isSpcIndustry:false,
      dialogRemove: {
        ...removeCfg,
        formItems: [
          {
            label: '客户交接原因',
            type: 'select',
            prop: 'removeReason',
            rules: this.defaultRules,
            propInDict: 'unbundReason'
          }
        ],
        form: { removeReason: '', oldEmployeeId: '' }
      },
      dialogRemoveLeader: {
        ...removeCfg,
        labelWidth: '100px',
        formItems: [
          {
            label: '客户交接原因',
            type: 'select',
            prop: 'removeReason',
            rules: this.defaultRules,
            propInDict: 'unbundReason'
          },
          {
            label: '原维护人',
            type: 'input',
            prop: 'oldEmployeeName',
            disabled: true
          },
          {
            label: '原新旧模式',
            type: 'select',
            prop: 'serviceMode',
            propInDict: 'customerServiceMode',
            disabled: true
          },
          {
            type: 'select',
            label: '新维护人',
            // rules: this.defaultRules,
            prop: 'newEmployeeId',
            remoteSelectList: RNLIST,
            remote: true,
            remoteMethod: (name) =>
              this.getEmployeeList(name, RNLIST, '', false, true)
          },
          {
            label: '新旧模式',
            type: 'select',
            prop: 'bdServiceMode',
            propInDict: 'customerServiceMode',
            rules: this.defaultRules
          },
          {
            type: 'select',
            label: '维护人类型',
            prop: 'maintainerType',
            propInDict: 'custMaintainerType',
            disabled: true
          }
        ],
        form: {
          removeReason: '',
          oldEmployeeId: '',
          newEmployeeId: '',
          oldEmployeeName: '',
          yesNo: '',
          bdServiceMode: 'new'
          // bdServiceMode: ''
        }
      },
      changeMode: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '选择新旧模式',
        text: '确认',
        formItems: [
          {
            label: '新旧模式',
            type: 'select',
            prop: 'bdServiceMode',
            propInDict: 'customerServiceMode',
            rules: this.defaultRules
          }
        ],
        form: {
          bdServiceMode: 'new'
        },
        action: '',
        row: ''
      },
      notesData: '',
      showNotesChange: false,
      showNotesRefuse: false,
      custStatus: '',
      obdMode: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '新增编辑助理',
        text: '确认',
        formItems: [
          {
            label: '选择助理',
            type: 'select',
            prop: 'assistEmployeeId',
            rules: this.defaultRules,
            remoteSelectList: OBD,
            remote: true,
            remoteMethod: (name) => {
              this.getObdList(name)
            }
          }
        ],
        form: {
          assistEmployeeId: ''
        },
        row: ''
      },
      whiteOption: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '加入白名单',
        text: '加入',
        formItems: [
          {
            label: '所属行业',
            type: 'select',
            prop: 'industry',
            rules: this.defaultRules,
            propInDict: 'custWhitelistIndustry'
          }
        ],
        form: {
          industry: ''
        }
      },
      //obd绑定bd
      bindBDOption: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '绑定下单维护人',
        text: '绑定',
        formItems: [
          {
            label: '被绑定的下单维护人',
            type: 'select',
            prop: 'bdEmployeeId',
            rules: { ...this.defaultRules },
            remoteSelectList: ORDERBD,
            remote: true,
            remoteMethod: (name) => {
              this.getOrderbdList(name)
            }
          }
        ],
        form: {
          bdEmployeeId: ''
        }
      },
      //同意下单延期
      dialogSubdelayLeader:{
        show: false,
        showClear: true,
        btnLoading: false,
        title: '审核通过',
        text: '同意',
        labelWidth: '100px',
        formItems: [
          {
            label: '保有时间',
            type: 'date',
            prop: 'mtDate',
            rules: { ...this.defaultRules },
            format: 'yyyy-MM-dd',
          },
        ],
        form: {
          mtDate: '',
        }
      },
      //拒绝延期
      dialogRefusedelayLeader:{
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
            prop: 'delayReason',
            rules: { ...this.defaultRules }
          },
        ],
        form: {
          delayReason: '',
        }
      },
      dialogRefuseBeOrderLeader:{
        show: false,
        showClear: true,
        btnLoading: false,
        title: '审核拒绝',
        text: '确定',
        labelWidth: '100px',
        formItems: [
          {
            label: '拒绝原因',
            type: 'select',
            prop: 'refuseReason',
            multiple: true,
            rules: this.defaultRules,
            propInDict: 'refuseOrderBd'
          },
          {
            label: '拒绝备注',
            type: 'textarea',
            prop: 'refuseRemark',
          },
        ],
        form: {
          refuseReason: '',
          refuseRemark:''
        }
      },
      //修改认证状态
      changeVerifyMode: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '修改认证状态',
        width: '400px',
        formItems: [
          {
            label: '修改认证状态',
            type: 'select',
            prop: 'verifyStatus',
            rules: this.defaultRules,
            propInDict: 'custQuaStatus',
            disabled:true,
          },
          { label: '拒绝原因', 
            prop: 'refuseReason',
            propInDict:'verifyRejection',
            multiple: true,
            type: 'select',             
            rules: { ...this.defaultRules }
          },
          {
            label: '拒绝备注',
            type: 'textarea',
            prop: 'updateReason',
          },
        ],
        form: {
          verifyStatus: 'refuse',
          refuseReason:'',
          updateReason: '',
        }
      },
      freezeOption:{
        show: false,
        showClear: true,
        btnLoading: false,
        title: '冻结',
        text: '确定',
        labelWidth: '100px',
        formItems: [
          {
            label: '冻结原因',
            type: 'select',
            prop: 'freezeReason',
            rules: { ...this.defaultRules },
            propInDict: 'freezeReasonList'
          },
          {
            label: '备注',
            type: 'textarea',
            prop: 'freezeRemark',
            maxlength: 512,
            rules:
              [
                { max: 512, message: '备注最大长度限制512位', trigger: 'blur' },
              ]
          },
        ],
        form: {
          freezeReason: '',
          freezeRemark: '',
        }
      },
      OPEmployeeList:[],
      orderDelayTime:'',
      visitDelayTime:''
    }
  },
  activated() {
    // 重置数据，不然会缓存bug
    MIST.splice(0, 1000)
    LIST.splice(0, 1000)
    NLIST.splice(0, 1000)
    DLIST.splice(0, 1000)
    RLIST.splice(0, 1000)
    OLIST.splice(0, 1000)
    NLISTNEW.splice(0, 1000)
    RNLIST.splice(0, 1000)
    OBD.splice(0, 1000)
    ORDERBD.splice(0, 1000)
    if (this.$route.query.recycleId) {
      const recycleId = this.$route.query.recycleId
      this.$route.query.isGroup == 'group'? RECYCLE.detail({recycleId}):RECYCLE.department({recycleId})
        .then((res) => {
          if (res.code === 0) {
            this.notesData = res.data
            if (res.data.status === 'recycled') {
              this.showNotesChange = true
            }
            if (res.data.status === 'refuse') {
              this.showNotesRefuse = true
            }
          }
        })
        .catch(() => {})
    }
    this.getOPMaintainer()
  },
  watch: {
    'releaseOption.form.belongEmployee'(val) {
      this.releaseOption.form.belongEmployeeId = val.employeeId
      this.releaseOption.form.belongDeptCode = val.deptCode
      this.releaseOption.form.deptCname = val.deptCname
    }
    // 'distributeOption.form.belongEmployee'(val) {
    //   this.distributeOption.form.belongEmployeeId = val.employeeId
    //   this.distributeOption.form.belongDeptCode = val.deptCode
    //   this.distributeOption.form.deptCname = val.deptCname
    // }
  },
  methods: {
    //获取该客户名下的下单和潜在维护人
    getOPMaintainer(){
      CUSTOMER.getOPMaintainer({custid:this.$route.query.custid}).then(res=>{
        this.OPEmployeeList = res.data || []
      })
    },
    subDelay(type){
      this.subType = type
      this.dialogSubdelayLeader.show = true;
      if(type==='order'){
        this.dialogSubdelayLeader.formItems[0].label='下单延期时间'
        this.dialogSubdelayLeader.form.mtDate = this.delayVerifys.expectMtDate
      }else{
        this.dialogSubdelayLeader.formItems[0].label='拜访延期时间'
        this.dialogSubdelayLeader.form.mtDate = this.visitDelayVerifys.expectMtDate
      }
    }, 
    //同意申请
    subBeOrder(){
      this.$confirmWarn(`是否确认同意该维护人成为下单维护人？`, () => {
        CUSTOMER.subTobeOrder({
          custid: this.custid,
          bdEmployeeId:this.orderVerifys.employeeId
        }).then((res) => {
          this.$msgSucClose('已同意!')
          this.initData(this.custid)
        })
      })
    },
    refuseDelay(type){
      this.subType = type
      this.dialogRefusedelayLeader.show = true      
    },
    refuseBeOrder(){
      this.dialogRefuseBeOrderLeader.show = true     
    },
    // 改版支持范围类型
    changeType(val) {
    },
    // 起运港port_of_basic，目的港port_of_destination
    getPort(str = '', type) {
      const data = {
        portName: str,
        portAttribute: type,
        portCodes: '',
        state: 'valid'
      }
      portList(data)
        .then((res) => {
          this.polList = res.data
        })
        .catch(() => {})
    },
    showPolport(val) {
      if (val && !this.polList.length) {
        this.getPort('', 'port_of_basic')
      }
    },
    // 航线
    getSystemLineList(str = '') {
      baseSystemLineList(str, 'valid')
        .then((res) => {
          this.sysLine = res.data
        })
        .catch(() => {})
    },
    // 撤销白名单
    recallWhitelist() {
      this.$confirmWarn('是否确认要将该客户撤出白名单?', () => {
        const data = {
          custid: this.custid
        }
        CUSTOMER.recallWhitelist(data)
          .then((res) => {
            if (res.code === 0) {
              this.initData(this.custid)
              this.$msgSucClose('撤出白名单成功')
            }
          })
          .catch(() => {})
      })
    },
    //加入白名单，不需要弹框了
    toBeWhite(){
      this.$confirmWarn('是否确认要将该客户设置成白名单?', () => {
        const data = {
          custid: this.custid
        }
        CUSTOMER.joinWhitelist(data)
          .then((res) => {
            if (res.code === 0) {
              this.initData(this.custid)
              this.$msgSucClose('设置白名单成功')
            }
          })
          .catch(() => {})
      })
    },
    // 加入白名单
    whiteClose(tag) {
      if (!tag) {
        this.whiteOption.show = false
        return
      }
      this.joinWhitelist()
    },
    // 设置白名单
    joinWhitelist() {
      const data = {
        custid: this.custid,
        industry: this.whiteOption.form.industry
      }
      CUSTOMER.joinWhitelist(data)
        .then((res) => {
          if (res.code === 0) {
            this.whiteOption.show = false
            this.initData(this.custid)
            this.$msgSucClose('加入白名单成功')
          }
        })
        .catch(() => {})
    },
    // 分配客户
    showRecycle() {
      this.dialogOption.isCts = this.isCts
      this.dialogOption.show = true
    },
    allotDialog(query) {
      const recycleIds = [this.$route.query.recycleId]
      query.recycleMode = this.$route.query.isGroup;
      const data = {
        ...query,
        recycleIds,
      }
      RECYCLE.assign(data)
        .then((res) => {
          if (res.code === 0) {
            this.dialogOption.show = false
            this.$msgSucClose('分配成功！')
            if (this.isCts && query.assignType === 'manager') {
              this.custStatus = 'to_mg_assign'
            } else {
              this.custStatus = 'assigned'
            }
            this.initData(this.custid)
          }
        })
        .catch(() => {})
    },
    closeDialog() {
      this.dialogOption.show = false
    },
    // 撤回客户
    recall() {
      let datas = {
        recycleId:this.$route.query.recycleId,
        recycleMode:this.$route.query.isGroup
      }
      this.$confirm('是否确认撤回该客户?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          RECYCLE.recall(datas)
            .then((res) => {
              if (res.code === 0) {
                this.$msgSucClose('撤回客户成功')
                this.custStatus = 'recycled'
                this.initData(this.custid)
              }
            })
            .catch(() => {})
        })
        .catch((err) => {})
    },
    // 获取员工列表 filter 是否过滤掉已有维护人
    async getEmployeeList(name, list, showDept, queryColumn, filter) {
      const query = []
      name && query.push({ column: 'name', type: 'eq', value: name })
      query.push({ column: 'roleCode', type: 'in', value: 'bd,obd' })
      if (queryColumn) {
        query.push({ column: 'deptCode', type: 'eq', value: this.deptCode })
      }
      listByRole({ currPage: 1, pageSize: 100, query }).then(({ data }) => {
        if (filter) {
          const arr = OLIST.filter((item) => item.status === 'effect').map(
            (v) => v.bdEmployeeId
          )
          data.list = data.list.filter((v) => !arr.includes(v.employeeId))
        }
        const arr = data.list.map((v) => {
          const label = showDept ? v.cname + ' ' + v.deptCname : v.cname
          return { ...v, label, value: v.employeeId }
        })
        list.splice(0, 100, ...arr)
      })
    },
    // 获取obd下拉
    getObdList(name = '') {
      const data = {
        currPage: 1,
        pageSize: 30,
        query: [
          { column: 'roleCode', type: 'in', value: 'obd' },
          { column: 'name', type: 'eq', value: name }
        ]
      }
      listByRole(data)
        .then((res) => {
          const arr = res.data.list.map((v) => {
            const label = `${v.cname} (${v.deptCname || '未知'})`
            return { ...v, label, value: v.employeeId }
          })
          OBD.splice(0, 100, ...arr)
        })
        .catch(() => {})
    },
    getOrderbdList() {
      const orderList = this.baseInfo.bds.filter(item=>item.maintainerType === 'order' && item.isFreeze === 'N' && item.status === 'effect')
      const arr = orderList.map((v) => {
        return { ...v, label:v.bdEmployeeName, value: v.bdEmployeeId}
      })
      ORDERBD.splice(0, 100, ...arr)
    },
    // 客户类型转换成显示内容
    convertRole(arr, customerRole) {
      return arr
        .map((v) => v.roleType)
        .join('+')
        .replace(/\b(\w+)\b/g, (v) => customerRole[v])
    },
    // 返回的数据转换成请求和显示需要的结构和字段
    convertData({ org, roles, custClass }) {
      const { customerRole, customerClassNew } = this.dictMapObj
      const _roles = this.convertRole(roles, customerRole)
      const _custClass = customerClassNew[custClass]
      return { ...org, roles, _roles, custClass, _custClass }
    },
    // 获取详情信息
    initData(custid) {
      console.log('-@@@333')
      this.getdelayVerifyInfor();
      this.getCustLevel()
      this.lsLoading = true
      // this.activeItem = panes[0].name
      // 初始化显示第一个tab 或者客户需求(审核直接跳客户需求tab)
      let isAnnTab = this.$route.query.isAnnTab
      this.activeItem = isAnnTab?'CUSTn':panes[0].name
      
      let followlog = this.$route.query.followlog
      if (followlog) {
        this.activeItem = 'CUSTh'
      } else {
        this.activeItem = panes[0].name
      }
      let method = this.custid
        ? CUSTOMER.verifyInfo
        : FOLLOW.customerOrgDetail
      let data = this.custid ? { custid } : { orgid: custid }
      if (this.custid && this.$route.query.isGroup) {
        method = CUSTOMER.customerInfo
        data.seasType = this.$route.query.isGroup === 'department' ? 'department_sea': 'group_sea'
      }
      method(data)
        .then((res) => {
          let { organizationDto, roles, customerDto, orgVerifyDto, bds } =
            res.data
          this.$store.commit('crm/setAllBaseInfo', res.data)
          this._backupRes = res.data
          // 预设默认值时,值为null就会失效
          organizationDto = organizationDto || {}
          roles = roles || []
          customerDto = customerDto || {}
          bds = bds || []
          if (bds.length) {
            OLIST.splice(
              0,
              100,
              ...bds.map((v) => ({
                ...v,
                label: v.bdEmployeeName,
                value: v.bdEmployeeId
              }))
            )
          }
          orgVerifyDto = orgVerifyDto || {}
          const {
            custLevel,
            orgid,
            mtDate,
            custClass,
            updateCustClass,
            updatedName,
            updatedTime,
            verifyStatus,
            custMode,
            serviceMode,
            association,
            socialStaffNum,
            firstTime,
            nearlyTime,
            updateAssociation,
            companyShare,
            updateCompanyShare,
            marketShare,
            updateMarketShare,
            podServiceAbility,
            updatePodServiceAbility
          } = customerDto
          this.$route.query.custid = this.custid = customerDto.custid
          this.orgid = customerDto.orgid
          this.isBlack = customerDto.isBlacklist == 'yes'
          this.isRecycle = customerDto.isRecycle == 'yes'
          // 委托客户
          this.isClient = !!roles.find((item) => item.roleType == 'client')
          //潜在客户
          const { province, city, district } = organizationDto
          organizationDto.indexAddr = province
            ? district
              ? [province, city, district]
              : [province, city]
            : []
          // 修改所属行业格式
          let industry = organizationDto.industry
          let industryArr = []
          if (industry) {
            if (industry.includes('[')) {
              industryArr = JSON.parse(industry)
              this.$set(organizationDto, 'industryArr', industryArr.pop())
            } else {
              industryArr.push(industry)
              this.$set(organizationDto, 'industryArr', industry)
            }
          } else {
            this.$set(organizationDto, 'industryArr', '')
          }
          const oldData = this.convertData({
            org: organizationDto,
            roles,
            custClass: custClass
          })
          orgVerifyDto = orgVerifyDto || {}
          this.baseInfo = {
            backupInfo: customerDto,
            association,
            socialStaffNum,
            ...oldData,
            orgid,
            custLevel,
            mtDate,
            orgVerifyDto,
            updatedName,
            updatedTime,
            verifyStatus,
            bds,
            custMode,
            serviceMode,
            firstTime,
            nearlyTime,
          }
          if(verifyStatus === 'pass'){
            let { organizationDto: org, updateRoles: roles } = res.data
            this.baseInfo.updateInfo = this.convertData({
              org,
              roles,
              custClass: custClass
            })
           	this.baseInfo.companyShare =  companyShare		
            this.baseInfo.marketShare =  marketShare		
            this.baseInfo.podServiceAbility =  podServiceAbility		
            this.baseInfo.association =  association
            // this.baseInfo.roles = roles
          }else{
           let { organizationDto: org, updateRoles } = res.data
            this.baseInfo.updateInfo = this.convertData({
              org,
              roles,
              custClass: updateCustClass
            })
           	this.baseInfo.companyShare = updateCompanyShare || companyShare		
            this.baseInfo.marketShare = updateMarketShare || marketShare		
            this.baseInfo.podServiceAbility = updatePodServiceAbility || podServiceAbility		
            this.baseInfo.association = updateAssociation || association
            this.baseInfo.custClass = updateCustClass || custClass
            // this.baseInfo.roles = updateRoles || roles
          }
          // if (this.isPotential) {
          //   this.baseInfo.roles = [{ roleType: 'potential' }]
          // }
          this.isForeignPeer = !['中国', '中国大陆', "中国香港", "中国澳门", "香港", "澳门"].includes(this.baseInfo.country) && ['peer'].includes(this.baseInfo.custClass)
          this.$store.commit('crm/setDetailBaseInfo', this.baseInfo)
          this.lsLoading = false
          let newIndustry = this.baseInfo.industry&&JSON.parse(this.baseInfo.industry)
          if(['智能家具制造业','智能物流装备','光纤光缆','通信终端','汽车配件产业'].includes(newIndustry[newIndustry.length-1])){
            this.isSpcIndustry = newIndustry[newIndustry.length-1]
          }else{
            this.isSpcIndustry = false
          }
        })
        .finally(() => {
          this.lsLoading = false
        })
      // .catch(this.routerDelBack)
    },
    //获取客户等级
    getCustLevel(){
      CUSTOMER.getCustLevel({
        custid: this.$route.query.custid
      }).then((res) => {
        this.custGrade = res.data.custGrade
      })
    },
    getdelayVerifyInfor(){
      this.delayVerifys='';
      this.orderVerifys='';
      this.visitDelayVerifys='';
      CUSTOMER.delayVerifyInfo({
        custid: this.custid,
      })
      .then((res) => {
        const datas = res.data.custDelayVerifyInfor
        //下单延期
        this.delayVerifys = datas.find((item) =>{
          return (item.verifierId==this.userId && item.bdEmployeeId== this.$route.query.employeeId&& item.delayType==='order_delay')
        })
        if(this.delayVerifys && this.delayVerifys.verifyStatus === 'submit'){   
          this.getOrderDelayTime(this.delayVerifys)   //获取上一次成功的时间
          this.isVer = true
        }else{
          this.isVer = false
        }
        //拜访延期
        this.visitDelayVerifys = datas.find((item) =>{
          return (item.verifierId==this.userId && item.bdEmployeeId== this.$route.query.employeeId && item.delayType==='visit_delay')
        })
        if(this.visitDelayVerifys && this.visitDelayVerifys.verifyStatus === 'submit'){ 
          this.getOrderDelayTime(this.visitDelayVerifys)      
          this.isVisitVer = true
        }else{
          this.isVisitVer = false
        }

        const orderDatas = res.data.custMaintainerVerifyInfor
        this.orderVerifys = orderDatas.find((item) =>{
            return (item.verifierId === this.userId && item.employeeId == this.$route.query.employeeId )
        })
        if(this.orderVerifys && this.orderVerifys.verifyStatus == 'submit'){      
          this.isOrderVer = true
        }else{
          this.isOrderVer = false
        }
      })
      .finally(() => {
        // this.dialogDelayLeader.btnLoading = false
      })
    },
    getOrderDelayTime(delayVerifys){
      let data = {
        custid:delayVerifys.custid,
        bdEmployeeId:delayVerifys.bdEmployeeId,
        delayType:delayVerifys.delayType
      }
      CUSTOMER.getLatestDelay(data).then(res=>{
        if(res.data&&res.data.mtDate){
          if(delayVerifys.delayType === 'order_delay'){
            this.orderDelayTime = res.data.mtDate
          }else{
            this.visitDelayTime = res.data.mtDate
          }
        }else{
          this.orderDelayTime = ''
          this.visitDelayTime = ''
        }
      })
    },
    goBack() {
      this.routerBack()
    },
    // 关闭拒绝提醒弹框
    refuseConfirm() {
      CUSTOMER.refuseConfirm({ custid: this.custid }).then((res) => {
        this.baseInfo.orgVerifyDto.showStatus = 'no'
        this.$forceUpdate()
      })
    },
    // 更改级别
    changeVip(tag) {
      if (!tag) return (this.vipOption.show = false)
      CUSTOMER.custLevelUpdate({
        custid: this.custid,
        ...this.vipOption.form
      }).then((res) => {
        this.$msgSucClose('更改成功！')
        this.baseInfo.custLevel = this.vipOption.form.custLevel
        this.vipOption.show = false
      })
    },
    // 加入黑名单
    blackOp(tag) {
      if (!tag) return (this.blackOption.show = false)
      const { name, uscc } = this.baseInfo
      const data = {}
      const form = this.blackOption.form
      for (const key in form) {
        const value = form[key]
        if (value instanceof Array) {
          data[key] = value.join(',')
        } else {
          data[key] = value
        }
      }
      // BLACK.customerAdd({ custid: this.custid, name, uscc, ...data }).then((res) => {
      BLACK.customerAdd({ name, uscc, ...data }).then((res) => {
        this.$msgSucClose('加入黑名单成功！')
        this.initData(this.custid)
        this.blackOption.show = false
        this.isBlack = true
      })
    },
    // 解除黑名单
    releaseOp(tag) {
      if (!tag) return (this.releaseOption.show = false)
      // console.log({ orgid: this.orgid, orgType: 'customer', ...this.releaseOption.form })
      // return
      BLACK.customerRelease({
        orgid: this.orgid,
        orgType: 'customer',
        ...this.releaseOption.form
      }).then((res) => {
        this.$msgSucClose('解除黑名单成功！')
        this.initData(this.custid)
        this.releaseOption.show = false
        this.isBlack = false
      })
    },
    showAddDialog() {
      this.addOption.action = 'add'
      this.addOption.title = '新增维护人'
      this.addOption.form = { customerBdSaveDtos: {}, maintainerType: '', supportType:'', podLines:[], polNames:[], businessTypes:[],serviceTypes:[],customerDepartment:''}
      this.addOption.formItems[0].disabled = false
      this.addOption.formItems[1].disabled = false
      if(this.isRecycle){
        this.addOption.formItems[1].selectOptions = [
          { label: '普通维护人', value: 'general' }
        ]
      }
      // if (
      //   this.addOption.formItems.find((item) => item.prop === 'bdServiceMode')
      // ) {
      //   this.addOption.formItems = this.addOption.formItems.filter(
      //     (item) => item.prop !== 'bdServiceMode'
      //   )
      // }

      this.addOption.show = true
    },
    // 新增维护人
    addCustomer(tag) {
      if (!tag) {
        return (this.addOption.show = false)
      }
      let { customerBdSaveDtos, maintainerType,bdServiceMode, supportType, podLines, polNames, businessTypes, customerDepartment, serviceTypes,oid='' } = this.addOption.form
      let {employeeId:bdEmployeeId, deptCode:bdDeptCode, cname:bdEmployeeName} = customerBdSaveDtos
      // 只有同一客户有两个及以上潜在/下单维护人存在时,必填支持范围
      const orderList = this.baseInfo.bds.filter(item=>(item.maintainerType === 'order' ||item.maintainerType === 'potential')&& item.isFreeze === 'N' && item.status === 'effect')
      let sta = !!podLines.length || !!polNames.length || !!businessTypes.length || !!customerDepartment ||!!serviceTypes.length
      if(orderList.length>0 && !supportType && this.addOption.action==='add' && maintainerType!=='general'){
        return this.$msgErrClose('客户已存在潜在/下单维护人,支持范围必填')
      }
      if(orderList.length>1 && !supportType && this.addOption.action==='edit' && maintainerType!=='general'){
        return this.$msgErrClose('客户存在两个及以上潜在/下单维护人,支持范围必填')
      }
      if (supportType && supportType !== 'all' && !sta) {
        return this.$msgErrClose('支持范围必须同时填写')
      }
      let data = {
        oid,
        custid: this.custid,
        customerBdSaveDto: {
          bdEmployeeId,
          bdDeptCode,
          bdEmployeeName,
          custid: this.custid,
          orgid: this.orgid,
          maintainerType,
          bdServiceMode,
        },
        supportType,
        supportContent: {
          podLines,
          polNames,
          businessTypes,
          customerDepartment,
          serviceTypes
        }
      }
      let str = this.addOption.action === 'add' ? 'addMaintainer' : 'editMaintainer'
      this.addOption.btnLoading = true
      if(!data.customerBdSaveDto.bdEmployeeId){
         this.addOption.btnLoading = false
         return this.$msgErrClose('请选择正确的维护人')
      }
      CUSTOMER[str](data).then(
        (res) => {
          let text = this.addOption.action === 'add' ? '新增维护人成功' : '编辑维护人成功'
          this.$msgSucClose(text)
          this.initData(this.custid)
          this.refreshView('CustomerReviewList', 'from')
          this.addOption.show = false
        }
      ).catch(() => {})
      .finally(() => {
        this.addOption.btnLoading = false
      })
    },
    // 更改维护人
    changeCustomer(tag) {
      if (!tag) return (this.changeOption.show = false)
      const { customerBdSaveDtos } = this.changeOption.form
      // customerBdSaveDtos = customerBdSaveDtos.map((v) => ({
      //   bdEmployeeId: v.employeeId,
      //   custid: this.custid,
      //   orgid: this.orgid,
      //   bdDeptCode: v.deptCode,
      //   bdEmployeeName: v.cname,
      // }))
      // console.log(this.baseInfo.bds[0].bdEmployeeId)
      // console.log(customerBdSaveDtos.employeeId)
      const bdsId =
        this.baseInfo.bds &&
        this.baseInfo.bds[0] &&
        this.baseInfo.bds[0].bdEmployeeId
      if (bdsId == customerBdSaveDtos.employeeId) {
        return this.$msgErrClose('更改的维护人不能是原维护人！')
      }
      const {
        employeeId: bdEmployeeId,
        cname: bdEmployeeName,
        deptCode: bdDeptCode
      } = customerBdSaveDtos
      CUSTOMER.alterMaintainer({
        custid: this.custid,
        orgid: this.orgid,
        bdEmployeeId,
        bdEmployeeName,
        bdDeptCode
      }).then((res) => {
        this.$msgSucClose('更改维护人成功！')
        this.initData(this.custid)
        this.refreshView('CustomerReviewList', 'from')
        this.changeOption.show = false
        this.changeOption.form = { customerBdSaveDtos: '' }
      })
    },
    // 认领、分配按钮
    // distributeShow(row) {
    //   console.log(this.custid)
    //   if (this.isDistribute) {
    //     return (this.distributeOption.show = true)
    //   }
    //   this.$confirmWarn('确认认领此客户吗？', () => {
    //     RECYCLE.claim({ custid: this.custid }).then(res => {
    //       this.$msgSucClose('认领成功！')
    //       this.routerDelBack(true)
    //     })
    //   })
    // },
    // 确认分配
    // closeDialog(tag) {
    //   // console.log(this.dialogOption.form)
    //   if (!tag) return (this.distributeOption.show = false)
    //   RECYCLE.assign({
    //     custid: this.custid,
    //     ...this.distributeOption.form
    //   }).then(res => {
    //     this.$msgSucClose('分配成功！')
    //     this.initData(this.custid)
    //     this.refreshView('RecycleList', 'from')
    //     this.distributeOption.show = false
    //   })
    // },
    multiVal(val, dict) {
      return val.replace(/\b(\w+)\b/g, (item) => (dict && dict[item]) || '')
    },
    // 获取客户部员工列表
    async getEmployeeRoles(name, id) {
      // if (!name && !id) return
      const query = []
      id && query.push({ column: 'employeeId', type: 'eq', value: id })
      name && query.push({ column: 'name', type: 'eq', value: name })
      query.push({ column: 'roleCode', type: 'eq', value: 'cts' })
      listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data }) => {
        RLIST.splice(
          0,
          1000,
          ...data.list.map((v) => ({
            ...v,
            label: v.cname + ' ' + v.employeeNo,
            value: v.employeeId
          }))
        )
      })
    },
    // 表格内解绑
    emitEvent(row) {
      if (row.action === 'remove') {
        if (row.maintainerType !== 'order') {
          this.dialogRemoveLeader.formItems =
            this.dialogRemoveLeader.formItems.filter(
              (item) => !['serviceMode', 'bdServiceMode'].includes(item.prop)
            )
        } else {
          if (
            !this.dialogRemoveLeader.formItems.find(
              (item) => item.prop === 'serviceMode'
            )
          ) {
            this.dialogRemoveLeader.formItems.splice(2, 0, {
              label: '原新旧模式',
              type: 'select',
              prop: 'serviceMode',
              propInDict: 'customerServiceMode',
              disabled: true
            })
          }
          if (
            !this.dialogRemoveLeader.formItems.find(
              (item) => item.prop === 'bdServiceMode'
            )
          ) {
            this.dialogRemoveLeader.formItems.splice(4, 0, {
              label: '新旧模式',
              type: 'select',
              prop: 'bdServiceMode',
              propInDict: 'customerServiceMode',
              rules: this.defaultRules
            })
          }
        }
        this.removeRow = row
        this.dialogRemoveLeader.form.oldEmployeeId = row.bdEmployeeId
        this.dialogRemoveLeader.form.oldEmployeeName = row.bdEmployeeName
        this.dialogRemoveLeader.form.serviceMode = row.bdServiceMode
        this.dialogRemoveLeader.form.maintainerType = row.maintainerType
        this.dialogRemoveLeader.form.newEmployeeId = ''
        this.dialogRemoveLeader.show = true
      } else if (row.action === 'setMain') {
        // this.changeMode.row = row
        // this.changeMode.action = 'setMain'
        // this.changeMode.show = true
        this.$confirmWarn('是否设置该维护人为主维护人', () => {
          CUSTOMER.setMaintainer({
            custid: this.custid,
            employeeId: row.bdEmployeeId
          }).then((res) => {
            this.$msgSucClose('成功设置主维护人!')
            this.initData(this.custid)
          })
        })
      } else if (row.action === 'change') {
        
        if (row.maintainerType !== 'order') {
          this.changeMode.row = row
          this.changeMode.action = 'change'
          this.changeMode.title = '选择新旧模式'
          this.changeMode.form.bdServiceMode = row.bdServiceMode || 'new'
          this.changeMode.show = true
        } else {
          this.$confirmWarn(
            `是否更换为${
              row.maintainerType === 'order'
                ? '普通类型维护人？更换后该维护人将不可用此客户下单'
                : '下单类型维护人？更换后该维护人将允许用此客户下单'
            }`,
            () => {
              CUSTOMER.setMaintainerOrder({
                custid: this.custid,
                employeeId: row.bdEmployeeId,
                maintainerType:
                  row.maintainerType === 'order' ? 'general' : 'order'
              }).then((res) => {
                this.$msgSucClose('更换成功!')
                this.initData(this.custid)
              })
            }
          )
        }
      } else if (row.action === 'serviceMode') {
        this.changeMode.row = row
        this.changeMode.action = 'serviceMode'
        this.changeMode.title = '编辑新旧模式'
        this.changeMode.form.bdServiceMode = row.bdServiceMode || 'new'
        this.changeMode.show = true
      } else if (row.action === 'addObd') {
        this.obdMode.row = row
        this.obdMode.title = '新增销售助理'
        this.obdMode.form.assistEmployeeId = ''
        this.obdMode.show = true
      } else if (row.action === 'delObd') {
        this.$confirmWarn(`是否确认删除该销售助理？`, () => {
          const { bdEmployeeId, custid, belongBdEmployeeId } = row
          CUSTOMER.removeBdAssistant({
            assistEmployeeId: bdEmployeeId,
            custid,
            bdEmployeeId: belongBdEmployeeId
          }).then((res) => {
            this.$msgSucClose('删除业务助理成功!')
            this.initData(this.custid)
          })
        })
      } else if (row.action === 'edit'){
        //编辑
        this.addOption.form.supportType = ''
        setTimeout(() => {
        let {bdEmployeeId:employeeId, bdDeptCode:deptCode, bdEmployeeName:cname, maintainerType, supportType, polNames, podLines } = row
        this.addOption.form = Object.assign({},this.addOption.form, JSON.parse(JSON.stringify(row)), {
          customerBdSaveDtos: {
            employeeId,
            deptCode,
            cname
          }
        })
        this.addOption.formItems[0].remoteSelectList.push({employeeId,deptCode,cname, label:cname,value:employeeId})
        if (maintainerType === 'order') {
          let find = this.addOption.formItems.find(item => item.prop === 'bdServiceMode')
          if (!find) {
            const item = {
              label: '新旧模式',
              prop: 'bdServiceMode',
              propInDict: 'customerServiceMode',
              type: 'select',
              rules: this.defaultRules,
              disabled: false
            }
            this.addOption.formItems.push(item)
            this.addOption.form.bdServiceMode = 'new'
          }
        } else {
          this.addOption.formItems = this.addOption.formItems.filter(item => item.prop !== 'bdServiceMode')
          this.addOption.form.bdServiceMode = ''
        }
        this.addOption.action = 'edit'
        this.addOption.title = '编辑维护人'
        this.addOption.formItems[0].disabled = true
        let roles = this.baseInfo.roles
        if( this.addOption.action === 'edit'){
          if(row.maintainerType == 'order'){
            this.addOption.formItems[1].selectOptions= [
              {label:'下单维护人',value:'order'},
              {label:'潜在维护人',value:'potential'},
              {label:'普通维护人',value:'general'},
            ]
          }else{
            let hasPotentialOpt = roles.some(item => ['potential', 'client'].includes(item.roleType))
            if (hasPotentialOpt) {
              this.addOption.formItems[1].selectOptions = [
                  { label: '潜在维护人', value: 'potential' },
                  { label: '普通维护人', value: 'general' }
                ]
                } else {
                this.addOption.formItems[1].selectOptions = [
                  { label: '普通维护人', value: 'general' }
                ]
            }
          }
        }
        if (supportType === 'pol_name') {
          this.polList = polNames
        }
        if (supportType === 'pod_line') {
          this.sysLine = podLines
        }
        }, 100)
        this.addOption.show = true
      }else if (row.action === 'freeze'){
        this.freezeOption.form.bdEmployeeId = row.bdEmployeeId
        this.freezeOption.form.custid = row.custid
        this.freezeOption.form.maintainerType = row.maintainerType
        this.freezeOption.form.oid = row.oid
        this.freezeOption.show = true
      }else if (row.action === 'unfreeze'){
       this.$confirmWarn(`是否确定解冻该维护人？`, () => {
          const { bdEmployeeId, custid, maintainerType,oid } = row
          CUSTOMER.isFreezeMaintainer({
            bdEmployeeId,
            custid,
            maintainerType,
            oid,
            isFreeze:'N'
          }).then((res) => {
            this.$msgSucClose('解冻成功!')
            this.initData(this.custid)
          })
        })
      }else if (row.action === 'bind'){
        this.bindBDOption.show = true   
        this.bindBDOption.form.assignEmployeeId = row.bdEmployeeId
        this.bindBDOption.form.assignEmployeeName = row.bdEmployeeName  
      }else if(row.action === 'unbind'){
        this.$confirmWarn(`是否解绑下单维护人？`, () => {
          const { bdBindEmployeeId,bdBindEmployeeName, custid,orgid,bdEmployeeId,bdEmployeeName,oid} = row
          CUSTOMER.addBindMaintainer({
            bdEmployeeId:bdBindEmployeeId,
            bdEmployeeName:bdBindEmployeeName,
            custid,
            assignEmployeeId:bdEmployeeId,
            assignEmployeeNam:bdEmployeeName,
            orgid,
            oid,
            status:'remove'
          }).then((res) => {
            this.$msgSucClose('解绑成功!')
            this.initData(this.custid)
          })
        })
      }
    },
    bindBDClose(tag) {
      if (!tag) {
        this.bindBDOption.show = false
        this.bindBDOption.form = {
          bdEmployeeId: '',
        }
        return
      }
      this.joinOrderBd()
    },
    joinOrderBd(){
      const bdEmployeeName = ORDERBD.find(item=>item.bdEmployeeId = this.bindBDOption.form.bdEmployeeId).bdEmployeeName
      let data = {
          custid: this.custid,
          orgid:this.orgid,
          bdEmployeeName:bdEmployeeName,
          status: 'effect',
          ...this.bindBDOption.form
      }
     CUSTOMER.addBindMaintainer(data).then((res) => {
        this.$msgSucClose('已绑定！')
        this.bindBDOption.show = false
        this.initData(this.custid)
      })
    },
    // 选择新旧模式
    changeClose(tag) {
      if (!tag) {
        this.changeMode.show = false
        return
      }
      this.changeModeFn()
    },
    changeModeFn() {
      const bdServiceMode = this.changeMode.form.bdServiceMode
      const { row, action } = this.changeMode
      if (action === 'setMain') {
        CUSTOMER.setMaintainer({
          custid: this.custid,
          employeeId: row.bdEmployeeId,
          bdServiceMode
        }).then((res) => {
          this.$msgSucClose('成功设置主维护人!')
          this.initData(this.custid)
        })
      } else if (action === 'serviceMode') {
        CUSTOMER.setBdServiceMode({
          custid: this.custid,
          employeeId: row.bdEmployeeId,
          bdServiceMode
        }).then((res) => {
          this.$msgSucClose('成功设置服务模式!')
          this.initData(this.custid)
        })
      } else {
        CUSTOMER.setMaintainerOrder({
          custid: this.custid,
          employeeId: row.bdEmployeeId,
          bdServiceMode,
          maintainerType: 'order'
        }).then((res) => {
          this.$msgSucClose('更换成功!')
          this.initData(this.custid)
        })
      }
      this.changeMode.show = false
    },
    // 新增销售助理
    obdClose(tag) {
      if (!tag) {
        this.obdMode.show = false
        return
      }
      this.addObd()
    },
    addObd() {
      const assistEmployeeId = this.obdMode.form.assistEmployeeId
      const { custid, bdEmployeeId } = this.obdMode.row
      CUSTOMER.addBdAssistant({
        assistEmployeeId,
        custid,
        bdEmployeeId
      })
        .then((res) => {
          if (res.code === 0) {
            this.obdMode.show = false
            this.$msgSucClose('新增销售助理成功!')
            this.initData(this.custid)
          }
        })
        .catch(() => {})
    },
    //关闭审核弹框
    closeSubDelayTime() {
      this.dialogSubdelayLeader.show = false
      this.dialogSubdelayLeader.form = {
        mtDate: '',
      }
    },
    closeRefuseDelayTime() {
      this.dialogRefusedelayLeader.show = false
      this.dialogRefusedelayLeader.form = {
        delayReason: '',
      }
    },
    closeRefuseBeorderTime(){
      this.dialogRefuseBeOrderLeader.show = false
      this.dialogRefuseBeOrderLeader.form = {
        refuseReason: '',
        refuseRemark:''
      }
    },
    //关闭冻结弹框
    closeFreezeOption() {
      this.freezeOption.show = false
      this.freezeOption.form = {
        freezeReason: '',
        freezeRemark: ''
      }
    },
    subFrezz(tag){
      if (!tag) {
        return this.closeFreezeOption()
      }
      this.freezeOption.btnLoading = true
        CUSTOMER.isFreezeMaintainer({
          ...this.freezeOption.form,
          isFreeze:'Y'
        }).then((res) => {
          this.$msgSucClose('冻结成功!')
          this.refreshView('CustomerReviewList', 'from')
          this.closeFreezeOption()
          this.initData(this.custid)
        })
         .finally(() => {
          this.freezeOption.btnLoading = false
        })
  },
    //同意延期申请
    subDelayClose(tag){
      if (!tag) {
        return this.closeSubDelayTime()
      }
      this.dialogSubdelayLeader.btnLoading = true
      const verifyTime = new Date(this.dialogSubdelayLeader.form.mtDate)
      let listone = this.baseInfo.bds.find(item => item.bdEmployeeId== this.$route.query.employeeId)
      const originTime = listone.mtDate?new Date(listone.mtDate):0
      const todayTime = new Date()
      if(verifyTime<todayTime){
        this.dialogSubdelayLeader.btnLoading = false
         return this.$msgErrClose('延期的保有时间应大于今天!')
      }
      if(verifyTime<originTime){
        this.dialogSubdelayLeader.btnLoading = false
         return this.$msgErrClose('延期的保有时间不能小于当前保有时间!')
      }
      const method = this.subType ==='order'? CUSTOMER.subDelayVerify:CUSTOMER.subVisitDelayVerify
      let bdId = this.subType ==='order'? this.delayVerifys.bdEmployeeId:this.visitDelayVerifys.bdEmployeeId
      method({
        ...this.dialogSubdelayLeader.form,
        custid: this.custid,
        bdEmployeeId:bdId
      })
        .then((res) => {
          this.$msgSucClose('已同意延期！')
          this.refreshView('CustomerReviewList', 'from')
          this.closeSubDelayTime()
          this.initData(this.custid)
        })
        .finally(() => {
          this.dialogSubdelayLeader.btnLoading = false
        })

    },
    //拒绝延期
    refuseDelayClose(tag){
      if (!tag) {
        return this.closeRefuseDelayTime()
      }
      this.dialogRefusedelayLeader.btnLoading = true
      const method = this.subType==='order'? CUSTOMER.refuseDelayVerify :CUSTOMER.refuseVisitDelayVerify
      const bdId = this.subType==='order'?this.delayVerifys.bdEmployeeId:this.visitDelayVerifys.bdEmployeeId
      const time = this.subType==='order'?this.delayVerifys.expectMtDate:this.visitDelayVerifys.expectMtDate
      method({
        ...this.dialogRefusedelayLeader.form,
        custid: this.custid,
        bdEmployeeId:bdId,
        mtDate:time
      })
        .then((res) => {
          this.$msgSucClose('已拒绝延期！')
          this.refreshView('CustomerReviewList', 'from')
          this.closeRefuseDelayTime()
          this.initData(this.custid)
        })
        .finally(() => {
          this.dialogRefusedelayLeader.btnLoading = false
        })
    },
    //拒绝成为下单维护人
    refuseBeOrderClose(tag){
      if (!tag) {
        return this.closeRefuseBeorderTime()
      }
      this.dialogRefuseBeOrderLeader.btnLoading = true
      CUSTOMER.refuseTobeOrder({
        ...this.dialogRefuseBeOrderLeader.form,
        custid: this.custid,
        bdEmployeeId:this.orderVerifys.employeeId
      })
        .then((res) => {
          this.$msgSucClose('已拒绝！')
          this.refreshView('CustomerReviewList', 'from')
          this.closeRefuseBeorderTime()
          this.initData(this.custid)
        })
        .finally(() => {
          this.dialogRefuseBeOrderLeader.btnLoading = false
        })
    },
    // 解绑
    removeCustomer() {
      this.dialogRemove.show = true
    },
    // 确认解绑
    removeClose(tag) {
      const isCts = this.isCts
      // const removeStr = isCts ? 'dialogRemove' : 'dialogRemoveLeader'
      const removeStr = 'dialogRemoveLeader'
      if (!tag) {
        this[removeStr].show = false
        return
      }
      const { newEmployeeId, oldEmployeeId } = this.dialogRemoveLeader.form
      // if (newEmployeeId == oldEmployeeId && !isCts) {
      if (newEmployeeId == oldEmployeeId) {
        return this.$msgErrClose('维护人不能是原维护人！')
      }
      this[removeStr].btnLoading = true
      // const method = CUSTOMER[isCts ? 'removeMaintainer' : 'handoverMaintainer']
      const method = CUSTOMER['handoverMaintainer']
      const data = { custid: this.custid, ...this[removeStr].form }
      method(data)
        .then((res) => {
          this.$msgSucClose('客户交接成功！')
          if (this.custStatus) {
            this.custStatus = 'recycled'
          }
          OLIST = OLIST.filter(
            (item) => item.value !== this.dialogRemove.form.oldEmployeeId
          )
          this.initData(this.custid)
          this.refreshView('CustomerReviewList', 'from')
          this.refreshView('PotentialList', 'from')
          this[removeStr].show = false
        })
        .finally(() => {
          this[removeStr].btnLoading = false
        })
    },
    //修改认证状态，pass->refuse
    changeVerify(){
      // console.log('store.state.dict.dictMap',store.state.dict.dictMap.custQuaStatus)
      this.changeVerifyMode.show = true
      this.changeVerifyMode.verifyStatus = 'refuse'
    },
    //修改认证状态的提交和关闭
    changeVerifyClose(tag){
      if (!tag) {
        return this.closeVirifyChange()
      }
      this.changeVerifyMode.btnLoading = true
      let data = {
        ...this.changeVerifyMode.form,
        custid: this.custid,
      }
      CUSTOMER.statusUpdate(data)
      .then((res) => {
        this.$msgSucClose('已修改资质认证状态！') 
        this.refreshView('CustomerReviewList', 'from')
        this.closeVirifyChange()
        this.initData(this.custid)
      })
      .finally(() => {
        this.changeVerifyMode.btnLoading = false
      })

    },
    closeVirifyChange() {
      this.changeVerifyMode.show = false
      this.changeVerifyMode.form = {
        verifyStatus:'refuse',
        refuseReason:'',
        updateReason: ''
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const { custid, orgid, custMode, custStatus } = to.query
      vm.isPotentialDetail = to.name === 'PotentialDetail'
      vm.isPotential = custMode == 'potential'
      vm.custStatus = custStatus || ''
      if (vm.isPotential) {
        vm.panes = panes.filter((item) => !item.potentialHide)
      } else {
        vm.panes = panes
      }
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
  mounted() {
    const name = this.$route.query.name
    if (name) {
      document.title = name
    }
  },
}
</script>
<style lang="scss" scoped>
@import '../customerList/scss/detail.scss';
// .finance-page {
//   border-bottom: 20px solid #f8f9fd;
// }
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
.notes-change,
.notes-refuse {
  display: flex;
  margin-top: 5px;
  align-items: center;
  .tag {
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    color: #fff;
    margin-right: 5px;
    border-radius: 4px;
    margin: 5px 8px;
  }
  .content {
    height: 20px;
    line-height: 20px;
    flex: 1;
    margin-left: 5px;
  }
  .el-icon-close {
    margin-right: 8px;
    font-size: 18px;
    cursor: pointer;
  }
}
.notes-change {
  background-color: #fdf2e8;
  .tag {
    background-color: #ef8519;
  }
}
.notes-refuse {
  background-color: #fff0f1;
  color: #cd4130;
  .tag {
    background-color: #cd4130;
  }
}
.is-white {
  color: #33b18a;
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
    .spacia{
      background: #D9EDFF;
      padding: 0 10px;
      transform: scale(0.9);
      border-radius: 5px
    }
  }
  .grade-img img{
    width: 20px;
    height: 22px;
    vertical-align: middle;
    margin-left: 8px;
  }
}
 .middle-item{
  width: 50% !important;
}
  .qulityButton{
    margin-left:10px;
  }
</style>
