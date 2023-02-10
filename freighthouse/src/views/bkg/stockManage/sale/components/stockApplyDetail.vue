<template>
	<div class="finance-page">
		<div class="bkg-cnt">
			<div class="money-box">
				<div class="money-box-left">
					<div class="money-title"></div>
				</div>
				<div class="money-box-right">
					<div class="status-box">
						分配状态：{{ verifyStatus | formatVerifyStatus }}
					</div>
					<div class="button-box">
						<el-button class="finance-btn" size="mini" @click="cancel"
							>返回</el-button
						>
						<el-button
							class="finance-btn"
							size="mini"
							@click="stockApply"
							v-if="['unallocated', 'refuse'].includes(verifyStatus)"
							>修改</el-button
						>
						<el-button
							class="finance-btn"
							size="mini"
							@click="stockReject"
							v-if="['unallocated', 'refuse'].includes(verifyStatus)"
							>撤回</el-button
						>
						<el-button
							class="finance-btn"
							size="mini"
							@click="stockAllot"
							v-if="
								['part_allocated', 'allocated'].includes(verifyStatus) &&
								!info.returnVo
							"
							>退舱</el-button
						>
					</div>
				</div>
			</div>
			<div class="info-cnt" v-if="info.stockVo">
				<div class="base-title">基本信息</div>
				<div class="base-info">
					<div class="base-item">申请单号：{{ applyId }}</div>
					<div class="base-item">现舱编号：{{ info.stockVo.stockId }}</div>
					<div class="base-item">大船起运港：{{ info.stockVo.polEname }}</div>
					<div class="base-item">目的港：{{ info.stockVo.podName }}</div>
					<div class="base-item">系统航线：{{ info.stockVo.sysLineName }}</div>
					<div class="base-item">船司：{{ info.stockVo.shipCarrierName }}</div>
					<div class="base-item">ETD：{{ info.stockVo.etdDate }}</div>
					<div class="base-item">
						截关时间：{{ info.stockVo.cyCutOff | formatDate }}
					</div>
					<div class="base-item">
						截补料时间：{{ info.stockVo.siCutOff | formatDate }}
					</div>
					<div class="base-item">柜型：{{ info.stockVo.containerType }}</div>
					<div class="base-item">柜量总数：{{ info.stockVo.containerNum }}</div>
					<div class="base-item">售价：{{ info.stockVo.sellPrice }}</div>
					<div class="base-item oneline">
						Freetime说明：{{ info.stockVo.freetimeRemark }}
					</div>
					<div class="base-item oneline">
						退仓费说明：{{ info.stockVo.cancelRemark }}
					</div>
				</div>
				<div class="base-title">申请信息</div>
				<div class="apply-info">
					<div class="base-item">申请人：{{ info.apply.applierName }}</div>
					<div class="base-item">申请时间：{{ info.apply.createdTime }}</div>
					<div class="base-item">申请数量：{{ info.apply.applyCount }}</div>
					<div class="base-item oneline">
						申请备注：{{ info.apply.applyRemark }}
					</div>
				</div>
				<div class="base-title">分配信息</div>
				<div class="allot-info">
					<div class="base-item">审核人：{{ info.apply.verifierName }}</div>
					<div class="base-item">审核时间：{{ info.apply.updatedTime }}</div>
					<div class="base-item">
						分配柜量数：{{ info.apply.distributeNum }}
					</div>
					<div class="base-item oneline base-item-so">
						<span>分配SO信息：</span>
						<div class="so-list">
							<div
								class="info-box"
								v-for="item in info.applySoList"
								:key="item.so"
							>
								<span>SO号：{{ item.so }}</span>
								<span>柜型：{{ item.containerType }}</span>
								<span>柜量：{{ item.containerNum }}</span>
								<span>售价：{{ item.sellPrice }}</span>
								<span>现舱备注：{{ item.remark }}</span>
							</div>
						</div>
					</div>
					<div class="base-item oneline" v-show="verifyStatus === 'refuse'">
						拒绝备注：{{ info.apply.refuseReason }}
					</div>
				</div>
				<template v-if="info.returnVo">
					<div class="base-title">退舱信息</div>
					<div class="cancle-info">
						<div class="base-item">退舱人：{{ info.returnVo.createdName }}</div>
						<div class="base-item">
							退舱时间：{{ info.returnVo.createdTime }}
						</div>
						<div class="base-item">退舱数：{{ info.returnVo.returnNum }}</div>
						<div class="base-item">
							退舱备注：{{ info.returnVo.returnRemark }}
						</div>
						<div class="base-item oneline base-item-so">
							<span>退舱SO信息：</span>
							<div class="so-list">
								<div
									class="info-box"
									v-for="item in info.returnSoList"
									:key="item.so"
								>
									<span>SO号：{{ item.so }}</span>
									<span>柜型：{{ item.containerType }}</span>
									<span>柜量：{{ item.containerNum }}</span>
									<span>售价：{{ item.sellPrice }}</span>
									<span>现舱备注：{{ item.remark }}</span>
								</div>
							</div>
						</div>
						<div class="base-item">
							审核人：{{ info.returnVo.verifierName }}
						</div>
						<div class="base-item">
							审核时间：{{ info.returnVo.verifyTime }}
						</div>
						<div class="base-item">
							退舱费：
							<el-input
								size="mini"
								v-model="info.returnVo.returnFee"
								disabled
							></el-input>
						</div>
						<div class="base-item">
							SO售价：
							<el-input
								size="mini"
								v-model="info.stockVo.sellPrice"
								disabled
							></el-input>
						</div>
					</div>
				</template>
			</div>
		</div>
		<el-dialog
			title="现舱申领"
			:visible.sync="stockApplyShow"
			class="self-dialog"
			width="1000px"
		>
			<div class="stock-apply-cnt" v-if="info.stockVo">
				<div class="apply-num-box">
					<div class="left-box">
						<span>*</span>申领数量：
						<el-input-number
							v-model="applyNum"
							size="mini"
							controls-position="right"
							@change="handleChange"
							:min="1"
							:max="info.stockVo.lastCount"
						></el-input-number>
					</div>
					<div class="right-box">剩余数量：{{ info.stockVo.lastCount }}</div>
				</div>
				<div class="apply-reason">
					<span>申领备注：</span>

					<div class="textarea-box">
						<el-input
							type="textarea"
							placeholder="请输入内容"
							v-model="applyReason"
							maxlength="100"
							:autosize="{ minRows: 3, maxRows: 5 }"
							show-word-limit
						></el-input>
					</div>
				</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitApply" size="mini"
					>确认</el-button
				>
				<el-button size="mini" @click="closeDialog">取消</el-button>
			</span>
		</el-dialog>
		<el-dialog
			title="现舱退费"
			:visible.sync="allotOpen"
			class="self-dialog"
			width="1000px"
		>
			<div class="stock-apply-cnt">
				<div class="allot-msg">退舱费说明：{{ returnRemark }}</div>
				<FinanceTable :option="option2" @send-multi="sendMulti" />
				<div class="remarks-box">
					<span>退舱备注：</span>
					<div class="textarea-box">
						<el-input
							type="textarea"
							placeholder="请输入内容"
							v-model.trim="remarks"
							maxlength="100"
							show-word-limit
							:rules="{
								required: true,
								message: '退舱备注不能为空',
								trigger: 'blur',
							}"
						></el-input>
					</div>
				</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitAllot" size="mini"
					>确认退回</el-button
				>
				<el-button size="mini" @click="closeAllot">取消</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { baseCurrencyList } from '@/api/base'
