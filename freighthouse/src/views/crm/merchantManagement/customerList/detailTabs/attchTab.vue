<template>
  <CrmFile
    type="primary"
    text="新增附件"
    ref="crmFile"
    v-show="!isBlacklist"
    :tableData="tableData"
    :ruleForm="ruleForm2"
    :rules="rules2"
    :isSelf="isSelf"
    @submitForm="submitForm"
    @action="fileAction"
    @getFile="getFile"
  ></CrmFile>
</template>
<script>
import { mapGetters } from 'vuex'
import CrmFile from '@/views/crm/components/crmFile'
import ATTACH from '@/api/crm/attachment'

export default {
  // name: 'CUST0',
  name: 'CUSTp',
  supplierShow: true,
  shipperShow: true,
  label: '附件信息',
  components: {
    CrmFile,
  },
  props: ['orgid', 'custid', 'isSelf', 'isSupplier','isShipC','isBlacklist'],
  data() {
    return {
      fileName: [],
      tableData: [],
      ruleForm2: {
        orgid: '',
        type: '',
        typeName: '',
        remark: '',
      },
      rules2: {
        name: [{ required: true, message: ' ', trigger: 'blur' }],
        type: [{ required: true, message: ' ', trigger: 'blur' }],
        remark: [{ required: true, message: ' ', trigger: 'blur' }],
      },
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
  },
  activated() {
    this.getData()
  },
  methods: {
    getData() {
      // let method = ''
      // if(this.isSupplier){
      //   method = 'supplierList'
      // }else if (this.isShipC){

      // }else{
      //     method = 'customerList'
      // }
      let method = this.isSupplier ? 'supplierList' : this.isShipC ? 'shippingCarrierList' : 'customerList'
      let data = { custid: this.custid, supplierId: this.custid,shippingCarrierId:this.custid }
      ATTACH[method](data).then((res) => this.tableData.splice(0, 1000, ...res.data))
    },
    // 获取上传的文件
    getFile(fileList) {
      this._childFileList = fileList
      this.fileName = fileList.map((item) => item.raw)
    },
    // 表单提交
    submitForm(refFormName) {
      refFormName.validate(async (valid) => {
        const formData = new FormData()
        this.fileName.forEach((item, index) => formData.append('fileNames', item))
        this.ruleForm2.typeName = this.dictMapObj.attachmentType[this.ruleForm2.type]
        formData.append('orgid', this.orgid)
        formData.append('type', this.ruleForm2.type)
        formData.append('typeName', this.ruleForm2.typeName)
        formData.append('remark', this.ruleForm2.remark)
        let crmFile = this.$refs.crmFile
        let uploadFile = crmFile.$refs.uploadFile
        crmFile.btnLoading = true
        uploadFile.handleProgress()
        let method = this.isSupplier ? 'supplierUpload' : 'customerUpload'
        ATTACH[method](formData)
          .then((res) => {
            crmFile.showDialog(false)
            this._childFileList.splice(0, 100)
            this.$msgSucClose('新增成功!')
            this.getData()
          })
          .finally(() => {
            crmFile.btnLoading = false
            uploadFile.showProcess = false
          })
      })
    },
    // 删除附件
    fileAction(row) {
      let method = this.isSupplier ? 'supplierDelete' : 'customerDelete'
      ATTACH[method]({ oid: row.oid, orgid: this.orgid }).then((res) => {
        this.$msgSucClose('删除成功!')
        this.getData()
      })
    },
  },
}
</script>
