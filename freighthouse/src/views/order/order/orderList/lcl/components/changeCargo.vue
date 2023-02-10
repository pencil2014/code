<template>
  <div class="chang-cargo-row">
    <div class="row-flex flex-cargo" v-for="(o, index) in cargoList" :key="index">
      <div class="btn-plus-search" @click="handleAddCargo"></div>
      <div class="btn-minus-search" @click="handleDeleteCargo(index)" v-if="index > 0"></div>
      <el-form-item class="flex-item hscode" label="HS Code" :prop="`cargoList.${index}.hscode`" 
      :show-message="false" :rules="{required: true, message: '请选择海关编号', trigger: 'change'}">
        <el-select size="mini" v-model="o.hscode" style="width: 100%" remote filterable clearable placeholder="请选择海关编号"
        @change="handleChangeHscode"
        :remote-method="(val) => queryCargoHscode(val)">
          <el-option v-for="(item, index) in hscodeOptions"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item cname" label="中文品名" :prop="`cargoList.${index}.cname`" 
      :show-message="false" :rules="{required: true, message: '请输入中文品名', trigger: 'blur'}">
        <el-input size="mini" v-model="o.cname" clearable placeholder="请输入中文品名" maxlength="1024"></el-input>
      </el-form-item>
      <el-form-item class="flex-item cname" label="英文品名" :prop="`cargoList.${index}.ename`" 
      :show-message="false" :rules="{required: true, message: '请输入英文品名', trigger: 'blur'}">
        <el-input size="mini" v-model="o.ename" clearable placeholder="请输入英文品名" maxlength="1024"></el-input>
      </el-form-item>
      <div class="flex-item cname">
        <div class="item-label"><span class="lab">货品分类</span></div>
        <div class="item-content">
          <el-select size="mini" v-model="o.commodityTypeCode" style="width: 100%" clearable filterable placeholder="请选择货品分类">
            <el-option v-for="item in commodityTypeCodeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
      </div>
      <el-form-item class="flex-item cname" label="货物性质" :prop="`cargoList.${index}.property`" :show-message="false" 
        :rules="{required: true, message: '请选择货物性质', trigger: 'change'}">
        <el-select size="mini" v-model="o.property" style="width: 100%" clearable placeholder="请选择货物性质">
          <el-option v-for="(item, index) in dictMap.cargoProperty"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item cname" label="包装" :prop="`cargoList.${index}.packageInfo`" :show-message="false" 
        :rules="{required: true, message: '请选择包装', trigger: 'change'}">
        <el-select size="mini" v-model="o.packageInfo" style="width: 100%" clearable placeholder="请选择" filterable> 
          <el-option v-for="item in dictMap.packageType"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item hscode" label="危险等级" v-if="o.property === 'dangerous'" 
        :show-message="false" :prop="`cargoList.${index}.dangerousGrade`" :rules="{required: true, message: '请选择危险等级', trigger: 'change'}">
        <el-select size="mini" v-model="o.dangerousGrade" style="width: 100%" clearable placeholder="请选择危险等级">
          <el-option v-for="(item, index) in dictMap.dangerousGrade"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item cname" label="国际危码" :prop="`cargoList.${index}.dangerousCode`" 
        :show-message="false" v-if="o.property === 'dangerous'" :rules="{required: true, message: '请选择国际危码', trigger: 'change'}">
        <el-select size="mini" v-model="o.dangerousCode" style="width: 100%" clearable placeholder="请选择国际危码"
          remote filterable :remote-method="(val) => queryCargoUnno(val)">
          <el-option v-for="(item, index) in dangerousCodeOptions"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <div class="flex-item cname" v-if="o.property === 'dangerous'">
        <div class="item-label"><span class="lab">包装组别</span></div>
        <el-input size="mini" v-model="o.packageGroup" maxlength="64" clearable placeholder="请输入包装组别"></el-input>
      </div>
      <el-form-item v-if="isWoodenPackageState" class="flex-item hscode" label="木质包装" :prop="`cargoList.${index}.isWoodenPackage`" 
        :show-message="false" :rules="{required: false, message: '请选择木质包装', trigger: 'change'}">
        <el-select size="mini" v-model="o.isWoodenPackage" style="width: 100%" clearable placeholder="请选择木质包装">
          <el-option v-for="item in yesOrNoOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item hscode" label="发货单位" :prop="`cargoList.${index}.shipperName`" 
        :show-message="false" :rules="{required: false, message: '请选择发货单位', trigger: 'change'}">
        <el-select v-model="o.shipperName" size="mini" clearable remote :filterable="true" @visible-change="(val) => custVisibleChange(val, o.shipperName)"
          :remote-method="custFilterMehod" placeholder="请选择" @change="(val) => handleSelectCustid(val, o)" style="width: 100%">
          <el-option v-for="(item, index) in shipperCustOptions" :label="item.label" :value="item.value" :key="'shipperName'+index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item flex-item3 hscode" label="唛头" :prop="`cargoList.${index}.mark`" :show-message="false" 
        :rules="{required: true, message: '请输入唛头', trigger: 'blur'}" style="clear: both">
        <el-input size="mini" v-model="o.mark" clearable placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item class="flex-item flex-item3 cname" label="货物描述" :prop="`cargoList.${index}.commodityDesc`" :show-message="false"
      :rules="{required: false, message: '请输入货物描述', trigger: 'blur'}">
        <el-input size="mini" v-model="o.commodityDesc" clearable placeholder="请输入"></el-input>
      </el-form-item>
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
      commodityTypeCodeOptions: [], // 货品分类下拉数据
      dangerousCodeOptions: [], // 国家危险品编码下拉数据
      yesOrNoOptions: [{label: '是', value: 'y'}, {label: '否', value: 'n'}],
      shipperCustOptions: []  // 发货单位下拉值
    }
  },
  props: {
    cargoList: {
      type: Array,
      default: () => ([])
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
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.order.orderList.ordDetRole
    }),
    isWoodenPackageState() {
      // 美国，加拿大，澳洲航线显示木质包装选项
      return ['US', 'CA', 'AU'].includes(this.countryCode)
    },
  },
  watch: {
  },
  components: {
  },
  methods: {
    custFilterMehod(val) {
      this.getCustList(val)
    },
    custVisibleChange(val, name) {
      if (val) {
        this.getCustList(name)
      }
    },
    handleSelectCustid(val, o) {
      // console.log('val', val, o)
    },
    // 获取委托单位
    getCustList(val = '') {
      this.$store.dispatch('dict/queryCustomerList', val).then(data => {
        let list = data.list
        this.shipperCustOptions = list.map(o => {
          return {
            ...o,
            value: o.name,
            label: o.name
          }
        })
      })
    },
    // 增加一行货物信息
    handleAddCargo() {
      this.$emit('add')
      // this.cargoList.push({})
    },

    // 删除一行货物信息
    handleDeleteCargo(index) {
      this.$emit('delete', index)
      // this.cargoList = this.cargoList.filter((item, sindex) => {
      //   return sindex !== index
      // })
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
      })
    },
  }
};
</script>

<style lang="scss">
</style>
