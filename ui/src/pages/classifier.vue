<template>
  <div class="container">
    <h1>Email Classifier 📬</h1>
    <p class="subtitle">Paste an email and let AI sort it instantly</p>

    <textarea v-model="email" placeholder="Paste an email here..." rows="6" class="input" />

    <button @click="classify" :disabled="loading" class="button">
      {{ loading ? "Classifying..." : "Classify Email" }}
    </button>

    <!-- RESULT -->
    <div v-if="result" class="card success">
      <h2>Result</h2>
      <p><strong>Category:</strong> {{ result.category }}</p>
      <p><strong>Priority:</strong> {{ result.priority }}</p>
      <p><strong>summary:</strong> {{ result.summary }}</p>
      <p><strong>Suggested Action:</strong> {{ result.suggested_action }}</p>
    </div>

    <!-- ERROR -->
    <div v-if="error" class="card error">
      <h2>⚠️ Error Parsing AI Response</h2>
      <p><strong>Message:</strong> {{ error.message }}</p>

      <h3>Details:</h3>
      <pre class="raw">{{ error.details }}</pre>

      <h3>Raw Model Output:</h3>
      <pre class="raw">{{ error.raw }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");
const result = ref(null);
const error = ref(null);
const loading = ref(false);

async function classify() {
  loading.value = true;
  result.value = null;
  error.value = null;

  try {
    const res = await fetch("http://localhost:3001/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.value }),
    });

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.error || "Request failed");
      err.json = data;
      throw err;
    }

    result.value = data;

  } catch (err) {
    console.log(err)
    error.value = {
      message: err.message,
      raw: err.json.raw,
      details: err.json.details
    };
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.container {
  max-width: 700px;
  margin: 50px auto;
  font-family: system-ui, sans-serif;
  padding: 20px;
}

h1 {
  margin-bottom: 5px;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

.input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 14px;
  margin-bottom: 10px;
}

.button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.card {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
}

.success {
  background: #ecfdf5;
  border: 1px solid #10b981;
}

.error {
  background: #fef2f2;
  border: 1px solid #ef4444;
}

.raw {
  background: #111;
  color: #0f0;
  padding: 10px;
  border-radius: 8px;
  overflow-x: auto;
  margin-top: 10px;
}
</style>