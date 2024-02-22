import { useBlockchain } from "@/stores";
import { createRouter, createWebHistory } from "vue-router";
// @ts-ignore
import { setupLayouts } from "virtual:generated-layouts";
// @ts-ignore
import routes from "~pages";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{
    path: "/",
    redirect: { path: "/saw"}, // redirect property 
    component: () => import("@/modules/[chain]/index.vue"),
  },...setupLayouts(routes)],
})

//update current blockchain
router.beforeEach((to) => {
    const { chain } = to.params
    const blockchain = useBlockchain()
    if(chain){
      if(chain !== blockchain.chainName) {
        blockchain.setCurrent(chain.toString())
      }
    } 
})

// Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards

export default router;