<template>
  <div class="min-h-[calc(100vh-64px)] px-4 py-12">
    <div class="max-w-2xl mx-auto">

      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold tracking-tight mb-3">
          <span class="text-slate-900 dark:text-slate-100">Email </span>
          <span class="bg-gradient-to-r from-blue-700 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">Settings</span>
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-base">Customize your email categories</p>
      </div>

      <!-- Categories List -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Categories</h2>
          <button
            @click="showAddForm = true"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
          >
            <span>+</span>
            Add Category
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="category in categories"
            :key="category.id"
            class="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          >
            <div class="flex-1">
              <h3 class="font-medium text-slate-900 dark:text-slate-100">{{ category.name }}</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">{{ category.description }}</p>
            </div>
            <div class="flex items-center gap-2 ml-4">
              <button
                @click="editCategory(category)"
                class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Edit"
              >
                ✏️
              </button>
              <button
                @click="deleteCategory(category)"
                class="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Form Modal -->
      <Transition name="fade">
        <div v-if="showAddForm || editingCategory" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {{ editingCategory ? 'Edit Category' : 'Add Category' }}
            </h3>

            <form @submit.prevent="saveCategory" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Server Issues"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea
                  v-model="form.description"
                  required
                  rows="3"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe what emails should be classified into this category"
                ></textarea>
              </div>

              <div class="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="loading"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
                >
                  {{ loading ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>

      <!-- Success/Error Messages -->
      <Transition name="slide-up">
        <div v-if="message" class="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-4" :class="message.type === 'error' ? 'border-red-200 dark:border-red-900/60' : 'border-green-200 dark:border-green-900/60'">
          <p :class="message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
            {{ message.text }}
          </p>
        </div>
      </Transition>

      <!-- Tools -->
      <div class="grid grid-cols-2 gap-4 mt-2">
        <router-link to="/" class="group flex flex-col gap-1.5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
          <span class="text-xl select-none">🧪</span>
          <p class="font-semibold text-slate-900 dark:text-slate-100 text-sm">Try It</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Paste an email and see how the AI classifies it with your current categories.</p>
        </router-link>

        <router-link to="/reset" class="group flex flex-col gap-1.5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-red-300 dark:hover:border-red-800 hover:shadow-md transition-all">
          <span class="text-xl select-none">⚠️</span>
          <p class="font-semibold text-slate-900 dark:text-slate-100 text-sm">Reset</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Reset your email database or restore default categories.</p>
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const categories = ref([]);
const showAddForm = ref(false);
const editingCategory = ref(null);
const form = ref({ name: '', description: '' });
const loading = ref(false);
const message = ref(null);

async function loadCategories() {
  try {
    const res = await fetch('http://localhost:3001/categories');
    if (res.ok) {
      categories.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

function editCategory(category) {
  editingCategory.value = category;
  form.value = { name: category.name, description: category.description };
}

function cancelEdit() {
  showAddForm.value = false;
  editingCategory.value = null;
  form.value = { name: '', description: '' };
}

async function saveCategory() {
  loading.value = true;
  message.value = null;

  try {
    const url = editingCategory.value
      ? `http://localhost:3001/categories/${editingCategory.value.id}`
      : 'http://localhost:3001/categories';
    
    const method = editingCategory.value ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    });

    const data = await res.json();

    if (res.ok) {
      const verb = editingCategory.value ? 'updated' : 'added';
      await loadCategories();
      cancelEdit();
      message.value = { type: 'success', text: `Category ${verb} successfully!` };
      setTimeout(() => message.value = null, 3000);
    } else {
      message.value = { type: 'error', text: data.error || 'Failed to save category' };
    }
  } catch (err) {
    message.value = { type: 'error', text: 'Network error occurred' };
  } finally {
    loading.value = false;
  }
}

async function deleteCategory(category) {
  if (!confirm(`Are you sure you want to delete the "${category.name}" category?`)) return;

  try {
    const res = await fetch(`http://localhost:3001/categories/${category.id}`, {
      method: 'DELETE',
    });

    const data = await res.json();

    if (res.ok) {
      await loadCategories();
      message.value = { type: 'success', text: 'Category deleted successfully!' };
      setTimeout(() => message.value = null, 3000);
    } else {
      message.value = { type: 'error', text: data.error || 'Failed to delete category' };
    }
  } catch (err) {
    message.value = { type: 'error', text: 'Network error occurred' };
  }
}

onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>