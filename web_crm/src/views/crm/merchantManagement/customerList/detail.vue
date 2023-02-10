<template>
  <div
    :class="{ isNotSelf: !isSelf  }"
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    class="finance-page"
    v-loading="lsLoading"
  >
    <div class="finance-container">
      <div class="change-suc-box" v-if="orgNoticeDto.noticeStatus == 'no'">
        <span>基本信息已修改</span>
        <i @click="changeConfirm" class="el-icon-close"></i>
      </div>
      <div class="refuse-box"
        v-if="baseInfo.orgVerifyDto && ['YES','yes'].includes(baseInfo.orgVerifyDto.showStatus)
        && baseInfo.orgVerifyDto.verifyStatus==='refuse'"
      >
        <el-tag>拒</el-tag>
        你的资质认证审核已拒绝，
        <span v-if="baseInfo.orgVerifyDto.refuseReason">拒绝原因：{{
            multiVal(
              baseInfo.orgVerifyDto.refuseReason,
              dictMapObj.verifyRejection,
            )
        }}</span>
        <span v-if="baseInfo.orgVerifyDto.refuseRemark"
          >拒绝备注：{{ baseInfo.orgVerifyDto.refuseRemark }}</span
        >
        <i @click="refuseConfirm" class="el-icon-close" v-if="isSelf"></i>
      </div>
      <!-- 客户关系审核被拒绝 -->
      <div class="refuse-box" v-if="isRelationRefuse&&relationVerifys">
        <el-tag class="red">拒</el-tag>
        <span>客户关系审核拒绝，原因为"{{relationVerifys.refuseReason}}"</span>
      </div>
      <div class="delay-box" v-if="isMe||isRefuse">
        <div v-if="delayVerifys&&delayVerifys.delayType==='order_delay'&& (isMe||isRefuse)">
          <el-tag>延</el-tag>
          <span v-if="isMe">已申请延长下单保有时间，待{{delayVerifys?delayVerifys.verifierName:''}}审核</span>
          <span v-if="isRefuse">延长下单保有时间的申请，已被审核拒绝，拒绝原因：{{delayVerifys?delayVerifys.delayReason:''}}</span>
        </div>
      </div>
      <div class="delay-box" v-if="isVisitMe||isVisitRefuse">
        <div v-if="visitDelayVerifys&&visitDelayVerifys.delayType==='visit_delay' && (isVisitMe||isVisitRefuse)">
          <el-tag>延</el-tag>
          <span v-if="isVisitMe">已申请延长拜访时间，待{{visitDelayVerifys?visitDelayVerifys.verifierName:''}}审核<br/></span>
          <span v-if="isVisitRefuse">延长拜访时间的申请，已被审核拒绝，拒绝原因：{{visitDelayVerifys?visitDelayVerifys.delayReason:''}}<br/></span>
        </div>
      </div>
      <div class="delay-box" v-if="isOrderMe||isOrderRefuse">
        <el-tag v-if="isOrderMe||isRefuse">审</el-tag>
        <span v-if="isOrderMe">已申请成为下单维护人，待{{orderVerifys?orderVerifys.verifierName:''}}审核</span>
        <span v-if="isOrderRefuse">成为下单维护人的申请，已被审核拒绝，
          <span v-if="orderVerifys.refuseReason">拒绝原因：{{
            multiVal(
              orderVerifys.refuseReason,
              dictMapObj.refuseOrderBd,
            )
        }}</span>
        <span v-if="orderVerifys.refuseRemark"
          >拒绝备注：{{ orderVerifys.refuseRemark }}</span
        >
          <!-- 拒绝原因：{{orderVerifys?orderVerifys.refuseReason:''}} -->
        </span>

      </div>
      <div class="delay-box" v-if="isFPOrder">
        <span>基本信息中必填信息未完善，若{{baseInfo.backupInfo.promptMessageDate}}内未完善，无法再次下单</span>
      </div>
      <div class="detail-header">
        
        <div class="left-cnt">
          <i class="el-icon-folder-remove"></i>
          <span class="detail-title" :class="{ 'is-white': isWhitelist }">{{
            baseInfo.name
          }}</span>
          <el-tooltip
            content="客户VIP等级"
            effect="dark"
            placement="bottom"
            v-if="baseInfo.custLevel"
          >
            <span
              :class="['vip-icon', `vip-icon-${baseInfo.custLevel}`]"
            ></span>
          </el-tooltip>
          <div class="white-box">
            <template v-if="isWhitelist">
              <img src="~@/assets/white.png" alt="" />
              <span class="white-name">{{ formatterIndustry(baseInfo.industry) }}</span>
            </template>
          </div>
          <div class="white-box" v-if="isSpcIndustry">
            <template>
              <!-- 需要展示特殊所属行业 -->
              <span class="white-name spacia">{{isSpcIndustry}}</span>
            </template>
          </div>
         <div class="white-box">
            <template v-if="isPass && isUnordinary">
              <img src="~@/assets/vpass.png" alt="" />
              <span class="vri-name">已认证</span>
            </template>
            <template v-if="(isRefused || isSubmit || isCreate) && isUnordinary">
              <img src="~@/assets/vfail.png" alt="" />
              <span class="vri-name" v-if="isRefused">未认证通过</span>
              <span class="vri-name" v-if="isCreate">待认证</span>
              <span class="vri-name" v-if="isSubmit">认证中</span>
              <!-- <el-button size="mini" @click="virifyApply()" class="qulityButton" v-if="!isSubmit"
                type="success">提交资质认证</el-button > -->
            </template>
          </div>
          <div class="white-box" v-if="isSowoll">
            <template>
              <span class="vri-name">客户来源：Sowoll</span>
            </template>
          </div>
        </div>
        <!-- <div> -->
          <!-- <el-button @click="goBack" class="finance-class" size="mini">返回</el-button> -->
          <!-- <el-button 
            @click="updateSubmit(true)"
            icon="el-icon-check"
            size="mini"
            type="success"
            v-if="
              (isEdit || parentEdit || brotherEdit ) &&
              isSelf && isPass
            "
            >再次发起资质认证</el-button
          > -->
        <!-- </div> -->
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
      <keep-alive>
        <component
          :companyName="baseInfo.name"
          :custid="custid"
          :is="component"
          :isClient.sync="isClient"
          :isClientOrigin="isClientOrigin"
          :isEdit.sync="isEdit"
          :isJumpRouteFromPage.sync="isJumpRouteFromPage"
          :isManager="isManager && !isRecycle"
          :isPotential.sync="isPotential"
          :isPotentialOrigin="isPotentialOrigin"
          :isSelf="isSelf"
          :orgid="baseInfo.orgid"
          :ref="activeItem"
          @updateSubmit="updateSubmit"
          @updateOverSubmit="updateOverSubmit"
          @toBeOrderMatainerType="toBeOrderMatainerType"
          @initData="initData"
          @verifyBtn="virifyApply"
          :isBlacklist="isBlacklist"
          :isWhitelist="isWhitelist"
          :isIndustry="isIndustry"
          :isForeignPeer.sync="isForeignPeer"
          :baseInfo="baseInfo"
        />
      </keep-alive>
    </div>
    <CrmDialog :option="dialogVerify" @close="close" ref="dialogVerify" v-if="dialogVerify.show"/>
    <!-- 解绑弹框 -->
    <CrmDialog :option="dialogRemoveLeader" @close="removeClose" v-if="dialogRemoveLeader.show"/>
    <!-- 申请延期弹框 -->
    <CrmDialog :option="dialogDelayLeader" @close="delayClose" v-if="dialogDelayLeader.show"/>
    <!-- 放弃弹框 -->
    <CrmDialog
      :option="dialogAbandonLeader"
      @close="abandonClose"
      v-if="dialogAbandonLeader.show"
    />
        <!-- 申请成为下单维护人弹框 -->
    <CrmDialog
      :option="dialogToBeOrderLeader"
      @close="toBeOrderClose"
      v-if="dialogToBeOrderLeader.show"
    />
    <div
      class="finance-search-list-gap"
      v-if="activeItem == panes[0].name"
    ></div>
    <FixedBottom
      :baseInfo="baseInfo"
      :bds="true"
      v-if="activeItem == panes[0].name"
      :remove="!isPotentialOrigin"
      @emitEvent="emitEvent"
    />
    <CrmDialog :option="obdMode" @close="obdClose" v-if="obdMode.show" />
    <!-- 提交资质审核 -->
    <CrmDialog :option="virifyMode" @close="virifyClose" v-if="virifyMode.show" />
  </div>
