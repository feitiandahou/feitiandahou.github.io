<template>
  <div id="app" class="min-h-screen flex flex-col">
    <!-- 顶部导航 (移动端优化) -->
    <nav class="bg-white shadow-sm sticky top-0 z-50 safe-area-inset-top">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-14 sm:h-16">
          <!-- Logo -->
          <div class="flex items-center flex-shrink-0">
            <span
              class="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary truncate"
            >
              ⏱️ FocusTracker
            </span>
          </div>
          <!-- 导航链接 -->
          <div class="flex space-x-1 sm:space-x-4">
            <router-link
              to="/"
              class="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              active-class="text-primary bg-indigo-50"
              >记录</router-link
            >
            <router-link
              to="/analysis"
              class="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              active-class="text-primary bg-indigo-50"
              >分析</router-link
            >
            <router-link
              to="/history"
              class="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              active-class="text-primary bg-indigo-50"
              >历史</router-link
            >
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="flex-grow max-w-4xl w-full mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部 -->
    <footer class="bg-white border-t border-slate-200 mt-auto safe-area-inset-bottom">
      <div
        class="max-w-4xl mx-auto py-4 sm:py-6 px-4 text-center text-slate-400 text-xs sm:text-sm"
      >
        <p>&copy; 2023 专注时间记录系统. Built with Vue 3 & Tailwind.</p>
      </div>
    </footer>
  </div>
</template>
<script setup lang="ts"></script>

<style scoped></style>
