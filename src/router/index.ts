import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type NavigationGuardWithThis,
  type RouteLocationNormalized,
} from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SignInView from '@/views/SignInView.vue'
import LeaguesView from '@/views/LeaguesView.vue'
import ManageLeagueView from '@/views/ManageLeagueView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ContactView from '@/views/ContactView.vue'
import { useUserStore } from '@/stores/user'
import ContribueView from '@/views/ContribueView.vue'

const requireAuth: NavigationGuardWithThis<undefined> = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  console.log(`Checking access for route ${to.fullPath}`)
  const userStore = useUserStore()
  if (userStore.user) {
    next()
  } else {
    console.error(`Please sign in to access ${to.fullPath}`)
    next({ name: 'signin' })
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/leagues',
      name: 'leagues',
      component: LeaguesView,
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignInView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/manage',
      name: 'manage',
      component: ManageLeagueView,
      beforeEnter: requireAuth,
    },
    {
      path: '/contribute',
      name: 'contribute',
      component: ContribueView,
      beforeEnter: requireAuth,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      redirect: '/',
    },
  ],
})

export default router
