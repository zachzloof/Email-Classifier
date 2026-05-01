<template>
  <div class="container">
    <h1>Inbox 📥</h1>
    <p class="subtitle">AI-classified stored emails</p>

    <div v-if="loading">Loading emails...</div>

    <div v-if="emails.length === 0 && !loading">
      No emails found.
    </div>

    <div v-for="email in emails" :key="email.id" class="card">
      <h3>{{ email.subject }}</h3>

      <div class="meta">
        <span class="badge category">{{ email.category }}</span>
        <span class="badge priority">{{ email.priority }}</span>
      </div>

      <p class="summary">{{ email.summary }}</p>

      <p class="action">
        👉 {{ email.suggested_action }}
      </p>

      <small class="date">{{ email.created_at }}</small>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const emails = ref([]);
const loading = ref(false);

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

onMounted(fetchEmails);
</script>

<style scoped>
.container {
  max-width: 700px;
  margin: 40px auto;
  font-family: system-ui;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

.card {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 15px;
  background: #fff;
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

.priority {
  background: #fee2e2;
  color: #b91c1c;
}

.summary {
  margin: 10px 0;
}

.action {
  font-style: italic;
  color: #333;
}

.date {
  color: #999;
  font-size: 12px;
}
</style>