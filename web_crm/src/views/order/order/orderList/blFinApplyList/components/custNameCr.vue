<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<div class="cr-table-cont">
				<div class="h">结算信息</div>
				<el-table key="ship-data" border highlight-current-row style="width: 100%" :data="custTableData" 
					:span-method="objectSpanMethod" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip" class="sopop-table">
					<el-table-column prop="" :label="dialogConfig.title === '委托单位信控信息' ? '委托单位' : '结算单位'" align="center" width="150">
						<template slot-scope="scope">
							{{dialogConfig.title === '委托单位信控信息' ? custQuery.custName : custQuery.custNameObj[scope.row.custid]}}
						</template>
					</el-table-column>
					<el-table-column prop="custClassCn" label="客户类型" align="center" min-width="100"></el-table-column>
					<el-table-column prop="businessTypeCn" label="业务类型" align="center" min-width="150">
						<!-- <template slot-scope="scope">
							<div v-for="(item, index) in scope.row.settleBusinessTypeList" :key="'businessType'+index">{{item.businessType | getDictLabelFilter('businessType')}}</div>
						</template> -->
					</el-table-column>
					<el-table-column prop="" label="结算周期" align="center" width="">
						<template slot-scope="scope">
							{{scope.row.settleCycle | getDictLabelFilter('settleCycle')}}
						</template>
					</el-table-column>
					<el-table-column prop="" label="适用我司分公司" align="center" width="150">
						<template slot-scope="scope">
							<div v-for="(item, index) in scope.row.settleCompanyList" :key="'settleCompanyName'+index" class="item">{{item.companyName}}</div>
						</template>
					</el-table-column>
					<el-table-column prop="" label="客户共享公司" align="center" width="150">
						<template slot-scope="scope">
							<div v-for="(item, index) in scope.row.settleRelCustList" :key="'settleRelCustName'+index" class="item">{{item.relCustName}}</div>
						</template>
					</el-table-column>
					<el-table-column prop="timeType" label="账期起始日类型" align="center" width="130">
						<template slot-scope="scope">
							{{scope.row.timeType | getDictLabelFilter('settleInfoTimeType')}}
						</template>
					</el-table-column>
					<el-table-column prop="billDay" label="账期起始日" align="center" width="120">
						<template slot-scope="scope">
							{{getBillDayValue(scope.row)}}
						</template>
					</el-table-column>
					<el-table-column prop="isRetainContainer" label="是否需要后有柜" align="center" width="120">
						<template slot-scope="scope">
							{{scope.row.isRetainContainer === 'yes' ? '是' : '否'}}
						</template>
					</el-table-column>
					<el-table-column label="账期" align="center" width="300">
						<el-table-column prop="settlementDaysType" label="结款类型" align="center" width="100">
							<template slot-scope="scope">
								{{scope.row.settlementDaysType | getDictLabelFilter('settlementDaysType')}}
							</template>
						</el-table-column>
						<el-table-column prop="settlementDays" label="结款天数" align="center" width="100">
						</el-table-column>
						<el-table-column prop="settleLineList" label="航线" align="center" width="100">
						</el-table-column>
						<el-table-column prop="blModeCn" label="出单方式" align="center" width="100">
						</el-table-column>
					</el-table-column>
				</el-table>
				<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
			</div>
			<div class="cr-table-cont mt20">
				<div class="h">信控信息</div>
				<el-table key="rail-data" border highlight-current-row style="width: 100%" :data="creditTableData" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip" class="sopop-table">
					<el-table-column prop="" :label="dialogConfig.title === '委托单位信控信息' ? '委托单位' : '结算单位'" align="center" width="150">
						<template slot-scope="scope">
							{{dialogConfig.title === '委托单位信控信息' ? custQuery.custName : custQuery.custNameObj[scope.row.custid]}}
						</template>
					</el-table-column>
					<el-table-column prop="custClassCn" label="客户类型" align="center" min-width="100"></el-table-column>
					<el-table-column prop="businessTypeCn" label="业务类型" align="center" min-width="150">
						<!-- <template slot-scope="scope">
							<div v-for="(item, index) in scope.row.creditAccountBusinessList" :key="'businessType'+index">{{item.businessType | getDictLabelFilter('businessType')}}</div>
						</template> -->
					</el-table-column>
					<el-table-column prop="deductionScene" label="使用场景" align="center" width=""> 
						<template slot-scope="scope">
							{{scope.row.deductionScene | getDictLabelFilter('recvPayStatType')}}
						</template>
					</el-table-column>
					<el-table-column prop="" label="适用我司分公司" align="center" width="150">
						<template slot-scope="scope">
							<div v-for="(item, index) in scope.row.creditAccountCompanyList" :key="'companyName'+index" class="item">{{item.companyName}}</div>
						</template>
					</el-table-column>
					<el-table-column prop="" label="客户共享公司" align="center" width="150">
						<template slot-scope="scope">
							<div v-for="(item, index) in scope.row.creditAccountRelCustList" :key="'relCustName'+index" class="item">{{item.relCustName}}</div>
						</template>
					</el-table-column>
					<el-table-column prop="currency" label="币别" align="center"> </el-table-column>
					<el-table-column prop="innerQuota" label="内部额度" align="center" width="120"> </el-table-column>
					<el-table-column prop="creditQuota" label="合同额度" align="center" width="120"></el-table-column>
					<el-table-column prop="innerBalance" label="剩余额度" align="center" width="120"></el-table-column>
				</el-table>
				<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
			</div>
		</BaseDialog>
	</div>
