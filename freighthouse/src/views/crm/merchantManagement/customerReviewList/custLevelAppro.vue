<template>
    <div
        :element-loading-background="eLoadingBackground"
        :element-loading-spinner="eLoadingSpinner"
        :element-loading-text="eLoadingText"
        class="finance-page relationship-wrap"
        v-loading="lsLoading"
   >
        <div class="detail-header">
            <div class="left-cnt">
            <i class="el-icon-folder-remove"></i>
            <span
                class="detail-title"
                >{{name}}</span
            >
            </div>
            <div class="right-cnt" v-if="verifyStatus==='submit'">
                <el-button type="success" size="mini" @click="checkFn('pass')">通过</el-button>
                <el-button type="danger" size="mini"  @click="checkFn('noPass')">拒绝</el-button>
            </div>
        </div>
        <div class="finance-search-list-gap"></div>
        <div class="info-page">
            <div class="info-title">
                <span>基本信息</span>
            </div>
            <ul class="base-info-list">
                <!-- <li>公司名称：{{beseDetail.name}}</li> -->
                <li>公司规模：{{dictMapObj['orgScale'][beseDetail.scale]}}</li>
                <li>注册资金：{{beseDetail.regCapital}}</li>
                <li>成立日期：{{beseDetail.setupDate}}</li>
                <li>客户性质：{{dictMapObj['entType'][beseDetail.entType]}}</li>
                <li>企业类别：{{roles}}</li>
                <li>所属行业：{{formatterIndustry(beseDetail.industry)}}</li>
                <li>客户类型：{{dictMapObj['customerClass'][beseDetail.custClass]}}</li>
                <li>社信统一代码：{{beseDetail.taxId}}</li>
                <li>国家（行政区）：{{beseDetail.country}}</li>
                <li style="color:red">调整前等级：{{verifyData.beforeCustGrade}}</li>
                <li style="color:red">调整后等级：{{verifyData.custGrade}}</li>
                <li>省/市/区：<span v-if="beseDetail.province">{{beseDetail.province}}</span>
                    <span v-if="beseDetail.city">/{{beseDetail.city}}</span> 
                    <span v-if="beseDetail.district">/{{beseDetail.district}}</span>
                </li>
                <li>申请人：{{verifyData.applyEmployeeName}}</li>
                <li>申请人部门：{{verifyData.deptName}}</li>
                <li>详细地址：{{beseDetail.detailAddr}}</li>
                <br/>
            </ul>
        </div>
        <div class="info-page">
            <TitleTable :columns="orderColumns" :data="Orderdata" title="订单信息" />
        </div>
        <div class="info-page">
            <div class="info-title">
                <span>审批信息</span>
            </div>
            <ul class="base-info" v-for="(item, index) in verifyData.customerGradeApproveList" :key="index">
                <li v-if="item.approveLevel=='1'">
                    <div class="top">  <span>提交申请</span> ----
                        发起人：{{item.approveEmployeeName}}
                    </div>
                    <div class="time">
                        时间：{{ item.createdTime }}
                    </div>
                </li>
                <li v-else :class="item.currentPoint?'current':''">
                    <div class="top">
                        <span v-if="item.approveStatus==='pass'">已审核</span>
                        <span v-else-if="item.approveStatus==='refuse'">已审核</span>
                        <span v-else-if="item.approveStatus==='submit'" >审核中</span> ----
                        <span v-if="item.approveLevel=='2'">部门经理：</span>
                        <span v-else-if="item.approveLevel=='3'">负责人：</span>
                        <span :class="item.currentPoint?'current':''">{{item.approveEmployeeName}}</span>
                    </div>
                    <div class="time">
                        <span v-if="item.approveStatus==='pass'">同意</span>
                        <span v-else-if="item.approveStatus==='refuse'">拒绝：({{ item.approveStatus}})</span>
                        <span v-else-if="item.approveStatus==='submit'" >审核中</span> 
                        <span class="create-time">时间：{{ item.createdTime }}</span>
                    </div>
                 
                </li>
            </ul>
        </div>
        <!-- 审核不通过原因 -->
        <CrmDialog v-if="noPassDialog.show" :option="noPassDialog" @close="confirmFn"></CrmDialog>
   </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import CUSTOMER from '@/api/crm/customer'
