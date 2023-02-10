<template>
  <div class="toggle-div">
    <div class="toggle-title">
      <div class="title title-left">结算单位信息</div>
      <div class="title-right" @click="showData = !showData">
        <span>{{ showData ? '收起' : '展开' }}</span>
        <span :class="[showData?'el-icon-arrow-up':`el-icon-arrow-down`]"></span>
      </div>
    </div>
    <div class="toggle-body" v-show="showData">
      <DetailDiv label="结算单位：" :content="infoData.settleCorpName" :isTooltip="true" />
      <DetailDiv label="结算单位类型：" :content="settleCorpTypeStr" />
      <DetailDiv label="是否虚拟：" :content="dictMapObj['yesNo'][infoData.isTemporary]" />
      <DetailDiv
        label="是否有委托关系："
        :content="dictMapObj['yesNo'][$attrs.diyHasRefSettle ?  'yes' : (infoData.hasRefSettle||'no')]"
      />
      <DetailDiv label="是否转移：" :content="infoData.receivableRegTransfer?'是':'否'" />
      <DetailDiv
        v-if="infoData.receivableRegTransfer"
        label="转移结算单位："
        :content="infoData.receivableRegTransfer.settleCorpName"
      />
      <DetailDiv v-if="infoData.receivableRegTransfer" label="附件：" :isSlot="true">
        <el-tooltip
          v-if="infoData.receivableRegTransfer.fileName"
          :content="infoData.receivableRegTransfer.fileName"
          placement="top-start"
        >
          <el-tag
            class="detail__content"
            size="medium"
            @click="vmShowAttachment(infoData.receivableRegTransfer.fileNo)"
          >{{infoData.receivableRegTransfer.fileName}}</el-tag>
        </el-tooltip>
      </DetailDiv>
      <DetailDiv
        v-if="infoData.receivableRegTransfer"
        label="转移原因："
        :content="infoData.receivableRegTransfer.reason"
      />
      <template v-if="$attrs.isSlot">
        <slot></slot>
      </template>
      <template v-else>
        <FinTable
          v-if="showData&&settleOption.data&&settleOption.data.length"
          :option="settleOption"
        />
      </template>
    </div>
  </div>
</template>
<script>
import FinTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapState } from 'vuex'
export default {
  name: 'regDetailInfo',
  mixins: [mixin],
  components: {
    FinTable,
  },
  props: {
    infoData: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    ...mapState({ dictMapObj: (state) => state.dict.dictMapObj }),

    settleCorpTypeStr() {
      return (this.infoData.settleCorpType || '')
        .split(',')
        .map((it) => {
          let unitTypeObj = this.dictMap['unitType'].find((el) => el.value === it)
          return unitTypeObj && unitTypeObj['label']
        })
        .toString()
    },
    refSettleUnitList() {
      return this.infoData.refSettleUnitList || []
    },
  },
  watch: {
    refSettleUnitList(val) {
      console.log(val)
      this.$nextTick(() => (this.settleOption.data = val))
    },
  },
  data() {
    return {
      showData: true,
      settleOption: Object.assign({}, this.option, {
        operationBtns: false,
        selection: false,
        rootTipsHide: true,
        columns: [
          { prop: 'settleCorpName', label: '委托结算单位' },
          { prop: 'relationType', label: '关联类型', type: 'select', propInDict: 'settleUnitRelationType' },
          { prop: 'fileType', label: '附件类型', type: 'select', propInDict: 'settleUnitRelationFileType' },
          {
            prop: 'fileName',
            label: '附件',
            type: 'button',
            callback(item) {
              window.open(`/base/fileView/preview/${item.fileNo}/sowoll`)
            },
          },
          { prop: 'startTime', label: '有效期', type: 'timeRange', rangeStr: ['startTime', 'stopTime'] },
          {
            prop: 'writeoffReceipayNo',
            label: '核销编号',
            minWidth: 130,
            type: 'button',
            callback: (row) => {
              this.jumpToRoute(row)
            },
          },
        ],
      }),
    }
  },
  methods: {
    jumpToRoute(row) {
      let data = {
        name: 'WriteoffRecvDetail2',
        query: {
          source: 'writeoffRecvDetail',
          receivableRegId: row.receivableRegId,
          writeoffReceipayNo: row.writeoffReceipayNo,
        },
        params: { writeoffNo: row.writeoffReceipayNo },
      }
      this.$emit('jumpToRoute', data)
    },
  },
}
</script>
<style scoped lang="scss">
.toggle-div {
  margin: 8px;
  border: 1px solid #e9e9e9;
  border-radius: 4px;
  overflow: hidden;
  .toggle-title {
    padding: 0 8px;
    display: flex;
    justify-content: space-between;
    background: #f8f9fd;
    height: 30px;
    line-height: 30px;
    .title-left {
      font-weight: 600;
      color: #222222;
    }
    .title-right {
      cursor: pointer;
      & > span:nth-child(1) {
        padding-right: 4px;
      }
    }
  }
  .toggle-body {
    padding: 8px;
  }
}
</style>
