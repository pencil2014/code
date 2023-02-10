<template>
  <div class="so-container">
    <div class="so-row-cont">
      <div class="row-cont-tit">
        <span class="tit">原箱型箱量</span>
        <div class="so-total">
          <span class="so-total-flex">
            <el-tooltip effect="dark" :content="containerTotal.container" placement="top-start" v-if="containerTotal.container">
              <span class="cyTotal">合计：{{ containerTotal.container }}</span>
            </el-tooltip>
            <span v-else class="cyTotal">合计：{{ containerTotal.container }}</span>
            <span class="quantityTotal">件数合计：{{ containerTotal.quantity }}</span>
            <span class="weightTotal">重量合计：{{ containerTotal.weight }}KGS</span>
            <span class="volumeTotal">体积合计：{{ containerTotal.volume }}CBM</span>
          </span>
        </div>
        <div class="row-cont-rt">
          <span class="expand" @click="handleToogleExpand"> {{ !containerListShowState ? '收起' : '展开' }}<i :class="!containerListShowState ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
        </div>
      </div>
      <div class="org-cont" v-if="!containerListShowState">
        <div class="containerList-show" v-for="(o, index) in origSoContainerList" :key="index">
          <div class="row-flex flex-so" v-for="(item, sIndex) in o.containerList" :key="sIndex" :model="origSoContainerList[index]" ref="containerList">
            <div class="row-flex-cont">
              <div class="flex">
                <el-form-item class="item-cell" label="箱型">
                  <el-select filterable size="mini" v-model="item.containerType" style="width: 100px" clearable placeholder="请选择" :disabled="true">
                    <el-option v-for="item in dictMap.containerTypeShiporder" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item class="item-cell" label="箱量">
                  <el-input size="mini" v-model.number="item.containerNum" clearable placeholder="请输入" style="width: 100px" :disabled="true" @blur="validateContainerNum(item)"/>
                </el-form-item>
                <el-form-item class="item-cell" label="单柜件数" :show-message="false">
                  <el-input clearable size="mini" v-model.number="item.quantity" placeholder="请输入" style="width: 100px" :disabled="true" @blur="validateQuantityNum(item)"></el-input>
                </el-form-item>
                <el-form-item class="item-cell" label="单柜重量">
                  <el-input clearable size="mini" v-model="item.weight" placeholder="请输入" style="width: 100px" :disabled="true" @blur="validateWeight(item)"><template slot="append">KGS</template></el-input>
                </el-form-item>
                <el-form-item class="item-cell" label="单柜体积">
                  <el-input clearable size="mini" v-model="item.volume" placeholder="请输入" style="width: 100px" :disabled="true" @blur="validateVolume(item)"><template slot="append">CBM</template></el-input>
                </el-form-item>
                <el-form-item class="item-cell" label="包装" :show-message="false">
                  <el-select size="mini" v-model="item.packageInfo" placeholder="请选择包装" clearable filterable style="width: 100px" :disabled="true">
                    <el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item class="item-cell" label="是否重柜">
                  <el-select size="mini" v-model="item.isHeavy" style="width: 100px" clearable placeholder="请选择" :disabled="true">
                    <el-option v-for="ele in yesOrNoOptions" :key="ele.value" :label="ele.label" :value="ele.value"> </el-option>
                  </el-select>
                </el-form-item>
                <div class="item-cell">
                  <span class="lab">用箱要求</span>
                  <el-select size="mini" v-model="item.boxRemark" style="width: 100px;" clearable placeholder="请选择" :disabled="true">
                    <el-option v-for="item in dictMap.boxRemark" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                  </el-select>
                </div>
              </div>
              <div class="flex" style="clear: both">
                <el-form-item class="item-cell" label="特种长宽高" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
                  <el-col :span="8">
                    <el-form-item>
                      <el-input clearable size="mini" v-model.number="item.specialLength" placeholder="请输入" style="width: 100px; margin-right: 5px" :disabled="true" @blur="validateNum(item, 'specialLength')">
                        <template slot="prepend">长</template>
                        <template slot="append">m</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item>
                      <el-input clearable size="mini" v-model.number="item.specialWidth" placeholder="请输入" style="width: 100px; margin-right: 5px" :disabled="true" @blur="validateNum(item, 'specialWidth')">
                        <template slot="prepend">宽</template>
                        <template slot="append">m</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item>
                      <el-input clearable size="mini" v-model.number="item.specialHeight" placeholder="请输入" style="width: 100px;" :disabled="true" @blur="validateNum(item, 'specialHeight')">
                        <template slot="prepend">高</template>
                        <template slot="append">m</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-form-item>
                <div class="item-cell" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
                  <span class="lab">是否超尺寸</span>
                  <el-select size="mini" v-model="item.gangeType" style="width: 80px;" clearable placeholder="请选择" :disabled="true">
                    <el-option v-for="item in gangeTypeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                  </el-select>
                </div>
                <div class="item-cell" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
                  <span class="lab">超限</span>
                  <el-input clearable size="mini" v-model="item.sizeBefore" placeholder="请输入" style="width: 100px;margin-right: 5px" :disabled="true" @blur="validatePoint(item, 'sizeBefore')">
                    <template slot="prepend">前</template>
                    <template slot="append">m</template>
                  </el-input>
                  <el-input clearable size="mini" v-model="item.sizeAfter" placeholder="请输入" style="width: 100px;margin-right: 5px" :disabled="true" @blur="validatePoint(item, 'sizeAfter')">
                    <template slot="prepend">后</template>
                    <template slot="append">m</template>
                  </el-input>
                  <el-input clearable size="mini" v-model="item.sizeLeft" placeholder="请输入" style="width: 100px;margin-right: 5px" :disabled="true" @blur="validatePoint(item, 'sizeLeft')">
                    <template slot="prepend">左</template>
                    <template slot="append">m</template>
                  </el-input>
                  <el-input clearable size="mini" v-model="item.sizeRight" placeholder="请输入" style="width: 100px;" :disabled="true" @blur="validatePoint(item, 'sizeRight')">
                    <template slot="prepend">右</template>
                    <template slot="append">m</template>
                  </el-input>
                </div>
                <el-form-item
                  class="item-cell"
                  label="单位"
                  v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
                >
                  <el-select size="mini" v-model="item.temperatureType" style="width: 100px;" clearable placeholder="请选择" :disabled="true">
                    <el-option v-for="item in dictMap.temperatureType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  class="item-cell"
                  label="设置温度"
                  v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
                >
                  <el-input size="mini" v-model="item.temperatureSet" clearable placeholder="请输入" style="width: 100px;" :disabled="true" @blur="validateTemprature(item, 'temperatureSet')"></el-input>
                </el-form-item>
                <el-form-item
                  class="item-cell"
                  label="最低温度"
                  v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
                >
                  <el-input size="mini" v-model="item.temperatureMin" clearable placeholder="请输入" style="width: 100px;" :disabled="true" @blur="validateTemprature(item, 'temperatureMin')"></el-input>
                </el-form-item>
                <el-form-item
                  class="item-cell"
                  label="最高温度"
                  v-if="item.containerType.toUpperCase().indexOf('RF') !== -1"
                >
                  <el-input size="mini" v-model="item.temperatureMax" clearable placeholder="请输入" style="width: 100px;" :disabled="true" @blur="validateTemprature(item, 'temperatureMax')"></el-input>
                </el-form-item>
                <el-form-item
                  class="item-cell"
                  label="通风量"
                  v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
                >
                  <el-input clearable size="mini" v-model="item.airMete" placeholder="请输入" style="width: 100px;" :disabled="true" @blur="validateTemprature(item, 'airMete')">
                    <template slot="append">CBM/时</template>
                  </el-input>
                </el-form-item>
                <el-form-item
                  class="item-cell"
                  label="湿度要求"
                  v-if="item.containerType.toUpperCase().indexOf('RF') !== -1"
                >
                  <el-input size="mini" v-model="item.humidity" clearable placeholder="请输入" style="width: 100px;" :disabled="true"></el-input>
                </el-form-item>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import { getDictLabel } from '@/utils/tools'

