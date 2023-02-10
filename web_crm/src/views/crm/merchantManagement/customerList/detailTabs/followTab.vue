<template>
  <div class="info-page">
    <div class="info-title" :class="{'notSelf-hide':!custInfo.mtDate}">
      <div>
        <span v-if="custInfo&&custInfo.mtDate">认领未跟进释放时间：{{custInfo.mtDate}}</span>
      </div>
      <el-button class="notSelf-hide" size="mini" @click="showDialog('add')" type="primary">新增记录</el-button>
    </div>
    <FinanceTable :option="option1" />
    <!-- <CrmDialog ref="invalid" :option="invalidDialog" @close="closeDialog('invalid',$event)" /> -->
    <CrmDialog :multi="true" ref="add" :option="addDialog" @close="closeDialog('add',$event)" />
    <CrmDialog :multi="true" ref="edit" :option="editDialog" @close="closeDialog('edit',$event)" />
    <CrmDialogCarousel
      ref="carousel"
      :option="carouselDialog"
      @close="closeDialog('carousel',$event)"
    />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import CrmDialog from '@/views/crm/components/crmDialog'
import CrmDialogCarousel from '@/views/crm/components/crmDialogCarousel'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { baseFollowTable as columnsData, baseFollowForm as formDatas } from '@/views/crm/data'
import FOLLOW from '@/api/crm/orgCommunication'

