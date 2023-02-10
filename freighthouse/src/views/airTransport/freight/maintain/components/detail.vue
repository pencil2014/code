<template>
  <div class="edit-container air-mainRoute-container" v-loading="loading">
    <EditFunc ref="editFunc" :saveDisabled="saveDisabled" :createItem="createItem" :publishStatusOptions="publishStatusOptions" @callback="editFuncCallback" />
    <div class="edit-row">
      <div class="row-tit-mini">
        <span class="tit">运价详情</span>
      </div>
      <el-form ref="mainRouteSubmit" :model="createItem" :rules="rules" class="mainRoute-cont-form" :show-message="false">
        <MainRouteInfo :createItem="createItem" ref="mainRouteInfo" />
        <PriceTable :surchargeList="createItem.chargePrices" :createItem="createItem" ref="priceTable" />
        <SurchargeTable :surchargeList="createItem.surcharges" :createItem="createItem" ref="surchargeTable" />
        <div class="edit-row box-row" style="margin-top: 10px">
          <div class="row-tit">
            <span class="tit">说明信息</span>
            <div class="row-tit-operate">
            </div>
          </div>
          <div class="desc-info-cont">
            <el-row>
              <el-col :span="8">
                <el-form-item class="oneEighth" label="附加费说明" prop="surchargeDesc" :show-message="false">
                  <el-input type="textarea" clearable size="mini" :disabled="disabledState" placeholder="请输入" v-model="createItem.surchargeDesc" maxlength="512"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="oneEighth" label="特别提醒" prop="attention" :show-message="false">
                  <el-input type="textarea" clearable size="mini" :disabled="disabledState" placeholder="请输入" v-model="createItem.attention" maxlength="512"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="oneEighth" label="收货指引" prop="guidanceDesc" :show-message="false">
                  <el-input type="textarea" clearable size="mini" :disabled="disabledState" placeholder="请输入" v-model="createItem.guidanceDesc" maxlength="512"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="oneEighth" label="其他说明" prop="internalDesc" :show-message="false">
                  <el-input type="textarea" clearable size="mini" :disabled="disabledState" placeholder="请输入" v-model="createItem.internalDesc" maxlength="512"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-form>
    </div>
  </div>

</template>
<script>
import { mapGetters, mapState } from 'vuex'
import {
  airChargeCopy,
  airChargePublish,
  airChargeInvalid,
  airChargeSave,
  airChargeDetail,
  mainRouteEdit
} from '@/api/charge'
import {
  portSystemLineInfo
} from '@/api/base'
import EditFunc from './editFunc'
import MainRouteInfo from './mainRouteInfo'
import SurchargeTable from './surchargeTable'
import PriceTable from './priceTable'

