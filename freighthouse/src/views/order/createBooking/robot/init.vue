<template>
  <div class="packing-cnt">
    <div class="cnt-box">
      <div class="sub-title">General Details</div>
      <div class="general items">
        <General
          v-if="dictAll.dictList.length && !fieldConfigRequesting"
          :replaceChinese="replaceChinese"
          :generalOption.sync="generalOption"
          :fieldConfigObj="fieldConfigObj"
          :fieldConfigList="fieldConfigList"
          @changeCarrierCb="changeCarrierCb"
          ref="generalForm"
        />
      </div>
      <div class="sub-title">Transport</div>
      <div class="transport items">
        <Transport
          v-if="!fieldConfigRequesting"
          :transportOption.sync="transportOption"
          ref="transportForm"
          :carrierScac="generalOption.carrierScac"
          :fieldConfigObj="fieldConfigObj"
          :fieldConfigList="fieldConfigList"
        />
      </div>
      <div class="sub-title">Particulars</div>
      <div class="particulars items">
        <Particulars
          v-if="dictAll.dictList.length && !fieldConfigRequesting"
          :particularsOption.sync="particularsOption"
          :particularsOption2.sync="particularsOption2"
          :totalsOption.sync="totalsOption"
          ref="particularsForm"
          :replaceChinese="replaceChinese"
          :fieldConfigObj="fieldConfigObj"
          :fieldConfigList="fieldConfigList"
        />
      </div>
      <!-- <div class="sub-title">Control Totals</div>
      <div class="control items">
        <Totals 
           v-if="!fieldConfigRequesting" 
           :totalsOption.sync="totalsOption"
           :fieldConfigObj="fieldConfigObj"
           ref="totalsForm" 
         />
      </div> -->

      <div class="sub-title">Freight Charges</div>
      <div class="control items">
        <Charges 
          v-if="dictAll.dictList.length &&!fieldConfigRequesting"
          :chargesOption.sync="chargesOption" 
          ref="chargesForm" 
          :fieldConfigObj="fieldConfigObj"
          :fieldConfigList="fieldConfigList"
        />
      </div>
      <div class="sub-title">
        B/L Print Instructions (Provided to the Carrier, not printed on Bill of
        Lading)
      </div>
      <div class="bl items">
        <Bl
           v-if="dictAll.dictList.length && !fieldConfigRequesting"
           :blOption.sync="blOption" 
           ref="blForm" 
           :replaceChinese="replaceChinese" 
           :fieldConfigObj="fieldConfigObj"
           :fieldConfigList="fieldConfigList"/>
      </div>
      <div class="sub-title">Notification Emails</div>
      <div class="notification items">
        <Notification
          v-if="!fieldConfigRequesting"
          :notificationOption.sync="notificationOption"
          ref="notificationForm"
          :fieldConfigObj="fieldConfigObj"
          :fieldConfigList="fieldConfigList"
        />
      </div>
      <div class="submit">
        <el-button
          v-if="showEditDraftBtn"
          @click="submitOriginalFn('draft')"
          icon="el-icon-edit"
          type="warning"
          :loading="isLoading"
        >
          Save Draft
        </el-button>
        <el-button type="default" @click="showPreview"> Preview </el-button>
        <el-button
          v-if="showEditBtn"
          @click="submitOriginal(false)"
          icon="el-icon-s-claim"
          type="primary"
          :loading="isLoading"
        >
          Submit
        </el-button>
        <el-button
          v-if="showStartBtn"
          @click="doSiTask('start')"
          type="primary"
          :loading="isLoading"
        >
          Start
        </el-button>
        <el-button
          v-if="showCancelBtn"
          @click="doSiTask('cancel')"
          type="primary"
          :loading="isLoading"
        >
          Cancel
        </el-button>
      </div>
    </div>
    <Preview
      :option="previewOption"
      v-if="previewOption.show"
      @close="closePreView"
    />
  </div>
</template>

