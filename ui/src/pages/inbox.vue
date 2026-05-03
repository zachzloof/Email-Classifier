<template>
  <div class="min-h-[calc(100vh-64px)] px-4 py-10">
    <div class="max-w-2xl mx-auto">

      <!-- Header -->
      <div class="flex items-start justify-between mb-5">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Inbox</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {{ filteredEmails.length }} email{{ filteredEmails.length !== 1 ? 's' : '' }}
            <span v-if="filterCategory || filterPriority" class="text-blue-500 dark:text-blue-400"> (filtered)</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Transition name="fade">
            <span v-if="syncMessage" class="text-xs font-medium" :class="syncMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
              {{ syncMessage.text }}
            </span>
          </Transition>
          <button @click="showSyncModal = true" :disabled="syncing" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-sm">
            <span v-if="syncing" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ syncing ? 'Syncing...' : 'Sync' }}
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <select v-model="filterCategory" class="filter-select">
          <option value="">All categories</option>
          <option v-for="cat in categoryNames" :key="cat" :value="cat">{{ cat }}</option>
        </select>

        <select v-model="filterPriority" class="filter-select">
          <option value="">All priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select v-model="sortBy" class="filter-select">
          <option value="received_desc">Newest first</option>
          <option value="received_asc">Oldest first</option>
          <option value="priority_asc">Priority (highest)</option>
          <option value="priority_desc">Priority (lowest)</option>
        </select>

        <button
          v-if="filterCategory || filterPriority"
          @click="filterCategory = ''; filterPriority = ''"
          class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >Clear ✕</button>

        <div class="ml-auto flex items-center gap-1">
          <span class="text-xs text-slate-400 dark:text-slate-500 mr-1">Per page:</span>
          <button
            v-for="size in [10, 20, 50, 100]"
            :key="size"
            @click="pageSize = size"
            class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
            :class="pageSize === size ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
          >{{ size }}</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-24">
        <div class="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>

      <!-- Empty: no emails at all -->
      <div v-if="!loading && emails.length === 0" class="text-center py-24">
        <div class="text-5xl mb-4 select-none">📭</div>
        <p class="font-semibold text-slate-700 dark:text-slate-300">No emails yet</p>
        <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Sync your Outlook inbox to get started</p>
      </div>

      <!-- Empty: filters returned nothing -->
      <div v-if="!loading && emails.length > 0 && filteredEmails.length === 0" class="text-center py-16">
        <p class="font-semibold text-slate-600 dark:text-slate-400">No emails match the current filters</p>
        <button @click="filterCategory = ''; filterPriority = ''" class="text-sm text-blue-500 hover:underline mt-2">Clear filters</button>
      </div>

      <!-- Delete error banner -->
      <Transition name="fade">
        <div v-if="deleteError" class="flex items-center justify-between px-4 py-3 mb-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
          <p class="text-xs font-medium text-red-700 dark:text-red-400">{{ deleteError }}</p>
          <button @click="deleteError = ''" class="text-red-400 hover:text-red-600 dark:hover:text-red-300 ml-3 text-sm leading-none">✕</button>
        </div>
      </Transition>

      <template v-if="!loading && paginatedEmails.length > 0">

        <!-- Select all / bulk actions bar -->
        <div class="flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <label class="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              :checked="pageAllSelected"
              :indeterminate.prop="somePageSelected && !pageAllSelected"
              @change="togglePageAll"
              class="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
              {{ selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all on page' }}
            </span>
          </label>
          <Transition name="fade">
            <button
              v-if="selectedIds.size > 0"
              @click="deleteSelected"
              :disabled="deleting"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
            >
              <span v-if="deleting" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Delete {{ selectedIds.size }}
            </button>
          </Transition>
        </div>

        <!-- Email list -->
        <div
          v-for="email in paginatedEmails"
          :key="email.id"
          class="email-card"
          :class="{ 'is-selected': selectedIds.has(email.id) }"
          @click="openEmail(email)"
        >
          <div class="priority-stripe" :class="priorityStripe(email.priority)" />
          <div class="checkbox-area" @click.stop>
            <input
              type="checkbox"
              :checked="selectedIds.has(email.id)"
              @change="toggleSelect(email.id)"
              class="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>
          <div class="flex-1 min-w-0 px-4 py-3.5">
            <div class="flex items-start justify-between gap-3 mb-1.5">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-snug">{{ email.subject }}</h3>
              <small class="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0 mt-0.5">{{ formatDate(email.received_at || email.created_at) }}</small>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <span class="badge category-badge">{{ email.category }}</span>
              <span class="badge" :class="priorityClass(email.priority)">{{ email.priority }}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{{ email.summary }}</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p class="text-xs text-slate-400 dark:text-slate-500">
            Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredEmails.length) }} of {{ filteredEmails.length }}
          </p>
          <div class="flex items-center gap-1">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >← Prev</button>
            <template v-for="p in visiblePages" :key="String(p) + 'pg'">
              <span v-if="p === null" class="px-1 text-xs text-slate-300 dark:text-slate-600">…</span>
              <button
                v-else
                @click="currentPage = p"
                class="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
                :class="currentPage === p ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
              >{{ p }}</button>
            </template>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >Next →</button>
          </div>
        </div>

      </template>
    </div>
  </div>

  <!-- Sync options modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showSyncModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="showSyncModal = false" />
        <div class="modal-card relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Sync Emails</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-5">Configure your sync settings.</p>

          <div class="space-y-4 mb-5">
            <!-- Time range -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">How far back</label>
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  <button v-for="d in [7, 14, 28, 56]" :key="d" @click="syncDays = d"
                    class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                    :class="syncDays === d ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'"
                  >{{ d }}d</button>
                </div>
                <div class="flex items-center gap-1.5 ml-auto">
                  <input type="number" v-model.number="syncDays" min="1" max="365"
                    class="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="text-xs text-slate-400">days</span>
                </div>
              </div>
            </div>

            <!-- Batch size -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Emails per sync <span class="font-normal">(max 100)</span></label>
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  <button v-for="l in [25, 50, 100]" :key="l" @click="syncLimit = l"
                    class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                    :class="syncLimit === l ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'"
                  >{{ l }}</button>
                </div>
                <input type="number" v-model.number="syncLimit" min="1" max="100"
                  class="ml-auto w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <button @click="startSync(false)" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors text-left">
              <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">All Inbox</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sync all emails in the selected time range</p>
            </button>
            <button @click="startSync(true)" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors text-left">
              <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">Focused only</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Only sync emails Outlook considers important</p>
            </button>
          </div>
          <button @click="showSyncModal = false" class="mt-4 w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors py-1">Cancel</button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="selectedEmail" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="closeEmail" />
        <div class="modal-card relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto border border-slate-200 dark:border-slate-700">

          <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 pt-5 pb-4 rounded-t-2xl">
            <div class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">{{ selectedEmail.subject }}</h2>
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <span class="badge category-badge">{{ selectedEmail.category }}</span>
                  <span class="badge" :class="priorityClass(selectedEmail.priority)">{{ selectedEmail.priority }}</span>
                  <small class="text-[11px] text-slate-400 dark:text-slate-500">{{ formatDate(selectedEmail.received_at || selectedEmail.created_at) }}</small>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button
                  @click="deleteSingle(selectedEmail.id)"
                  :disabled="deleting"
                  title="Delete email"
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-sm disabled:opacity-40"
                >🗑</button>
                <button
                  @click="closeEmail"
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                >✕</button>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-5">

            <div>
              <p class="section-label">Summary</p>
              <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ selectedEmail.summary }}</p>
            </div>

            <div class="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4">
              <p class="section-label">Suggested Action</p>
              <p class="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">{{ selectedEmail.suggested_action }}</p>
            </div>

            <div>
              <p class="section-label">Original Email</p>
              <pre class="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 whitespace-pre-wrap break-words leading-relaxed font-sans">{{ selectedEmail.body }}</pre>
            </div>

            <hr class="border-slate-100 dark:border-slate-800" />

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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const emails = ref([]);
const loading = ref(false);
const categoryNames = ref([]);

