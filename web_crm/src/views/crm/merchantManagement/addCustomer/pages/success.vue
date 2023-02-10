<template>
  <div class="success-box">
    <div class="success-header">
      <i class="el-icon-success"></i>
      <h3>{{isPotential?'创建成功':'提交成功'}}</h3>
      <p v-if="isPotential">该客户已创建成功，可以维护客户跟进记录，但不能作为下单客户使用。</p>
    </div>
    <div class="success-content">
      <div class="entName">企业名称：{{verifierInfo.entName}}</div>
      <el-steps :active="2">
        <el-step :title="!isCustomer?'创建供应商':'创建客户'">
          <template slot="description">
            <div class="step-status suc-status">
              <i class="el-icon-success"></i>创建成功
            </div>
            <p class="handle-people">{{verifierInfo.op}}</p>
            <p class="handle-time">{{verifierInfo.date}}</p>
          </template>
        </el-step>
        <!-- <el-step v-if="!isPotential||!isCustomer||!isClient" title="部门初审"> -->
        <el-step v-if="verifierInfo.name" title="部门初审">
          <template slot="description">
            <div class="step-status audit-status">
              <i class="el-icon-info"></i>审核中
            </div>
            <p class="handle-people">{{ verifierInfo.name }}</p>
          </template>
        </el-step>
        <el-step title="完成">
          <template slot="description">
            <div v-if="!verifierInfo.name" class="step-status suc-status">
            <!-- <div v-if="isPotential||(isCustomer&&!isClient)" class="step-status suc-status"> -->
              <p class="handle-time">{{verifierInfo.date}}</p>
            </div>
            <div v-else class="step-status no-status">
              <i class="el-icon-info"></i>未进行
            </div>
          </template>
        </el-step>
      </el-steps>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  inject: ['isCustomer'],
  props: ['customerMode'],
  data: function () {
    return {}
  },
  computed: {
    ...mapState('crm', {
      customerInfo: (state) => state.verifierInfo,
    }),
    ...mapState('crm/supplier', {
      supplierInfo: (state) => state.verifierInfo,
    }),
    verifierInfo() {
      return this.isCustomer ? this.customerInfo : this.supplierInfo
    },
    isPotential() {
      return this.customerMode == 'potential'
    },
  },
}
</script>

<style lang="scss" scoped>
.success-box {
  margin-top: 80px;
  padding: 0 100px;
  color: #222222;
  .success-header {
    color: #33b18a;
    text-align: center;
    i {
      font-size: 68px;
    }
    h3 {
      margin-top: 16px;
      font-size: 28px;
      font-weight: 600;
      line-height: 40px;
    }
  }
  .success-content ::v-deep {
    font-size: 14px;
    margin-top: 56px;
    .el-steps {
      .el-step:nth-child(1) .el-step__line {
        background-color: #1890ff;
      }
      .el-step__main {
        margin-left: -50px;
      }
      .is-process .el-step__icon,
      .is-process .el-step__line {
        background-color: #c0c4cc;
      }
      .el-step__icon {
        width: 16px;
        height: 16px;
        border: 4px solid white;
        vertical-align: middle;
        background-color: #1890ff;
        margin-top: 2px;
        .el-step__icon-inner {
          display: none;
        }
      }
      .el-step__title {
        margin-top: 18px;
        font-weight: 600;
        color: #222222;
        line-height: 20px;
      }
      .el-step__description {
        margin-top: 8px;
        font-weight: 600;
        line-height: 20px;
        .step-status {
          & > i {
            margin-right: 2px;
          }
        }
        .suc-status {
          color: #33b18a;
        }
        .audit-status {
          color: #f4bf44;
        }
        .no-status {
          color: #bfbfbf;
        }

        .handle-people {
          margin-top: 11px;
          font-weight: 400;
          color: #4a4a4a;
          line-height: 20px;
        }
        .handle-time {
          margin-top: 8px;
          font-weight: 400;
          color: #4a4a4a;
          line-height: 20px;
        }
      }
    }
    .entName {
      height: 20px;
      margin-bottom: 24px;
      font-weight: 600;
      line-height: 20px;
    }
  }
}
</style>