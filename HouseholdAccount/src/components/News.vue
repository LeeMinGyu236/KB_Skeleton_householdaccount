<!-- views/News.vue -->
<template>
  <div class="news-container">
    <h2>최근 뉴스</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="articles-container">
      <div v-for="article in articles" :key="article.url" class="article">
        <h3>{{ article.title }}</h3>
        <p>{{ article.description }}</p>
        <a :href="article.url" target="_blank">Read more</a>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      articles: [],
      loading: true,
    };
  },
  async mounted() {
    try {
      const response = await axios.get(
        'https://newsapi.org/v2/top-headlines?country=us&apiKey=ab5fa71416bc4687a2c535d3606c3f91'
      );
      this.articles = response.data.articles;
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style scoped>
.news-container {
  max-width: 1200px; /* 전체 컨텐츠 폭 설정 */
  margin: 20px auto; /* 위아래 여백 추가 */
  padding: 20px;
}

.loading {
  text-align: center;
  font-size: 1.5em;
}

.articles-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3개씩 정렬 */
  gap: 20px; /* 그리드 간격 설정 */
}

.article {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.article h3 {
  margin: 0 0 10px 0;
  font-size: 1.2em;
}

.article p {
  margin: 0 0 10px 0;
  font-size: 1em;
}

.article a {
  color: blue;
  text-decoration: underline;
  font-size: 0.9em;
}
</style>
