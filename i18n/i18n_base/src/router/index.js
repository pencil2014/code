import Vue from 'vue'
import Router from 'vue-router'
import i18n from '@/i18n/index'
Vue.use(Router)

const originalPush = Router.prototype.push

Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/login.vue'),
    meta: {
      title: i18n.t('login.signIn'),
    },
  },
  {
    path: '/forget',
    name: 'Forget',
    component: () => import('@/components/forget.vue'),
    meta: {
      title: i18n.t('forget.title'),
    },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home.vue'),
    meta: {
      title: i18n.t('tags.home'),
    },
  },
  {
    path: '/userInfo',
    name: 'UserInfo',
    component: () => import('@/views/userInfo.vue'),
    meta: {
      title: i18n.t('tags.userInfo'),
    },
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404.vue'),
    meta: {
      title: '404',
    },
  },
]

let router = new Router({
  mode: 'hash',
  scrollBehavior: () => ({ y: 0 }),
  routes: routes,
})

export default router
