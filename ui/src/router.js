import { createRouter, createWebHistory } from "vue-router";
import Classifier from "./pages/Classifier.vue";
import Inbox from "./pages/Inbox.vue";
import Reset from "./pages/Reset.vue";
import Login from "./pages/Login.vue";
import Settings from "./pages/Settings.vue";
import { authState, checkAuth } from "./auth.js";

const routes = [
  { path: "/login", component: Login, meta: { public: true } },
  { path: "/", component: Classifier },
  { path: "/inbox", component: Inbox },
  { path: "/settings", component: Settings },
  { path: "/reset", component: Reset },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  if (to.meta.public) return true;

  // Only hit the API once per session — authState caches the result
  if (authState.value === null) await checkAuth();

  if (!authState.value?.loggedIn) return "/login";
  return true;
});

export default router;
