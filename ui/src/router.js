import { createRouter, createWebHistory } from "vue-router";
import Classifier from "./pages/Classifier.vue";
import Inbox from "./pages/Inbox.vue";
import Reset from "./pages/Reset.vue";

const routes = [
  { path: "/", component: Classifier },
  { path: "/inbox", component: Inbox },
  { path: "/reset", component: Reset },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});