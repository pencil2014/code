<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="uploadFileForm" :model="createdItem" :rules="rules" label-position="right" label-width="70px" class="create-form">
			<el-form-item label="上传附件">
				<el-upload
					ref="upload"
					drag
					class="upload-file-cont"
					action="#"
					:multiple="true"
					:auto-upload="false"
					:before-upload="getFile"
					:on-change="handleChangeFile"
					:on-remove="handleRemove"
					:http-request="handleImport"
					:file-list="fileList"
					:disabled="!canSubmit"
				>
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
			<el-form-item v-if="oid" label="签收单模板">
				<el-button size="mini" type="default" @click="handleOpenExportPop">模板下载</el-button>
			</el-form-item>
		</el-form>
		<!-- 输出签收单弹窗 -->
		<div v-if="exportPopShow">
			<ExportPop @close="exportPopClose" />
		</div>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import ExportPop from '@/views/order/order/orderList/podService/fclDelivery/components/exportPop.vue'

const defaultCreate = {
	orderNo: '',
	intrustNo: '',
	fileName: '',
	loadId: '',
	signTime: ''
}

export default {
	filters: {},
	inject: ['curRow'],
	data() {
		return {
			exportPopShow: false,
			oQuery: this.$route.query,
			dialogConfig: {
				title: '附件上传',
				show: true,
				size: 'medium',
				width: '460px'
			},
			canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			rules: {
				signTime: [{ required: true, message: '请选择签收时间', trigger: 'change' }]
			},
			createdItem: Object.assign({}, defaultCreate),
			interval: null
		}
	},
	props: {
		param: {
			type: Object,
			default: () => ({})
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			role: state => state.user.role
		}),
		oid() {
			let row = this.curRow()
			if (!row) return ''
			return row.oid
		}
	},
	components: {
		BaseDialog,
		ExportPop
	},
	watch: {},
	methods: {
		// 打开输出弹窗
		handleOpenExportPop() {
			this.exportPopShow = true
		},
		exportPopClose(action, value) {
			console.log(action, value)
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportPopShow = false
			}
		},
		// 输出
		handleExport(value) {
			console.log('🚀 ~ this.curRow', this.curRow)
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shipping/delivery/ltl/export/sign',
					data: {
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						oid: this.oid,
						docType: value.docType
					}
				})
				.then(res => {
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `签收单${this.$route.query.orderNo}.` + value.docType.toLowerCase()
					link.click()
				})
		},
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
			this.fileList = fileList
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(done) {
			// 根据后台需求数据格式
			const form = new FormData()
			// 文件对象
			form.append('fileName', this.file)
			form.append('orderNo', this.$route.query.orderNo)
			this.$route.query.jointNo && form.append('jointNo', this.$route.query.jointNo)

			if (this.sizeLimit) {
				this.canSubmit = false
				this.handleProgress()
				this.$store
					.dispatch('user/import', {
						uri: '/order/shipping/delivery/ltl/file/upload',
						params: form
					})
					.then(res => {
						this.processLength = 100
						this.showProcess = false
						this.fileList = []
						this.canSubmit = true
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '导入成功'
							})
							this.close('Confirm', res.data.data)
						}
					})
					.catch(err => {
						clearInterval(this.interval)
						this.interval = null
						this.processLength = 0
						this.showProcess = false
						this.fileList = []
						this.canSubmit = true
					})
			}
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
<style lang="scss"></style>
