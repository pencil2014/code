export const billMixin = {
  data() {
    return {
    }
  },
  mounted() {
    let billDetailO = document.getElementsByClassName('finance-bill-detail')[0]
    billDetailO && billDetailO.addEventListener('click', e => {
      this.showTitleDropdown = false
    })
  },
  methods: {
    showTitleDropdownAction(e) {
      this.showTitleDropdown = !this.showTitleDropdown
      e.stopPropagation()
    },
    titleDropdownSelect(e) {
      let O = e.target
      if (O.nodeName === 'SPAN') {
        O = O.parentNode
      }
      let spanO = O.getElementsByTagName('span')[0]
      this.longsailTitle = spanO.innerText
      this.showTitleDropdown = false
      e.stopPropagation()
    },
    companyBankAccountChange(value, fromComponent) {
      this.bankAccountList = []
      value.forEach(id => {
        let obj = this.bankAccountSelectOptions3.find(subItem => {
          return subItem.settleUnitBankAcctId == id
        })
        if (obj) {
          this.bankAccountList.push(obj)
        }
      })
      if (fromComponent) {
        this.bankAccountSelectChange = true
      } else {
        this.bankAccountSelectChange = false
      }
      // 处理银行账号信息相同，账号或币种不同的合并显示
      this.bankAccountListHandle = []
      this.bankAccountList.forEach(item => {
        let item2_ = ''
        if (!this.bankAccountListHandle.length) {
          this.bankAccountListHandle.push(item)
        } else if (this.bankAccountListHandle.some(item2 => {
          item2_ = item2
          if (this.lang === 'zh') {
            return item.accountName === item2.accountName && item.regAddr === item2.regAddr && item.bankName === item2.bankName && item.bankAddr === item2.bankAddr && item.swiftCode === item2.swiftCode && item.accountNo !== item2.accountNo
          } else if (this.lang === 'en') {
            return item.accountEname === item2.accountEname && item.regEaddr === item2.regEaddr && item.bankEname === item2.bankEname && item.bankEname === item2.bankEname && item.swiftCode === item2.swiftCode && item.accountNo !== item2.accountNo
          }
        })) {
          if ((!item2_.repeatingAccountList || item2_.repeatingAccountList.every(item3 => { // 增加此判断避免重复添加
            return item.accountNo !== item3.accountNo || item.currency !== item3.currency
          }))) {
            item2_.hasRepeat = true
            if (!item2_.repeatingAccountList) {
              item2_.repeatingAccountList = []
              item2_.repeatingAccountList.push(item2_, item)
            } else {
              item2_.repeatingAccountList.push(item)
            }
          } else { // 存在相同的，不做动作
          }
        } else {
          this.bankAccountListHandle.push(item)
        }
      })
    },
    sortChange(column, prop, order, option) {
      if (order === 'ascending') {
        this.ascColumns = prop
        this.descColumns = ''
      } else if (order === 'descending') {
        this.ascColumns = ''
        this.descColumns = prop
      } else {
        this.ascColumns = ''
        this.descColumns = ''
      }
      let factor = order === 'ascending' ? 1 : order === 'descending' ? '-1' : 0
      if (factor === 0) {
        return this.option1.data = JSON.parse(JSON.stringify(this.option1DataBackup))
      }
      this.option1.data.sort((a, b) => {
        if (typeof a[prop] === 'string' && typeof b[prop] === 'string') {
          return a[prop].localeCompare(b[prop]) * factor
        } else {
          if (a[prop] <= b[prop]) {
            return -1 * factor
          } else {
            return 1 * factor
          }
        }
      })
    },
  },
}