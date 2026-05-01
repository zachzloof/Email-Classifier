<template>
  <div class="min-h-[calc(100vh-64px)] px-4 py-10">
    <div class="max-w-2xl mx-auto">

      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Inbox</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {{ emails.length }} classified email{{ emails.length !== 1 ? 's' : '' }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Transition name="fade">
            <span v-if="syncMessage" class="text-xs font-medium" :class="syncMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
              {{ syncMessage.text }}
            </span>
          </Transition>
          <button
            @click="sync"
            :disabled="syncing"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <span v-if="syncing" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ syncing ? 'Syncing...' : 'Sync' }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-24">
        <div class="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>

      <!-- Empty state -->
      <div v-if="!loading && emails.length === 0" class="text-center py-24">
        <div class="text-5xl mb-4 select-none">📭</div>
        <p class="font-semibold text-slate-700 dark:text-slate-300">No emails yet</p>
        <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Classified emails will appear here</p>
      </div>

      <!-- Email list -->
      <div
        v-for="email in emails"
        :key="email.id"
        class="email-card"
        @click="openEmail(email)"
      >
        <div class="priority-stripe" :class="priorityStripe(email.priority)" />
        <div class="flex-1 min-w-0 px-4 py-3.5">
          <div class="flex items-start justify-between gap-3 mb-1.5">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-snug">{{ email.subject }}</h3>
            <small class="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0 mt-0.5">{{ email.created_at }}</small>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <span class="badge category-badge">{{ email.category }}</span>
            <span class="badge" :class="priorityClass(email.priority)">{{ email.priority }}</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{{ email.summary }}</p>
        </div>
      </div>

    </div>
  </div>

  <!-- Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="selectedEmail" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="closeEmail" />

        <div class="modal-card relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto border border-slate-200 dark:border-slate-700">

          <!-- Modal header -->
          <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 pt-5 pb-4 rounded-t-2xl">
            <div class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">{{ selectedEmail.subject }}</h2>
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <span class="badge category-badge">{{ selectedEmail.category }}</span>
                  <span class="badge" :class="priorityClass(selectedEmail.priority)">{{ selectedEmail.priority }}</span>
                  <small class="text-[11px] text-slate-400 dark:text-slate-500">{{ selectedEmail.created_at }}</small>
                </div>
              </div>
              <button
                @click="closeEmail"
                class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
              >✕</button>
            </div>
          </div>

          <div class="p-6 space-y-5">

            <!-- Summary -->
            <div>
              <p class="section-label">Summary</p>
              <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ selectedEmail.summary }}</p>
            </div>

            <!-- Suggested Action -->
            <div class="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4">
              <p class="section-label">Suggested Action</p>
              <p class="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">{{ selectedEmail.suggested_action }}</p>
            </div>

            <!-- Original Email -->
            <div>
              <p class="section-label">Original Email</p>
              <pre class="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 whitespace-pre-wrap break-words leading-relaxed font-sans">{{ selectedEmail.body }}</pre>
            </div>

            <hr class="border-slate-100 dark:border-slate-800" />

            <!-- Reply -->
            <div>
              <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Reply</h3>

              <div v-if="replySent" class="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4">
                <span class="text-emerald-500 font-bold">✓</span>
                <span class="text-sm font-medium text-emerald-700 dark:text-emerald-400">Reply sent</span>
              </div>

              <div v-else class="space-y-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Subject</label>
                  <input v-model="replySubject" type="text" class="reply-input" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Body</label>
                  <textarea v-model="replyBody" rows="5" placeholder="Write your reply..." class="reply-input resize-none" />
                </div>
                <p v-if="replyError" class="text-xs text-red-500 dark:text-red-400">{{ replyError }}</p>
                <div class="flex justify-end">
                  <button
                    @click="sendReply"
                    :disabled="!replyBody.trim() || replySending"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                  >
                    <span v-if="replySending" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {{ replySending ? 'Sending...' : 'Send Reply' }}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const emails = ref([]);
