<template>
	<div class="change-info">
		<ul class="row tit">
			<li class="label"></li>
			<li class="history-val">历史数据</li>
			<li class="new-val">最新数据</li>
		</ul>
		<ul class="row li-merge">
			<li class="label">修改类型</li>
			<li class="two-li">改港</li>
		</ul>

		<!-- <ul class="row">
			<li class="label">装货地</li>
			<li class="history-val">{{ hisData.receiptPlaceName }}</li>
			<li class="new-val">{{ newData.receiptPlaceName }}</li>
		</ul>
		<ul class="row">
			<li class="label">目的地</li>
			<li class="history-val">{{ hisData.podPortCode }}</li>
			<li class="new-val">{{ newData.podPortCode }}</li>
		</ul> -->
		<ul class="row" v-for="(item, index) in changeData" :key="'change' + index">
			<li class="label">{{ item.label }}</li>
			<li class="history-val">{{ item.historyVal }}</li>
			<li class="new-val">{{ item.newVal }}</li>
		</ul>
		<ul class="row li-merge">
			<li class="label">保函附件</li>
			<li class="two-li">
				<el-button type="text" @click="handleView(index)" v-for="(item, index) in changeFileNameList" :key="'file' + index">{{ item }}</el-button>
			</li>
		</ul>
		<ul class="row li-merge">
			<li class="label">修改原因</li>
			<li class="two-li">{{ newData.changeRemark }}</li>
		</ul>
	</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
	data() {
		return {
			changeData: []
		}
	},
	props: {
		newData: {
			type: Object,
			default: () => ({})
		},
		hisData: {
			type: Object,
			default: () => ({})
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
		changeFileNameList() {
			if (!this.newData.changeFileNameList) return []
			return this.newData.changeFileNameList.split('&&')
		},
		changeFileNoList() {
			if (!this.newData.changeFileNoList) return []
			return this.newData.changeFileNoList.split('&&')
		}
	},
	watch: {},
	components: {},
	methods: {
		getChangeInfo() {
			let ship = this.hisData
			let newShip = this.newData
			this.changeData = []
			ship.receiptPlaceName !== newShip.receiptPlaceName &&
				this.changeData.push({
					label: '装货地',
					historyVal: ship.receiptPlaceName,
					newVal: newShip.receiptPlaceName
				})
			ship.etdTime !== newShip.etdTime &&
				this.changeData.push({
					label: '大船预计开船时间',
					historyVal: ship.etdTime,
					newVal: newShip.etdTime
				})
			ship.vessel !== newShip.vessel &&
				this.changeData.push({
					label: '大船船名',
					historyVal: ship.vessel,
					newVal: newShip.vessel
				})
			ship.voyage !== newShip.voyage &&
				this.changeData.push({
					label: '大船航次',
					historyVal: ship.voyage,
					newVal: newShip.voyage
				})
			ship.ccCutOff !== newShip.ccCutOff &&
				this.changeData.push({
					label: '截报关时间',
					historyVal: ship.ccCutOff && ship.ccCutOff.substring(0, 13),
					newVal: newShip.ccCutOff && newShip.ccCutOff.substring(0, 13)
				})

			ship.polPortCode !== newShip.polPortCode &&
				this.changeData.push({
					label: '起运港',
					historyVal: ship.polPortCode ? `${ship.polPortCode}(${ship.polPortName})` : '',
					newVal: `${newShip.polPortCode}(${newShip.polPortName})`
				})

			ship.unloadingPortCode !== newShip.unloadingPortCode &&
				this.changeData.push({
					label: '卸货港',
					historyVal: ship.unloadingPortCode ? `${ship.unloadingPortCode}(${ship.unloadingPortName})` : '',
					newVal: `${newShip.unloadingPortCode}(${newShip.unloadingPortName})`
				})
			ship.podPortCode !== newShip.podPortCode &&
				this.changeData.push({
					label: '目的地',
					historyVal: ship.podPortCode ? `${ship.podPortCode}(${ship.podPortName})` : '',
					newVal: `${newShip.podPortCode}(${newShip.podPortName})`
				})
		},
		// 保函附件预览
		handleView(index) {
			let fileNo = this.changeFileNoList[index]
			let fileName = this.changeFileNameList[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		}
	}
}
</script>

<style lang="scss" scoped>
.change-info {
	overflow: hidden;
	border-top: 1px solid #dfe6ec;
	border-left: 1px solid #dfe6ec;
	border-right: 1px solid #dfe6ec;
	box-sizing: border-box;
	.row {
		position: relative;
		align-content: center;
		align-items: center;
		display: flex;
		// align-items: center;
		padding: 0;
		border-bottom: 1px solid #dfe6ec;
		overflow: hidden;
		&::before {
			display: block;
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: 120px;
			width: 1px;
			background-color: #dfe6ec;
		}
		&::after {
			display: block;
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: 386px;
			width: 1px;
			background-color: #dfe6ec;
		}
		&.li-merge {
			&::before,
			&::after {
				display: none;
			}
		}
		&.tit {
			height: 30px;
			background-color: #f8f9fd;
		}
		li {
			font-size: 12px;
			line-height: 16px;
			padding: 7px 10px;
			// float: left;
			display: block;
			box-sizing: border-box;
			min-height: 30px;
			text-align: center;
			&.label {
				width: 120px;
				text-align: right;
			}
			&.history-val {
				width: 266px;
				// border-left: 1px solid #dfe6ec;
			}
			&.new-val {
				width: 266px;
				// border-left: 1px solid #dfe6ec;
				color: #ff4949;
			}
			&.two-li {
				// text-align: left;
				width: 532px;
				border-left: 1px solid #dfe6ec;
				.el-button {
					padding: 0;
					margin-right: 20px;
					font-size: 12px;
				}
				.el-button + .el-button {
					margin-left: 0;
				}
			}
		}
	}
}
</style>
