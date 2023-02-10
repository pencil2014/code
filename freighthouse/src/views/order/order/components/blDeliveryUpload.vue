<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="blDeliveryApprove-form">
			<el-form-item label="附件类型" prop="fileType" :show-message="false">
				<el-select size="mini" placeholder="请选择" v-model="createItem.fileType" clearable filterable style="width: 100%">
					<el-option v-for="(item, index) in blFileTypeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="上传附件" prop="fileName">
				<el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="true" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :file-list="fileList" :disabled="!canSubmit">
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
import { blCreateBlFromExist } from '@/api/order/bl'
import { getFileBatchNo } from '@/api/order/bl'

const defaultCreate = {
	orderNo: '',
	fileType: 'mbl_telex_original',
	blId: '',
	fileName: '',
	receiveName: '',
	receivePhone: '',
	receiveAddress: '',
	receiveRemark: ''
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '上传附件',
				show: true,
				size: 'medium',
				width: '800px'
			},
			blFileTypeOptions: [
				{ label: '船东电放件', value: 'mbl_telex_original' },
				{ label: '电放申请保函', value: 'mbl_telex_release_guarantee' }
			],
			createItem: Object.assign({}, defaultCreate),
			rules: {
				fileType: [{ required: true, message: '请选择附件类型', trigger: 'change' }]
			},
			canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			// 为邮寄的出单方式:正本,借同行代理,HBL正本,同行借我司代理HBL正本
			isPost: ['original', 'jthdlzb', 'thzb'],
			interval: null
		}
	},
	props: {
		blId: {
			type: Number,
			default: 0
		},
		detailInfo: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		// 进口业务提单
		if (['ship_import_fcl', 'ship_import_lcl'].includes(this.detailInfo.businessType)) {
			this.blFileTypeOptions = [
				{ label: '提单', value: 'bl' }
			]
			this.createItem.fileType = 'bl'
		}
	},

	mounted() {},
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
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		validate() {
			if (!this.fileList.length) {
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
				this.$refs.createForm.validate(valid => {
					if (valid) {
						if (!this.canSubmit) return
						if (!this.validate()) return
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
			this.fileList = fileList
			// this.fileList = []
			// this.fileList.push(file)
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(done) {
			let params = {
				data: {
					blId: this.blId,
					orderNo: this.$route.query.orderNo,
					fileType: this.createItem.fileType
				},
				fileName: this.fileList
			}
			let uri = '/order/blFile/upload'
			if (['ship_import_fcl', 'ship_import_lcl'].includes(this.detailInfo.businessType)) {
				uri = '/order/shipping/import/bl/file/upload'
			}
			if (this.fileList.length > 1) {
				getFileBatchNo().then(res => {
					params.data.fileBatchNo = res.data
					if (this.sizeLimit) {
						this.canSubmit = false
						this.handleProgress()
						this.$store
							.dispatch('order/soUpload', {
								uri: uri,
								params: params
							})
							.then(res => {
								this.processLength = 100
								this.showProcess = false
								this.fileList = []
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
							uri: uri,
							params: params
						})
						.then(res => {
							this.processLength = 100
							this.showProcess = false
							this.fileList = []
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
						.catch(err => {
							clearInterval(this.interval)
							this.interval = null
							this.processLength=0
							this.showProcess=false
							this.fileList = []
							this.canSubmit = true
						})
				}
			}

			// if (this.sizeLimit) {
			// 	this.canSubmit = false
			// 	this.file && this.handleProgress()
			// 	this.$store
			// 		.dispatch('order/soUpload', {
			// 			uri: '/order/shipping/bl/file/upload',
			// 			params: params
			// 		})
			// 		.then(res => {
			// 			this.processLength = 100
			// 			this.showProcess = false
			// 			this.fileList = []
			// 			this.canSubmit = true
			// 			if (res === 'error') return
			// 			this.$message({
			// 				type: 'success',
			// 				message: '导入成功',
			// 				duration: 1000,
			// 				onClose: () => {
			// 					this.close('Confirm')
			// 				}
			// 			})
			// 		})
			// }
		},
		// 上传进度条
		handleProgress(file, fileList) {
			this.processLength = 0
			this.showProcess = true
			this.interval = setInterval(() => {
				if (this.processLength >= 99) {
					clearInterval(this.interval)
					return
				}
				this.processLength += 1
			}, 200)
		}
	}
}
</script>

<style lang="scss">
.blDeliveryApprove-form {
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
	.el-input,
	.el-textarea {
		font-size: 12px;
	}
}
.edit-container .blDeliveryApprove-form .el-textarea__inner {
	padding: 0 5px;
}
</style>