</template>
<script>
import store from '@/store'
import { mapState, mapGetters } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { creditAndSettleInfo } from '@/api/order/bl'
import tableTooltip from '@/components/Base/Table/table-tooltip'
export default {
	filters: {},
	data() {
		return {
			spanArr: [],
			pos: 0,
			custTableData: [],
			creditTableData: [],
			dialogConfig: {
				title: '委托单位信控信息',
				show: true,
				size: 'medium',
				width: '85%',
				btns: [
          // {label: '取消', action: 'Cancel'},
          {label: '关闭', action: 'Confirm', type: 'primary'}
        ]
			},
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			}
		}
	},
	props: {
		custQuery: {
			type: Object,
			default: () => ({})
		},
		title: {
			type: String,
			default: ''
		}
	},
	created() {
		this.dialogConfig.title = this.title
		this.getData()
	},
	mounted() {},
	computed: {
		...mapGetters(['dictMap', 'dictMapObj']),
	},
	components: {
		BaseDialog,
		tableTooltip
	},
	watch: {},
	methods: {
		// 储存合并相同的_oid
		getSpanArr(data) {
			/*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    	*/
			this.spanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.spanArr.push(1)
					this.pos = 0
				} else {
					// 判断当前元素与上一个元素是否相同
					if (data[i]._oid === data[i - 1]._oid) {
						this.spanArr[this.pos] += 1
						this.spanArr.push(0)
					} else {
						this.spanArr.push(1)
						this.pos = i
					}
				}
			}
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			// 除了账期，其他列需合并
			if ([0, 1, 2, 3, 4, 5, 6, 7, 8].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.spanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
		},
		getBillDayValue(row) {
			let cellValue = row.billDay
			const type = this.dictMapObj['settleInfoBillDayType'][
				row['billDayType']
			]
			return type === '等于时间类型'
				? this.dictMapObj['settleInfoTimeType'][row.timeType]
				: ['账单日期', '开票日期'].includes(type)
				? cellValue != '0'
					? `${type}后${cellValue}日`
					: `${type}`
				: row.lastDay || (cellValue === '31' && type === '当月')
				? `${type}月底`
				: `${type}${cellValue}日`
		},
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		getData() {
			// let custid = parseInt(this.custQuery.custid)
			let { custid } = this.custQuery
			creditAndSettleInfo(custid).then(res => {
				this.creditTableData = []
				this.custTableData = []
				if (res.data) {
					this.creditTableData = res.data.creditAccountVoList.map(item => {
						let countryStr = item.country && item.country.includes('中国') ? '国内' : item.country && !item.country.includes('中国') ? '国外' : ''
						return {
							...item,
							custClassCn: countryStr+getDictLabel('customerClass', item.custClass),
							businessTypeCn: item.creditAccountBusinessList.map(o => getDictLabel('businessType', o.businessType)).join('，'),
						}
					})
					res.data.custSettleVoList.map((item, index) => {
						if (item.settleDaysDtoList && item.settleDaysDtoList.length) {
							item.settleDaysDtoList.map(ele => {
								let countryStr = item.country && item.country.includes('中国') ? '国内' : item.country && !item.country.includes('中国') ? '国外' : ''
								this.custTableData.push({
									...item,
									_oid: index,
									blModeCn: getDictLabel('blMode', this.custQuery.blMode),
									custClassCn: countryStr+getDictLabel('customerClass', item.custClass),
									businessTypeCn: item.settleBusinessTypeList.map(o => getDictLabel('businessType', o.businessType)).join('，'),
									settlementDays: ele.settlementDays, 
									settlementDaysType: ele.settlementDaysType, 
									settleLineList: Array.from(new Set(ele.settleLineList.map(o => o.sysLineCname))).join('，')
								})
							})
						}
					})
				}
				this.getSpanArr(this.custTableData)
			})
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm')
			} else {
				this.close('Cancel')
			}
		},
	}
}
</script>
<style lang="scss" scoped>
.cr-table-cont{
	&.mt20{
		margin-top: 20px;
	}
	.h{
		line-height: 24px;
		font-weight: bold;
		color: #333;
	}
	.sopop-table {
		.cell {
			display: block;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			.item {
				display: block;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
		}
	}
	/deep/ .el-table td{
		border-right: 1px solid #dfe6ec !important;
	}
	/deep/ .el-table th{
		border-bottom: 1px solid #dfe6ec;
	}
}

</style>
