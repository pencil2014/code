<template>
	<div class="edit-row">
		<div class="edit-container so">
			<div class="row-tit so">
				<span class="tit">SO信息</span>
				<div class="row-tit-operate">
					放舱要求：{{ releaseStatus }}
					<div class="btn-groups">
						<!-- 业务 -->
						<div class="el-button-group" v-if="isBd">
							<el-button size="mini" type="default" class="ml10" @click="handleNotifyRelease" v-if="orderInfoData.bkgStatus === 'pass'" :disabled="submitDisabled">通知放舱</el-button>
							<el-button size="mini" type="default" class="ml10" @click="handleSave" :disabled="submitDisabled || isBd">保存</el-button>
						</div>
						<!-- 操作 -->
						<div class="el-button-group" v-if="isOp">
							<el-button size="mini" type="default" class="ml10" @click="handleRelease" :disabled="submitDisabled">放舱给客户</el-button>
							<el-button size="mini" type="default" class="ml10" @click="handleReleaseCancel" :disabled="submitDisabled">取消放舱</el-button>
							<el-button size="mini" type="default" class="ml10" @click="handleSave" :disabled="submitDisabled">保存</el-button>
						</div>
					</div>
				</div>
			</div>
			<div class="row-form so mt10 table-com-layout">
				<el-table fit :show-overflow-tooltip="true" style="width: 100%" :data="soList" class="table-cont">
					<el-table-column prop="so" label="so号" align="center"> </el-table-column>
					<el-table-column prop="containerInfo" label="箱型箱量" align="center"> </el-table-column>
					<el-table-column prop="vesselAndVoyage" label="船名/航次" align="center" width="200"> </el-table-column>
					<el-table-column prop="polPortName" label="起运港" align="center"> </el-table-column>
					<el-table-column prop="porPortName" label="驳船收货地" align="center"> </el-table-column>
					<el-table-column prop="podPortName" label="目的地" align="center"> </el-table-column>
					<el-table-column prop="remark" label="so备注" align="center" width="250"></el-table-column>
					<el-table-column prop="issueStatus" label="放舱给客户" align="center">
						<template slot-scope="scope">
							{{ scope.row.issueStatus === 'y' ? '是' : scope.row.issueStatus === 'n' ? '否' : '' }}
						</template>
					</el-table-column>
					<el-table-column prop="soFileName" label="附件名称" align="center" width="150">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleView(scope.row)" type="text" size="mini">{{ scope.row.soFileName }}</el-button>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="80" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleDownload(scope.row)" type="text" size="mini">下载</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="row-tit mt20 pd0">
				<span class="tit">免用免堆</span>
			</div>
			<div class="mt10">POL免堆实际天数</div>
			<div class="flex row-flex">
				<el-input size="mini" v-model.number="saveQuery.podFreeIn" placeholder="请输入" class="flex-item pl0" :disabled="viewState">
					<template slot="prepend">场内</template>
					<template slot="append">天</template>
				</el-input>
				<el-input size="mini" v-model.number="saveQuery.podFreeOut" class="flex-item pl0" placeholder="请输入" :disabled="viewState">
					<template slot="prepend">场外</template>
					<template slot="append">天</template>
				</el-input>
				<el-input size="mini" v-model.number="saveQuery.podFree" class="flex-item pl0" placeholder="请输入" :disabled="viewState">
					<template slot="prepend">综合</template>
					<template slot="append">天</template>
				</el-input>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { orderBookInfo, orderBookFreeSave, orderBookCrash, orderNotifyRelease, orderRelease, orderReleaseCancel, orderJointServiceCancelAudit } from '@/api/order/list'

export default {
	mixins: [orderMixin],
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
			submitDisabled: false
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
			return this.ordDetRole === 'op'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
	},
	components: {},
	methods: {
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

		// 附件预览
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.soFileNo, fileName: row.soFileName })
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

		// 获取soList数组
		getSoList() {
			let soList = []
			this.soList.map(item => {
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
.table-cont .operate-group .el-button {
	white-space: normal;
}
</style>
