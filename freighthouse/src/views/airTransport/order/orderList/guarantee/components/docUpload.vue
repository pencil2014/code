<template>
	<el-dialog class="drop-so-notice" @close="handleClose" title="新增保险" :visible="true" width="550px">
		<el-form :show-message="false" id="add-insurance" ref="insuranceForm" :model="insuranceForm" size="mini" :rules="rules">
			<el-form-item label="订单号" prop="orderNo">
				<el-input disabled size="mini" v-model="insuranceForm.orderNo" placeholder="请输入"></el-input>
			</el-form-item>
			<el-form-item v-if="formType != 'file'" class="w50" label="货值" prop="goodsValue">
				<el-input @blur="validData" size="mini" v-model="insuranceForm.goodsValue" placeholder="请输入"></el-input>
			</el-form-item>
			<el-form-item v-if="formType != 'file'" class="w50" label="币种" prop="currency">
				<el-select v-model="insuranceForm.currency" size="mini" clearable placeholder="请选择">
					<el-option v-for="item in currencyList" :label="item.code" :value="item.code" :key="item.code"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item v-if="formType != 'file'" class="w50" label="投保受益人公司" prop="policyHolderCustId">
				<el-select default-first-option="" allow-create filterable v-model="insuranceForm.policyHolderCustId" size="mini" clearable placeholder="请选择">
					<el-option v-for="item in customerList" :label="item.name" :value="item.custid" :key="item.custid"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item v-if="formType != 'file'" class="w50" label="保险公司" prop="insuranceSupplierId">
				<el-select filterable v-model="insuranceForm.insuranceSupplierId" size="mini" clearable placeholder="请选择">
					<el-option v-for="item in supplierList" :label="item.name" :value="item.supplierId" :key="item.supplierId"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item v-if="formType != 'file'" label="赔付地" prop="payLocation">
				<el-input :maxlength="128" size="mini" v-model="insuranceForm.payLocation" placeholder="请输入"></el-input>
			</el-form-item>

			<el-form-item label="上传附件:" class="invoice-payment-add-form-upload" style="position: relative;width:100%;">
				<el-upload
					ref="upload"
					drag
					id="upload-file-notice"
					class="upload-file-drop"
					:action="uploadApi"
					style="width: 100%"
					:limit="2"
					:on-exceed="handleExceed"
					:multiple="true"
					:before-upload="getFile"
					:on-change="handleChangeFile"
					:on-remove="handleRemove"
					:file-list="fileList"
				>
					<div class="file-upload file-upload-bill">
						<div>
							<img class="file-upload-img file-upload-bill-img" src="@/assets/icon-upload.png" />
						</div>

						<div class="file-upload__text file-upload-bill__text">
							<div id="text-bill" class="txt">点击或将文件拖拽到这里导入</div>
							<p id="info-bill" class="info">支持 {{ this.comTypes.join(',') }} 格式文件， 且文件大小限制在100M内</p>
						</div>
					</div>
				</el-upload>
				<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
			</el-form-item>
		</el-form>

		<span slot="footer" class="dialog-footer">
			<el-button type="primary" @click="submitOrder" size="mini">提交</el-button>
			<el-button size="mini" @click="closeDialog">取消</el-button>
		</span>
	</el-dialog>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { blBillInfo, blBillUpload, blNoList } from '@/api/order/bl'
import { baseCurrencyList } from '@/api/base'
import { supplierList, customerList } from '@/api/crm/supplier.js'