</template>
<script>
import { netSearchData } from '@/views/crm/data'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import CrmDialog from '@/views/crm/components/crmDialog'
import CrmCard from '@/views/crm/components/card'
import FixedBottom from '@/views/crm/merchantManagement/customerReviewList/components/fixedBottom'
import CUSTOMER from '@/api/crm/customer'
import RECYCLE from '@/api/crm/recycle'
import { parseTime } from '@/utils'
import { mapGetters, mapState } from 'vuex'
import { baseEmployeeList, listByRole,industryRelation } from '@/api/base'
import FOLLOW from '@/api/crm/orgCommunication'
import { regRelateInvoiceReceivable } from '@/api/fin/receivableReg'
import { getValueByKey } from '@/api/base'
import { formatIndustry } from '@/utils/crm'
// 之前的维护人列表
const OLIST = []
// 更新的维护人列表
const NLIST = []
// 审核人列表
const RLIST = []
//申请延期的审核人列表
const DeLIST = []
// 申请成为下单维护人
const OrderLIST = []
//资质审核人列表
const VeryLIST =[]
// 销售助理
const OBD = []
/** ****** 自动引入组件  --begin  省去修改文件名后需要做一系列改动 ******** */
// 更改或添加组件，需遵循文件命名规则，以'Tab.vue'结尾
// 用法 https://webpack.js.org/guides/dependency-management/#require-with-expression
const context = require.context('./detailTabs', false, /Tab.vue$/)
const panes = context
  .keys()
  .map((item) => context(item).default)
  .filter((item) => !item.hidden && !item.customerHide)
