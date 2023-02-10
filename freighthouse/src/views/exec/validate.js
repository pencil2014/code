export function validateChineseChart(text) {
  return (rule, value, callback) => {
		const reg = /[^\x00-\x7F]+/g
		if (value) {
			if (reg.test(value)) {
				callback(new Error(`${text}不能输入中文`))
			} else {
				callback()
			}
		} else {
			callback()
		}
	}
}