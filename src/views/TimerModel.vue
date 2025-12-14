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
      <span @click="setPreset(25)">25min</span>
      <span @click="setPreset(120)">2h</span>
      <span @click="setPreset(240)">4h</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted} from 'vue'
const DEFAULT_TARGET_SECONDS = 45 * 60
// 状态
const mode = ref('timer') // 'timer' (倒计时) | 'stopwatch' (秒表)
const targetTotalSeconds = ref(DEFAULT_TARGET_SECONDS) // 默认 45 分钟
const elapsedSeconds = ref(0)
const isRunning = ref(false)
const startTime = ref(null)
let rafId = null // requestAnimationFrame ID
let lastSecond = -1



const totalSeconds = computed(() => {
  if (mode.value === 'timer') {
    return Math.max(0, targetTotalSeconds.value - elapsedSeconds.value)
  }
  return elapsedSeconds.value
})

// 格式化时间显示 (MM:SS)
const formattedTime = computed(() => {
  const total = totalSeconds.value
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})
// 切换模式
const switchMode = (newMode) => {
  pause()
  mode.value = newMode
  if (newMode === 'timer') {
    targetTotalSeconds.value = 25 * 60
    elapsedSeconds.value = 0
  } else {
    elapsedSeconds.value = 0
  }
}

const setPreset = (minutes) => {
  pause()
  targetTotalSeconds.value = minutes * 60
  elapsedSeconds.value = 0
}
const updateTimer = () => {
  if(!isRunning.value || !startTime.value) return
  const now = Date.now()
  const delta = Math.floor((now - startTime.value) / 1000) // 转换为秒
  if(delta !== lastSecond) {
    lastSecond = delta
    elapsedSeconds.value = delta
  }
  if(mode.value === 'timer' && delta >= targetTotalSeconds.value) {
    pause()
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('专注时间到！', {
        body: '休息一下吧~',
        icon: '/notification.jpg'
      })
    }else{
      alert('时间到！') // 这里可以换成播放声音
    }
    return
  }
  //继续下一帧
  rafId = requestAnimationFrame(updateTimer)
}

const start = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
  isRunning.value = true
  startTime.value = Date.now() - elapsedSeconds.value * 1000
  rafId = requestAnimationFrame(updateTimer)
}

const pause = () => {
  isRunning.value = false
  if(rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}
const toggleTimer = () => {
  if(isRunning.value) {
    pause()
  } else {
    start()
  }
}

const resetTimer = () => {
  pause()
  elapsedSeconds.value = 0
  if(mode.value === 'timer'){
    targetTotalSeconds.value = 45 * 60
  }
}
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