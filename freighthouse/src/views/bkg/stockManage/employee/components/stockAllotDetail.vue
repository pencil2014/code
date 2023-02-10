<template>
	<div class="finance-page">
		<div class="bkg-cnt">
			<div class="money-box">
				<div class="money-box-left">
					<div class="money-title"></div>
				</div>
				<div class="money-box-right">
					<div
						class="status-box"
						v-if="['unallocated', 'allocated', 'refuse'].includes(verifyStatus)"
					>
						分配状态：{{ verifyStatus | formatVerifyStatus }}
					</div>
					<div class="button-box">
						<el-button class="finance-btn" size="mini" @click="cancel"
							>返回</el-button
						>
						<el-button
							class="finance-btn"
							size="mini"
							@click="rejectFn"
							v-if="verifyStatus === 'unallocated'"
							>拒绝</el-button
						>
						<el-button
							class="finance-btn"
							size="mini"
							@click="allotFn"
							v-if="verifyStatus === 'unallocated'"
							>分配</el-button
						>
						<el-button
							class="finance-btn"
							size="mini"
							@click="returnFn"
							v-if="verifyStatus === 'pending' && isPricing"
							>确认退舱</el-button
						>
						<el-button
							class="finance-btn"
							size="mini"
							@click="stockAllotReturn"
							v-if="verifyStatus === 'pending' && !isPricing"
							>撤回</el-button
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
						<div class="base-item" style="margin-top: 20px">
							审核人：{{ info.returnVo.verifierName }}
						</div>
						<div class="base-item" style="margin-top: 20px">
							审核时间：{{ info.returnVo.verifyTime }}
						</div>
						<div class="base-item" style="margin-top: 20px">
							退舱费：
							<el-input
								size="mini"
								v-model="info.returnVo.returnFee"
								:disabled="verifyStatus !== 'pending' || !isPricing"
								placeholder="请输入"
							></el-input>
						</div>
						<div class="base-item" style="margin-top: 20px">
							币别：
							<!-- <el-input
								size="mini"
								v-model="info.returnVo.returnFeeCurrency"
								:disabled="verifyStatus !== 'pending'"
							></el-input> -->
							<el-select
								size="mini"
								v-model="info.returnVo.returnFeeCurrency"
								placeholder="请选择"
								filterable
								remote
								:disabled="verifyStatus !== 'pending' || !isPricing"
								:remote-method="getCurrencyList"
								@visible-change="getCurrencyList('')"
							>
								<el-option
									v-for="item in currencyList"
									:key="item.code"
									:label="item.code"
									:value="item.code"
								>
								</el-option>
							</el-select>
						</div>

						<!-- <div class="base-item" style="margin-top:20px">
              SO售价：
              <el-input
                size="mini"
                v-model="info.stockVo.sellPrice"
                :disabled="verifyStatus !== 'pending'"
              ></el-input>
            </div> -->
					</div>
				</template>
			</div>
		</div>
		<el-dialog
			title="申领拒绝"
			:visible.sync="refuseOpen"
			width="600px"
			class="stock-manage-refuse"
		>
			<el-form :model="refuseForm" ref="refuseForm" label-width="80px">
				<el-form-item
					label="拒绝原因："
					prop="refuseReason"
					:rules="{
						required: true,
						message: '拒绝原因不能为空',
						trigger: 'blur',
					}"
				>
					<el-input
						type="textarea"
						placeholder
						:maxlength="500"
						:autosize="{ minRows: 4, maxRows: 6 }"
						show-word-limit
						v-model="refuseForm.refuseReason"
					></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleSubmit" size="mini"
					>确定</el-button
				>
				<el-button @click="closeRefuse" size="mini">取消</el-button>
			</span>
		</el-dialog>
		<el-dialog
			title="现舱分配"
			:visible.sync="allotOpen"
			class="self-dialog"
			width="1000px"
		>
			<div class="allot-cnt">
				<FinanceTable :option="option2" @send-multi="sendMulti" />
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitAllot" size="mini"
					>分配</el-button
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
import { applyDetail, returnDetail, refuse, listStockSoByStockId, allocate, retreatConfirm, cancelReturn } from '@/api/bkg/stockApply'
import { baseCurrencyList } from '@/api/base'
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
			refuseOpen: false,
			refuseForm: {
				refuseReason: '',
			},
			allotOpen: false,
			option2: {},
			multipleSelection: [],
			currencyList: [],
			isPricing: true
		}
	},
	created () {
		this.applyId = this.$route.query.applyId
		this.verifyStatus = this.$route.query.verifyStatus
		let { roles } = this.$store.state.user
		this.isPricing = roles.includes('pricing')
		this.getData()
		this.option2 = Object.assign({}, this.option, {
			id: 'option2',
			tips: {
				text: '',
				show: false,
			},
			operationBtns: false,
			pagination: false,
		})
		let columns2 = [
			{
				prop: 'so',
				label: 'SO号',
				type: 'text',
			},
			{
				prop: 'containerType',
				label: '柜型',
				type: 'text',
			},
			{
				prop: 'containerNum',
				label: '柜量',
				type: 'text',
			},
			{
				prop: 'status',
				label: 'SO状态',
				type: 'text',
				formatter: (row) => {
					return row['status'] === 'unallocated' ? '未分配' : '已分配'
				},
			},
			{
				prop: 'remark',
				label: '现舱备注',
				type: 'text',
			},
			{
				prop: 'currencyCode',
				label: '币别',
				type: 'text',
			},
			// {
			// 	prop: "costPrice",
			// 	label: "售价",
			// 	type: "text",
			// },
			{
				prop: 'costPrice',
				label: '成本价',
				type: 'text',
			},
		]
		this.option2.columns = columns2
	},
	methods: {
		// 获取详情消息
		getData () {
			let data = this.applyId
			let method = this.$route.query.type == 'return' ? returnDetail : applyDetail
			method(data).then((res) => {
				this.info = res.data
				var str = 'asdfasfdwerqwer'
				if (this.info.returnSoList) {
					this.info.returnSoList = this.info.returnSoList.map((item, index) => {
						return { ...item, so: item.so + str.slice(0, index * 2) }
					})
				}

			})
		},
		// 返回
		cancel () {
			this.routerBack()
		},
		//拒绝
		rejectFn () {
			this.refuseOpen = true
		},
		// 关闭拒绝弹窗
		closeRefuse () {
			this.refuseOpen = false
			this.refuseForm.refuseReason = ''
		},
		// 分配拒绝验证
		handleSubmit () {
			this.$refs['refuseForm'].validate((valid) => {
				if (valid) {
					this.stockRefuseFn()
				}
			})
		},
		// 拒绝分配确认
		stockRefuseFn () {
			let data = {
				applyId: this.applyId,
				refuseReason: this.refuseForm.refuseReason,
			}
			refuse(data)
				.then((res) => {
					if (res.code === 0) {
						this.$message({
							message: '拒绝分配成功！',
							type: 'success',
						})
						this.verifyStatus = 'refuse'
						this.closeRefuse()
						this.getData()
					}
				})
				.catch(() => {
					this.$message({
						message: '对不起，拒绝分配失败！',
						type: 'success',
					})
				})
		},
		// 分配
		allotFn () {
			this.listStockSoByStockId()
		},
		// 获取现舱分舱so列表
		listStockSoByStockId () {
			let data = this.info.stockVo.stockId
			listStockSoByStockId(data)
				.then((res) => {
					this.option2.data = res.data
					this.allotOpen = true
				})
				.catch(() => { })
		},
		// 分配成功
		submitAllot () {
			let len = this.multipleSelection.length
			if (!len) {
				return this.$message({
					message: '请勾选现舱分配的数据',
					type: 'error',
				})
			}
			this.$confirm('是否确认要分配？', '提示', {
				confirmButtonText: '确认',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					this.stockAllotFn2()
				})
				.catch(() => { })
		},
		// 现舱分配
		stockAllotFn2 () {
			let soNos = this.multipleSelection.map((item) => {
				return item.so
			})
			let data = {
				applyId: this.applyId,
				soNos,
			}
			allocate(data)
				.then((res) => {
					if (res.code === 0) {
						this.$message({
							message: '恭喜你，现舱分配成功',
							type: 'success',
						})
					}
					this.verifyStatus = 'allocated'
					this.allotOpen = false
					this.getData()
				})
				.catch(() => { })
		},
		// 关闭申领弹窗
		closeAllot () {
			this.allotOpen = false
		},
		// 表格选择操作
		sendMulti (data) {
			this.multipleSelection = data
		},
		// 退舱验证
		returnFn () {
			let returnFee = this.info.returnVo.returnFee
			let returnFeeCurrency = this.info.returnVo.returnFeeCurrency
			if (!+returnFee) {
				return this.$message({
					message: '请填写退舱费',
					type: 'error',
				})
			}
			if (!returnFeeCurrency) {
				return this.$message({
					message: '请选择退舱费币别',
					type: 'error',
				})
			}
			this.$confirm('是否确认通过该退舱申请', '提示', {
				confirmButtonText: '确认',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					this.stockAllotFn()
				})
				.catch(() => { })
		},
		// 确认退舱
		stockAllotFn () {
			let { stockId } = this.info.stockVo
			let { applyId, returnId, returnFee, returnFeeCurrency } = this.info.returnVo
			let returnSoList = this.info.returnSoList.map((item) => {
				return item.so
			})
			let data = {
				stockId,
				applyId,
				returnId,
				returnFee,
				returnFeeCurrency,
				returnSoList,
			}
			retreatConfirm(data)
				.then((res) => {
					if (res.code === 0) {
						this.$message({
							message: '恭喜你，退舱确认成功！',
							type: 'success',
						})
						this.cancel()
					}
				})
				.catch(() => { })
		},
		// 币别下拉列表自动补充的数据
		getCurrencyList (queryString) {
			baseCurrencyList(queryString, 'valid').then(response => {
				this.currencyList = response.data
			})
		},
		// 业务员退舱撤回
		stockAllotReturn (row) {
			this.$confirmWarn('是否确认撤回？', () => {
				cancelReturn(this.info.returnVo.returnId).then(() => {
					this.$msgSucClose('撤回成功！')
					this.cancel()
				})
			})
		},
	},
	activated () {
		this.applyId = this.$route.query.applyId
		this.verifyStatus = this.$route.query.verifyStatus
		this.getData()
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
				}
				return text[val]
			} else {
				return ''
			}
		},
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
		color: #333;
		line-height: 14px;
		margin: 12px 0;
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
}
.cancle-info {
	.el-input,
	.el-select {
		width: 130px;
	}
}
</style>