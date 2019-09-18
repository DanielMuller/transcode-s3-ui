<template lang="pug">
  q-layout(view="hHh LpR fFf")
    q-header(elevated)
      q-toolbar
        q-toolbar-title
          q-avatar
            img(src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg")
          span.q-ml-md Quasar App

    q-page-container
      router-view
</template>

<script>

export default {
  name: 'MyLayout',
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>
