<!--
 * @Author: Sivan
 * @Date: 2022-05-31 17:00:33
 * @LastEditTime: 2022-05-31 17:36:09
 * @LastEditors: Sivan
-->
<template>
  <el-dialog
    title="新增补料"
    :visible.sync="option.show"
    width="600px"
    class="add-si"
    @close="cancel"
  >
    <div class="add-cnt">
      <span class="title">选择船司：</span>
      <el-select v-model="carrierCode" value-key="" placeholder="请选择" clearable filterable>
        <el-option
          v-for="item in shippingCarrierList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <div slot="footer">
      <el-button @click="cancel" size="mini">取消</el-button>
      <el-button type="primary" size="mini" @click="submit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    option: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      carrierCode: '',
      shippingCarrierList: [],
    }
  },
  created() {
    this.shipCarrierSearch()
    this
  },
  methods: {
    shipCarrierSearch() {
      this.$store.dispatch('robotSi/getCarrierList')
      .then(list => {
        this.shippingCarrierList = list
      })
    },
    cancel() {
      this.$parent.$data.addOption.show = false
    },
    submit() {
      if (!this.carrierCode) {
        return this.$msgErrClose('请先选择船司')
      }
      this.cancel()
      let routeUrl = this.$router.resolve({
				name: 'RobotPacking',
				query: {
					shipCarrierCode: this.carrierCode
				}
			})
			window.open(routeUrl.href, '_blank')
    },
  },
}
</script>

<style lang="scss" scoped>
.add-cnt {
  display: flex;
  align-items: center;
  .title {
    &::before {
      content: '*';
      color: #ff4949;
      margin-right: 4px;
    }
  }
  .el-select {
    flex: 1;
  }
}
</style>
