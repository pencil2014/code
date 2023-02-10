<template>
  <div class="home-page" v-loading="loading">
    <div class="quick-box">
      <div class="link-item" v-for="(item, index) in quickLink" :key="index" @click="quickGo(item)">
        <img :src="item.imgsrc" alt="" /> <b>{{ item.title }}</b>
      </div>
    </div>
    <!-- <div class="tab-box">
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane
          v-for="(item, index) in tabs"
          :label="$t(item.label)"
          :name="item.name"
          :key="index"
        ></el-tab-pane>
      </el-tabs>
      <div class="btn-box" v-show="activeName === 'Msg' && option2.data.length">
        <el-button type="primary" size="mini" @click="readMsg">{{
          $t('homePage.readMsg')
        }}</el-button>
        <el-button type="danger" size="mini" @click="deleteMsg('')">{{
          $t('homePage.delMsg')
        }}</el-button>
      </div>
      <Table :option="currentOption" @selectionChange="selectionChange" />
    </div> -->
    <!-- <el-dialog :title="dialog.title" :visible.sync="dialog.show" width="800">
      <div class="dialog-cnt">
        <template v-if="['Todo', 'Msg'].includes(activeName)">
          <div class="item">
            <b class="title">{{ $t('homePage.content') }}:</b>
            <p class="cnt" v-html="dialog.data.noticeContent"></p>
          </div>
          <div class="item">
            <b class="title">{{ $t('homePage.type') }}:</b>
            <p class="cnt">{{ noticeTypeOptions[dialog.data.noticeType] }}</p>
          </div>
          <div class="item">
            <b class="title">{{ $t('homePage.priority') }}:</b>
            <p class="cnt">
              <span class="notice-priority-high" v-if="dialog.data.noticePriority == 0">{{
                $t('homePage.urgent')
              }}</span>
              <span class="notice-priority-middle" v-if="dialog.data.noticePriority == 1">{{
                $t('homePage.commonly')
              }}</span>
              <span class="notice-priority-low" v-if="dialog.data.noticePriority == 2">{{
                $t('homePage.low')
              }}</span>
            </p>
          </div>
          <div class="item">
            <b class="title">{{ $t('homePage.keyNo') }}:</b>
            <p class="cnt">{{ dialog.data.keyNo }}</p>
          </div>
          <div class="item">
            <b class="title">{{ $t('homePage.noticeTime') }}:</b>
            <p class="cnt">{{ dialog.data.noticeTime }}</p>
          </div>
          <div class="item" v-if="dialog.data.viewTime">
            <b class="title">{{ $t('homePage.viewTime') }}:</b>
            <p class="cnt">{{ dialog.data.viewTime }}</p>
          </div>
        </template>
        <template v-if="activeName === 'Todo'">
          <div class="item" v-if="dialog.data.closeTime">
            <b class="title">{{ $t('homePage.closeTime') }}:</b>
            <p class="cnt">{{ dialog.data.closeTime }}</p>
          </div>
        </template>
        <template v-else>
          <div class="ql-editor update-image-wrap" v-html="dialog.data.noticeContent">
            {{ $t('homePage.information') }}
          </div>
        </template>
      </div>
      <div slot="footer">
        <el-button size="mini" @click="dialog.show = false"> {{ $t('homePage.close') }}</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
