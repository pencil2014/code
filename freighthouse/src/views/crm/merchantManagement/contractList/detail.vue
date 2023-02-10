<template>
    <div class="finance-page">
        <div class="detail-header">
            <div class="left-cnt">
                <i class="el-icon-folder-remove"></i>
                <span class="detail-title">合同详情</span>
                <span v-if="baseInfo.crmCustContractApplyDto">{{baseInfo.crmCustContractApplyDto.applyNo}}</span>
            </div>
            <div class="right-cnt" v-if="$route.query.routeType === 'approve' && approver">
                <span v-if="approver.nodeName==='申请人领导'">
                    <el-button type="success" size="mini" @click="checkFn('pass')">通过</el-button>
                    <el-button type="danger" size="mini"  @click="checkFn('refuse')">拒绝</el-button>
                </span>
                <span v-if="approver.nodeName==='合同审核专员' && approver.curentNode ===30">
                    <el-button type="success" size="mini" @click="checkFn('pass')" v-if="setNumber===3">同意并归档</el-button>
                    <el-button type="warning" size="mini"  @click="checkFn('change')" v-if="setNumber===6">转会签</el-button>
                    <el-button type="danger" size="mini"  @click="checkFn('end')">拒绝并终止</el-button>
                    <el-button type="info" size="mini"  @click="checkFn('backbd')">退回发起人</el-button>
                </span>
                <span v-if="approver.nodeName==='财务部'||approver.nodeName==='审计部'">
                    <el-button type="success" size="mini" @click="checkFn('pass')">建议通过</el-button>
                    <el-button type="warning" size="mini"  @click="checkFn('transfer')">内部转签</el-button>
                    <el-button type="danger" size="mini"  @click="checkFn('refuse')">建议拒绝</el-button>
                </span>
                <span v-if="approver.nodeName==='分管副总裁'&& approver.isNode==='yes'">
                    <el-button type="success" size="mini" @click="checkFn('pass')">同意</el-button>
                    <el-button type="warning" size="mini"  @click="checkFn('transfer')">内部转签</el-button>
                    <el-button type="danger" size="mini"  @click="checkFn('end')">拒绝并终止</el-button>
                    <el-button type="info" size="mini"  @click="checkFn('backt')">退回专员</el-button>
                    <el-button type="info" size="mini"  @click="checkFn('backbd')">退回发起人</el-button>
                </span>
                <span v-if="approver.nodeName==='分管副总裁'&& approver.isNode!=='yes'">
                    <el-button type="success" size="mini" @click="checkFn('pass')">建议通过</el-button>
                    <el-button type="warning" size="mini"  @click="checkFn('transfer')">内部转签</el-button>
                    <el-button type="danger" size="mini"  @click="checkFn('refuse')">建议拒绝</el-button>
                </span>
                <span v-if="approver.nodeName==='合同审核专员'&& approver.curentNode ===60">
                    <el-button type="success" size="mini" @click="checkFn('pass')">同意并归档</el-button>
                </span>
            </div>
        </div>
        <div class="finance-search-list-gap"></div>
        <!-- 审核流程 -->
        <div class="process">
            <Step :setComplete="completing" :setNumber="setNumber"></Step>
        </div>
        <div class="content">
            <div class="outer-box">
                <div class="title">基本信息</div>
                <div class="item-box" v-if="baseDto">
                    <ul class="box">
                        <li v-if="this.$route.query.orgType==='customer'">客户名称：{{ baseDto.name }}</li>
                        <li v-if="this.$route.query.orgType==='supplier'">供应商名称名称：{{ baseDto.name }}</li>
                        <li v-if="this.$route.query.orgType==='customer'">客户类型：{{ dictMapObj['customerClass'][baseDto.custClass] }}</li>
                        <li v-if="this.$route.query.orgType==='supplier'">供应商类型：{{ bussiness }}</li>
                        <li v-if="this.$route.query.orgType==='customer'">公司规模：{{ dictMapObj['orgScale'][baseDto.scale] }}</li>
                        <li>所属行业：{{ formatterIndustry(baseDto.industry) }}</li>
                        <li>客户性质：{{ dictMapObj['entType'][baseDto.entType]}}</li>
                        <li>国家(行政区)：{{ baseDto.country }}</li>
                        <li>省/市/区：{{baseDto.province ? (baseDto.district ?
                        `${baseDto.province}/${baseDto.city}/${baseDto.district}` : 
                        `${baseDto.province}/${baseDto.city}` ): ''}}</li>
                        <li>注册资金：{{ baseDto.regCapital }}</li>
                        <li>成立日期：{{ baseDto.setupDate }}</li>
                        <li>营业执照到期日：{{ baseDto.usccExpDate }}</li>
                        <li>社信代码：{{ baseDto.uscc }}</li>
                    </ul>
                    <ul class="once">
                        <li>注册地址：{{ baseDto.registerAddr }}</li>
                        <li>详细地址：{{ baseDto.detailAddr }}</li>
                    </ul>
                </div>
            </div>
            <div class="outer-box">
                <div class="title">合同信息</div>
                <!-- 客户的合同信息 -->
                <div class="item-box" v-if="baseInfo.crmCustContractMainApplyDto">
                    <ul class="box">
                        <li>合同名称：{{ baseInfo.crmCustContractMainApplyDto.contractName }}</li>
                        <li>合同类型：{{ baseInfo.crmCustContractMainApplyDto.contractNoPrefix }}</li>
                        <li>是否长帆合同模板：{{ baseInfo.crmCustContractMainApplyDto.isStandard==='yes'?'是':'否' }}</li>
                        <li>有效期：{{ baseInfo.crmCustContractMainApplyDto.isSingle==='yes'?'单票有效':
                        baseInfo.crmCustContractMainApplyDto.effectEndDate === '9999-12-31' ? '长期有效':
                        `${baseInfo.crmCustContractMainApplyDto.effectStartDate}-${baseInfo.crmCustContractMainApplyDto.effectEndDate}`}}</li>
                        <li>合同附件：
                            <span v-for="(i, t) in baseInfo.fileList" :key="t">
                                <span class="file-link" @click="downLoad(i.fileName, i.fileNo)">{{i.fileName || ''}}</span>
                            </span>
                        </li>
                    </ul>
                    <ul class="once">
                        <li>我司分公司：{{ companyList }}</li>
                        <li>共享公司：{{ relList }}</li>
                        <li>业务类型：{{ businessType }}</li>
                        <li>备注：{{baseInfo.crmCustContractMainApplyDto.remark }}</li>
                    </ul>
                </div>
                <!-- 供应商的合同信息 -->
                <div class="item-box" v-if="baseInfo.crmSupplierContractMainApplyDto">
                    <ul class="box">
                        <li>合同名称：{{ baseInfo.crmSupplierContractMainApplyDto.contractName }}</li>
                        <li>合同编号：{{ baseInfo.crmSupplierContractMainApplyDto.contractNo }}</li>
                        <li>合同签署类型：{{ dictMapObj['supplierContractSignType'][baseInfo.crmSupplierContractMainApplyDto.contractSignType]  }}</li>
                        <li>是否长帆合同模板：{{ baseInfo.crmSupplierContractMainApplyDto.isStandard==='yes'?'是':'否' }}</li>
                        <li>结算周期：{{ dictMapObj['supplierContractSettleCycle'][baseInfo.crmSupplierContractMainApplyDto.settleCycle]  }}</li>
                        <li>是否交押金：{{ baseInfo.crmSupplierContractMainApplyDto.isPayDeposit==='yes'?
                        `${baseInfo.crmSupplierContractMainApplyDto.depositAmount}/${baseInfo.crmSupplierContractMainApplyDto.depositCurrency}`:'否' }}</li>
                        <li>信用额度-USD：{{ baseInfo.crmSupplierContractMainApplyDto.creditAmountUsd }}</li>
                        <li>信用额度-CNY：{{ baseInfo.crmSupplierContractMainApplyDto.creditAmountCny }}</li>
                        <li>有效期：{{ baseInfo.crmSupplierContractMainApplyDto.isSingle?'单票有效':
                         baseInfo.crmSupplierContractMainApplyDto.effectEndDate === '9999-12-31' ? '长期有效':
                         `${baseInfo.crmSupplierContractMainApplyDto.effectStartDate}-${baseInfo.crmSupplierContractMainApplyDto.effectEndDate}`}}</li>
                        <li>合同附件：
                            <span v-for="(i, t) in baseInfo.fileList" :key="t">
                                <span class="file-link" @click="downLoad(i.fileName, i.fileNo)">{{i.fileName || ''}}</span>
                            </span>
                        </li>
                    </ul>
                    <ul class="once">
                        <li>我司分公司：{{ companyList }}</li>
                        <li>业务类型：{{ businessType }}</li>
                        <li>备注：{{baseInfo.crmSupplierContractMainApplyDto.remark }}</li>
                    </ul>
                </div>
            </div>
            <div class="outer-box">
                <div class="title">审批信息</div>
                <div class="item-box" v-if="baseInfo.approveInfoList">
                    <ul class="approve" v-for="item in baseInfo.approveInfoList" :key="item.approveId">
                        <li>
                            <div class="app-status">
                                <span class="status-refuse" v-if="item.dealStatus==='refuse'">{{dictMapObj['contractApproveInfoStatus'][item.dealStatus] }}</span>
                                <span class="status-pass" v-else>{{dictMapObj['contractApproveInfoStatus'][item.dealStatus] }}</span>
                                <span>{{item.nodeName}}</span>
                                <span>{{item.approveEmployeeName}}</span>
                            </div>
                            <div class="app-mark">{{item.dealRemark}}</div>
                            <div class="app-time">{{item.approveTime}}</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <CrmDialog :option="leaderOption" @close="leaderOptionClose" v-if="leaderOption.show" />
    </div>