export default {
  filters: {
  },
  data() {
    return {
      oQuery: this.$route.query,
      yesOrNoOptions: [
				{ label: '是', value: 'y' },
				{ label: '否', value: 'n' }
			],
			gangeTypeOptions: [
				{ label: 'IN GAUGE', value: 'in' },
				{ label: 'OUT OF GAUGE', value: 'out' }
			],
      boxRemarkOptions: [], // 用箱要求下拉
      containerListShowState: false,
    }
  },
  props: {
    containerTotal: {
			type: Object,
			default: () => ({})
		},
		createItem: {
			type: Object,
			default: () => ({})
		}
  },
  created() {
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      orderNo: state => state.order.orderNo
    }),
    origSoContainerList() {
      let result = this.createItem.soContainerList.filter(item => item.isAdd !== 'Y')
      return result
    }
  },
  watch: {
  },
  components: {
  },
  methods: {
    // 箱型箱量展开收起
		handleToogleExpand() {
      this.containerListShowState = !this.containerListShowState
		},
  }
};
</script>

<style lang="scss">
.add-container-form{
  .total{
    font-size: 12px;
    line-height: 20px;
    height: 20px;
    margin-bottom: 10px;
    span{
      margin-right: 10px;
    }
  }
  .org{
    font-weight: bold;
    margin-bottom: 4px;
  }
  .so-container{
    &.add-cont{
      background-color:#fff;
      padding: 0;
    }
    &.add-cont-row{
      display: flex;
      margin-top: 10px;
    }
    .so-row-cont {
      border: 1px solid #e9e9e9;
      border-radius: 4px;
      margin: 0;
      overflow: hidden;
    }
    .so-total{
      font-size: 12px;
      display: inline-block;
      line-height: 32px;
      height: 32px;
      margin: 0 8px;
      &.add-cont-total{
        line-height: 20px;
        height: 20px;
        width: 100%;
        margin: 0 8px;
      }
    }
    .containerList-show{
      padding: 8px 0 5px;
    }
    .so-row-cont.mt04{
      margin: 4px 0 0 0;
    }
    .so-row-cont .org-cont{
      padding: 8px 0 4px;
      background-color: #f8f9fd;
    }
    .so-row-cont .containerList-show{
      padding: 0;
    }
    .so-row-cont .row-cont-tit{
      display: flex;
      background-color: #ebebeb;
      .tit{
        display: block;
        line-height: 32px;
        width: 80px;
        font-size: 12px;
      }
      .so-total{
        flex: 1;
      }
      .row-cont-rt{
        float: none;
      }
    }
  }
}
</style>
