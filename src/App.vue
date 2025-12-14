<template>
  <div id="app" class="min-h-screen flex flex-col">
    <Teleport to="body">
    <Transition name="toast-fade">
      <div
        v-if="showNotice"
        class="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4"
      >
        <div
          class="bg-white/90 backdrop-blur-sm border border-orange-200 rounded-xl shadow-lg py-3 px-4 text-left text-lg text-slate-700 font-medium"
        >
          本项目为纯前端项目，默认 <strong class="text-red-500">模拟</strong> 初始数据，之后所有数据均在客户端localStorage中存储！！<strong class="text-red-500">仅自己可见</strong>
          <br><br>
          清除浏览器缓存会导致数据丢失，请及时备份
          <div class="flex justify-end">
            <button
              aria-label="关闭通知"
              class="mt-2 inline-block rounded-full bg-orange-500 hover:bg-orange-600 text-white text-lg px-3 py-1 transition"
              @click="dismissNotice"
            >
              已了解
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
<script setup lang="ts">
  import { ref } from 'vue'
const showNotice = ref(localStorage.getItem('dismissed-notice-v1') !== 'true')
const dismissNotice = () => {
  showNotice.value = false
  localStorage.setItem('dismissed-notice-v1', 'true')
}
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px); /* 从上滑入/滑出 */
}

</style>
