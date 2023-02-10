<template>
  <div class="info-page" style="margin-bottom: 20px;">
    <div class="info-title notSelf-hide">
      <span></span>
      <div v-show="!isBlacklist">
        <el-button-group>
          <el-button size="mini" @click="invalidRow" type="danger">失效</el-button>
        </el-button-group>
        <el-button-group style="margin-right: 0">
          <el-button size="mini" @click="showDialog('add')" type="primary">新增联系人信息</el-button>
        </el-button-group>
      </div>
    </div>
    <FinanceTable :option="option1" @send-multi="selectMulti" />
    <CrmDialog ref="invalid" :option="invalidDialog" @close="closeDialog('invalid',$event)" />
    <CrmDialog :multi="true" ref="add" :option="addDialog" @close="closeDialog('add',$event)" />
    <CrmDialog :multi="true" ref="edit" :option="editDialog" @close="closeDialog('edit',$event)"  v-if="editDialog.show"/>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CrmDialog from '@/views/crm/components/crmDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { addBaseLinkData as columnsData } from '@/views/crm/data'
import CONTACT from '@/api/crm/orgContact'
import { listByRole } from '@/api/base'
export default {
  name: 'CUST4',
  mixins: [mixin],
  supplierShow: true,
  shipperShow: true,
  label: '联系人信息',
  components: {
    FinanceTable,
    CrmDialog,
  },
  inject: ['telRules', 'emailRules'],
  props: ['custid', 'orgid', 'isSupplier', 'isSelf', 'isShipC','isBlacklist'],
  watch: {
    custid: {
      handler(custid) {
        if (!custid) return
        this.getData()
      },
      immediate: true,
    },
    isSelf: {
      handler(val) {
        this.$nextTick(() => this.option1.selection.show = val)
      },
      immediate: true,
    },
  },
  data() {
    let ruleMsg = { required: true, message: ' ' }
    let form = {}
    let formItems = columnsData.map((item) => {
      let prop = item.prop
      if (prop === 'belongEmployeeName') {
        prop = 'belongEmployeeId'
        item.DIY = { key: 'employeeId' },
        item.type = 'select'
        item.remote = true
        item.remoteSelectList = []
        item.remoteMethod = (str='', item) => {
          if(typeof str === 'object'){
            item.remoteSelectList = [str]
            return
          }
          const data = {
            currPage: 1,
            pageSize: 10,
            query: [
              { column: 'name', type: 'eq', value: str },
              {
                column: 'roleCode',
                type: 'in',
                value: 'bd'
              }
            ]
          }
          listByRole(data)
            .then((res) => {
              if (res.code === 0) {
                item.remoteSelectList = res.data.list.map(ele => {
                  return { ...ele, label: ele.cname, value: ele.employeeId+'' }
                })
              }
            })
            .catch(() => {})
        }
      }
      if(this.isSupplier||this.isShipC){
        if (prop === 'whatsapp'||prop === 'wechatEname'||prop === 'faxNo'||prop === 'duty'||
        prop === 'eduBack'||prop === 'familyBack'||prop === 'professionalBack'||prop === 'hobbies'||
        prop === 'other') {
          item.show = false
        }
      }

      form[prop] = ''
      return { ...item, prop, rules: item.r ? ruleMsg : undefined }
    })
    return {
      option1: {},
      addDialog: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '新增联系人信息',
        text: '新增',
        formItems: formItems,
        form,
      },
      editDialog: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '编辑联系人信息',
        text: '确认',
        formItems: formItems.map(item => ({...item, noRemote: true})),
        form,
      },     
      invalidDialog: {
        show: false,
        title: '联系人失效',
        text: '失效',
        btnLoading: false,
        formItems: [
          { label: '联系人', type: 'input', prop: 'name', rules: ruleMsg, disabled: true },
          { label: '失效原因', type: 'select', prop: 'reason', propInDict: 'contactInvalid', rules: ruleMsg },
        ],
        form: { reason: '', name: '', oid: '' },
      },
      multipleSelection: [],
    }
  },
  activated() {
    // console.log(this.orgid)
    this.getData()
  },
  watch:{
    "addDialog.form.role"(val){
      let diyRole = this.addDialog.formItems.find(item => item.prop === 'diyRole')
      this.$set(diyRole, 'show',val === 'other')
    },
    "editDialog.form.role"(val){
      let diyRole = this.editDialog.formItems.find(item => item.prop === 'diyRole')
      this.$set(diyRole, 'show',val === 'other')
    },
  },
  created() {
    let operationBtns = {
      ...this.option.operationBtns,
      width: '100px',
      show: true,
      data: [
        { label: '编辑', action: 'Edit', showFn: (row) => row.status === 'effect' },
      ],
      callback: (action, $index, row, item) => {
        if (action === 'Edit') {
          this.edit(row)
        }
      }
    }
    this.option1 = {
      ...this.option,
      id: 'option1',
      operationBtns: (this.isSelf && !this.isSupplier && !this.isShipC) ? operationBtns: false,
      pagination: false,
      selection: { show: true, fixed: true },
      rootTipsHide: true,
    }
    this.option1.style = { padding: '5px 0' }
    this.initColumns()
  },
  methods: {
    // 编辑联系人信息
    edit (row) {
      let { belongEmployeeName, belongEmployeeId } = row
      row.belongEmployeeId = row.belongEmployeeId ? {label: belongEmployeeName, value: belongEmployeeId} : ''
      let source = this.editDialog.formItems.find(item => item.prop === 'belongEmployeeId')
      belongEmployeeId && source.remoteMethod({label: belongEmployeeName, value: belongEmployeeId}, source)
      this.editDialog.show = true
      setTimeout(() => {
        this.editDialog.form = JSON.parse(JSON.stringify(Object.assign({},row)))
      }, 0);
    },
    initColumns() {
      let reason = { prop: 'reason', label: '失效原因', type: 'select', propInDict: 'contactInvalid', width: 160 }
      let columns = columnsData.map((item) => {
        return { ...item, hasTag: item.prop === 'name' }
      })
      //table不显示从业背景等
      columns.splice(3,1)
      columns.splice(13,8)
      let find = columns.find(item => item.prop==='belongEmployeeName')
      if (!find) {
        columns.splice(-3,0, {
        type: "input", prop: "belongEmployeeName", label: "归属人"
        })
      }
      this.option1.columns = [...columns, reason]
    },
    getData() {
      CONTACT[`${this.isSupplier ? 'supplier' : this.isShipC ? 'shippingCarrier':'customer'}List`]({
        [this.isSupplier ? 'supplierId' :this.isShipC ? 'shippingCarrierId': 'custid']: this.custid,
      }).then((res) => {
        this.option1.data = res.data.map((item) => {
          item._isInvalid = item.status === 'no_effect'
          if (item._isInvalid) {
            item._tagArr = [{ type: 'invalid', text: '失' }]
          }
          return { ...item }
        })
        // this.option1.data = res.data.map((item) => ({ ...item, _isInvalid: item.status == 'no_effect' }))
      })
    },
    closeDialog(type, tag) {
      if (!tag) return (this[type + 'Dialog'].show = false)
      // 编辑联系人
      if (type === 'edit') {
        let data = { ...this.editDialog.form, orgid: this.orgid, custid: this.custid }
        if (data.belongEmployeeId) {
          let {cname, employeeId} = data.belongEmployeeId
          data.belongEmployeeId = employeeId
          data.belongEmployeeName = cname
        }
        if (!data.name && !data.ename) {
          return this.$msgErrClose('中文名和英文名至少填一个！')
        }
        this.editDialog.btnLoading = true
        CONTACT.editCustomerContact(data).then(res => {
          if (res.code === 0) {
            this.$msgSucClose('编辑联系人成功！')
            this.getData()
            this.editDialog.show = false
          }
        }).finally(()=>{
          this.editDialog.btnLoading = false
        })
      } else {
        let str1 = this.isSupplier ? 'Supplier' :this.isShipC ? 'ShippingCarrier': 'Customer'
        let str2 = this.isSupplier ? 'supplier' :this.isShipC ? 'shippingCarrier': 'customer'
        let method = CONTACT[type == 'add' ? `add${str1}Contact` : `${str2}Invalid`]
        let data = { ...this[type + 'Dialog'].form, orgid: this.orgid, [this.isSupplier ? 'supplierId' : this.isShipC ? 'shippingCarrierId':'custid']: this.custid }
        if (data.belongEmployeeId) {
          let {cname, employeeId} = data.belongEmployeeId
          data.belongEmployeeId = employeeId
          data.belongEmployeeName = cname
        }
        if (type == 'add' && !data.name && !data.ename) {
          return this.$msgErrClose('中文名和英文名至少填一个！')
        }
        this[type + 'Dialog'].btnLoading = true
        method(data)
          .then(() => {
            let ref = this.$refs[type].$refs.form
            ref.resetFields()
            this.$nextTick(() => ref.clearValidate())
            this.$nextTick(() => (this[type + 'Dialog'].show = false))
            this.$msgSucClose(type == 'add' ? '新增联系人成功！' : '失效设置成功！')
            this.getData()
          })
          .finally(() => {
            this[type + 'Dialog'].btnLoading = false
          })
      }

    },
    showDialog(type, row) {
      if (type == 'invalid' && this.option1.data.filter(({ status }) => status == 'effect').length < 2) {
        return this.$msgErrClose('只存在一个联系人，不可失效！')
      }
      if (row) {
        let { oid, name, ename, reason } = row
        this.invalidDialog.form = { oid, name: name || ename, reason }
      }
      this[type + 'Dialog'].show = true
    },
    selectMulti(list) {
      this.multipleSelection = list
    },
    invalidRow() {
      let len = this.multipleSelection.length
      if (!len) {
        return this.$msgErrClose('请至少选择一位联系人！')
      }
      if (len > 1) {
        return this.$msgErrClose('一次只能选择一位联系人！')
      }
      if (this.multipleSelection[0]._isInvalid) {
        return this.$msgErrClose('请选择未失效的联系人！')
      }
      this.showDialog('invalid', this.multipleSelection[0])
    },
  },
}
</script>
