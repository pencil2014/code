<template>
	<div class="edit-container-exec">
		<div class="edit-row">
			<div class="row-tit">
				<span class="tit">我的订单/订单详情</span>
				<div class="row-tit-operate">
					<div>
						<span>订单号: {{ detailInfo.orderNo }}</span>
						<span style="width: 50px"></span>
						<span>订单时间: {{ detailInfo.orderTime ? detailInfo.orderTime.substring(0, 10) : '' }}</span>
					</div>
					<div style="width: 20px"></div>
					<el-button style="float: right" size="mini" ref="btnCancel" @click="handleCancel" plain>返回</el-button>
				</div>
			</div>
			<div class="orderCard">
				<section class="orderSection">
					<div class="bookingTable">
						<el-table :data="containerSumTableList" border>
							<el-table-column v-for="(item, index) in containerSumTableOptions" :key="item.prop + index" :label="item.label" :align="'center'" :header-align="'center'" :prop="item.prop"></el-table-column>
						</el-table>
					</div>
					<div class="payInfoTab">
						<div class="payInfoTabInner">
							<div class="chargeTitle">
								<!-- 已支付总额 -->
							</div>
							<div class="chargePaid">
								<!-- {{detailInfo.paidCharge}} {{detailInfo.paidCharge}} -->
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
		<div class="edit-row">
			<div class="orderCard">
				<section class="order-section">
					<header class="order-section-header">
						<h2>箱型使用情况</h2>
					</header>
					<div class="container-detail">
						<div class="container-detail-box" v-for="(item, key) in detailInfo.bookingContainers" :key="key">
							<section class="container-session">
								<header class="container-header">
									<h2 class="container-no">订舱号: {{ item.bookingNo }}</h2>
									<h2 class="container-status">{{ item.status }}</h2>
								</header>
								<div class="container-detail-box-body">
									<div class="container-detail-box-detail">
										<div>{{ item.cntrType }}</div>
										<div>
											<span
												style="
													font-weight: bolder;
													color: black;
													font-size: 22px;
												"
												>{{ item.count }}</span
											>
											个
										</div>
									</div>
								</div>
							</section>
						</div>
					</div>
				</section>
			</div>
			<div class="orderCard">
				<section class="order-section">
					<header class="order-section-header">
						<h2>航线产品</h2>
					</header>
					<div>
						<el-table :data="shippingLineList" :span-method="arraySpanMethod">
							<el-table-column header-align="center" align="left" label="出发地" width="120px">
								<template slot-scope="scope">
									<div class="shippingLines">
										<div class="schedule-data" style="width: 550px">
											<el-row class="time-display">
												<el-col :span="6">
													<div>
														<div class="horizontal-content-div">
															<span v-if="scope.row.sailingProduct.scheduleData.legs.length > 1">ETD</span>
														</div>
														<div class="horizontal-content-div">
															<span v-if="scope.row.sailingProduct.scheduleData.legs.length > 1">{{ scope.row.sailingProduct.scheduleData.legs[0].pol.etd ? scope.row.sailingProduct.scheduleData.legs[0].pol.etd.substring(0, 10) : '' }}</span>
														</div>
													</div>
												</el-col>
												<el-col :span="6">
													<div v-if="scope.row.sailingProduct.scheduleData.legs.length > 1">
														<div class="horizontal-content-div">ETD</div>
														<div class="horizontal-content-div">
															{{ scope.row.sailingProduct.scheduleData.legs[1].pol.etd ? scope.row.sailingProduct.scheduleData.legs[1].pol.etd.substring(0, 10) : '' }}
														</div>
													</div>
													<div v-if="scope.row.sailingProduct.scheduleData.legs.length == 1">
														<div class="horizontal-content-div">ETD</div>
														<div class="horizontal-content-div">
															{{ scope.row.sailingProduct.scheduleData.legs[0].pol.etd ? scope.row.sailingProduct.scheduleData.legs[0].pol.etd.substring(0, 10) : '' }}
														</div>
													</div>
												</el-col>
												<el-col :span="6">
													<div class="horizontal-content-div">ETA</div>
													<div class="horizontal-content-div">
														{{ scope.row.sailingProduct.eta ? scope.row.sailingProduct.eta.substring(0, 10) : '' }}
													</div>
												</el-col>
												<el-col :span="6">
													<div class="horizontal-content-div"></div>
													<div class="horizontal-content-div"></div>
												</el-col>
											</el-row>
											<el-row class="circle-center">
												<el-col :span="6">
													<div class="hollow-circle"></div>
													<div class="beeline"></div>
												</el-col>
												<el-col :span="6">
													<div class="solid-circle"></div>
													<div class="beeline"></div>
												</el-col>
												<el-col :span="6">
													<div class="solid-circle"></div>
													<div class="beeline"></div>
												</el-col>
												<el-col :span="6">
													<div class="hollow-circle"></div>
												</el-col>
											</el-row>
											<el-row class="time-display">
												<el-col :span="6">
													<div class="horizontal-content-div">
														{{ scope.row.sailingProduct.porCity.cityFullNameCn }}
													</div>
													<div class="horizontal-content-div">
														{{ scope.row.sailingProduct.porCity.cityFullNameEn }}
													</div>
													<div class="horizontal-content-div">
														{{ scope.row.porFacilityCode }}
													</div>
												</el-col>
												<el-col :span="6">
													<div class="horizontal-content-div">
														{{ scope.row.sailingProduct.scheduleData.legs[scope.row.sailingProduct.scheduleData.legs.length - 1].pol.port.portFullNameCn }}
													</div>
													<div class="horizontal-content-div">
														{{ scope.row.sailingProduct.scheduleData.legs[scope.row.sailingProduct.scheduleData.legs.length - 1].pol.port.portFullNameEn }}
													</div>
												</el-col>
												<el-col :span="6">
													<div class="horizontal-content-div">
														{{ scope.row.sailingProduct.scheduleData.legs[scope.row.sailingProduct.scheduleData.legs.length - 1].pod.port.portFullNameCn }}
													</div>
													<div class="horizontal-content-div">
														{{ scope.row.sailingProduct.scheduleData.legs[scope.row.sailingProduct.scheduleData.legs.length - 1].pod.port.portFullNameEn }}
													</div>
												</el-col>
												<el-col :span="6">
													<div class="horizontal-content-div">
														{{ scope.row.sailingProduct.fndCity.cityFullNameCn }}
													</div>
													<div class="horizontal-content-div">
														{{ scope.row.sailingProduct.fndCity.cityFullNameEn }}
													</div>
													<div class="horizontal-content-div">
														{{ scope.row.sailingProduct.fndFacilityCode }}
													</div>
												</el-col>
											</el-row>
										</div>

										<!-- 预期交货时间 -->
										{{ scope.row.sailingProduct.estimatedTransitTimeInDays }}天
										<div class="symbol"></div>
										<div class="symbol"></div>
										<!-- 有效期 -->
										{{ scope.row.sailingProduct.effectiveStartDate ? scope.row.sailingProduct.effectiveStartDate.substring(0, 10) : '' }}~
										<br />
										{{ scope.row.sailingProduct.effectiveEndDate ? scope.row.sailingProduct.effectiveEndDate.substring(0, 10) : '' }}
										<div class="symbol"></div>
										<!-- 条款 -->
										{{ scope.row.sailingProduct.haulageType }}
										<!--货品-->
										<div class="symbol"></div>
										<!--船名航次-->
										{{ scope.row.sailingProduct.scheduleData.vesselName }}
										{{ scope.row.sailingProduct.scheduleData.voyageNo }}{{ scope.row.sailingProduct.scheduleData.direction }}/{{ scope.row.sailingProduct.scheduleData.serviceCode }}
									</div>
								</template>
							</el-table-column>
							<el-table-column header-align="center" align="left" label="装货(中转港)/ETD" width="150px"></el-table-column>
							<el-table-column header-align="center" align="left" label="卸货港/ETA" width="150px"></el-table-column>
							<el-table-column header-align="center" align="left" label="目的地" width="150px"></el-table-column>
							<el-table-column header-align="center" align="left" label="预期交货时间" width="100px"></el-table-column>
							<el-table-column header-align="center" align="left" label="运价有效期" width="100px"></el-table-column>
							<el-table-column header-align="center" align="left" label="条款" width="120px"></el-table-column>
							<!-- <el-table-column header-align="center" align="left" label="运输货品" width="100px"> </el-table-column> -->
							<el-table-column header-align="center" align="left" label="船名和航次" width="150px"></el-table-column>
						</el-table>
					</div>
				</section>
			</div>
			<div class="orderCard" style="padding: 0 0 18px 0">
				<section class="order-section">
					<header class="order-section-header">
						<h2>联运服务</h2>
					</header>
					<div style="padding: 0 20px" v-if="transferServices.cityFullNameCn || transferServices.cityFullNameEn">
						<span style="padding: 0 18px 0 0">目的地：{{ transferServices.cityFullNameCn || transferServices.cityFullNameEn }}</span>
						<!-- <span style="padding: 0 18px 0 0;">驳船天数：{{transferServices.bargeDay}}</span> -->
						<span style="padding: 0 18px 0 0">运输天数：{{ transferServices.transitTime }}</span>
						<span style="padding: 0 18px 0 0">运输条款：{{ transferServices.transportTerms }}</span>
						<span style="padding: 0 18px 0 0">转运方式：{{ transferServices.transportMode }}</span>
					</div>
				</section>
			</div>
		</div>
	</div>
