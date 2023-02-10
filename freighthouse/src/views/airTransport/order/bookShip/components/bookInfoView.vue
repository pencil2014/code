<template>
  <div class="bookInfoView" :class="{'bookInfo-good-bgcolor':infoConfig.showBgcolor}">
    <div class="title" v-show="infoConfig.showTitle"> {{infoConfig.title}} </div>
    <!-- 订舱基本信息  -->
    <div v-if="infoConfig.type=='base'">
      <ul class="infoList" v-resize @resize="onResize">
        <div v-for="(item, index) in infoConfig.info" :key="index">
          <li :key="'other' + index" v-if="['intrustRemark','transportTerm','poFileName'].includes(item.key)" :style="{width: ['intrustRemark','transportTerm','poFileName'].includes(item.key) ? '100%' : ''}">
            <EllipsisText v-if="['intrustRemark','transportTerm'].includes(item.key)" :placement="'top'" :outerShellWidth="goodsOuterShellWidth*5" :contentText="item.name+'：'+item.value"></EllipsisText>
            <div v-else class="bookInfo-file-name">
              <span class="file-label">{{item.name}}：</span>
              <el-popconfirm title="文件操作" :hideIcon="true" confirmButtonType='text' confirmButtonText='下载' cancelButtonText='预览' @onConfirm="handleDownload(item.fileId,item.value)" @onCancel="handleView(item.fileId,item.value)">
                <div slot="reference" title="点击可预览或者下载文件" v-show="item.value">
                  <span class="file-value" :style="{maxWidth:(goodsOuterShellWidth*5-48)+'px'}">{{item.value}}</span>
                </div>
              </el-popconfirm>
            </div>
          </li>
          <li v-else>
            <EllipsisText :placement="'top'" :outerShellWidth="goodsOuterShellWidth" :contentText="item.name+'：'+item.value"></EllipsisText>
          </li>
        </div>
      </ul>
    </div>
    <!-- 箱型箱量信息  -->
    <div v-if="infoConfig.type=='container'">
      <ul class="infoList">
        <li>合计箱型：{{infoConfig.container}}</li>
        <li>总重量：{{infoConfig.weight}}</li>
        <li>总体积：{{infoConfig.volume}}</li>
        <li>是否分开放舱：{{infoConfig.isSplit=='n'?'是':'否'}}</li>
      </ul>
      <div v-for="(containerItem, index) in infoConfig.soContainerList" :key="index">
        <span class="small-tit">单SO{{index+1}}（{{containerItem.isSplit=='n'?'不分开放舱':'分开放舱'}}）</span>
        <div v-for="(item, i) in containerItem.containerList" :key="i">
          <ul class="infoList">
            <li>{{i+1+'.'}} 箱型：{{item.containerType}}</li>
            <li>箱量：{{item.containerNum}}</li>
            <li>是否重柜：{{item.isHeavy=='y'?'是':'否' }}</li>
            <li>单柜货重：{{item.weight}}</li>
            <li>单柜体积：{{item.volume}}</li>
            <li v-if="item.specialLength || item.specialWidth || item.specialHeight">
              特种：长{{item.specialLength || "0"}}M、宽{{item.specialWidth || "0"}}M、高{{item.specialHeight || "0"}}M
            </li>
            <li v-if="item.sizeBefore || item.sizeAfter || item.sizeLeft || item.sizeRight">
              超限：前{{item.sizeBefore || "0"}}M、后{{item.sizeAfter || "0"}}M、左{{item.sizeLeft || "0"}}M、右{{item.sizeRight || "0"}}M
            </li>
            <li v-if="item.temperatureSet">设置温度：{{item.temperatureSet}}</li>
            <li v-if="item.temperatureMin">最低温度：{{item.temperatureMin}}</li>
            <li v-if="item.temperatureMax">最高温度：{{item.temperatureMax}}</li>
            <li v-if="item.airMete">通风量：{{item.airMete}}</li>
            <li v-if="item.humidity">湿度要求：{{item.humidity}}</li>
          </ul>
        </div>
      </div>
    </div>
    <!-- 货物信息  -->
    <div v-if="infoConfig.type=='goods'">
      <div class="goods-summary">
        <div class="summary-info">
          <div>预计合计：</div>
        </div>
        <div class="summary-info">
          <div>件数：</div>
          <div>{{infoConfig.summaryData.totalQuantity}}件</div>
        </div>
        <div class="summary-info">
          <div>毛重：</div>
          <div>{{infoConfig.summaryData.totalWeight}}KGS</div>
        </div>
        <div class="summary-info">
          <div>体积：</div>
          <div>{{infoConfig.summaryData.totalVolume}}CBM</div>
        </div>
        <div class="summary-info">
          <div>计费重量：</div>
          <div>{{infoConfig.summaryData.chargeWeight}}KGS</div>
        </div>
        <div class="summary-info">
          <div>比重：</div>
          <div>{{infoConfig.summaryData.ratioWeight}}</div>
        </div>
      </div>
      <div class="goods-infos" v-resize @resize="onResize">
        <div class="info-item" v-for="(el,index) in infoConfig.info" :key="index">
          <div class="good-title">
            <span>货物{{index+1}}:</span>
          </div>
          <div class="info">
            <div class="line">
              <div class="text">
                <EllipsisText :placement="'top'" :outerShellWidth="goodsOuterShellWidth" :contentText="'中文品名：'+el.cname"></EllipsisText>
              </div>
              <div class="text">
                <span>件数：{{el.quantity}}</span>
              </div>
              <div class="text">
                <span>长(M)：{{el.length}}</span>
              </div>
            </div>
            <div class="line">
              <div class="text">
                <EllipsisText :placement="'top'" :outerShellWidth="goodsOuterShellWidth" :contentText="'英文品名：'+el.ename"></EllipsisText>
              </div>
              <div class="text">
                <span>毛重(KGS)：{{el.weight}}</span>
              </div>
              <div class="text">
                <span>宽(M)：{{el.width}}</span>
              </div>
            </div>
            <div class="line">
              <div class="text">
                <EllipsisText :placement="'top'" :outerShellWidth="goodsOuterShellWidth" :contentText="'货物性质：'+getDictLabel('cargoProperty', el.property)"></EllipsisText>
              </div>
              <div class="text">
                <span>体积(CBM)：{{el.volume}}</span>
              </div>
              <div class="text">
                <span>高(M)：{{el.height}}</span>
              </div>
            </div>
            <div class="line">
              <div class="text">
                <EllipsisText :placement="'top'" :outerShellWidth="goodsOuterShellWidth" :contentText="'货品分类：'+(getCargoTypeName(el.commodityTypeCode)||'')"></EllipsisText>
              </div>
              <div class="text">
                <EllipsisText :placement="'top'" :outerShellWidth="goodsOuterShellWidth" :contentText="'包装：'+el.packageInfo"></EllipsisText>
              </div>
              <div class="text">
                <EllipsisText :placement="'top'" :outerShellWidth="goodsOuterShellWidth" :contentText="'唛头：'+el.mark"></EllipsisText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="infoConfig.type=='transport'">
      <div class="goods-infos" v-resize @resize="onResize">
        <!-- {{infoConfig.info}} -->
        <div class="info-item" v-for="(el,index) in infoConfig.info" :key="index">
          <div class="info" style="width:100%">
            <div class="line">
              <div>
                <span v-if="index===0">国内运输：</span>
                <span v-else>国际{{index}}程：</span>
              </div>
              <div>{{el.polPortCode}}
                <EllipsisText :placement="'top'" :outerShellWidth="goodsOuterShellWidth" :contentText="'起运港：'+ el.polPortName"></EllipsisText>
              </div>
            </div>
            <div class="line">
              <div>
                <!-- getAircarrier(el.carrierSupplierId) -->
                <EllipsisText :placement="'top'" :outerShellWidth="goodsOuterShellWidth" :contentText="'承运人：'+el.carrierSupplierName"></EllipsisText>
              </div>
              <div>
                <EllipsisText :placement="'top'" :outerShellWidth="goodsOuterShellWidth" :contentText="'目的地：'+el.unloadingPortName"></EllipsisText>
              </div>
            </div>
            <div class="line">
              <div>
                <span>预计起飞日：{{el.etdTime}}</span>
              </div>
            </div>
            <div class="line">
              <div>
                <span>预计到达日：{{el.etaTime}}</span>
              </div>
            </div>
            <div class="line">
              <div>
                <EllipsisText :placement="'top'" :outerShellWidth="goodsOuterShellWidth" :contentText="'预计航次号：'+el.eflightNumber"></EllipsisText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDictLabel } from '@/utils/tools'
