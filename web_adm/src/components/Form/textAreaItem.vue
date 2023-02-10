<template>
  <div class="el-form-item__content">
    <pre
      :placeholder="placeholder"
      :class="{ hasError: errorFlag, 'disabled-text': disabled }"
      :style="{ height: heightVal || rowsToHeight[rows], maxHeight: maxHeightVal }"
      class="input-div el-textarea el-input--mini"
      :contenteditable="!disabled"
      :id="id"
    ></pre>
    <span
      v-if="showWordLimit"
      class="el-input_count"
      :class="{ 'disabled-text': disabled }"
      >{{ textLen }}/{{ maxlength }}</span
    >
  </div>
</template>

<script>
// 注意： 需要用正则表达式检索的文本域才调用此组件，否则直接用el-input
const rowsToHeight = {
  5: "96px",
  6: "114px",
  20: "366px",
};
import { mapState } from "vuex";
export default {
  props: {
    keys: {
      required: true, // 必传，用于拼接id
    },
    label: {
      type: String,
      default: "",
    },
    required: {
      // 判断字段是否必填
      type: Boolean,
      default: false,
    },
    value: {
      required: true, // 值
    },
    placeholder: {
      type: String,
      default: "请输入",
    },
    regExp: {
      // 正则
      type: RegExp,
      default: () => {
        //   return /[^\x00-\x7F]+/g // 检索出中文、中文字符、英文之外的特殊字母 /[^\x00-\xff]+/g
        return /[^\x00-\x7F]+/g;
      },
    },
    heightVal: {
      type: String, // 传入时请带上单位 px
      default: "",
    },
    maxHeightVal: {
      type: String, // 传入时请带上单位 px
      default: "",
    },
    rows: {
      // 类似textarea的高度，用于映射高度
      type: Number,
      default: 5,
    },
    disabled: {
      // 是否只读
      type: Boolean,
      default: false,
    },
    maxlength: {
      // 最大长度
      type: String,
      default: "",
    },
    showWordLimit: {
      // 是否展示长度
      type: Boolean,
      default: false,
    },
    isNeedCheckRowLen: {
      // 该字段是否需要校验每行的长度且自动换行
      type: Boolean,
      default: false
    }
  },
  watch: {
    value(newval) {
      if (!this.initFlag && this.refreshFlag) {
        this.model = newval;
        document.getElementById(this.id).textContent = this.model;
        this.textLen = this.getLen(this.model);
        this.blurMethod();
        this.inputMethod();
      }
    },
    speciesStrArr: {
      handler() {
        this.inputMethod();
      },
      deep: true,
    },
  },
  data() {
    return {
      rowsToHeight,
      saved_sel: "",
      textLen: 0,
      model: "",
      id: "input" + this.keys + "id",
      errorFlag: false,
      isInputZh: false,
      initFlag: true,
      refreshFlag: true,
      refreshTimer: null,
      oldhtmlData: null,
      rowArr: [],
      num: 54,
    };
  },
  computed: {
    ...mapState({
      speciesStrArr: (state) => state.order.speciesStrArr,
    }),
  },
  mounted() {
    this.$nextTick(() => {
      this.init();
      this.initFlag = false;
    });
  },
  methods: {
    init() {
      this.model = this.escapeHtml(this.value); // 转义
      console.log("init method");
      if (!this.model) {
        this.errorFlag = this.required;
      }
      document.getElementById(this.id).innerHTML = this.model || "";
      this.textLen = this.getLen(this.model);
      var input = document.getElementById(this.id);
      input.addEventListener("compositionstart", this.compositionstartCb);
      input.addEventListener("compositionend", this.compositionendCb);
      input.addEventListener("keydown", this.keydownCb);
      input.addEventListener("paste", this.pasteCb);
      input.addEventListener("input", this.inputMethod);
      input.addEventListener("blur", this.blurMethod);
      this.inputMethod();
    },
    compositionstartCb() {
      this.isInputZh = true;
    },
    compositionendCb() {
      this.isInputZh = false;
      this.inputMethod();
    },
    keydownCb(e) {
      if (e.keyCode === 13) {
        return false;
      }
    },
    pasteCb(e) {
      var text;
      text = e.clipboardData.getData("text/plain");
      document.execCommand("insertHTML", false, this.escapeHtml(text));
      return e.preventDefault();
    },
    escapeHtml(str) {
      if (!str) {
        return "";
      }
      const entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
      };
      const escape_html_exp = /[&<>]/g;
      return str.replace(escape_html_exp, function (s) {
        return entityMap[s];
      });
    },
    clearSpace(o, index) {
      if (o) {
        let arr = o.split(" ");
        let targetArr = [];
        arr.forEach((item) => {
          if (item) {
            targetArr.push(item);
            if(item.length > this.num) {
               !this.rowArr.includes(index) && this.rowArr.push(index);
            }
          }
        });
        return targetArr.join(" ") + "";
      } else {
        return "";
      }
    },
    checkRowLen(val) {
      // 限制一行54个字符，如果超过能换行（含空格，英文逗号等）则自动换行，如果不能换行（连续字符）则提示
      this.rowArr = [];
      if (val) {
        let arr = val.split("\n");
        let res = [];
        arr.forEach((o, index) => {
          let item = this.clearSpace(o, index+1);
          const len = item.length
          console.log(
            `${this.label}第${index + 1}行`,
            "当前行内容：",
            item,
            "长度为：",
            len
          );
          if (len > this.num) {
            const str = item.split("");
            const forLen = Math.floor(len / this.num);
            for (let i = 0; i < forLen; i++) {
              const lsIndex = item.lastIndexOf("\n") + 1;
              const lsword = lsIndex + this.num;
              const word = item.slice(lsIndex, lsword);
              if (word.length < this.num) {
                break;
              }
              let spaceIndex = word.lastIndexOf(" ")
              let dhIndex = word.lastIndexOf(",")
              const spindex = Math.max(
                spaceIndex,
                dhIndex
              );
              if (spindex === -1) {
                this.errorFlag = true;
              } else {
                const stayDh = (dhIndex > spaceIndex)
                if (stayDh) {
                  str[lsIndex + spindex] = ',\n'
                } else {
                  str[lsIndex + spindex - 1] = str[lsIndex + spindex - 1] + '\n'
                }
              }
              item = str.join("");
            }
          }
          res.push(item);
        });
        return res.join("\n");
      } else {
        return "";
      }
    },
    blurMethod() {
      if (!this.isNeedCheckRowLen) return
      let val = document.getElementById(this.id).textContent.toUpperCase();
      val = this.escapeHtml(val)
      val = this.checkRowLen(val);
      if (this.rowArr.length) {
        this.$message.error(
          `${this.label}第${this.rowArr.join(',')}行长度超过${this.num},请手动换行!`
        )
      }
      val = this.checkReg(val, 'blur')
      document.getElementById(this.id).innerHTML = val;
      this.refreshFlag = false;
      this.$emit("update:value", document.getElementById(this.id).textContent);
      clearTimeout(this.refreshTimer);
      this.refreshTimer = setTimeout(() => {
        this.refreshFlag = true; //加一个定时器，防止update完value值立刻触发watch监听
        this.oldhtmlData = val; // 记录下一次更新前的html
      }, 100);
    },
    inputMethod() {
      if (this.isInputZh) {
        return;
      }
      var inputEl = document.getElementById(this.id);
      let val = document.getElementById(this.id).textContent.toUpperCase();
      this.textLen = this.getLen(val);
      if (this.maxlength && this.textLen > this.maxlength) {
        // 超出指定的最大长度
        this.$message({
          type: "warning",
          message: `字数超出${this.maxlength}`,
        });
        document.getElementById(this.id).innerHTML = this.oldhtmlData;
        this.textLen = this.getLen(
          document.getElementById(this.id).textContent
        );
        this.restoreSelection(inputEl, this.saved_sel);
      } else {
        val = this.checkReg(val)
        if (this.initFlag) {
          // 初始化组件时只需要把内容展示，无需记录光标位置
          console.log("初始化内容更新");
          document.getElementById(this.id).innerHTML = val;
          // 做以下处理主要是为了如果老数据存在中文空格时，需要重新给数据更新
          this.$emit(
            "update:value",
            document.getElementById(this.id).textContent
          );
          this.refreshFlag = false;
          clearTimeout(this.refreshTimer);
          this.refreshTimer = setTimeout(() => {
            this.refreshFlag = true; //加一个定时器，防止update完value值立刻触发watch监听
          }, 100);
        } else {
          console.log("内容更新后更新");
          this.saved_sel = this.saveSelection(inputEl);
          document.getElementById(this.id).innerHTML = val;
          this.restoreSelection(inputEl, this.saved_sel);
          this.refreshFlag = false;
          this.$emit(
            "update:value",
            document.getElementById(this.id).textContent
          );
          clearTimeout(this.refreshTimer);
          this.refreshTimer = setTimeout(() => {
            this.refreshFlag = true; //加一个定时器，防止update完value值立刻触发watch监听
            this.oldhtmlData = val; // 记录下一次更新前的html
          }, 100);
        }
      }
    },
    checkReg(val, from) {
      val = val.replace(/[\u200b-\u200f\uFEFF\u202a-\u202e]/g, ""); // 清除特殊字符
      val = from === 'blur' ? val : this.escapeHtml(val); //  转义字符 失焦后不转义
      let result = val.match(this.regExp);
      let len = this.getLen(result);
      console.log("result", result);
      if (len) {
        result.sort(function (a, b) {
          return b.length - a.length;
        }); // 按照各项的字符长度从大到小排序
        for (let i = 0; i < len; i++) {
          if (
            result[i].trim().length &&
            !this.speciesStrArr.includes(result[i])
          ) {
            val = val.replaceAll(
              result[i],
              '<span style="color:red;">' + result[i] + "</span>"
            );
          } else if (!result[i].trim().length) {
            // 中文空格自动过滤掉
            val = val.replaceAll(result[i], " ");
          }
        }
        if (val.includes("</span>")) {
          this.errorFlag = true;
        } else {
          this.errorFlag = false;
        }
      } else if (!val && this.required) {
        this.errorFlag = true;
      } else {
        this.errorFlag = false;
      }
      return val
    },
    getLen(type) {
      return (type && type.length) || 0;
    },
    saveSelection(containerEl) {
      var range = window.getSelection().getRangeAt(0);
      var preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(containerEl);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      var start = preSelectionRange.toString().length;
      return {
        start: start,
        end: start + range.toString().length,
      };
    },
    restoreSelection(containerEl, savedSel) {
      if (!savedSel) return;
      var charIndex = 0,
        range = document.createRange();
      range.setStart(containerEl, 0);
      range.collapse(true);
      var nodeStack = [containerEl],
        node,
        foundStart = false,
        stop = false;
      while (!stop && (node = nodeStack.pop())) {
        if (node.nodeType == 3) {
          var nextCharIndex = charIndex + node.length;
          if (
            !foundStart &&
            savedSel.start >= charIndex &&
            savedSel.start <= nextCharIndex
          ) {
            range.setStart(node, savedSel.start - charIndex);
            foundStart = true;
          }
          if (
            foundStart &&
            savedSel.end >= charIndex &&
            savedSel.end <= nextCharIndex
          ) {
            range.setEnd(node, savedSel.end - charIndex);
            stop = true;
          }
          charIndex = nextCharIndex;
        } else {
          var i = node.childNodes.length;
          while (i--) {
            nodeStack.push(node.childNodes[i]);
          }
        }
      }
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    },
  },
  destroyed() {
    window.removeEventListener("compositionstart", this.compositionstartCb);
    window.removeEventListener("compositionend", this.compositionendCb);
    window.removeEventListener("keydown", this.keydownCb);
    window.removeEventListener("paste", this.pasteCb);
    window.removeEventListener("input", this.inputMethod);
    window.removeEventListener("blur", this.blurMethod);
    clearTimeout(this.refreshTimer);
  },
};
</script>

<style lang="scss">
.input-div {
  position: relative;
  border: 1px solid rgba(220, 223, 230, 1);
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 12px;
  font-weight: normal;
  font-family: unset;
  &:empty:before {
    content: attr(placeholder);
    color: #9a9b9b;
  }
  &.content:focus:before {
    content: none;
  }
  &:focus-visible {
    outline: unset;
  }
  overflow: auto;
  // word-break: break-all;
  // word-wrap: break-word;
  // white-space: pre-wrap;
  // resize: both;
}
.el-input_count {
  color: #909399;
  background: #ffffff;
  position: absolute;
  font-size: 12px;
  bottom: 5px;
  right: 10px;
}
.hasError {
  border: 1px solid red;
}
.disabled-text {
  background-color: #f5f7fa;
  border-color: #dfe4ed;
}
</style>