<template>
	<div class="bl-info-wrap">
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
			<!-- <div class="flex-item">
				<div class="item-label"><span class="lab">出单时间</span></div>
				<el-input size="mini" :value="createItem.issueTime && createItem.issueTime.slice(0, 10)" disabled></el-input>
			</div> -->
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
				<el-input size="mini" v-model="createItem.orderInfo.contractNo" disabled maxlength="128"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">合约公司</span></div>
				<el-input size="mini" v-model="createItem.orderInfo.contractCompany" disabled maxlength="128"></el-input>
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
				<el-button type="default" size="mini" style="margin-left: 5px;" @click="getShippingCarrierUrl(createItem.orderInfo.shipCarrierCode)">船司官网</el-button>
			</div>
			<div v-if="createItem.isBarge" class="flex-item">
				<div class="item-label">
					<span class="lab">驳船收货地</span>
				</div>

				<el-input disabled size="mini" :value="bargePorPortName"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label">
					<span class="lab">大船起运港</span>
				</div>

				<el-input disabled size="mini" :value="polPortName"></el-input>
			</div>
			<div class="flex-item multi-select-tag">
				<div class="item-label"><span class="lab">中转港</span></div>

				<el-input disabled size="mini" :value="transitPortName"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">卸货港</span></div>

				<el-input disabled size="mini" :value="unloadingPortName"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">目的地</span></div>

				<el-input disabled size="mini" :value="podPortName"></el-input>
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
import { blDetail } from '@/api/order/bl'
import { mapState } from 'vuex'
import { mainInfo } from '@/api/order/list'
import BlLclDto from './blLclDto'
export default {
	data() {
		return {
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
					// return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
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
	},
	mounted() {
		console.log('this.dictMap', this.dictMap)
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
					total.weight = parseFloat(total.weight.toFixed(3))
					total.volume = parseFloat(total.volume.toFixed(3))
					total.quantity = parseFloat(total.quantity.toFixed(3))
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
		},
		bargePorPortName() {
			if (this.createItem.orderInfo.bargePorPortEname) {
				return `${this.createItem.orderInfo.bargePorPortEname}(${this.createItem.orderInfo.bargePorPortName})`
			} else {
				return ''
			}
		},
		polPortName() {
			if (this.createItem.orderInfo.polPortEname) {
				return this.transformEnCnName(this.createItem.orderInfo.polPortEname, this.createItem.orderInfo.polPortName)
			}
		},
		transitPortName() {
			if (this.createItem.orderInfo.transitPortEname) {
				return this.transformEnCnName(this.createItem.orderInfo.transitPortEname, this.createItem.orderInfo.transitPortName)
			}
		},
		unloadingPortName() {
			if (this.createItem.orderInfo.unloadingPortEname) {
				return this.transformEnCnName(this.createItem.orderInfo.unloadingPortEname, this.createItem.orderInfo.unloadingPortName)
			}
		},
		podPortName() {
			if (this.createItem.orderInfo.podPortEname) {
				return this.transformEnCnName(this.createItem.orderInfo.podPortEname, this.createItem.orderInfo.podPortName)
			}
		}
	},

	components: {
		BlLclDto
	},
	methods: {
		// 船公司官网
		getShippingCarrierUrl(carrierCode) {
			if (!carrierCode) return
			this.$store.dispatch('order/getShippingCarrierWebUrl', {carrierCode})
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
			let { data: res } = await blDetail({ blId, orderNo })
			console.log('🚀 ~ res', res)
			if (res) {
				res.blType = res.blType.toUpperCase()
				this.createItem = res
				this.showBlLcl = true
				this.cargoData = res.blCargos
				console.log('🚀 ~ this.createItem', this.createItem)
			}
		}
	}
}
</script>

<style lang="scss">
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
	// .el-input--mini .el-input__inner{
	// 	height: 20px;
	// }
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
