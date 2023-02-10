<template>
	<div class="siDn-container">
		<el-alert type="warning" class="red" v-if="detailData.dnCheckStatus === 'refuse'">
			<template slot="title">
				<i class="tag-cancel-red">拒</i>
				<span class="txt">
					该提单已审核拒绝，请及时修正
				</span>
			</template>
		</el-alert>
		<div class="tab tab-flex">
			<div><b>账单详情</b></div>
			<div class="el-button-group">
				<el-button size="mini" type="default" @click="handleBack">返回</el-button>
				<el-button size="mini" type="default" @click="handleDnPass" v-if="detailData.dnCheckStatus === 'submit'">通过</el-button>
				<el-button size="mini" type="default" @click="handleDnRefuse" v-if="detailData.dnCheckStatus === 'submit'">拒绝</el-button>
			</div>
		</div>
		<el-row class="siDn-detail">
			<el-col :span="6" class="info-li">
				<span>工作号：</span>
				<span>{{ detailData.orderNo }}</span>
			</el-col>
			<el-col :span="6" class="info-li">
				<span>提单号：</span>
				<span>{{ detailData.blNo }}</span>
			</el-col>
			<el-col :span="6" class="info-li">
				<span>提单类型：</span>
				<span>{{ detailData.blType | blTypeFilter }}</span>
			</el-col>
			<el-col :span="6" class="info-li">
				<span>船公司：</span>
				<span>{{ detailData.shipCarrierCode }}</span>
				<el-button type="text" size="mini" style="margin-left: 5px;" @click="getShippingCarrierUrl(detailData.shipCarrierCode)">船司官网</el-button>
			</el-col>
			<el-col :span="6" class="info-li">
				<span>预计开船时间：</span>
				<span>{{ detailData.etdTime }}</span>
			</el-col>
			<el-col :span="6" class="info-li">
				<span>实际开船时间：</span>
				<span>{{ detailData.tdTime }}</span>
			</el-col>
			<el-col :span="6" class="info-li">
				<span>委托单位：</span>
				<span>{{ detailData.custName }}</span>
			</el-col>
			<el-col :span="6" class="info-li">
				<span>订舱代理：</span>
				<span>{{ detailData.bkgAgentSupplierName }}</span>
			</el-col>
			<el-col :span="6" class="info-li">
				<span>船名：</span>
				<span>{{ detailData.vessel }}</span>
			</el-col>
			<el-col :span="6" class="info-li">
				<span>航次：</span>
				<span>{{ detailData.voyage }}</span>
			</el-col>
			<el-col :span="6" class="info-li">
				<span>免用免堆：</span>
				<span>{{ detailData.freetimeSys }}</span>
				<!-- <span>{{`场内${detailData.podFreeIn},场外${detailData.podFreeOut},综合${detailData.podFree}`}}</span> -->
			</el-col>

			<el-col :span="24" class="info-li info-li-flex">
				<span class="siFile-name">补料要求：</span>
				<div v-html="detailData.siRemark" class="siRemark-cont"></div>
			</el-col>
			<el-col :span="24" class="info-li">
				<span>备注信息：</span>
				<span class="si-remark">{{ detailData.dnCheckApplyRemark }}</span>
			</el-col>
			<el-col :span="24" class="info-li">
				<span>费用账单：</span>
				<span
					><el-button type="text" size="mini" @click="handleView(fileItem)" class="underline">{{ fileItem.fileName }}</el-button></span
				>
			</el-col>
		</el-row>
		<div class="siDn-detail" v-if="detailData.dnCheckStatus === 'refuse'">
			<div class="si-tit-b">审核拒绝</div>
			<el-row>
				<el-col :span="12" class="info-li">
					<span>拒绝原因：</span>
					<span>{{ detailData.dnRefuseReason | dnRefuseReasonFilter }}</span>
				</el-col>
				<!-- <el-col :span="6" class="info-li">
          <span>拒绝人：</span>
          <span>xxx</span>
        </el-col>
        <el-col :span="6" class="info-li">
          <span>拒绝时间：</span>
          <span>xxx</span>
        </el-col> -->
				<el-col :span="12" class="info-li">
					<span>拒绝备注：</span>
					<span>{{ detailData.dnRefuseRemark }}</span>
				</el-col>
			</el-row>
		</div>
		<!-- 审核拒绝弹窗 -->
		<div v-if="dnRefuseShow">
			<DnRefuse :detailData="detailData" @close="dnRefusePopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { blSiDnInfo, blSiDnPass, blSiDnRefuse, blFileList } from '@/api/order/bl'
