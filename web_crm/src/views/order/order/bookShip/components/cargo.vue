<template>
  <!-- 货物信息 -->
  <div class="row-cont mt15" id="bookCargo" v-if="bookDetailForm.cargoList.length">
    <div class="row-cont-tit">
      <span class="tit">货物信息</span>
      <span class="cargo-total" v-if="isBulkRo">
        <span class="item">总件数合计：{{ cargoTotal.quantity }}</span>
        <span class="item">总重量合计：{{ cargoTotal.weight }}KGS</span>
        <span class="item">总体积合计：{{ cargoTotal.volume }}CBM</span>
        <span class="item">总计费吨合计：{{ cargoTotal.feeWeight }}</span>
      </span>
      <div class="row-cont-rt">
        <span class="expand" @click="handleToogleExpand"> {{ cargoShow ? '收起' : '展开' }}<i :class="cargoShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
      </div>
    </div>
    <div class="cargo-form" v-show="cargoShow">
      <div class="row-flex flex-cargo" v-for="(o, index) in bookDetailForm.cargoList" :key="index">
        <el-form-item class="flex-item hscode" label="发货单位" :prop="`cargoList.${index}.shipperCustName`">
          <el-tooltip class="item" effect="dark" placement="top" v-if="o.shipperCustName">
            <div class="" slot="content" v-html="o.shipperCustName"></div>
            <el-select v-model="o.shipperCustName" size="mini" remote filterable clearable @visible-change="(val) => custVisibleChange(val, index, o.shipperCustName)"
              :remote-method="(val) => custFilterMehod(val, index)" placeholder="请选择" @change="(val) => handleSelectCustid(val, index)" :disabled="true" style="width: 100%">
              <el-option v-for="(item, sIndex) in o.shipperCustidOptions || []" :label="item.label" :value="item.value" :key="sIndex"></el-option>
            </el-select>
          </el-tooltip>
          <el-select v-else v-model="o.shipperCustName" size="mini" remote filterable clearable @visible-change="(val) => custVisibleChange(val, index, o.shipperCustName)"
            :remote-method="(val) => custFilterMehod(val, index)" placeholder="请选择" @change="(val) => handleSelectCustid(val, index)" :disabled="true" style="width: 100%">
            <el-option v-for="(item, sIndex) in o.shipperCustidOptions || []" :label="item.label" :value="item.value" :key="sIndex"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item cname" label="总件数" :prop="`cargoList.${index}.quantity`" v-if="isBulkRo">
          <el-input size="mini" v-model.number="o.quantity" clearable placeholder="请输入" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item class="flex-item cname" label="总毛重" :prop="`cargoList.${index}.weight`" v-if="isBulkRo">
          <el-input size="mini" v-model.number="o.weight" clearable placeholder="请输入" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item class="flex-item cname" label="总体积" :prop="`cargoList.${index}.volume`" v-if="isBulkRo">
          <el-input size="mini" v-model.number="o.volume" clearable placeholder="请输入" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item class="flex-item cname" label="总计费吨" :prop="`cargoList.${index}.feeWeight`" v-if="isBulkRo">
          <el-input size="mini" v-model.number="o.feeWeight" clearable placeholder="请输入" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item class="flex-item hscode" label="HS Code" :prop="`cargoList.${index}.hscode`">
          <el-tooltip class="item" effect="dark" :content="o.hscode" placement="top">
            <el-select size="mini" v-model="o.hscode" style="width: 100%" clearable placeholder="请选择海关编号" :disabled="true" @mouseenter.native="showTooltip($event, o.hscode)"
              @mouseleave.native="hiddenTooltip">
              <el-option v-for="(item, index) in hscodeOptions"
                :key="index"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-tooltip>
        </el-form-item>
        <el-form-item class="flex-item cname" label="中文品名" :prop="`cargoList.${index}.cname`">
          <el-tooltip class="item" effect="dark" :content="o.cname" placement="top">
            <el-input size="mini" v-model="o.cname" clearable placeholder="请输入中文品名" :disabled="true" maxlength="128" @mouseenter.native="showTooltip($event, o.cname)"
              @mouseleave.native="hiddenTooltip"></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item class="flex-item cname" label="英文品名" :prop="`cargoList.${index}.ename`">
          <el-tooltip class="item" effect="dark" :content="o.ename" placement="top">
            <el-input size="mini" v-model="o.ename" clearable placeholder="请输入英文品名" :disabled="true" maxlength="128" @mouseenter.native="showTooltip($event, o.ename)"
              @mouseleave.native="hiddenTooltip"></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item class="flex-item cname" label="货品分类" :prop="`cargoList.${index}.property`">
          <el-select size="mini" v-model="o.commodityTypeCode" style="width: 100%" filterable clearable placeholder="请选择货品分类" :disabled="true">
            <el-option v-for="item in commodityTypeCodeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item cname" label="货物性质" :prop="`cargoList.${index}.property`">
          <el-select size="mini" v-model="o.property" style="width: 100%" clearable placeholder="请选择货物性质" :disabled="true" @change="handleChangeProperty(o)">
            <el-option v-for="(item, index) in dictMap.cargoProperty"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item hscode" label="装箱要求" :prop="`cargoList.${index}.boxRemark`" :show-message="false" :rules="{required: false, message: '请输入装箱要求', trigger: 'blur'}">
          <el-input size="mini" v-model="o.boxRemark" placeholder="如无装箱要求，填无" :disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item v-if="isWoodenPackageState" class="flex-item hscode" label="木质包装" :prop="`cargoList.${index}.isWoodenPackage`" 
          :show-message="false" :rules="{required: false, message: '请选择木质包装', trigger: 'change'}">
          <el-select size="mini" v-model="o.isWoodenPackage" style="width: 100%" clearable placeholder="请选择木质包装" :disabled="true">
            <el-option v-for="item in yesOrNoOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item hscode" label="危险等级" v-if="o.property === 'dangerous'" :prop="`cargoList.${index}.dangerousGrade`">
          <el-select size="mini" v-model="o.dangerousGrade" style="width: 100%" clearable placeholder="请选择危险等级" :disabled="true">
            <el-option v-for="(item, index) in dictMap.dangerousGrade"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item cname" label="国际危码" :prop="`cargoList.${index}.dangerousCode`" v-if="o.property === 'dangerous'">
          <el-select size="mini" v-model="o.dangerousCode" style="width: 100%" clearable placeholder="请选择国际危码" :disabled="true">
            <el-option v-for="(item, index) in dangerousCodeOptions"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <div class="flex-item cname" v-if="o.property === 'dangerous'">
          <div class="item-label"><span class="lab">包装组别</span></div>
          <div class="item-content">
            <el-input size="mini" v-model="o.packageGroup" clearable placeholder="请输入包装组别" :disabled="true"></el-input>
          </div>
        </div>
        <el-row class="flex-item-commodityDesc">
          <el-form-item class="form-cont" label="货物描述" :prop="`cargoList.${index}.commodityDesc`">
            <el-tooltip v-if="o.commodityDesc" class="item" effect="dark" placement="top">
              <div class="" slot="content" v-html="translateLineWrap(o.commodityDesc)"></div>
              <el-input @dblclick.native="showRemarkDetail" type="textarea" :autosize="{minRows: 1, maxRows: 4}" size="mini" v-model="o.commodityDesc" clearable placeholder="请输入货物描述" disabled maxlength="512"></el-input>
            </el-tooltip>
            <el-input v-else @dblclick.native="showRemarkDetail" type="textarea" :autosize="{minRows: 1, maxRows: 4}" size="mini" v-model="o.commodityDesc" clearable placeholder="请输入货物描述" :disabled="true" maxlength="512">
            </el-input>
          </el-form-item>
        </el-row>
        <div v-if="remarkVisible">
          <RemarkDialog :showWordLimit="false" :remark="o.commodityDesc" :title="'货物描述'" :isDisabled="true" @close="remarkDialogClose" />
        </div>
      </div>
    </div>
  </div>
  
