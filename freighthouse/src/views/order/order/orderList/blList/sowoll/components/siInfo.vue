<template>
	<div class="bl-info">
		<div class="sub-tit">
			<span>基本信息</span>
		</div>
		<el-row class="row">
			<el-col :span="8" class="column">
				<div class="label">提单类型</div>
				<span class="value">{{ getDictLabelFunc('blType', createItem.blType) }}</span>
				<!-- <el-form-item label="提单类型" prop="blType" class="flex-item">
					<el-select v-model="createItem.blType" size="mini" clearable placeholder="请选择" style="width: 100%" @change="handleChangeBlType">
						<el-option v-for="(item, index) in custBlDictMap.blType" :label="item.label" :value="item.value" :key="index"> </el-option>
					</el-select>
				</el-form-item> -->
			</el-col>
			<el-col :span="8" class="column">
				<div class="label">提单号</div>
				<span class="value">{{ createItem.blNo }}</span>
				<!-- <el-form-item label="提单号" prop="blNo" class="flex-item">
					<el-input size="mini" maxlength="60" clearable placeholder="请输入" v-model="createItem.blNo" style="width: 100%" ></el-input>
				</el-form-item> -->
			</el-col>
			<el-col :span="8" class="column">
				<el-form-item required label="出单方式" prop="blMode" class="flex-item" :show-message="false">
					<el-select v-model="createItem.blMode" size="mini" clearable placeholder="请选择" style="width: 100%">
						<el-option v-for="(item, index) in custBlDictMap.blMode" :label="item.label" :value="item.value" :key="index"> </el-option>
					</el-select>
				</el-form-item>
			</el-col>
		</el-row>
		<el-row class="row">
			<el-col :span="8" class="column">
				<el-form-item required label="付款方式" prop="orderInfo.payMode" class="flex-item" :show-message="false">
					<el-select v-model="createItem.orderInfo.payMode" size="mini" clearable placeholder="请选择" style="width: 100%">
						<el-option v-for="(item, index) in custBlDictMap.payMode" :label="item.label" :value="item.value" :key="index"> </el-option>
					</el-select>
				</el-form-item>
			</el-col>
			<el-col :span="8" class="column">
				<div class="label">大船船名/航次：</div>
				<div class="value">{{createItem.orderInfo.vessel}}/{{createItem.orderInfo.voyage}}</div>
			</el-col>
			<el-col :span="8" class="column">
				<div class="label">驳船船名/航次：</div>
				<div class="value">{{createItem.orderInfo.bargeVessel}}/{{createItem.orderInfo.bargeVoyage}}</div>
			</el-col>
		</el-row>
		<el-row class="row">
			<el-col :span="8" class="column">
				<div class="label">船公司：</div>
				<div class="value">{{createItem.orderInfo.shipCarrierCode}}</div>
			</el-col>
		</el-row>
		<div class="sub-tit">
			<span>收发通信息</span>
		</div>
		<el-row class="row">
			<el-col :span="8" class="column">
				<el-form-item :required="true" label="Shipper(发货人)" prop="blContact.shipper" class="flex-item col-3 shipper-rel" :show-message="false">
					<span slot="label" style="position:relative; z-index:200">
						<span>Shipper(发货人)</span>
						<!-- <el-button type="text" size="mini" @click="openContactPerson('发货人', '')">选择</el-button> -->
					</span>
					<TextAreaItem
						isNeedCheckRowLen
						@dblclick.native="editDetail('shipper')"
						:required="true"
						keys="shipper"
						label="Shipper(发货人)"
						:rows="6"
						:value.sync="createItem.blContact.shipper"
					></TextAreaItem>
				</el-form-item>
			</el-col>
			<el-col :span="8" class="column">
				<el-form-item :required="true" label="Consignee(收货人)" prop="blContact.consignee" class="flex-item col-3 shipper-rel" :show-message="false">
					<span slot="label" style="position:relative; z-index:200">
						<span>Consignee(收货人)</span>
						<!-- <el-button type="text" size="mini" @click="openContactPerson('收货人', '')">选择</el-button> -->
					</span>
					<TextAreaItem
						isNeedCheckRowLen
						@dblclick.native="editDetail('consignee')"
						:required="true"
						keys="consignee"
						label="Consignee(收货人)"
						:rows="6"
						:value.sync="createItem.blContact.consignee"
					></TextAreaItem>
				</el-form-item>
			</el-col>
			<el-col :span="8" class="column">
				<el-form-item :required="true" label="Notify Party1(通知人1)" prop="blContact.notify1" class="flex-item col-3 shipper-rel" :show-message="false">
					<span slot="label" style="position:relative; z-index:200">
						<span>Notify Party1(通知人1)</span>
						<!-- <el-button type="text" size="mini" @click="openContactPerson('通知人', '1')">选择</el-button> -->
					</span>
					<TextAreaItem
						isNeedCheckRowLen
						@dblclick.native="editDetail('notify1')"
						:required="true"
						keys="notify1"
						label="Notify Party1(通知人1)"
						:rows="6"
						:value.sync="createItem.blContact.notify1"
					></TextAreaItem>
				</el-form-item>
			</el-col>
		</el-row>
		<el-row class="row">
			<el-col :span="8" class="column">
				<el-form-item label="Also Notify Party(通知人2)" prop="blContact.notify2" class="flex-item col-3 shipper-rel">
					<span slot="label" style="position:relative; z-index:200">
						<span>Also Notify Party(通知人2)</span>
						<!-- <el-button type="text" size="mini" @click="openContactPerson('通知人', '2')">选择</el-button> -->
					</span>
					<TextAreaItem
						isNeedCheckRowLen
						@dblclick.native="editDetail('notify2')"
						keys="notify2"
						label="Also Notify Party(通知人2)"
						:rows="6"
						:value.sync="createItem.blContact.notify2"
					></TextAreaItem>
				</el-form-item>
			</el-col>
		</el-row>
		<div class="sub-tit">
			<span>货物信息</span>
		</div>
		<el-row class="row">
			<el-col :span="8" class="column">
				<el-form-item required label="唛头" prop="cargoMark" class="flex-item col-2 shipper-rel" :show-message="false">
					<TextAreaItem @dblclick.native="editDetail('cargoMark')" :regExp="cargoReg" :required="true" keys="cargoMark" label="唛头" :rows="6" :value.sync="createItem.cargoMark"></TextAreaItem>
				</el-form-item>
			</el-col>
			<el-col :span="8" class="column">
				<el-form-item required label="货物描述" prop="cargoDesc" class="flex-item col-2 shipper-rel" :show-message="false">
					<TextAreaItem @dblclick.native="editDetail('cargoDesc')" :regExp="cargoReg" :required="true" keys="cargoDesc" label="货物描述" :rows="6" :value.sync="createItem.cargoDesc"></TextAreaItem>
				</el-form-item>
			</el-col>
			<el-col :span="8" class="column">
				<el-form-item label="提单备注" prop="remarkPrint" :show-message="false" class="flex-item col-3 shipper-rel">
					<el-input @focus="handleFocus('remarkPrint')" @dblclick.native="editDetail('remarkPrint')" type="textarea" :rows="6" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.remarkPrint"></el-input>
				</el-form-item>
			</el-col>
		</el-row>
		<div class="sub-tit">
			<span>港口信息</span>
		</div>
		<el-row class="row">
			<el-col :span="8" class="column">
				<el-form-item label="收货地" prop="orderInfo.bargePorPortName" :show-message="false" class="flex-item">
					<el-autocomplete
						:debounce="0"
						popper-class="port-autocomplete"
						style="width: 100%"
						size="mini"
						clearable
						v-model="createItem.orderInfo.bargePorPortName"
						:fetch-suggestions="(queryString, cb) => querySearchPorPort(queryString, cb)"
						placeholder="请输入"
						@select="value => handleSelectPort(value, 'bargePorPortCode')"
						@clear="value => handleClearPort(value, 'bargePorPortCode')"
					></el-autocomplete>
				</el-form-item>
			</el-col>
			<el-col :span="8" class="column">
				<el-form-item required label="大船起运港" prop="orderInfo.polPortName" :show-message="false" class="flex-item">
					<el-autocomplete
						:debounce="0"
						popper-class="port-autocomplete"
						style="width: 100%"
						size="mini"
						clearable
						v-model="createItem.orderInfo.polPortName"
						:fetch-suggestions="(queryString, cb) => querySearchPolPort(queryString, cb)"
						placeholder="请输入"
						@select="value => handleSelectPort(value, 'polPortCode')"
						@clear="value => handleClearPort(value, 'polPortCode')"
					></el-autocomplete>
				</el-form-item>
			</el-col>
			<el-col :span="8" class="column">
				<el-form-item label="中转港" prop="orderInfo.transitPortName" :show-message="false" class="flex-item multi-select-tag">
					<el-autocomplete
						:debounce="0"
						popper-class="port-autocomplete"
						style="width: 100%"
						size="mini"
						clearable
						v-model="createItem.orderInfo.transitPortName"
						:fetch-suggestions="(queryString, cb) => querySearchTransitPort(queryString, cb)"
						placeholder="请输入"
						@select="value => handleSelectPort(value, 'transitPortCode')"
						@clear="value => handleClearPort(value, 'transitPortCode')"
					></el-autocomplete>
				</el-form-item>
			</el-col>
		</el-row>
		<el-row class="row">
			<el-col :span="8" class="column">
				<el-form-item label="卸货港" prop="orderInfo.unloadingPortName" :show-message="false" class="flex-item">
					<el-autocomplete
						:debounce="0"
						popper-class="port-autocomplete"
						style="width: 100%"
						size="mini"
						clearable
						v-model="createItem.orderInfo.unloadingPortName"
						:fetch-suggestions="(queryString, cb) => querySearchUnloadPort(queryString, cb)"
						placeholder="请输入"
						@select="value => handleSelectPort(value, 'unloadingPortCode')"
						@clear="value => handleClearPort(value, 'unloadingPortCode')"
					></el-autocomplete>
				</el-form-item>
			</el-col>
			<el-col :span="8" class="column">
				<el-form-item label="目的地" prop="orderInfo.podPortName" :show-message="false" class="flex-item">
					<el-autocomplete
						:debounce="0"
						popper-class="port-autocomplete"
						style="width: 100%"
						size="mini"
						clearable
						v-model="createItem.orderInfo.podPortName"
						:fetch-suggestions="(queryString, cb) => querySearchPodPort(queryString, cb)"
						placeholder="请输入"
						@select="value => handleSelectPort(value, 'podPortCode')"
						@clear="value => handleClearPort(value, 'podPortCode')"
					></el-autocomplete>
				</el-form-item>
			</el-col>
			<el-col :span="8" class="column">
				<el-form-item label="最终目的地" prop="orderInfo.deliveryPlace" :show-message="false" class="flex-item">
					<el-input size="mini" clearable placeholder="请输入" v-model="createItem.orderInfo.deliveryPlace"></el-input>
				</el-form-item>
			</el-col>
		</el-row>
		<div class="sub-tit">
			<span>补料附件</span>
		</div>
		<el-row class="row" v-if="siFileList.length">
			<el-col :span="24" class="file-item" v-for="(item, index) in siFileList" :key="index">
				<img :src="require(`@/views/order/order/images/sw/icon-si-file.png`)" class="icon-si-file" alt="">
				<el-button type="text" class="si-file-name" @click="handleViewFile(item)">{{item.fileName}}</el-button>
				<i class="el-icon-circle-close" @click="handleDeleteSiFile(index)"></i>
			</el-col>
		</el-row>
		<el-row class="row">
			<el-form-item label="">
				<el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="true" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :file-list="fileList" :disabled="!canSubmit">
					<div class="file-upload">
						<img class="file-upload-img" :src="require('@/views/order/order/images/sw/icon-upload.png')" />
						<div class="file-upload__text">
							<div class="txt">点击或将文件拖拽到这里导入</div>
							<p class="info">支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
						</div>
					</div>
				</el-upload>
				<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
			</el-form-item>
		</el-row>
		<div v-if="contactPersonShow">
			<ContactPerson :config="contactPersonConfig" @close="getContactPerson" />
		</div>
		<el-dialog class="edit-detail-dlg" :title="editTitle" :visible.sync="editVisible" width="50%">
			<TextAreaItem :regExp="editReg" keys="editForm" :maxlength="editInputMaxLength.toString()" :rows="20" :show-word-limit="editInputMaxLength ? true : false" :value.sync="editData"></TextAreaItem>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="editConfirm">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import VesselSelect from '@/views/order/order/components/vesselSelect'
