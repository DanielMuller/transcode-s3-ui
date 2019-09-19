<template lang="pug">
  q-layout(view="hHh LpR fFf")
    q-header(elevated)
      q-toolbar
        q-btn.app-logo.text-bold(key="logo", flat, no-caps, no-wrap, stretch, to="/")
          q-avatar
            img(src="~assets/transcode-s3-logo.svg")
          q-toolbar-title(shrink) Transcode S3
        q-space
        .row.q-gutter-sm
          q-btn(v-if="signedIn" :flat="isSmall()" :dense="isSmall()" v-ripple icon="cloud_upload" :label="getLabel('Upload')" no-caps no-wrap :to="{name:'upload'}")
          q-btn(v-if="signedIn" :flat="isSmall()" :dense="isSmall()" v-ripple icon="exit_to_app" :label="getLabel('Sign Out')" no-caps no-wrap @click="signOut")
          q-btn(v-if="!signedIn" :flat="isSmall()" :dense="isSmall()" v-ripple icon="lock" :label="getLabel('Sign In')" no-caps no-wrap :to="{name:'auth'}")
    q-page-container
      router-view
</template>

<script>

export default {
  name: 'MyLayout',
  data () {
    return {
      user: null,
      signedIn: false
    }
  },
  beforeCreate () {
    this.$AmplifyEventBus.$on('authState', authState => {
      if (authState === 'signedIn') {
        this.signedIn = true
        this.$router.push({ name: 'home' })
      }
      if (authState === 'signedOut') {
        this.signedIn = false
        this.$router.push({ name: 'auth' })
      }
    })
    this.$Auth.currentAuthenticatedUser()
      .then(user => {
        this.signedIn = true
      })
      .catch((err) => {
        this.signedIn = false
        this.$Logger.debug(err)
      })
  },
  methods: {
    isSmall () {
      return this.$q.screen.lt.sm
    },
    getLabel (txt) {
      return this.$q.screen.gt.xs ? txt : ''
    },
    signOut () {
      this.$Auth.signOut()
        .then(data => {
          this.signedIn = false
          parent.signedIn = false
          this.$router.push({ name: 'auth' })
        })
        .catch(err => {
          this.$Logger.error(err)
        })
    }
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