const filterCategory = ref('');
const filterPriority = ref('');
const sortBy = ref('received_desc');
const pageSize = ref(20);
const currentPage = ref(1);

const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isThisYear) return date.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}
const selectedIds = ref(new Set());
const deleting = ref(false);

const selectedEmail = ref(null);
const replySubject = ref('');
const replyBody = ref('');
const replySent = ref(false);
const replySending = ref(false);
const replyError = ref('');

const syncing = ref(false);
const syncMessage = ref(null);
const showSyncModal = ref(false);
const syncDays = ref(28);
const syncLimit = ref(100);
const deleteError = ref('');

const filteredEmails = computed(() => {
  const result = emails.value.filter(e => {
    if (filterCategory.value && e.category !== filterCategory.value) return false;
    if (filterPriority.value && e.priority !== filterPriority.value) return false;
    return true;
  });

  return result.sort((a, b) => {
    const dateA = new Date(a.received_at || a.created_at);
    const dateB = new Date(b.received_at || b.created_at);
    switch (sortBy.value) {
      case 'received_asc':  return dateA - dateB;
      case 'received_desc': return dateB - dateA;
      case 'priority_asc':  return (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4);
      case 'priority_desc': return (PRIORITY_ORDER[b.priority] ?? 4) - (PRIORITY_ORDER[a.priority] ?? 4);
      default: return dateB - dateA;
    }
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredEmails.value.length / pageSize.value)));

const paginatedEmails = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredEmails.value.slice(start, start + pageSize.value);
});

