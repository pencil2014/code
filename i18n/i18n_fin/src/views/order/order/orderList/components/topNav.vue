<template>
	<div id="navCont">
		<el-alert v-if="!['jointList', 'whJointList'].includes($route.query.source) && Object.keys(custInfoObj).length && custInfoObj.status !== 'valid'&& custInfoObj.custClass !== 'DEPARTMENT'" class="forbid" type="warning">
			<template slot="title">
				<i class="tag-forbid">{{$t('OrderFee.forbidSimple')}}</i>
				<span class="text">{{$t('OrderFee.noQualifNotRelease')}}</span>
			</template>
		</el-alert>
		<!-- 协同单服务项是否取消协同的提示 -->
		<CancelJointAlert v-if="['jointList', 'whJointList'].includes($route.query.source) && isCancelJointAlert" @getInfo="getOrderInfo" />
		<el-alert v-if="showDrop && isSoUpdate === 'Y' && orderList.ordDetRole === 'op'" class="drop-alert" type="warning">
			<div slot="title" class="drop-content">
				<span v-if="dropStatus === 'ALL'" class="drop-word">{{$t('OrderFee.all')}}</span>
				<span v-if="dropStatus === 'PART'" class="drop-word">{{$t('OrderFee.part')}}</span>
				<span class="drop-txt">{{$t('OrderFee.soUpdatePlsNote')}}</span>
			</div>
		</el-alert>
		<el-alert v-if="showDrop" class="drop-alert" type="warning">
			<div slot="title" class="drop-content">
				<span v-if="showAll" class="drop-word">{{$t('OrderFee.all')}}</span>
				<span v-if="showAll" class="drop-txt">{{$t('OrderFee.soAllDumpPlsNote')}}<el-button @click="viewDropDetail" type="text">{{$t('OrderFee.viewDetails')}}</el-button></span>
				<span v-if="showPart" class="drop-word">{{$t('OrderFee.part')}}</span>
				<span v-if="showPart" class="drop-txt">{{$t('OrderFee.soPartDumpPlsNote')}}<el-button @click="viewDropDetail" type="text">{{$t('OrderFee.viewDetails')}}</el-button></span>
				<span v-if="isBd">
					<el-button @click="agreeNotice" class="drop-agree" type="text">{{$t('OrderFee.agreeAndNotify')}}</el-button>
					<el-button @click="agreeNoNotice" class="drop-agree" type="text">{{$t('OrderFee.agreeNotNotify')}}</el-button>
					<el-button @click="disagree" class="drop-disagree" type="text">{{$t('OrderFee.disagree')}}</el-button>
				</span>

				<el-dialog :title="$t('OrderFee.soDetail')" :before-close="handleClose" :visible.sync="showSoDetail">
					<el-table fit header-row-class-name="left-title" :data="soDropList" style="width: 100%">
						<el-table-column fixed prop="so" :label="$t('OrderFee.soNo')" width="150" align="right">
							<template slot-scope="scope"> <span v-if="scope.row.isDrop == 'Y'" class="drop-word">{{$t('OrderFee.dump')+$t('OrderFee.enspace')}}</span> {{ scope.row.so }}</template>
						</el-table-column>

						<el-table-column prop="vessel" width="200" :label="$t('OrderFee.vessel')" align="center">
							<template slot-scope="scope">
								<span>{{ scope.row.vesselOld }} <i v-if="scope.row.vesselOld" class="el-icon-right drop-arrow"></i> {{ scope.row.vessel }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="voyage" :label="$t('OrderFee.voyage')" width="180" align="center">
							<template slot-scope="scope"
								><span>{{ scope.row.voyageOld }} <i v-if="scope.row.voyageOld" class="el-icon-right drop-arrow"></i> {{ scope.row.voyage }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="cutOffDate" width="180" :label="$t('OrderFee.cutOffDate')" align="center">
							<template slot-scope="scope">
								<span>{{ scope.row.cutOffDateOld }} <i v-if="scope.row.cutOffDateOld" class="el-icon-right drop-arrow"></i> {{ scope.row.cutOffDate }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="containerInfo" show-overflow-tooltip width="100" :label="$t('PayApplyList.containerCount')" align="center">
							<template slot-scope="scope"
								><span>{{ scope.row.containerInfo }}</span>
							</template>
						</el-table-column>

						<el-table-column prop="dropRemark" width="100" show-overflow-tooltip :label="$t('OrderFee.dumpRemark')" align="center">
							<template slot-scope="scope">{{ scope.row.dropRemark }} </template>
						</el-table-column>
						<el-table-column prop="soFileName" width="100" show-overflow-tooltip :label="$t('OrderFee.soFile')" align="center">
							<template slot-scope="scope"
								><span class="drop-file-certificate" @click="handleViewSo(scope.row)">{{ scope.row.soFileName }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="soUpdateEmployeeName" :label="$t('OrderFee.updatedName')" align="center"> </el-table-column>
						<el-table-column prop="soUpdateTime" :label="$t('OrderFee.updatedTime')" align="center"> </el-table-column>

						<el-table-column fixed="right" width="100" show-overflow-tooltip :label="$t('OrderFee.dumpProof')" align="center">
							<template slot-scope="scope"
								><span class="drop-file-certificate" @click="handleViewDrop(scope.row)">{{ scope.row.fileName }}</span>
							</template>
						</el-table-column>
					</el-table>
					<div v-if="isBd" class="dlg-buttons">
						<el-button @click="agreeNotice" type="primary" size="mini">{{$t('OrderFee.agreeAndNotify')}}</el-button>
						<el-button @click="agreeNoNotice" type="primary" size="mini">{{$t('OrderFee.agreeNotNotify')}}</el-button>
						<el-button @click="disagree" type="primary" size="mini">{{$t('OrderFee.disagree')}}</el-button>
					</div>
				</el-dialog>
			</div>
		</el-alert>
		<ul class="top-nav-tabs">
			<li :class="{ 'is-active': item.key === activityKey }" v-for="(item, index) in menus" :key="'top-nav-' + index" @click="tabsClick(item.key, item.path)">
				{{ item.value }}
			</li>
			<!-- <li :class="{ 'is-active': orderDetailKey === activityKey }" @click="tabsClick(orderDetailKey)">
				订单详情
			</li> -->
			<!-- 散货订单，拼箱业务的不显示集装箱 -->
			<li :class="{ 'is-active': 'ContainerList' === activityKey }" @click="tabsClick('ContainerList')" v-if="showContainer">
				{{$t('Finance.container')}}
			</li>
			<!-- 委托订舱的订单增加提单tab,协同订单详情不显示提单 -->
			<li :class="{ 'is-active': 'BlList' === activityKey }" @click="tabsClick('BlList')" v-if="showBl">
				{{$t('Finance.billLading')}}
			</li>
			<li :class="{ 'is-active': 'TrackList' === activityKey }" @click="tabsClick('TrackList')" v-if="showTrack">
				{{$t('Finance.voyage')}}
			</li>
			<li :class="{ 'is-active': 'OrderFee' === activityKey }" @click="tabsClick('OrderFee')" v-if="!isMainCscBkg">{{$t('Finance.fee')}}</li>
			<li :class="{ 'is-active': 'FileList' === activityKey }" @click="tabsClick('FileList')">{{$t('Finance.attachment')}}</li>
			<!-- 20210913隐藏掉托书tab，附件tab内上传托书 -->
			<!-- <li :class="{ 'is-active': 'FileBook' === activityKey }" @click="tabsClick('FileBook')">托书</li> -->
			<!-- 散货拼箱创建整柜的订单显示关联订单tab 整箱才显示-->
			<!-- 这几个海外版不显示 <li v-if="showRelate || asyncRelate || cdOrderShowRelate || hasRelateList || relateOrderList.length > 0" :class="{ 'is-active': 'ChildOrderList' === activityKey }" @click="tabsClick('childOrderList')">
				{{$t('Finance.relOrders')}}
			</li>
			<li v-if="['op', 'bd', 'doc'].includes(orderList.ordDetRole) && (dropStatus != null || isDrop === 'Y')" :class="{ 'is-active': 'DropCabinet' === activityKey }" @click="tabsClick('dropCabinet')">
				{{$t('Finance.dumpster')}}
			</li>
			<li :class="{ 'is-active': 'Score' === activityKey }" @click="tabsClick('score')">
				{{$t('Finance.rate')}}
			</li> -->
		</ul>
		<!-- <ul v-if="orderInfo.serviceType === 'st02' || orderInfo.serviceType === 'st04'" class="top-nav-tabs top-nav-tabs-left">
			<li v-for="(item, index) in serviceMenus" :key="index" @click="handleClickMenu(item)" :class="{ 'is-active': item.component === activityKey }">
				<span class="name">{{ item.cname }}</span>
				<i class="icon-warning" v-if="item.isCancelApply || item.isEdit"></i>
				<i class="icon-joint" v-if="item.isJoint">协</i>
				<i class="el-icon-success" v-if="item.isFinish" style="color: rgb(134,204,115)"></i>
			</li>
		</ul> -->
	</div>
</template>
<script>
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Vue from 'vue'
import { lclChildList, bdDropCheck, soCompareList, dropInfo, getValueByKey, orderRelationList } from '@/api/order/list'
import { mapMutations, mapState } from 'vuex'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import CancelJointAlert from './cancelJointAlert'
// const menus = [
// 	{
// 		key: 'OrderDetail',
// 		value: '订单详情'
// 	}
// ]
export default {
	mixins: [routerMixin, orderMixin],
	data() {
		return {
			serviceMenus: [],
			// isSameCode: false,
			isDrop: null,
			dropStatus: null,
			showSoDetail: false,
			soDropList: [],
			menus: [],
			childOrderList: [], // 关联子订单
			cTimestamp: 0,
			asyncRelate: false,
			relateOrderList: []
		}
	},
	props: {
		serviceType: {
			type: String,
			default: ''
		},
		activityKey: {
			type: String,
			default: ''
		},
		custid: {
			type: Number,
			default: 0
		}
		// orderInfo: {
		// 	type: Object,
		// 	default: () => ({})
		// }
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.getOrderInfo()
		this.getDropInfo()
		this.initMenus()
	},
	activated() {
		let timestamp = new Date().getTime()
		if (timestamp - this.cTimestamp > 300) {
			// getOrderInfo 不同的订单服务项不同
			this.getOrderInfo()
			this.getDropInfo()
			this.initMenus()
		}
	},
	mounted() {
		setTimeout(() => {
			// console.log('serviceList', this.serviceList)
			// console.log('🚀 ~ this.showRelate', this.showRelate)
		}, 3000)
	},

	computed: {
		...mapState('order', ['dropOpStatus', 'dropBdCheckStatus', 'isSoUpdate', 'orderList', 'serviceList', 'custInfoObj']),
		...mapState('user', ['deptCode']),
		...mapState({
			roles: state => state.user.roles,
			dictMap: state => state.dict.dictMap
		}),
		cdOrderShowRelate(){
			return ['st26', 'st27', 'st28'].includes(this.serviceType)
		},
		showRelate() {
			// console.log("🚀 ~ this.serviceList.includes('proxy_book')", this.serviceList)
			// console.log('🚀 ~  this.$route.query.showRelate', this.$route.query.showRelate)
			// 20220609去掉代订舱不显示关联订单tab的逻辑
			if (this.$route.query.showRelate === undefined) {
				this.$store.dispatch('order/getValueByKeys', { custid: this.custid }).then(data => {
					this.asyncRelate = data && ['st01', 'st15', 'st09', 'st23'].includes(this.serviceType)
					return data && ['st01', 'st15', 'st09'].includes(this.serviceType)
				})
			} else {
				return JSON.parse(this.$route.query.showRelate)
			}
		},
		hasRelateList() {
			// 是否有关联订单
			if (this.$route.query.showRelate === undefined) {
				orderRelationList({ orderNo: this.$route.query.orderNo }).then(res => {
					this.relateOrderList = res.data || []
					return res.data && res.data.length ? true : false
				})
			} else {
				return JSON.parse(this.$route.query.showRelate)
			}
		},
		showContainer() {
			if (this.$route.query.showContainer === undefined) {
				// st03,st04海运出口拼箱，st11,st12海运进口拼箱，st24,st25散杂滚装不显示集装想
				return !['st03', 'st04', 'st11', 'st12', 'st18', 'st19', 'st24', 'st25'].includes(this.serviceType)
			} else {
				return JSON.parse(this.$route.query.showContainer)
			}
		},
		showBl() {
			if (this.$route.query.showBl === undefined) {
				// st15,st16,st17,st18,st19已废弃
				// st01,st02海运出口整箱、st03,st04海运出口拼箱、st09,st10海运进口整箱、st11,st12海运进口拼箱、st24,st25散杂滚装、st26出口报关、st27进口报关、st28进出口报关
				return ['st01', 'st02', 'st03', 'st04', 'st09', 'st10', 'st11', 'st12', 'st18', 'st15','st24', 'st25', 'st26', 'st27', 'st28'].includes(this.serviceType) && !['jointList', 'whJointList'].includes(this.$route.query.source)
			} else {
				return JSON.parse(this.$route.query.showBl)
			}
		},
		isOp() {
			// console.log('🚀 ~ this.orderList.ordDetRole', this.orderList.ordDetRole)
			return this.orderList.ordDetRole === 'op'
		},
		isBd() {
			return this.orderList.ordDetRole === 'bd'
		},
		showDrop() {
			if (this.isOp) {
				return this.dropOpStatus != 'FINISH' && this.dropStatus != null
			}
			if (this.isBd) {
				// console.log('🚀 ~ this.dropBdCheckStatus', this.dropBdCheckStatus)
				return this.dropBdCheckStatus === null && this.dropStatus != null
			}
		},
		showAll() {
			return this.dropStatus === 'ALL'
		},
		showPart() {
			return this.dropStatus === 'PART'
		},
		showTrack() {
			return this.$store.state.order.orderInfoDataObj.ship && this.$store.state.order.orderInfoDataObj.ship.isTrack === 'y'
		},
		// 主单的单证或bkg不显示费用tab
		isMainCscBkg() {
			return this.$route.query.source === 'orderList' && (this.orderList.ordDetRole === 'csc' || this.orderList.ordDetRole === 'bkg')
		}
	},
	components: {
		CancelJointAlert
	},
	watch: {
		serviceType: {
			handler(newVal, oldVal) {
				if (newVal) {
				}
			},
			deep: true
		},
		showSoDetail: {
			handler(newVal, oldVal) {
				if (newVal) {
					soCompareList({ orderNo: this.$route.query.orderNo }).then(res => {
						// console.log('🚀 ~ 	 res.data ', res.data)
						//筛选isDrop为'Y'的数据
						let dropData = res.data.filter(item => item.newSo.isDrop === 'Y')

						this.soDropList = dropData.map(item => {
							return { ...item.newSo, vesselOld: item.oldSo.vessel, voyageOld: item.oldSo.voyage, cutOffDateOld: item.oldSo.cutOffDate }
						})
					})
				}
			}
		}
		// orderInfo: {
		// 	handler(newVal, oldVal) {
		// 		this.getServiceMenu(newVal)
		// 	},
		// 	deep: true
		// }
	},
	methods: {
		...mapMutations('order', ['setDropBdCheckStatus', 'setDropOpStatus', 'setIsSoUpdate']),
		// getServiceMenu(data) {
		// 	if (!data || !Object.keys(data).length) return (this.serviceMenus = [])
		// 	let allServices = JSON.parse(JSON.stringify(this.$store.state.order.allServicesMenu))
		// 	console.log('🚀 ~ allServices', allServices)
		// 	let { serviceList, serviceInfoList } = data
		// 	console.log('🚀 ~ serviceList', serviceList)
		// 	let { businessType } = this.orderInfo
		// 	// 过滤只显示该订单详情含有的服务项
		// 	this.serviceMenus = allServices
		// 		.filter(item => {
		// 			return (item.code && serviceList.includes(item.code)) || (item.child && item.child.some(ele => serviceList.includes(ele.code)))
		// 		})
		// 		.filter(ele => {
		// 			// 散货拼箱的要过滤掉目的港仓储
		// 			if (this.orderInfo.businessType === 'ship_export_fcl') return ele.component !== 'PodLtl'
		// 			// 整箱的要过滤掉目的港散车
		// 			if (this.orderInfo.businessType === 'ship_export_lcl') return ele.component !== 'PodWarehouseIng'
		// 		})
		// 	this.serviceMenus.forEach(item => {
		// 		if (item.child && item.child.length) {
		// 			item.child = item.child.filter(ele => {
		// 				return serviceList.includes(ele.code)
		// 			})
		// 			// 申请撤回的服务项
		// 			item.isCancelApply = item.child.some(ele => {
		// 				let tempItem = serviceInfoList.filter(o => o.serviceCode === ele.code)
		// 				return tempItem && tempItem.length && tempItem[0].cancelApplyStatus === 'applied'
		// 			})
		// 			// 所有的子服务项进度为已完成的，父级显示完成图标
		// 			item.isFinish = item.child.every(ele => {
		// 				let tempItem = serviceInfoList.find(o => o.serviceCode === ele.code)
		// 				return tempItem && tempItem.serviceStatus === 'finish'
		// 			})
		// 			// 所有的子服务项进度为进行中的父级服务项显示进行中图标
		// 			item.isEdit = item.child.every(ele => {
		// 				let tempItem = serviceInfoList.find(o => o.serviceCode === ele.code)
		// 				return tempItem && tempItem.isEdit === 'y'
		// 			})
		// 			// 任一子服务项被协同的父级服务项显示协同图标
		// 			item.isJoint = item.child.some(ele => {
		// 				let tempItem = serviceInfoList.find(o => o.serviceCode === ele.code)
		// 				return tempItem && tempItem.isJoint === 'y'
		// 			})
		// 		} else {
		// 			let serviceInfoItem = serviceInfoList.filter(ele => ele.serviceCode === item.code)
		// 			item.isCancelApply = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].cancelApplyStatus === 'applied'
		// 			item.isFinish = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].serviceStatus === 'finish'
		// 			item.isEdit = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].isEdit === 'y'
		// 			item.isJoint = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].isJoint === 'y'
		// 		}
		// 	})
		// 	console.log('this.serviceMenus', this.serviceMenus)
		// 	if (this.$route.name === 'BehalfRecordManifest' || this.$route.name === 'FileList') {
		// 		// 舱单服务项返回当前服务项是否协同
		// 		let oceanManifestIsJoint = ''
		// 		let serviceMenus = this.serviceMenus.filter(item => {
		// 			return item.code == 'ocean_manifest'
		// 		})
		// 		if (serviceMenus.length) {
		// 			oceanManifestIsJoint = serviceMenus[0].isJoint
		// 		}
		// 		this.$emit('getOceanManifestIsJoint', oceanManifestIsJoint)
		// 	}
		// },
		// handleClickMenu(item) {
		// 	console.log('🚀 ~ item', item)
		// 	console.log('🚀 ~ activityKey', this.activityKey)
		// 	localStorage.insuranceJoint = item.isJoint
		// 	// this.activityKey = item.component
		// 	// this.addComponentToPath()
		// 	// // 当点击'仓储'时，仓储中table跳转到 '仓储'
		// 	// if(item.component == 'Warehouse') {
		// 	//   let key = getServicChilds(item.component)[0].key
		// 	//   this.$store.dispatch("order/changeWarehouseComp", key)
		// 	// }
		// 	// // 当点击'目的港仓储'时，仓储中table跳转到 '目的港仓储'
		// 	// if(item.component == 'PodWarehouseIng') {
		// 	//   let key = getServicChilds(item.component)[0].key
		// 	//   this.$store.dispatch("order/changePodWarehouseComp", key)
		// 	// }
		// 	// // 修改全局serviceType的值
		// 	// let code = item.code
		// 	// // 当有子菜单时，获取第一个子菜单的code
		// 	// if(!code) code = getServicChilds(item.component)[0].code
		// 	// this.$store.dispatch("order/changeServiceType", code)
		// 	// this.handleGetServiceStatus(code)

		// 	// this.$router.push({
		// 	//   path: item.component,
		// 	//   query: this.$route.query
		// 	// })
		// 	if (item.component === this.$route.name) return
		// 	this.$store.dispatch('tagsView/delView', this.$route)
		// 	this.$emit('routerPush', {
		// 		name: item.component,
		// 		query: this.$route.query
		// 	})
		// 	// this.routerPush(item.component, this.$route.query)
		// },
		// //查询散货部门CODE
		// getDeptCode() {
		// 	getValueByKey('lcl_company_code').then(res => {
		// 		// 登录用户的deptCode以散货部门code为开头的判断为散货部门
		// 		if (res.data.startsWith(this.deptCode)) {
		// 			this.isSameCode = true
		// 		} else {
		// 			this.isSameCode = false
		// 		}
		// 	})
		// },
		getDropInfo() {
			dropInfo({ orderNo: this.$route.query.orderNo }).then(res => {
				this.dropStatus = res.data && res.data.dropStatus
				this.isDrop = res.data && res.data.isDrop
				// console.log('🚀 ~ this.dropStatus', this.dropStatus)
				// console.log('🚀 ~ this.isDrop', this.isDrop)
				// console.log('🚀 ~ this.orderList.ordDetRole', this.orderList.ordDetRole)
				res.data && this.setDropOpStatus(res.data.dropOpStatus)
				res.data && this.setDropBdCheckStatus(res.data.dropBdCheckStatus)
				res.data && this.setIsSoUpdate(res.data.isSoUpdate)
			})
		},
		//预览so附件
		handleViewSo(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.soFileNo, fileName: row.soFileName })
		},
		//预览甩柜证明
		handleViewDrop(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},
		//关闭弹框
		handleClose() {
			//关闭对话框后清空数据 再打开时重新渲染
			this.soDropList = []
			this.showSoDetail = false
		},
		//查看详情
		viewDropDetail() {
			// console.log('🚀 ~ viewDropDetail')
			this.showSoDetail = true
		},
		//同意甩柜并且通知客户
		agreeNotice() {
			let data = { orderNo: this.$route.query.orderNo, bdCheckStatus: 'AGREE_NOTIFY' }
			bdDropCheck(data).then(res => {
				this.$message.success(this.$t('OrderFee.successOp')) // '指令发送成功!'
				this.setDropBdCheckStatus('AGREE_NOTIFY')
				this.showSoDetail = false
			})
		},
		//同意甩柜但是不通知客户
		agreeNoNotice() {
			let data = { orderNo: this.$route.query.orderNo, bdCheckStatus: 'AGREE' }
			bdDropCheck(data).then(res => {
				this.$message.success(this.$t('OrderFee.successOp')) // '指令发送成功!'
				this.setDropBdCheckStatus('AGREE')
				this.showSoDetail = false
			})
		},
		//不同意甩柜
		disagree() {
			let data = { orderNo: this.$route.query.orderNo, bdCheckStatus: 'DISAGREE' }
			bdDropCheck(data).then(res => {
				this.$message.success(this.$t('OrderFee.successOp')) // '指令发送成功!'
				this.setDropBdCheckStatus('DISAGREE')
				this.showSoDetail = false
			})
		},
		initMenus() {
			this.menus = [
        {
          key: 'OrderDetail',
          value: this.$t('Finance.orderDetails')
        }
      ]
			let { source } = this.$route.query
			if (source === 'lclOrderList') {
				this.menus[0].key = 'LclOrderDetail'
			} else if (!source || source === 'orderList' || source === 'planOrderList' || source === 'whOrderList') {
				this.menus[0].key = 'OrderDetail'
			} else if (source === 'jointList' || source === 'whJointList') {
				this.menus[0].key = 'JointOrderDetail'
			}
			// this.getDeptCode()
			// console.log('this.menus', this.menus)
		},
		lclChildList() {
			let { query, params } = this.$route
			let orderNo = query.orderNo
			lclChildList({ orderNo: orderNo }).then(res => {
				this.childOrderList = res.data
			})
		},
		// 点击切换顶部tabs
		tabsClick(activityKey) {
      let { query, params } = this.$route
			// let { orderNo } = query
			if (activityKey === this.$route.name) return
			// let createOrderStr = sessionStorage.getItem('createOrderStr')
			// 创建订单时点击其他托书信息，集装箱等tab时提示先保存
			// if (this.$route.query.action === 'add' && createOrderStr && activityKey !== 'OrderDetail') {
			// 	return this.$message({
			// 		type: 'warning',
			// 		message: '请先保存或提交订单',
			// 		duration: 1000,
			// 		onClose: () => {}
			// 	})
			// }
			// console.log('visitedView', this.$store.state.tagsView.visitedViews)

			// this.$store.dispatch('tagsView/delView', this.$route)

			this.$emit('routerPush', { name: activityKey, query })
		}
	}
}
</script>
<style lang="scss">
.drop-alert {
	height: 24px;
	.drop-file-certificate {
		color: #3e80f5;
		cursor: pointer;
	}
	.el-dialog {
		width: 70%;
	}
	.el-dialog__body {
		padding: 10px;
	}
	.el-table .cell.el-tooltip {
		padding-right: 0;
		overflow: hidden;
	}
	.drop-arrow {
		font-weight: 700;
		font-size: 16px;
		color: #edb534;
	}
	.el-alert__closebtn {
		top: 7px;
	}
	.el-button {
		font-size: 12px;
	}
	.dlg-buttons {
		margin-top: 10px;
		text-align: center;
	}
	.drop-word {
		background-color: #edb534;
		color: #fff;
		width: 14px;
		height: 14px;
		border-radius: 2px;
		padding: 0 2px 2px;

		font-size: 12px;
	}
	.drop-txt {
		margin-right: 30px;
		font-size: 12px;
	}
	.drop-agree {
		color: #33b18a;
		margin-right: 10px;
	}
	.drop-disagree {
		color: #cd4130;
	}
}
.top-nav-tabs {
	margin: 0;
	background-color: #fff;
	height: 44px;
	padding: 10px 0;
	overflow: hidden;
	// &:before {
	// 	content: '';
	// 	position: absolute;
	// 	left: 0;
	// 	bottom: 0;
	// 	width: 100%;
	// 	background-color: #e9e9e9;
	// 	height: 1px;
	// }
	li {
		float: left;
    height: 24px;
    text-align: center;
    padding: 0 30px;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
		// &:before {
		// 	content: '';
		// 	position: absolute;
		// 	display: block;
		// 	height: 16px;
		// 	width: 1px;
		// 	right: -1px;
		// 	top: 5px;
		// 	background-color: #3e80f5;
		// }
		&.is-active {
			// color: #0055ac; // 暂注释
			&:before {
				content: "";
				position: absolute;
				display: block;
				height: 2px;
				background: #0055ac; // #0062C4;
				left: calc(50% - 14px);
				width: 28px;
				bottom: -2px;
			}
		}
	}
}
.top-nav-tabs, .top-nav-tabs li {
	position: relative;
	line-height: 24px;
}
.top-nav-tabs-left {
	li {
		&:before {
			content: '';
			position: absolute;
			display: block;
			height: 16px;
			width: 1px;
			left: 0;
			top: 5px;
			background-color: #3e80f5;
		}
	}
}
</style>