import { applyDetail, updateApplyCount, deleteApply, returnSo, retreat, } from '@/api/bkg/stockApply'
export default {
	components: {
		FinanceTable,
	},
	mixins: [mixin, routerMixin],
	data () {
		return {
			applyId: '',
			verifyStatus: '',
			info: {},
			currencyOptions: [],
			retreat: {
				currency: '',
				loatAmt: '',
				soAmt: '',
			},
			stockApplyShow: false,
			applyNum: '',
			applyReason: '',
			multipleSelection: [],
			allotOpen: false,
			option2: {},
			returnRemark: '',
			remarks: '',
		}
	},
	created () {
		this.applyId = this.$route.query.applyId
		this.verifyStatus = this.$route.query.verifyStatus
		this.getData()
		this.option2 = Object.assign({}, this.option, {
			id: 'option2',
			data: [],
			tips: false,
			pagination: false,
			operationBtns: false,
		})
		let columns2 = [
			{ prop: 'so', label: 'SO号' },
			{ prop: 'containerType', label: '柜型' },
			{ prop: 'containerNum', label: '柜量' },
			{ prop: 'remark', label: '现舱备注' },
			{ prop: 'sellPrice', label: '售价' },
			{ prop: 'currencyCode', label: '币别' },
		]
		this.option2.columns = columns2
	},
	methods: {
		// 获取详情消息
		getData () {
			let data = this.applyId
			applyDetail(data)
				.then((res) => {
					this.info = res.data
				})
				.catch(() => { })
		},
		// 返回
		cancel () {
			this.routerBack()
		},
		// 表格-撤回
		stockReject () {
			this.$confirm('是否确认撤回该舱位申领？', '提示', {
				confirmButtonText: '确认',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					this.stockRejectFn()
				})
				.catch(() => { })
		},
		// 撤回申请
		stockRejectFn () {
			let data = this.applyId
			deleteApply(data)
				.then((res) => {
					if (res.code === 0) {
						this.$message({
							message: '恭喜你，撤回申领成功！',
							type: 'success',
						})
					}
					this.getData()
				})
				.catch(() => { })
		},
		// 币别下拉列表自动补充的数据
		getCurrencyList () {
			baseCurrencyList('', 'valid')
				.then((res) => {
					let preArr = [],
						otherArr = []
					res.data.forEach((item) => {
						let currency = {
							label: `${item.code}(${item.cnName})`,
							value: item.code,
						}
						if (['CNY', 'USD'].includes(item.code)) {
							preArr.push(currency)
						} else {
							otherArr.push(currency)
						}
					})
					this.currencyOptions = [...preArr, ...otherArr]
				})
				.catch(() => { })
		},
		// 表格-修改回调
		stockApply () {
			this.applyNum = this.info.apply.applyCount
			this.applyReason = ''
			this.stockApplyShow = true
		},
		// 申请数量
		handleChange () { },
		// 提交申请
		submitApply () {
			if (!this.applyNum) {
				return this.$message({
					message: `申领数量不能为0`,
					type: 'error',
				})
			}
			let applyReason = this.applyReason.trim()
			if (!applyReason.length) {
				return this.$message({
					message: `申领备注不能为空`,
					type: 'error',
				})
			}
			let data = {
				applyId: this.applyId,
				applyCount: this.applyNum,
				applyRemark: applyReason || '',
			}
			updateApplyCount(data)
				.then((res) => {
					if (res.code === 0) {
						this.$message({
							message: ` 恭喜你，修改成功！`,
							type: 'success',
						})
					}
					this.getData()
					this.closeDialog()
				})
				.catch(() => { })
		},
		// 关闭弹窗
		closeDialog () {
			this.stockApplyShow = false
		},
		// 表格-撤回
		stockReject () {
			this.$confirm('是否确认撤回该舱位申领？', '提示', {
				confirmButtonText: '确认',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					this.stockRejectFn()
				})
				.catch(() => { })
		},
		// 撤回申请
		stockRejectFn () {
			let data = this.applyId
			deleteApply(data)
				.then((res) => {
					if (res.code === 0) {
						this.$message({
							message: '恭喜你，撤回申领成功！',
							type: 'success',
						})
						this.cancel()
					}
				})
				.catch(() => { })
		},
		// 表格-退舱
		stockAllot (row) {
			let { applyId } = this.info.apply
			let { sysLineCode, shipCarrierCode } = this.info.stockVo
			let data = {
				sysLineCode,
				shipCarrierCode,
				podCode: 'PYTER', // pod, // 'PYTER'
				applyId,
			}
			returnSo(data).then((res) => {
				this.returnRemark = res.data.returnRemark
				this.option2.data = res.data.applySos.map((item) => {
					return { ...item, _disabled: item.status !== 'not_use' }
				})
				this.allotOpen = true
			})
		},
		// 提交退舱
		submitAllot () {
			let len = this.multipleSelection.length
			if (!len) {
				return this.$msgErrClose('请勾选需要退舱的数据')
			}
			let remarks = this.remarks.trim()
			if (!remarks.length) {
				return this.$msgErrClose('请填写退舱备注')
			}
			this.stockAllotFn()
		},
		// 关闭现舱退费
		closeAllot () {
			this.allotOpen = false
			this.remarks = ''
		},
		// 退舱
		stockAllotFn () {
			let { applyId, stockId } = this.info.apply
			let returnRemark = this.remarks
			let soNos = this.multipleSelection.map((item) => {
				return item.so
			})
			let data = { applyId, stockId, returnRemark, soNos }
			retreat(data).then((res) => {
				this.$msgSucClose('恭喜你，申请退舱成功！')
				this.allotOpen = false
				this.getData()
			})
		},
		// 表格选择
		sendMulti (data) {
			this.multipleSelection = data
		},
	},
	mounted () {
		// this.getCurrencyList()
	},
	filters: {
		formatDate (val) {
			return val ? val.split(' ')[0] : ''
		},
		formatVerifyStatus (val) {
			if (val) {
				let text = {
					unallocated: '未处理',
					allocated: '已分配',
					refuse: '已拒绝',
					part_allocated: '已分配'
				}
				return text[val]
			} else {
				return ''
			}
		},
	},
	activated () {
		this.applyId = this.$route.query.applyId
		this.verifyStatus = this.$route.query.verifyStatus
		this.getData()
	},
}
</script>

