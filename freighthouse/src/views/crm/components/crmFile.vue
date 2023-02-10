<template>
  <div class="crm-file" :class="{tab:$attrs.type}">
    <div style="overflow:hidden;padding-bottom:8px" class="notSelf-hide">
      <el-button
        style="float:right"
        :type="$attrs.type"
        v-if="!$attrs.btnHide && !$attrs.isDisabled"
        @click="showDialog(true)"
        size="mini"
      >{{$attrs.text || '上传附件'}}</el-button>
    </div>
    <FinanceTable :option="tableOption" />
    <el-dialog title="新增附件" :visible.sync="dialogFormVisible" width="552px">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" size="mini" label-width="80px">
        <el-form-item label="附件类别" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择附件类别" :disabled="!!$attrs.isDisFileType">
            <template  v-for="item in dictMap.attachmentType">
              <el-option
                v-if="!!$attrs.isDisFileType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
              <el-option
                v-else-if="item.value !== 'attachment_overseas'"
                :key="item.value "
                :label="item.label"
                :value="item.value"
              ></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item prop="remark" label="简单说明">
          <el-input
            placeholder="备注内容信息"
            class="link-textarea"
            width="674"
            type="textarea"
            v-model="ruleForm.remark"
            :maxlength="CRM200"
          ></el-input>
        </el-form-item>
        <!-- <el-form-item label="附件类别">
          <el-input type="input" value="交接资料" disabled></el-input>
        </el-form-item> -->
        <el-form-item prop="fileName" label v-if="dialogFormVisible">
          <UploadFile ref="uploadFile" :acceptTypes="['doc','docx','pdf','jpg','jpeg','png','bmp','mp4','mkv','wmv','avi']" @getFile="getFile"></UploadFile>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          :loading="btnLoading"
          @click="submitForm('ruleForm')"
          size="mini"
          type="primary"
        >新增</el-button>
        <el-button size="mini" @click="showDialog(false)">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { baseAttachTable } from '@/views/crm/data'
import UploadFile from './common/uploadFile.vue'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'

export default {
  name: 'crmFile',
  components: {
    FinanceTable,
    UploadFile,
  },
  mixins: [mixin],
  props: {
    tableData: { type: Array, default: () => [] },
    ruleForm: { type: Object, default: () => ({}) },
    rules: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      tableOption: {},
      dialogFormVisible: false,
      fileList: [],
      btnLoading: false,
    }
  },
  watch: {
    dialogFormVisible(val) {
      if (val) {
        //海外同行进附件，默认
        if(!!this.$attrs.isDisFileType){
          this.$set(this.ruleForm,'type','attachment_overseas')
        }else{
          this.ruleForm.remark = ''
          this.ruleForm.type = ''
        }
        this.$nextTick(() => {
          this.$refs.ruleForm.clearValidate()
        })
      }else{
          this.ruleForm.remark = ''
          this.ruleForm.type = ''
      }
    },
    '$attrs.isSelf': {
      handler(val) {
        this.$nextTick(() => (this.tableOption.operationBtns.show = val))
      },
      immediate: true,
    },
    '$attrs.isDisabled': {
      handler(val) {
        this.$nextTick(() => (this.tableOption.operationBtns.show = !val))
      },
      immediate: true,
    },
  },
  created() {
    this.tableOption = { ...this.option, id: 'option1', pagination: false, selection: false }
    this.tableOption.operationBtns.data = [{ label: '删除', action: 'Delete', show: true }]
    this.tableOption.style = 'padding:0'
    this.tableOption.columns = baseAttachTable
    this.tableOption.data = this.tableData
  },
  methods: {
    showDialog(flag) {
      this.dialogFormVisible = flag
    },
    handleDelete(index, row, option) {
      this.$confirmWarn('此操作将删除该信息，是否继续?', () => {
        if (this.$attrs.type) {
          return this.$emit('action', row)
        }
        this.tableData.splice(index, 1)
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return this.$msgErrClose('请将必填项填写完整！')
        }
        console.log('fileList',this.fileList)
        console.log('formName',formName)
        if (!this.fileList.length) return this.$msgErrClose('附件不能为空！')
        this.$emit('submitForm', this.$refs[formName])
      })
    },
    getFile(fileList) {
      this.fileList = fileList
      this.$emit('getFile', fileList)
    },  
  },
}
</script>
<style lang="scss" scoped>
.crm-file {
  margin: 0 8px;
  &.tab {
    margin-top: 8px;
  }
  ::v-deep {
    .el-dialog__body {
      padding: 20px 20px 10px 20px;
      .el-form-item {
        display: flex;
        margin: 0 !important;
        margin-bottom: 4px !important;
        .upload-file-cont {
          width: 100% !important;
        }
      }
      .el-form-item__content {
        margin-left: 0 !important;
        flex: 1 1 auto;
        & > div {
          width: 100%;
        }
      }
    }
    .el-dialog__footer {
      padding: 0 20px 20px;
    }
    .finance-el-table .el-button{
      line-height: 16px;
    }
  }
}
</style>
