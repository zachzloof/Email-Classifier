<template>
  <div class="min-h-[calc(100vh-64px)] px-4 py-12">
    <div class="max-w-2xl mx-auto">

      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold tracking-tight mb-3">
          <span class="text-slate-900 dark:text-slate-100">Email </span>
          <span class="bg-gradient-to-r from-blue-700 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">Classifier</span>
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-base">Paste an email and let AI sort it instantly</p>
      </div>

      <!-- Form card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-4">
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email content</label>
        <textarea
          v-model="email"
          placeholder="Paste an email here..."
          rows="8"
          class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        />

        <div class="flex justify-end mt-3">
          <button
            @click="classify"
            :disabled="loading || !email.trim()"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ loading ? 'Classifying...' : 'Classify Email' }}
          </button>
        </div>
      </div>

      <!-- Result -->
      <Transition name="slide-up">
        <div v-if="result" class="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-sm overflow-hidden">
          <div class="bg-emerald-50 dark:bg-emerald-950/40 px-6 py-3 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
            <span class="text-emerald-500 font-bold">✓</span>
            <span class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Classified</span>
          </div>
          <div class="p-6 grid grid-cols-2 gap-5">
            <div>
              <p class="field-label">Category</p>
              <p class="field-value">{{ result.category }}</p>
            </div>
            <div>
              <p class="field-label">Priority</p>
              <span class="badge" :class="priorityClass(result.priority)">{{ result.priority }}</span>
            </div>
            <div class="col-span-2">
              <p class="field-label">Summary</p>
              <p class="field-value">{{ result.summary }}</p>
            </div>
            <div class="col-span-2">
              <p class="field-label">Suggested Action</p>
              <p class="field-value italic">{{ result.suggested_action }}</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Error -->
      <Transition name="slide-up">
        <div v-if="error" class="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/60 shadow-sm overflow-hidden">
          <div class="bg-red-50 dark:bg-red-950/40 px-6 py-3 border-b border-red-100 dark:border-red-900/50">
            <span class="text-sm font-semibold text-red-600 dark:text-red-400">⚠️ Parse Error</span>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-sm text-slate-700 dark:text-slate-300"><strong>Message:</strong> {{ error.message }}</p>
            <div v-if="error.raw">
              <p class="field-label mb-1">Raw Output</p>
              <pre class="text-xs bg-slate-950 text-green-400 p-4 rounded-xl overflow-x-auto leading-relaxed">{{ error.raw }}</pre>
            </div>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const result = ref(null);
const error = ref(null);
const loading = ref(false);

function priorityClass(priority) {
  return {
    'priority-low': priority === 'Low',
    'priority-medium': priority === 'Medium',
    'priority-high': priority === 'High',
    'priority-critical': priority === 'Critical',
  };
}

async function classify() {
  loading.value = true;
  result.value = null;
  error.value = null;

  try {
    const res = await fetch('http://localhost:3001/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    });

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.error || 'Request failed');
      err.json = data;
      throw err;
    }

    result.value = data;
  } catch (err) {
    console.log(err);
    error.value = {
      message: err.message,
      raw: err.json?.raw,
      details: err.json?.details,
    };
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.field-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #94a3b8;
  margin-bottom: 4px;
}

.field-value {
  font-size: 14px;
  color: #0f172a;
  line-height: 1.65;
}

html.dark .field-value {
  color: #e2e8f0;
}

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.priority-low    { background: #dcfce7; color: #15803d; }
.priority-medium { background: #fef9c3; color: #a16207; }
.priority-high   { background: #fee2e2; color: #b91c1c; }
.priority-critical {
  background: #1e0a2e;
  color: #e879f9;
  box-shadow: 0 0 6px rgba(232, 121, 249, 0.4);
}

.slide-up-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>
