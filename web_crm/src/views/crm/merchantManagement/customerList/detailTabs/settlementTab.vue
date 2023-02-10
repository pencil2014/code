<template>
  <div
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    class="info-page"
    v-loading="lsLoading"
  >
    <div class="contract-box">
      <div class="contract-list" v-if="!showHistory && !showAdd && !showInfo">
        <div class="list-cnt">
          <div class="but-box">
            <div class="left-but" v-if="isCts && !isPotentialOrigin && !isBlacklist">
              <el-button-group>
                <el-button @click="addContract" size="mini" type="primary">
                  新增结算信息
                </el-button>
              </el-button-group>
              <el-button-group>
                <el-button
                  @click="copyContract('option1')"
                  size="mini"
                  type="warning"
                >
                  复制结算信息
                </el-button>
              </el-button-group>
              <el-button-group>
                <el-button @click="disableContract" size="mini" type="danger">
                  失效
                </el-button>
              </el-button-group>
              <el-button-group>
                <el-button
                  @click="updateAccount()"
                  :loading="updateLoading"
                  size="mini"
                  type="success"
                >
                  更新客户账单
                </el-button>
              </el-button-group>
            </div>
            <div class="right-but">
              <el-button-group>
                <el-button @click="showHistoryFn" size="mini">
                  历史结算信息
                </el-button>
              </el-button-group>
            </div>
          </div>
          <FinanceTableMass :option="option1" @send-multi="sendMulti" />
        </div>
      </div>
      <div class="contract-history" v-if="showHistory && !showInfo && !showAdd">
        <div class="but-box">
          <div class="left-but">
            <div class="title">历史结算信息</div>
          </div>
          <div class="right-but">
            <el-button-group v-if="isCts && !isPotentialOrigin">
              <el-button
                @click="copyContract('option2')"
                size="mini"
                type="primary"
              >
                复制结算信息
              </el-button>
            </el-button-group>
            <el-button-group>
              <el-button @click="backHistory" size="mini">返回</el-button>
            </el-button-group>
          </div>
        </div>
        <FinanceTableMass :option="option2" @send-multi="sendMulti" />
      </div>
      <div class="contract-add" v-if="showAdd">
        <SettlementAdd
          :custid="custid"
          :OPEmployeeList="OPEmployeeList"
          :dataSource="copyData"
          @cancle="hideShowAdd"
          @submit="submitAddContract"
        />
      </div>
    </div>
    <!-- 分公司 -->
    <el-dialog
      :title="dialogOption.title"
      :visible.sync="dialogOption.show"
      width="500px">
      <ul class="company-list" v-if="dialogOption.source.length">
        <li class="item" v-for="(item,index) in dialogOption.source" :key="index">{{item}}</li>
      </ul>
      <div class="no-data" v-else>
        暂无数据
      </div>
    </el-dialog>
    <CrmDialog ref="disabled" :option="disabledDialog" @close="setContractStatus"/>
    <!-- 账期 -->
   <el-dialog
      title="账期详情"
      :visible.sync="settleOption.show"
      width="800px">
      <FinanceTableMass :option="option3"/>
   </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import SettlementAdd from './settlementAdd'
