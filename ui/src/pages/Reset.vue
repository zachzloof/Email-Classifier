<template>
  <div class="min-h-[calc(100vh-64px)] px-4 py-12">
    <div class="max-w-lg mx-auto space-y-6">

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Reset</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Danger zone</p>
      </div>

      <!-- Reset Emails -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div class="flex items-start gap-4 bg-red-50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/40 px-6 py-4">
          <span class="text-2xl mt-0.5 select-none">⚠️</span>
          <div>
            <p class="text-sm font-semibold text-red-700 dark:text-red-400">Reset email database</p>
            <p class="text-xs text-red-600/70 dark:text-red-400/60 mt-0.5 leading-relaxed">
              Permanently deletes all stored classified emails. Cannot be undone.
            </p>
          </div>
        </div>
        <div class="px-6 py-5">
          <Transition name="fade">
            <p v-if="dbMessage" class="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1.5">
              <span class="font-bold">✓</span> {{ dbMessage }}
            </p>
          </Transition>
          <Transition name="fade">
            <p v-if="dbError" class="text-sm font-medium text-red-600 dark:text-red-400 mb-4 flex items-center gap-1.5">
              <span class="font-bold">✗</span> {{ dbError }}
            </p>
          </Transition>
          <button
            @click="resetDB"
            :disabled="dbLoading"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <span v-if="dbLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ dbLoading ? 'Resetting...' : 'Reset Email Database' }}
          </button>
        </div>
      </div>

      <!-- Reset Categories -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div class="flex items-start gap-4 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 px-6 py-4">
          <span class="text-2xl mt-0.5 select-none">↺</span>
          <div>
            <p class="text-sm font-semibold text-amber-700 dark:text-amber-400">Reset categories to defaults</p>
            <p class="text-xs text-amber-600/70 dark:text-amber-400/60 mt-0.5 leading-relaxed">
              Removes all custom categories and restores Work, Personal, and Spam.
              Already-classified emails will keep their old category labels — reset the email database too if you want a clean slate.
            </p>
          </div>
        </div>
        <div class="px-6 py-5">
          <Transition name="fade">
            <p v-if="catMessage" class="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1.5">
              <span class="font-bold">✓</span> {{ catMessage }}
            </p>
          </Transition>
          <Transition name="fade">
            <p v-if="catError" class="text-sm font-medium text-red-600 dark:text-red-400 mb-4 flex items-center gap-1.5">
              <span class="font-bold">✗</span> {{ catError }}
            </p>
          </Transition>
          <button
            @click="resetCategories"
            :disabled="catLoading"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 dark:disabled:bg-amber-900/50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <span v-if="catLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ catLoading ? 'Resetting...' : 'Reset Categories' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const dbLoading = ref(false);
const dbMessage = ref('');
const dbError = ref('');

const catLoading = ref(false);
const catMessage = ref('');
const catError = ref('');

async function resetDB() {
  dbLoading.value = true;
  dbMessage.value = '';
  dbError.value = '';
  try {
    const res = await fetch('http://localhost:3001/reset', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    dbMessage.value = 'Email database reset successfully.';
  } catch (err) {
    dbError.value = err.message;
  } finally {
    dbLoading.value = false;
  }
}

async function resetCategories() {
  if (!confirm('Reset all categories to defaults (Work, Personal, Spam)?\n\nNote: already-classified emails will keep their old category labels. Reset the email database too if you want a clean slate.')) return;
  catLoading.value = true;
  catMessage.value = '';
  catError.value = '';
  try {
    const res = await fetch('http://localhost:3001/reset-categories', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    catMessage.value = 'Categories reset to defaults.';
  } catch (err) {
    catError.value = err.message;
  } finally {
    catLoading.value = false;
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
