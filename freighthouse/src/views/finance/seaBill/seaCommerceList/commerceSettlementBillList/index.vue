<template>
  <div class="settlement-bill">
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="settlement-bill-cnt finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-commerceSettlementBillList', 'btn-confirmPass')" class="finance-btn" size="mini" type="success" @click="confirmPass"
              >审核通过</el-button
            >
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-commerceSettlementBillList', 'btn-confirmReject')" class="finance-btn" size="mini" type="danger" @click="confirmReject"
              >审核拒绝</el-button
            >
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-commerceSettlementBillList', 'btn-handleWithdrawPayApplyAudit')" class="finance-btn"  size="mini" @click="handleWithdrawPayApplyAudit" type="purple"
            >撤回申请</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button
            class="finance-btn"
            @click="refreshListPage"
            size="mini"
            type="primary"
          >刷新</el-button>
          <!-- <el-button-group>
            <el-button
              class="finance-btn"
              @click="rightFilterAction(0)"
              size="mini"
              :class="rightFilterBtns[0] ? 'right-filter-btns-effect' : ''"
              >全部</el-button
            >
            <el-button
              class="finance-btn"
              @click="rightFilterAction(1)"
              size="mini"
              :class="rightFilterBtns[1] ? 'right-filter-btns-effect' : ''"
              >待审核</el-button
            >
            <el-button
              class="finance-btn"
              @click="rightFilterAction(2)"
              size="mini"
              :class="rightFilterBtns[2] ? 'right-filter-btns-effect' : ''"
              >已通过</el-button
            >
            <el-button
              class="finance-btn"
              @click="rightFilterAction(3)"
              size="mini"
              :class="rightFilterBtns[3] ? 'right-filter-btns-effect' : ''"
              >已拒绝</el-button
            >
          </el-button-group> -->
        </div>
      </div>
      <FinanceTable
        v-loading="loading"
        :option="option1"
        @send-multi="sendMulti"
      />
    </div>
    <el-dialog :title="'审批不通过'" :visible.sync="refuseOpen" width="600px">
      <el-form :model="refuseForm" ref="refuseForm" label-width="80px">
        <el-form-item
          label="拒绝原因"
          prop="refuseReason"
          :rules="{
            required: true,
            message: '拒绝原因不能为空',
            trigger: 'blur',
          }"
        >
          <el-input
            type="textarea"
            :maxlength="500"
            show-word-limit
            v-model="refuseForm.refuseReason"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit" size="mini"
          >确定</el-button
        >
        <el-button @click="refuseOpen = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
// import FinanceTable from '../components/financeTable.vue'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { shLienSettleListPage, shLienSettleAudit, applyAuditCancel, shLienSettleSettlePageAmtSummary } from '@/api/fin/shBill'

