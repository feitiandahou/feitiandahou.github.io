<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-slate-800 flex items-center">
      <span class="mr-2">📝</span> 今日记录
    </h2>

    <form @submit.prevent="submitForm" class="space-y-4 sm:space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <!-- 日期 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">日期</label>
          <input
            v-model="form.date"
            type="date"
            required
            class="w-full rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 p-2.5 border text-sm sm:text-base"
          />
        </div>

        <!-- 时长 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">专注时长 (h)</label>
          <input
            v-model.number="form.hours"
            type="number"
            step="0.5"
            min="0.1"
            max="24"
            required
            class="w-full rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 p-2.5 border text-sm sm:text-base"
          />
        </div>
      </div>

      <!-- 状态开关 -->
      <div class="flex flex-col sm:flex-row gap-4 sm:gap-8 bg-slate-50 p-3 sm:p-4 rounded-lg">
        <label class="inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="form.isHoliday"
            class="rounded border-slate-300 text-primary shadow-sm focus:ring-primary/20 h-5 w-5"
          />
          <span class="ml-2 text-sm sm:text-base text-slate-700">🏝️ 是假期/周末</span>
        </label>
        <label class="inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="form.isSpecialEvent"
            class="rounded border-slate-300 text-secondary shadow-sm focus:ring-secondary/20 h-5 w-5"
          />
          <span class="ml-2 text-sm sm:text-base text-slate-700">🔥 特殊事件 (出去玩等)</span>
        </label>
      </div>

      <!-- 特殊事件内容 (条件渲染) -->
      <transition name="slide">
        <div v-if="form.isSpecialEvent">
          <label class="block text-sm font-medium text-secondary mb-1"
            >特殊事件内容 <span class="text-xs text-slate-400 font-normal">(必填)</span></label
          >
          <input
            v-model="form.specialEventContent"
            type="text"
            required
            placeholder="填写特殊事件..."
            class="w-full rounded-lg border-pink-200 bg-pink-50/30 shadow-sm focus:border-secondary focus:ring focus:ring-secondary/20 p-2.5 border text-sm sm:text-base placeholder:text-slate-400"
          />
        </div>
      </transition>

      <!-- 描述 -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">内容描述 / 成果</label>
        <textarea
          v-model="form.description"
          rows="3"
          required
          placeholder="简述今天做了什么..."
          class="w-full rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 p-2.5 border text-sm sm:text-base"
        ></textarea>
      </div>

      <div class="pt-2">
        <button
          type="submit"
          class="w-full bg-primary hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex justify-center items-center touch-manipulation"
        >
          <span class="mr-2">💾</span> 保存记录
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useFocusStore } from '@/stores/useFocusStore'

const store = useFocusStore()
const form = reactive({
  date: new Date().toISOString().split('T')[0],
  hours: 4,
  description: '',
  isHoliday: false,
  isSpecialEvent: false,
  specialEventContent: '',
})

// 监听特殊事件开关，关闭时清空内容
watch(
  () => form.isSpecialEvent,
  (val) => {
    if (!val) form.specialEventContent = ''
  },
)

const submitForm = () => {
  store.addRecord({ ...form })
  form.hours = 4
  form.description = ''
  form.isSpecialEvent = false
  form.specialEventContent = ''
  alert('记录已保存！')
}
</script>
