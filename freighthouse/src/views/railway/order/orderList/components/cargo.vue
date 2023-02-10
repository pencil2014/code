<template>
	<div class="cargo-form">
		<div class="railway-send-unit">
			<el-form-item class="flex-item  send-unit" label="发货单位" :prop="shipperCustid" :show-message="false" :rules="{ required: isBd, message: '请选择海关编号', trigger: 'change' }">
				<el-select
					v-model="createItem.shipperCustid"
					size="mini"
					clearable
					:filterable="true"
					@visible-change="custVisibleChange"
					:filter-method="custFilterMehod"
					placeholder="请选择"
					@change="handleSelectCustid"
					:disabled="viewState && isOp"
					style="width: 100%"
				>
					<el-option v-for="(item, index) in shipperCustidOptions" :label="item.label" :value="item.value" :key="index"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item class="flex-item " label="件数">
				<el-input size="mini" v-model="createItem.quantity" clearable placeholder="请输入" :disabled="viewState && isOp"></el-input>
			</el-form-item>
			<el-form-item class="flex-item " label="毛重">
				<el-input size="mini" v-model="createItem.weight" clearable placeholder="请输入" :disabled="viewState && isOp">
					<template slot="append">KGS</template>
				</el-input>
			</el-form-item>
			<el-form-item class="flex-item " label="体积">
				<el-input size="mini" v-model="createItem.volume" clearable placeholder="请输入" :disabled="viewState && isOp">
					<template slot="append">CBM</template>
				</el-input>
			</el-form-item>
		</div>
		<div class="row-flex flex-cargo railway-row-flex" v-for="(o, index) in createItem.cargoList" :key="index">
			<div class="btn-plus-search" @click="handleAddCargo" v-if="!viewState && !isOp"></div>
			<div class="btn-minus-search" @click="handleDeleteCargo(index)" v-if="index > 0 && !viewState && !isOp"></div>

			<el-form-item class="flex-item hscode" label="HS Code" :show-message="false" :rules="{ required: isBd, message: '请选择海关编号', trigger: 'change' }">
				<el-tooltip v-if="viewState || isOp" class="item" effect="dark" :content="el.hscode" placement="top">
					<el-select size="mini" v-model="o.hscode" style="width: 100%" placeholder="请选择海关编号" disabled>
						<el-option v-for="(item, index) in hscodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-tooltip>
				<el-select v-else size="mini" v-model="o.hscode" style="width: 100%" remote filterable clearable placeholder="请选择海关编号" :disabled="viewState || isOp" @change="handleChangeHscode" :remote-method="val => queryCargoHscode(val)">
					<el-option v-for="(item, index) in hscodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item class="flex-item cname" label="中文品名" :show-message="false" :rules="{ required: isBd, message: '请输入中文品名', trigger: 'blur' }">
				<el-tooltip v-if="viewState || isOp" class="item" effect="dark" :content="o.cname" placement="top">
					<el-input size="mini" v-model="o.cname" clearable placeholder="请输入中文品名" disabled></el-input>
				</el-tooltip>
				<el-input v-else size="mini" v-model="o.cname" clearable placeholder="请输入中文品名" :disabled="viewState || isOp"></el-input>
			</el-form-item>
			<el-form-item class="flex-item cname" label="英文品名" :show-message="false" :rules="{ required: isBd, message: '请输入英文品名', trigger: 'blur' }">
				<el-tooltip v-if="viewState || isOp" class="item" effect="dark" :content="o.ename" placement="top">
					<el-input size="mini" v-model="o.ename"  placeholder="请输入英文品名" disabled></el-input>
				</el-tooltip>
				<el-input v-else size="mini" v-model="o.ename" clearable placeholder="请输入英文品名" :disabled="viewState || isOp"></el-input>
			</el-form-item>
			<div class="flex-item cname">
				<div class="item-label"><span class="lab">货品分类</span></div>
				<div class="item-content">
					<el-select size="mini" v-model="o.commodityTypeCode" style="width: 100%" filterable clearable placeholder="请选择货品分类" :disabled="viewState || isOp">
						<el-option v-for="item in commodityTypeCodeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</div>
			</div>

			<el-form-item class="flex-item" label="装箱要求" :show-message="false" :rules="{ required: isBd, message: '请输入装箱要求', trigger: 'blur' }">
				<el-input size="mini" v-model="o.boxRemark" @focus="handleClear(o)" @blur="handleBlur(o)" placeholder="如无装箱特殊要求，填无" :disabled="viewState || isOp"> </el-input>
			</el-form-item>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { cargoHscodeList, cargoTypeList, cargoUnnoList } from '@/api/base'

