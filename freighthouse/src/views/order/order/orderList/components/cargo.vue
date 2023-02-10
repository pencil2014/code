<template>
  <div class="cargo-form">
    <div class="row-flex flex-cargo" v-for="(o, index) in createItem.cargoList" :key="index">
      <div class="btn-plus-search" @click="handleAddCargo" v-if="!viewState && !isOp"></div>
      <div class="btn-minus-search" @click="handleDeleteCargo(index)" v-if="index > 0 && !viewState && !isOp"></div>
      <div class="cargo-item hscode" v-if="isOp">
        <div class="item-label"><span class="lab">货品简称</span></div>
        <div class="item-content">
          <el-input size="mini" v-model="o.shortCname" clearable placeholder="请输入" :disabled="viewState && isOp">></el-input>
        </div>
      </div>
      <div class="cargo-item hscode">
        <div class="item-label"><span class="lab">发货单位</span></div>
        <div class="item-content">
          <el-select v-model="o.shipperCustid" size="mini" remote filterable clearable @visible-change="(val) => custVisibleChange(val, index, o.shipperCustid)"
            :remote-method="(val) => custFilterMehod(val, index)" placeholder="请选择" @change="(val) => handleSelectCustid(val, index)" :disabled="!isBdOpEdit" style="width: 100%">
            <el-option v-for="(item, sIndex) in o.shipperCustidOptions || []" :label="item.label" :value="item.value" :key="sIndex"></el-option>
          </el-select>
        </div>
      </div>
      <div class="cargo-item hscode" v-if="isOp && !isBulkRo">
        <div class="item-label"><span class="lab">件数</span></div>
        <div class="item-content">
          <el-input size="mini" v-model.number="o.quantity" clearable placeholder="请输入" :disabled="viewState && isOp" @blur="validateQuantity('quantity', o)"></el-input>
        </div>        
      </div>
      <div class="cargo-item hscode" v-if="isOp && !isBulkRo">
        <div class="item-label"><span class="lab">总毛重</span></div>
        <div class="item-content">
          <el-input size="mini" v-model="o.weight" clearable placeholder="请输入" :disabled="viewState && isOp" @blur="validateVolumeWeight('weight', o)">
            <template slot="append">KGS</template>
          </el-input>
        </div>        
      </div>
      <div class="cargo-item hscode" v-if="isOp && !isBulkRo">
        <div class="item-label"><span class="lab">总体积</span></div>
        <div class="item-content">
          <el-input size="mini" v-model="o.volume" clearable placeholder="请输入" :disabled="viewState && isOp" @blur="validateVolumeWeight('volume', o)">
            <template slot="append">CBM</template>
          </el-input>
        </div>        
      </div>
      <div class="cargo-item hscode" v-if="isBulkRo">
        <div class="item-label"><span class="lab">总件数</span></div>
        <div class="item-content">
          <el-input size="mini" v-model.number="o.quantity" clearable placeholder="请输入" :disabled="!isBdOpEdit" @blur="validateQuantity('quantity', o)"></el-input>
        </div>        
      </div>
      <div class="cargo-item hscode" v-if="isBulkRo">
        <div class="item-label"><span class="lab">总毛重</span></div>
        <div class="item-content">
          <el-input size="mini" v-model="o.weight" clearable placeholder="请输入" :disabled="!isBdOpEdit" @blur="validateVolumeWeight('weight', o)">
            <template slot="append">KGS</template>
          </el-input>
        </div>        
      </div>
      <div class="cargo-item hscode" v-if="isBulkRo">
        <div class="item-label"><span class="lab">总体积</span></div>
        <div class="item-content">
          <el-input size="mini" v-model="o.volume" clearable placeholder="请输入" :disabled="!isBdOpEdit" @blur="validateVolumeWeight('volume', o)">
            <template slot="append">CBM</template>
          </el-input>
        </div>        
      </div>
      <div class="cargo-item hscode" v-if="isBulkRo">
        <div class="item-label"><span class="lab">总计费吨</span></div>
        <div class="item-content">
          <el-input size="mini" v-model="o.feeWeight" clearable placeholder="请输入" :disabled="!isBdOpEdit" @blur="validateVolumeWeight('feeWeight', o)">
          </el-input>
        </div>        
      </div>
      <div class="cargo-item hscode" v-if="isOp">
        <div class="item-label"><span class="lab">包装</span></div>
        <!-- <el-input size="mini" v-model="o.packageInfo" clearable placeholder="请输入" :disabled="viewState && isOp">></el-input> -->
        <div class="item-content">
          <el-select size="mini" v-model="o.packageInfo" style="width: 100%" clearable placeholder="请选择" :disabled="viewState && isOp" filterable>
            <el-option v-for="(item, index) in dictMap.packageType"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
      </div>
      <div class="cargo-item hscode" v-if="isOp">
        <div class="item-label"><span class="lab">长</span></div>
        <div class="item-content">
            <el-input size="mini" v-model="o.length" clearable placeholder="请输入" :disabled="viewState && isOp">>
            <template slot="append">m</template>
          </el-input>
        </div>        
      </div>
      <div class="cargo-item hscode" v-if="isOp">
        <div class="item-label"><span class="lab">宽</span></div>
        <div class="item-content">
          <el-input size="mini" v-model="o.width" clearable placeholder="请输入" :disabled="viewState && isOp">>
            <template slot="append">m</template>
          </el-input>
        </div>        
      </div>
      <div class="cargo-item hscode" v-if="isOp">
        <div class="item-label"><span class="lab">高</span></div>
        <div class="item-content"> 
          <el-input size="mini" v-model="o.height" clearable placeholder="请输入" :disabled="viewState && isOp">>
            <template slot="append">m</template>
          </el-input>
        </div>        
      </div>
      <div class="cargo-item hscode" v-if="isOp" style="width: 47.4%">
        <div class="item-label"><span class="lab">唛头</span></div>
        <div class="item-content">
          <el-input size="mini" v-model="o.mark" clearable placeholder="请输入" :disabled="viewState && isOp">></el-input>
        </div>        
      </div>
      <el-form-item class="cargo-item hscode" label="HS Code" :prop="`cargoList.${index}.hscode`" 
      :show-message="false" :rules="{required: isBd, message: '请选择海关编号', trigger: 'change'}">
       <el-tooltip v-if="viewState || isOp" class="item" effect="dark" :content="o.hscode" placement="top">
          <el-select size="mini" v-model="o.hscode" style="width: 100%"  placeholder="请选择海关编号" disabled>
            <el-option v-for="(item, index) in hscodeOptions"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
				</el-tooltip>
        <el-select v-else size="mini" v-model="o.hscode" style="width: 100%" remote filterable clearable placeholder="请选择海关编号" :disabled="viewState || isOp"
        @change="handleChangeHscode"
        :remote-method="(val) => queryCargoHscode(val)">
          <el-option v-for="(item, index) in hscodeOptions"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="cargo-item hscode cname-ename" label="中文品名" :prop="`cargoList.${index}.cname`" 
      :show-message="false" :rules="{required: isBd, message: '请输入中文品名', trigger: 'blur'}">
        <el-tooltip v-if="viewState || isOp" class="item" effect="dark" :content="o.cname" placement="top">
           <el-input size="mini" v-model="o.cname" clearable placeholder="请输入中文品名" disabled maxlength="1024"></el-input>
        </el-tooltip>
        <el-input  v-else size="mini" v-model="o.cname" clearable placeholder="请输入中文品名" :disabled="viewState || isOp" maxlength="1024"></el-input>
      </el-form-item>
      <el-form-item class="cargo-item hscode cname-ename" label="英文品名" :prop="`cargoList.${index}.ename`" 
      :show-message="false" :rules="{required: isBd, message: '请输入英文品名', trigger: 'blur'}">
        <el-tooltip v-if="viewState || isOp" class="item" effect="dark" :content="o.ename" placement="top">
           <el-input size="mini" v-model="o.ename" clearable placeholder="请输入英文品名" disabled maxlength="1024"></el-input>
        </el-tooltip>
        <el-input v-else size="mini" v-model="o.ename" clearable placeholder="请输入英文品名" :disabled="viewState || isOp" maxlength="1024"></el-input>
      </el-form-item>
      <div class="cargo-item hscode">
        <div class="item-label"><span class="lab">货品分类</span></div>
        <div class="item-content">
          <el-select size="mini" v-model="o.commodityTypeCode" style="width: 100%" filterable clearable placeholder="请选择货品分类" :disabled="viewState || isOp">
            <el-option v-for="item in commodityTypeCodeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
      </div>
      <el-form-item class="cargo-item hscode" label="货物性质" :prop="`cargoList.${index}.property`" :show-message="false" 
        :rules="{required: isBd, message: '请选择货物性质', trigger: 'change'}">
        <el-select size="mini" v-model="o.property" style="width: 100%" clearable placeholder="请选择货物性质" :disabled="viewState || isOp" @change="handleChangeProperty(o)">
          <el-option v-for="(item, index) in dictMap.cargoProperty"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="cargo-item hscode" label="装箱要求" :prop="`cargoList.${index}.boxRemark`" 
      :show-message="false" :rules="{required: isBd, message: '请输入装箱要求', trigger: 'blur'}">
        <el-input size="mini" v-model="o.boxRemark" @focus="handleClear(o)" @blur="handleBlur(o)" placeholder="如无装箱要求，填无" :disabled="viewState || isOp">
        </el-input>
      </el-form-item>
      <el-form-item class="cargo-item hscode" label="危险等级" v-if="o.property === 'dangerous'" 
        :show-message="false" :prop="`cargoList.${index}.dangerousGrade`" :rules="{required: isBd, message: '请选择危险等级', trigger: 'change'}">
        <el-select size="mini" v-model="o.dangerousGrade" style="width: 100%" clearable placeholder="请选择危险等级" :disabled="viewState || isOp">
          <el-option v-for="(item, index) in dictMap.dangerousGrade"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="cargo-item hscode" label="国际危码" :prop="`cargoList.${index}.dangerousCode`" 
        :show-message="false" v-if="o.property === 'dangerous'" :rules="{required: isBd, message: '请选择国际危码', trigger: 'change'}">
        <el-select size="mini" v-model="o.dangerousCode" style="width: 100%" clearable placeholder="请选择国际危码" :disabled="viewState || isOp"
          remote filterable :remote-method="(val) => queryCargoUnno(val)">
          <el-option v-for="(item, index) in dangerousCodeOptions"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <div class="cargo-item hscode" v-if="o.property === 'dangerous'">
        <div class="item-label"><span class="lab">包装组别</span></div>
        <div class="item-content">
          <el-input size="mini" v-model="o.packageGroup" maxlength="64" clearable placeholder="请输入包装组别" :disabled="viewState || isOp"></el-input>
        </div>
      </div>
      <el-form-item v-if="isWoodenPackageState" class="cargo-item hscode" label="木质包装" :prop="`cargoList.${index}.isWoodenPackage`" 
        :show-message="false" :rules="{required: false, message: '请选择木质包装', trigger: 'change'}">
        <el-select size="mini" v-model="o.isWoodenPackage" style="width: 100%" clearable placeholder="请选择木质包装" :disabled="viewState">
          <el-option v-for="item in yesOrNoOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-row class="flex-item-commodityDesc">
        <el-form-item class="form-cont" label="货物描述" :prop="`cargoList.${index}.commodityDesc`">
          <el-tooltip v-if="(viewState || isOp) && o.commodityDesc" class="item" effect="dark" placement="top">
            <div class="" slot="content" v-html="translateLineWrap(o.commodityDesc)"></div>
            <el-input type="textarea" :autosize="{minRows: 1, maxRows: 4}" size="mini" v-model="o.commodityDesc" clearable placeholder="请输入货物描述" disabled maxlength="512"></el-input>
          </el-tooltip>
          <el-input v-else type="textarea" :autosize="{minRows: 1, maxRows: 4}" size="mini" v-model="o.commodityDesc" clearable placeholder="请输入货物描述" :disabled="viewState || isOp" maxlength="512">
          </el-input>
        </el-form-item>
      </el-row>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {cargoHscodeList, cargoTypeList, cargoUnnoList} from '@/api/base'