</template>
<script>

import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { contractApplyInfo,supplierContractApplyInfo,contractVerify,updateSubmitVerify,contractSupplierVerify,getEmployeesBydpCode} from '@/api/crm/contract'
import Step from './components/step'
import { mapGetters,mapState } from 'vuex'
import { formatIndustry } from '@/utils/crm'
import CrmDialog from '@/views/crm/components/crmDialog'
const RLIST = []
export default {
  name: 'ContractDetail',
  mixins: [mixin, routerMixin],
  setComplete: {
      type: Number,
      default: 0,
    },
  components: { Step, CrmDialog},
  data() {
    return {
        completing: 0,
        setNumber:3,
        baseInfo:{},
        companyList:[],
        relList:[],
        businessType:[],
        baseDto:{},
        approver:{},
        //合同审批
        leaderOption: {
            show: false,
            showClear: true,
            btnLoading: false,
            title: '合同审批',
            width: '400px',
            formItems: [
            {
                label: '操作原因',
                type: 'textarea',
                prop: 'dealRemark',
                rules: { ...this.defaultRules }
            },
            ],
            form: {
                dealRemark: '',
                transferEmployeeId:''
            }
        },
        dpCodeList:[],
        bussiness:''
    }
  },
  watch:{
    // contractId()
  },
  created() {
    // this.getEmployeesBydpCode();
  },
  activated() {
    this.getData()
  },
  inject: ['defaultRules'],
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    ...mapState({
        userId: state => state.user.userId
    }),
  },
  methods: {
    // 转换所属行业
    formatterIndustry (str) {
      return formatIndustry(str)
    },
    // 请求详情
    getData() {
    //   this.routeType = this.$route.query.routeType
      this.lsLoading = true
      let data = {
        contractId:this.$route.query.contractId?this.$route.query.contractId:'',
        approveId:this.$route.query.approveId?this.$route.query.approveId:''
      }

      let methods
      if(this.$route.query.routeType==='list'){//从申请列表进来
        methods = this.$route.query.orgType==='customer'?contractApplyInfo:supplierContractApplyInfo
      }else{//从审批列表进来
        methods = this.$route.query.orgType==='customer'?contractVerify:contractSupplierVerify
      }
      methods(data)
        .then(res => {
          this.baseInfo = res.data
          this.baseDto = res.data.customerDetailDto?res.data.customerDetailDto:res.data.supplierDetailDto
          let contractDetail = this.$route.query.orgType==='customer'?res.data.crmCustContractMainApplyDto:res.data.crmSupplierContractMainApplyDto
          this.setNumber = contractDetail.isStandard ==='yes'?3:6
          let companyName = []
          let relName = []
          let businessName = []
        //   this.baseDto.categoryDtos.map(item=>{
        //     this.form.bussiness.push(item.category)
        //   })
          //供应商类型
          if(this.$route.query.orgType==='supplier'){
            const { crmCategory } = this.dictMapObj
            this.bussiness = this.convertRole(this.baseDto.categoryDtos, crmCategory)
          }

          //分公司
          res.data.companyList.map(item=>{
            companyName.push(item.companyName)
          })
          this.companyList = companyName.join(',')
          //共享公司
          res.data.relCustList&&res.data.relCustList.map(item=>{
            relName.push(item.custName)
          })
          this.relList = relName.join(',')
          //业务类型
          const { baseBusinessType } = this.dictMapObj
          res.data.businessList.map(item=>{
            businessName.push( this.dictMapObj['baseBusinessType'][item.businessType])
          })
          this.businessType = businessName.join(',')
          
          //审核人获取
          this.approver = res.data.personList&&res.data.personList.find(item=> item.approveEmployeeId === this.userId)
          //获取当前在第几个审批节点
          res.data.nodeVoList&&res.data.nodeVoList.forEach(item=>{
          item.nodeDtoList.forEach(element => {
                if(element.dealStatus === 'processing'){
                    this.completing = Number((element.step.split('')[element.step.length-1])-1)
                }
            })
          })
        })
        .finally(() => (this.lsLoading = false))
    },
    // 供应商类型转换成显示内容
    convertRole(arr, customerRole) {
        return arr
        .map((v) => v.category)
        .join('+')
        .replace(/\b(\w+)\b/g, (v) => customerRole[v])
    },
    //内部转签
    getEmployeesBydpCode(name=''){
        let data = {
            currPage: 1,
            pageSize: 100,
            query: [
                // { column: 'roleCode', type: 'in', value: 'obd' },
                { column: 'name', type: 'eq', value: name }
            ]
        }
        getEmployeesBydpCode(data).then(({ data }) => {
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
    downLoad(fileName, fileNo) {
        fileName = fileName.replace(/[\[|\]|\{|\}|\%|`]/g, '')
        const href = `/base/fileView/preview/${fileNo}/${fileName}`
        window.open(href)
    },
    //申请人领导人审核
    checkFn(type){
        if(type==='refuse'||type==='backbd'||type==='end'||type==='backt'){
            this.leaderOption.formItems[0].rules.required = true
        }else{
            this.leaderOption.formItems[0].rules.required = false 
        }
        if(type==='transfer'){
            if(this.leaderOption.formItems.length>1){
                this.leaderOption.formItems = this.leaderOption.formItems.splice(1,1)
            }
            const item = {
                label: '转签至',
                type: 'select',
                prop: 'transferEmployeeId',
                rules: { ...this.defaultRules },
                show: true,
                remoteSelectList: RLIST,
                remote: true,
                remoteMethod: (name) => {
                this.getEmployeesBydpCode(name)
                }
            }
            this.leaderOption.formItems.unshift(item)
        }

        this.leaderOption.show = true
        this.leaderOption.form.dealStatus = type
    },
    leaderOptionClose(tag){
        if (!tag) {
            return this.closeLeaderOption()
        }
        this.leaderOption.btnLoading = true
        let changeId = this.leaderOption.form.transferEmployeeId
        if(changeId){
            this.leaderOption.form.transferEmployeeName = RLIST.find(item=>item.employeeId === changeId).cname
        }
        let data = {
            ...this.leaderOption.form,
            nodeId: this.approver.nodeId,
            approveId:this.$route.query.approveId,
        }
        updateSubmitVerify(data).then((res) => {
            this.$msgSucClose('操作成功!') 
            this.closeLeaderOption()
            this.getData()
        })
        .finally(() => {
            this.leaderOption.btnLoading = false
        })
    },
    closeLeaderOption(){
        this.leaderOption.show = false
        this.leaderOption.form = {
            dealRemark: '',
            transferEmployeeId:''
        }
    },
  },
}
</script>
<style lang="scss" scoped>
@import "../customerList/scss/detail.scss";
.left-cnt{ span{margin-right:30px;}}
.process{padding:25px 0}
.content{padding:5px 20px;
    .outer-box {
        border: 1px solid #eee;
        margin-bottom: 20px;
        width: 100%;
        border-radius: 4px;
        .title {
            height: 20px;
            line-height: 20px;
            padding: 0 5px;
            background-color: #EBEEF3;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .item-box {
            align-items: center;
            padding: 8px 5px;
            .box li{
                width:33%;
                display: inline-block;
                padding:5px 0;
            }
            .once .file-li{line-height:20px;}
            .once li{display: flex; padding:5px 0;}
            .approve{
                li{
                    border-bottom:1px solid#D9D9D9;
                    padding:5px;
                    .app-status{display: flex; 
                        .status-pass{color:#33B18A}
                        .status-refuse{color:#D9001B}
                        span{margin-right:20px}
                    }
                    .app-mark{padding:10px 0}
                    .app-time{text-align:right;}
                }            
            }
        }
    }
    .file-link {
        color: #3E80F5 !important;
        cursor: pointer;
        height:20px;
        padding: 0 5px;
        text-overflow :ellipsis !important;
        white-space :nowrap !important; 
        overflow : hidden !important; 
        // display: block;
    }
}
</style>
