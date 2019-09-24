<template lang="pug">
  div
    q-amplify-sign-in(v-if="displayMap.showSignIn" :signInConfig="options.signInConfig" :usernameAttributes="options.usernameAttributes")
    amplify-sign-up(v-if="displayMap.showSignUp" :signUpConfig="options.signUpConfig" :usernameAttributes="options.usernameAttributes")
    amplify-confirm-sign-up(v-if="displayMap.showConfirmSignUp" :confirmSignUpConfig="options.confirmSignUpConfig" :usernameAttributes="options.usernameAttributes")
    amplify-confirm-sign-in(v-if="displayMap.showConfirmSignIn" :confirmSignInConfig="options.confirmSignInConfig")
    amplify-forgot-password(v-if="displayMap.showForgotPassword" :forgotPasswordConfig="options.forgotPasswordConfig" :usernameAttributes="options.usernameAttributes")
    amplify-require-new-password(v-if="displayMap.requireNewPassword" :requireNewPasswordConfig="options.requireNewPasswordConfig")
    amplify-set-mfa(v-if="displayMap.showMfa" :mfaConfig="options.mfaConfig")
</template>
<script>

import GetUser from 'aws-amplify-vue/src/services/getUser'
export default {
  name: 'Authenticator',
  props: ['authConfig'],
  data () {
    return {
      user: {
        username: null
      },
      displayMap: {},
      error: ''
    }
  },
  mounted () {
    this.$AmplifyEventBus.$on('localUser', user => {
      this.user = user
      this.options.signInConfig.username = this.user.username
      this.options.confirmSignInConfig.user = this.user
      this.options.confirmSignUpConfig.username = this.user.username
      this.options.requireNewPasswordConfig.user = this.user
    })
    this.$AmplifyEventBus.$on('authState', data => {
      this.displayMap = this.updateDisplayMap(data)
    })
    GetUser(this.$Amplify).then((val) => {
      if (val instanceof Error) {
        this.displayMap = this.updateDisplayMap('signedOut')
        return
      }
      this.user = val
      this.displayMap = this.updateDisplayMap('signedIn')
    })
      .catch(e => this.setError(e))
  },
  computed: {
    options () {
      const defaults = {
        signInConfig: {},
        signUpConfig: {},
        confirmSignUpConfig: {},
        confirmSignInConfig: {},
        forgotPasswordConfig: {},
        mfaConfig: {},
        requireNewPasswordConfig: {},
        usernameAttributes: 'username'
      }
      return Object.assign(defaults, this.authConfig || {})
    }
  },
  methods: {
    updateDisplayMap: state => {
      return {
        showSignIn: state === 'signedOut' || state === 'signIn',
        showSignUp: state === 'signUp',
        showConfirmSignUp: state === 'confirmSignUp',
        showConfirmSignIn: state === 'confirmSignIn',
        showForgotPassword: state === 'forgotPassword',
        showSignOut: state === 'signedIn',
        showMfa: state === 'setMfa',
        requireNewPassword: state === 'requireNewPassword'
      }
    }
  }
}
</script>
