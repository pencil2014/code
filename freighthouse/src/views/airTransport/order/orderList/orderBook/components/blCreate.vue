<template>
  <BaseDialog class="mbl-confirm" :config="dialogConfig" :callback="dialogCallback">
    <!-- <el-form ref="createForm" :rules="rules" :model="createItem" label-position="right" label-width="120px" class="create-form">    
      <el-form-item label="提单编号" prop="newBlNo">
        <el-input type="" size="mini" placeholder="请输入" v-model="createItem.newBlNo"></el-input>
      </el-form-item>
    </el-form> -->
    <span>确定要生成MBL吗?</span>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blCreateBlFromExist } from '@/api/order/bl'

const defaultCreate = {
  blType: 'mbl',
  existBlId: ''
  // newBlNo: undefined,
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '生成MBL',
        show: true,
        size: 'medium'
        // width: "800px"
      },

      createItem: Object.assign({}, defaultCreate),

      rules: {
        // newBlNo: [{required: true, message: '请输入提单号', trigger: 'change'}]
      }
    }
  },
  props: {
    existBlId: {
      type: Number,
      default: ''
    }
  },
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

    //
    handleChange(val) {},

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        // this.$refs.createForm.validate((valid) => {
        //   if (valid) {
        //     this.handleBlCreate(done)
        //   } else {
        //     console.log('error submit!!');
        //     return false;
        //   }
        // })
        this.handleBlCreate(done)
      } else {
        this.close('Cancel')
      }
    },

    // 生成提单
    handleBlCreate(done) {
      this.createItem.orderNo = this.oQuery.orderNo
      this.createItem.jointNo = this.oQuery.jointNo
      this.createItem.existBlId = this.existBlId
      blCreateBlFromExist(this.createItem)
        .then((res) => {
          this.$message({
            type: 'success',
            message: '生成成功',
            duration: 1000,
            onClose: () => {
              this.close('Confirm')
            }
          })
        })
        .catch(() => {
          this.close('Cancel')
        })
    }
  }
}
</script>

<style lang="scss">
.mbl-confirm {
  .el-dialog__body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 30px 20px 1px;
  }
}
</style>
