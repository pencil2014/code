<!--
 * @Description: 客情关系tab
 * @Autor: yinjunying
 * @Date: 2022-04-12 11:47:22
-->
<template>
  <div class="guarantee-cnt" :element-loading-background="eLoadingBackground" :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText" v-loading="guestLoading" v-show="!isBlacklist">
    <div class="top-box">
      <div class="but-left">
        <el-button v-if="isEdit " type="primary" size="mini" @click="addFn">新建</el-button>
        <el-button v-if="effctRelationList.length" type="primary" size="mini" @click="handleTempDownload">导出</el-button>
      </div>
      <div class="but-right">
        <el-radio-group v-model="listType" size="mini">
          <el-radio-button label="effect">有效</el-radio-button>
          <el-radio-button label="remove">无效</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div v-if="listType === 'effect'">
      <guestRelationList ref="guestList" :custid="custid" :isSelf="isSelf" :dataList="effctRelationList" :isForeignPeer="isForeignPeer"
        @getData="getData" :isEdit="isEdit">
      </guestRelationList>
    </div>
    <div v-else>
      <guestInvalidList :dataList="removeRelationList"></guestInvalidList>
    </div>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { getGuestListApi, exportCustomerRelationApi } from '@/api/crm/guest.js'
import guestRelationList from "./guestRelationList.vue"
import guestInvalidList from "./guestInvalidList.vue"
export default {
  name: 'CUSTo',
  supplierShow: true,
  label: '客情关系',
  components: {
    FinanceTableMass,
    guestRelationList,
    guestInvalidList
  },
  inject: ['defaultRules'],
  mixins: [mixin],
  props: ['orgid', 'custid', 'isSelf', 'isClient', 'isPotential', 'isForeignPeer','isBlacklist'],
  data () {
    return {
      guestLoading: false,
      listType: "effect",
      effctRelationList: [],
      removeRelationList: []
    }
  },
  created () { },
  activated () {
    this.getData()
  },
  computed: {
    // 销售
    isBd () {
      return (
        this.$store.state.user.roles.includes('bd') ||
        this.$store.state.user.roles.includes('obd')
      )
    },
    // 客户部
    isCts () {
      return this.$store.state.user.roles.includes('cts')
    },
    // 管理者
    isManager () {
      return this.$store.state.user.roles.includes('manager')
    },
    // 是否能进行新建、编辑、失效操作
    // 1. “编辑、失效”只能对本人创建的“客情关系”进行操作；
    // 2. 可对“潜在客户、委托人”类型的客户进行“新增、编辑、失效” 客情关系；
    // 3. 销售维护人才能操作
    // 4. 管理者和客户部只能查看
    // 5. 20220526新增：既是管理者又是销售，能新建、编辑、失效，所以不管是不是管理者，只要有bd/obd角色的就可以新建、编辑、失效
    isEdit () {
      return this.isSelf && (this.isClient || this.isPotential) && this.isBd && !this.isCts && (this.listType === 'effect')
    }
  },
  watch: {
    'listType' () {
      this.getData()
    }
  },
  methods: {
    /**
     * @description: 获取有效/无效列表数据
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-13 15:07:06
     */
    getData () {
      this.guestLoading = true
      let data = {
        custid: this.custid,
        status: this.listType
      }
      getGuestListApi(data)
        .then((res) => {
          if (res.code === 0) {
            let list = res.data
            if (this.listType === 'effect') {
              this.effctRelationList = list || []
              // 过滤掉我司联系人和客户联系人都为空的数据
              if (this.effctRelationList.length) {
                this.effctRelationList = this.effctRelationList.filter(item => !(item.ourCompanyEmployeeId === "" && item.contactId === ""))
              }
            } else {
              this.removeRelationList = list || []
            }
          }
        })
        .catch(() => { })
        .finally(() => {
          this.guestLoading = false
        })
    },
    /**
     * @description: 新增一条空的客情关系
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-15 10:12:33
     */
    addFn () {
      this.$refs.guestList.addEmptyInfo()
    },

    handleTempDownload () {
      let data = {
        custid: this.custid,
        status: this.listType
      }
      exportCustomerRelationApi(data)
        .then(res => {
          if (res.code === 0 && res.data && res.data.filePath) {
            location.href = res.data.filePath
          } else {
            this.$msgErrClose("导出错误，请稍后再试！")
          }
        }).catch(() => { })
        .finally(() => {
        })
    }
  }
}
</script>

<style lang="scss" scope>
.top-box {
  margin: 10px 0;
  display: flex;
  .but-left {
    margin-left: 8px;
  }
  .but-right {
    flex: 1;
    text-align: right;
    margin-right: 8px;
  }
}
</style>