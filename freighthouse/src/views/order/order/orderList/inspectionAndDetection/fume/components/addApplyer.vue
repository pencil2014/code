<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="addApplierForm" :rules="rules" :model="createItem" label-position="right" label-width="110px" class="create-form">
			<el-form-item label="申请公司" prop="custid" :show-message="false">
				<el-select style="width: 100%" clearable placeholder="请选择" size="mini" v-model="createItem.custid" :filterable="true" @visible-change="custVisibleChange" :filter-method="custFilterMehod" @change="handleSelectCust">
					<el-option v-for="(item, index) in custOptions" :key="index" :label="item.label" :value="item.value" :disabled="custids.includes(item.value)"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="申请联系人" prop="custContact" :show-message="false">
				<el-input size="mini" placeholder="请输入" v-model="createItem.custContact" clearable></el-input>
			</el-form-item>
			<el-form-item label="申请联系人电话" prop="custContactPhone" :show-message="false">
				<el-input size="mini" placeholder="请输入" v-model="createItem.custContactPhone" clearable></el-input>
			</el-form-item>
			<el-form-item label="集装箱" prop="fumeContainers" :show-message="false" v-if="detailInfo.businessType === 'ship_export_fcl'">
				<el-select style="width: 100%" clearable placeholder="请选择" size="mini" v-model="createItem.fumeContainers" multiple @change="handleSelectContainer">
					<el-option v-for="(item, index) in containerList" :key="index" :label="item.cn" :value="item.oid"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="提单号" prop="blNo" :show-message="false">
				<el-autocomplete
					style="width: 100%"
					size="mini"
					clearable
					v-model="createItem.blNo"
					:fetch-suggestions="(queryString, cb) => querySearchBlNo(queryString, cb)"
					placeholder="请输入"
					@change="value => handleChangeBlNo(value)"
					@select="item => handleSelectBlNo(item)"
					@clear="value => handleClearBlNo(value)"
				></el-autocomplete>
				<!-- <el-select v-model="createItem.blId" size="mini" clearable placeholder="请选择" @blur="selectBlur" @change="handleSelectBl" style="width: 100%">
					<el-option v-for="(item, index) in blIdOptions" :label="item.label" :value="item.value" :key="index"></el-option>
				</el-select> -->
				<!-- <el-input size="mini" placeholder="请输入" v-model="createItem.blNo" clearable></el-input> -->
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { customerInfo } from '@/api/crm/supplier'

const defaultCreate = {
	fbId: undefined,
	custid: '',
	custName: '',
	custContact: '',
	custContactPhone: '',
	blId: '',
	blNo: '',
	// fume_blNo: '',
	fumeContainers: []
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '申请人新增',
				show: true,
				size: 'medium',
				width: '400px'
				// width: "800px"
			},
			custOptions: [],
			createItem: Object.assign({}, defaultCreate),
			rules: {
				custid: [{ required: true, message: '请选择申请公司', trigger: 'change' }],
				custContact: [{ required: true, message: '请输入申请联系人', trigger: 'blur' }],
				custContactPhone: [{ required: true, message: '请输入申请联系人电话', trigger: 'blur' }],
				fumeContainers: [{ required: false, message: '请选择集装箱', trigger: 'change' }],
				blNo: [{ required: true, message: '请选择提单号', trigger: 'change' }]
			}
		}
	},
	props: {
		detailInfo: {
			type: Object,
			default: () => ({})
		},
		applierData: {
			type: Object,
			default: () => ({})
		},
		custids: {
			type: Array,
			default: () => []
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			blIdOptions: state => state.orderService.blIdOptions,
			containerList: state => state.orderService.containerList
		})
	},
	watch: {
		applierData: {
			handler(newVal) {
				console.log('applerDetail', newVal)
				this.createItem = Object.assign({}, defaultCreate, newVal)
				if (Object.keys(newVal).length) {
					this.createItem.fumeContainers = []
					newVal.fumeContainers.map(item => {
						this.createItem.fumeContainers.push(item.containerId)
					})
					this.custOptions = [{ label: newVal.custName, value: newVal.custid }]
				}
			},
			deep: true,
			immediate: true
		}
	},
	components: {
		BaseDialog
	},
	methods: {
		querySearchBlNo(queryString, cb) {
			var blIdOptions = this.blIdOptions
			var results = queryString ? blIdOptions.filter(this.createFilter(queryString)) : blIdOptions
			// 调用 callback 返回建议列表的数据
			cb(results);
		},
		createFilter(queryString) {
			return (item) => {
				return (item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
			}
		},
		handleSelectBlNo(item) {
			// this.createItem.blNo = item ? item.blNo : ''
			this.createItem.blId = item ? item.blId : null
		},
		handleChangeBlNo(value) {
			this.createItem.blNo = value
			this.createItem.blId = null
			// console.log('change', value, this.createItem.blNo, this.createItem.blId)
		},
		handleClearBlNo(val) {
			this.createItem.blNo = ''
			this.createItem.blId = null
		},
		selectBlur(e) {
			this.createItem.blId = e.target.value
		},
		handleSelectBl(val) {
			let sItem = this.blIdOptions.find(item => item.blId === val)
			this.createItem.blNo = sItem ? sItem.blNo : ''
			this.createItem.blId = sItem ? sItem.blId : null
		},
		handleSelectContainer(val) {},
		// 获取申请公司
		custFilterMehod(val) {
			this.getCustList(val)
		},
		custVisibleChange(val) {
			if (val) {
				this.getCustList()
			}
		},
		getCustList(val = '') {
			this.$store.dispatch('dict/queryCustomerList', val).then(data => {
				this.custOptions = data.list
				this.custOptions.forEach(item => {
					Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.name,
						value: item.custid ? Number(item.custid) : ''
					})
				})
			})
		},
		handleSelectCust(val) {
			if (val) {
				let custItem = this.custOptions.find(item => item.value === val)
				this.createItem.custName = custItem ? custItem.label : ''
				customerInfo({ custid: val }).then(res => {
					let { contact } = res.data
					Object.assign(this.createItem, {
						custContact: contact && contact.length ? contact[0].name : '',
						custContactPhone: contact && contact.length ? contact[0].mobileNo : ''
					})
				})
			} else {
				Object.assign(this.createItem, {
					custContact: '',
					custContactPhone: ''
				})
			}
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		validate() {
			return true
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.addApplierForm.validate(valid => {
					if (valid) {
						this.handleSave(done)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// 申请人弹窗保存
		handleSave(done) {
			done()
			let fumeContainers = this.containerList
				.filter(item => {
					return this.createItem.fumeContainers.includes(item.oid)
				})
				.map(item => {
					return {
						cn: item.cn,
						containerId: item.oid
					}
				})
			console.log(fumeContainers)
			this.close('Confirm', Object.assign({}, this.createItem, { fumeContainers }))
		}
	}
}
</script>

<style lang="scss" scoped>
.create-form{
	/deep/ .el-form-item {
		margin-bottom: 4px;
	}
	/deep/ .el-form-item__label{
		line-height: 20px;
	}
	/deep/ .el-form-item__content{
		line-height: 20px;
	}
}
</style>
