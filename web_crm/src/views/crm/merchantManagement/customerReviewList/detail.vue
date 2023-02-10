<template>
  <div
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    class="finance-page"
    v-loading="lsLoading"
  >
    <div class="finance-container">
      <div
        class="refuse-box"
        v-if="status == 'valid' || baseInfo.orgVerifyDto.modifyReason"
      >
        <span>{{ baseInfo.orgVerifyDto.createdName }}已发起资质认证申请，申请时间：{{ baseInfo.orgVerifyDto.createdTime }}，申请原因：{{ baseInfo.orgVerifyDto.modifyReason }}，请及时审核。</span>
      </div>
      <div class="detail-header">
        <div class="left-cnt">
          <i class="el-icon-folder-remove"></i>
          <span
            class="detail-title"
            :class="{ 'is-white': baseInfo.backupInfo.isWhitelist === 'yes' }"
            >{{ baseInfo.name }}</span
          >
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
          <!-- <span v-if="baseInfo.custLevel" :class="['vip-icon',`vip-icon-${baseInfo.custLevel}`]"></span> -->
          <div class="white-box">
            <template v-if="baseInfo.backupInfo.isWhitelist === 'yes'">
              <img src="~@/assets/white.png" alt="" />
              <span class="white-name">{{
                 baseInfo.updateInfo&&baseInfo.updateInfo.industry?
                 formatterIndustry(baseInfo.updateInfo.industry):formatterIndustry(baseInfo.industry)
              }}</span>
            </template>
            <template v-if="isCts">
              <el-button
                size="mini"
                type="text"
                @click="recallWhitelist"
                v-if="baseInfo.backupInfo.isWhitelist === 'yes'"
                >撤销白名单</el-button
              >
              <el-button size="mini" type="text" @click="setWhitelist" v-else
                >设置白名单</el-button
              >
            </template>
          </div>
        </div>
        <OpBtnDialog
          :custid="custid"
          :isValid="showLeven"
          @showWhitelistBtn="showWhitelistBtn = true"
          :isReviewDetail="isReviewDetail"
          :isReviewed="isReviewed"
        />
      </div>
      <div class="finance-search-list-gap"></div>
      <InfoList :bottomB="false" :custInfo="baseInfo" :updateInfo="updateInfo" :differentField="differentField" :beforeField="beforeField">
        <div v-if="$store.state.user.roles.includes('cts')">
          <el-tooltip
            content="大陆以外的客户不支持联网对比，请自行查询"
            placement="bottom"
          >
            <i class="el-icon-question"></i>
          </el-tooltip>
          <el-button @click="check" size="mini">联网对比</el-button>
        </div>
      </InfoList>
      <div class="finance-search-list-gap"></div>
      <!-- 海外同行基本信息 -->
      <template v-if="false">
        <foreignPeerDetail :isForeignPeer="isForeignPeer" :baseInfo="baseInfo"></foreignPeerDetail>
        <div class="finance-search-list-gap"></div>
      </template>
      <div style="height: 10px"></div>
      <TitleTable :columns="linkColumns" :data="linkData" title="联系人" />
      <TitleTable :columns="bankColumns" :data="bankData" title="银行信息" />
      <!-- <TitleTable :columns="followColumns" :data="followData" title="跟进记录" /> -->
      <div class="follow-tab">
        <div class="title">跟进记录</div>
        <!-- <FinanceTable :option="followOptions" /> -->
        <FollowLog :custid="$route.query.custid"/>
      </div>

      <TitleTable
        :columns="attachColumns"
        :data="attachData"
        title="附件信息"
      />
      <!-- <div v-if="status == 'valid'" class="finance-search-list-gap"></div> -->
      <!-- <el-tabs v-if="status == 'valid'" class="fin-el-tabs" v-model="company" style="margin-top:0">
        <el-tab-pane label="母子公司" name="struct">
          <div style="overflow:hidden;padding: 10px 20px;">
            <el-button style="float:right" size="mini" @click="check('struct')">对比母子公司</el-button>
          </div>
          <Company :companyInfo="custStruct.new" :isSubmit="true" :small="true"></Company>
      </el-tab-pane>-->
      <!-- <el-tab-pane label="平级关系" name="relation">
          <div style="overflow:hidden;padding: 10px 10px 0;">
            <el-button style="float:right" size="mini" @click="check('relation')">对比平级关系</el-button>
          </div>
          <FinanceTable :option="tableOption" />
      </el-tab-pane>-->
      <!-- <Company :companyInfo="custRelation.new" :isSubmit="true" :small="true"></Company> -->
      <!-- </el-tabs> -->
    </div>
    <div class="finance-search-list-gap"></div>
    <FixedBottom :baseInfo="baseInfo" :bds="true" :hideAction="true" />
    <div class="log-tab">
      <div class="title-flex" @click="showLogTab = !showLogTab">
        <span class="title">日志</span>
        <div class="btn">
          <span v-if="showLogTab">
            收起
            <i class="el-icon-arrow-up"></i>
          </span>
          <span v-else>
            展开
            <i class="el-icon-arrow-down"></i>
          </span>
        </div>
      </div>
      <div style="padding: 0 8px;" v-if="showLogTab">
        <FinanceTable :option="logOptions" />
      </div>
    </div>
    <CrmDialog
      :option="whiteOption"
      @close="whiteClose"
      v-if="whiteOption.show"
    />
    <!-- <FollowDetail :options="dialogOptions" v-if="dialogOptions.show" /> -->
  </div>
