<template>
<div class="finance-list-amt-summary" :style="{'padding-bottom':isPlaceBottom&&place==='bottom'?'2px':0,height:listAmtSummary.isPartTop && place === 'top'?'51px':'auto'}">
  <template v-if="listAmtSummary.groups && place === 'bottom'">
    <div class="money-box list-amt-summary-default">
      <div class="money-box-left">
        <div class="money-title">金额合计</div>
      </div>
      <div class="money-box-right">
        <el-button type="text" class="collapse-btn" @click="handleCollapse('ListAmtSummary')" size="mini">
          {{showListAmtSummary ? '收起' : '展开'}}<i :class="{'el-icon-arrow-up': showListAmtSummary, 'el-icon-arrow-down': !showListAmtSummary}"></i>
        </el-button>
      </div>
    </div>
    <div v-show="showListAmtSummary" class="finance-list-amt-summary-separator"></div>
    <div v-show="showListAmtSummary"
      v-for="(group, index) in listAmtSummary.groups"
      :key="'group' + index">
      <div v-if="group.label" class="list-amt-summary-group-title">{{group.label}}</div>
      <ul class="list-amt-summary">
        <li class="list-amt-summary-item" v-for="(value, key) in group.data" :key="'listAmtSummary' + key"
          @mouseenter="listAmtSummaryShowMore($event, value, key)"
          @mouseleave="listAmtSummaryShowMore($event, value, key, 'hide')"
        >
          <div class="list-amt-summary-title">
            {{listAmtSummary.labelObj && listAmtSummary.labelObj[key + 'Label']}}：
          </div>
          <ul class="list-amt-summary-content">
            <li class="list-amt-summary-content-item" v-for="(item, index) in value.filter((item, index) => index < 2)" :key="key + index">
              <span>{{item.currency}}</span>
              <span :style="{color: listAmtSummary.colorObj && listAmtSummary.colorRgbObj[listAmtSummary.colorObj[key + 'Color']]}">
                {{item.amt}}
              </span>
            </li>
            <!-- <li v-if="value && !value.length" class="list-amt-summary-content-item">无</li> -->
          </ul>
        </li>
      </ul>
    </div>
  </template>
  <div v-if="listAmtSummary.groups && listAmtSummary.isPartTop && place === 'top'">
    <ul class="list-amt-summary" style="padding:5px 0 0;background:#FFF;border-top:1px solid #E8E9ED;">
      <li class="list-amt-summary-item" v-for="(value, key) in listAmtSummary.subData1" :key="'listAmtSummary' + key" style="margin-left:0;"
        @mouseenter="listAmtSummaryShowMore($event, value, key)"
        @mouseleave="listAmtSummaryShowMore($event, value, key, 'hide')"
      >
        <div class="list-amt-summary-title" style="width:auto;">
          {{listAmtSummary.labelObj && listAmtSummary.labelObj[key + 'Label']}}合计：
        </div>
        <ul class="list-amt-summary-content">
          <li class="list-amt-summary-content-item" v-for="(item, index) in value.filter((item, index) => index < 2)" :key="key + index">
            <span>{{item.currency}}</span>
            <span :style="{color: listAmtSummary.colorObj && listAmtSummary.colorRgbObj[listAmtSummary.colorObj[key + 'Color']]}">
              {{item.amt}}
            </span>
          </li>
          <!-- <li v-if="value && !value.length" class="list-amt-summary-content-item">无</li> -->
        </ul>
      </li>
    </ul>
    <ul class="list-amt-summary" style="padding:0 0 5px;background:#FFF;">
      <li class="list-amt-summary-item" v-for="(value, key) in listAmtSummary.subData2" :key="'listAmtSummary' + key" style="margin-left:0;"
        @mouseenter="listAmtSummaryShowMore($event, value, key)"
        @mouseleave="listAmtSummaryShowMore($event, value, key, 'hide')"
      >
        <div class="list-amt-summary-title" style="width:auto;">
          {{listAmtSummary.labelObj && listAmtSummary.labelObj[key + 'Label']}}合计：
        </div>
        <ul class="list-amt-summary-content">
          <li class="list-amt-summary-content-item" v-for="(item, index) in value.filter((item, index) => index < 2)" :key="key + index">
            <span>{{item.currency}}</span>
            <span :style="{color: listAmtSummary.colorObj && listAmtSummary.colorRgbObj[listAmtSummary.colorObj[key + 'Color']]}">
              {{item.amt}}
            </span>
          </li>
          <!-- <li v-if="value && !value.length" class="list-amt-summary-content-item">无</li> -->
        </ul>
      </li>
    </ul>
  </div>
  <div v-if="!listAmtSummary.groups">
    <ul class="list-amt-summary" style="padding:5px 0;background:#FFF;border-top:1px solid #E8E9ED;min-height:31px;"> 
      <li class="list-amt-summary-item" v-for="(value, key) in listAmtSummary.data" :key="'listAmtSummary' + key" style="margin-left:0;"
        @mouseenter="listAmtSummaryShowMore($event, value, key)"
        @mouseleave="listAmtSummaryShowMore($event, value, key, 'hide')"
      >
        <div class="list-amt-summary-title" style="width:auto;">
          {{listAmtSummary.labelObj && listAmtSummary.labelObj[key + 'Label']}}合计：
        </div>
        <ul class="list-amt-summary-content">
          <li class="list-amt-summary-content-item" v-for="(item, index) in value.filter((item, index) => index < 2)" :key="key + index">
            <span>{{item.currency}}</span>
            <span :style="{color: listAmtSummary.colorObj && listAmtSummary.colorRgbObj[listAmtSummary.colorObj[key + 'Color']]}">
              {{item.amt}}
            </span>
          </li>
          <!-- <li v-if="value && !value.length" class="list-amt-summary-content-item">无</li> -->
        </ul>
      </li>
    </ul>
  </div>
  <component :is="currentComponent" :component-props="componentProps">
    <template #listAmtSummary="{componentProps}">
      <div class="finance-list-amt-summary">
        <ul class="list-amt-summary-content" style="margin-left:0px;margin-top:3px;">
          <li class="list-amt-summary-content-item" v-for="(item, index) in componentProps.listAmtSummaryOneValue" :key="'listAmtSummaryOneValue' + index">
            <span>{{item.currency}}</span>
            <span :style="{color: listAmtSummary.colorObj && listAmtSummary.colorRgbObj[listAmtSummary.colorObj[componentProps.listAmtSummaryOneKey + 'Color']]}">
              {{item.amt}}
            </span>
          </li>
          <!-- <li v-if="value && !value.length" class="list-amt-summary-content-item">无</li> -->
        </ul>
      </div>
    </template>
  </component>
