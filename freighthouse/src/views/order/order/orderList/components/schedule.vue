<template>
  <div class="vessel-time-popover-cont">
    <div class="empty">船期查询结果：</div>
    <ul class="vessel-time-list">
      <template v-for="item in vesselTimeArr">
        <li class="label" :key="'label'+item.key">{{item.label}}</li>
        <li class="value" :key="'value'+item.key">
          <span class="val-time">
            {{vesselTime[item.key]}}<em @click="handleCopy(vesselTime[item.key], $event)" class="btn-copy" v-if="vesselTime[item.key]">复制</em>
          </span>
          <el-button type="default" size="mini" class="btn-insert" @click="handleSetIn(vesselTime[item.key], item.key)" :disabled="isDisabled(item.key)" v-if="vesselTime[item.key]">填入</el-button>
        </li>
      </template>
    </ul>
  </div>
</template>
<script>
import clip from '@/utils/clipboard'
import clipboard from '@/directive/clipboard/index.js'
export default {
  data() {
    return {
      vesselTimeArr: [
        {label: '预计出发时间', key: 'etdTime'},
        {label: '实际出发时间', key: 'tdTime'},
        {label: '预计到港时间', key: 'etaTime'},
        {label: '实际到港时间', key: 'taTime'}
      ]
    }
  },
  props: {
    vesselTime: {
      type: Object,
      default: () => ({})
    },
    etdTimeDisabled: {
      type: Boolean,
      default: true
    },
    tdTimeDisabled: {
      type: Boolean,
      default: true
    },
    etaTimeDisabled: {
      type: Boolean,
      default: true
    },
    taTimeDisabled: {
      type: Boolean,
      default: true
    }
  },
  activated() {
  },
  created() {
  },
  mounted() {
  },
  computed: {
  },
  components: {
  },
  watch: {
  },
  methods: {
    isDisabled(key) {
      return this[key+'Disabled']
    },
    handleCopy(val, e) {
      clip(val, e)
    },
    clipboardSuccess() {
      this.$message({
        message: '复制成功',
        type: 'success',
        duration: 1500
      })
    },
    handleSetIn(val, key) {
      this.$emit('updateVesselTime', val, key)
    }
  }
}
</script>
<style lang="scss" scoped>
.vessel-time-popover-cont{
	font-size: 12px;
	.vessel-time-list{
		display: block;
		border-left: 1px solid #dfe6ec;
		border-top: 1px solid #dfe6ec;
		overflow: hidden;
		width: 256px;
		box-sizing: border-box;
		li{
			border-right: 1px solid #dfe6ec;
			border-bottom: 1px solid #dfe6ec;
			line-height: 20px;
			height: 30px;
			padding: 5px;
			text-align: left;
			width: 170px;
			float: left;
			display: inline-block;
			box-sizing: border-box;
			&.label{
				width: 85px;
				text-align: right;
      }
      &.value{
        display: flex;
        justify-content: space-between;
        .val-time{
          display: block;
          .btn-copy{
            display: none;
            font-style: normal;
            color: #3E80F5;
            margin-left: 10px;
          }
          &:hover{
            .btn-copy{
              display: inline-block;
            }
          }
        }
      }
		}
	}
	.empty{
    text-align: left;
    margin-bottom: 5px;
	}
	span{
		display: inline-block;
	}
	em{
		display: inline-block;
		cursor: pointer;
		font-style: normal;
		color: #3E80F5;
		margin-left: 5px;
  }
  /deep/ .el-button--mini{
    height: 20px;
    padding: 0 8px;
  }
}
</style>