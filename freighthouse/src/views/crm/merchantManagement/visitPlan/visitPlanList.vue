
<template>
  <div class="finance-page" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <FinanceSearch ref="searchComp" :searchOption="searchOption1" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left" v-if="isBd">
          <el-button type="primary" size="mini" @click="handleAdd('add')">新增拜访计划</el-button>
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="status" size="mini">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="create">未提交</el-radio-button>
            <el-radio-button label="submit">审核中</el-radio-button>
            <el-radio-button label="pass">已通过</el-radio-button>
            <el-radio-button label="refuse">已拒绝</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="table-box">
        <div v-for="(item, index) in visitPlanList" :key="index
        " class="table-box-item">
          <div class="table-company-item table-company-bottom">
            <div class="fee">
              <span class="planno">计划编号：{{item.visitPlanNo}}</span>
              <span class="create-info planfee"><b>预估报销费用：</b>{{ item.claimExpense }}</span>
              <span class="create-info plantime">{{ item.createdName }} 于 {{ item.createdTime }} 创建</span>
            </div>
            <div class="table-oper-btn">
              <el-popover
                placement="right"
                trigger="click"
                popper-class="classPopover"
                >
                <div class="approve-wrap">
                  <div class="title">审批进度</div>
                  <div v-for="(k, s) in item.approveList" :key="s">
                    <div class="item">{{k.approveChineseLevel}} {{k.employeeName}} 
                    <span :class="{'pass': k.approveStatus === 'pass', 'refuse': k.approveStatus === 'refuse'}" class="result">
                    {{k.approveStatus | filterStatus}}</span>
                    <span class="time">{{k.approveTime}}</span>
                    </div>
                    <div class="line"></div>
                  </div>
                  <div>{{item.status | filterStatus }}</div>
                </div>
                <span v-if="item.approveList.length > 0" class="status point" slot="reference">审批进度</span>
              </el-popover>
              <template>
                <span v-if="item.status === 'create'" class="status" slot="reference">未提交</span>
                <span v-if="item.status === 'submit'" class="status sub-btn" slot="reference">审核中</span>
                <span v-if="item.status === 'pass'" class="status pass-btn status-btn" slot="reference">已通过</span>
                <span v-if="item.status === 'refuse'" class="status refuse-btn status-btn" slot="reference">已拒绝</span>
              </template>
              <template>
                 <el-tooltip v-if="item.reason && ['refuse'].includes(item.status)" :content="item.reason" placement="top" effect="light">
                  <i class="el-icon-question question-icon"></i>
                </el-tooltip>
              </template>
              <el-button v-if="item.isShow" type="text" @click="panelSwitch(item,index)" class="point off">收起
                <i class="el-icon-arrow-up el-icon--right"></i>
              </el-button>
              <el-button v-else type="text" @click="panelSwitch(item,index)" class="point off">展开
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
            </div>
          </div>
          <div class="table-company-box" v-show="item.isShow">
            <div class="container" v-for="(cItem, cIndex) in item.companyInfoList" :key="cIndex" >
              <div class="left-info">
                <div class="left-company-name">
                  <h3 class="name"  >
                    <span class="to-record" @click="toRecord(cItem)" v-if="item.status === 'pass'">
                      {{ cItem.companyBusinessInfo.companyName }}
                    </span>
                    <span v-else> {{ cItem.companyBusinessInfo.companyName }}</span>
                  </h3>
                  <div class="white-box">
                    <el-button v-if="item.isSelf && (item.status === 'pass') && cItem.relationFlag==='unilateral'" type="primary" size="mini"
                      @click="createRecord('record', item,cItem.companyBusinessInfo.companyName,cIndex)">生成拜访记录</el-button>
                  </div>
                </div>
                <div class="left-content">
                  <div class="content-list"><span>联系人信息：</span>
                    <label>
                      <div class="info-cnt"  v-for="(custEle, i) in cItem.custVisits" :key="i">
                        <template>                      
                          姓名：{{ custEle.name}}{{custEle.ename}}
                          <p>职位：{{custEle.custContactPosition}}</p>
                          <p>电话：{{custEle.mobileNo}}</p>
                          <p>Email：{{custEle.email}}</p>
                        </template>
                      </div>
                    </label>
                  </div>
                  <div class="content-list"><span>拜访时间：</span><label>{{ cItem.companyBusinessInfo.visitDate }}</label></div>
                  <div class="content-list"><span>拜访地址：</span><label>{{ cItem.companyBusinessInfo.visitAddress }}</label></div>
                  <div class="content-list"><span>拜访(访谈)目标：</span><label>{{cItem.companyBusinessInfo.visitTarget  }}</label></div>
                  <div class="content-list"><span>物料资料准备：</span><label>{{ cItem.companyBusinessInfo.materialDocPrepare }}</label></div>
                  <div class="content-list"><span>邀约我司陪访人：</span>
                    <label>
                      <div class="info-cnt"  v-for="(ele, i) in cItem.accompanyNameLists" :key="i">
                        <template v-if="ele.employeeId">                      
                          {{i+1}}、
                          {{ ele.accompanyName}} --
                            <span v-if="ele.isSendMail==='no'">未邀约</span>
                            <span v-if="ele.isAgree == 'submit' && ele.isSendMail!=='no'">待确认</span>
                            <span v-if="ele.isAgree == 'pass' && ele.isSendMail!=='no'" style="color:green">同意</span>
                            <span v-if="ele.isAgree == 'refuse'&& ele.isSendMail!=='no'" style="color:#ff4949">拒绝 ({{ele.reason}}) </span>
                        </template>
                      </div>
                    </label>
                  </div>
                  <div class="content-list"><span>陪访人分工安排：</span><label>{{ cItem.companyBusinessInfo.divisionLabor }}</label></div>
                </div>
              </div>
              <div class="right-info">
                <div class="center-content">
                  <div class="content-list"><span>公司情况介绍：</span><label>{{ cItem.companyBusinessInfo.companyProfile }}</label></div>
                  <div class="content-list"><span>客户营业额：</span>
                    <label>
                      <div class="info-cnt"  v-for="(turEle, i) in cItem.custTurnovers" :key="i">
                        <template>     
                          {{ turEle.turnoverYear }} (年度)：{{ turEle.turnoverPoar }} {{ turEle.currency }},
                          营业额中出口占比：{{ turEle.turnoverExports }}    
                        </template>
                      </div>
                    </label>
                  </div>
                  <!-- <div class="content-list"><span>所属行业：</span><label>{{  formatterIndustry(item.industry) }}</label></div> -->
                  <div class="content-list"><span>外贸业务人员结构：</span><label>{{ cItem.companyBusinessInfo.foreignTradePersonnel }}</label></div>
                  <div class="content-list"><span>业务情况：</span><label>{{ cItem.companyBusinessInfo.businessSituation }}</label></div>
                  <div class="content-list"><span>出口市场：</span><label>{{ cItem.companyBusinessInfo.exportMarket }}</label></div>
                  <div class="content-list"><span>谁在负责询价：</span><label>{{ cItem.companyBusinessInfo.inquirer }}</label></div>
                  <div class="content-list"><span>产品信息：</span>
                    <label>
                      <div class="info-cnt"  v-for="(acrEle, i) in cItem.custCargos" :key="i">
                        <template>     
                          单柜货值：{{ acrEle.singleValue }} {{ acrEle.currency }} /{{ acrEle.containerType }}
                        </template>
                      </div>
                    </label>
                  </div>               
                  <div class="content-list"><span>未来战略国家市场：</span><label>{{ cItem.companyBusinessInfo.nationalMarket }}</label></div>
                  <div class="content-list"><span>贸易条款及占比：</span><label>{{ formatList("tradeTerms", cItem.tradeTermsList) }}</label></div>
                  <div class="content-list"><span>每月出口量(TEU)：</span><label>{{ cItem.companyBusinessInfo.monthlyExports }}</label></div>
                  <div class="content-list"><span>延伸信息：</span><label>{{ cItem.companyBusinessInfo.extInfo }}</label></div>
                
                </div>
                <!-- <div class="right-content">
                      </div> -->
              </div>
            </div>
            <div class="bottom-btn table-oper-btn">
              <el-button  v-if="['refuse','create'].includes(item.status)&& item.isSelf" class="status" type="success" 
              size="mini" @click="visitSubmit(item.visitId)" :loading="subLoading">提交审核</el-button>
              <el-link v-if="item.currentApproveEmployeeId === userInfo.sysUserId && item.flag !== 'refuse'" type="success" @click="editFn('check', item)">
                <el-button type="primary" size="mini">审核</el-button>
              </el-link>
              <el-button v-if="item.isSelf && (item.status === 'create'||item.status === 'refuse')" type="warning" size="mini"
                @click="handleAdd('edit', item)">编辑</el-button>
              <el-button type="primary" @click="editFn('detail', item)" size="mini"  class="ml10">
                详情
              </el-button>
              <el-popconfirm v-if="item.isSelf && !['pass'].includes(item.status)" title="删除该拜访计划将不可恢复，确定删除？"
                @onConfirm="handleDelete(item.visitId)">
                <el-button slot="reference" type="danger" class="ml10" size="mini">删除</el-button>
              </el-popconfirm>
            </div>
          </div>

        </div>
        <div v-if="listTotal > visitPlanList.length" class="show-more-box">
          <el-button type="text" @click="showMore">加载更多</el-button>
        </div>
        <div class="empty" v-if="!visitPlanList.length">
          <NoData size="small" />
        </div>
      </div>
    </div>
    <VisitAdd
      v-if="dialogOptions.show"
      :options="dialogOptions"
      @cancel="cancelAdd"
      ref="child"
    />
    <FollowAdd
      v-if="followDialogOptions.show"
      :options="followDialogOptions"
      @cancel="cancelFollowAdd"
      @submit="submitAdd"
      @showadd="showDialog"
      @showEdit="showEditDialog"
      :custid="custid"
      ref="childFollow"
      :isSelf="isSelf"
      :companyName="companyName"
    />
    <!-- 新增联系人 -->
    <CrmDialog :multi="true" ref="add" :option="addDialog" @close="closeDialog('add',$event)" />
    <!-- 编辑联系人 -->
    <CrmDialog :multi="true" ref="edit" :option="editDialog" @close="closeDialog('edit',$event)"  v-if="editDialog.show"/>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { visitPlanSearchData } from '@/views/crm/data'
