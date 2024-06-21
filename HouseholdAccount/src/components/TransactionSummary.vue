<template>
  <div class="summary-container" style="background-color: white">
    <h2 style="background-color: white">재정 요약</h2>
    <div class="button-group">
      <button
        @click="viewType = 'weekly'"
        :class="{ active: viewType === 'weekly', weekly: true }"
      >
        주간 요약
      </button>
      <button
        @click="viewType = 'monthly'"
        :class="{ active: viewType === 'monthly', monthly: true }"
      >
        월 별 요약
      </button>
      <button
        @click="viewType = '3months'"
        :class="{ active: viewType === '3months', threeMonths: true }"
      >
        세 달 요약
      </button>
    </div>
    <div
      v-if="viewType === 'weekly'"
      class="summary"
      style="background-color: white"
    >
      <h3>주간 요약</h3>
      <div class="navigation">
        <button @click="prevWeek">&lt;</button>
        <span class="month-display"
          >{{ formatDate(currentWeekStart) }} ~
          {{ formatDate(currentWeekEnd) }}</span
        >
        <button @click="nextWeek">&gt;</button>
      </div>
      <div class="summary-details">
        <p>
          수입: {{ weeklySummary.income.toLocaleString('ko-KR') }}원 / 지출:
          {{ weeklySummary.expense.toLocaleString('ko-KR') }}원
        </p>
        <p>순이익: {{ weeklySummary.netIncome.toLocaleString('ko-KR') }}원</p>
      </div>
    </div>
    <div
      v-if="viewType === 'monthly'"
      class="summary"
      style="background-color: white"
    >
      <h3>월 별 요약</h3>
      <div class="navigation">
        <button @click="prevMonth">&lt;</button>
        <span class="month-display">{{ currentMonth }}</span>
        <button @click="nextMonth">&gt;</button>
      </div>
      <div class="summary-details">
        <p>
          수입: {{ monthlySummary.income.toLocaleString('ko-KR') }}원 / 지출:
          {{ monthlySummary.expense.toLocaleString('ko-KR') }}원
        </p>
        <p>순이익: {{ monthlySummary.netIncome.toLocaleString('ko-KR') }}원</p>
      </div>
    </div>
    <div
      v-if="viewType === '3months'"
      class="summary"
      style="background-color: white"
    >
      <h3>세 달 요약</h3>
      <div class="navigation">
        <button @click="prevThreeMonths">&lt;</button>
        <span class="month-display">{{ threeMonthsPeriod }}</span>
        <button @click="nextThreeMonths">&gt;</button>
      </div>
      <div class="summary-details">
        <p>
          수입: {{ threeMonthsSummary.income.toLocaleString('ko-KR') }}원 /
          지출: {{ threeMonthsSummary.expense.toLocaleString('ko-KR') }}원
        </p>
        <p>
          순이익: {{ threeMonthsSummary.netIncome.toLocaleString('ko-KR') }}원
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTransactionStore } from '../stores/transaction';

const store = useTransactionStore();

onMounted(() => {
  store.fetchTransactions();
});

const viewType = ref('monthly'); // 초기 요약 타입을 월별 요약으로 설정

// 현재 주간 요약 기간 설정
const currentWeekStart = ref(new Date());
const currentWeekEnd = ref(new Date());

currentWeekStart.value.setDate(
  currentWeekStart.value.getDate() - currentWeekStart.value.getDay()
);
currentWeekEnd.value.setDate(currentWeekStart.value.getDate() + 6);

// 주간 요약 데이터 계산
const weeklySummary = computed(() => {
  const start = currentWeekStart.value;
  const end = currentWeekEnd.value;
  const summary = { income: 0, expense: 0 };
  store.transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    if (date >= start && date <= end) {
      if (transaction.custom === '수입') {
        summary.income += transaction.amount;
      } else {
        summary.expense += transaction.amount;
      }
    }
  });
  summary.netIncome = summary.income - summary.expense;
  return summary;
});

// 현재 월 설정
const currentMonth = ref(new Date().toISOString().substring(0, 7));

// 월별 요약 데이터 계산
const monthlySummary = computed(() => {
  const month = currentMonth.value;
  const summary = { income: 0, expense: 0 };
  store.transactions.forEach((transaction) => {
    if (transaction.date.substring(0, 7) === month) {
      if (transaction.custom === '수입') {
        summary.income += transaction.amount;
      } else {
        summary.expense += transaction.amount;
      }
    }
  });
  summary.netIncome = summary.income - summary.expense;
  return summary;
});

// 세달 요약 데이터 계산
const threeMonthsSummary = computed(() => {
  const now = new Date(currentMonth.value + '-01');
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const summary = { income: 0, expense: 0 };
  store.transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    if (date >= start && date <= end) {
      if (transaction.custom === '수입') {
        summary.income += transaction.amount;
      } else {
        summary.expense += transaction.amount;
      }
    }
  });
  summary.netIncome = summary.income - summary.expense;
  return summary;
});

// 세달 요약 기간 표시
const threeMonthsPeriod = computed(() => {
  const now = new Date(currentMonth.value + '-01');
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(
    2,
    '0'
  )} ~ ${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`;
});

// 이전 주, 다음 주로 이동하는 함수
function prevWeek() {
  const start = new Date(currentWeekStart.value);
  start.setDate(start.getDate() - 7);
  const end = new Date(currentWeekEnd.value);
  end.setDate(end.getDate() - 7);
  currentWeekStart.value = new Date(start.toDateString());
  currentWeekEnd.value = new Date(end.toDateString());
}

function nextWeek() {
  const start = new Date(currentWeekStart.value);
  start.setDate(start.getDate() + 7);
  const end = new Date(currentWeekEnd.value);
  end.setDate(end.getDate() + 7);
  currentWeekStart.value = new Date(start.toDateString());
  currentWeekEnd.value = new Date(end.toDateString());
}

// 이전 달, 다음 달로 이동하는 함수
function prevMonth() {
  const month = new Date(currentMonth.value + '-01');
  month.setMonth(month.getMonth() - 1);
  currentMonth.value = month.toISOString().substring(0, 7);
}

function nextMonth() {
  const month = new Date(currentMonth.value + '-01');
  month.setMonth(month.getMonth() + 1);
  currentMonth.value = month.toISOString().substring(0, 7);
}

// 이전 세달, 다음 세달로 이동하는 함수
function prevThreeMonths() {
  const month = new Date(currentMonth.value + '-01');
  month.setMonth(month.getMonth() - 3);
  currentMonth.value = month.toISOString().substring(0, 7);
}

function nextThreeMonths() {
  const month = new Date(currentMonth.value + '-01');
  month.setMonth(month.getMonth() + 3);
  currentMonth.value = month.toISOString().substring(0, 7);
}

// 날짜 포맷팅 함수
function formatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('ko-KR', options).format(date);
}

// 금액 포맷팅 함수
function formatCurrency(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원';
}
</script>

<style scoped>
.summary-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: f0f0f0;
}

h2 {
  text-align: center;
  color: #333;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  font-weight: bold;
}

.button-group button {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  padding: 10px 20px;
  cursor: pointer;
  margin: 0 5px;
  transition: background-color 0.3s;
  width: 20%;
}

.button-group button:hover {
  background-color: #e2e3e5;
}

.button-group .active {
  background-color: silver;
  font-weight: bold;
}

.summary {
  text-align: center;
}

.navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.navigation button {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  padding: 5px 10px;
  cursor: pointer;
}

.month-display {
  margin: 0 10px;
  font-weight: bold; /* Make the current month bold */
}
</style>
