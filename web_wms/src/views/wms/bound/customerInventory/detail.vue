<template>
	<div class="detail-wrap">
		<div class="detail-header">
			<div class="header-left">出库单明细</div>
			<div class="header-right">
				<el-checkbox style="margin-right: 40px" size="mini" :true-label="'yes'" :false-label="'no'" v-model="formInline.hasDischargePicture" disabled>装货拍照</el-checkbox>
				<el-button @click="handleCancel" size="mini">返回</el-button>
			</div>
		</div>
		<!-- <div class="top-form">
			<el-checkbox style="margin-right: 40px" size="mini" true-label="yes" false-label="no" v-model="formInline.hasCopyNo" disabled>是否抄号</el-checkbox>
			<el-checkbox style="margin-right: 40px" size="mini" true-label="yes" false-label="no" v-model="formInline.hasCarrayOverweight" disabled>是否提柜过磅</el-checkbox>
			<el-checkbox style="margin-right: 40px" size="mini" true-label="yes" false-label="no" v-model="formInline.hasReturnOverweight" disabled>是否还柜过磅</el-checkbox>
			<el-checkbox style="margin-right: 40px" size="mini" true-label="yes" false-label="no" v-model="formInline.hasDisinfect" disabled>是否消毒放药</el-checkbox>
			<el-checkbox style="margin-right: 40px" size="mini" true-label="yes" false-label="no" v-model="formInline.hasDoubleLayerWinch" disabled>使用双层缆盘</el-checkbox>
			<el-checkbox style="margin-right: 40px" size="mini" true-label="yes" false-label="no" v-model="formInline.hasThreeLayerWinch" disabled>使用三层缆盘</el-checkbox>
		</div> -->
		<div class="table-wrap">
			<!-- <div class="table-title">
				<div class="title-left">出库单货物明细</div>
				<div class="title-right">
					<span @click="handleFold" class="arrow-btn">{{ arrowText }} <i :class="arrowDown ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i></span>
				</div>
			</div> -->
			<!-- <div v-if="arrowDown" class="table-content"> -->
				<el-table :data="formInline.list" border fit>
					<el-table-column align="center" prop="outboundNo" label="出库号" width="180">
						<template slot-scope="scope">
							<span @click="outboundDetail(scope.row.outboundOrderId)" style="color: #3e80f5; cursor: pointer">{{ scope.row.outboundNo }}</span>
						</template>
					</el-table-column>
					<el-table-column align="center" prop="contractNo" label="合同号" min-width="120"> </el-table-column>
					<el-table-column align="center" prop="workOrderNo" label="客户入仓单号" min-width="120"> </el-table-column>
					<el-table-column align="center" prop="inboundNo" label="入库号" min-width="150"> </el-table-column>
					<el-table-column align="center" prop="outboundTime" label="出库时间" min-width="150"> </el-table-column>
					<el-table-column align="center" prop="inboundTime" label="入库时间" min-width="150"> </el-table-column>
					<el-table-column align="center" prop="licensePlate" label="装货车牌" min-width="120"> </el-table-column>
					<el-table-column align="center" prop="beforeQuantity" label="出库前库存数" min-width="120"> </el-table-column>
					<el-table-column align="center" prop="outboundQuantity" label="出库数" min-width="120"> </el-table-column>
					<el-table-column align="center" prop="afterQuantity" label="出库后库存数" min-width="120"> </el-table-column>
				</el-table>
			<!-- </div> -->
		</div>
	</div>
