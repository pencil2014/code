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
          :disabled="item.disabled || isJointList"
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
          :disabled="item.disabled || podDisabled || isJointList"
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
        pol_ltl: '说明：常见的吨车零担运输',
        doc: '包含：产地证、船证、箱单发票、磁检',
        ciq: '各类检验检疫，包含：CIQ、BV、COC/SASO',
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
  },
  activated() {
  },
  created() {
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.order.orderList.ordDetRole,
      orderInfoDataObj: state => state.order.orderInfoDataObj
    }),
    isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op' || this.isDoc
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'asst'
		},
    polServiceCodeOptions() {
      return this.serviceCodeOptions.filter(item => !item.serviceCode.startsWith('pod_'))
    },
    podServiceCodeOptions() {
      return this.serviceCodeOptions.filter(item => item.serviceCode.startsWith('pod_'))
    },
    // 海运出口整箱拼箱客户自订的目的港服务项置灰不可选。散杂滚装的客户自订也不不可选。
    podDisabled() {
      return ['st02','st04','st25'].includes(this.createItem.serviceType)
    },
    // 20220808进口业务的服务项去掉可选功能 !['ship_import_fcl', 'ship_import_lcl'].includes(this.orderInfoDataObj.businessType)
    isJointList() {
      return ['jointList', 'whJointList'].includes(this.$route.query.source)
    },
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
      this.serviceEitherOr(val, item, ['book', 'proxy_book'], true)
      this.serviceEitherOr(val, item, ['whbook', 'proxy_whbook'], true)
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
