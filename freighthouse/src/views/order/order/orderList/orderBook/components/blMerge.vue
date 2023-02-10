<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="mergeForm" :rules="rules" :model="mergeItem" label-position="right" label-width="70px" class="blMerge-form">    
      <el-form-item label="提单类型" prop="blType" :show-message="false">
        <el-select v-model="mergeItem.blType" size="mini" clearable placeholder="请选择" style="width: 100%">
          <el-option v-for="(item, index) in blTypeOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="提单编号" prop="newBlNo" v-if="mergeItem.blType === 'mbl'">
        <el-input type="" size="mini" placeholder="请输入" v-model="mergeItem.newBlNo"></el-input>
      </el-form-item> -->
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {blMerge} from '@/api/order/bl'

const defaultCreate = {
  blIdList: [],
  // newBlNo: undefined,
  orderNo: '',
  blType: ''
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '提单并单',
        show: true,
        size: 'medium',
        width: "360px"
      },

      mergeItem: Object.assign({}, defaultCreate),
      
      rules: {
        blType: [{required: true, message: '请选择提单类型', trigger: 'change'}]
      }

    }
  },
  props: {
    blIdList: {
      type: Array,
      default: () => ([])
    },
    orderInfo: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    // 硬编码过滤不显示MBL or HBL
    this.dictMap.blType = this.dictMap.blType.filter(item => item.value !== 'master_or_house')
    if (this.orderInfo.businessType === 'ship_export_lcl') {
      this.dictMap.blType = this.dictMap.blType .filter(item => item.value !== 'mbl')
      this.mergeItem.blType = 'hbl'
    }
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      orderNo: state => state.order.orderNo
    }),
    blTypeOptions() {
			// 硬编码过滤不显示MBL or HBL
			let result = []
			result = this.dictMap.blType.filter(item => item.value !== 'mbl_hbl')
			return result
		}
  },
  watch: {
  },
  components: {
    BaseDialog
  },
  methods: {
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },

    // 
    handleChange(val) {

    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.mergeForm.validate((valid) => {
          if (valid) {
            this.handleBlMerge(done)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },

    // 并单
    handleBlMerge(done) {
      this.mergeItem.jointNo = this.oQuery.jointNo,
      this.mergeItem.orderNo = this.orderNo || this.oQuery.orderNo
      this.mergeItem.blIdList = this.blIdList
      blMerge(this.mergeItem).then(res => {
        this.$message({
          type: 'success',
          message: '并单成功',
          duration: 1000,
          onClose: () => {
            this.close('Confirm')
          }
        })
      })
    }
  }
};
</script>

<style lang="scss">
.blMerge-form {
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label, .el-form-item__content{
		line-height: 20px;
	}
}
</style>
