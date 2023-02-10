<template>
	<div class="workAssign-cont" :style="{ height: `${workAssignHeight}px` }">
		<div class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="item.jobCode">
			<WorkAssignUserInfo :item="item"/>
			<div class="item-value">
				<el-select
					size="mini"
					filterable
					:disabled="item.disabled || disabledselected"
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
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { orderWork } from '@/api/order/list'
import { baseEmployeeList, baseEmployeeListName, employeeInfo, baseDeptParticipants } from '@/api/base'
import { takeTcChange } from '@/api/railway/bl'
import { closePage } from '@/utils'
import WorkAssignUserInfo from '@/views/order/order/components/workAssignUserInfo'

export default {
	data() {
		return {
			disabledselected: false,
			oQuery: this.$route.query,
			employeeOptions: [],
			employeeInfo: {}
		}
	},
	props: {
		orderWorkOptions: {
			type: Array,
			default: () => []
		},
		workAssignHeight: {
			type: Number,
			default: 300
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState('user', ['deptCode']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			currRole: state => state.user.currRole,
			order: state => state.order
		})
	},
	watch: {},
	components: {
		WorkAssignUserInfo
	},
	methods: {
		filterMehod(val, index) {
			this.getEmployeeName(val, index)
		},
		visibleChange(val, index) {
			if (val) {
				this.getEmployeeName('', index)
			}
		},
		handleChangeEmployee(val, index) {
			let itemData = this.orderWorkOptions[index].data.filter(ele => ele.employeeId === val)
			this.orderWorkOptions[index].employeeName = itemData[0].cname
			this.orderWorkOptions[index].employeeId = itemData[0].employeeId
			this.disabledselected = true
			this.$confirm('请确认是否修改取单客服?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					takeTcChange({ orderNo: this.$route.query.orderNo, employeeId: itemData[0].employeeId }).then(() => {
						this.disabledselected = false
						this.$message({
							type: 'success',
							message: '修改成功',
							duration: 1000,
							onClose: () => {
								this.$EventBus.$emit('closePage', this.$route)
							}
						})
					})
				})
				.catch(() => {
					this.disabledselected = false
				})
		},
		// 获取员工name
		getEmployeeName(val, index) {
			let data = {
				deptCode: this.deptCode,
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'tc'
			}

			baseDeptParticipants(data).then(res => {
				let result = res.data.map(item => {
					let { deptCname } = item
					item.label = item.cname + deptCname ? `(${deptCname})` : ''
					return { ...item }
				})
				this.$set(this.orderWorkOptions[index], 'data', result)
			})
		},
		handleTogglePopOver(employeeId) {
			console.log('employeeId', employeeId)
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
.workAssign-cont {
	padding: 5px 10px;
	position: relative;
	height: 100%;
	overflow-y: auto;
	.work-assign-item {
		// margin-bottom: 10px;
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
		}
	}
}
.emplpyeeName-pop {
  font-size: 12px;
}
</style>
