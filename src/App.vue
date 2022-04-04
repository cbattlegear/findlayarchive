<script>
const API_URL = `https://findlayarchive.search.windows.net/indexes/azureblob-index/docs?api-version=2021-04-30-Preview&search=`
import Paginate from 'vuejs-paginate-next';

export default {
  components: {
    paginate: Paginate,
  },
  data: () => ({
    searchTerms: '',
    page: 1,
    numberOfResults: 16,
    archive_hats: null
  }),

  created() {
    // fetch on init
    this.search()
  },
  computed: {
    pageCount() {
      return Math.floor(this.archive_hats["@odata.count"]/16)+1;
    }
  },
  methods: {
    async fetchData(search) {
      const url = `${API_URL}${search}`
      this.archive_hats = await (await fetch(url, {
        headers: {
          'api-key': 'AADDBB5C763039455A2E935A73801C2B'
        }
      }
      )).json()
    },
    searchButton() {
      this.page = 1
      this.search()
    },
    search() {
      var searchOptions = `&$count=true&$orderby=merged_content&$top=${this.numberOfResults}&$skip=${(this.page-1)*this.numberOfResults}`
      if(this.searchTerms === '') {
        this.fetchData('*'+searchOptions)
      } else {
        this.fetchData(this.searchTerms+searchOptions)
      }
    },
    truncate(v) {
      const newline = v.indexOf('\n')
      return newline > 0 ? v.slice(0, newline) : v
    },
    formatDate(v) {
      return v.replace(/T|Z/g, ' ')
    }
  }
}
</script>

<template>
  <nav class="navbar navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand">Finlay Archive Search</a>
      <form class="d-flex" @submit.prevent="search">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" v-model="searchTerms">
        <button class="btn btn-outline-success" type="submit" @click="searchButton">Search</button>
      </form>
    </div>
  </nav>
  <div class="container my-4">
    <div class="row row-cols-1 row-cols-md-4">
      <div class="col p-2" v-for="{metadata_storage_path, merged_content, metadata_storage_name} in archive_hats.value" :key="metadata_storage_name">
        <div class="card">
          <img :src="metadata_storage_path" class="card-img-top" :alt="merged_content">
          <div class="card-body">
            <h5 class="card-title">{{merged_content}}</h5>
          </div>
        </div>
      </div>  
    </div>
  </div>
  <nav aria-label="Page navigation example">
    <paginate
      v-model="page"
      :page-count="pageCount"
      :click-handler="search"
      :prev-text="'Prev'"
      :next-text="'Next'"
      :container-class="'pagination justify-content-center'"
      :page-class="'page-item'"
    >
    </paginate>
  </nav>
  <footer class="text-center bg-light text-muted">
    <div class="text-center p-2">
      <span>All images and names owned by <a href="https://www.findlayhats.com/" target="_blank">Findlay Hats</a>, this is a passion project to make finding their cool hats easier.</span>
    </div>
  </footer>
</template>
