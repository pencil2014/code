<template>
  <div>
    <FinanceTable :option="tableOption" :autoMax="true" />
    <!-- <Company
      @handleDialog="handleDialog('del',$event)"
      :companyInfo="companyInfo || {}"
      :isSubmit="isSubmit"
    ></Company>-->
    <CrmDialog
      v-if="dialogOptionFile.show"
      :option="dialogOptionFile"
      @close="close('file', $event)"
    />
    <CrmDialog
      v-if="dialogOption.show"
      :option="dialogOption"
      @close="close('add', $event)"
    />
    <CrmDialog
      v-if="dialogOption2.show"
      :option="dialogOption2"
      @close="close('del', $event)"
    />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import Company from '@/views/crm/components/company'
import CrmDialog from '@/views/crm/components/crmDialog'
import CUSTOMER from '@/api/crm/customer'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
const rules = [{ required: true, message: ' ' }]
export default {
  name: 'relationBrother',
  mixins: [mixin],
  props: [
    'custid',
    'RELATION',
    'action',
    'selfData',
    'isSubmit',
    'isLeader',
    'isCts'
  ],
  inject: ['relationCfg', 'isReview'],
  components: { Company, CrmDialog, FinanceTable },
  data() {
    let relTypeList = []
    return {
      // 关联公司已有公司的custid集合
      custidObj: { [this.custid]: true },
      tableOption: {},
      companyInfo: null,
      relTypeList,
      // 更新附件弹框
      dialogOptionFile: {
        show: false,
        showClear: true,
        title: '附件',
        appendToBody: true,
        formItems: [
          {
            label: '附件有效期',
            type: 'date',
            prop: 'Time',
            dateType: 'daterange',
            rules: { required: true, message: ' ' }
          },
          {
            prop: 'fileNo',
            type: 'file',
            // acceptTypes: ['doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png'],
            limit: 1,
            rules: { required: true, message: '必选' }
          }
        ],
        form: { fileNo: '', Time: [] }
      },
      // 删除弹框
      dialogOption2: {
        show: false,
        showClear: 'validate',
        title: '解绑平级关系',
        text: '解绑',
        formItems: [
          {
            label: '公司名称',
            type: 'input',
            prop: 'name',
            rules,
            disabled: true
          },
          {
            label: '解绑原因',
            type: 'select',
            prop: 'delReason',
            rules,
            propInDict: 'relieveReason'
          },
          { label: '解绑备注', type: 'textarea', prop: 'delRemark' }
        ],
        form: { custid: '', delReason: '', name: '', delRemark: '' }
      },
      // 新增弹框
      dialogOption: {
        show: false,
        showClear: true,
        title: '新增平级关系',
        text: '新建',
        formItems: [
          {
            label: '关联类型',
            type: 'select',
            prop: 'relType',
            rules,
            selectOptions: relTypeList
          },
          {
            label: '公司名称',
            type: 'select',
            remote: true,
            prop: 'custid',
            rules,
            multiple: true,
            remoteSelectList: [],
            DIY: { key: 'custid' },
            remoteMethod: (name, item) => {
              const query = name
                ? [{ column: 'name', type: 'like', value: name }]
                : []
              CUSTOMER.myCustomerList({
                currPage: 1,
                pageSize: 1000,
                verifyStatus: 'pass',
                custMode: 'order',
                query
              }).then((res) => {
                item.remoteSelectList = res.data.list
                  .map((v) => ({ ...v, value: v.custid, label: v.name }))
                  .filter((v) => !this.custidObj[v.custid])
              })
            }
          },
          // { label: '关联原因', type: 'select', prop: 'reason', rules, propInDict: 'companyRelationReason' },
          {
            label: '附件有效期',
            type: 'date',
            prop: 'Time',
            dateType: 'daterange'
          },
          {
            prop: 'fileNo',
            type: 'file',
            acceptTypes: ['doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png'],
            limit: 1
          }
        ],
        form: { custid: [], relType: '', fileNo: '', Time: '' }
      }
    }
  },
  created() {
    this.relTypeList.splice(0,0,...this.dictMap['customerRelationType'].filter(item => item.value !== 'mother_child'))
    // 表格配置
    this.tableOption = {
      ...this.option,
      id: 'tableOption',
      pagination: false,
      selection: false
    }
    this.tableOption.columns = [
      { label: '公司名称', prop: 'relName', type: 'text' },
      {
        label: '关联类型',
        prop: 'relType',
        type: 'select',
        propInDict: 'customerRelationType'
      },
      {
        label: '附件',
        prop: 'fileName',
        width: 200,
        type: 'button',
        callback: ({ fileNo, fileName, suffix }) => {
          fileName = fileName.replace(/[\[|\]|\{|\}|\%|`]/g, '')
          const href = `/base/fileView/preview/${fileNo}/${fileName}`
          window.open(href)
        }
      },
      {
        label: '附件有效期',
        prop: 'time',
        type: 'timeRange',
        rangeStr: ['startTime', 'stopTime'],
        sliceRange: [0, 10]
      }
    ]
    if (this.isCts) {
      this.tableOption.operationBtns.width = 130
      this.tableOption.operationBtns.data = [
        { label: '更新附件', type: 'text', show: true, action: 'Edit' },
        { label: '解绑', type: 'text', show: true, action: 'Delete' }
      ]
    } else {
      this.tableOption.operationBtns = false
    }
  },
  computed: {
    ...mapGetters(['dictMap'])
  },
  watch: {
    // isLeader: {
    //   handler(val, oldVal) {
    //     if (val == oldVal) return
    //     // this.custidObj = { [custid]: true }
    //     this.$nextTick(() => {
    //       if (this.isReview) return
    //       if (val) {
    //         this.tableOption.operationBtns = false
    //       } else {
    //         this.tableOption.operationBtns.width = 130
    //         this.tableOption.operationBtns.data = [
    //           { label: '更新附件', type: 'text', show: true, action: 'Edit' },
    //           { label: '解绑', type: 'text', show: true, action: 'Delete' },
    //         ]
    //       }
    //     })
    //   },
    //   immediate: true,
    // },
    // isSubmit: {
    //   handler(val, oldVal) {
    //     if (val == oldVal) return
    //     // this.custidObj = { [custid]: true }
    //     this.$nextTick(() => {
    //       if (this.isReview) return
    //       if (val) {
    //         this.tableOption.operationBtns.width = 70
    //         this.tableOption.operationBtns.data = [{ label: '更新附件', type: 'text', show: true, action: 'Edit' }]
    //       } else {
    //         this.tableOption.operationBtns.width = 130
    //         this.tableOption.operationBtns.data = [
    //           { label: '更新附件', type: 'text', show: true, action: 'Edit' },
    //           { label: '解绑', type: 'text', show: true, action: 'Delete' },
    //         ]
    //       }
    //     })
    //   },
    //   immediate: true,
    // },
    action(val) {
      if (val != 'brother') return
      this.$emit('update:action', '')
      this.handleDialog('add')
    },
    custid: {
      handler(custid) {
        if (!custid) return
        // this.custidObj = { [custid]: true }
        this.$nextTick(() => this.getCompanyInfo())
      },
      immediate: true
    },
    companyInfo: {
      handler(val) {
        this.flatData(val)
      },
      deep: true
    },
    'relationCfg.relationRefresh'(val) {
      val && this.getCompanyInfo()
    }
  },
  methods: {
    // 更新
    handleEdit(row) {
      this.dialogOptionFile.show = true
      this.isChangeRow = row
    },
    // 解绑
    handleDelete(index, row) {
      // console.log(index)
      this.handleDialog('del', row, index)
    },
    // 处理关系数据
    flatData(obj) {
      if (!obj) return
      const result = {}
      const flat = (obj) => {
        result[obj.custid] = true
        obj.childs && obj.childs.forEach(flat)
      }
      flat(obj)
      this.custidObj = result
    },
    // 添加节点后，处理树结构数据，处理审核请求数据
    dealAddData({ custid, name }, relType, file) {
      // 处理审核请求数据
      const node = {
        relCustid: custid,
        relName: name,
        relType,
        type: 'add',
        custid: this.custid,
        ...file
      }
      this.$set(this.relationCfg.brotherObj, custid, node)
      this.tableOption.data.push(node)
      // // 处理树结构数据
      // let addNode = { custid, name, childs: [], isAdd: true }
      // if (!this.companyInfo) {
      //   // 无数据时添加关联公司
      //   this.companyInfo = { hidden: true, childs: [{ ...this.selfData }, addNode] }
      // } else {
      //   // 有数据时添加关联公司
      //   this.companyInfo.childs.push(addNode)
      // }
    },
    // 删除节点后，处理树结构数据，处理审核请求数据
    async dealDelData({ relCustid, delReason, delRemark, oid }, index) {
      // 处理审核请求数据
      if (this.relationCfg.brotherObj[relCustid]) {
        // 删除新增的，直接删除
        this.$delete(this.relationCfg.brotherObj, relCustid)
        this.tableOption.data.splice(index, 1)
      } else {
        const data = {
          delCustid: relCustid,
          custid: this.custid,
          delReason,
          delRemark,
          oid
        }
        await this.RELATION.delete(data).then((res) => {
          this.tableOption.data.splice(index, 1)
          this.$msgSucClose('删除成功！')
        })
      }
      // // 处理树结构数据
      // this.companyInfo.childs = this.companyInfo.childs.filter((v) => v.custid != custid)
      // // 如果仅有一个节点说明没有关联接点了
      // if (this.companyInfo.childs.length == 1) {
      //   this.companyInfo = null
      // }
    },
    convertData(key1, key2) {
      this[key1].fileNo = this[key2].form.fileNo
      this[key1].fileName = this[key2].form.__fileName__
      this[key1].filePath = this[key2].form.__filePath__
      this[key1].startTime = this[key2].form.Time[0]
      this[key1].stopTime = this[key2].form.Time[1]
      this.$forceUpdate()
      this.dialogOptionFile.show = false
    },
    close(type, tag) {
      if (tag) {
        if (type == 'add') {
          const {
            custid,
            relType,
            reason,
            fileNo,
            __fileName__,
            __filePath__,
            Time
          } = this.dialogOption.form
          const tableData = this.tableOption.data
          const arr = [
            ...tableData.map((v) => +v.custid),
            ...tableData.map((v) => +v.relCustid)
          ]
          let custidList = custid.map(item => item.custid)
          let sta = custidList.some(ele => arr.includes(ele))
          if (sta) {
            return this.$msgErrClose('平级关系中已有此公司！')
          }
          if (this.dialogOption.form.fileNo && !this.dialogOption.form.Time) {
            return this.$msgErrClose('请选择附件有效期！')
          }
          if (!this.dialogOption.form.fileNo && this.dialogOption.form.Time) {
            return this.$msgErrClose('请上传附件！')
          }
          this.RELATION.checkAdd({
            custid: custidList,
            currCustid: this.custid
          }).then((res) => {
            const startTime = Time && Time[0]
            const stopTime = Time && Time[1]
            const node = {
              fileNo,
              fileName: __fileName__,
              filePath: __filePath__,
              startTime,
              stopTime
            }
            // console.log(node,this.selfData)
            // TODO 添加新增平级关系接口
            const data = {
              custid: this.custid,
              custRelationDtos: custid.map(item => {
                return {
                  reason,
                  type: 'add',
                  custid: this.custid,
                  name: this.selfData.name,
                  relCustid: item.custid,
                  relName: item.name,
                  relType,
                  fileNo,
                  startTime,
                  stopTime
                }
              })
            }
            this.RELATION.add(data)
              .then((res) => {
                if (res.code === 0) {
                  this.dialogOption.show = false
                  this.$msgSucClose('新增平级关系成功！')
                  // this.dealAddData(custid, relType, node)
                  this.getCompanyInfo()
                }
              })
              .catch(() => {})
          })
          return
        } else if (type == 'del') {
          const { relCustid, delReason, delRemark, delIndex, oid } =
            this.dialogOption2.form
          this.dealDelData({ relCustid, delReason, delRemark, oid }, delIndex)
        } else if (type == 'file') {
          const row = this.isChangeRow
          // oid不存在，表示新增
          if (!row.oid) {
            return this.convertData('isChangeRow', 'dialogOptionFile')
          }
          const data = {
            oid: row.oid,
            fileNo: this.dialogOptionFile.form.fileNo,
            startTime: this.dialogOptionFile.form.Time[0],
            stopTime: this.dialogOptionFile.form.Time[1]
          }
          return this.RELATION.uploadOrReplaceRelation(data).then((res) => {
            this.dialogOptionFile.show = false
            this.$msgSucClose('更新附件成功')
            // this.convertData('isChangeRow', 'dialogOptionFile')
            this.getCompanyInfo()
          })
        }
      }
      this.dialogOption.show =
        this.dialogOption2.show =
        this.dialogOptionFile.show =
          false
    },
    handleDialog(type, company, index) {
      if (type == 'add') {
        const form = this.dialogOption.form
        for (const key in form) {
          if (Object.hasOwnProperty.call(form, key)) {
            form[key] = ''
          }
        }
        this.dialogOption.show = true
      } else if (type == 'del') {
        // console.log(this.relationCfg.brotherObj, company.custid)
        // console.log(company)
        if (
          this.relationCfg.brotherObj[company.relCustid] &&
          this.relationCfg.brotherObj[company.relCustid].type == 'add'
        ) {
          return this.dealDelData({ ...company }, index)
        }
        this.dialogOption2.show = true
        this.$nextTick(() => {
          for (const key in this.dialogOption2.form) {
            this.dialogOption2.form[key] = ''
          }
          this.dialogOption2.form = {
            ...this.dialogOption2.form,
            ...company,
            name: company.relName,
            delIndex: index
          }
        })
      }
    },
    // 获取关系数据
    getCompanyInfo() {
      for (const key in this.custidObj) {
        delete this.custidObj[key]
      }
      this.custidObj[this.custid] = true
      this.RELATION.show({ custid: this.custid })
        .then((res) => {
          this.tableOption.data.splice(0, 1000, ...(res.data || []))
          // let name = this.$store.state.crm.detailBaseInfo.name
          // let arr = res.data && res.data.length && [...res.data, { custid: this.custid, name }]
          // this.companyInfo = arr ? { hidden: true, childs: arr } : null
        })
        .catch((err) => this.tableOption.data.splice(0, 1000))
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/.finance-el-table .el-button{
  line-height: 20px;
}
</style>
