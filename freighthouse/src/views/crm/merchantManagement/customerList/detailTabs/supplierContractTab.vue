<template>
  <div
    class="supplier-contract"
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    v-loading="lsLoading"
  >
    <div class="contract-box">
      <div class="contract-list" v-if="!showHistory && !showAdd && !showInfo">
        <div class="list-cnt">
          <div class="but-box">
                    <!-- 船司暂无 -->
            <div class="left-but" v-if="isSps && !isPotentialOrigin && !isShipC">
              <el-button-group>
                <el-button @click="addContract" size="mini" type="primary"
                  >新增合同</el-button
                >
              </el-button-group>
              <el-button-group>
                <el-button
                  @click="copyContract('option1')"
                  size="mini"
                  type="warning"
                  >复制合同</el-button
                >
              </el-button-group>
              <el-button-group>
                <el-button @click="disableContract" size="mini" type="danger"
                  >失效</el-button
                >
              </el-button-group>
            </div>
            <div class="right-but">
              <el-button-group>
                <el-button @click="showHistoryFn" size="mini"
                  >历史合同</el-button
                >
              </el-button-group>
            </div>
          </div>
          <FinanceTableMass :option="option1" @send-multi="sendMulti" />
        </div>
      </div>
      <div class="contract-history" v-if="showHistory && !showInfo && !showAdd">
        <div class="but-box">
          <div class="left-but">
            <div class="title">历史合同</div>
          </div>
          <div class="right-but">
            <el-button-group v-if="isSps && !isPotentialOrigin">
              <el-button
                @click="copyContract('option2')"
                size="mini"
                type="primary"
                >复制合同</el-button
              >
            </el-button-group>
            <el-button-group>
              <el-button @click="backHistory" size="mini">返回</el-button>
            </el-button-group>
          </div>
        </div>
        <FinanceTableMass :option="option2" @send-multi="sendMulti" />
      </div>
      <div class="contract-add" v-if="showAdd">
        <ContractAdd
          :custid="custid"
          :dataSource="copyData"
          @cancle="hideShowAdd"
          @submit="submitAddContract"
        />
      </div>
      <div class="contract-info" v-if="showInfo">
        <ContractInfo
          :custid="custid"
          :infoData="infoData"
          @cancel="hideContractInfo"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import ContractAdd from './supplierContractAdd'