const pageAllSelected = computed(() =>
  paginatedEmails.value.length > 0 && paginatedEmails.value.every(e => selectedIds.value.has(e.id))
);

const somePageSelected = computed(() =>
  paginatedEmails.value.some(e => selectedIds.value.has(e.id))
);

const visiblePages = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (cur > 3) pages.push(null);
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
  if (cur < total - 2) pages.push(null);
  pages.push(total);
  return pages;
});

watch([filterCategory, filterPriority, sortBy, pageSize], () => {
  currentPage.value = 1;
  selectedIds.value = new Set();
});

watch(currentPage, () => {
  selectedIds.value = new Set();
});

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

function toggleSelect(id) {
  const next = new Set(selectedIds.value);
  next.has(id) ? next.delete(id) : next.add(id);
  selectedIds.value = next;
}

function togglePageAll() {
  const next = new Set(selectedIds.value);
  if (pageAllSelected.value) {
    paginatedEmails.value.forEach(e => next.delete(e.id));
  } else {
    paginatedEmails.value.forEach(e => next.add(e.id));
  }
  selectedIds.value = next;
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

async function deleteEmails(ids) {
  deleting.value = true;
  deleteError.value = '';
  try {
    let res;
    if (ids.length === 1) {
      res = await fetch(`http://localhost:3001/emails/${ids[0]}`, { method: 'DELETE' });
    } else {
      res = await fetch('http://localhost:3001/emails/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
    }
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Delete failed');
    }
    const idSet = new Set(ids);
    if (selectedEmail.value && idSet.has(selectedEmail.value.id)) closeEmail();
    emails.value = emails.value.filter(e => !idSet.has(e.id));
    selectedIds.value = new Set();
    if (currentPage.value > 1 && paginatedEmails.value.length === 0) currentPage.value--;
  } catch (err) {
    deleteError.value = err.message;
  } finally {
    deleting.value = false;
  }
}

function deleteSelected() { deleteEmails([...selectedIds.value]); }
function deleteSingle(id) { deleteEmails([id]); }

function openEmail(email) {
  selectedEmail.value = email;
  replySubject.value = `Re: ${email.subject}`;
  replyBody.value = '';
  replySent.value = false;
  replyError.value = '';
}

function closeEmail() { selectedEmail.value = null; }

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
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to send reply');
    replySent.value = true;
  } catch (err) {
    replyError.value = err.message;
  } finally {
    replySending.value = false;
  }
}

