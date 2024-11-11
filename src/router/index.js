import { createRouter, createWebHistory } from "vue-router";
import GameWon from "../components/GameWon.vue";
import Main from "../components/Main.vue";

const routes = [
  {
    path: '/',
    name: 'main',
    component: Main
  },
  {
    path: '/game-won',
    name: 'game-won',
    component: GameWon
  },

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;