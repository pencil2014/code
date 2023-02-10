<template>
  <div class="detail-dialog">
    <div class="dialog">
      <div class="detail-header">
        <div class="header-left">{{ options.title }}</div>
        <div class="header-right">
          <el-button v-if="['process'].includes(formData.outboundStatus)" size="mini" type="primary" @click="handleConfirm('confirm')">确认出库
          </el-button>
          <el-button v-if="['done'].includes(formData.outboundStatus)" size="mini" type="danger" @click="handleConfirm('cancel')">撤销确认出库
          </el-button>
          <el-button v-if="!isDisabled && activeName === 'baseInfo'" @click="handleInventory" size="mini" type="primary">选择库存出库</el-button>
          <el-button v-if="!isDisabled" @click="handleSubmit(false)" size="mini" type="success" :loading="btnLoading">提交</el-button>
          <el-button v-if="!isDisabled" @click="handleClose" size="mini">取消</el-button>
          <el-button v-if="isDisabled" @click="handleCancel" size="mini">返回</el-button>
        </div>
      </div>
      <!-- <el-dialog :before-close="handleCancel" v-loading="boundloading" :visible.sync="options.show" class="dialog" :title="options.title"
      :modal-append-to-body='false' width="1200px"> -->
      <el-form :inline="true" :model="formData" label-width="120px" ref="form" size="mini" :hide-required-asterisk="isDisabled">
        <el-tabs v-model="activeName">
          <el-tab-pane label="出库信息" name="baseInfo">
            <p class="panel-title">基本信息</p>
            <div class="checkbox">
              <el-form-item label=" " label-width="40px">
                <!-- <el-checkbox true-label="yes" false-label="no" v-model="formData.hasCopyNo" :disabled="isDisabled">抄号</el-checkbox> -->
                <el-checkbox true-label="yes" false-label="no" v-model="formData.hasCarrayOverweight" :disabled="isDisabled">提柜过磅
                </el-checkbox>
                <el-checkbox true-label="yes" false-label="no" v-model="formData.hasReturnOverweight" :disabled="isDisabled">还柜过磅
                </el-checkbox>
                <el-checkbox true-label="yes" false-label="no" v-model="formData.hasDisinfect" :disabled="isDisabled">消毒放药</el-checkbox>
                <el-checkbox true-label="yes" false-label="no" v-model="formData.hasDoubleLayerWinch" :disabled="isDisabled">双层缆盘
                </el-checkbox>
                <el-checkbox true-label="yes" false-label="no" v-model="formData.hasThreeLayerWinch" :disabled="isDisabled">三层缆盘
                </el-checkbox>
                <el-checkbox true-label="yes" false-label="no" v-model="formData.hasSelfVehicle" :disabled="isDisabled"
                  @change="changeSelfVehicle">自派车</el-checkbox>
              </el-form-item>
            </div>
            <el-form-item label="出库号：" v-if="isInventory">
              <el-input v-model="formData.outboundNo" class="normalInput" disabled></el-input>
            </el-form-item>
            <el-form-item label="客户名称：" prop="custId" :rules="changeRule">
              <el-select v-model="formData.custId" value-key="custId" size="mini" clearable remote filterable placeholder=""
                :remote-method="getCustomerList" @visible-change="showCustomerList" @change="changeCustomer" :disabled="isDisabled"
                class="normalInput">
                <el-option v-for="item in customerList" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="入库号：" v-if="isInventory">
              <el-input v-model="formData.inboundNos" class="normalInput" disabled></el-input>
            </el-form-item>
            <el-form-item label="入库时间：" v-if="isInventory">
              <el-input v-model="formData.inboundTime" class="normalInput" disabled></el-input>
            </el-form-item>
            <el-form-item label="状态：">
              <el-select v-model="formData.outboundStatus" class="normalInput" disabled placeholder="">
                <el-option v-for="item in dictMap['wmsOutboundStatus']" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="船司订舱号：">
              <el-input v-model="formData.shippingBookNo" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item>
            <!-- <el-form-item label="船司名称：">
              <el-input v-model="formData.shipName" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item> -->
            <el-form-item label="船司编号：">
              <el-input v-model="formData.shipNo" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item>
            <el-form-item label="合同号：">
              <el-input v-model="formData.contractNo" class="normalInput" :disabled="options.type !== 'add'"></el-input>
            </el-form-item>
            <!-- <el-form-item label="长帆工作单号：" prop="lsWorkOrderNo" :rules="isReqLsWorkNo ? blurRule : {}"> -->
            <el-form-item label="长帆工作单号：">
              <el-select v-model="formData.lsWorkOrderNo" value-key="lsWorkOrderNo" size="mini" clearable remote filterable placeholder=""
                :remote-method="getLsWorkOrderNoList" @visible-change="showLsWorkOrderNoList" :disabled="isDisabled || lsDisabled"
                :style="{width: lsDisabled ?  `270px` : `297px`}">
                <el-option v-for="item in lsWorkOrderNoList" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
              <el-tooltip v-if="lsDisabled" style="margin-left: 10px;" effect="light" content="当前出库单已录费用结算单位涉及分公司，需要先删除费用后再修改长帆工作单号。"
                placement="top-end">
                <i class="el-icon-question" style="font-size: 16px;color: #a5a5a5;"></i>
              </el-tooltip>
            </el-form-item>
            <div class="divider-line"></div>
            <p class="panel-title">出库信息</p>
            <el-form-item label="仓库名称：" prop="wmsWarehouseId" :rules="changeRule">
              <el-select v-model="formData.wmsWarehouseId" value-key="wmsWarehouseId" size="mini" clearable remote filterable placeholder=""
                :remote-method="getWarehouseList" @visible-change="showWarehouseList" @change="changeWarehouse" :disabled="isDisabled"
                class="normalInput">
                <el-option v-for="item in warehouseList" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="出库日期：" prop="outboundTime" :rules="changeRule">
              <el-date-picker v-model="formData.outboundTime" type="datetime" prefix-icon="''" value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择" class="normalInput boundTime" :disabled="isDisabled">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="出库人：" prop="createdName">
              <el-input v-model="formData.createdName" class="normalInput" disabled></el-input>
            </el-form-item>
            <el-form-item label="理货员：">
              <el-select v-model="formData.tallyManId" value-key="tallyManId" clearable remote filterable placeholder=""
                :remote-method="getWarehouseSuperList" @visible-change="showWarehouseSuperList" @change="changeWarehouseSuperList"
                :disabled="isDisabled || formData.outboundStatus !== 'created'" class="normalInput">
                <el-option v-for="item in warehouseSuperList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="装货车牌：" prop="licensePlate" :rules="formData.hasSelfVehicle === 'yes' ? blurRule : changeRule">
              <el-input v-if="formData.hasSelfVehicle === 'yes'" v-model="formData.licensePlate" class="normalInput" :disabled="isDisabled">
              </el-input>
              <el-select v-else v-model="formData.licensePlate" value-key="licensePlate" size="mini" clearable remote filterable
                placeholder="" allow-create default-first-option :remote-method="getTruckList" @visible-change="showTruckList"
                @change="changeTruck" :disabled="isDisabled" class="normalInput">
                <el-option v-for="item in truckList" :key="item.value" :label="`${item.label}（${item.teamName}）`" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="司机姓名：">
              <el-input v-model="formData.driverName" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item>
            <el-form-item label="司机电话：">
              <el-input v-model="formData.driverPhone" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item>
            <el-form-item label="柜型：" prop="cabinetType" :rules="changeRule">
              <el-select v-model="formData.cabinetType" class="normalInput" :disabled="isDisabled" placeholder="">
                <template v-for="item in dictMap['wmsContainerType']">
                  <el-option :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </template>
              </el-select>
            </el-form-item>
            <el-form-item label="集装箱号：">
              <el-input v-model="formData.containerNo" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item>
            <el-form-item label="箱皮重：">
              <vxe-input v-model="formData.boxWeight" type="float" step="1" min="0" maxlength="8" size="mini" class="normalInput"
                @keydown.native="e=>e.returnValue=(['e','E','-','+'].includes(e.key))?'':e.returnValue" :disabled="isDisabled">
                <template #suffix>kg</template>
              </vxe-input>
            </el-form-item>
            <el-form-item label="封条号：">
              <el-input v-model="formData.sealNo" class="normalInput" :disabled="isDisabled"></el-input>
            </el-form-item>
            <el-form-item label="是否装货拍照：" class="photo">
              <el-checkbox true-label="yes" false-label="no" v-model="formData.hasDischargePicture" :disabled="isDisabled">
                {{ formData.hasDischargePicture === 'yes' ? '是' : '否'}}
              </el-checkbox>
            </el-form-item>
            <el-form-item label="提柜地点：">
              <el-select v-model="formData.carryWharfYardId" value-key="carryWharfYardId" clearable remote filterable placeholder=""
                :remote-method="(v) => getWharfYardList(v, 'carry')" @visible-change="(s) => showWharfYardList(s, 'carry')"
                @change="v => changeWharfYard(v, 'carry')" :disabled="isDisabled" class="normalInput">
                <el-option v-for="(item, index) in carryWharfYardList" :key="item.wharfYardId + `${index}`" :label="item.wharfYardName"
                  :value="item.wharfYardId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="还柜地点：">
              <el-select v-model="formData.backWharfYardId" value-key="backWharfYardId" clearable remote filterable placeholder=""
                :remote-method="(v) => getWharfYardList(v, 'back')" @visible-change="(s) => showWharfYardList(s, 'back')"
                @change="v => changeWharfYard(v, 'back')" :disabled="isDisabled" class="normalInput">
                <el-option v-for="(item, index) in backWharfYardList" :key="item.wharfYardId + `${index}`" :label="item.wharfYardName"
                  :value="item.wharfYardId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="是否异地：">
              <el-select v-model="formData.hasOffsite" class="normalInput" :disabled="isDisabled" placeholder="">
                <el-option v-for="item in dictMap['yesNo']" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
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
            <el-form-item label="出库备注：" prop="remark">
              <el-input type="textarea" v-model="formData.remark" :autosize="{ minRows: 1, maxRows: 4}" :disabled="isDisabled"
                class="longInput" maxlength="512"></el-input>
            </el-form-item>
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <div class="left-title">
                  <p class="panel-title">出库单货物明细</p>
                </div>
                <div class="right-title">
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
                  <vxe-table border resizable show-overflow ref="detailTable" size="mini" :data="formData.detailList"
                    :edit-config="{trigger: 'manual', mode: 'row', autoClear: false, showAsterisk: !isDisabled, showIcon: !isDisabled}"
                    :valid-config="{ showMessage: false }" align="center" empty-text=" " :edit-rules="rules">
                    <vxe-column type="seq" width="80" title="序号"></vxe-column>
                    <vxe-column field="inboundNo" title="入库单号" min-width="130"></vxe-column>
                    <vxe-column field="inboundDeteailNo" title="入库明细单号" min-width="130"></vxe-column>
                    <vxe-column field="workOrderNo" title="客户入仓单号" min-width="130"></vxe-column>
                    <vxe-column field="goodsName" title="货物名称" min-width="150"></vxe-column>
                    <vxe-column field="unit" title="单位" min-width="130">
                      <template #default="{ row }">
                        {{ dictMapObj['wmsGoodsUnit'][row.unit] }}
                      </template>
                    </vxe-column>
                    <vxe-column field="marks" title="唛头" min-width="150"></vxe-column>
                    <vxe-column field="goodsLength" title="货物长度(cm)" min-width="130"></vxe-column>
                    <vxe-column field="goodsWidth" title="货物宽度(cm)" min-width="130"></vxe-column>
                    <vxe-column field="goodsHigh" title="货物高度(cm)" min-width="130"></vxe-column>
                    <vxe-column field="specification" title="规格" min-width="130"></vxe-column>
                    <vxe-column field="unitVolume" title="单件体积(cbm)" min-width="130"></vxe-column>
                    <vxe-column field="unitWeight" title="单件重量(kg)" min-width="130"></vxe-column>
                    <vxe-column field="estimatedQuantity" title="预出数" :edit-render="{}" min-width="130">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.estimatedQuantity" type="number" min="0" max="2147483647" maxlength="9"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="actualQuantity" title="实出数" :edit-render="{}" min-width="130">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.actualQuantity" type="number" min="0" max="2147483647" maxlength="9"
                          @change="changeActualQuantity({row})"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="volume" title="总体积(cbm)" min-width="130">
                      <!-- <template #edit="{ row }">
                        <vxe-input v-model="row.unitVolume" type="float" min="0" maxlength="11"></vxe-input>
                      </template> -->
                    </vxe-column>
                    <vxe-column field="weight" title="总重量(kg)" min-width="130">
                      <!-- <template #edit="{ row }">
                        <vxe-input v-model="row.unitWeight" type="float" min="0" maxlength="11"></vxe-input>
                      </template> -->
                    </vxe-column>
                    <vxe-column field="remark" title="货物出库备注" :edit-render="{}" min-width="180">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.remark" type="text"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column v-if="!isDisabled && activeName === 'baseInfo'" title="操作" width="100" fixed="right">
                      <template #default="{ row, rowIndex }">
                        <template v-if="$refs.detailTable.isActiveByRow(row)">
                          <el-link type="primary" :underline="false" @click="saveRowEvent(row, 'detailTable')">保存</el-link>
                        </template>
                        <template v-else>
                          <el-link type="warning" :underline="false" @click="editRowEvent(row, 'detailTable')">修改</el-link>
                        </template>
                        <el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'detailList')">删除</el-link>
                      </template>
                    </vxe-column>
                  </vxe-table>
                </div>
              </el-collapse-transition>
            </el-card>
            <!-- <el-card v-if="options.type === 'detail'" class="box-card mt10">
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
                  <vxe-table border resizable show-overflow ref="detailTable" size="mini" :data="formData.members"
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
          <el-tab-pane label="辅材信息" name="materialInfo">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <div class="left-title">
                  <span class="panel-title">仓库辅材</span>
                  <span v-if="CNYTotal > 0 || USDTotal > 0" style="margin-left: 20px">费用合计：
                    <span v-if="CNYTotal > 0">CNY {{ Number(CNYTotal).toFixed(2) }}</span>
                    <span v-if="USDTotal > 0" style="margin-left: 10px">USD {{ Number(USDTotal).toFixed(2) }}</span>
                  </span>
                </div>
                <div class="right-title">
                  <el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd('wareMaterialList', 'warehouseTable')">新增
                  </el-button>
                  <el-button v-if="wareShow" type="text" @click="wareShow = false">收起
                    <i class="el-icon-arrow-up el-icon--right"></i>
                  </el-button>
                  <el-button v-else type="text" @click="wareShow = true">展开
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                </div>
              </div>
              <el-collapse-transition>
                <div v-show="wareShow" class="card-table-list">
                  <vxe-table border resizable show-overflow ref="warehouseTable" size="mini" :data="wareMaterialList"
                    :edit-config="{trigger: 'manual', mode: 'row', autoClear: false, showAsterisk: !isDisabled, showIcon: !isDisabled}"
                    align="center" :edit-rules="materialRules" empty-text=" " :valid-config="{ showMessage: false }">
                    <vxe-column type="seq" width="100" title="序号"></vxe-column>
                    <vxe-column field="consumableId" title="辅材名称" :edit-render="{}" min-width="200">
                      <template #default="{ row }">
                        {{ row.consumableName }}
                      </template>
                      <template #edit="{ row, rowIndex }">
                        <el-select v-model="row.consumableId" value-key="consumableId" size="small" clearable remote filterable
                          placeholder="" :remote-method="(str) => getConsumableList(str, rowIndex)"
                          @visible-change="(s) => showConsumableList(s, rowIndex)" @change="(v) => changeConsumable(v, row, rowIndex)">
                          <el-option v-for="item in consumableList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                      </template>
                    </vxe-column>
                    <vxe-column field="inventoryQuantity" title="库存数" min-width="130"></vxe-column>
                    <vxe-column field="unit" title="单位" min-width="130">
                      <template #default="{ row }">
                        {{ dictMapObj['wmsGoodsUnit'][row.unit] }}
                      </template>
                    </vxe-column>
                    <vxe-column field="unitPrice" title="单价" min-width="130"></vxe-column>
                    <vxe-column field="quantity" title="使用数量" :edit-render="{}" min-width="180">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.quantity" type="integer" min="0" @input="changeQuantity({row})"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column field="totalAmount" title="费用金额" min-width="180">
                      <template #default="{ row }">
                        {{ Number(row.unitPrice * row.quantity).toFixed(2)}}
                      </template>
                    </vxe-column>
                    <vxe-column v-if="!isDisabled && activeName === 'materialInfo'" title="操作" min-width="100" fixed="right">
                      <template #default="{ row, rowIndex }">
                        <template v-if="$refs.warehouseTable.isActiveByRow(row)">
                          <el-link type="primary" :underline="false" @click="saveRowEvent(row, 'warehouseTable')">保存</el-link>
                        </template>
                        <template v-else>
                          <el-link v-if="!row.disabled" type="warning" :underline="false" @click="editRowEvent(row, 'warehouseTable')">修改
                          </el-link>
                        </template>
                        <el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'wareMaterialList')">删除</el-link>
                      </template>
                    </vxe-column>
                  </vxe-table>
                </div>
              </el-collapse-transition>
            </el-card>
            <el-card class="box-card mt10">
              <div slot="header" class="clearfix">
                <div class="left-title">
                  <span class="panel-title">客户自带辅材</span>
                </div>
                <div class="right-title">
                  <el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd('materialList', 'materialTable')">新增
                  </el-button>
                  <el-button v-if="selfShow" type="text" @click="selfShow = false">收起
                    <i class="el-icon-arrow-up el-icon--right"></i>
                  </el-button>
                  <el-button v-else type="text" @click="selfShow = true">展开
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                </div>
              </div>
              <el-collapse-transition>
                <div v-show="selfShow" class="card-table-list">
                  <vxe-table border resizable show-overflow ref="materialTable" size="mini" :data="materialList"
                    :edit-config="{trigger: 'manual', mode: 'row', autoClear: false, showAsterisk: !isDisabled, showIcon: !isDisabled}"
                    align="center" :edit-rules="materialRules" empty-text=" " :valid-config="{ showMessage: false }">
                    <vxe-column type="seq" min-width="100" title="序号"></vxe-column>
                    <vxe-column field="consumableId" title="辅材名称" :edit-render="{}" min-width="200">
                      <template #default="{ row }">
                        {{ row.consumableName }}
                      </template>
                      <template #edit="{ row }">
                        <el-select v-model="row.consumableId" value-key="consumableId" size="small" clearable remote filterable
                          placeholder="" :remote-method="(str) => getCustSelfList(str)" @visible-change="(s) => showCustSelfList(s)"
                          @change="(v) => changeCustSelf(v, row)">
                          <el-option v-for="item in custSelfList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                      </template>
                    </vxe-column>
                    <vxe-column field="consumableNo" title="辅材编号" min-width="200">
                    </vxe-column>
                    <vxe-column field="inventoryQuantity" title="库存数" min-width="180"></vxe-column>
                    <vxe-column field="unit" title="单位" min-width="180">
                      <template #default="{ row }">
                        {{ dictMapObj['wmsGoodsUnit'][row.unit] }}
                      </template>
                    </vxe-column>
                    <vxe-column field="quantity" title="使用数量" :edit-render="{}" min-width="180">
                      <template #edit="{ row }">
                        <vxe-input v-model="row.quantity" type="integer" min="0"></vxe-input>
                      </template>
                    </vxe-column>
                    <vxe-column v-if="!isDisabled && activeName === 'materialInfo'" title="操作" min-width="100" fixed="right">
                      <template #default="{ row, rowIndex }">
                        <template v-if="$refs.materialTable.isActiveByRow(row)">
                          <el-link type="primary" :underline="false" @click="saveRowEvent(row, 'materialTable')">保存</el-link>
                        </template>
                        <template v-else>
                          <el-link v-if="!row.disabled" type="warning" :underline="false" @click="editRowEvent(row, 'materialTable')">修改
                          </el-link>
                        </template>
                        <el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'materialList')">删除</el-link>
                      </template>
                    </vxe-column>
                  </vxe-table>
                </div>
              </el-collapse-transition>
            </el-card>
          </el-tab-pane>
          <el-tab-pane label="派工信息" name="dispatchInfo">
            <dispatch-detail ref="dispatchDetail" :options='formOptions' :activeName='activeName' :operType="options.type"
              @validFeeInfo="validFeeInfo" :isDisabled="isDisabled">
            </dispatch-detail>
          </el-tab-pane>
          <el-tab-pane label="费用信息" name="feesInfo">
            <fee-detail v-if="hasFees || options.type === 'add'" ref="feeDetail" :options="feeOptions" :isDisabled="isDisabled"
              :activeName='activeName' :operType="options.type">
            </fee-detail>
          </el-tab-pane>
          <el-tab-pane v-if="formData.hasDischargePicture === 'yes'" label="装货拍照" name="dischargePic">
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
    <!-- <div class="dialog-footer" slot="footer">
        <el-button v-if="!isDisabled && activeName === 'baseInfo'" @click="handleInventory" size="mini" type="primary">选择库存出库</el-button>
        <el-button v-if="!isDisabled" @click="handleSubmit" size="mini" type="success">提交</el-button>
        <el-button @click="handleCancel" size="mini">取消</el-button>
      </div> -->
    <inventory-dialog v-if="inventoryOptions.show" :options="inventoryOptions" @sendData="getDetailData"></inventory-dialog>
    <!-- </el-dialog> -->
  </div>
