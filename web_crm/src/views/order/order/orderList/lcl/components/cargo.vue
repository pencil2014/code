<template>
	<div class="lcl-cargo-form">
		<div class="row-flex flex-cargo" v-for="(o, index) in createItem.cargoList" :key="index">
			<div class="btn-plus-search" @click="handleAddCargo" v-if="!viewState"></div>
			<div class="btn-minus-search" @click="handleDeleteCargo(index)" v-if="index > 0 && !viewState"></div>
			<el-form-item class="cargo-item hscode" label="HS Code" :prop="`cargoList.${index}.hscode`" :show-message="false" :rules="{ required: isRequired, message: '请选择海关编号', trigger: 'change' }">
				<el-tooltip v-if="viewState" class="item" effect="dark" :content="o.hscode" placement="top">
          <el-select size="mini" v-model="o.hscode" style="width: 100%"  placeholder="请选择海关编号" disabled>
						<el-option v-for="(item, index) in hscodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-tooltip>
				<el-select v-else size="mini" v-model="o.hscode" style="width: 100%" remote filterable clearable placeholder="请选择海关编号" :disabled="viewState" @change="handleChangeHscode" :remote-method="val => queryCargoHscode(val)">
					<el-option v-for="(item, index) in hscodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item class="cargo-item cname" label="中文品名" :prop="`cargoList.${index}.cname`" :show-message="false" :rules="{ required: isRequired, message: '请输入中文品名', trigger: 'blur' }">
				<el-tooltip v-if="viewState" class="item" effect="dark" :content="o.cname" placement="top">
           <el-input size="mini" v-model="o.cname" clearable placeholder="请输入中文品名" disabled maxlength="128"></el-input>
        </el-tooltip>
				<el-input v-else size="mini" v-model="o.cname" clearable placeholder="请输入中文品名" :disabled="viewState" maxlength="128"></el-input>
			</el-form-item>
			<el-form-item class="cargo-item cname" label="英文品名" :prop="`cargoList.${index}.ename`" :show-message="false" :rules="{ required: isRequired, message: '请输入英文品名', trigger: 'blur' }">
				<el-tooltip v-if="viewState" class="item" effect="dark" :content="o.ename" placement="top">
           <el-input size="mini" v-model="o.ename" clearable placeholder="请输入英文品名" disabled maxlength="128"></el-input>
        </el-tooltip>
				<el-input v-else size="mini" v-model="o.ename" clearable placeholder="请输入英文品名" :disabled="viewState" maxlength="128"></el-input>
			</el-form-item>
			<div class="cargo-item cname">
				<div class="item-label"><span class="lab">货品分类</span></div>
				<div class="item-content">
					<el-select size="mini" v-model="o.commodityTypeCode" style="width: 100%" clearable filterable placeholder="请选择货品分类" :disabled="viewState">
						<el-option v-for="item in commodityTypeCodeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</div>
			</div>
			<el-form-item class="cargo-item cname" label="货物性质" :prop="`cargoList.${index}.property`" :show-message="false" :rules="{ required: isRequired, message: '请选择货物性质', trigger: 'change' }">
				<el-select size="mini" v-model="o.property" style="width: 100%" clearable placeholder="请选择货物性质" :disabled="viewState">
					<el-option v-for="(item, index) in dictMap.cargoProperty" :key="index" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item class="cargo-item cname" label="包装" :prop="`cargoList.${index}.packageInfo`" :show-message="false" :rules="{ required: isRequired, message: '请选择包装', trigger: 'change' }">
				<el-select size="mini" v-model="o.packageInfo" style="width: 100%" clearable placeholder="请选择" filterable :disabled="viewState">
					<el-option v-for="item in dictMap.packageType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
				<!-- <el-input size="mini" v-model="o.packageInfo" clearable placeholder="请输入" :disabled="viewState"></el-input> -->
			</el-form-item>
			<el-form-item class="cargo-item hscode" label="危险等级" v-if="o.property === 'dangerous'" :show-message="false" :prop="`cargoList.${index}.dangerousGrade`" :rules="{ required: isRequired, message: '请选择危险等级', trigger: 'change' }">
				<el-select size="mini" v-model="o.dangerousGrade" style="width: 100%" clearable placeholder="请选择危险等级" :disabled="viewState">
					<el-option v-for="(item, index) in dictMap.dangerousGrade" :key="index" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item class="cargo-item cname" label="国际危码" :prop="`cargoList.${index}.dangerousCode`" :show-message="false" v-if="o.property === 'dangerous'" :rules="{ required: isRequired, message: '请选择国际危码', trigger: 'change' }">
				<el-select size="mini" v-model="o.dangerousCode" style="width: 100%" clearable placeholder="请选择国际危码" :disabled="viewState" remote filterable :remote-method="val => queryCargoUnno(val)">
					<el-option v-for="(item, index) in dangerousCodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<div class="cargo-item cname" v-if="o.property === 'dangerous'">
				<div class="item-label"><span class="lab">包装组别</span></div>
				<div class="item-content">
					<el-input size="mini" v-model="o.packageGroup" maxlength="64" clearable placeholder="请输入包装组别" :disabled="viewState"></el-input>
				</div>
			</div>
			<el-form-item v-if="isWoodenPackageState" class="cargo-item hscode" label="木质包装" :prop="`cargoList.${index}.isWoodenPackage`" :show-message="false" :rules="{ required: false, message: '请选择木质包装', trigger: 'change' }">
				<el-select size="mini" v-model="o.isWoodenPackage" style="width: 100%" clearable placeholder="请选择木质包装" :disabled="viewState">
					<el-option v-for="item in yesOrNoOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item class="cargo-item hscode" label="发货单位" :prop="`cargoList.${index}.shipperName`" :show-message="false" :rules="{ required: false, message: '请选择发货单位', trigger: 'change' }">
				<el-select
					v-model="o.shipperName"
					size="mini"
					clearable
					remote
					:filterable="true"
					@visible-change="val => custVisibleChange(val, o.shipperName)"
					:remote-method="custFilterMehod"
					placeholder="请选择"
					@change="val => handleSelectCustid(val, o)"
					:disabled="viewState"
					style="width: 100%"
				>
					<el-option v-for="(item, index) in shipperCustOptions" :label="item.label" :value="item.value" :key="'shipperName' + index"></el-option>
				</el-select>
			</el-form-item>
			<el-row class="flex-item-commodityDesc">
				<el-form-item
					class="form-cont"
					label="唛头"
					:prop="`cargoList.${index}.mark`"
					:show-message="false"
					:rules="{ required: isRequired && ['st03'].includes(createItem.serviceType), message: '请输入唛头', trigger: 'blur' }"
					style="clear: both"
				>
					<TextAreaItem :disabled="viewState" :required="isRequired && ['st03'].includes(createItem.serviceType)" :keys="`mark-${index}`" label="唛头" :rows="1" maxHeightVal="66px" :value.sync="o.mark"></TextAreaItem>
					<!-- <el-input size="mini" v-model="o.mark" clearable placeholder="请输入" :disabled="viewState"></el-input> -->
				</el-form-item>
				<el-form-item class="form-cont" label="货物描述" :prop="`cargoList.${index}.commodityDesc`" :show-message="false" :rules="{ required: false, message: '请输入货物描述', trigger: 'blur' }">
					<TextAreaItem :disabled="viewState"  :keys="`commodityDesc-${index}`" label="货物描述" :rows="1" maxHeightVal="66px" :value.sync="o.commodityDesc"></TextAreaItem>
					<!-- <el-input size="mini" v-model="o.commodityDesc" clearable placeholder="请输入" :disabled="viewState"></el-input> -->
				</el-form-item>
			</el-row>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { cargoHscodeList, cargoTypeList, cargoUnnoList } from '@/api/base'
