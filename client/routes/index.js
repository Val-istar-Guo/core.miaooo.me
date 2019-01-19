
export default [
  {
    path: '/applications',
    component: () => import('../views/applications'),
  },
  {
    path: '/domains',
    component: () => import('../views/domains'),
  },
  {
    path: '/services',
    component: () => import('../views/services'),
  },
  {
    path: '/certificates',
    component: () => import('../views/services'),
  },
]
