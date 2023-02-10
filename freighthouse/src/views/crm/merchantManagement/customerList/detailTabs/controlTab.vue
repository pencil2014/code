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
            <div class="left-but" v-if="isCts && !isPotentialOrigin &&!isBlacklist">
              <el-button-group>
                <el-button @click="addContract" size="mini" type="primary">
                  新增信控信息
                </el-button>
              </el-button-group>
              <el-button-group>
                <el-button
                  @click="copyContract('option1')"
                  size="mini"
                  type="warning"
                >
                  复制信控信息
                </el-button>
              </el-button-group>
              <el-button-group>
                <el-button @click="disableContract" size="mini" type="danger">
                  失效
                </el-button>
              </el-button-group>
            </div>
            <div class="right-but">
              <el-button-group>
                <el-button @click="showHistoryFn" size="mini">
                  历史信控信息
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
            <div class="title">历史信控信息</div>
          </div>
          <div class="right-but">
            <el-button-group v-if="isCts && !isPotentialOrigin">
              <el-button
                @click="copyContract('option2')"
                size="mini"
                type="primary"
              >
                复制信控信息
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
        <ControlAdd
          :custid="custid"
          :dataSource="copyData"
          :OPEmployeeList="OPEmployeeList"
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
    <CrmDialog ref="disabled" :option="disabledDialog" @close="setContractStatus" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import {creditAccountList,creditAccountSave,creditAccountInvalid} from '@/api/crm/control'
