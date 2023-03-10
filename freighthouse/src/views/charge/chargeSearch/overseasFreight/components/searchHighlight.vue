<template>
  <div class="search-highlight" v-html="contentShow">
  </div>
</template>

<script>
const PLUGIN_FLAG = 'search-hightlight'

export default {
  props: {
    content: {
      type: String,
      default: ''
    },
    keyword: {
      type: String,
      default: ''
    },
    highlightStyle: {
      type: String,
      default: 'background: #ffff00'
    },
    currentStyle: {
      type: String,
      default: 'background: #ff9632'
    },
    regExp: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      lightIndex: 0,
      matchCount: 0,
      contentShow: '',
      random: `${Math.random()}`.slice(2)
    }
  },
  computed: {
    watchString () {
      return [this.content, this.keyword]
    },
    watchStyle () {
      return [this.lightIndex, this.highlightStyle, this.currentStyle]
    },
    flag () {
      return `${PLUGIN_FLAG}${this.random}`
    },
    styleSelector () {
      return `style[${this.flag}]`
    },
  },
  watch: {
    watchString: {
      immediate: true,
      handler () {
        this.replaceKeywords()
      }
    },
    watchStyle: {
      immediate: true,
      handler () {
        this.setStyle()
      }
    },
    lightIndex: {
      immediate: true,
      handler () {
        this.$emit('current-change', this.lightIndex)
      }
    },
    matchCount: {
      immediate: true,
      handler () {
        this.$emit('match-count-change', this.matchCount)
      }
    }
  },
  beforeDestroy () {
    this.clearStyle()
  },
  methods: {
    getTextNodeList (dom) {
      const nodeList = [...dom.childNodes]
      const textNodes = []
      while (nodeList.length) {
        const node = nodeList.shift()
        if (node.nodeType === node.TEXT_NODE) {
          node.wholeText && textNodes.push(node)
        } else {
          nodeList.unshift(...node.childNodes)
        }
      }
      return textNodes
    },

    getTextInfoList (textNodes) {
      let length = 0
      const textList = textNodes.map(node => {
        let startIdx = length, endIdx = length + node.wholeText.length
        length = endIdx
        return {
          text: node.wholeText,
          startIdx,
          endIdx
        }
      })
      return textList
    },

    getMatchList (content, keyword) {
      if (!this.regExp) {
        const characters = [...'\\[](){}?.+*^$:|'].reduce((r, c) => (r[c] = true, r), {})
        keyword = keyword.split('').map(s => characters[s] ? `\\${s}` : s).join('[\\s\\n]*')
      }
      const reg = new RegExp(keyword, 'gmi')
      const matchList = []
      let match = reg.exec(content)
      while (match) {
        matchList.push(match)
        match = reg.exec(content)
      }
      return matchList
    },

    replaceMatchResult (textNodes, textList, matchList) {
      // ????????????????????????????????????????????????????????????????????????????????????????????????????????????font???????????????
      for (let i = matchList.length - 1; i >= 0; i--) {
        const match = matchList[i]
        const matchStart = match.index, matchEnd = matchStart + match[0].length // ????????????????????????????????????????????????
        // ??????????????????????????????????????????????????????
        for (let textIdx = 0; textIdx < textList.length; textIdx++) {
          const { text, startIdx, endIdx } = textList[textIdx] // ?????????????????????????????????????????????????????????
          if (endIdx < matchStart) continue // ?????????????????????????????????
          if (startIdx >= matchEnd) break // ????????????????????????????????????
          let textNode = textNodes[textIdx] // ??????????????????????????????????????????????????????????????????????????????????????????????????????
          const nodeMatchStartIdx = Math.max(0, matchStart - startIdx) // ???????????????????????????????????????????????????
          const nodeMatchLength = Math.min(endIdx, matchEnd) - startIdx - nodeMatchStartIdx // ??????????????????????????????????????????
          if (nodeMatchStartIdx > 0) textNode = textNode.splitText(nodeMatchStartIdx) // textNode???????????????
          if (nodeMatchLength < textNode.wholeText.length) textNode.splitText(nodeMatchLength)
          const font = document.createElement('font')
          font.setAttribute(this.flag, i + 1)
          font.innerText = text.substr(nodeMatchStartIdx, nodeMatchLength)
          textNode.parentNode.replaceChild(font, textNode)
        }
      }
    },

    replaceKeywords () {
      let errFlag = false
      if (this.regExp) {
        try {
          const reg = new RegExp(this.keyword)
          if (reg.test('')) errFlag = true
        } catch (err) {
          errFlag = true
        }
      }
      if (errFlag || !this.keyword) {
        this.matchCount = 0;
        this.lightIndex = 0;
        this.contentShow = this.content
        return
      }
      const div = document.createElement('div')
      div.innerHTML = this.content
      const textNodes = this.getTextNodeList(div)
      const textList = this.getTextInfoList(textNodes)
      const content = textList.map(({ text }) => text).join('')
      const matchList = this.getMatchList(content, this.keyword)
      this.matchCount = matchList.length
      this.lightIndex = this.matchCount ? 1 : 0
      this.replaceMatchResult(textNodes, textList, matchList)
      this.contentShow = div.innerHTML
    },
    scrollTo (index) {
      this.$nextTick(() => {
        let node = this.$el.querySelector(`font[${this.flag}='${index}']`)
        if (node) {
          this.lightIndex = index
          node.scrollIntoView()
        }
      })
    },
    searchNext () {
      this.$nextTick(() => {
        let idx = this.lightIndex >= this.matchCount ? 1 : this.lightIndex + 1
        this.scrollTo(idx)
      })
    },
    searchLast () {
      this.$nextTick(() => {
        let idx = this.lightIndex <= 1 ? this.matchCount : this.lightIndex - 1
        this.scrollTo(idx)
      })
    },
    setStyle () {
      let style = document.head.querySelector(this.styleSelector)
      if (!style) {
        style = document.createElement('style')
        style.setAttribute(this.flag, 1)
      }
      style.innerText = `font[${this.flag}]{${this.highlightStyle}}font[${this.flag}='${this.lightIndex}']{${this.currentStyle}}`
      document.head.appendChild(style)
    },
    clearStyle () {
      let style = document.head.querySelector(this.styleSelector)
      style && document.head.removeChild(style)
    }
  }
}
</script>