import {custSettleList,custSettleSave,custSettleInvalid} from '@/api/crm/control'
import CrmDialog from '@/views/crm/components/crmDialog'
import {updateAccount} from '@/api/crm/customerDetail'
export default {
  name: 'CUSTb',
  label: '结算信息',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    SettlementAdd,
    CrmDialog
  },
  props: ['custid', 'orgid', 'isPotentialOrigin','isBlacklist','OPEmployeeList'],
  data() {
    return {
      lsLoading: false,
      lsLoading: false,
      option1: {},
      option2: {},
      option3: {},
      multipleSelection1: [],
      multipleSelection2: [],
      showHistory: false,
      showAdd: false,
      showInfo: false,
      copyData: {},
      infoData: {},
      oldCustid: '',
      relationList: [],
      dialogOption: {
        show: false,
        title: '我司分公司',
        source: []
      },
      disabledDialog: {
        show: false,
        title: '结算信息失效',
        text: '失效',
        formItems: [
          { label: '失效原因', type: 'select', prop: 'noEffectReason', propInDict: 'customerContractInvalidReason',rules: { required: true, message: ' ' },},
          { label: '备注', type: 'textarea', prop: 'noEffectRemark', maxlength: 500},
        ],
        form: { noEffectReason: '', noEffectRemark: ''},
      },
      settleOption: {
        show: false
      },
      updateLoading:false
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    isCts() {
      return (this.$store.state.user.roles || []).includes('cts')
    },
  },
  created() {
    this.oldCustid = this.custid // 保存上一次id，用来判断是否清空数据
    const pagination1 = Object.assign({}, this.option.pagination, {
      show: true,
    })
    const columns1 = [
      { prop: 'contractNo', label: '合同编号', type: 'text' },
      {
        prop: 'settleCycle',
        label: '结算周期',
        type: 'select',
        propInDict: 'settleCycle',
      },
      {
        prop: 'settleType',
        label: '账期类型',
        type: 'select',
        propInDict: 'customerSettleType',
      },
      {
        prop: 'settleBusinessTypeList_multiValue',
        label: '业务类型',
        type: 'text',
      },

      {
        prop: 'settleCompanyList',
        label: '我司分公司',
        type: 'button',
        width: 100,
        operationBtns: {
          data: [
            {
              label: '查看',
            },
          ],
          show: true,
          callback: (action, $index, row, option) => {
            this.showCompany(row,1)
          },
        },
      },
      {
        prop: 'settleRelCustList',
        label: '共享公司',
        type: 'button',
        operationBtns: {
          data: [
            {
              label: '查看',
            },
          ],
          show: true,
          callback: (action, $index, row, option) => {
            this.showCompany(row,2)
          },
        },
      },
      {
        prop: 'belongEmployeeName',
        label: '归属人',
        type: 'text',
      },
      {
        prop: 'status',
        label: '是否有效',
        type: 'select',
        propInDict: 'commonStatus',
      },
      {
        prop: 'timeType',
        label: '账期起始日类型',
        type: 'select',
        propInDict: 'settleInfoTimeType',
        width: 120,
      },
      {
        prop: 'signDateType',
        label: '签收日期类型',
        type: 'select',
        propInDict: 'signDateType',
        width: 120,
      },
      {
        prop: 'billDay',
        label: '账期起始日',
        type: 'text',
        width: 120,
        formatter: ({ cellValue, row }) => {
          const type = this.dictMapObj['settleInfoBillDayType'][
            row['billDayType']
          ]
          return type === '等于时间类型'
            ? this.dictMapObj['settleInfoTimeType'][row.timeType]
            : ['账单日期', '开票日期'].includes(type)
            ? cellValue != '0'
              ? `${type}后${cellValue}日`
              : `${type}`
            : row.lastDay || (cellValue === '31' && type === '当月')
            ? `${type}月底`
            : `${type}${cellValue}日`
        },
      },
      {
        prop: 'expireStatus',
        label: '到期状态',
        type: 'text',
        formatter: ({ cellValue }) => {
          const text = {
            unexpired: '未到期',
            expire: '到期',
          }
          return text[cellValue] || ''
        },
      },
      {
        prop: 'isRetainContainer',
        label: '是否需要后有柜',
        type: 'text',
        width: 140,
        formatter: ({ cellValue, row }) => {
          return cellValue === 'yes' ? '是' : '否'
        },
      },
      {
        prop: 'settleDaysDtoList',
        label: '账期信息',
        type: 'button',
        operationBtns: {
          data: [
            {
              label: '查看',
            },
          ],
          show: true,
          callback: (action, $index, row, option) => {
            this.showSettlement(row)
          },
        },
      },
      { prop: 'createdName', label: '创建人', type: 'text' },
      { prop: 'createdTime', label: '创建时间', type: 'text' }
    ]
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: false,
      operationBtns: false,
      selection: this.isCts
        ? {
            show: true,
            fixed: true,
          }
        : false,
      columns: columns1,
      pagination: pagination1,
    })
    const pagination2 = Object.assign({}, this.option.pagination, {
      show: true,
    })
    const columns2 = [
      { prop: 'contractNo', label: '合同编号', type: 'text' },
      {
        prop: 'settleCycle',
        label: '结算周期',
        type: 'select',
        propInDict: 'settleCycle',
      },
      {
        prop: 'settleType',
        label: '账期类型',
        type: 'select',
        propInDict: 'customerSettleType',
      },
      {
        prop: 'settleBusinessTypeList_multiValue',
        label: '业务类型',
        type: 'text',
      },
      {
        prop: 'belongEmployeeName',
        label: '归属人',
        type: 'text',
      },
      {
        prop: 'status',
        label: '是否有效',
        type: 'select',
        propInDict: 'commonStatus',
      },
      {
        prop: 'timeType',
        label: '账期起始日类型',
        type: 'select',
        propInDict: 'settleInfoTimeType',
        width: 120,
      },
      {
        prop: 'signDateType',
        label: '签收日期类型',
        type: 'select',
        propInDict: 'signDateType',
        width: 120,
      },
      {
        prop: 'billDay',
        label: '账期起始日',
        type: 'text',
        width: 120,
        formatter: ({ cellValue, row }) => {
          const type = this.dictMapObj['settleInfoBillDayType'][
            row['billDayType']
          ]
          return type === '等于时间类型'
            ? this.dictMapObj['settleInfoTimeType'][row.timeType]
            : ['账单日期', '开票日期'].includes(type)
            ? cellValue != '0'
              ? `${type}后${cellValue}日`
              : `${type}`
            : row.lastDay || (cellValue === '31' && type === '当月')
            ? `${type}月底`
            : `${type}${cellValue}日`
        },
      },
      {
        prop: 'expireStatus',
        label: '到期状态',
        type: 'text',
        formatter: ({ cellValue }) => {
          const text = {
            unexpired: '未到期',
            expire: '到期',
          }
          return text[cellValue] || ''
        },
      },
      {
        prop: 'isRetainContainer',
        label: '是否需要后有柜',
        type: 'text',
        width: 140,
        formatter: ({ cellValue, row }) => {
          return cellValue === 'yes' ? '是' : '否'
        },
      },
      {
        prop: 'settleDaysDtoList',
        label: '账期信息',
        type: 'button',
        operationBtns: {
          data: [
            {
              label: '查看',
            },
          ],
          show: true,
          callback: (action, $index, row, option) => {
            this.showSettlement(row)
          },
        },
      },
      { prop: 'noEffectReason', label: '失效原因', type: 'select', propInDict: 'customerContractInvalidReason' },
      { prop: 'noEffectRemark', label: '失效备注', type: 'text' },
      { prop: 'createdName', label: '创建人', type: 'text' },
      { prop: 'createdTime', label: '创建时间', type: 'text' },
      { prop: 'updatedName', label: '失效人', type: 'text' },
      { prop: 'updatedTime', label: '失效时间', type: 'text' },
    ]
    this.option2 = Object.assign({}, this.option, {
      id: 'option2',
      data: [],
      tips: false,
      operationBtns: false,
      selection: this.isCts
        ? {
            show: true,
            fixed: true,
          }
        : false,
      columns: columns2,
      pagination: pagination2,
    })
    this.option3 = Object.assign({}, this.option, {
      id: 'option3',
      data: [],
      tips: false,
      operationBtns: false,
      selection: false,
      columns: [
        {
          prop: 'settlementDaysType',
          label: '结款类型',
          type: 'select',
          propInDict: 'settlementDaysType',
        },
        {
          prop: 'settlementDays',
          label: '结款时间',
        },
        {
          prop: 'settleLineList',
          label: '航线',
          formatter: ({cellValue}) => {
            return Array.from(new Set(cellValue.map(item => item.sysLineCname))).join('，')
          }
        },
        {
          prop: 'advanceDays',
          label: '最长垫付天数',
        },
        {
          prop: 'graceDays',
          label: '宽限天数',
        },
        {
          prop: 'rateType',
          label: '利率类型',
          type: 'select',
          propInDict: 'settleInfoRateType',
        },
        {
          prop: 'overdueRate',
          label: '滞纳金比例',
        },
        { prop: 'remark', label: '备注'}
      ],
      pagination: false,
    })
  },
  activated() {
    // if (this.custid !== this.oldCustid) {
    //   this.oldCustid = this.custid // 保存上一次id，用来判断是否清空数据
    //   this.showHistory = false
    //   this.showInfo = false
    //   this.copyData = {}
    // }
    this.showAdd = false
    this.getData('effect', this.option1)
    if (this.showHistory) {
      this.getData('no_effect', this.option2)
    }
  },
  methods: {
    // 查看账期
    showSettlement (row) {
      this.option3.data = row.settleDaysDtoList
      this.settleOption.show = true
    },
    // 显示关分公司、联公司
    showCompany (row, type) {
      let data = type === 1 ? row.settleCompanyList : row.settleRelCustList
      this.dialogOption.source = data.map(ele => ele.companyName || ele.relCustName)
      this.dialogOption.title = type === 1 ? '我司分公司' : '共享公司'
      this.dialogOption.show = true
    },
    // 获取合同信息
    getData(status, option) {
      this.lsLoading = true
      const data = {
        currPage: option.pagination.currPage,
        pageSize: option.pagination.pageSize,
        custid: this.custid,
        status
      }
      custSettleList(data)
        .then((res) => {
          if (res.code === 0) {
            option.data = res.data.list.map((item) => {
              let {settleBusinessTypeList} = item
              const settleBusinessTypeList_multiValue = settleBusinessTypeList
              .map(ele => this.dictMapObj['baseBusinessType'][ele.businessType])
              .join('，')
              return Object.assign({}, item, {
                settleBusinessTypeList_multiValue,
              })
            })
            if (option === this.option2) {
              this.showHistory = true
            }
            option.pagination.currPage = res.data.currPage
            option.pagination.pageSize = res.data.pageSize
            option.pagination.totalCount = res.data.totalCount
          }
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
     // 合同详情
    goDetail(row) {
      this.infoData = row
      this.showInfo = true
    },
    // 合同详情返回
    hideContractInfo() {
      this.showInfo = false
    },
    // 复制合同
    copyContract(type) {
      const source =
        type === 'option1' ? this.multipleSelection1 : this.multipleSelection2
      const len = source.length
      if (!len) {
        return this.$msgErrClose('请选择需要复制的合同信息!')
      }
      if (len !== 1) {
        return this.$msgErrClose('一次只能复制一条合同信息!')
      }
      this.copyData = JSON.parse(JSON.stringify(source[0]))
      this.showAdd = true
    },
    // 失效合同信息
    disableContract() {
      const len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose('请先选择要失效的数据!')
      }
      if (len !== 1) {
        return this.$msgErrClose('一次只能选择一条数据就行该操作!')
      }
      const source = this.multipleSelection1[0]
      const { custid, status } = source
      if (status === 'no_effect') {
        return this.$msgErrClose('失效结算信息,请勿重复操作')
      }
      if (custid !== Number(this.custid)) {
        return this.$msgErrClose('对不起，不能失效关联的结算信息')
      }
      this.disabledDialog.show = true
    },
    // 失效合同接口
    setContractStatus(tag) {
      if (!tag) {
        return this.disabledDialog.show = false
      }
      const { settleInfoId } = this.multipleSelection1[0]
      let { noEffectReason, noEffectRemark } = this.disabledDialog.form
      const data = {
        settleInfoId,
        noEffectReason,
        noEffectRemark,
        custid:this.custid
      }
      custSettleInvalid(data)
        .then((res) => {
          if (res.code === 0) {
            this.disabledDialog.show = false
            this.getData('effect', this.option1)
            this.$msgSucClose('失效结算信息成功')
          }
        })
        .catch(() => {})
    },
    // 新增合同
    addContract() {
      this.showAdd = true
    },
    // 查看历史合同
    showHistoryFn() {
      this.getData('no_effect', this.option2)
    },
    // 历史合同返回
    backHistory() {
      this.showHistory = false
    },
    // 新增返回按钮
    hideShowAdd() {
      this.showAdd = false
      this.copyData = {}
      this.multipleSelection1 = []
      this.multipleSelection2 = []
    },
    // 新增提交
    submitAddContract(data) {
      this.lsLoading = true
      custSettleSave(data)
        .then((res) => {
          if (res.code === 0) {
            this.hideShowAdd()
            this.getData('effect', this.option1)
            this.$msgSucClose('新增合同信息成功')
            if (this.showHistory) {
              this.showHistory = false
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
    // 选择表格
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
    },
    // 切换分页信息
    handleSizeChange(val, option) {
      option.pagination.pageSize = val
      let status = 'effect'
      if (option === this.option2) {
        status = 'no_effect'
      }
      this.getData(status, option)
    },
    // 切换分页信息
    handleCurrentChange(val, option) {
      option.pagination.currPage = val
      let status = 'effect'
      if (option === this.option2) {
        status = 'no_effect'
      }
      this.getData(status, option)
    },
    //调用财务的按钮，更新客户账单
    updateAccount(){
      this.updateLoading = true
      updateAccount({orgId:Number(this.orgid)})
        .then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('更新成功')
          }
        })
        .finally(() => {
          this.updateLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.contract-box {
  .but-box {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    margin: 5px 0;
    .left-but {
      margin-left: 8px;
      display: flex;
      align-items: center;
      .title {
        font-weight: 600;
        font-size: 14px;
        margin-right: 10px;
      }
    }
    .right-but {
      flex: 1;
      text-align: right;
    }
  }
}
.company-list{
    .item{
      border-bottom: 1px solid #eee;
      line-height: 25px;
    }
  }
.no-data{
  text-align: center;
  font-size: 12px;
  color: #999;
}
</style>
