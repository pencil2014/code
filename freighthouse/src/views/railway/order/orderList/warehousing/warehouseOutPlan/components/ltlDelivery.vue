<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form id="popAddLtlDelivery" ref="form" :rules="rules" :model="formData" class="table-com-layout" label-width="90px">
				<el-row>
					<el-col :span="6">
						<el-form-item label="委托编号" prop="intrustNo" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.intrustNo" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="派车类型" prop="intrustType_cn" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.intrustType_cn" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="车队" prop="supplierId">
							<el-select v-model="formData.supplierId" size="mini" clearable :filterable="true" @visible-change="supplierVisibleChange" :filter-method="supplierFilterMehod" placeholder="请选择" @change="handleSelectSupplier" style="width: 100%">
								<el-option v-for="(item, index) in supplierOptions" :label="item.label" :value="item.value" :key="index"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="车队联系人" prop="supplierContact">
							<el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="formData.supplierContact"
							:fetch-suggestions="(queryString, cb) => querySearchContact(queryString, cb)"
							placeholder="请输入"
							@select="value => handleSelectContact(value)"
						></el-autocomplete>
							<!-- <el-input size="mini" placeholder="请输入" v-model="formData.supplierContact" clearable></el-input> -->
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="车队联系人电话" prop="supplierContactPhone">
							<el-input size="mini" placeholder="请输入" v-model="formData.supplierContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="车队联系电话" prop="supplierPhone">
							<el-input size="mini" placeholder="请输入" v-model="formData.supplierPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="注意事项" prop="remark">
							<el-input size="mini" placeholder="请输入" v-model="formData.remark" clearable maxlength="512" show-word-limit></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-table ref="outPlanBox" border fit highlight-current-row stripe style="width: 100%" class="outPlanBoxTable" :data="tableData" :span-method="objectSpanMethod">
					<el-table-column prop="outPlanNo" label="出仓计划编号" align="center" width="150"></el-table-column>
					<el-table-column prop="whName" label="出仓仓库" align="center"></el-table-column>
					<el-table-column prop="custName" label="客户名称" align="center" width="150"></el-table-column>
					<el-table-column label="装货地点" width="150" align="center">
						<template slot-scope="scope">
							{{ scope.row.loadProvince ? scope.row.loadProvince + scope.row.loadCity : '' }}
						</template>
					</el-table-column>
					<el-table-column prop="loadAddress" label="装货详细地址" align="center" width="150"></el-table-column>
					<el-table-column prop="loadContact" label="装货人" align="center"> </el-table-column>
					<el-table-column prop="loadContactPhone" label="装货人电话" align="center" width="120"> </el-table-column>
					<el-table-column prop="preLoadTime" label="委托装柜时间" align="center" width="120"> </el-table-column>
					<el-table-column prop="loadTime" label="实际到场时间" align="center" width="120"> </el-table-column>
					<el-table-column prop="unloadContact" label="卸货人" align="center"> </el-table-column>
					<el-table-column prop="unloadContactPhone" label="卸货电话" align="center"> </el-table-column>
					<el-table-column label="卸货地点" align="center" width="150">
						<template slot-scope="scope">
							{{ scope.row.unloadProvince ? scope.row.unloadProvince + scope.row.unloadCity : '' }}
						</template>
					</el-table-column>
					<el-table-column prop="unloadAddress" label="卸货详细地址" align="center" width="120"> </el-table-column>
					<el-table-column prop="postcode" label="邮政编码" align="center" width="120"> </el-table-column>
					<el-table-column prop="" label="货品信息" align="center" width="120">
						<template slot-scope="scope">
							<el-button :disabled="!scope.row.loadContact" @click="handleViewCargos(scope.row)" type="text" size="mini">查看</el-button>
						</template>
					</el-table-column>
					<el-table-column prop="driverName" label="司机姓名" align="center"> </el-table-column>
					<el-table-column prop="driverPhone" label="司机电话" align="center"> </el-table-column>
					<el-table-column prop="licensePlate" label="车牌号" align="center"> </el-table-column>
					<el-table-column fixed="right" label="操作" width="150" align="center">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button v-if="outPlanNoSpanArr[scope.$index]" @click="handleInfo('add', scope.row, scope.$index)" type="text" size="mini">添加地址</el-button>
								<el-button v-if="scope.row.loadContact" @click="handleInfo('info', scope.row, scope.$index)" type="text" size="mini">详情</el-button>
								<el-button v-if="!outPlanNoSpanArr[scope.$index]" @click="handleDelete(scope.row, scope.$index)" type="text" size="mini">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</el-form>
		</BaseDialog>
		<div v-if="ltlDeliveryInfoShow">
			<LtlDeliveryInfo @close="ltlDeliveryInfoClose" :addressData="addressData" />
		</div>
		<div v-if="showCargoDialog">
			<CargosDialog :cargosList="cargosList" @close="closeDialog"></CargosDialog>
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { copyArry } from '@/utils/tools'
import { supplierInfo } from '@/api/crm/supplier'
import BaseDialog from '@/components/Base/Dialog/index'
import LtlDeliveryInfo from './ltlDeliveryInfo'
import CargosDialog from './cargosDialog'