</template>
<script>
import { routerMixin } from "@/views/finance/mixins/routerMixin"
import { mixin } from "@/views/finance/orderFee/orderFee/mixin"
import {
  addBaseLinkData,
  accountInfoColumns,
  baseAttachTable
} from '@/views/crm/data'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import InfoList from '@/views/crm/components/infoList'
import TitleTable from '@/views/crm/components/titleTable'
import OpBtnDialog from '../customerReviewList/components/opBtnDialog'
import FixedBottom from '@/views/crm/merchantManagement/customerReviewList/components/fixedBottom'
import CrmDialog from '@/views/crm/components/crmDialog'
// import FollowDetail from '@/views/crm/merchantManagement/followLog/followDetail'
import Company from '@/views/crm/components/company'
import CUSTOMER from '@/api/crm/customer'
import FOLLOW from '@/api/crm/orgCommunication'
import { mapGetters, mapState } from 'vuex'
// import { pageList } from '@/api/crm/follow'
import FollowLog from './components/followLog'
import { formatIndustry } from '@/utils/crm'
import foreignPeerDetail from './components/foreignPeerDetail'
const ATTACHCOL = [...baseAttachTable]
ATTACHCOL[0] = {
  prop: 'name',
  label: '附件名称',
  type: 'button',
  callback: ({ fileNo, name, suffix }) => {
    name = name.replace(/[\[|\]|\{|\}|\%|`]/g, '')
    const href = `/base/fileView/preview/${fileNo}/${name}`
    window.open(href)
  },
}
export default {
  name: "crmReviewDetail",
  mixins: [routerMixin, mixin],
  components: {
    InfoList,
    TitleTable,
    OpBtnDialog,
    Company,
    FixedBottom,
    FinanceTable,
    CrmDialog,
    // FollowDetail,
    FollowLog,
    foreignPeerDetail
  },
  inject: ["defaultRules"],
  provide() {
    return {
      isReview: true,
      relationCfg: {},
    }
  },
  computed: {
    // custid() {
    //   return this.$route.query.custid
    // },
    ...mapGetters(["dictMapObj"]),
    ...mapState("user", ["userId", "deptCode"]),
    updateInfo() {
      return (this.baseInfo || {}).updateInfo || {}
    },
    isCts() {
      return (this.$store.state.user.roles || []).includes('cts')
    }
  },
  data() {
    return {
      isReviewDetail: true,
      isReviewed: false,
      orgid: "",
      baseInfo: { orgVerifyDto: {}, backupInfo: {} },
      linkData: [],
      linkColumns: addBaseLinkData,
      attachData: [],
      attachColumns: ATTACHCOL,
      bankData: [],
      bankColumns: accountInfoColumns,
      company: "struct",
      custStruct: { old: null, new: null },
      custRelation: { old: null, new: null },
      status: "",
      custid: "",
      tableOption: {},
      logOptions: {},
      followOptions: {},
      dialogOptions: {
        form: {},
        show: false,
      },
      showLogTab: false,
      isClient: false,
      whiteOption: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: "加入白名单",
        text: "加入",
        formItems: [
          {
            label: "所属行业",
            type: "select",
            prop: "industry",
            rules: this.defaultRules,
            propInDict: "custWhitelistIndustry",
          },
        ],
        form: {
          industry: ''
        }
      },
      showWhitelistBtn: false,
      showLeven: false,
      isForeignPeer: false,
      differentField:{},
      beforeField:{}
    }
  },
  // watch: {
  //   custid: {
  //     handler(val) {
  //       if (!val) return
  //       this.initData(val)
  //     },
  //     immediate: true,
  //   },
  // },
  created() {
    // 日志
    this.logOptions = {
      ...this.option,
      id: 'logOption',
      pagination: { ...this.option.pagination, show: true },
      selection: false,
      operationBtns: false,
      noClickCheck: true,
      data: [],
      columns: [
        { prop: "createdTime", label: "时间" },
        {
          prop: "opEmployeeName",
          label: "人员",
          formatter: ({ row }) => row.opEmployeeName || "系统操作",
        },
        { prop: "opEmployeeDeptName", label: "部门" },
        {
          prop: "event",
          label: "关键节点",
          type: "select",
          propInDict: "orgOpLogEvent",
        },
        { prop: "remark", label: "备注" },
      ],
    }
    // 表格配置
    this.tableOption = {
      ...this.option,
      id: "tableOption",
      pagination: false,
      selection: false,
    }
    this.tableOption.columns = [
      { label: "公司名称", prop: "relName", type: "text" },
      {
        label: "关联类型",
        prop: "relType",
        type: "select",
        propInDict: "customerRelationType",
      },
      {
        label: "附件",
        prop: "fileName",
        width: 200,
        type: 'button',
        callback: ({ fileNo, name, suffix }) => {
          name = name.replace(/[\[|\]|\{|\}|\%|`]/g, '')
          const href = `/base/fileView/preview/${fileNo}/${name}`
          window.open(href)
        },
      },
      {
        label: "附件有效期",
        prop: "time",
        type: "timeRange",
        rangeStr: ["startTime", "stopTime"],
        sliceRange: [0, 10],
      },
    ]
    this.tableOption.operationBtns = false
    // this.initData(this.$route.query.custid)
    // this.getEmployeeList()
  },
  activated() {
    // 默认不展示
    this.showLogTab = false
    this.showWhitelistBtn = false
  },
  methods: {
    // 转换所属行业
    formatterIndustry (str) {
      return formatIndustry(str)
    },
    // 跟进记录详情
    handleEdit(row) {
      this.dialogOptions.form = Object.assign({}, row)
      this.dialogOptions.show = true
    },
    // 编辑
    setWhitelist() {
      if (!this.showWhitelistBtn) {
        return this.$msgErrClose("请审核之后再设置白名单")
      }
      this.whiteOption.show = true
    },
    // 撤销白名单
    recallWhitelist() {
      if (!this.showWhitelistBtn) {
        return this.$msgErrClose("请审核之后再撤销白名单")
      }
      this.$confirmWarn('是否确认要将该客户撤出白名单?', () => {
        const data = {
          custid: this.custid
        }
        CUSTOMER.recallWhitelist(data)
          .then((res) => {
            if (res.code === 0) {
              this.baseInfo.backupInfo.isWhitelist = 'no'
              // this.initData(this.custid)
              this.$msgSucClose('撤出白名单成功')
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
            this.baseInfo.backupInfo.isWhitelist = 'yes'
            this.baseInfo.industry = this.baseInfo.updateInfo.industry =
              this.dictMapObj['custWhitelistIndustry'][data.industry]
            // this.initData(this.custid)
            this.$msgSucClose('加入白名单成功')
          }
        })
        .catch(() => {})
    },
    // 获取日志
    getLog() {
      const data = {
        currPage: this.logOptions.pagination.currPage,
        pageSize: this.logOptions.pagination.pageSize,
        custid: this.custid,
      }
      CUSTOMER.logCList(data)
        .then((res) => {
          this.logOptions.data = res.data.list
          this.logOptions.pagination.currPage = res.data.currPage
          this.logOptions.pagination.pageSize = res.data.pageSize
          this.logOptions.pagination.totalCount = res.data.totalCount
        })
        .catch(() => {})
    },
    handleSizeChange(val, option) {
      if (option.id === "logOption") {
        this.logOptions.pagination.pageSize = val
        this.getLog()
      } else {
        // this.followOptions.pagination.pageSize = val
        // this.getFollow()
      }
    },
    handleCurrentChange(val, option) {
      if (!option) {
        this.getLog()
        // this.getFollow()
      } else if (option.id === 'logOption') {
        this.logOptions.pagination.currPage = val
        this.getLog()
      } else {
        // this.followOptions.pagination.currPage = val
        // this.getFollow()
      }
    },
    // 客户类型转换成显示内容
    convertRole(arr, customerRole) {
      return arr
        .map((v) => v.roleType)
        .join('+')
        .replace(/\b(\w+)\b/g, (v) => customerRole[v])
    },
    // 返回的数据转换成请求和显示需要的结构和字段
    convertData({
      org,
      roles,
      // updateRoles,
      custClass,
      serviceMode,
      entType,
      scale,
      marketShare,
      podServiceAbility,
      companyShare,
      association,
      industry
    }) {
      const {
        customerRole,
        customerClassNew = {},
        customerServiceMode = {},
        orgScale,
        associationMembers,
        entType: entTypeDict,
        marketShare: marketShareDict,
        podServiceAbility: podServiceAbilityDict,
        companyShare: companyShareDict,
      } = this.dictMapObj
      const _roles = this.convertRole(roles, {
        ...customerRole,
        potential: "潜在客户",
      })
      const _custClass = customerClassNew[custClass]
      const _serviceMode = customerServiceMode[serviceMode]

      let _scale = "",
        _association = "",
        _marketShare = "",
        _podServiceAbility = "",
        _companyShare = "",
        _entType = "",
        _industry = ""

      if (entType) {
        _entType = entTypeDict[entType]
      }
      if (scale) {
        _scale = orgScale[scale]
      }
      if (association) {
        _association = associationMembers[association]
      }
      if (marketShare) {
        _marketShare = marketShareDict[marketShare]
      }
      if (podServiceAbility) {
        _podServiceAbility = podServiceAbilityDict[podServiceAbility]
      }
      if (companyShare) {
        _companyShare = companyShareDict[companyShare]
      }
      if(industry){
        _industry = formatIndustry(industry)
      }
      return {
        ...org,
        roles,
        _roles,
        // custClass,
        _custClass,
        serviceMode,
        _serviceMode,
        entType,
        _entType,
        // association,
        _association,
        scale,
        _scale,
        // marketShare,
        _marketShare,
        // podServiceAbility,
        _podServiceAbility,
        // companyShare,
        _companyShare,
        industry,
        _industry
      }
    },
    // 获取详情信息
    initData(custid) {
      console.log('-@@@111')
      this.lsLoading = true
      // 获取详情 区分是客户列表进入还是跟进记录列表进入
      const method = this.custid
        ? CUSTOMER.verifyInfo
        : FOLLOW.customerOrgDetail
      const datas = this.custid ? { custid } : { orgid: custid } 
      method(datas).then(({ data }) => {
          // let { organizationDto, roles, customerDto, bds, orgVerifyDto } = res.data
          const {
            organizationDto: org,
            roles,
            updateRoles,
            customerDto,
            orgVerifyDto,
            bds,
            updateBds,
            organizationDto,
            differentField,
            beforeField
          } = data
          this.$store.commit('crm/setAllBaseInfoReview', data)
         // 高亮修改的字段
         this.differentField = differentField  //修改后的字段
         this.beforeField = beforeField
          this.linkData = data.contact || []
          this.attachData = data.attachment || []
          this.bankData = data.account || []
          this.logData = data.logList || []
          // 委托客户
          this.isClient = !!roles.find((item) => item.roleType == "client")
          // 是不是首次审核
          // 审核之前不是委托人，之后选择了委托人客户
          this.showLeven =
            !roles.find((item) => item.roleType == 'client') &&
            !!updateRoles.find((item) => item.roleType == 'client')
          const {
            custLevel,
            orgid,
            verifyStatus,
            custClass,
            updateCustClass,
            status,
            updatedName,
            updatedTime,
            serviceMode,
            updateServiceMode,
            association,
            updateAssociation,
            firstTime,
            nearlyTime,
            marketShare,
            updateMarketShare,
            podServiceAbility,
            updatePodServiceAbility,
            companyShare,
            updateCompanyShare,
          } = customerDto
          const { socialStaffNum, simpleCode, industry, entType, scale } = org
          const {
            socialStaffNum: updateSocialStaffNum,
            scale: updateScale,
            entType: updateEntType,
          } = organizationDto || {}
          const oldData = this.convertData({
            org,
            roles,
            // updateRoles,
            custClass:updateCustClass||custClass,
            serviceMode,
            entType,
            scale,
            marketShare:updateMarketShare||marketShare,
            podServiceAbility:updatePodServiceAbility||podServiceAbility,
            companyShare:updateCompanyShare||companyShare,
            association:updateAssociation||association,
            industry
          })
          this.custid = customerDto.custid
          // orgVerifyDto修改状态的信息（拒绝、原因等） verifyStatus 修改状态
          this.baseInfo = {
            backupInfo: customerDto,
            ...oldData,
            orgid,
            custLevel,
            verifyStatus,
            orgVerifyDto,
            updatedName,
            updatedTime,
            custid,
            bds,
            updateBds,
            // association,
            socialStaffNum,
            simpleCode,
            industry,
          }
          this.baseInfo.indexAddr =
            org.province && `${org.province}/${org.city}/${org.district}`
          this.status = status
          if (status == "valid") {
            // let { organizationDto: org, updateRoles: roles } = data
            const {
              organizationDto: org,
              updateRoles: roles,
              custRelationDtos,
              updateCustRelationDtos,
            } = data
            this.baseInfo.updateInfo = this.convertData({
              org,
              roles,
              // updateRoles,
              custClass: updateCustClass,
              serviceMode: updateServiceMode,
              association: updateAssociation ? updateAssociation : association,
              socialStaffNum: updateSocialStaffNum,
              entType: updateEntType,
              simpleCode,
              scale: updateScale ? updateScale : scale,
              marketShare: updateMarketShare ? updateMarketShare : marketShare,
              podServiceAbility: updatePodServiceAbility
                ? updatePodServiceAbility
                : podServiceAbility,
              companyShare: updateCompanyShare
                ? updateCompanyShare
                : companyShare,
              industry,
            })
            this.baseInfo.updateInfo.custid = custid
            this.baseInfo.updateInfo.indexAddr = org.province
              ? `${org.province}/${org.city}/${org.district}`
              : ''
            this.baseInfo.updateInfo.firstTime = firstTime
            this.baseInfo.updateInfo.nearlyTime = nearlyTime

            // if (updateCustRelationDtos && updateCustRelationDtos.length == 1) {
            //   updateCustRelationDtos.unshift({ custid: this.custid, name: this.baseInfo.name })
            // }
            this.custRelation = {
              old: custRelationDtos,
              new: updateCustRelationDtos,
            }
            this.custStruct = {
              old: this.convertStruct(data.custStruct),
              new: this.convertStruct(data.updateCustStruct),
            }
          } else {
            this.custRelation = {}
            this.custStruct = {}
          }
          this.tableOption.data = this.custRelation.new || []
          this.baseInfo.legalPerson = this.baseInfo.legalPerson
          this.isReviewed = this.baseInfo.verifyStatus === 'refuse' || this.baseInfo.verifyStatus === 'pass'
          this.isForeignPeer = !['中国', '中国大陆', "中国香港", "中国澳门", "香港", "澳门"].includes(this.baseInfo.country) && ['peer'].includes(this.baseInfo.custClass)
          // this.isForeignPeer = false
          this.lsLoading = false
        })
        .catch((err) => {
          this.lsLoading = false
          console.log(err)
          this.routerDelBack()
        })
    },
    convertStruct(struct) {
      // obj传入的节点，custid查找的custid，target返回找到的节点
      const nodes = { selfNode: {}, parentNode: {} }
      let selfAttachs = []
      function getNode(obj, custid, key) {
        if (obj.custid == custid) {
          // 如果当前对象是自身节点，则遍历子节点删除子节点的子节点，然后赋值给target
          if (key == 'selfNode') {
            selfAttachs = (obj.attachments || []).map((item) => item.fileNo)
            obj.childs.forEach((item) => {
              const childAttachs = item.attachments || []
              selfAttachs.length &&
                childAttachs.forEach((child) => {
                  if (selfAttachs.indexOf(child.fileNo) > -1) {
                    item.fileNo = child.fileNo
                    item.fileName = child.name
                    item.filePath = child.filePath
                    item.startTime = child.startTime
                    item.stopTime = child.stopTime
                    item.attachObj = child
                  }
                })
              item.childs = []
            })
          }
          nodes[key] = obj
          // console.log(nodes[key])
          // debugger
        } else if (obj.childs && obj.childs.length) {
          obj.childs.forEach((item) => {
            getNode(item, custid, key)
          })
        }
      }
      if (!struct) {
        return struct
      } else {
        // 先找自身节点
        getNode(struct, this.custid, "selfNode")
        // console.log(nodes);
        const selfObj = nodes.selfNode
        // 判断自身节点是否有父节点，
        // 若有，找到父节点设置父节点子节点为自身节点，并设置为根节点
        // 若无，则表示自身节点为根节点
        if (selfObj.parentCustid) {
          getNode(struct, selfObj.parentCustid, "parentNode")
          const selfParent = nodes.parentNode
          if (selfAttachs.length) {
            (selfParent.attachments || []).forEach((child) => {
              if (selfAttachs.indexOf(child.fileNo) > -1) {
                selfParent.fileNo = child.fileNo
                selfParent.fileName = child.name
                selfParent.filePath = child.filePath
                selfParent.startTime = child.startTime
                selfParent.stopTime = child.stopTime
                selfParent.attachObj = child
              }
            })
          }
          selfParent.childs = [selfObj]
          return selfParent
        } else {
          return selfObj
        }
      }
    },
    check(type) {
      const country = this.updateInfo.country || this.baseInfo.country
      if (country !== "中国") {
        return this.$msgErrClose("大陆以外的客户不支持联网对比，请自行查询")
      }
      this.$store.commit(
        "crm/setVerifyCheckBase",
        this.status == "valid" ? this.baseInfo.updateInfo : this.baseInfo
      )
      this.routerPush(
        "CustomerReviewCheckBase",
        this.status == "valid" ? { valid: true } : {}
      )
      // if (type == 'base') {
      //   this.$store.commit('crm/setVerifyCheckBase', this.status == 'valid' ? this.baseInfo.updateInfo : this.baseInfo)
      //   this.routerPush('CustomerReviewCheckBase', this.status == 'valid' ? { valid: true } : {})
      // } else {
      //   // console.log(this.custRelation)
      //   this.$store.commit('crm/setVerifyCheckCompany', type == 'struct' ? this.custStruct : this.custRelation)
      //   this.routerPush('CustomerReviewCheckCompany', { custid: this.custid, company: type })
      // }
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const { custid, orgid } = to.query
      vm.orgid = orgid
      vm.custid = custid
      if (!to.meta.isUseCache) {
        vm.initData(custid || orgid)
      }
    })
  },
}
</script>
<style lang="scss" scoped>
@import "../customerList/scss/detail.scss";
// .finance-page {
//   border-bottom: 20px solid #f8f9fd;
// }
.el-icon-question {
  font-size: 16px;
  color: #aaa;
  cursor: pointer;
  margin-right: 5px;
}
.title-flex {
  height: 30px;
  line-height: 30px;
  display: flex;
  align-items: center;
  // justify-content: space-between;
  margin: 0 16px;
  // background-color: #e8eaec;
  cursor: pointer;
  user-select: none;
  .title {
    font-size: 14px;
    font-weight: 600;
    color: #222222;
  }
  .btn {
    margin-left: 10px;
    span {
      color: #46a6ff;
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
  }
}
.log-tab {
  position: relative;
  z-index: 999;
}
.follow-tab {
  .title {
    margin: 5px 8px 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: #222222;
  }
}
</style>