</template>

<script>
import {mapState} from 'vuex'
import {cargoHscodeList, cargoTypeList, cargoUnnoList} from '@/api/base'
import RemarkDialog from './remarkDialog'

export default {
  data() {
    return {
      remarkVisible: false,
			remarkDialogParam: {
				title: '',
				prop: '',
				isDisabled: true,
				showWordLimit: false
			},
      oQuery: this.$route.query,
      hscodeOptions: [],  // hscode下拉数据
      dangerousCodeOptions: [], // 国家危险品编码下拉数据
      cargoShow: true,
      commodityTypeCodeOptions: [], // 货品分类下拉数据
      yesOrNoOptions: [{label: '是', value: 'y'}, {label: '否', value: 'n'}],
    }
  },
  props: {
    bookDetailForm: {
      type: Object,
      default: () => ({})
    },
    isBulkRo: {
      type: Boolean,
      default: false
    },
    countryCode: {
      type: String,
      default: ''
    }
  },
  created() {
    this.queryCargoTypeList()
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),
    isWoodenPackageState() {
      // 海域出口的是美国，加拿大，澳洲航线显示木质包装选项
      if (this.bookDetailForm.businessType === 'ship_export_fcl') {
        return ['US', 'CA', 'AU'].includes(this.countryCode)
      }
      // 海运进口的显示木质包装
      if (this.bookDetailForm.businessType === 'ship_import_fcl') {
        return true
      }
    },
    cargoTotal() {
      let quantity = 0
			let weight = 0
			let volume = 0
			let feeWeight = 0
			this.bookDetailForm.cargoList.forEach(o => {
        quantity += o.quantity ? Number(o.quantity) : 0
        weight += o.weight ? Number(o.weight) : 0
				volume += o.volume ? Number(o.volume) : 0
				feeWeight += o.feeWeight ? Number(o.feeWeight) : 0
        weight = parseFloat(weight.toFixed(3))
				volume = parseFloat(volume.toFixed(3))
				feeWeight = parseFloat(feeWeight.toFixed(3))
        quantity = parseFloat(quantity.toFixed(3))
      })
			return {
				quantity: quantity,
				weight: weight,
				volume: volume,
				feeWeight: feeWeight
			}
    }
  },
  watch: {
  },
  components: {
    RemarkDialog
  },
  methods: {
    handleChangeProperty(item) {
			// 包含危险品的，免用免堆信息置空
			this.$emit('emptyFreeTimeSys')
		},
    showRemarkDetail() {
			this.remarkVisible = true
    },
    remarkDialogClose() {
			this.remarkVisible = false
    },
    translateLineWrap(val) {
      let result = val.replace(/\n/g, '<br>')
      return result
    },
    showTooltip(event, value) {
			this.$emit('showCopyTip', event, value)
		},
		hiddenTooltip() {	
			this.$emit('hiddenCopyTip')
		},
    // 展开收起
		handleToogleExpand() {
      this.cargoShow = !this.cargoShow
    },
    // 货品分类
    queryCargoTypeList() {
      cargoTypeList().then((response) => {
        this.commodityTypeCodeOptions = response.data.map(item => {
          return Object.assign(item, {
            label: item.chapterName,
            value: item.chapterCode
          })
        })
      });
    },
    // 国际危险品编码查询
    queryCargoUnno(queryString) {
      queryString && cargoUnnoList({keyword: queryString}).then((response) => {
        this.dangerousCodeOptions = response.data.map(item => {
          return Object.assign(item, {
            label: item.unDesc,
            value: item.unNo
          })
        })
      });
    },
    custFilterMehod(val, index) {
      val !== undefined && this.getCustList(val, index)
    },
    custVisibleChange(val, index, custid) {
      if (val) {
        !custid && this.getCustList('', index)
      }
    },
    handleSelectCustid() {

    },
    // 获取委托单位
    getCustList(val = '', index) {
      this.$store.dispatch('dict/queryCustomerList', val).then(data => {
        let list = data.list.map(o => {
          return {
            ...o,
            value: o.custid ? Number(o.custid) : '',
            label: this.$language=='en'?o.ename:o.name
          }
        })
        this.$set(this.bookDetailForm.cargoList[index], 'shipperCustidOptions', list)
      })
    },
  },
};
</script>

