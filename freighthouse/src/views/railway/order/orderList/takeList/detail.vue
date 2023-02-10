<template>
	<div class="take-container">
		<el-alert type="warning" class="violet" v-if="showCancel">
			<template slot="title">
				<i class="tag-recall">取</i>
				<span class="txt">
					该订单已取消/终止，请注意!
				</span>
			</template>
		</el-alert>
		<el-alert type="warning" class="violet" v-else-if="showDelete">
			<template slot="title">
				<i class="tag-recall">删</i>
				<span class="txt">
					该提单已删除，请注意!
				</span>
			</template>
		</el-alert>
		<el-alert type="warning" class="violet" v-else-if="showBack">
			<template slot="title">
				<i class="tag-recall">撤</i>
				<span class="txt">
					该提单已撤回，请注意!
				</span>
			</template>
		</el-alert>
		<div class="tab">
			<el-tabs v-model="activityKey" @tab-click="tabClick">
				<el-tab-pane v-for="(item, index) in tabsList" :label="item.value" :name="item.key" :key="index"> </el-tab-pane>
			</el-tabs>
			<div class="el-button-group">
				<!-- <div class="take-status">
					<span>订单状态：</span>
					<span class="mr10">{{ detailData.orderStatus | orderStatusFilter }}</span>
					<span>取单状态：</span>
					<i :class="detailData.takeStatus == 'finish' ? ['take-finish', 'el-icon-success'] : ['take-nofinish', 'el-icon-info']"></i>
					<span :class="detailData.takeStatus == 'finish' ? 'take-finish' : 'take-nofinish'">{{ detailData.takeStatus | takeStatusFilter }}</span>
				</div> -->
				<el-button :disabled="disableBack" size="mini" type="default" @click="handleBack">返回</el-button>
				<template v-if="detailData.state === 'valid'">
					<el-button :disabled="disabledPut" size="mini" type="default" @click="handleFinish" v-if="showFinishBtn">取单完成</el-button>
					<el-button size="mini" type="primary" @click="handleSave">保存</el-button>
				</template>
			</div>
		</div>
		<component @getDetail="getDetail" @changeFileNos="changeFileNos" :is="activityKey" :createItem="createItem" :orderWorkOptions="detailData.workAssign" :fileListData="fileListData" :detailData="detailData"> </component>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { blTakeInfo, blTakeSave, blTakeFinish, blFileList } from '@/api/railway/bl'