import ContractInfo from './supplierContractInfo'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import {
  supContractList,
  supContractInvalid,
  supContractSave,
  shipcContractList,
  shipcContractInvalid
} from '@/api/crm/contract'
export default {
  name: 'CUSTb',
  label: '合同信息',
  mixins: [mixin, routerMixin],
  supplierShow: true,
  customerHide: true,
  shipperShow: true,
  props: ['custid', 'orgid', 'isPotentialOrigin','isShipC'],
  components: {
    FinanceTableMass,
    ContractAdd,
    ContractInfo
  },
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
      businessTypeOptions: []
    }
  },
  created() {
    this.oldCustid = this.custid // 保存上一次id，用来判断是否清空数据
    this.getBusinessType()
    const columns1 = [
      {
        prop: 'contractCode',
        label: '合同信息编号',
        type: 'button',
        width: 150,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option, subItem) => {
            this.goDetail(row)
          }
        }
      },
      {
        prop: 'contractNo',
        label: '合同编号',
        type: 'text',
        width: 150,
        // operationBtns: {
        //   show: true,
        //   callback: (fn, index, row, option, subItem) => {
        //     this.goDetail(row)
        //   }
        // }
      },
      {
        prop: 'contractType',
        label: '合同类型',
        type: 'select',
        propInDict: 'supplierContractTypes',
        width: 100
      },
      {
        prop: 'contractSignType',
        label: '合同签署类型',
        type: 'select',
        propInDict: 'supplierContractSignType',
        width: 100
      },
      {
        prop: 'businessTypes',
        label: '业务类型',
        type: 'text',
        width: 200,
        formatter: ({ cellValue }) => {
          return cellValue
            .map((item) => {
              return this.dictMapObj['baseBusinessType'][item]
            })
            .join(', ')
        }
      },
      {
        prop: 'signEmployeeName',
        label: '签订人',
        type: 'text',
        width: 150
      },
      {
        prop: 'isPayDeposit',
        label: '是否交押金',
        type: 'text',
        width: 150,
        formatter: ({ cellValue, row }) => {
          if (cellValue === 'yes') {
            return `是 (${row.depositAmount}${row.depositCurrency || ''})`
          } else {
            return '否'
          }
        }
      },
      {
        prop: 'status',
        label: '是否有效',
        type: 'select',
        propInDict: 'commonStatus',
        width: 100
      },
      {
        prop: 'settleCycle',
        label: '结算周期',
        type: 'select',
        propInDict: 'supplierContractSettleCycle',
        width: 100
      },
      {
        prop: 'creditAmountUsd',
        label: '信用额度-USD',
        type: 'text',
        width: 150
      },
      {
        prop: 'creditAmountCny',
        label: '信用额度-RMB',
        type: 'text',
        width: 150
      },
      { prop: 'effectBeginDate', label: '签订时间', type: 'text', width: 150 },
      {
        prop: 'effectEndDate',
        label: '到期时间',
        type: 'text',
        width: 150,
        formatter: ({ cellValue, row }) => {
          return cellValue === '9999-12-31' ? '长期有效' : cellValue
        }
      },
      {
        prop: 'expireNoticeTime',
        label: '到期提醒',
        type: 'text',
        width: 150,
        specialCellClassName: 'red-color-container-fin',
        formatter: ({ cellValue, row }) => {
          return cellValue > 0
            ? `还剩${cellValue}天`
            : cellValue === 0
              ? '今天到期'
              : row.effectEndDate === '9999-12-31'
                ? '--'
                : '已到期'
        }
      },
      {
        prop: 'expireStatus',
        label: '到期状态',
        type: 'text',
        width: 100,
        formatter: ({ cellValue }) => {
          const text = {
            no: '未到期',
            yes: '到期'
          }
          return text[cellValue] || ''
        }
      },
      {
        prop: 'files',
        label: '合同附件',
        type: 'columnTip',
        component: 'ColumnTip',
        width: 200,
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps, index, row) => {
            let { fileNo, fileName } = row.files[index]
            fileName = fileName.replace(/[\[|\]|\{|\}|\%|`]/g, '')
            const href = `/base/fileView/preview/${fileNo}/${fileName}`
            window.open(href)
          }
        }
      },
      { prop: 'remark', label: '备注', type: 'text', width: 200 },
      { prop: 'createdName', label: '创建人', type: 'text', width: 150 },
      { prop: 'createdTime', label: '创建时间', type: 'text', width: 150 }
    ]
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: false,
      operationBtns: false,
      selection: this.isSps
        ? {
          show: true,
          fixed: true
        }
        : false,
      columns: columns1,
      pagination: false
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2',
      data: [],
      tips: false,
      operationBtns: false,
      selection: this.isSps
        ? {
          show: true,
          fixed: true
        }
        : false,
      columns: columns1,
      pagination: false
    })
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    isSps() {
      return (this.$store.state.user.roles || []).includes('sps')
    },
    isManager() {
      return (this.$store.state.user.roles || []).includes('manager')
    }
  },
  activated() {
    if (this.custid !== this.oldCustid) {
      this.oldCustid = this.custid // 保存上一次id，用来判断是否清空数据
      this.showAdd = false
      this.showHistory = false
      this.showInfo = false
      this.copyData = {}
    }
    this.getData('effect', this.option1)
    if (this.showHistory) {
      this.getData('no_effect', this.option2)
    }
  },
  methods: {
    // 业务类型下拉
    getBusinessType() {
      this.businessTypeOptions = this.dictMap['baseBusinessType'] || []
    },
    // 获取合同信息
    getData(status, option) {
      this.lsLoading = true
      const data =!this.isShipC ? {
        supplierId: this.custid,
        status
      }:{
        shippingCarrierId: this.custid,
        status
      }
      const meth = this.isShipC?shipcContractList:supContractList
      meth(data)
        .then((res) => {
          if (res.code === 0) {
            option.data = res.data.map((item) => {
              return Object.assign(item, {
                files_multiValue: item.files.map((ele) => ele.fileName)
              })
            })
            if (option === this.option2) {
              this.showHistory = true
            }
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
      const { supplierId } = source
      if (supplierId !== this.custid) {
        return this.$msgErrClose('对不起，不能失效关联的合同信息')
      }
      this.$confirm('是否失效该合同信息?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.setContractStatus(source)
        })
        .catch(() => {})
    },
    // 失效合同接口
    setContractStatus(val) {
      const { contractId } = val
      const data = {
        contractId
      }
      const moth = this.isShipC?shipcContractInvalid:supContractInvalid 
      moth(data)
        .then((res) => {
          if (res.code === 0) {
            this.getData('effect', this.option1)
            this.$msgSucClose('失效合同信息成功')
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
      let contractNos = this.option1.data.map(item => item.contractNo)
      if (contractNos.includes(data.contractNo)) {
        return this.$msgErrClose('存在重复的合同编号，无法保存')
      }
      this.lsLoading = true
      data.supplierId = this.custid
      supContractSave(data)
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
    // 预览附件
    handleView(row, index) {
      const file = row.contractFileList[index]
      let { fileNo, suffix, fileName } = file
      fileName = fileName.includes('.') ? fileName : `${fileName}.${suffix}`
      fileName = fileName.replace(/[\[|\]|\{|\}|\%|`]/g, '')
      const href = `/base/fileView/preview/${fileNo}/${fileName}`
      window.open(href)
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
    margin: 10px 0 5px 0;
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
</style>
