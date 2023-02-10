<template>
	<div class="bl-info-wrap">
		<div class="row-title-left mt10">提单信息RAIL</div>
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

				<el-input size="mini" v-model="createItem.transportTerm" disabled></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label">
					<span class="lab">出单方式</span>
				</div>

				<el-input size="mini" v-model="blMode" disabled></el-input>
			</div>

			<div class="flex-item">
				<div class="item-label"><span class="lab">正/副本</span></div>
				<el-input size="mini" v-model="createItem.numOriginal" style="width: 45%" disabled></el-input>
				<span class="seprate-line">/</span>
				<el-input size="mini" v-model="createItem.numCopy" style="width: 45%" disabled></el-input>
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
			<div style="opacity:0;" class="flex-item">
				<div class="item-label">
					<span class="lab">xxxx</span>
				</div>
				<el-input size="mini" v-model="payMode" disabled></el-input>
			</div>
			<div style="opacity:0;" class="flex-item">
				<div class="item-label">
					<span class="lab">xxxx</span>
				</div>
				<el-input size="mini" v-model="payMode" disabled></el-input>
			</div>

			<div class="flex-item col-3">
				<div class="item-label">
					<span class="lab">Shipper(发货人)</span>
				</div>
				<el-input type="textarea" :rows="4" size="mini" v-model="createItem.shipper" disabled></el-input>
			</div>
			<div class="flex-item col-3">
				<div class="item-label">
					<span class="lab">Consignee(收货人)</span>
				</div>
				<el-input type="textarea" :rows="4" size="mini" v-model="createItem.consignee" disabled></el-input>
			</div>
			<div class="flex-item col-3">
				<div class="item-label notify">
					<span class="lab" :class="notify === '1' ? 'active' : ''" @click="handleNotifyClick('1')">Notify Party(通知人)</span>
					<span class="lab" :class="notify === '2' ? 'active' : ''" @click="handleNotifyClick('2')">Also Notify Party(通知人)</span>
				</div>
				<el-input type="textarea" :rows="4" size="mini" v-model="createItem.notify1" v-if="notify === '1'" disabled></el-input>
				<el-input type="textarea" :rows="4" size="mini" v-model="createItem.notify2" v-if="notify === '2'" disabled></el-input>
			</div>
			<div class="flex-item col-3">
				<div class="item-label"><span class="lab">Forwarding Agent（运输代理人）</span></div>
				<el-input type="textarea" :rows="4" size="mini" v-model="createItem.forwardAgent" disabled></el-input>
			</div>

			<div class="flex-item col-3">
				<div class="item-label"><span class="lab">唛头</span></div>
				<el-input disabled type="textarea" :rows="4" size="mini" v-model="createItem.cargoMark"></el-input>
			</div>
			<div class="flex-item col-3">
				<div class="item-label"><span class="lab">货物描述</span></div>
				<el-input disabled type="textarea" :rows="4" size="mini" v-model="createItem.cargoDesc"></el-input>
			</div>

			<div class="flex-item">
				<div class="item-label"><span class="lab">收货站</span></div>

				<el-input disabled size="mini" :value="createItem.porPortName"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label">
					<span class="lab">起运站</span>
				</div>

				<el-input disabled size="mini" :value="createItem.polPortName"></el-input>
			</div>

			<div class="flex-item">
				<div class="item-label"><span class="lab">目的站</span></div>

				<el-input disabled size="mini" :value="createItem.podPortName"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label">
					<span class="lab">最终目的地</span>
				</div>
				<el-input disabled size="mini" v-model="createItem.finalPodPortName"></el-input>
			</div>

			<div class="flex-item">
				<div class="item-label"><span class="lab">实际发车时间</span></div>
				<el-input disabled size="mini" v-model="createItem.tdTime"></el-input>
			</div>
			<div class="flex-item">
				<div class="item-label"><span class="lab">班名/班次</span></div>

				<el-input disabled size="mini" v-model="createItem.vesselVoyage"></el-input>
			</div>
		</div>
		<div v-if="detailInfo.businessType === 'rail_export_fcl'" class="cargo-wrap">
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
		<BlLclDto :createItem="createItem.blLclDto" ref="blLclDto" v-if="showBlLcl && detailInfo.businessType === 'rail_export_lcl'" />
	</div>
</template>

<script>
import { blDetailRail } from '@/api/railway/bl'
import { mapState } from 'vuex'
import { mainInfo } from '@/api/railway/list'
import BlLclDto from './blLclDtoRail'
export default {
	data() {
		return {
			showBlLcl: false,
			detailInfo: {},
			createItem: {
				blLclDto: {},
				blType: '',
				blNo: '',
				transportTerm: '',
				vesselVoyage: '',
				payMode: '',
				finalPodPortName: '',
				porPortName: '',
				polPortName: '',
				podPortName: '',
				tdTime: '',
				forwardAgent: '',
				shipper: '',
				consignee: '',
				notify1: '',
				notify2: '',
				blMode: '',
				originalCount: '',
				copyCount: '',
				signEmployeeName: '',
				signTime: '',
				signAddress: '',
				cargoMark: '',
				cargoDesc: ''
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
			let cMode = this.createItem.payMode
			let modeItem = dicMode.find(item => item.value === cMode)
			if (dicMode && modeItem) {
				return modeItem.label
			}
		}
	},

	components: {
		BlLclDto
	},
	methods: {
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
			blDetailRail({ blId, orderNo }).then(res => {
				if (res) {
					this.createItem = { ...res.data.bl, ...res.data.order, ...res.data.transport }
					this.cargoData = res.data.containerList
					res.data.containerList.length > 0 && (this.createItem.blLclDto = res.data.containerList[0])
					this.showBlLcl = true
				}
			})
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
