<template>
	<div class="edit-row" id="Book">
		<div class="edit-container so">
			<div class="row-tit so">
				<span class="tit ft12">SO信息</span>
				<div class="row-tit-operate">
					订舱状态： <span class="mr10 bkg-status"><i class="el-icon-info"></i>{{ orderInfoData.bkgStatus | bkgStatusFilter }}</span> 
					放舱要求：<span :class="{ red: releaseStatus === '通知放舱', green: releaseStatus === '即时放舱' }"><i class="el-icon-info"></i>{{releaseStatus}}</span>
					<div class="btn-groups">
						<!-- 业务 -->
						<template v-if="isBd">
							<el-button size="mini" type="default" class="ml10" @click="handleNotifyRelease" v-if="orderInfoData.bkgStatus === 'pass'" :disabled="submitDisabled || isFinish">通知放舱</el-button>
						</template>
						<!-- 操作 -->
						<template v-if="isOp">
							<el-tooltip effect="dark" placement="top-start" v-if="orderInfoData.isDraftCust === 'Y'">
								<div slot="content">该订单客户为非正式客户，不可放舱给客户</div>
								<el-button size="mini" type="primary" class="ml10 btn-disabled-style">放舱给客户</el-button>
							</el-tooltip>
							<el-button size="mini" type="primary" class="ml10" @click="handleRelease" :disabled="submitDisabled || isFinish" v-else>放舱给客户</el-button>
							<el-button size="mini" type="danger" class="ml10" @click="handleReleaseCancel" :disabled="submitDisabled || isFinish">取消放舱</el-button>
						</template>
					</div>
				</div>
			</div>
			<div class="row-form so mt10 table-com-layout">
				<el-table fit style="width: 100%" :data="soList" class="table-cont" @selection-change="handleSelectionChange" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
					<el-table-column align="center" type="selection" width="45"></el-table-column>
					<el-table-column prop="so" label="so号" align="right" width="150">
						<template slot-scope="scope"><span v-if="scope.row.isUpdate === 'Y'" class="drop-word">新</span>{{ scope.row.so }}</template>
					</el-table-column>
					<el-table-column prop="containerInfo" label="箱型箱量" align="center" width="150" show-overflow-tooltip></el-table-column>
					<el-table-column prop="vesselAndVoyage" label="船名/航次" align="center" width="200"></el-table-column>
					<el-table-column prop="polPortName" label="起运港" align="center" width="200"></el-table-column>
					<el-table-column prop="porPortName" label="驳船收货地" align="center" width="200"></el-table-column>
					<el-table-column prop="podPortName" label="目的地" align="center" width="200"></el-table-column>
					<el-table-column prop="remark" label="so备注" align="center" width="250"></el-table-column>
					<el-table-column prop="checkResult" label="SO核对状态" align="center" width="90">
						<template slot-scope="scope">
							<span :class="scope.row.checkResult.toLowerCase() === 'y' ? 'green' : scope.row.checkResult.toLowerCase() === 'n' ? 'red' : ''">
								{{ scope.row.checkResult.toLowerCase() === 'y' ? '正确' : scope.row.checkResult.toLowerCase() === 'n' ? '错误' : '未核对' }}
							</span>
						</template>
					</el-table-column>
					<el-table-column prop="issueStatus" label="放舱给客户" align="center">
						<template slot-scope="scope">
							<span :class="scope.row.issueStatus === 'n' ? 'red' : ''">{{ scope.row.issueStatus === 'y' ? '是' : scope.row.issueStatus === 'n' ? '否' : '' }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="soFileName" label="附件名称" align="center" width="200">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-tooltip effect="dark" placement="top-start" v-if="orderInfoData.isDraftCust === 'Y'">
									<div slot="content">该订单客户为非正式客户，不可预览该附件</div>
									<span class="file-disabled-style">{{ scope.row.soFileName }}</span>
								</el-tooltip>
								<el-button @click="handleSoCheck(scope.row)" type="text" size="mini" v-else>
									<span class="file-name-style">{{ scope.row.soFileName }}</span>
								</el-button>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="100" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-tooltip effect="dark" placement="top-start" v-if="orderInfoData.isDraftCust === 'Y'">
									<div slot="content">该订单客户为非正式客户，不可下载该附件</div>
									<el-button type="text" size="mini" class="file-disabled-style">下载</el-button>
								</el-tooltip>
								<el-button @click="handleDownload(scope.row)" type="text" size="mini" v-else>下载</el-button>
								<el-button @click="handleSoUnBind(scope.row)" type="text" size="mini" v-if="isOp && scope.row.issueStatus !== 'y' && orderInfoData.bkgStatus === 'book_release' && !isFinish">解绑</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
				<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
			</div>
			<div class="row-tit pd0">
				<span class="tit ft12">免用免堆</span>
				<div class="flex-column-center">
					<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="submitDisabled" v-if="isOp">保存</el-button>
				</div>
			</div>
			<div class="pol-wrap">
				<div class="pol-wrap-top">POL免堆实际天数</div>
				<div class="pol-wrap-bottom">
					<el-input size="mini" v-model.number="saveQuery.podFreeIn" placeholder="请输入" class="flex-item pl0" :disabled="!isOp">
						<template slot="prepend">场内</template>
						<template slot="append">天</template>
					</el-input>
					<el-input size="mini" v-model.number="saveQuery.podFreeOut" class="flex-item pl0" placeholder="请输入" :disabled="!isOp">
						<template slot="prepend">场外</template>
						<template slot="append">天</template>
					</el-input>
					<el-input size="mini" v-model.number="saveQuery.podFree" class="flex-item pl0" placeholder="请输入" :disabled="!isOp">
						<template slot="prepend">综合</template>
						<template slot="append">天</template>
					</el-input>
				</div>
			</div>
		</div>
		<div v-if="soUnbindShow">
			<SoUnbind :unbindParam="unbindParam" @close="soUnbindPopClose"/>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { orderBookInfo, orderBookFreeSave, orderBookCrash, orderNotifyRelease, orderRelease, orderReleaseCancel, orderJointServiceCancelAudit } from '@/api/order/list'
import { getDictLabel } from '@/utils/tools'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import SoUnbind from './soUnbind'

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
			soUnbindShow: false,	// so解绑弹窗
			unbindParam: {}
		}
	},
	created() {
		this.getOrderBookInfo()
	},
	mounted() {},
	computed: {
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.roles.includes( 'op')
		},
		isBd() {
			return !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'book')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		}
	},
	components: { 
		tableTooltip, 
		SoUnbind 
	},
	methods: {
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
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		getOrderBookInfo() {
			// 获取so列表
			orderBookInfo({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.releaseStatus = res.data.releaseStatus
				this.soList = res.data.soList
				this.soList.map(item => (item.vesselAndVoyage = item.vessel + '/' + item.voyage))
				for (let i in this.saveQuery) {
					this.saveQuery[i] = res.data[i]
				}
			})
		},

		// 获取so附件url
		getSoFileUrl(row) {
			let { soFileNo, soFileName } = row
			if (!soFileNo || !soFileName) return
			let nameArr = soFileName.split('.')
			let name = nameArr[nameArr.length - 1]
			name = name.toLowerCase()
			let fileUrl = `${window.location.origin}/base/fileView/preview/${soFileNo}/${soFileNo}.${name}`
			// let href = `${window.location.origin}/file/onlinePreview?url=${encodeURIComponent(fileUrl)}`
			return fileUrl
		},

		// so核对
		handleSoCheck(row) {
			let soFileUrl = this.getSoFileUrl(row)
			// 操作执行SO核对
			if (this.isOp) {
				return this.$router.push({
					name: 'SoCheck',
					params: {
						orderNo: this.$route.query.orderNo
					},
					query: {
						...this.$route.query,
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

			orderRelease(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '放舱成功',
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

#Book .table-cont .operate-group .el-button {
	white-space: normal;
}
#Book .table-cont .green {
	color: #33b18a;
}
#Book .table-cont .red {
	color: #cd4130;
}
#Book .table-cont .cell {
	overflow: hidden;
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
#Book .btn-disabled-style{
	background-color: #8cc8ff;
	border-color: #8cc8ff;
}
</style>