import { formatIndustry } from '@/utils/crm'
import TitleTable from '@/views/crm/components/titleTable'
import CrmDialog from '@/views/crm/components/crmDialog'
import FinanceTable from "@/views/finance/components/financeTable/financeTable"
import { baseOrderTable as columns } from "@/views/crm/data"
export default {
  name: "custLevelAppro",
  components: {
    TitleTable,
    CrmDialog,
    FinanceTable
  },
  data() {
    return {
        beseDetail:'',
        custid:'',
        oid:'',
        name: '',
        verifyStatus: '',
        desc: '',
        data: {},
        tableData: [],
        dataInfo: {},
        Orderdata: [],
        orderColumns : [
            {prop: "orderNo",label: "工作单号",type: "input"},
            { prop: "businessType", label: "业务类型", type: "select" },
            { prop: "cargoSource", label: "货物来源", type: "select" },
            // { prop: '_fileNos', label: '客户类型', type: 'select', },
            { prop: "orderStatus", label: "订单状态", type: "select" },
            { prop: "amount", label: "T量" },
            { prop: "createdName", label: "订单创建人" },
            { prop: "createdTime", label: "订单创建时间" },
        ],
        verifyData:{},
        // 审核拒绝
        noPassDialog: {
            title: '审核拒绝',
            show: false,
            showClear: true,
            btnLoading: false,
            formItems: [
            {
                label: '拒绝原因',
                type: 'textarea',
                prop: 'refuseReason',
                maxlength: 512,
                rules:
                [
                    { required: true, message: '拒绝原因必填', trigger: 'blur' },
                    { max: 512, message: '备注最大长度限制512位', trigger: 'blur' }
                ]
            }
            ],
            form: { refuseReason: '' }
        },
        roles:''
    }
  },
  mounted() {
  },
  activated() {
       this.custid = this.$route.query.custid
       this.oid = this.$route.query.oid
       this.name = this.$route.query.name
       this.verifyStatus = this.$route.query.verifyStatus
       this.getDetailData()
       this.getData()
       this.getLevelVerify()
  },
  computed: {
    ...mapGetters(['dictMap','dictMapObj'])
  },
  methods: {
    // 转换所属行业
    formatterIndustry (str) {
      return formatIndustry(str)
    },
    //基本信息
    getDetailData() {
       CUSTOMER.verifyInfo({ custid: this.$route.query.custid}).then(
        (res) => {
            this.beseDetail = {...res.data.customerDto,...res.data.organizationDto,...res.data.roles}
            const { customerRole } = this.dictMapObj
            this.roles = this.convertRole(res.data.roles, customerRole)
            this.$forceUpdate()
        })
    },
    convertRole(arr, customerRole) {
      return arr
        .map((v) => v.roleType)
        .join('+')
        .replace(/\b(\w+)\b/g, (v) => customerRole[v])
    },
    // 订单信息
    getData() {
      let data = {
        currPage: 1,
        pageSize: 100,
        custid: this.custid,
      }
      CUSTOMER.orderList(data).then((res) => {
        this.Orderdata = res.data.list
      })
    },
    //获取审核信息
    getLevelVerify(){
        CUSTOMER.getLevelVerify({ custid: this.$route.query.custid}).then(
        (res) => {
            this.verifyData = res.data
        })
    },
    // 审核按钮
    checkFn(type){
        if (type === 'pass') {        //通过审核
            this.$confirmWarn('是否确定要同意该申请？', () => {
                this.checkPassApi()
            })
        } else if (type === 'noPass') {
            this.noPassDialog.show = true
        }
    },
    confirmFn (tag) {
      if (!tag) return (this.noPassDialog.show = false)
      this.checkRefuseApi()
    },
    checkPassApi(){
        let data = {
            custid: this.custid,
            oid:this.oid,
            gradeId:this.verifyData.oid,
            verifyStatus:'pass',
        }
        CUSTOMER.approveLevelVerify(data).then((res) => {
            if (res.code === 0) {
                this.$msgSucClose('操作成功！')
                this.getDetailData()
                this.getLevelVerify()
                this.verifyStatus = false
            }
        }).catch(() => {
        })
    },
    checkRefuseApi () {
      let data = {
        custid: this.custid,
        oid:this.oid,
        gradeId:this.verifyData.oid,
        verifyStatus:'refuse',
        ...this.noPassDialog.form
      }
      this.noPassDialog.btnLoading = true
      CUSTOMER.approveLevelVerify(data).then((res) => {
        if (res.code === 0) {
            this.noPassDialog.show = false
            this.$msgSucClose('操作成功！')
            this.getDetailData()
            this.getLevelVerify()
            this.verifyStatus = false
        }
      }).catch(() => {
      }).finally(() => {
        this.noPassDialog.btnLoading = false
      })
    },
  }
}
</script>


<style lang="scss" scoped>
@import "../customerList/scss/detail.scss";
.relationship-wrap{
    background: #F6F7F9;
    .detail-header {
        background: #fff;
    }
    .info-page {
        background: #fff;
    }
    .file-wrap {
      
    }
}
.file-td {
    border-bottom: 1px solid #dfe6ec;
}
.file-td:nth-last-of-type(1) {
    border:none;
}
.file-link {
  color: #3E80F5 !important;
  cursor: pointer;
  height:20px;
  padding: 0 5px;
  text-overflow :ellipsis !important;
  white-space :nowrap !important; 
  overflow : hidden !important; 
}
#organizationTable {
    margin-top:20px;
    .file-item-wrap {
       .file-item {
            border-bottom: 1px solid #dfe6ec;
        }
    }
    .file-item-wrap:nth-last-of-type(1) {
        border-bottom:none;
    }
}
/deep/ #organizationTable .cell.el-tooltip {
    text-overflow :ellipsis !important;
    white-space :nowrap !important; 
    overflow : hidden !important; 
    padding:0 !important;
}
/deep/ #organizationTable td {
    text-overflow :ellipsis !important;
    white-space :nowrap !important; 
    overflow : hidden !important; 
    padding: 0 !important;
}
/deep/ #organizationTable td {
    border-right:1px solid #dfe6ec !important;
}
/deep/ #customerAdd #fileContent #fileItem:nth-of-type(1) {
    // border-top: 1px solid #dfe6ec;
}
/deep/ #customerAdd #fileItem .el-dialog__body .el-form-item__content > div {
    width: 400px !important;
}
.base-info-list  li {
     width: 33%;
}
.base-info li{width:100%;margin-top:20px;border-bottom:1px dashed #ccc;
    .time{padding:6px 0;}
    .create-time{margin-left:20px;}
}
.current{color:#3E80F5}
</style>