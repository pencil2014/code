<template>
	<BaseDialog class="declare-file-dlg" :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="uploadFileForm" :model="createdItem" :rules="rules" label-position="left" label-width="120px">
			<!-- <el-form-item class="file-type" label="附件类别：" prop="fileType">
				<el-select size="mini" placeholder="请选择附件类别" v-model="createdItem.fileType" clearable>
					<el-option v-for="(item, index) in dictMap.tradeDocName" :key="index" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item> -->
			<el-form-item class="file-upload">
				<el-upload ref="upload" drag class="" action="#" :multiple="false" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :http-request="handleImport" :file-list="fileList">
					<img :src="require('@/assets/icon-upload.png')" />

					<div class="txt-title">点击或将文件拖拽到这里导入</div>
					<p class="txt-desc">支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件，且文件大小限制在100M内</p>
				</el-upload>
				<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'

const defaultCreate = {
	orderNo: '',
	fileName: '',
	oid: '',
	fileType: ''
}

export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '附件上传',
				show: true,
				size: 'medium',
				width: '300px',
				btns: [
					{ label: '上传', action: 'Confirm', type: 'primary' },
					{ label: '取消', action: 'Cancel' }
				]
			},
			canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			rules: {
				// fileType: [{ required: true, message: '请选择附件类型', trigger: 'change' }]
			},
			createdItem: Object.assign({}, defaultCreate),
			// blFileTypeOptions: [
			// 	{ label: '保单', value: 'guarantee_slip' },
			// 	{ label: '产地证', value: 'co' },
			// 	{ label: '箱单发票', value: 'container_list_invoice' },
			// 	{ label: '船证', value: 'ship_paper' },
			// 	{ label: '其他', value: 'other' }
			// ]
		}
	},
	props: {
		// param: {
		//   type: Object,
		//   default: () => ({})
		// },
		docId: {
			type: Number,
			default: 0
		},
		docType:{
			type:String,
			default:''
		}
	},
	created() {},
	mounted() {
		console.log('🚀 ~ this.dictMap.documentRetrieveStatus', this.dictMap.documentRetrieveStatus)
	},

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
				this.$refs.uploadFileForm.validate(valid => {
					if (valid) {
						if (!this.validate() || !this.canSubmit) return
						this.$refs.upload.submit(done)
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
			this.fileList = []
			this.fileList.push(file)
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(done) {
			let params = {
				data: {
					docId: this.docId,
					orderNo: this.$route.query.orderNo,
					docType: this.docType
				},
				fileName: this.file
			}
			if (this.sizeLimit) {
				this.canSubmit = false
				this.handleProgress()
				this.$store
					.dispatch('order/airUpload', {
						uri: '/order/air/document/upload',
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
								this.close('Confirm', res.data.data)
							}
						})
					})
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
<style lang="scss">
.declare-file-dlg {
	.el-dialog__body {
		padding-bottom: 20px;
		.file-type {
			display: flex;
			margin-bottom: 0;
			.el-form-item__label {
				flex-basis: 72px;
				flex-grow: 0;
				flex-shrink: 0;
			}
			.el-form-item__content {
				flex: 1;
				margin-left: 0 !important;
				.el-select {
					width: 100%;
				}
			}
		}
		.file-upload {
			margin: 0 !important;
			padding: 0 !important;
			.el-upload-dragger {
				background-color: #f8f9fd;

				font-size: 12px;
				padding: 10px;

				.txt-title {
					text-align: center;
					color: #222222;
					margin: 4px 0;
				}
				.txt-desc {
					text-align: center;
					color: #bfbfbf;
				}
			}
			.el-form-item__content {
				margin-left: 0 !important;
				line-height: unset;
			}
		}
	}
}
</style>
