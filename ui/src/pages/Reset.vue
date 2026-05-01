<template>
  <div class="container">
    <h1>Reset Database ⚠️</h1>

    <p class="warning">
      This will delete all stored classified emails.
    </p>

    <button @click="resetDB" :disabled="loading" class="button danger">
      {{ loading ? "Resetting..." : "Reset Database" }}
    </button>

    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";

const loading = ref(false);
const message = ref("");
const error = ref("");

async function resetDB() {
  loading.value = true;
  message.value = "";
  error.value = "";

  try {
    const res = await fetch("http://localhost:3001/reset", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    message.value = "Database successfully reset.";
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 50px auto;
  font-family: system-ui;
}

.warning {
  color: #b91c1c;
  margin-bottom: 20px;
}

.button {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.danger {
  background: #ef4444;
  color: white;
}

.success {
  color: green;
  margin-top: 10px;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>