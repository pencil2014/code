<template>
	<div class="row-flex ml10">
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">箱号</span>
			</div>
			<el-autocomplete
				style="width: 100%"
				size="mini"
				clearable
				v-model="createItem.blLclDto.cn"
				:fetch-suggestions="(queryString, cb) => querySearchCn(queryString, cb)"
				placeholder="请输入"
				:disabled="disabledState"
				@blur="handleBlur('cn')"
				@select="value => handleSelectCn(value)"
				@clear="value => handleClearCn(value)"
			></el-autocomplete>
			<!-- <el-select size="mini" v-model="createItem.blLclDto.cn" style="width: 100%" clearable placeholder="请选择" @change="handleChangeCn">
				<el-option v-for="(item, index) in cnList" :key="index" :label="item.cn" :value="item.cn"> </el-option>
			</el-select> -->
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">封号</span>
			</div>
			<el-autocomplete
				style="width: 100%"
				size="mini"
				clearable
				v-model="createItem.blLclDto.sn"
				:fetch-suggestions="(queryString, cb) => querySearchSn(queryString, cb)"
				placeholder="请输入"
				:disabled="disabledState"
				@blur="handleBlur('sn')"
				@select="value => handleSelectSn(value)"
				@clear="value => handleClearSn(value)"
			></el-autocomplete>
			<!-- <el-select size="mini" v-model="createItem.blLclDto.sn" style="width: 100%" clearable placeholder="请选择" @change="handleChangeSn">
				<el-option v-for="(item, index) in cnList" :key="index" :label="item.sn" :value="item.sn"> </el-option>
			</el-select> -->
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">入舱单号</span>
			</div>
			<el-input size="mini" clearable placeholder="请输入" v-model="createItem.blLclDto.whNo" :disabled="disabledState"></el-input>
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">箱型</span>
			</div>
			<el-select size="mini" v-model="createItem.blLclDto.containerType" filterable style="width: 100%" clearable placeholder="请选择" :disabled="disabledState">
				<el-option v-for="(item, index) in dictMap.containerTypeShiporder" :key="index" :label="item.label" :value="item.value"> </el-option>
			</el-select>
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">件数</span>
			</div>
			<el-input size="mini" clearable placeholder="请输入" v-model="createItem.blLclDto.quantity" :disabled="disabledState" @blur="validQuantity"></el-input>
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">毛重</span>
			</div>
			<el-input size="mini" clearable placeholder="请输入" v-model="createItem.blLclDto.weight" :disabled="disabledState" @blur="validateVolumeWeight('weight')"></el-input>
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">体积</span>
			</div>
			<el-input size="mini" clearable placeholder="请输入" v-model="createItem.blLclDto.volume" :disabled="disabledState" @blur="validateVolumeWeight('volume')"></el-input>
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">包装</span>
			</div>
			<el-select size="mini" v-model="createItem.blLclDto.packageType" style="width: 100%" clearable placeholder="请选择" filterable :disabled="disabledState">
				<el-option v-for="item in dictMap.packageType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
			</el-select>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	data() {
		return {
			
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		cnList: {
			type: Array,
			default: () => ([])
		},
		orderStatus: {
			type: String,
			default: ''
		}
	},
	created() {
	},

	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles
		}),
		disabledState() {
			if (['cancel', 'complete'].includes(this.orderStatus) || this.createItem.canEdit === 'n') {
				return true
			}
			if (this.userEditRoles.includes('obd') || this.userEditRoles.includes('asst') || this.userEditRoles.includes('doc')) {
				return false
			}
			return this.ordDetRole === 'bd' || this.ordDetRole === 'op' || this.ordDetRole === 'op_truck' || this.ordDetRole === 'ac'
			// return this.isOp || this.isView
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
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		isView() {
			// if (this.oQuery.action === 'view') {
			//   return true
			// }
			if (this.isBd && this.orderStatus !== 'draft') {
				return true
			}
			if (this.isOp && !['pass'].includes(this.orderStatus)) {
				return true
			}
			return false
		},
	},
	watch: {
	},
	components: {},
	methods: {
		//输入件数大于9999999时候 重新赋值为9999999
		validQuantity() {
			const intReg= /^\d+(?=\.{0,1}\d+$|$)/
			if (this.createItem.blLclDto.quantity && !intReg.test(this.createItem.blLclDto.quantity)) {
				this.createItem.blLclDto.quantity = ''
				return this.$message.error('请输入正确的件数')
			}
			if (this.createItem.blLclDto.quantity > 9999999) {
				this.$message.error('最大不能超过9999999!')
				this.createItem.blLclDto.quantity = 9999999
			}
		},
		validateVolumeWeight(val) {
			// 体积重量保存为小数点后3位
			const pReg = /^\d+(\.\d+)?$/
			if (!this.createItem.blLclDto[val]) return
			if (typeof(this.createItem.blLclDto[val]) === 'string') {
				let pointIndex = this.createItem.blLclDto[val].indexOf('.')
				if (pointIndex !== -1) {
					this.createItem.blLclDto[val] = this.createItem.blLclDto[val].substring(0, pointIndex + 4)
				}
			}
			this.createItem.blLclDto[val] = Number(this.createItem.blLclDto[val])
			if (!pReg.test(this.createItem.blLclDto[val])) {
				this.createItem.blLclDto[val] = ''
				let message = ''
				switch (val) {
					case 'volume':
						message = '体积'
						break
					case 'weight':
						message = '重量'
						break
				}
				return this.$message.error('请输入正确的' + message)
			}
			if (this.createItem.blLclDto[val] > 999999) {
				this.createItem.blLclDto[val] = 999999
				this.$message.error('最大不能超过999999!')
			}
		},
		handleBlur(val) {
			this.createItem.blLclDto[val] = this.createItem.blLclDto[val].substring(32, 0)
		},
		querySearchCn(queryString, cb) {
			var cnList = this.cnList.map(item => {
				return {...item, value: item.cn}
			})
			var results = queryString ? cnList.filter(this.createFilter(queryString, 'cn')) : cnList
			// 调用 callback 返回建议列表的数据
			cb(results);
		},
		querySearchSn(queryString, cb) {
			var cnList = this.cnList.map(item => {
				return {...item, value: item.sn}
			})
			console.log(cnList)
			var results = queryString ? cnList.filter(this.createFilter(queryString, 'sn')) : cnList
			// 调用 callback 返回建议列表的数据
			cb(results);
		},
		createFilter(queryString, i) {
			return (item) => {
				return (item[i].toLowerCase().indexOf(queryString.toLowerCase()) !== -1)
			}
		},
		handleSelectCn() {
		},
		handleClearCn() {
		},
		handleSelectSn() {
		},
		handleClearSn() {
		},
		handleChangeCn(val) {
			// let findItem = this.cnList.find(item => item.cn === val)
			// this.createItem.blLclDto.sn = findItem ? findItem.sn : ''
		},
		handleChangeSn(val) {
			// let findItem = this.cnList.find(item => item.sn === val)
			// this.createItem.blLclDto.cn = findItem ? findItem.cn : ''
		}
	}
}
</script>

<style lang="scss">

</style>