export default {
  components: {
    FinanceSearch,
    FinanceTable
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: '/fin/shLienSettle/listPage',
      businessGroupType: this.$route.name.indexOf('Air') > -1 ? 'air' : 'ship',
      keyDownActive: true,
      loading: false,
      searchOption: {},
      rightFilterBtns: [true, false, false, false],
      option1: {},
      multipleSelection: [],
      refuseOpen: false,
      refuseForm: {
        refuseReason: ''
      },
      specialFeeOption: []
    }
  },
  created() {
    this.searchOption = {
      saveDefault: true,
      saveShow: true,
      saveName: 'seacommerceSettlementBillList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: [
          {
            key: 'applyNo',
            value: '',
          },
          {
            key: 'auditStatus',
            value: '',
          },
          {
            key: 'settleCorpCode',
            value: '',
          },
          {
            key: 'applyTime',
            value: '',
          }
        ],
        filterGroups: {
          applyNo: {
            label: '申请编号',
            type: 'input',
          },
          sourceBizNo: {
            label: '工作单号',
            type: 'input',
          },
          settleOrderNo: {
            label: '结算单号',
            type: 'input',
          },
          auditStatus: {
            label: '审核状态',
            type: 'select',
            prop: 'auditStatus'
            // selectOptions: [
            //   { label: '待确认', value: 'pending' },
            //   { label: '已通过', value: 'pass' },
            //   { label: '已拒绝', value: 'refuse' },
            // ],
          },
          settleCurrency: {  label: '币种',  type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'), },
          settleCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            visibleChange: (queryString, item) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            remoteSelectList: [],
          },
          latestPayDay: {
            label: '最晚付款时间',
            type: 'daterange',
            format: 'yyyy-MM-dd'
          },
          createdBy: {
            label: '申请人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          applyTime: {
            label: '申请时间',
            type: 'daterange',
            format: 'yyyy-MM-dd'
          },
          auditId: {
            label: '审核人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          auditTime: {
            label: '审核时间',
            type: 'daterange',
            format: 'yyyy-MM-dd'
          }
        }
      }
    }
    const pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      title:'操作',
      width: '108px',
      data: [
        {
          label: '详情',
          show: true,
          action: 'showDetail'
        },
        {
          label: '审核日志',
          show: true,
          action: 'showLog'
        }
      ]
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      emptyText: '数据将在查询后显示',
      pagination
    })
    const columns = [
      {
        prop: 'applyNo',
        label: '申请编号',
        type: 'button',
        width: 120,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showDetail(row)
          },
        }
      },
      {
        prop: 'sourceBizNo',
        label: '工作单号',
        type: 'columnTip',
        width: 130,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showColumnDetailHandle({ type: 'sourceBizNo', no, componentProps }, { isTab: true })
          },
        }
      },
      {
        prop: 'settleCorpName',
        label: '结算单位',
        type: 'text',
        width: 150
      },
      // {
      //   prop: 'employeeName',
      //   label: '商务',
      //   type: 'text'
      // },
      {
        prop: 'settleCurrency',
        label: '付款币种',
        type: 'text'
      },
      {
        prop: 'applyPayAmt',
        label: '付款金额',
        type: 'text'
      },
      {
        prop: 'latestPayDay',
        label: '最晚付款时间',
        type: 'text',
        width: 90
      },
      {
        prop: 'applyRemark',
        label: '申请备注',
        type: 'text',
        width: 150
      },
      {
        prop: 'auditStatus',
        label: '审核状态',
        type: 'text',
        formatter:({row})=>{
          const statusName = this.dictMapObj.auditStatus[row.auditStatus]
          if (row.auditStatus === 'pending') {
            return '<span style="color:#EDB534">'+statusName+'</span>'
          } else if (row.auditStatus === 'pass') {
            return '<span style="color:#33B18A">'+statusName+'</span>'
          } else if (row.auditStatus === 'refuse') {
            return '<span style="color:#CD4130">'+statusName+'</span>'
          } else {
            return statusName
          }
        }
        // formatter: ({ cellValue }) => {
        //   const text = {
        //     cancel: '已取消',
        //     pending: '待确认',
        //     pass: '已通过',
        //     refuse: '已拒绝'
        //   }
        //   const key = cellValue
        //   return text[key] || '--'
        // }
      },
      {
        prop: 'refuseReason',
        label: '拒绝原因',
        type: 'tooltip',
        width: 120
      },
      {
        prop: 'auditName',
        label: '当前审核人',
        type: 'text'
      },
      {
        prop: 'approverDesc',
        label: '审核人岗位',
        type: 'text'
      },
      {
        prop: 'auditTime',
        label: '审核时间',
        type: 'text',
        width: 150
      },
      {
        prop: 'createdName',
        label: '申请人',
        type: 'text'
      },
      {
        prop: 'createdTime',
        label: '申请时间',
        type: 'text',
        width: 150
      },
      {
        prop: 'settleOrderNo',
        label: '结算单号',
        type: 'button',
        width: 125,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option, subItem) => {
            this.goSettleOrderNo(row)
          }
        }
      },
    ]
    this.option1.columns = columns
    // this.getData()
  },
  methods: {
    // 点击搜索
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 获取数据
    getData(isSearch, index) {
      this.option1.loading = true
      const data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: [],
        query: []
      }
      this.finCommonSearch(data.query, this.searchOption)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (index) {
        const auditStatus = ['', 'pending', 'pass', 'refuse']
        data.query.push({
          column: 'auditStatus',
          value: auditStatus[index],
          type: 'eq'
        })
      }
      let reqData = JSON.parse(JSON.stringify(data)) 
      reqData.query.push({column: "businessGroup", type: "eq", value: this.businessGroupType})
      shLienSettleListPage(reqData)
        .then(res => {
          const data = res.data
          this.option1.data = data.list.map(v => {
            return {...v, sourceBizNo_multiValue: v.sourceBizNo ? v.sourceBizNo.split(',') : []}
          })
          this.$set(this.option1, 'emptyText', '未查询到任何数据')
          Object.assign(this.option1.pagination, res.data)
        })
    },
    getListAmtSummary(data) {
      shLienSettleSettlePageAmtSummary(data).then(res => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            applyPayAmtListLabel: '付款金额',
          }
          let colorObj = {
            applyPayAmtListColor: 'green', // 支持red, green, black三种值
          }
          let data = {
             applyPayAmtList: res.data || []
          }
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj
          })
        }
      })
    },
    // 分页方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 右边筛选操作
    rightFilterAction(index) {
      this.getData(true, index)
      this.rightFilterBtns = [false, false, false, false, false]
      this.$set(this.rightFilterBtns, index, true)
    },
    // 确认审核成功校验
    confirmPass() {
      console.log(this.$store.state.user.userId);
      const len = this.multipleSelection.length
      if (!len) {
        return this.$msgErrClose( '请勾选需要审核通过的数据' )
      }
      const auditStatus = this.multipleSelection.every(item => {
        return item.auditStatus === 'pending' || item.auditStatus === 'approving'
      })
      if (!auditStatus) {
        return this.$msgErrClose( '只有待审核或审批中的数据才能进行审核' )
      }
      const auditId = [...new Set(this.multipleSelection.map(item => item.auditId || -1))]
      console.log(auditId[0], this.$store.state.user.userId);
      if(auditId.length > 1 || auditId[0] != this.$store.state.user.userId){
        return this.$msgErrClose('您不是所选数据的审批人')
      }
      this.$confirm('是否确认审核成功该账单记录？', '确认信息', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.shLienSettleAudit()
        })
        .catch(() => {})
    },
    // 账单审核方法
    shLienSettleAudit() {
      const arr = this.multipleSelection
      const applyNoList = arr.map(item => {
        return item.applyNo
      })
      const auditStatus = 'pass'
      const data = {
        applyNoList,
        auditStatus
      }
      shLienSettleAudit(data)
        .then(res => {
          this.$message({
            message: '恭喜，审核账单成功！',
            type: 'success',
            showClose: true
          })
          this.multipleSelection = []
          this.getData()
        })
        .catch(() => {})
    },
    // 账单审核失败校验
    confirmReject() {
      const len = this.multipleSelection.length
      if (!len) {
        return this.$msgErrClose( '请勾选需要审核拒绝的数据' )
      }
      if (len !== 1) {
        return this.$msgErrClose( '一次只能审核拒绝一条数据' )
      }
      const auditStatus = this.multipleSelection.every(item => {
        return item.auditStatus === 'pending' || item.auditStatus === 'approving'
      })
      if (!auditStatus) {
        return this.$msgErrClose( '只有待审核或审批中的数据才能进行审核拒绝' )
      }
      const auditId = [...new Set(this.multipleSelection.map(item => item.auditId || -1))]
      if(auditId.length > 1 || auditId[0] != this.$store.state.user.userId){
        return this.$msgErrClose('您不是所选数据的审批人')
      }
      this.refuseOpen = true
    },
    // 表格选择
    sendMulti(data) {
      this.multipleSelection = data
      let data2 = {
				"ascColumns": [],
				"descColumns": [],
				"query": []
			}
			let ids = this.multipleSelection.map(item => {
				return item.applyNo
			}).join(',')
			if (ids) {
				data2.query.push({
					"column": "applyNo",
					"type": "in",
					"value": ids
        })
			} else {
				data2.query = this.searchBackup || []
			}
			if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          let reqData = JSON.parse(JSON.stringify(data2)) 
          reqData.query.push({column: "businessGroup", type: "eq", value: this.businessGroupType})
          this.getListAmtSummary(reqData)
        })
      }
    },
    // 审批拒绝
    handleSubmit() {
      this.$refs.refuseForm.validate(valid => {
        if (valid) {
          const data = {
            applyNoList: this.multipleSelection[0].applyNo,
            auditStatus: 'refuse',
            refuseReason: this.refuseForm.refuseReason
          }
          shLienSettleAudit(data)
            .then(res => {
              this.$message({
                message: '恭喜你，审批拒绝成功',
                type: 'success'
              })
              this.refuseOpen = false
              this.getData()
            })
            .catch(err => {
              this.refuseOpen = false
            })
        }
      })
    },
    // 跳转结算单详情
    goSettleOrderNo(row) {
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        path: '/finance/settlement/settlementDetail',
        query: {
          source: 'settlementDetail',
          settleOrderNo: row.settleOrderNo
        }
      })
    },
    showDetail(row){
      sessionStorage.setItem('queryShLienSettleApplyInfo', row.applyNo)
      this.routerPushTab('PaymentRequestDetail')
    },
    showLog(row){
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'ShLienSettleAuditDetail',
        query: {
          source: 'ShLienSettleAuditDetail',
          applyNo: row.applyNo
        }
      })
    },
    //撤回申请
    handleWithdrawPayApplyAudit(){
      let len = this.multipleSelection
      if (len.length === 0) {
        return this.$msgErrClose('请勾选需要撤回申请的项！')
      }
      if (len.length !== 1) {
        return this.$msgErrClose('一次只能勾选1条数据进行撤回申请，请重新选择！')
      }
      for (let i = 0; i < len.length; i++) {
        if(!(len[i].auditStatus ==='pending' || len[i].auditStatus ==='approving')){
          return this.$msgErrClose('待审核或审批中状态才能取消申请，请重新选择！')
        }
      }
      const auditId = [...new Set(this.multipleSelection.map(item => item.createdBy || -1))]
      console.log(auditId[0], this.$store.state.user.userId);
      if(auditId.length > 1 || auditId[0] != this.$store.state.user.userId){
        return this.$msgErrClose('您不是所选数据的申请人')
      }
      let applyNoList = len.map(item=>{
        return item.applyNo
      })
      let data = {
        applyNo:len[0].applyNo
      }
      this.$confirm('是否确认撤回申请？', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        cancelButtonClass: 'btn-custom-cancel',
        type: 'warning'
      }).then(() => {
        applyAuditCancel(data).then(res=>{
        this.$message({message: '撤回申请成功', type: 'success'});
          this.getData()
        })
      })
    },
  },
  watch: {
		'$store.state.user.userInfo'(val){
			console.log(this.$store.state.user.userInfo.settleCompanyCode);
			console.log(this.$store.state.user.userInfo.settleCompanyName);
		}
	},
  activated() {
    console.log(this.$store.state.user);
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    /* 获取列表数据*/
    if (!this.$route.meta.isUseCache) {
      this.getData()
    }
  }
}
</script>

<style lang="scss">
.app-wrapper .finance-page {
  .settlement-bill {
    textarea {
      height: 80px !important;
    }
  }
}
</style>
