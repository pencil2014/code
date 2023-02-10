<template>
	<div class="soInfo-row">
		<div class="edit-container">
			<div class="row-tit soInfo-tit">
				<span class="tit bold">SO信息</span>
				<div class="row-tit-operate" v-if="soBtnList && soBtnList.length > 0">
					<!-- <template v-if="isBkgRelease"> // 20220607版本 已放舱改成和已订舱一样的交互了
						<el-tooltip effect="dark" placement="top-start" v-if="!bookReleaseCheck" :content="bookReleaseCheckMsg">
							<el-button size="mini" type="primary" class="ml10 btn-disabled-style">放舱给客户</el-button>
						</el-tooltip>
						<el-button size="mini" type="primary" class="ml10" @click="handleRelease" :disabled="submitDisabled" v-else>放舱给客户</el-button>
						<el-button size="mini" type="danger" class="ml10" @click="handleReleaseCancel" :disabled="submitDisabled">取消放舱给客户</el-button>
						<el-button size="mini" type="default" class="ml10" @click="handleShowMailPop">邮件发送</el-button>
						<el-button size="mini" type="default" class="ml10" @click="handleExportSo" :disabled="bkgStatus !== 'book_release'">输出SO</el-button>
					</template> -->
					<template v-if="['submit','pass','booking','booked', 'book_release'].includes(bkgStatus)">
						<el-button :type="item.type" size="mini" class="ml10" v-for="(item, index) in soBtnList" :key="index" @click="handleClick(item)" :disabled="isBkgRelease || bkgEditState">{{ item.label }}</el-button>
					</template>					
				</div>
			</div>
			<div class="row-form">
				<!-- SO列表 -->
				<!-- 起运港为宁波的已放舱的 // 20220607版本 已放舱改成和已订舱一样的交互了 -->  
				<!-- <template v-if="isBkgRelease">
					<el-table fit border class="ningbo-table" style="width: 100%" :data="soLists" @selection-change="handleSelectionChange" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip" key="CNNBO">
						<el-table-column align="center" type="selection" width="45" :fixed="true"></el-table-column>
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
								<span>{{scope.row.mailSendResult === 'SUCCESS' ? '已发送' : scope.row.mailSendResult === 'FAIL' ? '发送失败' : scope.row.mailSendResult === 'INIT' || scope.row.mailSendResult === '' ? '未发送' : ''}}</span>
							</template>
						</el-table-column>
						<el-table-column prop="bkgFinishTime" label="BKG放舱时间" align="center" width="145"></el-table-column>
						<el-table-column prop="soFileName" label="附件名称" align="center" width="">
							<template slot-scope="scope">
								<div class="operate-group">
									<el-tooltip effect="dark" placement="top-start" v-if="!bookReleaseCheck" :content="bookReleaseCheckMsg">
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
								<span :class="scope.row.checkResult === 'Y' ? 'green' : scope.row.checkResult === 'N' ? 'red' : ''">
									{{ scope.row.checkResult === 'Y' ? '正确' : scope.row.checkResult === 'N' ? '错误' : '未核对' }}
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
									<el-button @click="handleSoUnBind(scope.row)" type="text" size="mini" class="red" v-if="scope.row.issueStatus !== 'y'">解绑</el-button>
								</div>
							</template>
						</el-table-column>	
					</el-table>
				</template> -->
				<template>
					<el-table class="so-tableinfo" style="width: 100%" :data="soLists" @selection-change="handleSelectionChange" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip" key="SO">
						<el-table-column label="SO号" align="center" width="200">
							<template slot-scope="scope">
								<el-input @blur="handleSave(scope.row)" v-model="scope.row.so" size="mini" clearable :disabled="scope.row.canDelete !== 1 || bkgEditState"></el-input>
							</template>
						</el-table-column>
						<el-table-column label="箱型箱量" align="center" width="150">
							<template slot-scope="scope">
								<el-input @focus="showContainer(scope.row)" @change="handleSave(scope.row)" v-model="scope.row.containerInfo" size="mini" clearable :disabled="bkgEditState"></el-input>
							</template>
						</el-table-column>
						<el-table-column label="大船船名" width="150" align="center">
							<template slot-scope="scope">
								<el-autocomplete
									style="width: 100%"
									size="mini"
									clearable
									v-model="scope.row.vessel"
									:fetch-suggestions="(queryString, cb) => querySearchVessel(queryString, cb)"
									:trigger-on-focus="false"
									placeholder="请输入"
									:maxlength="128"
									:disabled="bkgEditState"
									@select="value => handleSave(scope.row)"
									@clear="value => handleClearVessel(value)"
									@change="handleSave(scope.row)"
								></el-autocomplete>
							</template>
						</el-table-column>
						<el-table-column label="大船航次" width="150" align="center">
							<template slot-scope="scope">
								<el-autocomplete
									style="width: 100%"
									size="mini"
									clearable
									v-model="scope.row.voyage"
									:fetch-suggestions="(queryString, cb) => querySearchVoyage(queryString, cb, scope.row.vessel)"
									:trigger-on-focus="false"
									placeholder="请输入"
									:maxlength="128"
									:disabled="bkgEditState"
									@select="value => handleSave(scope.row)"
									@clear="value => handleClearVoyage(value)"
									@change="handleSave(scope.row)"
								></el-autocomplete>
							</template>
						</el-table-column>
						<el-table-column prop="cutOffDate" label="大船截关时间" width="150" align="center">
							<template slot-scope="scope">
								<elDatePickerLimit 
									type="date" 
									:field="'cyCutOff'"
									value-format="yyyy-MM-dd" 
									v-model="scope.row.cutOffDate" 
									clearable 
									placeholder="选择时间" 
									size="mini" 
									:disabled="bkgEditState"
									style="width: 100%"
									@change="handleSave(scope.row)"> 
								</elDatePickerLimit>
							</template>
						</el-table-column>
						<el-table-column prop="remark" label="SO备注" width="150" align="center">
							<template slot-scope="scope">
								<el-input @blur="handleSave(scope.row)" v-model="scope.row.remark" size="mini" clearable :disabled="bkgEditState"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="porPortName" label="驳船收货地" align="center" width="200"> </el-table-column>
						<el-table-column prop="polPortName" label="大船起运港" align="center" width="200"> </el-table-column>
						<el-table-column prop="podPortName" label="目的地" align="center" width="200"> </el-table-column>
						<el-table-column prop="issueStatus" label="放舱给客户" align="center" width="80">
							<template slot-scope="scope">
								<span :class="scope.row.issueStatus !== 'y' ? 'red' : ''">{{ scope.row.issueStatus === 'y' ? '是' : '否' }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="soFileName" label="附件名称" align="center">
							<template slot-scope="scope">
								<div class="operate-group">
									<el-button @click="handleView(scope.row)" type="text" size="mini">
										<span class="file-name-style">{{ scope.row.soFileName }}</span>
									</el-button>
								</div>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="130" align="center" fixed="right">
							<template slot-scope="scope">
								<div class="operate-group">
									<el-button @click="handleDownload(scope.row)" type="text" size="mini" v-if="scope.row.soFileName">下载</el-button>
									<el-button @click="handleDeleteSo(scope.row)" type="text" size="mini" v-if="scope.row.canDelete === 1" :disabled="bkgEditState">删除</el-button>
									<el-button @click="handUnbindSo(scope.row)" type="text" size="mini" v-if="orderInfo.orderNo && scope.row.so" class="red" :disabled="bkgEditState">解绑</el-button>
								</div>
							</template>
						</el-table-column>
					</el-table>
				</template>	
				<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
				<!-- 快速上传 -->
				<template v-if="['submit','pass','booking','booked'].includes(bkgStatus)">
					<el-upload class="upload-so-info" drag action="#" :auto-upload="true" :before-upload="getFile" :http-request="handleImport" :on-change="handleProgress" :file-list="fileList" :disabled="bkgEditState">
						<div class="tip">
							<span class="content">将文件拖到此处，或点击上传</span>
						</div>
					</el-upload>
					<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
				</template>				
			</div>
		</div>
		<!-- 箱型箱量弹窗 -->
		<div v-if="addContainerShow">
			<AddContainer :orderNo="orderNo" :bkgReqNo="bkgReqNo" :oid="oid" :orderInfo="containerInfo" :soParamStr="soParamStr" @close="containerPopClose" @handleBack="handleBack" />
		</div>
		<!-- 新建弹窗 -->
		<div v-if="createSoPopShow">
			<CreateSoDialog :orderInfo="orderInfo" @close="createSoPopClose" @handleBack="handleBack" />
		</div>
		<!-- 关联弹窗 -->
		<div v-if="relateSOPopShow">
			<RelateSoDialog :orderInfo="orderInfo" @close="relateSoPopClose" @handleBack="handleBack" />
		</div>
		<div v-if="soExportPopShow">
			<SoExport :soExportParam="soExportParam" @close="soExportPopClose"/>
		</div>
		<div v-if="bookReleaseMailPopShow">
			<Mail :mailOnlyparam="mailOnlyparam" :orderInfoData="orderInfo" :selectedData="selectedData" @close="bookReleaseMailPopClose"/>
		</div>
		<div v-if="soUnbindShow">
			<SoUnbind :unbindParam="unbindParam" @close="soUnbindPopClose"/>
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import CreateSoDialog from './CreateSoDialog'
import AddContainer from './addContainer'
import RelateSoDialog from './relateSoDialog'
import { unbindSo, soUpdate, soList, deleteSo } from '@/api/order/book/list'
import {orderRelease, orderReleaseCancel, bookReleaseCheck, bookReleaseMailOnly, orderBookInfo} from '@/api/order/list'
import { deleteAlert } from '@/utils/tools'
import SoExport from '@/views/order/order/orderList/orderBook/components/soExport'
import Mail from '@/views/order/order/orderList/orderBook/components/bookReleaseMail'
import SoUnbind from '@/views/order/order/orderList/orderBook/components/soUnbind'

export default {
	props: {
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		bkgStatus: {
			type: String,
			default: ''
		},
		isBkgRelease: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			orderNo: '',
			bkgReqNo: '',
			soParamStr: '',
			oid: '',
			containerInfo: [],
			soLists: [],
			fileList: [],
			showProcess: false,
			processLength: 0,
			addContainerShow: false,
			createSoPopShow: false,
			relateSOPopShow: false,
			freeSoList: [],
			bookReleaseCheck: true,	// 放舱检验标识
			bookReleaseCheckMsg: '', 	// 放舱检验信息
			soExportPopShow: false,	// 输出SO弹窗
			soExportParam: {},
			bookReleaseMailPopShow: false,	// 邮件发送弹窗
			mailOnlyparam: {},
			soUnbindShow: false,	// so解绑弹窗
			unbindParam: {},
			submitDisabled: false,
			multipleSelection: [],
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			},
			interval: null,
			soBtnList: [
				{ label: '关联SO', key: 'relateSO', type: 'default' },
				{ label: '新增', key: 'add', type: 'primary' }
			]
		}
	},
	created() {
		console.log('🚀 ~ orderInfo', this.orderInfo)
	},
	mounted() {},
	computed: {
		...mapState({
			userId: state => state.user.userId
		}),
		bkgEditState() {
			// bkg，订舱拒绝、已放舱的;orderStatus为终止、取消的都不可编辑
			if (!['refuse', 'book_refuse', 'book_release'].includes(this.bkgStatus) && !['break','cancel'].includes(this.orderInfo.orderStatus)) {
				return false
			}
			return true
		}
	},
	watch: {
		'orderInfo.orderNo': {
			handler(newVal, oldVal) {
				this.soBtnList = [
					{ label: '关联SO', key: 'relateSO', type: 'default' },
					{ label: '新增', key: 'add', type: 'primary' }
				]
				if (!newVal) {
					this.soBtnList = [{ label: '新增', key: 'add', type: 'primary' }]
				}
			},
			deep: true
		},
		isBkgRelease: {
			handler(newVal) {
				if (newVal) {
					// this.getOrderBookInfo()
					this.getBookReleaseCheck()
				} else {
					// this.getSoList()
				}
			},
			deep: true
		}
	},
	components: {
		CreateSoDialog,
		RelateSoDialog,
		AddContainer,
		SoExport,
		Mail,
		SoUnbind
	},
	methods: {
		// 获取so附件url
		getSoFileUrl(row) {
			let { soFileNo, soFileName } = row
			if (!soFileNo || !soFileName) return
			let nameArr = soFileName.split('.')
			let name = nameArr[nameArr.length - 1]
			name = name.toLowerCase()
			let fileUrl = `${window.location.origin}/base/fileView/preview/${soFileNo}/${soFileNo}.${name}`
			let href = `${window.location.origin}/file/onlinePreview?url=${encodeURIComponent(fileUrl)}`
			return href
		},
		// so核对
		handleSoCheck(row) {
			let soFileUrl = this.getSoFileUrl(row)
			this.$router.push({
				name: 'SoCheck',
				params: {
					orderNo: this.$route.query.orderNo
				},
				query: {
					...this.$route.query,
					source: 'BookDetail',
					soFileUrl,
					so: row.so,
					containerInfo: row.containerInfo
				}
			})
		},
		getOrderBookInfo() {
			// 起运港为宁波并且是已放舱的获取so列表
			orderBookInfo({ orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
				this.soLists = res.data.soList.map(item => {
					item.vesselAndVoyage = item.vessel + '/' + item.voyage
					return {...item}
				})
				this.$emit('updateBkgSoList', this.soLists)
			})
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
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
		},
		// 获取soList数组
		getSo() {
			let soList = []
			this.multipleSelection.map(item => {
				soList.push(item.so)
			})
			return soList
		},
		// 解绑SO
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
		// 操作放舱给客户
		handleRelease() {
			if (!this.multipleSelection.length) {
				return this.$message({
					type: 'error',
					message: '请选择要放舱给客户的SO'
				})
			}
			this.submitDisabled = true
			let soList = this.getSo()
			let data = {
				jointNo: this.$route.query.jointNo,
				orderNo: this.$route.query.orderNo,
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
					}).then(res => {
						this.bookReleaseMailPopShow = true
						this.mailOnlyparam = {
							soList: data.soList, 
							opEmployeeId: this.userId
						}
					}).catch(err => {})
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
			let soList = this.getSo()
			let data = {
				jointNo: this.$route.query.jointNo,
				orderNo: this.$route.query.orderNo,
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
		// 打开邮件发送弹窗
		handleShowMailPop() {
			if (this.multipleSelection.length == 0) return this.$message({ type: 'error', message: '请选择要发送邮件给客户的SO' })
			if (this.multipleSelection.some(item => item.issueStatus !== 'y')) return this.$message({ type: 'error', message: '请选择已放舱给客户的SO' })
			this.bookReleaseMailPopShow = true
			this.selectedData = this.multipleSelection
			this.mailOnlyparam = {
				soList: this.getSo(),
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
		// 放舱校验
		getBookReleaseCheck() {
			bookReleaseCheck({orderNo: this.$route.query.orderNo}).then(res => {
				let {checkResult, checkMsg} = res.data
				this.bookReleaseCheck = checkResult
				this.bookReleaseCheckMsg = checkMsg
			})
		},
		// 船名输入建议
		querySearchVessel(queryString, cb) {
			this.$store.dispatch('dict/queryBookVessle', { 
				shipCarrierCode: this.orderInfo.ship.shipCarrierCode,
				polPortCode: this.orderInfo.ship.polPortCode,
				podPortCode: this.orderInfo.ship.podPortCode,
				vessel: queryString
			}).then(data => {
				cb(data)
			})
		},
		handleSelectVessel(value) {},
		handleClearVessel(value) {},
		// 航次输入建议
		querySearchVoyage(queryString, cb, vessel) {
			this.$store.dispatch('dict/queryBookVoyage', { 
				shipCarrierCode: this.orderInfo.ship.shipCarrierCode,
				polPortCode: this.orderInfo.ship.polPortCode,
				podPortCode: this.orderInfo.ship.podPortCode,
				vessel,
				voyage: queryString
			}).then(data => {
				cb(data)
			})
		},
		handleSelectVoyage(value) {},
		handleClearVoyage(value) {},
		showContainer(row) {
			this.orderNo = this.orderInfo.orderNo
			// this.bkgReqNo = row.bkgReqNo
			// 20210824从列表获取bkgReqNo改为从url上获取bkgReqNo
			this.bkgReqNo = this.$route.query.bkgReqNo
			this.oid = row.oid
			this.soParamStr = row.so
			this.containerInfo = row.containerInfo.split('+')
			this.addContainerShow = true
		},
		//保存编辑数据
		handleSave(row) {
			let data = { oid: row.oid, bkgReqNo: this.$route.query.bkgReqNo, so: row.so, vessel: row.vessel, voyage: row.voyage, cutOffDate: row.cutOffDate, containerInfo: row.containerInfo, remark: row.remark }
			//orderNo有值 才传此参数
			if (this.orderInfo.orderNo) {
				data.orderNo = this.orderInfo.orderNo
			}
			soUpdate(data).catch(err => {
				this.getSoList()
			})
		},
		//获取so列表
		getSoList() {
			soList(this.$route.query.bkgReqNo).then(res => {
				this.soLists = res.data || []
				this.$emit('updateBkgSoList', this.soLists)
			})
		},
		//文件上传成功时的钩子
		handleChange(file) {},
		getFile(file) {
			this.file = file
			console.log('🚀 ~ this.file', this.file)
		},

		handleImport(param) {
			// 根据后台需求数据格式
			const form = new FormData()
			// 文件对象
			form.append('file', this.file)

			this.$store
				.dispatch('user/import', {
					uri: `/order/shiporder/spacebook/so/soDragUpload/${this.orderInfo.bkgReqNo}`,
					params: form
				})
				.then(res => {
					console.log('🚀 ~ res', res)
					this.processLength = 100
					this.showProcess = false
					if (res.data.code == 0) {
						this.getSoList()
						this.$message({
							type: 'success',
							message: '导入成功',
							onClose: () => {
								this.fileList = []
							}
						})
					}
				})
				.catch(err => {
					clearInterval(this.interval)
					this.interval = null
					this.processLength=0
					this.showProcess=false
					this.fileList = []
				})
		},
		handleProgress(file, fileList) {
			if (file.status === 'ready') {
				this.processLength = 0
				this.showProcess = true
				this.interval = setInterval(() => {
					if (this.processLength >= 99) {
						clearInterval(this.interval)
						return
					}
					this.processLength += 1
				}, 200)
			}
		},

		// so btn回调
		handleClick(item) {
			if (item.key == 'add') {
				this.createSoPopShow = true
			} else if (item.key == 'relateSO') {
				this.relateSOPopShow = true
			}
		},
		// 箱型箱量关闭回调
		containerPopClose(action, data) {
			this.addContainerShow = false
			if (action === 'Confirm') {
				this.getSoList()
			}
		},
		// 新建so关闭回调
		createSoPopClose(action) {
			this.createSoPopShow = false
			if (action === 'Confirm') this.$emit('handleCallback')
			this.getSoList()
		},
		// 关联so关闭回调
		relateSoPopClose(action) {
			this.relateSOPopShow = false
			if (action === 'Confirm') this.$emit('handleCallback')
			this.getSoList()
		},
		// 删除so列表
		handleDeleteSo(row, index) {
			let data = {
				oid: row.oid,
				bkgReqNo: this.orderInfo.bkgReqNo
			}
			deleteAlert(this, deleteSo, data, this.deleteAfterFun, index, '删除','删除后SO不会保存在SO列表。')
		},
		// 解绑so
		handUnbindSo(row, index) {
			let data = {
				orderNo: this.orderInfo.orderNo,
				so: row.so,
				bkgReqNo: this.orderInfo.bkgReqNo
			}
			deleteAlert(this, unbindSo, data, this.unbindAfterFun, index, '解绑','解绑后SO会保存至SO列表。')
		},
		unbindAfterFun(index) {
			this.getSoList()
			this.$emit('handleCallback')
		},
		deleteAfterFun(index) {
			this.getSoList()
			this.$emit('handleCallback')
		},
		// 弹窗返回值
		handleBack(data) {
			console.log(data)
		},
		// 下载
		handleDownload(row) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: row.soFileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = row.soFileName
					link.click()
				})
		},
		// 预览
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.soFileNo, fileName: row.soFileName })
		}
	}
}
</script>
<style lang="scss">
@import '../../../less/index.scss';

.upload-so-info {
	.tip {
		height: 24px;
		line-height: 24px;
	}
	.el-upload-list {
		display: none;
	}
}

.so-tableinfo {
	.el-table__fixed-right::before,
	&.el-table::before {
		height: 0;
	}
	.el-table__empty-block {
		height: 20px !important;
		min-height: 20px !important;
		.el-table__empty-text {
			line-height: 20px !important;
		}
	}
	th{
		height: 24px;
		line-height: 16px;
		padding: 0;
		border-bottom: 0 !important;
	}
	td{
		padding: 2px 0;
	}
	&.el-table td .cell{
		overflow: hidden;
		white-space: nowrap;
	}
}
.ningbo-table{
	&.el-table--border{
		border: 0;
		th:last-child {
			border-right: 0;
		}
	}
	.el-table__fixed-right::before,
	&.el-table::before {
		height: 0;
	}
	.el-table__empty-block {
		height: 20px !important;
		min-height: 20px !important;
		.el-table__empty-text {
			line-height: 20px !important;
		}
	}
	&.el-table td .cell{
		overflow: hidden;
		white-space: nowrap;
	}
}
</style>
