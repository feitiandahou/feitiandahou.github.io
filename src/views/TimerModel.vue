<template>
  <div class="timer-card">
    <div class="mode-switch">
      <button 
        :class="{ active: mode === 'timer' }" 
        @click="switchMode('timer')"
      >
        倒计时
      </button>
      <button 
        :class="{ active: mode === 'stopwatch' }" 
        @click="switchMode('stopwatch')"
      >
        秒表
      </button>
    </div>

    <div class="time-display" :class="{ 'text-red': mode === 'timer' && totalSeconds < 60 }">
      {{ formattedTime }}
    </div>

    <div class="controls">
      <button class="btn btn-primary" @click="toggleTimer">
        {{ isRunning ? '暂停' : '开始' }}
      </button>
      <button class="btn btn-secondary" @click="resetTimer">
        重置
      </button>
    </div>

    <div v-if="mode === 'timer'" class="presets">
      <span @click="setCustomTime(60)">1h</span>
      <span @click="setCustomTime(120)">2h</span>
      <span @click="setCustomTime(240)">4h</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

// 状态
const mode = ref('timer') // 'timer' (倒计时) | 'stopwatch' (秒表)
const totalSeconds = ref(120 * 60) // 默认 25 分钟
const isRunning = ref(false)
let intervalId = null

// 格式化时间显示 (MM:SS)
const formattedTime = computed(() => {
  const m = Math.floor(totalSeconds.value / 60)
  const s = totalSeconds.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

// 切换模式
const switchMode = (newMode) => {
  pause()
  mode.value = newMode
  if (newMode === 'timer') {
    totalSeconds.value = 25 * 60
  } else {
    totalSeconds.value = 0
  }
}

// 设置自定义时间
const setCustomTime = (minutes) => {
  pause()
  totalSeconds.value = minutes * 60
}

// 开始/暂停逻辑
const toggleTimer = () => {
  if (isRunning.value) {
    pause()
  } else {
    start()
  }
}

const start = () => {
  isRunning.value = true
  intervalId = setInterval(() => {
    if (mode.value === 'timer') {
      if (totalSeconds.value > 0) {
        totalSeconds.value--
      } else {
        // 倒计时结束
        pause()
        alert('时间到！') // 这里可以换成播放声音
      }
    } else {
      // 秒表模式
      totalSeconds.value++
    }
  }, 1000)
}

const pause = () => {
  isRunning.value = false
  if (intervalId) clearInterval(intervalId)
}

const resetTimer = () => {
  pause()
  if (mode.value === 'timer') {
    totalSeconds.value = 25 * 60
  } else {
    totalSeconds.value = 0
  }
}

// 组件销毁时清除定时器，防止内存泄漏
onUnmounted(() => {
  pause()
})
</script>

<style scoped>
.timer-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.mode-switch {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.mode-switch button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  font-size: 14px;
  color: #888;
  border-bottom: 2px solid transparent;
}

.mode-switch button.active {
  color: #333;
  font-weight: bold;
  border-bottom: 2px solid #42b983; /* Vue 绿 */
}

.time-display {
  font-size: 48px;
  font-weight: bold;
  font-family: monospace; /* 等宽字体防止数字跳动 */
  color: #2c3e50;
  margin: 10px 0;
}

.text-red {
  color: #e74c3c; /* 剩余时间少时变红 */
}

.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.btn {
  padding: 8px 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: opacity 0.2s;
}

.btn:active {
  opacity: 0.8;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.presets {
  font-size: 12px;
  color: #666;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.presets span {
  cursor: pointer;
  text-decoration: underline;
}

.presets span:hover {
  color: #42b983;
}
</style>