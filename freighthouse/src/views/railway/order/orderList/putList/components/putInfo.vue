<template>
	<div class="rail-put-detail">
		<el-form class="detail-form" label-width="64px">
			<el-row>
				<el-col :span="6" class="info-li">
					<span>工作号：</span>
					<span style="color: #1890ff; cursor: pointer" @click="toFeeDetail">{{ detailData.orderNo }}</span>
				</el-col>
				<el-col :span="12" class="info-li">
					<entrustUnitComp />
				</el-col>
				<el-col :span="6" class="info-li">
					<span>提单状态：</span>
					<span>{{ detailData | blStatusFilter }}</span>
				</el-col>
			</el-row>
		</el-form>
		<div class="mtLine"></div>
		<div class="put-file-info">
			<div class="file-cont">
				<div class="cancel-cont" v-if="detailData.isCancel === 'y'">
					<div class="put-tit-b">提单撤回</div>
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
				<div class="putAudit-cont">
					<el-form ref="putInfo" class="detail-form" :rules="rules" :model="createItem" label-width="64px">
						<el-row class="mg0">
							<el-col :span="6" class="info-li">
								<span>提单号：</span>
								<span>{{ detailData.blNo }}</span>
							</el-col>
							<el-col :span="6" class="info-li">
								<span>提单类型：</span>
								<span>{{ detailData.blType | blTypeFilter }}</span>
							</el-col>
							<el-col :span="6" class="info-li">
								<span>出单方式：</span>
								<span>{{ detailData.blMode | blModeFilter }}</span>
							</el-col>
							<el-col :span="6" class="info-li">
								<span>柜型柜量：</span>
								<span>{{ detailData.containerInfo }}</span>
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
								<span>船名/航次：</span>
								<span>{{ detailData.vessel }} / {{ detailData.voyage }}</span>
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
								<span>委托单位结算方式：</span>
								<span>{{ detailData.custSettleType | custSettleTypeFilter }}</span>
							</el-col>
							<el-col :span="6" class="info-li">
								<span>委托单位信用额度：</span>
								<span>{{ detailData.custCreditRemaind }}</span>
							</el-col>
							<el-col :span="6" class="info-li">
								<span>委托单位账期：</span>
								<span>{{ detailData.custAccountPeriod }}</span>
							</el-col>
							<el-col :span="6" class="info-li">
								<span>提单所在地：</span>
								<span>{{ detailData.placeCompName }}</span>
							</el-col>
							<el-col v-if="['rail_export_fcl', 'rail_export_lcl'].includes(detailData.businessType)" :span="24" class="info-li">
								<span>SO/PO信息: </span>
								<span> {{ detailData.soInfo }} </span>
							</el-col>
							<el-col v-else :span="24" class="info-li">
								<span>SO/PO信息: </span>
								<span v-for="(item, index) in detailData.soList" :key="index" @click="handleViewSo(index)" style="color: #1890ff; cursor: pointer; margin-right: 10px"> {{ item.soFileName }} </span>
							</el-col>
							<el-col :span="24" class="info-li">
								<span>未放单原因: </span>
								<span style="word-break: break-all"> {{ detailData.unPutFeedbackReason }} </span>
							</el-col>
							<el-col :span="24" class="info-li">
								<span>未放单反馈时间: </span>
								<span> {{ detailData.unPutFeedbackTime }} </span>
							</el-col>
							<el-col v-if="detailData.blType === 'mbl'" :span="24" class="info-li">
								<span>OBD提单: </span>
								<span v-for="(item, index) in detailData.obdFiles" :key="index" @click="handleViewSiFile(index)" style="color: #1890ff; cursor: pointer; margin-right: 10px"> {{ item.fileName }} </span>
							</el-col>
							<el-col :span="24" class="mt10">
								<el-form-item class="rail-put-remark" label="放单备注：" prop="remark">
									<el-input id="remark-place-holder" size="mini" placeholder="请输入" v-model="createItem.remark" clearable :disabled="disabledState"></el-input>
								</el-form-item>
							</el-col>
						</el-row>
					</el-form>
					<div class="put-tit-flex">
						<div class="bold">放单</div>
						<div>
							<span
								>财务审核状态：<em class="blue">{{ detailData.auditStatus | auditStatusFilter }}</em></span
							>
							<span class="ml15"
								>客户是否同意放货：
								<em class="blue" :class="{ red: detailData.agreeReleaseStatus === 'pass' }">
									{{ detailData.isAgreeRelease | isAgreeReleaseFilter }}
									<template v-if="detailData.agreeReleaseStatus === 'pass'">(已特殊审批)</template>
								</em>
							</span>
						</div>
					</div>
					<el-row>
						<el-col :span="24" class="bold">财务审核</el-col>
						<el-col :span="6" class="info-li">
							<span>申请人：</span>
							<span>{{ detailData.applyEmployeeName }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>申请原因：</span>
							<span>{{ detailData.applyType | applyTypeFilter }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>申请时间：</span>
							<span>{{ detailData.applyTime }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>审核人：</span>
							<span>{{ detailData.auditEmployeeName }}</span>
						</el-col>
						<el-col :span="24" class="info-li">
							<span>审核时间：</span>
							<span>{{ detailData.auditTime }}</span>
						</el-col>
					</el-row>
					<el-row>
						<el-col :span="24" class="bold">客户状态</el-col>
						<el-col :span="6" class="info-li">
							<span>确认人：</span>
							<span>{{ detailData.auditEmployeeName }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>确认时间：</span>
							<span>{{ detailData.auditTime }}</span>
						</el-col>
					</el-row>
					<el-row>
						<el-col :span="24" class="bold">邮寄信息</el-col>
						<el-col :span="6" class="info-li">
							<span>类型：</span>
							<span>{{ detailData.blDeliveryMode | getDictLabelFilter('blDeliveryMode') }}</span>
						</el-col>
						<template v-if="detailData.blDeliveryMode !== 'self'">
							<el-col :span="6" class="info-li one-line-text" :title="detailData.receiveName">
								<span>收件人：</span>
								<span>{{ detailData.receiveName }}</span>
							</el-col>
							<el-col :span="6" class="info-li one-line-text" :title="detailData.receivePhone">
								<span>收件人电话：</span>
								<span>{{ detailData.receivePhone }}</span>
							</el-col>
							<el-col :span="24" class="info-li one-line-text" :title="detailData.receiveAddress">
								<span>收件方地址：</span>
								<span>{{ detailData.receiveAddress }}</span>
							</el-col>
							<el-col :span="24" class="info-li one-line-text" v-if="detailData.togetherExpress">
								<span>一起寄其他单证附件：</span>
								<span>{{ detailData.togetherExpress }}</span>
							</el-col>
							<el-col :span="24" class="info-li" :title="detailData.receiveRemark">
								<span>寄送备注：</span>
								<span>{{ detailData.receiveRemark }}</span>
							</el-col>
						</template>
					</el-row>
					<el-row v-if="detailData.agreeReleaseStatus === 'pass'">
						<el-col :span="24" class="bold">特殊申请</el-col>
						<el-col :span="24" class="info-li">MBL关联的HBL 并未同意放货，业务申请提前同意放该MBL并已审核通过。<em class="red">请先跟代理申明，必须收到hbl才能放单。</em></el-col>
						<el-col :span="6" class="info-li">
							<span>申请人：</span>
							<span>{{ detailData.agreeApplyEmployeeName }}</span>
						</el-col>
						<el-col :span="18" class="info-li">
							<span>申请时间：</span>
							<span>{{ detailData.agreeApplyTime }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>审批人：</span>
							<span>{{ detailData.agreeAuditEmployeeName }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>审批时间：</span>
							<span>{{ detailData.agreeAuditTime }}</span>
						</el-col>
						<el-col :span="6" class="info-li">
							<span>审批状态：</span>
							<span>{{ detailData.agreeReleaseStatus | getDictLabelFilter('agreeReleaseStatus') }}</span>
						</el-col>
					</el-row>
				</div>
				<!-- hbl不显示，邮寄不显示 -->
				<el-row v-if="detailData.blId != '0' && detailData.blType === 'mbl' && !isPostArr.includes(detailData.blMode)">
					<el-col :span="12">
						<div class="putAudit-cont">
							<div class="put-tit-flex">
								<div class="">
									<el-checkbox v-model="telexApplyStatus" :disabled="telexDownDisabled" @change="val => handleCheck(val, 'telexApplyStatus')"> 船东申请：（电放、SWB、云提单、目放） </el-checkbox>
								</div>
							</div>
							<el-row>
								<el-col :span="12">
									<span class="">申请人：</span>
									<el-select size="mini" placeholder="请选择" v-model="createItem.telexApplyEmployeeId" clearable disabled style="width: 70%">
										<el-option v-for="(item, index) in telexApplyEmployeeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
									</el-select>
								</el-col>
								<el-col :span="12" v-if="detailData.telexApplyTime">
									<span class="">申请时间：</span>
									<elDatePickerLimit size="mini" v-model="detailData.telexApplyTime" type="date" style="width: 70%" clearable disabled placeholder="请选择" value-format="yyyy-MM-dd" />
								</el-col>
							</el-row>
						</div>
					</el-col>
					<el-col :span="12">
						<div class="putAudit-cont">
							<div class="put-tit-flex">
								<div class="">
									<!-- detailData.telexDownStatus === 'y' || isTelexDisabled -->
									<el-checkbox v-model="telexDownStatus" :disabled="telexDownDisabled" @change="val => handleCheck(val, 'telexDownStatus')"> 船东完成放单（电放、SWB、云提单、目放） </el-checkbox>
								</div>
							</div>
							<el-row>
								<el-col :span="12">
									<span class="">确认人：</span>
									<el-select size="mini" placeholder="请选择" v-model="createItem.telexDownEmployeeId" clearable disabled style="width: 70%">
										<el-option v-for="(item, index) in telexDownEmployeeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
									</el-select>
								</el-col>
								<el-col :span="12" v-if="detailData.telexDownTime">
									<span class="">电放时间：</span>
									<elDatePickerLimit size="mini" v-model="detailData.telexDownTime" type="date" style="width: 70%" clearable disabled placeholder="请选择" value-format="yyyy-MM-dd" />
								</el-col>
							</el-row>
						</div>
					</el-col>
				</el-row>
				<div v-if="detailData.blType === 'hbl'">
					<FileList @getDetail="getDetail" :isTransfer="isTransfer" :detailData="detailData" />
				</div>
				<div v-if="detailData.blType === 'mbl'">
					<FileListMbl ref="fileListMbl" @file="setUser" :isTransfer="isTransfer" @getDetail="getDetail" @updateTelexDownStatus="updateTelexDownStatus" :detailData="detailData" />
				</div>
				<TransferTable v-if="transferArr.length > 0" :transferArr="transferArr" @transferChange="transferChange" />
			</div>
			<!-- 参与人 -->
			<div class="work-assign-cont">
				<div class="work-assign-tit">参与人</div>
				<WorkAssign :orderWorkOptions="orderWorkOptions" :workAssignHeight="workAssignHeight" />
			</div>
		</div>
		<div v-if="uploadShow">
			<FileUpload :blMode="detailData.blMode" :upType="upType" @close="uploadPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import FileList from './file'
import FileListMbl from './fileMbl'
import WorkAssign from './workAssign'
import FileUpload from './fileUploadShip'
import TransferTable from '../../takeList/components/transferTable'

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
		auditStatusFilter(auditStatus) {
			return store.state.order.finAuditStatusOptions[auditStatus]
		},
		isAgreeReleaseFilter(val) {
			return getDictLabel('isAgreeRelease', val)
		},
		applyTypeFilter(applyType) {
			return getDictLabel('blFinApplyType', applyType)
		},
		custSettleTypeFilter(custSettleType) {
			return getDictLabel('settleMode', custSettleType)
		},
		cancelReasonFilter(cancelReason) {
			return getDictLabel('blCancelReason', cancelReason) || getDictLabel('blCancelEditReason', cancelReason)
		},
		receiveFeeFilter(val) {
			return getDictLabel('feeSettleStatus', val)
		},

		payFeeFilter(val) {
			return getDictLabel('feeSettleStatus', val)
		},
		blStatusFilter(detail) {
			return getDictLabel('woBlStatus', detail.blStatus)
		}
	},
	data() {
		return {
			popType: 'telexApplyStatus',
			upType: 'mbl_telex_original',
			uploadShow: false,
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
			alertOffsetHeight: 0,
			telexApplyStatus: false,
			telexDownStatus: false,
			telexApplyEmployeeOptions: [],
			telexDownEmployeeOptions: [],
			isPostArr: ['original', 'jthdlzb', 'thzb'],
			fileItem: {},
			fileName: '',
			isTelexDisabled: false
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
		fileListData: {
			type: Array,
			default: () => []
		},
		transferArr: {
			type: Array,
			default: () => []
		},
		isTransfer: {
			type: Boolean,
			default: false
		}
	},
	created() {
		this.init(this.detailData)
	},
	mounted() {
		console.log('🚀 ~ this.detailData', this.detailData)
		this.$nextTick(() => {
			this.getShipInfoHeight()
		})
	},

	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			userId: state => state.user.userId,
			userName: state => state.user.name,
			dictMap: state => state.dict.dictMap
		}),
		disabledState() {
			return this.detailData.putStatus === 'finish'
		},
		// 财务审核通过且特殊审批通过或者客户同意放货
		agreeReleaseAndSpecialAuditPass() {
			return (this.detailData.agreeReleaseStatus === 'pass' || ['y', 'e'].includes(this.detailData.isAgreeRelease)) && this.detailData.auditStatus === 'pass'
		},
		telexDownDisabled() {
			if (this.detailData.telexDownStatus === 'y') {
				return true
			} else if (!this.agreeReleaseAndSpecialAuditPass) {
				return true
			} else {
				return false
			}
		}
	},
	watch: {
		detailData: {
			handler(newVal) {
				this.init(newVal)
			},
			deep: true,
			immediate: true
		}
	},
	components: {
		FileList,
		FileListMbl,
		WorkAssign,
		FileUpload,
		TransferTable
	},
	methods: {
		// 船东电放件失效后修改船东完成放单复选框选中状态
		updateTelexDownStatus() {
			// this.telexDownStatus = false
			// this.isTelexDisabled = false
			// this.$set(this.detailData, 'telexDownStatus', 'n')
		},
		toFeeDetail() {
			let pathInfo = this.$router.resolve({
				path: `/finance/settlement/orderFee/${this.$route.query.orderNo}`,
				query: { businessBroad: this.detailData.businessType, orderNo: this.$route.query.orderNo }
			})
			window.open(pathInfo.href, '_blank')
			// this.$router.push({ path: `/finance/settlement/orderFee/${this.$route.query.orderNo}`, query: { businessBroad: this.detailData.businessType, orderNo: this.$route.query.orderNo } })
		},
		transferChange() {
			this.$emit('transferChange')
		},
		setUser(fileType) {
			if (['mbl_telex_release_guarantee', 'mbl_telex_guarantee_swb', 'mbl_telex_guarantee_ibl', 'mbl_telex_guarantee_destination'].includes(fileType)) {
				this.telexApplyEmployeeOptions = [
					{
						label: this.userName,
						value: this.userId
					}
				]
				this.createItem.telexApplyEmployeeId = this.userId
				this.createItem.telexApplyEmployeeName = this.userName
			} else {
				this.telexDownEmployeeOptions = [
					{
						label: this.userName,
						value: this.userId
					}
				]
				this.createItem.telexDownEmployeeId = this.userId
				this.createItem.telexDownEmployeeName = this.userName
			}
		},
		handleViewSo(index) {
			let fileNo = this.detailData.soList[index].soFileNo
			let fileName = this.detailData.soList[index].soFileName
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
		handleViewSiFile(index) {
			let fileNo = this.detailData.obdFiles[index].fileNo
			let fileName = this.detailData.obdFiles[index].fileName
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
		getDetail() {
			this.$emit('getDetail', 'update')
		},
		uploadPopClose(val, file) {
			console.log('🚀 ~ file', val, file)
			//点取消时取消勾选  点确定保持勾选状态
			if (val === 'Cancel') {
				this[this.popType] = false
				this.createItem[this.popType] = 'n'
				// this.isTelexDisabled = false
			} else {
				// 上传附件后设置申请人和确认人
				if (file === 'file') {
					if (this.popType === 'telexApplyStatus') {
						this.telexApplyEmployeeOptions = [
							{
								label: this.userName,
								value: this.userId
							}
						]
						this.createItem.telexApplyEmployeeId = this.userId
						this.createItem.telexApplyEmployeeName = this.userName
					} else {
						this.telexDownEmployeeOptions = [
							{
								label: this.userName,
								value: this.userId
							}
						]
						this.createItem.telexDownEmployeeId = this.userId
						this.createItem.telexDownEmployeeName = this.userName
					}
				}
				this.getDetail()
				this.$refs.fileListMbl.getFileList()
				// // 船东电放件上传成功后，设置船东放单完成复选框disabled
				// if (this.upType === 'mbl_telex_original') {
				// 	this.isTelexDisabled = true
				// }
			}
			this.uploadShow = false
		},
		getShipInfoHeight() {
			let bodyHeight = document.body.clientHeight
			let offsetTop = document.querySelector('.rail-put-detail .put-file-info .file-cont').getBoundingClientRect().top
			console.log(bodyHeight, offsetTop, this.alertOffsetHeight)
			this.workAssignHeight = bodyHeight - offsetTop - 44
			this.fileInfoHeight = bodyHeight - offsetTop - 10
		},
		// 初始化设置船东申请人，申请时间，完成放单确认人，确认时间, 电放保函
		init(data) {
			data = data || this.detailData
			this.telexApplyEmployeeOptions = [
				{
					label: data.telexApplyEmployeeName,
					value: data.telexApplyEmployeeId
				}
			]
			this.telexDownEmployeeOptions = [
				{
					label: data.telexDownEmployeeName,
					value: data.telexDownEmployeeId
				}
			]
			this.telexApplyStatus = data.telexApplyStatus === 'y' ? true : false
			this.telexDownStatus = data.telexDownStatus === 'y' ? true : false
			this.fileItem = this.fileListData.find(item => item.fileType === 'release_guarantee')
			this.fileName = this.fileItem ? this.fileItem.fileName : ''
		},
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
		},
		// 勾选
		handleCheck(val, type) {
			this.popType = type
			if (type === 'telexDownStatus') {
				this.upType = 'mbl_telex_original'
			} else {
				this.upType = 'mbl_telex_release_guarantee'
			}
			if (val) {
				this.uploadShow = true
			}

			if (val) {
				this.createItem[type] = 'y'
			} else {
				this.createItem[type] = 'n'
			}
		},
		// 预览
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		}
	}
}
</script>
<style>
.rail-put-remark .el-form-item__label {
	padding: 0;
}
.rail-put-detail {
	padding: 0;
}
.rail-put-detail.invalid {
	pointer-events: none;
}

#remark-place-holder::placeholder {
	color: #4a4a4a;
}
.rail-put-detail.invalid .el-icon-postcard {
	pointer-events: auto;
}
.rail-put-detail .mtLine {
	height: 8px;
	background-color: #f5f7f9;
}
.rail-put-detail .put-tit {
	font-size: 14px;
	line-height: 32px;
	height: 32px;
	border-bottom: 1px solid #e0e0e0;
	padding-left: 10px;
	font-weight: bold;
}
.rail-put-detail .put-file-info {
	position: relative;
	width: 100%;
	display: flex;
	background-color: #f5f7f9;
}
.rail-put-detail .put-file-info .file-cont {
	flex: 1;
	background-color: #ffffff;
	padding-bottom: 15px;
	overflow-y: auto;
}
.rail-put-detail .put-file-info .work-assign-cont {
	/* display: flex; */
	width: 150px;
	background: #fff;
	margin-left: 10px;
	/* height: calc(100vh - 200px);
  overflow: hidden; */
}
.rail-put-detail .put-file-info .work-assign-cont .mlLine {
	width: 8px;
	background-color: #f5f7f9;
	height: 100%;
}
.rail-put-detail .put-file-info .work-assign-cont .work-assign-tit {
	font-weight: bold;
	line-height: 32px;
	border-bottom: 1px solid #e0e0e0;
	padding-left: 10px;
}
.rail-put-detail .put-file-info .toggleWorkAssign {
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
.rail-put-detail .put-file-info .abs-toogle .toggleWorkAssign {
	right: 150px;
}
.rail-put-detail .detail-form,
.rail-put-detail .put-file-info .cancel-cont {
	padding: 10px;
}
.rail-put-detail .info-li {
	line-height: 20px;
	margin-top: 4px;
}
.rail-put-detail .info-li em.red {
	font-style: normal;
	color: #ff4400;
}
.rail-put-detail .mt10 {
	margin-top: 10px;
}
.rail-put-detail .put-file-info .cancel-cont .put-tit-b {
	margin-top: 10px;
	font-weight: bold;
	font-size: 12px;
}
.rail-put-detail .put-file-info .cancel-cont .put-tit-b.mb10 {
	margin-bottom: 10px;
}

.rail-put-detail .put-file-info .putAudit-cont {
	border-radius: 2px;
	border: 1px solid #e0e0e0;
	margin: 10px;
}
.rail-put-detail .put-file-info .putAudit-cont .put-tit-flex {
	background-color: #f5f7f9;
	display: flex;
	line-height: 30px;
	height: 30px;
	justify-content: space-between;
	padding: 0 10px;
}

.rail-put-detail .put-file-info .putAudit-cont .put-tit-flex .ml15 {
	margin-left: 15px;
}
.rail-put-detail .put-file-info .putAudit-cont .put-tit-flex .blue {
	font-style: normal;
	color: #1890ff;
}
.rail-put-detail .put-file-info .putAudit-cont .put-tit-flex .blue.red {
	color: #ff4400;
}
.rail-put-detail .put-file-info .putAudit-cont .bold {
	font-weight: bold;
}
.rail-put-detail .put-file-info .putAudit-cont .mt15 {
	margin-top: 15px;
}
.rail-put-detail .put-file-info .putAudit-cont .el-row {
	margin: 10px;
}
.rail-put-detail .put-file-info .putAudit-cont .el-row.mg0 {
	margin: 0;
}
.rail-put-detail .put-file-info .putAudit-cont .el-input--mini .el-input__icon {
	line-height: 20px;
}
.one-line-text {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>
