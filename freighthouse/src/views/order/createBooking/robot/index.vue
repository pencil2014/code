<template>
  <components v-if="shipCarrierCodeComponents" :shipCarrierCode="shipCarrierCode" :resData="resData" :is="shipCarrierCodeComponents" @changeCarrierCb="changeCarrierCb" />
</template>

<script>
import Hmm from './hmm.vue'
import One from './one.vue'
import Whl from './whl.vue'
import Yml from './yml.vue'
import Tsl from './tsl.vue'
import Pil from './pil.vue'
import Cosco from './cosco.vue'
import Oocl from './oocl.vue'
import Cma from './cma.vue'
import { getSiInfo } from '@/api/order/robotSi'
export default {
   data() {
    return {
      shipCarrierCodeObj: {
        'HMM': 'Hmm',
        'ONE': 'One',
        'WHL': 'Whl',
        'YML': 'Yml',
        'TSL': 'Tsl',
        'PIL': 'Pil',
        'COSCO': 'Cosco',
        'OOCL': 'Oocl',
        'CMA': 'Cma',
      },
      shipCarrierCodeComponents: '',
      shipCarrierCode: '',
      contentData: null,
      resData: {},
    }
   },
   components: {
    Hmm,
    One,
    Whl,
    Yml,
    Tsl,
    Pil,
    Cosco,
    Oocl,
    Cma,
   },
   created() {
    this.getData()
   },
   methods: {
    getData() {
      if (this.$route.query.siOid || this.$route.query.oid) {
          getSiInfo({
            blId: this.$route.query.siOid,
            oid: this.$route.query.oid,
          })
          .then(res => {
            if(res.data && res.data.content) {
              this.resData = res.data
              this.contentData = JSON.parse(res.data.content)
              this.shipCarrierCode = this.resData.shipCarrierCode
              this.shipCarrierCodeComponents = this.shipCarrierCodeObj[this.shipCarrierCode]
            } else {
              this.resData = {}
              this.contentData = {}
              this.shipCarrierCode = this.$route.query.shipCarrierCode
              this.shipCarrierCodeComponents = this.shipCarrierCodeObj[this.shipCarrierCode]
            }
          })
      } else {
        this.resData = {}
        this.contentData = {}
        this.shipCarrierCode = this.$route.query.shipCarrierCode
        this.shipCarrierCodeComponents = this.shipCarrierCodeObj[this.shipCarrierCode]
      }
    },
    changeCarrierCb(shipCarrierCode) {
      if (this.$route.query.siOid) {
          getSiInfo({
            blId: this.$route.query.siOid,
            oid: this.$route.query.oid, 
          })
          .then(res => {
            if(res.data && res.data.content) {
              this.resData = res.data
              this.contentData = JSON.parse(res.data.content)
              this.shipCarrierCode = shipCarrierCode
              this.shipCarrierCodeComponents = this.shipCarrierCodeObj[this.shipCarrierCode]
            } else {
              this.resData = {}
              this.contentData = {}
              this.shipCarrierCode = shipCarrierCode
              this.shipCarrierCodeComponents = this.shipCarrierCodeObj[shipCarrierCode]
            }
          })
      } else {
        this.shipCarrierCode = shipCarrierCode
        this.shipCarrierCodeComponents = this.shipCarrierCodeObj[shipCarrierCode]
      }
    }
   }
}
</script>

<style>

</style>