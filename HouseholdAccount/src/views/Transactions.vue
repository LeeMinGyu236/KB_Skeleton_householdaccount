<template>
  <div>
    <br />
    <Transaction />
    <TransactionList />
  </div>
</template>

<script>
import Transaction from '../components/AddTransaction.vue';
import TransactionList from '../components/TransactionList.vue';

export default {
  components: {
    TransactionList,
    Transaction,
  },
};
</script>

<style scoped></style>