<script>
import General from './init/general'
import Transport from './init/transport'
import Particulars from './init/particulars'
import Totals from './init/totals'
import Charges from './init/charges'
import Bl from './init/bl'
import Notification from './init/notification'
import Preview from './init/preview'
import { shipId, siOriginal, dictAll, siDetail } from '@/api/order/createBooking'
import { getFieldConfig, getSiInfo, saveSiInfoWhl, updateSiInfoWhl, startSiTask, cancelSiTask, checkAuthInfo } from '@/api/order/robotSi'
import { blDetail } from '@/api/order/bl'
export default {
  provide() {
    return {
      dictAll: this.dictAll,
      carrierSource: this.carrierSource,
      shipCarrierCode: this.shipCarrierCode,
    }
  },
  props: {
    carrierSource: {
      type: String,
      default: 'inttra',
    },
    resData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    shipCarrierCode: {
      type: String,
      default: 'WHL',
    },
  },
  components: {
    General,
    Transport,
    Particulars,
    Totals,
    Bl,
    Notification,
    Charges,
    Preview,
  },
  data() {
    return {
      queryObj: {},
      fieldConfigObj: {},
      fieldConfigList: [],
      shipId: '',
      oid: '',
      siNo: '',
      copyCount: '',
      generalOption: {
        bookingNos: '',
        carrierScac: '',
        carrierName: '',
        contractNo: '',
        blNo: '',
        shipper: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          companyId: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          iecCode: '',
          panNo: '',
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        forwarder: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          companyId: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          iecCode: '',
          panNo: '',
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        consignee: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          iecCode: '',
          panNo: '',
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        notifyParty: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          iecCode: '',
          panNo: '',
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        notifyParty2: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          iecCode: '',
          panNo: '',
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        notifyParty3: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          iecCode: '',
          panNo: '',
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
      },
      transportOption: {
        transport: '',
        placeOfDelivery: {
          locationCode: '',
          locationNmae: '',
          country: '',
          countryCode: '',
          printName: '',
        },
        placeOfReceipt: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
          printName: '',
        },
        pol: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
          printName: '',
        },
        pod: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
          printName: '',
        },
        transportDetail: {
          vessel: '',
          voyage: '',
        },
      },
      particularsOption: [{
        containers: [
          {
            containerType: '',
            quantity: undefined,
            packageType: '',
            packageTypeCode: '',
            volume: undefined,
            weight: undefined,
            sn: '',
            cn: '',
            cargos: [
              {
                hsCode: '',
                description: '',
                marks: '',
                quantity: undefined,
                volume: undefined,
                weight: undefined,
              },
            ],
          },
        ],
      }],
      particularsOption2: {
        cargoDescription: '',
        marks: '',
      },
      totalsOption: {
        containers: '1',
        packages: '0',
        weight: '0.000',
        volume: '0.0000',
      },
      chargesOption: {
        chargeTerm: '',
      },
      blOption: {
        blType: '',
        remarks: '',
      },
      notificationOption: {
        notifyEmails: [{ value: this.$store.state.user.userInfo.email }],
        notifyName: 'Longsail', // this.$store.state.user.userInfo.userName
        // partnerNotifyEmails: ''
      },
      isLoading: false,
      previewOption: {
        show: false,
        data: {},
      },
      dictAll: {
        dictList: [],
      },
      fieldConfigRequesting: false,
      execStatus: '',

    }
  },
  watch: {
    particularsOption: {
      handler(val) {
        const containers = val.reduce((pre, cur) => {
          return pre + (cur.containers.length || 0)
        }, 0)
        const packages = val.reduce((pre, cur) => {
          return (
            pre +
            (cur.containers.reduce((x, y) => {
              return x + Number(y.quantity)
            }, 0) || 0)
          )
        }, 0)
        const weight = val
          .reduce((pre, cur) => {
            return (
              pre +
              (cur.containers.reduce((x, y) => {
                return x + Number(y.weight)
              }, 0) || 0)
            )
          }, 0)
          .toFixed(3)
        const volume = val
          .reduce((pre, cur) => {
            return (
              pre +
              (cur.containers.reduce((x, y) => {
                return x + Number(y.volume)
              }, 0) || 0)
            )
          }, 0)
          .toFixed(3)
        this.totalsOption = Object.assign(this.totalsOption, {
          containers,
          packages,
          weight,
          volume,
        })
      },
      deep: true,
    },
  },
  created() {
    this.queryObj = this.$route.query || {}
    this.getDictAll()
    this.getFieldConfigData()
    this.getSiInfoData()
  },
  methods: {
    getFieldConfigData() {
      this.fieldConfigRequesting = true
      getFieldConfig({
        shipCarrierCode: this.shipCarrierCode
      })
      .then(res => {
        this.fieldConfigList = res.data || []
        this.fieldConfigList.forEach(item => {
           this.fieldConfigObj[item.fieldName] = []
           if (item.nullAble === 'N') {
             this.fieldConfigObj[item.fieldName].push({
              required: true,
              message: `${item.comment}不能为空`,
              trigger: ['blur', 'change']
             })
           }
           if (item.regular) {
            this.fieldConfigObj[item.fieldName].push({
              validator: (rule, value, callback) => {
                if(new RegExp(item.regular).test(value)) {
                  callback()
                } else {
                  callback(new Error(`${item.comment}格式不对`));
                }
              }, 
              trigger: 'blur'
            })
           }
        })
        console.log('this.fieldConfigObj', this.fieldConfigObj)
        this.fieldConfigRequesting = false
      })
    },
    getSiInfoDataReload() {
      getSiInfo({
        blId: this.$route.query.siOid,
        oid: this.$route.query.oid,
      }).then(res => {
        if (res.data && res.data.content) {
          this.getSiInfoData(res.data)
        }
      })
    },
    getSiInfoData(resData) {
      resData = resData || this.resData
      if(resData.oid) {
        this.oid = resData.oid
        this.execStatus = resData.execStatus
        let content = JSON.parse(resData.content)
        let {
          blType,
          remarks,
          bookingNos,
          carrierScac,
          carrierName,
          contractNo,
          blNo,
          shipper,
          forwarder,
          consignee,
          notifyParty,
          notifyParty2,
          notifyParty3,
          transport,
          placeOfDelivery,
          placeOfReceipt,
          etd,
          eta,
          pol,
          pod,
          transportDetail,
          containers,
          cargoDescription,
          marks,
          controlTotal,
          totalContainerDescription,
          commodityForDeclaration,
          chargeTerm,
          notifyName,
          notifyEmails
        } = content
        console.log('请求content数据', content)
        this.blOption = Object.assign(this.blOption,{
          blType,
          remarks
        })
        this.generalOption = Object.assign(this.generalOption,{
          bookingNos:bookingNos.join(','),
          carrierScac: this.shipCarrierCode,
          carrierName: this.shipCarrierCode,
          contractNo,
          blNo
        })
        shipper && Object.assign(this.generalOption,{shipper})
        forwarder && Object.assign(this.generalOption,{forwarder})
        consignee && Object.assign(this.generalOption,{consignee})
        notifyParty && Object.assign(this.generalOption,{notifyParty})
        notifyParty2 && Object.assign(this.generalOption,{notifyParty2})
        notifyParty3 && Object.assign(this.generalOption,{notifyParty3})
        this.transportOption = Object.assign(this.transportOption,{
            transport,
            placeOfDelivery: {
              locationCode: {
                cityUnCode: placeOfDelivery.locationCode,
                cityName: placeOfDelivery.locationName,
                countryName: placeOfDelivery.country,
                countryCode: placeOfDelivery.countryCode
              },
              printName:placeOfDelivery.printName
            },
            placeOfReceipt: {
              locationCode: {
                cityUnCode: placeOfReceipt.locationCode,
                cityName: placeOfReceipt.locationName,
                countryName: placeOfReceipt.country,
                countryCode: placeOfReceipt.countryCode
              },
              printName:placeOfReceipt.printName
            },
            etd,
            eta,
            pol: {
              locationCode: {
                cityUnCode: pol.locationCode,
                cityName: pol.locationName,
                countryName: pol.country,
                countryCode: pol.countryCode
              },
              printName:pol.printName
            },
            pod: {
              locationCode: {
                cityUnCode: pod.locationCode,
                cityName: pod.locationName,
                countryName: pod.country,
                countryCode: pod.countryCode
              },
              printName:pod.printName
            },
            transportDetail
          })
        if (containers) {
            this.particularsOption = [{containers}].map(item => {
              let { containers } = item
              containers.forEach(ele => {
                if (!ele.cargos) {
                  ele.cargos = [{
                    hsCode: '',
                    description: '',
                    marks: '',
                    quantity: undefined,
                    volume: undefined,
                    weight: undefined,
                  }]
                }
              })
              return {
                ...item
              }
            })
          }
        this.particularsOption2 = Object.assign(this.particularsOption2, {
          cargoDescription,
          marks,
        })
        this.totalsOption = Object.assign(this.totalsOption,controlTotal) 
        this.chargesOption = Object.assign(this.chargesOption,{
          chargeTerm,
        })
        this.notificationOption = Object.assign(this.notificationOption, {
          notifyName,
          notifyEmails: notifyEmails.split(',').map(item => {
            return {'value': item}
          })
        })
        setTimeout(() => {
          this.$refs.transportForm.initData(true) // 初始化数据
          this.$refs.particularsForm.initData() // 初始化数据
          this.$refs.generalForm.initData() // 初始化数据
        }, 2000)
      } else {
        this.getBlDetail()
      }
    },
    // 重新加载
    reload () {
      this.getFieldConfigData()
      this.getSiInfoDataReload()
    },
    changeCarrierCb(shipCarrierCode) {
       this.$emit('changeCarrierCb', shipCarrierCode)
    },
    // 关闭预览
    closePreView() {
      this.previewOption.show = false
    },
    // 预览
    showPreview() {
      this.previewOption.data = this.$data
      this.previewOption.show = true
    },
    // 中英文标点符号替换
    replaceChinese(str = '') {
      if (!str) {
        return ''
      }
      var ChinesePunction = [
        // '！',
        // '“',
        // '”',
        // '；',
        // '《',
        // '》',
        // '。',
        // '、',
        // '，',
        // '【',
        // '】',
        // '（',
        // '）',
        // '？',
        // '：',
        '\u00A0', // 不间断空格
      ]
      var EnglishPunction = [
        // '!',
        // '"',
        // '"',
        // ';',
        // '<',
        // '>',
        // '.',
        // ',',
        // ',',
        // '[',
        // ']',
        // '(',
        // ')',
        // '?',
        // ':',
        ' ',
      ]
      ChinesePunction.forEach((ele, index) => {
        const reg = new RegExp(ele, 'g')
        str = str.replace(reg, EnglishPunction[index])
      })
      return str.replaceAll('\t', ' ')
    },
    // 获取提单详情
    getBlDetail() {
      if (!this.$route.query.blId) {
         this.generalOption = Object.assign(this.generalOption,{
          bookingNos: '',
          carrierScac: this.shipCarrierCode,
          carrierName: this.shipCarrierCode,
          contractNo: '',
          blNo: ''
        })
        return
      }
      const data = {
        orderNo: this.$route.query.orderNo,
        blId: this.$route.query.blId,
      }
      blDetail(data)
        .then((res) => {
          if (res.code === 0) {
            const {
              blCargos,
              blContact,
              blNo,
              blMode,
              cargoDesc,
              cargoMark,
              copyCount,
              orderInfo,
              originalCount,
            } = res.data
            const containers = []
            if (blCargos.length) {
              blCargos.forEach((item) => {
                const {
                  containerType,
                  quantity,
                  sn,
                  cn,
                  packageType,
                  volume,
                  weight,
                } = item
                containers.push({
                  containerType,
                  quantity,
                  packageType,
                  packageTypeCode: '',
                  volume,
                  weight,
                  sn,
                  cn,
                  cargos: [{
                    hsCode: '',
                    marks: '',
                    description: '',
                    quantity: undefined,
                    volume: undefined,
                    weight: undefined,
                  }]
                })
              })
            } else {
              containers.push({
                containerType: '',
                quantity: undefined,
                packageType: '',
                packageTypeCode: '',
                volume: undefined,
                weight: undefined,
                sn: '',
                cn: '',
                cargos: [{
                  hsCode: '',
                  marks: '',
                  description: '',
                  quantity: undefined,
                  volume: undefined,
                  weight: undefined,
                }]
              })
            }
            this.particularsOption2.cargoDescription = cargoDesc || ''
            this.particularsOption2.marks = cargoMark || ''
            const particularsOptionData = [{
              containers
            }]
            if (particularsOptionData.length) {
              this.particularsOption.splice(0, 1000, ...particularsOptionData)
            }
            
            if (blContact) {
              const { shipper, consignee, notify1, notify2, notify3 } =
                blContact
              if (shipper.length) {
                const arr = shipper.split(/\r?\n/)
                if (arr.length > -1) {
                  this.generalOption.shipper.name = arr.slice(0, 1).join('')
                  this.generalOption.shipper.address = arr.slice(1).join('\n')
                } else {
                  this.generalOption.shipper.name = shipper
                }
              }
              if (consignee.length) {
                const arr = consignee.split(/\r?\n/)
                if (arr.length > -1) {
                  this.generalOption.consignee.name = arr.slice(0, 1).join('')
                  this.generalOption.consignee.address = arr.slice(1).join('\n')
                } else {
                  this.generalOption.consignee.name = consignee
                }
              }
              if (notify1.length) {
                const arr = notify1.split(/\r?\n/)
                if (arr.length > -1) {
                  this.generalOption.notifyParty.name = arr.slice(0, 1).join('')
                  this.generalOption.notifyParty.address = arr
                    .slice(1)
                    .join('\n')
                } else {
                  this.generalOption.notifyParty.name = notify1
                }
              }
              if (notify2.length) {
                const arr = notify2.split(/\r?\n/)
                if (arr.length > -1) {
                  this.generalOption.notifyParty2.name = arr
                    .slice(0, 1)
                    .join('')
                  this.generalOption.notifyParty2.address = arr
                    .slice(1)
                    .join('\n')
                } else {
                  this.generalOption.notifyParty2.name = notify2
                }
              }
              if (notify3.length) {
                const arr = notify3.split(/\r?\n/)
                if (arr.length > -1) {
                  this.generalOption.notifyParty3.name = arr
                    .slice(0, 1)
                    .join('')
                  this.generalOption.notifyParty3.address = arr
                    .slice(1)
                    .join('\n')
                } else {
                  this.generalOption.notifyParty3.name = notify3
                }
              }
              // this.generalOption.blNo = blNo
            }
            if (orderInfo) {
              const {
                vessel,
                voyage,
                shipCarrierCode,
                polPortCode,
                podPortCode,
                bargePorPortCode,
                payMode,
                polPortEname,
                polPortName,
                podPortEname,
                podPortName,
                bargePorPortEname,
                bargePorPortName,
                transportTerm,
              } = orderInfo
              
              this.transportOption.transportDetail = {
                vessel,
                voyage,
              }
              this.transportOption.pol.locationCode = polPortCode
              this.transportOption.pod.locationCode = podPortCode
              this.transportOption.placeOfReceipt.locationCode = bargePorPortCode
              this.transportOption.placeOfDelivery.locationCode = podPortCode
              this.transportOption.pol.printName = polPortEname || polPortName
              this.transportOption.pod.printName = podPortEname || podPortName
              this.transportOption.placeOfReceipt.printName = bargePorPortEname || bargePorPortName
              this.transportOption.placeOfDelivery.printName = podPortEname || podPortName
              this.transportOption.transport = transportTerm
            }
            this.generalOption = Object.assign(this.generalOption,{
              bookingNos: this.queryObj.so,
              carrierScac: this.shipCarrierCode,
              carrierName: this.shipCarrierCode,
              contractNo: '',
              blNo: this.queryObj.blNo
            })
            setTimeout(() => {
              this.$refs.transportForm.initData() // 初始化数据
              this.$refs.particularsForm.initData() // 初始化数据
              this.$refs.generalForm.initData() // 初始化数据
            }, 2000)
          }
        })
        .catch(() => {})
    },
    submitOriginal(type) {
      // 汉字校验
      const reg =
        /[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/gi
      // General Details
      const {
        shipperaddressError,
        forwarderaddressError,
        consigneeaddressError,
        notifyPartyaddressError,
        notifyParty2addressError,
        notifyParty3addressError,
        shipToaddressError,
        freightPayeraddressError,
        shippernameError,
        forwardernameError,
        consigneenameError,
        notifyPartynameError,
        notifyParty2nameError,
        notifyParty3nameError,
        shipTonameError,
        freightPayernameError,
      } = this.$refs.generalForm.$data
      const generaError = [
        shipperaddressError,
        forwarderaddressError,
        consigneeaddressError,
        notifyPartyaddressError,
        notifyParty2addressError,
        notifyParty3addressError,
        shipToaddressError,
        freightPayeraddressError,
      ].some((item) => item === true)
      if (generaError) {
        document.getElementsByClassName('general-cnt')[0].scrollIntoView()
        return this.$msgErrClose(
          'The address format in General details is incorrect'
        )
      }
      const nameError = [
        shippernameError,
        forwardernameError,
        consigneenameError,
        notifyPartynameError,
        notifyParty2nameError,
        notifyParty3nameError,
        shipTonameError,
        freightPayernameError,
      ].some((item) => item === true)
      if (nameError) {
        document.getElementsByClassName('general-cnt')[0].scrollIntoView()
        return this.$msgErrClose(
          'The name format in General details is incorrect'
        )
      }
      const sta1 = this.$refs.generalForm.validateForm()
      if (!sta1) {
        document.getElementsByClassName('general-cnt')[0].scrollIntoView()
        return this.$msgErrClose('General Details is Required')
      }
      if (reg.test(JSON.stringify(this.$refs.generalForm.$data.form))) {
        document.getElementsByClassName('general-cnt')[0].scrollIntoView()
        return this.$msgErrClose(
          'Chinese characters and punctuation are not allowed for General Details'
        )
      }
      if (!this.$refs.generalForm.checkSpecialChart()) {
        // 订舱号有特殊字符
        document.getElementsByClassName('general-cnt')[0].scrollIntoView()
        return
      }
      // Transport
      const sta2 = this.$refs.transportForm.validateForm()
      if (!sta2) {
        document.getElementsByClassName('transports-cnt')[0].scrollIntoView()
        return this.$msgErrClose('Transport is Required')
      }
      if (reg.test(JSON.stringify(this.$refs.transportForm.$data.form))) {
        document.getElementsByClassName('transports-cnt')[0].scrollIntoView()
        return this.$msgErrClose(
          'Chinese characters and punctuation are not allowed for Transport'
        )
      }
      // Particulars
      const { descriptionErr, marksErr, marksSpaceErr } = this.$refs.particularsForm.$data
      const particularsError = descriptionErr && marksErr && marksSpaceErr
      if (particularsError) {
        document.getElementsByClassName('particulars-cnt')[0].scrollIntoView()
        return this.$msgErrClose(
          'The Cargo Description or Marks & Numbers in Particulars is incorrect'
        )
      }
      let particularsType = this.particularsOption.map(item => item.containers).flat(Infinity).some(ele => !ele.sn || !ele.cn || !ele.containerType)
      if (particularsType) {
        document.getElementsByClassName('particulars-cnt')[0].scrollIntoView()
        return this.$msgErrClose('The Container Number / Seal Number / Type is Required')
      }
      const sta3 = this.$refs.particularsForm.validateForm()
      if (!sta3) {
        document.getElementsByClassName('particulars-cnt')[0].scrollIntoView()
        return this.$msgErrClose('Particulars is Required')
      }
      if (reg.test(JSON.stringify(this.$refs.particularsForm.$data.form))) {
        document.getElementsByClassName('particulars-cnt')[0].scrollIntoView()
        return this.$msgErrClose(
          'Chinese characters and punctuation are not allowed for Particulars'
        )
      }
      // Freight Charges
      const sta4 = this.$refs.chargesForm.validateForm()
      if (!sta4) {
        return this.$msgErrClose('Freight Charges is Required')
      }
      if (reg.test(JSON.stringify(this.$refs.chargesForm.$data.form))) {
        return this.$msgErrClose(
          'Chinese characters and punctuation are not allowed for Freight Charges'
        )
      }
      // B/L Type
      const sta5 = this.$refs.blForm.validateForm()
      if (!sta5) {
        return this.$msgErrClose('B/L Type is Required')
      }
      if (reg.test(JSON.stringify(this.$refs.blForm.$data.form))) {
        return this.$msgErrClose(
          'Chinese characters and punctuation are not allowed for B/L Print Instructions'
        )
      }

      // Notification Emails
      const sta6 = this.$refs.notificationForm.validateForm()
      if (!sta6) {
        return this.$msgErrClose('BKG Requestor Emails  Required')
      }
      if (reg.test(JSON.stringify(this.$refs.notificationForm.$data.form))) {
        return this.$msgErrClose(
          'Chinese characters and punctuation are not allowed for Notification Emails'
        )
      }
      this.submitOriginalFn(type)
    },
    submitOriginalFn(type) {
      this.isLoading = true
      const {
        bookingNos,
        carrierScac,
        carrierName,
        contractNo,
        blNo,
        shipper,
        forwarder,
        consignee,
        notifyParty,
        notifyParty2,
        notifyParty3,
      } = this.generalOption
      const {
        transport,
        placeOfDelivery,
        placeOfReceipt,
        pol,
        pod,
        transportDetail,
      } = this.transportOption
      const particularsOption = this.particularsOption
      particularsOption.forEach((item) => {
        item.containers.forEach((ele) => {
          const source = ele.packageType
          if (typeof source === 'object') {
            ele.packageType = source.descpt
            ele.packageTypeCode = source.packageCode
          }
          ele.cargos.forEach((ele1) => {
            const source2 = ele1.packageType
            if (typeof source2 === 'object') {
              ele1.packageType = source2.descpt
              ele1.packageTypeCode = source2.packageCode
            }
          })
        })
      })
      const { chargeTerm } =
        this.chargesOption
      const {
        blType,
        remarks,
      } = this.blOption
      const {
        containers: totalContainer,
        packages: totalPackage,
        weight: totalWeight,
        volume: totalVolume,
      } = this.totalsOption
      const { notifyEmails, notifyName } = this.notificationOption
      const data = {
        orderNo: this.$route.query.orderNo,
        baseCarrierCode: carrierName,
        carrierSource: this.carrierSource,
        shipId: this.shipId,
        copyCount: this.copyCount,
        contractNo,
        blNo,
        orderBlId: Number(this.$route.query.blId),
        shipper,
        forwarder,
        consignee,
        notifyParty,
        notifyParty2,
        notifyParty3,
        transport,
        placeOfDelivery: {
          locationCode: placeOfDelivery.locationCode?.cityUnCode,
          locationName: placeOfDelivery.locationCode?.cityName,
          country: placeOfDelivery.locationCode?.countryName,
          countryCode: placeOfDelivery.locationCode?.countryCode,
          printName: placeOfDelivery.printName,
        },
        placeOfReceipt: {
          locationCode: placeOfReceipt.locationCode?.cityUnCode,
          locationName: placeOfReceipt.locationCode?.cityName,
          country: placeOfReceipt.locationCode?.countryName,
          countryCode: placeOfReceipt.locationCode?.countryCode,
          printName: placeOfReceipt.printName,
        },
        pol: {
          locationCode: pol.locationCode?.cityUnCode,
          locationName: pol.locationCode?.cityName,
          country: pol.locationCode?.countryName,
          countryCode: pol.locationCode?.countryCode,
          printName: pol.printName,
        },
        pod: {
          locationCode: pod.locationCode?.cityUnCode,
          locationName: pod.locationCode?.cityName,
          country: pod.locationCode?.countryName,
          countryCode: pod.locationCode?.countryCode,
          printName: pod.printName,
        },
        transportDetail,
        containers: particularsOption,
        cargoDescription: this.particularsOption2.cargoDescription,
        marks: this.particularsOption2.marks,
        controlTotal: {
          totalContainer,
          totalPackage,
          totalWeight,
          totalVolume,
        },
        bookingNos: bookingNos.split(','),
        carrierScac,
        carrierName,
        blType,
        remarks,
        chargeTerm,
        notifyEmails: notifyEmails.map((item) => item.value).join(','),
        notifyName,
      }
      // 没有填写的参数赋值为null
      const noticeStr = JSON.stringify({
        address: '',
        street: '',
        city: '',
        province: '',
        country: '',
        contact: {
          email: '',
          name: '',
          telPhone: '',
          fax: '',
        },
        name: '',
      })
      data.notifyParty =
        JSON.stringify(data.notifyParty) === noticeStr ? null : data.notifyParty
      data.notifyParty2 =
        JSON.stringify(data.notifyParty2) === noticeStr
          ? null
          : data.notifyParty2
      data.notifyParty3 =
        JSON.stringify(data.notifyParty3) === noticeStr
          ? null
          : data.notifyParty3
      data.containers.forEach((item) => {
        item.containers.forEach((ele) => {
          delete ele.showCargos
        })
      })
      data.containers = data.containers[0].containers
      let baseData = {}
      baseData['blId'] = this.queryObj.siOid
      if (this.oid) {
        baseData['oid'] = this.oid
      }
      if (type) {
        baseData['execStatus'] = 'DRAFT'
      }
      let requestMethod = this.oid ? updateSiInfoWhl : saveSiInfoWhl
      console.log('保存的oid', this.oid)
      console.log('保存的data', data)
      requestMethod({
        content: data,
        ...baseData
      })
        .then((res) => {
          if (res.code === 0) {
            let text = type === 'draft' ? 'Draft saved successfully' : 'Create Shipping Instruction successfully'
            this.$msgSucClose(text)
            setTimeout(() => {
              if (!this.$route.query.siOid && !this.$route.query.oid) {
                this.$router.push({
                  name: 'RobotPacking',
                  query: {
                    oid: res.data.oid,
                    orderNo: res.data.orderNo,
                  }
                })
              } else {
                this.reload()
              }
            }, 100)
          } else {
          }
        })
        .catch(() => {})
        .finally(() => {
          this.isLoading = false
        })
    },
    // 字典
    getDictAll() {
      dictAll({})
        .then((res) => {
          if (res.code === 0) {
            this.dictAll.dictList = res.data
          }
        })
        .catch(() => {})
    },
    doSiTask(type) {
       if (!this.oid) return
       let requestMethod = type === 'start' ? startSiTask : cancelSiTask
       let successTip = type === 'start' ? '已启动' : '已取消'
       this.isLoading = true
       requestMethod({
        oid: this.oid
       })
       .then(res => {
         this.$message.success(successTip)
         this.reload()
       })
       .finally(() => {
         this.isLoading = false
       })
    },
  },
  computed: {
    showEditDraftBtn() {
      return !this.execStatus || ['DRAFT', 'ERROR'].includes(this.execStatus)
    },
    showEditBtn() {
      return !this.execStatus || ['DRAFT', 'SUBMIT', 'READY', 'ERROR', 'STOP'].includes(this.execStatus)
    },
    showStartBtn() {
      return ['SUBMIT'].includes(this.execStatus)
    },
    showCancelBtn() {
      return ['READY'].includes(this.execStatus)
    },
  },
}
</script>

