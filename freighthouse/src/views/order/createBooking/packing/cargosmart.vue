<template>
  <div class="packing-cnt">
    <div class="cnt-box">
      <div class="sub-title">General Details</div>
      <div class="general items">
        <General
          :replaceChinese="replaceChinese"
          :generalOption.sync="generalOption"
          ref="generalForm"
        />
      </div>
      <div class="sub-title">Transport</div>
      <div class="transport items">
        <Transport
          :transportOption.sync="transportOption"
          ref="transportForm"
        />
      </div>
      <div class="sub-title">Particulars</div>
      <div class="particulars items">
        <Particulars
          :particularsOption.sync="particularsOption"
          ref="particularsForm"
          :replaceChinese="replaceChinese"
        />
      </div>
      <div class="sub-title">Control Totals</div>
      <div class="control items">
        <Totals :totalsOption.sync="totalsOption" ref="totalsForm" />
      </div>

      <div class="sub-title">Freight Charges</div>
      <div class="control items">
        <Charges :chargesOption.sync="chargesOption" ref="chargesForm" />
      </div>
      <div class="sub-title">
        B/L Print Instructions (Provided to the Carrier, not printed on Bill of
        Lading)
      </div>
      <div class="bl items">
        <Bl :blOption.sync="blOption" ref="blForm" :replaceChinese="replaceChinese" :carrierScac="generalOption.carrierScac"/>
      </div>
      <div class="sub-title">Notification Emails</div>
      <div class="notification items">
        <Notification
          :notificationOption.sync="notificationOption"
          ref="notificationForm"
        />
      </div>
      <div class="submit">
        <el-button
          @click="submitOriginal('draft')"
          icon="el-icon-edit"
          type="warning"
          :disabled="disabledBtnDraft"
          :loading="isLoading"
        >
          Save Draft
        </el-button>
        <el-button type="default" @click="showPreview"> Preview </el-button>
        
        <el-button
          @click="submitOriginal(false)"
          icon="el-icon-s-claim"
          type="primary"
          :disabled="disabledBtn"
          :loading="isLoading"
        >
          Submit
        </el-button>
      </div>
    </div>
    <Preview
      :option="previewOption"
      :fromCarrierSource="'cargosmart'"
      v-if="previewOption.show"
      @close="closePreView"
    />
  </div>
</template>