import Info from './components/takeInfo'
import Log from '@/views/order/order/orderList/si/components/log'
// import BlInfo from '../components/blInfo'
import BlInfo from '../putList/blInfo/bl.vue'
import BlInfoRail from '../putList/blInfoRail/bl.vue'
const defaultCreateQuery = {
	oid: 0,
	orderNo: '',
	remark: ''
}
export default {
	mixins: [routerMixin],
	filters: {
		takeStatusFilter(takeStatus) {
			return takeStatus === 'finish' ? '已取单' : '未取单'
		},
		orderStatusFilter(orderStatus) {
			return getDictLabel('orderStatus', orderStatus)
		}
	},
	data() {
		return {
			oid: this.$route.query.oid,
			orderNo: this.$route.query.orderNo,
			disableBack: false,
			hasFileNos: false,
			activityKey: 'Info',
			tabsList: [
				{
					key: 'Info',
					value: '取单详情'
				},
				{
					key: 'Log',
					value: '日志'
				},
				{
					key: 'BlInfo',
					value: '提单'
				}
			],
			createItem: Object.assign({}, defaultCreateQuery),
			detailData: {},
			fileListData: [],
			orderWorkOptions: [], // 参与人
			cTimestamp: 0
		}
	},
	beforeRouteEnter(to, from, next) {
		let { source } = to.query
		to.meta.activeMenu = source
		console.log(to)
		next()
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.init()
	},
	activated() {
		this.init()
		// let timestamp = new Date().getTime()
		// if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
		// 	console.log("🚀 ~ init", init)
		// 	this.init()
		// }
	},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			dictMap: state => state.dict.dictMap
		}),
		disabledPut() {
			return this.detailData.blMode === 'original' && this.detailData.validFiles.filter(item => item.fileType === 'hbl_original').length === 0
		},
		showCancel() {
			return this.detailData.orderStatus === 'cancel' || this.detailData.orderStatus === 'break'
		},
		showDelete() {
			return this.detailData.state === 'invalid'
		},
		showBack() {
			return this.detailData.isCancel === 'y'
		},
		showFinishBtn() {
			return this.detailData.takeStatus !== 'finish' && !['cancel', 'break'].includes(this.detailData.orderStatus) && this.detailData.isCancel !== 'y'
		}
	},
	watch: {
		'$route.query.routerName': {
			handler(newVal) {
				if (newVal === 'TradeTakeList') {
					this.tabsList = [{ key: 'Info', value: '取单详情' }]
				} else {
					let blTab = 'BlInfo'
					if (['rail_export_fcl', 'rail_export_lcl'].includes(this.detailData.businessType)) {
						blTab = 'BlInfoRail'
					}
					this.tabsList = [
						{
							key: 'Info',
							value: '取单详情'
						},
						{
							key: 'Log',
							value: '日志'
						},
						{
							key: blTab,
							value: '提单'
						}
					]
				}
			},
			deep: true,
			immediate: true
		}
	},
	components: {
		Info,
		Log,
		BlInfo,
		BlInfoRail
	},
	methods: {
		changeFileNos(val) {
			this.hasFileNos = val.every(item => !!item.fileNo)
		},
		// 初始化
		init() {
			this.activityKey = 'Info'
			this.createItem = Object.assign({}, defaultCreateQuery)
			this.getDetail()
		},
		// 获取详情
		getDetail() {
			blTakeInfo({
				oid: this.oid,
				orderNo: this.orderNo
			}).then(res => {
				this.disableBack = false
				for (var i in defaultCreateQuery) {
					this.createItem[i] = res.data[i]
				}
				let cancelEmployeeName = ''
				this.detailData = { ...res.data }
				this.detailData.orderNo && this.$store.dispatch('order/setCustInfo', { 
					orderNo: this.detailData.orderNo, 
					custName: this.detailData.custName, 
					compDeptName: this.detailData.compDeptName, 
					isJoint: !!this.detailData.jointNo, 
					latest: true,
					businessType: this.detailData.businessType
				}) // 根据客商ID获取客商信息
				this.detailData.workAssign.forEach(item => {
					item.show = true
					item.disabled = true
					// 获取撤回人
					if (item.jobCode === 'doc') {
						cancelEmployeeName = item.employeeName
					}
				})
				Object.assign(this.detailData, { cancelEmployeeName })
				// this.getFileList()
				// console.log(this.detailData)
			})
		},
		// 附件列表
		getFileList() {
			let data = {
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				blId: this.$route.query.blId,
				// includeFileModules: ['take', 'bl', 'si'], // 取单模块
				// excludeFileTypes: [] // 排除附件类别
				module: this.detailData.takeType === 'mbl' ? 'take_bl' : 'take_' + this.detailData.takeType
			}
			blFileList(data).then(res => {
				this.hasFileNos = res.data.every(item => !!item.fileNo)
				this.fileListData = res.data

				// 如果是提单取单，清除掉附件列表的贸易单证附件
				// 20210322放开贸易单证类型附件显示
				// if (this.detailData.takeType === 'bl') {
				//   this.fileListData = this.fileListData.filter(item => !item.docId)
				// }
				this.fileListData.map(item => {
					// obd提单，已撤回提单的不可修改删除
					if (item.fileType === 'obd' || this.detailData.isCancel === 'y') {
						item.noUpload = true
						item.noDel = true
					}
					return Object.assign({}, item)
				})
			})
		},
		// 点击tab切换
		tabClick(key) {
			console.log(key)
		},
		// 保存
		handleSave(type, value) {
			this.disableBack = true
			console.log(type, value)
			let data = Object.assign({}, this.createItem)
			console.log(data)

			blTakeSave(data).then(res => {
				this.$message({
					message: '保存成功',
					type: 'success',
					duration: 1000,
					onClose: () => {
						this.dnCheckShow = false
						this.takeApplyShow = false
						this.getDetail()
						//跳转到对应的路由
						// this.$router.push({
						//   name: this.$route.query.routerName,
						// })
					}
				})
			})
		},
		// 取单完成
		handleFinish() {
			this.$confirm('请确认是否取单完成?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return this.blTakeFinish()
				})
				.catch(() => {})
		},
		blTakeFinish() {
			let data = {
				oid: this.$route.query.oid,
				orderNo:this.$route.query.orderNo,
				remark: this.createItem.remark
			}

			blTakeFinish(data).then(res => {
				this.$message({
					message: '提交成功',
					type: 'success',
					duration: 1000,
					onClose: () => {
						this.getDetail()
						//跳转到对应的路由
						// this.$router.push({
						//   name: this.$route.query.routerName,
						// })
					}
				})
			})
		},
		// 返回
		handleBack() {
			//跳转到对应的路由
			this.$router.push({
				name: this.$route.query.routerName
			})
		}
	}
}
</script>
<style>
.take-container {
	background-color: #fff;
	margin: 10px 0 10px 16px;
}
.take-container .tab {
	padding: 0 10px;
	height: 40px;
	line-height: 40px;
	display: flex;
	justify-content: space-between;
	border-bottom: 1px solid #e0e0e0;
}
.take-container .tab .el-tabs__nav-wrap::after {
	height: 0px;
}
.take-container .si-status {
	padding: 0 10px;
	height: 40px;
	line-height: 40px;
}
.take-container .tab .el-button-group {
	margin-top: 5px;
}
.take-status {
	float: left;
	margin-right: 20px;
	line-height: 30px;
	font-size: 14px;
}
.take-finish {
	color: #33b18a;
	margin-left: 2px;
}
.take-nofinish {
	color: #edb534;
	margin-left: 2px;
}
.take-container .si-status .el-checkbox .el-checkbox__label {
	font-size: 12px;
}
.take-container .si-status .span-label {
	margin-right: 20px;
}
</style>