function startSync(focused) {
  showSyncModal.value = false;
  sync(focused);
}

async function sync(focused = false) {
  syncing.value = true;
  syncMessage.value = null;
  try {
    const res = await fetch('http://localhost:3001/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ focused, days: syncDays.value, limit: syncLimit.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sync failed');
    const label = focused ? 'focused ' : '';
    const hint = data.added === data.limit ? ' — sync again for more' : '';
    syncMessage.value = {
      type: 'success',
      text: data.added > 0
        ? `+${data.added} new ${label}email${data.added !== 1 ? 's' : ''}${hint}`
        : 'Already up to date',
    };
    if (data.added > 0) await fetchEmails();
  } catch (err) {
    syncMessage.value = { type: 'error', text: err.message };
  } finally {
    syncing.value = false;
    setTimeout(() => { syncMessage.value = null; }, 4000);
  }
}

async function fetchCategories() {
  try {
    const res = await fetch('http://localhost:3001/categories');
    if (res.ok) {
      const data = await res.json();
      categoryNames.value = data.map(c => c.name);
    }
  } catch (_) {}
}

function onKeydown(e) { if (e.key === 'Escape') closeEmail(); }
onMounted(() => { fetchEmails(); fetchCategories(); window.addEventListener('keydown', onKeydown); });
onUnmounted(() => { window.removeEventListener('keydown', onKeydown); });
</script>

<style scoped>
.filter-select {
  padding: 6px 28px 6px 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 8px center;
  appearance: none;
  font-size: 13px;
  font-family: 'Inter', system-ui, sans-serif;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s;
}
.filter-select:focus { outline: none; border-color: #3b82f6; }
html.dark .filter-select {
  background-color: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
}

.email-card {
  display: flex;
  align-items: stretch;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  margin-bottom: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.15s, transform 0.12s, border-color 0.15s, background-color 0.15s;
}
html.dark .email-card { background: #0f172a; border-color: #1e293b; }
.email-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-1px); border-color: #cbd5e1; }
html.dark .email-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.4); border-color: #334155; }
.email-card.is-selected { border-color: #93c5fd !important; background: #eff6ff !important; }
html.dark .email-card.is-selected { border-color: #1d4ed8 !important; background: rgba(30,64,175,0.15) !important; }

.checkbox-area {
  display: flex;
  align-items: center;
  padding: 0 10px;
  flex-shrink: 0;
}

.priority-stripe { width: 4px; flex-shrink: 0; }
.stripe-low      { background: #22c55e; }
.stripe-medium   { background: #eab308; }
.stripe-high     { background: #ef4444; }
.stripe-critical { background: linear-gradient(180deg, #a855f7, #ec4899); }

.badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.category-badge  { background: #e0f2fe; color: #0369a1; }
.priority-low    { background: #dcfce7; color: #15803d; }
.priority-medium { background: #fef9c3; color: #a16207; }
.priority-high   { background: #fee2e2; color: #b91c1c; }
.priority-critical { background: #1e0a2e; color: #e879f9; box-shadow: 0 0 5px rgba(232,121,249,0.35); }

.section-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 6px;
}

.reply-input {
  width: 100%; padding: 9px 12px; border-radius: 10px;
  border: 1px solid #e2e8f0; background: #f8fafc; color: #0f172a;
  font-size: 13px; font-family: 'Inter', system-ui, sans-serif;
  box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s;
}
html.dark .reply-input { border-color: #334155; background: #1e293b; color: #f1f5f9; }
.reply-input::placeholder { color: #94a3b8; }
.reply-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.modal-fade-enter-active { transition: opacity 0.2s ease; }
.modal-fade-leave-active { transition: opacity 0.15s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-card { transition: transform 0.2s ease, opacity 0.2s ease; }
.modal-fade-enter-from .modal-card { transform: translateY(12px) scale(0.97); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
