<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6">
      <h2 class="text-xl sm:text-2xl font-bold mb-4 text-slate-800">专注趋势（最近2周）</h2>
      <div class="relative h-60 sm:h-80 w-full">
        <canvas id="focusChart"></canvas>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <div
        class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-row sm:flex-col justify-between items-center sm:items-start"
      >
        <div class="text-indigo-500 text-sm font-medium">月专注时长</div>
        <div class="text-2xl sm:text-3xl font-bold text-indigo-700">
          {{ totalHours }} <span class="text-sm font-normal">h</span>
        </div>
      </div>
      <div
        class="bg-pink-50 p-4 rounded-xl border border-pink-100 flex flex-row sm:flex-col justify-between items-center sm:items-start"
      >
        <div class="text-pink-500 text-sm font-medium">总记录天数</div>
        <div class="text-2xl sm:text-3xl font-bold text-pink-700">
          {{ dayCount }} <span class="text-sm font-normal">天</span>
        </div>
      </div>
      <div
        class="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-row sm:flex-col justify-between items-center sm:items-start"
      >
        <div class="text-emerald-500 text-sm font-medium">本周平均每日(start at SunDay)</div>
        <div class="text-2xl sm:text-3xl font-bold text-emerald-700">
          {{ avgHours }} <span class="text-sm font-normal">h</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFocusStore } from '@/stores/useFocusStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const store = useFocusStore()
const { records } = storeToRefs(store)

let chartInstance: any = null


// 1. 当月专注时长（从当月1号到最新一天）
const totalHours = computed(() => {
  if (!records.value.length) return '0.0'
  
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const firstDayISO = firstDayOfMonth.toISOString().split('T')[0]
  
  return records.value
    .filter((r: any) => r.date >= firstDayISO!)
    .reduce((sum: number, r: any) => sum + Number(r.hours), 0)
    .toFixed(1)
})

// 2. 本周平均专注时间（从周一到当前日期）
const avgHours = computed(() => {
  if (!records.value.length) return '0.0'
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisMonday = new Date(today)
  thisMonday.setDate(today.getDate() - today.getDay() + 1) // 计算本周一
  const mondayISO = thisMonday.toISOString().split('T')[0]
  
  const weeklyRecords = records.value.filter((r: any) => r.date >= mondayISO!)
  const weeklyHours = weeklyRecords.reduce((sum: number, r: any) => sum + Number(r.hours), 0)
  const dayCount = new Set(weeklyRecords.map((r: any) => r.date)).size || 1 // 避免除以0
  console.log(weeklyRecords, weeklyHours, dayCount);
  
  return (weeklyHours / dayCount).toFixed(1)
})

// 原有统计（不变）
const dayCount = computed(() => new Set(records.value.map((r: any) => r.date)).size)


// === 按最近 2 周聚合（周一为每周开始）===
const getWeeksData = () => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekCount = 2 // 👈 只看最近 2 周

  // 找到本周一
  const thisSunday = new Date(today)
  console.log(now);
  console.log(today);
  
  console.log(today.getDate());
  console.log(today.getDay());
  
  
  thisSunday.setDate(today.getDate() - today.getDay() + 0) // 周日=0 → 周日 = -day+0
  console.log(thisSunday);


  // 构建所有日期（2周 × 7天 = 14天）
  const allDates: string[] = []
  for (let w = weekCount - 1; w >= 0; w--) {
    const weekStart = new Date(thisSunday)
    weekStart.setDate(thisSunday.getDate() - w * 7)
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart)
      date.setDate(Number(weekStart.getDate() + d))
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const isoDate:string = `${year}-${month}-${day}`;
      allDates.push(isoDate)
      if(date.getTime() === today.getTime()) break
    }
  }
  console.log(allDates);
  

  // 构建日期 → 时长映射
  const dateMap = new Map<string, number>()
  records.value.forEach((r: any) => {
    dateMap.set(r.date, Number(r.hours))
  })

  // 生成 labels 和 data
  const weekdays = ['周日','周一', '周二', '周三', '周四', '周五', '周六' ]
  const labels: string[] = []
  const data: number[] = []

  for (let i = 0; i < allDates.length; i++) {
    const dateStr = allDates[i]
    data.push(dateMap.get(dateStr!) || 0)

    const weekIndex = Math.floor(i / 7) + 1 // 第1周、第2周
    const dayIndex = i % 7
    labels.push(`${weekIndex}-${weekdays[dayIndex]}`)
  }

  return { labels, data }
}

const renderChart = () => {
  const ctx = document.getElementById('focusChart')
  if (!ctx) return
  if (chartInstance) chartInstance.destroy()
  const { labels, data } = getWeeksData()
  chartInstance = new Chart(ctx as HTMLCanvasElement, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '专注时长 (h)',
          data,
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 28, // 稍宽一点，更易点击/查看
          maxBarThickness: 28
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#f1f5f9' },
          ticks: { stepSize: 1 },
        },
        x: {
          grid: { display: false },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
            font: { size: 11 },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `专注 ${context.parsed.y} 小时`,
          },
        },
      },
    },
  })
}

onMounted(() => renderChart())
watch(records, () => renderChart(), { deep: true })
</script>

<style scoped></style>
