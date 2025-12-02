<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full"
  >
    <div
      class="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <h2 class="text-xl sm:text-2xl font-bold text-slate-800">过往记录</h2>
      <div class="flex space-x-2 w-full sm:w-auto">
        <button
          @click="exportMd"
          class="flex-1 sm:flex-none justify-center bg-slate-400 hover:bg-slate-700 text-white text-xs sm:text-sm px-3 py-2 rounded-lg transition flex items-center shadow-sm"
        >
          <span class="mr-1">⬇️</span> MD
        </button>
        <button
          @click="exportJson"
          class="flex-1 sm:flex-none justify-center bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm px-3 py-2 rounded-lg transition flex items-center border border-slate-300 shadow-sm"
        >
          <span class="mr-1">⬇️</span> JSON
        </button>
        <!-- 隐藏的文件输入框（用于触发文件选择） -->
        <input
          type="file"
          accept=".json"
          @change="handleFileSelect"
          ref="fileInput"
          class="hidden"
        />
        <button
          @click="triggerFileInput"
          class="flex-1 sm:flex-none justify-center bg-slate-200 hover:bg-slate-700 text-white text-xs sm:text-sm px-3 py-2 rounded-lg transition flex items-center shadow-sm"
        >
          <span class="mr-1">♦️</span> Import
        </button>
        <button
          v-if="records.length > 0"
          @click="confirmClearAll"
          class="flex-1 sm:flex-none justify-center bg-red-500 hover:bg-red-700 text-white text-xs sm:text-sm px-3 py-2 rounded-lg transition flex items-center shadow-sm"
        >
          <span class="mr-1">🗑️</span> Clear All
        </button>
      </div>
    </div>

    <div class="overflow-x-auto -mx-4 sm:mx-0 pb-4 sm:pb-0">
      <div class="inline-block min-w-full align-middle px-4 sm:px-0">
        <table class="min-w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th class="p-3 sm:p-4 border-b whitespace-nowrap">日期</th>
              <th class="p-3 sm:p-4 border-b whitespace-nowrap">时长</th>
              <th class="p-3 sm:p-4 border-b whitespace-nowrap">描述</th>
              <th class="p-3 sm:p-4 border-b whitespace-nowrap">特殊事件</th>
              <th class="p-3 sm:p-4 border-b whitespace-nowrap text-center">标签</th>
              <th class="p-3 sm:p-4 border-b text-right whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs sm:text-sm">
            <tr v-if="paginatedRecords.length === 0">
              <td colspan="6" class="p-8 text-center text-slate-400">暂无记录</td>
            </tr>
            <tr
              v-for="record in paginatedRecords"
              :key="record.id"
              class="hover:bg-slate-50 transition bg-white"
            >
              <td class="p-3 sm:p-4 font-medium text-slate-700 whitespace-nowrap">
                {{ record.date }}
              </td>
              <td class="p-3 sm:p-4 text-primary font-bold whitespace-nowrap">
                {{ record.hours }}h
              </td>
              <td
                class="p-3 sm:p-4 text-slate-600 min-w-[140px] max-w-[200px] truncate"
                :title="record.description"
              >
                {{ record.description }}
              </td>
              <td class="p-3 sm:p-4 text-slate-600 min-w-[120px] whitespace-nowrap">
                <span v-if="record.isSpecialEvent" class="text-secondary font-medium">{{
                  record.specialEventContent
                }}</span>
                <span v-else class="text-slate-300">-</span>
              </td>
              <td class="p-3 sm:p-4 text-center whitespace-nowrap">
                <div class="flex justify-center space-x-1">
                  <span
                    v-if="record.isHoliday"
                    class="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700"
                    >假</span
                  >
                  <span
                    v-if="record.isSpecialEvent"
                    class="px-2 py-0.5 rounded-full text-xs bg-pink-100 text-pink-700"
                    >特</span
                  >
                  <span
                    v-if="!record.isHoliday && !record.isSpecialEvent"
                    class="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500"
                    >常</span
                  >
                </div>
              </td>
              <td class="p-3 sm:p-4 text-right whitespace-nowrap">
                <button @click="deleteItem(record.id)" class="text-red-400 hover:text-red-600 p-1">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="px-4 sm:px-0 flex justify-end items-center mt-4">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-sm rounded-l-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
      >
        上一页
      </button>
      <span class="px-3 py-2 bg-slate-100 text-sm">{{ currentPage }} / {{ totalPages }}</span>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-sm rounded-r-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFocusStore } from '@/stores/useFocusStore'
import { storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
const store = useFocusStore()

const { records } = storeToRefs(store)

const exportMd = () => store.exportToMarkdown()
const exportJson = () => store.exportToJson()
const deleteItem = (id: number) => store.deleteRecord(id)
const importJson = (file: File) => store.importFromJson(file)
const clearAll = () => store.clearAll()
const confirmClearAll = () => {
  if (window.confirm('⚠️ 确定要清空所有记录吗？此操作不可恢复！')) {
    clearAll()
  }
}
const fileInput = ref<HTMLInputElement | null>(null)
const triggerFileInput = () => {
  fileInput.value?.click()
}
const handleFileSelect = (event: any) => {
  const file = event.target.files[0]
  if (file) importJson(file)
}

// 分页相关
const pageSize = 13 // 每页显示的记录数
let currentPage = ref(1)
console.log(records.value)

let totalPages = computed(() => Math.ceil(records.value.length / pageSize))
let paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return records.value.slice(start, end)
})

// 分页方法
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

watch(records, () => {
  // 当记录发生变化时，重置到第一页
  currentPage.value = 1
})
</script>

<style scoped></style>
