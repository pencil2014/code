<template>
  <CrmCard :title="isCustomer?'新建客户信息':'新建供应商'">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      ref="form"
      size="mini"
      style="overflow:hidden"
    >
      <!-- <el-form-item label="新建类型" prop="customerMode" v-if="isCustomer">
        <el-select
          @change="clearData"
          placeholder="请选择"
          style="width:220px"
          v-model="form.customerMode"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in dictMap.customerMode"
          ></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="国家(行政区)" prop="country">
        <el-select
          :remote-method="getCountryList"
          @change="clearData"
          @visible-change="(val)=> val && getCountryList('')"
          clearable
          filterable
          placeholder="请选择"
          remote
          style="width:220px"
          v-model="form.country"
        >
          <el-option
            :key="item.value"
            :label="`${item.cname}(${item.ename})`"
            :value="item.cname"
            v-for="item in countryList"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item class="search-list" label="企业名称" prop="currentCustomer">
        <el-input
          clearable
          placeholder="支持模糊搜索，拉取天眼查数据"
          size="mini"
          v-model="form.currentCustomer"
        >
          <el-popover
            placement="bottom-end"
            popper-class="search-popover"
            slot="append"
            trigger="manual"
            v-model="popoverShow"
            width="220"
          >
            <ul>
              <li class="no-data" v-if="loading">加载中...</li>
              <li class="no-data" v-else-if="!customerList.length">无数据</li>
                <li
                  :key="item.id"
                  @click="selectCompany(item)"
                  class="has-data"
                  v-for="item in customerList"
                >
                <span v-if="item.isTheSame==='yes'" style="color:red">{{item.name}} <i  class="el-icon-success"></i></span>
                <span v-else>{{item.name}}</span>

               </li>
            </ul>
            <span slot="reference"></span>
          </el-popover>
        </el-input>
      </el-form-item>
      <el-button
        :loading="btnLoading"
        @click.stop="search"
        icon="el-icon-search"
        size="mini"
        type="primary"
      >搜索</el-button>
      <!-- <span style="color:#E9E9E9;line-height:20px">支持模糊搜索，拉取天眼查数据</span> -->
      <!-- :disabled="!currentCustomer"  -->
      <!-- <div style="float: right;" >
        <template v-if="form.country==='中国'">
          <span style="line-height:20px;padding-right:10px;">检验含义：系统内查重，工商局备案查询</span>
          <el-button
            :disabled="!currentCustomer"
            @click="searchCustomer"
            plain
            size="mini"
            type="primary"
          >检验</el-button>
        </template>
        <el-button @click="nextStep('clear')" plain size="mini">跳过</el-button>
      </div>-->
    </el-form>
    <el-divider></el-divider>
    <div class="customer-info">
      <ul class="base-info-list" v-if="custInfo">
        <li
          :class="{'block-li':item.block,'full-li':item.full}"
          :key="item.key+index"
          v-for="(item,index) in searchInfoArr"
        >
          {{item.label}}：
          <span v-if="item.key!=='name'">{{custInfo[item.key]}}</span>
          <strong v-else>
            {{custInfo[item.key]}}
            <span style="color:#E63923" v-if="custInfo.blacklist">（被执行人）</span>
          </strong>
        </li>
      </ul>
      <div class="status-box" v-if="currentStatus">
        <i
          :class="`el-icon-${statusCfg.icon}`"
          :style="{color:statusCfg.color,'margin-right':'4px'}"
        ></i>
        <span :style="{color: statusCfg.color}">{{ tips }}</span>
        <el-button
          @click="action(btnCfg.action)"
          type="primary"
          size="mini"
          v-if="btnCfg.text || actionShow"
        >{{btnCfg.text || '添加'}}</el-button>
      </div>
    </div>
    <!-- <FinanceTableMass :option="option1" :autoMax="true"  v-if="custInfo && option1.data.length && isCustomer"/> -->
    <FinanceTableMass :option="option1" :autoMax="true"  v-if="false"/>
  </CrmCard>
</template>

