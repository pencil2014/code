<template>
  <div
    class="booking-box"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="title-box">
      <h3>Create Booking Request</h3>
    </div>
    <div class="booking-cnt-box">
      <div class="third-party">
        <Thirdparty :carrierOption.sync="carrierOption"/>
      </div>
      <component
        :is="companyName"
        :carrierSource="carrierOption.carrierSource"
      />
    </div>
  </div>
</template>

<script>
import Thirdparty from './components/thirdParty'
import Inttra from './inttra'
import Leyutsl from './leyuTsl'
import Leyurcl from './leyuRcl'
import Leyupil from './leyuPil'
import Leyuesl from './leyuEsl'
import Msk from './msk'
import Cargosmart from './cargosmart'
import Emc from './emc'
import Hmm from './hmm'
import { carrierList, bkgDetail } from '@/api/order/createBooking'
export default {
  components: {
    Thirdparty,
    Inttra,
    Leyutsl,
    Leyurcl,
    Leyupil,
    Leyuesl,
    Msk,
    Cargosmart,
    Emc,
    Hmm
  },
  data() {
    return {
      companyName: '',
      carrierOption: {
        carrierSource: '',
      },
      code: '', // TLWN:TSL , REGU:RCL
      lsLoading: true,
    }
  },
  created() {
    let shipmentId = this.$route.query.shipmentId
    if (shipmentId) {
      this.getDataSource(shipmentId)
    } else {
      this.getCarrierList()
    } 
    // this.getCarrierList()
  },
  watch: {
    'carrierOption.carrierSource'() {
      this.checkCarrierSource()
    },
  },
  methods: {
    // 获取船司列表
    getCarrierList(str = '') {
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
              const dataSource = source.find(
                (item) => item.carrierSource === 'leyu'
              )
              this.code = dataSource?.scac || ''
            }
            this.checkCarrierSource()
          }
        })
        .catch(() => {})
    },
    checkCarrierSource() {
      let val = this.carrierOption.carrierSource
      if (!val) {
        return
      }
      if (val === 'leyu') {
        let company = {
          TLWN: 'Leyutsl',
          REGU: 'Leyurcl',
          PABV: 'Leyupil',
          ESL: 'Leyuesl',
        }
        this.companyName = company[this.code]
      } else if (['mccq', 'msk'].includes(val)) {
        this.companyName = 'Msk'
      } else if (val === 'cargosmart') {
        this.companyName = 'Cargosmart'
      } else if (val === 'emc') {
        this.companyName = 'Emc'
      } else if (val === 'hmm') {
        this.companyName = 'Hmm'
      } else {
        this.companyName = 'Inttra'
      }
      this.lsLoading = false
    },
    // 获取重新提交的数据
    getDataSource (shipId) {
      let data = {
        shipId
      }
      bkgDetail(data).then(res => {
        let carrierSource = res.data?.carrierSource?.toLowerCase() || 'inttra'
        if (carrierSource === 'leyu') {
          this.code = res.data.scac
        }
        this.$set(this.carrierOption, 'carrierSource', carrierSource)
      }).catch(()=>{})
    }
  }
}
</script>

<style lang="scss" scoped>
.booking-box {
  font-family: Tahoma, Verdana, Arial, 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 300;
  font-size: 12px;
  color: #4a4e50;
  box-sizing: border-box;
  background-color: #fff;
  margin: 10px 14px;
  padding: 5px 16px 16px;
  .title-box {
    h3 {
      font-weight: 400;
      font-size: 26px;
      line-height: 1.5;
    }
    margin: 10px 0;
  }
  .third-party {
    margin-bottom: 10px;
  }
}
</style>
