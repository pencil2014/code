<template>
	<div class="bl-info">
		<div class="sub-tit">
			<span>基本信息</span>
		</div>
		<el-row class="row">
			<el-col :span="8" class="item">
				<span class="label">提单类型：</span>
				<span class="value">{{ getDictLabelFunc('blType', createItem.blType) }}</span>
			</el-col>
			<el-col :span="8" class="item">
				<span class="label">提单号：</span>
				<span class="value">{{createItem.blNo}}</span>
			</el-col>
			<el-col :span="8" class="item">
				<span class="label">出单方式：</span>
				<span class="value">{{ getDictLabelFunc('blMode', createItem.blMode) }}</span>
			</el-col>
		</el-row>
		<el-row class="row">
			<el-col :span="8" class="item">
				<span class="label">付款方式：</span>
				<span class="value">{{ getDictLabelFunc('payMode', createItem.orderInfo.payMode) }}</span>
			</el-col>
			<el-col :span="8" class="item">
				<span class="label">大船船名/航次：</span>
				<span class="value">{{createItem.orderInfo.vessel}}/{{createItem.orderInfo.voyage}}</span>
			</el-col>
			<el-col :span="8" class="item">
				<span class="label">驳船船名/航次：</span>
				<span class="value">{{createItem.orderInfo.bargeVessel}}/{{createItem.orderInfo.bargeVoyage}}</span>
			</el-col>
		</el-row>
		<el-row class="row">
			<el-col :span="8" class="item">
				<span class="label">船公司：</span>
				<span class="value">{{createItem.orderInfo.shipCarrierCode}}</span>
			</el-col>
		</el-row>
		<div class="sub-tit">
			<span>收发通信息</span>
		</div>
		<el-row class="row">
			<el-col :span="8" class="column">
				<div class="label">Shipper(发货人)：</div>
				<div class="value" v-html="createItem.blContact.shipper">
				</div>
			</el-col>
			<el-col :span="8" class="column">
				<div class="label">Consignee(收货人)：</div>
				<div class="value" v-html="createItem.blContact.consignee">
				</div>
			</el-col>
			<el-col :span="8" class="column">
				<div class="label">Notify Party1(通知人1)：</div>
				<div class="value" v-html="createItem.blContact.notify1">
				</div>
			</el-col>
		</el-row>
		<el-row class="row">
			<el-col :span="8" class="column">
				<div class="label">Also Notify Party(通知人2)：</div>
				<div class="value" v-html="createItem.blContact.notify2">
				</div>
			</el-col>
		</el-row>
		<div class="sub-tit">
			<span>货物信息</span>
		</div>
		<el-row class="row">
			<el-col :span="8" class="column">
				<div class="label">唛头</div>
				<div class="value" v-html="createItem.cargoMark">
				</div>
			</el-col>
			<el-col :span="8" class="column">
				<div class="label">货物描述</div>
				<div class="value" v-html="createItem.cargoDesc">
				</div>
			</el-col>
			<el-col :span="8" class="column">
				<div class="label">提单备注</div>
				<div class="value" v-html="createItem.remarkPrint">
				</div>
			</el-col>
		</el-row>
		<div class="sub-tit">
			<span>港口信息</span>
		</div>
		<el-row class="row">
			<el-col :span="8" class="item">
				<span class="label">收货地：</span>
				<span class="value">{{createItem.orderInfo.bargePorPortName}}</span>
			</el-col>
			<el-col :span="8" class="item">
				<span class="label">大船起运港：</span>
				<span class="value">{{createItem.orderInfo.polPortName}}</span>
			</el-col>
			<el-col :span="8" class="item">
				<span class="label">中转港：</span>
				<span class="value">{{createItem.orderInfo.transitPortName}}</span>
			</el-col>
		</el-row>
		<el-row class="row">
			<el-col :span="8" class="item">
				<span class="label">卸货港：</span>
				<span class="value">{{createItem.orderInfo.unloadingPortName}}</span>
			</el-col>
			<el-col :span="8" class="item">
				<span class="label">目的地：</span>
				<span class="value">{{createItem.orderInfo.podPortName}}</span>
			</el-col>
			<el-col :span="8" class="item">
				<span class="label">最终目的地：</span>
				<span class="value">{{createItem.orderInfo.deliveryPlace}}</span>
			</el-col>
		</el-row>
		<div class="sub-tit">
			<span>补料附件</span>
		</div>
		<el-row class="row">
			<el-col :span="24" class="file-item" v-for="(item, index) in fileList" :key="index">
				<img :src="require(`@/views/order/order/images/sw/icon-si-file.png`)" class="icon-si-file" alt="">
				<el-button type="text" class="si-file-name" @click="handleViewFile(item)">{{item.fileName}}</el-button>
			</el-col>
		</el-row>
		<div class="tit">
			<img :src="require(`@/views/order/order/images/sw/cust-tit-icon.png`)" class="img-tit" alt="">
			<span>集装箱信息</span>
		</div>
		<el-table class="container-table" style="width: 100%" :data="createItem.blCargos">
			<el-table-column prop="containerType" label="箱型" align="center" width=""></el-table-column>
			<el-table-column prop="so" label="SO号" align="center" type="" width=""></el-table-column>
			<el-table-column prop="cn" label="箱号" align="center" type="" width=""></el-table-column>
			<el-table-column prop="sn" label="封号" align="center" type="" width=""></el-table-column>
			<el-table-column prop="quantity" label="件数" align="center" type="" width=""></el-table-column>
			<el-table-column prop="weight" label="毛重(KGS)" align="center" type="" width=""></el-table-column>
			<el-table-column prop="volume" label="体积(CBM)" align="center" type="" width=""></el-table-column>
			<el-table-column prop="packageType" label="包装" align="center" type="" width="">
				<template slot-scope="scope">
					<span>{{ getDictLabelFunc('packageType', scope.row.packageType) }}</span>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { custBlFileList } from '@/api/order/bl'

