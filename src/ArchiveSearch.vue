<template>
  <nav class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-2 shadow navbar-expand-lg">
      <a @click="clearsearch" class="navbar-brand">Findlay Archive Search</a>

      <form class="input-group w-100"  @submit.prevent="search">
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

      <div class="navbar-nav">
        <div class="nav-item text-nowrap">
          <a class="nav-link px-3" href="mailto:cameron@findlayarchive.com">Contact</a>
        </div>
      </div>
        <button class="navbar-toggler btn btn-outline-success m-2" type="button" @click="togglefilters" aria-expanded="false" aria-controls="filterNav">
          Filters
        </button>
      
  </nav>
  <div class="container-fluid">
    <div class="row">
    <nav id="filterNav" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse navbar-collapsed">
      <div v-if="archive_hats" class="position-sticky pt-3">
      
          <div class="form-check"
            v-for="{ count, value } in archive_hats['@search.facets']['tags']"
            :key="value"
          >
             <input :id="'filter-' + value.replace(' ', '-')" class="form-check-input" type="checkbox" @change="filterCheck" v-bind:value="value" /> 
             <label class="form-check-label" :for="'filter-' + value.replace(' ', '-')">{{value + " (" + count + ")"}}</label>
          </div>
      </div>
    </nav>
    <div v-if="loading">
      Loading...
    </div>
    <main v-if="archive_hats" class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
      <div v-if="archive_hats.value.length == 0" class="row row-cols-1">
        <h2 class="text-center">No hats found</h2>
        <video style="max-width: 500px" playsinline autoplay muted loop>
          <source src="./assets/sidepop.webm" type="video/webm">
          Your browser does not support the video tag.
        </video>
      </div>
      <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4">
        <div
          class="col p-2"
          v-for="{ image_url, title, hat_id } in archive_hats.value"
          :key="hat_id"
          @click="setModalContent(hat_id)"
        >
          <div class="card card-mid-width">
            <v-lazy-image src-placeholder="/hat_holder.png" :src="image_url.replace('.jp', '-thumbnail.jp')"  :alt="title"/>
            <div class="card-body">
              <h5 class="card-title">{{ title }}</h5>
            </div>
          </div>
        </div>
      </div>
      <nav v-if="archive_hats.value.length != 0" aria-label="Page navigation example">
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

  <!-- Modal -->
  <div
    class="modal fade"
    id="hatPopout"
    tabindex="-1"
    aria-labelledby="hatPopoutLabel"
    aria-hidden="true"
    data-bs-backdrop="static"
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
          <v-lazy-image v-if="hatModalVisable" class="d-block w-100" :src="modalImage" src-placeholder="/hatload.gif" />
          <div v-html="formatTags()"></div>
          <div><router-link :to="{name: 'hats', params: {id: modalHatId}}">Direct Link</router-link></div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="dismissmodal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .card-min-width{
    min-width: 230px;
  }

  .card-loading-background {
    min-height: 150px; 
    background-image: url('/hat_holder.png'); 
    background-position: center center; 
    background-repeat:no-repeat;
  }
</style>

<script>
const API_URL = `https://findlayarchive.search.windows.net/indexes/findlayhats-index/docs?api-version=2021-04-30-Preview&search=`;
import Paginate from "vuejs-paginate-next";
import VLazyImage from "v-lazy-image";
import { Modal, Collapse } from 'bootstrap';

export default {
  components: {
    paginate: Paginate,
    'v-lazy-image': VLazyImage
  },
  data: () => ({
    searchTerms: "",
    page: 1,
    numberOfResults: 16,
    archive_hats: null,
    modalTitle: "",
    modalImage: "",
    modalTags: [],
    modalHatId: 0,
    checkedFilters: [],
    hatModal: null,
    hatModalVisable: false,
    filterPane: null,
    loading: false
  }),
  beforeRouteLeave (to, from, next) {
    if(this.hatModal._isShown){
      this.hatModal.hide()
      next()
    }
  },
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
      this.loading = false
    },
    searchButton() {
      this.page = 1;
      this.search();
    },
    search() {
      this.loading = true;
      var searchOptions = `&facet=tags&$count=true&$orderby=date_added desc,title&$top=${
        this.numberOfResults
      }&$skip=${(this.page - 1) * this.numberOfResults}` + this.filterOptions;
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
      this.modalHatId = current_item.hat_id;
      this.showmodal();
    },
    showmodal() {
      this.hatModalVisable = true;
      this.hatModal.show();
    },
    dismissmodal() {
      this.hatModal.hide();
      this.hatModalVisable = false;
    },
    togglefilters() {
      this.filterPane.toggle();
    },
    formatTags() {
      var tagHtml = '<span class="fw-bold">Current Tags:</span> ';
      this.modalTags.forEach((element) => {
        tagHtml += '<span class="badge bg-secondary">' + element + "</span> \n";
      });
      return tagHtml;
    },
    filterCheck(e) {
      if(e.target.checked) {
        this.checkedFilters.push(e.target.value)
      } else {
        this.checkedFilters = this.checkedFilters.filter(item => item !== e.target.value)
      }
      // Added to resolve issue #10, forces page one on filter click
      this.page = 1;
      this.search()
    },
    clearsearch() {
      this.searchTerms = "";
      this.clearfilters();
      this.search();
    },
    clearfilters() {
      this.checkedFilters.forEach(tag => {
        var checkbox = document.querySelector('#filter-' + tag.replace(' ', '-'))
        checkbox.checked = false;
      });
      this.checkedFilters = [];
    },
  },
  mounted() {
   this.hatModal = Modal.getOrCreateInstance(document.querySelector('#hatPopout'));
   this.filterPane = Collapse.getOrCreateInstance(document.querySelector('#filterNav'));
  },
};
</script>