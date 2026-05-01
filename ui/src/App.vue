<template>
  <div>
    <nav class="nav">
      <router-link to="/">Classifier</router-link>
      <router-link to="/inbox">Inbox</router-link>
      <router-link to="/reset">Reset</router-link>
    </nav>

    <router-view />
  </div>
</template>

<style>
.nav {
  display: flex;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.nav a {
  text-decoration: none;
  font-weight: bold;
  color: #3b82f6;
}
</style>