import { defineStore } from 'pinia';
import axios from 'axios';

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [],
  }),
  actions: {
    async fetchTransactions() {
      const { data } = await axios.get('http://localhost:3000/transactions');
      this.transactions = data;
    },
    async addTransaction(transaction) {
      const { data } = await axios.post(
        'http://localhost:3000/transactions',
        transaction
      );
      this.transactions.push(data);
    },
    // function toNumberFormatOfKor(custom) {
    //   return custom.toLocaleString('ko-KR');
    // }

    async deleteTransaction(id) {
      await axios.delete(`http://localhost:3000/transactions/${id}`);
      this.transactions = this.transactions.filter(
        (transaction) => transaction.id !== id
      );
    },
    //이게 삭제버튼 추가한거임.
  },
});
