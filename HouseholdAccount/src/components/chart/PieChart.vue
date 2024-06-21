<template>
  <div class="container mt-5">
    <div class="chart-header">
      <h2 class="chart-title">이번 달 지출 그래프</h2>
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import axios from 'axios';

const chartCanvas = ref(null);
const transactions = ref([]);

const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:3000/transactions'); // Adjust the endpoint as needed
    transactions.value = response.data;
    await nextTick(); // Wait for DOM updates
    createChart();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

onMounted(() => {
  fetchData();
});

watch(transactions, async (newTransactions) => {
  if (newTransactions.length > 0) {
    await nextTick(); // Wait for DOM updates
    createChart();
  }
});

const createChart = () => {
  if (!chartCanvas.value) {
    console.error('Chart canvas is not available');
    return;
  }

  const data = {
    categories: {},
  };

  transactions.value.forEach((transaction) => {
    const { category, custom, amount } = transaction;
    if (!data.categories[category]) {
      data.categories[category] = { expense: 0 };
    }
    if (custom !== '수입') {
      // Only consider expenses
      data.categories[category].expense += amount;
    }
  });

  const labels = Object.keys(data.categories);
  const expenseData = labels.map((label) => data.categories[label].expense);

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) {
    console.error('Failed to get canvas context');
    return;
  }

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          label: '지출',
          backgroundColor: labels.map(
            () => `hsl(${Math.random() * 360}, 100%, 75%)`
          ),
          data: expenseData,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
    },
  });
};
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-header {
  display: flex;
  align-items: center;
}

.chart-title {
  margin-right: 20px;
  white-space: nowrap;
}

canvas {
  max-width: 300px;
  max-height: 300px;
}
</style>