import VoyageSelect from '@/views/order/order/components/voyageSelect'
import TextAreaItem from '@/components/Form/textAreaItem'
import ContactPerson from '@/views/order/order/orderList/components/contactPerson.vue'
import { custBlFileList } from '@/api/order/bl'

export default {
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		selectContainerList: {
			type: Array,
			default: () => ([])
		},
		custBlDictMap: {
			type: Object,
			default: () => ({})
		},
		param: {
			type: Object,
			default: () => ({})
		},
		siFileListParam: {
			type: Array,
			default: () => ([])
		}
	},
	data() {
		return {
			iconObj: {
				shipper: false,
				consignee: false,
				notify1: false,
				notify2: false,
				cargoMark: false,
				cargoDesc: false,
				remarkPrint: false
			},
			editData: '',
			editProp: '',
			editVisible: false,
			curProp: '',
			editTitle: '',
			editTitleObj: {
				consignee: '收货人',
				shipper: '发货人',
				notify1: 'Notify Party',
				notify2: 'Also Notify Party',
				cargoMark: '唛头',
				cargoDesc: '货物描述',
				remarkPrint: '提单备注'
			},
			editInputMaxLength: '',
			contactPersonShow: false,
			contactPersonConfig: {
				type: '收货人', // 类型，收货人，发货人，通知人
				num: '' // 通知人1，2，3
			},
			shipCarrierOptions: [],
			canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			interval: null,
			containersShow: false,
			truckContainerItem: {
				oid: '',
				containerId: '',
				cn: '',
				sn: '',
				so: '',
				containerType: '',
				packageType: '',
				volume: '',
				weight: '',
				quantity: '',
				isCheck: '',
				itemIsCheck: ''
			},
			siFileList: []
		}
	},
	async created() {
		this.siFileList = JSON.parse(JSON.stringify(this.siFileListParam))
		// this.getFileList()
	},
	mounted() {
	},
	watch: {
		siFileListParam: {
			handler(newVal, oldVal) {
				this.siFileList = newVal
			},
			deep: true
		}
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
		editReg() {
			//根据属性名设置编辑框正则
			if (this.curProp === 'remarkPrint' || this.curProp === 'remark' || ((this.curProp === 'cargoMark' || this.curProp === 'cargoDesc') && this.createItem.orderInfo.podPortName === 'TAICHUNG,TAIWAN')) {
				return /$a/g // 不匹配任何内容
			} else {
				return /[^\x00-\x7F]+/g
			}
		},
		cargoReg() {
			if (this.createItem.orderInfo.podPortName != 'TAICHUNG,TAIWAN') {
				return /[^\x00-\x7F]+/g
			} else {
				return /$a/g // 不匹配任何内容
			}
		},
	},
	components: {
		VesselSelect,
		VoyageSelect,
		TextAreaItem,
		ContactPerson
	},
	methods: {
		getDictLabelFunc(key, val) {
			let dictArr = this.custBlDictMap[key]
			let findItem = dictArr.find(item => item.value === val)
			return (findItem ? findItem.label : '')
		},
		// // 附件列表
		// getFileList() {
		// 	custBlFileList(this.param).then(res => {
		// 		this.siFileList = res.data || []
		// 	})
		// },
		handleViewFile(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},
		handleDeleteSiFile(index) {
			this.siFileList.splice(index, 1)
		},
		querySearchPorPort(queryString, cb) {
			this.createItem.orderInfo.bargePorPortCode = null
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute: 'port_of_feeder', state: this.state, isEn: true, systemCode: 'CUST' }).then(data => {
				cb(data)
			})
		},
		querySearchPolPort(queryString, cb) {
			this.createItem.orderInfo.polPortCode = null
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute: 'port_of_basic', state: this.state, isEn: true, systemCode: 'CUST' }).then(data => {
				cb(data)
			})
		},
		querySearchUnloadPort(queryString, cb) {
			this.createItem.orderInfo.unloadingPortCode = null
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute: 'port_of_discharge', state: this.state, isEn: true, systemCode: 'CUST' }).then(data => {
				cb(data)
			})
		},
		querySearchPodPort(queryString, cb) {
			this.createItem.orderInfo.podPortCode = null
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute: 'port_of_destination', state: this.state, isEn: true, systemCode: 'CUST' }).then(data => {
				cb(data)
			})
		},
		querySearchTransitPort(queryString, cb) {
			this.createItem.orderInfo.transitPortCode = null
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute: 'port_of_basic', state: this.state, isEn: true, systemCode: 'CUST' }).then(data => {
				cb(data)
			})
		},
		handleSelectPort(value, type) {
			this.createItem.orderInfo[type] = value.portCode
		},
		handleClearPort(value, type) {
			this.createItem.orderInfo[type] = null
		},
		handleFocus(val) {
			// 20211112变更临时不显示收发通行数，最大字符数的限制提示
			// this.$set(this.validateBlContact[val], 'showTip', true)
			this.iconObj[val] = false
		},
		openContactPerson(type, num) {
			// 打开收发通弹窗
			this.contactPersonConfig.type = type
			this.contactPersonConfig.num = num
			this.contactPersonShow = true
		},
		getContactPerson(action, value, type, num) {
			this.contactPersonShow = false
			if (action === 'Confirm') {
				let str = `${value.companyName ? value.companyName + '\n' : ''}${value.contactAddress ? value.contactAddress + '\n' : ''}${value.contactName ? value.contactName + '\n' : ''}${value.contactPhone ? 'TEL:' + value.contactPhone + '\n' : ''}${
					value.contactFax ? 'FAX:' + value.contactFax + '\n' : ''
				}${value.taxCode ? 'TAX:' + value.taxCode + '\n' : ''}${value.remark}`
				if (type === '收货人') {
					this.$set(this.createItem.blContact, 'consignee', str)
				} else if (type === '发货人') {
					this.$set(this.createItem.blContact, 'shipper', str)

					console.log('🚀 ~ this.createItem.blContact.shipper', this.createItem.blContact.shipper)
				} else {
					if (num == 1) {
						this.$set(this.createItem.blContact, 'notify1', str)
					} else if (num == 2) {
						this.$set(this.createItem.blContact, 'notify2', str)
					} else {
						// this.createItem.transport.notify3 = str
					}
				}
			}
		},
		//打开编辑框
		editDetail(val) {
			this.editTitle = this.editTitleObj[val]
			this.curProp = val
			if (val === 'remarkPrint' || val === 'remark') {
				this.editInputMaxLength = 512
			} else {
				this.editInputMaxLength = ''
			}
			// if (val === 'cargoMark' || val === 'cargoDesc') {
			// 	this.editInputMaxLength = 2048
			// } else {
			// 	this.editInputMaxLength = 512
			// }
			if (val === 'shipper' || val === 'consignee' || val === 'notify1' || val === 'notify2') {
				this.editData = this.createItem.blContact[val]
			}
			if (val === 'remarkPrint' || val === 'remark' || val === 'cargoMark' || val === 'cargoDesc') {
				this.editData = this.createItem[val]
			}
			if (val === 'forwardAgent') {
				this.editData = this.createItem.orderInfo[val]
			}
			this.editVisible = true
			// this.$nextTick(() => {
			// 	this.$refs.editInput.focus()
			// })
		},
		//关闭编辑框
		editConfirm() {
			let val = this.curProp
			if (val === 'shipper' || val === 'consignee' || val === 'notify1' || val === 'notify2') {
				this.createItem.blContact[val] = this.editData
			}
			if (val === 'remarkPrint' || val === 'remark' || val === 'cargoMark' || val === 'cargoDesc') {
				this.$set(this.createItem, val, this.editData)
			}
			if (val === 'forwardAgent') {
				this.createItem.orderInfo[val] = this.editData
			}
			//判断是否显示感叹号
			this.iconObj[this.curProp] = /[^\x00-\xff]+/g.test(this.editData)
			this.editVisible = false
		},
		handleChangeBlType(val) {

		},
		// 船名输入建议
		querySearchVessel(queryString, cb) {
			this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
				cb(data)
			})
		},
		handleSelectVessel(value) {},
		handleClearVessel(value) {},
		// 航次输入建议
		querySearchVoyage(queryString, cb, vessel) {
			this.$store.dispatch('dict/queryVoyageList', { name: queryString, vessel: vessel }).then(data => {
				cb(data)
			})
		},
		handleSelectVoyage(value) {},
		handleClearVoyage(value) {},
		// 船公司下拉
		shipCarrierVisibleChange(val) {
			if (val) {
				this.$store.dispatch('dict/baseShippingCarrierList', { name: '', state: 'valid' }).then(data => {
					this.shipCarrierOptions = data
				})
			}
		},
		shipCarrierFilterMehod(val) {
			if (val === undefined) return
			this.$store.dispatch('dict/baseShippingCarrierList', { name: val, state: 'valid' }).then(data => {
				this.shipCarrierOptions = data
			})
		},
		handleChangeShipCarrier(val) {
			this.getBlackUrlData()
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
		handleImport(values) {
			let siFileNoList = this.siFileList.map(item => item.fileNo)
			let params = {
				data: { ...values, siFileNoList },
				fileName: this.fileList
			}
			if (this.sizeLimit) {
				this.canSubmit = false
				this.handleProgress()
				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/cust/bl/save',
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
							message: '保存成功',
						})
						this.$emit('refresh', values.type)
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
		},
	}
}
</script>
<style lang="scss" scoped>
.bl-info {
	.tit {
		height: 24px;
		margin-bottom: 24px;
		.img-tit {
			display: inline-block;
			width: 20px;
			height: 20px;
			margin-right: 8px;
		}
		span {
			font-size: 20px;
			line-height: 24px;
			color: #222222;
			font-weight: bold;
		}
		/deep/ .el-button--mini {
			&.relate-btn {
				padding: 5px 12px;
				float: right;
			}
		}
	}
	.sub-tit {
		height: 40px;
		background: #F4F5F8;
		margin-bottom: 16px;
		span {
			font-size: 12px;
			font-weight: bold;
			color: #222222;
			line-height: 40px;
			margin-left: 8px;
		}
	}
	.row {
		margin-bottom: 24px;
		.item {
			line-height: 20px;
			display: flex;
			padding-left: 14px;
			&:first-child {
				padding-left: 0;
			}
			.label {
				color: #222;
				display: inline-block;
			}
			.value {
				display: inline-block;
				flex: 1;
				word-break: break-all;
				color: #4a4a4a;
				white-space: normal;
			}
		}
		.file-item {
			line-height: 20px;
			display: flex;
			margin-bottom: 8px;
			.si-file-name {
				display: inline-block;
				color: #206EF9;
				padding: 0;
				text-align: left;
				font-size: 12px;
			}
			.icon-si-file {
				display: inline-block;
				width: 16px;
				height: 16px;
				margin-right: 8px;
			}
			.el-icon-circle-close{
				display: none;
				font-size: 16px;
				color: #bbb;
				margin-left: 10px;
				cursor: pointer;
			}
			&:hover {
				.el-icon-circle-close{
					display: inline-block;
				}
			}
		}
		.column {
			line-height: 20px;
			padding-left: 20px;
			&:first-child {
				padding-left: 0;
			}
			.label {
				color: #222;
				margin-bottom: 10px;
			}
			.value {
				color: #4a4a4a;
			}
			/deep/ .input-div {
				border-radius: 0;
				border: 0;
				border-bottom: 1px solid #dcdfe6;
				line-height: 20px;
			}
		}
		/deep/ .el-form-item {
			.el-input__inner {
				border-radius: 0;
				border: 0;
				border-bottom: 1px solid #DCDFE6;
			}
			.el-textarea__inner {
				padding: 2px 8px;
				border-radius: 0;
				border: 0;
				border-bottom: 1px solid #DCDFE6;
			}
			&.is-error {
				.el-input__inner, .el-textarea__inner {
					border-color: #ff4949;
				}
			}
			
		}
		/deep/ .upload-file-cont {
			.file-upload {
				display: flex;
				height: 88px;
				background: #F4F8FF;
				border-radius: 2px;
				border: 1px solid #206EF9;
				padding: 0;
				.file-upload-img {
					width: 36px;
					height: 36px;
					margin: 26px 24px;
				}
				.file-upload__text {
					height: 40px;
					font-size: 12px;
					color: #969696;
					line-height: 20px;
					text-align: left;
					margin: 24px 0;
					.txt {
						line-height: 20px;
						margin-bottom: 0;
					}
					.info {
						text-align: left;
						padding: 0;
					}
				}
			}
		}
	}
}
</style>
