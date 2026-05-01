<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
    <div class="w-full max-w-sm">

      <!-- Brand -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg text-white text-2xl mx-auto mb-4 select-none">
          ✉
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">MailAI</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">AI-powered email classification</p>
      </div>

      <!-- Card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <p class="text-sm text-slate-600 dark:text-slate-400 text-center mb-5 leading-relaxed">
          Sign in with your Microsoft account to sync and classify your emails.
        </p>

        <a
          href="http://localhost:3001/auth/login"
          class="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          Sign in with Microsoft
        </a>
      </div>

    </div>
  </div>
</template>
