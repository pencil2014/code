<template>
  <div class="third-party-cnt">
    <el-radio-group
      v-model="carrierSource"
      size="small"
      @change="changeCarrier"
    >
      <el-radio-button
        v-for="item in carrierSourceList"
        :key="item"
        :label="item"
      ></el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>
import { carrierList } from '@/api/order/createBooking'
export default {
  props: {
    carrierOption: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      carrierSource: '',
      carrierSourceList: [],
    }
  },
  created() {
    this.carrierSource = this.carrierOption.carrierSource
    this.getCarrierSourceList()
  },
  methods: {
    changeCarrier(val) {
      if (val !== this.carrierOption.carrierSource) {
        this.$confirm(
          'Switching service providers will clear the filled data, are you sure?',
          'Warning',
          {
            confirmButtonText: 'Sure',
            cancelButtonText: 'Cancel',
            type: 'warning',
          }
        )
          .then(() => {
            this.carrierOption.carrierSource = val
          })
          .catch(() => {
            this.carrierSource = this.carrierOption.carrierSource
          })
      }
    },
    getCarrierSourceList(str = '') {
      const data = {
        keyword: str,
        type: 'bk',
        baseCarrierCode: this.$route.query.carrierCode,
      }
      carrierList(data)
        .then((res) => {
          if (res.code === 0) {
            const source = res.data
            if (source.length) {
              this.carrierSourceList = source.map((item) => item.carrierSource)
              let shipmentId = this.$route.query.shipmentId
              if (!shipmentId) {
                if (!this.carrierSourceList.includes('inttra')) {
                  this.carrierSource = this.carrierOption.carrierSource =
                    this.carrierSourceList[0]
                } else {
                  this.carrierSource = this.carrierOption.carrierSource =
                    'inttra'
                }
              }
            }
          }
        })
        .catch(() => {})
    },
  },
  watch: {
    'carrierOption.carrierSource' (val) {
      if (val) {
        this.carrierSource = val
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.third-party-cnt {
  /deep/ .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    color: #ffffff;
    background-color: #1890ff;
  }
}
</style>
