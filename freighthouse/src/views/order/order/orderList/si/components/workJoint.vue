<template>
	<div class="work-cont">
		<el-collapse v-model="activeNamesJoint" @change="handleChange">
			<el-collapse-item name="joint">
				<div slot="title" class="worker-type-label">协同参与人</div>
				<div class="work-assign-item" v-for="(item, index) in jointWorkAssignList" :key="item.jobCode">
					<WorkAssignUserInfo :item="item"/>
					<div class="item-value">
						<span v-if="!item.show">{{ item.employeeName }}</span>
						<el-select
							clearable
							v-if="item.show"
							:disabled="item.disabled"
							size="mini"
							:filterable="true"
							v-model="item.employeeName"
							style=""
							placeholder="请选择"
							@visible-change="
								val => {
									visibleChangeJoint(val, index)
								}
							"
							:filter-method="
								val => {
									filterMehodJoint(val, index)
								}
							"
							@change="
								val => {
									handleChangeEmployeeJoint(val, index)
								}
							"
						>
							<el-option v-for="o in item.data" :key="o.employeeId" :label="o.cname" :value="o.employeeId">
								{{ o.cname }}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{ o.deptCname }})</em>
							</el-option>
						</el-select>
					</div>
				</div>
			</el-collapse-item>
			<el-collapse-item name="origin">
				<div slot="title" class="worker-type-label">主单参与人</div>
				<div class="work-assign-item" v-for="(item, index) in orgWorkAssignList" :key="item.jobCode">
					<WorkAssignUserInfo :item="item"/>
					<div class="item-value" :class="!editState ? 'invalid' : ''">
						<span v-if="!item.show">{{ item.employeeName }}</span>
						<el-select
							clearable
							v-if="item.show"
							size="mini"
							:filterable="true"
							:disabled="true"
							v-model="item.employeeName"
							style=""
							placeholder="请选择"
							@visible-change="
								val => {
									visibleChange(val, index)
								}
							"
							:filter-method="
								val => {
									filterMehod(val, index)
								}
							"
							@change="
								val => {
									handleChangeEmployee(val, index)
								}
							"
						>
							<el-option v-for="o in item.data" :key="o.employeeId" :label="o.cname" :value="o.employeeId">
								{{ o.cname }}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{ o.deptCname }})</em>
							</el-option>
						</el-select>
					</div>
				</div>
			</el-collapse-item>
		</el-collapse>

		<div class="mt10">
			<div class="joint-work-item" v-if="jointAuditWorkData && Object.keys(jointAuditWorkData).length">
				<div class="item-label">{{ jointAuditWorkData.jobCname }}</div>
				<div class="item-value joint-work">
					<span>{{ jointAuditWorkData.employeeName }}</span>
				</div>
			</div>
			<div class="joint-work-item" v-if="jointWorkData && jointWorkData.length">
				<div class="item-label">协同岗位分配</div>
				<div class="item-value joint-work">
					<el-collapse v-model="activeNames" @change="handleChange">
						<el-collapse-item :title="item.compName" :name="index" v-for="(item, index) in jointWorkData" :key="index">
							<template slot="title">
								<div class="worker-company-name" :title="item.compName">{{ item.compName }}</div>
							</template>
							<div class="joint-work-row">
								<div class="val">{{ item.jointNo }}</div>
							</div>
							<div class="joint-work-row" v-if="item.jobUserList && item.jobUserList.length">
								<div class="label">协同内容：</div>
								<div class="val" v-for="(ele, b) in item.jobUserList" :key="'user' + b">
									<WorkAssignUserInfo :item="ele" type="jointService" />
									<div>
										<el-tooltip :disabled="!ele.serviceName.toString()" class="item" effect="dark" :content="`${ele.serviceName.toString()}` ? `服务项：${ele.serviceName.toString()}` : ''" placement="top-start">
											<el-input disabled v-model="ele.employeeName"></el-input>
										</el-tooltip>
									</div>
								</div>
							</div>
						</el-collapse-item>
					</el-collapse>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { employeeInfo, baseDeptParticipants, railDeptCode } from '@/api/base'
import WorkAssignUserInfo from '@/views/order/order/components/workAssignUserInfo'

