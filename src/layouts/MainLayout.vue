<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from "components/EssentialLink.vue";

const linksList = [
  {
    title: "초급편",
    caption: "특허2버전",
    icon: "looks_two",
    link: "/",
  },
];

import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "탈피",

  setup() {
    return {};
  },
});
</script>
