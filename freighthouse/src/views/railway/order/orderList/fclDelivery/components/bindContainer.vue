<template>
	<div class="">
		<div class="mb10 between h28 mt10">
			<div class="ft12">
				<span class="mr20 bold">集装箱信息</span>
			</div>
			<div>
				<el-button @click="handleUploadBatch" size="mini" :disabled="!(isEpricing || isEcs || isBkg) || isDisabledEdit">上传签收信息</el-button>
				<el-button size="mini" type="primary" class="ml10" @click="handleSelectContainer" :disabled="isDisabledEdit || !(isEpricing || isEcs || isBkg)">选择集装箱</el-button>
			</div>
		</div>
		<el-table ref="table" fit highlight-current-row style="width: 100%" @selection-change="handleSelectionChange" :data="bindContainerList">
			<el-table-column type="selection" width="55"> </el-table-column>
			<el-table-column prop="cn" label="箱号" align="center"></el-table-column>
			<el-table-column prop="containerType" label="箱型" align="center"></el-table-column>
			<el-table-column prop="quantity" label="件数" align="center" width="120">
				<template slot-scope="scope">
					<el-input v-model.number="scope.row.quantity" size="mini" placeholder="请输入" clearable :disabled="isDisabledEdit" @blur="validateNum('quantity', scope.row)"></el-input>
				</template>
			</el-table-column>
			<el-table-column prop="weight" label="毛重(KGS)" align="center" width="120">
				<template slot-scope="scope">
					<el-input v-model="scope.row.weight" size="mini" placeholder="请输入" clearable :disabled="isDisabledEdit" @blur="validateVolumeWeight('weight', scope.row)"></el-input>
				</template>
			</el-table-column>
			<el-table-column prop="volume" label="体积(CBM)" align="center" width="120">
				<template slot-scope="scope">
					<el-input v-model="scope.row.volume" size="mini" placeholder="请输入" clearable :disabled="isDisabledEdit" @blur="validateVolumeWeight('volume', scope.row)"></el-input>
				</template>
			</el-table-column>
			<el-table-column prop="packageType" label="包装" align="center" width="120">
				<template slot-scope="scope">
					<el-select v-model="scope.row.packageType" size="mini" clearable :disabled="isDisabledEdit" filterable>
						<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</template>
			</el-table-column>
			<el-table-column prop="driverName" label="司机" align="center" width="120">
				<template slot-scope="scope">
					<el-input v-model="scope.row.driverName" size="mini" placeholder="请输入" clearable> </el-input>
				</template>
			</el-table-column>
			<el-table-column prop="driverPhone" label="司机电话" align="center" width="150">
				<template slot-scope="scope">
					<el-input v-model="scope.row.driverPhone" size="mini" placeholder="请输入" clearable> </el-input>
				</template>
			</el-table-column>
			<el-table-column prop="licensePlate" label="车牌号" align="center" width="150">
				<template slot-scope="scope">
					<el-input v-model="scope.row.licensePlate" size="mini" placeholder="请输入" clearable> </el-input>
				</template>
			</el-table-column>
			<el-table-column prop="volume" label="签收信息" align="center" width="240">
				<template slot-scope="scope">
					<div class="operate-group">
						<el-button type="text" size="mini" @click="handleViewFile(scope.row)" v-if="scope.row.signFileName" class="file-name">{{ scope.row.signFileName }}</el-button>
					</div>
				</template>
			</el-table-column>
			<el-table-column prop="signTime" label="签收时间" align="center" width="150"></el-table-column>
			<el-table-column label="操作" width="150" align="center" fixed="right">
				<template slot-scope="scope">
					<div class="operate-group">
						<el-button @click="handleUpload(scope.row, scope.$index)" type="text" size="mini" :disabled="!(isEpricing || isEcs || isBkg) || isDisabledEdit" v-if="!scope.row.signFileNo">上传签收信息</el-button>
						<el-button @click="handleDeleteFile(scope.row, scope.$index)" type="text" size="mini" :disabled="!(isEpricing || isEcs || isBkg) || isDisabledEdit" v-if="scope.row.signFileNo">删除签收信息</el-button>
						<el-button @click="handleCancelBind(scope.$index)" type="text" size="mini" :disabled="!(isEpricing || isEcs || isBkg) || isDisabledEdit">删除</el-button>
					</div>
				</template>
			</el-table-column>
		</el-table>
		<!-- 选择集装箱弹窗 -->
		<div v-if="selectContainersShow">
			<SelectContainer :bindContainerList="bindContainerList" @close="SelectContainersPopClose" />
		</div>
		<div v-if="fclUploadShow">
			<FclUpload :param="param" @close="fclUploadPopClose" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { quantityMixin } from '@/views/order/order/mixins/quantityMixin'
import SelectContainer from './selectContainer'
import FclUpload from './fclUpload'
import { fclFileDelete } from '@/api/order/podService/fclDelivery'

export default {
	mixins: [quantityMixin],
	data() {
		return {
			multipleSelection: [],
			oQuery: this.$route.query,
			selectContainersShow: false,
			fclUploadShow: false,
			param: {}
		}
	},
	props: {
		isDisabledEdit: {
			type: Boolean,
			default: false
		},
		bindContainerList: {
			type: Array,
			default: () => []
		},
		createItem: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		console.log(this.createItem.status)
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.railway.ordDetRole,
			orderInfoDataObj: state => state.railway.orderInfoDataObj
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		}
	},
	components: {
		SelectContainer,
		FclUpload
	},
	watch: {},
	methods: {
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log('🚀 ~ this.multipleSelection', this.multipleSelection)
		},
		// 批量上传
		handleUploadBatch(row, index) {
			if (this.multipleSelection.length === 0) return this.$message.warning('请先选择集装箱')
			let containerIds = this.multipleSelection.map(item => item.containerId)
			console.log(row)
			Object.assign(this.param, {
				loadId: this.createItem.loadId,
				intrustNo: this.createItem.intrustNo,
				containerId: null,
				containerIds,
				signTime: ''
			})
			this.fclUploadShow = true
		},
		// 打开选择集装箱弹窗
		handleSelectContainer() {
			this.selectContainersShow = true
		},
		// 选择集装箱弹窗关闭回调
		SelectContainersPopClose(action, value) {
			if (action === 'Confirm') {
				this.$emit('bind', value)
			}
			this.selectContainersShow = false
		},
		// 取消关联集装箱
		handleCancelBind(rowIndex) {
			this.$emit('cancelBind', rowIndex)
		},
		handleUpload(row, index) {
			console.log(row)
			Object.assign(this.param, {
				loadId: this.createItem.loadId,
				intrustNo: this.createItem.intrustNo,
				containerId: row.containerId,
				containerIds: null,
				signTime: row.signTime || ''
			}),
				(this.fclUploadShow = true)
		},
		handleDeleteFile(row, index) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						intrustNo: this.createItem.intrustNo,
						containerId: row.containerId,
						loadId: this.createItem.loadId,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo
					}
					return fclFileDelete(data)
				})
				.then(response => {
					this.$message({
						message: '删除成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.$emit('importFile', this.createItem.loadId)
						}
					})
				})
				.catch(() => {})
		},
		fclUploadPopClose(action) {
			this.fclUploadShow = false
			if (action === 'Confirm') {
				this.$emit('importFile', this.createItem.loadId)
			}
		},
		handleViewFile(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.signFileNo, fileName: row.signFileName })
		}
	}
}
</script>
<style lang="scss">
.operate-group {
	.file-name {
		padding: 2px;
		span {
			display: inline-block;
			max-width: 240px;
			line-height: 16px;
			height: 16px;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
}
</style>
