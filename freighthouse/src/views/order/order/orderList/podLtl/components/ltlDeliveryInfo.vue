<template>
	<div class="table-com-layout">
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form id="pol-ltl-delivery-info" ref="form" :rules="rules" :model="formData" label-width="100px">
				<el-row>
					<el-col :span="6">
						<el-form-item label="客户名称" prop="custid" :show-message="false">
							<el-select v-model="formData.custid" filterable clearable @visible-change="customerSearch" 
								:filter-method="customerSearch" @change="handleChangeCustId" size="mini" style="width: 100%">
								<el-option v-for="(ele, index) in custOptions" :key="index" 
									:label="ele.label" 
									:value="ele.value"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货人" prop="loadContact">
							<el-input size="mini" placeholder="请输入" v-model="formData.loadContact" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货人电话" prop="loadContactPhone">
							<el-input size="mini" placeholder="请输入" v-model="formData.loadContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="委托装货时间" prop="preLoadTime" :show-message="false">
							<elDatePickerLimit size="mini" v-model="formData.preLoadTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="实际到场时间" prop="loadTime">
							<elDatePickerLimit noCanFuture size="mini" v-model="formData.loadTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货地点" prop="loadPlace" :show-message="false">
							<el-cascader
								style="width:100%"
								size="mini"
								:emitPath="true"
								v-model="formData.loadPlace"
								:options="loadPlaceData"
								:props="cityProps"
								clearable
								@change="handleLoadChange"
							></el-cascader>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货详细地址" prop="loadAddress" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.loadAddress" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货人" prop="unloadContact">
							<el-input size="mini" placeholder="请输入" v-model="formData.unloadContact" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货人电话" prop="unloadContactPhone">
							<el-input size="mini" placeholder="请输入" v-model="formData.unloadContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货地点" prop="unloadPlace" :show-message="false">
							<el-cascader
								style="width:100%"
								size="mini"
								:emitPath="true"
								v-model="formData.unloadPlace"
								:options="unloadPlaceData"
								:props="cityProps"
								clearable
								@change="handleUnloadChange"
							></el-cascader>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货详细地址" prop="unloadAddress" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.unloadAddress" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="邮政编码" prop="postcode" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.postcode" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="司机姓名">
							<el-input size="mini" placeholder="请输入" v-model="formData.driverName" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="司机电话">
							<el-input size="mini" placeholder="请输入" v-model="formData.driverPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="车牌号">
							<el-input size="mini" placeholder="请输入" v-model="formData.licensePlate" clearable></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<div class="row-tit between h32">
					<div class="ft14 tit"></div>
					<div class="row-tit-operate">
						<el-button size="mini" type="primary" @click="handleAddCargo" :disabled="isBd || addressData.status === 'finish'">添加货品</el-button>
					</div>
				</div>
				<el-table ref="cargo" fit highlight-current-row style="width: 100%" class="outPlanBoxTable" :data="tableData" show-summary :summary-method="getSummaries">
					<el-table-column prop="hscode" label="HS code" align="center">
						<template slot-scope="scope">
							<el-select size="mini" v-model="scope.row.hscode" style="width: 100%" remote filterable clearable placeholder="请选择海关编号" 
							@change="handleChangeHscode" :remote-method="(val) => queryCargoHscode(val)">
								<el-option v-for="(item, index) in hscodeOptions"
									:key="index"
									:label="item.label"
									:value="item.value">
								</el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="cname" label="中文品名" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入中文品名" v-model.number="scope.row.cname" clearable maxlength="128"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="ename" label="英文品名" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入英文品名" v-model.number="scope.row.ename" clearable maxlength="128"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="quantity" label="件数" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入件数" v-model="scope.row.quantity" clearable @blur="validateQuantity('quantity', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="weight" label="毛重(KGS)" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable @blur="validateVolumeWeight('weight', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="volume" label="体积(CBM)" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入体积" v-model="scope.row.volume" clearable @blur="validateVolumeWeight('volume', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="packageType" label="包装" align="center">
						<template slot-scope="scope">
							<el-select v-model="scope.row.packageType" size="mini" filterable placeholder="请选择包装">
								<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="150" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || addressData.status === 'finish'">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</el-form>
		</BaseDialog>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import {quantityMixin} from '@/views/order/order/mixins/quantityMixin'
import { validatePhone } from '@/utils/validate'
import BaseDialog from '@/components/Base/Dialog/index'
import { getForeignCity, cargoHscodeList } from '@/api/base'

const defaultFormData = {
	loadId: undefined,
	outPlanNo: '',
	loadContact: '',
	loadContactPhone: '',
	preLoadTime: '',
	loadTime: '',
	loadAddress: '',
	unloadContact: '',
	unloadContactPhone: '',
	unloadAddress: '',
	postcode: '',
	driverName: '',
	driverPhone: '',
	licensePlate: '',
	custid: '',
	custName: '',
	// whId: '',
	// whName: '',
	loadPlace: [],
	loadProvince: '',
	loadCity: '',
	boxDistrict: '',
	unloadPlace: [],
	unloadProvince: '',
	unloadCity: '',
	unloadDistrict: '',
	signFileNo: '',
	signFileName: '',
	cargoInfoList: []
}
export default {
	mixins: [quantityMixin],
	data() {
		return {
			loadPlaceData: [],
			unloadPlaceData: [],
			cityProps: {
				value: 'cname',
				label: 'cname',
				children: 'children'
			},
			dialogConfig: {
				title: '装货信息',
				show: true,
				size: 'medium',
				width: '80%'
			},
			formData: Object.assign({}, defaultFormData),
			rules: {
				custid: [{ required: true, message: ' ', trigger: 'change' }],
				loadPlace: [{ required: true, message: ' ', trigger: 'blur' }],
				loadAddress: [{ required: true, message: ' ', trigger: 'blur' }],
				unloadPlace: [{ required: true, message: ' ', trigger: 'blur' }],
				preLoadTime: [{required: true, message: ' ', trigger: 'change'}],
				unloadAddress: [{ required: true, message: ' ', trigger: 'blur' }],
				postcode: [{ required: true, message: ' ', trigger: 'blur' }],
			},
			tableData: [],
			custOptions: [],
			hscodeOptions: [],
		}
	},
	props: {
		addressData: {
			type: Object,
			default: () => ({})
		}
	},
	watch: {
		// addressData: {
		//   handler(newValue) {
		//     console.log(newValue)
		//     for (let i in defaultFormData) {
		//       this.formData[i] = newValue[i] || ''
		//     }
		//     this.tableData = [...newValue.cargoInfoList]
		//     console.log(this.formData)
		//   },
		//   deep: true,
		//   immediate: true
		// }
	},
	created() {
		this.init()
		//获取国家城市级联框数据
		this.getLoadPlaceData()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles,
			serviceInfoList: state => state.order.serviceInfoList,
      orderInfo: (state) => state.order.orderInfoDataObj
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
    isDoc() {
			return this.ordDetRole === 'doc'
		},
		isEpricing() {
      return this.userEditRoles.includes('epricing')
    },
    isEcs() {
      return this.userEditRoles.includes('ecs')
    },
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBd() {
			if(this.orderInfo.businessType ==='ship_import_lcl' && this.ordDetRole === 'op'){
        return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isJoint || (!this.isOp&&!this.isEpricing&&!this.isEcs)
      }
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isJoint || (!this.isDoc&&!this.isEpricing&&!this.isEcs)
		},
		isJoint() {
			let serviceInfo = this.serviceInfoList.find(item => item.serviceCode === 'pod_ltl_delivery')
			let isJoint = serviceInfo ? serviceInfo.isJoint : ''
			return isJoint === 'y' && !this.$route.query.jointNo ? true : false
		},
	},
	components: {
		BaseDialog,
	},
	methods: {
		getSummaries(param) {
      const { columns, data } = param
			const sums = []
			columns.forEach((column, index) => {
        if (index === 0) {
          return sums[index] = '合计'
        }
        const values = data.map(item => Number(item[column.property]))
        if (column.property === 'quantity' ||column.property ==='weight' || column.property==='volume' ) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          sums[index]
        }
      })
      return sums
    },
		// 客户模糊查询
    customerSearch(val) {
      this.$store.dispatch('dict/queryCustomerList', val === true?'':val).then(data => {
        let list = data.list
        this.custOptions = list.map(o => {
          return {
            value: o.custid ? Number(o.custid) : '',
            label: this.$language=='en'?o.ename:o.name
          }
        })
      })
		},
		handleChangeCustId(val) {
			let findItem = this.custOptions.find(item => item.value === val)
			this.formData.custName = findItem ? findItem.label : ''
		},
    // hscode模糊查询
    queryCargoHscode(queryString) {
      queryString && cargoHscodeList({keyword: queryString}).then((response) => {
        this.hscodeOptions = response.data.map(item => {
          return Object.assign(item, {
            label: item.cargoDesc,
            value: item.hscode
          })
        })
      });
		},
		handleChangeHscode(val) {
      if (!val) this.hscodeOptions = []
    },
		//卸货地点
		handleUnloadChange(val) {
			this.formData.unloadCountry = val[0] || ''
			this.formData.unloadProvince = val[1] || ''
			this.formData.unloadCity = val[2] || ''
			this.formData.unloadDistrict = val[3] || ''
			console.log('🚀 ~ this.unloadPlace', this.formData.unloadPlace)
		},
		//装货地点
		handleLoadChange(val) {
			this.formData.loadCountry = val[0] || ''
			this.formData.loadProvince = val[1] || ''
			this.formData.loadCity = val[2] || ''
			this.formData.loadDistrict = val[3] || ''
			console.log('🚀 ~ this.loadPlace', this.formData.loadPlace)
		},
		//处理最后一级children为空数组问题
		handleChildren(data) {
			// 循环遍历json数据
			for (var i = 0; i < data.length; i++) {
				if (data[i].children.length < 1) {
					// children若为空数组，则将children设为undefined
					data[i].children = undefined
				} else {
					// children若不为空数组，则继续 递归调用 本方法
					this.handleChildren(data[i].children)
				}
			}
			return data
		},
		//获取数据
		async getLoadPlaceData() {
			let res = await getForeignCity({})
			//处理最后一级children空数组
			this.loadPlaceData = this.handleChildren(res.data)
			this.unloadPlaceData = this.loadPlaceData
		},
		init() {
			// for (let i in defaultFormData) {
			// 	this.formData[i] = this.addressData[i] || ''
			// }
			console.log('addressData', this.addressData);
			
			this.formData = Object.assign({}, defaultFormData, this.addressData)
			this.tableData = [...this.addressData.cargoInfoList]
			this.custOptions = [{label: this.formData.custName, value: this.formData.custid}]
			console.log(this.formData, this.tableData)
		},
		handleAddCargo() {
			this.tableData.push({})
		},
		// 删除货物箱
		handleDelete(row, sIndex) {
			this.tableData = this.tableData.filter((item, index) => index !== sIndex)
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		// 箱子校验
		validate(values) {
			let numberReg = /^[0-9]+$/,
				reg = /^\d+(\.\d+)?$/
			let quantityValid = values.some(item => !numberReg.test(item.quantity))
			let weightValid = values.some(item => !reg.test(item.weight))
			let volumeValid = values.some(item => !reg.test(item.volume))
			if (!values.length) {
				this.$message({ type: 'error', message: '请选择货品' })
				return false
			}
			if (values.some(item => !item.hscode)) {
				this.$message({ type: 'error', message: '请选择正确的HS code' })
				return false
			}
			if (values.some(item => !item.cname)) {
				this.$message({ type: 'error', message: '请输入中文品名' })
				return false
			}
			if (values.some(item => !item.ename)) {
				this.$message({ type: 'error', message: '请输入英文品名' })
				return false
			}
			if (values.some(item => !item.quantity || quantityValid)) {
				this.$message({ type: 'error', message: '请填写正确的货品件数' })
				return false
			}
			// if (values.some(item => !item.weight || weightValid)) {
			// 	this.$message({ type: 'error', message: '请填写正确的货品毛重' })
			// 	return false
			// }
			// if (values.some(item => !item.volume || volumeValid)) {
			// 	this.$message({ type: 'error', message: '请填写正确的货品体积' })
			// 	return false
			// }
			if (values.some(item => !item.packageType)) {
				this.$message({ type: 'error', message: '请选择包装' })
				return false
			}
			return true
		},
		dialogCallback(action, done) {
			// 保存
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						if (!this.validate(this.tableData)) return
						let data = { ...this.formData }
						data.cargoInfoList = this.tableData
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

<style lang="scss">
#pol-ltl-delivery-info {
	// .el-row {
	// 	padding: 10px 0 0 0;
	// }
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.el-form-item__label, .el-form-item__content {
		line-height: 20px;
	}
	.row-tit {
		padding: 0 0 !important;
	}
	.inPlanBoxTable {
		margin-top: -1px;
	}
	.outPlanBoxTable td {
		border-right: 1px solid #dfe6ec !important;
	}
}
</style>
