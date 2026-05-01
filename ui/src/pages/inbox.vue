<template>
  <div class="container">
    <h1>Inbox 📥</h1>
    <p class="subtitle">AI-classified stored emails</p>

    <div v-if="loading">Loading emails...</div>

    <div v-if="emails.length === 0 && !loading">
      No emails found.
    </div>

    <div
      v-for="email in emails"
      :key="email.id"
      class="card"
      @click="openEmail(email)"
    >
      <h3>{{ email.subject }}</h3>
      <div class="meta">
        <span class="badge category">{{ email.category }}</span>
        <span class="badge" :class="priorityClass(email.priority)">{{ email.priority }}</span>
      </div>
      <p class="summary">{{ email.summary }}</p>
      <p class="action">👉 {{ email.suggested_action }}</p>
      <small class="date">{{ email.created_at }}</small>
    </div>
  </div>

  <!-- Modal -->
  <Teleport to="body">
    <div v-if="selectedEmail" class="overlay" @click.self="closeEmail">
      <div class="modal">
        <button class="close-btn" @click="closeEmail">✕</button>

        <h2>{{ selectedEmail.subject }}</h2>
        <div class="meta">
          <span class="badge category">{{ selectedEmail.category }}</span>
          <span class="badge" :class="priorityClass(selectedEmail.priority)">{{ selectedEmail.priority }}</span>
        </div>
        <small class="date">{{ selectedEmail.created_at }}</small>

        <hr class="divider" />

        <div class="detail-section">
          <p class="detail-label">Summary</p>
          <p class="detail-value">{{ selectedEmail.summary }}</p>
        </div>

        <div class="detail-section">
          <p class="detail-label">Suggested Action</p>
          <p class="detail-value action-value">👉 {{ selectedEmail.suggested_action }}</p>
        </div>

        <div class="detail-section">
          <p class="detail-label">Original Email</p>
          <pre class="email-body">{{ selectedEmail.body }}</pre>
        </div>

        <hr class="divider" />

        <h3 class="reply-heading">Reply</h3>

        <div v-if="replySent" class="sent-banner">
          ✓ Reply sent
        </div>

        <div v-else class="reply-form">
          <label class="field-label">Subject</label>
          <input v-model="replySubject" class="input" type="text" />

          <label class="field-label">Body</label>
          <textarea v-model="replyBody" class="input" rows="6" placeholder="Write your reply..." />

          <button @click="sendReply" :disabled="!replyBody.trim()" class="send-btn">
            Send Reply
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const emails = ref([]);
const loading = ref(false);
const selectedEmail = ref(null);
const replySubject = ref("");
const replyBody = ref("");
const replySent = ref(false);

async function fetchEmails() {
  loading.value = true;
  try {
    const res = await fetch("http://localhost:3001/emails");
    emails.value = await res.json();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function priorityClass(priority) {
  return {
    'priority-low': priority === 'Low',
    'priority-medium': priority === 'Medium',
    'priority-high': priority === 'High',
    'priority-critical': priority === 'Critical',
  };
}

function openEmail(email) {
  selectedEmail.value = email;
  replySubject.value = `Re: ${email.subject}`;
  replyBody.value = "";
  replySent.value = false;
}

function closeEmail() {
  selectedEmail.value = null;
}

function sendReply() {
  replySent.value = true;
}

function onKeydown(e) {
  if (e.key === "Escape") closeEmail();
}

onMounted(() => {
  fetchEmails();
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
.container {
  max-width: 700px;
  margin: 40px auto;
  font-family: system-ui;
  padding: 20px;
}

.subtitle {
  color: var(--color-text-muted);
  margin-bottom: 20px;
}

.card {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 15px;
  background: var(--color-bg-card);
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, transform 0.1s, box-shadow 0.1s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.meta {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: bold;
}

.category {
  background: #e0f2fe;
  color: #0369a1;
}

.priority-low {
  background: #dcfce7;
  color: #15803d;
}

.priority-medium {
  background: #fef9c3;
  color: #a16207;
}

.priority-high {
  background: #fee2e2;
  color: #b91c1c;
}

.priority-critical {
  background: #1e0a2e;
  color: #e879f9;
  box-shadow: 0 0 6px rgba(232, 121, 249, 0.4);
}

.summary {
  margin: 10px 0;
}

.action {
  font-style: italic;
  color: var(--color-text-action);
}

.date {
  color: var(--color-text-muted);
  font-size: 12px;
}

/* Modal */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
}

.modal {
  background: var(--color-bg-card);
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  color: var(--color-text);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--color-text-muted);
  line-height: 1;
  padding: 4px 6px;
  border-radius: 6px;
}

.close-btn:hover {
  color: var(--color-text);
}

.divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 20px 0;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin: 0 0 4px;
}

.detail-value {
  margin: 0;
  line-height: 1.6;
}

.action-value {
  font-style: italic;
}

.email-body {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: system-ui;
  font-size: 14px;
  line-height: 1.65;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px 14px;
  color: var(--color-text);
}

.reply-heading {
  margin-bottom: 14px;
}

.reply-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border-input);
  font-size: 14px;
  background-color: var(--color-input-bg);
  color: var(--color-input-text);
  font-family: system-ui;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
}

.send-btn {
  align-self: flex-end;
  padding: 9px 20px;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
}

.send-btn:hover:not(:disabled) {
  background: #2563eb;
}

.send-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.sent-banner {
  background: var(--color-bg-success);
  border: 1px solid #10b981;
  color: #10b981;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 600;
}
</style>
