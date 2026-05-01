import { createRouter, createWebHistory } from "vue-router";
import Classifier from "./pages/Classifier.vue";
import Inbox from "./pages/Inbox.vue";

const routes = [
  { path: "/", component: Classifier },
  { path: "/inbox", component: Inbox },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});