<template>
	<div class="cargo-claim">
		<div id="so-list-form">
			<div>
				<el-form class="" :model="cargoClaim" ref="cargoClaimform" :rules="rules" :show-message="false" label-position="right" label-width="80px">
					<el-row>
						<el-col :span="6">
							<el-form-item class="" label="起运港">
								<el-select
									size="mini"
									:disabled="disabledState"
									style="width: 100%"
									clearable
									v-model="cargoClaim.polPortCode"
									filterable
									remote
									reserve-keyword
									placeholder="请选择起运港"
									:remote-method="
										val => {
											polPortRemoteMethod(val, cargoClaim.polPortCode)
										}
									"
									@focus="polPortRemoteMethod('', cargoClaim.polPortCode)"
								>
									<el-option v-for="item in airPortArr" :disabled="item.value === cargoClaim.podPortCode" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item class="" label="目的地">
								<el-select
									style="width: 100%"
									:disabled="disabledState"
									size="mini"
									clearable
									v-model="cargoClaim.podPortCode"
									filterable
									remote
									reserve-keyword
									placeholder="请选择目的地"
									:remote-method="
										val => {
											destinationPortMethod(val, cargoClaim.podPortCode)
										}
									"
									@focus="destinationPortMethod('', cargoClaim.podPortCode)"
									@change="handleChangePodPortCode"
								>
									<el-option v-for="item in destinationPort" :disabled="item.value === cargoClaim.polPortCode" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item class="" label="报关方式">
								<el-select v-model="cargoClaim.airCustomsType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="bdAndPricingdisabledState">
									<el-option v-for="(item, index) in dictMap.airCustomsType" :label="item.label" :value="item.value" :key="index"> </el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item class="" label="系统航线">
								<el-input clearable size="mini" v-model="cargoClaim.airSysLineName" placeholder="请输入系统航线" disabled></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item class="" label="入仓编号">
								<el-input size="mini" v-model="cargoClaim.poNo" maxlength="64" clearable placeholder="请输入" :disabled="poNoDisabledState"> </el-input>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="入仓单">
								<el-input size="mini" v-show="0" v-model="cargoClaim.poFileName" clearable placeholder="请输入" disabled>
									<!-- 占位用来触发表单校验 -->
								</el-input>
								<upload-input v-model="cargoClaim.poFileName" @downloadFile="handleDownload" @handleView="handleView" @uploadFile="handleAdd" @delFile="delFile" :disabled="poNoDisabledState" />
							</el-form-item>
						</el-col>
						<el-col :span="6" v-if="!['draft', 'refuse', 'pre_submit', 'submit'].includes(orderStatus)">
							<el-form-item label="业务日期">
								<elDatePickerLimit size="mini" :style="{ width: showChangeBizDate ? 'calc(100% - 42px)' : '100%' }" v-model="cargoClaim.bizDate" disabled type="date" style="width: 100%" clearable placeholder="业务日期" value-format="yyyy-MM-dd" />
								<el-button v-if="showChangeBizDate" @click="handleChangeBizDate" size="mini">修改</el-button>
							</el-form-item>
						</el-col>
						<el-col :span="6" v-if="!['draft', 'refuse', 'pre_submit', 'submit'].includes(orderStatus)">
							<el-form-item label="海关是否查验">
								<el-radio-group v-model="cargoClaim.isCustomsInspection">
									<el-radio :label="item.value" v-for="(item, index) in yesOrNoOptions" :key="index" :disabled="poNoDisabledState">{{ item.label }}</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="6" v-if="!['draft', 'refuse', 'pre_submit', 'submit'].includes(orderStatus)">
							<el-form-item class="timeSpecial" label="海关放行时间">
								<elDatePickerLimit :field="'customsReleaseTime'" size="mini" v-model="cargoClaim.customsReleaseTime" type="date" style="width: 100%" clearable placeholder="请选择海关放行时间" value-format="yyyy-MM-dd" :disabled="poNoDisabledState"/>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row>
						<el-col :span="12">
							<!--  prop="bookingFileName" -->
							<el-form-item label="托书附件" :show-message="false">
								<!-- <el-input size="mini" v-show="0" v-model="cargoClaim.bookingFileName" clearable placeholder="请输入" disabled>
                </el-input> -->
								<BookUploadInput class="rail-file-upload" @click.native="uploadFile" :fetchFileList="cargoClaim.bookingFiles" @selectFile="selectFile" @delFile="orderFileDelete" @downloadFile="handleDownloadBook" @handleView="handleViewBook" :disabled="disabledState" />
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item class="" label="委托备注">
								<el-input @dblclick.native="showRemarkDetail(cargoClaim.intrustRemark)" type="textarea" rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="cargoClaim.intrustRemark" :disabled="disabledState"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item v-if="!['draft', 'refuse', 'pre_submit', 'submit'].includes(orderStatus) || isPricing" label="审单备注" label-width="80px">
								<el-input
									@dblclick.native="showRemarkDetail(cargoClaim.auditRemark)"
									clearable
									size="mini"
									maxlength="512"
									type="textarea"
									rows="4"
									show-word-limit
									v-model="cargoClaim.auditRemark"
									:disabled="!['draft', 'refuse', 'pre_submit', 'submit'].includes(orderStatus)"
								></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="备注" label-width="80px" prop="bdRemark" :show-message="false" v-if="$route.query.source !== 'jointList'">
								<el-input
									@dblclick.native="showRemarkDetail(cargoClaim.bdRemark)"
									class="loadingBdRemark"
									type="textarea"
									clearable
									rows="4"
									size="mini"
									placeholder="请输入"
									maxlength="512"
									show-word-limit
									v-model="cargoClaim.bdRemark"
									@blur="handleSaveRemark"
									:disabled="!['draft', 'refuse', 'pass', 'complete'].includes(orderStatus)"
								></el-input>
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
				<!-- <el-button @click="validateForm">校验</el-button> -->
			</div>
		</div>
		<div v-if="uploadPopShow">
			<FileUpload @close="uploadPopClose" :fileType="'AIR_PO'" />
		</div>
		<div v-if="changeBizDateShow">
			<ChangeBizDatePop @close="changeBizDateClose" :bizDate="cargoClaim.bizDate"></ChangeBizDatePop>
		</div>
		<div v-if="remarkVisible">
			<AuditRemark :auditRemark="remarkContent" @close="auditClose" />
		</div>
		<div v-if="bookUploadPopShow">
      <BookFileUpload @close="bookUploadPopClose" />
    </div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import UploadInput from '@/components/Base/upload/upload-input.vue'
