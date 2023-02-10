export const mixin2 = {
  data() {
    return {
      optionMaxHeight: null, // 要设置高度的table的option，默认为option1
      classSelector1: 'finance-list-container', // finance-table外面的元素，默认为finance-list-container
      classSelector2: 'finance-table', // 要设置高度的table，默认为finance-table
      _isPageShow: true,  //页面不显示时不运行computeFinTableHeight
      _timeout_: null, //延迟运行
      // computeMaxHeightDelay: 10, // 希望修正的时延
      subtractionHeight: 58, // 66
      revisedHeight: 0, // 希望修正的table的高度
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.computeFinTableHeight()
    })
    window.addEventListener('resize', () => {
      this.computeFinTableHeight()
    })
    this.$once('hook:beforeDestroy', () => {
      this._isPageShow = false
    })
  },
  // activated内是为了被keep-alive包括的页面，
  activated() {
    this._isPageShow = true
    this.$nextTick(() => {
      this.computeFinTableHeight()
    })
    this.$once('hook:deactivated', () => {
      this._isPageShow = false
    })
  },
  methods: {
    computeFinTableHeight() {
      // if (!this._isPageShow) return
      clearTimeout(this._timeout_)
      this._timeout_ = setTimeout(() => {
        let FinanceListContainer = document.getElementsByClassName(this.classSelector1)[0]
        if (FinanceListContainer) {
          let FinanceTable = FinanceListContainer.getElementsByClassName(this.classSelector2)[0]
          // console.log(FinanceTable)
          if (!FinanceTable) {
            return
          }
          let OFFSETTOP = FinanceTable.getBoundingClientRect().top
          let BODYHEIGHT = document.body.clientHeight
          this.optionMaxHeight = this.optionMaxHeight ? this.optionMaxHeight : this.option1
          if (this.optionMaxHeight) {
            if (this.optionMaxHeight.listAmtSummary && this.optionMaxHeight.listAmtSummary.show) {
              if (this.optionMaxHeight.listAmtSummary.isPartTop) {
                this.subtractionHeight = 58 + 32 + 51 // 66
              } else {
                this.subtractionHeight = 58 + 31 // 66
              }
            }
            this.optionMaxHeight.maxHeight = BODYHEIGHT - OFFSETTOP - this.subtractionHeight + this.revisedHeight // 132 248 140 246
          }
          // console.log(BODYHEIGHT, OFFSETTOP, this.subtractionHeight, this.revisedHeight, this.option1 && this.option1.maxHeight)
        }
      }) // , this.computeMaxHeightDelay
    },
  },
}