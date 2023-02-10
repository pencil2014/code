<template>
	<div class="edit-row" id="Book">
		<div class="edit-container so">
			<div id="tableCont" v-if="!isBulkRo">
				<div class="row-tit so">
					<span class="tit ft12">SO信息</span>
					<div class="row-tit-operate">
						订舱状态： <span class="mr10 bkg-status"><i class="el-icon-info"></i>{{ orderInfoData.bkgStatus | bkgStatusFilter }}</span> 放舱要求：<span :class="{ red: releaseStatus === '通知放舱', green: releaseStatus === '即时放舱' }"
							><i class="el-icon-info"></i>{{ releaseStatus }}</span
						>
						<div class="btn-groups">
							<!-- 业务 -->
							<template v-if="isBd">
								<ButtonTip btnType="default" :btnDisabled="submitDisabled || isFinish" btnText="通知放舱" tipContent="服务项进度为已完成，不允许该操作" class="operateBtn-tip ml10" @click="handleNotifyRelease"> </ButtonTip>
								<!-- <el-button size="mini" type="default" class="ml10" @click="handleNotifyRelease" :disabled="submitDisabled || isFinish || orderInfoData.bkgStatus !== 'pass'">通知放舱</el-button> -->
							</template>
							<!-- 操作 -->
							<template v-if="isOp">
								<el-tooltip effect="dark" placement="top-start" v-if="!bookReleaseCheck" :content="bookReleaseCheckMsg">
									<el-button size="mini" type="primary" class="ml10 btn-disabled-style">放舱给客户</el-button>
								</el-tooltip>
								<ButtonTip v-else btnType="primary" :btnDisabled="submitDisabled || isFinish" btnText="放舱给客户" tipContent="服务项进度为已完成，不允许该操作" class="operateBtn-tip ml10" @click="handleRelease"> </ButtonTip>
								<!-- <ButtonTip btnType="primary" btnText="放舱给客户" tipContent="服务项进度为已完成，不允许该操作" class="operateBtn-tip ml10" @click="handleRelease"> </ButtonTip> -->
								<!-- <el-button size="mini" type="primary" class="ml10" @click="handleRelease" :disabled="submitDisabled || isFinish" v-else>放舱给客户</el-button> -->
								<ButtonTip btnType="danger" :btnDisabled="submitDisabled || isFinish" btnText="取消放舱给客户" tipContent="服务项进度为已完成，不允许该操作" class="operateBtn-tip ml10" @click="handleReleaseCancel"> </ButtonTip>
								<!-- <el-button size="mini" type="danger" class="ml10" @click="handleReleaseCancel" :disabled="submitDisabled || isFinish">取消放舱给客户</el-button> -->
								<el-button size="mini" type="default" class="ml10" @click="handleShowMailPop">邮件发送</el-button>
								<ButtonTip btnType="default" :btnDisabled="orderInfoData.bkgStatus !== 'book_release'" btnText="输出SO" tipContent="订舱状态不是已放舱，不允许该操作" class="operateBtn-tip ml10" @click="handleExportSo"> </ButtonTip>
								<!-- <el-button size="mini" type="default" class="ml10" @click="handleExportSo" :disabled="orderInfoData.bkgStatus !== 'book_release'">输出SO</el-button> -->
								<el-button size="mini" type="default" class="ml10" @click="handleCommand">输出订舱托书</el-button>
								<ButtonTip btnType="danger" :btnDisabled="submitDisabled || isFinish" btnText="解绑SO" tipContent="服务项进度为已完成，不允许该操作" class="operateBtn-tip ml10" @click="soUnbindBatch"> </ButtonTip>
								<!-- <el-button size="mini" type="danger" class="ml10" @click="soUnbindBatch" :disabled="submitDisabled || isFinish">解绑SO</el-button> -->
							</template>
						</div>
					</div>
				</div>
				<div class="row-form so mt10 table-com-layout">
					<el-table
						fit
						border
						stripe
						style="width: 100%"
						:data="soList"
						class="table-cont"
						@selection-change="handleSelectionChange"
						@cell-mouse-enter="showTooltip"
						@cell-mouse-leave="hiddenTooltip"
						v-loading="lsLoading"
						:element-loading-text="eLoadingText"
						:element-loading-spinner="eLoadingSpinner"
						:element-loading-background="eLoadingBackground"
					>
						<el-table-column align="center" type="selection" width="40" :fixed="true"></el-table-column>
						<el-table-column prop="so" label="so号" align="center" width="180">
							<template slot-scope="scope"><span v-if="scope.row.isUpdate === 'Y'" class="drop-word">新</span>{{ scope.row.so }}</template>
						</el-table-column>
						<el-table-column prop="issueStatus" label="放舱给客户" align="center" width="60">
							<template slot-scope="scope">
								<span :class="scope.row.issueStatus === 'n' ? 'red' : ''">{{ scope.row.issueStatus === 'y' ? '是' : scope.row.issueStatus === 'n' ? '否' : '' }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="issueTime" label="放舱给客户时间" align="center" width="145"></el-table-column>
						<el-table-column prop="mailSendResult" label="邮件发送状态" align="center" width="65">
							<template slot-scope="scope">
								<span>{{ scope.row.mailSendResult === 'SUCCESS' ? '已发送' : scope.row.mailSendResult === 'FAIL' ? '发送失败' : scope.row.mailSendResult === 'INIT' || scope.row.mailSendResult === '' ? '未发送' : '' }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="bkgFinishTime" label="BKG放舱时间" align="center" width="145"></el-table-column>
						<el-table-column prop="soFileName" label="附件名称" align="center" width="">
							<template slot-scope="scope">
								<div class="operate-group">
									<el-tooltip effect="dark" placement="top" v-if="!bookReleaseCheck" :content="bookReleaseCheckMsg">
										<span class="file-disabled-style">{{ scope.row.soFileName }}</span>
									</el-tooltip>
									<el-button @click="handleSoCheck(scope.row)" type="text" size="mini" v-else>
										<span class="file-name-style">{{ scope.row.soFileName }}</span>
									</el-button>
								</div>
							</template>
						</el-table-column>
						<el-table-column prop="containerInfo" label="箱型箱量" align="center" width=""></el-table-column>
						<el-table-column prop="vesselAndVoyage" label="船名/航次" align="center" width=""></el-table-column>
						<el-table-column prop="polPortName" label="大船起运港" align="center" width=""></el-table-column>
						<el-table-column prop="porPortName" label="驳船收货地" align="center" width=""></el-table-column>
						<el-table-column prop="podPortName" label="目的地" align="center" width=""></el-table-column>
						<el-table-column prop="remark" label="备注" align="center"></el-table-column>
						<el-table-column prop="checkResult" label="核对状态" align="center" width="70">
							<template slot-scope="scope">
								<span :class="scope.row.checkResult.toLowerCase() === 'y' ? 'green' : scope.row.checkResult.toLowerCase() === 'n' ? 'red' : ''">
									{{ scope.row.checkResult.toLowerCase() === 'y' ? '正确' : scope.row.checkResult.toLowerCase() === 'n' ? '错误' : '未核对' }}
								</span>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="90" align="center" fixed="right">
							<template slot-scope="scope">
								<div class="operate-group">
									<template v-if="scope.row.soFileName">
										<el-tooltip effect="dark" placement="top-start" v-if="!bookReleaseCheck" :content="bookReleaseCheckMsg">
											<el-button type="text" size="mini" class="file-disabled-style">下载</el-button>
										</el-tooltip>
										<el-button @click="handleDownload(scope.row)" type="text" size="mini" v-else>下载</el-button>
									</template>
									<ButtonTip
										btnType="text"
										:btnDisabled="!(isOp && scope.row.issueStatus !== 'y' && orderInfoData.bkgStatus === 'book_release' && !isFinish)"
										btnText="解绑"
										tipContent="非本单操作人员、或服务项进度为已完成、或已放舱给客户的，不允许该操作"
										class="operateBtn-tip"
										btnClassName="red"
										@click="handleSoUnBind(scope.row)"
									>
									</ButtonTip>
									<!-- <el-button @click="handleSoUnBind(scope.row)" type="text" size="mini" class="red" :disabled="!(isOp && scope.row.issueStatus !== 'y' && orderInfoData.bkgStatus === 'book_release' && !isFinish)">解绑</el-button> -->
								</div>
							</template>
						</el-table-column>
					</el-table>
					<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
				</div>
			</div>
			<div class="row-tit pd0" id="saveBar">
				<span class="tit ft12">免用免堆</span>
				<div class="flex-column-center">
					<ButtonTip btnType="primary" :btnDisabled="submitDisabled || !isOp || isFinish" btnText="保存" tipContent="非本单操作人员、或服务项进度已完成，不允许该操作" class="operateBtn-tip ml10" @click="handleSave"> </ButtonTip>
					<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="submitDisabled || !isOp || isFinish">保存</el-button> -->
				</div>
			</div>
			<div class="row-tit pd0 isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
				<span class="tit ft12">免用免堆</span>
				<div class="flex-column-center">
					<ButtonTip btnType="primary" :btnDisabled="submitDisabled || !isOp || isFinish" btnText="保存" tipContent="非本单操作人员、或服务项进度已完成，不允许该操作" class="operateBtn-tip ml10" @click="handleSave"> </ButtonTip>
					<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="submitDisabled || !isOp || isFinish">保存</el-button> -->
				</div>
			</div>
			<div class="pol-wrap">
				<div class="pol-wrap-top">POL免堆实际天数</div>
				<div class="pol-wrap-bottom">
					<el-input size="mini" v-model.number="saveQuery.podFreeIn" placeholder="请输入" class="flex-item pl0" :disabled="!isOp" @blur="handleBlur('podFreeIn')">
						<template slot="prepend">场内</template>
						<template slot="append">天</template>
					</el-input>
					<el-input size="mini" v-model.number="saveQuery.podFreeOut" class="flex-item pl0" placeholder="请输入" :disabled="!isOp" @blur="handleBlur('podFreeOut')">
						<template slot="prepend">场外</template>
						<template slot="append">天</template>
					</el-input>
					<el-input size="mini" v-model.number="saveQuery.podFree" class="flex-item pl0" placeholder="请输入" :disabled="!isOp" @blur="handleBlur('podFree')">
						<template slot="prepend">综合</template>
						<template slot="append">天</template>
					</el-input>
				</div>
			</div>
		</div>
		<div v-if="soUnbindShow">
			<SoUnbind :unbindParam="unbindParam" @close="soUnbindPopClose" />
		</div>
		<div v-if="soExportPopShow">
			<SoExport :soExportParam="soExportParam" @close="soExportPopClose" />
		</div>
		<div v-if="bookReleaseMailPopShow">
			<Mail :mailOnlyparam="mailOnlyparam" :orderInfoData="orderInfoData" :selectedData="selectedData" @close="bookReleaseMailPopClose" />
		</div>
		<div v-if="custBookReleaseMailPopShow">
			<CustMail :mailOnlyparam="mailOnlyparam" :orderInfoData="orderInfoData" :selectedData="selectedData" @close="custBookReleaseMailPopClose" />
		</div>
		<div v-if="exportEntrustedPopShow">
			<exportEntrustedPop @close="exportPopClose" />
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { orderBookInfo, orderBookFreeSave, orderBookCrash, orderNotifyRelease, orderRelease, orderReleaseCancel, orderJointServiceCancelAudit, bookReleaseCheck, bookReleaseMailOnly } from '@/api/order/list'
import { getDictLabel } from '@/utils/tools'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import SoUnbind from './soUnbind'
import SoExport from './soExport'
import Mail from './bookReleaseMail'
import CustMail from './custBookReleaseMail'
import exportEntrustedPop from './exportEntrustedPop'

export default {
	mixins: [orderMixin],
	filters: {
		bkgStatusFilter(status) {
			return getDictLabel('bkgStatus', status)
		}
	},
	props: {
		orderInfoData: {
			type: Object,
			default: () => ({})
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			soList: [],
			oQuery: this.$route.query,
			releaseStatus: '',
			saveQuery: {
				orderNo: '',
				podFreeIn: '',
				podFreeOut: '',
				podFree: ''
			},
			submitDisabled: false,
			multipleSelection: [],
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			},
			soUnbindShow: false, // so解绑弹窗
			unbindParam: {},
			bookReleaseCheck: false, // 放舱检验标识
			bookReleaseCheckMsg: '', // 放舱检验信息
			soExportPopShow: false, // 输出SO弹窗
			soExportParam: {},
			bookReleaseMailPopShow: false, // 邮件发送弹窗
			custBookReleaseMailPopShow: false, // 邮件发送弹窗
			mailOnlyparam: {},
			selectedData: [],
			exportEntrustedPopShow: false,
			exportTypeOptions: {
				LONGSAIL_OFFSITE: '长帆供应链订同行'
			}
		}
	},
	created() {
		this.getOrderBookInfo()
		this.getBookReleaseCheck()
	},
	mounted() {},
	computed: {
		...mapState({
			userId: state => state.user.userId
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBd() {
			return !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'book')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		styleObject() {
			// 顶部距离文档
			let offsetTop = document.querySelector('.tabs-container').offsetTop
			return this.saveBarFixed
				? {
						left: '120px',
						top: offsetTop + 24 + 'px'
				  }
				: {}
		},
		// 散杂滚装
		isBulkRo() {
			return this.orderInfoData.businessType === 'ship_bulk_ro'
		}
	},
	components: {
		tableTooltip,
		SoUnbind,
		SoExport,
		Mail,
		exportEntrustedPop,
		CustMail
	},
	methods: {
		// 获取参与人为op的用户id
		getOpEmployeeId() {
			let { workAssign } = this.orderInfoData
			let opItem = workAssign.find(item => item.jobCode === 'op')
			return opItem ? opItem.employeeId : ''
		},
		// 打开邮件发送弹窗
		handleShowMailPop() {
			if (this.multipleSelection.length == 0) return this.$message({ type: 'error', message: '请选择要发送邮件给客户的SO' })
			if (this.multipleSelection.some(item => item.issueStatus !== 'y')) return this.$message({ type: 'error', message: '请选择已放舱给客户的SO' })
			if (this.orderInfoData.systemCode === 'CUST') {
				this.custBookReleaseMailPopShow = true
			} else {
				this.bookReleaseMailPopShow = true
			}

			this.selectedData = this.multipleSelection
			this.mailOnlyparam = {
				soList: this.getSoList(),
				opEmployeeId: this.userId
			}
		},
		// 关闭邮件发送弹窗
		bookReleaseMailPopClose(action) {
			this.bookReleaseMailPopShow = false
			if (action === 'Confirm') {
				this.getOrderBookInfo()
			}
		},
		// 对客平台 关闭邮件发送弹窗
		custBookReleaseMailPopClose(action) {
			this.custBookReleaseMailPopShow = false
			if (action === 'Confirm') {
				this.getOrderBookInfo()
			}
		},
		// 打开输出SO弹窗
		handleExportSo() {
			if (this.multipleSelection.length !== 1) return this.$message({ type: 'error', message: '请选择一条要输出的SO' })
			// if (this.multipleSelection.some(item => item.issueStatus !== 'y')) return this.$message({ type: 'error', message: '请选择一条已放舱给客户的SO' })
			this.soExportParam = {
				orderNo: this.$route.query.orderNo,
				so: this.multipleSelection[0].so,
				docType: 'pdf'
			}
			this.soExportPopShow = true
		},
		soExportPopClose(action, value) {
			this.soExportPopShow = false
		},
		handleCommand() {
			this.exportEntrustedPopShow = true
		},
		exportPopClose(action, value) {
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportEntrustedPopShow = false
			}
		},
		handleExport(obj) {
			let params = {
				...obj,
				orderNo: this.$route.query.orderNo
			}
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shiporder/book/booking/export',
					data: params
				})
				.then(res => {
					console.log(res)
					this.exportEntrustedPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `${this.exportTypeOptions[params.bookingType]}${params.orderNo}` + '.' + params.docType.toLowerCase()
					link.click()
				})
		},
		// 放舱校验
		getBookReleaseCheck() {
			bookReleaseCheck({ orderNo: this.$route.query.orderNo }).then(res => {
				let { checkResult, checkMsg } = res.data
				this.bookReleaseCheck = checkResult
				this.bookReleaseCheckMsg = checkMsg
			})
		},
		// 免堆实际天数只能输入正整数且不能大于100
		handleBlur(val) {
			const intReg = /^[0-9]\d*$/
			if (this.saveQuery[val] && !intReg.test(this.saveQuery[val])) {
				this.saveQuery[val] = ''
				return this.$message.error('请输入正确的天数')
			}
			if (this.saveQuery[val] > 100) {
				this.saveQuery[val] = 100
				this.$message.error('最大不能超过100')
			}
		},
		handleSoUnBind(row) {
			this.soUnbindShow = true
			this.unbindParam = {
				so: row.so
			}
		},
		soUnbindPopClose(action, value) {
			this.soUnbindShow = false
			if (action === 'Confirm') {
				this.getOrderBookInfo()
			}
		},
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			// 优先显示放舱给客户限制提示信息
			if (column.property === 'soFileName' && !this.bookReleaseCheck) {
				return
			}
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		getOrderBookInfo() {
			this.lsLoading = true
			// 获取so列表
			orderBookInfo({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo })
				.then(res => {
					this.releaseStatus = res.data.releaseStatus
					this.soList = ['booked', 'book_release'].includes(this.orderInfoData.bkgStatus) ? res.data.soList : []
					this.soList.map(item => (item.vesselAndVoyage = item.vessel + '/' + item.voyage))
					for (let i in this.saveQuery) {
						this.saveQuery[i] = res.data[i]
					}
				})
				.finally(() => {
					this.lsLoading = false
				})
		},

		// 获取so附件url
		getSoFileUrl(row) {
			let { soFileNo, soFileName } = row
			if (!soFileNo || !soFileName) return
			let nameArr = soFileName.split('.')
			let name = nameArr[nameArr.length - 1]
			name = name.toLowerCase()
			let fileUrl = ''
			this.$store.dispatch('order/getPreViewFile', { fileNo: soFileNo, fileName: name })
				.then(url => {
					fileUrl = url
				})
			// let fileUrl = `${window.location.origin}/base/internal/file/preview/${soFileNo}/${soFileNo}.${name}`
			// let href = `${window.location.origin}/file/onlinePreview?url=${encodeURIComponent(fileUrl)}`
			return fileUrl
		},

		// so核对
		async handleSoCheck(row) {
			let soFileUrl = await this.$store.dispatch('order/getPreViewFile', { fileNo: row.soFileNo, fileName: row.soFileName })
			// 操作执行SO核对
			if (this.isOp) {
				return this.$router.push({
					name: 'SoCheck',
					params: {
						orderNo: this.$route.query.orderNo
					},
					query: {
						...this.$route.query,
						source: 'OrderBook',
						soFileUrl,
						so: row.so,
						containerInfo: row.containerInfo
					}
				})
			}
			// 其他角色预览附件
			return this.$store.dispatch('order/previewFile', { fileNo: row.soFileNo, fileName: row.soFileName })
		},

		// 下载附件
		handleDownload(item) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: item.soFileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = item.soFileName
					link.click()
				})
		},
		// 保存
		handleSave() {
			this.submitDisabled = true
			orderBookFreeSave(
				Object.assign(
					{ ...this.saveQuery },
					{
						jointNo: this.oQuery.jointNo
					}
				)
			)
				.then(res => {
					this.$message({
						type: 'success',
						message: '免用免堆信息录入成功',
						duration: 1000,
						onClose: () => {
							this.submitDisabled = false
							this.getOrderBookInfo()
						}
					})
				})
				.catch(err => {
					setTimeout(() => {
						this.submitDisabled = false
					}, 1000)
				})
		},

		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
		},

		// 获取soList数组
		getSoList() {
			let soList = []
			this.multipleSelection.map(item => {
				soList.push(item.so)
			})
			return soList
		},

		// 业务通知放舱
		handleNotifyRelease() {
			this.submitDisabled = true
			let orderNoArr = [this.oQuery.orderNo]
			orderNotifyRelease({ jointNo: this.oQuery.jointNo, orderNoList: orderNoArr })
				.then(res => {
					this.$message({
						type: 'success',
						message: '通知放舱成功',
						onClose: () => {
							this.submitDisabled = false
							this.getOrderBookInfo()
						}
					})
				})
				.catch(err => {
					setTimeout(() => {
						this.submitDisabled = false
					}, 1000)
				})
		},

		// 操作放舱给客户
		handleRelease() {
			if (!this.multipleSelection.length) {
				return this.$message({
					type: 'error',
					message: '请选择要放舱给客户的SO'
				})
			}
			this.submitDisabled = true
			let soList = this.getSoList()
			let data = {
				jointNo: this.oQuery.jointNo,
				orderNo: this.oQuery.orderNo,
				soList: soList
			}
			this.selectedData = this.multipleSelection
			orderRelease(data)
				.then(res => {
					this.submitDisabled = false
					this.getOrderBookInfo()
					this.$confirm('放舱成功，是否发送邮件给客户?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
						.then(res => {
							if (this.orderInfoData.systemCode === 'CUST') {
								this.custBookReleaseMailPopShow = true
							} else {
								this.bookReleaseMailPopShow = true
							}
							// this.bookReleaseMailPopShow = true
							this.mailOnlyparam = {
								soList: data.soList,
								opEmployeeId: this.userId
							}
						})
						.catch(err => {})
				})
				.catch(err => {
					setTimeout(() => {
						this.submitDisabled = false
					}, 1000)
				})
		},

		// 取消放舱给客户
		handleReleaseCancel() {
			if (!this.multipleSelection.length) {
				return this.$message({
					type: 'error',
					message: '请选择要取消放舱给客户的SO'
				})
			}
			this.submitDisabled = true
			let soList = this.getSoList()
			let data = {
				jointNo: this.oQuery.jointNo,
				orderNo: this.oQuery.orderNo,
				soList: soList
			}

			orderReleaseCancel(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '取消放舱成功',
						duration: 1000,
						onClose: () => {
							this.submitDisabled = false
							this.getOrderBookInfo()
						}
					})
				})
				.catch(err => {
					setTimeout(() => {
						this.submitDisabled = false
					}, 1000)
				})
		},

		// 加急处理
		handleBookCrash() {
			this.submitDisabled = true
			orderBookCrash({ jointNo: this.oQuery.jointNo, orderNo: this.oQuery.orderNo })
				.then(res => {
					this.$message({
						type: 'success',
						message: '加急处理成功',
						duration: 1000,
						onClose: () => {
							this.submitDisabled = false
							this.getOrderBookInfo()
						}
					})
				})
				.catch(err => {
					setTimeout(() => {
						this.submitDisabled = false
					}, 1000)
				})
		},
		// 批量解绑SO
		soUnbindBatch() {
			if (!this.multipleSelection.length) {
				return this.$message({
					type: 'error',
					message: '请选择要解绑的SO'
				})
			}
			this.soUnbindShow = true
			this.unbindParam = {
				so: this.getSoList(),
				isBatch: true
			}
		}
	}
}
</script>
<style lang="scss">
@import '../../../less/index.scss';
#Book {
	.bkg-status {
		color: #edb534;
		.el-icon-info {
			margin-right: 4px;
		}
	}
	.pol-wrap {
		display: flex;
		align-items: center;
		padding-top: 10px;
		.pol-wrap-top {
			margin-right: 4px;
		}
		.pol-wrap-bottom {
			display: flex;
			.flex-item {
				margin-right: 10px;
			}
		}
	}
}
#Book .table-cont.el-table--border {
	border: 0;
	th:last-child {
		border-right: 0;
	}
}
#Book .table-cont .operate-group .file-disabled-style {
	width: 100%;
}
#Book .table-cont .operate-group .el-button {
	white-space: normal;
}
#Book .table-cont .green {
	color: #33b18a;
}
#Book .table-cont .red {
	color: #cd4130;
}
#Book .table-cont th .cell {
	// padding-left: 5px;
	// padding-right: 5px;
}
#Book .table-cont td .cell {
	// padding-left: 5px;
	// padding-right: 5px;
	display: block;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.flex-column-center {
	display: flex;
	align-items: center;
}
#Book .table-cont .drop-word {
	background-color: #edb534;
	color: #fff;
	width: 14px;
	height: 14px;
	border-radius: 2px;
	padding: 0 2px 2px;
	font-size: 12px;
	margin-right: 5px;
}
#Book .btn-disabled-style {
	background-color: #8cc8ff;
	border-color: #8cc8ff;
}
#Book .edit-container.so .row-tit {
	&.isFixed {
		position: fixed;
		background-color: #fff;
		z-index: 999;
		padding: 5px 20px;
		height: 30px;
		box-shadow: 4px 0px 10px 0px #e9e9e9;
		top: 24px;
		// top: 64px;
		right: 0;
		.tit {
			line-height: 20px;
		}
	}
}
</style>
