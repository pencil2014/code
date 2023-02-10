// import defaultSettings from '@/settings'
import i18n from '@/lang'


const title = i18n.t('Common.webTitle')

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
