<script>
import VLazyImage from "v-lazy-image";

const API_URL = `https://findlayarchive.search.windows.net/indexes/findlayhats-index/docs/`;
const API_PARAMS = `?api-version=2021-04-30-Preview`

export default {
  components: {
    'v-lazy-image': VLazyImage
  },
  data: () => ({
    title: '',
    image_url: '',
    tags: [],
    placeholder: "/hatload.gif"
  }),
  created() {
    // fetch on init
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const url = `${API_URL}${this.$route.params.id}${API_PARAMS}`;
      var archive_hat = await (
        await fetch(url, {
          headers: {
            "api-key": "AADDBB5C763039455A2E935A73801C2B",
          },
        })
      ).json();
      this.title = archive_hat.title
      this.image_url = archive_hat.image_url
      this.tags = archive_hat.tags
      window.document.title = `${this.title} | Findlay Archive`
      var meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      meta.setAttribute('content', this.image_url);
      document.getElementsByTagName('head')[0].appendChild(meta);
      appInsights.trackPageView();
    },
    formatTags() {
      var tagHtml = '<span class="fw-bold">Current Tags:</span> ';
      this.tags.forEach((element) => {
        tagHtml += '<span class="badge bg-secondary">' + element + "</span> \n";
      });
      return tagHtml;
    },
    truncate(v) {
      const newline = v.indexOf("\n");
      return newline > 0 ? v.slice(0, newline) : v;
    },
    formatDate(v) {
      return v.replace(/T|Z/g, " ");
    },
  },
};
</script>

<template>
  <nav class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-2 shadow navbar-expand-lg">
      <router-link to="/" class="navbar-brand">
        <img src="./assets/logo.png" alt="Findlay Archive" height="60"/>
      </router-link>
      <div class="navbar-nav">
        <div class="nav-item text-nowrap">
          <router-link class="nav-link px-3" to="/">Back to Search</router-link>
        </div>
      </div>
      <div class="navbar-nav">
        <div class="nav-item text-nowrap">
          <a class="nav-link px-3" href="mailto:cameron@findlayarchive.com">Contact</a>
        </div>
      </div>
        <button class="btn btn-primary navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#filterNav" aria-expanded="false" aria-controls="collapseExample">
          Filters
        </button>
      
  </nav>
  <div class="container">
    <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
      <h2>{{title}}</h2>
      <v-lazy-image :src="image_url" :src-placeholder="this.placeholder" class="img-fluid" :alt="title" />
      <div v-html="formatTags()"></div>
    </main>
  </div>

</template>