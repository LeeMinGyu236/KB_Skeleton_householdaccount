import { createRouter, createWebHistory } from 'vue-router';

import Home from './views/Home.vue';
import Summary from './views/Summary.vue';
import Transactions from './views/Transactions.vue';
import TransactionList from './components/TransactionList.vue';
import TransactionSummary from './components/TransactionSummary.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/transactions', component: Transactions },
  { path: '/transactionlist', component: TransactionList },
  { path: '/summary', component: Summary },
  { path: '/transactionSummary', component: TransactionSummary },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
