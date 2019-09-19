<template lang="pug">
  q-page(padding).bg-grey-4.row.justify-center
    amplify-authenticator(:authConfig='authConfig')
</template>

<script>
export default {
  name: 'Auth',
  beforeCreate () {
    this.$Auth.currentAuthenticatedUser()
      .then(user => {
        this.$router.push({ name: 'home' })
      })
      .catch((err) => {
        this.$Logger.debug(err)
      })
  },
  computed: {
    authConfig () {
      return {
        signInConfig: {
          isSignUpDisplayed: false
        },
        signUpConfig: {
          hiddenDefaults: [
            'phone_number'
          ]
        }
      }
    }
  }
}
</script>