<script>
import General from './cargosmart/general'
import Transport from './cargosmart/transport'
import Particulars from './cargosmart/particulars'
import Totals from './components/totals'
import Charges from './cargosmart/charges'
import Bl from './cargosmart/bl'
import Notification from './components/notification'
import Preview from './components/preview'
import { shipId, siOriginalCgm, dictAll, siDetail } from '@/api/order/createBooking'
import { blDetail } from '@/api/order/bl'
export default {
  provide() {
    return {
      dictAll: this.dictAll,
      carrierSource: this.carrierSource,
    }
  },
  props: {
    carrierSource: {
      type: String,
      default: 'inttra',
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
        hblScac: '',
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
        },
        shipTo: {
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
        },
        freightPayer: {
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
          imoNumber: '',
          callNumber: '',
        },
      },
      particularsOption: [
        {
          containers: [
            {
              containerType: '',
              quantity: '',
              packageType: '',
              packageTypeCode: '',
              volume: '',
              weight: '',
              sn: '',
              cn: '',
              reeferDto: {
                humidity: '',
                airFlow: '',
                temperature: '',
                description: '',
              },
            },
          ],
          cargos: [
            {
              hsCode: '',
              description: '',
              marks: '',
              quantity: '',
              volume: '',
              weight: '',
              packageType: '',
              packageTypeCode: '',
              dangerousDto: {
                cargoName: '',
                hazardCode: '',
                undgNo: '',
                flashPoint: '',
                dangerLevel: '',
                contact: {
                  email: '',
                  name: '',
                  telPhone: '',
                },
              },
            },
          ],
        },
      ],
      totalsOption: {
        containers: '1',
        packages: '0',
        weight: '0.000',
        volume: '0.0000',
      },
      chargesOption: {
        chargeType: '',
        chargeTerm: '',
        // payer: '',
        paymentPlace: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
        },
        releaseOffice: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
        },
      },
      blOption: {
        blType: '',
        blOriginalCount: '',
        blCopyCount: '',
        blOriginalUnfreightCount: '',
        blCopyUnfreightCount: '',
        hblName: '',
        remarks: `SID NO. DON'T SHOW  ON BILL`,
      },
      notificationOption: {
        notifyEmails: [{ value: this.$store.state.user.userInfo.email }],
        notifyName: 'Longsail', // this.$store.state.user.userInfo.userName
        // partnerNotifyEmails: ''
      },
      disabledBtn: false,
      disabledBtnDraft: false,
      isLoading: false,
      previewOption: {
        show: false,
        data: {},
      },
      dictAll: {
        dictList: [],
      },
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
    this.getDictAll()
    this.reload()
  },
  methods: {
    // 重新加载
    reload () {
      let shipmentId = this.$route.query.shipmentId
      if (shipmentId) {
        this.getDataSource(shipmentId)
      } else {
        this.getShipId()
        this.getBlDetail()
      }
    },
    // 获取重新提交的数据
    getDataSource (shipId) {
       let data = {
        shipId,
      }
      siDetail(data).then(res => {
        if (res.data.status === 'draft') {
            this.shipId = res.data.shipmentId
            this.oid = res.data.oid
          } else {
            this.getShipId()
          }
        let source = JSON.parse(res.data.requestData)
        let {
          blType,
          blOriginalCount,
          blCopyCount,
          blOriginalUnfreightCount,
          blCopyUnfreightCount,
          hblName,
          remarks,
          bookingNos,
          carrierScac,
          carrierName,
          contractNo,
          blNo,
          hblScac,
          shipper,
          forwarder,
          consignee,
          notifyParty,
          notifyParty2,
          shipTo,
          freightPayer,
          transport,
          placeOfDelivery,
          placeOfReceipt,
          etd,
          eta,
          pol,
          pod,
          transportDetail,
          cc,
          controlTotal,
          chargeTerm,
          chargeType,
          paymentPlace,
          releaseOffice,
          notifyName,
          notifyEmails
        } = source
        this.blOption = Object.assign(this.blOption,{
          blType,
          blOriginalCount,
          blCopyCount,
          blOriginalUnfreightCount,
          blCopyUnfreightCount,
          hblName,
          remarks
        })
        this.generalOption = Object.assign(this.generalOption,{
          bookingNos:bookingNos.join(','),
          carrierScac,
          carrierName,
          contractNo,
          blNo,
          hblScac
        })
        shipper && Object.assign(this.generalOption,{shipper})
        forwarder && Object.assign(this.generalOption,{forwarder})
        consignee && Object.assign(this.generalOption,{consignee})
        notifyParty && Object.assign(this.generalOption,{notifyParty})
        notifyParty2 && Object.assign(this.generalOption,{notifyParty2})
        shipTo && Object.assign(this.generalOption,{shipTo})
        freightPayer && Object.assign(this.generalOption,{freightPayer})
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
        this.particularsOption = cc.map(item => {
          let { cargos, containers } = item
          cargos.forEach(ele => {
            if (!ele.dangerousDto) {
              ele.dangerousDto = {
                cargoName: '',
                hazardCode: '',
                undgNo: '',
                flashPoint: '',
                dangerLevel: '',
                contact: {
                  email: '',
                  name: '',
                  telPhone: ''
                }
              }
            }
          })
          containers.forEach(ele => {
            if (!ele.reeferDto) {
              ele.reeferDto = {
                humidity: '',
                airFlow: '',
                temperature: '',
                description: ''
              }
            }
          })
          return {
            ...item
          }
        })
        this.totalsOption = Object.assign(this.totalsOption,controlTotal) 
        this.chargesOption = Object.assign(this.chargesOption,{
          chargeTerm,
          chargeType,
        })
        paymentPlace && Object.assign(this.chargesOption,{
          paymentPlace:{
            locationCode: {
              cityUnCode: paymentPlace.locationCode,
              cityName: paymentPlace.locationName,
              countryName: paymentPlace.country,
              countryCode: paymentPlace.countryCode
            }
          }
        })
        releaseOffice && Object.assign(this.chargesOption,{
          releaseOffice: {
            locationCode: {
              cityUnCode: releaseOffice.locationCode,
              cityName: releaseOffice.locationName,
              countryName: releaseOffice.country,
              countryCode: releaseOffice.countryCode
            }
          }
        })
        this.notificationOption = Object.assign(this.notificationOption, {
          notifyName,
          notifyEmails: notifyEmails.split(',').map(item => {
            return {'value': item}
          })
        })
        this.$refs.transportForm.initData() // 初始化数据
        this.$refs.chargesForm.initData() // 初始化数据
      }).catch(()=>{})
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
      // isBasedFile === y 不带补料信息
      const isBasedFile = this.$route.query.isBasedFile
      if (isBasedFile === 'y') {
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
            const cargos = []
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
                  reeferDto: {
                    humidity: '',
                    airFlow: '',
                    temperature: '',
                    description: '',
                  },
                })
              })
            } else {
              containers.push({
                containerType: '',
                quantity: '',
                packageType: '',
                packageTypeCode: '',
                volume: '',
                weight: '',
                sn: '',
                cn: '',
                reeferDto: {
                  humidity: '',
                  airFlow: '',
                  temperature: '',
                  description: '',
                },
              })
            }
            cargos.push({
              marks: cargoMark || '',
              description: cargoDesc || '',
              quantity: '',
              volume: '',
              weight: '',
              packageType: '',
              packageTypeCode: '',
              dangerousDto: {
                cargoName: '',
                hazardCode: '',
                undgNo: '',
                flashPoint: '',
                dangerLevel: '',
                contact: {
                  email: '',
                  name: '',
                  telPhone: '',
                },
              },
            })
            const particularsOptionData = [
              {
                containers,
                cargos,
              },
            ]
            if (particularsOptionData.length) {
              this.particularsOption.splice(0, 1000, ...particularsOptionData)
            }
            this.$refs.particularsForm.initData() // 初始化数据
            this.blOption.blCopyUnfreightCount = copyCount
            this.blOption.blType = blMode
            this.blOption.blOriginalUnfreightCount = originalCount || ''
            this.$refs.blForm.initData() // 初始化数据
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
              } = orderInfo
              this.chargesOption.chargeTerm = payMode
              this.$refs.chargesForm.initData() // 初始化数据
              this.transportOption.transportDetail = {
                vessel,
                voyage,
              }
              this.transportOption.pol.locationCode = polPortCode
              this.transportOption.pod.locationCode = podPortCode
              this.transportOption.placeOfReceipt.locationCode =
                bargePorPortCode
              this.transportOption.placeOfDelivery.locationCode = podPortCode
              this.transportOption.pol.printName = polPortEname || polPortName
              this.transportOption.pod.printName = podPortEname || podPortName
              this.transportOption.placeOfReceipt.printName = bargePorPortEname || bargePorPortName
              this.transportOption.placeOfDelivery.printName = podPortEname || podPortName
              this.$refs.transportForm.initData() // 初始化数据
            }
            this.$refs.generalForm.initData() // 初始化数据
          }
        })
        .catch(() => {})
    },
    // 获取shipId
    getShipId() {
      const data = {
        type: 'si',
      }
      shipId(data)
        .then((res) => {
          if (res.code === 0) {
            this.shipId = res.data.shipId
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
        shipToaddressError,
        freightPayeraddressError,
        shippernameError,
        forwardernameError,
        consigneenameError,
        notifyPartynameError,
        notifyParty2nameError,
        shipTonameError,
        freightPayernameError,
      } = this.$refs.generalForm.$data
      const generaError = [
        shipperaddressError,
        forwarderaddressError,
        consigneeaddressError,
        notifyPartyaddressError,
        notifyParty2addressError,
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
      // let { imoNumber, callNumber } =
      //   this.$refs.transportForm.$data.form.transportDetail
      // if (!imoNumber && !callNumber) {
      //   document.getElementsByClassName('transports-cnt')[0].scrollIntoView()
      //   return this.$msgErrClose(
      //     "Fill in at least one item for Lloyd's Number and Call Sign"
      //   )
      // }
      if (reg.test(JSON.stringify(this.$refs.transportForm.$data.form))) {
        document.getElementsByClassName('transports-cnt')[0].scrollIntoView()
        return this.$msgErrClose(
          'Chinese characters and punctuation are not allowed for Transport'
        )
      }
      // Particulars
      const { descriptionErr, marksErr } = this.$refs.particularsForm.$data
      const particularsError = [...Object.values(descriptionErr), ...Object.values(marksErr)].some(
        (item) => item === true
      )
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
        hblScac,
        shipper,
        forwarder,
        consignee,
        notifyParty,
        notifyParty2,
        shipTo,
        freightPayer,
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
        item.cargos.forEach(op => {
          const source = op.packageType
          if (typeof source === 'object') {
            op.packageType = source.descpt
            op.packageTypeCode = source.packageCode
          }
        })
        item.containers.forEach((ele) => {
          const source = ele.packageType
          if (typeof source === 'object') {
            ele.packageType = source.descpt
            ele.packageTypeCode = source.packageCode
          }
        })
      })
      const { chargeType, chargeTerm, paymentPlace, releaseOffice } =
        this.chargesOption
      const {
        blType,
        blOriginalCount,
        blCopyCount,
        blOriginalUnfreightCount,
        blCopyUnfreightCount,
        hblName,
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
        baseCarrierCode: this.$route.query.carrierCode,
        carrierSource: this.carrierSource,
        shipId: this.shipId,
        oid: this.oid,
        copyCount: this.copyCount,
        contractNo,
        blNo,
        hblScac,
        orderBlId: Number(this.$route.query.blId),
        shipper,
        forwarder,
        consignee,
        notifyParty,
        notifyParty2,
        freightPayer,
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
        cc: particularsOption,
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
        blOriginalCount,
        blCopyCount,
        blOriginalUnfreightCount,
        blCopyUnfreightCount,
        hblName,
        remarks,
        chargeType,
        chargeTerm,
        paymentPlace: {
          locationCode: paymentPlace.locationCode?.cityUnCode,
          locationName: paymentPlace.locationCode?.cityName,
          country: paymentPlace.locationCode?.countryName,
          countryCode: paymentPlace.locationCode?.countryCode,
        },
        notifyEmails: notifyEmails.map((item) => item.value).join(','),
        notifyName,
        shipTo,
        releaseOffice: {
          locationCode: releaseOffice.locationCode?.cityUnCode,
          locationName: releaseOffice.locationCode?.cityName,
          country: releaseOffice.locationCode?.countryName,
          countryCode: releaseOffice.locationCode?.countryCode,
        },
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
      data.shipTo =
        JSON.stringify(data.shipTo) === noticeStr ? null : data.shipTo
      data.freightPayer =
        JSON.stringify(data.freightPayer) === noticeStr
          ? null
          : data.freightPayer
      data.cc.forEach((item) => {
        const reeferDtoStr = JSON.stringify({
          humidity: '',
          airFlow: '',
          temperature: '',
          description: '',
        })
        item.containers.forEach((ele) => {
          if (JSON.stringify(ele.reeferDto) === reeferDtoStr) {
            ele.reeferDto = null
          }
        })
        const dangerousDtoStr = JSON.stringify({
          cargoName: '',
          hazardCode: '',
          undgNo: '',
          flashPoint: '',
          dangerLevel: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
          },
        })
        item.cargos.forEach((ele) => {
          if (JSON.stringify(ele.dangerousDto) === dangerousDtoStr) {
            ele.dangerousDto = null
          }
        })
      })
      const cityStr = JSON.stringify({})
      data.releaseOffice =
        JSON.stringify(data.releaseOffice) === cityStr
          ? null
          : data.releaseOffice
      data.paymentPlace = data.paymentPlace.locationCode
        ? data.paymentPlace
        : null
      if (type) {
        data.status = 'draft'
      }
      siOriginalCgm(data)
        .then((res) => {
          if (res.code === 0) {
            let text = type === 'draft' ? 'Draft saved successfully' : 'Create Shipping Instruction successfully'
            this.$msgSucClose(text)
            // this.$router.go(-1)
            if (type === 'draft') {
              this.disabledBtnDraft = true
            } else {
              this.disabledBtn = true
            }
           // 替换url参数
            const {...query} = this.$route.query
            let {shipId} = data
            this.$router.replace({query: {...query, shipmentId: shipId}})
            if (!this.disabledBtnDraft || !this.disabledBtn) {
              setTimeout(() => this.reload(), 100)
            }
          } else {
            // 失败重新查询shipid
            this.getShipId()
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
  padding: 8px 0;
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