// 根据组件name属性最后一位数字进行排序 更改页面tab显示顺序需到组件内更改组件name值
// hidden为true的不导入不排序
// 命名以1,4,7,a,d...结尾中间有间隔，为后续修改添加留有余地
panes.sort(
  (a, b) => a.name.slice(-1).charCodeAt() - b.name.slice(-1).charCodeAt()
)
/** ****** 自动引入组件  --end  ******** */
export default {
  name: 'crmDetail',
  mixins: [mixin, routerMixin],
  components: {
    CrmDialog,
    CrmCard,
    FixedBottom
  },
  provide() {
    // return { relationCfg: this.relationCfg }
    return {
      relationCfg: {
        // 是否已提交审核
        relationRefresh: false,
        // 存放客户关系母子公司的改动数据，增、删
        parentObj: {},
        // 存放客户关系关联公司的改动数据，增、删
        brotherObj: {}
      },
      differentField: this.differentField
    }
  },
  inject: ['defaultRules'],
  // TODO  优先级isSelf>isCts>isManager  isSelf 可编辑   isCts 客户部 解绑   isManager 管理者 解绑
  computed: {
    component() {
      return panes.find(({ name }) => this.activeItem === name)
    },
    ...mapGetters(['dictMapObj']),
    ...mapState('crm', ['detailEditInfo']),
    ...mapState('user', ['userId', 'deptCode']),
    isSelf() {
      return (
        (this.detailId && this.userId == this.detailId) ||
        this.userId === this.createdBy
      )
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
    isSowoll(){
      return this.baseInfo.backupInfo.regSource ==='sowoll'
    },
    isUnordinary(){
       return (this.baseInfo.roles || []).some(item => ['potential', 'client'].includes(item.roleType))
    },
    isFPOrder(){
      return this.isForeignPeer && this.baseInfo.backupInfo.promptMessageFlag
    },
    orderPanes() {
      // return this.isPotentialOrigin ? panes.filter( v => !['CUSTd','CUSTa'].includes(v.name)) : panes
      if (this.$store.state.user.roles.includes('admin')) {
        return panes
      } else {
        const tabs = this.isPotentialOrigin
          ? panes.filter((v) => !['CUSTd', 'CUSTa'].includes(v.name))
          : panes
        const res = tabs.filter((item) =>
          this.checkAuth('CustomerDetail', `tab-${item.name}`)
        )
        return res
      }
    },
    isWhitelist() {
      return this.baseInfo.backupInfo.isWhitelist === 'yes'
    },
    isIndustry() {
      return ['通信产业', '智能制造产业'].includes(this.industryList)
    },
  },
  data() {
    return {
      isManager: this.$store.state.user.roles.includes('manager'),
      isEdit: false,
      isBlacklist:false,
      myMaintainerType:'',
      relationCfg: {
        // 是否已提交审核
        relationRefresh: false,
        // 存放客户关系母子公司的改动数据，增、删
        parentObj: {},
        // 存放客户关系关联公司的改动数据，增、删
        brotherObj: {}
      },
      baseInfo: { orgVerifyDto: {}, backupInfo: {}},
      panes: panes,
      activeItem: panes[0].name,
      isRecycle: false,
      dialogVerify: {
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
            // style: { width: '28%' },
            rules: { ...this.defaultRules },
            show: false,
            remoteSelectList: RLIST,
            remote: true,
            remoteMethod: (name) => {
              this.getEmployeeRoles(name)
            }
          },
          {
            label: '提交原因',
            type: 'textarea',
            prop: 'modifyReason',
            rules: { ...this.defaultRules }
          },
          {
            label: '维护人类型',
            type: 'select',
            prop: 'maintainerType',
            // propInDict: 'custMaintainerType',
            // style: { width: '16%' },
            selectOptions: [
              {
                label: '下单维护人',
                value: 'order'
              },
              {
                label: '普通维护人',
                value: 'general'
              }
            ],
            disabled: true
          },
          {
            label: '新旧模式',
            type: 'select',
            prop: 'bdServiceMode',
            propInDict: 'customerServiceMode',
            rules: { ...this.defaultRules }
          }
        ],
        form: {
          modifyReason: '',
          verifier: '',
          maintainerType: '',
          bdServiceMode: 'new'
        }
      },
      //解绑
      dialogRemoveLeader: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '解绑',
        text: '解绑',
        labelWidth: '100px',
        formItems: [
          {
            label: '解绑原因',
            type: 'select',
            prop: 'removeReason',
            rules: this.defaultRules,
            propInDict: 'unbundReason'
          },
          // { label: '原维护BD', type: 'select', prop: 'oldEmployeeId', rules: this.defaultRules, selectOptions: OLIST },
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
            remoteSelectList: NLIST,
            remote: true,
            remoteMethod: (name) => this.getEmployeeList(name)
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
        }
      },
      //申请延期
      dialogDelayLeader: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '申请延期',
        text: '申请',
        labelWidth: '100px',
        conversation:'说明：若申请下单延期，则在申请延期时间内，命中下单的规则也不会掉入公海，若申请拜访延期，则在申请延期时间内，命中拜访规则也不会掉入公海',
        formItems: [
          {
            label: '审核人',
            type: 'select',
            prop: 'bdEmployeeName',
            rules: { ...this.defaultRules },
            show: true,
            disabled:true,
            remote: true,
          },
          {
            label: '延期类型',
            type: 'select',
            prop: 'delayType',
            propInDict: 'delayType',
            rules: { ...this.defaultRules },
            show: true,
            // multi: true,这个版本不多选
            // multiple: true,
            // forceSelection: true,
            change: (val) => {
              if (val === 'order_delay') {
                if ( !this.dialogDelayLeader.formItems.find((item) => item.prop === 'mtDate')){//第一次选
                const item = {
                  label: '下单延长时间至',
                  type: 'date',
                  prop: 'mtDate',
                  rules: { ...this.defaultRules },
                  format: 'yyyy-MM-dd',
                }
                this.dialogDelayLeader.formItems.push(item)
                }else{//有其他的了,先去掉
                this.dialogDelayLeader.formItems.pop()
                  const item = {
                    label: '下单延长时间至',
                    type: 'date',
                    prop: 'mtDate',
                    rules: { ...this.defaultRules },
                    format: 'yyyy-MM-dd',
                  }
                  this.dialogDelayLeader.formItems.push(item)
                  }
              } else {
                let deadLine = this.dialogDelayLeader.form.visitDeadline
                if (!this.dialogDelayLeader.formItems.find((item) => item.prop === 'mtDate')){//第一次选
                const item ={
                  label: '拜访延长时间至',
                  type: 'date',
                  prop: 'mtDate',
                  rules: { ...this.defaultRules },
                  format: 'yyyy-MM-dd',
                  pickerOptions: {
                    disabledDate(date) {
                      return date.getTime() > new Date(deadLine)
                    }
                  }
                }
                 this.dialogDelayLeader.formItems.push(item)
                }else{//有其他的了,先去掉
                  this.dialogDelayLeader.formItems.pop()
                  const item = {
                    label: '拜访延长时间至',
                    type: 'date',
                    prop: 'mtDate',
                    rules: { ...this.defaultRules },
                    format: 'yyyy-MM-dd',
                    pickerOptions: {
                      disabledDate(date) {
                        return date.getTime() > new Date(deadLine)
                      }
                    }
                  }
                  this.dialogDelayLeader.formItems.push(item)
                }
              }
            }
          },
          {
            label: '申请原因',
            type: 'textarea',
            prop: 'delayReason',
            rules: { ...this.defaultRules }
          },
        ],
        form: {
          bdEmployeeId:'',
          delayReason: '',
          delayType:'',
          mtDate:''
        }
      },
      //放弃
      dialogAbandonLeader: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '放弃',
        text: '确定',
        labelWidth: '100px',
        conversation:'如确定放弃，该客户将可能直接回收至公海无法继续跟进，请确认是否放弃？',
        formItems: [
          {
            label: '放弃原因',
            type: 'textarea',
            prop: 'giveUpReason',
            maxlength: 512,
            rules:
              [
                { max: 512, message: '备注最大长度限制512位', trigger: 'blur' },
                {...this.defaultRules }
              ]
          },
        ],
        form: {
          giveUpReason: '',
        }
      },
      //申请成为下单维护人
      dialogToBeOrderLeader: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '申请成为下单维护人',
        text: '确定',
        labelWidth: '100px',
        formItems: [
          {
            label: '审核人',
            type: 'select',
            prop: 'bdEmployeeName',
            rules: { ...this.defaultRules },
            show: true,
            disabled:true,
            remote: true,
          },
          {
            label: '新旧模式',
            type: 'select',
            prop: 'bdServiceMode',
            propInDict: 'customerServiceMode',
            rules: { ...this.defaultRules }
          }     
        ],
        form: {
          bdEmployeeId: '',
          bdServiceMode:'',
        }
      },
      //提交资质认证
      virifyMode: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '提交资质认证',
        width: '500px',
        labelWidth:'150px',
        formItems: [
          {
            label: '资质审核人',
            type: 'select',
            prop: 'verifierName',
            rules: { ...this.defaultRules },
            show: true,
            disabled:true,
            remote: true,
          },
          {
            label: '提交原因',
            type: 'textarea',
            prop: 'applyReason',
            rules: { ...this.defaultRules }
          },
          {
            label: '同时申请成为下单维护人',
            type: 'radio',
            prop: 'isSameTime',
            change: (val) => {
              if (val === 'yes') {
                if(this.myMaintainerType!=='potential'){
                  return this.$msgErrClose('你不是此客户的潜在维护人！')
                }
                const item = [
                {
                  text: '注意：提交下单维护人申请需在系统上传拜访资料，未上传会审核拒绝。',
                  type: 'text',
                },
                {
                  label: '新旧模式',
                  type: 'select',
                  prop: 'bdServiceMode',
                  propInDict: 'customerServiceMode',
                  rules: this.defaultRules
                },
                {
                  label: '下单维护审核人',
                  type: 'select',
                  prop: 'orderBdEmployeeName',
                  rules: { ...this.defaultRules },
                  show: true,
                  disabled:true,
                  remote: true,
                }]
                item.map(val=>{
                  this.virifyMode.formItems.push(val)
                })
              }else{
                if(this.virifyMode.formItems.length>4){
                  this.virifyMode.formItems.splice(-3,3)
                }
              }
            }
          },
        ],
        form: {
          applyReason: '',
          verifierId: '',
          isSameTime:'',
          orderBdEmployeeId:'',
          bdServiceMode:''
        }
      },
      brotherEdit: false,
      parentEdit: false,
      detailId: '', // 维护人id
      createdBy: '', // 创建人id
      custid: '',
      orgid: '',
      isClient: false,
      hasData: false,
      noData: false,
      netSearchData,
      searchInfo: {},
      reviewer: [],
      isPotential: false,
      isPotentialOrigin: false,
      isClientOrigin: false,
      orgNoticeDto: {},
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
      differentField: [],
      delayVerifys:'',
      orderVerifys:'',
      visitDelayVerifys:'',
      relationVerifys:'',
      isMe:false,
      isVisitMe:false,
      isRefuse:false,
      isVisitRefuse:false,
      isOrderMe:false,
      isOrderRefuse:false,
      industryList:'',
      isForeignPeer:false,
      isRelationRefuse:false,
      isSpcIndustry:false
    }
  },
  watch: {
    // 是否有母子公司关系修改
    'relationCfg.parentObj'(val) {
      this.parentEdit = Object.keys(val).length
    },
    // 是否有关联公司关系修改
    'relationCfg.brotherObj'(val) {
      this.brotherEdit = Object.keys(val).length
    },
    isClient(val) {
      this.dialogVerify.formItems[0].show = val
    },
    isEdit(val) {
      if (val) {
        const { customerRoles } = this.detailEditInfo
        if (customerRoles.includes('client')) {
          this.isClient = true
        } else {
          this.isClient = false
        }
      }
    }
  },
  created() {
    // console.log(this.$store.state.user);
    // alert(this.checkAuth('CustomerDetail','tab-CUST1'))
    this.getdelayReviewer()
    this.getOrderReviewer()
    this.getquaReviewer()
  },
  methods: {
    getIndustry(){
      if(this.baseInfo.industry.includes('[')){
        this.industryList =  JSON.parse(this.baseInfo.industry)[0]
      }else{
        industryRelation({}).then(res => {
          if (res.code === 0) {
            res.data.forEach(item=>{
              item.childList.forEach(val=>{
                if(this.baseInfo.industry === val.industryCname){
                  this.industryList = item.industryCname
                }
              })
            })
          }
        }).catch(()=>{})
      }
    },
    formatterIndustry (str) {
      return formatIndustry(str)
    },
    getdelayReviewer(){
      getValueByKey("delay_verifier").then(res=>{
        if (res.data && res.data.length) {
          let list = res.data.split(",")
          for (let i = 0; i < list.length; i++) {
            DeLIST.splice(
              0,
              1000,{
                label:list[1],
                value:list[0]
              }
            )
          }
        }
      })
    },
    //下单维护审核人
    getOrderReviewer(){
      getValueByKey("qua_order_verifier").then(res=>{
        if (res.data && res.data.length) {
          let list = res.data.split(",")
          for (let i = 0; i < list.length; i++) {
            OrderLIST.splice(
              0,
              1000,{
                label:list[1],
                value:list[0]
              }
            )
          }
        }
      })
    },
    //资质认证审核人
    getquaReviewer(){
      getValueByKey("certification_verifier").then(res=>{
        if (res.data && res.data.length) {
          let list = res.data.split(",")
          for (let i = 0; i < list.length; i++) {
            VeryLIST.splice(
              0,
              1000,{
                label:list[1],
                value:list[0]
              }
            )
          }
        }
      })
    },
    searchCustomer(keywords) {
      CUSTOMER.aiqichaDetail({ keywords })
        .then((res) => {
          this.hasData = true
          const searchInfo = res.data
          if (!searchInfo) return this.initNoData(true)
          searchInfo.estiblishTime = parseTime(
            searchInfo.estiblishTime,
            '{y}-{m}-{d}'
          )
          const usccExpDate =
            searchInfo.toTime && parseTime(searchInfo.toTime, '{y}-{m}-{d}')
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
            regCapital: searchInfo.regCapital
          }
        })
        .catch((err) => {
          this.initNoData(true)
        })
    },
    initNoData(noData) {
      this.searchInfo = {}
      this.noData = !!noData
      this.hasData = noData === false
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
      this.getdelayVerifyInfor();
      this.lsLoading = true
      this.isEdit = false
      // 清空客户关系之前的操作
      this.initRelation()
      // 初始化显示第一个tab 或者跟进记录(可以直接跳跟进记录)
      let followlog = this.$route.query.followlog
      if (followlog) {
        this.activeItem = 'CUSTh'
      } else {
        this.activeItem = panes[0].name
      }
      // 获取详情 区分是客户列表进入还是跟进记录列表进入
      const method = this.custid
        ? CUSTOMER.verifyInfo
        : FOLLOW.customerOrgDetail
      const data = this.custid ? { custid } : { orgid: custid }
      method(data)
        .then((res) => {
          let {
            organizationDto,
            roles,
            customerDto,
            bds,
            orgVerifyDto,
            orgNoticeDto,
            differentField,
            // updateRoles,
          } = res.data
          this.$store.commit('crm/setAllBaseInfo', res.data)
          this._backupRes = res.data //_backupRes无效
          // 高亮修改的字段
          if (differentField) {
            this.differentField.splice(0, 100, ...Object.keys(differentField || {}))
            if(this.differentField.includes('province')) {
              this.differentField.push('indexAddr')
            }
          }
          // 预设默认值时,值为null就会失效
          organizationDto = organizationDto || {}
          roles = roles || []
          customerDto = customerDto || {}
          bds = bds || []
          orgVerifyDto = orgVerifyDto || {}
          this.orgNoticeDto = orgNoticeDto || {}
          this.createdBy = customerDto.createdBy
          if (bds && bds.length) {
            OLIST.splice(
              0,
              100,

              ...bds.map((v) => ({
                ...v,
                label: v.bdEmployeeName,
                value: v.bdEmployeeId
              }))
            )
            const arr = bds.map((v) => v.bdEmployeeId)
            this.detailId = arr.find((v) => v == this.userId) || arr[0]
          } else {
            this.detailId = customerDto.createdBy
          }
          const {
            custLevel,
            orgid,
            mtDate,
            verifyStatus,
            status,
            custClass,
            updateCustClass,
            custMode,
            serviceMode,
            updateServiceMode,
            updatedName,
            updatedTime,
            isBlacklist,
            isRecycle,
            association,
            updateAssociation,
            firstTime,
            nearlyTime,
            companyShare,
            updateCompanyShare,
            marketShare,
            updateMarketShare,
            podServiceAbility,
            updatePodServiceAbility
          } = customerDto
          const { socialStaffNum } = organizationDto
          // if (isBlacklist === 'yes') return this.goBack()
          this.isBlacklist = isBlacklist === 'yes'
          this.isRecycle = isRecycle === 'yes'
          this.isPotentialOrigin = custMode == 'potential'
          this.isPotential = custMode == 'potential'

          if (custMode == 'potential') {
            this.panes = panes.filter((item) => !item.potentialHide)
          } else {
            this.panes = panes
          }
          this.$route.query.custid = this.custid = customerDto.custid
          // this.custid = customerDto.custid
          this.backupRoles = roles
          if (roles && roles.find((item) => item.roleType === 'client')) {
            this.isClient = true
            this.isClientOrigin = true
          } else {
            this.isClientOrigin = false
          }
          if (roles && !roles.length) roles.push({ roleType: 'potential' })
          const { province, city, district } = organizationDto
          // province ? (district ? [province, city, district] : [province, city]) : ''
          // this.ruleForm.indexAddr = province ? (district ? `${province}/${city}/${district}` : `${province}/${city}`) : ''
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
          // let industry = JSON.parse(organizationDto.industry)
          // if (industry && industry.length) {
          //   this.$set(organizationDto, 'industryArr', industryArr.pop())
          // }
          const oldData = this.convertData({
            org: organizationDto,
            roles,
            custClass
          })
          // orgVerifyDto修改状态的信息（拒绝、原因等） verifyStatus 修改状态
          this.baseInfo = {
            backupInfo: customerDto,
            ...oldData,
            orgid,
            custLevel,
            mtDate,
            verifyStatus,
            status,
            orgVerifyDto,
            custMode,
            updatedName,
            updatedTime,
            bds,
            serviceMode,
            association,
            socialStaffNum,
            firstTime,
            nearlyTime,
          }
          this.dialogVerify.form.verifier = ''
          if (orgVerifyDto && orgVerifyDto.verifier) {
            this.dialogVerify.form.verifier = orgVerifyDto.verifier
            // this.getEmployeeRoles()
          }
          // 如果没有完成资质认证，role和海外等六个字段，都取update数据
          if(verifyStatus === 'pass'){
            let { organizationDto: org, } = res.data
            this.baseInfo.updateInfo = this.convertData({
              org,
              roles,
              custClass: custClass
            })
           	this.baseInfo.companyShare =  companyShare		
            this.baseInfo.marketShare =  marketShare		
            this.baseInfo.podServiceAbility =  podServiceAbility		
            this.baseInfo.association =  association
          }else{
           let { organizationDto: org, roles } = res.data
            this.baseInfo.updateInfo = this.convertData({
              org,
              roles,
              custClass: updateCustClass
            })
           	this.baseInfo.custClass = updateCustClass || custClass		
           	this.baseInfo.companyShare = updateCompanyShare || companyShare		
            this.baseInfo.marketShare = updateMarketShare || marketShare		
            this.baseInfo.podServiceAbility = updatePodServiceAbility || podServiceAbility		
            this.baseInfo.association = updateAssociation || association
          }
          if (verifyStatus == 'submit') {
            let { organizationDto: org, roles } = res.data
            org = org || {}
            const { province, city, district } = org
            org.indexAddr = province
              ? district
                ? [province, city, district]
                : [province, city]
              : []
            // 修改所属行业格式
            let industry = org.industry
            let industryArr = []
            if (industry) {
              if (industry.includes('[')) {
                industryArr = JSON.parse(industry)
                this.$set(org, 'industryArr', industryArr.pop())
              } else {
                industryArr.push(industry)
                this.$set(org, 'industryArr', industry)
              }
            } else {
              this.$set(org, 'industryArr', '')
            }
            // this.baseInfo.updateInfo = this.convertData({
            //   org,
            //   roles,
            //   custClass: custClass
            // })
            this.baseInfo.updateInfo.serviceMode =
               updateServiceMode || serviceMode
            this.baseInfo.updateInfo.firstTime = firstTime
            this.baseInfo.updateInfo.nearlyTime = nearlyTime
	          this.baseInfo.updateInfo.companyShare = updateCompanyShare || companyShare		
            this.baseInfo.updateInfo.marketShare = updateMarketShare || marketShare		
            this.baseInfo.updateInfo.podServiceAbility = updatePodServiceAbility || podServiceAbility		
            this.baseInfo.updateInfo.association = updateAssociation || association
            this.baseInfo.updateInfo.custClass = updateCustClass || custClass
          }
          if (this.isSelf) {
            if (differentField) {
             this.baseInfo = Object.assign(this.baseInfo, {custClass: custClass}, differentField)
              if (differentField.province) {
                let {province, city='', district=''} = differentField
                this.baseInfo.indexAddr = [province,city,district ]
              }
            }   
          }
          if (roles.length) {
            this.baseInfo.roles = roles
          }
          // 处理成立日期 added on 2022-5-19
          if (this.baseInfo.setupDate) {
            let [yearStr, monStr] = []
            if (this.baseInfo.setupDate.length === 10 && /^\d{4}[-][0,1][0-9][-][0-3][0-9]$/.test(this.baseInfo.setupDate)) {
              yearStr = this.baseInfo.setupDate.slice(0, 4) // yyyy
              monStr = this.baseInfo.setupDate.slice(4, 7) // -MM
              if (this.baseInfo.setupDateType) {
                if (this.baseInfo.setupDateType === 'year') {
                  this.baseInfo.setupDate = yearStr
                  if (this.baseInfo.updateInfo && this.baseInfo.updateInfo.setupDate) {
                    this.baseInfo.updateInfo.setupDate = yearStr
                  }
                } else if (this.baseInfo.setupDateType === 'month') {
                  this.baseInfo.setupDate = yearStr + monStr
                  if (this.baseInfo.updateInfo && this.baseInfo.updateInfo.setupDate) {
                    this.baseInfo.updateInfo.setupDate = yearStr + monStr
                  }
                }
              }
            }
          }
          this.isForeignPeer = !['中国', '中国大陆', "中国香港", "中国澳门", "香港", "澳门"].includes(this.baseInfo.country) && ['peer'].includes(this.baseInfo.custClass)
          this.$store.commit('crm/setDetailBaseInfo', this.baseInfo)
          // console.log('promptMessageFlag---', this.baseInfo.backupInfo.promptMessageFlag)

          let mybds = this.baseInfo.bds&&this.baseInfo.bds.find(item => item.bdEmployeeId== this.userId &&item.status==='effect')
          this.myMaintainerType = mybds.maintainerType
          this.getIndustry()
          let newIndustry = JSON.parse(this.baseInfo.industry)
          if(['智能家具制造业','智能物流装备','光纤光缆','路由器','汽车配件产业'].includes(newIndustry[newIndustry.length-1])){
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
    getdelayVerifyInfor(){
      this.delayVerifys='';
      this.orderVerifys='';
      this.visitDelayVerifys='';
      CUSTOMER.delayVerifyInfo({
        custid: this.custid,
      })
      .then((res) => {
        const datas = res.data.custDelayVerifyInfor
        // 下单的延期申请
        this.delayVerifys = datas.find((item) =>{return (item.bdEmployeeId==this.userId && item.delayType==='order_delay')} )
        if(this.delayVerifys && this.delayVerifys.verifyStatus == 'submit'){    
          this.isMe = true
          this.isRefuse = false
        }else if(this.delayVerifys &&this.delayVerifys.verifyStatus == 'refuse'){
          this.isRefuse = true
          this.isMe = false
        }else{
          this.isRefuse = false
          this.isMe = false
        }
        // 拜访的延期申请
        this.visitDelayVerifys = datas.find((item) =>{return (item.bdEmployeeId==this.userId && item.delayType==='visit_delay')} )
       if(this.visitDelayVerifys && this.visitDelayVerifys.verifyStatus == 'submit'){    
          this.isVisitMe = true
          this.isVisitRefuse = false
        }else if(this.visitDelayVerifys &&this.visitDelayVerifys.verifyStatus == 'refuse'){
          this.isVisitRefuse = true
          this.isVisitMe = false
        }else{
          this.isVisitRefuse = false
          this.isVisitMe = false
        }
        // 下单维护人
        const orderDatas = res.data.custMaintainerVerifyInfor
        this.orderVerifys = orderDatas.find((item) =>{return (item.employeeId===this.userId)})
        if(this.orderVerifys && this.orderVerifys.verifyStatus == 'submit'){    
          this.isOrderMe = true
          this.isOrderRefuse = false
        }else if(this.orderVerifys &&this.orderVerifys.verifyStatus == 'refuse'){
          this.isOrderRefuse = true
          this.isOrderMe = false
        }else{
          this.isOrderRefuse = false
          this.isOrderMe = false
        }
        //客户关系审核拒绝
        const ralationDatas = res.data.custRelationRefuseVerifyInfor
        this.relationVerifys = ralationDatas.find((item) =>{return (item.createdBy===this.userId)})
        if(this.relationVerifys && this.relationVerifys.verifyState == 'refuse'){    
          this.isRelationRefuse = true
        }else{
          this.isRelationRefuse = false
        }
      })
      .finally(() => {
        this.dialogDelayLeader.btnLoading = false
        this.dialogToBeOrderLeader.btnLoading = false
      })
    },
    goBack() {
      this.routerBack()
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
    // 提交按钮
    updateSubmit(flag,qua,val) {
     // 未认证客户直接保存
      if (flag === 'edit' ) {
        this.$confirmWarn(this.isPass?'该操作将把"已认证"的状态改为"未认证"。是否继续？':'确认保存吗？', () => {
          this.close(true)
        })
      } else if (flag === true) {
        if (this.$refs.CUST1) {
          this.$refs.CUST1.saveBaseInfo()
        }
        if (this.yesNoSumit === 'no') {
          this.virifyMode.btnLoading = false
          return
        }
        //资质认证先保存
        if(qua){
            this.close(true,qua,val)
        }else{
          this.$confirmWarn('确认提交吗？', () => {
            this.close(true)
          })
        }
      } else {
        this.yesNoSumit = flag
        if (flag === 'edit') {
          this.yesNoSumit = 'yes'
          this.isEdit = true
        }
      }
    },
    updateOverSubmit(val){
      this.$confirmWarn('确认保存吗？', () => {
        CUSTOMER.overSeasCustomerSave({ ...val})
        .then((res) => {
          this.$msgSucClose('提交成功！')
          this.refreshView('CustomerList', 'from')
          // 成功后，重新获取数据
          this.initData(this.custid)
        })
        .finally(() => {
          this.dialogVerify.btnLoading = false
          this.virifyMode.btnLoading.show = false
        })
      })

    },
    // 更新后确定提交申请,最终提交地
    close(tag,quaViri,val) {
      // 港澳台客户，社信代码及纳税人识别号为必填项，但不是在勾潜在客户保存时就必填，而是在提交资质认证审核时必须填写才能提交。
      if(quaViri && ['中国', '中国大陆', "中国香港", "中国澳门", "香港", "澳门"].includes(this.baseInfo.country) 
        && this.isUnordinary){
        if(!this.detailEditInfo.uscc && !this.detailEditInfo.taxId){
          return this.$msgErrClose('社信统一代码和纳税人识别号必填！')
        }
      }
      // tag 为true, 表示要更新
      if (tag) {
        // isEdit || parentEdit || brotherEdit
        // let editData = this.isEdit && !this.isClient ? { ...this.detailEditInfo } : { ...this.baseInfo }
        // let editData = this.isEdit || this.isPotential ? { ...this.detailEditInfo } : { ...this.baseInfo }
        const editData = { ...this.detailEditInfo }
        let listone = this.baseInfo.bds&&this.baseInfo.bds.find(item => item.bdEmployeeId== this.userId )
        let bdServiceMode = listone&&listone.bdServiceMode?listone.bdServiceMode:''
        this.detailEditInfo.bdServiceMode = bdServiceMode
        // const custStructDtos = this.parentEdit
        //   ? Object.values(this.relationCfg.parentObj)
        //   : ''
        // const custRelationDtos = this.brotherEdit
        //   ? Object.values(this.relationCfg.brotherObj)
        //   : ''
        const data = {
          ...editData,
          custid: this.custid
        }
        data.roles = data.customerRoles.map((item) => {
          const find = this.backupRoles.find((role) => role.roleType == item)
          if (find) {
            return find
          } else {
            return { custid: this.custid, roleType: item }
          }
        })
        delete data._roles
        delete data._custClass
        if (data.indexAddr && data.indexAddr.length) {
          data.province = data.indexAddr[0]
          data.city = data.indexAddr[1]
          data.district = data.indexAddr[2]
        }
        data.industry = []
        if (Array.isArray(data.industryArr)) {
          data.industry = data.industryArr
        } else {
          data.industry.push(data.industryArr)
        }
        if (data.setupDate) {
          if (!/^\d{4}$/.test(data.setupDate) && !/^\d{4}[-][0,1][0-9]$/.test(data.setupDate) && !/^\d{4}[-][0,1][0-9][-][0-3][0-9]$/.test(data.setupDate)) {
            return this.$msgErrClose('成立日期输入有误,仅支持yyyy/yyyy-mm/yyyy-mm-dd三种格式！')
          } else if (/^\d{4}$/.test(data.setupDate)) { //只输入了年 yyyy 默认加上“-01-01”
            data.setupDate += '-01-01'
            data.setupDateType = 'year'
          } else if (/^\d{4}[-][0,1][0-9]$/.test(data.setupDate)) { //只输入了年月 yyyy-mm 默认加上 “-01”
            data.setupDate += '-01'
            data.setupDateType = 'month'
          } else {
            data.setupDateType = ''
          }
        } else {
          data.setupDate = ''
          data.setupDateType = ''
        }
        if (data.uscc !== data.taxId) {
          return this.$msgErrClose('社信统一代码和纳税人识别号保持一致！')
        }
        // this.dialogVerify.btnLoading = true
        let datas = { ...data, custRoleDtos: data.roles}
        CUSTOMER.updateSubmit({ ...datas})
          .then((res) => {
            this.$msgSucClose('基本信息保存成功！')
            this.refreshView('CustomerList', 'from')
            this.closeVirifyApply()
            // 成功后，重新获取数据
            this.initData(this.custid)
            if(quaViri){
              this.qualificationsVirify(val)
            }
          })
          .finally(() => {
            this.dialogVerify.btnLoading = false
            this.virifyMode.btnLoading = false
          })
      }
      // this.dialogVerify.show = false
    },
    // 初始化客户关系
    initRelation() {
      Object.keys(this.relationCfg.parentObj).forEach((key) => {
        this.$delete(this.relationCfg.parentObj, key)
      })
      Object.keys(this.relationCfg.brotherObj).forEach((key) => {
        this.$delete(this.relationCfg.brotherObj, key)
      })
      this.relationCfg.relationRefresh = true
      this.$nextTick(() => (this.relationCfg.relationRefresh = false))
    },
    // 关闭拒绝提醒弹框
    refuseConfirm() {
      CUSTOMER.refuseConfirm({ custid: this.custid }).then((res) => {
        this.baseInfo.orgVerifyDto.showStatus = 'no'
        this.$forceUpdate()
      })
    },
  
    // 关闭修改提醒弹框
    changeConfirm() {
      CUSTOMER.confirmPreview({ custid: this.custid }).then((res) => {
        this.orgNoticeDto.noticeStatus = 'yes'
        this.$forceUpdate()
      })
    },
    //提交资质审核弹框
    virifyApply(){
      // this.$confirmWarn('是否发起资质认证？', () => {
          this.virifyMode.show = true
          this.virifyMode.form.verifierId = VeryLIST[0].value 
          this.virifyMode.form.verifierName = VeryLIST[0].label 
          this.virifyMode.form.orderBdEmployeeId = OrderLIST[0].value 
          this.virifyMode.form.orderBdEmployeeName = OrderLIST[0].label 
          this.virifyMode.form.maintainerType = this.myMaintainerType
          
      // })
    },
     //提交资质审核弹框点击确定申请
    virifyClose(tag){
      if (!tag) {
        return this.closeVirifyApply()
      }
      if(this.virifyMode.form.isSameTime==='yes'){
        CUSTOMER.verifyAndOrderMaintainer({
            custid: this.custid,
            ...this.virifyMode.form
          })
          .then((res) => {
            this.$msgSucClose('提交成功！') 
            this.refreshView('CustomerReviewList', 'from')
            this.closeVirifyApply()
            this.initData(this.custid) 
          })      
          .finally(() => {
            this.virifyMode.btnLoading = false
          })
      }else{
        this.virifyMode.btnLoading = true
        let data = {
          ...this.virifyMode.form,
          custid: this.custid,
        }
        this.updateSubmit(true,true,data)
      }

    },
    qualificationsVirify(data){
      CUSTOMER.verifyApply(data)
        .then((res) => {
          this.$msgSucClose('已申请资质认证！') 
          this.refreshView('CustomerReviewList', 'from')
          this.closeVirifyApply()
          this.initData(this.custid)
        })
        .finally(() => {
          this.virifyMode.btnLoading = false
        })
    },
    // 获取员工列表
    async getEmployeeList(name) {
      // if (!name) return
      const query = name ? [{ column: 'name', type: 'eq', value: name }] : []
      query.push(
        { column: 'roleCode', type: 'in', value: 'bd,obd' },
        { column: 'deptCode', type: 'eq', value: this.deptCode }
      )
      listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data }) => {
        NLIST.splice(
          0,
          1000,
          ...data.list.map((v) => ({
            ...v,
            label: v.cname,
            value: v.employeeId
          }))
        )
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
    // 获取客户部员工列表
    async getEmployeeRoles(name, id) {
      // if (!name && !id) return
      const query = []
      id && query.push({ column: 'employeeId', type: 'eq', value: id })
      name && query.push({ column: 'name', type: 'eq', value: name })
      query.push({ column: 'roleCode', type: 'eq', value: 'cts_verifier' })
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
        const verifier = this.dialogVerify.form.verifier // 是否有审核人
        const employeeIds = RLIST.map((item) => item.value) // 审核人是否在列表
        if (!verifier || !employeeIds.includes(verifier)) {
          // 如果审核人不在列表或者没有值，默认第一个
          this.dialogVerify.form.verifier = RLIST[0].value
        }
      })
    },
    emitEvent(row) {
      if (row.action === 'remove') {
        // 下单维护人类型
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
        const editData =
          this.isEdit || this.isPotential
            ? { ...this.detailEditInfo }
            : { ...this.baseInfo }
        this.dialogRemoveLeader.form.maintainerType = row.maintainerType
        this.removeCustomer()
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
      }else if(row.action === 'delay'){
        this.dialogDelayLeader.form.maintainerType = row.maintainerType
        let listone = this.baseInfo.bds.find(item => item.bdEmployeeId== this.userId )
        // let originTime = listone.mtDate?listone.mtDate:''
        // this.dialogDelayLeader.form.mtDate = originTime 
        this.dialogDelayLeader.form.bdEmployeeId = DeLIST[0].value 
        this.dialogDelayLeader.form.bdEmployeeName = DeLIST[0].label 
        this.delayTime()
      }else if(row.action === 'abandon'){
        this.dialogAbandonLeader.show = true
      }else if(row.action === 'toBeOrder'){
        if(this.baseInfo.backupInfo.status!=='valid'){
            this.$msgErrClose('资质认证未完成，无法申请成为下单维护人，请先进行资质认证!')
            return
        }
        this.dialogToBeOrderLeader.form.maintainerType = row.maintainerType
        let listone = this.baseInfo.bds.find(item => item.bdEmployeeId== this.userId )
        let bdServiceMode = listone.bdServiceMode?listone.bdServiceMode:''
        this.dialogToBeOrderLeader.form.bdServiceMode = bdServiceMode 
        this.dialogToBeOrderLeader.form.bdEmployeeId = OrderLIST[0].value 
        this.dialogToBeOrderLeader.form.bdEmployeeName = OrderLIST[0].label 
        this.$refs.CUST1.saveBaseInfo('order')
      }

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
    // 解绑
    removeCustomer() {
      this.dialogRemoveLeader.show = true
    },
    // 申请延期
    delayTime() {
     this.delayVerifys='';
     this.visitDelayVerifys='';
      CUSTOMER.delayVerifyInfo({
        custid: this.custid,
      })
      .then((res) => {
        const datas = res.data.custDelayVerifyInfor
          this.delayVerifys = datas.find((item) =>{return (item.bdEmployeeId==this.userId && item.delayType==='order_delay')})
          if(this.delayVerifys && this.delayVerifys.bdEmployeeId == this.userId && this.delayVerifys.verifyStatus == 'submit'){    
            this.isMe = true
            this.isRefuse = false
          }else if(this.delayVerifys && this.delayVerifys.verifyStatus == 'refuse'){
            this.isRefuse = true
            this.isMe = false
          }else{
            this.isRefuse = false
            this.isMe = false
          }
          // 拜访的延期申请
          this.visitDelayVerifys = datas.find((item) =>{return (item.bdEmployeeId==this.userId && item.delayType==='visit_delay')} )
          if(this.visitDelayVerifys  && this.visitDelayVerifys.bdEmployeeId == this.userId && this.visitDelayVerifys.verifyStatus == 'submit'){    
            this.isVisitMe = true
            this.isVisitRefuse = false
          }else if(this.visitDelayVerifys &&this.visitDelayVerifys.verifyStatus == 'refuse'){
            this.isVisitRefuse = true
            this.isVisitMe = false
          }else{
            this.isVisitRefuse = false
            this.isVisitMe = false
          }
          
          if(this.baseInfo.verifyStatus == 'submit' && this.baseInfo.status == 'valid'){
            this.$msgErrClose('此客户状态不是"审核通过"!')
          }else{
          //获取延期时间
          CUSTOMER.getDelayDate({
            custid: this.custid,
          })
          .then((res) => {
             this.dialogDelayLeader.form.visitDeadline = res.data
          })
            this.dialogDelayLeader.show = true
          }       
      })
      .finally(() => {
        this.dialogDelayLeader.btnLoading = false
      })
    },
    //申请成为下单维护人
    toBeOrderMatainerType(){
     this.orderVerifys='';
      CUSTOMER.delayVerifyInfo({
        custid: this.custid,
      })
      .then((res) => {
         const orderDatas = res.data.custMaintainerVerifyInfor
          this.orderVerifys = orderDatas.find((item) =>{return (item.bdEmployeeId==this.userId)})
          if(this.orderVerifys && this.orderVerifys.bdEmployeeId == this.userId && this.orderVerifys.verifyStatus == 'submit'){    
            this.isOrderMe = true
            this.isOrderRefuse = false
          }else if(this.orderVerifys && this.orderVerifys.verifyStatus == 'refuse'){
            this.isOrderRefuse = true
            this.isOrderMe = false
          }else{
            this.isOrderRefuse = false
            this.isOrderMe = false
          }
          if(this.baseInfo.verifyStatus == 'submit' && this.baseInfo.status == 'valid'){
            this.$msgErrClose('此客户状态不是"审核通过"!')
          }else if(this.orderVerifys&&this.orderVerifys.bdEmployeeId == this.userId&&this.orderVerifys.verifyStatus =='submit'){
            this.$msgErrClose('已存在正在审核的申请!')
          }else{
            this.dialogToBeOrderLeader.show = true
          }
      })
      .finally(() => {
          this.dialogToBeOrderLeader.btnLoading = false
      })
    },
    closeRemoveCustomer() {
      this.dialogRemoveLeader.show = false
      this.dialogRemoveLeader.form = {
        removeReason: '',
        oldEmployeeId: '',
        newEmployeeId: '',
        oldEmployeeName: '',
        yesNo: '',
        bdServiceMode: 'new'
      }
    },
    closeDelayTime() {
      this.dialogDelayLeader.show = false
      this.dialogDelayLeader.form = {
        bdEmployeeId:'',
        bdEmployeeName:'',
        delayReason: '',
        mtDate:'',
        delayType:''
      }
    },
    closeVirifyApply() {
      this.virifyMode.show = false
      this.virifyMode.form = {
        applyReason: '',
        verifierId: '',
        isSameTime:'',
        orderBdEmployeeId:'',
        bdServiceMode:''
      }
      this.virifyMode.btnLoading = false
      if(this.virifyMode.formItems.length>4){
          this.virifyMode.formItems.splice(-3,3)
        }
    },
    closeAbandonTime(){
      this.dialogAbandonLeader.show = false
      this.dialogAbandonLeader.form = {
        giveUpReason: '',
      }
    },
    closeToBeOrderTime(){
      this.dialogToBeOrderLeader.show = false
      this.dialogToBeOrderLeader.form = {
        bdEmployeeId: '',
        bdServiceMode: '',
        bdEmployeeName:''
      }
    },
    // 确认解绑
    removeClose(tag) {
      if (!tag) {
        return this.closeRemoveCustomer()
      }
      const { newEmployeeId, oldEmployeeId } = this.dialogRemoveLeader.form
      if (newEmployeeId == oldEmployeeId) {
        return this.$msgErrClose('维护人不能是原维护人！')
      }
      this.dialogRemoveLeader.btnLoading = true
      CUSTOMER.handoverMaintainer({
        custid: this.custid,
        ...this.dialogRemoveLeader.form
      })
        .then((res) => {

          this.$msgSucClose('解绑成功！')
          this.refreshView('CustomerList', 'from')
          this.closeRemoveCustomer()
          this.initData(this.custid)
        })
        .finally(() => {
          this.dialogRemoveLeader.btnLoading = false
        })
    },
    //确认申请延期 
    delayClose(tag){
     if (!tag) {
        return this.closeDelayTime()
      }
      this.dialogDelayLeader.btnLoading = true
      const verifyTime = new Date(this.dialogDelayLeader.form.mtDate)
      let listone = this.baseInfo.bds.find(item => item.bdEmployeeId== this.userId )
      const originTime = listone.mtDate?new Date(listone.mtDate):0
      const todayTime = new Date()
      if(verifyTime<todayTime){
        this.dialogDelayLeader.btnLoading = false
         return this.$msgErrClose('延期的保有时间应大于今天!')
      }
      if(verifyTime<originTime){
        this.dialogDelayLeader.btnLoading = false
         return this.$msgErrClose('延期的保有时间不能小于当前保有时间!')
      }
      let datas = {
         ...this.dialogDelayLeader.form,
        delayType:this.dialogDelayLeader.form.delayType.split(),
        custid: this.custid,
      }
      CUSTOMER.delayVerify(datas)
        .then((res) => {
          this.$msgSucClose('申请成功，请等待审核！')
          this.refreshView('CustomerList', 'from')
          this.closeDelayTime()
          this.initData(this.custid)
        })
        .finally(() => {
          this.dialogDelayLeader.btnLoading = false
        })
    },
    //放弃进公海
    abandonClose(tag){
      if (!tag) {
        return this.closeAbandonTime()
      }
      this.dialogAbandonLeader.btnLoading = true
        RECYCLE.giveUp({
        ...this.dialogAbandonLeader.form,
        custid: this.custid,
      })
      .then((res) => {
        this.$msgSucClose('放弃维护成功')
        this.refreshView('CustomerList', 'from')
        this.closeAbandonTime()   
        this.initData(this.custid)
      })
      .finally(() => {
        this.dialogAbandonLeader.btnLoading = false
      })
    },
     //申请成为下单维护人
    toBeOrderClose(tag){
      if (!tag) {
        return this.closeToBeOrderTime()
      }
      this.dialogToBeOrderLeader.btnLoading = true
        CUSTOMER.tobeOrder({
        ...this.dialogToBeOrderLeader.form,
        custid: this.custid,
      })
      .then((res) => {
        this.$msgSucClose('已提交申请')
        this.refreshView('CustomerList', 'from')
        this.closeToBeOrderTime()   
        this.initData(this.custid)
      })
      .finally(() => {
        this.dialogToBeOrderLeader.btnLoading = false
      })
    },
    multiVal(val, dict) {
      return val.replace(/\b(\w+)\b/g, (item) => (dict && dict[item]) || '')
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const { custid, orgid } = to.query
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
      } else {
        vm.initData(custid || orgid)
      }
    })
  },
  mounted() {
    const name = this.$route.query.name
    if (name) {
      document.title = name
    }
  }
}
</script>
<style lang="scss" scoped>
@import './scss/detail.scss';
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
