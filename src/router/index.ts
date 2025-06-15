import { RouteRecordRaw } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Accounts from '../views/Accounts.vue'
import Tweets from '../views/Tweets.vue'
import Automation from '../views/Automation.vue'
import Analytics from '../views/Analytics.vue'
import Settings from '../views/Settings.vue'
import IntegratedOperations from '../views/IntegratedOperations.vue'
import CommentGeneration from '../views/CommentGeneration.vue'
import TweetGeneration from '../views/TweetGeneration.vue'
import ContentEvaluation from '../views/ContentEvaluation.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: Accounts,
    meta: { requiresAuth: true }
  },
  {
    path: '/tweets',
    name: 'Tweets',
    component: Tweets,
    meta: { requiresAuth: true }
  },
  {
    path: '/automation',
    name: 'Automation',
    component: Automation,
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: { requiresAuth: true }
  },
  // 新增的四个页面路由
  {
    path: '/integrated-operations',
    name: 'IntegratedOperations',
    component: IntegratedOperations,
    meta: { requiresAuth: true }
  },
  {
    path: '/comment-generation',
    name: 'CommentGeneration',
    component: CommentGeneration,
    meta: { requiresAuth: true }
  },
  {
    path: '/tweet-generation',
    name: 'TweetGeneration',
    component: TweetGeneration,
    meta: { requiresAuth: true }
  },
  {
    path: '/content-evaluation',
    name: 'ContentEvaluation',
    component: ContentEvaluation,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  }
]

export default routes