<template>
	<div class="custBl-edit-cont">
		<span class="icon-edit">改</span>
		<span class="text">提单信息已被修改</span>
		<el-popover placement="top" width="720" trigger="click" class="changeShip" v-model="changeShipVisible">
			<div class="change-info">
				<ul class="row tit">
					<li class="label">标题名称</li>
					<li class="history-val">历史数据</li>
					<li class="new-val">最新数据</li>
				</ul>
				<ul class="row" v-for="(item, index) in changeData" :key="'change'+index">
					<li class="label">{{item.label}}</li>
					<li class="history-val">{{item.historyVal}}</li>
					<li class="new-val">{{item.newVal}}</li>
				</ul>
				<ul class="row li-merge">
					<li class="label">补料附件</li>
					<li class="two-li">
						<el-button type="text" @click="handleView(item)" v-for="(item, index) in siFileName" :key="'file'+index">{{item.fileName}}</el-button>
					</li>
				</ul>
			</div> 
			<div class="operate-group-popover">
				<el-button type="default" size="mini" class="btn-close-popover" @click="changeShipVisible = false">
					关闭
				</el-button>
			</div>
			<span slot="reference" class="btn-info">查看详情</span>
		</el-popover>
	</div>
</template>
<script>
import { getDictLabel } from '@/utils/tools'
export default {
	data() {
		return {
			changeShipVisible: false,
			changeData: [],
			fieldGroups: {
				blMode: '出单方式',
				payMode: '付款方式',
				shipper: 'Shipper(发货人)',
				consignee: 'Consignee(收货人)',
				notify1: 'Notify Party1(通知人1)',
				notify2: 'Also Notify Party(通知人2)',
				cargoMark: '唛头',
				cargoDesc: '货物描述',
				remarkPrint: '提单备注',
				bargePorPortName: '收货地',
				polPortName: '大船起运港',
				transitPortName: '中转港',
				unloadingPortName: '卸货港',
				podPortName: '目的地',
				deliveryPlace: '最终目的地',
				// siFlieNo: '补料附件',
				blCargos: '集装箱信息'
			},
			siFileName: []
		}
	},
	props: {
		custBlEditInfo: {
			type: Object,
			default: () => ({})
		},
	},
	created() {
		this.getChangeInfo()

	},
	mounted() {},
	computed: {
	},
	components: {
	},
	watch: {},
	methods: {
		getChangeInfo() {
      let { orgValue, idxValue, siFileName, siFileNo } = this.custBlEditInfo
      let hisData = orgValue ? JSON.parse(orgValue) : {}
			let newData = idxValue ? JSON.parse(idxValue) : {}
			let siFileNameArr = siFileName.split(',')
			let siFileNorr = siFileNo.split(',')
			this.siFileName = []
			siFileNameArr.forEach((item, index) => {
				this.siFileName.push({
					fileName: item,
					fileNo: siFileNorr[index]
				})
			})
			this.changeData = []
			for (let i in this.fieldGroups) {
				if (i === 'blMode' || i === 'payMode') {
					hisData[i] = getDictLabel(i, hisData[i])
					newData[i] = getDictLabel(i, newData[i])
				}
				this.changeData.push({
          label: this.fieldGroups[i],
          historyVal: hisData[i],
          newVal: newData[i]
        })
			}
		},
		// 补料附件预览
    handleView(row) {
			let { fileNo, fileName } = row
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
	}
}
</script>
<style lang="scss" scoped>
.change-info{
  overflow: hidden;
  border-top: 1px solid #dfe6ec;
  border-left: 1px solid #dfe6ec;
  border-right: 1px solid #dfe6ec;
  box-sizing: border-box;
  .row{
    position: relative;
    align-content: center;
    align-items: center;
    display: flex;
    // align-items: center;
    padding: 0;
    border-bottom: 1px solid #dfe6ec;
    overflow: hidden;
    &::before{
      display: block;
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 170px;
      width: 1px;
      background-color: #dfe6ec;
    }
    &::after{
      display: block;
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 431px;
      width: 1px;
      background-color: #dfe6ec;
    }
    &.li-merge{
      &::before, &::after{
        display: none;
      }
    }
    &.tit{
      height: 30px;
      background-color: #f8f9fd;
    }
    li{
      font-size: 12px;
      line-height: 16px;
      padding: 7px 10px;
      // float: left;
      display: block;
      box-sizing: border-box;
      min-height: 30px;
      text-align: center;
      &.label{
        width: 170px;
        text-align: right;
      }
      &.history-val{
        width: 261px;
        // border-left: 1px solid #dfe6ec;
      }
      &.new-val{
        width: 261px;
        // border-left: 1px solid #dfe6ec;
        color: #ff4949;
      }
      &.two-li{
        text-align: left;
        width: 522px;
        border-left: 1px solid #dfe6ec;
        .el-button{
          padding: 0;
          margin-right: 20px;
          font-size: 12px;
        }
        .el-button + .el-button{
          margin-left: 0;
        }
      }
    }
  }
}
</style>
