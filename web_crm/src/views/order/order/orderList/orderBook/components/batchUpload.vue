<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="uploadFileForm" :model="createdItem" :rules="rules" label-position="right" label-width="70px" class="create-form">
			<!-- <el-form-item label="附件类型" prop="fileType" :show-message="false">
				<el-select size="mini" placeholder="请选择" v-model="createdItem.fileType" clearable filterable>
					<el-option v-for="(item, index) in dictMap.blFileType" :key="index" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item> -->
			<el-form-item label="上传附件">
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
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { getFileBatchNo } from '@/api/order/bl'

const defaultCreate = {
	orderNo: '',
	fileName: '',
	oid: ''
	// fileType: ''
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
				// fileType: [{ required: true, message: '请选择附件类型', trigger: 'change' }]
			},
			createdItem: Object.assign({}, defaultCreate),
			serviceCode: sessionStorage.getItem('serviceCode'),
			interval: null
		}
	},
	props: {
		param: {
			type: Object,
			default: () => ({})
		},
		oid: {
			type: Number,
			default: 0
		}
	},
	created() {},
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
						if (this.oid) {
							//直接上传附件
							let data = {
								orderNo: this.$route.query.orderNo,
								oid: this.oid
							}
							let params = {
								data: data,
								fileName: this.fileList
							}
							getFileBatchNo().then(res => {
								params.data.fileBatchNo = res.data
								this.$store.dispatch('order/soUpload', {
									uri: '/order/insurance/upload',
									params: params
								}).then(res => {
									this.canSubmit = true
									if (res != 'error') {
										this.$message.success('上传成功!')
										this.close('Confirm', this.fileList)
									}
								}).catch(err => {
									clearInterval(this.interval)
									this.interval = null
									this.processLength=0
									this.showProcess=false
									this.fileList = []
									this.canSubmit = true
								})
							})
						} else {
							//点击保存上传
							this.close('Confirm', this.fileList)
						}
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
