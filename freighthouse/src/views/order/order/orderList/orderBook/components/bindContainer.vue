<template>
	<div class="">
		<div class="mb10 between h20 mt10 table-com-layout">
			<div class="ft14">
				<span class="mr20">集装箱信息</span>
				<span class="ft12" v-if="containerTotal.show">箱量：{{ containerTotal.container }} 货量： 件数{{ containerTotal.quantity || 0 }} 毛重{{ containerTotal.weight || 0  }} KGS 体积{{ containerTotal.volume || 0  }} CBM</span>
			</div>
			<div class="el-button-group">
				<el-button size="mini" type="primary" style="margin-right: 5px;" @click="handleBatchCancelBind" :disabled="disabledState || !multipleSelection.length">批量取消关联</el-button>
				<el-button size="mini" type="primary" class="ml10" @click="handleSelectContainer" :disabled="disabledState">选择集装箱</el-button>
			</div>
		</div>
		<el-table ref="table" fit border highlight-current-row style="width: 100%" :data="bindContainerList"  @selection-change="handleSelectionChange">
			<el-table-column
				type="selection"
				:fixed="true"
				width="55">
			</el-table-column>
			<el-table-column label="序号" align="center" type="index" width="46" :fixed="true"></el-table-column>
			<el-table-column label="已核对" align="center" width="60" :fixed="true">
				<template slot-scope="scope">
					<el-checkbox v-model="scope.row.itemIsCheck" size="mini" @change="toggleCheck(scope.row)"></el-checkbox>
				</template>
			</el-table-column>
			<el-table-column prop="containerType" label="箱型" align="center"  width="80"></el-table-column>
			<el-table-column prop="so" label="SO号" align="center" min-width="150"></el-table-column>
			<el-table-column prop="cn" label="箱号" align="center" min-width="150">
				<template slot-scope="scope">
          <el-input v-model="scope.row.cn" size="mini" placeholder="请输入箱号" clearable :disabled="disabledState"></el-input>
        </template>
			</el-table-column>
			<el-table-column prop="sn" label="封号" align="center" min-width="150">
				<template slot-scope="scope">
          <el-input v-model="scope.row.sn" size="mini" placeholder="请输入封号" clearable :disabled="disabledState"></el-input>
        </template>
			</el-table-column>
			<el-table-column prop="quantity" label="件数" align="center" width="150">
				<template slot-scope="scope">
					<el-input @blur="validateQuantity('quantity', scope.row)" v-model="scope.row.quantity" size="mini" placeholder="请输入" :disabled="disabledState"></el-input>
				</template>
			</el-table-column>
			<el-table-column prop="weight" label="毛重" align="center" width="150">
				<template slot-scope="scope">
					<el-input @blur="validateVolumeWeight('weight', scope.row)" v-model="scope.row.weight" size="mini" placeholder="请输入" :disabled="disabledState">
						<template slot="append">KGS</template>
					</el-input>
				</template>
			</el-table-column>
			<el-table-column prop="volume" label="体积" align="center" width="150">
				<template slot-scope="scope">
					<el-input @blur="validateVolumeWeight('volume', scope.row)" v-model="scope.row.volume" size="mini" placeholder="请输入" :disabled="disabledState">
						<template slot="append">CBM</template>
					</el-input>
				</template>
			</el-table-column>
			<el-table-column prop="packageType" label="包装" align="center" width="150">
				<template slot-scope="scope">
					<el-select v-model="scope.row.packageType" size="mini" filterable :disabled="disabledState">
						<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="100" align="center" fixed="right">
				<template slot-scope="scope">
					<div class="operate-group">
						<el-button @click="handleCancelBind(scope.row)" type="text" size="mini" :disabled="disabledState">取消关联</el-button>
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
import { blContainerCheck } from '@/api/order/bl'

export default {
	mixins: [quantityMixin],
	data() {
		return {
			oQuery: this.$route.query,
			containersShow: false,
			packageTypeOptions: [],
			multipleSelection: [],
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
			if (['cancel', 'complete'].includes(this.orderStatus) || this.createItem.canEdit === 'n') {
				return true
			} else if (['st26','st27','st28'].includes(this.serviceType)){
				if(this.ordDetRole === 'op_truck'){
					return false
				}else{
					return true
				}
			}
			if (this.userEditRoles.includes('obd') || this.userEditRoles.includes('asst') || this.userEditRoles.includes('doc')) {
				return false
			}
			
			return this.ordDetRole === 'bd' || this.ordDetRole === 'op' || this.ordDetRole === 'op_truck' || this.ordDetRole === 'ac'
		},
	},
	components: {
		Containers
	},
	watch: {},
	methods: {
		toggleCheck(row) {
			row.isCheck = row.itemIsCheck ? 'Y' : 'N'
			blContainerCheck({
				oid: row.oid,
				isCheck: row.isCheck
			}).then(res => {
			}).catch(err => {
			})
		},
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
<style lang="scss">
.ml10 {
	margin-left: 10px;
}
</style>
