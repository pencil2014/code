<template>
  <div class="change-info">
    <ul class="row tit">
      <li class="label"></li>
      <li class="history-val">历史数据</li>
      <li class="new-val">最新数据</li>
    </ul>
    <ul class="row li-merge">
      <li class="label">修改类型</li>
      <li class="two-li">{{changeTypeObj[newData.changeType]}}</li>
    </ul>
    <ul class="row li-merge">
      <li class="label">是否已做柜</li>
      <li class="two-li">{{newData.changeHasCn === 'Y' ? '是' : '否'}}</li>
    </ul>
    <ul class="row li-merge">
      <li class="label">柜号</li>
      <li class="two-li">{{newData.changeCnNoList.toString()}}</li>
    </ul>
    <ul class="row li-merge">
      <li class="label">保函附件</li>
      <li class="two-li">
        <el-button type="text" @click="handleView(index)" v-for="(item, index) in newData.changeFileNameList" :key="'file'+index">{{item}}</el-button>
      </li>
    </ul>
    <ul class="row" v-for="(item, index) in changeData" :key="'change'+index">
      <li class="label">{{item.label}}</li>
      <li class="history-val">{{item.historyVal}}</li>
      <li class="new-val">{{item.newVal}}</li>
    </ul>
    <ul class="row li-merge">
      <li class="label">修改原因</li>
      <li class="two-li">{{newData.changeRemark}}</li>
    </ul>
  </div> 
</template>

<script>
import {mapState} from 'vuex'

export default {
  data() {
    return {
      changeData: [],
      changeTypeObj: {
        'SHIP': '改船',
        'PORT': '改港',
        'SHIP_PORT': '改船+改港'
      }
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
  created() {
    this.getChangeInfo()
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),
  },
  watch: {
  },
  components: {
     
  },
  methods: {
    getChangeInfo() {
      let { barge, ship } = this.hisData
      let newBarge = this.newData.barge
      let newShip = this.newData.ship
      this.changeData = []
      // newData.changeType && this.changeData.push({label: '修改类型', historyVal: newData.changeType, newVal: newData.changeType})
      // newData.changeHasCn && this.changeData.push({label: '是否已做柜', historyVal: newData.newData.changeHasCn == 'y' ? '是' : '否', newVal: newData.changeHasCn == 'y' ? '是' : '否'})
      // newData.changeCnNoList && this.changeData.push({label: '柜号', historyVal: newData.changeCnNoList.toString(), newVal: newData.changeCnNoList.toString()})
      // 包含驳船段
      if (barge) {
        barge.porPortCode !== newBarge.porPortCode &&
          this.changeData.push({
            label: '驳船收货地',
            historyVal: barge.porPortCode,
            newVal: newBarge.porPortCode,
          })
        barge.cyCutOff !== newBarge.cyCutOff &&
          this.changeData.push({
            label: '驳船截关时间',
            historyVal: barge.cyCutOff,
            newVal: newBarge.cyCutOff,
          })
        barge.etdTime !== newBarge.etdTime &&
          this.changeData.push({
            label: '驳船预计开船时间',
            historyVal: barge.etdTime,
            newVal: newBarge.etdTime,
          })
        barge.vessel !== newBarge.vessel &&
          this.changeData.push({
            label: '驳船船名',
            historyVal: barge.vessel,
            newVal: newBarge.vessel,
          })
        barge.voyage !== newBarge.voyage &&
          this.changeData.push({
            label: '驳船航次',
            historyVal: barge.voyage,
            newVal: newBarge.voyage,
          })
      }
      ship.etdTime !== newShip.etdTime &&
        this.changeData.push({
          label: '大船预计开船时间',
          historyVal: ship.etdTime,
          newVal: newShip.etdTime,
        })
      ship.vessel !== newShip.vessel &&
        this.changeData.push({
          label: '大船船名',
          historyVal: ship.vessel,
          newVal: newShip.vessel,
        })
      ship.voyage !== newShip.voyage &&
        this.changeData.push({
          label: '大船航次',
          historyVal: ship.voyage,
          newVal: newShip.voyage,
        })
      ship.cyCutOff !== newShip.cyCutOff &&
        this.changeData.push({
          label: '大船截关时间',
          historyVal: ship.cyCutOff,
          newVal: newShip.cyCutOff,
        })
      ship.shipCarrierCode !== newShip.shipCarrierCode &&
        this.changeData.push({
          label: '船公司',
          historyVal: ship.shipCarrierCode,
          newVal: newShip.shipCarrierCode,
        })
      ship.polPortCode !== newShip.polPortCode &&
        this.changeData.push({
          label: '大船起运港',
          historyVal: ship.polPortCode ? `${ship.polPortCode}(${ship.polPortName})` : '',
          newVal: `${newShip.polPortCode}(${newShip.polPortName})`,
        })
      ship.transitPortCode !== newShip.transitPortCode &&
        this.changeData.push({
          label: '中转港1',
          historyVal: ship.transitPortCode ? `${ship.transitPortCode}(${ship.transitPortName})` : '',
          newVal: `${newShip.transitPortCode}(${newShip.transitPortName})`,
        })
      ship.transitPortCode1 !== newShip.transitPortCode1 &&
        this.changeData.push({
          label: '中转港2',
          historyVal: ship.transitPortCode1 ? `${ship.transitPortCode1}(${ship.transitPortName1})` : '',
          newVal: `${newShip.transitPortCode1}(${newShip.transitPortName1})`,
        })
      ship.transitPortCode2 !== newShip.transitPortCode2 &&
        this.changeData.push({
          label: '中转港3',
          historyVal: ship.transitPortCode2 ? `${ship.transitPortCode2}(${ship.transitPortName2})` : '',
          newVal: `${newShip.transitPortCode2}(${newShip.transitPortName2})`,
        })
      ship.unloadingPortCode !== newShip.unloadingPortCode &&
        this.changeData.push({
          label: '卸货港',
          historyVal: `${ship.unloadingPortCode}(${ship.unloadingPortName})`,
          newVal: `${newShip.unloadingPortCode}(${newShip.unloadingPortName})`,
        })
      ship.podPortCode !== newShip.podPortCode &&
        this.changeData.push({
          label: '目的地',
          historyVal: `${ship.podPortCode}(${ship.podPortName})`,
          newVal: `${newShip.podPortCode}(${newShip.podPortName})`,
        })
      // newData.changeRemark && this.changeData.push({label: '修改原因', historyVal: newData.changeRemark, newVal: newData.changeRemark})
      console.log('this.changeData', this.changeData)
    },
    // 保函附件预览
    handleView(index) {
      let fileNo = this.newData.changeFileNoList[index]
      let fileName = this.newData.changeFileNameList[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
  },
};
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
      left: 120px;
      width: 1px;
      background-color: #dfe6ec;
    }
    &::after{
      display: block;
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 386px;
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
        width: 120px;
        text-align: right;
      }
      &.history-val{
        width: 266px;
        // border-left: 1px solid #dfe6ec;
      }
      &.new-val{
        width: 266px;
        // border-left: 1px solid #dfe6ec;
        color: #ff4949;
      }
      &.two-li{
        text-align: left;
        width: 532px;
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