</template>
<script>
import UploadFile from '@/components/UploadFile/uploadFile'
import { getCustomerList } from '@/api/wms/inBound.js'
import { mapGetters, mapState } from 'vuex'
import { getMaterialstorageList } from '@/api/wms/warehouse.js'
import { warehouseEmployee, queryOrder, queryWarehousePage } from "@/api/wms.js"
import inventoryDialog from './inventoryDialog.vue'
import { queryTruckInfo, saveOutBound, updateOutBound, queryOutBoundDetail, queryCustSelf, queryOffsite, queryPageForOutbound, operateOutBound } from '@/api/wms/outBound.js'
import feeDetail from "./feeDetail"
import { parseTime } from '@/utils'
import actions from '@/action.js'
import dispatchDetail from './dispatchDetail'

const blurRule = { required: true, message: '此项必填', trigger: 'blur' }
const changeRule = { required: true, message: '此项必选', trigger: 'change' }
export default {
  // props: {
  //   options: {
  //     type: Object,
  //     default: () => { }
  //   }
  // },
  components: { UploadFile, inventoryDialog, feeDetail, dispatchDetail },
  data () {
    return {
      options: {
        type: '',
        id: ''
      },
      activeName: 'baseInfo',
      boundloading: false,
      blurRule,
      changeRule,
      formData: {
        outboundOrderId: null,
        outboundNo: '',
        custId: null,
        custName: '',
        custClass: '',
        outboundStatus: '',
        wmsWarehouseId: null,
        warehouseName: '',
        warehouseCode: '',
        createdName: '',
        outboundTime: parseTime(new Date().getTime()),
        licensePlate: '',
        driverName: "",
        driverPhone: "",
        tallyManName: '',
        tallyManId: null,
        shippingBookNo: '',
        shipName: '',
        shipNo: '',
        contractNo: '',
        lsWorkOrderNo: '',
        cabinetType: '',
        containerNo: '',
        boxWeight: '',
        sealNo: '',
        carryWharfYardId: null,
        carryWharfYardName: '',
        backWharfYardId: null,
        backWharfYardName: '',
        remark: '',
        unloadPhoto: 'yes',
        hasOffsite: "no",
        hasDischargePicture: "yes",
        // hasCopyNo: "no",
        hasCarrayOverweight: "no",
        hasReturnOverweight: "no",
        hasDisinfect: "no",
        hasDoubleLayerWinch: "no",
        hasSelfVehicle: "no",
        vehicleId: null,
        hasThreeLayerWinch: "no",
        dispatcherName: '',
        deliveryDriverPhone: '',
        deliveryDriverName: '',
        detailList: [],
        fileList: [],
        consumableList: [],
        orderPush: 'no'
      },
      isDisabled: false,
      isShow: true,
      workShow: true,
      wareShow: true,
      selfShow: true,
      warehouseSuperList: [],
      warehouseList: [],
      customerList: [],
      rules: {
        estimatedQuantity: [{ required: true, message: '预出数不能为空' }],
        // actualQuantity: [{ required: true, message: '实出数不能为空' }],
      },
      materialRules: {
        consumableId: [{ required: true, message: '辅材名称不能为空' }],
        quantity: [{ required: true, message: '使用数量不能为空' }],
      },
      previewSrcList: [],
      fileListSever: [],
      carryWharfYardList: [],
      backWharfYardList: [],
      consumableList: [],
      inventoryOptions: {
        show: false,
        wmsWarehouseId: '',
        custId: '',
        inboundTime: ''
      },
      truckList: [],
      materialList: [],
      wareMaterialList: [],
      custSelfList: [],
      CNYTotal: null,
      USDTotal: null,
      hasFees: false,
      fees: [],
      feeOptions: {
        data: {}
      },
      isInventory: false, //是否是从库存管理那跳转过来的
      isReqLsWorkNo: false, //长帆工作单号是否必填
      lsWorkOrderNoList: [],
      lsDisabled: false, //是否可编辑长帆工作单号
      btnLoading: false,
      formOptions: {
        data: {}
      },
      dispatchInfo: {}, //派工信息
      done: null,
      instance: null
    }
  },
  created () {
    this.options = this.$route.query
    this.isDisabled = this.options.type === 'detail'
    if (this.options.id) {
      this.getOutboundDetail()
    } else {
      this.$nextTick(() => {
        this.initData()
      })
    }
    this.activeName = this.options.activeName
    this.isInventory = !!this.$route.query.outboundOrderId
  },
  activated () {
    this.isDisabled = this.options.type === 'detail'
    // 新增出库信息路由存在缓存属性，进入该页面，如果已存在该tab，则将数据缓存；反之清除缓存信息
    if (this.options.type === 'add') {
      let tag = JSON.parse(sessionStorage.getItem('store')).tags
      if (tag && tag.length) {
        let valid = tag.some(item => item.code === 'OutBoundAdd')
        if (!valid) { // 如果不存在新增出库tab，清空缓存数据
          this.initData()
        }
      }
    } else {
      this.options = this.$route.query
      this.getOutboundDetail()
    }
    this.activeName = this.options.activeName
    this.isInventory = !!this.$route.query.outboundOrderId
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    ...mapState({
      userInfo: (state) => state.user
    })
  },
  watch: {
    'formData.hasDischargePicture' (val) {
      if (val === 'no') {
        this.activeName = 'baseInfo'
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
     * @Date: 2022-09-30 10:56:33
     */
    initData () {
      // 重置校验
      this.$refs.form.resetFields()
      // 新增时重置数据
      this.formData = this.$options.data().formData
      this.formData.createdName = (localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).userName) ? JSON.parse(localStorage.getItem('userInfo')).userName : this.userInfo.name
      this.formData.outboundStatus = 'created'
      this.lsDisabled = false
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
     * @description: 设置总体积
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-20 14:21:16
     */
    setTotalVolume ({ row }) {
      if ((row.actualQuantity || row.estimatedQuantity) && row.unitVolume) {
        let quantity = row.actualQuantity || row.estimatedQuantity
        row.volume = Number(quantity * row.unitVolume).toFixed(2)
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
        row.weight = Number(quantity * row.unitWeight).toFixed(2)
      }
    },
    /**
     * @description: 修改实出数回调
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-20 14:26:41
     */
    changeActualQuantity ({ row }) {
      this.setTotalVolume({ row })
      this.setTotalWeight({ row })
    },
    /**
     * @description: 查询是否异地
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-09 15:54:59
     */
    hasOffsiteFn () {
      if (this.formData.wmsWarehouseId && this.formData.warehouseCode && this.formData.carryWharfYardId && this.formData.backWharfYardId) {
        let data = {
          wmsWarehouseId: this.formData.wmsWarehouseId,
          warehouseCode: this.formData.warehouseCode,
          carryWharfYardId: this.formData.carryWharfYardId,
          backWharfYardId: this.formData.backWharfYardId
        }
        queryOffsite(data).then(({ code, data }) => {
          if (code === 0) {
            if (data && data.offsiteStatus) {
              this.formData.hasOffsite = data.offsiteStatus
            }
          }
        }).catch(() => { })
      }
    },
    /**
     * @description: 切换是否自派车
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-08 16:39:12
     */
    changeSelfVehicle (val) {
      this.formData.licensePlate = ""
      this.formData.driverPhone = ""
      this.formData.driverName = ""
      this.formData.vehicleId = -1
    },
    /**
     * @description: 计算总费用
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-01 19:12:20
     */
    changeQuantity () {
      this.USDTotal = 0
      this.CNYTotal = 0
      this.wareMaterialList.forEach(item => {
        item.totalAmount = Number(item.unitPrice) * Number(item.quantity).toFixed(2)
        if (['usd', 'USD'].includes(item.currency)) {
          this.USDTotal += item.totalAmount
        }
        if (['cny', 'CNY'].includes(item.currency)) {
          this.CNYTotal += item.totalAmount
        }
      })
    },
    /**
     * @description: 回显货物明细数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-31 15:25:30
     */
    getDetailData (data) {
      let goodsData = JSON.parse(JSON.stringify(data))
      goodsData = goodsData.filter(item => {
        let idList = this.formData.detailList.map(v => v.inboundGoodsDetailId)
        return !idList.includes(item.inboundGoodsDetailId)
      })
      if (!goodsData.length) {
        return this.$message.error("出库单货物明细已存在所选货物！")
      }
      goodsData.forEach(item => {
        this.formData.detailList.push({
          inboundNo: item.inboundNo,
          inboundDeteailNo: item.inboundDeteailNo,
          inboundOrderId: item.inboundOrderId,
          inboundGoodsDetailId: item.inboundGoodsDetailId,
          workOrderNo: item.workOrderNo,
          goodsName: item.goodsName,
          estimatedQuantity: item.lockInventory,
          unit: item.unit,
          marks: item.marks,
          goodsLength: item.goodsLength,
          goodsWidth: item.goodsWidth,
          goodsHigh: item.goodsHigh,
          specification: item.specification,
          unitVolume: item.unitVolume,
          unitWeight: item.unitWeight,
          lockInventory: item.lockInventory,
          volume: (item.lockInventory) * (item.unitVolume || 0),
          weight: (item.lockInventory) * (item.unitWeight || 0),
        })
      })
      this.editRowEvent(this.formData.detailList[0], 'detailTable')
    },
    /**
     * @description: 获取车辆信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-31 16:04:54
     */
    getTruckList (str = '') {
      let data = {
        licensePlate: str
      }
      queryTruckInfo(data).then(({ code, data }) => {
        if (code === 0) {
          this.truckList = (data || []).map(item => {
            return { ...item, label: item.licensePlate, value: item.licensePlate }
          })

        }
      }).catch(() => { })
    },
    /**
     * @description: 显示车牌下拉框选项回调
     * @param {*} show
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-31 16:20:02
     */
    showTruckList (show) {
      show && this.getTruckList('')
    },
    /**
     * @description: 切换车牌值时回调
     * @param {*} val 装货车牌
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-31 16:19:49
     */
    changeTruck (val) {
      let find = this.truckList.find(item => item.licensePlate === val)
      this.formData.driverName = find?.driverName
      this.formData.driverPhone = find?.driverPhone
      this.formData.vehicleId = find?.truckId
    },
    /**
     * @description: 获取客户名称数据
     * @param {*} str 搜索值
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-29 14:59:46
     */
    getCustomerList (str = '') {
      let data = {
        name: str
      }
      getCustomerList(data).then(({ code, data }) => {
        if (code === 0) {
          this.customerList = (data || []).map(item => {
            return { ...item, label: item.name || item.ename, value: item.custid }
          })
          // 设置长帆工作单号必填性
          // let find = this.customerList.find(item => item.custid === this.formData.custId)
          // if (find) {
          //   this.isReqLsWorkNo = find.custClass === 'department'
          // }
        }
      }).catch(() => { })
    },
    /**
     * @description: 显示客户名称下拉框回调
     * @param {*} show
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-29 15:00:17
     */
    showCustomerList (show) {
      show && this.getCustomerList('')
    },
    /**
     * @description: 切换客户名称时回调
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-29 15:00:30
     */
    changeCustomer (val) {
      let find = this.customerList.find(item => item.custid === val)
      this.formData.custName = find?.label
      this.formData.custClass = find?.custClass
      // 设置长帆工作单号必填性
      // if (find) {
      //   this.isReqLsWorkNo = find.custClass === 'department'
      // }
      // 修改客户名称或仓库名称，要清空出库单货物明细和辅材信息
      this.formData.detailList = []
      this.materialList = []
      this.wareMaterialList = []
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
          { column: 'warehouseId', type: 'eq', value: this.formData.wmsWarehouseId },
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
    /**
     * @description: 获取仓库信息
     * @param {*} str
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-29 15:50:16
     */
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
      this.formData.warehouseCode = find?.warehouseCode
      this.formData.warehouseName = find?.warehouseName
      this.hasOffsiteFn()
      // 修改客户名称或仓库名称，要清空出库单货物明细和辅材信息
      this.formData.detailList = []
      this.materialList = []
      this.wareMaterialList = []
    },
    /**
     * @description: 获取堆场信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-29 15:50:28
     */
    getWharfYardList (str = '', type) {
      let data = {
        currPage: 1,
        pageSize: 30,
        query: []
      }
      if (str) {
        data.query.push({
          column: "wharfYardName",
          type: "like",
          value: str
        })
      }
      queryPageForOutbound(data).then(({ code, data }) => {
        if (code === 0) {
          if (type === 'carry') {
            this.carryWharfYardList = data.list || []
          } else if (type === 'back') {
            this.backWharfYardList = data.list || []
          }
        }
      }).catch(() => {

      })
    },
    /**
     * @description: 显示堆场回调
     * @param {*} show
     * @param {*} type
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 09:39:58
     */
    showWharfYardList (show, type) {
      show && this.getWharfYardList('', type)
    },
    /**
     * @description: 切换
     * @param {*} v
     * @param {*} type
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 09:37:54
     */
    changeWharfYard (val, type) {
      if (type === 'carry') {
        let find = this.carryWharfYardList.find(item => item.wharfYardId === val)
        this.formData.carryWharfYardName = find?.wharfYardName
      } else {
        let find = this.backWharfYardList.find(item => item.wharfYardId === val)
        this.formData.backWharfYardName = find?.wharfYardName
      }
      this.hasOffsiteFn()
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
        query: [
          {
            column: "wmsWarehouseId",
            type: "eq",
            value: this.formData.wmsWarehouseId
          }
        ]
      }
      if (str) {
        data.query.push({
          column: "consumableName",
          type: "like",
          value: str
        })
      }
      getMaterialstorageList(data)
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
    changeConsumable (val, row) {
      let find = this.consumableList.find(item => item.value === val)
      row.wharfYardCode = find?.wharfYardCode
      row.inventoryQuantity = find?.inventoryQuantity
      row.consumableNo = find?.consumableNo
      row.consumableName = find?.consumableName
      row.unit = find?.unit
      row.unitPrice = find?.unitPrice
      row.currency = find?.currency
    },
    /**
     * @description: 查询客户自带辅材
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-01 17:14:24
     */
    getCustSelfList (str = '') {
      let data = {
        orderCustId: this.formData.custId,
        consumableName: str,
        wmsWarehouseId: this.formData.wmsWarehouseId
      }
      queryCustSelf(data)
        .then(({ code, data }) => {
          if (code === 0) {
            this.custSelfList = (data || []).map(item => {
              return { ...item, label: item.consumableName, value: item.consumableId }
            })
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    showCustSelfList (show) {
      show && this.getCustSelfList('')
    },
    changeCustSelf (val, row) {
      let find = this.custSelfList.find(item => item.value === val)
      row.consumableNo = find?.consumableNo
      row.inventoryQuantity = find?.inventoryQuantity
      row.unit = find?.unit
      row.consumableName = find?.consumableName
      row.inboundOrderId = find?.inboundOrderId
    },
    /**
     * @description: 获取出库信息详情
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-18 15:16:39
     */
    getOutboundDetail () {
      let data = {
        outboundOrderId: this.options.id || this.formData.outboundOrderId
      }
      this.boundloading = true
      queryOutBoundDetail(data)
        .then(({ code, data }) => {
          if (code === 0) {
            this.formData = { ...data }
            this.isDisabled = ['done'].includes(this.formData.outboundStatus)
            // 回显装货照片
            this.fileListSever = this.formData.fileList
            if (this.fileListSever.length) {
              this.fileListSever.forEach(item => {
                this.previewSrcList.push(`/base/fileView/preview/${item.fileNo}/sowoll`)
              })
            }
            this.getWarehouseList(this.formData.warehouseName)
            this.getWarehouseSuperList()
            this.getCustomerList(this.formData.custName)
            // 作业人员过滤掉理货员信息
            // this.formData.members = (this.formData.members || []).filter(item => item.employeeType !== 'tallyman')
            this.feeOptions.data = this.formData
            this.hasFees = true
            // 获取派工信息
            this.formOptions.data = this.formData.dispatchDetail
            // 显示费用详情 详情时固定显示，其它操作有就显示
            // if (this.options.type === 'detail') {
            //   this.hasFees = true
            // } else {
            //   this.hasFees = this.formData.payFee || this.formData.receiveFee
            // }
            if (this.formData.payFee && this.formData.payFee.list && this.formData.payFee.list.length) {
              this.lsDisabled = this.formData.payFee.list.some(item => item.unitType === 'company')
            } else {
              this.lsDisabled = false
            }
            // 回显辅材信息
            if (this.formData.consumables && this.formData.consumables.length) {
              this.formData.consumables = this.formData.consumables.map(item => {
                return {
                  ...item,
                  disabled: true
                }
              })
              this.materialList = this.formData.consumables.filter(item => item.orderCustId)
              this.wareMaterialList = this.formData.consumables.filter(item => !item.orderCustId)
              this.changeQuantity()
            }
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
     * @description: 新增辅材
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:31:01
     */
    handleAdd (list, table) {
      if (list === 'materialList' && !(this.formData.custId)) { //客户自带辅材
        return this.$message.error("出库信息中的客户名称不能为空！")
      }
      if (list === 'wareMaterialList' && !(this.formData.wmsWarehouseId)) {
        return this.$message.error("出库信息中仓库名称不能为空！")
      }
      this[`${list}`].push({
        consumableId: null,
        consumableNo: '',
        consumableName: '',
        unit: '',
        unitPrice: '',
        quantity: '',
        inventoryQuantity: '',
        totalAmount: '',
        currency: '',
      })
      this.editRowEvent(this[`${list}`][this[`${list}`].length - 1], table)
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
      let $table = this.$refs[table]
      const errMap = await $table.validate(true).catch(errMap => errMap)
      if (errMap) {
        return false
      } else {
        $table.clearActived()
      }
    },
    /**
     * @description: 移除【入库单货物明细】行数据
     * @param {*} index
     * @param {*} list
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:14:47
     */
    removeRowEvent (index, list) {
      if (list === 'detailList') {
        this.formData[`${list}`].splice(index, 1)
      } else {
        this[`${list}`].splice(index, 1)
      }
    },
    /**
     * @description: 选择库存出库
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-31 14:38:24
     */
    handleInventory () {
      if (!(this.formData.custId && this.formData.wmsWarehouseId)) {
        return this.$message.error("客户名称和仓库名称不能为空！")
      }
      if (!this.formData.outboundTime) {
        return this.$message.error("出库日期不能为空！")
      }
      this.inventoryOptions.show = true
      this.inventoryOptions.wmsWarehouseId = this.formData.wmsWarehouseId
      this.inventoryOptions.custId = this.formData.custId
      this.inventoryOptions.inboundTime = this.formData.outboundTime
    },
    /**
     * @description: 提交数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 11:28:53
     */
    handleSubmit (isDelivery) {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (!this.formData.detailList.length) {
            isDelivery && this.doneInstance()
            return this.$message.error("请填写出库单货物明细信息！")
          } else {
            this.validInfo('detailTable', isDelivery)
          }
        } else {
          isDelivery && this.doneInstance()
          return this.$message.error("请将出库信息必填内容填写完整！")
        }
      })
    },
    /**
     * @description: 校验入库单货物明细信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-25 17:51:07
     */
    async validInfo (table, isDelivery) {
      let $table = this.$refs[table]
      const errMap = await $table.validate(true).catch(errMap => errMap)
      if (errMap) {
        isDelivery && this.doneInstance()
        return this.$message.error('库单货物明细信息校验不通过！');
      } else {
        // 校验预出数必须大于等于实出数
        // 预出数  不能大于库存数
        // 实出数  不能大于库存数。当实出数大于预出数时，系统提示实出数大于预出数，是否确认提交？确认提交时 允许提交，否则取消提交。
        let agte = false
        let goodsName = ''
        for (let i = 0; i < this.formData.detailList.length; i++) {
          const item = this.formData.detailList[i];
          // 预出数不能大于库存数
          if (item.estimatedQuantity && (item.estimatedQuantity > item.lockInventory)) {
            isDelivery && this.doneInstance()
            return this.$message.error(`货物${item.goodsName}的预出数不能大于库存数(${item.lockInventory})！`)
          }
          // 实出数不能大于库存数
          if (item.actualQuantity && (item.actualQuantity > item.lockInventory)) {
            isDelivery && this.doneInstance()
            return this.$message.error(`货物${item.goodsName}的实出数不能大于库存数(${item.lockInventory})！`)
          }
          // 当实出数大于预出数时，系统提示实出数大于预出数，是否确认提交？确认提交时 允许提交，否则取消提交。
          if (item.actualQuantity && item.estimatedQuantity && (item.actualQuantity > item.estimatedQuantity)) {
            agte = true
            goodsName = item.goodsName
            break
          }
        }
        if (agte) {
          this.$confirm(`货物${goodsName}的实出数大于预出数，是否确认提交？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.validWareMaterial(isDelivery)
          }).catch(() => { });
        } else {
          this.validWareMaterial(isDelivery)
        }
      }
    },
    /**
     * @description: 有辅材的时候校验必填项
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-10-13 16:10:37
     */
    validWareMaterial (isDelivery) {
      if (this.wareMaterialList.length) {
        this.validWareMaterialInfo(isDelivery)
      } else {
        if (this.materialList.length) {
          this.validMaterialInfo(isDelivery)
        } else {
          this.validDispatchInfo(isDelivery)
        }
      }
    },
    /**
     * @description: 校验仓库辅材必填项
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 16:08:31
     */
    async validWareMaterialInfo (isDelivery) {
      let $table = this.$refs.warehouseTable
      const errMap = await $table.validate(true).catch(errMap => errMap)
      if (errMap) {
        isDelivery && this.doneInstance()
        return this.$message.error('仓库辅材信息校验不通过！');
      } else {
        let valZero = this.wareMaterialList.every(item => Number(item.quantity) > 0)
        if (!valZero) {
          isDelivery && this.doneInstance()
          this.$message.error(`仓库辅材的使用数量不能≤0！`)
        } else {
          for (let i = 0; i < this.wareMaterialList.length; i++) {
            const item = this.wareMaterialList[i];
            if (item.quantity > item.inventoryQuantity) {
              isDelivery && this.doneInstance()
              return this.$message({
                type: 'error',
                message: `仓库辅材${item.consumableName}使用数量不能大于库存数！`,
                showClose: true,
                duration: 5000
              })
            }
          }
          if (this.materialList.length) {
            this.validMaterialInfo(isDelivery)
          } else {
            this.validDispatchInfo(isDelivery)
          }
        }
      }
    },
    /**
     * @description: 校验客户自带辅材
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 16:09:05
     */
    async validMaterialInfo (isDelivery) {
      let $table = this.$refs.materialTable
      const errMap = await $table.validate(true).catch(errMap => errMap)
      if (errMap) {
        isDelivery && this.doneInstance()
        return this.$message.error('客户自带辅材信息校验不通过！');
      } else {
        let valZero = this.materialList.every(item => Number(item.quantity) > 0)
        if (!valZero) {
          isDelivery && this.doneInstance()
          this.$message.error(`客户自带辅材的使用数量不能≤0！`)
        } else {
          for (let i = 0; i < this.materialList.length; i++) {
            const item = this.materialList[i];
            if (item.quantity > item.inventoryQuantity) {
              isDelivery && this.doneInstance()
              return this.$message({
                type: 'error',
                message: `客户自带辅材${item.consumableName}使用数量不能大于库存数！`,
                showClose: true,
                duration: 5000
              })
            }
          }
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
        this.validFeeInfo(isDelivery)
      }
    },
    /**
     * @description: 校验费用信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-22 20:15:21
     */
    validFeeInfo (isDelivery) {
      let params = {}
      // if (this.hasFees) {
      this.$refs.feeDetail.submitFn()
      setTimeout(() => {
        if (this.$refs.feeDetail.isValidate) {
          params = {
            orderNo: this.formData.outboundNo,
            jointNo: '',
            fees: [...this.$refs.feeDetail.payList, ...this.$refs.feeDetail.receiveList]
          }
          params.fees.forEach(item => {
            item.unitCount = Number(item.unitCount)
            item.feeAmt = Number(item.feeAmt)
            item.taxAmt = Number(item.taxAmt)
            item.taxRate = Number(item.taxRate)
            item.unitPrice = Number(item.unitPrice)
            item.operation = "update"
          })
          if (this.$refs.feeDetail.removeList.length) {
            params.fees = [...params.fees, ...this.$refs.feeDetail.removeList]
          }
          this.submitApi(params, isDelivery)
        } else {
          return
        }
      }, 1000)
      // } else {
      //   this.submitApi()
      // }
    },
    /**
     * @description: 调用录入/修改入库信息接口
     * @param {*} params
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-13 19:32:08
     */
    submitApi (params, isDelivery) {
      let data = JSON.parse(JSON.stringify(this.formData))
      let baseData = {
        warehouseName: this.formData.warehouseName,
        wmsWarehouseId: this.formData.wmsWarehouseId,
        warehouseCode: this.formData.warehouseCode,
        inOutBoundNo: this.formData.outboundNo
      }
      data.consumableOutboundList = []
      // 客户自带辅材
      if (this.materialList.length) {
        data.consumableOutboundList.push({
          ...baseData,
          orderCustId: this.formData.custId,
          usageType: 'CUST_SELF_OUTBOUND',
          consumableList: this.materialList,
        })
      }
      // 仓库辅材
      if (this.wareMaterialList.length) {
        data.consumableOutboundList.push({
          ...baseData,
          orderCustId: "",
          usageType: 'OUTBOUND',
          consumableList: this.wareMaterialList,
        })
      }
      if (data.detailList.length) {
        data.detailList.forEach(item => {
          item.estimatedQuantity = !['', null, undefined].includes(item.estimatedQuantity) ? Number(item.estimatedQuantity) : null
          item.actualQuantity = !['', null, undefined].includes(item.actualQuantity) ? Number(item.actualQuantity) : null
          item.goodsLength = Number(item.goodsLength)
          item.goodsWidth = Number(item.goodsWidth)
          item.goodsHigh = Number(item.goodsHigh)
          item.unitVolume = Number(item.unitVolume)
          item.unitWeight = Number(item.unitWeight)
          this.$delete(item, '_XID')
        })
      }
      let method = ''
      if (this.options.type === 'add' && !this.formData.outboundOrderId) {
        method = saveOutBound
      } else if (this.options.type === 'edit' || this.formData.outboundOrderId) {
        method = updateOutBound
      }
      if (params) {
        data.feeSaveDto = params
      } else {
        data.feeSaveDto = {
          orderNo: this.formData.outboundNo,
          jointNo: '',
          fees: []
        }
      }
      // 组织派工信息
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
          if (this.options.type === 'edit' || this.formData.outboundOrderId) {
            this.btnLoading = false
            if (!isDelivery) {
              this.getOutboundDetail()
            } else {
              this.confirmApi('confirm', data.outboundOrderId)
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
      let outboundOrderId = this.options.id || this.formData.outboundOrderId
      if (outboundOrderId) {
        this.$msgbox({
          title: '提示',
          message: `确定要${type === 'confirm' ? '确认出库' : '撤销确认出库'}吗？`,
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
                this.confirmApi(type, outboundOrderId)
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
        this.$message.error("出库单主键缺失！")
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
    confirmApi (type, outboundOrderId) {
      let data = {
        outboundOrderIds: [outboundOrderId],
        confirmType: type
      }
      operateOutBound(data).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功！')
          this.getOutboundDetail()
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
      this.$router.push({ name: 'OutBound' })
    },
    /**
     * @description: 关闭当前tab页
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-30 11:10:05
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
  /deep/ .vxe-input--inner[disabled] {
    background-color: #f5f7fa !important;
  }

  /deep/ .vxe-input .vxe-input--number-prev-icon {
    top: 3px !important;
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
</style>