import { cargoTypeList } from '@/api/base'
export default {
  filters: {
    cargoProperty(property) {
      return getDictLabel('cargoProperty', property)
    }
  },
  data() {
    return {
      commodityTypeCodeOptions: [],
      getDictLabel: getDictLabel,
      airLineArr: [], // 航空公司
      airPortArr: [], // 港口
      goodsOuterShellWidth: 0
    }
  },
  props: {
    infoConfig: {
      type: Object,
      default: () => ({
        summaryData: {}
      })
    }
  },
  computed: {},
  created() {
    this.queryCargoTypeList()
  },
  mounted() {},
  components: {},
  methods: {
    handleView(fileNo, fileNme) {
      this.$store.dispatch('order/previewFile', {
        fileNo: fileNo,
        fileName: fileNme
      })
    },
    handleDownload(fileNo, fileNme) {
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: fileNo
          }
        })
        .then((res) => {
          console.log(res)
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = fileNme
          link.click()
        })
    },
    onResize(e) {
      // 货物div宽度发生变化
      this.goodsOuterShellWidth = e.detail.width / 5 - 10
    },
    queryCargoTypeList() {
      cargoTypeList().then((response) => {
        this.commodityTypeCodeOptions = response.data.map((item) => {
          return Object.assign(item, {
            label: item.chapterName,
            value: item.chapterCode
          })
        })
      })
    },
    getCargoTypeName(el) {
      // 货物类型
      for (let i = 0; i < this.commodityTypeCodeOptions.length; i++) {
        if (el === this.commodityTypeCodeOptions[i].chapterCode) {
          return this.commodityTypeCodeOptions[i].chapterName
        }
      }
    }
  }
}
</script>