<script>
import CrmCard from '@/views/crm/components/card'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { currentStatusMap as statusCfg, searchInfoArr } from '@/views/crm/data'
import CUSTOMER from '@/api/crm/customer'
import SUPPLIER from '@/api/crm/supplier'
import RECYCLE from '@/api/crm/recycle'
import { parseTime } from '@/utils'
import { mapGetters, mapState } from 'vuex'
import { countrySelectList } from '@/api/base'
export default {
  name: 'searchInfo',
  components: { CrmCard, FinanceTableMass },
  inject: ['isCustomer', 'defaultRules'],
  props: ['customerMode'],
  data() {
    return {
      option1: {},
      form: {
        customerMode: '',
        country: '',
        currentCustomer: ''
      },
      rules: {
        customerMode: this.defaultRules,
        country: this.defaultRules
      },
      currentCustomer: '',
      custInfo: null,
      loading: false,
      customerList: [],
      statusInfo: null,
      currentStatus: '',
      searchInfoArr,
      popoverShow: false,
      tips: '',
      actionShow: false,
      countryList: [],
      btnLoading: false
    }
  },
  watch: {
    'form.customerMode'(val) {
      this.$emit('update:customerMode', val)
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    statusCfg() {
      return statusCfg[this.currentStatus]
    },
    btnCfg() {
      return this.statusCfg || {}
    },
    // ['custid', 'orgid', 'baseInfo', 'searchCustomerDetail']
    ...mapState('crm', {
      searchRefreshCust: state => state.searchRefresh
    }),
    ...mapState('crm/supplier', {
      searchRefreshSp: state => state.searchRefresh
    }),
    searchRefresh() {
      return this.isCustomer ? this.searchRefreshCust : this.searchRefreshSp
    }
  },
  // activated() {
  //   let fn = () => (this.popoverShow = false)
  //   let app = document.querySelector('#app')
  //   app.addEventListener('click', fn)
  //   this.$on('hook:disactivated', () => {
  //     app.removeEventListener('click', fn)
  //   })
  // },
  created() {
    const fn = () => (this.popoverShow = false)
    const app = document.querySelector('#app')
    app.addEventListener('click', fn)
    this.$on('hook:beforeDestroy', () => {
      app.removeEventListener('click', fn)
    })
    this.option1 = this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: false,
      operationBtns:false,
      pagination:false,
      columns: [
        {
          prop: 'roleTypeInfo',
          type: 'select',
          label: '企业类别',
          propInDict: 'customerRole',
          multi: true,
          noDict: true,
        },
        {
          prop: 'bdEmployeeName',
          label: '维护人姓名',
        },
        {
          prop: 'maintainerType',
          label: '维护人类型',
          propInDict: 'custMaintainerType',
          formatter: ({ cellValue }) => {
            return cellValue === 'general'? '普通维护人': cellValue === 'potential'?'潜在维护人':'下单维护人'
          },
        },
        {
          prop: 'deptCname',
          label: '维护部门',
        },

        {
          prop: 'firstTime',
          label: '首次合作时间',
          formatter: ({ cellValue }) => {
            return cellValue?.slice(0, 10)
          },
        },
        {
          prop: 'nearlyTime',
          label: '最近合作时间',
          formatter: ({ cellValue }) => {
            return cellValue?.slice(0, 10)
          },
        },
        { prop: 'createdTime', label: '创建时间' },
        // {
        //   prop: 'status',
        //   label: '客户状态',
        //   type: 'select',
        //   selectOptions: [
        //     { label: '已维护', value: 'valid' },
        //     { label: '待认领', value: 'recycle' },
        //     { label: '黑名单', value: 'blacklist' },
        //   ],
        // },
      ]
    })
  },
  filters: {
    tipsM(tips, isCustomer) {
      return tips[isCustomer ? 'customer' : 'supplier'] || tips
    }
  },
  methods: {
    // 切换国家清空数据
    clearData(val) {
      this.custInfo = ''
      this.currentStatus = ''
      this.tips = ''
      this.option1.data = []
      if(this.countryList.length){
        let findCode = this.countryList.find(v => v.cname === val)
        let code = findCode ? findCode.value : ''
        this.form.countryCode = code
      }
    },
    // @type recylceClaim/nextStep
    action(type) {
      this[type]()
    },
    // 公海认领
    recycleClaim() {
      RECYCLE.claim({ custid: this.statusInfo.custid }).then(() => {
        this.$msgSucClose('认领成功！')
        this.$emit('nextStep', false)
      })
    },
    // 下一步
    nextStep(clear) {
      this.$refs.form.validate(valid => {
        // if (!valid) {
        //   return this.$msgErrClose('请将必填项填写完整！')
        // }
        if (clear == 'clear') {
          this.$store.commit(
            `crm/${this.isCustomer ? '' : 'supplier/'}setSearchCustomerDetail`,
            { country: this.form.country, countryCode: this.form.countryCode }
          )
        }
        this.$emit('nextStep', 1)
      })
    },
    // 搜索客户
    searchCustomer() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.clearData()
        this._searchCustomer()
      })
    },
    // 撞客查询
    collision() {
      let data = {
        name: this.form.currentCustomer || ''
      }
      // const method = this.isCustomer ? CUSTOMER : SUPPLIER
      CUSTOMER.custCollision(data).then(res => {
        if (res.code === 0) {
          this.option1.data = res.data
        }
      }).catch(()=>{})
      
    },
    async _searchCustomer() {
      this.btnLoading = true
      // console.log(this.currentCustomer)
      const { name, creditCode } = this.currentCustomer
      // name = name || this.form.currentCustomer
      if (!name) {
        this.btnLoading = false
        return this.$msgErrClose('请选择需要搜索的企业！')
      }
      let custInfo, newCustomerDetail
      if (this.customerMode != 'potential') {
        // TODO 有存在没有纳税识别号的公司
        // if (!creditCode) return this.$msgErrClose('请选择需要搜索的企业！')
        const res1 = await CUSTOMER.aiqichaDetail({
          keywords: creditCode || name
        })
        custInfo = res1.data
        if (!custInfo) {
          this.btnLoading = false
          return this.$msgErrClose('未搜索到该企业！')
        }
        if (custInfo.estiblishTime === '-') custInfo.estiblishTime = ''
        custInfo.estiblishTime = parseTime(
          custInfo.estiblishTime,
          '{y}-{m}-{d}'
        )
        const usccExpDate =
          custInfo.toTime && parseTime(custInfo.toTime, '{y}-{m}-{d}')
        custInfo.companyType = custInfo.companyOrgType
        newCustomerDetail = {
          name: custInfo.name,
          uscc: custInfo.creditCode,
          taxId: custInfo.creditCode,
          usccExpDate: usccExpDate,
          setupDate: custInfo.estiblishTime,
          registerAddr: custInfo.regLocation,
          // indexAddr: custInfo.base,
          // shortName: custInfo.alias, //中文简称不用自动带数据
          // detailAddr: custInfo.regAddr,
          entType: custInfo.companyOrgType,
          legalPerson: custInfo.legalPerson,
          regCapital: custInfo.regCapital
        }
      } else {
        custInfo = this.currentCustomer
        if (custInfo.estiblishTime === '-') custInfo.estiblishTime = ''
        custInfo.estiblishTime = custInfo.estiblishTime.slice(0, 10)
        custInfo.companyType = ''
        newCustomerDetail = {
          name: custInfo.name,
          uscc: custInfo.creditCode,
          taxId: custInfo.creditCode,
          usccExpDate: '',
          setupDate: custInfo.estiblishTime,
          // indexAddr: custInfo.base,
          legalPerson: custInfo.legalPersonName,
          regCapital: custInfo.regCapital
        }
      }
      const method = this.isCustomer ? CUSTOMER : SUPPLIER
      // 搜索企业在公司内的状态
      const res2 = await method.searchCompany({ name, uscc:creditCode })
      this.tips = ''
      this.actionShow = false
      if (res2 && res2.data) {
        // 国家country，英文名，营业执照到期，详细地址，省市区
        const resData = res2.data
        this.currentStatus = resData.currentStatus
        this.statusInfo = resData
        this.tips = resData.tips
        const { currentStatus, custClass, custMode } = resData
        if (currentStatus == 'exists') {
          this.tips = this.isCustomer ? this.tips : '该供应商已有人员跟进，请勿重复维护'
          this.actionShow = false
          // 撞客查询
          this.isCustomer && this.collision()
        }
        // if (currentStatus == 'exists' && custMode == 'potential') {
        //   if (custClass == 'domestic_cust') {
        //     this.tips = '已有业务员维护为潜在客户国内直客，不可创建'
        //     // this.actionShow = false
        //   } else if (custClass == 'foreign_cust') {
        //     this.tips = '已有业务员维护为潜在客户国外直客，不可创建'
        //   } else {
        //     if (custClass == 'domestic_peer') {
        //       this.tips = '已有业务员维护为潜在客户国内同行，可继续维护'
        //     }
        //     if (custClass == 'foreign_peer') {
        //       this.tips = '已有业务员维护为潜在客户国外同行，可继续维护'
        //     }
        //     this.actionShow = true
        //   }
        // }
      }
      if (this.statusInfo && custInfo && custInfo != '{}') {
        this.custInfo = {
          ...custInfo,
          ...newCustomerDetail,
          ...this.statusInfo.orgid,
          country: this.form.country,
          countryCode: this.form.countryCode,
          industry: ''
        }
        const statusArr = ['supplier', 'refuse', 'new', 'customer']
        if (statusArr.includes(this.currentStatus) || this.actionShow) {
          this.$store.commit(
            `crm/${this.isCustomer ? '' : 'supplier/'}setSearchCustomerDetail`,
            this.custInfo
          )
        }
      }
      this.currentCustomer = ''
      this.btnLoading = false
    },
    // 远程搜索客户 获取客户列表
    remoteMethod(keywords) {
      this.loading = true
      this.customerList = []
      // setTimeout(() => {
      //   this.loading = false
      //   this.customerList = [
      //     { id: 1, name: '阿斯蒂芬阿斯顿发送到发斯蒂芬史蒂夫' },
      //     { id: 3, name: '阿斯蒂芬阿斯顿发送到发斯蒂芬史蒂夫3' },
      //     { id: 4, name: '阿斯蒂芬阿斯顿发送到发斯蒂芬史蒂夫4' },
      //   ]
      // }, 300)
      // return
      CUSTOMER.aiqichaList({ keywords }).then(res => {
        this.loading = false
        this.customerList = res.data || []
        // .map((item) => ({ ...item, entName: item.entName.replace(/<[^>]+>/g, '') }))
      })
    },
    search() {
      this.option1.data = []
      if (!this.form.country) {
        return this.$msgErrClose('请选择国家(行政区)')
      }
      if (!this.form.currentCustomer.trim()) {
        this.popoverShow = false
        this.custInfo = ''
        this.tips = ''
        this.currentStatus = ''
        return this.$msgErrClose('请输入企业名称')
      }
      this.popoverShow = true
      if (this.form.country === '中国') {
        this.remoteMethod(this.form.currentCustomer.trim())
      } else {
        this.searchForeign()
      }

    },
    selectCompany(company) {
      this.form.currentCustomer = company.name
      this.currentCustomer = company
      this.popoverShow = false
      if (this.form.country === '中国') {
        this.searchCustomer() // 自动检测 不需要手动点击
      } else {
        this.searchForeignCustomer(company)
      }
    },
    async searchForeignCustomer(company) {
      const method = this.isCustomer ? CUSTOMER : SUPPLIER
      const custInfo = company
      // 搜索企业在公司内的状态
      const { name, uscc: creditCode } = company
      const res2 = await method.searchCompany({ name, uscc:creditCode })
      this.tips = ''
      this.actionShow = false
      if (res2 && res2.data) {
        // 国家country，英文名，营业执照到期，详细地址，省市区
        const resData = res2.data
        this.currentStatus = resData.currentStatus
        this.statusInfo = resData
        this.tips = resData.tips
        const { currentStatus, custClass, custMode } = resData
        if (currentStatus == 'exists') {
          this.tips = this.isCustomer ? this.tips : '该供应商已有人员跟进，请勿重复维护'
          this.actionShow = false
          // 撞客查询
          this.isCustomer && this.collision()
        }
        // if (currentStatus == 'exists' && custMode == 'potential') {
        //   if (custClass == 'domestic_cust') {
        //     this.tips = '已有业务员维护为潜在客户国内直客，不可创建'
        //     // this.actionShow = false
        //   } else if (custClass == 'foreign_cust') {
        //     this.tips = '已有业务员维护为潜在客户国外直客，不可创建'
        //   } else {
        //     if (custClass == 'domestic_peer') {
        //       this.tips = '已有业务员维护为潜在客户国内同行，可继续维护'
        //     }
        //     if (custClass == 'foreign_peer') {
        //       this.tips = '已有业务员维护为潜在客户国外同行，可继续维护'
        //     }
        //     // if (custClass == 'foreign_cust') this.tips = '已有业务员维护为潜在客户国外直客，可继续维护'
        //     this.actionShow = true
        //   }
        // }
      }
      custInfo.orgid = ''
      if (this.statusInfo && custInfo && custInfo != '{}') {
        this.custInfo = {
          ...custInfo,
          // ...newCustomerDetail,
          ...this.statusInfo.orgid,
          country: this.form.country,
          countryCode: this.form.countryCode,
          industry: ''
        }
        const statusArr = ['supplier', 'refuse', 'new', 'customer']
        if (statusArr.includes(this.currentStatus) || this.actionShow) {
          this.$store.commit(
            `crm/${this.isCustomer ? '' : 'supplier/'}setSearchCustomerDetail`,
            this.custInfo
          )
        }
      }
      this.currentCustomer = ''
    },
    // 海外客户查询
    searchForeign() {
      this.loading = true
      this.customerList = []
      let method = this.isCustomer ? CUSTOMER : SUPPLIER
      const { country, currentCustomer: name } = this.form
      const data = {
        name,
        country
      }
      method
        .match(data)
        .then(res => {
          if (!res.data?.length) {
            // 客户找不到就去查供应商相互查，没办法后台实在太坑了
            method = method === CUSTOMER ? SUPPLIER : CUSTOMER
            method
              .searchAbroad(data)
              .then(res => {
                if (!res.data?.length) {
                  this.popoverShow = false
                  this.custInfo = {
                    name,
                    country,
                    countryCode: this.form.countryCode
                  }
                  console.log('custInfo',this.custInfo)
                  this.$store.commit(
                    `crm/${
                      this.isCustomer ? '' : 'supplier/'
                    }setSearchCustomerDetail`,
                    this.custInfo
                  )
                  this.currentStatus = 'new'
                  this.tips = this.isCustomer
                    ? '该客户暂无销售跟进，可以维护'
                    : '该供应商暂无人员跟进，可以维护'
                } else {
                  this.customerList = res.data || []
                  this.popoverShow = true
                  this.currentStatus = ''
                  this.custInfo = ''
                  this.tips = ''
                }
              })
              .catch(() => {})
              .finally(() => {
                this.loading = false
              })
          } else {
            let once = res.data.find(item=>item.isTheSame == 'yes')
            if(!once){
              this.popoverShow = false
                  this.custInfo = {
                    name,
                    country,
                    countryCode: this.form.countryCode
                  }
                  console.log('custInfo',this.custInfo)
                  this.$store.commit(
                    `crm/${
                      this.isCustomer ? '' : 'supplier/'
                    }setSearchCustomerDetail`,
                    this.custInfo
                  )
                  this.currentStatus = 'new'
                  this.tips = this.isCustomer
                    ? '该客户暂无销售跟进，可以维护'
                    : '该供应商暂无人员跟进，可以维护'
            }else{
              this.customerList = res.data || []
              this.popoverShow = true
              this.currentStatus = ''
              this.custInfo = ''
              this.tips = ''
              this.loading = false
            }
          }
        })
        .catch(() => {})


    },
    // 搜索国家
    getCountryList(countryCode) {
      countrySelectList({ countryCode, state: 'valid' })
        .then(res => {
          this.countryList = (res.data || []).map(item => {
            return {
              cname: item.cname,
              ename: item.ename,
              value: item.countryCode
            }
          })
        })
        .catch(() => {})
    }
  },
  activated() {
    if (this.searchRefresh) {
      if (this.isCustomer) {
        this.$store.state.crm.searchRefresh = false
      } else {
        this.$store.state.crm.supplier.searchRefresh = false
      }
      // 清空数据
      this.$refs.form.resetFields()
      this.custInfo = ''
      this.currentStatus = ''
      this.tips = ''
    }
  }
}
</script>
<style lang="scss">
.search-popover {
  padding: 4px 0px;
  font-size: 12px;
  width: 280px !important;
  ul {
    max-height: 300px;
    overflow-y: scroll;
    &::-webkit-scrollbar-track-piece {
      background: #fafafa;
    }
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: #ddd;
      border-radius: 4px;
    }
  }
  .no-data {
    margin: 4px 0;
    text-align: center;
    color: #666;
  }
  .has-data {
    padding: 0 8px;
    line-height: 26px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .has-data:hover {
    // color: #1890ff;
    background-color: #f5f7fa;
  }
}
</style>
<style lang="scss" scoped>
.customer-info .base-info-list .full-li {
  width: 100%;
}
.search-list ::v-deep {
  .el-input {
    width: 260px;
  }
  .el-input-group__append,
  .el-input-group__prepend {
    padding: 0 5px 0 18px;
  }
  .el-input-group--append .el-input__inner {
    border-radius: 4px;
  }
  .el-input-group__append {
    background: transparent;
    border: none;
    position: absolute;
    right: 0;
    padding: 0;
    width: 0;
  }
  // ::v-deep input {
  //   border-top-right-radius: 0;
  //   border-bottom-right-radius: 0;
  // }
  // .el-button {
  //   border-top-left-radius: 0;
  //   border-bottom-left-radius: 0;
  //   margin-left: -1px;
  // }
}
.search-customer {
  .el-select-dropdown__item em {
    color: #3e80f5;
    font-style: normal;
  }
}
.status-box {
  margin-top: 16px;
  img {
    width: 14px;
    height: 14px;
    margin-right: 6px;
    vertical-align: middle;
  }
  & > span {
    margin-right: 30px;
  }
}
.diy__btn {
  background: transparent !important;
}
.diy__btn:hover > span .diy__btn:hover {
  color: #1890ff !important;
}
</style>

