<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="form" :model="formData" label-width="70px">
			 <el-form-item label="商务备注：" prop="remark">
          <el-input size="mini" type="textarea" v-model="formData.remark" placeholder="请输入"  maxlength="255" show-word-limit></el-input>
       </el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { updatePricingRemark } from '@/api/fin/shBill'
export default {
   components: { BaseDialog },
   props: {
     row: {
       type: Object,
       default: () => {
         return {}
       }
     }
   },
   data() {
     return {
       dialogConfig: {
        	title: '修改商务备注',
          show: true,
          size: 'medium',
          width: '460px'
       },
       formData: {
          remark: ''
       }
     }
   },
   created() {
      this.formData.remark = this.row.pricingRemark
   },
   methods: {
      dialogCallback(action, done) {
        if (action === 'Confirm') {
          updatePricingRemark({billNo: this.row.billNo, pricingRemark: this.formData.remark})
          .then(res => {
            this.close('Confirm')
          })
        } else {
          this.close('Cancel')
        }
      },
      close(action, value, type) {
        this.$emit('close', action, value, type)
      }
   }
}
</script>

<style>

</style>