export default {
	data() {
		return {
			timer: null,
			createItem: JSON.parse(JSON.stringify(this.item)),
			volume: '',
			weight: '',
			quantity: '',
			shipperCustid: '',
			oQuery: this.$route.query,
			hscodeOptions: [], // hscode下拉数据
			shipperCustidOptions: [], // 发货单位下拉数据
			commodityTypeCodeOptions: [], // 货品分类下拉数据
			dangerousCodeOptions: [] // 国家危险品编码下拉数据
		}
	},
	props: {
		index: {
			type: Number,
			default: 0
		},
		item: {
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
		this.queryCargoTypeList()
		this.fillCustid(this.createItem.cargoList)
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.railway.ordDetRole
		}),
		isWoodenPackageState() {
			// 美国，加拿大，澳洲航线显示木质包装选项
			return ['US', 'CA', 'AU'].includes(this.countryCode)
		},
		viewState() {
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
		},
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			// bd 审核通过的同op一样的视角
			if (this.ordDetRole === 'bd' && this.orderStatus === 'pass') {
				return true
			}
			// op,doc,ac一样的视角
			if (this.ordDetRole === 'op' || this.ordDetRole === 'doc' || this.ordDetRole === 'ac' || this.ordDetRole === 'op_truck') {
				return true
			}
			return false
		},
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		isBd() {
			return !this.roles.includes('pricing') && (this.roles.includes('bd') || this.roles.includes('obd') || this.roles.includes('asst'))
		}
	},
	watch: {
		'createItem.cargoList': {
			handler(newVal) {
				if (newVal) {
					this.fillCustid(newVal)
				}
			},
			deep: true
		},
		createItem: {
			handler(newVal) {
				if (newVal) {					
					clearTimeout(this.timer)
					this.timer = setTimeout(() => {
						this.$emit('setForm', newVal, this.index)
					}, 500)
				}
			},
			deep: true
		}
	},
	components: {},
	methods: {
		debounce(func, wait) {
			let timer
			return function() {
				let context = this // 注意 this 指向
				let args = arguments // arguments中存着e

				if (timer) clearTimeout(timer)

				timer = setTimeout(() => {
					func.apply(this, args)
				}, wait)
			}
		},
		// 发货单位回显
		fillCustid(cargoList) {
			cargoList.map(item => {
				if (item.shipperCustid === 0) item.shipperCustid = ''
				item.shipperCustid && this.shipperCustidOptions.push({ value: item.shipperCustid, label: item.shipperCustName })
			})
			// 去重
			this.shipperCustidOptions = new Set(this.shipperCustidOptions)
			this.shipperCustidOptions = Array.from(this.shipperCustidOptions)
		},
		// 增加一行货物信息
		handleAddCargo() {
			this.createItem.cargoList.push({
				boxRemark: '无'
			})
		},

		// 获取焦点清除默认的无
		handleClear(o) {
			if (o.boxRemark === '无') o.boxRemark = ''
		},
		// 移除焦点未填写装箱特殊要求默认设置为无
		handleBlur(o) {
			o.boxRemark = o.boxRemark || '无'
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

		custFilterMehod(val) {
			this.getCustList(val)
		},
		custVisibleChange(val) {
			if (val) {
				this.getCustList()
			}
		},
		handleSelectCustid() {},
		// 获取委托单位
		getCustList(val = '') {
			this.$store.dispatch('dict/queryCustomerList', val).then(data => {
				let list = data.list
				this.shipperCustidOptions = list.map(o => {
					return {
						value: o.custid ? Number(o.custid) : '',
						label: this.$language == 'en' ? o.ename : o.name
					}
				})
			})
		}
	}
}
</script>

<style lang="scss">
.railway-send-unit {
	display: flex;
	align-items: center;
	height: 24px;
	margin-top: 10px;
	.el-form-item__label:before {
		margin-right: 0 !important;
	}
	.flex-item.send-unit {
		width: 37.5% !important;
	}
}
.railway-row-flex {
	margin-top: 0 !important;
	.el-form-item {
		height: 20px !important;
	}
}
.railway-row-flex,
.railway-send-unit {
	.btn-minus-search,
	.btn-plus-search {
		margin-top: 2px !important;
	}
	.flex-item {
		width: 19% !important;
		display: flex;
		height: 20px;
		.el-form-item__label,
		.item-label {
			width: 70px;
			padding-right: 4px;
			line-height: 20px;
			height: 20px;
		}
		.item-label .lab {
			display: block;
			width: 100%;
			text-align: right;
		}
		.el-form-item__content,
		.item-content {
			flex: 1;
			line-height: 20px;
			height: 20px;
		}
		&.cname {
			.el-form-item__label,
			.item-label {
				width: 60px;
			}
		}
		&.hscode {
			.el-form-item__label,
			.item-label {
				width: 70px;
			}
		}
	}
}
</style>