<style lang="scss" scoped>
.packing-cnt {
  font-family: Tahoma, Verdana, Arial, 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 300;
  font-size: 12px;
  color: #4a4e50;
  box-sizing: border-box;
  background-color: #fff;
  margin: 10px 0;
  padding: 8px 12px;
  .items {
    background-color: #f8f9fa;
    background-clip: border-box;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 4px;
    margin-bottom: 10px;
  }
  .title-box {
    h3 {
      font-weight: 400;
      font-size: 26px;
      line-height: 1.5;
    }
    margin-bottom: 16px;
  }
  .sub-title {
    font-weight: 400;
    font-size: 18px;
    line-height: 1.5;
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    .title {
      width: 30%;
    }
    .tips {
      flex: 1;
      font-size: 12px;
      text-align: right;
    }
  }
}
</style>

<style lang="scss">
.packing-cnt {
  .el-form--label-top .el-form-item__label {
    padding: 0;
    line-height: 22px;
  }
  .el-select .el-select--mini,
  .el-input--mini .el-input__inner {
    height: 22px;
    line-height: 22px;
  }
  .el-checkbox__label {
    font-size: 12px;
  }
  .large-select {
    width: 100%;
  }
  .submit {
    text-align: right;
  }
  .third-party {
    margin-bottom: 10px;
  }
}
</style>
