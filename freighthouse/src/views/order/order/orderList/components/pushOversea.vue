<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form :show-message="false" ref="mailOnlyForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="bookReleaseMail-form">
			<el-form-item style="width: 50%; display: inline-block" label="海外分公司" prop="compDeptCode">
				<el-select v-model="createItem.compDeptCode" size="mini" placeholder="请选择" style="width: 100%">
					<el-option v-for="(item, index) in abroadCompanyList" :label="item.companyName" :value="item.companyCode" :key="index"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item style="width: 50%; display: inline-block" label="服务项" prop="serviceCodeList">
				<el-select clearable v-model="createItem.serviceCodeList" multiple collapse-tags size="mini" placeholder="请选择" style="width: 94%">
					<el-option v-for="(item, index) in serviceInfoList" :label="item.serviceName" :value="item.serviceCode" :key="index"> </el-option>
				</el-select>
				<el-tooltip style="width: 1%; margin-left: 1%" effect="dark" content="可选择需要海外分公司处理的服务项" placement="top">
					<i class="el-icon-question"></i>
				</el-tooltip>
			</el-form-item>
			<el-form-item label="AMS B/L NO." prop="amsBlNo">
				<el-input clearable maxlength="128" show-word-limit size="mini" placeholder="请输入" v-model="createItem.amsBlNo"></el-input>
			</el-form-item>
			<el-form-item label="ISF NO." prop="isfNo">
				<el-input clearable maxlength="128" show-word-limit size="mini" placeholder="请输入" v-model="createItem.isfNo"></el-input>
			</el-form-item>
			<el-form-item label="附件">
				<el-row>
					<el-col :span="24">
						<el-form-item label="">
							<el-upload ref="upload" style="margin-top: 10px" drag multiple action="#" :before-upload="beforeUpload" :on-change="handleChangeFile" :on-remove="handleRemove" :file-list="fileList" :http-request="uploadFile" :auto-upload="false">
								<div class="upload-demo">
									<img src="@/assets/icon-upload.png" />
									<div style="font-size: 12px" class="el-upload__text">
										<div>点击或将文件拖拽到这里导入</div>
										<p>支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
									</div>
								</div>
							</el-upload>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="备注" prop="applyRemark">
				<el-input maxlength="1024" show-word-limit type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="createItem.applyRemark"></el-input>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { abroadCompanyList } from '@/api/order/list'

const defaultCreate = {
	compDeptCode: '',
	applyRemark: '',
	serviceCodeList: [],
	amsBlNo: '',
	isfNo: ''
}

export default {
	data() {
		return {
			abroadCompanyList: [],

			oQuery: this.$route.query,
			dialogConfig: {
				title: '推送海外分公司',
				show: true,
				size: 'medium',
				width: '800px',
				btns: [
					{ label: '确定', action: 'Confirm', type: 'primary' },
					{ label: '取消', action: 'Cancel' }
				]
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {
				compDeptCode: [{ required: true, message: '', trigger: 'blur' }],
				serviceCodeList: [{ required: true, message: '', trigger: 'change', type: 'array' }],
				amsBlNo: [{ required: true, message: '', trigger: 'blur' }],
				isfNo: [{ required: false, message: '', trigger: 'blur' }]
			},

			file: '',
			fileList: [],
			defaultFileSize: 100,
			sizeLimit: true
		}
	},
	props: {
		param: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.getAbroadCompanyList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			shipOrderInfoData: state => state.order.orderInfoDataObj
		}),
		serviceInfoList() {
			return this.shipOrderInfoData.serviceInfoList.filter(item => item.serviceCode.startsWith('pod'))
		},
		// 美国分公司
		isUs() {
			let company = this.abroadCompanyList.find(item => item.companyCode === this.createItem.compDeptCode)
			return company?.countryCode === 'US'
		}
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		getAbroadCompanyList() {
			// 海外分公司
			abroadCompanyList({ isAbroad: 'yes' }).then(res => {
				if (res.data) {
					this.abroadCompanyList = res.data
					if (this.param.oid) {
						this.createItem = { ...this.createItem, ...this.param }
						this.fileList = this.param.fileNameList.map((item, index) => {
							return {
								name: item,
								fileNo: this.param.fileNoList[index]
							}
						})
					} else {
						this.createItem.compDeptCode = ''
						this.fileList = []
						this.createItem.applyRemark = ''
						this.createItem.amsBlNo = ''
						this.createItem.isfNo = ''
					}
				}
			})
		},

		uploadFile(file) {
			//this.file = file.file
		},
		beforeUpload(file) {
			this.file = file
			this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!this.sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return this.sizeLimit
		},
		handleChangeFile(file, fileList) {
			this.fileList = fileList
			console.log('this.fileList：', this.fileList)
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
			console.log('🚀 ~ this.fileList', this.fileList)
		},

		close(action) {
			this.$emit('close', action)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.mailOnlyForm.validate(valid => {
					if (valid) {
						this.handleToMail()
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// 推送
		handleToMail() {
			this.$refs.upload.submit()
			if (this.sizeLimit) {
				let data
				let serviceNameList = this.serviceInfoList.filter(item => this.createItem.serviceCodeList.includes(item.serviceCode)).map(service => service.serviceName)
				if (this.param.oid) {
					let list = this.param.fileNoList.filter(item => this.fileList.some(file => file.fileNo === item))
					let fileNoList
					if (list.length > 0) {
						fileNoList = JSON.parse(JSON.stringify(list))
					} else {
						fileNoList = null
					}

					data = {
						oid: this.param.oid,
						orderNo: this.$route.query.orderNo,
						compDeptCode: this.createItem.compDeptCode,
						amsBlNo: this.createItem.amsBlNo,
						isfNo: this.createItem.isfNo,
						serviceCodeList: this.createItem.serviceCodeList,
						serviceNameList,
						applyRemark: this.createItem.applyRemark,
						fileNoList
					}
				} else {
					data = {
						orderNo: this.$route.query.orderNo,
						compDeptCode: this.createItem.compDeptCode,
						amsBlNo: this.createItem.amsBlNo,
						isfNo: this.createItem.isfNo,
						serviceCodeList: this.createItem.serviceCodeList,
						serviceNameList,
						applyRemark: this.createItem.applyRemark
					}
				}
				console.log('🚀 ~ data', data)

				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/main/import/apply',
						params: { data, fileName: this.fileList }
					})
					.then(res => {
						this.fileList = []
						if (res === 'error') return
						this.$message({
							type: 'success',
							message: '推送成功',
							duration: 1000,
							onClose: () => {
								this.close('Confirm')
								console.log('🚀 ~ Confirm')
							}
						})
					})
					.catch(err => {
						this.fileList = []
					})
			}
		}
	}
}
</script>

<style lang="scss">
.bookReleaseMail-form {
	.upload-demo {
		padding: 10px 0;
	}
	.el-form-item {
		margin-bottom: 4px !important;
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
	.el-input,
	.el-textarea {
		font-size: 12px;
	}
	.el-form-item.is-error .mce-tinymce {
		border-color: #ff4949;
	}
	.el-radio__label {
		font-size: 12px;
	}
	.pr80 .el-input__inner {
		padding-right: 80px;
	}
}
.edit-container .bookReleaseMail-form .el-textarea__inner {
	padding: 0 5px;
}
</style>
