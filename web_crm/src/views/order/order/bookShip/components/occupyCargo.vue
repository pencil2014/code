<template>
<div class="row-cont" v-if="cargoList && cargoList.length">
  <div class="row-cont-tit">
    <span class="tit ft12">货物信息<em v-if="isPricing">(*为必填，必填项未填写则会被忽略)</em></span>
    <div class="row-cont-rt">
      <span class="expand" @click="handleToogleExpand"> {{ cargoShow ? '收起' : '展开' }}<i :class="cargoShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
    </div>
  </div>
  <div class="occupyCargo-form" v-show="cargoShow">
    <div class="row-flex flex-cargo" v-for="(o, index) in cargoList" :key="index"  ref="cargoList">
      <div class="btn-plus-search" @click="handleAddCargo" v-if="!viewState"></div>
      <div class="btn-minus-search" @click="handleDeleteCargo(index)" v-if="index > 0 && !viewState"></div>
      <el-form-item class="flex-item cname" label="HS Code" :show-message="false" :rules="{required: true, message: '请选择海关编号', trigger: 'change'}">
        <el-select size="mini" v-model="o.hscode" style="width: 100%" remote filterable clearable placeholder="请选择海关编号" :disabled="viewState"
        @change="handleChangeHscode"
        @mouseenter.native="showTooltip($event, o.hscode)"
        @mouseleave.native="hiddenTooltip"
        :remote-method="(val) => queryCargoHscode(val)">
          <el-option v-for="(item, index) in hscodeOptions"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item cname" label="中文品名"  
      :show-message="false" :rules="{required: true, message: '请输入中文品名', trigger: 'blur'}">
        <el-input size="mini" v-model="o.cname" clearable placeholder="请输入中文品名" :disabled="viewState" maxlength="128" @mouseenter.native="showTooltip($event, o.cname)"
          @mouseleave.native="hiddenTooltip"></el-input>
      </el-form-item>
      <el-form-item class="flex-item cname" label="英文品名"
      :show-message="false" :rules="{required: true, message: '请输入英文品名', trigger: 'blur'}">
        <el-input size="mini" v-model="o.ename" clearable placeholder="请输入英文品名" :disabled="viewState" maxlength="128" @mouseenter.native="showTooltip($event, o.ename)"
						@mouseleave.native="hiddenTooltip"></el-input>
      </el-form-item>
      <div class="flex-item cname">
        <div class="item-label"><span class="lab">货品分类</span></div>
        <div class="item-content">
          <el-select size="mini" v-model="o.commodityTypeCode" style="width: 100%" filterable clearable placeholder="请选择货品分类" :disabled="viewState">
            <el-option v-for="item in commodityTypeCodeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
      </div>
      <el-form-item class="flex-item cname" label="货物性质" :show-message="false" 
        :rules="{required: true, message: '请选择货物性质', trigger: 'change'}">
        <el-select size="mini" v-model="o.property" style="width: 100%" clearable placeholder="请选择货物性质" :disabled="viewState">
          <el-option v-for="(item, index) in dictMap.cargoProperty"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item cname" label="装箱要求" 
      :show-message="false" :rules="{required: true, message: '请输入装箱要求', trigger: 'blur'}">
        <el-input size="mini" v-model="o.boxRemark" @focus="handleClear(o)" @blur="handleBlur(o)" placeholder="如无装箱要求，填无" :disabled="viewState">
        </el-input>
      </el-form-item>
      <el-form-item class="flex-item hscode" label="危险等级" v-if="o.property === 'dangerous'" 
        :show-message="false" :rules="{required: true, message: '请选择危险等级', trigger: 'change'}">
        <el-select size="mini" v-model="o.dangerousGrade" style="width: 100%" clearable placeholder="请选择危险等级" :disabled="viewState">
          <el-option v-for="(item, index) in dictMap.dangerousGrade"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item cname" label="国际危码" 
        :show-message="false" v-if="o.property === 'dangerous'" :rules="{required: true, message: '请选择国际危码', trigger: 'change'}">
        <el-select size="mini" v-model="o.dangerousCode" style="width: 100%" clearable placeholder="请选择国际危码" :disabled="viewState"
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
        <div class="item-content">
          <el-input size="mini" v-model="o.packageGroup" clearable placeholder="请输入包装组别" :disabled="viewState"></el-input>
        </div>
      </div>
      <el-form-item v-if="isWoodenPackageState" class="flex-item cname" label="木质包装"
        :show-message="false" :rules="{required: false, message: '请选择木质包装', trigger: 'change'}">
        <el-select size="mini" v-model="o.isWoodenPackage" style="width: 100%" clearable placeholder="请选择木质包装" :disabled="viewState">
          <el-option v-for="item in yesOrNoOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
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
      cargoShow: true
    }
  },
  props: {
    cargoList: {
      type: Array,
      default: () => ([])
    },
    bookDetailForm: {
      type: Object,
      default: () => ({})
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
      // roles: state => state.user.roles,
      ordDetRole: state => state.order.orderList.ordDetRole
    }),
    roles() {
      let roles = this.$route.query.roles ? this.$route.query.roles.split(',') : []
      return roles
    },
    isWoodenPackageState() {
      // 美国，加拿大，澳洲航线显示木质包装选项
      return ['US', 'CA', 'AU'].includes(this.countryCode)
    },
    viewState() {
      // 新增占舱
      if (this.isPricing && !this.$route.query.bkgReqNo) {
        return false
      }
      if (this.isPricing && ['draft', 'book_refuse'].includes(this.bookDetailForm.bkgStatus)) {
        return false
      }
      return true
    },
    isPricing() {
			return this.roles.includes('pricing')
		},
  },
  watch: {
  },
  components: {
     
  },
  methods: {
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
    // 增加一行货物信息
    handleAddCargo() {
      this.cargoList.push({
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
      this.$emit('delete', index)
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
