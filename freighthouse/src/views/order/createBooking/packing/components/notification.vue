<template>
  <div class="notification-cnt">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      ref="form"
      size="mini"
    >
      <el-form-item
        label="SI Requestor Emails (used by carriers for SI communication)"
        prop="notifyEmails"
      >
        <div class="cnt-box">
          <div class="email-box">
            <el-input
              size="mini"
              v-for="(item, index) in form.notifyEmails"
              :key="index"
              v-model="item.value"
              placeholder="Enter Email..."
              class="small-input"
              @blur="checkEmail(item.value)"
            ></el-input>
            <i
              class="el-icon-remove"
              @click="removeItem"
              v-show="form.notifyEmails.length > 1"
            />
            <div class="btn-box">
              <el-button
                size="mini"
                type="success"
                class="tag-btn"
                @click="addItem"
                >+ Add Email Addresss</el-button
              >
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    notificationOption: {
      required: true,
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        notifyEmails: [{ value: '' }],
        notifyName: '',
      },
      rules: {
        notifyEmails: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
      },
    }
  },
  created() {
    this.form = this.notificationOption
  },
  methods: {
    addItem() {
      if (this.form.notifyEmails.length > 5) {
        return this.$msgErrClose('Sorry, you can only add 6 mailboxes at most')
      }
      this.form.notifyEmails.push({ value: '' })
    },
    removeItem() {
      this.form.notifyEmails.pop()
    },
    checkEmail(val) {
      const reg =
        /^\w+((.\w+)*|(-\w+)*)@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/
      if (!reg.test(val)) {
        this.$msgErrClose('Please note that the email format is incorrect')
      }
    },
    // 数据验证
    validateForm() {
      let flag = this.form.notifyEmails.some((item) => !!item.value)
      return flag
    },
  },
}
</script>

<style lang="scss" scoped>
.notification-cnt {
  .form {
    padding: 10px 8px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-right: 40px;
    .el-form-item {
      width: 100%;
      margin-right: 0;
      .cnt-box {
        display: flex;
        align-items: flex-start;
        .email-box {
          width: 100%;
          display: flex;
          justify-content: flex-start;
          flex-wrap: wrap;
          align-items: center;
          .small-input {
            width: 30%;
            margin-right: 10px;
          }
          .el-icon-remove {
            font-size: 18px;
            color: #999;
            cursor: pointer;
            &:hover {
              color: #666;
            }
          }
        }
        .btn-box {
          margin-left: 10px;
          .tag-btn {
            padding: 3px 10px;
          }
        }
      }
    }
    .flex-item {
      width: 100%;
    }
  }
}
</style>