<style lang="scss" scoped>
.money-box {
	border-bottom: 1px solid #e9e9e9;
	.money-box-right {
		display: flex;
		line-height: 20px;
		.status-box {
			margin-right: 50px;
		}
	}
}
.info-cnt {
	margin: 10px;
	.base-title {
		font-size: 14px;
		font-weight: 600;
		color: #909399;
		line-height: 14px;
		margin: 20px 0;
	}
	.base-info,
	.apply-info {
		padding-bottom: 8px;
	}
	.base-info,
	.apply-info,
	.allot-info,
	.cancle-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		border-bottom: 1px solid #e9e9e9;
		.base-item {
			flex: 0 0;
			flex-basis: 192px;
			margin-bottom: 8px;
			&.base-item-so {
				margin: 6px 0;
			}
			&.oneline {
				flex: 100%;
				display: flex;
				flex-wrap: wrap;
				.so-list {
					flex: 1;
					display: flex;
					flex-direction: column;
					.info-box {
						display: flex;
						justify-content: flex-start;
						margin-bottom: 6px;
						span {
							flex-basis: 100px;
							// min-width: 192px;
							&:nth-of-type(1) {
								flex-basis: 180px;
							}
							&:nth-of-type(2) {
								flex-basis: 90px;
							}
							&:nth-of-type(3) {
								flex-basis: 80px;
							}
							&:nth-last-of-type(1) {
								flex: 1;
							}
						}
					}
				}
			}
		}
	}
	.cancle-info {
		.el-input,
		.el-select {
			width: 150px;
		}
	}
}
.stock-apply-cnt {
	font-size: 12px;
	.apply-num-box {
		display: flex;
		line-height: 28px;
		.left-box,
		.right-box {
			flex: 1;
		}
		.left-box {
			span {
				color: red;
			}
		}
		.right-box {
			text-align: right;
		}
	}
	.apply-reason {
		margin-top: 20px;
		vertical-align: top;
		display: flex;
		.textarea-box {
			display: inline-block;
			width: 500px;
		}
	}
}
.stock-apply-cnt {
	font-size: 12px;
	/deep/ .finance-el-table {
		padding: 8px 0;
	}
	.apply-num-box {
		display: flex;
		line-height: 28px;
		.left-box,
		.right-box {
			flex: 1;
		}
		.left-box {
			span {
				color: red;
			}
		}
		.right-box {
			text-align: right;
		}
	}
	.apply-reason {
		margin-top: 20px;
		vertical-align: top;
		display: flex;
		.textarea-box {
			display: inline-block;
			width: 500px;
		}
	}
}
.remarks-box {
	display: flex;
	margin-top: 10px;
	.textarea-box {
		flex: 1;
	}
}
</style>
