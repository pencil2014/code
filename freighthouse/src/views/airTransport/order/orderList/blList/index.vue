<template>
  <div class="edit-container order-book fullWrap" id="blList">
    <div class="order-container">
      <div class="tabs-container">
        <div class="detail-container flex">
          <div class="flex1 component-main-cont">
            <div class="service-container" id="air-bl-main">
              <CustInfo :orderInfo="airOrderInfo" />
              <component ref="blListComponents" :is="currentComponent" :orderStatus="airOrderInfo.orderStatus"></component>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'
import BlList from '../orderBook/components/bl'
import BlImportList from '../orderBook/components/blImport'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      oQuery: this.$route.query,
      activityKey: this.$route.name
    }
  },
  created() {
  },
  mounted() {
  },
  beforeRouteLeave(to, from, next) {
		let check = this.$refs['blListComponents'].needShowTip()
    if (check) {
			this.$confirm('提单还未保存，是否确定要离开当前页面？', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
			.then(() => { 
				 next()
			})
			.catch(() => {
				
			})
		} else {
			next()
		}
	},
  destroyed() {
  },
  computed: {
    ...mapState({
      airOrderInfo: (state) => state.airTransport.airOrderInfo
    }),
    currentComponent() {
      if (this.airOrderInfo.businessType === 'air_export') {
        // 空运出口
        return 'BlList'
      } else if (this.airOrderInfo.businessType === 'air_import') {
        // 空运进口
        return 'BlImportList'
      }
    }
  },
  watch: {},
  components: {
    TopNav,
    LeftNav,
    CustInfo,
    BlList,
    BlImportList
  },
  methods: {}
}
</script>

<style lang="scss">
@import '../../less/index.scss';
.containerList-cont {
  overflow-y: auto;
}
.cnDetail-form {
  .special-item {
    .el-form-item__content {
      margin-top: 20px;
    }
  }
}
#blList .service-container .edit-row {
  margin-top: 8px !important;
}
#blList .service-container .edit-row .edit-container.so {
  padding: 10px;
}
</style>