</div>
</template>
<script>
export default {
  props: {
    listAmtSummary: {
      type: Object,
      default: () => ({})
    },
    place: {
      type: String,
      default: 'top'
    }
  },
  data () {
    return {
      showListAmtSummary: this.listAmtSummary.showListAmtSummary ? true : false,
      currentComponent: '',
      componentProps: {},
    }
  },
  computed: {
    isPlaceBottom() {
      return this.listAmtSummary.isPlaceBottom
    },
    isPartTop() {
      return this.listAmtSummary.isPartTop && this.place === 'top'
    }
  },
  created() {
    // console.log(this.listAmtSummary)
  },
  methods: {
    handleCollapse(val) {
      this['show' + val] = !this['show' + val]
      this.$emit('handle-collapse', val) // 使getListAmtSummary获取数据; 现默认即获取数据, 此功能无作用
    },
    listAmtSummaryShowMore(event, value, key, type) {
      if (!value.length) return
      this.currentComponent = 'ColumnTip',
      this.componentProps = {
        show: type === 'hide' ? false : true,
        event,
        width: 240,
        background: '#FFF',
        boxShadow: '0px 4px 10px 0px #E9E9E9',
        border: '1px solid #ebeef5',
        slot: 'listAmtSummary',
        listAmtSummaryOneValue: value,
        listAmtSummaryOneKey: key,
        placement: this.isPlaceBottom && !this.isPartTop ? '' : 'bottom',
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.finance-list-amt-summary {
  padding-bottom: 2px;
}
.finance-list-amt-summary .list-amt-summary-default {
  height: 30px;
  background: #F8F9FD;
  padding: 5px 8px;
}
.finance-list-amt-summary .finance-list-amt-summary-separator {
  // margin: 0 8px;
  height: 10px;
  border-top: 1px solid #E8E9ED;
  background: #F8F9FD;
}
.finance-list-amt-summary .list-amt-summary-group-title {
  // margin: 0 8px;
  font-weight: bold;
  padding: 3px 8px;
  line-height: 14px;
  color: #222222;
  background: #F8F9FD;
}
.finance-list-amt-summary .list-amt-summary {
  // margin: 0 8px;
  padding: 0 8px 4px 8px;
  background: #F8F9FD;
  display: flex;
  flex-wrap: wrap;
  min-height: 24px;
}
.finance-list-amt-summary .list-amt-summary-item {
  margin-left: 28px;
}
.finance-list-amt-summary .list-amt-summary-title {
  float: left;
  width: 84px;
  text-align: right;
  line-height: 20px;
  height: 20px;
}
.finance-list-amt-summary .list-amt-summary-content {
  display: flex;
  flex-wrap: wrap;
  margin-left: 84px;
  width: calc(120px * 2);
}
.finance-list-amt-summary .list-amt-summary-content-item {
  width: 120px;
  line-height: 20px;
}
</style>