import CrmDialog from '@/views/crm/components/crmDialog'
import ControlAdd from './controlAdd'
export default {
  name: 'CUSTd',
  label: '信控信息',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    ControlAdd,
    CrmDialog
  },
  props: ['custid', 'isPotentialOrigin','isBlacklist','OPEmployeeList'],
  data() {
    return {
      lsLoading: false,
      option1: {},
      option2: {},
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
        title: '信控信息失效',
        text: '失效',
        formItems: [
          { label: '失效原因', type: 'select', prop: 'noEffectReason', propInDict: 'customerContractInvalidReason',rules: { required: true, message: ' ' }},
          { label: '备注', type: 'textarea', prop: 'noEffectRemark', maxlength: 500},
        ],
        form: { noEffectReason: '', noEffectRemark: ''},
      }
    }
  },
  created() {
    this.oldCustid = this.custid // 保存上一次id，用来判断是否清空数据
    const columns1 = [
      { prop: 'contractNo', label: '合同编号', type: 'text' },
      {
        prop: 'businessType_text',
        label: '业务类型',
        type: 'text',
        width: 100
      },
      {
        prop: 'deductionScene',
        label: '使用场景',
        type: 'select',
        propInDict: 'recvPayStatType'
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
        propInDict: 'commonStatus'
      },
      {
        label: '我司分公司',
        prop: 'creditAccountCompanyList',
        type: 'button',
        operationBtns: {
          show: true,
          data: [{ label: '查看' }],
          callback: (action, index, row) => {
            this.showCompany(row,1)
          },
        },
      },
      {
        label: '共享公司',
        prop: 'creditAccountRelCustList',
        type: 'button',
        operationBtns: {
          show: true,
          data: [{ label: '查看' }],
          callback: (action, index, row) => {
            this.showCompany(row,2)
          },
        },
      },
      { prop: 'currency', label: '币种', type: 'text' },
      { prop: 'creditQuota', label: '合同额度', type: 'text' },
      { prop: 'innerQuota', label: '内部额度', type: 'text' },
      {
        prop: 'innerBalance',
        label: '剩余额度',
        type: 'text'
      },
      {
        prop: 'iqStartDate',
        label: '内部额度有效时间',
        type: 'text',
        width: 160,
        formatter: ({ cellValue, row }) => {
          return row.iqEndDate === '9999-12-31'
            ? '永久有效'
            : `${cellValue} - ${row.iqEndDate}`
        }
      },
      {
        prop: 'cqStartDate',
        label: '合同额度有效时间',
        type: 'text',
        width: 160,
        formatter: ({ cellValue, row }) => {
          return row.effectEndDate === '9999-12-31'
            ? '永久有效'
            : `${cellValue} - ${row.cqEndDate}`
        }
      }
    ]
    const columns2 = [
      { prop: 'contractNo', label: '合同编号', type: 'text' },
      {
        prop: 'businessType_text',
        label: '业务类型',
        type: 'text',
        width: 100
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
        propInDict: 'commonStatus'
      },
      {
      prop: 'noEffectReason',
      label: '失效原因',
      type: 'select',
      propInDict: 'customerContractInvalidReason'
      },
      {
        prop: 'noEffectRemark',
        label: '失效备注',
      },
      { prop: 'currency', label: '币种', type: 'text' },
      { prop: 'creditQuota', label: '合同额度', type: 'text' },
      { prop: 'innerQuota', label: '内部额度', type: 'text' },
      {
        prop: 'iqStartDate',
        label: '内部额度有效时间',
        type: 'text',
        width: 160,
        formatter: ({ cellValue, row }) => {
          return row.iqEndDate === '9999-12-31'
            ? '永久有效'
            : `${cellValue} - ${row.iqEndDate}`
        }
      },
      {
        prop: 'cqStartDate',
        label: '合同额度有效时间',
        type: 'text',
        width: 160,
        formatter: ({ cellValue, row }) => {
          return row.effectEndDate === '9999-12-31'
            ? '永久有效'
            : `${cellValue} - ${row.cqEndDate}`
        }
      },
      { prop: 'createdName', label: '创建人', type: 'text' },
      { prop: 'createdTime', label: '创建时间', type: 'text' },
      { prop: 'updatedName', label: '失效人', type: 'text' },
      { prop: 'updatedTime', label: '失效时间', type: 'text' }
    ]
    const pagination1 = Object.assign({}, this.option.pagination, {
      show: true
    })
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
      pagination: pagination1,
      columns: columns1
    })
    const pagination2 = Object.assign({}, this.option.pagination, {
      show: true
    })
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
      pagination: pagination2,
      columns: columns2
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
    // 显示关分公司、联公司
    showCompany (row, type) {
      let data = type === 1 ? row.creditAccountCompanyList : row.creditAccountRelCustList
      this.dialogOption.source = data.map(ele => ele.companyName || ele.relCustName)
      this.dialogOption.title = type === 1 ? '我司分公司' : '共享公司'
      this.dialogOption.show = true
    },
    // 获取信控信息
    getData(status, option) {
      this.lsLoading = true
      const data = {
        currPage: option.pagination.currPage,
        pageSize: option.pagination.pageSize,
        custid: this.custid,
        status
      }
      creditAccountList(data)
        .then(res => {
          if (res.code === 0) {
            const data = res.data.list
            option.data = data.map(item => {
              const businessType_text = item.creditAccountBusinessList
              .map(ele => this.dictMapObj['baseBusinessType'][ele.businessType])
              .join('，')
              return Object.assign({}, item, {
                businessType_text
              })
            })
            if (option === this.option2) {
              this.showHistory = true
            }
            option.data.pagination.currPage = res.data.currPage
            option.data.pagination.pageSize = res.data.pageSize
            option.data.pagination.totalCount = res.data.totalCount
          }
        })
        .catch(() => {})
        .finally(() => (this.lsLoading = false))
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
        return this.$msgErrClose('请选择需要复制的信控信息!')
      }
      if (len !== 1) {
        return this.$msgErrClose('一次只能复制一条信控同信息!')
      }
      this.copyData = source[0]
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
        return this.$msgErrClose('失效信控信息,请勿重复操作')
      }
      if (custid !== Number(this.custid)) {
        return this.$msgErrClose('对不起，不能失效关联的信控信息')
      }
      this.disabledDialog.show = true
    },
    // 失效合同接口
    setContractStatus(tag) {
      if (!tag) {
        return this.disabledDialog.show = false
      }
      const { creditAccountId } = this.multipleSelection1[0]
      let { noEffectReason, noEffectRemark } = this.disabledDialog.form
      const data = {
        creditAccountId,
        noEffectReason,
        noEffectRemark,
        custid:this.custid
      }
      creditAccountInvalid(data)
        .then((res) => {
          if (res.code === 0) {
            this.disabledDialog.show = false
            this.getData('effect', this.option1)
            this.$msgSucClose('失效信控信息成功')
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
      creditAccountSave(data)
        .then((res) => {
          if (res.code === 0) {
            this.hideShowAdd()
            this.getData('effect', this.option1)
            this.$msgSucClose('新增信控信息成功')
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
    // 业务类型下拉
    getBusinessType() {
      this.businessTypeOptions = this.dictMap['baseBusinessType'] || []
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
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    isCts() {
      return (this.$store.state.user.roles || []).includes('cts')
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