import DnRefuse from './components/dnRefuse'
export default {
	mixins: [routerMixin],
	filters: {
		blModeFilter(blMode) {
			return getDictLabel('blMode', blMode)
		},
		blTypeFilter(blType) {
			return getDictLabel('blType', blType)
		},
		dnRefuseReasonFilter(dnRefuseReason) {
			return getDictLabel('dnPriceRefuseReason', dnRefuseReason)
		}
	},
	data() {
		return {
			detailData: {},
			dnRefuseShow: false,
			fileList: [], // 附件列表
			fileItem: {}, //费用账单
			cTimestamp: 0
		}
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.init()
	},
	activated() {
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.init()
		}
	},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		DnRefuse
	},
	methods: {
		// 船公司官网
		getShippingCarrierUrl(carrierCode) {
			if (!carrierCode) return
			this.$store.dispatch('order/getShippingCarrierWebUrl', {carrierCode})
		},
		// 初始化
		init() {
			this.getDetail()
			this.getFileList()
		},
		// 附件列表
		getFileList() {
			let data = {
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				blId: this.$route.query.blId,
				module: 'PRICING_AUDIT'
			}
			blFileList(data).then(res => {
				this.fileList = res.data
				let sItem = this.fileList.find(item => item.fileType === 'dn')
				this.fileItem = sItem ? sItem : {}
			})
		},
		// 获取详情
		getDetail() {
			blSiDnInfo({
				oid: this.$route.query.oid,
				orderNo: this.$route.query.orderNo
			}).then(res => {
				this.detailData = { ...res.data }
			})
		},
		// 费用账单预览
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},
		// 通过
		handleDnPass() {
			this.$confirm('是否确认费用审核通过?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return this.dnPass()
				})
				.catch(() => {})
		},
		// 通过
		dnPass() {
			let data = {
				oid: this.$route.query.oid,
				blId: this.$route.query.blId,
				orderNo: this.$route.query.orderNo
			}
			blSiDnPass(data).then(res => {
				this.$message({
					type: 'success',
					message: '审核通过成功',
					duration: 1000,
					onClose: () => {
						this.$router.push({
							path: 'siDnList'
						})
					}
				})
			})
		},
		// 拒绝弹窗
		handleDnRefuse() {
			this.dnRefuseShow = true
		},
		// 拒绝弹窗关闭回调
		dnRefusePopClose(action, value) {
			if (action === 'Confirm') {
				this.dnRefuse(value)
			} else {
				this.dnRefuseShow = false
			}
		},
		// 拒绝
		dnRefuse(value) {
			let data = {
				oid: this.$route.query.oid,
				blId: this.$route.query.blId,
				orderNo: this.$route.query.orderNo,
				refuseReason: value.refuseReason,
				refuseRemark: value.refuseRemark
			}
			blSiDnRefuse(data).then(res => {
				this.$message({
					type: 'success',
					message: '审核拒绝成功',
					duration: 1000,
					onClose: () => {
						this.dnRefuseShow = false
						this.$router.push({
							path: 'siDnList'
						})
					}
				})
			})
		},
		// 返回
		handleBack() {
			this.$router.push({
				path: 'siDnList'
			})
		}
	}
}
</script>
<style>
.siDn-detail .info-li.info-li-flex {
	display: flex;
	flex-wrap: nowrap;
}
.siDn-detail .info-li.info-li-flex .siFile-name {
	display: block;
	width: 60px;
}
.siDn-detail .info-li.info-li-flex .siRemark-cont {
	line-height: 1.5;
	padding: 0;
	flex: 1;
	max-height: 200px;
	overflow-y: auto;
}
.siDn-detail .info-li.info-li-flex .siRemark-cont table {
	border-top: 1px solid #dfe6ec;
	border-left: 1px solid #dfe6ec;
}
.siDn-detail .info-li.info-li-flex .siRemark-cont table td {
	border-right: 1px solid #dfe6ec;
	border-bottom: 1px solid #dfe6ec;
	padding: 5px 10px;
}

.si-remark {
	word-break: break-all;
}
.siDn-container {
	background-color: #fff;
	margin: 10px 0 10px 16px;
}
.siDn-container .tab {
	padding: 0 10px;
	height: 40px;
	line-height: 40px;
	display: flex;
	justify-content: space-between;
	border-bottom: 1px solid #e0e0e0;
}
.siDn-container .tab .el-button-group {
	margin-top: 5px;
}
.siDn-detail {
	padding: 10px;
}
.siDn-detail .info-li {
	line-height: 20px;
	margin-top: 8px;
}
.siDn-detail .si-tit-b {
	font-weight: bold;
	font-size: 14px;
}
.siDn-detail .si-tit-b.mb10 {
	margin-bottom: 10px;
}
</style>
