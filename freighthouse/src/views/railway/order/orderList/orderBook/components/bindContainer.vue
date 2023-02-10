<template>
	<div class="">
		<div class="mb10 between h28 mt10 table-com-layout">
			<div class="ft14">
				<span class="mr20">集装箱信息</span>
				<span class="ft12" v-if="containerTotal.show">箱量：{{ containerTotal.container }} 货量： 件数{{ containerTotal.quantity }} 毛重{{ containerTotal.weight }} KGS 体积{{ containerTotal.volume }} CBM</span>
			</div>
			<div class="el-button-group" v-if="!isBd">
				<el-button size="mini" type="primary" style="margin-right: 5px;" @click="handleBatchCancelBind" :disabled="isBd || isDraftConfirm === 'y' || !multipleSelection.length">批量取消关联</el-button>
				<el-button :disabled="isDraftConfirm === 'y'" size="mini" type="primary" class="ml10" @click="handleSelectContainer">选择集装箱</el-button>
			</div>
		</div>
		<el-table ref="table" fit highlight-current-row style="width: 100%" :data="bindContainerList" @selection-change="handleSelectionChange">
			<el-table-column
				type="selection"
				:fixed="true"
				width="55">
			</el-table-column>
			<el-table-column prop="containerType" label="箱型" align="center"></el-table-column>
			<el-table-column prop="cn" label="箱号" align="center"></el-table-column>
			<el-table-column prop="sn" label="封号" align="center"> </el-table-column>
			<el-table-column prop="quantity" label="件数" align="center">
				<template slot-scope="scope">
					<el-input :disabled="isDraftConfirm === 'y'" @blur="validateQuantityNum(scope.row)" v-model="scope.row.quantity" size="mini" placeholder="请输入"></el-input>
				</template>
			</el-table-column>
			<el-table-column prop="weight" label="毛重" align="center">
				<template slot-scope="scope">
					<el-input :disabled="isDraftConfirm === 'y'" @blur="validateWeight(scope.row)" v-model="scope.row.weight" size="mini" placeholder="请输入">
						<template slot="append">KGS</template>
					</el-input>
				</template>
			</el-table-column>
			<el-table-column prop="volume" label="体积" align="center">
				<template slot-scope="scope">
					<el-input :disabled="isDraftConfirm === 'y'" @blur="validateVolume(scope.row)" v-model="scope.row.volume" size="mini" placeholder="请输入">
						<template slot="append">CBM</template>
					</el-input>
				</template>
			</el-table-column>
			<el-table-column prop="packageInfo" label="包装" align="center">
				<template slot-scope="scope">
					<el-select :disabled="isDraftConfirm === 'y'" v-model="scope.row.packageInfo" size="mini" filterable>
						<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="150" align="center" fixed="right">
				<template slot-scope="scope">
					<div class="operate-group">
						<el-button @click="handleCancelBind(scope.row)" type="text" size="mini" :disabled="isBd || isDraftConfirm === 'y'">取消关联</el-button>
					</div>
				</template>
			</el-table-column>
		</el-table>
		<!-- 选择集装箱弹窗 -->
		<div v-if="containersShow">
			<Containers :containerList="containerData" :serviceType="serviceType" :selectContainerList="selectContainerList" :bindContainerList="bindContainerList" @close="containersPopClose" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import Containers from '../../components/railContainers'

export default {
	data() {
		return {
			oQuery: this.$route.query,
			containersShow: false,
			packageTypeOptions: [],
			multipleSelection: [],
		}
	},
	props: {
		isDraftConfirm: {
			type: String,
			default: ''
		},
		containerData: {
			type: Array,
			default: () => []
		},
		selectContainerList: {
			type: Array,
			default: () => []
		},
		bindContainerList: {
			type: Array,
			default: () => []
		},
		containerTotal: {
			type: Object,
			default: () => ({})
		},
		serviceType: {
			type: String,
			default: ''
		}
	},
	created() {},
	mounted() {
		console.log('🚀 ~ this.dictMap.packageType', this.dictMap.packageType)
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.roles.includes('op')
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		}
	},
	components: {
		Containers
	},
	watch: {},
	methods: {
		validateQuantityNum(item) {
			const intReg = /^[0-9]\d*$/
			if (item.quantity && !intReg.test(item.quantity)) {
				item.quantity = ''
				return this.$message.warning('请输入正确的件数')
			}
			if (item.quantity > 9999999) {
				item.quantity = 9999999
				this.$message.warning('最大不能超过9999999')
			}
		},
		validateWeight(item) {
			const reg = /^\d+(\.\d{0,3})?$/
			if (!reg.test(item.weight) && item.weight) {
				item.weight = ''
				return this.$message.warning('请输入正确的毛重,最多包含三位小数')
			}
			if (item.weight > 999999) {
				item.weight = 999999
				this.$message.warning('最大不能超过999999')
			}
		},
		validateVolume(item) {
			const reg = /^\d+(\.\d{0,3})?$/
			if (!reg.test(item.volume) && item.volume) {
				item.volume = ''
				return this.$message.warning('请输入正确的体积,最多包含三位小数')
			}
			if (item.volume > 999999) {
				item.volume = 999999
				this.$message.warning('最大不能超过999999')
			}
		},
		// 打开选择集装箱弹窗
		handleSelectContainer() {
			this.containersShow = true
		},

		// 选择集装箱弹窗关闭回调
		containersPopClose(action, value) {
			console.log('🚀 ~ value', value)

			if (action === 'Confirm') {
				this.$emit('bind', value)
			}
			this.containersShow = false
		},

		// 取消关联集装箱
		handleCancelBind(row) {
			this.$emit('cancelBind', [row.containerId])
		},
		handleBatchCancelBind() {
			// 批量取消关联
			let containerIdList = this.multipleSelection.map(item => {
				return item.containerId
			})
			this.$emit('cancelBind', containerIdList)
		},
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log(this.multipleSelection)
		}
	}
}
</script>
<style lang="scss"></style>
