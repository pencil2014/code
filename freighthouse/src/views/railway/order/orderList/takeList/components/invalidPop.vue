<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="uploadFileForm" :model="createdItem" :rules="rules" label-position="right" label-width="120px" class="create-form">
			<el-form-item label="失效原因：" prop="invalidReason" :show-message="false">
        <el-select v-model="createdItem.invalidReason" placeholder="" style="width:100%;" size="mini">
          <el-option
            v-for="item in dictMap['blFileInvalidReason']"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="失效备注：" :show-message="false">
        <el-input v-model="createdItem.invalidRemark" type="textarea" placeholder="" size="mini" maxlength="512" show-word-limit></el-input>
      </el-form-item>
			<el-form-item label="上传附件：" :required="createdItem.invalidReason==='bl_paper_invalid'" :show-message="false">
				<el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="true" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :file-list="fileList">
					<div class="file-upload">
						<img class="file-upload-img" :src="require('@/assets/icon-upload.png')" />
						<div class="file-upload__text">
							<div class="txt">点击或将文件拖拽到这里导入</div>
							<p class="info">支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
						</div>
					</div>
				</el-upload>
				<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { getFileBatchNo } from '@/api/order/bl'

const defaultCreate = {
	orderNo: '',
	fileName: '',
	invalidReason: 'bl_paper_invalid',
  invalidRemark: '',
}

export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '失效',
				show: true,
				size: 'medium',
				width: '600px'
			},
			canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			rules: {
        invalidReason: [{ required: true, message: '请选择失效原因', trigger: 'change' }],
			},
			createdItem: Object.assign({}, defaultCreate)
		}
	},
	props: {
		blNo: {
			type: String,
			default: '',
		},
		invalidPopRow: {
		  type: Object,
		  default: () => ({})
		},
	},
	created() {
		console.log('0816', this.dictMap['blFileInvalidReason'])
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			role: state => state.user.role
		})
	},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		close(action, value) {
			this.$emit('close', action, value)
		},
		validate() {
			if (this.createdItem.invalidReason==='bl_paper_invalid' && !this.fileList.length) {
				this.$message({
					type: 'error',
					message: '请先上传附件',
					duration: 1000,
					onClose: () => {}
				})
				return false
			}
			return true
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.uploadFileForm.validate(valid => {
					if (valid) {
						if (!this.validate() || !this.canSubmit) return
						this.handleImport()
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// 上传前钩子获取file名
		getFile(file) {
			this.file = file
			this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!this.sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return this.sizeLimit
		},
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList) {
			// this.fileList = []
			this.fileList = fileList
			this.createdItem.fileName = fileList
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
			this.createdItem.fileName = fileList
		},
		handleImport(done) {
			let params = {
				data: {
					blId: this.$route.query.blId,
					blNo: this.blNo,
					orderNo: this.$route.query.orderNo,
					invalidReason: this.createdItem.invalidReason,
					invalidRemark: this.createdItem.invalidRemark,
					fileType: this.createdItem.fileType,
					fileNos: this.invalidPopRow.fileNo.split(','),
				},
				fileName: this.fileList
			}
			if (this.fileList.length > 1) {
				getFileBatchNo().then(res => {
					params.data.fileBatchNo = res.data
					if (this.sizeLimit) {
						this.canSubmit = false
						this.handleProgress()
						this.$store
							.dispatch('order/soUpload', {
								uri: '/order/blFile/hblInvalid',
								params: params
							})
							.then(res => {
								this.processLength = 100
								this.showProcess = false
								this.fileList = []
								this.createdItem.fileName = []
								this.canSubmit = true
								if (res === 'error') return
								this.$message({
									type: 'success',
									message: '导入成功',
									duration: 1000,
									onClose: () => {
										this.close('Confirm')
									}
								})
							})
					}
				})
			} else {
				params.data.fileBatchNo = ''
				if (this.sizeLimit) {
					this.canSubmit = false
					this.handleProgress()
					this.$store
						.dispatch('order/soUpload', {
							uri: '/order/blFile/hblInvalid',
							params: params
						})
						.then(res => {
							this.processLength = 100
							this.showProcess = false
							this.fileList = []
							this.createdItem.fileName = []
							this.canSubmit = true
							if (res === 'error') return
							this.$message({
								type: 'success',
								message: '导入成功',
								duration: 1000,
								onClose: () => {
									this.close('Confirm')
								}
							})
						})
				}
			}
		},

		// 上传进度条
		handleProgress(file, fileList) {
			this.processLength = 0
			this.showProcess = true
			const interval = setInterval(() => {
				if (this.processLength >= 99) {
					clearInterval(interval)
					return
				}
				this.processLength += 1
			}, 200)
		}
	}
}
</script>
<style lang="scss" scoped>
.create-form {
	/deep/.el-form-item__label {
		text-align: right !important;
	}
	.fz-class {
		font-size: 12px;
	}
}
 
</style>
