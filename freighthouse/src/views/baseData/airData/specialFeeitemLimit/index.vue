<template>
  <div class="finance-page">
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div style="height:8px;background:#F8F9FD;"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button
              type="primary"
              class="finance-btn"
              size="mini"
              @click="showDialog('add')"
              icon="el-icon-circle-plus-outline"
            >新增角色配置</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="updateEnable('enable')">启用</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="updateEnable('forbid')">禁用</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
      <BaseDialog :option="editDialog" @close="dialogClose('edit', $event)" />
      <BaseDialog :option="addDialog" @close="dialogClose('add', $event)" />
      <TableDialog :options="tableDialog" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import BaseDialog from '@/views/baseData/commonData/taxRate/baseDialog'
import TableDialog from '@/views/baseData/commonData/taxRate/tableDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as mixin2 } from '@/views/finance/voucher/mixin'
import {
  specialLimitRolePageList, // 列表
  saveSpecialLimitRole, // 新增
  updateSpecialLimitRole, // 修改
  updateSpecialLimitRoleEnabled, // 启用、禁用
  querySpecialFeeItemList, // 专项管理费列表
  deleteSpecialLimitRole, // 删除
} from '@/api/fin/feeitem'

// import { specialLimitList, specialLimitSave, specialLimitDelete } from '@/api/baseData'
// import { specialFeeItemList } from '@/api/base'
import { roleSelectList } from '@/api/permission' // 角色名称列表
import { mapGetters } from 'vuex'

const specialFeeItemOptions = []
const roleOptionList = []
// 统一设置规则提醒
const ruleMsg = [{ required: true, message: '请填写内容', trigger: 'blur' }]
// 统一设置弹框内表单字段 r表示需要rules d表示需要disabled
const formItem = [
  { label: '角色名称', type: 'select', prop: 'roleCode', r: true, d: true, selectOptions: roleOptionList, filterable: true },
  {
    label: '不可显示的专项管理费',
    type: 'select',
    prop: 'feeCodes',
    selectOptions: specialFeeItemOptions,
    r: true,
    multiple: true,
    filterable: true,
  },
  { label: '是否启用', type: 'radio', prop: 'enabled', r: true },
]
const formData = {}
formItem.forEach((item) => (formData[item.prop] = ''))

