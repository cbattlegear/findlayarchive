import { createWebHistory, createRouter } from "vue-router";
import ArchiveSearch from "@/ArchiveSearch.vue";
import Hat from "@/Hat.vue";
import Designs from "@/Designs.vue";

const routes = [
  {
    path: "/",
    name: "ArchiveSearch",
    component: ArchiveSearch,
  },
  { 
    path: '/hats/:id', 
    name: "hats",
    component: Hat },
  { 
    path: '/designs', 
    name: "designs",
    component: Designs },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;