let ruleMsg = { required: true, message: ' ', trigger: ['blur', 'change'] }
const FORM = {}
let formItems = formDatas.map((item) => {
  FORM[item.prop] = ''
  return { ...item, rules: item.r ? ruleMsg : {} }
})
FORM.attachments = []
FORM._fileNos = []
export default {
  name: 'CUSTg',
  supplierShow: true,
  customerHide: true,
  label: '跟进记录',
  mixins: [mixin],
  components: {
    FinanceTable,
    CrmDialog,
    CrmDialogCarousel,
  },
  props: ['custid', 'orgid', 'isLeader', 'isSupplier'],
  watch: {
    custid: {
      handler(custid) {
        if (!custid) return
        // watch 立即执行时，早于created钩子函数
        this.$nextTick(() => this.handleCurrentChange(1))
      },
      immediate: true,
    },
    isLeader: {
      handler(val) {
        this.$nextTick(() => this.initColumns(val))
      },
      immediate: true,
    },
  },
  computed: {
    custInfo() {
      // console.log(this.$store.state.crm.detailBaseInfo)
      return this.$store.state.crm.detailBaseInfo
    },
  },
  data() {
    let formDatas = JSON.parse(JSON.stringify(formItems))
    // if (this.isSupplier) {
    //   formDatas = formDatas.map((item) => {
    //     if (item.prop == 'orgContact') {
    //       return { ...item, label: '供应商联系人' }
    //     }
    //     if (item.prop == 'intention') {
    //       return { ...item, label: '供应商意愿' }
    //     }
    //     return item
    //   })
    // }
    let addForms = JSON.parse(JSON.stringify(formDatas))
    let editForms = [...JSON.parse(JSON.stringify(formDatas)), { prop: 'attachments', label: '历史附件', type: 'list' }]
    addForms[3].pickerOptions = editForms[3].pickerOptions = {
      disabledDate: (time) => time.getTime() > Date.now(),
    }
    return {
      option1: {},
      addDialog: {
        show: false,
        btnLoading: false,
        title: '新增跟进记录',
        showClear: true,
        text: '新增',
        formItems: addForms,
        form: { ...FORM },
      },
      editDialog: {
        show: false,
        btnLoading: false,
        title: '详情跟进记录',
        text: '保存',
        formItems: editForms,
        form: { ...FORM },
      },
      carouselDialog: {
        show: false,
        title: '查看关键截图',
        items: [],
      },
    }
  },
  // activated() {
  //   console.log(this.addDialog.formItems)
  // },
  created() {
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.option1 = { ...this.option, id: 'option1', pagination, operationBtns: false, selection: false }
    this.option1.style = { padding: '5px 0' }
    this.addDialog.formItems[this.editDialog.formItems.length - 2].rules.message = '必填'
    delete this.editDialog.formItems[this.editDialog.formItems.length - 2].rules
  },
  methods: {
    // 强制刷新某个列表页（仅涵盖列表页）
    refreshView(name) {
      this.jumpRouteFromToList.forEach((item) => {
        if (item.from.name === name) {
          item.from.meta.refresh = true
        }
      })
    },
    // 判断是否是管理者，设置显示的列（失效操作列）
    initColumns(isLeader) {
      let columns = [
        ...columnsData,
        {
          prop: 'fileNos',
          label: '关键截图',
          type: 'button',
          formatter: (val, row) => '查看',
          operationBtns: {
            show: true,
            callback: (action, index, row) => this.showDialog('carousel', row),
          },
        },
        { prop: 'bdEmployeeName', label: '跟进人' },
      ]
      let test = {
        prop: 'commuId',
        label: '操作',
        type: 'button',
        fixed: 'right',
        width: '80px',
        operationBtns: {
          style: { width: 'auto' },
          show: true,
          callback: (action, index, row) => this.handlerAction(action, index, row),
          data: [
            { label: '详情', action: 'detail' },
            { label: '删除', action: 'delete' },
          ],
        },
      }
      console.log(this.isSupplier)
      // if (this.isSupplier) {
      //   columns = columns.map((item) => {
      //     if (item.prop == 'orgContact') {
      //       return { ...item, label: '供应商联系人' }
      //     }
      //     if (item.prop == 'intention') {
      //       return { ...item, label: '供应商意愿' }
      //     }
      //     return item
      //   })
      // }
      this.option1.columns = isLeader ? [...columns] : [...columns, test]
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    getData() {
      this.$nextTick(() => {
        let data = {
          currPage: this.option1.pagination.currPage,
          pageSize: this.option1.pagination.pageSize,
          [this.isSupplier ? 'supplierId' : 'custid']: this.custid,
        }
        FOLLOW[`${this.isSupplier ? 'supplier' : 'customer'}List`](data).then((res) => {
          this.option1.data = res.data.list
          this.option1.pagination.currPage = res.data.currPage
          this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount
        })
      })
    },
    showDialog(type, row) {
      if (type == 'carousel') {
        return FOLLOW.screenshotView({ commuId: row.commuId }).then((res) => {
          if (!res.data.length) return this.$msgWarnClose('此记录无关键截图!')
          let  name = res.data[0].name.replace(/[\[|\]|\{|\}|\%|`]/g, '')
          const href = `/base/fileView/preview/${res.data[0].fileNo}/${name}`
          window.open(href)
          // this[type + 'Dialog'].items = res.data
          // this[type + 'Dialog'].show = true
        })
      }
      if (type == 'edit') {
        this[type + 'Dialog'].form = { ...this[type + 'Dialog'].form, ...row, _fileNos: [] }
      }
      this[type + 'Dialog'].show = true
      setTimeout(() => {
        this.addDialog.form.bdEmployeeName = this.$store.state.user.name
      }, 300)
    },
    closeDialog(type, tag) {
      if (!tag) return (this[type + 'Dialog'].show = false)
      let { attachments, _fileNos } = this[type + 'Dialog'].form
      if (!attachments.length && !_fileNos.length) return this.$msgErrClose('历史附件和截图至少有一条记录！')
      let fileNos = [...(_fileNos || []), ...(attachments || []).map((item) => item.fileNo)]
      let data = {
        orgid: this.orgid,
        fileNos,
        commuId: this[type + 'Dialog'].form.commuId,
        [this.isSupplier ? 'supplierId' : 'custid']: this.custid,
      }
      Object.keys(FORM).forEach((key) => (data[key] = this[type + 'Dialog'].form[key]))
      delete data._fileNos
      // let method = FOLLOW[type == 'add' ? 'addOrUpdateCustomerCommu' : 'customerInvalid']
      // method(data).then(() => {
      let str = this.isSupplier ? 'Supplier' : 'Customer'
      this[type + 'Dialog'].btnLoading = true
      FOLLOW[`addOrUpdate${str}Commu`](data)
        .then(() => {
          this[type + 'Dialog'].form = { ...FORM }
          let ref = this.$refs[type].$refs.form
          // ref.resetFields()
          this.$nextTick(() => ref.clearValidate())
          this.$nextTick(() => (this[type + 'Dialog'].show = false))
          // this.$msgSucClose(type == 'add' ? '跟进记录保存成功！' : '失效设置成功！')
          this.$msgSucClose('跟进记录保存成功！')
          this.getData()
          this.refreshView('FollowLog', 'from')
        })
        .finally(() => {
          this[type + 'Dialog'].btnLoading = false
        })
    },
    handlerAction(action, index, { commuId, orgid }) {
      let str = this.isSupplier ? 'supplier' : 'customer'
      let data = { commuId, orgid, [this.isSupplier ? 'supplierId' : 'custId']: this.custid }
      if (action === 'detail') {
        FOLLOW[`${str}Detail`](data).then((res) => this.showDialog('edit', res.data))
      } else {
        this.$confirmWarn('确定删除此记录吗？', () => {
          FOLLOW[`${str}DeleteCommun`](data).then((res) => {
            this.handleCurrentChange(1)
            this.$msgSucClose('删除成功！')
            this.refreshView('FollowLog', 'from')
          })
        })
      }
    },
  },
}
</script>