export default {
	filters: {},
	data() {
		return {
			customerList: [],
			supplierList: [],
			currencyList: [],
			defaultFileSize: 100,
			processLength: 0,
			showProcess: false,
			comTypes: ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'jpg', 'png', 'jpeg', 'bmp', 'tif', 'image', 'txt', 'zip', 'rar'],
			file: null,
			insuranceForm: {
				oid: '',
				orderNo: this.$route.query.orderNo,
				goodsValue: '',
				currency: '',
				policyHolderCustId: '',
				policyHolderCustName: '',
				payLocation: '',
				insuranceSupplierId: '',
				insuranceSupplierName: ''
			},
			rules: {
				orderNo: [{ required: true, message: '', trigger: 'change' }],
				goodsValue: [{ required: true, message: '', trigger: 'change' }],
				currency: [{ required: true, message: '', trigger: 'change' }],
				policyHolderCustId: [{ required: true, message: '', trigger: 'change' }],
				insuranceSupplierName: [{ required: true, message: '', trigger: 'change' }],
				payLocation: [{ required: true, message: '', trigger: 'change' }],
				insuranceSupplierId: [{ required: true, message: '', trigger: 'change' }]
			},
			uploadApi: '/order/insurance/save',
			uploadParams: {},
			fileList: []
		}
	},
	props: {
		row: {
			type: Object,
			default: () => ({})
		},
		formType: {
			type: String,
			default: ''
		}
	},
	created() {
		this.getCustomerList()
		this.getSupplierList()
		this.getCurrencyList()
	},

	mounted() {
		console.log('🚀 ~ this.row.oid', this.row.oid)

		if (this.row.oid) {
			this.insuranceForm = this.row
		}
	},
	activated() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	components: {},
	watch: {},
	methods: {
		validData() {
			let reg = /^\d+(\.\d{0,2})?$/
			if (!reg.test(this.insuranceForm.goodsValue)) {
				this.insuranceForm.goodsValue = ''
				this.$message.warning('只能输入最多包含两位小数的数字!')
			}
			if (this.insuranceForm.goodsValue > 99999999) {
				this.$message.warning('数字最大不能超过99999999!')
				this.insuranceForm.goodsValue = ''
			}
		},
		//客户列表
		getCustomerList() {
			customerList({ pageSize: 1000 }).then(res => {
				this.customerList = res.data && res.data.list
			})
		},
		//供应商列表
		getSupplierList() {
			supplierList({ pageSize: 1000, query: [{ column: 'category', type: 'eq', value: 'insurance' }] }).then(res => {
				this.supplierList = res.data && res.data.list
			})
		},
		// 币别下拉列表
		getCurrencyList(queryString) {
			baseCurrencyList(queryString, 'valid').then(response => {
				this.currencyList = response.data
			})
		},
		handleExceed(file, fileList) {},
		// 上传前钩子获取file名
		getFile(file) {
			this.file = file
			let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return sizeLimit
		},
		handleChangeFile(file, fileList) {
			this.fileList = []
			this.fileList.push(file)
			this.file = file
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(done) {
			this.handleProgress()
			console.log('🚀 ~ this.file', this.file)
			this.$store
				.dispatch('order/insuranceUpload', {
					uri: this.uploadApi,
					params: { fileName: this.file, data: this.insuranceForm }
				})

				.then(res => {
					this.$emit('close')
					this.processLength = 100
					this.showProcess = false
					if (res.data && res.data.msg === 'success') {
						this.$message({
							type: 'success',
							message: '操作成功',
							duration: 1000
						})
					}
				})
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
		},

		handleClose() {
			this.closeDialog()
		},

		// 提交修改新增账单
		submitOrder() {
			console.log('🚀 ~ this.insuranceForm', this.insuranceForm)

			this.$refs.insuranceForm.validate((valid, obj) => {
				console.log('🚀 ~ obj', obj)
				// if (Object.keys(obj).length === 1 && obj.policyHolderCustId) {
				// 	valid = true
				// }

				if (valid) {
					//查找客户
					let custObj = this.customerList.find(item => item.custid === this.insuranceForm.policyHolderCustId)
					if (custObj) {
						this.insuranceForm.policyHolderCustName = custObj.name
					} else {
						this.insuranceForm.policyHolderCustName = this.insuranceForm.policyHolderCustId
						this.insuranceForm.policyHolderCustId = ''
					}
					//查找供应商
					let supplyObj = this.supplierList.find(item => item.supplierId === this.insuranceForm.insuranceSupplierId)
					this.insuranceForm.insuranceSupplierName = supplyObj ? supplyObj.name : ''

					this.uploadParams = this.insuranceForm
					if (this.$route.query.jointNo) this.insuranceForm.jointNo = this.$route.query.jointNo
					this.handleImport()
					// this.$refs.upload.submit()
				}
			})
		},

		// 关闭新增账单弹窗
		closeDialog() {
			this.$refs.insuranceForm.resetFields()
			this.fileList = []
			this.insuranceForm = {
				oid: '',
				orderNo: '',
				goodsValue: '',
				currency: '',
				policyHolderCustId: '',
				policyHolderCustName: '',
				payLocation: '',
				insuranceSupplierId: '',
				insuranceSupplierName: ''
			}
			this.$emit('close')
		}
	}
}
</script>
<style lang="scss">
.drop-so-notice {
	.el-dialog__body {
		overflow-y: unset;
		#add-insurance {
			display: flex;
			flex-wrap: wrap;
			.el-form-item {
				margin-bottom: 4px;
				width: 100%;
				display: flex;
				.el-form-item__label {
					font-weight: 700;
					width: 110px;
				}
				.el-form-item__content {
					flex: 1;
				}
			}
			.w50 {
				width: 50%;
			}
		}
	}
}

#upload-file-notice .file-upload-bill-img {
	padding-right: 10px;
	margin-left: 10px;
}
#upload-file-notice .file-upload-bill__text {
	display: inline-block;
}
#upload-file-notice #text-bill {
	text-align: left;
	padding-left: 10px;
	margin-bottom: 0;
}
#upload-file-notice #info-bill {
	text-align: left;
}

#upload-file-notice .file-upload-bill {
	display: flex;
	align-items: center;
}
#add-insurance .is-required label::before {
	display: unset;
}
</style>
