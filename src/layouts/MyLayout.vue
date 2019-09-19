<template lang="pug">
  q-layout(view="hHh LpR fFf")
    q-header(elevated)
      q-toolbar
        q-btn.app-logo.text-bold(key="logo", flat, no-caps, no-wrap, stretch, to="/")
          q-avatar
            img(src="~assets/transcode-s3-logo.svg")
          q-toolbar-title(shrink) Transcode S3
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
<style lang="sass">
.app-logo
  img
    transform: rotate(0deg)
    transition: transform .8s ease-in-out
  &:hover img
    transform: rotate(720deg)
</style>
