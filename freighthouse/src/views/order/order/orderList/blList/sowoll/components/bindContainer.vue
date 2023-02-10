<template>
  <div class="bind-container">
    <div class="tit">
			<img :src="require(`@/views/order/order/images/sw/cust-tit-icon.png`)" class="img-tit" alt="">
			<span>集装箱信息</span>
			<el-button type="primary" size="mini" class="relate-btn" @click="handleSelectContainer">关联集装箱</el-button>
		</div>
		<el-table class="container-table" style="width: 100%" :data="bindContainerList">
			<el-table-column prop="containerType" label="箱型" align="center" width=""></el-table-column>
			<el-table-column prop="so" label="SO号" align="center" type="" width=""></el-table-column>
			<el-table-column prop="cn" label="箱号" align="center" type="" width="">
				<template slot-scope="scope">
          <el-input v-model="scope.row.cn" size="mini" placeholder="请输入">
          </el-input>
        </template>
			</el-table-column>
			<el-table-column prop="sn" label="封号" align="center" type="" width="">
				<template slot-scope="scope">
          <el-input v-model="scope.row.sn" size="mini" placeholder="请输入">
          </el-input>
        </template>
			</el-table-column>
			<el-table-column prop="quantity" label="件数" align="center" type="" width="">
				<template slot-scope="scope">
          <el-input v-model.number="scope.row.quantity" size="mini" placeholder="请输入" @blur="validateNum('quantity', scope.row)">
          </el-input>
        </template>
			</el-table-column>
			<el-table-column prop="weight" label="毛重(KGS)" align="center" type="" width="">
				<template slot-scope="scope">
          <el-input v-model="scope.row.weight" size="mini" placeholder="请输入" @blur="validateNum('weight', scope.row)">
          </el-input>
        </template>
			</el-table-column>
			<el-table-column prop="volume" label="体积(CBM)" align="center" type="" width="">
				<template slot-scope="scope">
          <el-input v-model="scope.row.volume" size="mini" placeholder="请输入" @blur="validateNum('volume', scope.row)">
          </el-input>
        </template>
			</el-table-column>
			<el-table-column prop="packageType" label="包装" align="center" type="" width="">
				<template slot-scope="scope">
          <el-select v-model="scope.row.packageType" size="mini" filterable>
            <el-option v-for="(item, index) in custBlDictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </template>
			</el-table-column>
			<el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <div class="operate-group">
						<img :src="require(`@/views/order/order/images/sw/icon-container-delete.png`)" alt="" @click="handleCancelBind(scope.$index)" class="img-delete">
          </div>
        </template>
      </el-table-column>
		</el-table>
    <!-- 选择集装箱弹窗 -->
    <div v-if="containersShow">
      <ContainerList :bindContainerList="bindContainerList" :selectContainerList="selectContainerList" @close="containersPopClose"/>
    </div>
  </div>
</template>
<script>

import {mapState} from 'vuex'
import ContainerList from './containerList'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      containersShow: false
    }
  },
  props: {
    bindContainerList: {
      type: Array,
      default: () => ([])
    },
    selectContainerList: {
      type: Array,
      default: () => ([])
    },
    custBlDictMap: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
  },
  mounted() {
    
  },
  computed: {
    // ...mapState({
    //   dictMap: state => state.dict.dictMap,
    // }),
  },
  components: {
    ContainerList
  },
  watch: {
  },
  methods: {
    validateNum(val, row) {
      let max = val === 'quantity' ? 9999999 : 999999
			if (row[val] > max) {
				row[val] = max
				this.$message.warning(`最大不能超过${max}`)
			}
		},
    // 打开选择集装箱弹窗
    handleSelectContainer() {
      this.containersShow = true
    },
    // 选择集装箱弹窗关闭回调
    containersPopClose(action, value) {
      if (action === 'Confirm') {
        this.$emit('bind', value)
      }
      this.containersShow = false
		},
    // 取消关联集装箱
    handleCancelBind(rowIndex) {
      this.$emit('cancelBind', rowIndex)
    },

  }
}
</script>
<style lang="scss" scoped>
.bind-container {
  .tit {
		height: 24px;
		margin-bottom: 24px;
		.img-tit {
			display: inline-block;
			width: 20px;
			height: 20px;
			margin-right: 8px;
		}
		span {
			font-size: 20px;
			line-height: 24px;
			color: #222222;
			font-weight: bold;
		}
		/deep/ .el-button--mini {
			&.relate-btn {
				padding: 5px 12px;
				float: right;
			}
		}
	}
  /deep/ .el-table{
		&.container-table {
			th {
				background-color: #F4F5F8;
				height: 40px;
				line-height: 20px;
				padding: 10px 0;
			}
			td {
				line-height: 20px;
				padding: 10px 0;
				border-bottom: 1px solid #EBEEF5;
      }
      .img-delete {
        width: 24px;
        height: 24px;
      }
    }
    
	}
}
</style>