<style lang="scss">
.bookInfoView {
  margin: 10px 0;
  padding: 4px 0;
  .title {
    font-weight: 600;
    margin-bottom: 4px;
  }
  ul.infoList {
    list-style: none;
    padding: 0;
    margin-top: 5px;
    zoom: 1;
    font-size: 12px;
    li {
      width: 20%;
      min-height: 20px;
      float: left;
      margin-bottom: 5px;
      padding-right: 10px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      line-height: 16px;
    }
  }
  ul.infoList::after {
    display: block;
    clear: both;
    content: '';
    visibility: hidden;
    height: 0;
  }
  .small-tit {
    font-size: 12px;
    font-weight: 600;
  }
  .goods-summary {
    display: flex;
    .summary-info {
      display: flex;
      margin-right: 20px;
      font-size: 12px;
      font-weight: 400;
      color: #222222;
      line-height: 16px;
    }
  }
  .goods-infos {
    font-size: 12px;
    font-weight: 400;
    color: #4a4a4a;
    line-height: 20px;
    .info-item {
      overflow: hidden;
      margin-top: 10px;
      .good-title {
        width: 20%;
        float: left;
        position: relative;
        padding-left: 10px;
      }
      .good-title::before {
        content: '';
        position: absolute;
        left: 3px;
        top: 7px;
        width: 4px;
        height: 4px;
        background: #3e80f5;
        border-radius: 2px;
      }
      .info {
        width: 80%;
        float: left;
        display: flex;
        .line {
          width: 25%;
          padding-right: 10px;
          .text {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}
.bookInfo-good-bgcolor {
  background: #f8f9fd;
}
.bookInfo-file-name {
  display: flex;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #1890ff;
  .file-value {
    cursor: pointer;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .file-label {
    color: #000;
  }
}
</style>
