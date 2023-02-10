<template>
  <div
    class="guarantee-cnt"
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    v-loading="lsLoading"
  >
    <div class="btn-box" v-show="isCts && !isBlacklist">
      <el-button-group>
        <el-button type="primary" size="mini" @click="add">新增</el-button>
      </el-button-group>
      <el-button-group>
        <el-button type="warning" size="mini" @click="copy">复制</el-button>
      </el-button-group>
      <el-button-group>
        <el-button type="danger" size="mini" @click="invalid">失效</el-button>
      </el-button-group>
    </div>
    <div class="tab-box">
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <AddGuarantee
      v-if="addOption.show"
      :config="addOption"
      @cancel="cancelAdd"
      @submit="submitAdd"
      :isCts="isCts"
      :custid="custid"
    />
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import AddGuarantee from './guaranteeAdd.vue'
import { mapGetters } from 'vuex'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { list, detail, addOrUpdate, setStatus } from '@/api/crm/guarantee'
export default {
  name: 'CUSTr',
  label: '保函信息',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    AddGuarantee,
  },
  props: ['orgid', 'custid', 'isSelf', 'isSupplier','isBlacklist'],
  data() {
    return {
      lsLoading: false,
      option1: {},
      multipleSelection1: [],
      addOption: {
        isEdit: false,
        show: false,
        form: {},
      },
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    isCts() {
      let roles = this.$store.state.user.roles || []
      return roles.includes('cts') || roles.includes('audit')
    },
  },
  created() {
    const pagination1 = Object.assign({}, this.option.pagination, {
      show: true,
    })
    const columns1 = [
      {
        prop: 'guaranteeType',
        label: '保函类型',
        type: 'select',
        propInDict: 'custGuaranteeType',
        hasTag: true,
        width: 150,
      },
      {
        prop: 'guaranteeNo',
        label: '保函信息编号',
        type: 'text',
        width: 130,
      },
      {
        prop: 'guaranteeBusinessTypeList_multiValue',
        label: '业务类型',
        type: 'text',
        width: 150,
      },
      {
        prop: 'status',
        label: '是否有效',
        type: 'select',
        propInDict: 'commonStatus',
      },
      { prop: 'effectStartDate', label: '签订时间', type: 'text' },
      {
        prop: 'effectEndDate',
        label: '到期时间',
        type: 'text',
        formatter: ({ cellValue, row }) => {
          return cellValue === '9999-12-31' ? '长期有效' : cellValue
        },
      },
      {
        prop: 'remainDays',
        label: '到期提醒',
        type: 'text',
        specialCellClassName: 'red-color-container-fin',
        formatter: ({ cellValue, row }) => {
          return cellValue > 0
            ? `还剩${cellValue}天`
            : cellValue === 0
            ? '今天到期'
            : row.effectEndDate === '9999-12-31'
            ? '--'
            : '已到期'
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
        prop: 'fileName',
        label: '附件',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, index, row) => {
            this.handleView(row)
          },
        },
        width: 150,
      },
      { prop: 'remark', label: '备注', type: 'text', width: 150 },
      { prop: 'custodianEmployeeName', label: '保管人', type: 'text' },
      {
        prop: 'createdName',
        label: '上传人',
        type: 'text'
      },
      {
        prop: 'createdTime',
        label: '上传时间',
        type: 'text'
      },
      { prop: 'belongEmployeeName', label: '归属人', type: 'text' },
    ]
    let operationBtns = {
      fixed: 'right',
      width: '120px',
      show: true,
      data: [
        {
          label: '详情',
          type: 'text',
          // showFn: (row) => row.status !== 'no_effect',
          show: true,
          action: 'Edit',
        },
      ],
      callback: (action, $index, row, item) => {
        if (action === 'Edit') {
          this.handleEdit(row)
        }
      },
    }
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: false,
      operationBtns,
      selection: this.isCts
        ? {
            show: true,
            fixed: true,
          }
        : false,
      columns: columns1,
      pagination: pagination1,
    })
  },
  methods: {
    // 获取数据
    getData() {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [
          {
            column: 'custid',
            type: 'eq',
            value: this.custid,
          },
          {
            column: 'status',
            type: 'eq',
            value: '',
          },
        ],
        custid: this.custid,
      }
      list(data)
        .then((res) => {
          if (res.code === 0) {
            let { list } = res.data
            this.option1.data = list.map((item) => {
              let guaranteeBusinessTypeList_multiValue = item.guaranteeBusinessTypeList.map(
                (ele) => {
                  return this.dictMapObj['baseBusinessType'][ele.businessType]
                },
              )
              if (item.status === 'no_effect') {
                item._isInvalid = true
                item._tagArr = [{ type: 'invalid', text: '失' }]
              }
              return Object.assign({}, item, {
                guaranteeBusinessTypeList_multiValue,
              })
            })
            this.option1.pagination.currPage = res.data.currPage
            this.option1.pagination.pageSize = res.data.pageSize
            this.option1.pagination.totalCount = res.data.totalCount
          }
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
    // 表格选择
    sendMulti(data) {
      this.multipleSelection1 = data
    },
    // 预览附件
    handleView(row) {
      let { fileNo, suffix, fileName } = row
      fileName = fileName.includes('.') ? fileName : `${fileName}.${suffix}`
      fileName = fileName.replace(/[\[|\]|\{|\}|\%|`]/g,'')
      const href = `/base/fileView/preview/${fileNo}/${fileName}`
      window.open(href)
    },
    // 分页页面数量改变
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页改变当前页
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 新增保函
    add() {
      this.addOption.isEdit = false
      this.addOption.show = true
    },
    // 复制保函
    copy() {
      let source = this.multipleSelection1
      if (source.length < 1) {
        return this.$msgErrClose('请选择一条保函进行复制')
      }
      if (source.length > 1) {
        return this.$msgErrClose('只能选择一条保函进行复制')
      }
      let { guaranteeId } = source[0]
      let data = {
        guaranteeId,
        custid: this.custid,
      }
      detail(data)
        .then((res) => {
          if (res.code === 0) {
            this.addOption.form = Object.assign(this.addOption.form, res.data)
            this.addOption.isEdit = false
            this.addOption.show = true
          }
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
    // 失效保函
    invalid() {
      let source = this.multipleSelection1
      if (!source.length) {
        return this.$msgErrClose('请先选择保函再进行失效操作')
      }
      if (source.length > 1) {
        return this.$msgErrClose('一次只能失效一条保函信息')
      }
      if (source[0].status === 'no_effect') {
        return this.$msgErrClose('该保函信息已经失效，请勿重复失效')
      }
      this.$confirmWarn('确认失效所选保函吗？', () => this.invalidFn())
    },
    invalidFn() {
      let source = this.multipleSelection1[0]
      let { guaranteeId } = source
      let data = {
        guaranteeId,
        status: 'no_effect',
        custid:this.custid
      }
      setStatus(data)
        .then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('保函信息失效成功')
            this.getData()
          }
        })
        .catch(() => {})
    },
    // 编辑保函
    handleEdit(row) {
      this.lsLoading = true
      let { guaranteeId } = row
      let data = {
        guaranteeId,
      }
      detail(data)
        .then((res) => {
          if (res.code === 0) {
            this.addOption.form = Object.assign(this.addOption.form, res.data)
            this.addOption.isEdit = true
            this.addOption.show = true
          }
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
    // 取消新增
    cancelAdd() {
      this.addOption.show = false
      this.addOption.form = {}
    },
    // 提交表单
    submitAdd(source) {
      this.lsLoading = true
      let { isEdit } = this.addOption
      let {
        guaranteeId,
        guaranteeType,
        guaranteeNo,
        effectStartDate,
        effectEndDate,
        fileNo,
        fileName,
        custodianEmployeeId,
        belongEmployeeId,
        remark,
        guaranteeBusinessTypeList,
        guaranteeCompanyList,
      } = source
      let data = {
        guaranteeId: isEdit ? guaranteeId : '',
        custid: this.custid,
        guaranteeType,
        guaranteeNo,
        effectStartDate,
        effectEndDate,
        fileNo,
        fileName,
        custodianEmployeeId: custodianEmployeeId.employeeId,
        custodianEmployeeName: custodianEmployeeId.cname,
        belongEmployeeId: belongEmployeeId.bdEmployeeId,
        belongEmployeeName: belongEmployeeId.bdEmployeeName,
        remark,
        guaranteeBusinessTypeList,
        guaranteeCompanyList,
      }
      addOrUpdate(data)
        .then((res) => {
          if (res.code === 0) {
            this.cancelAdd()
            this.$msgSucClose(`${isEdit ? '编辑' : '新增'}保函成功`)
            this.getData()
          }
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
  },
  activated() {
    this.getData()
  },
}
</script>

<style lang="scss" scoped>
.guarantee-cnt {
  padding: 8px;
}
</style>