export default {
	data() {
		return {
			oQuery: this.$route.query,
			employeeOptions: [],
			activeNamesJoint: ['joint', 'origin'],
			activeNames: ['0'],
			employeeInfo: {}
		}
	},
	props: {
		jointAuditWorkData: {
			type: Object,
			default: () => ({})
		},
		jointWorkData: {
			type: Array,
			default: () => []
		},
		isJoint: {
			type: Boolean,
			default: false
		},
		createItem: {
			type: Object,
			default: () => ({})
		},
		orderStatus: {
			type: String,
			default: ''
		},
		serviceList: {
			type: Array,
			default: () => []
		},
		orderWorkOptions: {
			type: Array,
			default: () => []
		},
		jointWorkAssignList: {
			type: Array,
			default: () => []
		},
		orgWorkAssignList: {
			type: Array,
			default: () => []
		},
		checkPointHeight: {
			type: Number,
			default: 0
		},
		obdDeptCode: {
			type: String,
			default: ''
		}
	},
	activated() {
		this.getOrderWork()
	},
	created() {},
	mounted() {
		setTimeout(() => {
			console.log('🚀 ~ this.jointWorkAssignList', this.jointWorkAssignList)
			console.log('🚀 ~ this.orgWorkAssignList', this.orgWorkAssignList)
		}, 3000)
	},
	computed: {
		...mapState('railway', ['ordDetRole']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			order: state => state.railway,
			compCode: state => state.user.compCode,
			roles: state => state.user.roles,
			userId: state => state.user.userId,
			deptCode: state => state.user.deptCode
		}),

		editState() {
			let status = false
			if (!this.ordDetRole) {
				status = false
			}

			// 业务
			if (this.isBd) {
				// 草稿、已拒绝状态可修改参与人，其他状态不可修改
				if (['draft', 'refuse'].includes(this.orderStatus)) {
					status = true
				}
			}
			if (this.isPricing) {
				// 草稿、已拒绝状态可修改参与人，其他状态不可修改
				if (['submit'].includes(this.orderStatus)) {
					status = true
				}
			}
			// 操作
			if (this.isBkg) {
				if (['pass'].includes(this.orderStatus)) {
					status = true
				}
			}

			return status
		},
		isAc() {
			return this.roles.includes('ac')
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isBd() {
			return this.ordDetRole === 'bd'
		},
		isPricing() {
			return this.ordDetRole === 'pricing'
		}
	},
	watch: {},
	components: {
		WorkAssignUserInfo
	},
	methods: {
		// jointDisabled(item) {
		// 	let state = false
		// 	if (this.isPricing) {
		// 		state = true
		// 	}
		// 	if (this.$route.query.jointNo) {
		// 		state = ['bd', 'obd', 'asst', 'pricing'].includes(item.jobCode)
		// 	}
		// 	return state
		// },
		getOrderWork() {
			let { workAssign } = this.createItem
			console.log('🚀 ~ workAssign', workAssign)

			let workAssignArr = []

			if (this.$route.query.action === 'add') {
				this.orderWorkOptions.forEach(item => {
					Object.assign(item, {
						show: true
					})
				})
			} else {
				// 编辑订单时参与人下拉框反显
				this.orderWorkOptions.forEach(item => {
					Object.assign(item, {
						show: true
					})
					if (workAssign && workAssign.length) {
						workAssign.forEach(o => {
							if (item.jobCode === o.jobCode) {
								Object.assign(item, {
									employeeName: o.employeeName,
									employeeId: o.employeeId
								})
							}
						})
					}
				})
			}
		},

		filterMehod(val, index) {
			this.getEmployeeName(val, index)
		},

		visibleChange(val, index) {
			if (val) {
				this.getEmployeeName('', index)
			}
		},
		filterMehodJoint(val, index) {
			this.getEmployeeNameJoint(val, index)
		},

		visibleChangeJoint(val, index) {
			if (val) {
				this.getEmployeeNameJoint('', index)
			}
		},
		handleChangeEmployeeJoint(val, index) {
			console.log('🚀 ~ index', index)
			console.log('🚀 ~ val', val)
			console.log('🚀 ~ userId', this.userId)
			let itemData = null
			this.jointWorkAssignList[index].data && (itemData = this.jointWorkAssignList[index].data.find(ele => ele.employeeId === val))

			this.jointWorkAssignList[index].employeeName = itemData ? itemData.cname : ''
			this.jointWorkAssignList[index].employeeId = itemData ? itemData.employeeId : ''
			this.jointWorkAssignList[index].compCode = itemData ? itemData.companyCode : ''
		},
		// 获取员工name 协同
		getEmployeeNameJoint(val, index) {
			let roleCode = this.jointWorkAssignList[index].jobCode
			let deptCode = this.deptCode
			// 商务 操作 取铁路code
			if (roleCode === 'pricing' || roleCode === 'bkg') {
				railDeptCode().then(res => {
					deptCode = res.data
					let data = {
						name: val ? val.replace(/^\s+|\s+$/g, '') : '',
						// deptCode,
						roleCode,
						isOnlyDeptCode: true
					}

					baseDeptParticipants(data).then(res => {
						this.$set(this.jointWorkAssignList[index], 'data', res.data)
					})
				})
			} else {
				let data = {
					name: val ? val.replace(/^\s+|\s+$/g, '') : '',
					// deptCode,
					roleCode
				}
				// eac 不传deptCode
				if (roleCode === 'eac') {
					delete data.deptCode
				}

				baseDeptParticipants(data).then(res => {
					this.$set(this.jointWorkAssignList[index], 'data', res.data)
				})
			}
		},

		/*
		 * 商务参与人特殊处理
		 * 整箱的委托订舱st07的代订舱不显示商务，客户自订不显示商务
		 * 拼箱的委托订舱st03的代订舱不显示商务，客户自订不显示商务
		 */
		pricingHide(item) {
			if (item.jobCode === 'pricing') {
				if (this.serviceList.includes('proxy_book')) {
					return false
				}
				if (this.serviceList.includes('proxy_whbook')) {
					return false
				}
			}
			return true
		},
		// 参与人下拉禁用设置，
		workDisabled(item) {
			// 业务禁用bd,
			if (this.isBd) {
				return ['bd'].includes(item.jobCode)
			}
			if (this.isPricing) {
				return true
			}

			// 操作禁用bd,obd,asst,pricing
			if (this.isBkg) {
				return ['bd', 'obd', 'asst', 'pricing'].includes(item.jobCode)
			}
		},

		handleChangeEmployee(val, index) {
			console.log('🚀 ~ index', index)
			console.log('🚀 ~ val', val)
			console.log('🚀 ~ userId', this.userId)
			let itemData = null
			this.orderWorkOptions[index].data && (itemData = this.orderWorkOptions[index].data.find(ele => ele.employeeId === val))

			this.orderWorkOptions[index].employeeName = itemData ? itemData.cname : ''
			this.orderWorkOptions[index].employeeId = itemData ? itemData.employeeId : ''
			this.orderWorkOptions[index].compCode = itemData ? itemData.companyCode : ''
		},

		// 获取员工name
		getEmployeeName(val, index) {
			let roleCode = this.orderWorkOptions[index].jobCode
			let deptCode = this.obdDeptCode
			// 商务 操作 取铁路code
			if (roleCode === 'pricing' || roleCode === 'bkg') {
				railDeptCode().then(res => {
					deptCode = res.data
					let data = {
						name: val ? val.replace(/^\s+|\s+$/g, '') : '',
						deptCode,
						roleCode,
						isOnlyDeptCode: true
					}

					baseDeptParticipants(data).then(res => {
						this.$set(this.orderWorkOptions[index], 'data', res.data)
					})
				})
			} else {
				let data = {
					name: val ? val.replace(/^\s+|\s+$/g, '') : '',
					deptCode,
					roleCode
				}
				// eac 不传deptCode
				if (roleCode === 'eac') {
					delete data.deptCode
				}

				baseDeptParticipants(data).then(res => {
					this.$set(this.orderWorkOptions[index], 'data', res.data)
				})
			}
		},

		handleChange(val) {},

		handleTogglePopOver(employeeId) {
			this.employeeInfo = {
				telephone: '',
				mobileNo: '',
				email: '',
				deptCname: '',
				companyCname: ''
			}
			if (employeeId) {
				employeeInfo({ employeeId: employeeId }).then(res => {
					this.employeeInfo = res.data
				})
			}
		}
	}
}
</script>

