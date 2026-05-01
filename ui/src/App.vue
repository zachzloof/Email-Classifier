<template>
  <div>
    <nav class="nav">
      <div class="nav-links">
        <router-link to="/">Classifier</router-link>
        <router-link to="/inbox">Inbox</router-link>
        <router-link to="/reset">Reset</router-link>
      </div>
      <button @click="toggleDark" class="dark-toggle" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isDark = ref(false);

function toggleDark() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('darkMode', String(isDark.value));
}

onMounted(() => {
  const saved = localStorage.getItem('darkMode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'true' || (saved === null && prefersDark)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }
});
</script>

<style>
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg);
  transition: background-color 0.2s, border-color 0.2s;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav a {
  text-decoration: none;
  font-weight: bold;
  color: #3b82f6;
}

.dark-toggle {
  background: none;
  border: 1px solid var(--color-border-input);
  border-radius: 8px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1.5;
  transition: border-color 0.2s;
}
</style>
