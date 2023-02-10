<template>
  <div class="relation-page">
    <div class="btn-box" v-if="isSps && !isPotentialOrigin">
      <el-button type="primary" size="mini" @click="showRelation"
        >新增</el-button
      >
    </div>
    <FinanceTableMass :option="option1" :autoMax="true" />
    <EditRelation
      :options="dialogOption"
      :custid="custid"
      v-if="dialogOption.show"
      @close="closeDialog"
      @submit="submitDialog"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import EditRelation from './components/editRelation'
import { list, save, del } from '@/api/crm/supplierRelation'
export default {
  name: 'CUSTn',
  label: '供应商关系',
  mixins: [mixin],
  supplierShow: true,
  customerHide: true,
  props: ['custid', 'orgid', 'isPotentialOrigin', 'companyName'],
  components: {
    FinanceTableMass,
    EditRelation
  },
  data() {
    return {
      option1: {},
      dialogOption: {
        type: 'add',
        show: false,
        title: '新增平级关系',
        btnText: '新增',
        row: ''
      }
    }
  },
  created() {
    const columns1 = [
      { label: '公司名称', prop: 'showName', type: 'text' },
      {
        label: '关联类型',
        prop: 'relType',
        type: 'select',
        propInDict: 'supplierRelationType'
      },
      {
        prop: 'files',
        label: '附件',
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
      {
        label: '附件有效期',
        prop: 'time',
        type: 'text',
        formatter: ({ row }) => {
          const { fileEffectBeginDate, fileEffectEndDate } = row
          return fileEffectBeginDate
            ? `${fileEffectBeginDate} 至 ${fileEffectEndDate}`
            : ''
        }
      }
    ]
    const operationBtns1 = {
      data: [
        { label: '更新附件', type: 'text', show: true, action: 'Edit' },
        { label: '解绑', type: 'text', show: true, action: 'Delete' }
      ],
      fixed: 'right',
      show: true,
      callback: (action, $index, row, option) => {
        if (action === 'Edit') {
          this.dialogOption.type = 'edit'
          this.dialogOption.title = '更新附件'
          this.dialogOption.btnText = '更新'
          this.dialogOption.row = row
          this.dialogOption.show = true
        } else if (action === 'Delete') {
          this.dialogOption.type = 'del'
          this.dialogOption.title = '解除平级关系'
          this.dialogOption.btnText = '解除'
          this.dialogOption.row = row
          this.dialogOption.show = true
        }
      }
    }
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: false,
      operationBtns: this.isSps ? operationBtns1 : false,
      selection: false,
      columns: columns1,
      pagination: false
    })
  },
  activated() {
    this.getData()
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    isSps() {
      return (this.$store.state.user.roles || []).includes('sps')
    }
  },
  methods: {
    getData() {
      const data = {
        supplierId: this.custid
      }
      list(data)
        .then((res) => {
          if (res.code === 0) {
            this.option1.data =
              res.data.map((item) => {
                return Object.assign(item, {
                  files_multiValue: item.files.map((ele) => ele.fileName)
                })
              }) || []
          }
        })
        .catch(() => {})
    },
    showRelation() {
      this.dialogOption.type = 'add'
      this.dialogOption.title = '新增平级关系'
      this.dialogOption.btnText = '新增'
      this.dialogOption.show = true
    },
    submitDialog(data) {
      const { type } = this.dialogOption
      if (type === 'add') {
        const relSupplierIds = this.option1.data.map(
          (item) => item.relSupplierId
        )
        if (relSupplierIds.includes(data.relSupplierId)) {
          return this.$msgErrClose('关系中已存在此公司')
        }
        this.addRelation(data)
      } else if (type === 'edit') {
        this.addRelation(data)
      } else {
        this.delRelation(data)
      }
    },
    addRelation(source) {
      const { fileEffect, files } = source
      if (fileEffect?.length) {
        source.fileEffectBeginDate = fileEffect[0]
        source.fileEffectEndDate = fileEffect[1]
      }
      if (files.length) {
        const { fileEffectBeginDate, fileEffectEndDate } = source
        source.files = files.map((item) => {
          if (!item.fileEffectBeginDate) {
            return {
              ...item,
              fileEffectBeginDate,
              fileEffectEndDate
            }
          } else {
            return item
          }
        })
      }
      const data = Object.assign({}, source)
      if (this.dialogOption.type === 'add') {
        data.supplierId = this.custid
        data.supplierName = this.companyName
      }
      save(data)
        .then((res) => {
          if (res.code === 0) {
            this.closeDialog()
            this.getData()
            const text =
              this.dialogOption.type === 'add' ? '新增关系成功' : '更新附件成功'
            this.$msgSucClose(text)
          }
        })
        .catch(() => {})
    },
    delRelation(source) {
      del(source)
        .then((res) => {
          if (res.code === 0) {
            this.closeDialog()
            this.getData()
            this.$msgSucClose('解除平级关系成功')
          }
        })
        .catch(() => {})
    },
    closeDialog() {
      this.dialogOption.show = false
    }
  }
}
</script>

<style lang="scss" scoped>
.relation-page {
  .btn-box {
    margin: 8px 8px 0;
  }
}
</style>
