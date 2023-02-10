<template>
	<div class="take-detail">
		<el-form ref="takeInfo" class="detail-form" :rules="rules" :model="createItem" label-width="65px">
			<div class="info-row">
				<div class="info-item">
					<span>工作号：</span>
					<span style="color:#1890ff;cursor:pointer;" @click="toFeeDetail">{{ detailData.orderNo }}</span>
				</div>
				<div class="info-item">
					<entrustUnitComp />
				</div>
				<div class="info-item">
					<span>提单状态：</span>
					<span>{{ detailData | blStatusFilter }}</span>
				</div>
				<div class="info-item" style="margin-right: 0">
					<span>取单状态：</span>
					<span>{{ detailData.takeStatus | takeStatusFilter }}</span>
				</div>
			</div>
		</el-form>
		<div class="mtLine"></div>
		<div class="take-file-info">
			<div class="file-cont" :class="workAssignShow ? 'abs-toogle' : ''" :style="{ height: `${fileInfoHeight}px` }">
				<el-form ref="takeInfo" class="detail-form" :rules="rules" :model="createItem" label-width="65px">
					<el-row>
						<el-col :span="6" class="info-li">
							<span>提单号：</span>
							<span>{{ detailData.blNo }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>柜型柜量：</span>
							<span>{{ detailData.containerInfo }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>出单方式：</span>
							<span>{{ detailData.blMode | blModeFilter }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>船司/陆港：</span>
							<span>{{ detailData.shipCarrierCode }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>订舱代理：</span>
							<span>{{ detailData.bkgAgentSupplierName }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>预计出发时间：</span>
							<span>{{ detailData.etdTime }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>实际出发时间：</span>
							<span>{{ detailData.tdTime }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>预计到达时间：</span>
							<span>{{ detailData.etaTime }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>船名/航次：</span>
							<span>{{ detailData.vessel }} {{ detailData.voyage }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>取单期限：</span>
							<span>{{ detailData.takeExpTime }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>付款期限：</span>
							<span>{{ detailData.payExpTime }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>提单所在地：</span>
							<span>{{ detailData.placeCompName }}</span>
						</el-col>
						<el-col :span="24" class="info-li">
							<span>OBD提单：</span>
							<span @click="handleDownload(item)" v-for="(item, index) in detailData.obdFiles" :key="index" style="margin:0 6px;color:#1890ff;cursor:pointer;">{{ item.fileName }} 下载</span>
						</el-col>
						<el-col :span="24" class="mt10">
							<el-form-item label="取单备注:" prop="remark">
								<el-input type="" size="mini" placeholder="请输入" v-model="createItem.remark" clearable :disabled="disabledState"></el-input>
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
				<FileList @getDetail="getDetail" :detailData="detailData" />
				<TransferTable v-if="transferArr.length > 0" :transferArr="transferArr" @transferChange="transferChange" />
				<div class="cancel-cont" v-if="detailData.isCancel === 'y'">
					<div class="take-tit-b">提单撤回</div>
					<el-row>
						<el-col :span="6" class="info-li">
							<span>撤回原因：</span>
							<span>{{ detailData.cancelReason | cancelReasonFilter }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>撤回人：</span>
							<span>{{ detailData.cancelEmployeeName }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>撤回时间：</span>
							<span>{{ detailData.cancelTime }}</span>
						</el-col>
						<el-col :span="24" class="info-li">
							<span>撤回备注：</span>
							<span>{{ detailData.cancelRemark }}</span>
						</el-col>
					</el-row>
				</div>
			</div>
			<!-- 参与人 -->
			<div class="work-assign-cont">
				<div class="work-assign-tit">参与人</div>
				<WorkAssign :orderWorkOptions="orderWorkOptions" :workAssignHeight="workAssignHeight" />
			</div>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import FileList from './fileM'
import WorkAssign from './workAssign'
import TransferTable from './transferTable'

export default {
	filters: {
		packageTypeFilter(packageType) {
			return getDictLabel('packageType', packageType)
		},
		blModeFilter(blMode) {
			return getDictLabel('blMode', blMode)
		},
		blTypeFilter(blType) {
			return getDictLabel('blType', blType)
		},
		cancelReasonFilter(cancelReason) {
			return getDictLabel('blCancelReason', cancelReason) || getDictLabel('blCancelEditReason', row.cancelReason)
		},
		takeStatusFilter(takeStatus) {
			return takeStatus === 'finish' ? '已取单' : '未取单'
		},
		blStatusFilter(detail) {
			return getDictLabel('woBlStatus', detail.blStatus)
		}
	},
	data() {
		return {
			rules: {},
			workAssignShow: false, // 参与人
			workAssignHeight: 0, // 参与人容器高度
			fileInfoHeight: 0
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		detailData: {
			type: Object,
			default: () => ({})
		},
		orderWorkOptions: {
			type: Array,
			default: () => []
		},
		transferArr: {
			type: Array,
			default: () => []
		}
	},
	created() {
		this.init()
	},
	mounted() {
		//恢复浏览器到最大化后，取单详情应该显示到底
		window.addEventListener('resize', this.getShipInfoHeight)
		this.$nextTick(() => {
			this.getShipInfoHeight()
		})
	},
	destroyed() {
		//恢复浏览器到最大化后，取单详情应该显示到底
		window.removeEventListener('resize', this.getShipInfoHeight)
	},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			dictMap: state => state.dict.dictMap
		}),
		disabledState() {
			return this.detailData.siCheck === 'y' && this.detailData.copySiCheck === 'y'
		}
	},
	watch: {},
	components: {
		FileList,
		WorkAssign,
		TransferTable
	},
	methods: {
		toFeeDetail() {
			let pathInfo = this.$router.resolve({
				path: `/finance/settlement/orderFee/${this.$route.query.orderNo}`,
				query: { businessBroad: this.detailData.businessType, orderNo: this.$route.query.orderNo }
			})
			window.open(pathInfo.href, '_blank')
		},
		transferChange() {
			this.$emit('transferChange')
		},
		getDetail() {
			this.$emit('getDetail')
		},

		// 下载
		handleDownload(row) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: row.fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = row.fileName
					link.click()
				})
		},
		changeFileNos(val) {
			this.$emit('changeFileNos', val)
		},
		getShipInfoHeight() {
			let bodyHeight = document.body.clientHeight
			let offsetTop = document.querySelector('.take-detail .take-file-info .file-cont') && document.querySelector('.take-detail .take-file-info .file-cont').getBoundingClientRect().top
			this.workAssignHeight = bodyHeight - offsetTop - 44
			this.fileInfoHeight = bodyHeight - offsetTop - 10
		},
		// 初始化
		init() {}
	}
}
</script>
<style>
.take-detail {
	padding: 0;
}
.take-detail .mtLine {
	height: 8px;
	background-color: #f5f7f9;
}
.take-detail .take-tit {
	font-size: 14px;
	line-height: 32px;
	height: 32px;
	border-bottom: 1px solid #e0e0e0;
	padding-left: 10px;
	font-weight: bold;
}
.take-detail .take-file-info {
	position: relative;
	width: 100%;
	display: flex;
	background-color: #f5f7f9;
}
.take-detail .take-file-info .file-cont {
	flex: 1;
	background-color: #ffffff;
	padding-bottom: 15px;
	overflow-y: auto;
}
.take-detail .take-file-info .work-assign-cont {
	/* display: flex; */
	width: 150px;
	background: #fff;
	margin-left: 10px;
	/* height: calc(100vh - 200px);
  overflow: hidden; */
}
.take-detail .take-file-info .work-assign-cont .mlLine {
	width: 8px;
	background-color: #f5f7f9;
	height: 100%;
}
.take-detail .take-file-info .work-assign-cont .work-assign-tit {
	font-weight: bold;
	line-height: 32px;
	border-bottom: 1px solid #e0e0e0;
	padding-left: 10px;
}
.take-detail .take-file-info .toggleWorkAssign {
	z-index: 3;
	position: absolute;
	top: 100px;
	right: 2px;
	line-height: 120px;
	height: 120px;
	width: 10px;
	background: rgba(215, 226, 255, 1);
	border-radius: 0px 4px 4px 0px;
	cursor: pointer;
	-webkit-transition: background 0.3s;
	transition: background 0.3s;
	-webkit-tap-highlight-color: transparent;
	color: #fff;
}
.take-detail .take-file-info .abs-toogle .toggleWorkAssign {
	right: 150px;
}
.take-detail .detail-form,
.take-detail .take-file-info .cancel-cont {
	padding: 10px;
}
.take-detail .info-li {
	line-height: 20px;
	margin-top: 8px;
}
.take-detail .mt10 {
	margin-top: 10px;
}
.take-detail .take-file-info .cancel-cont .take-tit-b {
	margin-top: 20px;
	font-weight: bold;
	font-size: 12px;
}
.take-detail .take-file-info .cancel-cont .take-tit-b.mb10 {
	margin-bottom: 10px;
}
.take-detail .take-file-info .el-form-item__label {
	padding-right: 1px;
	text-align: left;
}
.take-detail .info-row .info-item{
	display: inline-block;
	margin-right: 40px;
	line-height: 20px;
}
</style>
