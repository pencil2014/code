<template>
  <div class="detail-dialog">
    <div class="dialog">
      <!-- <el-dialog :before-close="handleCancel" v-loading="boundloading" :visible.sync="options.show" class="dialog" :title="options.title"
      :modal-append-to-body='false' width="1200px"> -->
      <div class="detail-header">
        <div class="header-left">{{ options.title }}</div>
        <div class="header-right">
          <el-button v-if="['process'].includes(formData.inboundStatus)" size="mini" type="primary" @click="handleConfirm('confirm')">确认收货
          </el-button>
          <el-button v-if="['done'].includes(formData.inboundStatus)" size="mini" type="danger" @click="handleConfirm('cancel')">撤销确认收货
          </el-button>
          <el-button v-if="!isDisabled" @click="handleSubmit(false)" size="mini" type="success" :loading="btnLoading">提交</el-button>
          <el-button v-if="!isDisabled" @click="handleClose" size="mini">取消</el-button>
          <el-button v-if="isDisabled" @click="handleCancel" size="mini">返回</el-button>
        </div>
      </div>
      <el-form :inline="true" :model="formData" label-width="120px" ref="form" size="mini" :hide-required-asterisk="isDisabled">
        <el-tabs v-model="activeName">
          <el-tab-pane label="基本信息" name="baseInfo">
            <el-form-item label="客户名称：" prop="orderCustId" :rules="changeRule">
              <el-select v-model="formData.orderCustId" value-key="orderCustId" size="mini" clearable remote filterable placeholder=""
                :remote-method="(v) =>getCustomerList(v, 'cust')" @visible-change="(show) => showCustomerList(show, 'cust')"
                @change="changeCustomer" :disabled="isDisabled" class="normalInput">
                <el-option v-for="item in customerList" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="客户入仓单号：" prop="workOrderNo" :rules="blurRule">
              <el-input v-model="formData.workOrderNo" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item>
            <el-form-item label="状态：" prop="inboundStatus" :rules="changeRule">
              <el-select v-model="formData.inboundStatus" class="normalInput" disabled placeholder="">
                <el-option v-for="item in dictMap['wmsInboundStatus']" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="合同号：">
              <el-input v-model="formData.contractNo" class="normalInput" :disabled="isDisabled" maxlength="64"></el-input>
            </el-form-item>
            <!-- <el-form-item label="长帆工作单号：" prop="lsWorkOrderNo" :rules="isReqLsWorkNo ? blurRule : {}"> -->
            <el-form-item label="长帆工作单号：">
              <el-select v-model="formData.lsWorkOrderNo" value-key="lsWorkOrderNo" size="mini" clearable remote filterable placeholder=""
                :remote-method="getLsWorkOrderNoList" @visible-change="showLsWorkOrderNoList" :disabled="isDisabled" class="normalInput">
                <el-option v-for="item in lsWorkOrderNoList" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <div class="divider-line"></div>
            <p class="panel-title">入库信息</p>
            <el-form-item label="仓库名称：" prop="wmsWarehouseId" :rules="changeRule">
              <el-select v-model="formData.wmsWarehouseId" value-key="wmsWarehouseId" size="mini" clearable remote filterable placeholder=""
                :remote-method="getWarehouseList" @visible-change="showWarehouseList" @change="changeWarehouse" :disabled="isDisabled"
                class="normalInput">
                <el-option v-for="item in warehouseList" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="货物位置：" prop="wmsWarehouseInsideZoneId" :rules="changeRule">
              <el-select v-model="formData.wmsWarehouseInsideZoneId" class="normalInput" :disabled="isDisabled">
                <el-option v-for="item in insideZoneList" :key="item.wmsWarehouseInsideZoneId" :label="item.areaName"
                  :value="item.wmsWarehouseInsideZoneId">
                </el-option>
              </el-select>
            </el-form-item> -->
            <el-form-item label="入库日期：" prop="inboundTime" :rules="changeRule">
              <el-date-picker v-model="formData.inboundTime" type="datetime" prefix-icon="''" value-format="yyyy-MM-dd HH:mm:ss"
                class="normalInput boundTime" :disabled="isDisabled">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="入库人：" prop="createdName">
              <el-input v-model="formData.createdName" class="normalInput" disabled></el-input>
            </el-form-item>
            <el-form-item label="入库车牌：" prop="inboundLicensePlate" :rules="blurRule">
              <el-input v-model="formData.inboundLicensePlate" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item>
            <el-form-item label="入库柜号：" prop="inboundContainerNo">
              <el-input v-model="formData.inboundContainerNo" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item>
            <!-- <el-form-item label="理货员：" prop="tallyManId" :rules="changeRule"> -->
            <el-form-item label="理货员：">
              <el-select v-model="formData.tallyManId" value-key="tallyManId" clearable remote filterable placeholder=""
                :remote-method="getWarehouseSuperList" @visible-change="showWarehouseSuperList" @change="changeWarehouseSuperList"
                :disabled="isDisabled || formData.inboundStatus !== 'created'" class="normalInput">
                <el-option v-for="item in warehouseSuperList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="['edit', 'detail'].includes(options.type)" label="入库号：" prop="inboundNo">
              <el-input v-model="formData.inboundNo" class="normalInput" disabled></el-input>
            </el-form-item>
            <el-form-item label="入仓费收取方式：" prop="inWarehousFeeCollectType" :rules="changeRule">
              <el-select v-model="formData.inWarehousFeeCollectType" class="normalInput" @change="changeCollectType" :disabled="isDisabled"
                placeholder="">
                <el-option v-for="item in dictMap['wmsInWarehousFeeCollectType']" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="入仓费金额：" prop="inWarehousFeeAmt" :rules="blurRule">
              <el-input v-model="formData.inWarehousFeeAmt" type="number" min="0" maxlength="10" class="normalInput"
                :disabled="isDisabled || formData.inWarehousFeeCollectType === 'free'"
                @keydown.native="e=>e.returnValue=(['e','E','-','+'].includes(e.key))?'':e.returnValue">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="是否卸货拍照：" class="photo">
              <el-checkbox true-label="yes" false-label="no" v-model="formData.unloadPhoto" :disabled="isDisabled">
                {{ formData.unloadPhoto === 'yes' ? '是' : '否'}}
              </el-checkbox>
            </el-form-item>
            <el-form-item label="派单员：" prop="dispatcherName">
              <el-input v-model="formData.dispatcherName" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item>
            <el-form-item label="送货司机：" prop="deliveryDriverName">
              <el-input v-model="formData.deliveryDriverName" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item>
            <el-form-item label="送货司机手机号：" prop="dispatcherName">
              <el-input v-model="formData.deliveryDriverPhone" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item>
            <el-form-item label="入库备注：" prop="remark">
              <el-input type="textarea" v-model="formData.remark" :autosize="{ minRows: 1, maxRows: 4}" :disabled="isDisabled"
                class="longInput" maxlength="512"></el-input>
            </el-form-item>
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <div class="left-title">
                  <p class="panel-title">入库单货物明细</p>
                </div>
                <div class="right-title">
                  <el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd('goodsDetailList')">新增</el-button>
                  <el-button v-if="isShow" type="text" @click="isShow = false">收起
                    <i class="el-icon-arrow-up el-icon--right"></i>
                  </el-button>
                  <el-button v-else type="text" @click="isShow = true">展开
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                </div>
              </div>
              <el-collapse-transition>
                <div v-show="isShow" class="card-table-list">
                  <vxe-table border resizable show-overflow ref="goodsTable" size="mini" :data="formData.goodsDetailList"
                    :edit-config="{trigger: 'manual', mode: 'row', autoClear: false, showAsterisk: !isDisabled, showIcon: !isDisabled}"
                    align="center" :valid-config="{ showMessage: false }" :edit-rules="rules" empty-text=" "
                    @edit-actived="editActivedEvent">
                    <vxe-column type="seq" width="80" title="序号"></vxe-column>
                    <vxe-column field="fiberReelNo" title="货物盘号" :edit-render="{}" min-width="130">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.fiberReelNo" type="text"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="goodsName" title="货物名称" :edit-render="{}" min-width="150">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.goodsName" type="text"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="ownerId" title="货主" :edit-render="{}" min-width="200">
                      <template #default="{ row }">
                        {{ row.ownerName }}
                      </template>
                      <template #edit="{ row, rowIndex }">
                        <el-select v-model="row.ownerId" value-key="ownerId" size="mini" clearable remote filterable placeholder=""
                          :remote-method="(v) => getCustomerList(v, 'owner', rowIndex)"
                          @visible-change="(show) => showCustomerList(show, 'owner', rowIndex)"
                          @change="(v) => changeOwner(v, row, rowIndex)" :disabled="isDisabled">
                          <el-option v-for="item in row.ownerList" :key="item.value" :label="item.label" :value="item.value">
                          </el-option>
                        </el-select>
                      </template>
                    </vxe-column>
                    <vxe-column field="marks" title="唛头" :edit-render="{}" min-width="150">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.marks" type="text"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="wmsWarehouseInsideZoneId" title="库位" :edit-render="{}" min-width="150">
                      <template #default="{ row }">
                        {{ row.insideZoneName }}
                      </template>
                      <template #edit="{ row }">
                        <el-select v-model="row.wmsWarehouseInsideZoneId" filterable size="mini" @change="() => changeZone({ row })"
                          clearable placeholder="">
                          <el-option v-for="item in insideZoneList" :key="item.wmsWarehouseInsideZoneId" :label="item.areaName"
                            :value="item.wmsWarehouseInsideZoneId">
                          </el-option>
                        </el-select>
                      </template>
                    </vxe-column>
                    <vxe-column field="estimatedQuantity" title="预到数" :edit-render="{}" min-width="130">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.estimatedQuantity" type="number" min="0" max="2147483647" maxlength="9"
                          @change="changeQuantity({row})"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="actualQuantity" title="实到数" :edit-render="{}" min-width="130">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.actualQuantity" type="number" min="0" max="2147483647" maxlength="9"
                          @change="changeQuantity({row})"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="unit" title="单位" :edit-render="{}" min-width="130">
                      <template #default="{ row }">
                        {{ dictMapObj['wmsGoodsUnit'][row.unit] }}
                      </template>
                      <template #edit="{ row }">
                        <el-select v-model="row.unit" filterable size="mini" @change="changUnit({row})" clearable placeholder="">
                          <el-option v-for="pItem in dictMap['wmsGoodsUnit']" :key="pItem.value" :value="pItem.value" :label="pItem.label">
                          </el-option>
                        </el-select>
                      </template>
                    </vxe-column>
                    <vxe-column field="goodsLength" title="货物长度(cm)" :edit-render="{}" min-width="130">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.goodsLength" type="float" min="0" maxlength="11" @change="changeVolume({row})"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="goodsWidth" title="货物宽度(cm)" :edit-render="{}" min-width="130">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.goodsWidth" type="float" min="0" maxlength="11" @change="changeVolume({row})"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="goodsHigh" title="货物高度(cm)" :edit-render="{}" min-width="130">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.goodsHigh" type="float" min="0" maxlength="11" @change="changeVolume({row})"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="specification" title="规格" :edit-render="{}" min-width="160">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.specification" type="text" maxlength="100"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="unitVolume" title="单件体积(cbm)" :edit-render="{}" min-width="130">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.unitVolume" type="float" min="0" maxlength="11" @change="setTotalVolume({row})"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="unitWeight" title="单件重量(kg)" :edit-render="{}" min-width="130">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.unitWeight" type="float" min="0" maxlength="11" @change="setTotalWeight({row})"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="inventoryVolume" title="总体积(cbm)" min-width="130">
                      <!-- <template #edit="{ row }">
                        <vxe-input v-model="row.inventoryVolume" type="float" min="0" maxlength="11"></vxe-input>
                      </template> -->
                    </vxe-column>
                    <vxe-column field="inventoryWeight" title="总重量(kg)" min-width="130">
                      <!-- <template #edit="{ row }">
                        <vxe-input v-model="row.inventoryWeight" type="float" min="0" maxlength="11"></vxe-input>
                      </template> -->
                    </vxe-column>
                    <vxe-column field="remark" title="备注" :edit-render="{}" min-width="180">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.remark" type="text"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column v-if="!isDisabled && formData.goodsDetailList.length" title="操作" width="100" fixed="right">
                      <template #default="{ row, rowIndex }">
                        <template v-if="$refs.goodsTable.isActiveByRow(row)">
                          <el-link type="primary" :underline="false" @click="saveRowEvent(row, 'goodsTable')">保存</el-link>
                        </template>
                        <template v-else>
                          <el-link type="warning" :underline="false" @click="editRowEvent(row, `goodsTable`)">修改</el-link>
                        </template>
                        <el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'goodsDetailList')">删除</el-link>
                      </template>
                    </vxe-column>
                  </vxe-table>
                </div>
              </el-collapse-transition>
            </el-card>
            <!-- <el-card v-if="isDisabled" class="box-card mt10">
              <div slot="header" class="clearfix">
                <div class="left-title">
                  <p class="panel-title">作业人员</p>
                </div>
                <div class="right-title">
                  <el-button v-if="workShow" type="text" @click="workShow = false">收起
                    <i class="el-icon-arrow-up el-icon--right"></i>
                  </el-button>
                  <el-button v-else type="text" @click="workShow = true">展开
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                </div>
              </div>
              <el-collapse-transition>
                <div v-show="workShow" class="card-table-list">
                  <vxe-table v-if="isDisabled" border resizable show-overflow ref="detailTable" size="mini"
                    :data="formData.workDispatchMembers"
                    :edit-config="{trigger: 'manual', mode: 'row', autoClear: false, showAsterisk: !isDisabled, showIcon: !isDisabled}"
                    :valid-config="{ showMessage: false }" align="center" empty-text=" ">
                    <vxe-column type="seq" width="80" title="序号"></vxe-column>
                    <vxe-column field="employeeName" title="作业人员" min-width="130"></vxe-column>
                    <vxe-column field="employeeType" title="作业人员类型" min-width="150">
                      <template #default="{ row }">
                        {{ dictMapObj['warehouseEmployeeJobType'][row.employeeType] || row.employeeTypeName}}
                      </template>
                    </vxe-column>
                    <vxe-column field="feeType" title="收费方式" :edit-render="{}" min-width="150">
                      <template #default="{ row }">
                        {{ dictMapObj['wmsPerforBillingUnit'][row.feeType] }}
                      </template>
                    </vxe-column>
                    <vxe-column field="remark" title="派工备注" :edit-render="{}" min-width="250"></vxe-column>
                  </vxe-table>
                </div>
              </el-collapse-transition>
            </el-card> -->
          </el-tab-pane>
          <el-tab-pane label="客户自带辅材信息" name="materialInfo">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <div class="left-title">
                  <p class="panel-title">客户自带辅材</p>
                </div>
                <div class="right-title">
                  <el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd('consumableList')">新增</el-button>
                  <el-button v-if="mShow" type="text" @click="mShow = false">收起
                    <i class="el-icon-arrow-up el-icon--right"></i>
                  </el-button>
                  <el-button v-else type="text" @click="mShow = true">展开
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                </div>
              </div>
              <el-collapse-transition>
                <div v-show="mShow" class="card-table-list">
                  <vxe-table border resizable show-overflow ref="materialTable" size="mini" :data="formData.consumableList"
                    :edit-config="{trigger: 'manual', mode: 'row', autoClear: false, showAsterisk: !isDisabled, showIcon: !isDisabled}"
                    align="center" empty-text=" " :valid-config="{ showMessage: false }" :edit-rules="materialRules">
                    <vxe-column type="seq" width="80" title="序号"></vxe-column>
                    <vxe-column field="consumableId" title="辅材名称" :edit-render="{}" min-width="150">
                      <template #default="{ row }">
                        {{ row.consumableName }}
                      </template>
                      <template #edit="{ row, rowIndex }">
                        <el-select v-model="row.consumableId" value-key="consumableId" size="small" clearable remote filterable
                          placeholder="" :remote-method="(str) => getConsumableList(str, rowIndex)" style="width: 100%"
                          @visible-change="(s) => showConsumableList(s, rowIndex)" @change="(v) => changeConsumable(v, row, rowIndex)">
                          <el-option v-for="item in consumableList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                      </template>
                    </vxe-column>
                    <vxe-column field="unit" title="单位" min-width="150">
                      <template #default="{ row }">
                        {{ dictMapObj['wmsGoodsUnit'][row.unit] }}
                      </template>
                    </vxe-column>
                    <vxe-column field="quantity" title="数量" :edit-render="{}" min-width="150">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.quantity" type="integer"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column v-if="!isDisabled && activeName === 'materialInfo'" title="操作" width="100" fixed="right">
                      <template #default="{ row, rowIndex }">
                        <template v-if="!row.disabled">
                          <template v-if="$refs.materialTable.isActiveByRow(row)">
                            <el-link type="primary" :underline="false" @click="saveRowEvent(row, 'materialTable')">保存</el-link>
                          </template>
                          <template v-else>
                            <el-link type="warning" :underline="false" @click="editRowEvent(row, 'materialTable')">修改</el-link>
                          </template>
                          <el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'consumableList')">删除</el-link>
                        </template>
                      </template>
                    </vxe-column>
                  </vxe-table>
                </div>
              </el-collapse-transition>
            </el-card>
          </el-tab-pane>
          <el-tab-pane label="派工信息" name="dispatchInfo">
            <dispatch-detail ref="dispatchDetail" :options='formOptions' :activeName='activeName' :operType="options.type"
              @submitApi="submitApi" :isDisabled="isDisabled">
            </dispatch-detail>
          </el-tab-pane>
          <el-tab-pane v-if="formData.unloadPhoto === 'yes'" label="卸货拍照" name="dischargePic">
            <div>
              <div v-if="!isDisabled" class="mt10">
                <UploadFile ref="uploadFile" :acceptTypes="['gif','jpg','jpeg','png','bmp']" :autoUpload=true :isShowFileList=false
                  @sendFileData="getFileData">
                </UploadFile>
              </div>
              <div>
                <div v-for="(item, index) in formData.fileList" :key="item.fileNo" class="pic-box">
                  <el-image :src="`/base/fileView/preview/${item.fileNo}/sowoll`" :preview-src-list="previewSrcList">
                  </el-image>
                  <div v-if="!isDisabled">
                    <el-popconfirm title="确定删除该附件？" @onConfirm="deleteFile(index)">
                      <el-link slot="reference" type="primary">删除</el-link>
                    </el-popconfirm>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </div>
    <!-- <div class="dialog-footer" slot="footer" v-show="isSelf">
        <el-button v-if="!isDisabled" @click="handleSubmit" size="mini" type="success">提交</el-button>
        <el-button @click="handleCancel" size="mini">取消</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>
