import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { authGuard } from '@/_helpers/auth-guard'
import { error404Redirect } from '@/_helpers/error-redirect'
import * as ErrorPage from '../views/Error'
import { accountService } from '@/_services'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/connection',
      name: 'connection',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ConnectionView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      children: [
        {
          path: '',
          name: 'adminDashboard',
          component: () => import('../views/Admin/AdminView.vue')
        },
        {
          path: 'leads/litiges',
          name: 'adminLeadsLitiges',
          component: () => import('../views/Admin/LeadsLitigesView.vue')
        },
        {
          path: 'enterprises',
          name: 'adminEnterprises',
          component: () => import('../views/Admin/EnterprisesView.vue')
        },
        {
          path: 'users',
          name: 'adminUsers',
          component: () => import('../views/Admin/UsersView.vue')
        }
      ]
    },
    {
      path: '/account',
      name: 'account',
      //component: () => import('../views/Account/AccountView.vue'),
      children: [
        {
          path: '',
          name: 'accountDashboard',
          component: () => import('../views/Account/AccountView.vue')
        },
        {
          path: 'status-leads',
          name: 'statusLead',
          component: () => import('../views/Account/StatusLeadsView.vue')
        },
        {
          path: 'submit-lead',
          name: 'submitLead',
          component: () => import('../views/Account/SubmitLeadView.vue')
        }
      ]
    },
    {
      path: '/list-leads/:query?',
      name: 'listLeads',
      component: () => import('../views/ListLeadsView.vue')
    },
    {
      path: '/buy-lead/:id',
      name: 'buyLead',
      component: () => import('../views/BuyLeadView.vue')
    },
    {
      path: '/success-payment/',
      name: 'successPayment',
      component: () => import('../views/successPayment.vue')
    },
    {
      path: '/create-checkout-session/',
      name: 'createCheckoutSession',
      component: () => import('../views/createCheckoutSession.vue')
    },
    {
      path: '/error',
      name: 'error',
      component: ErrorPage.Error_layout,
      children: [{ path: '404', name: 'error404', component: ErrorPage.Error_404 }]
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/testView.vue')
    },
    {
      path: '/oldleadfacture',
      name: 'oldleadfacture',
      component: () => import('../views/oldLeadsFacturesComponent.vue')
    }
  ]
})

// Vérouillage de la partie admin (token)
router.beforeEach(async (to, from, next) => {
  // console.log("---------to--------")
  // console.log(to.name);
  // console.log("---------from--------")
  // console.log(from.name);
  // console.log("--------------------------")
  //console.log(to.matched[0])
  if (typeof to.matched[0] !== 'undefined') {
    if (to.matched[0].name == 'account' || to.matched[0].name == 'admin') {
      authGuard()
      // check if logged in admin and the route is for account user
      if (to.matched[0].name == 'account' && accountService.isAdmin()) {
        router.push('/admin')
      }
    }
    else{
      if(! (await accountService.sessionUserIsGood())){ // check if session user is good 
        accountService.clearSessionUser()
      }      
    }
  } else if (typeof to.matched[0] == 'undefined') {
    error404Redirect()
  }

  next()
})

export default router
