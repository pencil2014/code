<template>
	<div class="">
		<div style="padding-left:10px;" class="mb10 between h20 mt10 table-com-layout">
			<div class="ft14">
				<span style="font-weight:700;" class="mr20">集装箱信息</span>
				<span class="ft12" v-if="containerTotal.show">箱量：{{ containerTotal.container }} 货量： 件数{{ containerTotal.quantity || 0 }} 毛重{{ containerTotal.weight || 0  }} KGS 体积{{ containerTotal.volume || 0  }} CBM</span>
			</div>
			<div class="el-button-group">
				<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSelectContainer" :disabled="disabledState">选择集装箱</el-button> -->
			</div>
		</div>
		<el-table ref="table" fit highlight-current-row style="width: 100%" :data="bindContainerList">
			<el-table-column prop="containerType" label="箱型" align="center"></el-table-column>
			<el-table-column prop="so" label="SO号" align="center"></el-table-column>
			<el-table-column prop="cn" label="箱号" align="center"></el-table-column>
			<el-table-column prop="sn" label="封号" align="center">
				<!-- <template slot-scope="scope">
          <el-input v-model="scope.row.sn" size="mini" placeholder="请输入封号"></el-input>
        </template> -->
			</el-table-column>
			<el-table-column prop="quantity" label="件数" align="center">
				<template slot-scope="scope">
					<el-input @blur="validateQuantity('quantity', scope.row)" v-model.number="scope.row.quantity" size="mini" placeholder="请输入" :disabled="disabledState"></el-input>
				</template>
			</el-table-column>
			<el-table-column prop="weight" label="毛重" align="center">
				<template slot-scope="scope">
					<el-input @blur="validateVolumeWeight('weight', scope.row)" v-model="scope.row.weight" size="mini" placeholder="请输入" :disabled="disabledState">
						<template slot="append">KGS</template>
					</el-input>
				</template>
			</el-table-column>
			<el-table-column prop="volume" label="体积" align="center">
				<template slot-scope="scope">
					<el-input @blur="validateVolumeWeight('volume', scope.row)" v-model="scope.row.volume" size="mini" placeholder="请输入" :disabled="disabledState">
						<template slot="append">CBM</template>
					</el-input>
				</template>
			</el-table-column>
			<el-table-column prop="packageType" label="包装" align="center">
				<template slot-scope="scope">
					<el-select v-model="scope.row.packageType" size="mini" filterable :disabled="disabledState">
						<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="150" align="center" fixed="right">
				<template slot-scope="scope">
					<div class="operate-group">
						<el-button @click="handleCancelBind(scope.$index)" type="text" size="mini" :disabled="disabledState">取消关联</el-button>
					</div>
				</template>
			</el-table-column>
		</el-table>
		<!-- 选择集装箱弹窗 -->
		<div v-if="containersShow">
			<Containers :serviceType="serviceType" :selectContainerList="selectContainerList" :bindContainerList="bindContainerList" @close="containersPopClose" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import {quantityMixin} from '@/views/order/order/mixins/quantityMixin'
import Containers from '../../components/containers'

export default {
	mixins: [quantityMixin],
	data() {
		return {
			oQuery: this.$route.query,
			containersShow: false,
			packageTypeOptions: []
		}
	},
	props: {
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
		},
		createItem: {
			type: Object,
			default: () => ({})
		},
		orderStatus: {
			type: String,
			default: ''
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles,
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
			// 放开obd,asst权限
			if (this.userEditRoles.includes('obd') || this.userEditRoles.includes('asst') || this.userEditRoles.includes('doc')) {
				return false
			}
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		disabledState() {
			// // 20211125 MBL草单已确认放开编辑
			// if (['cancel', 'complete'].includes(this.orderStatus) || (this.createItem.isDraftConfirm === 'y' && this.createItem.blType === 'hbl')) {
			// 	return true
			// }
			// if (this.userEditRoles.includes('obd') || this.userEditRoles.includes('asst') || this.userEditRoles.includes('doc')) {
			// 	return false
			// }
			// return this.ordDetRole === 'bd' || this.ordDetRole === 'op' || this.ordDetRole === 'op_truck' || this.ordDetRole === 'ac'
			return true
		},
	},
	components: {
		Containers
	},
	watch: {},
	methods: {
		// 打开选择集装箱弹窗
		handleSelectContainer() {
			this.containersShow = true
		},

		// 选择集装箱弹窗关闭回调
		containersPopClose(action, value) {
			
			if (action === 'Confirm') {
				this.$emit('bind', value)
			}
			this.containersShow = false
		},

		// 取消关联集装箱
		handleCancelBind(rowIndex) {
			this.$emit('cancelBind', rowIndex)
		}
	}
}
</script>
<style lang="scss"></style>