<script>
import UploadFile from '@/components/UploadFile/uploadFile'
import { queryInboundDetail, saveInboundOrderInfo, updateInBoundOrderInfo, getCustomerList, inBoundOperate } from '@/api/wms/inBound.js'
import { mapGetters, mapState } from 'vuex'
import { getMaterialMaintList } from '@/api/wms/warehouse.js'
import { warehouseEmployee, queryOrder, queryWarehousePage } from "@/api/wms.js"
import { parseTime } from '@/utils'
import actions from '@/action.js'
import dispatchDetail from './dispatchDetail'

const blurRule = { required: true, message: '此项必填', trigger: 'blur' }
const changeRule = { required: true, message: '此项必选', trigger: 'change' }
export default {
  components: { UploadFile, dispatchDetail },
  data () {
    return {
      options: {
        type: '',
        id: '',
        title: ''
      },
      activeName: 'baseInfo',
      boundloading: false,
      blurRule,
      changeRule,
      formData: {
        contractNo: '',
        lsWorkOrderNo: '',
        orderCustId: null,
        orderCustName: '',
        custClass: '',
        workOrderNo: '',
        inboundStatus: '',
        inboundOrderId: null,
        insideZoneName: '',
        insideZoneId: '',
        wmsWarehouseId: null,
        warehouseName: '',
        warehouseCode: '',
        createdName: '',
        inboundTime: parseTime(new Date().getTime()),
        inboundLicensePlate: '',
        inboundContainerNo: '',
        tallyManName: '',
        tallyManId: null,
        inboundNo: '',
        inWarehousFeeCollectType: 'monthly',
        inWarehousFeeAmt: null,
        remark: '',
        unloadPhoto: 'yes',
        goodsDetailList: [],
        fileList: [],
        consumableList: [],
        orderPush: 'no',
        dispatcherName: '',
        deliveryDriverPhone: '',
        deliveryDriverName: ''
      },
      isSelf: true,
      isDisabled: false,
      isShow: true,
      mShow: true,
      workShow: true,
      warehouseSuperList: [],
      warehouseList: [],
      customerList: [],
      rules: {
        goodsName: [{ required: true, message: '货物名称不能为空' }],
        // marks: [{ required: true, message: '唛头不能为空' }],
        // wmsWarehouseInsideZoneId: [{ required: true, message: '库位不能为空' }],
        // estimatedQuantity: [{ required: true, message: '预到数不能为空' }],
        // actualQuantity: [{ required: true, message: '实到数不能为空' }],
        // unit: [{ required: true, message: '单位不能为空' }],
        // goodsLength: [{ required: true, message: '货物长度不能为空' }],
        // goodsWidth: [{ required: true, message: '货物宽度不能为空' }],
        // goodsHigh: [{ required: true, message: '货物高度不能为空' }],
        // unitVolume: [{ required: true, message: '单件体积不能为空' }]
      },
      materialRules: {
        consumableId: [{ required: true, message: '辅材名称不能为空', trigger: 'change' }],
        quantity: [{ required: true, message: '数量不能为空', trigger: 'change' }]
      },
      previewSrcList: [],
      insideZoneList: [],
      fileListSever: [],
      inWarehousFeeAmt: null,
      consumableList: [],
      cbmDisabled: false,
      isReqLsWorkNo: false,
      lsWorkOrderNoList: [],
      btnLoading: false,
      formOptions: {
        data: {}
      },
      dispatchInfo: {},
      done: null,
      instance: null
    }
  },
  created () {
    this.options = this.$route.query
    this.isDisabled = this.options.type === 'detail'
    if (this.options.id) {
      this.getInboundDetail()
    } else {
      this.$nextTick(() => {
        this.initData()
      })
    }
  },
  activated () {
    this.options = this.$route.query
    this.isDisabled = this.options.type === 'detail'
    // 新增入库信息路由存在缓存属性，进入该页面，如果已存在该tab，则将数据缓存；反之清除缓存信息
    if (this.options.type === 'add') {
      let tag = JSON.parse(sessionStorage.getItem('store')).tags
      if (tag && tag.length) {
        let valid = tag.some(item => item.code === 'InBoundAdd')
        if (!valid) { // 如果不存在新增入库tab，清空缓存数据
          this.$nextTick(() => {
            this.initData()
          })
        }
      }
    } else {
      this.getInboundDetail()
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    ...mapState({
      userInfo: (state) => state.user
    })
  },
  watch: {
    'formData.unloadPhoto' (val) {
      if (val === 'no') {
        this.formData.fileList = []
      }
    },
    formData: {
      handler (newVal) {
        this.formOptions.data = newVal
      },
      deep: true
    }
  },
  methods: {
    /**
     * @description: 初始化页面数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-30 11:36:28
     */
    initData () {
      // 重置校验
      this.$refs.form.resetFields()
      // 新增时重置数据
      this.formData = this.$options.data().formData
      this.formData.inboundStatus = 'created'
      this.formData.createdName = (localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).userName) ? JSON.parse(localStorage.getItem('userInfo')).userName : this.userInfo.name
    },
    /**
     * @description: 获取长帆工作单号
     * @param {*} str
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-23 16:16:40
     */
    getLsWorkOrderNoList (str) {
      let data = {
        orderNo: str
      }
      queryOrder(data).then(({ code, data }) => {
        if (code === 0) {
          this.lsWorkOrderNoList = (data || []).map(item => {
            return { ...item, label: item.orderNo, value: item.orderNo }
          })

        }
      }).catch(() => { })
    },
    showLsWorkOrderNoList (show) {
      show && this.getLsWorkOrderNoList('')
    },
    /**
     * @description: 改变入仓费收取方式
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-08 12:45:21
     */
    changeCollectType (val) {
      if (val === 'free') {
        this.formData.inWarehousFeeAmt = 0
      } else if (val === 'monthly') {
        let find = this.warehouseList.find(item => item.value === this.formData.wmsWarehouseId)
        this.inWarehousFeeAmt = find?.inWarehousFeeAmt
        this.formData.inWarehousFeeAmt = this.inWarehousFeeAmt
      }
    },
    /**
     * @description: 填写长宽高时，计算体积
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-02 12:19:30
     */
    changeVolume ({ row }) {
      if (row.goodsLength && row.goodsWidth && row.goodsHigh) {
        row.unitVolume = Number((row.goodsLength * row.goodsWidth * row.goodsHigh) / 1000000).toFixed(2)
      } else {
        row.unitVolume = 0.00
      }
      this.setTotalVolume({ row })
      if ((row.goodsLength || [0, '0'].includes(row.goodsLength)) && (row.goodsWidth || [0, '0'].includes(row.goodsWidth)) && (row.goodsHigh || [0, '0'].includes(row.goodsHigh))) {
        row.specification = row.goodsLength + '*' + row.goodsWidth + '*' + row.goodsHigh
      } else {
        row.specification = ''
      }
    },
    /**
     * @description: 设置总体积
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-20 14:21:16
     */
    setTotalVolume ({ row }) {
      if ((row.actualQuantity || row.estimatedQuantity) && row.unitVolume) {
        let quantity = row.actualQuantity || row.estimatedQuantity
        row.inventoryVolume = Number(quantity * row.unitVolume).toFixed(2)
      } else {
        row.inventoryVolume = 0.00
      }
    },
    /**
     * @description: 设置总重量
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-20 14:27:22
     */
    setTotalWeight ({ row }) {
      if ((row.actualQuantity || row.estimatedQuantity) && row.unitWeight) {
        let quantity = row.actualQuantity || row.estimatedQuantity
        row.inventoryWeight = Number(quantity * row.unitWeight).toFixed(2)
      } else {
        row.inventoryWeight = 0.00
      }
    },
    /**
     * @description: 修改预出数/实出数回调
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-20 14:26:41
     */
    changeQuantity ({ row }) {
      this.setTotalVolume({ row })
      this.setTotalWeight({ row })
    },
    /**
     * @description: 是否禁止编辑单件体积
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-20 15:49:38
     */
    editActivedEvent ({ row }) {
      if (row) {
        this.cbmDisabled = row.unit !== 'stray'
      }
    },
    /**
     * @description: 切换货物单位明细
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-20 15:58:36
     */
    changUnit ({ row }) {
      if (row.unit !== 'stray') {
        this.cbmDisabled = true
        this.changeVolume({ row })
      } else {
        this.cbmDisabled = false
      }
    },
    /**
     * @description: 获取客户列表
     * @param {*} str
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-02 11:53:35
     */
    getCustomerList (str = '', type, index) {
      if (str === '') {
        if (type === 'cust') {
          str = this.formData.orderCustName || ''
        } else {
          str = this.formData.goodsDetailList[index].ownerName || ''
        }
      }
      let data = {
        name: str
      }
      let list = []
      getCustomerList(data).then(({ code, data }) => {
        if (code === 0) {
          list = (data || []).map(item => {
            return { ...item, label: item.name || item.ename, value: item.custid }
          })
          if (type === 'cust') {
            this.customerList = list
            // 设置长帆工作单号必填性
            // let find = this.customerList.find(item => item.custid === this.formData.custId)
            // if (find) {
            //   this.isReqLsWorkNo = find.custClass === 'department'
            // }
          } else {
            str = this.formData.goodsDetailList[index].ownerList = list
          }
        }
      }).catch(() => { })
    },
    showCustomerList (show, type, index) {
      show && this.getCustomerList('', type, index)
    },
    /**
     * @description: 切换客户
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-21 12:25:29
     */
    changeCustomer (val) {
      let find = this.customerList.find(item => item.custid === val)
      this.formData.orderCustName = find?.label
      this.formData.custClass = find?.custClass
      // 设置长帆工作单号必填性
      // if (find) {
      //   this.isReqLsWorkNo = find.custClass === 'department'
      // }
    },
    /**
     * @description: 切换货主回调
     * @param {*} val
     * @param {*} row
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-21 12:25:12
     */
    changeOwner (val, row, index) {
      let find = this.formData.goodsDetailList[index].ownerList.find(item => item.custid === val)
      row.ownerName = find?.label
    },
    /**
     * @description: 获取仓库负责人列表数据
     * @param {*} str 输入框参数
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-22 15:19:15
     */
    getWarehouseSuperList (str = '') {
      if (this.formData.wmsWarehouseId) {
        let query = [
          { column: 'employeeName', type: 'in', value: str || '' },
          { column: 'warehouseId', type: 'eq', value: this.formData.wmsWarehouseId || '' },
          { column: 'jobType', type: 'eq', value: 'tallyman' }
        ]
        let data = {
          currPage: 1,
          pageSize: 20,
          query
        }
        warehouseEmployee(data).then(({ code, data }) => {
          if (code === 0) {
            this.warehouseSuperList = (data.list || []).map(item => {
              return { ...item, label: item.employeeName, value: item.employeeId }
            })

          }
        }).catch(() => { })
      }
    },
    /**
     * @description: 显示仓管负责人下拉框时回调
     * @param {*} show 显示下拉框
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-22 15:52:29
     */
    showWarehouseSuperList (show) {
      show && this.getWarehouseSuperList('')
    },
    /**
     * @description: 切换仓管负责人时回调
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-22 15:53:53
     */
    changeWarehouseSuperList (val) {
      let find = this.warehouseSuperList.find(item => item.value === val)
      this.formData.tallyManName = find?.label
    },
    getWarehouseList (str = '') {
      let data = {
        currPage: 1,
        pageSize: 30,
        query: [{
          column: "employeeId",
          type: "eq",
          value: JSON.parse(localStorage.getItem('userInfo')).sysUserId
        }]
      }
      if (str) {
        data.query.push({
          column: "warehouseName",
          type: "like",
          value: str
        })
      }
      queryWarehousePage(data)
        .then(({ code, data }) => {
          if (code === 0) {
            this.warehouseList = (data.list || []).map(item => {
              return { ...item, label: item.warehouseName, value: item.wmsWarehouseId }
            })
            let find = this.warehouseList.find(item => item.value === this.formData.wmsWarehouseId)
            this.insideZoneList = find?.wmsWarehouseInsideZones
          }
        })
        .finally(() => {
        })
    },
    showWarehouseList (show) {
      show && this.getWarehouseList('')
    },
    changeWarehouse (val) {
      let find = this.warehouseList.find(item => item.value === val)
      this.inWarehousFeeAmt = find?.inWarehousFeeAmt
      this.formData.warehouseCode = find?.warehouseCode
      this.formData.warehouseName = find?.warehouseName
      if (this.formData.inWarehousFeeCollectType === 'monthly') {
        this.formData.inWarehousFeeAmt = find?.inWarehousFeeAmt
      }
      this.insideZoneList = find?.wmsWarehouseInsideZones
    },
    changeZone ({ row }) {
      let find = this.insideZoneList.find(item => item.wmsWarehouseInsideZoneId === row.wmsWarehouseInsideZoneId)
      row.insideZoneName = find?.areaName
    },
    /**
     * @description: 获取辅材列表
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-24 15:23:05
     */
    getConsumableList (str = '') {
      let data = {
        currPage: 1,
        pageSize: 30,
        query: []
      }
      if (str) {
        data.query.push({
          column: "consumableName",
          type: "like",
          value: str
        })
      }
      getMaterialMaintList(data)
        .then(({ code, data }) => {
          if (code === 0) {
            this.consumableList = (data.list || []).map(item => {
              return { ...item, label: item.consumableName, value: item.consumableId }
            })
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    showConsumableList (show, index) {
      show && this.getConsumableList('', index)
    },
    changeConsumable (val, row, index) {
      let find = this.consumableList.find(item => item.value === val)
      row.wharfYardCode = find?.wharfYardCode
      row.consumableNo = find?.consumableNo
      row.consumableName = find?.consumableName
      row.specificationType = find?.specificationType
      row.unit = find?.unit
    },
    /**
     * @description: 获取入库信息详情
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-18 15:16:39
     */
    getInboundDetail () {
      let data = {
        inboundOrderId: this.options.id || this.formData.inboundOrderId
      }
      this.boundloading = true
      queryInboundDetail(data)
        .then(({ code, data }) => {
          if (code === 0) {
            this.formData = Object.assign({}, this.formData, data)
            this.isDisabled = ['done'].includes(this.formData.inboundStatus)
            // 获取派工信息
            this.formOptions.data = this.formData.dispatchDetail
            this.fileListSever = this.formData.fileList
            this.getWarehouseList()
            this.getCustomerList('', 'cust')
            this.getWarehouseSuperList()
            if (this.fileListSever.length) {
              this.fileListSever.forEach(item => {
                this.previewSrcList.push(`/base/fileView/preview/${item.fileNo}/sowoll`)
              })
            }
            if (this.formData.goodsDetailList && this.formData.goodsDetailList.length) {
              this.formData.goodsDetailList.forEach((row, index) => {
                this.getCustomerList('', 'owner', index)
              })
            }
            // 控制客户自带辅材不能修改、删除
            if (this.formData.consumableList && this.formData.consumableList.length) {
              this.formData.consumableList = this.formData.consumableList.map(item => {
                return {
                  ...item,
                  disabled: true
                }
              })
            }
            // 作业人员过滤掉理货员信息
            // this.formData.workDispatchMembers = (this.formData.workDispatchMembers || []).filter(item => item.employeeType !== 'tallyman')
            this.$nextTick(() => {
              if (this.isDisabled) {
                this.$refs.form.clearValidate()
              }
            })
          }
        }).finally(() => {
          this.boundloading = false
        })
    },
    /**
     * @description: 新增【入库单货物明细】
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:31:01
     */
    handleAdd (list) {
      if (list === 'goodsDetailList') {
        this.formData.goodsDetailList.push(
          {
            fiberReelNo: '',
            goodsName: '',
            ownerName: '',
            ownerId: null,
            marks: '',
            specification: '',
            estimatedQuantity: '',
            actualQuantity: '',
            unit: '',
            goodsLength: '',
            goodsWidth: '',
            goodsHigh: '',
            unitVolume: '',
            unitWeight: '',
            remark: '',
            ownerList: []
          }
        )
        this.editRowEvent(this.formData.goodsDetailList[this.formData.goodsDetailList.length - 1], 'goodsTable')
      } else if (list === 'consumableList') {
        this.formData.consumableList.push(
          {
            consumableId: null,
            consumableName: "",
            unit: "",
            quantity: null
          }
        )
        this.editRowEvent(this.formData.consumableList[this.formData.consumableList.length - 1], 'materialTable')
      }
    },
    /**
     * @description: 编辑【入库单货物明细】行数据
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:31:18
     */
    editRowEvent (row, table) {
      const $table = this.$refs[table]
      $table.setActiveRow(row)
    },
    /**
     * @description: 前端保存【入库单货物明细】行数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:32:04
     */
    async saveRowEvent (row, table) {
      const $table = this.$refs[table]
      const errMap = await $table.validate(row).catch(errMap => errMap)
      if (errMap) {
        // if (table === 'goodsTable' ) {
        //   this.$message.error("")
        // }
        return false
      } else {
        $table.clearActived()
      }
    },
    /**
     * @description: 移除【入库单货物明细】行数据
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:14:47
     */
    removeRowEvent (index, list) {
      this.formData[list].splice(index, 1)
    },
    /**
     * @description: 提交数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 11:28:53
     */
    handleSubmit (isDelivery) {
      debugger
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (!this.formData.goodsDetailList.length) {
            isDelivery && this.doneInstance()
            return this.$message.error("请填写入库单货物明细信息！")
          } else {
            this.validInfo(isDelivery)
          }
        } else {
          isDelivery && this.doneInstance()
          return this.$message.error("请将入库信息必填内容填写完整！")
        }
      })
    },
    /**
     * @description: 校验入库单货物明细信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-25 17:51:07
     */
    async validInfo (isDelivery) {
      const $xTable = this.$refs.goodsTable
      const errMap = await $xTable.validate(true).catch(errMap => errMap)
      if (errMap) {
        isDelivery && this.doneInstance()
        return this.$message.error('库单货物明细信息校验不通过!');
      } else {
        // 规格和单件重量必填一个
        // let flag = this.formData.goodsDetailList.every(item => (item.specification && !['0*0*0', 0, '0'].includes(item.specification)) || (item.unitWeight && !['0', 0].includes(item.unitWeight)))
        // if (!flag) {
        //   return this.$message.error("入库单货物明细的规格和单件重量必须填写一个！")
        // }
        // 2022-9-20 如果货物单位为散杂，长宽高体积可以为空，否则不能为空
        let validUnit = this.formData.goodsDetailList.some(item => item.unit && item.unit !== 'stray' && (!(item.goodsLength && item.goodsWidth && item.goodsHigh)))
        if (validUnit) {
          isDelivery && this.doneInstance()
          return this.$message.error("货物单位不是散杂时，长宽高不能为空！")
        }
        // 单独校验单件体积
        // let validate = this.formData.goodsDetailList.every(item => item.unitVolume && ![0, '0', '0.00', 0.00].includes(item.unitVolume) && ![0].includes(Number(item.unitVolume).toFixed(0)))
        // if (!validate) {
        //   return this.$message.error("货物单件体积不能为空或0！")
        // }
        // if (this.options.type === 'edit') {
        // 如果是修改，校验一下客户自带辅材
        if (this.formData.consumableList.length) {
          this.validConsumable(isDelivery)
        } else {
          // 校验派工信息
          this.validDispatchInfo(isDelivery)
        }
        // } else {
        //   this.submitApi()
        // }
      }
    },
    /**
     * @description: 校验客户自带辅材必填项
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-15 17:35:51
     */
    async validConsumable (isDelivery) {
      const $xTable = this.$refs.materialTable
      const errMap = await $xTable.validate(true).catch(errMap => errMap)
      if (errMap) {
        isDelivery && this.doneInstance()
        this.$message.error('客户自带辅材信息校验不通过!');
      } else {
        let valZero = this.formData.consumableList.every(item => Number(item.quantity) > 0)
        if (!valZero) {
          isDelivery && this.doneInstance()
          this.$message.error(`客户自带辅材的数量不能≤0！`)
        } else {
          // 校验派工信息
          this.validDispatchInfo(isDelivery)
        }
      }
    },
    /**
     * @description: 校验派工信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-10-31 16:46:45
     */
    validDispatchInfo (isDelivery) {
      this.dispatchInfo = this.$refs.dispatchDetail.formData
      if (this.dispatchInfo.workTeamId) {
        this.$refs.dispatchDetail.handleSubmit()
      } else {
        this.submitApi(isDelivery)
      }
    },
    /**
     * @description: 调用录入/修改入库信息接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-22 20:15:21
     */
    submitApi (isDelivery) {
      let data = JSON.parse(JSON.stringify(this.formData))
      if (data.goodsDetailList.length) {
        data.goodsDetailList.forEach(item => {
          item.estimatedQuantity = !['', null, undefined].includes(item.estimatedQuantity) ? Number(item.estimatedQuantity) : null
          item.actualQuantity = !['', null, undefined].includes(item.actualQuantity) ? Number(item.actualQuantity) : null
          item.goodsLength = ['', null].includes(item.goodsLength) ? item.goodsLength : Number(item.goodsLength)
          item.goodsWidth = ['', null].includes(item.goodsWidth) ? item.goodsWidth : Number(item.goodsWidth)
          item.goodsHigh = ['', null].includes(item.goodsHigh) ? item.goodsHigh : Number(item.goodsHigh)
          item.unitVolume = Number(item.unitVolume)
          item.unitWeight = Number(item.unitWeight)
          item.ownerId = Number(item.ownerId) || null
          this.$delete(item, 'ownerList')
          this.$delete(item, '_XID')
        })
      }
      if (data.consumableList.length) {
        data.consumableList = data.consumableList.filter(item => !item.disabled)
        data.consumableList = data.consumableList.map(item => {
          return {
            ...item,
            inventoryQuantity: item.quantity
          }
        })
      }
      let method = ''
      if (this.options.type === 'add' && !this.formData.inboundOrderId) {
        method = saveInboundOrderInfo
      } else if (this.options.type === 'edit' || this.formData.inboundOrderId) {
        method = updateInBoundOrderInfo
      }
      // 组织派工信息、组织理货员信息
      if (this.dispatchInfo.workTeamId) {
        data.workDispatch = JSON.parse(JSON.stringify(this.dispatchInfo))
        // 有理货员信息
        if (this.dispatchInfo.tallyManId) {
          let tallyManData = this.$refs.dispatchDetail.tallyManList.filter(item => item.employeeId === this.dispatchInfo.tallyManId)
          data.workDispatch.members = [...data.workDispatch.members, ...tallyManData]
        }
        if (data?.workDispatch?.members?.length) {
          data.workDispatch.members = data.workDispatch.members.map(item => {
            return {
              ...item,
              workTeamId: this.dispatchInfo.workTeamId
            }
          })
        }
      }
      if (!isDelivery) this.btnLoading = true
      method(data).then(({ code }) => {
        if (code === 0) {
          !isDelivery && this.$message.success("操作成功！")
          if (this.options.type === 'edit' || this.formData.inboundOrderId) {
            this.btnLoading = false
            if (!isDelivery) {
              this.getInboundDetail()
            } else {
              this.confirmApi('confirm', data.inboundOrderId)
            }
          } else {
            setTimeout(() => {
              this.btnLoading = false
              this.handleClose()
            }, 1000)
          }
        } else {
          this.btnLoading = false
        }
      }).catch(() => {
        this.btnLoading = false
      })
    },
    /**
     * @description: 确认收货/撤销确认收货
     * @param {*} type
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-11-02 16:07:56
     */
    handleConfirm (type) {
      let inboundOrderId = this.options.id || this.formData.inboundOrderId
      if (inboundOrderId) {
        this.$msgbox({
          title: '提示',
          message: `确定要${type === 'confirm' ? '确认收货' : '撤销确认收货'}吗？`,
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '确定中...'
              this.done = () => {
                done()
              }
              this.instance = instance
              if (type === 'confirm') {
                this.handleSubmit(true)
              } else {
                this.confirmApi(type, inboundOrderId)
              }
            } else {
              done();
            }
          }
        }).then(action => {

        }).catch(() => {
          this.instance.confirmButtonLoading = false
        })
      } else {
        this.$message.error("入库单主键缺失！")
      }
    },
    /**
     * @description: 结束等待确定收货提示状态
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-11-02 18:43:35
     */
    doneInstance () {
      this.done()
      this.instance.confirmButtonLoading = false
    },
    /**
     * @description: 调用（撤销）确认收货接口
     * @param {*} type
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-11-02 17:20:12
     */
    confirmApi (type, inboundOrderId) {
      let data = {
        inboundOrderIds: [inboundOrderId],
        confirmType: type
      }
      inBoundOperate(data).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功！')
          this.getInboundDetail()
        }
      }).finally(() => {
        this.doneInstance()
      })
    },
    /**
     * @description: 关闭弹框
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:13:44
     */
    handleCancel () {
      this.$router.push({ name: 'InBound' })
    },
    /**
     * @description: 关闭当前Tab页
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-30 11:40:24
     */
    handleClose () {
      actions.actions.delGlobalTag({ code: this.$route.name })
      this.initData()
      this.handleCancel()
    },
    /**
     * @description: 解除文件异步上传成功后接口返回的参数
     * @param {*} data
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-24 11:16:44
     */
    getFileData (data) {
      this.formData.fileList = [...this.fileListSever, ...data]
      this.formData.fileList.forEach(item => {
        this.previewSrcList.push(`/base/fileView/preview/${item.fileNo}/sowoll`)
      })
    },
    /**
     * @description: 删除附件
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-30 16:37:18
     */
    deleteFile (index) {
      this.formData.fileList.splice(index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
.detail-dialog {
  /deep/ .el-dialog {
    margin: 5vh auto 0 !important;
    .el-dialog__body {
      height: 515px;
    }
  }
}
.pic-box {
  width: 120px;
  height: 140px;
  text-align: center;
  float: left;
}
/deep/ .el-image {
  width: 100px;
  height: 100px;
  margin: 10px;
}
/deep/ .el-checkbox__label {
  font-size: 12px;
}
.photo {
  /deep/ .el-form-item__content {
    width: 297px !important;
  }
}
/deep/ .col--valid-error {
  .el-input__inner {
    border-color: #f56c6c;
  }
}
</style>