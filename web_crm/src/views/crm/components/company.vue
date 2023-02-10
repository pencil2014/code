<template>
  <div class="container" :class="{isRoot,small,isEmpty}" :ref="isRoot ? 'treeRoot': ''">
    <CrmDialog :option="dialogOption" @close="close" />
    <NoData :size="small?'mini':''" v-if="isEmpty" />
    <div
      v-else
      class="company-tree"
      :class="{first,last,isParent,}"
      :ref="isRoot ? 'rootChild': ''"
    >
      <div
        v-if="!companyInfo.hidden"
        class="company-item"
        :class="{isSelf,isParent,isDiff:companyInfo.isDiff&&!isSelf,hasChild,isActive:!(isSelf||companyInfo.isAdd||isReview)}"
      >
        <i class="line-center">
          <b class="line-center-before"></b>
          <b class="line-center-after"></b>
        </i>
        <!-- <div class="company-des">
          <span class="company-type">{{isParent? '母公司':'子公司'}}</span>
          <span
            v-show="!isSubmit&&!isSelf&&(isSelfParent||isSelfChild||isBrother)"
            class="company-action"
            @click="action(companyInfo)"
          >-</span>
        </div>-->
        <el-popover :ref="companyInfo.custid" placement="bottom" trigger="hover" :disabled="isSelf">
          <div class="company-des" slot="reference">
            <!-- <div class="company-des"> -->
            <span class="company-name">{{companyInfo.name}}</span>
            <template>
              <span
                v-show="isCts&&!isSelf&&(isSelfParent||isSelfChild||isBrother)"
                class="company-action"
                @click.stop="action(companyInfo)"
              >-</span>
            </template>
          </div>
          <div class="popover-content">
            <div>法定代表人：{{companyInfo.legalPerson}}</div>
            <div>成立日期：{{companyInfo.setupDate}}</div>
            <div>注册资本：{{companyInfo.regCapital}}</div>
            <div
              v-if="companyInfo.startTime&&companyInfo.stopTime"
            >附件有效期：{{companyInfo.startTime.slice(0,10)}} ~ {{companyInfo.stopTime.slice(0,10)}}</div>
            <div>附件资料：</div>
            <div class="popover-attach">
              {{companyInfo.fileName}}
              <template>
                <el-button
                  class="notSelf-hide"
                  v-if="isCts"
                  size="mini"
                  @click.stop="update"
                >{{companyInfo.fileName?'更新':'上传'}}</el-button>
              </template>
              <el-button
                v-if="companyInfo.fileName"
                size="mini"
                @click.stop="download(companyInfo)"
              >下载</el-button>
            </div>
          </div>
        </el-popover>
      </div>
      <div class="company-children" v-if="companyInfo.childs&&companyInfo.childs.length">
        <Company
          v-for="(item,index) in companyInfo.childs"
          :key="item.custid+''+item.oid"
          :companyInfo="item"
          :isSubmit="isSubmit"
          :isSelfChild="isSelf"
          :isBrother="companyInfo.hidden"
          :first="index==0"
          :last="index==companyInfo.childs.length-1"
          :isParent="false"
          :isRoot="false"
          @handleDialog="handleDialog"
        />
      </div>
    </div>
  </div>
