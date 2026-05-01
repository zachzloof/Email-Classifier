<template>
  <nav class="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
    <div class="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">

      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm text-white text-sm select-none">
          ✉
        </div>
        <span class="font-semibold text-slate-900 dark:text-slate-100 tracking-tight">MailAI</span>
      </div>

      <div class="flex items-center gap-1">
        <router-link to="/" class="nav-link">Classifier</router-link>
        <router-link to="/inbox" class="nav-link">Inbox</router-link>
        <router-link to="/reset" class="nav-link">Reset</router-link>
      </div>

      <button
        @click="toggleDark"
        class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 text-base select-none"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        {{ isDark ? '☀️' : '🌙' }}
      </button>

    </div>
  </nav>

  <router-view />
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
  if (saved === 'true') {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }
});
</script>

<style>
.nav-link {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  text-decoration: none;
  transition: color 0.15s, background-color 0.15s;
}

.nav-link:hover {
  color: #0f172a;
  background-color: #f1f5f9;
}

html.dark .nav-link {
  color: #94a3b8;
}

html.dark .nav-link:hover {
  color: #f1f5f9;
  background-color: #1e293b;
}

.nav-link.router-link-exact-active {
  color: #2563eb;
  background-color: #eff6ff;
  font-weight: 600;
}

html.dark .nav-link.router-link-exact-active {
  color: #60a5fa;
  background-color: rgba(59, 130, 246, 0.12);
}
</style>
