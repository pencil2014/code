<template>
  <el-dialog
    title="Shipping Instruction Preview"
    :visible.sync="option.show"
    width="90%"
    :before-close="close"
    class="preview-dialog"
  >
    <div class="preview-cnt">
      <table cellpadding="2" cellspacing="0" border="1" width="100%">
        <tbody>
          <tr valign="top">
            <td rowspan="2">
              <b>SHIPPER</b>
              <br />
              <pre>{{ previewData.generalOption.shipper.name }}</pre>
              <br />
              <pre>{{ previewData.generalOption.shipper.address }}</pre>
              <br />
              <br />Street :
              <pre>{{ previewData.generalOption.shipper.street }}</pre>
              <br />City : {{ previewData.generalOption.shipper.city }} <br />State/Province :
              {{ previewData.generalOption.shipper.province }} <br />Country :
              {{ previewData.generalOption.shipper.country }} <br />Contact Name :
              {{ previewData.generalOption.shipper.contact.name }} <br />Phone :
              {{ previewData.generalOption.shipper.contact.telPhone }} <br />Email :
              {{ previewData.generalOption.shipper.contact.email }} <br />Fax :
              {{ previewData.generalOption.shipper.contact.fax }}
            </td>
            <td rowspan="2">
              <b>FORWARDING AGENT</b>
              <br />
              <pre>{{ previewData.generalOption.forwarder.name }}</pre>
              <br />
              <pre>{{ previewData.generalOption.forwarder.address }}</pre>
              <br />
              <br />Street :
              <pre>{{ previewData.generalOption.forwarder.street }}</pre>
              <br />City : {{ previewData.generalOption.forwarder.city }} <br />State/Province :
              {{ previewData.generalOption.forwarder.province }} <br />Country :
              {{ previewData.generalOption.forwarder.country }} <br />Contact Name :
              {{ previewData.generalOption.forwarder.contact.name }} <br />Phone :
              {{ previewData.generalOption.forwarder.contact.telPhone }}
              <br />Email : {{ previewData.generalOption.forwarder.contact.email }} <br />Fax :
              {{ previewData.generalOption.forwarder.contact.fax }}
            </td>
            <td>
              <b>CARRIER BOOKING NO.</b>
              <br />
              <pre>{{ previewData.generalOption.bookingNos }}&nbsp;</pre>
            </td>
            <td>
              <b>SHIPPING INSTRUCTION NO. / REVISION NO.</b> <br />{{
                previewData.generalOption.contractNo
              }}
              / {{ previewData.generalOption.blNo }}
            </td>
          </tr>
          <tr valign="top">
            <td valign="top">
              <b>EXPORT REFERENCES</b>
              <br />
            </td>
            <td valign="top">
              <b>CUSTOMER SUBMISSION DATE</b>
              <br />{{ new Date().toGMTString() }}
              <br />
            </td>
          </tr>
          <tr valign="top">
            <td>
              <b>CONSIGNEE</b>
              <br />
              <pre>{{ previewData.generalOption.consignee.name }}</pre>
              <br />
              <pre>{{ previewData.generalOption.consignee.address }}</pre>
              <br />
              <br />Street :
              <pre>{{ previewData.generalOption.consignee.street }}</pre>
              <br />City : {{ previewData.generalOption.consignee.city }} <br />State/Province :
              {{ previewData.generalOption.consignee.province }} <br />Country :
              {{ previewData.generalOption.consignee.country }} <br />Contact Name :
              {{ previewData.generalOption.consignee.contact.name }} <br />Phone :
              {{ previewData.generalOption.consignee.contact.telPhone }}
              <br />Email : {{ previewData.generalOption.consignee.contact.email }} <br />Fax :
              {{ previewData.generalOption.consignee.contact.fax }}
            </td>
            <td>
              <b>NOTIFY PARTY</b>
              <br />
              <pre>{{ previewData.generalOption.notifyParty.name }}</pre>
              <br />
              <pre>{{ previewData.generalOption.notifyParty.address }}</pre>
              <br />
              <br />Street :
              <pre>{{ previewData.generalOption.notifyParty.street }}</pre>
              <br />City : {{ previewData.generalOption.notifyParty.city }} <br />State/Province :
              {{ previewData.generalOption.notifyParty.province }} <br />Country :
              {{ previewData.generalOption.notifyParty.country }} <br />Contact Name :
              {{ previewData.generalOption.notifyParty.contact.name }}
              <br />Phone :
              {{ previewData.generalOption.notifyParty.contact.telPhone }}
              <br />Email :
              {{ previewData.generalOption.notifyParty.contact.email }}
              <br />Fax :
              {{ previewData.generalOption.notifyParty.contact.fax }}
            </td>
            <td>
              <b>1st ADDITIONAL NOTIFY PARTY</b>
              <br />
              <pre>{{ previewData.generalOption.notifyParty2.name }}</pre>
              <br />
              <pre>{{ previewData.generalOption.notifyParty2.address }}</pre>
              <br />
              <br />Street :
              <pre>{{ previewData.generalOption.notifyParty2.street }}</pre>
              <br />City : {{ previewData.generalOption.notifyParty2.city }} <br />State/Province :
              {{ previewData.generalOption.notifyParty2.province }}
              <br />Country : {{ previewData.generalOption.notifyParty2.country }} <br />Contact
              Name : {{ previewData.generalOption.notifyParty2.contact.name }} <br />Phone :
              {{ previewData.generalOption.notifyParty2.contact.telPhone }}
              <br />Email :
              {{ previewData.generalOption.notifyParty2.contact.email }}
              <br />Fax :
              {{ previewData.generalOption.notifyParty2.contact.fax }}
            </td>
            <td>
              <b>2nd ADDITIONAL NOTIFY PARTY</b>
              <template v-if="previewData.generalOption.notifyParty3">
                <br />
                <pre>{{ previewData.generalOption.notifyParty3.name }}</pre>
                <br />
                <pre>{{ previewData.generalOption.notifyParty3.address }}</pre>
                <br />
                <br />Street :
                <pre>{{ previewData.generalOption.notifyParty3.street }}</pre>
                <br />City : {{ previewData.generalOption.notifyParty3.city }} <br />State/Province
                :
                {{ previewData.generalOption.notifyParty3.province }}
                <br />Country : {{ previewData.generalOption.notifyParty3.country }} <br />Contact
                Name : {{ previewData.generalOption.notifyParty3.contact.name }} <br />Phone :
                {{ previewData.generalOption.notifyParty3.contact.telPhone }}
                <br />Email :
                {{ previewData.generalOption.notifyParty3.contact.email }}
                <br />Fax :
                {{ previewData.generalOption.notifyParty3.contact.fax }}
              </template>
            </td>
          </tr>
          <tr valign="top">
            <td>
              <b>CONTRACT PARTY</b>
              <br />
              <br />
            </td>
            <td>
              <b>FREIGHT PAYER</b>
              <template v-if="previewData.generalOption.freightPayer">
                <br />
                <pre>{{ previewData.generalOption.freightPayer.name }}</pre>
                <br />
                <pre>{{ previewData.generalOption.freightPayer.address }}</pre>
                <br />
                <br />Street :
                <pre>{{ previewData.generalOption.freightPayer.street }}</pre>
                <br />City : {{ previewData.generalOption.freightPayer.city }} <br />State/Province
                :
                {{ previewData.generalOption.freightPayer.province }}
                <br />Country : {{ previewData.generalOption.freightPayer.country }} <br />Contact
                Name : {{ previewData.generalOption.freightPayer.contact.name }} <br />Phone :
                {{ previewData.generalOption.freightPayer.contact.telPhone }}
                <br />Email :
                {{ previewData.generalOption.freightPayer.contact.email }}
                <br />Fax :
                {{ previewData.generalOption.freightPayer.contact.fax }}
              </template>
            </td>
            <td>
              <b>MANUFACTURER/SUPPLIER</b>
              <br />
              <br />
            </td>
            <td>
              <b>SHIP TO</b>
              <template v-if="previewData.generalOption.shipTo">
                <br />
                <pre>{{ previewData.generalOption.shipTo.name }}</pre>
                <br />
                <pre>{{ previewData.generalOption.shipTo.address }}</pre>
                <br />
                <br />Street :
                <pre>{{ previewData.generalOption.shipTo.street }}</pre>
                <br />City : {{ previewData.generalOption.shipTo.city }} <br />State/Province :
                {{ previewData.generalOption.shipTo.province }} <br />Country :
                {{ previewData.generalOption.shipTo.country }} <br />Contact Name :
                {{ previewData.generalOption.shipTo.contact.name }} <br />Phone :
                {{ previewData.generalOption.shipTo.contact.telPhone }} <br />Email :
                {{ previewData.generalOption.shipTo.contact.email }} <br />Fax :
                {{ previewData.generalOption.shipTo.contact.fax }}
              </template>
            </td>
          </tr>
          <tr valign="top">
            <td>
              <b>CONSOLIDATOR/STUFFER</b>
              <br />
              <br />
            </td>
            <td>
              <b>IMPORTER</b>
              <br />
              <br />
            </td>
            <td></td>
            <td></td>
          </tr>
          <tr valign="top">
            <td>
              <b>POINT AND COUNTRY OF ORIGIN OF GOODS</b>
              <br />
              <table style="margin-left: 8px" cellspacing="0" cellpadding="2" border="0">
                <tbody>
                  <tr>
                    <td style="padding-top: 3px; padding-bottom: 0px" width="90">CITY:</td>
                    <td style="padding-top: 3px; padding-bottom: 0px">
                      {{ previewData.transportOption.placeOfReceipt.locationCode.cityName }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">COUNTRY:</td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.placeOfReceipt.locationCode.countryName }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">LOCATION ID:</td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.placeOfReceipt.locationCode.cityUnCode }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td>
              <b>TYPE OF MOVE</b>
              <br />{{ previewData.transportStr}}
            </td>
            <td>
              <b>SHIPMENT TYPE</b>
              <br />
            </td>
            <td>
              <b>CARRIER, VESSEL, VOYAGE</b>
              <br />{{ previewData.generalOption.carrierName }},
              {{ previewData.transportOption.transportDetail.vessel }},
              {{ previewData.transportOption.transportDetail.voyage }}
            </td>
          </tr>
          <tr valign="top">
            <td>
              <b>PLACE OF INITIAL RECEIPT</b>
              <br />
              <table style="margin-left: 8px" cellspacing="0" cellpadding="2" border="0">
                <tbody>
                  <tr>
                    <td style="padding-top: 3px; padding-bottom: 0px" width="90">CITY:</td>
                    <td style="padding-top: 3px; padding-bottom: 0px">
                      {{ previewData.transportOption.placeOfReceipt.locationCode.cityName }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">COUNTRY:</td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.placeOfReceipt.locationCode.countryName }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">LOCATION ID:</td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.placeOfReceipt.locationCode.cityUnCode }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">
                      Print on B/L as:
                    </td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.placeOfReceipt.printName }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td>
              <b>PORT OF LOAD</b>
              <br />
              <table style="margin-left: 8px" cellspacing="0" cellpadding="2" border="0">
                <tbody>
                  <tr>
                    <td style="padding-top: 3px; padding-bottom: 0px" width="90">CITY:</td>
                    <td style="padding-top: 3px; padding-bottom: 0px">
                      {{ previewData.transportOption.pol.locationCode.cityName }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">COUNTRY:</td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.pol.locationCode.countryName }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">LOCATION ID:</td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.pol.locationCode.cityUnCode }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">
                      Print on B/L as:
                    </td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.pol.printName }}
                    </td>
                  </tr>
                </tbody>
              </table>

              &nbsp;&nbsp;&nbsp;
            </td>
            <td>
              <b>PORT OF DISCHARGE</b>
              <br />
              <table style="margin-left: 8px" cellspacing="0" cellpadding="2" border="0">
                <tbody>
                  <tr>
                    <td style="padding-top: 3px; padding-bottom: 0px" width="90">CITY:</td>
                    <td style="padding-top: 3px; padding-bottom: 0px">
                      {{ previewData.transportOption.pod.locationCode.cityName }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">COUNTRY:</td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.pod.locationCode.countryName }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">LOCATION ID:</td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.pod.locationCode.cityUnCode }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">
                      Print on B/L as:
                    </td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.pod.printName }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td>
              <b>PLACE OF DELIVERY</b>
              <br />
              <table style="margin-left: 8px" cellspacing="0" cellpadding="2" border="0">
                <tbody>
                  <tr>
                    <td style="padding-top: 3px; padding-bottom: 0px" width="90">CITY:</td>
                    <td style="padding-top: 3px; padding-bottom: 0px">
                      {{ previewData.transportOption.placeOfDelivery.locationCode.cityName }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">COUNTRY:</td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.placeOfDelivery.locationCode.countryName }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">LOCATION ID:</td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.placeOfDelivery.locationCode.cityUnCode }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">
                      Print on B/L as:
                    </td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.transportOption.placeOfDelivery.printName }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      <br />
      <table cellpadding="2" cellspacing="0" border="1" width="100%">
        <tbody>
          <tr valign="top">
            <td :colspan="previewData.particularsOptionList[0].span > 1 ? 10 : 7"><b>PARTICULARS</b></td>
          </tr>
          <tr valign="top">
            <td><b>CONTAINER</b></td>
            <td><b>GID Seq. / Packing Level</b></td>
            <td><b>NO OF PKGS</b></td>
            <td><b>GROSS WEIGHT</b></td>
            <td><b>VOLUME</b></td>
            <td><b>MARKS &amp; NUMBERS</b></td>
            <td><b>DESCRIPTION</b></td>
            <template v-if="previewData.particularsOptionList[0].span > 1">
              <td><b>Package Count/Type</b></td>
              <td><b>Cargo Gross Weight</b></td>
              <td><b>Cargo Gross Volume</b></td>
            </template>
          </tr>
          <tr valign="center" v-for="(item, index) in previewData.particularsOptionList" :key="index">
              <template v-if="item.span === 1">
                <td>
                  <p>Container Number: {{ item.cn }}</p>
                  <p>Seal: {{ item.sn }} (Carrier)</p>
                  <p>Type: {{ item.containerType }}</p>
                  <p v-if="!isCargoSmart">Print on B/L as: {{item.printPackageType}}</p>
                </td>
                <td>OUTER</td>
                <td>{{ item.quantity }} {{ isCargoSmart ? mapPackageType(item.packageType) : item.printPackageType }}</td>
                <td>{{ item.weight }}&nbsp;Kilograms</td>
                <td>{{ item.volume }}&nbsp;Cubic Meter</td>
                <td><pre>{{item.cargos[0].marks}}</pre></td>
                <td>
                  <p><pre>{{item.cargos[0].description}}</pre></p>
                  <br/>
                  <p>HS Code:{{item.cargos[0].hsCode}}</p>
                </td>
              </template>
              <template v-else>
                <template v-if="index === 0 || item.eleIndex === 0">
                  <td :rowspan="item.span">
                    <p>Container Number: {{ item.cn }}</p>
                    <p>Seal: {{ item.sn }} (Carrier)</p>
                    <p>Type: {{ item.containerType }}</p>
                    <p v-if="!isCargoSmart">Print on B/L as: {{item.printPackageType}}</p>
                  </td>
                  <td :rowspan="item.span">OUTER</td>
                  <td :rowspan="item.span">{{ item.quantity }} {{ isCargoSmart ? mapPackageType(item.packageType) : item.printPackageType }}</td>
                  <td :rowspan="item.span">{{ item.weight }}&nbsp;Kilograms</td>
                  <td :rowspan="item.span">{{ item.volume }}&nbsp;Cubic Meter</td>
                </template>
                <td><pre>{{item.cargos.marks}}</pre></td>
                <td>
                  <p><pre>{{item.cargos.description}}</pre></p>
                  <br/>
                  <p>HS Code:{{item.cargos.hsCode}}</p>
                </td>
                <td>
                  {{item.cargos.quantity}} {{typeof item.cargos.packageType === 'object' ? item.cargos.packageType.descpt : item.cargos.packageType}}
                </td>
                <td>
                  {{item.cargos.weight}} &nbsp; Kilograms
                </td>
                <td>
                  {{item.cargos.volume}} &nbsp; Cubic Meter
                </td>
              </template>
            </tr>
        </tbody>
      </table>
      <br />
      <br />
      <table cellpadding="2" cellspacing="0" border="1" width="100%">
        <tbody>
          <tr valign="top">
            <td><b>SHIPPERS DECLARED VALUE</b>: <br />&nbsp;</td>
            <td>
              <b>B/L RELEASE OFFICE</b>
              <br />
              <table style="margin-left: 8px" cellspacing="0" cellpadding="2" border="0">
                <tbody>
                  <tr>
                    <td style="padding-top: 3px; padding-bottom: 0px" width="90">CITY:</td>
                    <td style="padding-top: 3px; padding-bottom: 0px">
                      {{ previewData.chargesOption.releaseOffice.locationCode.cityName }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">COUNTRY:</td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.chargesOption.releaseOffice.locationCode.countryName }}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 0px; padding-bottom: 0px" width="90">LOCATION ID:</td>
                    <td style="padding-top: 0px; padding-bottom: 0px">
                      {{ previewData.chargesOption.releaseOffice.locationCode.cityUnCode }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td>
              <b>DATE OF ISSUE</b>
              <br />
            </td>
            <td>
              <b>FREIGHT PAYABLE AT</b>
              <br />
              <table style="margin-left: 8px" cellspacing="0" cellpadding="2" border="0">
                <tbody>
                  <!-- <template v-if="previewData.chargesOption.releaseOffice.locationCode">
                    <tr>
                      <td style="padding-top: 3px; padding-bottom: 0px" width="90">CITY:</td>
                      <td style="padding-top: 3px; padding-bottom: 0px">{{ previewData.chargesOption.releaseOffice.locationCode.cityName}}</td>
                    </tr>
                    <tr>
                      <td style="padding-top: 0px; padding-bottom: 0px" width="90">COUNTRY:</td>
                      <td style="padding-top: 0px; padding-bottom: 0px">{{previewData.chargesOption.releaseOffice.locationCode.countryName}}</td>
                    </tr>
                    <tr>
                      <td style="padding-top: 0px; padding-bottom: 0px" width="90">LOCATION ID:</td>
                      <td style="padding-top: 0px; padding-bottom: 0px">{{previewData.chargesOption.releaseOffice.locationCode.cityUnCode}}</td>
                    </tr>
                  </template> -->
                  <template>
                    <tr>
                      <td style="padding-top: 3px; padding-bottom: 0px" width="90">CITY:</td>
                      <td style="padding-top: 3px; padding-bottom: 0px">Not provided</td>
                    </tr>
                    <tr>
                      <td style="padding-top: 0px; padding-bottom: 0px" width="90">COUNTRY:</td>
                      <td style="padding-top: 0px; padding-bottom: 0px">Not provided</td>
                    </tr>
                    <tr>
                      <td style="padding-top: 0px; padding-bottom: 0px" width="90">LOCATION ID:</td>
                      <td style="padding-top: 0px; padding-bottom: 0px">Not provided</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      <br />
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tbody>
          <tr>
            <td>
              <table cellpadding="4" cellspacing="0" border="1" width="100%">
                <tbody>
                  <tr>
                    <td style="font-weight: bold" colspan="1">CHARGE TYPE</td>
                    <td style="font-weight: bold" colspan="1">FREIGHT TERM</td>
                    <td style="font-weight: bold" colspan="1">PAYER</td>
                    <td style="font-weight: bold" colspan="1">PAYMENT LOCATION</td>
                  </tr>
                  <tr valign="top">
                    <td style="text-transform: uppercase" width="20%">
                      {{
                        previewData.chargeTypeStr
                      }}
                    </td>
                    <td width="20%">
                      {{
                        previewData.chargeTermStr
                      }}
                    </td>
                    <td width="20%">Freight Payer</td>
                    <td width="40%">
                      <template v-if="previewData.chargesOption.paymentPlace.locationCode">
                        <span style="width: 90px; display:inline-block;">CITY:</span>
                        {{ previewData.chargesOption.paymentPlace.locationCode.cityName }}
                        <br />
                        <span style="width: 90px; display:inline-block;">COUNTRY:</span>
                        {{ previewData.chargesOption.paymentPlace.locationCode.countryName }}
                        <br />
                        <span style="width: 90px; display:inline-block;">LOCATION ID:</span>
                        {{ previewData.chargesOption.paymentPlace.locationCode.cityUnCode }}
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      <br />
      <table cellpadding="0" cellspacing="0" border="1" width="100%">
        <tbody>
          <tr>
            <td>
              <table cellpadding="4" cellspacing="0" border="0" width="100%">
                <tbody>
                  <tr>
                    <td width="150" valign="top"><b>CLAUSES:</b></td>
                    <td>Not provided</td>
                  </tr>
                  <tr>
                    <td width="150" valign="top"><b>COMMENT:</b></td>
                    <td>
                      <pre>{{ previewData.blOption.remarks }}</pre>
                    </td>
                  </tr>
                  <tr>
                    <td width="150" valign="top"><b>BL REMARKS:</b></td>
                    <td>
                      <pre></pre>
                    </td>
                  </tr>
                  <tr>
                    <td width="150" valign="top"><b>TRANSPORT REMARKS:</b></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      <b>MEASURE FOR B/L PRODUCTION:</b>
                      <br />
                      <br />Documentation parameters as requested by submitting party: <br />
                        B/L Type: {{ previewData.blTypeStr }}
                      <template v-if="['705'].includes(previewData.blOption.blType)">
                         <div v-if="previewData.blOption.blOriginalUnfreightCount">B/L Originals: {{ previewData.blOption.blOriginalUnfreightCount }} NOT FREIGHTED </div>
                         <div v-if="previewData.blOption.blCopyUnfreightCount">B/L Copies: {{ previewData.blOption.blCopyUnfreightCount }} NOT FREIGHTED</div>
                      </template>
                      <br />B/L Comments: {{ previewData.blOption.remarks }}
                      <br />
                      <br />
                      <b>LETTER OF CREDIT:</b>
                      <br />Not provided
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      <br />
      <table cellpadding="0" cellspacing="0" border="1" width="100%">
        <tbody>
          <tr>
            <td>
              <table cellpadding="4" cellspacing="0" border="0" width="100%">
                <tbody>
                  <tr>
                    <td width="180" valign="top"><b>CONTROL TOTALS</b></td>
                    <td>As provided</td>
                  </tr>
                  <tr>
                    <td width="180" valign="top">
                      <b>TOTAL CONTAINER COUNT:</b>
                    </td>
                    <td>{{ previewData.totalsOption.containers }}</td>
                  </tr>
                  <tr>
                    <td width="180" valign="top">
                      <b>TOTAL PACKAGE COUNT:</b>
                    </td>
                    <td>{{ previewData.totalsOption.packages }}</td>
                  </tr>
                  <tr>
                    <td width="180" valign="top"><b>TOTAL WEIGHT:</b></td>
                    <td>{{ previewData.totalsOption.weight }} Kilograms</td>
                  </tr>
                  <tr>
                    <td width="180" valign="top"><b>TOTAL VOLUME:</b></td>
                    <td>{{ previewData.totalsOption.volume }} Cubic Meter</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div slot="footer">
      <el-button type="primary" size="mini" @click="close">Confirm</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  inject: ['dictAll'],
  props: {
    option: {
      type: Object,
      default: () => {},
    },
    fromCarrierSource: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      previewData: {},
    }
  },
  created() {
    this.previewData = this.option.data
    let particularsOptionList = []
    this.previewData.particularsOption.forEach((element) => {
      let { containers, cargos } = element
      if (cargos.length > 1) {
        cargos.forEach((ele, eleIndex) => {
           particularsOptionList.push({
            ...containers[0],
            cargos: ele,
            span: cargos.length,
            eleIndex
          })
        })
      } else {
        containers.forEach((ele) => {
          particularsOptionList.push({
            ...ele,
            cargos,
            span: cargos.length
          })
        })
      }
    })
    this.previewData.particularsOptionList = particularsOptionList
    let {blType} = this.previewData.blOption
    this.previewData.blTypeStr = this.$parent.$refs.blForm.blTypeList.find(item => item.value === blType)?.label || ''
    let {transport} = this.previewData.transportOption
    this.previewData.transportStr = this.$parent.$refs.transportForm.descptList.find(item => item.value === transport)?.label || ''
    let {chargeType,chargeTerm} = this.previewData.chargesOption
    this.previewData.chargeTypeStr = this.$parent.$refs.chargesForm.chargeTypeList.find(item => item.value === chargeType)?.label || ''
    this.previewData.chargeTermStr = this.$parent.$refs.chargesForm.chargeTermList.find(item => item.value === chargeTerm)?.label || ''
    console.log('预览数据：', this.previewData)
  },
  computed: {
    isCargoSmart() {
      return this.fromCarrierSource && this.fromCarrierSource === 'cargosmart'
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    mapPackageType(packageType) {
      if (!packageType) return ''
      if (typeof packageType === 'object') {
        return packageType.descpt
      } else {
        return packageType
      }
    },
  },
}
</script>

<style lang="scss" scoped>
pre {
  font-family: Tahoma, Verdana, Arial, 'Helvetica Neue', Helvetica, sans-serif;
}
.preview-dialog {
  z-index: 9999 !important;
}
.preview-cnt {
  max-height: 600px;
  overflow: auto;

  td {
    padding: 2px;
  }
  b {
    font-weight: bold;
  }
}
.cargos-item{
  margin-bottom: 10px;
}
</style>