import Table from '@/components/table.vue'
import { mixin } from '@/mixin'
import { noticeWebsiteList, noticeWebsiteRead, noticeWebsiteDelete, noticeMsgUpgrade } from '@/api'
import actions from '@/store'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { getToken } from '@/utils'
export default {
  mixins: [mixin],
  components: {
    Table,
  },
  data() {
    return {
      loading: false,
      noticeEmployeeId: '',
      defaultQuery: {
        pageSize: 10,
        currPage: 1,
        columns: [],
        ascColumns: [],
        descColumns: ['createdTime'],
        query: [],
      },
      tabs: [
        {
          label: 'homePage.todo',
          name: 'Todo',
        },
        {
          label: 'homePage.notice',
          name: 'Msg',
        },
        {
          label: 'homePage.update',
          name: 'Update',
        },
      ],
      activeName: 'Todo',
      option1: {
        id: 'option1',
        data: [],
        columns: [
          {
            prop: 'noticeContent',
            label: 'homePage.todoContent',
            width: '800',
            className: 'notice-cnt',
            formatter: (value, row) => {
              return row.showTitle === 'Y' ? row.noticeTitle : row.noticeContent
            },
          },
          {
            prop: 'noticeTime',
            label: 'homePage.noticeTime',
          },
          {
            prop: 'noticePriority',
            label: 'homePage.priority',
            formatter: (val) => {
              let className = {
                0: 'notice-high',
                1: 'notice-middle',
                2: 'notice-low',
              }
              let text = {
                0: this.$t('homePage.urgent'),
                1: this.$t('homePage.commonly'),
                2: this.$t('homePage.low'),
              }
              return `<span class="${className[val]}">${text[val]}</span>`
            },
          },
          {
            prop: 'handleStatus',
            label: 'homePage.state',
            formatter: (val) => {
              return val.toLowerCase() === 'y'
                ? this.$t('homePage.processed')
                : this.$t('homePage.unhandled')
            },
          },
        ],
        operationBtns: {
          width: '100',
          data: [
            {
              label: 'homePage.details',
              action: 'detail',
            },
          ],
          callback: (action, index, row) => {
            if (action === 'detail') {
              this.showDetail(row)
            }
          },
        },
        selection: false,
        pagination: {},
      },
      option2: {
        id: 'option2',
        data: [],
        columns: [
          {
            prop: 'noticeContent',
            label: 'homePage.noticeContent',
            align: 'left',
            className: 'notice-cnt',
            formatter: (value, row) => {
              return row.showTitle === 'Y' ? row.noticeTitle : row.noticeContent
            },
          },
          {
            prop: 'noticeTime',
            label: 'homePage.noticeTime',
          },
        ],
        operationBtns: {
          width: '150',
          data: [
            {
              label: 'homePage.details',
              action: 'detail',
            },
            {
              label: 'homePage.delete',
              action: 'delete',
              style: {
                color: '#cd4130',
              },
            },
          ],
          callback: (action, index, row) => {
            if (action === 'detail') {
              this.showDetail(row)
            } else if (action === 'delete') {
              this.deleteMsg(row)
            }
          },
        },
        selection: true,
        pagination: {},
      },
      option3: {
        id: 'option1',
        data: [],
        columns: [
          {
            prop: 'noticeTitle',
            label: 'homePage.noticeTitle',
          },
          {
            prop: 'noticeTime',
            label: 'homePage.noticeTime',
          },
        ],
        operationBtns: {
          with: '100',
          data: [
            {
              label: 'homePage.details',
              action: 'detail',
            },
          ],
          callback: (action, index, row) => {
            if (action === 'detail') {
              this.showDetail(row)
            }
          },
        },
        selection: false,
        pagination: {},
      },
      currentOption: {},
      multipleSelection1: [],
      dialog: {
        show: false,
        title: '',
        data: {},
      },
      noticeTypeOptions: {
        UPDATE: this.$t('homePage.update'),
        MSG: this.$t('homePage.notice'),
        TODO: this.$t('homePage.todo'),
        MSG_SYS: this.$t('homePage.msgSys'),
      },
      quickLink: [
        {
          imgsrc: require('@/assets/home/customer.png'),
          title: this.$t('homePage.menu1'),
          url: '/crm/customerManagement/custList',
          activeMenu: 'Crm',
        },
        {
          imgsrc: require('@/assets/home/supplier.png'),
          title: this.$t('homePage.menu2'),
          url: '/crm/supplierManagement/supList',
          activeMenu: 'Crm',
        },
        {
          imgsrc: require('@/assets/home/order.png'),
          title: this.$t('homePage.menu3'),
          url: '/order/order/orderList',
          activeMenu: 'Order',
        },
        {
          imgsrc: require('@/assets/home/finance.png'),
          title: this.$t('homePage.menu4'),
          url: '/finance/settlement/feeList',
          activeMenu: 'Finance',
        },
      ],
      token: ''
    }
  },
  created() {
    this.currentOption = this.option1
    let userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      this.noticeEmployeeId = JSON.parse(userInfo).sysUserId
    }
    this.option1.pagination = Object.assign({}, this.pagination, {
      show: true,
    })
    this.option2.pagination = Object.assign({}, this.pagination, {
      show: true,
    })
    this.option3.pagination = Object.assign({}, this.pagination, {
      show: true,
    })
    // 验证是否登录，没登录跳转登录
    this.token = getToken()
    if (!this.token || this.token === 'undefined') {
      return this.$router.push({ name: 'Login' })
    }
    // this.getList()
  },
  methods: {
    selectionChange(id, val) {
      this.multipleSelection1 = val
    },
    handleClick({ name }) {
      this.activeName = name
      if (name === 'Todo') {
        this.currentOption = this.option1
      } else if (name === 'Msg') {
        this.currentOption = this.option2
      } else {
        this.currentOption = this.option3
      }
      this.getList()
    },
    getList() {
      this.loading = true
      let query = ''
      if (this.activeName === 'Todo') {
        query = [
          { column: 'noticeType', type: 'eq', value: 'TODO' },
          { column: 'handleStatus', type: 'eq', value: 'N' },
          {
            column: 'noticeEmployeeId',
            type: 'eq',
            value: this.noticeEmployeeId,
          },
        ]
      } else if (this.activeName === 'Msg') {
        query = [
          { column: 'noticeType', type: 'eq', value: 'MSG' },
          {
            column: 'noticeEmployeeId',
            type: 'eq',
            value: this.noticeEmployeeId,
          },
        ]
      } else {
        query = [{ column: 'noticeType', type: 'eq', value: 'MSG_UPGRADE' }]
      }
      let { pageSize, currPage } = this.currentOption.pagination
      let data = Object.assign({}, this.defaultQuery, {
        query,
        pageSize,
        currPage,
      })
      noticeWebsiteList(data)
        .then((res) => {
          if (res.code === 0) {
            if (this.activeName === 'Todo') {
              this.option1.data = res.data.list
              Object.assign(this.option1.pagination, res.data)
            } else if (this.activeName === 'Msg') {
              this.option2.data = res.data.list
              Object.assign(this.option2.pagination, res.data)
            } else {
              this.option3.data = res.data.list
              Object.assign(this.option3.pagination, res.data)
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    showDetail(row) {
      let type =
        this.activeName === 'Todo'
          ? `[${this.$t('homePage.todo')}]`
          : this.activeName === 'Msg'
          ? `[${this.$t('homePage.notice')}]`
          : this.$t('homePage.update')
      let { noticeTitle } = row
      let title = ['Todo', 'Msg'].includes(this.activeName) ? `${type} ${noticeTitle}` : `${type}`
      Object.assign(this.dialog, {
        show: true,
        title,
        data: row,
      })
    },
    readMsg() {
      let len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose(this.$t('homePage.msgErr'))
      }
      this.loading = true
      let oids = this.multipleSelection1.map((item) => item.oid)
      noticeWebsiteRead({ oids }).then((res) => {
        this.$msgSucClose(this.$t('homePage.msgSuc'))
        this.getList()
      })
    },
    deleteMsg(row) {
      if (row) {
        this.$confirmWarn(this.$t('homePage.msgWarn'), () => {
          this.deleteMsgFn(row)
        })
      } else {
        let len = this.multipleSelection1.length
        if (!len) {
          return this.$msgErrClose(this.$t('homePage.delTip'))
        }
        this.$confirmWarn(this.$t('homePage.msgWarn'), () => {
          this.deleteMsgFn()
        })
      }
    },
    deleteMsgFn(row) {
      let oids = []
      if (row) {
        oids = [row.oid]
      } else {
        oids = this.multipleSelection1.map((item) => item.oid)
      }
      noticeWebsiteDelete({ oids }).then((res) => {
        this.$msgSucClose(this.$t('homePage.delSuc'))
        this.getList()
      })
    },
    handleSizeChange(val, option) {
      if (option === this.option1) {
        this.option1.pagination.pageSize = val
      } else if (option === this.option2) {
        this.option2.pagination.pageSize = val
      } else {
        this.option3.pagination.pageSize = val
      }
      this.getList()
    },
    handleCurrentChange(val, option) {
      if (option === this.option1) {
        this.option1.pagination.currPage = val
      } else if (option === this.option2) {
        this.option2.pagination.currPage = val
      } else {
        this.option3.pagination.currPage = val
      }
      this.getList()
    },
    getUpdate() {
      if (!this.token || this.token === 'undefined') {
        return 
      }
      noticeMsgUpgrade()
        .then((res) => {
          let { oid } = res.data
          let updateId = localStorage.getItem('updateId') || ''
          if (oid && updateId != oid) {
            this.showDetail(res.data)
            localStorage.setItem('updateId', oid)
          }
        })
        .catch(() => {})
    },
    quickGo (item) {
      actions.setGlobalState({
        activeTag: item
      })
      history.pushState(null, '', `/#${item.url}`)
    },
  },
  mounted() {
    // this.getUpdate()
  },
}
</script>

<style lang="scss" scoped>
.home-page {
  .btn-box {
    margin-bottom: 10px;
  }
  :deep(.notice-high) {
    color: #cd4130;
  }
  :deep(.notice-middle) {
    color: #edb534;
  }
  :deep(.notice-low) {
    color: #4a4a4a;
  }
  :deep(.notice-cnt) {
    a {
      color: #3e80f5;
      text-decoration: underline;
    }
  }
  .dialog-cnt {
    max-height: 50vh;
    overflow: auto;
    .item {
      display: flex;
      margin-bottom: 10px;
      .title {
        width: 120px;
        flex-shrink: 0;
        text-align: right;
        margin-right: 10px;
      }
      .cnt {
        flex: 1;
        .notice-priority-high {
          color: #cd4130;
        }
        .notice-priority-middle {
          color: #edb534;
        }
        .notice-priority-low {
          color: #4a4a4a;
        }
      }
    }
    .update-image-wrap {
      img {
        max-width: 100%;
      }
    }
  }
  .quick-box {
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 12px solid rgba(240, 245, 248, 1);
    gap: 48px;
    .link-item {
      flex: 1;
      height: 100px;
      background: #ffffff;
      box-shadow: 0px 4px 26px rgba(228, 232, 239, 0.5);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      cursor: pointer;
      img {
        width: 80px;
        height: 80px;
        border-radius: 8px;
      }
      b {
        font-weight: 700;
        font-size: 16px;
      }
    }
  }
  .tab-box{
    padding: 0 24px;
    margin-top: 16px;
  }
}
</style>