</template>
<script>
import { mapGetters } from 'vuex'
import { orderDetailInfoLong } from '@/api/exec/cosco'
import {
	feeItemClassList, // 费用类别
	feeItemInfo // 详情
} from '@/api/fin/feeitem'
export default {
	data() {
		return {
			//明细信息汇总
			detailInfo: {},
			//获取箱型汇总信息
			containerSumTableOptions: [],
			containerSumTableList: [],
			shippingLineList: [],
			transferServices: {}
		}
	},
	created() {
		this.getData()
	},
	computed: {
		...mapGetters(['dictMap', 'dictMapObj'])
	},
	filters: {
		yesNo(val) {
			return val === 'yes' ? '是' : val === 'no' ? '否' : ''
		}
	},
	methods: {
		// 获取详情
		getData() {
			let sapid = this.$route.query.sapid === 'undefined' ? '' : this.$route.query.sapid
			orderDetailInfoLong({ orderNo: this.$route.query.orderNo,sapid }).then(res => {
				this.detailInfo = res.data
				let data = res.data
				//初始话系统数据
				//1.箱型汇总信息自定义表头及数据
				this.containerSumTableList = []
				this.shippingLineList = []
				this.shippingLineList.push(res.data)
				console.log(this.shippingLineList)
				//定义第一行数据 记录可订舱数量
				let firstRowData = { customerColumnName: '可订舱数量' }
				let secondRowData = { customerColumnName: '总箱数' }
				// this.containerSumTableOptions.push({ label: '', prop: 'customerColumnName' })
				Object.assign(this.transferServices, res.data.transferServices[0] || {})
				if (data.orderContainerSummaries) {
					this.containerSumTableOptions = [{ label: '', prop: 'customerColumnName' }]
					data.orderContainerSummaries.map(item => {
						let tableName = item.cntrType
						Object.assign(firstRowData, { [tableName]: item['avaCount'] })
						Object.assign(secondRowData, { [tableName]: item['validTotalCount'] })
						this.containerSumTableOptions.push({ label: tableName, prop: tableName })
					})
					//将两行数据添加到table中
					this.containerSumTableList.push(firstRowData)
					this.containerSumTableList.push(secondRowData)
				}
			})
		},
		// 取消
		handleCancel() {
			this.$router.replace({
				path: 'orderSearch'
			})
		},
		arraySpanMethod({ row, column, rowIndex, columnIndex }) {
			// 附加费模板合并
			if (columnIndex == 0) {
				return [1, 8]
			}
		}
	},
	activated() {
		this.getData()
	}
}
</script>
<style lang="scss">
@import '/less/detail.scss';
@import '/less/index.scss';
.span-label,
.span-value {
	display: inline-block;
	line-height: 18px;
	padding: 8px 0;
	font-size: 14px;
	color: #4a4a4a;
}

.row-form.fullWidth {
	padding: 20px !important;
	& > div {
		display: inline-block;
		width: 300px;
		&.full-width {
			width: 100%;
		}
	}

	.el-col {
		margin-left: 25px;
	}
}

.el-form--label-top .el-form-item__label {
	padding: 0 0 0;
}
</style>
