<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="changeSaveForm" :rules="rules" :model="changeSaveItem" label-position="right" label-width="120px" class="changeSave-form">
			<el-form-item label="状态" v-if="status">
				<div class="ft12" :class="['REFUSE'].includes(status) ? 'red' : ''">{{ status | bkgStatusFilter }}</div>
			</el-form-item>
			<el-form-item label="拒绝原因" v-if="['REFUSE'].includes(status)">
				<div class="ft12">{{ changeSaveItem.changeRefuseRemark }}</div>
			</el-form-item>
			<el-row>
				<el-col :span="24">
					<el-form-item label="修改类型" prop="changeType" required :show-message="false">
						<el-select v-model="changeSaveItem.changeType" size="mini" placeholder="请选择" style="width: 100%" disabled>
							<el-option v-for="item in changeTypeOptions" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>

				<template>
					<el-col :span="12" class="flex-form-item">
						<el-form-item :required="true" label="装货地" prop="receiptPlace" :show-message="false">
							<el-select
								key="receiptPlace"
								size="mini"
								v-model="changeSaveItem.receiptPlace"
								filterable
								remote
								clearable
								:disabled="isView"
								style="width: 100%"
								placeholder="请输入"
								:remote-method="receiptPlaceFilterMehod"
								@change="handleChangeReceiptPlace"
							>
								<el-option v-for="item in cityList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12" class="flex-form-item">
						<el-form-item required label="起运港" prop="polPortCode" :show-message="false">
							<div class="port-flex-form">
								<div class="port-code">
									<el-select key="polPortCode" size="mini" v-model="changeSaveItem.polPortCode" filterable clearable :disabled="isView" style="width: 100%" placeholder="请输入" :filter-method="polPortFilterMehod" @change="handleChangePolPortCode">
										<el-option v-for="item in polPortList" :key="item.value" :label="item.value" :value="item.value">
											<span>{{ item.label }}</span>
										</el-option>
									</el-select>
								</div>
								<PortPopover :portItem="polPortItem" />
							</div>
						</el-form-item>
					</el-col>

					<el-col :span="12" class="flex-form-item">
						<el-form-item required="" label="卸货港" prop="unloadingPortCode" :show-message="false">
							<div class="port-flex-form">
								<div class="port-code">
									<el-select size="mini" v-model="changeSaveItem.unloadingPortCode" filterable clearable :disabled="isView" style="width: 100%" placeholder="请输入" :filter-method="unloadPortFilterMehod" @change="handleChangeUnloadPortCode">
										<el-option v-for="item in unloadPortList" :key="item.value" :label="item.value" :value="item.value">
											<span>{{ item.label }}</span>
										</el-option>
									</el-select>
								</div>
								<PortPopover :portItem="unloadPortItem" />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="12" class="flex-form-item">
						<el-form-item required="" label="目的地" prop="podPortCode" :show-message="false">
							<div class="port-flex-form">
								<div class="port-code">
									<el-select size="mini" v-model="changeSaveItem.podPortCode" filterable clearable :disabled="isView" style="width: 100%" placeholder="请输入" :filter-method="podPortFilterMehod" @change="handleChangePodPortCode">
										<el-option v-for="item in podPortList" :key="item.value" :label="item.value" :value="item.value">
											<span>{{ item.label }}</span>
										</el-option>
									</el-select>
								</div>
								<PortPopover :portItem="podPortItem" />
							</div>
						</el-form-item>
					</el-col>
				</template>

				<el-col :span="12">
					<el-form-item label="截报关时间" prop="ccCutOff" :show-message="false">
						<elDatePickerLimit :field="'ccCutOff'" size="mini" :disabled="isView" v-model="changeSaveItem.ccCutOff" type="datetime" style="width: 100%" clearable placeholder="请选择" format="yyyy-MM-dd HH"/>
					</el-form-item>
					<!-- <el-form-item class="timeSpecial" label="截报关时间" prop="ship.ccCutOff" :show-message="false" v-if="isOpView">
						<elDatePickerLimit
							size="mini"
							v-model="createItem.ship.ccCutOff"
							type="datetime"
							style="width: 100%"
							clearable
							:popper-class="'hideMinute'"
							placeholder="请选择"
							format="yyyy-MM-dd HH"
							value-format="yyyy-MM-dd HH"
							:disabled="disabledState && !isEdit"
						/>
					</el-form-item> -->
				</el-col>
				<el-col :span="12">
					<el-form-item label="大船船名" prop="vessel">
						<el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="changeSaveItem.vessel"
							:disabled="isView"
							:fetch-suggestions="(queryString, cb) => querySearchBookVessel(queryString, cb)"
							:trigger-on-focus="false"
							placeholder="请输入"
							:maxlength="128"
						></el-autocomplete>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="大船预计开船时间" prop="etdTime" :show-message="false" class="vessel-time">
						<elDatePickerLimit :field="'etdTime'" size="mini" :disabled="isView" v-model="changeSaveItem.etdTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
						<el-popover placement="top" width="280" trigger="click" class="vessel-time-popover">
							<Schedule :vesselTime="vesselTime" :etdTimeDisabled="isView" @updateVesselTime="updateVesselTime" />
							<el-button slot="reference" type="default" size="mini" @click="handleSearchVesselTime">查询</el-button>
						</el-popover>
					</el-form-item>
				</el-col>

				<el-col :span="12">
					<el-form-item label="大船航次" prop="voyage">
						<el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="changeSaveItem.voyage"
							:disabled="isView"
							:fetch-suggestions="(queryString, cb) => querySearchBookVoyage(queryString, cb, changeSaveItem.vessel)"
							:trigger-on-focus="false"
							placeholder="请输入"
							:maxlength="128"
						></el-autocomplete>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="保函附件" prop="fileName" required :show-message="false">
						<template v-if="!isView">
							<el-upload
								v-model="changeSaveItem.fileName"
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
								:limit="5"
								:on-exceed="handleExceed"
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
						</template>
						<div v-for="(item, index) in changeFileNameList" :key="'file' + index">
							<span class="file-name" @click="handleView(index)">{{ item }}</span>
						</div>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="修改原因" prop="changeRemark" required :show-message="false">
						<el-input type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="changeSaveItem.changeRemark" maxlength="512" show-word-limit :disabled="isView"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</BaseDialog>
