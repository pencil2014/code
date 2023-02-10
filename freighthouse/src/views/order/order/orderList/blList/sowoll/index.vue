<template>
	<div class="cust-bl-cont">
		<div class="bl-table">
			<div class="tit">
				<img :src="require(`@/views/order/order/images/sw/cust-tit-icon.png`)" class="img-tit" alt="">
				<span>提单信息</span>
			</div>
			<el-table
				class="bl-list"
				ref="blTable"
				style="width: 100%"
				:data="blList"
				:max-height="520"
				@cell-mouse-enter="showTooltip"
				@cell-mouse-leave="hiddenTooltip"
				:row-class-name="tableRowClassName"
			>
				<el-table-column label="序号" align="center" width="" type="index"></el-table-column>
				<el-table-column prop="blType" label="提单类型" align="center" width="">
					<template slot-scope="scope">
						{{ getDictLabelFunc('blType', scope.row.blType) }}
					</template>
				</el-table-column>
				<el-table-column prop="blNo" label="提单号" align="center" width=""></el-table-column>
				<el-table-column prop="status" label="提单状态" align="center" width="">
					<template slot-scope="scope">
						<span v-if="scope.row.blType === 'mbl'">{{ getDictLabelFunc('blStatus', scope.row.status) }}</span>
						<span v-else>
							{{scope.row.isDraftConfirm === 'y' ? '已确认' : '未确认'}}
						</span>
					</template>
				</el-table-column>
				<el-table-column prop="blMode" label="出单方式" align="center" width="">
					<template slot-scope="scope">
						{{ getDictLabelFunc('blMode', scope.row.blMode) }}
					</template>
				</el-table-column>
				<el-table-column prop="payMode" label="付款方式" align="center">
					<template slot-scope="scope">
						{{ getDictLabelFunc('payMode', scope.row.payMode) }}
					</template>
				</el-table-column>
				<el-table-column width="" prop="file" label="附件" align="center">
					<template slot-scope="scope">
						<div class="column-text">
							<el-button @click="handleViewFileList(scope.row)" type="text" size="mini" class="underline">查看</el-button>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleInfo(scope.row, 'si')" type="text" size="mini" v-if="['si_waiting', 'si_refuse'].includes(scope.row.status)">补料</el-button>
							<el-button @click="handleCopyConfirm(scope.row)" type="text" size="mini" class="green" v-if="['si_copy_confirming'].includes(scope.row.status)">copy件确认无误</el-button>
							<el-button @click="handleInfo(scope.row, 'view')" type="text" size="mini" v-if="['si_confirming', 'si_confirmed', 'si_finished', 'si_copy_confirming', 'si_copy_confirmed', 'bl_put_finish',].includes(scope.row.status)">详情</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
		</div>
		<!-- 详情 -->
		<div class="bl-detail" v-if="showDetail">
			<div class="msg-tip" v-if="infoType === 'si'">
				<img :src="require(`@/views/order/order/images/sw/msg-tip.png`)" alt="">
				<span>以下所需信息，请认真填写，如有疑问请及时联系客服</span>
			</div>
			<el-form ref="blSubmit" :model="createItem" :rules="rules" class="order-cont-form" size="mini">
				<div class="tit">
					<img :src="require(`@/views/order/order/images/sw/cust-tit-icon.png`)" class="img-tit" alt="">
					<span>补料信息</span>
				</div>
				<BlInfo v-if="infoType === 'view'" :createItem="createItem" :fillPortCodes="fillPortCodes" :custBlDictMap="custBlDictMap" :param="infoFileListQuery"/>
				<SiInfo v-if="infoType === 'si'" :createItem="createItem" :fillPortCodes="fillPortCodes" :custBlDictMap="custBlDictMap" :param="infoFileListQuery" :siFileListParam="siFileList" @refresh="getBlList" ref="siInfo" />
				<!-- 集装箱信息 -->
				<BindContainer
					v-if="infoType === 'si'"
					:custBlDictMap="custBlDictMap"
					:selectContainerList="selectContainerList"
					:bindContainerList="createItem.blCargos"
					@bind="handleBind"
					@cancelBind="handleCancelBind"
				/>
			</el-form>
			<div class="save-row" v-if="infoType === 'si'">
				<div class="save-wrap">
					<el-button type="success" class="save-btn submit-btn" @click="handleSave('SUBMIT')">
						<i class="el-icon-check"></i>提交
					</el-button>
					<el-button type="primary" class="save-btn" @click="handleSave('SAVE')">
						<img :src="require(`@/views/order/order/images/sw/icon-save.png`)" class="img-save" alt="">保存
					</el-button>
				</div>
			</div>
		</div>
		<!-- 附件列表 -->
		<div v-if="blFileListShow">
			<BlFileList @close="blFileListPopClose" :param="fileListItemQuery" />
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import {
	custBlList,
	custBlDetail,
	custBlDictList,
	custBlCopyConfirm,
	custBlPackageList,
	custBlFileList
} from '@/api/order/bl'
import { canEnter } from '@/views/order/order/js/check.js'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import BlFileList from './components/blFileList'
import BlInfo from './components/blInfo'
import SiInfo from './components/siInfo'
import BindContainer from './components/bindContainer'

