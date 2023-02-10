<template>
	<BaseDialog :config="dialogConfig" :model="createItem" :callback="dialogCallback">
    <el-form ref="bdRemarkForm" id="bdRemarkPop">   
      <el-form-item label="" prop="bdRemark">
        <el-input 
					id="bdRemark"
					ref="bdRemark"
					type="textarea" 
					size="mini" 
					placeholder="请输入" 
					clearable 
					v-model="createItem.bdRemark" 
					maxlength="512"
					show-word-limit
					:rows="6"
					class="bdRemark-textarea">
				</el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
export default {
	data() {
		return {
			dialogConfig: {
        title: '备注',
        show: true,
        size: 'medium',
        width: "500px"
			},
			createItem: {
				orderNo: '',
				bdRemark: ''
			}
		}
	},
	props: ['bdRemarkParam'],
	created() {
		this.createItem = {...this.bdRemarkParam}
	},
	mounted() {
		this.$nextTick(() => {
      this.$refs.bdRemark.focus()
    })
	},
	computed: {},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.close('Confirm', this.createItem)
      } else {
        this.close('Cancel')
      }
    }
	}
}
</script>

<style lang="scss">
#bdRemarkPop{
	.bdRemark-textarea textarea{
		// height: 138px !important;
	}
}
</style>