</template>
<script>
import { queryOutboundOrder } from '@/api/wms'
import { mapGetters } from 'vuex'
export default {
	data() {
		return {
			arrowText: '收起',
			arrowDown: true,

			formInline: {
				hasDischargePicture: 'no',
				hasCopyNo: 'no',
				hasCarrayOverweight: 'no',
				hasReturnOverweight: 'no',
				hasDisinfect: 'no',
				hasDoubleLayerWinch: 'no',
				hasThreeLayerWinch: 'no',
				list: []
			}
		}
	},
	activated() {
    this.getDetail()
  },
	computed: {
		...mapGetters(['dictMap', 'dictMapObj'])
	},
	methods: {
		// 出库明细
		outboundDetail(outboundOrderId) {
      let query = {
        type: 'detail',
        title: '出库信息详情',
        id: outboundOrderId,
        activeName: 'baseInfo'
      }
			this.$router.push({ path: '/wms/bound/outBoundDetail', query })
		},
		// 获取详情
		getDetail() {
			queryOutboundOrder({ inboundOrderId: this.$route.query.inboundOrderId }).then(res => {
				if (res.code === 0) {
					this.formInline.list = res?.data
					if (this.formInline.list.length > 0) {
						let checkbox = this.formInline.list[0]
						this.formInline.hasDischargePicture = checkbox.hasDischargePicture
						this.formInline.hasCopyNo = checkbox.hasCopyNo
						this.formInline.hasCarrayOverweight = checkbox.hasCarrayOverweight
						this.formInline.hasReturnOverweight = checkbox.hasReturnOverweight
						this.formInline.hasDisinfect = checkbox.hasDisinfect
						this.formInline.hasDoubleLayerWinch = checkbox.hasDoubleLayerWinch
						this.formInline.hasThreeLayerWinch = checkbox.hasThreeLayerWinch
					}
				}
			})
		},
		// 取消
		handleCancel() {
			this.$router.push({ name: 'CustomerInventory' })
		},

		// 点击收起
		handleFold() {
			this.arrowDown = !this.arrowDown
			this.arrowText = this.arrowDown ? '收起' : '展开'
		}
	}
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
.detail-wrap {
	min-height: calc(100vh - 62px);
	background: #ffffff;
	.el-checkbox__label {
		font-size: 12px;
	}
	.table-wrap {
		margin: 10px;
		border: none !important;
		.table-content {
			padding: 16px;
			th {
				font-size: 12px;
				font-weight: bold;
				color: #222222;
			}
			span {
				font-size: 12px;
			}
			.el-form-item,
			.el-form-item__content,
			.el-select {
				display: block;
			}
			.el-form-item {
				margin: 0;
			}
			.el-table--border th,
			.el-table--border td {
				border-right: 1px solid #dfe6ec !important;
				height: 30px;
				padding: 0;
			}
			.delete-btn {
				color: #cd4130;
				cursor: pointer;
				margin-left: 16px;
			}
			.modify-btn {
				color: #e9851f;
				cursor: pointer;
			}
			.save-btn {
				color: #3e80f5;
				cursor: pointer;
			}
		}
		.table-title {
			background: #ebeef3;
			height: 40px;
			display: flex;
			justify-content: space-between;
			padding: 10px 15px;
			.title-left {
				font-size: 12px;
				font-weight: bold;
				color: #222222;
			}
			.title-right {
				display: flex;
				align-items: center;
				.add-btn {
					display: inline-block;
					width: 56px;
					height: 28px;
					line-height: 28px;
					background: #3e80f5;
					border-radius: 2px;
					margin-right: 40px;
					color: #ffffff;
					text-align: center;
					cursor: pointer;
				}
				.arrow-btn {
					cursor: pointer;
				}
			}
		}
	}
	.top-form {
		padding: 24px 16px;
		.el-form-item {
			&.w100 {
				width: calc(100% - 20px);
			}
			width: calc((100% - 40px) / 3);
			.el-form-item__content {
				width: calc(100% - 85px);
				.el-select,
				.el-date-editor--datetime {
					width: 100%;
				}
			}
		}
	}
	.detail-header {
		padding: 10px 16px;
		height: 40px;
		border-bottom: 1px solid #d9d9d9;
		display: flex;
		justify-content: space-between;
		align-items: center;
		.header-left {
			font-size: 14px;
			font-weight: bold;
			color: #222222;
		}
	}
}
</style>
