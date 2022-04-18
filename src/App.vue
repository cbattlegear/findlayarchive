<script>
const API_URL = `https://findlayarchive.search.windows.net/indexes/findlayhats-index/docs?api-version=2021-04-30-Preview&search=`;
import Paginate from "vuejs-paginate-next";

export default {
  components: {
    paginate: Paginate,
  },
  data: () => ({
    searchTerms: "",
    page: 1,
    numberOfResults: 16,
    archive_hats: null,
    modalTitle: "",
    modalImage: "",
    modalTags: [],
    checkedFilters: []
  }),

  created() {
    // fetch on init
    this.search();
  },
  computed: {
    pageCount() {
      return Math.floor(this.archive_hats["@odata.count"] / 16) + 1;
    },
    filterOptions() {
      if (this.checkedFilters.length == 0) { 
        return "";
      } else {
        var filterString = "&$filter="
        this.checkedFilters.forEach(element => {
          filterString += `tags/any(tag: tag eq '${element}') and `
        });
        return filterString.substring(0, filterString.length - 5)
      }
    }
  },
  methods: {
    async fetchData(search) {
      const url = `${API_URL}${search}`;
      this.archive_hats = await (
        await fetch(url, {
          headers: {
            "api-key": "AADDBB5C763039455A2E935A73801C2B",
          },
        })
      ).json();
    },
    searchButton() {
      this.page = 1;
      this.search();
    },
    search() {
      var searchOptions = `&facet=tags&$count=true&$orderby=title&$top=${
        this.numberOfResults
      }&$skip=${(this.page - 1) * this.numberOfResults}` + this.filterOptions;
      console.log(searchOptions)
      if (this.searchTerms === "") {
        this.fetchData("*" + searchOptions);
      } else {
        this.fetchData(this.searchTerms + searchOptions);
      }
    },
    setModalContent(hat_id) {
      var current_item =
        this.archive_hats.value[
          this.archive_hats.value.findIndex((hat) => hat.hat_id == hat_id)
        ];
      this.modalTitle = current_item.title;
      this.modalImage = current_item.image_url;
      this.modalTags = current_item.tags;
    },
    formatTags() {
      var tagHtml = '<span class="fw-bold">Current Tags:</span> ';
      this.modalTags.forEach((element) => {
        tagHtml += '<span class="badge bg-secondary">' + element + "</span> \n";
      });
      return tagHtml;
    },
    filterCheck(e) {
      console.log(e.target.value)
      if(e.target.checked) {
        this.checkedFilters.push(e.target.value)
      } else {
        this.checkedFilters = this.checkedFilters.filter(item => item !== e.target.value)
      }
      this.search()
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
  <nav class="navbar navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand">Findlay Archive Search</a>
      <form class="d-flex" @submit.prevent="search">
        <input
          class="form-control me-2"
          type="search"
          placeholder="Search"
          aria-label="Search"
          v-model="searchTerms"
        />
        <button
          class="btn btn-outline-success"
          type="submit"
          @click="searchButton"
        >
          Search
        </button>
      </form>
    </div>
  </nav>
  <div class="container-fluid">
    <div class="row">
    <nav class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
      <div class="position-sticky pt-3">
      
          <div class="form-check"
            v-for="{ count, value } in archive_hats['@search.facets']['tags']"
            :key="value"
          >
             <input :id="'filter-' + value.replace(' ', '-')" class="form-check-input" type="checkbox" @change="filterCheck" v-bind:value="value" /> 
             <label class="form-check-label" :for="'filter-' + value.replace(' ', '-')">{{value + " (" + count + ")"}}</label>
          </div>
      </div>
    </nav>
    <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
      <div class="row row-cols-1 row-cols-md-4">
        <div
          class="col p-2"
          v-for="{ image_url, title, hat_id } in archive_hats.value"
          :key="hat_id"
          @click="setModalContent(hat_id)"
        >
          <div class="card" data-bs-toggle="modal" data-bs-target="#hatPopout">
            <img :src="image_url.replace('.jp', '-thumbnail.jp')" class="card-img-top" :alt="title" />
            <div class="card-body">
              <h5 class="card-title">{{ title }}</h5>
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
    </main>
  </div>
  </div>
  <footer class="text-center bg-light text-muted">
    <div class="text-center p-2">
      <span
        >All images and names owned by
        <a href="https://www.findlayhats.com/" target="_blank">Findlay Hats</a>,
        this is a passion project to make finding their cool hats easier.</span
      >
    </div>
  </footer>

  <!-- Modal -->
  <div
    class="modal fade"
    id="hatPopout"
    tabindex="-1"
    aria-labelledby="hatPopoutLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="hatPopoutLabel">{{ modalTitle }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <img class="d-block w-100" :src="modalImage" />
          <div v-html="formatTags()"></div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
