<template>
	<el-alert type="warning" :closable="true" class="orange changeStyle book-alert">
		<template slot="title">
			<!-- <i class="tag-change">改</i> -->
			<span class="txt">
				<template>该订单有特殊套约信息，请注意。</template>
				<el-popover placement="top" width="680" trigger="click" class="changeShip" v-model="contractTempVisible">
					<div class="temp-title">套约信息</div>
					<div class="temp-list-cont">
						<div class="temp-list-tit">
							<div class="item w80">岗位</div>
							<div class="item content">特殊要求内容</div>
						</div>
						<div class="temp-list-table">
							<div class="temp-list-row">
								<div class="item w80">订舱</div>
								<div class="content">
									<div class="item-row">
										<div class="label">Shipper(发货人)</div>
										<div class="value">{{infoData.bkgShipper}}</div>
									</div>
									<div class="item-row">
										<div class="label">Consignee(收货人)</div>
										<div class="value">{{infoData.bkgConsignee}}</div>
									</div>
									<div class="item-row">
										<div class="label">Notify Party(通知人)</div>
										<div class="value">{{infoData.bkgNotify}}</div>
									</div>
									<div class="item-row">
										<div class="label">品名</div>
										<div class="value">{{infoData.bkgCargoName}}</div>
									</div>
									<div class="item-row">
										<div class="label">限重</div>
										<div class="value">{{infoData.bkgCargoWeight}}</div>
									</div>
									<div class="item-row">
										<div class="label">补料要求</div>
										<div class="value">{{infoData.bkgRemark}}</div>
									</div>
								</div>
							</div>
							<div class="temp-list-row">
								<div class="item w80">单证</div>
								<div class="content">
									<div class="item-row">
										<div class="label">Shipper(发货人)</div>
										<div class="value">{{infoData.blShipper}}</div>
									</div>
									<div class="item-row">
										<div class="label">Consignee(收货人)</div>
										<div class="value">{{infoData.blConsignee}}</div>
									</div>
									<div class="item-row">
										<div class="label">Notify Party(通知人)</div>
										<div class="value">{{infoData.blNotify}}</div>
									</div>
									<div class="item-row">
										<div class="label">品名</div>
										<div class="value">{{infoData.blCargoName}}</div>
									</div>
									<div class="item-row">
										<div class="label">限重</div>
										<div class="value">{{infoData.blCargoWeight}}</div>
									</div>
									<div class="item-row">
										<div class="label">补料要求</div>
										<div class="value">{{infoData.blSiRemark}}</div>
									</div>
								</div>
							</div>
							<div class="temp-list-row">
								<div class="item w80">财务</div>
								<div class="content">
									<div class="item-row">
										<div class="label">付款要求</div>
										<div class="value">{{infoData.payRemark}}</div>
									</div>
								</div>
							</div>
							<div class="temp-list-row">
								<div class="item w80">其他</div>
								<div class="content">
									<div class="item-row">
										<div class="label">其他要求</div>
										<div class="value">{{infoData.otherRemark}}</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="operate-group-popover">
						<el-button type="default" size="mini" class="btn-close-popover" @click="contractTempVisible = false">关闭</el-button>
					</div>
					<em slot="reference" class="info">查看详情</em>
				</el-popover>
			</span>
		</template>
	</el-alert>
</template>
<script>
import { mapState, mapMutations } from 'vuex'

export default {
	filters: {},
	data() {
		return {
			infoData: {},
			contractTempVisible: false
		}
	},
	props: {
		contractTempInfo: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
	},

	mounted() {},
	activated() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
		})
	},
	components: {},
	watch: {
		contractTempInfo: {
			handler(newVal, oldVal) {
				this.infoData = newVal
			},
			deep: true,
			immediate: true
		}
	},
	methods: {
	}
}
</script>
<style lang="scss" scoped>
.temp-list-cont{
	font-size: 12px;
	margin-top: 10px;
	.temp-list-tit{
		background: #f8f9fd;
		height: 24px;
		line-height: 24px;
		border: 1px solid #e9e9e9;
		display: flex;
		.item{
			padding-left: 10px;
			text-align: center;
			&.w80{
				width: 80px;
			}
			&.content{
				flex: 1;
				border-left: 1px solid #e9e9e9;
			}
		}
	}
	.temp-list-table{
		overflow: hidden;
		.temp-list-row{
			border: 1px solid #e9e9e9;
			border-bottom: 0;
			border-top: 0;
			width: 100%;
			display: table;
			.item{
				text-align: center;
				display: table-cell;
				border-bottom: 1px solid #e9e9e9;
				&.w80{
					width: 80px;
					vertical-align: middle;
				}
			}
			.content{
				text-align: center;
				display: table-cell;
				border-left: 1px solid #e9e9e9;
				.item-row{
					display: table;
					width: 100%;
					.label{
						padding: 5px;
						display: table-cell;
						width: 30%;
						text-align: center;
						vertical-align: middle;
						border-right: 1px solid #e9e9e9;
						border-bottom: 1px solid #e9e9e9;
					}
					.value{
						padding: 5px;
						display: table-cell;
						width: 70%;
						text-align: left;
						border-bottom: 1px solid #e9e9e9;
					}
				}
			}
		}
	}
}
</style>
