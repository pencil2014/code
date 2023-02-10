<template>
  <el-tooltip	placement="right" popper-class="copyInvoiceNo-pop" :visible-arrow="false">
    <div class="copy-label" @click="copy($event)" slot="content">复制</div>
    <span class="fin-row-table-header-container">
      <el-tooltip v-for="(tip, index) in tipArr" :key="index" placement="top">
        <div class="fin-column-tip" v-if="tip.value" slot="content">
          <div class="fin-column-tip-title">{{ tip.title }}</div>
          <div class="fin-desc-content">{{ tip.desc }}</div>
        </div>
        <i :class="tip.icon">{{ tip.value }}</i>
      </el-tooltip>
      <span size="mini" @click.stop="toDetail" style="color:rgb(24, 144, 255);" class="underline">{{ param.invoiceNo}}</span>
    </span>
  </el-tooltip>
</template>

<script>
import clip from '@/utils/clipboard'
export default {
  data() {
    return {
      copyShow: false,
      tipArr: [],
      strObj: {
        title: '',
        value: '',
        icon: '',
        desc: ''
      },
      jointObj: {
        title: '',
        value: '',
        icon: '',
        desc: ''
      },
      dropObj: {
        title: '',
        value: '',
        icon: '',
        desc: ''
      },
      noticeDropObj: {
        title: '',
        value: '',
        icon: '',
        desc: ''
      }
    }
  },
  props: ['param', 'item'],
  created() {
    this.renderTip(this.param)
  },

  mounted() {},
  computed: {},
  watch: {
    param(val) {
      this.renderTip(val)
    }
  },
  components: {},
  methods: {
    copy(e) {
      clip(this.param.invoiceNo, e)
    },
    overFn() {
      this.copyShow = true
    },
    leaveFn() {
      this.copyShow = false
    },
    toDetail() {
      this.item.method(this.param)
    },
    renderTip(val) {
      this.strObj = {
        title: '',
        value: '',
        icon: '',
        desc: ''
      }
      this.jointObj = {
        title: '',
        value: '',
        icon: '',
        desc: ''
      }
      this.dropObj = {
        title: '',
        value: '',
        icon: '',
        desc: ''
      }
      this.noticeDropObj = {
        title: '',
        value: '',
        icon: '',
        desc: ''
      }
      if (val.delayInvoice === 'yes') {
        this.jointObj.title = '后补票'
        this.jointObj.value = '补'
        this.jointObj.icon = 'icon-tip icon-joint2'
        this.jointObj.desc =
          '晚于付款单审核通过时间的登记的发票都归为后补票。'
      }
      this.tipArr = [
        this.strObj,
        this.jointObj,
        this.dropObj,
        this.noticeDropObj
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.fin-column-tip {
  width: 270px;
  .fin-column-tip-title {
    font-weight: 700;
  }
}
.fin-row-table-header-container {
  white-space: nowrap;
  display: flex;
  justify-content: flex-end;
  position: relative;
  // padding-right: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fin-column-tip-title {
  margin-bottom: 10px;
}
.tag-read {
  position: absolute;
  top: -0;
  right: 0;
}
.el-tag--mini {
  font-size: 10px;
  height: 16px;
  padding: 0 4px;
  line-height: 16px;
  cursor: pointer;
}
</style>
<style lang="scss">
  .copyInvoiceNo-pop.is-dark{
    font-size: 12px;
    text-align: center;
    cursor: pointer;
    background: #ecf5ff;
    color: #409eff;
    border: 1px solid #d9ecff;
    padding: 2px 5px;
    margin-left: 5px;
    // .copy-label{
    //   line-height: 6px;
    // }
  }
</style>
