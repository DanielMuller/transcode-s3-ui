<template lang="pug">
  q-page(padding).bg-grey-4.row.justify-center
    q-amplify-authenticator.fit(:authConfig='authConfig' style="max-width:460px")
</template>

<script>
import * as Authenticator from 'components/authenticator'

export default {
  name: 'Auth',
  components: {
    Authenticator
  },
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