<style lang="scss" scoped>
#bookCargo .cargo-form {
  padding-top: 5px;
  .row-flex.flex-cargo{
    clear: both;
    margin-bottom: 6px;
    overflow: hidden;
    .btn-minus-search, .btn-plus-search{
      margin-top: 2px;
    }
    .flex-item{
      width: 16.66%;
      display: flex;
      height: 20px;
      padding: 0 5px 0 0;
      margin-bottom: 4px;
      /deep/ .el-form-item__label, .item-label{
        width: 85px;
        padding-right: 4px;
        line-height: 20px;
        height: 20px;
      }
      .item-label .lab{
        display: block;
        width: 100%;
        text-align: right;
      }
      /deep/ .el-form-item__content, .item-content{
        flex: 1;
        line-height: 20px;
        height: 20px;
      }
      &.cname{
        /deep/ .el-form-item__label, .item-label{
          width: 60px;
        }
      }
      &.hscode{
        /deep/ .el-form-item__label, .item-label{
          width: 60px;
        }
      }
    }
    .flex-item-commodityDesc{
      width: 100%;
      display: flex;
      .form-cont{
        display: flex;
        width: 50%;
        padding: 0 5px 0 0;
        height: auto;
        /deep/ .el-form-item{
          margin-bottom: 0px;
        }
        /deep/ .el-form-item__label, .item-label{
          width: 60px;
          padding-right: 4px;
          line-height: 20px;
        }
        /deep/ .el-form-item__content, .item-content{
          flex: 1;
          line-height: 20px;
        }
        /deep/ .el-textarea__inner{
          padding: 1px 5px;
          line-height: 16px !important;
          box-sizing: border-box;
        }
      }
    }
  }
}
</style>