import { fileDelete, bookFileDelete } from '@/api/airTransport/order'
import FileUpload from '../orderBook/components/fileUpload'
import BookUploadInput from './booking-file-upload.vue'
import ChangeBizDatePop from './changeBizDatePop'
import { bizdateChange } from '@/api/order/list'
import AuditRemark from '@/views/order/order/orderList/components/auditRemark'
import BookFileUpload from './bookFileUpload'

const dateObj = {
	poFileName: '',
	poFileNo: '',
	polPortCode: '',
	podPortCode: '',
	airSysLineCode: '',
	airSysLineName: '',
	airCustomsType: '',
	bookingFiles: '',
	bookingFileName: '',
	auditRemark: '',
	countryCname: '',
	countryEname: '',
	countryCode: ''
}
export default {
	components: { UploadInput, FileUpload, BookUploadInput, ChangeBizDatePop, AuditRemark, BookFileUpload },
	data() {
		return {
			bookUploadPopShow:false,
			remarkContent: '',
			remarkVisible: false,
			bizDateModify: this.$store.state.airTransport.airOrderInfo.bizDateModify,
			changeBizDateShow: false,
			uploadPopShow: false,
			oQuery: this.$route.query,
			rules: {
				polPortCode: [{ required: true, message: '请输入', trigger: 'change' }],
				podPortCode: [{ required: true, message: '请输入', trigger: 'change' }],
				airSysLineCode: [{ required: true, message: '请输入', trigger: 'change' }],
				airCustomsType: [{ required: true, message: '请输入', trigger: 'change' }],
				poFileNo: [{ required: true, message: '请输入', trigger: 'change' }],
				poFileName: [{ required: true, message: '请输入', trigger: 'change' }],
				bookingFileName: [{ required: true, message: '请选择', trigger: 'change' }]
			},
			airPortArr: [], // 起运港
			destinationPort: [], // 卸货港
			airSysLineArr: [], // 航线
			uploadApi: '/order/air/book/file/upload',
			yesOrNoOptions: [
				{ label: '是', value: 'Y' },
				{ label: '否', value: 'N' }
			]
		}
	},
	props: {
		cargoClaim: {
			type: Object,
			default: () => dateObj
		},
		orderStatus: {
			type: String,
			default: ''
		},
		isPricing: {
			type: Boolean,
			default: false
		},
		isBd: {
			type: Boolean,
			default: false
		},
		isOp: {
			type: Boolean,
			default: false
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.airTransport.orderList.ordDetRole,
			roles: state => state.user.roles,
			airOrderInfo: state => state.airTransport.airOrderInfo,
			userId: state => state.user.userId
		}),
		showChangeBizDate() {
			if (this.isOp && this.airOrderInfo.orderStatus !== 'complete' && this.airOrderInfo.finCloseStatus !== 'yes' && this.bizDateModify === null && ['st06', 'st22', 'st21', 'st14'].includes(this.airOrderInfo.serviceType)) {
				return true
			} else {
				return false
			}
		},

		bdAndPricingdisabledState() {
			if (this.airOrderInfo.orderStatus === 'pre_submit') {
				if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
					return true
				} else {
					return false
				}
			} else {
				// 业务和商务可以填写部分的权限
				if (this.isBd) {
					if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
						return true
					} else {
						return false
					}
				} else if (this.isPricing) {
					if (!['draft', 'refuse', 'pre_submit', 'submit'].includes(this.orderStatus)) {
						return true
					} else {
						return false
					}
				} else {
					return true
				}
			}
		},
		viewState() {
			if (this.airOrderInfo.orderStatus === 'pre_submit') {
				if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
					return true
				} else {
					return false
				}
			} else {
				if (this.isBd && !['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
					return true
				}
				if (this.isOp && !['pass'].includes(this.orderStatus)) {
					return true
				}
				return false
			}
		},
		disabledState() {
			if (this.airOrderInfo.orderStatus === 'pre_submit') {
				if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
					return true
				} else {
					return false
				}
			} else {
				// 业务可以填写部分的权限
				if (this.isBd) {
					if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
						return true
					} else {
						return false
					}
				} else if (this.isPricing) {
					if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
						return true
					} else {
						return false
					}
				} else {
					return true
				}
			}
		},
		poNoDisabledState() {
			if (this.airOrderInfo.orderStatus === 'pre_submit') {
				if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
					return true
				} else {
					return false
				}
			} else {
				// 入仓单编号，业务和op才能编辑
				if (this.isBd) {
					if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
						return true
					} else {
						return false
					}
				} else if (this.isPricing) {
					if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
						return true
					} else {
						return false
					}
				} else if (this.isOp) {
					if (!['pass', 'break'].includes(this.orderStatus)) {
						return true
					} else {
						return false
					}
				} else {
					return true
				}
			}
		}
	},
	watch: {},
	methods: {
		uploadFile(e) {
      if (e.target.tagName === 'INPUT') {
        this.bookUploadPopShow = true
      }
    },
		// 上传弹窗关闭回调
    bookUploadPopClose(action) {
      this.bookUploadPopShow = false
      if (action === 'Confirm') {
        this.$emit('getInfo')
      }
    },
		showRemarkDetail(val) {
			this.remarkContent = val
			this.remarkVisible = true
		},

		auditClose() {
			this.remarkVisible = false
		},
		//保存编辑备注
		handleSaveRemark() {
			this.$emit('saveRemark')
		},
		changeBizDateClose(action, value) {
			if (action === 'Confirm') {
				this.$confirm('仅有一次手动修改机会，是否确定要修改', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						bizdateChange(value)
							.then(res => {
								this.changeBizDateShow = false
								this.$message({ type: 'success', message: '修改成功' })
								this.bizDateModify = value.bizDate
								this.cargoClaim.bizDate = value.bizDate
							})
							.finally(() => {})
					})
					.catch(() => {})
			} else {
				this.changeBizDateShow = false
			}
		},
		handleChangeBizDate() {
			this.changeBizDateShow = true
		},
		handleViewBook(fileName, fileNo) {
			this.$store.dispatch('order/previewFile', {
				fileNo: fileNo,
				fileName: fileName,
				fileNo
			})
		},
		handleDownloadBook(fileName, fileNo) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: fileNo
					}
				})
				.then(res => {
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = fileName
					link.click()
				})
		},
		orderFileDelete(fileNo) {
			// 托书删除
			bookFileDelete({
				fileNo: fileNo
			}).then(res => {
				this.$delete(this.cargoClaim.bookingFiles, fileNo)
			})
		},
		selectFile(cargoClaim, fileLength) {
			this.$emit('selectFile', cargoClaim, fileLength)
		},
		handleView() {
			this.$store.dispatch('order/previewFile', {
				fileNo: this.cargoClaim.poFileNo,
				fileName: this.cargoClaim.poFileName
			})
		},
		// 附件下载
		handleDownload() {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: this.cargoClaim.poFileNo
					}
				})
				.then(res => {
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = this.cargoClaim.poFileName
					link.click()
				})
		},
		handleAdd() {
			// 上传
			this.uploadPopShow = true
		},
		// 上传弹窗关闭回调
		uploadPopClose(action) {
			this.uploadPopShow = false
			if (action === 'Confirm') {
				this.$emit('getInfo')
			}
		},
		validateForm() {
			return new Promise((resolve, reject) => {
				this.$refs.cargoClaimform.validate(valid => {
					if (valid) {
						resolve()
					} else {
						reject()
					}
				})
			})
		},
		successFn(file) {
			// 上传文件成功
			let uploadParams = {
				orderNo: this.$route.query.orderNo,
				fileType: 'PO'
			}
			this.$store
				.dispatch('airTransport/soUpload', {
					uri: this.uploadApi,
					params: { fileName: file, data: uploadParams }
				})
				.then(res => {
					if (res.data && res.data.msg === 'success') {
						this.$emit('getInfo')
						this.$message({
							type: 'success',
							message: '上传成功',
							duration: 1000
						})
					}
				})
		},
		delFile() {
			// 删除文件
			fileDelete({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				fileNo: this.cargoClaim.poFileNo
			}).then(() => {
				this.cargoClaim.poFileName = ''
				this.cargoClaim.poFileNo = ''
			})
		},
		// 空运港口
		airPortSearch(portName, portCodes, state, type, code) {
			this.$store.dispatch('dict/airportList', { portName, portCodes, state }).then(data => {
				let portList = data.map(ele => {
					return Object.assign(ele, {
						value: ele.portCode,
						label: `${ele.portCode} (${ele.ename}-${ele.cname})`
					})
				})
				let found = portList.find(ele => ele.portCode === code)
				if (code && !found && !portName) {
					// 当前港口选中 && 选中值不在默认30条中 && 模糊搜索没有值
					this.$store
						.dispatch('dict/airportList', {
							portName: '',
							portCodes: code,
							state: this.state
						})
						.then(res => {
							let activePort = res.map(ele => {
								return Object.assign(ele, {
									value: ele.portCode,
									label: `${ele.portCode} (${ele.ename}-${ele.cname})`
								})
							})
							this[type] = [...activePort, ...portList]
						})
				} else {
					this[type] = [...portList]
				}
			})
		},
		polPortRemoteMethod(el, code) {
			// 远程搜索起运港
			this.airPortSearch(el, '', 'valid', 'airPortArr', code)
		},
		destinationPortMethod(el, code) {
			// 卸货港
			this.airPortSearch(el, '', 'valid', 'destinationPort', code)
		},
		handleChangePodPortCode(val) {
			if (!val) {
				this.$set(this.cargoClaim, 'airSysLineCode', '')
				this.$set(this.cargoClaim, 'airSysLineName', '')

				this.$set(this.cargoClaim, 'countryCname', '')
				this.$set(this.cargoClaim, 'countryEname', '')
				this.$set(this.cargoClaim, 'countryCode', '')
				return
			}
			let portItem = this.destinationPort.find(item => item.portCode === val)
			this.$set(this.cargoClaim, 'countryCname', portItem.countryCname)
			this.$set(this.cargoClaim, 'countryEname', portItem.countryEname)
			this.$set(this.cargoClaim, 'countryCode', portItem.countryCode)
			// 通过目的地查询系统航线
			this.$store
				.dispatch('dict/airportList', {
					portName: '',
					portCodes: val,
					state: this.state
				})
				.then(data => {
					if (data.length) {
						this.$set(this.cargoClaim, 'airSysLineCode', data[0].sysLineCode)
						this.$set(this.cargoClaim, 'airSysLineName', data[0].sysLineName)
					} else {
						this.$set(this.cargoClaim, 'airSysLineCode', '')
						this.$set(this.cargoClaim, 'airSysLineName', '')
					}
				})
		}
	}
}
</script>

<style lang="scss">
.cargo-claim {
	margin: 13px 12px;
	.el-form-item__label {
		padding-right: 3px !important;
		line-height: 20px;
	}
	.el-form-item__content {
		line-height: 20px;
	}
	.el-col-sm-3-4 {
		width: 14.28%;
	}
	.el-col-sm-10-4 {
		width: 28.6%;
	}
	.el-radio__label {
		font-size: 12px;
	}
}
</style>
