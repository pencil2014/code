<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="bdRemarkForm">   
      <el-form-item label="" prop="bdRemark">
        <el-input 
					id="bdRemark"
					ref="bdRemark"
					type="textarea" 
					size="mini" 
					placeholder="请输入" 
					clearable 
					v-model="model"
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
import BaseDialog from '@/components/Base/Dialog/index'
export default {
	data() {
		return {
			dialogConfig: {
        title: '',
        show: true,
        size: 'medium',
        width: "500px"
			},
			model: ''
		}
	},
	props: {
    value: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: '备注'
    }
  },
	created() {
		this.model = this.value
    this.dialogConfig.title = this.title
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
        this.close('Confirm', this.model)
      } else {
        this.close('Cancel')
      }
    }
	}
}
</script>

<style lang="scss">
</style>