import { getValueByKey } from '@/api/order/list'
import TextAreaItem from '@/components/Form/textAreaItem'

export default {
	data() {
		return {
			oQuery: this.$route.query,
			hscodeOptions: [], // hscode下拉数据
			commodityTypeCodeOptions: [], // 货品分类下拉数据
			dangerousCodeOptions: [], // 国家危险品编码下拉数据
			yesOrNoOptions: [
				{ label: '是', value: 'y' },
				{ label: '否', value: 'n' }
			],
			// isSameCode: false,  // 是否散货部门
			shipperCustOptions: [] // 发货单位下拉值
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		orderStatus: {
			type: String,
			default: ''
		},
		countryCode: {
			type: String,
			default: ''
		}
	},
	created() {
		console.log('🚀 ~ this.createItem', this.createItem)
		this.queryCargoTypeList()
		// this.getDeptCode()
	},
	mounted() {},
	computed: {
		...mapState('user', ['deptCode']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole
		}),
		isWoodenPackageState() {
			// 美国，加拿大，澳洲航线显示木质包装选项
			return ['US', 'CA', 'AU'].includes(this.countryCode)
		},
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isOpEdit() {
			return (this.ordDetRole === 'op' || this.ordDetRole === 'line_cs') && this.orderStatus === 'pass' && this.$route.name === 'OrderDetail'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isRequired() {
			if (this.$route.name === 'LclAuditDetail') {
				return true
			}
			return this.isBd
		},
		isWoodenDisabled() {
			// doc,ac,op_truck,或者协同单都只有可读权限
			if (!this.ordDetRole || this.isDoc || this.isAc || this.isOpTruck || this.$route.query.source === 'jointList') {
				return true
			}
			// bd, 除了草稿和拒绝的都只有可读权限
			if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) {
				return true
			}
			// op,除了审核通过的都只有可读权限
			if (this.isOp && !['pass'].includes(this.orderStatus)) {
				return true
			}
			return false
			// return this.oQuery.action === 'view' || this.orderStatus !== 'draft'
		},
		 isEpricing() {
			return this.ordDetRole === 'epricing'
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
		viewState() {
			// 拼箱订舱审核详情的待审核可编辑
			if (this.$route.name === 'LclAuditDetail') {
				if (this.orderStatus === 'submit') {
					return false
				}
				return true
			}
			// 散货订单列表的详情只读，不可编辑
			if (this.$route.name === 'LclOrderDetail') {
				return true
			}
			if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) {
				return true
			}
			if (!this.ordDetRole || this.isEpricing || this.isEcs || this.isOp || this.isDoc || this.isAc || this.isOpTruck || this.isBkg) {
				return true
			}
			return false
		}
	},
	watch: {},
	components: { TextAreaItem },
	methods: {
		custFilterMehod(val) {
			this.getCustList(val)
		},
		custVisibleChange(val, name) {
			if (val) {
				this.getCustList(name)
			}
		},
		handleSelectCustid(val, o) {
			// console.log('val', val, o)
		},
		// 获取委托单位
		getCustList(val = '') {
			this.$store.dispatch('dict/queryCustomerList', val).then(data => {
				let list = data.list
				this.shipperCustOptions = list.map(o => {
					return {
						...o,
						value: o.name,
						label: o.name
					}
				})
			})
		},
		// //查询散货部门CODE
		// getDeptCode() {
		// 	getValueByKey('lcl_company_code').then(res => {
		// 		// 登录用户的deptCode以散货部门code为开头的判断为散货部门
		// 		if (res.data.startsWith(this.deptCode)) {
		// 			this.isSameCode = true
		// 		} else {
		// 			this.isSameCode = false
		//     }
		//     console.log('this.isSameCode', this.isSameCode)
		// 	})
		// },
		// 增加一行货物信息
		handleAddCargo() {
			this.createItem.cargoList.push({})
		},

		// 删除一行货物信息
		handleDeleteCargo(index) {
			let { cargoList } = this.createItem
			this.createItem.cargoList = cargoList.filter((item, sindex) => {
				return sindex !== index
			})
		},

		handleChangeHscode(val) {
			if (!val) this.hscodeOptions = []
		},

		// hscode模糊查询
		queryCargoHscode(queryString) {
			queryString &&
				cargoHscodeList({ keyword: queryString }).then(response => {
					this.hscodeOptions = response.data.map(item => {
						return Object.assign(item, {
							label: item.cargoDesc,
							value: item.hscode
						})
					})
				})
		},

		// 货品分类
		queryCargoTypeList() {
			cargoTypeList().then(response => {
				this.commodityTypeCodeOptions = response.data.map(item => {
					return Object.assign(item, {
						label: item.chapterName,
						value: item.chapterCode
					})
				})
			})
		},
		// 国际危险品编码查询
		queryCargoUnno(queryString) {
			queryString &&
				cargoUnnoList({ keyword: queryString }).then(response => {
					this.dangerousCodeOptions = response.data.map(item => {
						return Object.assign(item, {
							label: item.unDesc,
							value: item.unNo
						})
					})
				})
		}
	}
}
</script>

