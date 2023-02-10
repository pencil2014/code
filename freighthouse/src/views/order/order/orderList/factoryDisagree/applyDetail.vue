<template>
	<div class="edit-container" id="applyDetail" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div class="save-row">
			<div class="tit">发起申请</div>
			<div class="btn-groups">
				<el-button size="mini" type="primary" @click="handleSave" :disabled="false" :loading="loading">保存</el-button>
				<el-button size="mini" type="default" @click="handleBack" :disabled="false">返回</el-button>
			</div>
		</div>
		<el-form ref="apply" :rules="rules" :model="createdItem" label-position="right" label-width="75px" class="apply-form">
			<div class="apply-form-row warning" v-for="(item, index) in param" :key="item.blNo + index">MBL：{{ item.blNo }} 关联的HBL 并未同意放货，是否确定要先申请同意放该MBL？</div>
			<el-row style="margin-top: 20px">
				<el-form-item label="本单货值" prop="agreeApplyValue" :required="true" :show-message="false">
					<el-input maxlength="64" show-word-limit :style="{ width: '100%' }" size="mini" placeholder="请输入" v-model="createdItem.agreeApplyValue"></el-input>
				</el-form-item>
			</el-row>
			<el-row>
				<el-form-item label="申请原因" prop="reason" :required="true" :show-message="false">
					<el-input maxlength="512" show-word-limit :style="{ width: '100%' }" type="textarea" size="mini" :rows="3" placeholder="请输入" v-model="createdItem.reason"></el-input>
				</el-form-item>
			</el-row>
			<div class="blNo-list" v-for="(item, index) in param" :key="index">
				<el-row>
					<el-col :span="8">
						<div class="unit">
							<div class="label-fl">审批人：</div>
							<div class="value-fr">{{ item.agreeAuditEmployeeName }}</div>
						</div>
					</el-col>
					<el-col :span="8">
						<div class="unit">
							<div class="label-fl">销售：</div>
							<div class="value-fr">{{ item.bdEmployeeName }}</div>
						</div>
					</el-col>
				</el-row>
				<!-- 结算单位table -->
				<el-table border fit highlight-current-row style="width: 100%" ref="settleList" :data="tableDataObj[item.orderNo + item.blId] || []" class="settle-list-table" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
					<el-table-column prop="settleCorpName" label="结算单位" align="center" min-width="200"></el-table-column>
					<el-table-column prop="settleCycle" label="结算方式" align="center" min-width="90">
						<template slot-scope="scope">
							{{ scope.row.settleCycle | getDictLabelFilter('settleCycle') }}
						</template>
					</el-table-column>
					<el-table-column prop="isArrear" label="是否超期" align="center" min-width="80">
						<template slot-scope="scope">
							<span :class="{ red: scope.row.isArrear === 'yes' }">{{ scope.row.isArrear === 'yes' ? '是' : '否' }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="arrearDays" label="超期天数" align="center" min-width="80"></el-table-column>
					<el-table-column prop="isOverQuota" label="是否超额" align="center" min-width="80">
						<template slot-scope="scope">
							<span :class="{ red: scope.row.isOverQuota === 'yes' }">{{ scope.row.isOverQuota === 'yes' ? '是' : '否' }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="currency" label="币别" align="center" min-width="80"></el-table-column>
					<el-table-column prop="unrecvUsdAmt" label="未收金额" align="center"></el-table-column>
					<el-table-column prop="arrearAmt" label="超期金额" align="center" min-width="100">
						<template slot="header">
							超期金额
							<el-tooltip class="item" effect="dark" placement="top" content="超期金额=原超期金额-账期内和之前未付金额-账期内和之前预收款金额。">
								<i class="el-icon-question" style="font-size: 14px"></i>
							</el-tooltip>
						</template>
						<template slot-scope="scope">
							<span class="red">{{ scope.row.arrearAmt }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="orginArrearAmt" label="原超期金额" align="center" min-width="100"></el-table-column>
					<el-table-column prop="overQuotaAmt" label="超额金额" align="center" min-width="100">
						<template slot="header">
							超额金额
							<el-tooltip class="item" effect="dark" placement="top" content="超额金额=原超额金额-所有预收款金额。">
								<i class="el-icon-question" style="font-size: 14px"></i>
							</el-tooltip>
						</template>
						<template slot-scope="scope">
							<span class="red">{{ scope.row.overQuotaAmt }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="orginOverQuotaAmt" label="原超额金额" align="center" min-width="100"></el-table-column>
					<el-table-column prop="arrearUnpayUsdAmt" label="账期未付金额" align="center" min-width="100"></el-table-column>
					<el-table-column prop="fiscalTermPreReceiveAmt" label="账期内预收金额" align="center" min-width="110"></el-table-column>
					<el-table-column prop="preReceiveAmt" label="预收款金额" align="center" min-width="100"></el-table-column>
					<!-- <el-table-column prop="preReceiveAmt" label="查看信控配置" align="center" min-width="100">
            <template slot-scope="scope">
              <el-button size="mini" type="text" class="" @click="handleViewCustName(scope.row)">查看</el-button>
            </template>
          </el-table-column> -->
					<el-table-column label="是否后有柜" align="center" min-width="90">
						<template slot-scope="scope">
							<el-button type="text" size="mini" v-if="scope.row.custBlIds && scope.row.custBlIds.length" @click="handleViewLastContainer(scope.row)">是</el-button>
							<span v-else>否</span>
						</template>
					</el-table-column>
				</el-table>
				<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
			</div>
		</el-form>
		<div v-if="lastContainerPopShow">
			<LastContainerPop :lastContainerPopQuery="lastContainerPopQuery" @close="lastContainerPopClose" />
		</div>
		<!-- 结算单位信控信息 -->
		<!-- <div v-if="custNameCrShow">
			<CustNameCr :title="'结算单位信控信息'" :custQuery="custQuery" @close="custNameCrPopClose" />
		</div> -->
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import LastContainerPop from '@/views/order/order/orderList/blFinList/components/lastContainerPop'
import { finSettListBatch, blFactoryDisagreeApply } from '@/api/order/bl'
import { getDictLabel } from '@/utils/tools'
// import CustNameCr from './components/custNameCr'

const defaultCreate = {
	agreeApplyValue: '',
	reason: ''
}
export default {
	mixins: [routerMixin],
	data() {
		return {
			loading: false,
			cTimestamp: 0,
			createdItem: Object.assign({}, defaultCreate),
			rules: {},
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			},
			param: {},
			tableDataObj: [],
			lastContainerPopShow: false,
			lastContainerPopQuery: {}
		}
	},
	props: {},
	created() {
		this.cTimestamp = new Date().getTime()
		this.init()
	},
	activated() {
		let timestamp = new Date().getTime()
		console.log('isUseCache', this.$route.meta.isUseCache)
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.init()
		}
		// this.getCustomerList()
	},
	mounted() {
		// console.log('🚀 ~ this.dictMap.blMode', this.dictMap.blMode)
	},
	destroyed() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		tableTooltip,
		LastContainerPop
	},
	methods: {
		// 获取关联费用的结算单位
		getFinSettList() {
			this.lsLoading = true
			let query = this.param.map(item => {
				return {
					orderNo: item.orderNo,
					blId: item.blId
					// type: item.applyType
				}
			})
			finSettListBatch(query)
				.then(res => {
					let { data } = res
					this.tableDataObj = res.data
					// let t = this.param.data[0].orderNo+this.param.data[0].blId
					// this.tableData = this.tableDataObj[t]
					// this.tableData = data.filter(item => this.param.custSettleUnit.indexOf(item.settleCorpName) !== -1)
				})
				.finally(() => {
					this.lsLoading = false
				})
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
		// 打开后有柜的弹窗
		handleViewLastContainer(row) {
			this.lastContainerPopQuery = { ...row }
			this.lastContainerPopShow = true
		},
		lastContainerPopClose(action, value) {
			this.lastContainerPopShow = false
		},
		init() {
			this.param = JSON.parse(this.$route.query.blNosArr)
			console.log('this.param', this.param)
			this.createdItem = Object.assign({}, defaultCreate)
			this.tableDataObj = {}
			this.getFinSettList()
		},
		handleSave() {
			this.$refs.apply.validate(valid => {
				if (valid) {
					let blIdList = this.param.map(item => item.blId)
					this.loading = true
					blFactoryDisagreeApply({
						blIdList,
						reason: this.createdItem.reason,
						agreeApplyValue: this.createdItem.agreeApplyValue
					})
						.then(res => {
							this.$message({
								type: 'success',
								message: '发起申请成功',
								duration: 1000,
								onClose: () => {
									this.$store.dispatch('tagsView/delView', this.$route)
									this.routerPush('FactoryDisagree')
									this.loading = false
								}
							})
						})
						.catch(err => {
							this.loading = false
						})
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},
		handleBack() {
			this.routerPush('FactoryDisagree')
		}
	}
}
</script>

<style lang="scss" scoped>
#applyDetail {
	margin: 10px;
	background-color: #fff;
	height: 100%;
	/deep/ .el-button--mini {
		height: 20px;
		// line-height: 20px;
		padding: 0px 7px;
	}
	/deep/ .el-select .el-tag {
		margin: 0 3px;
	}
	.save-row {
		height: 24px;
		line-height: 20px;
		padding: 2px 10px;
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid #ddd;
		.tit {
			font-size: 12px;
			font-weight: bold;
		}
	}
	.apply-form {
		padding: 10px;
		.apply-form-row {
			display: flex;
			line-height: 20px;
			.apply-form-unit {
				padding-right: 20px;
				position: relative;
				.el-icon-question {
					position: absolute;
					width: 12px;
					height: 12px;
					right: -18px;
					top: 4px;
					color: #bfbfbf;
				}
			}
			.apply-form-flex {
				/deep/ .el-form-item__content {
					display: flex;
				}
				.icon-hbl {
					display: inline-block;
					width: 16px;
					height: 16px;
					background: #3e80f5;
					border-radius: 2px;
					color: #fff;
					line-height: 16px;
					text-align: center;
					font-style: normal;
					margin: 2px 4px 0 0;
					font-size: 12px;
				}
			}
			&.warning {
				color: #e63923;
				// margin-top: 15px
			}
			.label-fl {
				width: 40px;
			}
			.value-fr {
				flex: 1;
				.btn-special {
					margin-left: 10px;
				}
			}
		}
		.blNo-list {
			background-color: #f3f3f3;
			padding: 5px;
			margin-top: 8px;
			.unit {
				display: flex;
				line-height: 16px;
				&.mt06 {
					margin-top: 6px;
				}
				.label-fl {
					width: 60px;
					text-align: right;
				}
				.value-fr {
					flex: 1;
					.btn-special {
						margin-left: 10px;
					}
				}
			}
		}
		/deep/ .el-form-item {
			margin-bottom: 4px;
			// height: 20px;
			line-height: 20px;
		}
		/deep/ .el-form-item__label {
			line-height: 20px;
			padding-right: 4px;
		}
		/deep/ .el-form-item__content {
			line-height: 20px;
		}
		/deep/ .el-input--mini {
			.el-input__icon {
				line-height: 20px;
			}
			.el-input__inner {
				height: 20px;
				line-height: 20px;
			}
		}
		.settle-list-table {
			margin-top: 4px;
			/deep/ .cell {
				display: block;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
		}
		/deep/ .el-table th {
			height: 24px;
			padding: 2px 0;
		}
		/deep/ .el-table__empty-block {
			min-height: 30px;
			.el-table__empty-text {
				line-height: 30px;
			}
		}
		/deep/ .el-table .el-button {
			padding: 0;
			font-size: 12px;
		}
	}
}
</style>
