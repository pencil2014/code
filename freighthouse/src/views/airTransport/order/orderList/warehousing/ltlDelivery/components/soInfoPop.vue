<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<div class="soInfo-pop-container">
			<el-table fit highlight-current-row style="width: 100%" :data="soList" class="table-cont" @current-change="clickRow" :span-method="objectSpanMethod">
				<el-table-column align="center" label="" width="50">
					<template slot-scope="scope">
						<el-radio v-model="selectSo" :label="scope.row">
							<span></span>
						</el-radio>
					</template>
				</el-table-column>
				<el-table-column prop="loadContact" label="装货人" align="center" width="100" show-overflow-tooltip></el-table-column>
				<el-table-column prop="loadContactPhone" label="装货人电话" align="center" width="150" show-overflow-tooltip></el-table-column>
				<el-table-column prop="loadPlace" label="装货地点(到州)" align="center" width="180" show-overflow-tooltip>
					<template slot-scope="{ row }"> {{ row.loadPlace | mapPlace }}</template>
				</el-table-column>
				<el-table-column prop="loadAddress" label="装货详细地址" align="center" width="200" show-overflow-tooltip></el-table-column>
				<el-table-column prop="unloadPlace" label="卸货地点(到州)" align="center" width="180" show-overflow-tooltip>
					<template slot-scope="{ row }"> {{ row.unloadPlace | mapPlace }}</template>
				</el-table-column>
				<el-table-column prop="unloadAddress" label="卸货详细地址" align="center" width="200" show-overflow-tooltip></el-table-column>
				<el-table-column prop="consignee" label="收货人" align="center" width="100" show-overflow-tooltip></el-table-column>
				<el-table-column prop="consigneePhone" label="收货人电话" align="center" width="150" show-overflow-tooltip></el-table-column>
				<el-table-column prop="consigneeEmail" label="收货人邮箱" align="center" width="150" show-overflow-tooltip></el-table-column>
				<el-table-column prop="postCode" label="邮政编码" align="center" width="100" show-overflow-tooltip></el-table-column>
				<el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip></el-table-column>
			</el-table>
		</div>
	</BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { serviceInfoList } from '@/api/order/list'
export default {
	filters: {
		mapPlace(val) {
			if (val && val.length) {
				return JSON.parse(val).join('')
			} else {
				return ''
			}
		}
	},
	data() {
		return {
			dialogConfig: {
				title: '关联委派信息',
				show: true,
				size: 'medium',
				width: '1120px'
			},
			selectSo: {}, // 选中列
			soList: [],
			mergeSpanArr: [],
			pos: 0
		}
	},
	props: {},
	created() {
		this.getServiceInfoList()
	},
	mounted() {},
	computed: {},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		// 储存合并相同的委派信息
		getSpanArr(data) {
			/*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
			this.mergeSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.mergeSpanArr.push(1) //mergeSpanArr是一个空数组，用于存放每一行记录的合并数
					this.pos = 0 //pos是mergeSpanArr的索引
				} else {
					// 判断mergeId当前元素与上一个元素是否相同
					if (data[i].mergeId && data[i - 1].mergeId && data[i].mergeId === data[i - 1].mergeId) {
						this.mergeSpanArr[this.pos] += 1
						this.mergeSpanArr.push(0)
					} else {
						this.mergeSpanArr.push(1)
						this.pos = i
					}
				}
			}
			console.log(this.mergeSpanArr)
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			// 箱号，附件列需合并
			if ([0, 4, 5, 6, 7, 8, 9].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.mergeSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
		},
		// 获取委派信息列表
		getServiceInfoList() {
			serviceInfoList({ orderNo: this.$route.query.orderNo, serviceCode: 'pod_ltl_delivery' }).then(res => {
				this.soList = res.data || []
				// 按委托装柜时间倒序,委托装柜时间一样的按创建时间戳排序
				this.soList.sort((a, b) => {
					return Date.parse(b.preBoxTime) - Date.parse(a.preBoxTime)
				})
				this.getSpanArr(this.soList)
				console.log('this.soList', this.soList)
			})
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		// 当一行被点中时
		clickRow(row) {
			this.selectSo = row
			console.log('this.selectSo', this.selectSo)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				if (Object.keys(this.selectSo).length > 0) {
					this.close('Confirm', this.selectSo)
				} else {
					this.$message.error('请选择委派信息！')
				}
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>

<style>
.soInfo-pop-container .table-cont th {
	height: 24px;
	line-height: 16px;
	padding: 2px 0;
}
.soInfo-pop-container .table-cont td {
	line-height: 16px;
	padding: 2px 0;
}
.soInfo-pop-container .table-cont .cell {
	display: block;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>
