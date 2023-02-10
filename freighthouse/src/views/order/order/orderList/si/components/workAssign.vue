<template>
	<div class="workAssign-cont">
		<div class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="item.jobCode">
			<WorkAssignUserInfo :item="item" />
			<div class="item-value">
				<el-select
					size="mini"
					filterable
					:disabled="item.disabled"
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
import WorkAssignUserInfo from '@/views/order/order/components/workAssignUserInfo'

export default {
	data() {
		return {
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
		...mapState({
			dictMap: state => state.dict.dictMap,
			currRole: state => state.order.currRole,
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
		},
		// 获取员工name
		getEmployeeName(val, index) {
			// let data = {
			//   name: val ? val.replace(/^\s+|\s+$/g, '') : ''
			// }
			// baseEmployeeListName(data).then(res => {
			//   this.$set(this.orderWorkOptions[index], 'data', res.data)
			// })
			let roleCode = this.orderWorkOptions[index].jobCode
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode
			}

			baseDeptParticipants(data).then(res => {
				this.$set(this.orderWorkOptions[index], 'data', res.data)
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
			line-height: 20px;
			display: flex;
			margin-top: 2px;
			.el-icon-postcard {
				font-size: 16px;
				margin-left: 5px;
				cursor: pointer;
				color: #409eff;
				padding-top: 3px;
			}
		}
		.item-value {
			color: #969696;
			height: 20px;
      line-height: 20px;
      // margin-top: 2px;
		}
	}
}
</style>