const defaultFormData = {
	intrustNo: '',
	intrustType: '',
	intrustType_cn: '',
	supplierId: '',
	supplierName: '',
	supplierContact: '',
	supplierContactPhone: '',
	supplierPhone: '',
	remark: ''
}

export default {
	data() {
		return {
			dialogConfig: {
				title: '新增派车信息',
				show: true,
				size: 'medium',
				width: '80%'
			},
			formData: {},
			supplierOptions: [],
			rules: {
				intrustNo: [{ required: true, message: '委托编号不能为空', trigger: 'blur' }],
				// intrustType: [{ required: true, message: '派车类型不能为空', trigger: 'blur'}],
				intrustType_cn: [{ required: true, message: '派车类型不能为空', trigger: 'blur' }]
			},
			tableData: [],
			outPlanNoSpanArr: [],
			pos: 0,
			ltlDeliveryInfoShow: false, // 添加货品弹窗
			addressData: {},
			clickRowIndex: '', // 点击的row索引
			addressType: 'add',
			showCargoDialog: false, // 显示商品信息弹窗
			cargosList: [], // 商品信息表格数据
			restaurants: [], // 供应商所有值
			contactInfo: [],
		}
	},
	props: {
		detailData: {
			type: Object,
			default: () => ({})
		}
	},
	watch: {
		// detailData: {
		//   handler(newValue) {
		//     console.log(newValue)
		//     this.formData = Object.assign({}, defaultFormData, newValue)
		//     this.tableData = [...newValue.loadInfoList]
		//     this.getSpanArr(this.tableData)
		//   },
		//   deep: true,
		//   immediate: true
		// }
	},
	created() {
		this.init()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.railway.orderNo,
			custid: state => state.railway.custid,
			ordDetRole: state => state.railway.ordDetRole
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
    isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
	},
	components: {
		BaseDialog,
		LtlDeliveryInfo,
		CargosDialog
	},
	methods: {
		init() {
			this.formData = Object.assign({}, defaultFormData, this.detailData)
			this.tableData = [...this.detailData.loadInfoList]
			this.getSpanArr(this.tableData)
		},
		// 储存合并相同的出仓编号的id
		getSpanArr(data) {
			/*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
			this.outPlanNoSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.outPlanNoSpanArr.push(1) //outPlanNoSpanArr是一个空数组，用于存放每一行记录的合并数
					this.pos = 0 //pos是outPlanNoSpanArr的索引
				} else {
					// 判断出仓编号当前元素与上一个元素是否相同
					if (data[i].outPlanNo === data[i - 1].outPlanNo) {
						this.outPlanNoSpanArr[this.pos] += 1
						this.outPlanNoSpanArr.push(0)
					} else {
						this.outPlanNoSpanArr.push(1)
						this.pos = i
					}
				}
			}
			console.log(this.outPlanNoSpanArr)
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			// 出仓编号，仓库，客户名称列需合并
			if ([0, 1, 2].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.outPlanNoSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
		},
		handleInfo(type, row, index) {
			this.clickRowIndex = index
			this.addressType = type
			this.ltlDeliveryInfoShow = true
			let cargoInfoList = this.detailData.loadInfoList.filter(item => item.outPlanNo === row.outPlanNo)[0].cargoInfoList
			console.log(this.detailData.loadInfoList)

			if (type === 'add') {
				this.addressData = {
					outPlanNo: row.outPlanNo,
					custid: row.custid,
					custName: row.custName,
					whName: row.whName,
					whId: row.whId,
					cargoInfoList: cargoInfoList
				}
			} else {
				//点击详情反显地点数据 只有国家时 数组只添加国家
				row.loadPlace = row.loadCity ? [row.loadProvince, row.loadCity] : [row.loadProvince]
				row.unloadPlace = row.unloadCity ? [row.unloadProvince, row.unloadCity] : [row.unloadProvince]
				Object.assign(this.addressData, row)
			}
		},
		// 货品关闭回调
		ltlDeliveryInfoClose(action, values) {
			console.log(action, values)
			this.ltlDeliveryInfoShow = false
			if (action === 'Confirm') {
				// 详情
				if (this.addressType === 'info') {
					this.$set(this.tableData, this.clickRowIndex, values)
				} else {
					// 添加地址,如果无装货信息的要先赋给该行的装货信息，如果有装货信息的就添加一行地址
					if (!this.tableData[this.clickRowIndex].loadContact) {
						this.$set(this.tableData, this.clickRowIndex, values)
					} else {
						let posIndex = this.clickRowIndex + this.outPlanNoSpanArr[this.clickRowIndex]
						this.tableData.splice(posIndex, 0, values)
						this.getSpanArr(this.tableData)
					}
				}
			}
		},
		// 删除货物箱
		handleDelete(row, sIndex) {
			this.tableData = this.tableData.filter((item, index) => index !== sIndex)
			this.getSpanArr(this.tableData)
		},
		// 查看货品
		handleViewCargos(row) {
			this.cargosList = row.cargoInfoList
			this.showCargoDialog = true
		},
		closeDialog() {
			this.showCargoDialog = false
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		// 箱子校验
		validate(values) {
			console.log(values)
			if (!values.length) {
				this.$message({ type: 'error', message: '请填写派车信息' })
				return false
			}
			if (values.some(item => !item.loadContact)) {
				this.$message({ type: 'error', message: '请填写正确的装货人' })
				return false
			}
			if (values.some(item => !item.loadContactPhone)) {
				this.$message({ type: 'error', message: '请填写正确的装货人联系方式' })
				return false
			}
			if (values.some(item => !item.unloadContact)) {
				this.$message({ type: 'error', message: '请填写正确的卸货人' })
				return false
			}
			if (values.some(item => !item.unloadContactPhone)) {
				this.$message({ type: 'error', message: '请选择正确的卸货人联系方式' })
				return false
			}
			return true
		},
		dialogCallback(action, done) {
			// 保存
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						let data = { ...this.formData }
						data.loadInfoList = this.tableData
						if (!this.validate(this.tableData)) return
						this.close('Confirm', data)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		supplierVisibleChange(val) {
			if (val) this.supplierSearch('')
		},
		supplierFilterMehod(val) {
			this.supplierSearch(val)
		},
		// 车队模糊查询
		supplierSearch(queryString) {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'truck', queryString: queryString }).then(data => {
				this.supplierOptions =
					(data.list &&
						data.list.map(ele => {
							return Object.assign(ele, {
								label: this.$language == 'en' ? ele.ename : ele.name,
								value: ele.supplierId ? Number(ele.supplierId) : '' // Number
							})
						})) ||
					[]
			})
		},
		handleSelectSupplier(val) {
			if (val) {
				let label = this.supplierOptions.filter(o => o.value === val)[0].label
				this.formData.supplierName = label
				supplierInfo({ supplierId: val }).then(res => {
					let { contact } = res.data
					Object.assign(this.formData, {
						supplierContact: contact && contact.length ? contact[0].name || contact[0].ename : '',
						supplierContactPhone: contact && contact.length ? contact[0].mobileNo : ''
					})
					this.restaurants = this.loadAll(contact)
				})
			} else {
				Object.assign(this.formData, {
					supplierName: '',
					supplierContact: '',
					supplierContactPhone: ''
				})
			}
		},
		querySearchContact(queryString, cb) {
			let restaurants = this.restaurants
			let results = queryString
				? restaurants.filter(this.createFilter(queryString))
				: restaurants
			cb(results)
		},
		handleSelectContact(item) {
			if (item.value) {
				for (let i = 0; i < this.contactInfo.length; i++) {
					if (item.value === this.contactInfo[i].value) {
						Object.assign(this.formData, {
							supplierContactPhone: this.contactInfo[i].mobileNo,
						})
						return
					}
				}
			}
		},
		createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
      }
    },
    loadAll(data) {
      let arr = []
      for (let i = 0; i < data.length; i++) {
        let obj = {}
        obj.value = data[i].name || data[i].ename
        obj.mobileNo = data[i].mobileNo
        arr.push(obj)
      }
      this.contactInfo = arr
      return arr
    },
	}
}
</script>

<style lang="scss">
#popAddLtlDelivery {
	.el-row {
		// padding: 10px 0 0 0;
		margin-bottom: 8px;
	}
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label {
		padding-right: 4px;
	}
	.el-form-item__content {
		margin-right: 10px;
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
