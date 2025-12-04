<template>
  <div class="relative group mt-8 mx-auto w-full">
    
    <div
      class="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-2xl opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200 animate-tilt"
    ></div>

    <div class="relative bg-white rounded-xl shadow-xl p-4 sm:p-6 border border-slate-100">
      
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 flex items-center">
          <span class="mr-2 text-2xl">⚡</span> 极速待办
        </h2>
        <span class="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
          {{ pendingCount }} 待完成
        </span>
      </div>

      <form @submit.prevent="addTodo" class="relative mb-8 group/input">
        <div class="relative flex items-center">
          <input
            v-model="newTodo"
            type="text"
            placeholder="输入下一步计划..."
            class="w-full pl-4 pr-14 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 ease-out placeholder:text-slate-400 text-slate-700 shadow-inner"
          />
          <button
            type="submit"
            :disabled="!newTodo.trim()"
            class="absolute right-2 p-2 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg text-white shadow-lg transform active:scale-90 transition-all duration-200 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </form>

      <div class="space-y-2">
        <transition-group name="list" tag="ul">
          <li
            v-for="todo in sortedTodos"
            :key="todo.id"
            class="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:shadow-md hover:border-purple-100 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
            :class="{ 'opacity-60 bg-slate-50/50': todo.completed }"
            @click="toggleTodo(todo)"
          >
            <div class="flex items-center gap-3 overflow-hidden">
              <div 
                class="relative flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300"
                :class="todo.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 group-hover:border-purple-400'"
              >
                <svg v-if="todo.completed" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <span 
                class="text-slate-700 transition-all duration-300 truncate select-none"
                :class="{ 'line-through text-slate-400': todo.completed }"
              >
                {{ todo.text }}
              </span>
            </div>

            <button
              @click.stop="removeTodo(todo.id)"
              class="text-slate-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </li>
        </transition-group>
        
        <div v-if="todos.length === 0" class="text-center py-8 text-slate-400">
          <p class="text-sm">✨ 暂无待办，享受当下吧！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const STORAGE_KEY = 'my-cool-todolist-v1'

const newTodo = ref('')
const todos = ref([])

// 计算未完成数量
const pendingCount = computed(() => todos.value.filter(t => !t.completed).length)

// 排序：未完成的在上面，已完成的沉底
const sortedTodos = computed(() => {
  return [...todos.value].sort((a, b) => {
    if (a.completed === b.completed) return b.createdAt - a.createdAt
    return a.completed ? 1 : -1
  })
})

// 初始化加载
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      todos.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load todos', e)
    }
  }
})

// 监听变化自动保存
watch(todos, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
}, { deep: true })

const addTodo = () => {
  const text = newTodo.value.trim()
  if (!text) return

  todos.value.unshift({
    id: Date.now(),
    text,
    completed: false,
    createdAt: Date.now()
  })
  newTodo.value = ''
}

const toggleTodo = (todo) => {
  todo.completed = !todo.completed
}

const removeTodo = (id) => {
  todos.value = todos.value.filter(t => t.id !== id)
}
</script>

<style scoped>
/* 流光动画的核心 Keyframes 
  bg-size 调大后移动 background-position 实现流光
*/
.animate-tilt {
  animation: tilt 10s infinite linear;
}

@keyframes tilt {
  0%, 50%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(0.5deg);
  }
  75% {
    transform: rotate(-0.5deg);
  }
}

/* 列表动画 Transition Group */
.list-enter-active,
.list-leave-active,
.list-move {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 元素进入前状态 */
.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

/* 元素离开后状态 */
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 确保移除元素时，周围元素平滑移动 */
.list-leave-active {
  position: absolute; 
  width: 100%;
}
</style>