const loading = ref(false);
const selectedEmail = ref(null);
const replySubject = ref('');
const replyBody = ref('');
const replySent = ref(false);
const replySending = ref(false);
const replyError = ref('');
const syncing = ref(false);
const syncMessage = ref(null);

function priorityClass(priority) {
  return {
    'priority-low': priority === 'Low',
    'priority-medium': priority === 'Medium',
    'priority-high': priority === 'High',
    'priority-critical': priority === 'Critical',
  };
}

function priorityStripe(priority) {
  return {
    'stripe-low': priority === 'Low',
    'stripe-medium': priority === 'Medium',
    'stripe-high': priority === 'High',
    'stripe-critical': priority === 'Critical',
  };
}

async function fetchEmails() {
  loading.value = true;
  try {
    const res = await fetch('http://localhost:3001/emails');
    emails.value = await res.json();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function openEmail(email) {
  selectedEmail.value = email;
  replySubject.value = `Re: ${email.subject}`;
  replyBody.value = '';
  replySent.value = false;
}

function closeEmail() {
  selectedEmail.value = null;
}

async function sendReply() {
  if (!selectedEmail.value.graph_id) {
    replyError.value = 'This email was not synced from Outlook and cannot be replied to.';
    return;
  }
  replySending.value = true;
  replyError.value = '';
  try {
    const res = await fetch(`http://localhost:3001/reply/${selectedEmail.value.graph_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: replySubject.value, body: replyBody.value }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to send reply');
    }
    replySent.value = true;
  } catch (err) {
    replyError.value = err.message;
  } finally {
    replySending.value = false;
  }
}

async function sync() {
  syncing.value = true;
  syncMessage.value = null;
  try {
    const res = await fetch('http://localhost:3001/sync', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sync failed');
    syncMessage.value = {
      type: 'success',
      text: data.added > 0 ? `+${data.added} new email${data.added !== 1 ? 's' : ''}` : 'Already up to date',
    };
    if (data.added > 0) await fetchEmails();
  } catch (err) {
    syncMessage.value = { type: 'error', text: err.message };
  } finally {
    syncing.value = false;
    setTimeout(() => { syncMessage.value = null; }, 4000);
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') closeEmail();
}

onMounted(() => {
  fetchEmails();
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.email-card {
  display: flex;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.15s, transform 0.12s, border-color 0.15s;
}

html.dark .email-card {
  background: #0f172a;
  border-color: #1e293b;
}

.email-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
  transform: translateY(-1px);
  border-color: #cbd5e1;
}

html.dark .email-card:hover {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  border-color: #334155;
}

.priority-stripe {
  width: 4px;
  flex-shrink: 0;
}

.stripe-low      { background: #22c55e; }
.stripe-medium   { background: #eab308; }
.stripe-high     { background: #ef4444; }
.stripe-critical { background: linear-gradient(180deg, #a855f7, #ec4899); }

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.category-badge  { background: #e0f2fe; color: #0369a1; }
.priority-low    { background: #dcfce7; color: #15803d; }
.priority-medium { background: #fef9c3; color: #a16207; }
.priority-high   { background: #fee2e2; color: #b91c1c; }
.priority-critical {
  background: #1e0a2e;
  color: #e879f9;
  box-shadow: 0 0 5px rgba(232, 121, 249, 0.35);
}

.section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  margin-bottom: 6px;
}

.reply-input {
  width: 100%;
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #0f172a;
  font-size: 13px;
  font-family: 'Inter', system-ui, sans-serif;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}

html.dark .reply-input {
  border-color: #334155;
  background: #1e293b;
  color: #f1f5f9;
}

.reply-input::placeholder { color: #94a3b8; }

.reply-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Modal transition */
.modal-fade-enter-active {
  transition: opacity 0.2s ease;
}
.modal-fade-leave-active {
  transition: opacity 0.15s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-card {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-fade-enter-from .modal-card {
  transform: translateY(12px) scale(0.97);
  opacity: 0;
}
</style>