const defaultCreateQuery = {
  polPortCode: '', //起运港CODE
  polPortName: '', //起运港名称
  potPortCode:'', // 中转港
  potPortName:'',
  podPortCode: '', //目的港编码
  podPortName: '', //目的地名称
  polCountryCode: '', //国家
  polCountryCname: '', //
  polCountryEname: '', //

  podCountryCode: '', //国家
  podCountryCname: '', //
  podCountryEname: '', //
  airLine: '',
  packageInfo: '', //包装
  flightRate: '', //航班频率
  beginDate: '', // 生效日-开始
  endDate: '', // 生效日-结束
  prescription: '', //时效
  recommend: '', // 是否推荐，N-否,Y-是
  status: '', // 状态，air_charge_status
  publishTime: '', // 发布时间
  createdTime: '',
  updatedTime: '',
  chargePrices: [],
  surcharges: [],
  maintainerName: '',
  maintainerId: '',
  surchargeDesc: '',
  attention: '',
  guidanceDesc: '',
  internalDesc: ''
}
export default {
  data() {
    return {
      loading: false,
      id: null,
      saveDisabled: false,
      suppShowState: false,
      oQuery: this.$route.query,
      defaultStyle: {
        width: '100%'
      },
      currencyList: [],
      // polCodeBoxData:[],
      state: 'valid',
      // portDestinationAttribute:'',
      // 提交参数
      createItem: Object.assign({}, defaultCreateQuery),
      rules: {
        polPortCode: [{ required: true, message: '请输入', trigger: 'change' }],
        podPortCode: [{ required: true, message: '请输入', trigger: 'change' }],
        airLine: [{ required: true, message: '请输入', trigger: 'change' }],
        beginDate: [{ required: true, message: '请输入', trigger: 'change' }],

        chargeEname: [{ required: true, message: '请输入', trigger: 'change' }],
        chargeName: [{ required: true, message: '请输入', trigger: 'change' }],
        payMode: [{ required: true, message: '请输入', trigger: 'change' }],
        currency: [{ required: true, message: '请输入', trigger: 'change' }],
        rateUnit: [{ required: true, message: '请输入', trigger: 'change' }],

        priceMin: [{ required: true, message: '请输入', trigger: 'change' }],
        priceKg45: [{ required: true, message: '请输入', trigger: 'change' }],
        priceKg100: [{ required: true, message: '请输入', trigger: 'change' }],
        priceKg300: [{ required: true, message: '请输入', trigger: 'change' }],
        priceKg500: [{ required: true, message: '请输入', trigger: 'change' }],
        priceKg1000: [{ required: true, message: '请输入', trigger: 'change' }],
        priceKg2000: [{ required: true, message: '请输入', trigger: 'change' }]
      },
      // 默认成本价
      defaultPrice: {
        currency: 'USD',
        priceGp20: '',
        priceGp40: '',
        priceHq40: '',
        priceHq45: '',
        priceNor20: '',
        priceNor40: ''
      },
      // 附加费弹窗
      surchargePopShow: false,
      cTimestamp: 0
    }
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.init()
  },
  activated() {
    this.init()
    // let timestamp = new Date().getTime()
    // if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
    //   this.init()
    // }
  },
  mounted() {
    // this.getInfo()
  },
  computed: {
    ...mapGetters(['userId', 'name', 'dictMap']),
    ...mapState({
      userInfo: (state) => state.user.userInfo
    }),
    publishStatusOptions() {
      let publishStatusOptions = {}
      let { airChargeStatus } = this.dictMap
      airChargeStatus.forEach((item) => {
        publishStatusOptions[item.value] = item.label
      })
      return publishStatusOptions
    },
    disabledState() {
      if (!this.createItem.status || this.createItem.status === 'no_publish') {
        return false
      }
      return true
    }
  },
  watch: {
    $route: {
      handler(newVal, oldVal) {
        this.init()
      },
      deep: true
    }
  },
  components: {
    EditFunc,
    MainRouteInfo,
    SurchargeTable,
    PriceTable
  },
  methods: {
    // 复制
    handleCopy() {
      airChargeCopy(this.$route.query.id).then((res) => {
        this.$message.success('复制成功')
        this.$router.push({
          name: 'AirFreightMaintenanceDetail',
          query: {
            id: res.data
          }
        })
      })
    },
    init() {
      //初始化基本信息
      this.createItem = Object.assign({}, defaultCreateQuery)
      this.createItem.routeId = this.$route.query.id
      this.$nextTick(() => {
        this.$refs.mainRouteSubmit.clearValidate()
      })
      if (!this.createItem.maintainerId) {
        this.createItem.maintainerId = this.userInfo.sysUserId
        this.createItem.maintainerName = this.userInfo.userName
      }
      this.getInfo()
    },

    // 详情
    getInfo() {
      if (!this.$route.query.id) {
        return
      }
      this.loading = true
      airChargeDetail(this.$route.query.id)
        .then((response) => {
          let infoData = response.data
          for (let i in defaultCreateQuery) {
            this.createItem[i] = infoData[i]
          }
          this.getInfoDetail(infoData)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getInfoDetail(infoData) {
      this.createItem.beginDate = [infoData.beginDate, infoData.endDate]
    },

    // 组装提交的数据
    getValues() {
      delete this.createItem.createdTime
      delete this.createItem.createdName
      delete this.createItem.updatedName
      delete this.createItem.updatedTime
      //处理海运费 附加费为空数据
      this.createItem.surcharges = this.$refs.surchargeTable.tableData.list
      this.createItem.chargePrices = this.$refs.priceTable.tableData.list
      for (let key in this.createItem) {
        this.createItem[key] = this.createItem[key]
          ? this.createItem[key]
          : null
      }

      let results = Object.assign({}, this.createItem)
      let { beginDate } = this.createItem
      results.beginDate = beginDate ? beginDate[0] : ''
      results.endDate = beginDate ? beginDate[1] : ''
      if (this.$route.query.id) {
        results.chargeId = this.$route.query.id
      }

      if (results.maintainerId) {
        this.createItem.maintainerId = this.userInfo.sysUserId
        this.createItem.maintainerName = this.userInfo.userName
      }
      return results
    },

    editFuncCallback(type) {
      console.log('type', type)
      let fn = this['handle' + type]
      if (typeof fn !== 'function') return
      fn()
    },

    // 保存-新增，编辑
    handleSave() {
      // let { action } = this.$route.query
      return this.handleAdd()
    },
    validateAllForm() {
      // 校验所有表单
      return new Promise((resolve, reject) => {
        let formList = [
          this.$refs.surchargeTable.validateForm(),
          this.$refs.priceTable.validateForm(),
          this.$refs.mainRouteSubmit.validate()
        ]
        Promise.all(formList)
          .then(() => {
            resolve()
          })
          .catch((err) => {
            console.log(err)
            reject()
          })
      })
    },
    handleAdd() {
      this.saveDisabled = true
      let data = this.getValues()
      delete data.publishStatus
      this.validateAllForm()
        .then(() => {
          airChargeSave(data)
            .then((response) => {
              this.$message({
                type: 'success',
                duration: 1000,
                message: '保存成功',
                onClose: () => {
                  this.saveDisabled = false
                  this.id = response.data
                  this.$router.push({
                    name: 'AirFreightMaintenanceDetail',
                    query: {
                      id: this.id
                    }
                  })
                }
              })
            })
            .catch((err) => {
              setTimeout(() => {
                this.saveDisabled = false
              }, 2000)
            })
        })
        .catch(() => {
          this.saveDisabled = false
        })
    },

    handleEdit() {
      this.saveDisabled = true
      let data = this.getValues()
      delete data.publishStatus
      this.validateAllForm()
        .then(() => {
          mainRouteEdit(data)
            .then((response) => {
              this.$message({
                type: 'success',
                duration: 1000,
                message: '保存成功',
                onClose: () => {
                  this.saveDisabled = false
                }
              })
            })
            .catch((err) => {
              setTimeout(() => {
                this.saveDisabled = false
              }, 2000)
            })
        })
        .catch(() => {
          this.saveDisabled = false
        })
    },

    // 发布
    handlePublish() {
      this.saveDisabled = true
      let data = this.getValues()
      delete data.publishStatus
      this.validateAllForm()
        .then(() => {
          airChargeSave(data)
            .then(() => {
              this.saveDisabled = false
              if (
                !this.createItem.chargePrices ||
                this.createItem.chargePrices.length === 0
              ) {
                return this.$message.warning(
                  '运价发布前需要至少录入一个合格的价格信息'
                )
              }
              if (this.createItem.chargePrices.length > 0) {
                for (let i = 0; i < this.createItem.chargePrices.length; i++) {
                  if (
                    !this.createItem.chargePrices[i].priceMin &&
                    !this.createItem.chargePrices[i].priceKg45 &&
                    !this.createItem.chargePrices[i].priceKg100 &&
                    !this.createItem.chargePrices[i].priceKg300 &&
                    !this.createItem.chargePrices[i].priceKg500 &&
                    !this.createItem.chargePrices[i].priceKg1000 &&
                    !this.createItem.chargePrices[i].priceKg2000
                  ) {
                    return this.$message.warning(
                      '运价发布前每条价格需要至少录入一个价格'
                    )
                  }
                }
              }
              this.saveDisabled = true
              let chargeIds = [this.$route.query.id]
              airChargePublish(chargeIds)
                .then(() => {
                  this.$message({
                    type: 'success',
                    message: '发布成功',
                    duration: 1000
                  })
                  this.saveDisabled = false
                  this.init()
                })
                .catch((err) => {
                  setTimeout(() => {
                    this.saveDisabled = false
                  }, 2000)
                })
            })
            .catch((err) => {
              setTimeout(() => {
                this.saveDisabled = false
              }, 2000)
            })
        })
        .catch(() => {
          this.saveDisabled = false
        })
    },

    // 失效
    handleInvalid() {
      this.saveDisabled = true
      let chargeIds = [this.$route.query.id]
      airChargeInvalid(chargeIds)
        .then((response) => {
          this.$message({
            type: 'success',
            message: '失效成功',
            duration: 1000
          })
          this.saveDisabled = false
          this.init()
        })
        .catch((err) => {
          setTimeout(() => {
            this.saveDisabled = false
          }, 2000)
        })
    },

    // 取消
    handleCancel() {
      let views = this.$store.state.tagsView.visitedViews.filter(
        (item) => item.name === this.$route.name
      )
      this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
      this.$router.push({
        name: 'AirFreightMaintenance'
      })
    },
    initSystemLine(key) {
      portSystemLineInfo(key).then((response) => {
        let systemLineList = response.data
        if (systemLineList.length > 0) {
          let systemLine = systemLineList[0]
          this.baseInfoQuery.forEach((item, index) => {
            if (item.key === 'sysLineCode') {
              Object.assign(
                item,
                {
                  value: systemLine.cname
                },
                {}
              )
              Object.assign(this.createItem, {
                sysLineCode: systemLine.sysLineCode
              })
              return
            }
          })
        }
      })
    }
  }
}
</script>
<style lang="scss">
@import '../../less/detail.scss';
.air-mainRoute-container .edit-row {
  margin-top: 8px;
  margin-bottom: 0;
}
.air-mainRoute-container .edit-row.box-row {
  margin: 10px 0;
  border: 1px solid #e9e9e9;
  border-radius: 4px;
}
.air-mainRoute-container .edit-row.box-row .row-tit {
  padding-left: 10px;
  padding-right: 10px;
  height: 32px;
  line-height: 32px;
  background: #f8f9fd;
}
.air-mainRoute-container .edit-row.box-row .row-tit.invalid {
  background-color: rgba(230, 57, 35, 0.1);
}
.air-mainRoute-container .edit-row.box-row .row-tit .tit {
  line-height: 32px;
  font-size: 14px;
}
.air-mainRoute-container .edit-row.box-row .row-form {
  padding: 10px;
  .el-table {
    .el-input--mini .el-input__inner {
      line-height: 20px;
      height: 20px;
    }
    .el-input--mini .el-input__icon {
      line-height: 20px;
    }
  }
}
.air-mainRoute-container .edit-row.box-row .input-container {
  margin-top: 0;
}
.air-mainRoute-container .edit-row.box-row .input-container span.filter-txt {
  color: #606266;
}
.air-mainRoute-container .edit-row.box-row .input-container .el-input__inner {
  line-height: 20px;
  height: 20px;
}
.air-mainRoute-container .edit-row.box-row .row-tit-operate .el-button--mini {
  padding: 2px 5px;
}
.air-mainRoute-container .row-tit-mini {
  font-size: 14px;
  line-height: 32px;
  height: 32px;
  border-bottom: 1px solid #e9e9e9;
  padding-left: 10px;
}
.air-mainRoute-container .row-tit-mini .tit {
  line-height: 32px;
  font-size: 14px;
  color: #222;
  font-weight: 600;
}
.mainRoute-cont-form {
  padding: 0 0 10px 0;
  .edit-row.box-row {
    margin: 0 10px;
    &.surcharge-table {
      margin-top: 10px;
    }
    .desc-info-cont {
      margin: 10px 0 0 10px;
    }
  }
}
.mainRoute-cont-form .el-form-item {
  margin-bottom: 4px;
  margin-right: 10px;
  // height: 20px;
}
.mainRoute-cont-form .el-form-item {
  .el-form-item__label {
    padding: 0 6px 0 0;
    line-height: 20px;
  }
  .el-form-item__content {
    line-height: 20px;
  }
  .el-input--mini {
    .el-input__inner {
      line-height: 20px;
      height: 20px;
    }
    .el-input__icon {
      line-height: 20px;
    }
  }
  .el-range-editor--mini {
    &.el-input__inner {
      height: 20px;
    }
    .el-range-separator {
      line-height: 12px;
    }
    .el-range__icon {
      line-height: 12px;
      font-size: 12px;
    }
  }
  .el-date-editor .el-input__prefix {
    line-height: 20px;
  }
}
.flex-item {
  position: relative;
}
.item-floate-box {
  position: absolute;
  width: 90%;
  background-color: #dcdfe6;
  padding: 5px;
  border: 1px solid #dcdfe6;
  margin-top: 53px;
  z-index: 999;
}

.item-floate-box-show {
  position: absolute;
  width: 90%;
  height: 28px;
  margin-top: 24px;
  z-index: 999;
}
.air-mainRoute-container {
  .stop-box {
    height: 30px;
    background-color: rgb(255, 244, 242);
    color: rgb(205, 65, 48);
    display: flex;
    align-items: center;
    padding: 0 16px;
    .icon {
      width: 16px;
      height: 16px;
      line-height: 16px;
      text-align: center;
      border-radius: 2px;
      background-color: rgb(205, 65, 48);
      color: #fff;
      margin-right: 10px;
    }
  }
}
</style>
