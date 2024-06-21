<template>
  <div v-if="isActive" class="modal is-active" @click.self="handleClose">
    <div class="modal-dialog" @click.stop>
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">수입과 지출을 입력해주세요.</h5>
          <button
            type="button"
            class="btn-close"
            @click="handleClose"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitTransaction">
            <div class="form-group">
              <label for="date" class="bold-label">날짜</label>
              <input
                type="date"
                v-model="date"
                class="form-control"
                id="date"
                required
              />
            </div>
            <div class="form-group">
              <label for="type" class="bold-label">수입/지출 선택</label>
              <div class="form-checkbox">
                <label for="income">
                  <input
                    id="income"
                    class="form-radio-input"
                    v-model="custom"
                    type="radio"
                    value="수입"
                    name="type"
                  />
                  <span class="radio-btn">수입</span>
                </label>
                <label for="expense">
                  <input
                    id="expense"
                    class="form-radio-input"
                    v-model="custom"
                    type="radio"
                    value="지출"
                    name="type"
                  />
                  <span class="radio-btn">지출</span>
                </label>
              </div>
            </div>
            <div class="form-group">
              <label for="category" class="bold-label">카테고리</label>
              <select
                v-model="category"
                id="category"
                class="form-control"
                required
              >
                <option v-if="custom === '지출'" disabled value="">
                  지출 카테고리 선택
                </option>
                <option
                  v-if="custom === '지출'"
                  v-for="cat in expenseCategories"
                  :key="cat"
                >
                  {{ cat }}
                </option>
                <option v-if="custom === '수입'" disabled value="">
                  수입 카테고리 선택
                </option>
                <option
                  v-if="custom === '수입'"
                  v-for="cat in incomeCategories"
                  :key="cat"
                >
                  {{ cat }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="amount" class="bold-label">금액 입력</label>
              <input
                v-model="amount"
                type="number"
                id="amount"
                class="form-control"
                required
              />
            </div>
            <div class="form-group">
              <label for="memo" class="bold-label">메모</label>
              <textarea
                v-model="memo"
                placeholder="세부 내용을 입력해주세요."
                class="form-control boxsize"
              ></textarea>
            </div>
            <div class="form-group">
              <button type="submit" class="btn btn-primary">추가</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { useTransactionStore } from '../stores/transaction';

const store = useTransactionStore();
const props = defineProps({
  isActive: Boolean,
});
const emits = defineEmits(['close']);

const date = ref(new Date().toISOString().substr(0, 10));
const category = ref('');
const amount = ref('');
const custom = ref('지출');
const memo = ref('');
const expenseCategories = ['식비', '교통비', '생활비', '여가', '기타'];
const incomeCategories = ['용돈', '월급', '기타'];

// 모든 카테고리 합치기
const allCategories = [...expenseCategories, ...incomeCategories];

const submitTransaction = async () => {
  await store.addTransaction({
    date: date.value,
    category: category.value,
    amount: amount.value,
    custom: custom.value,
    memo: memo.value,
  });

  // 초기화
  resetForm();
  // 모달 닫기
  emits('close');
};

const resetForm = () => {
  date.value = new Date().toISOString().substr(0, 10); // 폼 리셋 시 다시 현재 날짜로 설정
  category.value = '';
  amount.value = '';
  custom.value = '지출';
  memo.value = '';
};

const handleClose = () => {
  emits('close');
};
</script>

<style scoped>
* {
  font-family: 'Pretendard';
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.modal-dialog {
  max-width: 800px;
  margin: auto;
  width: 100%;
  height: 80%;
}

.modal-content {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.boxsize {
  box-sizing: content-box;
  width: 100%;
  height: 130px;
  padding: 5px;
}

.radio-btn {
  cursor: pointer;
  display: inline-block;
  padding: 8px 16px;
  font-weight: bold;
  border-radius: 5px;
  color: #000;
}

.form-checkbox {
  text-align: center;
  margin-bottom: 20px;
}

.bold-label {
  font-weight: bold;
}

.btn-primary {
  width: 100%;
  padding: 10px;
  font-size: 16px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