const defaultCreateQuery = {
	// createdBy: '',
	blId: undefined,
	parentBlId: null,
	orderNo: '',
	blMode: '',
	blNo: '',
	blType: '',
	cargoDesc: '',
	cargoMark: '',
	// copyCount: '',
	// canEdit: '',
	issueTime: '',
	// masterBlNo: '',
	// originalCount: '',
	// remark: '',
	remarkPrint: '',
	// signAddress: '',
	// signEmployeeId: '',
	// signEmployeeName: '',
	// signTime: '',
	// tripartiteTrade: '',
	// placeCompName: '',
	orderInfo: {
		bargeVessel: '',
		bargeVoyage: '',
		bargePorPortCode: '',
		bargePorPortName: '',
		vessel: '',
		voyage: '',
		polPortCode: '',
		polPortName: '',
		transitPortCode: '',
		transitPortName: '',
		podPortCode: '',
		podPortName: '',
		unloadingPortCode: '',
		unloadingPortName: '',
		shipCarrierCode: '',
		// siCutOff: '',
		// etaTime: '',
		// tdTime: '',
		// bargeTdTime: '',
		// shipmentTime: '',
		deliveryPlace: '',
		payMode: '',
		// transportTerm: '',
		// contractNo: '',
		// contractCompany: '',
		// contractSupplierId: '',
		// forwardAgent: ''
		contractSupplierName: '',
	},
	blCargos: [],
	blContact: {
		// blNo: '',
		consignee: '',
		notify1: '',
		notify2: '',
		// notify3: '',
		shipper: '',
		// intrustRemark: ''
	},
	// blLclDto: {
	// 	cn: '',
	// 	sn: '',
	// 	whNo: '',
	// 	containerType: '',
	// 	quantity: '',
	// 	weight: '',
	// 	volume: '',
	// 	packageType: ''
	// },
	// quantity: null,
	// weight: null,
	// volume: null,
	// packageType: '',
	// isDraftConfirm: '',
}
export default {
	props: {
	},
	data() {
		return {
			createItem: Object.assign({}, defaultCreateQuery),
			timeStamp: '',
			key: '',
			// 港口反显数据
			fillPolData: {},
			fillPortCodes: '',
			rules: {},
			showDetail: false,
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			},
			blList: [],
			blFileListShow: false, // 查看附件弹窗
			fileListItemQuery: {}, // 附件弹窗props
			infoFileListQuery: {},
			selectContainerList: [],
			containerItem: {
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
			custBlDictMap: {
				blType: [],
				blMode: [],
				payMode: [],
				packageType: [],
				blStatus: []
			},
			infoType: '',	// 详情信息
			siFileList: []
		}
	},
	async created() {
		// 获取订单详情
		// this.getOrderInfoData()
		this.getBlType()
		this.getBlMode()
		this.getPayMode()
		this.getPackageType()
		this.getBlStatus()
		// bl列表
		this.getBlList()
	},
	mounted() {
	},
	watch: {
	},
	computed: {
		...mapState({
			speciesStrArr: state => state.order.speciesStrArr,
		}),
	},
	components: {
		BlInfo,
		tableTooltip,
		BlFileList,
		BlInfo,
		SiInfo,
		BindContainer
	},
	methods: {
		getBlType() {
			custBlDictList({
				groupCode: 'bl_type'
			}).then(res => {
				let { data } = res
				if (data.length) {
					this.custBlDictMap.blType = data[0].itemList.filter(item => item.itemCode !== 'mbl_hbl').map(item => {
						return { ...item, label: item.itemCname, value: item.itemCode }
					})
				}
			})
		},
		getBlMode() {
			custBlDictList({
				groupCode: 'bl_mode'
			}).then(res => {
				let { data } = res
				if (data.length) {
					this.custBlDictMap.blMode = data[0].itemList.map(item => {
						return { ...item, label: item.itemCname, value: item.itemCode }
					})
				}
			})
		},
		getPayMode() {
			custBlDictList({
				groupCode: 'pay_mode'
			}).then(res => {
				let { data } = res
				if (data.length) {
					this.custBlDictMap.payMode = data[0].itemList.map(item => {
						return { ...item, label: item.itemCname, value: item.itemCode }
					})
				}
			})
		},
		getPackageType() {
			custBlPackageList({
				keywords: '',
				pageSize: 1000
			}).then(res => {
				let { data } = res
				if (data.list.length) {
					this.custBlDictMap.packageType = data.list.map(item => {
						return {...item, label: item.packageCode, value: item.packageCode}
					})
				}
			})
		},
		getBlStatus() {
			custBlDictList({
				groupCode: 'bl_status'
			}).then(res => {
				let { data } = res
				if (data.length) {
					this.custBlDictMap.blStatus = data[0].itemList.map(item => {
						return { ...item, label: item.itemCname, value: item.itemCode }
					})
				}
			})
		},
		getDictLabelFunc(key, val) {
			let dictArr = this.custBlDictMap[key]
			let findItem = dictArr.find(item => item.value === val)
			return (findItem ? findItem.label : '')
		},
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		async getOrderInfoData() {
			let { orderNo, jointNo } = this.$route.query
			this.createItem.orderNo = orderNo
			let fn = jointNo ? orderJointInfo : orderInfo
			let data = jointNo ? { jointNo } : { orderNo }
			let res = await fn(data)
			this.detailInfo = res.data
			this.bargeOption = res.data.barge
			this.workAssign = res.data.workAssign
			// 存储客户id，用于发货人选择弹窗列表调用接口获取参数
			let cust = {
				custid: res.data.custid,
				custName: res.data.custName,
				custIntrustNo: res.data.custIntrustNo,
				businessType: res.data.businessType,
				serviceType: res.data.serviceType
			}
			sessionStorage.setItem('custStr', JSON.stringify(cust))
			this.isView = ['cancel', 'complete'].includes(this.detailInfo.orderStatus) ? true : false
			if (['ship_export_lcl', 'ship_import_lcl'].includes(this.detailInfo.businessType)) {
				// this.exportTypeOptions = [
				// 	{ label: 'HBL确认件', value: 'hbl_confirm' },
				// 	{ label: '电放申请保函', value: 'telex_apply' }
				// ]
				this.getCnList()
			}
		},
		// 为table的行row设置一个className
		tableRowClassName({ row, rowIndex }) {
			// console.log(row, rowIndex)
			if (row.blId === this.createItem.blId && this.showDetail) {
				return 'isChecked-row'
			}
			return ''
		},
		async init(data) {
			console.log('🚀 ~ data', data)
			this.selectContainerList = []
			this.createItem = Object.assign({}, defaultCreateQuery)
			let blLclDto = {}
			let cargoMark = ''
			let cargoDesc = ''
			let quantity = 0
			let weight = 0
			let volume = 0
			let packageType = ''
			this.serviceType = data.serviceType
			// 散货委托订舱的提单
			if (['st03', 'st18', 'st11', 'st12'].includes(data.serviceType)) {
				blLclDto = {
					quantity: data.quantity,
					weight: data.weight,
					volume: data.volume,
					cn: this.cnList && this.cnList.length ? this.cnList[0].cn : '',
					sn: this.cnList && this.cnList.length ? this.cnList[0].sn : ''
				}
			}
			// 获取唛头，货描
			let enameArr = []
			let commodityDescArr = []
			data.cargoList &&
				data.cargoList.forEach((item, index) => {
					if (item.mark) {
						cargoMark += index ? '\n' + item.mark : item.mark
					}
					if (item.ename) {
						// cargoDesc += index ? '\n' + item.ename : item.ename
						enameArr.push(item.ename)
					}
					if (item.commodityDesc) {
						commodityDescArr.push(item.commodityDesc)
					}
					// 散杂滚装的计算件数，毛重，体积的总和，带入到提单里
					quantity += item.quantity ? Number(item.quantity) : 0
					weight += item.weight ? Number(item.weight) : 0
					volume += item.volume ? Number(item.volume) : 0
				})
			Object.assign(this.createItem, {
				// blId: undefined,
				// blNo: '',
				// blType: '',
				// parentBlId: data.parentBlId,
				cargoMark,
				cargoDesc: commodityDescArr.length ? commodityDescArr.join('\n') : enameArr.join('\n'),
				serviceType: data.serviceType,
				blMode: data.ship.blMode,
				signTime: data.ship.tdTime,
				orderInfo: {
					bargeVessel: data.barge ? data.barge.vessel : '',
					bargeVoyage: data.barge ? data.barge.voyage : '',
					bargePorPortCode: data.barge ? data.barge.porPortCode : '',
					bargePorPortName: '',
					vessel: data.ship.vessel,
					voyage: data.ship.voyage,
					polPortCode: data.ship.polPortCode,
					polPortName: '',
					transitPortCode: data.ship.transitPortCode,
					transitPortName: '',
					podPortCode: data.ship.podPortCode,
					podPortName: '',
					unloadingPortCode: data.ship.unloadingPortCode,
					unloadingPortName: '',
					shipCarrierCode: data.ship.shipCarrierCode,
					siCutOff: data.ship.siCutOff || '',
					deliveryPlace: data.transport ? data.transport.destinationArea : '',
					payMode: data.payMode,
					transportTerm: data.transport ? data.transport.transportTerm : '',
					contractNo: data.ship.contractNo,
					contractCompany: data.ship.contractCompany,
					contractSupplierId: data.ship.contractSupplierId,
					etaTime: data.ship.etaTime,
					tdTime: data.ship.tdTime,
					bargeTdTime: data.barge ? data.barge.tdTime : '',
					shipmentTime: '',
					receiptPlace: data.ship.receiptPlace
				},
				blContact: {
					// blNo: '',
					consignee: data.transport ? data.transport.consignee : '',
					notify1: data.transport ? data.transport.notify1 : '',
					notify2: data.transport ? data.transport.notify2 : '',
					notify3: data.transport ? data.transport.notify3 : '',
					shipper: data.transport ? data.transport.shipper : '',
					intrustRemark: ''
				},
				blCargos: [],
				blLclDto
			})
			// 散杂滚装的
			if (this.isBulkRo) {
				Object.assign(this.createItem, {
					quantity,
					volume,
					weight,
					packageType: this.setPackageTypes(data.cargoList)
				})
			}
			// // 散货委托订舱的提单只能建HBL
			// if (['st03', 'st18'].includes(data.serviceType)) {
			// 	Object.assign(this.createItem, {
			// 		blType: 'hbl'
			// 	})
			// 	let res = await blCreateSerialNo({ orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo })
			// 	Object.assign(this.createItem, {
			// 		blNo: res.data.serialNo
			// 	})
			// }
			// 反显orderInfo从订单详情带过来的订单信息
			this.fillOrderInfo(this.createItem)
			// setTimeout(() => {
			// 	this.initDataObj = JSON.parse(JSON.stringify(this.createItem))
			// }, 500)
		},
		// 从订单详情的货品信息获取包装。包装一样的就取一个。不一样的，取个最短的，如果长的都包含短的就取一个长的，否则就是PACKAGES。
		setPackageTypes(cargoList) {
			let result = ''
			let packageTypeArr = cargoList.filter(item => item.packageInfo).map(item => item.packageInfo)
			if (packageTypeArr.length === 0) {
				result = ''
			} else if (new Set(packageTypeArr).size === 1) {
				// 包装都一样的
				result = packageTypeArr[0]
			} else {
				let lens = packageTypeArr.map(item => item.length)
				// 数组中元素字符长度最短的
				let minLen = Math.min.apply(null, lens)
				result = packageTypeArr[lens.indexOf(minLen)]
				let longPackageArr = packageTypeArr.filter(item => item !== result)
				// 其他长的都包含短的元素
				if (longPackageArr.every(item => item.includes(result))) {
					result = longPackageArr[0]
				} else {
					result = 'PACKAGES'
				}
				// console.log('packageTypeArr', packageTypeArr)
				// console.log('lens', lens, minLen)
			}
			return result
		},
		// 获取提单列表
		getBlList(type) {
			let { orderNo, timeStamp, key } = this.$route.query
			if (type === 'SUBMIT') {
				this.showDetail = false
			}
			custBlList({ orderNo, timeStamp, key })
				.then(res => {
					let { data } = res
					this.blList = data || []
					// console.log('orderInfo', this.detailInfo, this.blList, this.saveId)
					// 有提单打开了详情，刷新了列表数据，详情也要跟着刷新数据
					if (this.saveId && this.showDetail) {
						let row = {}
						this.blList.forEach(item => {
							if (item.blId === this.saveId) {
								row = { ...item }
							}
						})
						// console.log('row', row)
						this.handleInfo(row, this.infoType)
					}
				})
				.catch(err => {
					console.log('err', err)
				})
		},
		// 反显orderInfo的值
		fillOrderInfo(infoData) {
			// 港口数据反显
			if (infoData.orderInfo) {
				infoData.orderInfo.transitPortCode &&
					Object.assign(this.createItem.orderInfo, {
						transitPortCode: infoData.orderInfo.transitPortCode.split(',')
					})

				let { bargePorPortCode, polPortCode, podPortCode, transitPortCode, unloadingPortCode } = infoData.orderInfo
				// let porPortCode = infoData.barge ? infoData.barge.porPortCode : ""
				let portCodeArr = []
				bargePorPortCode ? portCodeArr.push(bargePorPortCode) : ''
				polPortCode ? portCodeArr.push(polPortCode) : ''
				podPortCode ? portCodeArr.push(podPortCode) : ''
				transitPortCode ? portCodeArr.push(transitPortCode) : ''
				unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
				this.fillPortCodes = portCodeArr.toString()
				// console.log('fillPortCodes', this.fillPortCodes)
			}
		},
		// 查看附件弹窗
		handleViewFileList(row) {
			this.blFileListShow = true
			this.fileListItemQuery = {
				blId: row.blId,
				orderNo: row.orderNo,
				timeStamp: row.timeStamp,
				key: row.key
			}
		},
		blFileListPopClose(action, value) {
			this.blFileListShow = false
		},
		// 详情
		handleInfo(row, type) {
			let { blId, orderNo, timeStamp, key } = row
			this.timeStamp = timeStamp
			this.key = key
			this.infoFileListQuery = {
				blId: row.blId,
				orderNo: row.orderNo,
				timeStamp: row.timeStamp,
				key: row.key
			}
			this.selectContainerList = []
			this.infoType = type
			let parentBlId = row.parentBlId
			if (parentBlId !== 0 && parentBlId !== null) {
				custBlDetail({ blId: parentBlId, orderNo, timeStamp, key }).then(res => {
					let { data } = res
					//设置集装箱弹窗供选择数据
					this.selectContainerList = data.blCargos
				})
			}

			custBlDetail({ blId, orderNo, timeStamp, key }).then(res => {
				console.log('detail', res.data);
				let { data } = res
				for (let i in this.createItem) {
					if (i === 'parentBlId') {
						this.createItem[i] = data[i]
					} else {
						this.createItem[i] = data[i] || ''
					}
				}
				// this.createItem.blLclDto = data.blLcl ? data.blLcl : {}
				this.createItem.orderInfo = data.orderInfo ? data.orderInfo : {}

				// 过滤返回的集装箱数据
				this.createItem.blCargos = this.filterBlCargos(data.blCargos, 'info')
				this.saveId = data.blId
				// 20210823详情无需调港口接口获取数据，直接显示portName值
				this.fillOrderInfo(this.createItem)
				// setTimeout(() => {
				// 	this.initDataObj = JSON.parse(JSON.stringify(this.createItem))
				// }, 500)
				this.type = 'edit'
				this.getFileList(this.infoFileListQuery)
				this.showDetail = true
				// // 补料详情要更新补料附件
				// if (type === 'si') {
				// 	this.$refs.siInfo.getFileList()
				// }
			})
		},
		getFileList(param) {
			custBlFileList(param).then(res => {
				this.siFileList = res.data || []
			})
		},
		handleCopyConfirm(row) {
			let { orderNo, blId, timeStamp, key } = row
			this.$confirm('copy件是否确认核对无误?', "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				custBlCopyConfirm({
					orderNo,
					blId,
					timeStamp,
					key
				}).then(res => {
					this.$message.success('copy件确认成功')
					this.getBlList()
				}).catch(err => {
					console.log(err);
				})
			}).catch((err) => {
			});
		},
		checkSpeciesStrMethod(item) {
			let check = true
			if (!item) return check
			let reg = /[^\x00-\x7F]+/g
			let result = item.match(reg)
			if (result && result.length) {
				if (result.every(o => this.speciesStrArr.includes(o))) {
					check = true
				} else {
					check = false
				}
			} else {
				check = true
			}
			return check
		},
		validate() {
			if (!this.createItem.blMode) {
				this.$message.error('出单方式不能为空')
				return false
			}
			if (!this.createItem.orderInfo.payMode) {
				this.$message.error('付款方式不能为空')
				return false
			}
			if (!this.createItem.blContact.shipper) {
				this.$message.error('Shipper(发货人)不能为空')
				return false
			}
			if (!this.createItem.blContact.consignee) {
				this.$message.error('Consignee(收货人)不能为空')
				return false
			}
			if (!this.createItem.blContact.notify1) {
				this.$message.error('Notify Party1(通知人1)不能为空')
				return false
			}
			if (!this.createItem.cargoMark) {
				this.$message.error('唛头不能为空')
				return false
			}
			if (!this.createItem.cargoDesc) {
				this.$message.error('货物描述不能为空')
				return false
			}
			// if (!this.createItem.orderInfo.bargePorPortName) {
			// 	this.$message.error('收货地不能为空')
			// 	return false
			// }
			if (!this.createItem.orderInfo.polPortName) {
				this.$message.error('大船起运港不能为空')
				return false
			}
			// if (!this.createItem.orderInfo.transitPortName) {
			// 	this.$message.error('中转港不能为空')
			// 	return false
			// }
			// if (!this.createItem.orderInfo.unloadingPortName) {
			// 	this.$message.error('卸货港不能为空')
			// 	return false
			// }
			// if (!this.createItem.orderInfo.podPortName) {
			// 	this.$message.error('目的地不能为空')
			// 	return false
			// }
			// if (!this.createItem.orderInfo.deliveryPlace) {
			// 	this.$message.error('最终目的地不能为空')
			// 	return false
			// }
			return true
		},
		blCargosValidate(values) {
			console.log('values', values)
			let reg = /^\d+(\.\d+)?$/,
				numberReg = /^[0-9]+$/
			if (values.some(item => !item.cn)) {
				this.$message({ type: 'error', message: '集装箱信息的箱号不能为空' })
				return false
			}
			if (values.some(item => !item.sn)) {
				this.$message({ type: 'error', message: '集装箱信息的封号不能为空' })
				return false
			}
			if (values.some(item => !numberReg.test(item.quantity))) {
				this.$message({ type: 'error', message: '集装箱信息中请输入正确的件数' })
				return false
			}
			if (values.some(item => !item.weight)) {
				this.$message({ type: 'error', message: '集装箱信息的毛重不能为空' })
				return false
			}
			if (values.some(item => !item.volume)) {
				this.$message({ type: 'error', message: '集装箱信息的体积不能为空' })
				return false
			}
			if (values.some(item => !item.packageType)) {
				this.$message({ type: 'error', message: '集装箱信息的包装不能为空' })
				return false
			}
			return true
		},
		// 新增保存
		async handleSave(type) {
			if (!this.validate()) return 
			//非台湾 有中文 不能保存
			let noTaiwanArr = [
				this.createItem.blContact.shipper,
				this.createItem.blContact.consignee,
				this.createItem.blContact.notify1,
				this.createItem.blContact.notify2,
				this.createItem.cargoDesc,
				this.createItem.cargoMark
				// this.createItem.remarkPrint
			]
			let arrCheck = [
				{ text: 'Shipper(发货人)', value: this.createItem.blContact.shipper },
				{ text: 'Consignee(收货人)', value: this.createItem.blContact.consignee },
				{ text: 'Notify Party(通知人)', value: this.createItem.blContact.notify1 },
				{ text: 'Also Notify Party', value: this.createItem.blContact.notify2 }
			]
			let taiwanArr = [this.createItem.blContact.shipper, this.createItem.blContact.consignee, this.createItem.blContact.notify1, this.createItem.blContact.notify2, this.createItem.orderInfo.forwardAgent]
			if (this.createItem.orderInfo.podPortName != 'TAICHUNG,TAIWAN') {
				if (noTaiwanArr.some(item => !this.checkSpeciesStrMethod(item))) return this.$message.warning('发货人,收货人,通知人,唛头,货物描述中不能包含中文字符及特殊字符!')
			} else {
				if (taiwanArr.some(item => !this.checkSpeciesStrMethod(item))) return this.$message.warning('发货人,收货人,通知人中不能包含中文字符及特殊字符!')
			}
			if (!canEnter(arrCheck)) return
			if (!this.blCargosValidate(this.createItem.blCargos)) return
			let data = JSON.parse(JSON.stringify(this.createItem))
			if (data.orderInfo.transitPortCode && data.orderInfo.transitPortCode.length) {
				data.orderInfo.transitPortCode = data.orderInfo.transitPortCode.toString()
			} else {
				data.orderInfo.transitPortCode = ''
			}
			// console.log('data.orderInfo', data.orderInfo)
			this.blSave({ ...data, blId: this.saveId }, type)
		},
		async blSave(data, type) {
			// console.log('data', data)
			delete data.orderInfo.oid
			// delete data.blLclDto.oid
			// this.loading = true
			// //调接口验证信息是否一致
			// let checkRes = await blSaveCheck(
			// 	Object.assign(data, {
			// 		orderNo: this.$route.query.orderNo,
			// 		jointNo: this.$route.query.jointNo
			// 	})
			// ).catch(err => {})
			// // console.log('checkRes', checkRes)
			// if (!checkRes) {
			// 	this.loading = false
			// } else if (checkRes.code != 0) {
			// 	this.loading = false
			// 	this.$confirm(checkRes.msg, '提示', {
			// 		confirmButtonText: '是',
			// 		cancelButtonText: '否',
			// 		type: 'warning'
			// 	})
			// 		.then(() => {
			// 			// console.log('确定了')
			// 			this.blSaveMethod(data, 'y')
			// 		})
			// 		.catch(() => {
			// 			this.blSaveMethod(data, 'n')
			// 		})
			// } else {
			// 	this.blSaveMethod(data)
			// }
			this.blSaveMethod(data, type)
		},
		blSaveMethod(data, type) {
			// let obj = {}
			// // if (isCover) {
			// // 	obj = { isCover }
			// // }
			if (type === 'SUBMIT') {
				this.$confirm('是否提交该补料信息?', "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}).then(() => {
					this.$refs.siInfo.handleImport({
						...data,
						orderNo: this.$route.query.orderNo,
						timeStamp: this.timeStamp,
						key: this.key,
						type
						// ...obj
					})
				}).catch((err) => {
				});
			} else {
				this.$refs.siInfo.handleImport({
					...data,
					orderNo: this.$route.query.orderNo,
					timeStamp: this.timeStamp,
					key: this.key,
					type
					// ...obj
				})
			}
			
			// blSave(
			// 	Object.assign(data, {
			// 		orderNo: this.$route.query.orderNo,
			// 		jointNo: this.$route.query.jointNo,
			// 		...obj
			// 	})
			// )
			// 	.then(res => {
			// 		this.loading = false
			// 		this.$message({
			// 			type: 'success',
			// 			message: '保存成功'
			// 		})
			// 		if (this.$route.query.source === 'SiListAddBl') {
			// 			this.$confirm('提单是否要草单确认?', '提示', {
			// 				confirmButtonText: '是',
			// 				cancelButtonText: '否',
			// 				type: 'warning'
			// 			})
			// 				.then(() => {
			// 					this.blDraftConfirm({ orderNo: this.$route.query.orderNo, blId: res.data.blId })
			// 				})
			// 				.catch(() => {
			// 					this.$router.push({
			// 						name: 'SiList'
			// 					})
			// 				})
			// 		} else {
			// 			let { blId } = res.data
			// 			this.saveId = blId
			// 			this.getBlList()
			// 			this.type = ''
			// 			// this.$message({
			// 			// 	type: 'success',
			// 			// 	message: '保存成功'
			// 			// })
			// 		}
			// 	})
			// 	.catch(err => {
			// 		this.loading = false
			// 	})
		},
		handleSubmit() {
			
		},
		// 处理绑定集装箱的数据
		handleBind(value) {
			let blCargos = this.filterBlCargos(value)
			blCargos.map(item => {
				let sItem = this.createItem.blCargos.find(ele => ele.containerId === item.containerId)
				if (!sItem) {
					this.createItem.blCargos.push(item)
				}
			})
		},
		// 处理取消绑定集装箱的数据
		handleCancelBind(rowIndex) {
			this.createItem.blCargos = this.createItem.blCargos.filter((item, index) => {
				return rowIndex != index
			})
		},
		// 过滤集装箱数据
		filterBlCargos(data, type) {
			return data.map(item => {
				for (let i in this.containerItem) {
					if (type === 'info') {
						this.containerItem[i] = item[i]
						if (i === 'packageType') {
							this.containerItem[i] = item.packageType || item.packageInfo
						}
						if (i === 'itemIsCheck') {
							this.containerItem[i] = item.isCheck === 'Y' ? true : false
						}
					} else {
						if (i === 'oid') {
							this.containerItem[i] = undefined
						} else {
							this.containerItem[i] = item[i]
							if (i === 'containerId') {
								this.containerItem[i] = this.selectContainerList.length == 0 ? item.oid : item.containerId
							}
							if (i === 'packageType') {
								this.containerItem[i] = item.packageType || item.packageInfo
							}
							if (i === 'itemIsCheck') {
								this.containerItem[i] = item.isCheck === 'Y' ? true : false
							}
						}
					}
				}
				return Object.assign({}, this.containerItem)
			})
		},
	}
}
</script>
<style lang="scss" scoped>
.cust-bl-cont {
	width: 1280px;
	margin: 0 auto;
	.bl-table {
		margin-top: 40px;
		/deep/ .el-table{
			th {
				background-color: #F4F5F8;
				height: 40px;
				line-height: 20px;
				padding: 10px 0;
			}
			td {
				line-height: 20px;
				padding: 10px 0;
				border-bottom: 1px solid #EBEEF5;
			}
			.cell {
				.column-text {
					.el-button {
						padding: 3px 10px;
						height: 20px;
					}
				}
			}
			.operate-group {
				.el-button--mini {
					margin-right: 5px;
					margin-left: 5px;
				}
			}
		}
	}
	.bl-detail {
		padding-bottom: 150px;
		margin-top: 40px;
		.msg-tip {
			// width: 1280px;
			height: 32px;
			background: #FFF6E1;
			box-shadow: 0px 4px 10px 0px #e9e9e9;
			border-radius: 2px;
			border: 1px solid #EDB534;
			// margin-top: 40px;
			margin-bottom: 24px;
			img {
				display: inline-block;
				width: 16px;
				height: 16px;
				vertical-align: sub;
				margin-left: 16px;
			}
			span {
				color: #DFA725;
				font-size: 12px;
				line-height: 32px;
				margin-left: 8px;
			}
		}
		.save-row {
			position: fixed;
			z-index: 9999;
			bottom: 0;
			left: 0;
			right: 0;
			height: 128px;
			background: rgba(255,255,255,0.7);
			box-shadow: 0px 4px 10px 0px rgba(200,200,200,0.5);
			backdrop-filter: blur(8px);
			.save-wrap {
				width: 1280px;
				height: 128px;
				margin: 0 auto;
				.save-btn {
					margin-top: 36px;
					width: 80px;
					height: 56px;
					border-radius: 2px;
					text-align: center;
					float: right;
					cursor: pointer;
					color: #fff;
					line-height: 56px;
					font-size: 12px;
					padding: 0;
					&.submit-btn {
						background: #33B18A;
						margin-left: 20px;
					}
					.el-icon-check {
						font-size: 18px;
						color: #fff;
						margin-right: 6px;
					}
					.img-save {
						width: 16px;
						height: 16px;
						margin-right: 10px;
						vertical-align: sub;
					}
				}
			}
		}
	}
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
	}
}
</style>
