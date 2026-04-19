<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-gray-900 text-white shadow-lg">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <router-link to="/" class="text-xl font-bold tracking-tight hover:text-orange-400 transition">
          ⚡ s3rv3rl3ss
        </router-link>
        <span class="text-sm text-gray-400">AWS Serverless Services</span>
      </div>
    </header>
    <main class="max-w-6xl mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>