export default {
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		custBlDictMap: {
			type: Object,
			default: () => ({})
		},
		param: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			fileList: []
		}
	},
	async created() {
		this.getFileList()
	},
	mounted() {
	},
	watch: {
	},
	computed: {
		// ...mapState({
		// }),
	},
	components: {
		
	},
	methods: {
		handleViewFile(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},
		// 附件列表
		getFileList() {
			custBlFileList(this.param).then(res => {
				this.fileList = res.data
			})
		},
		getDictLabelFunc(key, val) {
			let dictArr = this.custBlDictMap[key]
			let findItem = dictArr.find(item => item.value === val)
			return (findItem ? findItem.label : '')
		},
	}
}
</script>
<style lang="scss" scoped>
.bl-info {
	.tit {
		height: 24px;
		margin-bottom: 24px;
		.img-tit {
			display: inline-block;
			width: 20px;
			height: 20px;
			margin-right: 8px;
		}
		span {
			font-size: 20px;
			line-height: 24px;
			color: #222222;
			font-weight: bold;
		}
	}
	.sub-tit {
		height: 40px;
		background: #F4F5F8;
		margin-bottom: 16px;
		span {
			font-size: 12px;
			font-weight: bold;
			color: #222222;
			line-height: 40px;
			margin-left: 8px;
		}
	}
	.row {
		margin-bottom: 24px;
		padding: 0 8px;
		.item {
			line-height: 20px;
			display: flex;
			padding-left: 14px;
			&:first-child {
				padding-left: 0;
			}
			.label {
				color: #222;
				display: inline-block;
			}
			.value {
				display: inline-block;
				flex: 1;
				word-break: break-all;
				color: #4a4a4a;
				white-space: normal;
			}
		}
		.file-item {
			line-height: 20px;
			display: flex;
			margin-bottom: 8px;
			.si-file-name {
				display: inline-block;
				color: #206EF9;
				padding: 0;
				text-align: left;
				font-size: 12px;
			}
			.icon-si-file {
				display: inline-block;
				width: 16px;
				height: 16px;
				margin-right: 8px;
			}
		}
		.column {
			line-height: 20px;
			padding-left: 14px;
			&:first-child {
				padding-left: 0;
			}
			.label {
				color: #222;
				margin-bottom: 10px;
			}
			.value {
				color: #4a4a4a;
				word-break: break-all;
			}
		}
	}
	/deep/ .el-table{
		&.container-table {
			th {
				background-color: #F4F5F8;
				height: 40px;
				line-height: 20px;
				padding: 10px 0;
			}
			td {
				line-height: 20px;
				padding: 10px 0;
				border-bottom: 1px solid #EBEEF5;
			}
		}
	}
}
</style>