</template>
<script>
import RELATION from '@/api/crm/custRelation'
import CrmDialog from '@/views/crm/components/crmDialog'
export default {
  components: {
    CrmDialog,
  },
  name: 'Company',
  // isReview 表示不能编辑
  inject: ['isReview', 'relationCfg'],
  props: {
    // 节点数据
    companyInfo: {
      type: Object,
      default: () => ({}),
    },
    // 是否是母子公司视图
    isParent: { type: Boolean, default: true },
    // 每层第一个，只显示右边线条
    first: { type: Boolean, default: false },
    // 每层最后一个，只显示左边线条
    last: { type: Boolean, default: false },
    // 待审核状态，不能进行操作
    isSubmit: { type: Boolean, default: false },
    // 本公司的子节点，母子公司情况只能删除本公司子节点，本公司母公司节点
    isSelfChild: { type: Boolean, default: false },
    // 本公司的兄弟节点，关联公司情况只能删除本公司兄弟节点
    isBrother: { type: Boolean, default: false },
    // 是否是最外层元素，第一级为true，递归的均为false
    isRoot: { type: Boolean, default: true },
    // 是否是小的布局，母子公司对比，审核详情
    small: { type: Boolean, default: false },
    // popover 按钮不受样式控制
  },
  computed: {
    // isSelfParent 是否是自身公司母公司
    isSelfParent() {
      return (
        this.companyInfo && this.companyInfo.childs && this.companyInfo.childs.find((v) => v.custid == this.$route.query.custid)
      )
    },
    // 是否是公司本身
    isSelf() {
      return this.companyInfo.custid == this.$route.query.custid
    },
    // 是否有子节点
    hasChild() {
      return this.companyInfo.childs && this.companyInfo.childs.length
    },
    // 是否是空数据,有两种情况,companyInfo为null，companyInfo只有一个节点(即公司本身)
    isEmpty() {
      if (!this.isRoot) return false
      // 接口返回null，未处理
      if (!this.companyInfo) return true
      // 接口返回null， 处理为{}，需判断无custid、hidden值， 空数据
      if (!this.companyInfo.custid && !this.companyInfo.hidden) return true
      // 关联公司，子节点数量为0，为空数据
      if (this.companyInfo.hidden && !this.companyInfo.childs.length) return true
      // 关联公司，子节点数量为1，说明是本公司，为空数据  2021.04.24逻辑更改，不会存在此情况
      // if (this.companyInfo.hidden && this.companyInfo.childs.length == 1) return true
      // 根节点有值，但是根节点子元素为空，说明根节点为本公司，表示空数据
      if (this.isRoot && this.companyInfo.custid && !this.companyInfo.childs.length) return true
    },
    // 是否客服部
    isCts() {
      return (this.$store.state.user.roles || []).includes('cts')
    },
  },
  // created() {
  //   if (this.isRoot) console.log('company created')
  // },
  // activated() {
  //   if (this.isRoot) console.log('company activated')
  // },
  data() {
    return {
      // 新增弹框
      dialogOption: {
        show: false,
        showClear: true,
        title: '附件',
        appendToBody: true,
        formItems: [
          { label: '附件有效期', type: 'date', prop: 'Time', dateType: 'daterange', rules: { required: true, message: ' ' } },
          {
            prop: 'fileNo',
            type: 'file',
            // acceptTypes: ['doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png'],
            limit: 1,
            rules: { required: true, message: '必选' },
          },
        ],
        form: { fileNo: '', Time: [] },
      },
    }
  },
  watch: {
    isEmpty: {
      handler(val) {
        // console.log(val)
        if (!this.isRoot) return
        if (val) return this.initRemove()
        if (!val) return this.$nextTick(() => this.initAdd())
      },
      immediate: true,
    },
  },
  methods: {
    action({ custid, name }) {
      this.$emit('handleDialog', { custid, relationType: 'parent', name })
    },
    handleDialog({ custid, name }) {
      // console.log('outer',{ custid, name })
      this.$emit('handleDialog', { custid, relationType: 'child', name })
    },
    initRemove() {
      // console.log('~~~~~~~~~~~~remove')
      // console.log(this.$refs)
      let treeRoot = this.$refs.treeRoot
      let rootChild = this.$refs.rootChild
      if (treeRoot && rootChild) {
        treeRoot.onmousewheel = null
        rootChild.onmousedown = null
        rootChild.onmousemove = null
        rootChild.onmouseup = null
        rootChild.onmouseleave = null
      }
    },
    initAdd() {
      // console.log('~~~~~~~~~~~~add')
      // console.log(this.$refs)
      // 只有根元素且数据不为空才需要监听事件
      let treeRoot = this.$refs.treeRoot
      if (!treeRoot) return
      let rootChild = this.$refs.rootChild
      let scale = 1
      treeRoot.onmousewheel = (e) => {
        // e.wheelDelta > 0 向上
        // e.wheelDelta < 0 向下
        if (e.wheelDelta > 0 && scale - 2 < 0) {
          scale *= 1.1
        } else if (e.wheelDelta < 0 && scale - 0.5 > 0) {
          scale *= 0.9
        }
        rootChild.style.transform = `scale(${scale}) translate(-50%,-50%)`
        return false
      }
      // e.clientX 鼠标相对屏幕左侧偏移量
      // e.clientY 鼠标相对屏幕顶部偏移量
      // this.offsetLeft 元素相对祖先设有relative的左侧偏移量
      // this.offsetTop 元素相对祖先设有relative的顶部偏移量
      // offsetX 元素的祖先设有relative的元素相对屏幕左侧偏移量
      // offsetY 元素的祖先设有relative的元素相对屏幕顶部偏移量
      // 移动时，鼠标相对屏幕偏移量-祖先relative相对屏幕偏移量 即为元素相对祖先relative的偏移量
      let offsetX, offsetY, isDown
      rootChild.onmousedown = function (e) {
        isDown = true
        offsetX = e.clientX - this.offsetLeft
        offsetY = e.clientY - this.offsetTop
      }
      rootChild.onmousemove = function (e) {
        if (!isDown) return
        this.style.left = e.clientX - offsetX + 'px'
        this.style.top = e.clientY - offsetY + 'px'
      }
      rootChild.onmouseup = function (e) {
        isDown = false
      }
      rootChild.onmouseleave = function (e) {
        isDown = false
      }
    },
    download({fileName, fileNo}) {
      fileName = fileName.replace(/[\[|\]|\{|\}|\%|`]/g,'')
      const href = `/base/fileView/preview/${fileNo}/${fileName}`
      window.open(href)
    },
    update() {
      this.dialogOption.show = true
      // setTimeout(() => {
      //   console.log(this.dialogOption)
      // }, 2000)
    },
    close(tag) {
      // console.log(tag)
      // console.log(this.dialogOption.form)
      // console.log({
      //   ...this.companyInfo.attachObj,
      //   ...this.dialogOption.form,
      //   startTime: this.dialogOption.form.Time[0],
      //   stopTime: this.dialogOption.form.Time[1],
      // })
      // return
      if (tag) {
        // console.log(this.companyInfo.isAdd)
        // if (this.companyInfo.isAdd) {
        //   this.convertData(this.companyInfo, 'dialogOption')
        //   for (const key in this.relationCfg.parentObj) {
        //     if (key == this.companyInfo.custid) {
        //       this.convertData(this.relationCfg.parentObj[key], 'dialogOption')
        //     }
        //   }
        //   return
        // }
        let data = {
          ...this.companyInfo.attachObj,
          fileNo: this.dialogOption.form.fileNo,
          startTime: this.dialogOption.form.Time[0],
          stopTime: this.dialogOption.form.Time[1],
        }
        if (!data.custid) {
          data.custid = this.companyInfo.custid
          data.relCustid = this.$route.query.custid
        }
        RELATION.uploadOrReplace(data).then((res) => {
          this.convertData(this.companyInfo, 'dialogOption')
          for (const key in this.relationCfg.parentObj) {
            if (key == this.companyInfo.custid) {
              this.convertData(this.relationCfg.parentObj[key], 'dialogOption')
            }
          }
        })
      } else {
        this.dialogOption.show = false
      }
    },
    convertData(obj, key2) {
      obj.fileNo = this[key2].form.fileNo
      obj.fileName = this[key2].form.__fileName__
      obj.filePath = this[key2].form.__filePath__
      obj.startTime = this[key2].form.Time[0]
      obj.stopTime = this[key2].form.Time[1]
      this.$forceUpdate()
      this.dialogOption.show = false
    },
  },
}
</script>

<style lang="scss" scoped>
$marginV: 20px;
$marginH: 10px;
$border: 2px;
$lineH: $marginV - 4px;
.popover-content {
  font-size: 12px;
  line-height: 18px;
  .popover-attach {
    color: #3e80f5;
    ::v-deep button {
      margin-left: 8px;
      line-height: 18px;
      height: 20px;
      padding: 0 7px 0 6px;
      float: right;
    }
  }
}
.container {
  display: inline-block;
  &.isRoot {
    position: relative;
    overflow: hidden;
    box-sizing: content-box;
    height: 450px;
    width: 100%;
    user-select: none;
    &.small {
      height: 280px;
      &.isEmpty {
        height: 160px;
      }
    }
    & > div {
      transform: translate(-50%, -50%);
      position: absolute;
      left: 50%;
      top: 50%;
      transition: transform 0.3s;
      // TODO 学习
      // transform-orgin 默认50% 50% 因为设置了translate(-50%, -50%)，所以设置为0 0
      transform-origin: 0 0;
    }
  }
}
.company-tree {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  position: relative;
  text-align: left;
  &.isParent {
    &:before,
    &:after {
      display: none;
    }
  }
  &:before,
  &:after {
    position: absolute;
    content: '';
    height: 2px;
    width: 50%;
    top: 0;
    background: #3e80f5;
  }
  &:before {
    left: 0;
  }
  &:after {
    right: 0;
  }
  &.first:before {
    display: none;
  }
  &.first:after {
    border-top-left-radius: 5px;
  }
  &.last:after {
    display: none;
  }
  &.last:before {
    border-top-right-radius: 5px;
  }
}
.company-item {
  transition: background 0.6s;
  &.isActive:hover {
    background: rgba(62, 128, 245, 0.2);
  }
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  width: 260px;
  line-height: 18px;
  margin: $marginV $marginH;
  padding: 4px 8px;
  border: $border solid #3e80f5;
  font-size: 12px;
  border-radius: 4px;
  color: #3e80f5;
  &.isDiff {
    border: $border solid #cd4130;
    color: #cd4130;
    // .company-des .company-type {
    //   color: #cd4130;
    //   opacity: 0.5;
    // }
  }
  .line-center {
    position: absolute;
    display: inline-block;
    top: 0;
    left: 50%;
    width: 0;
    height: 100%;
    margin-left: -1px;
    & > b {
      position: absolute;
      background: #3e80f5;
      left: 0;
      height: $lineH;
      width: 2px;
      &:after {
        display: inline-block;
        position: absolute;
        background: #3e80f5;
        left: -2px;
        height: 6px;
        width: 6px;
        border-radius: 50%;
        content: '';
      }
    }
    .line-center-before {
      top: -($marginV + $border);
      &:after {
        bottom: -2px;
      }
    }
    .line-center-after {
      display: none;
      bottom: -($marginV + $border);
      &:after {
        top: -2px;
      }
    }
  }
  &.hasChild > .line-center .line-center-after {
    display: inline-block;
  }
  &.isParent {
    & > .line-center .line-center-before {
      display: none;
    }
  }
  &.isSelf {
    background: #3e80f5;
    .company-name {
      color: white;
    }
    // .company-des .company-action {
    //   background: white;
    //   color: #3e80f5;
    // }
  }
  .company-des {
    .company-name {
      padding-right: 10px;
    }
    display: flex;
    justify-content: space-between;
    align-items: center;
    .company-type {
      color: #b6cffc;
    }
    .company-action {
      flex: 0 0 auto;
      height: 16px;
      line-height: 14px;
      width: 16px;
      text-align: center;
      border-radius: 50%;
      font-weight: bold;
      color: white;
      background: #b6cffc;
      cursor: pointer;
    }
  }
}
.company-children {
  display: inline-flex;
  justify-content: center;
  align-items: flex-start;
}
</style>
