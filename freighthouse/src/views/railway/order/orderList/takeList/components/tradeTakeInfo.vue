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
				<!-- <el-col :span="2" class="info-li"> </el-col> -->
				<div class="info-item" style="margin-right: 0">
					<span>取单状态：</span>
					<span>{{ detailData.takeStatus | takeStatusFilter }}</span>
				</div>
			</div>
		</el-form>
		<div class="mtLine"></div>
		<div class="take-file-info">
			<div class="file-cont" :class="workAssignShow ? 'abs-toogle' : ''" :style="{ height: `${fileInfoHeight}px` }">
				<!-- <div class="toggleWorkAssign" @click="toggleWorkAssign">
          <i class="hamburger el-icon-arrow-right" :class="{'is-active':true}"></i>
        </div> -->
				<el-form ref="takeInfo" class="detail-form" :rules="rules" :model="createItem" label-width="65px">
					<el-row>
						<el-col :span="6" class="info-li">
							<span>提单号：</span>
							<span>{{ detailData.blNo }}</span>
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

						<el-col :span="24" class="mt10">
							<el-form-item label="取单备注:" prop="remark">
								<el-input type="" size="mini" placeholder="请输入" v-model="createItem.remark" clearable :disabled="disabledState"></el-input>
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
				<FileList @getDetail="getDetail" @changeFileNos="changeFileNos" :fileListData="fileListData" :detailData="detailData" />
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
				<!-- <div class="mlLine"></div> -->
				<div class="work-assign-tit">参与人</div>
				<WorkAssign :orderWorkOptions="orderWorkOptions" :workAssignHeight="workAssignHeight" />
			</div>
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import FileList from './tradeFile'
import WorkAssign from './workAssign'

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
		}
	},
	data() {
		return {
			rules: {},
			pickerOptions: {
				disabledDate(date) {
					//disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
					return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			workAssignShow: false, // 参与人
			workAssignHeight: 0, // 参与人容器高度
			fileInfoHeight: 0,
			alertOffsetHeight: 0
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
		fileListData: {
			type: Array,
			default: () => []
		},
		orderWorkOptions: {
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
			// this.alertOffsetHeight = document.querySelector('.el-alert').offsetHeight
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
	watch: {
		// 'detailData.isCancel'(newVal, oldVal) {
		//   if (newVal) {
		//     this.alertOffsetHeight = document.querySelector('.el-alert').offsetHeight
		//     this.getShipInfoHeight()
		//   }
		// }
	},
	components: {
		FileList,
		WorkAssign
	},
	methods: {
		toFeeDetail() {
			let pathInfo = this.$router.resolve({
				path: `/finance/settlement/orderFee/${this.$route.query.orderNo}`,
				query: { businessBroad: this.detailData.businessType, orderNo: this.$route.query.orderNo }
			})
			window.open(pathInfo.href, '_blank')
			// this.$router.push({ path: `/finance/settlement/orderFee/${this.$route.query.orderNo}`, query: { businessBroad: this.detailData.businessType, orderNo: this.$route.query.orderNo } })
		},
		getDetail() {
			this.$emit('getDetail')
		},
		changeFileNos(val) {
			this.$emit('changeFileNos', val)
		},
		getShipInfoHeight() {
			let bodyHeight = document.body.clientHeight
			let offsetTop = document.querySelector('.take-detail .take-file-info .file-cont') && document.querySelector('.take-detail .take-file-info .file-cont').getBoundingClientRect().top
			console.log('🚀 ~ offsetTop', offsetTop)
			this.workAssignHeight = bodyHeight - offsetTop - 44
			this.fileInfoHeight = bodyHeight - offsetTop - 10
		},
		// 初始化
		init() {},
		// 选择时间
		handleChangeTdTime(val) {
			if (!val) this.createItem.tdTime = ''
		},
		// 选择时间
		handleChangeEtaTime(val) {
			if (!val) this.createItem.etaTime = ''
		},
		toggleWorkAssign() {
			this.workAssignShow = !this.workAssignShow
		}
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
