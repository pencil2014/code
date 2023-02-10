<template>
  <div class="">
    <div class="mb10 between h28 mt10 table-com-layout">
      <div class="ft14">
        <span class="mr20">集装箱信息</span>
        <span class="ft12" v-if="containerTotal.show">箱量：{{containerTotal.container}} 货量： 件数{{containerTotal.quantity}}  毛重{{containerTotal.weight}} KGS 体积{{containerTotal.volume}} CBM</span>
      </div>
      <div class="el-button-group" v-if="!isBd">
        <el-button size="mini" type="default" class="ml10" @click="handleSelectContainer">选择集装箱</el-button>
      </div>
    </div>
    <el-table ref="table" fit highlight-current-row style="width: 100%" :data="bindContainerList">
      <el-table-column prop="containerType" label="箱型" align="center"></el-table-column>
      <el-table-column prop="so" label="SO号" align="center"></el-table-column>
      <el-table-column prop="cn" label="箱号" align="center"></el-table-column>
      <el-table-column prop="quantity" label="件数" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.quantity" size="mini" placeholder="请输入"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="毛重" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.weight" size="mini" placeholder="请输入">
            <template slot="append">KGS</template>
          </el-input>
        </template>
      </el-table-column>
      <el-table-column prop="volume" label="体积" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.volume" size="mini" placeholder="请输入">
            <template slot="append">CBM</template>
          </el-input>
        </template>
      </el-table-column>
      <el-table-column prop="packageType" label="包装" align="center">
        <template slot-scope="scope">
          <el-select v-model="scope.row.packageType" size="mini" filterable>
            <el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <div class="operate-group">
            <el-button @click="handleCancelBind(scope.$index)" type="text" size="mini" :disabled="isBd">取消关联</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 选择集装箱弹窗 -->
    <div v-if="truckContainersShow">
      <TruckContainers :serviceType="serviceType" :bindContainerList="bindContainerList" @close="truckContainersPopClose"/>
    </div>
  </div>
</template>
<script>

import {mapState} from 'vuex'
import TruckContainers from './truckContainer'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      truckContainersShow: false,
      packageTypeOptions: []
    }
  },
  props: {
    bindContainerList: {
      type: Array,
      default: () => ([])
    },
    containerTotal: {
      type: Object,
      default: () => ({})
    },
    serviceType: {
      type: String,
      default: ''
    }
  },
  created() {
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.airTransport.orderList.ordDetRole
    }),
    isAc() {
			return this.ordDetRole === 'ac'
		},
    isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
  },
  components: {
    TruckContainers
  },
  watch: {
  },
  methods: {
    // 打开选择集装箱弹窗
    handleSelectContainer() {
      this.truckContainersShow = true
    },

    // 选择集装箱弹窗关闭回调
    truckContainersPopClose(action, value) {
      if (action === 'Confirm') {
        this.$emit('bind', value)
      }
      this.truckContainersShow = false
    },

    // 取消关联集装箱
    handleCancelBind(rowIndex) {
      this.$emit('cancelBind', rowIndex)
    },

  }
}
</script>
<style lang="scss">

</style>