import { addBaseLinkData as columnsData } from '@/views/crm/data'
import VISITPLAN from '@/api/crm/visitPlan'
import CrmDialog from '@/views/crm/components/crmDialog'
import VisitAdd from './visitAdd.vue'
import FollowAdd from '@/views/crm/merchantManagement/customerList/detailTabs/followAdd.vue'
import { formatIndustry } from '@/utils/crm'
import { mapState } from 'vuex'
import { saveVisit} from '@/api/crm/follow'
import CONTACT from '@/api/crm/orgContact'
import { listByRole } from '@/api/base'
export default {
  name: 'visitPlan',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    VisitAdd,
    FollowAdd,
    CrmDialog
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.user.userInfo
    }),
  },
  data () {
    let ruleMsg = { required: true, message: ' ' }
    let form = {}
    let formItems = columnsData.map((item) => {
      let prop = item.prop
      if (prop === 'belongEmployeeName') {
        prop = 'belongEmployeeId'
        item.DIY = { key: 'employeeId' },
        item.type = 'select'
        item.remote = true
        item.remoteSelectList = []
        item.remoteMethod = (str='', item) => {
          if(typeof str === 'object'){
            item.remoteSelectList = [str]
            return
          }
          const data = {
            currPage: 1,
            pageSize: 10,
            query: [
              { column: 'name', type: 'eq', value: str },
              {
                column: 'roleCode',
                type: 'in',
                value: 'bd'
              }
            ]
          }
          listByRole(data)
            .then((res) => {
              if (res.code === 0) {
                item.remoteSelectList = res.data.list.map(ele => {
                  return { ...ele, label: ele.cname, value: ele.employeeId+'' }
                })
              }
            })
            .catch(() => {})
        }
      }else if(prop === 'custContactPosition'){
        item.r = true
      }
      if (['eduBack', 'familyBack', 'professionalBack', 'hobbies', 'other'].includes(prop)) {
        item.r = this.isWhitelist || this.isIndustry
      }
      form[prop] = ''
      return { ...item, prop, rules: item.r ? ruleMsg : undefined }
    })
    return {
      lsLoading: false,
      subLoading:false,
      status:'all',
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      isBd: false,
      isManager: false,
      visitPlanList: [],
      currPage: 1,
      pageSize: 10,
      finished: false,
      userId: this.$store.state.user.userId,
      listTotal: 0,
      companyName:'',
      dialogOptions: {
        show: false,
        isEdit: false,
        form: {}
      },
      followDialogOptions: {
        show: false,
        isEdit: false,
        form: {}
      },
      custid:'',
      orgid:'',
      isSelf:false,
      addDialog: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '新增联系人信息',
        text: '新增',
        formItems: formItems,
        form,
      },
      editDialog: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '编辑联系人信息',
        text: '确认',
        formItems: formItems.map(item => ({...item, noRemote: true})),
        form,
      }
    }
  },
  watch:{
  "addDialog.form.role"(val){
    let diyRole = this.addDialog.formItems.find(item => item.prop === 'diyRole')
    this.$set(diyRole, 'show',val === 'other')
  },
  "editDialog.form.role"(val){
    let diyRole = this.editDialog.formItems.find(item => item.prop === 'diyRole')
    this.$set(diyRole, 'show',val === 'other')
  },
  status(val) {
    this.status = val
    this.search()
  },
},
  created () {
    let roles = this.$store.state.user.roles
    this.isBd = roles.some((role) => role == 'bd' || role == 'obd')
    this.isManager = roles.some((role) => role == 'manager')
    // 搜索配置
    let searchObj = {}
    visitPlanSearchData.splice(6, 0, { prop: "approveEmployeeName", label: "审核人" })
    visitPlanSearchData.splice(7, 0, { prop: "visitPlanNo", label: "计划编号" })
    visitPlanSearchData.forEach((v) => {
      searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
    })
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: [
          { key: 'companyName', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'bdEmployeeName', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'visitDate', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'approveEmployeeName', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'visitPlanNo', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['visitDate'],
        callback: true,
      }
    }
  },
  activated () {
    this.search()
  },
  filters: {
     filterStatus(val = '') {
      if (val === 'submit') {
        return '审核中'
      } else if (val === 'pass') {
        return '审核通过'
      } else if (val === 'refuse') {
        return '审核拒绝'
      } else if (val === 'create') {
        return '待审批'
      } else {
        return ''
      }
     }
  },
  methods: {
    // 转换所属行业
    formatterIndustry (str) {
      return formatIndustry(str)
    },
    /**
     * @description: 获取拜访计划列表数据、
     * @param {*} query 查询参数
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-19 15:14:55
     */
    getData (query) {
      this.lsLoading = true
      let param = {
        currPage: this.currPage,
        pageSize: this.pageSize,
        status:this.status
      }
      let data = { ...param, ...query }
      VISITPLAN.planList(data).then((res) => {
        if (res.code === 0) {
          let { list, totalCount } = res.data
          this.listTotal = totalCount || 0
          if (list && list.length) {
            list.forEach(ele => {
              this.visitPlanList.push({ ...ele })
            })
          }
          if (this.visitPlanList.length) {
            this.visitPlanList.forEach(item => {
              this.$set(item, 'isShow', false)
              item.isSelf = item.createdBy == this.userId
              this.isSelf = item.createdBy == this.userId
            })
          }
          if (this.visitPlanList.length >= totalCount) {
            this.finished = true
          }
          this.currPage += 1
        }
      }).catch(() => { })
        .finally(() => {
          this.lsLoading = false
        })
    },
    /**
     * @description: 查询列表数据
     * @param {*} query 查询参数
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-19 15:31:09
     */
    search () {
      this.visitPlanList = []
      this.currPage = 1
      this.finished = false
      this.getData(this.formatQueryParams())
    },
    /**
     * @description: 转换查询参数格式
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-19 15:32:30
     */
    formatQueryParams () {
      let query = this.$refs.searchComp.addFilterSearch()
      let data = {}
      if(this.$route.query.visitPlanNo){
        data.visitPlanNo = this.$route.query.visitPlanNo
        this.searchOption1.addFilter.searchInputGroup.map(item=>{
          if(item.key === 'visitPlanNo'){
            item.value = this.$route.query.visitPlanNo
          }
        })
      }
      // else{
      //   data.visitPlanNo = ''
      //   this.searchOption1.addFilter.searchInputGroup.map(item=>{
      //     if(item.key === 'visitPlanNo'){
      //       item.value = ''
      //     }
      //   })
      // }
      if (query && query.length) {
        query.forEach(item => {
          let { column, type, value } = item
          if (column) {
            if (column === 'visitDate') {
              if (type === 'ge') {
                data['visitDateB'] = value || ''
              } else if (type === 'le') {
                data['visitDateE'] = value || ''
              }
            } else {
              data[column] = value || ''
            }
          }
        })
      }
      return data
    },
    /**
     * @description: 加载更多
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-29 09:53:24
     */
    showMore () {
      if (!this.lsLoading) {
        this.getData(this.formatQueryParams())
        this.lsLoading = true
      }
    },
    /**
     * @description: 新增拜访计划
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-14 11:51:06
     */
    editFn (type, row) {
      if (type === 'detail') this.routerPush('VisitPlanDetail', { type: type, visitId:row.visitId })
      if (type === 'check') this.routerPush('VisitPlanCheck', { type: type, visitId:row.visitId })
      this.$store.commit('crm/setVisitPlanOperType', type)
    },
    /**
     * @description: 转换【贸易条款及占比】、【邀约我司陪访人】显示格式
     * @param {*} type 列表类型
     * @param {*} list 列表数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-14 17:02:41
     */
    formatList (type, list) {
      let str = ""
      let arr = []
      if (list.length) {
        list.forEach(item => {
          if (type === 'tradeTerms') {
            arr.push(item.tradeTerms + '/' + item.tradeTermsProp + '%')
          } else if (type === 'accompanyName') {
            arr.push(item.accompanyName || item.ourCompanyEname)
          }
        })
        str = arr.length ? arr.join("、") : ""
      }
      return str
    },
    /**
     * @description: 删除拜访计划
     * @param {*} visitId 拜访计划主键
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-14 17:43:40
     */
    handleDelete (visitId) {
      VISITPLAN.deleteRecord({ visitId }).then((res) => {
        if (res.code === 0) {
          this.$msgSucClose('操作成功！')
          this.search()
        }
      }).catch(() => { })
    },
    //提交审核
    visitSubmit(visitId){
      this.subLoading = true
      let data = {visitId:visitId}
      VISITPLAN.visitPeopleSubmit(data).then((res) => {
        if (res.code === 0) {
          this.$msgSucClose('提交成功！')
          this.search()
        }
      }).finally(() => { 
        this.subLoading = false
      })
    },
    // 新增
    handleAdd(type,row) {
      if(type==='add'){
        this.dialogOptions.isEdit = false
      }else if(type==='edit'){
        this.dialogOptions.form = JSON.parse(
          JSON.stringify(Object.assign({}, this.dialogOptions.form, row))
        )
        this.dialogOptions.isEdit = true
      }
      this.dialogOptions.show = true
    },
    // 取消
    cancelAdd() {
      this.dialogOptions.show = false
      this.dialogOptions.form = {}
      this.search()
    },
    //一键生成拜访记录
    createRecord(isVisitPlan,item,name,index) {
      this.companyName = name
      this.custid = item.companyInfoList[index].custid
      this.orgid = item.companyInfoList[index].orgid
      if (isVisitPlan) {
        this.followDialogOptions.form.commuType = 'visit'
        this.followDialogOptions.form.commuTime = item.companyInfoList[index].companyBusinessInfo.visitDate || ''
        this.followDialogOptions.form.turnovers = item.companyInfoList[index].custTurnovers || []
        this.followDialogOptions.form.custDescription = item.companyInfoList[index].custVisits || []
        this.followDialogOptions.form.custCargos = item.companyInfoList[index].custCargos || []
        this.followDialogOptions.form.materialDocPrepare = item.companyInfoList[index].companyBusinessInfo.materialDocPrepare || ''
        this.followDialogOptions.form.visitTarget = item.companyInfoList[index].companyBusinessInfo.visitTarget || ''
        this.followDialogOptions.form.extInfo = item.companyInfoList[index].companyBusinessInfo.extInfo || ''
        this.followDialogOptions.form.commuId = item.commuId
        this.followDialogOptions.form.relationFlag = item.companyInfoList[index].relationFlag
        this.followDialogOptions.form.relationNewFlag = 'existRelation'
        this.followDialogOptions.form.companyAddress = item.companyInfoList[index].companyBusinessInfo.visitAddress || ''
        this.followDialogOptions.commuId = item.commuId
        this.followDialogOptions.visitPlanNo = item.visitPlanNo
        this.followDialogOptions.form.accompanyNameLists= item.companyInfoList[index].accompanyNameLists
      } else {
  
      }
      this.followDialogOptions.isVisitPlan = isVisitPlan
      // this.followDialogOptions.form.companyAddress = this.custInfo.detailAddr
      this.followDialogOptions.isEdit = false
      this.followDialogOptions.show = true
    },  
    cancelFollowAdd() {
      this.followDialogOptions.show = false
      this.followDialogOptions.form = {}
      this.search()
    },
    // 提交
    submitAdd(source) {
      this.lsLoading = true
      const { isEdit, commuId } = this.followDialogOptions
      let data = {
        custid: this.custid,
        commuId: commuId
      }
      const { commuType } = source
      if (commuType === 'visit') {
        const {
          commuType,
          commuTime,
          custName,
          fileNos,
          bdEmployeeId,
          syslines,
          cargos,
          turnovers,
          tradeTerms,
          demands,
          custDescription,
          nextPlan,
          remark,
          visitors,
          custContactPosition,
          custContact,
          contactId,
          eduBack,
          familyBack,
          professionalBack,
          hobbies,
          other,
          commuMode,
          ourCompanyPosition,
          companyScale,
          companyAddress,
          isCooperation,
          businessType,
          shipmentType,
          shipmentFrequency,
          inquiryType,
          competitor,
          rankTime,
          rank,
          materialDocPrepare,
          visitTarget,
          visitCheck,
          difficulty,
          customerSituation,
          extInfo,
          goalProportion,
          shipmentsTeu,
          shipmentsCycle,
          custCompetitor,//客户的竞争对手
          marketShareTime,//客户所占市场份额 年份
          marketSharePoar,//客户所占市场份额 占比数据
          derivable,//可衍生的&转介绍客户
          relationNewFlag,
          visitPlanNo
        } = source
        const { employeeId, cname, deptCode, deptCname,ename,mobileNo } = bdEmployeeId
        const syslineData = syslines.map((item) => {
          const { podPortCode, polPortCode, commLines, cycle, containerNum,timeDate,containerType,businessType } = item
          return {
            commuId,
            cycle,
            containerNum,
            containerType,
            businessType,
            podPortCname: podPortCode.cname,
            podPortEname: podPortCode.ename,
            podPortCode: podPortCode.portCode,
            polPortCname: polPortCode.cname,
            polPortEname: polPortCode.ename,
            polPortCode: polPortCode.portCode,
            sysLineCname: commLines.cname,
            sysLineEname: commLines.ename,
            sysLineCode: commLines.sysLineCode,
            beginTime:timeDate[0],
            endTime:timeDate[1]
          }
        })
        const tradeData = tradeTerms.map((item) => {
          const { tradeCode,shippingAddr,cycle,containerNum,containerType,timeDate,businessType } = item
          return {
            cycle,
            containerNum,
            tradeCode,
            shippingAddr,
            containerType,
            businessType,
            beginTime:timeDate[0],
            endTime:timeDate[1]
          }
        })
        const visitorsData = visitors.map((item) => {
          return {
            commuId,
            visitEmployeeId: item.employeeId,
            visitEmployeeName: item.cname ? item.cname :item.accompanyName?item.accompanyName:'',
            visitEmployeeMobileNo:item.mobileNo || '',
            visitEmployeeEname:item.ename  || ''
          }
        })
        if (!isEdit) {
          cargos.forEach(ele => {
            ele.oid = ''
          })
        }
        const res = {
          relationNewFlag,
          visitPlanNo,
          commuType,
          commuTime,
          custName,
          bdEmployeeId: employeeId,
          bdEmployeeName: cname,
          bdEmployeemobileNo: mobileNo,
          bdEmployeeEname: ename,
          bdDeptCode: deptCode,
          bdDeptName: deptCname,
          syslines: syslineData,
          visitors: visitorsData,
          cargos,
          turnovers,
          tradeTerms:tradeData,
          demands,
          custDescription,
          isCooperation,
          visit: {
            nextPlan,
            remark,
            custContactPosition,
            ourCompanyPosition,
            companyScale,
            companyAddress,
            custContact,
            contactId,
            eduBack,
            familyBack,
            professionalBack,
            hobbies,
            other,
            commuMode,
            businessType: businessType.join(','),
            shipmentType: shipmentType.join(','),
            shipmentFrequency,
            inquiryType,
            competitor,
            custCompetitor,//客户的竞争对手
            marketShareTime,//客户所占市场份额 年份
            marketSharePoar,//客户所占市场份额 占比数据
            derivable,//可衍生的&转介绍客户
            rankTime,
            rank,
            materialDocPrepare,
            visitTarget,
            visitCheck,
            difficulty,
            customerSituation,
            extInfo,
            goalProportion,
            shipmentsTeu,
            shipmentsCycle,
          }
        }
        data = Object.assign({}, data, res)
      }
      if(this.isSelf){
        this.$confirm('确认该拜访记录是否已完善完毕?', '提示', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }).then(() => {
          this.submitSave('yes',data)
        }).catch(() => {
          this.submitSave('no',data)        
        });
      }else{
        this.submitSave('no',data)  
      }
    },
    submitSave(type,data){
      let datas = { ... data,isSendMail:type}
      saveVisit(datas)
        .then((res) => {
          if (res.code === 0) {
            this.cancelFollowAdd()
            this.$msgSucClose('新增跟进记录成功')
          } else if (res.code === 160000) {
            this.cancelFollowAdd()
            this.$msgWarnClose(res.msg || '跟进记录新增成功，但还未配置部门管理者，请联系管理员进行配置！')
          }
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
    // 新增联系人
    showDialog(type,index) {
      this.addDialog.form.index = index
      this.addDialog.show = true
    },
    showEditDialog(type,index,row) {
      this.edit(index,row)
    },
    // 编辑联系人信息
    edit (index,row) {
      let { belongEmployeeName, belongEmployeeId } = row
      row.belongEmployeeId = row.belongEmployeeId ? {label: belongEmployeeName, value: belongEmployeeId} : ''
      let source = this.editDialog.formItems.find(item => item.prop === 'belongEmployeeId')
      belongEmployeeId && source.remoteMethod({label: belongEmployeeName, value: belongEmployeeId}, source)
      this.editDialog.show = true
      setTimeout(() => {
        // console.log(this.editDialog.form)
        this.editDialog.form = JSON.parse(JSON.stringify(Object.assign({},row)))
        //index代表是第几个联系人的编辑
        this.editDialog.form.index = index
      }, 0);
    },
    // 关闭新增联系人
    closeDialog(type,tag){
      if (!tag) return (this[type + 'Dialog'].show = false)
      if (type === 'edit') {
        let data = { ...this.editDialog.form, orgid: this.orgid, custid: this.custid }
        if (data.belongEmployeeId) {
          let {cname, employeeId} = data.belongEmployeeId
          data.belongEmployeeId = employeeId
          data.belongEmployeeName = cname
        }
        if (!data.name && !data.ename) {
          return this.$msgErrClose('中文名和英文名至少填一个！')
        }
        this.editDialog.btnLoading = true
        CONTACT.editCustomerContact(data).then(res => {
          if (res.code === 0) {
            this.$msgSucClose('编辑联系人成功！')
            this.updateContractList('edit',data.oid,this.editDialog.form.index)
            this.editDialog.show = false
          }
        }).finally(()=>{
          this.editDialog.btnLoading = false
        })
      }else{
        let data = { ...this.addDialog.form, orgid: this.orgid, custid: this.custid }
        if (data.belongEmployeeId) {
          let {cname, employeeId} = data.belongEmployeeId
          data.belongEmployeeId = employeeId
          data.belongEmployeeName = cname
        }
        if ( !data.name && !data.ename) {
          return this.$msgErrClose('中文名和英文名至少填一个！')
        }
        this.addDialog.btnLoading = true
        CONTACT.addCustomerContact(data).then(() => {
          let ref = this.$refs.add.$refs.form
          ref.resetFields()
          this.$nextTick(() => ref.clearValidate())
          this.$nextTick(() => (this.addDialog.show = false))
          this.$msgSucClose( '新增联系人成功！')
          this.updateContractList('add',data.orgid,this.addDialog.form.index)
        })
        .finally(() => {
          this.addDialog.btnLoading = false
        })
      }

    },
    updateContractList(type,oid,index){
      this.$refs.childFollow.getContractData(type,oid,index);
    },
    // 折叠展开
    panelSwitch (item,index) {
      this.visitPlanList[index].isShow = !this.visitPlanList[index].isShow
      this.$forceUpdate()
    },
    //根据commuId链接到拜访记录
    toRecord(item){
      if(item.relationFlag === 'unilateral'){
        this.routerPush('VisitPlan',{commuId: item.commuId,type:'visitRecord'})
        this.$emit('changeTab')
      }else{
        return this.$msgWarnClose('该拜访计划暂未录入对应拜访记录!')
      }

      // this.$forceUpdate()
    }
  },
}
</script>
<style lang="scss" scoped>
.ml10 {
  margin-left: 10px;
}
.table-box {
  padding: 0 8px 1px;
  .table-box-item {
    margin-bottom: 10px;
    border:1px solid #E0E1E4;
  }
  .table-company-box {
    border-top: 1px #E0E1E4 solid;
    .container{
      display: flex;
      border-bottom: 1px #E0E1E4 solid;
    
      .left-content{
        line-height: 20px;
        font-size: 12px;
        color:#88878C;
      }
      .left-info {
        width: 28%;
        background-color: #F8F9FD;
        padding: 8px 10px;
        border-right: 1px #E0E1E4 solid;
        .left-company-name{
          display: flex;
          justify-content:space-around;
          border-bottom: 1px #E0E1E4 solid;
        }
        .name {
          font-size: 14px;
          padding:8px 0;
          // line-height:30px;
        }
        .to-record{
          color:#409eff;
          cursor: pointer;
          border-bottom:1px solid #409eff;
        }
        .white-box {
          display: flex;
          align-items: center;
          img {
            margin-left: 10px;
            transform: scale(0.7);
          }
          .industry{margin-left:5px;transform: scale(0.9);}
        }
      }
      .right-info{
        width: 70%;
        background-color: #ffffff;
        padding: 8px;
        display:flex;
        .center-content{
          width:100%;
          line-height: 23px;
          font-size: 12px;
          color:#88878C;
          .content-list{
            span{
              width:20%!important
            }
          }
        }
        // .right-content{
        //   width:50%;
        //   line-height: 20px;
        //   font-size: 12px;
        //   color:#88878C;
        // }
      }
      .content-list{
          display: flex;
          justify-content: flex-start;
          width:100%;
          span{
            display:block;
            width:34%;
            text-align:right;
          }
          label{
            width:66%;
            display:block;
            font-weight:500;
            .info-cnt{
              span{
                width:auto;
                display: inline-block;
              }
            }
          }
      }
    }
    .bottom-btn{
      text-align:right;
      padding:8px 15px;
    }
  }
  .table-company-item {
    .fee{line-height:40px;
      span {
        display: inline-block;
        margin-top: 5px;
        line-height: 20px;
      }
      .planno{width:200px;}
      .planfee{width:150px;}
    }
  }
  .table-company-bottom {
    padding:0 10px;
    display: flex;
    background: #EBEEF3 ;
    justify-content: space-between;
    span{
      font-weight: bold;
    }
  }
  .create-info {
    margin-left: 20px;
  }
  .pass-btn {
    color: green;
    margin-right: 0;
  }
  .sub-btn{
    color: #ECB640;
    margin-right: 0;
  }
  .refuse-btn {
    color: #dd3737;
  }
  .status-btn {
    font-size: 12px;
    // vertical-align: bottom;
  }
  .question-icon {
    font-size: 16px;
    vertical-align: bottom;
    color: #808080;
    margin-left: 3px;
  }
  .show-more-box {
    text-align: center;
  }
  .status{
    margin-left:10px;
    font-weight:500!important;
  }
  .point{
    cursor:pointer;
  }
  .off{color:#AAABAF;font-size:12px;margin-left:10px;transform: scale(0.8)}
}
</style>
<style lang="scss">
.approve-wrap {
  font-size: 12px;
  line-height: 20px;
  .title {
    font-size: 12px;
    line-height: 20px;
    margin-bottom:10px;
  }
  .item {
    font-size: 12px;
    line-height: 20px;
    margin-bottom:4px;
    display: flex;
    justify-content: space-between;
  }
  .line {
    width: 1px;
    height:12px;
    border:1px dashed #808080;
  }
  .result{
    margin-left:5px;
  }
  .refuse{
    color:
     #dd3737;
  }
  .pass{
    color: green;
  }
  .time{
    text-align:right;
    transform:scale(0.8);
    color:#666;
  }
}
</style>