</template>

<script>
import { getDictLabel } from '@/utils/tools'
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import PortPopover from './portPopover'
import { orderChangeSave, orderChangeInfo, orderContainerList, lclInfo } from '@/api/order/list'
import Schedule from './schedule'
import { citySelectList, portSystemLineInfo } from '@/api/base'

const defaultChangeSaveQuery = {
	etdTime: '', // 大船预计开船时间
	vessel: '', // 大船船名
	voyage: '', // 大船航次
	ccCutOff: '', // 大船截关时间
	changeType: 'PORT',
	polPortCode: '',
	podPortCode: '', // 目的地
	unloadingPortCode: '',
	shipCarrierCode: '', // 船公司
	changeRemark: '',
	fileName: '',
	receiptPlace: '',
	receiptPlaceName: '',
	sysLineCode: '',
	sysLineName: '',
	changeRefuseRemark: ''
}

export default {
	filters: {
		bkgStatusFilter(status) {
			let text = ''
			switch (status) {
				case 'SUBMIT':
					text = '待审核'
					break
				case 'PASS':
					text = '审核通过'
					break
				case 'REFUSE':
					text = '审核拒绝'
					break
				default:
					break
			}
			return text
		}
	},
	data() {
		return {
			cityList: [],
			dialogConfig: {
				title: '改港',
				show: true,
				size: 'medium',
				width: '900px'
			},
			oQuery: this.$route.query,
			state: 'valid',
			changeInfo: {},
			changeSaveItem: Object.assign({}, defaultChangeSaveQuery),
			rules: {
				// etdTime: [{required: true, message: '请选择大船预计开船时间', trigger: 'change'}],
				// ccCutOff: [{required: true, message: '请选择大船截关时间', trigger: 'change'}],
				// podPortCode: [{required: true, message: '请选择目的地', trigger: 'change'}],
				// unloadingPortCode: [{required: true, message: '请选择目的地', trigger: 'change'}],
			},
			portList: [],
			isView: false, // 查看详情状态
			status: '', // 审核状态
			changeTypeOptions: [{ label: '改港', value: 'PORT' }],
			polPortItem: {},
			unloadPortItem: {},
			podPortItem: {},
			podPortList: [],
			unloadPortList: [],
			polPortList: [],
			canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			changeFileNameList: [],
			changeFileNoList: [],
			vesselTime: {},
			vesselTimeParam: {},
			interval: null
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		// 从详情带出原始数据
		this.getNoChangeInfo()
		// 获取改港数据
		this.getChangeInfo()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo
		})
	},
	watch: {},
	components: {
		BaseDialog,
		PortPopover,
		Schedule
	},
	methods: {
		getNoChangeInfo() {
			this.changeSaveItem.etdTime = this.createItem.ship.etdTime
			this.changeSaveItem.ccCutOff = this.createItem.ship.ccCutOff
			this.changeSaveItem.vessel = this.createItem.ship.vessel
			this.changeSaveItem.voyage = this.createItem.ship.voyage
			this.changeSaveItem.polPortCode = this.createItem.ship.polPortCode
			this.changeSaveItem.podPortCode = this.createItem.ship.podPortCode
			this.changeSaveItem.unloadingPortCode = this.createItem.ship.unloadingPortCode
			this.changeSaveItem.shipCarrierCode = this.createItem.ship.shipCarrierCode
			this.changeSaveItem.receiptPlaceName = this.createItem.ship.receiptPlaceName
			this.changeSaveItem.receiptPlace = this.createItem.ship.receiptPlace
			this.changeSaveItem.sysLineCode = this.createItem.ship.sysLineCode
			this.changeSaveItem.sysLineName = this.createItem.ship.sysLineName
		},
		// getChangeInfo() {
		// 	lclInfo({
		// 		orderNo: this.$route.query.orderNo,
		// 		jointNo: this.$route.query.jointNo
		// 	}).then(res => {
		// 		if (res.data && res.data.changeInfo) {
		// 			this.changeInfo = res.data.changeInfo
		// 			this.changeSaveItem.etdTime = this.changeInfo.etdTime
		// 			this.changeSaveItem.ccCutOff = this.changeInfo.ccCutOff
		// 			this.changeSaveItem.vessel = this.changeInfo.vessel
		// 			this.changeSaveItem.voyage = this.changeInfo.voyage
		// 			this.changeSaveItem.polPortCode = this.changeInfo.polPortCode
		// 			this.changeSaveItem.podPortCode = this.changeInfo.podPortCode
		// 			this.changeSaveItem.unloadingPortCode = this.changeInfo.unloadingPortCode
		// 			this.changeSaveItem.shipCarrierCode = this.changeInfo.shipCarrierCode
		// 			this.changeSaveItem.receiptPlaceName = this.changeInfo.receiptPlaceName
		// 			this.changeSaveItem.receiptPlace = this.changeInfo.receiptPlace
		// 			this.changeSaveItem.sysLineCode = this.changeInfo.sysLineCode
		// 			this.changeSaveItem.sysLineName = this.changeInfo.sysLineName
		// 			this.changeSaveItem.changeRemark = this.changeInfo.changeRemark
		// 			this.changeSaveItem.changeRefuseRemark = this.changeInfo.changeRefuseRemark
		// 			this.changeSaveItem.fileName = this.changeInfo.changeFileNameList
		// 			this.changeFileNoList = this.changeInfo.changeFileNoList.split('&&')
		// 			this.changeFileNameList = this.changeInfo.changeFileNameList.split('&&')
		// 			this.status = this.changeInfo.changeStatus
		// 			this.isView = ['SUBMIT', 'PASS'].includes(this.status)
		// 		}
		// 		this.getPortData()
		// 	})
		// },
		getChangeInfo() {
			lclInfo({ orderNo: this.oQuery.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
				let { data } = res
				this.changeInfo = data.changeInfo
				if (!data.changeInfo) {
					this.isView = false
					this.status = ''
				} else {
					for (let i in this.changeSaveItem) {
						this.changeSaveItem[i] = this.changeInfo[i]
						if (i === 'changeType') {
							this.changeSaveItem[i] = 'PORT'
						}
					}
					this.status = this.changeInfo.changeStatus
					this.isView = ['SUBMIT', 'PASS'].includes(this.status)

					this.portList = [{ label: this.changeInfo.podPortName, value: this.changeInfo.podPortCode }]
					this.unloadPortList = [{ label: this.changeInfo.unloadingPortName, value: this.changeInfo.unloadingPortCode }]
					this.changeFileNoList = this.changeInfo.changeFileNoList.split('&&')
					this.changeFileNameList = this.changeInfo.changeFileNameList.split('&&')
					this.changeSaveItem.fileName = this.changeInfo.changeFileNameList
				}
				this.getPortData()
			})
		},
		initSystemLine(val) {
			if (val) {
				portSystemLineInfo(val).then(response => {
					let systemLineList = response.data
					if (systemLineList.length > 0) {
						let systemLine = systemLineList[0]
						this.changeSaveItem.sysLineCode = systemLine.sysLineCode
						this.changeSaveItem.sysLineName = systemLine.cname
					}
				})
			} else {
				this.changeSaveItem.sysLineCode = ''
				this.changeSaveItem.sysLineName = ''
			}
		},
		// 船期查询结果直接填入订单详情
		updateVesselTime(val, key) {
			this.changeSaveItem[key] = val
		},

		// getPortData() {
		// 	let portCodes = ''
		// 	let portCodeArr = []
		// 	// 先取订单详情的值
		// 	let { polPortCode, podPortCode, unloadingPortCode } = this.createItem.ship
		// 	// 改港操作后 取新值
		// 	if (this.changeInfo) {
		// 		polPortCode = this.changeInfo.polPortCode
		// 		podPortCode = this.changeInfo.podPortCode
		// 		unloadingPortCode = this.changeInfo.unloadingPortCode
		// 	}

		// 	polPortCode ? portCodeArr.push(polPortCode) : ''
		// 	podPortCode ? portCodeArr.push(podPortCode) : ''
		// 	unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
		// 	portCodes = portCodeArr.toString()
		// 	// 港口数据反显
		// 	if (portCodes) {
		// 		this.$store.dispatch('dict/basePortListByCodes', { portCodes }).then(data => {
		// 			let initPortData = []
		// 			//初始化下拉框数据
		// 			initPortData = data
		// 			this.podPortList = initPortData.filter(item => item.portCode === podPortCode)
		// 			this.podPortItem = this.podPortList.find(item => item.portCode === podPortCode)
		// 			this.unloadPortList = initPortData.filter(item => item.portCode === unloadingPortCode)
		// 			this.unloadPortItem = this.unloadPortList.find(item => item.portCode === unloadingPortCode)
		// 			this.polPortList = initPortData.filter(item => item.portCode === polPortCode)
		// 			this.polPortItem = this.polPortList.find(item => item.portCode === polPortCode)
		// 		})
		// 	} else {
		// 		this.$store.dispatch('dict/basePortListByCodes', {}).then(data => {
		// 			//初始化下拉框数据
		// 			this.podPortList = JSON.parse(JSON.stringify(data))
		// 			this.unloadPortList = JSON.parse(JSON.stringify(data))
		// 			this.polPortList = JSON.parse(JSON.stringify(data))
		// 		})
		// 	}
		// },
		getPortData() {
			let portCodes = ''
			let portCodeArr = []
			let { polPortCode, podPortCode, unloadingPortCode } = this.createItem.ship
			if (this.changeInfo) {
				polPortCode = this.changeInfo.polPortCode
				podPortCode = this.changeInfo.podPortCode
				unloadingPortCode = this.changeInfo.unloadingPortCode
			}
			polPortCode ? portCodeArr.push(polPortCode) : ''
			podPortCode ? portCodeArr.push(podPortCode) : ''
			unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
			portCodes = portCodeArr.toString()
			// 港口数据反显
			if (portCodes) {
				this.$store.dispatch('dict/basePortListByCodes', { portCodes }).then(data => {
					let initPortData = []
					//初始化下拉框数据
					initPortData = data
					this.podPortList = initPortData.filter(item => item.portCode === podPortCode)
					this.podPortItem = this.podPortList.find(item => item.portCode === podPortCode)
					this.unloadPortList = initPortData.filter(item => item.portCode === unloadingPortCode)
					this.unloadPortItem = this.unloadPortList.find(item => item.portCode === unloadingPortCode)
					this.polPortList = initPortData.filter(item => item.portCode === polPortCode)
					this.polPortItem = this.polPortList.find(item => item.portCode === polPortCode)
				})
			} else {
				this.$store.dispatch('dict/basePortListByCodes', {}).then(data => {
					//初始化下拉框数据
					this.podPortList = JSON.parse(JSON.stringify(data))
					this.unloadPortList = JSON.parse(JSON.stringify(data))
					this.polPortList = JSON.parse(JSON.stringify(data))
				})
			}
		},

		close(action) {
			this.$emit('close', action)
		},
		validate() {
			return true
		},
		// 城市下拉数据
		citySelectQuery(queryString) {
			citySelectList({
				countryCode: '',
				cityCode: queryString || '',
				state: 'valid'
			}).then(res => {
				this.cityList = res.data.map(ele => {
					return Object.assign(ele, {
						label: this.$language === 'en' ? ele.ename : ele.cname,
						value: ele.cityCode
					})
				})
			})
		},
		receiptPlaceFilterMehod(val) {
			this.citySelectQuery(val)
		},
		handleChangeReceiptPlace(val) {
			if (val) {
				let findItem = this.cityList.find(item => item.cityCode === val)
				this.changeSaveItem.receiptPlace = findItem.cityCode
				this.changeSaveItem.receiptPlaceName = findItem.cname
			} else {
				this.changeSaveItem.receiptPlace = ''
				this.changeSaveItem.receiptPlaceName = ''
			}
		},
		// 起运港下拉数据
		polPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.polPortList = result
			})
		},

		polPortFilterMehod(val) {
			this.polPortSearch(val, 'port_of_basic', this.state)
		},
		handleChangePolPortCode(val) {
			let findItem = this.polPortList.find(item => item.portCode === val)
			this.polPortItem = findItem || {}
			// 变更商务岗位分配信息
			val && this.$emit('updatePricing', '大船起运港')
		},

		// 卸货港下拉数据
		unloadPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.unloadPortList = result
			})
		},

		unloadPortFilterMehod(val) {
			this.unloadPortSearch(val, 'port_of_discharge', this.state)
		},
		handleChangeUnloadPortCode(val) {
			let findItem = this.unloadPortList.find(item => item.portCode === val)
			this.unloadPortItem = findItem || {}
		},
		// 目的地下拉数据
		podPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.podPortList = result
			})
		},

		podPortFilterMehod(val) {
			this.podPortSearch(val, 'port_of_destination', this.state)
		},
		handleChangePodPortCode(val) {
			let findItem = this.podPortList.find(item => item.portCode === val)
			this.podPortItem = findItem || {}
			// 根据目的港自动匹配系统航线
			this.initSystemLine(val)
		},
		handleView(index) {
			let fileNo = this.changeFileNoList[index]
			let fileName = this.changeFileNameList[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				if (this.isView) {
					return this.close('Cancel')
				}
				console.log(this.$refs.changeSaveForm)
				this.$refs.changeSaveForm.validate(valid => {
					if (valid) {
						if (!this.canSubmit) return
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
			this.file = file.raw
			this.changeSaveItem.fileName = fileList
			this.changeFileNameList = []
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleExceed(file, fileList) {
			this.$message.warning('最多上传5个附件!')
		},
		handleImport(done) {
			let params = {
				data: { ...this.changeSaveItem, orderNo: this.$route.query.orderNo },
				fileName: this.fileList
			}
			delete params.data.fileName

			if (this.sizeLimit) {
				this.canSubmit = false
				this.handleProgress()
				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/shiporder/lcl/change/save',
						params: params
					})
					.then(res => {
						this.processLength = 100
						this.showProcess = false
						this.fileList = []
						this.canSubmit = true
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '改港申请成功',
								duration: 1000,
								onClose: () => {
									this.close('Confirm')
								}
							})
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
		},

		// 船名输入建议
		querySearchVessel(queryString, cb) {
			this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
				cb(data)
			})
		},
		// 航次输入建议
		querySearchVoyage(queryString, cb, vessel) {
			this.$store.dispatch('dict/queryVoyageList', { name: queryString, vessel: vessel }).then(data => {
				cb(data)
			})
		},
		// 大船船名输入建议
		querySearchBookVessel(queryString, cb) {
			this.$store
				.dispatch('dict/queryBookVessle', {
					shipCarrierCode: this.changeSaveItem.shipCarrierCode,
					polPortCode: this.changeSaveItem.polPortCode,
					podPortCode: this.changeSaveItem.podPortCode,
					vessel: queryString
				})
				.then(data => {
					cb(data)
				})
		},
		// 大船航次输入建议
		querySearchBookVoyage(queryString, cb, vessel) {
			this.$store
				.dispatch('dict/queryBookVoyage', {
					shipCarrierCode: this.changeSaveItem.shipCarrierCode,
					polPortCode: this.changeSaveItem.polPortCode,
					podPortCode: this.changeSaveItem.podPortCode,
					voyage: queryString,
					vessel: vessel
				})
				.then(data => {
					cb(data)
				})
		},
		handleSearchVesselTime() {
			let { shipCarrierCode, polPortCode, podPortCode, vessel, voyage } = this.changeSaveItem
			let param = {
				shipCarrierCode,
				polPortCode,
				podPortCode,
				vessel,
				voyage
			}
			// 20220223传参不变的话，不请求船期接口。优化减少请求次数
			if (Object.entries(this.vesselTimeParam).toString() === Object.entries(param).toString()) return
			this.$store.dispatch('dict/queryBookVessleTime', param).then(data => {
				this.vesselTimeParam = param
				this.vesselTime = data || {}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.changeSave-form {
	::v-deep .el-form-item {
		margin-bottom: 4px;
		&.vessel-time {
			.el-form-item__content {
				display: flex;
			}
		}
	}
	::v-deep .el-form-item.is-error {
		.el-radio__inner,
		.el-upload-dragger {
			border: 1px solid #ff4949;
		}
	}
	::v-deep .el-form-item__label {
		line-height: 20px;
		padding-right: 8px;
	}
	::v-deep .el-form-item__content {
		line-height: 20px;
	}
	::v-deep .el-col-12,
	::v-deep .el-col-24 {
		padding-right: 20px;
	}
	.flex-form-item {
		// &.pr24{
		//   padding-right: 24px;
		// }
		.port-flex-form {
			position: relative;
			display: flex;
			flex-wrap: nowrap;
			justify-content: space-between;
			align-items: center;
			.el-icon-circle-plus-outline {
				position: absolute;
				right: -17px;
				cursor: pointer;
				font-size: 15px;
				&:hover {
					color: #1890ff;
				}
			}
			.el-icon-remove-outline {
				position: absolute;
				right: -17px;
				cursor: pointer;
				font-size: 15px;
				&:hover {
					color: #1890ff;
				}
			}
			.port-code {
				width: 32%;
				// margin-left: 5px;
				&:first-child {
					margin-left: 0;
				}
			}
		}
	}
	.file-name {
		color: #3e80f5;
		font-size: 12px;
		cursor: pointer;
	}
	.red {
		color: #ff4949;
	}
}
.port-popover {
	font-size: 12px;
}
</style>
