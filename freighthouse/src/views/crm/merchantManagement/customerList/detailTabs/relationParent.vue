<template>
  <div style="padding:0 20px 20px">
    <crmCompany
      @handleDialog="handleDialog('del',$event)"
      :companyInfo="companyInfo || {}"
      :isSubmit="isSubmit"
    ></crmCompany>
    <CrmDialog v-if="dialogOption.show" :option="dialogOption" @close="close('add',$event)" />
    <CrmDialog v-if="dialogOption2.show" :option="dialogOption2" @close="close('del',$event)" />
  </div>
</template>
<script>
import crmCompany from '@/views/crm/components/crmCompany'
import CrmDialog from '@/views/crm/components/crmDialog'
import CUSTOMER from '@/api/crm/customer'
const rules = [{ required: true, message: ' ' }]
const relationType = [
  { label: '母公司', value: 'parent' },
  { label: '子公司', value: 'child' },
]
export default {
  name: 'relationParent',
  props: ['custid', 'RELATION', 'action', 'isSubmit', 'selfData'],
  inject: ['relationCfg'],
  components: { crmCompany, CrmDialog },
  data() {
    return {
      // 母子公司已有公司的custid集合
      custidObj: { [this.custid]: true },
      companyInfo: null,
      // 删除弹框
      dialogOption2: {
        show: false,
        showClear: true,
        title: '解绑母子公司',
        text: '解绑',
        formItems: [
          { label: '关联类型', type: 'select', prop: 'relationType', rules, selectOptions: relationType, disabled: true },
          { label: '公司名称', type: 'input', prop: 'name', rules, disabled: true },
          { label: '解绑原因', type: 'select', prop: 'delReason', rules, propInDict: 'relieveReason' },
          { label: '解绑备注', type: 'textarea', prop: 'delRemark' },
        ],
        form: { relationType: '', custid: '', delReason: '', name: '', delRemark: '' },
      },
      // 新增弹框
      dialogOption: {
        show: false,
        showClear: true,
        title: '新增母子公司',
        text: '新建',
        formItems: [
          { label: '关联类型', type: 'select', prop: 'relationType', rules, selectOptions: relationType },
          {
            label: '公司名称',
            type: 'select',
            remote: true,
            multiple: true,
            prop: 'custid',
            rules,
            remoteSelectList: [],
            DIY: { key: 'custid' },
            remoteMethod: (name, item) => {
              let query = name ? [{ column: 'name', type: 'like', value: name }] : []
              CUSTOMER.myCustomerList({ currPage: 1, pageSize: 1000, verifyStatus: 'pass', custMode: 'order', query }).then(
                (res) => {
                  // console.log(this.custidObj)
                  item.remoteSelectList = res.data.list
                    .map((v) => ({ ...v, value: v.custid, label: v.name }))
                    .filter((v) => !this.custidObj[v.custid])
                }
              )
              // console.log(item.remoteSelectList)
            },
          },
          { label: '关联原因', type: 'select', prop: 'reason', rules, propInDict: 'motherChildRelationReason' },
          { label: '附件有效期', type: 'date', prop: 'Time', dateType: 'daterange' },
          { prop: 'fileNo', type: 'file', acceptTypes: ['doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png'], limit: 1 },
        ],
        form: { relationType: '', custid: [], reason: '', fileNo: '', Time: '' },
      },
    }
  },
  watch: {
    action(val) {
      if (val != 'parent') return
      this.$emit('update:action', '')
      this.handleDialog('add')
    },
    custid: {
      handler(custid) {
        if (!custid) return
        this.$nextTick(() => this.getCompanyInfo())
      },
      immediate: true,
    },
    companyInfo: {
      handler(val) {
        this.flatData(val)
      },
      deep: true,
    },
    'relationCfg.relationRefresh'(val) {
      val && this.getCompanyInfo()
    },
    'dialogOption.form.custid' (val) {
      let { relationType } = this.dialogOption.form
      if (val.length > 1 && relationType === 'parent') {
        this.dialogOption.form.custid = [val[0]]
        this.$msgErrClose('母公司只能选择一个！')
      }
    }
  },
  methods: {
    // 处理关系数据
    flatData(obj) {
      if (!obj) return
      let result = {}
      let flat = (obj) => {
        result[obj.custid] = true
        obj.childs && obj.childs.forEach(flat)
      }
      flat(obj)
      this.custidObj = result
      // console.log('``````````', this.custidObj)
    },
    // 添加节点后，处理树结构数据，处理审核请求数据 obj {fileNo, fileName, filePath, startTime, stopTime}
    dealAddData({ custid, name, regCapital, setupDate, legalPerson }, relationType, reason, file) {
      // 处理审核请求数据
      let common = { custid, name, relationType, regCapital, setupDate, legalPerson }
      let node = { reason, type: 'add', currCustid: this.custid, ...common, ...file }
      // console.log(node)
      this.$set(this.relationCfg.parentObj, custid, node)
      // 处理树结构数据
      let addNode = { isAdd: true, ...common, ...file }
      if (relationType == 'parent') {
        if (!this.companyInfo) {
          // 无数据时添加母公司
          this.companyInfo = { ...addNode, childs: [{ ...this.selfData, childs: [] }] }
        } else {
          // 有数据时添加母公司
          this.companyInfo = { ...addNode, childs: [{ ...this.companyInfo }] }
        }
      } else {
        if (!this.companyInfo) {
          // 无数据时添加子公司
          this.companyInfo = { ...this.selfData, childs: [{ ...addNode, childs: [] }] }
        } else if (this.companyInfo.custid == this.custid) {
          // 有数据时，本身是母公司添加子公司
          this.companyInfo.childs.push({ ...addNode, childs: [] })
        } else {
          // 有数据时，本身不是母公司添加子公司
          this.companyInfo.childs.find((v) => v.custid == this.custid).childs.push({ ...addNode, childs: [] })
        }
      }
      this.$forceUpdate()
      // console.log(this.companyInfo)
    },
    // 删除节点后，处理树结构数据，处理审核请求数据
    async dealDelData({ relationType, custid, delReason, delRemark }) {
      // console.log(this.relationCfg.parentObj[custid])
      // console.log({ relationType, custid, delReason, delRemark })
      // console.log(this.companyInfo, this.custid)
      // 处理审核请求数据
      // if (this.relationCfg.parentObj[custid]) {
      //   // 删除新增的，直接删除
      //   this.$delete(this.relationCfg.parentObj, custid)
      // } else {
        // 删除旧节点，调接口删除
        let data = { relationType, delCustid: custid, custid: this.custid, delReason, delRemark }
        await this.RELATION.structDelete(data).then((res) => this.$msgSucClose('删除成功！'))
        // this.$set(this.relationCfg.parentObj, custid, { relationType, custid, delReason, delRemark, type: 'remove' })
      // }
      // 处理树结构数据
      if (relationType == 'parent') {
        // 删除母公司
        this.companyInfo = this.companyInfo.childs[0]
      } else {
        // 删除子公司
        if (this.companyInfo.custid == this.custid) {
          // 本公司是母公司，
          this.companyInfo.childs = this.companyInfo.childs.filter((v) => v.custid != custid)
        } else {
          // 本公司不是母公司，
          let selfEl = this.companyInfo.childs.find((v) => v.custid == this.custid)
          selfEl.childs = selfEl.childs.filter((v) => v.custid != custid)
        }
      }
      // 如果本公司为母公司，且子节点数量为零，说明没有节点
      if (this.companyInfo.custid == this.custid && !this.companyInfo.childs.length) {
        this.companyInfo = null
      }
    },
    // 对话框关闭
    close(type, tag) {
      if (tag) {
        if (type == 'add') {
          let { custid, relationType, reason, fileNo, __fileName__, __filePath__, Time } = this.dialogOption.form
          let custidList = custid.map(item => item.custid)
          if (custidList.length > 1 && relationType === 'parent') {
            return this.$msgErrClose('母公司只能选择一个！')
          }
          // console.log(this.dialogOption.form)
          let sta = custidList.some(ele => this.custidObj[ele])
          if (sta) {
            return this.$msgErrClose('母子公司关系中已有此公司！')
          }
          if (this.companyInfo && this.companyInfo.custid != this.custid && relationType == 'parent') {
            return this.$msgErrClose('已有母公司！')
          }
          if (this.dialogOption.form.fileNo && !this.dialogOption.form.Time) {
            return this.$msgErrClose('请选择附件有效期！')
          }
          if (!this.dialogOption.form.fileNo && this.dialogOption.form.Time) {
            return this.$msgErrClose('请上传附件！')
          }
          return this.RELATION.custStructCheck({ custid: custidList, relationType, currCustid: this.custid })
            .then((res) => {
              let startTime = Time && Time[0]
              let stopTime = Time && Time[1]
              let node = { fileNo, fileName: __fileName__, filePath: __filePath__, startTime, stopTime }
              // TODO 需要添加新增接口
              let data = {
                currCustid: this.custid,
                custStructDtos: custid.map(item => {
                  return {
                    reason,
                    type: 'add',
                    custid: item.custid,
                    name: item.name,
                    relationType,
                    fileNo,
                    startTime,
                    stopTime
                  }
                })
              }
              this.RELATION.addRelationship(data).then(res => {
                if (res.code === 0) {
                  this.$msgSucClose('新增母子公司关系成功！')
                  // TODO 需要添加新增接口 成功后再处理以下逻辑
                  custid.forEach(ele => {
                    this.dealAddData(ele, relationType, reason, node)
                  })
                  this.dialogOption.show = false
                }
              }).catch(()=>{})
            })
            .catch(console.log)
        } else if (type == 'del') {
          let { custid, relationType, delReason, delRemark } = this.dialogOption2.form
          this.dealDelData({ custid, relationType, delReason, delRemark })
        }
      }
      this.dialogOption.show = this.dialogOption2.show = false
    },
    // 对话框打开
    handleDialog(type, company) {
      // console.log(type, company)
      if (type == 'add') {
        let form = this.dialogOption.form
        for (const key in form) {
          if (Object.hasOwnProperty.call(form, key)) {
            form[key] = ''
          }
        }
        this.dialogOption.show = true
      } else if (type == 'del') {
        // console.log(this.relationCfg.parentObj, company.custid)
        // if (this.relationCfg.parentObj[company.custid] && this.relationCfg.parentObj[company.custid].type == 'add') {
        //   return this.dealDelData({ ...company })
        // }
        this.dialogOption2.show = true
        this.$nextTick(() => {
          for (const key in this.dialogOption2.form) {
            this.dialogOption2.form[key] = ''
          }
          this.dialogOption2.form = { ...this.dialogOption2.form, ...company }
        })
      }
    },
    // 获取母子关系数据
    getCompanyInfo() {
      if (this.timeout && +new Date() - this.timeout < 1000) {
        return
      }
      for (const key in this.custidObj) {
        delete this.custidObj[key]
      }
      this.custidObj[this.custid] = true
      this.timeout = +new Date()
      this.RELATION.relationship({ custid: this.custid }).then((res) => {
        // obj传入的节点，custid查找的custid，target返回找到的节点
        let nodes = { selfNode: null, parentNode: {} }
        let selfAttachs = []
        function getNode(obj, custid, key) {
          if (obj.custid == custid) {
            // 如果当前对象是自身节点，则遍历子节点删除子节点的子节点，然后赋值给target
            if (key == 'selfNode') {
              selfAttachs = (obj.attachments || []).map((item) => item.fileNo)
              // console.log(selfAttachs)
              obj.childs.forEach((item) => {
                let childAttachs = item.attachments || []
                selfAttachs.length &&
                  childAttachs.forEach((child) => {
                    if (selfAttachs.indexOf(child.fileNo) > -1) {
                      item.fileNo = child.fileNo
                      item.fileName = child.name
                      item.filePath = child.filePath
                      item.startTime = child.startTime
                      item.stopTime = child.stopTime
                      item.attachObj = child
                    }
                  })
                item.childs = []
              })
            }
            nodes[key] = obj
            // console.log(nodes[key])
            // debugger
          } else if (obj.childs && obj.childs.length) {
            obj.childs.forEach((item) => {
              getNode(item, custid, key)
            })
          }
        }
        if (!res.data) {
          this.companyInfo = res.data
        } else {
          // 先找自身节点
          getNode(res.data, this.custid, 'selfNode')
          // console.log(nodes);
          let selfObj = nodes.selfNode
          // 判断自身节点是否有父节点，
          // 若有，找到父节点设置父节点子节点为自身节点，并设置为根节点
          // 若无，则表示自身节点为根节点
          if (selfObj && selfObj.parentCustid) {
            getNode(res.data, selfObj.parentCustid, 'parentNode')
            let selfParent = nodes.parentNode
            if (selfAttachs.length) {
              ;(selfParent.attachments || []).forEach((child) => {
                if (selfAttachs.indexOf(child.fileNo) > -1) {
                  selfParent.fileNo = child.fileNo
                  selfParent.fileName = child.name
                  selfParent.filePath = child.filePath
                  selfParent.startTime = child.startTime
                  selfParent.stopTime = child.stopTime
                  selfParent.attachObj = child
                }
              })
            }
            // selfParent.childs = [selfObj]
            selfParent.childs = selfParent.childs
            this.companyInfo = selfParent
          } else {
            this.companyInfo = selfObj
          }
        }
      })
    },
  },
  activated () {
    this.getCompanyInfo()
  }
}
</script>
