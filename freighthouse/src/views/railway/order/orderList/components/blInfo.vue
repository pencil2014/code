<template>
	<div class="bl-info-wrap">
		<div class="row-title-left mt10">提单列表</div>
		<div class="row-form mt10 table-com-layout">
			<el-table class="bl-table" ref="blTable" stripe style="width: 100%" :data="blList" default-expand-all row-key="blId" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" :select-on-indeterminate="true" :max-height="320">
				<el-table-column prop="blId" label="ID" align="center" width="70" type=""></el-table-column>
				<el-table-column prop="blNo" label="提单号" align="left" width="220">
					<template slot-scope="scope">
						<i class="icon-tdcg" v-if="scope.row.blMode === 'tdcg'">草</i>
						<i class="icon-hbl" v-if="scope.row.blType">{{ scope.row.blType === 'hbl' ? 'H' : 'M' }}</i>
						<span class="blNo">{{ scope.row.blNo }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="status" label="草单确认" align="center" type="">
					<template slot-scope="scope">
						<div class="column-text">
							<span v-if="scope.row.isDraftConfirm === 'y'">已确认</span>
							<el-button type="text" size="mini" disabled v-else> 未确认</el-button>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="siCheck" label="补料状态" align="center" type="">
					<template slot-scope="scope">
						<div class="column-text">
							<span v-if="['ship_import_fcl', 'ship_import_lcl'].includes(detailInfo.businessType)">--</span>
							<span v-else-if="detailInfo.businessType === 'ship_export_fcl'">{{ scope.row.blType === 'hbl' ? '' : scope.row.siCheck === 'y' ? '已补料' : '未补料' }}</span>
							<div v-if="detailInfo.businessType === 'ship_export_lcl'">
								<el-button type="text" size="mini" disabled class="underline" v-if="scope.row.isDraftConfirm === 'y' && scope.row.siCheck !== 'y' && originalArr.includes(scope.row.blMode) && scope.row.blType === 'mbl'">未补料</el-button>
								<span v-else-if="scope.row.siCheck === 'y'">已补料</span>
								<span v-else>--</span>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="补料要求" align="center" type="">
					<template slot-scope="scope">
						<div class="column-text">
							<el-button disabled type="text" size="mini" class="underline" v-if="scope.row.blType === 'mbl' && detailInfo.businessType === 'ship_export_fcl'">查看</el-button>
							<span v-else>--</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="status" label="Copy件客户确认" align="center" type="" v-if="detailInfo.businessType === 'ship_export_fcl'" width="120">
					<template slot-scope="scope">
						<div class="column-text" v-if="scope.row.blType === 'mbl'">
							<el-button type="text" size="mini" disabled> 查看</el-button>
							<el-button style="margin-left:0;" type="text" size="mini" disabled v-if="scope.row.copyCheckStatus === 'submit'"> 未确认</el-button>
							<span v-else-if="scope.row.copyCheckStatus === 'pass'">已确认</span>
							<span v-else>--</span>
						</div>
						<span v-if="scope.row.blType === 'hbl'">--</span>
					</template>
				</el-table-column>
				<el-table-column prop="status" label="客户同意放货" align="center" type="" width="150">
					<template slot-scope="scope">
						<!-- 国外代理正本H单 -->
						<div class="column-text" v-if="scope.row.custClass === 'FOREIGN_PEER' && scope.row.blType === 'hbl' && originalArr.includes(scope.row.blMode)">
							<span v-if="scope.row.isAgreeRelease === 'all'">已同意</span>
							<span v-else-if="scope.row.isAgreeRelease === 'y'">同意寄单，同意放货</span>
							<el-button v-else-if="scope.row.isAgreeRelease === 'e'" type="text" size="mini" disabled>同意寄单，不同意放货</el-button>
							<el-button type="text" size="mini" disabled v-else>未同意</el-button>
						</div>
						<div class="column-text" v-else>
							<span v-if="scope.row.blMode === 'tdcg'">--</span>
							<span v-else-if="scope.row.isAgreeRelease === 'y'">已同意</span>
							<el-button type="text" size="mini" disabled v-else>未同意</el-button>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="auditStatus" label="财务审核" align="center" type="">
					<template slot-scope="scope">
						{{ scope.row.auditStatus | auditStatusFilter }}
					</template>
				</el-table-column>
				<el-table-column prop="takeStatus" label="取单状态" align="center" type="">
					<template slot-scope="scope">
						<span v-if="scope.row.blMode === 'tdcg'">--</span>
						<span v-else-if="scope.row.takeStatus === 'finish'">已取单</span>
						<span v-else>未取单</span>
					</template>
				</el-table-column>
				<el-table-column class-name="bl-put-status" prop="putStatus" label="放单状态" align="center" type="" width="120">
					<template slot-scope="scope">
						<span v-if="scope.row.blMode === 'tdcg'">--</span>
						<el-button
							v-else-if="scope.row.blType === 'hbl' && scope.row.putStatus != 'finish' && ((issueWay.includes(scope.row.blMode) && scope.row.isAgreeRelease === 'y') || ['ship_import_fcl', 'ship_import_lcl'].includes(detailInfo.businessType))"
							type="text"
							size="mini"
							disabled
						>
							未放单</el-button
						>

						<span v-else>{{ scope.row.putStatus === 'finish' ? '已放单' : '未放单' }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="blMode" label="出单方式" align="center" type="" width="120">
					<template slot-scope="scope">
						{{ scope.row.blMode | modeFilter }}
					</template>
				</el-table-column>
				<el-table-column prop="tripartiteTrade" label="三方贸易" align="center" type="">
					<template slot-scope="scope">
						{{ scope.row.tripartiteTrade | tripartFilter }}
					</template>
				</el-table-column>
				<el-table-column width="120" prop="file" label="附件" align="center" type="">
					<template slot-scope="scope">
						<div class="column-text">
							<el-button type="text" size="mini" disabled>查看{{ Number(scope.row.blFileNum) ? `(${scope.row.blFileNum})` : '' }}</el-button>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="file" label="保险" align="center" type="">
					<template slot-scope="scope">
						<div class="column-text">
							<el-button type="text" size="mini" disabled>查看{{ Number(scope.row.insuranceNum) ? `(${scope.row.insuranceNum})` : '' }}</el-button>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="file" label="贸易单证" align="center" type="">
					<template slot-scope="scope">
						<div class="column-text">
							<el-button type="text" size="mini" disabled>查看{{ Number(scope.row.documentNum) ? `(${scope.row.documentNum})` : '' }}</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div class="row-title-left mt10">提单信息</div>
		<div class="row-flex  blInfo bl-info-readonly">
			<div class="flex-item">
				<div class="item-label">
					<span class="lab">提单类型</span>
				</div>

				<el-input size="mini" v-model="createItem.blType" disabled></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">提单号</span></div>
				<el-input size="mini" v-model="createItem.blNo" disabled></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">运输条款</span></div>

				<el-input size="mini" v-model="createItem.orderInfo.transportTerm" disabled></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label">
					<span class="lab">出单方式</span>
				</div>

				<el-input size="mini" v-model="blMode" disabled></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">出单时间</span></div>
				<el-input size="mini" :value="createItem.issueTime && createItem.issueTime.slice(0, 10)" disabled></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">正/副本</span></div>
				<el-input size="mini" v-model="createItem.originalCount" style="width: 45%" disabled></el-input>
				<span class="seprate-line">/</span>
				<el-input size="mini" v-model="createItem.copyCount" style="width: 45%" disabled></el-input>
			</div>

			<div class="flex-item">
				<div class="item-label"><span class="lab">签单人</span></div>

				<el-input size="mini" v-model="createItem.signEmployeeName" disabled></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">签单时间</span></div>
				<el-input size="mini" :value="createItem.signTime && createItem.signTime.slice(0, 10)" disabled></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">签单地点</span></div>
				<el-input size="mini" v-model="createItem.signAddress" disabled></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label">
					<span class="lab">付款方式</span>
				</div>

				<el-input size="mini" v-model="payMode" disabled></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">合约号</span></div>
				<el-input size="mini" v-model="createItem.orderInfo.contractNo" disabled></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">合约公司</span></div>
				<el-input size="mini" v-model="createItem.orderInfo.contractCompany" disabled></el-input>
			</div>
			<div class="flex-item col-3">
				<div class="item-label">
					<span class="lab">Shipper(发货人)</span>
				</div>
				<el-input type="textarea" :rows="4" size="mini" v-model="createItem.blContact.shipper" disabled></el-input>
			</div>
			<div class="flex-item col-3">
				<div class="item-label">
					<span class="lab">Consignee(收货人)</span>
				</div>
				<el-input type="textarea" :rows="4" size="mini" v-model="createItem.blContact.consignee" disabled></el-input>
			</div>
			<div class="flex-item col-3">
				<div class="item-label notify">
					<span class="lab" :class="notify === '1' ? 'active' : ''" @click="handleNotifyClick('1')">Notify Party(通知人)</span>
					<span class="lab" :class="notify === '2' ? 'active' : ''" @click="handleNotifyClick('2')">Also Notify Party(通知人)</span>
				</div>
				<el-input type="textarea" :rows="4" size="mini" v-model="createItem.blContact.notify1" v-if="notify === '1'" disabled></el-input>
				<el-input type="textarea" :rows="4" size="mini" v-model="createItem.blContact.notify2" v-if="notify === '2'" disabled></el-input>
			</div>
			<div class="flex-item col-3">
				<div class="item-label"><span class="lab">Forwarding Agent（运输代理人）</span></div>
				<el-input type="textarea" :rows="4" size="mini" v-model="createItem.orderInfo.forwardAgent" disabled></el-input>
			</div>
			<div class="flex-item col-3">
				<div class="item-label"><span class="lab">提单备注(打印)</span></div>
				<el-input disabled type="textarea" :rows="4" size="mini" v-model="createItem.remarkPrint"></el-input>
			</div>
			<div class="flex-item col-3">
				<div class="item-label"><span class="lab">系统备注（不打印）</span></div>
				<el-input disabled type="textarea" :rows="4" size="mini" v-model="createItem.remark"></el-input>
			</div>
			<div v-if="createItem.isBarge" class="flex-item">
				<div class="item-label"><span class="lab">驳船船名</span></div>

				<el-input disabled size="mini" v-model="createItem.orderInfo.bargeVessel"></el-input>
			</div>
			<div v-if="createItem.isBarge" class="flex-item">
				<div class="item-label"><span class="lab">驳船船次</span></div>

				<el-input disabled size="mini" v-model="createItem.orderInfo.bargeVoyage"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">大船船名</span></div>

				<el-input disabled size="mini" v-model="createItem.orderInfo.vessel"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">大船航次</span></div>

				<el-input disabled size="mini" v-model="createItem.orderInfo.voyage"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label">
					<span class="lab">截补料时间</span>
				</div>

				<el-input disabled size="mini" :value="createItem.orderInfo.siCutOff && createItem.orderInfo.siCutOff.slice(0, 13)"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">船公司</span></div>

				<el-input disabled size="mini" v-model="createItem.orderInfo.shipCarrierCode"></el-input>
			</div>
			<div v-if="createItem.isBarge" class="flex-item">
				<div class="item-label">
					<span class="lab">驳船收货地</span>
				</div>

				<el-input disabled size="mini" :value="createItem.orderInfo.bargePorPortName"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label">
					<span class="lab">大船起运港</span>
				</div>

				<el-input disabled size="mini" :value="createItem.orderInfo.polPortName"></el-input>
			</div>
			<div class="flex-item multi-select-tag">
				<div class="item-label"><span class="lab">中转港</span></div>

				<el-input disabled size="mini" :value="createItem.orderInfo.transitPortName"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">卸货港</span></div>

				<el-input disabled size="mini" :value="createItem.orderInfo.unloadingPortName"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">目的地</span></div>

				<el-input disabled size="mini" :value="createItem.orderInfo.podPortName"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label">
					<span class="lab">最终目的地</span>
				</div>
				<el-input disabled size="mini" v-model="createItem.orderInfo.deliveryPlace"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">预计到港时间</span></div>
				<el-input disabled size="mini" v-model="createItem.orderInfo.etaTime"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">大船实际开船时间</span></div>
				<el-input disabled size="mini" v-model="createItem.orderInfo.tdTime"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">三方贸易</span></div>

				<el-input disabled size="mini" v-model="tripartiteTrade"></el-input>
			</div>

			<div v-if="createItem.isBarge" class="flex-item">
				<div class="item-label"><span class="lab">驳船实际开船时间</span></div>
				<el-input disabled size="mini" v-model="createItem.orderInfo.bargeTdTime"></el-input>
			</div>
			<div class="flex-item col-1">
				<div class="flex-item col-2">
					<div class="item-label">
						<span class="lab">唛头</span>
					</div>
					<el-input disabled type="textarea" :rows="4" size="mini" v-model="createItem.cargoMark"></el-input>
				</div>
				<div class="flex-item col-2">
					<div class="item-label">
						<span class="lab">货物描述</span>
					</div>
					<el-input disabled type="textarea" :rows="4" size="mini" v-model="createItem.cargoDesc"></el-input>
				</div>
			</div>
		</div>
		<div v-if="detailInfo.businessType === 'ship_export_fcl'" class="cargo-wrap">
			<div class="cargo-title mb20">
				<span class="row-title-left">集装箱信息</span>
				<span>箱量 : {{ containerTotal.container }} </span><span>货量 : 件数{{ containerTotal.quantity }}</span
				><span> 毛重 : {{ containerTotal.weight }} KGS</span><span> 体积 : {{ containerTotal.volume }} CBM</span>
			</div>
			<div class="row-cargo">
				<el-table :data="cargoData" fit style="width: 100%">
					<el-table-column prop="containerType" label="箱型" align="center"></el-table-column>
					<el-table-column prop="so" label="SO号" align="center"></el-table-column>
					<el-table-column prop="cn" label="箱号" align="center"></el-table-column>
					<el-table-column prop="quantity" label="件数" align="center"> </el-table-column>
					<el-table-column prop="weight" label="毛重" align="center"> </el-table-column>
					<el-table-column prop="volume" label="体积" align="center"> </el-table-column>
					<el-table-column prop="packageType" label="包装" align="center"> </el-table-column>
				</el-table>
			</div>
		</div>
		<BlLclDto :createItem="createItem" ref="blLclDto" v-if="showBlLcl && detailInfo.businessType === 'ship_export_lcl'" />
	</div>
</template>

<script>
import { blDetailRail } from '@/api/railway/bl'
import { blDetail, blList } from '@/api/order/bl'
import { mapState } from 'vuex'
import { mainInfo } from '@/api/railway/list'
import BlLclDto from './blLclDto'
import store from '@/store'
import { getDictLabel } from '@/utils/tools'
export default {
	data() {
		return {
			issueWay: ['telex_release', 'bill_at_destination', 'ibl', 'seaway_bill', 'jthdldf', 'free_telex_release'], // 该出单方式之一才可以更改放单状态
			blList: [],
			showBlLcl: false,
			detailInfo: {},
			createItem: {
				blLclDto: {},
				blType: '',
				blNo: '',
				orderInfo: {
					transportTerm: '',
					contractNo: '',
					contractCompany: '',
					bargeVessel: '',
					bargeVoyage: '',
					payMode: '',
					vessel: '',
					voyage: '',
					siCutOff: '',
					shipCarrierCode: '',
					bargePorPortCode: '',
					polPortCode: '',
					transitPortCode: '',
					unloadingPortCode: '',
					podPortCode: '',
					deliveryPlace: '',
					etaTime: '',
					tdTime: '',
					bargeTdTime: '',
					forwardAgent: ''
				},
				blContact: {
					shipper: '',
					consignee: '',
					notify1: ''
				},
				blMode: '',
				issueTime: '',
				originalCount: '',
				copyCount: '',
				signEmployeeName: '',
				signTime: '',
				signAddress: '',
				remarkPrint: '',
				remark: '',
				cargoMark: '',
				cargoDesc: '',
				tripartiteTrade: ''
			},
			cargoData: [],

			state: '',
			isEdit: false,
			oQuery: this.$route.query,
			sysLineName: '',
			transitPortOptions: [],
			portList: [],
			pickerOptions: {
				disabledDate(date) {
					//disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
					return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			signEmployeeOptions: [],
			notify: '1'
		}
	},
	props: {},
	async created() {
		let res = await mainInfo({ orderNo: this.$route.query.orderNo })
		this.detailInfo = res.data
		this.getBlDetail()
		if (!this.createItem.signAddress) {
			this.getUserCompanyMethod()
		}
		// bl列表
		this.getBlList()
	},
	mounted() {
		console.log('this.dictMap', this.dictMap)
	},
	filters: {
		blStatusFilter(status) {
			return getDictLabel('blStatus', status)
		},
		postStatusFilter(postStatus) {
			return getDictLabel('postStatus', postStatus)
		},
		auditStatusFilter(auditStatus) {
			let auditStatusOptions = store.state.order.finAuditStatusOptions
			return auditStatusOptions[auditStatus] || '--'
		},
		releaseTypeFilter(releaseType) {
			return getDictLabel('releaseType', releaseType)
		},
		modeFilter(blMode) {
			return getDictLabel('blMode', blMode)
		},
		tripartFilter(tripartiteTrade) {
			return getDictLabel('tripartiteTrade', tripartiteTrade)
		}
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			role: state => state.user.role,
			roles: state => state.user.roles
		}),
		// 箱型箱量统计
		containerTotal() {
			let total = { container: '', quantity: 0, weight: 0, volume: 0, show: true },
				containerTypeList = { type: [], num: [] }

			if (this.createItem.blCargos && this.createItem.blCargos.length) {
				this.createItem.blCargos.forEach(o => {
					// 重量，体积
					total.quantity += parseInt(o.quantity)
					total.weight += parseFloat(o.weight)
					total.volume += parseFloat(o.volume)
					total.weight = parseFloat(total.weight.toFixed(10))
					total.volume = parseFloat(total.volume.toFixed(10))
					let typeIndex = containerTypeList.type.indexOf(o.containerType)
					if (typeIndex != -1) {
						containerTypeList.num[typeIndex] = containerTypeList.num[typeIndex] + 1
					} else {
						containerTypeList.type.push(o.containerType)
						containerTypeList.num.push(1)
					}
				})
			}
			// 箱型
			for (let i in containerTypeList.type) {
				total.container += (total.container ? ' + ' : '') + containerTypeList.type[i] + '×' + containerTypeList.num[i]
			}
			return total
		},
		blMode() {
			if (this.dictMap.blMode && this.dictMap.blMode.find(item => item.value === this.createItem.blMode)) {
				return this.dictMap.blMode.find(item => item.value === this.createItem.blMode).label
			}
		},
		payMode() {
			let dicMode = this.dictMap.payMode
			let cMode = this.createItem.orderInfo.payMode
			let modeItem = dicMode.find(item => item.value === cMode)
			if (dicMode && modeItem) {
				return modeItem.label
			}
		},
		tripartiteTrade() {
			let tripart = this.dictMap.tripartiteTrade.find(item => item.value === this.createItem.tripartiteTrade)
			return tripart && tripart.label
		}
	},

	components: {
		BlLclDto
	},
	methods: {
		// 获取提单列表
		getBlList() {
			blList({ orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
				this.blList = res.data || []
			})
		},

		//转换中英文名称格式
		transformEnCnName(enNames, cnNames) {
			let enArr = enNames.split(',')
			let cnArr = cnNames.split(',')
			let totalArr = enArr.map((item, index) => {
				return `${item}(${cnArr[index]})`
			})
			return totalArr.join(',')
		},
		handleNotifyClick(val) {
			this.notify = val
		},
		async getBlDetail() {
			let { blId, orderNo } = this.$route.query
			blDetail({ blId, orderNo }).then(res => {
				if (res) {
					res.data.blType = res.data.blType.toUpperCase()
					this.createItem = res.data
					this.showBlLcl = true
					this.cargoData = res.data.blCargos
				}
			})
		},
		getUserCompanyMethod() {
			// 获取当前登录账号所属公司信息
			this.$store.dispatch('order/getUserCompanyInfoAction').then(signAddress => {
				this.createItem.signAddress = signAddress
			})
		}
	}
}
</script>

<style lang="scss">
.icon-tdcg {
	display: inline-block;
	width: 16px;
	height: 16px;
	background: #b3b3b3;
	border-radius: 2px;
	color: #fff;
	line-height: 16px;
	text-align: center;
	font-style: normal;
	margin-right: 2px;
	font-size: 12px;
}
.icon-hbl {
	display: inline-block;
	width: 16px;
	height: 16px;
	background: #3e80f5;
	border-radius: 2px;
	color: #fff;
	line-height: 16px;
	text-align: center;
	font-style: normal;
}
.row-flex.blInfo .no-barge-time {
	opacity: 0;
}
.bl-info-wrap {
	padding: 10px;
}
.bl-info-readonly {
	padding-left: 10px;
	margin-top: 15px;
	overflow: hidden;
	.el-input.is-disabled .el-input__inner,
	.el-input.is-disabled .el-input__icon,
	.el-select .el-input.is-disabled .el-input__inner,
	.el-textarea.is-disabled .el-textarea__inner {
		cursor: text;
	}

	.flex-item {
		.item-label {
			cursor: default;
		}
		width: 16.6%;
		padding: 0 10px 0 0;
		margin-bottom: 4px;
		float: left;
		&.mb12 {
			margin-bottom: 12px;
		}
		&.col-1 {
			width: 100%;
		}
		&.col-2 {
			width: 50%;
		}
		&.col-half {
			width: 66.66%;
		}
		&.col-3 {
			width: 33.2%;
		}
		&.pl0 {
			padding-left: 0;
		}
		&.flex-item-double {
			width: 25%;
			float: right;
			height: 100px;
			.el-textarea__inner {
				height: 80px;
			}
		}
		.item-label {
			font-size: 12px;
			line-height: 20px;
			height: 20px;
			margin-bottom: 0;
			display: flex;
			span {
				display: block;
			}
			.lab {
				display: flex;
				em {
					font-style: normal;
				}
			}
		}
	}
}

.mt10 {
	margin-top: 10px;
}
.mb20 {
	margin: 20px 0;
}
.cargo-title {
	span {
		margin-right: 20px;
	}
}
.row-cargo {
	padding: 10px;
}
.row-title-left {
	font-size: 14px;
	color: #4a4a4a;
}
.seprate-line {
	display: inline-block;
	width: 10%;
	font-size: 12px;
	margin: 0;
	text-align: center;
}
.blInfo .notify .lab {
	padding: 0 10px;
	cursor: pointer;
}
.blInfo .notify .lab.active {
	border: 1px solid #dcdfe6;
	border-top-left-radius: 4px;
	border-top-right-radius: 4px;
	border-bottom: 0;
	color: #1890ff;
}
.row-flex.blInfo .flex-item {
	padding-bottom: 0px !important;
}
</style>
