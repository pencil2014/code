<template>
	<div class="take-container take-detail-mini">
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
			<div style="display: flex;">
				<div class="ml10">
					<el-button size="mini" type="default" @click="handleBack">返回</el-button>
					<el-button size="mini" type="primary" v-if="!isTransfer && detailData.takeStatus === 'finish' && detailData.putStatus !== 'finish'" @click="showTransferPop = true">提单转移</el-button>
					<template v-if="detailData.state === 'valid'">
						<el-button size="mini" type="primary" @click="handleSave" v-if="detailData.putStatus !== 'finish'">保存</el-button>
					</template>
				</div>
			</div>
		</div>
		<component
			@getDetail="getDetail"
			:isTransfer="isTransfer"
			:ref="activityKey"
			:transferArr="transferArr"
			@transferChange="transferChange"
			:is="activityKey"
			:createItem="createItem"
			:orderWorkOptions="detailData.workAssign"
			:detailData="detailData"
			:fileListData="fileListData"
		>
		</component>
		<div v-if="emailPopShow">
			<MailSend @close="emailPopClose" />
		</div>
		<!-- 客户同意放货弹窗 -->
		<div v-if="blDeliveryApproveShow">
			<BlDeliveryApprove @close="blDeliveryApprovePopClose" :blId="blId" :blMode="blMode" />
		</div>
		<div v-if="showTransferPop">
			<TransferPop @close="transferPopClose"></TransferPop>
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { blPutInfo, blPutSave, blPutFinish, blPutMail, blFileList, putCancel } from '@/api/railway/bl'
import Info from './components/putInfo'
import InfoTrade from './components/putInfoTrade'
import File from './components/file'
import Fee from './components/fee'
import Log from '@/views/order/order/orderList/si/components/log'
import MailSend from './components/mailSend'
import BlInfo from './blInfo/bl.vue'
import BlInfoRail from './blInfoRail/bl.vue'
import BlDeliveryApprove from './components/blDeliveryApprove.vue'

import TransferPop from '../takeList/components/transferPop'
import { transferCreate, transferList } from '@/api/order/bl'

