<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createSoForm" :rules="rules" :model="createdItem" class="create-so-form" label-width="80px">
			<el-row class="create-so">
				<el-col :span="12">
					<el-form-item label="船公司" prop="shipCarrierCode" :show-message="false" class="flex">
						<el-select
							size="mini"
							v-model="createdItem.shipCarrierCode"
							filterable
							clearable
							remote
							style="width: 100%"
							placeholder="请输入"
							:remote-method="val => shipCarrierRemoteMethod(val)"
							@visible-change="val => shipCarrierVisibleChange(val)"
							@change="handleChangeShipCarrier"
						>
							<el-option v-for="(item, index) in shipCarrierOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
						<el-button type="default" size="mini" style="margin-left: 5px;" @click="getShippingCarrierUrl(createdItem.shipCarrierCode)">船司官网</el-button>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="订舱代理" prop="bkgAgentSupplierId">
						<el-select
							size="mini"
							v-model="createdItem.bkgAgentSupplierId"
							filterable
							clearable
							remote
							style="width: 100%"
							placeholder="请输入"
							:remote-method="val => val && bkgAgentSupplierRemoteMethod(val)"
							@visible-change="val => bkgAgentSupplierVisibleChange(val)"
							@change="handleChangeBkgAgentSupplier"
						>
							<el-option v-for="(item, index) in bkgAgentSupplierOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="大船船名" prop="vessel" :show-message="false">
						<el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="createdItem.vessel"
							:fetch-suggestions="(queryString, cb) => querySearchVessel(queryString, cb)"
							:trigger-on-focus="false"
							placeholder="请输入"
							:maxlength="128"
							@select="value => handleSelectVessel(value)"
							@clear="value => handleClearVessel(value)"
						></el-autocomplete>
						<!-- <el-input v-model="createdItem.vessel" placeholder="请输入船名" size="mini" clearable></el-input> -->
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="截补料时间" prop="siCutOff">
						<elDatePickerLimit 
						  :field="'siCutOff'"
							type="datetime" 
							:popper-class="'hideMinute'"
							format="yyyy-MM-dd HH"
							value-format="yyyy-MM-dd HH"
							v-model="createdItem.siCutOff" 
							clearable 
							placeholder="选择时间" 
							size="mini" 
							style="width: 100%"> 
						</elDatePickerLimit>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="大船航次" prop="voyage" :show-message="false">
						<el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="createdItem.voyage"
							:fetch-suggestions="(queryString, cb) => querySearchVoyage(queryString, cb, createdItem.vessel)"
							:trigger-on-focus="false"
							placeholder="请输入"
							:maxlength="128"
							@select="value => handleSelectVoyage(value)"
							@clear="value => handleClearVoyage(value)"
						></el-autocomplete>
						<!-- <el-input v-model="createdItem.voyage" placeholder="请输入航次" size="mini" clearable></el-input> -->
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="驳船收货地">
						<el-select
							size="mini"
							v-model="createdItem.porPortCode"
							filterable
							:remote="false"
							clearable
							style="width: 100%"
							placeholder="请输入"
							:filter-method="val => porPortRemoteMehod(val, 'porPortCode')"
							@visible-change="val => porPortVisibleChange(val, 'porPortCode')"
							@change="handleChangePortCode"
						>
							<el-option v-for="item in porPortList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="截关日期" prop="cutOffDate">
						<elDatePickerLimit v-model="createdItem.cutOffDate" type="date" value-format="yyyy-MM-dd"  clearable placeholder="选择日期" size="mini" style="width: 100%"> </elDatePickerLimit>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="大船起运港" prop="polPortCode" :show-message="false">
						<el-select
							size="mini"
							v-model="createdItem.polPortCode"
							filterable
							:remote="false"
							clearable
							style="width: 100%"
							placeholder="请输入"
							:filter-method="val => polPortRemoteMehod(val, 'polPortCode')"
							@visible-change="val => polPortVisibleChange(val, 'polPortCode')"
							@change="handleChangePortCode"
						>
							<el-option v-for="item in polPortList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="截舱单时间" prop="manifestCutOff">
						<elDatePickerLimit 
							type="datetime"
							:popper-class="'hideMinute'"
							format="yyyy-MM-dd HH"
							value-format="yyyy-MM-dd HH"
							v-model="createdItem.manifestCutOff" 
							clearable 
							placeholder="选择时间" 
							size="mini" 
							style="width: 100%"> 
						</elDatePickerLimit>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="卸货港" prop="unloadingPortCode" :show-message="false">
						<el-select
							size="mini"
							v-model="createdItem.unloadingPortCode"
							filterable
							:remote="false"
							clearable
							style="width: 100%"
							placeholder="请输入"
							:filter-method="val => unloadPortRemoteMehod(val, 'unloadingPortCode')"
							@visible-change="val => unloadPortVisibleChange(val, 'unloadingPortCode')"
							@change="handleChangePortCode"
						>
							<el-option v-for="item in unloadPortList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="SO号" prop="so" :show-message="false">
						<el-input v-model="createdItem.so" placeholder="请输入SO号" size="mini" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="目的地" prop="podPortCode" :show-message="false">
						<el-select
							size="mini"
							v-model="createdItem.podPortCode"
							filterable
							:remote="false"
							clearable
							style="width: 100%"
							placeholder="请输入"
							:filter-method="val => podPortRemoteMehod(val, 'podPortCode')"
							@visible-change="val => podPortVisibleChange(val, 'podPortCode')"
							@change="handleChangePortCode"
						>
							<el-option v-for="item in podPortList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="截港时间" prop="cvCutOff">
						<elDatePickerLimit 
							type="datetime"
							:popper-class="'hideMinute'"
							format="yyyy-MM-dd HH"
							value-format="yyyy-MM-dd HH"
							v-model="createdItem.cvCutOff"  
							clearable 
							placeholder="选择时间" 
							size="mini" 
							style="width: 100%"> 
						</elDatePickerLimit>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="SO备注" prop="remark">
						<el-input v-model="createdItem.remark" placeholder="请输入SO备注" size="mini" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="是否重柜" prop="isHeavy">
						<el-radio-group v-model="createdItem.isHeavy">
							<el-radio label="y">是</el-radio>
							<el-radio label="n">否</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="箱型箱量" prop="containerInfo" :show-message="false">
						<el-row v-for="(item, index) in containerList" :key="index" class="containerList">
							<el-col :span="6">
								<el-select size="mini" placeholder="请选择箱型" filterable v-model="item.containerType" clearable @change="handleChangeContainerType">
									<el-option v-for="(item, index) in containerTypeOptions" :key="index" :label="item.label" :value="item.value" :disabled="item.disabled"></el-option>
								</el-select>
							</el-col>
							<el-col :span="1" class="center">*</el-col>
							<el-col :span="6">
								<el-input clearable size="mini" placeholder="请输入箱量" v-model.number="item.num"></el-input>
							</el-col>
							<el-col :span="11">
								<div class="btn-minus" @click="handleDeleteContainer(item, index)" v-if="containerList.length > 1"></div>
								<div class="btn-plus" @click="handleAddContainer" v-if="index+1 === containerList.length"></div>
							</el-col>
						</el-row>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="SO附件">
						<el-upload
							ref="upload"
							class="upload-demo"
							drag
							:multiple="false"
							action="#"
							:on-preview="handlePreview"
							:before-upload="beforeUpload"
							:on-change="handleChangeFile"
							:on-remove="handleRemove"
							:file-list="fileList"
							:http-request="handleUpload"
							:auto-upload="false"
							:disabled="!canSubmit"
						>
							<div class="el-upload">
								<img src="../../../../../../assets/icon-upload.png" />
								<div class="el-upload__text">
									<div>点击或将文件拖拽到这里导入</div>
									<p>
										支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内
									</p>
								</div>
							</div>
						</el-upload>
						<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</BaseDialog>
