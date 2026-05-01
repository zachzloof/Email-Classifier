<template>
  <div class="min-h-[calc(100vh-64px)] px-4 py-12">
    <div class="max-w-lg mx-auto">

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Reset Database</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Danger zone</p>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">

        <div class="flex items-start gap-4 bg-red-50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/40 px-6 py-4">
          <span class="text-2xl mt-0.5 select-none">⚠️</span>
          <div>
            <p class="text-sm font-semibold text-red-700 dark:text-red-400">Destructive action</p>
            <p class="text-xs text-red-600/70 dark:text-red-400/60 mt-0.5 leading-relaxed">
              This will permanently delete all stored classified emails. This cannot be undone.
            </p>
          </div>
        </div>

        <div class="px-6 py-5">
          <Transition name="fade">
            <p v-if="message" class="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1.5">
              <span class="font-bold">✓</span> {{ message }}
            </p>
          </Transition>
          <Transition name="fade">
            <p v-if="error" class="text-sm font-medium text-red-600 dark:text-red-400 mb-4 flex items-center gap-1.5">
              <span class="font-bold">✗</span> {{ error }}
            </p>
          </Transition>

          <button
            @click="resetDB"
            :disabled="loading"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ loading ? 'Resetting...' : 'Reset Database' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const loading = ref(false);
const message = ref('');
const error = ref('');

async function resetDB() {
  loading.value = true;
  message.value = '';
  error.value = '';

  try {
    const res = await fetch('http://localhost:3001/reset', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    message.value = 'Database successfully reset.';
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