<style lang="scss">
.el-collapse-item__header {
	height: 30px;
	line-height: 30px;
	border-bottom: 1px dashed #d9d9d9;
}
.worker-type-label {
	font-weight: 600;
	line-height: 30px;
	font-size: 12px;
	padding-left: 10px;
	color: #555;
}
.work-cont {
	position: relative;
	height: 100%;
	.work-assign-item {
		margin: 0 10px;
		.item-label {
			line-height: 24px;
			display: flex;
			.el-icon-postcard {
				font-size: 16px;
				margin-left: 5px;
				cursor: pointer;
				color: #409eff;
				padding-top: 4px;
			}
		}
		.item-value {
			color: #969696;
			height: 28px;
			line-height: 28px;
			&.invalid {
				pointer-events: none;
				cursor: pointer;
				.el-input__inner {
					background-color: #f5f7fa;
				}
			}
		}
	}
	.joint-work-item {
		background-color: #f9f9f9;
		padding: 0 10px 15px 10px;
		.item-label {
			line-height: 32px;
			font-weight: bold;
		}
	}
	.joint-work .el-collapse-item__header {
		font-size: 12px;
		height: 32px;
		line-height: 32px;
		background-color: #f9f9f9;
	}
	.joint-work .el-collapse-item__content {
		padding-bottom: 10px;
		background-color: #f9f9f9;
	}
	.joint-work .joint-work-row {
		font-size: 12px;
		.label {
			color: #999;
			line-height: 20px;
			.el-icon-postcard {
				font-size: 16px;
				margin-left: 5px;
				cursor: pointer;
				color: #409eff;
			}
		}
		.val {
			line-height: 16px;
			em {
				color: #999;
				font-style: normal;
			}
		}
	}
}
.emplpyeeName-pop {
	font-size: 12px;
}
</style>
