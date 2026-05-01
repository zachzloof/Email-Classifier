import { ref } from "vue";

export const authState = ref(null); // null = not yet checked

export async function checkAuth() {
  const res = await fetch("http://localhost:3001/auth/status");
  authState.value = await res.json();
  return authState.value;
}

export async function logout() {
  await fetch("http://localhost:3001/auth/logout", { method: "POST" });
  authState.value = { loggedIn: false };
}
