<template>
  <div class="ml10">
    <div class="row-flex flex-cargo" v-for="(o, index) in createItem.cargoList" :key="index">
      <div class="btn-plus-search" @click="handleAddCargo" v-if="!viewState"></div>
      <div class="btn-minus-search" @click="handleDeleteCargo(index)" v-if="index > 0 && !viewState"></div>
      <!-- <div class="flex-item" v-if="isOp">
        <div class="item-label"><span class="lab">件数</span></div>
        <el-input size="mini" v-model="o.quantity" clearable placeholder="请输入" :disabled="viewState"></el-input>
      </div> -->
      <!-- <div class="flex-item" v-if="isOp">
        <div class="item-label"><span class="lab">包装</span></div>
        <div class="">
          <el-select size="mini" v-model="o.packageInfo" style="" clearable placeholder="请选择" :disabled="viewState || isOp" filterable>
            <el-option v-for="(item, index) in dictMap.packageType"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
      </div> -->
      <!-- <div class="flex-item" v-if="isOp">
        <div class="item-label"><span class="lab">货品简称</span></div>
        <el-input size="mini" v-model="o.shortCname" clearable placeholder="请输入" :disabled="viewState && isOp">></el-input>
      </div> -->
      <!-- <div class="flex-item" v-if="isOp">
        <div class="item-label"><span class="lab">唛头</span></div>
        <el-input size="mini" v-model="o.mark" clearable placeholder="请输入" :disabled="viewState && isOp">></el-input>
      </div> -->
      <!-- <div class="flex-item" v-if="isOp">
        <div class="item-label"><span class="lab">发货单位</span></div>
        <div class="">
          <el-select v-model="o.shipperCustid" size="mini" clearable :filterable="true" @visible-change="custVisibleChange"
            :filter-method="custFilterMehod" placeholder="请选择" @change="handleSelectCustid" :disabled="viewState && isOp" style="width: 100%">
            <el-option v-for="(item, index) in shipperCustidOptions" :label="item.label" :value="item.value" :key="index"></el-option>
          </el-select>
        </div>
      </div> -->
      <!-- <div class="flex-item" v-if="isOp">
        <div class="item-label"><span class="lab">总体积</span></div>
        <el-input size="mini" v-model="o.volume" clearable placeholder="请输入" :disabled="viewState && isOp">>
          <template slot="append">CBM</template>
        </el-input>
      </div> -->
      <!-- <div class="flex-item" v-if="isOp">
        <div class="item-label"><span class="lab">总毛重</span></div>
        <el-input size="mini" v-model="o.weight" clearable placeholder="请输入" :disabled="viewState && isOp">>
          <template slot="append">KGS</template>
        </el-input>
      </div> -->
      <!-- <div class="flex-item" v-if="isOp">
        <div class="item-label"><span class="lab">长</span></div>
        <el-input size="mini" v-model="o.length" clearable placeholder="请输入" :disabled="viewState && isOp">>
          <template slot="append">m</template>
        </el-input>
      </div> -->
      <!-- <div class="flex-item" v-if="isOp">
        <div class="item-label"><span class="lab">宽</span></div>
        <el-input size="mini" v-model="o.width" clearable placeholder="请输入" :disabled="viewState && isOp">>
          <template slot="append">m</template>
        </el-input>
      </div> -->
      <!-- <div class="flex-item" v-if="isOp">
        <div class="item-label"><span class="lab">高</span></div>
        <el-input size="mini" v-model="o.height" clearable placeholder="请输入" :disabled="viewState && isOp">>
          <template slot="append">m</template>
        </el-input>
      </div> -->

      <el-form-item class="flex-item" label="HS Code" :prop="`cargoList.${index}.hscode`" 
      :show-message="false" :rules="{required: true, message: '请选择海关编号', trigger: 'change'}">
        <el-tooltip v-if="viewState" class="item" effect="dark" :content="o.hscode" placement="top">
          <el-select size="mini" v-model="o.hscode" style="width: 100%" placeholder="请选择海关编号" disabled>
            <el-option v-for="(item, index) in hscodeOptions"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-tooltip>
        <el-select v-else size="mini" v-model="o.hscode" style="" remote filterable clearable placeholder="请选择海关编号" :disabled="viewState"
        @change="handleChangeHscode"
        :remote-method="(val) => queryCargoHscode(val)">
          <el-option v-for="(item, index) in hscodeOptions"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item" label="中文品名" :prop="`cargoList.${index}.cname`" 
      :show-message="false" :rules="{required: true, message: '请输入中文品名', trigger: 'blur'}">
        <el-tooltip v-if="viewState" class="item" effect="dark" :content="o.cname" placement="top">
          <el-input size="mini" v-model="o.cname" clearable placeholder="请输入中文品名" disabled></el-input>
        </el-tooltip>
        <el-input v-else size="mini" v-model="o.cname" clearable placeholder="请输入中文品名" :disabled="viewState"></el-input>
      </el-form-item>
      <el-form-item class="flex-item" label="英文品名" :prop="`cargoList.${index}.ename`" 
      :show-message="false" :rules="{required: true, message: '请输入英文品名', trigger: 'blur'}">
        <el-tooltip v-if="viewState" class="item" effect="dark" :content="o.ename" placement="top">
          <el-input size="mini" v-model="o.ename"  placeholder="请输入英文品名" disabled></el-input>
        </el-tooltip>
        <el-input v-else size="mini" v-model="o.ename" clearable placeholder="请输入英文品名" :disabled="viewState"></el-input>
      </el-form-item>
      <div class="flex-item">
        <div class="item-label"><span class="lab">货品分类</span></div>
        <div class="">
          <el-select size="mini" v-model="o.commodityTypeCode" style="" clearable filterable placeholder="请选择货品分类" :disabled="viewState">
            <el-option v-for="item in commodityTypeCodeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
      </div>
      <el-form-item class="flex-item" label="装箱特殊要求" :prop="`cargoList.${index}.boxRemark`" 
      :show-message="false" :rules="{required: true, message: '请输入装箱特殊要求', trigger: 'blur'}">
        <el-input size="mini" v-model="o.boxRemark" @focus="handleClear(o)" @blur="handleBlur(o)" placeholder="如无装箱特殊要求，填无" :disabled="viewState">
        </el-input>
      </el-form-item>
      <el-form-item v-if="isWoodenPackageState" class="flex-item" label="是否木质包装" :prop="`cargoList.${index}.isWoodenPackage`" 
        :show-message="false" :rules="{required: true, message: '请选择是否木质包装', trigger: 'change'}">
        <el-select size="mini" v-model="o.isWoodenPackage" style="" clearable placeholder="请选择是否木质包装" :disabled="viewState">
          <el-option v-for="item in yesOrNoOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item" label="货物性质" :prop="`cargoList.${index}.property`" :show-message="false" 
        :rules="{required: true, message: '请选择货物性质', trigger: 'change'}">
        <el-select size="mini" v-model="o.property" style="" clearable placeholder="请选择货物性质" :disabled="viewState">
          <el-option v-for="(item, index) in dictMap.cargoProperty"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item" label="危险等级" v-if="o.property === 'dangerous'" 
        :show-message="false" :prop="`cargoList.${index}.dangerousGrade`" :rules="{required: true, message: '请选择危险等级', trigger: 'change'}">
        <el-select size="mini" v-model="o.dangerousGrade" style="" clearable placeholder="请选择危险等级" :disabled="viewState">
          <el-option v-for="(item, index) in dictMap.dangerousGrade"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item" label="国际危码" :prop="`cargoList.${index}.dangerousCode`" 
        :show-message="false" v-if="o.property === 'dangerous'" :rules="{required: true, message: '请选择国际危码', trigger: 'change'}">
        <el-select size="mini" v-model="o.dangerousCode" style="" clearable placeholder="请选择国际危码" :disabled="viewState"
          remote filterable :remote-method="(val) => queryCargoUnno(val)">
          <el-option v-for="(item, index) in dangerousCodeOptions"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <div class="flex-item" v-if="o.property === 'dangerous'">
        <div class="item-label"><span class="lab">包装组别</span></div>
        <el-input size="mini" v-model="o.packageGroup" clearable placeholder="请输入包装组别" :disabled="viewState"></el-input>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {cargoHscodeList, cargoTypeList, cargoUnnoList} from '@/api/base'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      hscodeOptions: [],  // hscode下拉数据
      shipperCustidOptions: [], // 发货单位下拉数据
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
    this.fillCustid(this.createItem.cargoList)
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      currRole: state => state.user.currRole
    }),
    isWoodenPackageState() {
      // 美国，加拿大，澳洲航线显示木质包装选项
      return ['US', 'CA', 'AU'].includes(this.countryCode)
    },
    viewState() {
      if (this.orderStatus === 'submit') {
        return true
      }
      return false
    },
    isAc() {
			return this.currRole === 'ac'
		},
		isDoc() {
			return this.currRole === 'doc'
		},
		isOp() {
			return this.currRole === 'op'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd'
		},
  },
  watch: {
    'createItem.cargoList': {
      handler(newVal) {
        if (newVal) {
          this.fillCustid(newVal)
        }
      },
      deep: true
    }
  },
  components: {
     
  },
  methods: {
    // 发货单位回显
    fillCustid(cargoList) {
      cargoList.map(item => {
        if(item.shipperCustid === 0) item.shipperCustid = ''
        item.shipperCustid && this.shipperCustidOptions.push({value: item.shipperCustid, label: item.shipperCustName})
      })
      // 去重
      this.shipperCustidOptions = new Set(this.shipperCustidOptions)
      this.shipperCustidOptions = Array.from(this.shipperCustidOptions)
      // console.log('cargo', this.shipperCustidOptions)
    },
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
    // 移除焦点未填写装箱特殊要求默认设置为无
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
    custFilterMehod(val) {
      this.getCustList(val)
    },
    custVisibleChange(val) {
      if (val) {
        this.getCustList()
      }
    },
    handleSelectCustid() {

    },
    // 获取委托单位
    getCustList(val = '') {
      this.$store.dispatch('dict/queryCustomerList', val).then(data => {
        let list = data.list
        this.shipperCustidOptions = list.map(o => {
          return {
            value: o.custid ? Number(o.custid) : '',
            label: this.$language=='en'?o.ename:o.name
          }
        })
      })
    },
  },
};
</script>

<style lang="scss">

</style>