export default {
  name: 'specialLimitList',
  mixins: [mixin, mixin2],
  components: {
    FinanceTable,
    FinanceSearch,
    BaseDialog,
    TableDialog,
  },
  data() {
    // 深拷贝弹框内容，并设置需要rules，disabled的地方
    let addDialogItems = []
    let editDialogItems = []
    formItem.forEach((item) => {
      console.log(item.d)
      addDialogItems.push(item.r ? { ...item, rules: ruleMsg } : { ...item })
      editDialogItems.push(item.d ? { ...item, disabled: true } : item.r ? { ...item, rules: ruleMsg } : { ...item })
    })
    return {
      // 列表页--表格配置
      tableOption: {},
      // 列表页--搜索配置
      searchOption: {},
      // 列表页--选中行
      multipleSelection: [],
      tableDialog: {
        show: false,
        data: [],
        title: '不可查看费用项',
      },
      addDialog: {
        show: false,
        title: '新增角色配置',
        formItems: [...addDialogItems],
        form: { ...formData },
        labelWidth: '160px',
        padding: '10px',
      },
      editDialog: {
        show: false,
        title: '修改角色配置',
        formItems: [...editDialogItems],
        form: { ...formData },
        labelWidth: '160px',
        padding: '10px',
      },
      feeItems: [],
      roleOptionList: roleOptionList,
      specialFeeItemOptions: specialFeeItemOptions,
      specialFeeItemCfg: [],
    }
  },
  async created() {
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.tableOption = { ...this.option, id: 'tableOption', pagination }
    this.tableOption.operationBtns.data = [
      {
        label: '修改',
        type: 'text',
        show: true,
        action: 'Edit',
      },
      {
        label: '删除',
        type: 'text',
        show: true,
        action: 'Delete',
      },
    ]
    this.tableOption.operationBtns.width = '100px'
    this.tableOption.columns = [
      {
        label: '角色名称',
        prop: 'roleName',
        type: 'text',
      },
      {
        label: '不可查看费用项',
        prop: 'feeItems',
        // type: 'tooltip',
        type: 'button',
        operationBtns: {
          show: true,
          data: [{ label: '查看' }],
          callback: (action, index, row) => {
            row.d_name = '费用项名称'
            row.d_content = row.feeItems
            this.tableDialog.data.splice(0, 1, row)
            this.tableDialog.show = true
          },
        },
      },
      {
        label: '是否启用',
        prop: 'enabled',
        type: 'select',
        propInDict: 'yesNo',
      },
    ]
    // 初始化数据
    let p1 = roleSelectList({ state: 'valid' })
    let p2 = querySpecialFeeItemList({})
    await Promise.all([p1, p2]).then(([res1, res2]) => {
      this.roleOptionList.splice(0, 10000, ...res1.data.map((item) => ({ label: item.roleName, value: item.roleCode })))
      this.specialFeeItemOptions.splice(
        0,
        10000,
        ...res2.data.map(({ feeName, feeCode }) => {
          this.specialFeeItemCfg[feeCode] = feeName
          return { label: feeName, value: feeCode }
        })
      )
    })
    // 搜索配置
    this.searchOption = {
      columns: [
        {
          label: '角色名称',
          prop: 'roleCode',
          type: 'select',
          selectOptions: this.roleOptionList,
          filterable: true,
        },
        {
          label: '专项管理费',
          prop: 'feeCodes',
          type: 'select',
          multiple: true,
          selectOptions: this.specialFeeItemOptions,
        },
        {
          label: '是否启用',
          prop: 'enabled',
          type: 'select',
          propInDict: 'yesNo',
        },
      ],
      data: {
        roleCode: '',
        feeCodes: '',
        enabled: 'yes',
      },
    }
    this.getData()
  },
  methods: {
    // 启用、禁用
    updateEnable(type) {
      if (!this.multipleSelection.length) {
        return this.$message({
          message: '请勾选需要操作的项！',
          type: 'error',
          showClose: true,
        })
      }
      let isEnable = type === 'enable'
      this.$confirm(`您是否确认${isEnable ? '启用' : '禁用'}该角色配置？`, '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then((res) => {
          if (res) {
            let roleCodes = this.multipleSelection.map((item) => item.roleCode)
            updateSpecialLimitRoleEnabled({ roleCodes, enabled: isEnable ? 'yes' : 'no' }).then((res) => {
              this.$message({
                message: `${isEnable ? '启用' : '禁用'}成功`,
                type: 'success',
                showClose: true,
              })
              this.getData()
            })
          }
        })
        .catch(console.log)
    },
    // 新增add | 编辑edit 弹框
    showDialog(type) {
      this[type + 'Dialog'].show = true
      this.$nextTick(() => this.addDialog.form.enabled = 'yes')
      console.log(this[type + 'Dialog'])
    },
    handleEdit(row) {
      if (!row.enabled) {
        row.enabled = 'yes'
      }
      this.editDialog.form = { ...row }
      this.showDialog('edit')
    },
    handleDelete(index, row, option) {
      this.$confirm('您是否确认删除该税率配置记录？', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then((res) => {
          if (res) {
            deleteSpecialLimitRole({ roleCode: row.roleCode }).then((res) => {
              this.$message.success('删除成功！')
              this.getData()
            })
          }
        })
        .catch(() => {})
    },
    dialogClose(type, params) {
      let isAdd = type === 'add'
      type += 'Dialog'
      if (params === true) {
        // 转换请求参数后 请求
        let method = isAdd ? saveSpecialLimitRole : updateSpecialLimitRole
        method(this.convertReq(this[type]))
          .then((res) => {
            isAdd && this.clearAddDialog(this[type])
            this.$message.success(type === 'editDialog' ? '修改成功！' : '添加成功！')
            this.getData()
          })
          .catch(console.log)
      }
      this[type].show = false
    },
    // 封装请求参数并请求列表
    getData() {
      let data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: [],
      }
      let obj = this.searchOption.data
      for (let key in obj) {
        let value = typeof obj[key] === 'string' ? obj[key].trim() : obj[key]
        if (value && value.length) {
          data.query.push({
            column: key === 'finBillBillType' ? 'billType' : key,
            type: key === 'finBillBillType' ? 'eq' : 'like',
            value,
          })
        }
      }
      console.log('data:', data)
      specialLimitRolePageList(data)
        .then((res) => {
          let { list } = res.data
          this.tableOption.data = list.map((item) => {
            return {
              ...item,
              feeItems: item.feeCodes
                .map((code) => {
                  return this.specialFeeItemCfg[code] || code
                })
                .join(','),
            }
          })
          console.log(this.tableOption.data)
          this.tableOption.pagination.currPage = res.data.currPage
          this.tableOption.pagination.pageSize = res.data.pageSize
          this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .catch(console.log)
    },
  },
}
</script>