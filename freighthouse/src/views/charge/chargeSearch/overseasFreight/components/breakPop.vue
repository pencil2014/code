<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="calcelOrderForm" :rules="rules" :model="createdItem" label-position="top" label-width="80px" class="cancel-form">
      <el-form-item label="Reason for termination" prop="breakReason">
        <el-input type="textarea" size="mini" :rows="2" placeholder="Please input" v-model="createdItem.breakReason" maxlength="512" show-word-limit></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index-en.vue'
import { validateOverseasFreightIsOnlyEnchars } from '@/utils/validate'

const defaultCreate = {
  breakReason: ''
}

export default {
  data() {
    return {
      dialogConfig: {
        title: 'Terminate',
        show: true,
        size: 'medium',
        width: '480px'
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        breakReason: [
          {
            required: true,
            message: 'Please enter the reason for termination',
            trigger: 'change'
          },
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ]
      },
      isSubmit: false
    }
  },
  props: {},
  created() {},
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    })
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.calcelOrderForm.validate((valid) => {
          if (valid) {
            this.close('Confirm', this.createdItem)
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss">
.cancel-form {
  .el-form-item {
    margin-bottom: 4px;
  }
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px;
  }
}
</style>