</template>

<script>
import store from '@/store'
import BaseDialog from '@/components/Base/Dialog/index'
import { objToForm } from '@/utils/tools'
import { addSO, getBookContainerTypeList } from '@/api/order/book/list'

export default {
	data() {
		return {
			dialogConfig: {
				title: '新增SO',
				show: true,
				size: '60%',
				width: '600px'
			},

			createdItem: {
				bkgReqNo: this.orderInfo.bkgReqNo,
				shipCarrierCode: this.orderInfo.ship.shipCarrierCode || '',
				bkgAgentSupplierId: this.orderInfo.ship.bkgAgentSupplierId || '',
				vessel: this.orderInfo.ship.vessel || '',
				voyage: this.orderInfo.ship.voyage || '',
				cutOffDate: this.orderInfo.ship.cyCutOff || '',
				manifestCutOff: this.orderInfo.ship.manifestCutOff || '',
				cvCutOff: '',
				so: '',
				remark: '',
				siCutOff: '',
				porPortCode: this.orderInfo.barge ? this.orderInfo.barge.porPortCode : '',
				polPortCode: this.orderInfo.ship.polPortCode || '',
				podPortCode: this.orderInfo.ship.podPortCode || '',
				unloadingPortCode: this.orderInfo.ship.unloadingPortCode || '',
				containerInfo: '',
				isHeavy: ''
			},
			rules: {
				shipCarrierCode: [{ required: true, message: '', trigger: 'change' }],
				vessel: [{ required: true, message: '请输入船名', trigger: 'blur' }],
				voyage: [{ required: true, message: '请输入航次', trigger: 'blur' }],
				// cutOffDate: [{required: true, message: '请选择截关日期', trigger: 'change'}],
				// manifestCutOff: [{required: true, message: '请选择截舱单时间', trigger: 'change'}],
				// cvCutOff: [{required: true, message: '请选择截港时间', trigger: 'change'}],
				so: [{ required: true, message: '请输入SO号', trigger: 'blur' }],
				// siCutOff: [{required: true, message: '请选择截补料时间', trigger: 'change'}],
				polPortCode: [{ required: true, message: '请输入大船起运港', trigger: 'change' }],
				unloadingPortCode: [{ required: true, message: '请输入卸货港', trigger: 'change' }],
				podPortCode: [{ required: true, message: '请输入目的地', trigger: 'change' }],
				containerInfo: [{ required: true, message: '请输入箱型箱量', trigger: 'blur' }],
				isHeavy: [{ required: true, message: '请选择是否重柜', trigger: 'change' }]
			},

			file: '',
			fileList: [],
			showProcess: false,
			canSubmit: true, // 可提交标识
			processLength: 0,
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			pickerOptions: {
				disabledDate(date) {
					//disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
					// return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			porPortList: [],
			polPortList: [],
			unloadPortList: [],
			podPortList: [],
			shipCarrierOptions: [],
			bkgAgentSupplierOptions: [],
			containerList: [{ containerType: '', num: null }],
			containerTypesArr: [],
			containerTypeOptions: [],
			interval: null
		}
	},
	props: {
		orderInfo: {
			type: Object,
			default: () => ({})
		}
	},
	async created() {
		console.log('🚀 ~ orderInfo', this.orderInfo)
		// 数据反显
		this.bkgAgentSupplierOptions = [
			{
				label: this.orderInfo.ship.bkgAgentSupplierName,
				value: this.orderInfo.ship.bkgAgentSupplierId
			}
		]
		this.getPortList()
		console.log('this.portList', this.portList)
		
		this.createdItem.isHeavy =
			!this.orderInfo.soContainer.length || !this.orderInfo.soContainer ? '' : !this.orderInfo.soContainer[0].containerList || !this.orderInfo.soContainer[0].containerList.length ? '' : this.orderInfo.soContainer[0].containerList[0].isHeavy

		// 箱型箱量数据初始化
		let filterOptions = []
		let containerTypeShiporder = this.$store.state.dict.dictMap.containerTypeShiporder
		this.containerTypeOptions = []
		let { data } = await getBookContainerTypeList({ bkgReqNo: this.orderInfo.bkgReqNo })
		filterOptions = data
		//根据接口数据筛选下拉框选项
		containerTypeShiporder = containerTypeShiporder.filter(item => filterOptions.includes(item.value))
		containerTypeShiporder.map(item => {
			this.containerTypeOptions.push(
				Object.assign(
					{ ...item },
					{
						disabled: false
					}
				)
			)
		})
	},

	mounted() {},
	computed: {},
	watch: {
		containerList: {
			handler(newVal) {
				this.countContainer(newVal)
			},
			deep: true
		}
	},
	components: {
		BaseDialog
	},
	methods: {
		// 船公司官网
		getShippingCarrierUrl(carrierCode) {
			if (!carrierCode) return
			this.$store.dispatch('order/getShippingCarrierWebUrl', {carrierCode})
		},
		getPortList() {
			// 获取港口信息
			let {polPortCode, podPortCode, unloadingPortCode } = this.orderInfo.ship
			let porPortCode = this.orderInfo.barge ? this.orderInfo.barge.porPortCode : ''
			let portCodeArr = []
			porPortCode ? portCodeArr.push(porPortCode) : ''
			polPortCode ? portCodeArr.push(polPortCode) : ''
			podPortCode ? portCodeArr.push(podPortCode) : ''
			unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
			let portCodes = portCodeArr.toString()
			// console.log('portCodes', polPortCode, podPortCode, unloadingPortCode, transitPortCode, portCodes)
			this.$store.dispatch('order/basePortListByCodes', { portCodes: portCodes }).then(data => {
				// this.portList = data
				if (porPortCode) this.porPortList = data.filter(item => item.portCode === porPortCode)
				this.polPortList = data.filter(item => item.portCode === polPortCode)
				this.unloadPortList = data.filter(item => item.portCode === unloadingPortCode)
				this.podPortList = data.filter(item => item.portCode === podPortCode)
			})
		},
		//预览上传的文件
		handlePreview(file) {
			let url = ''
			if (window['createObjcectURL'] != undefined) {
				url = window['createObjcectURL'](file.raw)
			} else if (window['URL'] != undefined) {
				url = window['URL'].createObjectURL(file.raw)
			} else if (window['webkitURL'] != undefined) {
				url = window['webkitURL'].createObjectURL(file.raw)
			}
			window.open(url)
		},
		shipCarrierVisibleChange(val) {
			if (val) this.shipQuerySearch('')
		},
		shipCarrierRemoteMethod(val) {
			this.shipQuerySearch(val)
		},
		handleChangeShipCarrier(val) {},
		// 船公司下拉列表自动补充的数据
		shipQuerySearch(queryString) {
			this.$store
				.dispatch('dict/baseShippingCarrierList', {
					name: queryString,
					state: 'valid'
				})
				.then(data => {
					this.shipCarrierOptions = data.map(ele => {
						return Object.assign(ele, {
							label: ele.value,
							value: ele.key
						})
					})
				})
		},
		bkgAgentSupplierVisibleChange(val) {
			if (val && !this.createdItem.bkgAgentSupplierId) this.getSupplierList('bkg_agent', '')
		},
		bkgAgentSupplierRemoteMethod(val) {
			this.getSupplierList('bkg_agent', val)
		},
		handleChangeBkgAgentSupplier(val) {},
		// 获取订舱代理
		getSupplierList(type, queryString) {
			this.$store.dispatch('dict/queryBkgAgentSupplierList', { category: 'category', value: 'bkg_carrier,bkg_agent', queryString: queryString, categoryType: 'in' }).then(data => {
				if (data.list && data.list.length) {
					this.bkgAgentSupplierOptions = data.list.map(ele => {
						return Object.assign(ele, {
							label: this.$language == 'en' ? ele.ename : ele.name,
							value: ele.supplierId ? Number(ele.supplierId) : ''
						})
					})
				}
			})
		},
		// 驳船收货地港口
		porPortVisibleChange(val, type) {
			// if (val) this.portSearch('', type)
		},
		porPortRemoteMehod(val, type) {
			this.$store.dispatch('dict/basePortList', {queryString: val, portAttribute: 'port_of_feeder', state: 'valid'}).then(data => {
				this.porPortList = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},
		// 大船起运港
		polPortVisibleChange(val, type) {
			// if (val) this.portSearch('', type)
		},
		polPortRemoteMehod(val, type) {
			this.$store.dispatch('dict/basePortList', {queryString: val, portAttribute: 'port_of_basic', state: 'valid'}).then(data => {
				this.polPortList = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},
		// 卸货港
		unloadPortVisibleChange(val, type) {
			// if (val) this.portSearch('', type)
		},
		unloadPortRemoteMehod(val, type) {
			this.$store.dispatch('dict/basePortList', {queryString: val, portAttribute: 'port_of_discharge', state: 'valid'}).then(data => {
				this.unloadPortList = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},
		// 目的地
		podPortVisibleChange(val, type) {
			// if (val) this.portSearch('', type)
		},
		podPortRemoteMehod(val, type) {
			this.$store.dispatch('dict/basePortList', {queryString: val, portAttribute: 'port_of_destination', state: 'valid'}).then(data => {
				this.podPortList = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},

		handleChangePortCode(val) {},

		// 港口下拉数据
		portSearch(queryString, type) {
			let portAttribute = ''
			if (type === 'porPortCode') portAttribute = 'port_of_feeder'
			if (type === 'polPortCode') portAttribute = 'port_of_basic'
			if (type === 'podPortCode') portAttribute = 'port_of_destination'
			if (type === 'unloadingPortCode') portAttribute = 'port_of_discharge'
			this.$store
				.dispatch('dict/basePortList', {
					queryString,
					portAttribute,
					state: 'valid'
				})
				.then(data => {
					this.portList = data.map(ele => {
						return Object.assign(ele, {
							label: ele.value,
							value: ele.key
						})
					})
				})
		},

		// 船名输入建议
		querySearchVessel(queryString, cb) {
			this.$store.dispatch('dict/queryBookVessle', { 
				shipCarrierCode: this.createdItem.shipCarrierCode,
				polPortCode: this.createdItem.polPortCode,
				podPortCode: this.createdItem.podPortCode,
				vessel: queryString
			}).then(data => {
				cb(data)
			})
		},
		handleSelectVessel(value) {},
		handleClearVessel(value) {},
		// 航次输入建议
		querySearchVoyage(queryString, cb, vessel) {
			this.$store.dispatch('dict/queryBookVoyage', { 
				shipCarrierCode: this.createdItem.shipCarrierCode,
				polPortCode: this.createdItem.polPortCode,
				podPortCode: this.createdItem.podPortCode,
				voyage: queryString, 
				vessel: vessel
			}).then(data => {
				cb(data)
			})
		},
		handleSelectVoyage(value) {},
		handleClearVoyage(value) {},

		// 新增箱子
		handleAddContainer() {
			this.containerList.push({
				containerType: '',
				num: ''
			})
		},
		// 删除箱子
		handleDeleteContainer(item, sIndex) {
			this.containerList = this.containerList.filter((ele, index) => {
				return index !== sIndex
			})
			this.containerTypesArr = this.containerTypesArr.filter(ele => item.containerType !== ele)
			// 之前选过的箱型禁选
			this.containerTypeOptions.map(ele => {
				ele.disabled = false
				if (this.containerTypesArr.includes(ele.value)) {
					ele.disabled = true
				}
				return Object.assign({}, ele)
			})
			// console.log('delete', this.containerTypesArr, this.containerTypeOptions)
		},
		// 选择箱型
		handleChangeContainerType(val) {
			this.containerTypesArr = []
			this.containerList.map(item => {
				item.containerType && this.containerTypesArr.push(item.containerType)
			})
			// console.log('this.containerTypesArr', this.containerTypesArr)
			// 之前选过的箱型禁选
			this.containerTypeOptions.map(item => {
				item.disabled = false
				if (this.containerTypesArr.includes(item.value)) {
					item.disabled = true
				}
				return Object.assign({}, item)
			})
		},
		countContainer(data) {
			let result = ''
			if (!data.length) return
			data.map((item, index) => {
				if (item.containerType && item.num) {
					let t = `${item.containerType}*${item.num}`
					result += index ? '+' + t : t
				}
			})
			this.createdItem.containerInfo = result
		},

		close(action, value, type) {
			this.$emit('close', action, value, type)
		},

		validate() {
			let numberReg = /^[0-9]+$/
			let numValid = this.containerList.some(item => !numberReg.test(item.num))
			let numMaxValid = this.containerList.some(item => item.num > 100)
			if (numValid) {
				this.$message({ type: 'error', message: '请填写正确的箱量' })
				return false
			}
			if (numMaxValid) {
				this.$message({ type: 'error', message: '请输入箱量小于100的数字' })
				return false
			}
			// if (!this.fileList.length) {
			// 	this.$message({
			// 		type: 'error',
			// 		message: '请先上传SO附件',
			// 		duration: 1000,
			// 		onClose: () => {}
			// 	})
			// 	return false
			// }
			return true
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.createSoForm.validate(valid => {
					if (valid) {
						if (!this.validate() || !this.canSubmit) return
						// this.$refs.upload.submit(done)
						this.handleUpload()
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		beforeUpload(file) {
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
			this.file = file.raw
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		// 上传
		handleUpload(done) {
			let { siCutOff, cvCutOff, manifestCutOff, cutOffDate } = this.createdItem
			let data = {...this.createdItem}
			if (siCutOff && siCutOff.indexOf(':') !== -1) {
				siCutOff = siCutOff.substring(13, 0)
			}
			if (cvCutOff && cvCutOff.indexOf(':') !== -1) {
				cvCutOff = cvCutOff.substring(13, 0)
			}
			if (manifestCutOff && manifestCutOff.indexOf(':') !== -1) {
				manifestCutOff = manifestCutOff.substring(13, 0)
			}
			data.cutOffDate = cutOffDate ? cutOffDate : ''
			data.manifestCutOff = manifestCutOff ? `${manifestCutOff}:00:00` : ''
			data.cvCutOff = cvCutOff ? `${cvCutOff}:00:00` : ''
			data.siCutOff = siCutOff ? `${siCutOff}:00:00` : ''
			// 根据后台需求数据格式
			var form = objToForm(data)
			if (this.file) form.append('fileName', this.file)

			if (this.sizeLimit) {
				this.canSubmit = false
				this.handleProgress()
				this.$store
					.dispatch('user/import', {
						uri: '/order/shiporder/spacebook/so/upload',
						params: form
					})
					.then(res => {
						this.processLength = 100
						this.showProcess = false
						this.fileList = []
						this.file = ''
						this.canSubmit = true
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '新增成功'
							})
							this.$emit('handleBack', res.data)
							this.close('Confirm')
						}
					})
					.catch(err => {
						clearInterval(this.interval)
						this.interval = null
						this.processLength=0
						this.showProcess=false
						this.fileList = []
						this.file = ''
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

<style lang="scss">
.create-so-form .create-so .el-col {
	padding-bottom: 0;
}
.create-so-form .create-so .el-form-item__label, .create-so-form .create-so .el-form-item__content {
	line-height: 20px;
}
.create-so-form .create-so .el-form-item.flex{
	.el-form-item__content{
		display: flex;
	}
}
.create-so-form .el-radio__label{
	font-size: 12px;
}
.create-so-form .el-date-editor.el-input,
.create-so-form .el-date-editor.el-input__inner {
	width: auto;
}
.create-so-form .containerList .center {
	text-align: center;
	line-height: 20px;
}
.create-so-form .containerList .btn-plus {
	position: relative;
	width: 20px;
	height: 20px;
	border-radius: 10px;
	border: 1px solid #999;
	margin-top: 0;
	margin-left: 10px;
	display: inline-block;
	&::before {
		content: '';
		display: block;
		position: absolute;
		width: 1px;
		height: 15px;
		background: #999;
		left: 9px;
		top: 2px;
	}
	&::after {
		content: '';
		display: block;
		position: absolute;
		width: 15px;
		height: 1px;
		background: #999;
		left: 2px;
		top: 9px;
	}
}
.create-so-form .containerList .btn-minus {
	position: relative;
	width: 20px;
	height: 20px;
	border-radius: 10px;
	border: 1px solid #999;
	margin-top: 0;
	margin-left: 10px;
	display: inline-block;
	&::after {
		content: '';
		display: block;
		position: absolute;
		width: 15px;
		height: 1px;
		background: #999;
		left: 2px;
		top: 9px;
	}
}
.create-so-form .containerList .el-col {
	padding-bottom: 5px;
}
.create-so-form .el-upload-dragger {
	padding: 8px;
}
.create-so-form .el-upload-dragger .el-upload__text{
	font-size: 12px;
}
</style>