<template>
	<div style="padding-right:10px;" class="row-flex ml10 put-detail-lcl">
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">箱型</span>
			</div>
			<el-select disabled size="mini" v-model="createItem.blLclDto.containerType" filterable style="width: 100%" clearable placeholder="请选择">
				<el-option v-for="(item, index) in dictMap.containerTypeRail" :key="index" :label="item.label" :value="item.value"> </el-option>
			</el-select>
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">箱号</span>
			</div>
			<el-input disabled size="mini" clearable placeholder="请输入" v-model="createItem.blLclDto.cn"></el-input>
			<!-- <el-autocomplete
				style="width: 100%"
				size="mini"
				clearable
				v-model="createItem.blLclDto.cn"
				:fetch-suggestions="(queryString, cb) => querySearchCn(queryString, cb)"
				placeholder="请输入"
				@blur="handleBlur('cn')"
				@select="value => handleSelectCn(value)"
				@clear="value => handleClearCn(value)"
			></el-autocomplete> -->
		</div>

		<div class="flex-item">
			<div class="item-label">
				<span class="lab">件数</span>
			</div>
			<el-input @blur="validateQuantityNum(createItem.blLclDto)" disabled size="mini" clearable placeholder="请输入" v-model="createItem.blLclDto.quantity"></el-input>
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">毛重</span>
			</div>
			<el-input @blur="validateWeight(createItem.blLclDto)" disabled size="mini" clearable placeholder="请输入" v-model="createItem.blLclDto.weight"></el-input>
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">体积</span>
			</div>
			<el-input @blur="validateVolume(createItem.blLclDto)" disabled size="mini" clearable placeholder="请输入" v-model="createItem.blLclDto.volume"></el-input>
		</div>
		<div style="padding-right:0;" class="flex-item">
			<div class="item-label">
				<span class="lab">包装</span>
			</div>
			<el-select size="mini" v-model="createItem.blLclDto.packageInfo" style="width: 100%" clearable placeholder="请选择" disabled filterable>
				<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"> </el-option>
			</el-select>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	data() {
		return {}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		cnList: {
			type: Array,
			default: () => []
		}
	},
	created() {
		console.log('🚀 ~ this.createItem', this.createItem)
	},

	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			roles: state => state.user.roles
		}),
		disabledState() {
			return this.isOp || this.isView
		},

		isOp() {
			return this.roles.includes('op')
		},
		isBd() {
			return !this.roles.includes('pricing') && (this.roles.includes('bd') || this.roles.includes('obd'))
		},
		isView() {
			if (this.isBd && this.orderStatus !== 'draft') {
				return true
			}
			if (this.isOp && !['pass'].includes(this.orderStatus)) {
				return true
			}
			return false
		}
	},
	watch: {},
	components: {},
	methods: {
		validateVolume(item) {
			const intReg = /^[0-9]+(\.\d{0,4})?$/
			if (item.volume && !intReg.test(item.volume)) {
				item.volume = ''
				return this.$message.error('请输入正确的体积,最多四位小数')
			}
			if (item.volume > 100) {
				item.volume = 100
				this.$message.error('最大不能超过100')
			}
		},
		validateWeight(item) {
			const intReg = /^[0-9]+(\.\d{0,4})?$/
			if (item.weight && !intReg.test(item.weight)) {
				item.weight = ''
				return this.$message.error('请输入正确的重量,最多四位小数')
			}
			if (item.weight > 53000) {
				item.weight = 53000
				this.$message.error('最大不能超过53000')
			}
		},
		validateQuantityNum(item) {
			const intReg = /^[0-9]\d*$/
			if (item.quantity && !intReg.test(item.quantity)) {
				item.quantity = ''
				return this.$message.error('请输入正确的件数,只能输入正整数')
			}
			if (item.quantity > 9999999) {
				item.quantity = 9999999
				this.$message.error('最大不能超过9999999')
			}
		},
		handleBlur(val) {
			this.createItem.blLclDto[val] = this.createItem.blLclDto[val].substring(32, 0)
		},
		querySearchCn(queryString, cb) {
			var cnList = this.cnList.map(item => {
				return { ...item, value: item.cn }
			})
			var results = queryString ? cnList.filter(this.createFilter(queryString, 'cn')) : cnList
			// 调用 callback 返回建议列表的数据
			cb(results)
		},
		querySearchSn(queryString, cb) {
			var cnList = this.cnList.map(item => {
				return { ...item, value: item.sn }
			})
			console.log(cnList)
			var results = queryString ? cnList.filter(this.createFilter(queryString, 'sn')) : cnList
			// 调用 callback 返回建议列表的数据
			cb(results)
		},
		createFilter(queryString, i) {
			return item => {
				return item[i].toLowerCase().indexOf(queryString.toLowerCase()) !== -1
			}
		},
		handleSelectCn() {},
		handleClearCn() {},
		handleSelectSn() {},
		handleClearSn() {},
		handleChangeCn(val) {},
		handleChangeSn(val) {}
	}
}
</script>

<style lang="scss">
.put-detail-lcl {
	display: flex;
	flex-wrap: wrap;
	.flex-item {
		margin-top: 10px;
		flex: 0 0 16.6%;
		padding-left: 10px;
	}
}
</style>
