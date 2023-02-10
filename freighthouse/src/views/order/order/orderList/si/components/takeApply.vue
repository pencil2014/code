<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createForm" :rules="rules" :model="createItem" label-position="right" label-width="110px" class="create-form">
			<el-form-item label="取单客服(MBL)" :show-message="false" prop="takeEmployeeId">
				<el-select size="mini" clearable filterable remote v-model="createItem.takeEmployeeId" style="width: 100%" placeholder="请选择" @visible-change="employeeVisibleChange" :filter-method="employeeFilterMehod" @change="handleChangeEmployee">
					<el-option v-for="(o, index) in employeeOptions" :key="index" :label="o.label" :value="o.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="放货岗" :show-message="false" prop="putEmployeeId">
				<el-select size="mini" clearable filterable v-model="createItem.putEmployeeId" style="width: 100%" placeholder="请选择">
					<el-option v-for="(o, index) in rcOptions" :key="index" :label="o.label" :value="o.value"> </el-option>
				</el-select>
			</el-form-item>
			<!-- <el-form-item label="放货岗" prop="putEmployeeName">
				<el-input type="" size="mini" placeholder="请输入" v-model="createItem.putEmployeeName" disabled></el-input>
			</el-form-item> -->
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { baseDeptParticipants } from '@/api/base'
import { blDraftConfirm } from '@/api/order/bl'
import { getUserCompanyInfo } from '@/api/user'

const defaultCreate = {
	takeEmployeeId: '',
	putEmployeeId: '',
	putEmployeeName: ''
}

export default {
	data() {
		return {
			rcOptions: [],
			oQuery: this.$route.query,
			dialogConfig: {
				title: '推送客服/放货',
				show: true,
				size: 'medium'
				// width: "800px"
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {
				takeEmployeeId: [{ required: this.detailData.blMode === 'original', message: '请选择取单客服(MBL)', trigger: 'change' }],
				putEmployeeId: [{ required: true, message: '请选择放货岗', trigger: 'change' }]
			},
			employeeOptions: [],
			cusRequired: false
		}
	},
	props: {
		detailData: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		let { workAssign } = this.detailData
		let sItem = workAssign.find(item => item.jobCode === 'rc')
		let tcItem = workAssign.find(item => item.jobCode === 'tc')
		// 获取当前登录账号所属公司信息
		getUserCompanyInfo({}).then(res => {
			console.log('🚀 ~ res', res)
			if (res.code === 0) {
				let deptCode = res.data.settleCompanyCode || res.data.companyCode
				baseDeptParticipants({ deptCode, name: '', roleCode: 'rc' }, true).then(res => {
					this.rcOptions = res.data.map(item => {
						return Object.assign(item, {
							label: this.$language === 'en' ? item.ename : item.cname,
							value: item.employeeId ? Number(item.employeeId) : ''
						})
					})
					if (sItem && !this.rcOptions.some(item => item.value == Number(sItem.employeeId))) {
						this.rcOptions.unshift({ label: sItem.employeeName, value: Number(sItem.employeeId) })
					}
					this.createItem.putEmployeeId = Number(sItem.employeeId)
				})
			}
		})

		if (tcItem) {
			let takeEmployeeId = tcItem.employeeId === 0 ? '' : tcItem.employeeId
			this.createItem.takeEmployeeId = takeEmployeeId
			this.createItem.takeEmployeeName = tcItem.employeeName
			this.employeeOptions = [{ label: this.createItem.takeEmployeeName, value: takeEmployeeId }]
		}
	},
	mounted() {},
	computed: {
		...mapState('user', ['deptCode']),
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		employeeFilterMehod(val) {
			this.getEmployeeName(val)
		},
		employeeVisibleChange(val) {
			val && this.getEmployeeName('')
		},
		handleChangeEmployee(val) {
			// let sItem = this.employeeOptions.find(ele => this.$language === 'en' ? ele.ename === val : ele.cname === val)
			// Object.assign(item, {
			//   employeeId: sItem.employeeId
			// })
		},
		// 获取员工name
		async getEmployeeName(val) {
			let data = {
				deptCode: this.deptCode,
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'tc' // 角色
			}
			baseDeptParticipants(data).then(res => {
				this.employeeOptions = res.data.map(item => {
					return Object.assign(item, {
						label: this.$language === 'en' ? item.ename : item.cname,
						value: item.employeeId ? Number(item.employeeId) : ''
					})
				})
			})
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.createForm.validate(valid => {
					if (valid) {
						let data = {
							takeEmployeeId: this.createItem.takeEmployeeId,
							putEmployeeId: this.createItem.putEmployeeId
						}
						this.close('Confirm', data)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>

<style lang="scss"></style>
