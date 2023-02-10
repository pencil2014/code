<template>
  <div class="maintainer-box">
    <!-- default-expand-all -->
    <div class="tab-box" v-if="$attrs.bds">
      <div class="title">维护人</div>
      <el-radio-group
        v-model="bdEmployeStatus"
        size="mini"
        @change="changeStatus"
        v-show="isCts"
      >
        <el-radio-button label="effect">当前维护人</el-radio-button>
        <el-radio-button label="remove">历史维护人</el-radio-button>
      </el-radio-group>
      <FinanceTableMass :option="option1"  v-if="bdEmployeStatus=='effect'" />
      <FinanceTableMass :option="option2" v-else/>
    </div>
    <div class="creater-box">
      <FinanceTableMass :option="baseOptions" />
    </div>
  </div>
</template>

<script>
import { mapGetters,mapState} from "vuex"
import FinanceTableMass from "@/views/finance/components/financeTableMass/financeTableMass"
import { routerMixin } from "@/views/finance/mixins/routerMixin"
import { mixin } from "@/views/finance/orderFee/orderFee/mixin"
export default {
  name: "fixedBottom",
  mixins: [routerMixin, mixin],
  components: {
    FinanceTableMass,
  },
  props: {
    baseInfo: {
      type: Object,
      default: () => ({ orgVerifyDto: {}, backupInfo: {} }),
    },
    remove: "",
    hideAction: false,
  },
  data() {
    return {
      bdEmployeStatus: "effect",
      option1: {},
      option2: {},
      baseOptions: {
        columns: this.tableColumns,
        data: this.baseData,
      },
      tableColumns: [
        { prop: "createdName", label: "创建人", type: "text", minWidth: 100 },
        { prop: "createdTime", label: "创建时间", type: "text", minWidth: 130 },
        { prop: "verifierName", label: "审核人", type: "text", minWidth: 100 },
        { prop: "verifyTime", label: "审核时间", type: "text", minWidth: 130 },
        {
          prop: "updatedName",
          label: "最后修改人",
          type: "text",
          minWidth: 100,
        },
        {
          prop: "updatedTime",
          label: "最后修改时间",
          type: "text",
          minWidth: 130,
        },
      ],
      operationBtns1: ''
    }
  },
  created() {
    this.baseOptions = Object.assign({}, this.option, {
      id: "baseOptions",
      columns: this.tableColumns,
      data: this.baseData,
      tips: false,
      selection: false,
      operationBtns: false,
    })
    this.operationBtns1 = Object.assign({}, this.option.operationBtns, {
      fixed: "right",
      show: true,
      width: 250,
      data: [ 
        {
          label: "冻结",
          type: "text",
          showFn: (row) =>
            this.isCts  &&
            row.maintainerType !== "general" && row.maintainerType !== "online" &&
            row.isFreeze === 'N' &&
            row.status === "effect",
          action: "freeze",
        },
        {
          label: "解冻",
          type: "text",
          showFn: (row) =>
            this.isCts  &&
            row.maintainerType !== "general" && row.maintainerType !== "online" &&
            row.isFreeze === 'Y' &&
            row.status === "effect" ,
          action: "unfreeze",
        },
        {
          label: "绑定下单维护人",
          type: "text",
          showFn: (row) =>
            this.isCts && (row["status"] === "effect") && row.maintainerType === 'general'
             && !this.isRecycle && row.bindRelation !== 'effect',
          action: "bind",
        },
        {
          label: "解绑下单维护人",
          type: "text",
          showFn: (row) =>
            this.isCts && (row["status"] === "effect") && row.maintainerType === 'general'
             && !this.isRecycle && row.bindRelation === 'effect',
          action: "unbind",
        },
        {
          label: "客户交接",
          type: "text",
          showFn: (row) =>
            this.isCts  && 
            row.isFreeze !== 'Y' &&
            row.maintainerType !== "online" && 
            row.status === "effect",
          action: "remove",
        },
        {
          label: "编辑",
          type: "text",
          showFn: (row) =>
            this.isCts && (row["status"] === "effect") && row.isFreeze !== 'Y' &&
            row.maintainerType !== "online" && !this.isRecycle,
          action: "edit",
        },
        {
          label: "模式",
          type: "text",
          showFn: (row) =>
            this.isCts &&
            row["orderBd"] === "yes" &&
            (row["status"] === "effect") && row.isFreeze !== 'Y' &&
            row.maintainerType !== "online" && !this.isRecycle ,
          action: "serviceMode",
        },
        {
          label: "主维护人",
          type: "text",
          showFn: (row) =>
            this.isCts && row["mainBd"] !== "yes" && (row["status"] === "effect") &&
            row.maintainerType !== "online" && row.isFreeze !== 'Y' && !this.isRecycle ,
          action: "setMain",
        },
        {
          label: "申请延期",
          type: "text",
          showFn: (row) =>
            this.isBd &&
            (row["maintainerType"]=== "order" || row["maintainerType"]=== "potential") &&
            row["status"] === "effect" &&
            row.isFreeze !== 'Y' &&
            row["bdEmployeeId"] === this.$store.state.user.userInfo.sysUserId
            && !this.isRecycle &&!this.isBlacklist 
            ,
          action: "delay",
        },
        {
          label: "放弃",
          type: "text",
          showFn: (row) =>
            this.isBd && row["status"] === "effect" &&
            // this.isPotential &&
            row.isFreeze !== 'Y' &&
            (row["bdEmployeeId"] === this.$store.state.user.userInfo.sysUserId) &&
            (row["maintainerType"] === 'potential') && !this.isRecycle &&!this.isBlacklist ,
          action: "abandon",
        },
        {
          label: "申请下单维护人",
          type: "text",
          showFn: (row) =>
            this.isBd && row["status"] === "effect" &&
            this.isOrderPo &&
            row.isFreeze !== 'Y' &&
            (row["maintainerType"]=== "potential") &&
            (row["bdEmployeeId"] === this.$store.state.user.userInfo.sysUserId) && !this.isRecycle &&!this.isBlacklist ,
          action: "toBeOrder",
        }
      ],
      callback: (action, $index, row, option) => {
        this.emitEvent(row, action)
      },
    })

   var mtDateRemarks = ''
    this.option1 = Object.assign({}, this.option, {
      id: "option1",
      maxHeight: 200,
      columns: [
        {
          prop: "bdEmployeeName",
          label: "维护人",
          type: "text",
          hasTag: true,
        },
        {
          prop: "maintainerType",
          label: "维护人类型",
          type: "select",
          propInDict: "custMaintainerType",
        },
        {
          prop: 'supportContent',
          label: "支持范围",
          // formatter: ({ cellValue, row }) => {
          //   let type = this.dictMapObj['supportRange'][cellValue]
          //   return row.supportContent ?  `${type}: ${row.supportContent}` : type
          // }
        },
        {
          prop: "bdDeptName",
          label: "部门",
          type: "text",
        },
        {
          prop: "email",
          label: "联系方式",
          type: "text",
          formatter: ({ row }) => {
            return row.mobileNo || row.email
          },
        },
        {
          prop: "bdServiceMode",
          label: "新旧模式",
          type: "text",
          formatter: ({ row }) => {
            if (row.maintainerType === "order"||row.maintainerType === "online" ) {
              return row.bdServiceMode === "new"
                ? "新模式"
                : row.bdServiceMode === "old"
                ? "旧模式"
                : ""
            } else {
              return ""
            }
          },
        },
        {
          type: "date",
          prop: 'firstBizDate',
          label: '首次合作时间',
        },
        {
          type: "date",
          prop: 'latestBizDate',
          label: '最近合作时间',
        },
        {
          type: "date",
          prop: "mtDate",
          label: "保有时间",
          type: "text",
          isTool:'',//要提示的词语，从下面函数取得
          formatter: ({ row }) => {
            // console.log(row.mtDateRemark,'row.mtDateRemark')
            // this.option1.columns[7].isTool = 
            // item.isTool = row.mtDateRemark
             return  row.mtDate
          },
        },
        {
          type: "text",
          prop: "mtDateRemark",
          label: "备注",
        },
        {
          prop: "isFreeze",
          label: "维护人状态",
          type: "text",
          formatter: ({ row }) => {
            if(row.isFreeze === 'Y'){
              return  '冻结'
            }else{
              return  '正常'
            }
          },
        },
      ],
      data: this.treeData,
      tips: false,
      selection: false,
      operationBtns:
        !this.hideAction && (this.isCts ||this.isBd)  
        // !this.hideAction && (this.isCts || this.isManager)
          ? this.operationBtns1
          : false,
    })
    this.option2 = Object.assign({}, this.option, {
      id: "option2",
      maxHeight: 200,
      columns: [
        {
          prop: "bdEmployeeName",
          label: "维护人",
          type: "text",
          hasTag: true,
        },
        {
          prop: "maintainerType",
          label: "维护人类型",
          type: "select",
          propInDict: "custMaintainerType",
        },
        {
          prop: 'supportContent',
          label: "支持范围",
        },
        {
          prop: "bdDeptName",
          label: "部门",
          type: "text",
        },
        {
          prop: "email",
          label: "联系方式",
          type: "text",
          formatter: ({ row }) => {
            return row.mobileNo || row.email
          },
        },
        {
          prop: "bdServiceMode",
          label: "新旧模式",
          type: "text",
          formatter: ({ row }) => {
            return row.bdServiceMode === "new"
              ? "新模式"
              : row.bdServiceMode === "old"
              ? "旧模式"
              : ""
          },
        },
        {
          prop: "removeReason",
          label: "失效原因",
          type: "text",
        },
        {
          prop: "removeTime",
          label: "失效时间",
          type: "text",
        }
      ],
      data: this.treeData,
      tips: false,
      selection: false,
      operationBtns:false,
    })
  },
  computed: {
    ...mapGetters(["dictMapObj","userInfo"]),
    ...mapState('user', ['userId', 'deptCode']),
    baseData() {
      const {
        createdName: updatedName,
        createdTime: updatedTime,
        verifierName,
        verifyTime,
      } = this.baseInfo.orgVerifyDto
      const { createdName, createdTime, mtEmployeeName, supplierId } =
        this.baseInfo.backupInfo
      return [
        {
          createdName,
          createdTime,
          verifierName,
          verifyTime,
          updatedName,
          updatedTime,
          mtEmployeeName,
          supplierId,
        },
      ]
    },
    isOrderPo(){
       return (this.baseInfo.roles || []).some(item => ['potential', 'client'].includes(item.roleType))
    },
    haveOrderBd(){
       return (this.baseInfo.roles || []).some(item => ['client'].includes(item.roleType) && item.isFreeze!=='Y') 
    },
    treeData() {
      const updateBds = this.baseInfo.updateBds || []
      const bds = this.baseInfo.bds || []
      let source = updateBds.length ? updateBds : bds
      source = source.filter((item) => item.status === this.bdEmployeStatus)
      return source.map((item) => {
        let _isChanged, _tagArr, _isInvalid
        // 可以解绑时再显示主维护人
        if (
          !this.hideAction &&
          item.mainBd == "yes" &&
          this.isCts &&
          item.status === "effect"
        ) {
          _isChanged = true
          _tagArr = [{ text: "主", type: "change" }]
        }
        if (item.status === "remove") {
          _isInvalid = true
        }
        return { ...item, _isChanged, _tagArr, _isInvalid }
      })
    },
    hasMainBd() {
      return (this.baseInfo.bds || []).find((v) => v.mainBd === "yes")
    },
    isCts() {
      return this.$store.state.user.roles.includes("cts")
    },
    isBd() {
      return (this.$store.state.user.roles.includes("bd")
      ||this.$store.state.user.roles.includes('obd'))
    },
    isManager() {
      return this.$store.state.user.roles.includes("manager")
    },
    isPotential(){
      return this.baseInfo.custMode === 'potential'
    },
    isRecycle(){
      return this.baseInfo.backupInfo.isRecycle ==='yes'
    },
    isBlacklist(){
      return this.baseInfo.backupInfo.isBlacklist ==='yes'
    },
    isPass(){
      return this.baseInfo.backupInfo.verifyStatus ==='pass'
    }
  },
  watch: {
    baseInfo() {
      if (
        this.baseInfo.backupInfo.supplierId &&
        this.tableColumns[0].prop !== "mtEmployeeName"
      ) {
        this.tableColumns.unshift({
          prop: "mtEmployeeName",
          label: "维护人",
          type: "text",
          minWidth: 100,
        })
      }
      this.baseOptions.columns = this.tableColumns
      this.baseOptions.data = this.baseData
      this.option1.data = this.treeData
      this.option2.data = this.treeData
      console.log('this.baseInfo',this.baseInfo)
    },
  },
  methods: {
    changeStatus(val) {
      if (val !== "effect") {
        this.option1.operationBtns = false
      } else {
        this.option1.operationBtns =     
           ( !this.hideAction && (this.isCts ||this.isBd)  
          ? this.operationBtns1
          : false)
      }
      this.option1.data = this.treeData
      this.option2.data = this.treeData
    },
    emitEvent(row, action) {
      this.$emit("emitEvent", { ...row, action })
    },
    checkSame(row) {
      const isSame = row.bdEmployeeId == this.$store.state.user.userId
      const deptCode = this.$store.state.user.deptCode
      return !isSame && deptCode == row.bdDeptCode.slice(0, deptCode.length)
    },
  },
  mounted() {},
}
</script>

<style lang="scss" scoped>
.maintainer-box {
  .tab-box {
    margin: 8px;
    .title {
      color: #222;
      font-weight: 600;
      font-size: 14px;
      margin: 10px 0;
    }
  }
  .finance-self-tag {
    display: inline-block;
    min-width: 18px;
    height: 18px;
    margin-right: 2px;
    line-height: 18px;
    border-radius: 3px;
    padding: 0 2px;
    text-align: center;
    border: none;
    color: white;
    font-size: 12px;
    transform: scale(0.8);
    background-color: #ef8519;
  }
  /deep/ .td_has_tag {
    .vxe-cell {
      text-align: center;
    }
  }
}
/deep/ .finance-table {
  padding: 8px 0;
  &#baseOptions {
    padding: 8px;
  }
  .finance-table-row-invalid {
    background-color: #f6f6f6;
    opacity: 0.9;
    td {
      color: #999;
    }
    cursor: not-allowed;
    &:hover {
      background-color: #f6f6f6;
    }
  }
}
// /deep/ .el-radio-button__orig-radio:checked + .el-radio-button__inner {
//   color: #ffffff;
//   background-color: #1890ff;
// }
</style>
