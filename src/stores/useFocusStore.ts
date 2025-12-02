import { defineStore } from 'pinia'
// 在 store 中导出类型
export type FocusRecord = {
  id: number
  date: string
  hours: number
  description: string
  isHoliday: boolean
  isSpecialEvent: boolean
  specialEventContent: string
}
export const useFocusStore = defineStore('focus', {
  state: () => ({
    records: (() => {
      try {
        return localStorage.getItem('focus_records')
          ? JSON.parse(localStorage.getItem('focus_records')!)
          : generateMockData()
      } catch (e) {
        console.warn('Failed to load records from localStorage', e)
        return generateMockData()
      }
    })(),
  }),
  actions: {
    addRecord(record: FocusRecord) {
      const newRecord = { ...record }
      // 如果不是特殊事件，强制清空内容
      if (!newRecord.isSpecialEvent) {
        newRecord.specialEventContent = ''
      }
      this.records.push({
        id: Date.now() + Math.random().toString(36).substr(2, 9), // 增强唯一性
        ...newRecord,
      })
      this.saveToLocal()
    },
    deleteRecord(id: number) {
      if (!confirm('确定要删除这条记录吗？')) return
      this.records = this.records.filter((r: any) => r.id !== id)
      this.saveToLocal()
    },
    saveToLocal() {
      localStorage.setItem('focus_records', JSON.stringify(this.records))
    },
    // 导出 Markdown (更新包含特殊事件内容)
    exportToMarkdown() {
      let content = `# 专注时间记录归档\n\n生成时间: ${new Date().toLocaleString()}\n\n`
      content += `| 日期 | 时长(h) | 假期 | 特殊事件 | 事件内容 | 描述 |\n`
      content += `|---|---|---|---|---|---|\n`

      this.sortedRecords.forEach((r) => {
        const eventContent = r.isSpecialEvent ? r.specialEventContent || '未填写' : '-'
        content += `| ${r.date} | ${r.hours} | ${r.isHoliday ? '是' : '否'} | ${r.isSpecialEvent ? '是' : '否'} | ${eventContent} | ${r.description} |\n`
      })

      content += `\n## 统计摘要\n`
      content += `- 总记录数: ${this.records.length} 条\n`

      this.downloadFile(content, 'focus_records.md', 'text/markdown')
    },
    exportToJson() {
      const content = JSON.stringify(this.records, null, 2)
      this.downloadFile(content, 'focus_records.json', 'application/json')
    },
    importFromJson(file: File) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const result = e.target?.result
          if (typeof result !== 'string') {
            throw new Error('文件读取失败')
          }

          const importedRecords = JSON.parse(result)

          if (!Array.isArray(importedRecords)) {
            throw new Error('JSON 根节点必须是数组')
          }

          // ✅ 校验每条记录 + 重写 ID 避免冲突
          const validRecords: FocusRecord[] = []
          for (const rec of importedRecords) {
            // 简单字段校验（可根据需要增强）
            if (
              typeof rec.date === 'string' &&
              typeof rec.hours === 'number' &&
              typeof rec.description === 'string' &&
              typeof rec.isHoliday === 'boolean' &&
              typeof rec.isSpecialEvent === 'boolean' &&
              typeof rec.specialEventContent === 'string'
            ) {
              // ✅ 重写 ID 保证唯一性（避免冲突）
              validRecords.push({
                ...rec,
                id: Date.now() + Math.random().toString(36).substring(2, 10), // 新 ID
              })
            }
          }

          if (validRecords.length === 0) {
            alert('未找到有效记录！')
            return
          }

          // ✅ 合并到现有记录
          this.records.push(...validRecords)
          this.saveToLocal()
          alert(`成功导入 ${validRecords.length} 条记录！`)
        } catch (error) {
          console.error('导入失败:', error)
          alert('导入失败：文件格式不正确或内容无效')
        }
      }
      reader.readAsText(file)
    },
    clearAll() {
      this.records = []
      this.saveToLocal()
    },
    downloadFile(content: string, fileName: string, mimeType: string) {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  },
  getters: {
    sortedRecords: (state) =>
      [...state.records].sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date))),
    chartData: (state) => {
      const map = {} as Record<string, number>
      state.records.forEach((r: any) => {
        if (!map[r.date]) map[r.date] = 0
        map[r.date] = (map[r.date] || 0) + Number(r.hours)
      })
      const labels = Object.keys(map).sort()
      const data = labels.map((date) => map[date])
      return { labels, data }
    },
  },
})
const generateMockData = () => {
  const data = []
  const descs = ['阅读Vue文档', '项目代码重构', '算法练习', '团队周会', '修复Bug', '学习WebGL']
  const specialEvents = ['版本发布', '线上故障排查', '季度规划会', 'Hackathon']

  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const isSpecial = Math.random() > 0.7 // 30% 概率特殊事件

    data.push({
      id: Date.now() - i * 1000,
      date: date.toISOString().split('T')[0],
      hours: Number((Math.random() * 8 + 1).toFixed(1)),
      description: descs[Math.floor(Math.random() * descs.length)],
      isHoliday: i % 6 === 0,
      isSpecialEvent: isSpecial,
      specialEventContent: isSpecial
        ? specialEvents[Math.floor(Math.random() * specialEvents.length)]
        : '',
    })
  }
  return data.reverse()
}