import {quantityMixin} from '@/views/order/order/mixins/quantityMixin'

export default {
  mixins: [quantityMixin],
  data() {
    return {
      oQuery: this.$route.query,
      hscodeOptions: [],  // hscode下拉数据
      // shipperCustidOptions: [], // 发货单位下拉数据
      commodityTypeCodeOptions: [], // 货品分类下拉数据
      dangerousCodeOptions: [], // 国家危险品编码下拉数据
      yesOrNoOptions: [{label: '是', value: 'y'}, {label: '否', value: 'n'}],
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    },
    orderStatus: {
      type: String,
      default: ''
    },
    countryCode: {
      type: String,
      default: ''
    }
  },
  created() {
    this.queryCargoTypeList()
    // this.fillCustid(this.createItem.cargoList)
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.order.orderList.ordDetRole,
      orderInfoDataObj: state => state.order.orderInfoDataObj
    }),
    isWoodenPackageState() {
      // 美国，加拿大，澳洲航线显示木质包装选项
      return ['US', 'CA', 'AU'].includes(this.countryCode)
    },
    isEpricing() {
			return this.ordDetRole === 'epricing'
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
    viewState() {
      if (this.isBd) {
        if (!['draft', 'refuse'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else if (this.ordDetRole === 'op' && this.$route.query.source === 'orderList') {
        if (!['pass'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else if (!this.ordDetRole || this.isDoc || this.isEpricing || this.isEcs || this.isAc || this.isOpTruck || this.isCsc || this.isBkg || this.$route.query.source === 'jointList') {
        return true
      } else {
        return false
      }
    },
    isBkg() {
      return this.ordDetRole === 'bkg'
    },
    isCsc() {
      return this.ordDetRole === 'csc'
    },
    isAc() {
			return this.ordDetRole === 'ac'
		},
    isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
      // bd 审核通过的同op一样的视角
      if (this.ordDetRole === 'bd' && this.orderStatus === 'pass') {
				return true	
      }
      // op,doc,ac一样的视角
      if (this.ordDetRole === 'op' || this.ordDetRole === 'doc' || this.ordDetRole === 'ac' || this.ordDetRole === 'op_truck' || this.ordDetRole === 'csc' || this.ordDetRole === 'bkg') {
				return true
			}
      return false
			// return this.ordDetRole === 'op'
    },
    isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
    },
    // bd,op都有编辑权限
    isBdOpEdit() {
      if (this.isBd && ['draft', 'refuse'].includes(this.orderStatus)) {
        return true
      }
      if (this.ordDetRole === 'op' && ['pass'].includes(this.orderStatus) && this.$route.query.source === 'orderList') {
        return true
      }
      return false
    },
    // 散杂滚装
    isBulkRo() {
      return this.orderInfoDataObj.businessType === 'ship_bulk_ro'
    }
  },
  watch: {
    // 'createItem.cargoList': {
    //   handler(newVal) {
    //     if (newVal) {
    //       this.fillCustid(newVal)
    //     }
    //   },
    //   deep: true
    // }
  },
  components: {
     
  },
  methods: {
		handleChangeProperty(item) {
			// 包含危险品的，免用免堆信息置空
			this.$emit('emptyFreeTimeSys')
		},
    translateLineWrap(val) {
      let result = val.replace(/\n/g, '<br>')
      return result
    },
    // // 发货单位回显
    // fillCustid(cargoList) {
    //   cargoList.map(item => {
    //     if(item.shipperCustid === 0) item.shipperCustid = ''
    //     item.shipperCustid && this.shipperCustidOptions.push({value: item.shipperCustid, label: item.shipperCustName})
    //   })
    //   // 去重
    //   this.shipperCustidOptions = new Set(this.shipperCustidOptions)
    //   this.shipperCustidOptions = Array.from(this.shipperCustidOptions)
    //   // console.log('cargo', this.shipperCustidOptions)
    // },
    // 增加一行货物信息
    handleAddCargo() {
      this.createItem.cargoList.push({
        boxRemark: '无'
      })
    },

    // 获取焦点清除默认的无
    handleClear(o) {
      if (o.boxRemark === '无') o.boxRemark = ''
    },
    // 移除焦点未填写装箱要求默认设置为无
    handleBlur(o) {
      o.boxRemark = o.boxRemark || '无'
    },

    // 删除一行货物信息
    handleDeleteCargo(index) {
      let {cargoList} = this.createItem
      this.createItem.cargoList = cargoList.filter((item, sindex) => {
        return sindex !== index
      })
    },

    // visibleChnageHscode(val) {
    //   if(val) {
    //     this.hscodeOptions = []
    //   }
    // },

    handleChangeHscode(val) {
      if (!val) this.hscodeOptions = []
    },

    // hscode模糊查询
    queryCargoHscode(queryString) {
      queryString && cargoHscodeList({keyword: queryString}).then((response) => {
        this.hscodeOptions = response.data.map(item => {
          return Object.assign(item, {
            label: item.cargoDesc,
            value: item.hscode
          })
        })
      });
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
        this.$set(this.createItem.cargoList[index], 'shipperCustidOptions', list)
      })
    },
  },
};
</script>

<style lang="scss" scoped>
.cargo-form .row-flex.flex-cargo{
  .btn-minus-search, .btn-plus-search{
    margin-top: 2px;
    margin-right: 5px;
  }
  .cargo-item{
    width: 15.8%;
    display: flex;
    height: 20px;
    padding: 0 5px 0 0;
    margin-bottom: 4px;
    float: left;
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
        width: 70px;
      }
    }
  }
  .cname-ename{
     width: 31.6%;
  }
  .flex-item-commodityDesc{
    width: 94.8%;
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
        width: 70px;
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
</style>
