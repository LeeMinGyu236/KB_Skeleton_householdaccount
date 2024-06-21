<template>
  <div class="demo-app">
    <div class="demo-app-main">
      <FullCalendar class="demo-app-calendar" :options="calendarOptions">
        <template v-slot:eventContent="arg">
          <b>{{ arg.timeText }}</b>
          <div class="event-title">{{ arg.event.title }}</div>
          <div class="event-details">
            <div class="income">
              지출: -{{ arg.event.extendedProps.income }}
            </div>
            <div class="expense">
              수입: {{ arg.event.extendedProps.expense }}
            </div>
          </div>
        </template>
      </FullCalendar>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const calendarOptions = ref({
  plugins: [
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin, // needed for dateClick
  ],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  initialView: 'dayGridMonth',
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
});

const transactions = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/transactions');
    transactions.value = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

// Computed property to aggregate amounts by date
const aggregatedTransactions = computed(() => {
  return transactions.value.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) {
      acc[date] = {
        date,
        amount: 0,
        income: 0,
        expense: 0,
        transactions: [],
      };
    }
    if (transaction.custom === '수입') {
      acc[date].income += transaction.amount;
    } else {
      acc[date].expense += transaction.amount;
    }
    acc[date].amount = acc[date].income - acc[date].expense;
    acc[date].transactions.push(transaction);
    return acc;
  }, {});
});

// Computed property to map aggregated data to calendar events
const calendarEvents = computed(() => {
  return Object.values(aggregatedTransactions.value).map((aggTransaction) => ({
    title: `총 지출: ${aggTransaction.amount}`,
    start: aggTransaction.date,
    extendedProps: {
      income: aggTransaction.income,
      expense: aggTransaction.expense,
    },
  }));
});

// Watch the computed property to update the calendar events
watch(
  calendarEvents,
  (newEvents) => {
    calendarOptions.value.events = newEvents;
  },
  { immediate: true }
);
</script>

<style lang="css">
.event-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.event-details {
  font-size: 0.9em;
}
</style>
