<template>
  <div class="container">
    <div class="timer-section mb-4">
      <TimerModel/>
    </div>
    <div class="record-section">
      <DailyRecordForm/>
    </div>
    <div class="todo-section">
      <ToDoList/>
    </div>
  </div>
</template>

<script setup>
import DailyRecordForm from '@/views/DailyRecordForm.vue'
import ToDoList from '@/views/ToDoList.vue'
import TimerModel from '@/views/TimerModel.vue'

</script>

<style scoped>
@media (max-width: 768px) {
  .timer-section {
    display: none;
  }
}
</style>