<style lang="scss" scoped>
.lcl-cargo-form {
	.row-flex.flex-cargo{
		.btn-minus-search,
		.btn-plus-search {
			margin-top: 2px;
		}
		.cargo-item {
			width: 15.8%;
			display: flex;
			padding: 0 5px 0 0;
			margin-bottom: 4px;
			float: left;
			// height: 20px;
			/deep/ .el-form-item__label,
			.item-label {
				width: 85px;
				padding-right: 4px;
				line-height: 20px;
				height: 20px;
			}
			.item-label .lab {
				display: block;
				width: 100%;
				text-align: right;
			}
			/deep/ .el-form-item__content,
			.item-content {
				flex: 1;
				line-height: 20px;
				height: 20px;
			}
			/deep/ .el-textarea{
				line-height: 16px;
				padding: 1px 4px;
			}
			&.cname {
				/deep/ .el-form-item__label,
				.item-label {
					width: 70px;
				}
			}
			&.hscode {
				/deep/ .el-form-item__label,
				.item-label {
					width: 70px;
				}
			}
			// &.height-100 {
			// 	height: auto;
			// 	min-height: 20px;
			// }
		}
		.flex-item-commodityDesc{
			width: 94.8%;
			display: flex;
			.form-cont{
				// display: -webkit-box;
				// display: -ms-flexbox;
				display: flex;
				width: 50%;
				padding: 0 5px 0 0;
				height: auto;
				/deep/ .el-form-item__label, .item-label{
					width: 70px;
					padding-right: 4px;
					line-height: 20px;
				}
				/deep/ .el-form-item__content{
					flex: 1;
					line-height: 20px;
					overflow: hidden;
				}
				.item-content{
					line-height: 20px;
					overflow: hidden;
				}
				/deep/ .el-textarea{
					padding: 1px 5px;
					line-height: 16px !important;
					box-sizing: border-box;
				}
			}
			/deep/ .el-form-item{
				margin-bottom: 10px;
			}
		}
	}
}
</style>
