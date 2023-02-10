<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="apply" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="apply-form">
      <div class="apply-form-row warning" v-for="(item, index) in param.blNos" :key="index">
        MBL：{{item}}  关联的HBL 并未同意放货，是否确定要先申请同意放该MBL？
      </div>
      <el-row style="margin-top: 20px">
        <el-form-item label="申请原因" prop="reason" :required="true" :show-message="false">
          <el-input maxlength="512" show-word-limit :style="{ width: '100%' }" type="textarea" size="mini" :rows="3" placeholder="请输入" v-model="createdItem.reason"></el-input>
        </el-form-item>
      </el-row>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
const defaultCreate = {
  reason: ''
}
export default {
  data() {
    return {
      dialogConfig: {
        title: '发起申请',
        show: true,
        width: '600px',
        inputSize: ''
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
      },
    }
  },
  props: {
    param: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.init()
  },

  mounted() {
  },
  destroyed() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    })
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    init() {
    },
    close(action, value, isSpecial) {
      this.$emit('close', action, value, isSpecial)
    },
    // 弹窗关闭回调
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.apply.validate(valid => {
          if (valid) {
            this.close('Confirm', {
              blIdList: this.param.blIdList,
              reason: this.createdItem.reason
            })
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

<style lang="scss" scoped>
.apply-form{
  .apply-form-row {
    line-height: 20px;
    &.warning{
      color: #e63923;
      // margin-top: 15px
    }
    .label-fl{
      width: 40px;
    }
    .value-fr{
      flex: 1;
      .btn-special{
        margin-left: 10px;
      }
    }
  }
  /deep/ .el-form-item {
    margin-bottom: 4px;
  }
}
</style>