const defaultCreateQuery = {
	oid: 0,
	orderNo: '',
	remark: '',
	putStatus: 'init',
	telexApplyStatus: '',
	telexApplyEmployeeId: '',
	telexDownStatus: '',
	telexDownEmployeeId: ''
}
export default {
	mixins: [routerMixin],
	filters: {
		putStatusFilter(putStatus) {
			return putStatus === 'finish' ? '已放单' : '未放单'
		}
	},
	props: {
		takeType: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			eQuery:this.$route.query,
			transferArr: [],
			showTransferPop: false, // 提单转移
			blDeliveryApproveShow: false,
			activityKey: 'Info',
			createItem: Object.assign({}, defaultCreateQuery),
			detailData: {},
			fileListData: [],
			orderWorkOptions: [], // 参与人
			emailPopShow: false, // 电放邮件弹窗
			// 为邮寄的出单方式:正本,借同行代理,HBL正本,同行借我司代理HBL正本
			isPost: ['original', 'jthdlzb', 'thzb'],
			cTimestamp: 0
		}
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.init()
	},
	activated() {
		let timestamp = new Date().getTime()
		if (timestamp - this.cTimestamp > 200) {
			this.init()
		}
	},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			userId: state => state.user.userId,
			userName: state => state.user.name,
			dictMap: state => state.dict.dictMap
		}),
		showCancel() {
			return this.detailData.orderStatus === 'cancel' || this.detailData.orderStatus === 'break'
		},
		showDelete() {
			return this.detailData.state === 'invalid'
		},
		showBack() {
			return this.detailData.isCancel === 'y'
		},
		tabsList() {
			let blTab = 'BlInfo'
			if (['rail_export_fcl', 'rail_export_lcl'].includes(this.detailData.businessType)) {
				blTab = 'BlInfoRail'
			}
			if (!this.$route.query.blType) {
				return [
					{
						key: 'InfoTrade',
						value: '放单详情'
					},
					// {
					// 	key: 'Fee',
					// 	value: '费用'
					// },
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
			return [
				{
					key: 'Info',
					value: '放单详情'
				},
				// {
				// 	key: 'Fee',
				// 	value: '费用'
				// },
				{
					key: 'Log',
					value: '日志'
				},
				{
					key: blTab,
					value: '提单'
				}
			]
		},
		isTransfer() {
			// 是否正在被提单转移
			if (this.transferArr.length === 0) {
				return false
			} else {
				let item = this.transferArr.find(el => el.transferStatus === 'PROCESSING')
				if (item) {
					return true
				} else {
					return false
				}
			}
		}
	},
	watch: {},
	components: {
		Info,
		InfoTrade,
		File,
		Fee,
		Log,
		MailSend,
		BlInfo,
		BlInfoRail,
		BlDeliveryApprove,
		TransferPop
	},
	methods: {
		transferChange() {
			this.getTransferList()
		},
		getTransferList() {
			let params = {
				blId: this.detailData.blId,
				orderNo: this.$route.query.orderNo
			}
			transferList(params).then(res => {
				this.transferArr = res.data || []
			})
		},
		transferPopClose(action, value) {
			if (action === 'Confirm') {
				let orderBls = [
					{
						blId: this.detailData.blId,
						orderNo: this.$route.query.orderNo
					}
				]
				let params = Object.assign(value, {
					orderBls: orderBls
				})

				transferCreate(params).then(res => {
					this.$message.success('提单转移成功')
					this.getTransferList()
					this.showTransferPop = false
				})
			} else {
				this.showTransferPop = false
			}
		},
		// 客户同意放货弹窗关闭回调
		blDeliveryApprovePopClose(action, value) {
			this.blDeliveryApproveShow = false
			if (action === 'Confirm') {
				this.getDetail()
			}
		},
		// 打开客户同意放货弹窗
		handleBlDeliveryApprove() {
			this.blDeliveryApproveShow = true
			this.blId = Number(this.$route.query.blId)
			this.blMode = this.detailData.blMode
		},

		// 初始化
		init() {
			this.activityKey = this.$route.query.blType ? 'Info' : 'InfoTrade'
			this.createItem = Object.assign({}, defaultCreateQuery)
			// 20220720 该附件接口的数据暂未用到，先注释掉
			// this.getFileList()
			this.getDetail()
		},

		// 附件列表
		getFileList() {
			let data = {
				orderNo: this.$route.query.orderNo,
				blId: this.$route.query.blId,
				// includeFileModules: ['put', 'take', 'bl'], // 放单模块
				// excludeFileTypes: [] // 排除附件类别
				module: 'PUT'
			}
			blFileList(data).then(res => {
				this.fileListData = res.data
				this.fileListData.map(item => {
					// M单正本提单, 贸易单证的不在放单附件里上传, 已撤销的不可上传删除
					let sItem = this.dictMap.tradeDocName.find(ele => item.fileType === ele.value)
					if (item.fileType === 'obd' || item.fileType === 'release_guarantee' || sItem || this.detailData.isCancel === 'y') {
						item.noUpload = true
						item.noDel = true
					}
					return Object.assign({}, item)
				})
			})
		},
		// 获取详情
		async getDetail(type) {
			let res = await blPutInfo({
				oid: this.eQuery.oid,
				orderNo: this.eQuery.orderNo
			})
			for (var i in defaultCreateQuery) {
				// 上传附件后获取详情但不更新备注字段的值
				if (!(type === 'update' && i === 'remark')) {
					this.createItem[i] = res.data[i]
				}
				console.log('🚀 ~ this.createItem', this.createItem)
				if (i === 'telexApplyEmployeeId' || i == 'telexDownEmployeeId') {
					// this.createItem[i] = res.data[i] || this.userId
					// this.createItem.telexApplyEmployeeName = res.data.telexApplyEmployeeName || this.userName
					// this.createItem.telexDownEmployeeName = res.data.telexDownEmployeeName || this.userName
					// if (this.createItem.telexApplyEmployeeId == 0 || !this.createItem.telexApplyEmployeeId) {
					// 	this.createItem.telexApplyEmployeeId = this.userId
					// }
					// if (this.createItem.telexDownEmployeeId == 0 || !this.createItem.telexDownEmployeeId) {
					// 	this.createItem.telexDownEmployeeId = this.userId
					// }
					this.createItem[i] = res.data[i]
					this.createItem.telexApplyEmployeeName = res.data.telexApplyEmployeeName
					this.createItem.telexDownEmployeeName = res.data.telexDownEmployeeName
				}
			}
			// let cancelEmployeeName = ''
			this.detailData = { ...res.data }
			this.detailData.orderNo && this.$store.dispatch('order/setCustInfo', { 
				orderNo: this.detailData.orderNo, 
				custName: this.detailData.custName,
				compDeptName: this.detailData.compDeptName, 
				isJoint: !!this.detailData.jointNo, latest: true,
				businessType: this.detailData.businessType
			}) // 根据客商ID获取客商信息
			this.detailData.workAssign.forEach(item => {
				item.show = true
				item.disabled = true
				// mbl 允许修改放货参与人
				if (this.detailData.blType === 'mbl' && ['rc'].includes(item.jobCode)) item.disabled = false
				// 获取撤回人
				// if (item.jobCode === 'doc') {
				// 	cancelEmployeeName = item.employeeName
				// }
			})
			// Object.assign(this.detailData, { cancelEmployeeName })
			console.log(this.detailData)
			this.getTransferList()
		},
		// 点击tab切换
		tabClick(key) {
			console.log(key)
		},
		// 放单完成
		handleFinish() {
			this.$confirm('是否确认放单完成?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					blPutFinish({
						ids: [this.$route.query.oid]
					}).then(res => {
						this.$message({
							message: '放单完成',
							type: 'success',
							duration: 1000,
							onClose: () => {
								this.getDetail()
							}
						})
					})
				})
				.catch(err => {})
		},
		// 邮件发送弹窗关闭回调
		emailPopClose(type, value) {
			console.log(type, value)
			if (type === 'Confirm') {
				this.handleMail(value)
			} else {
				this.emailPopShow = false
			}
		},
		// 邮件发送
		handleMail(value) {
			let data = Object.assign(value, {
				blId: this.$route.query.blId,
				orderNo: this.$route.query.orderNo
			})
			// const loading = this.$loading()
			const loading = this.$loading({
				lock: true,
				text: 'Loading',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.7)'
			})
			blPutMail(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '发送成功',
						duration: 1000,
						onClose: () => {
							this.emailPopShow = false
							loading.close()
							this.$router.push({
								name: 'PutList'
							})
						}
					})
				})
				.catch(err => {
					console.log(err)
					loading.close()
				})
		},
		// 保存
		handleSave(type, value) {
			let data = Object.assign({}, this.createItem)
			// 勾选船东申请传申请人id，没勾选选0
			// if (data.telexApplyStatus !== 'y') {
			// 	data.telexApplyEmployeeId = 0
			// 	data.telexApplyEmployeeName = ''
			// }
			// if (this.createItem.telexDownStatus !== 'y') {
			// 	data.telexDownEmployeeId = 0
			// 	data.telexDownEmployeeName = ''
			// }
			if (type === 'finish') {
				Object.assign(data, { putStatus: 'finish' })
			}
			blPutSave(data).then(res => {
				this.$message({
					message: type === 'finish' ? '放单完成成功' : '保存成功',
					type: 'success',
					duration: 1000,
					onClose: () => {
						this.emailPopShow = false
						this.getDetail()
						// this.$router.push({
						// 	name: 'PutList'
						// })
					}
				})
			})
		},
		// 返回
		handleBack() {
			this.$router.push({
				name: 'RailwayPutList'
			})
		},
		// 去寄单
		handlePost() {
			this.$router.push({
				path: '/order/postDetail',
				query: {
					info: this.detailData
				}
			})
		}
	}
}
</script>
<style lang="scss">
.take-detail-mini {
	.el-button--mini {
		padding: 2px 8px;
	}
	.el-input--mini .el-input__inner{
		height: 20px;
		line-height: 20px;
	}
}
.take-status {
	margin-right: 20px;
	line-height: 38px;
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
.finish-time {
	margin-left: 4px;
	font-size: 12px;
}
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
.take-container .si-status .el-checkbox .el-checkbox__label {
	font-size: 12px;
}
.take-container .si-status .span-label {
	margin-right: 20px;
}
.take-container .tab .green {
	line-height: 28px;
	display: block;
	margin-top: 5px;
}
.take-container .tab .green em {
	font-style: normal;
	color: #67c23a;
}
</style>
