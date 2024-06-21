<template>
  <div class="container mt-1">
    <!-- <h2 class="mb-4 text-center">거래 내역</h2> -->
    <!-- 정렬 및 필터링 옵션 추가 -->
    <div class="row mb-3 justify-content-end align-items-center">
      <div class="col-sm-4">
        <!-- <label for="sorting">정렬 기준:</label> -->
        <select
          v-model="sorting"
          id="sorting"
          class="form-control"
          @change="sortTransactions"
        >
          <option value="recent">정렬기준</option>
          <option value="amount">큰 금액순</option>
          <option value="category">카테고리순</option>
          <option value="type">종류순</option>
        </select>
      </div>
      <div class="col-sm-4">
        <!-- <label for="filter">날짜 필터링:</label> -->
        <select
          v-model="filter"
          id="filter"
          class="form-control"
          @change="filterTransactions"
        >
          <option value="all">날짜 필터링</option>
          <option value="week">1주일</option>
          <option value="month">한 달</option>
          <option value="3months">3달</option>
          <option value="today">오늘</option>
        </select>
      </div>
      <div class="col-auto">
        <button class="btn btn-success" @click="openModal">
          <i class="fa-solid fa-circle-plus"></i>
        </button>
      </div>
    </div>

    <!-- 거래 내역 테이블 -->
    <table class="table table-hover">
      <thead class="table-dark">
        <tr>
          <th scope="col">날짜</th>
          <th scope="col">카테고리</th>
          <th scope="col">금액</th>
          <th scope="col">종류</th>
          <th scope="col">메모</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <!-- 필터링된 거래 내역 출력 -->
        <tr
          v-for="transaction in filteredTransactions"
          :key="transaction.id"
          :class="{
            'income-row': transaction.custom === '수입',
            'expense-row': transaction.custom === '지출',
          }"
        >
          <td>{{ transaction.date }}</td>
          <td>{{ transaction.category }}</td>
          <td
            :style="{ color: transaction.custom === '수입' ? 'blue' : 'red' }"
          >
            {{ formatCurrency(transaction.amount) }}
          </td>
          <td>{{ transaction.custom }}</td>
          <td>{{ transaction.memo }}</td>
          <td>
            <button
              class="btn btn-danger btn-sm"
              @click="confirmDeleteTransaction(transaction.id)"
            >
              삭제
            </button>
          </td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <!-- 거래 수정 폼 -->
    <div v-if="isEditing">
      <h3>거래 수정</h3>
      <form @submit.prevent="updateTransaction">
        <input
          v-model="currentTransaction.date"
          type="date"
          class="form-control mb-2"
        />
        <input
          v-model="currentTransaction.category"
          type="text"
          class="form-control mb-2"
        />
        <input
          v-model="currentTransaction.amount"
          type="number"
          class="form-control mb-2"
        />
        <input
          v-model="currentTransaction.custom"
          type="text"
          class="form-control mb-2"
        />
        <input
          v-model="currentTransaction.memo"
          type="text"
          class="form-control mb-2"
        />
        <button type="submit" class="btn btn-success">저장</button>
        <button type="button" class="btn btn-secondary" @click="cancelEdit">
          취소
        </button>
      </form>
    </div>

    <!-- 모달 추가 -->
    <teleport to="body">
      <add-transaction
        v-if="isModalOpen"
        :isActive="isModalOpen"
        @close="closeModal"
      />
    </teleport>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useTransactionStore } from '../stores/transaction';
import AddTransaction from './AddTransaction.vue'; // AddTransaction 컴포넌트를 가져옴

const store = useTransactionStore();

onMounted(() => {
  store.fetchTransactions();
});

const sorting = ref('recent'); // 초기 정렬 기준 설정
const filter = ref('all'); // 초기 필터링 설정을 '전체 내역 보기'로 설정
const isModalOpen = ref(false); // 모달 상태 관리

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const sortedTransactions = computed(() => {
  let sorted = [...store.transactions];
  if (sorting.value === 'recent') {
    sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sorting.value === 'amount') {
    sorted.sort((a, b) => b.amount - a.amount);
  } else if (sorting.value === 'category') {
    sorted.sort((a, b) => a.category.localeCompare(b.category));
  } else if (sorting.value === 'type') {
    sorted.sort((a, b) => a.custom.localeCompare(b.custom));
  }
  return sorted;
});

const filteredTransactions = computed(() => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );
  const threeMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 3,
    now.getDate()
  );
  if (filter.value === 'week') {
    return sortedTransactions.value.filter(
      (transaction) => new Date(transaction.date) >= oneWeekAgo
    );
  } else if (filter.value === 'month') {
    return sortedTransactions.value.filter(
      (transaction) => new Date(transaction.date) >= oneMonthAgo
    );
  } else if (filter.value === '3months') {
    return sortedTransactions.value.filter(
      (transaction) => new Date(transaction.date) >= threeMonthsAgo
    );
  } else if (filter.value === 'today') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return sortedTransactions.value.filter(
      (transaction) => new Date(transaction.date) >= today
    );
  }
  return sortedTransactions.value;
});

const isEditing = ref(false);
const currentTransaction = ref(null);

function editTransaction(id) {
  // 수정할 거래 정보 가져오기
  const transactionToEdit = store.transactions.find(
    (transaction) => transaction.id === id
  );
  // 폼에 수정할 거래 정보 채우기
  currentTransaction.value = { ...transactionToEdit };
  isEditing.value = true;
}

function updateTransaction() {
  const index = store.transactions.findIndex(
    (t) => t.id === currentTransaction.value.id
  );
  store.transactions.splice(index, 1, currentTransaction.value);
  isEditing.value = false;
  currentTransaction.value = null;
}

function cancelEdit() {
  isEditing.value = false;
  currentTransaction.value = null;
}

function confirmDeleteTransaction(id) {
  if (confirm('삭제하겠습니까?')) {
    deleteTransaction(id);
  }
}

async function deleteTransaction(id) {
  await store.deleteTransaction(id);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value);
}
</script>
<style scoped>
.table {
  margin-top: 20px;
}

.table-hover tbody tr:hover {
  background-color: #f5f5f5;
}

.table-dark th {
  background-color: silver;
  color: white;
}
.text-center {
  text-align: center;
}
.row.mb-3.align-items-center {
  display: flex;
  justify-content: space-between;
}
</style>
