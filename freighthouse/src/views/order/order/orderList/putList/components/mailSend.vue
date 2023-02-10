<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="mailForm" :model="createdItem" :rules="rules" label-position="right" label-width="70px" class="create-form">    
      <el-form-item label="收件人" prop="mailTo">
        <el-input size="mini" v-model="createdItem.mailTo" placeholder="请输入收件人邮箱（多个以英文逗号分隔）">
        </el-input>
      </el-form-item>
      <div class="mailOnly-tip">请输入收件人邮箱（多个以英文逗号分隔）</div>
      <el-form-item label="抄送人" prop="mailCC">
        <el-input size="mini" v-model="createdItem.mailCC" placeholder="请输入抄送人邮箱（多个以英文逗号分隔）">
        </el-input>
      </el-form-item>
      <div class="mailOnly-tip">请输入收件人邮箱（多个以英文逗号分隔）</div>
      <el-form-item label="邮件主题" prop="mailSubject">
        <el-input size="mini" placeholder="请填写邮件主题" v-model="createdItem.mailSubject" type="textarea" :rows="2" maxlength="200" show-word-limit>
        </el-input>
      </el-form-item>
      <el-form-item label="邮件内容" prop="mailContent">
        <el-input size="mini" placeholder="请填写邮件内容" v-model="createdItem.mailContent" type="textarea" :rows="6">
        </el-input>
      </el-form-item>
      <!-- <el-form-item label="邮件签名" prop="mailSignature">
        <el-input size="mini" v-model="createdItem.mailSignature" placeholder="请输入邮件签名">
        </el-input>
      </el-form-item> -->
    </el-form>
  </BaseDialog>
</template>
<script>

import {mapState} from 'vuex'
import {getDictLabel} from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'

const defaultCreate = {
  mailTo: '',
  mailCC: '',
  mailSubject: '',
  mailContent: '',
  // mailSignature: ''
}

export default {
  filters: {
  },
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '邮件发送',
        show: true,
        size: 'medium',
        width: "800px"
      },
      canSubmit: true,    // 可提交标识
      rules: {
        mailTo: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          {
            validator: this.validateReceive,
            trigger: 'blur'
          }
        ],
        mailCC: [
          { required: false, message: '邮箱不能为空', trigger: 'blur' },
          {
            validator: this.validateReceive,
            trigger: 'blur'
          }
        ],
        mailSubject: [
          { required: true, message: '主题不能为空', trigger: 'blur' }
        ],
        mailContent: [
          { required: true, message: '内容不能为空', trigger: 'blur' }
        ],
        // mailSignature: [
        //   { required: true, message: '邮件签名不能为空', trigger: 'blur' }
        // ],
      },
      createdItem: Object.assign({}, defaultCreate),
      serviceCode: sessionStorage.getItem("serviceCode"),
    }
  },
  props: {
    param: {
      type: Object,
      default: () => ({})
    },
  },
  created() {
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      role: state => state.user.role
    })
  },
  components: {
    BaseDialog
  },
  watch: {
  },
  methods: {
    // 邮箱校验
    validateReceive(rule, value, callback) {
      if (value === '') {
        if (rule.field === 'receive') {
          callback(new Error('请输入邮箱'));
        } else {
          callback()
        }
      } else {
        let arr = value.split(',')
        arr.forEach(item => {
          let Email = item
          const emailrule = /^([a-zA-Z]|[0-9])+\.?(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
          if (!emailrule.test(Email)) {
            callback(new Error('请输入有效邮箱'));
          } else {
            callback()
          }
        })
      }
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
    validate() {
      return true
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.mailForm.validate(valid => {
          if (valid) {
            let data = {... this.createdItem}
            this.close('Confirm', data)
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    },
  }
}
</script>
<style lang="scss">
.mailOnly-tip {
  padding-left: 90px;
  color: #969696;
  margin-bottom: 4px;
  line-height: 20px;
}
</style>