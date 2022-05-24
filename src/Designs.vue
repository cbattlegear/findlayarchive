<script>
import VLazyImage from "v-lazy-image";

const API_URL = `https://findlayfunctions.azurewebsites.net/api/Designs`;

export default {
  components: {
    'v-lazy-image': VLazyImage
  },
  data: () => ({
    title: '',
    image_url: '',
    tags: [],
    placeholder: "/hatload.gif",
    design_list: [],
    IMAGE_ROOT: `https://cdn.findlayarchive.com/images/designs/`
  }),
  created() {
    // fetch on init
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const url = `${API_URL}`;
      this.design_list = await (
        await fetch(url, {
          headers: {
            "x-functions-key": "skKcV-7lEihYvSdaDf8DUko3-0ti8YsEL24S5A14qNygAzFuOXxdAg==",
          },
        })
      ).json();
      window.document.title = `Designs | Findlay Archive`
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
    <router-link to="/" class="navbar-brand">Findlay Archive Search</router-link>
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

  </nav>
  <div class="container">
    <main v-if="design_list" class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
      <div class="row mt-2" v-for="{ design_category, designs } in design_list.design_groups" :key="design_category">
        <h2>{{ design_category }}</h2>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3">
          <div class="col p-2" v-for="{ design_name, design_image } in designs" :key="design_name">

            <div class="card card-mid-width">
              <v-lazy-image src-placeholder="/hat_holder.png" :src="IMAGE_ROOT + design_image" :alt="design_name" />
              <div class="card-img-overlay">
                <h5 class="card-title"
                  style="text-shadow: -1px 1px 0 #FFF, 1px 1px 0 #FFF, 1px -1px 0 #FFF, -1px -1px 0 #FFF;">{{
                      design_name
                  }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

</template>