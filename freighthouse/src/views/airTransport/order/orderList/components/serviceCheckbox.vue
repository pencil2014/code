<template>
  <div class="serviceTypeList-container">
    <div class="service-row">
      <span class="name">起运港：</span>
      <el-checkbox-group size="mini" v-model="serviceList" @change="handleCheckedServiceTypes">
        <el-checkbox
          size="mini"
          class=""
          v-for="item in polServiceCodeOptions"
          :key="item.serviceCode" 
          :disabled="item.disabled || disabled"
          :label="item.serviceCode"
          @change="(val) => handleChangeChecked(val, item)">
          {{item.serviceName}}
          <el-tooltip class="item" effect="dark" :content="tipsObj[item.serviceCode]" placement="top">
            <i class="el-icon-info" v-if="tipsObj[item.serviceCode]"></i>
          </el-tooltip>
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="service-row">
      <span class="name">目的港：</span>
      <el-checkbox-group size="mini" v-model="serviceList" @change="handleCheckedServiceTypes">
        <el-checkbox
          size="mini"
          class=""
          v-for="item in podServiceCodeOptions"
          :key="item.serviceCode" 
          :disabled="item.disabled || podDisabled || disabled"
          :label="item.serviceCode"
          @change="(val) => handleChangeChecked(val, item)">
          {{item.serviceName}}
        </el-checkbox>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      tipsObj: {
        pick_up: '说明：常见的吨车零担运输',
        air_doc: '包含：产地证、船证、箱单发票、磁检',
        // ciq: '各类检验检疫，包含：CIQ、BV、COC/SASO',
      },
      serviceList: []
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
    serviceCodeOptions: {
      type: Array,
      default: () => ([])
    },
    disabled: {
      type: Boolean,
      default: false
    },
  },
  activated() {
  },
  created() {
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),
    polServiceCodeOptions() {
      return this.serviceCodeOptions.filter(item => !item.serviceCode.startsWith('pod_'))
    },
    podServiceCodeOptions() {
      return this.serviceCodeOptions.filter(item => item.serviceCode.startsWith('pod_'))
    },
    // 空运出口客户自订的目的港服务项置灰不可选
    podDisabled() {
      return ['st06'].includes(this.createItem.serviceType)
    }
  },
  watch: {
    'createItem': {
      handler(newVal) {
        this.serviceList = newVal.serviceList
      },
      deep: true,
      immediate: true
    }
  },
  components: {
  },
  methods: {
		handleCheckedServiceTypes(val) {
			// console.log(val)
		},
    // 订舱/代订舱，起运港散车/起运港仓储/堆场装箱；目的港散车派送/目的港仓储；服务项二选一
    serviceEitherOr(val, item, tarArr, isRequired) {
      if (!val && tarArr.includes(item.serviceCode) && isRequired) {
        this.serviceList.push(item.serviceCode)
      }
      if (val && tarArr.includes(item.serviceCode)) {
        this.serviceList = this.serviceList.filter(ele => {
          let filterArr = tarArr.filter(o => o !== item.serviceCode)
          return ele !== filterArr[0]
        })
      }
      this.$emit('updServiceList', this.serviceList)
    },
		handleChangeChecked(val, item) {
      this.serviceEitherOr(val, item, ['airbook'], true)
      this.serviceEitherOr(val, item, ['book', 'proxy_book'], true)
      // this.serviceEitherOr(val, item, ['pick_up', 'pol_warehouse'])
      // this.serviceEitherOr(val, item, ['pol_ltl', 'pol_warehouse'])
      // this.serviceEitherOr(val, item, ['pod_ltl_delivery', 'pod_warehouse'])
		},
	}
}
</script>

<style lang="scss" scoped>
.serviceTypeList-container {
  padding-top: 5px;
  border-top: 1px solid #e0e0e0;
  margin: 0 8px;
  line-height: 20px;
  min-height: 20px;
  .service-row{
    display: flex;
    .name{
      display: block;
      width: 50px;
    }
    /deep/ .el-checkbox-group{
      flex: 1;
    }
    /deep/ .el-checkbox__label {
      font-size: 12px;
      padding-left: 5px;
      .el-icon-info{
        color: #999;
      }
    }
  }
}
</style>
