<template lang="pug">
  q-card
    q-card-section
      .text-center
        q-avatar.q-mb-sm(size="80px" font-size="52px" color="primary" text-color="white" icon="lock")
      .text-h6 {{options.header}}
    q-card-section.q-gutter-sm
      q-input(outlined autofocus v-model="username" :label="$Amplify.I18n.get(getUsernameLabel())" :placeholder="$Amplify.I18n.get(`Enter your ${getUsernameLabel()}`)")
      q-input(outlined type="password" v-model="password" :label="$Amplify.I18n.get('Password')" :placeholder="$Amplify.I18n.get('Enter your password')" @keyup.enter="signIn")
      q-banner.bg-negative.text-white(v-if="error") {{error}}
    q-card-actions(align="left")
      q-btn.btn-fixed-width(v-if="options.isSignUpDisplayed" v-ripple @click="signUp" :label="$Amplify.I18n.get('No account? ')" color="secondary" no-caps)
      q-btn.btn-fixed-width(v-ripple @click="forgot" :label="$Amplify.I18n.get('Forget your password? ')" color="secondary" no-caps)
    q-card-actions(align="right")
      q-btn.btn-fixed-width(v-ripple @click="signIn" :label="$Amplify.I18n.get('Sign In')" color="primary")
</template>
<script>
import { labelMap } from 'aws-amplify-vue/src/components/authenticator/common'
export default {
  name: 'SignIn',
  props: ['signInConfig', 'usernameAttributes'],
  data () {
    return {
      username: '',
      password: '',
      error: '',
      logger: {},
      labelMap: {
        email: 'Email',
        phone_number: 'Phone Number',
        username: 'Username'
      }
    }
  },
  computed: {
    options () {
      const defaults = {
        header: this.$Amplify.I18n.get('Sign in to your account'),
        username: '',
        isSignUpDisplayed: true
      }
      return Object.assign(defaults, this.signInConfig || {})
    }
  },
  methods: {
    getUsernameLabel () {
      return labelMap[this.usernameAttributes] || this.usernameAttributes
    },
    signIn (event) {
      this.$Auth.signIn(this.username, this.password)
        .then(data => {
          this.$Logger.info('sign in success')
          if (data.challengeName === 'SMS_MFA' || data.challengeName === 'SOFTWARE_TOKEN_MFA') {
            this.$AmplifyEventBus.$emit('localUser', data)
            return this.$AmplifyEventBus.$emit('authState', 'confirmSignIn')
          } else if (data.challengeName === 'NEW_PASSWORD_REQUIRED') {
            this.$AmplifyEventBus.$emit('localUser', data)
            return this.$AmplifyEventBus.$emit('authState', 'requireNewPassword')
          } else if (data.challengeName === 'MFA_SETUP') {
            this.$AmplifyEventBus.$emit('localUser', data)
            return this.$AmplifyEventBus.$emit('authState', 'setMfa')
          } else if (data.challengeName === 'CUSTOM_CHALLENGE' &&
            data.challengeParam &&
            data.challengeParam.trigger === 'true'
          ) {
            this.$AmplifyEventBus.$emit('localUser', data)
            return this.$AmplifyEventBus.$emit('authState', 'customConfirmSignIn')
          } else {
            return this.$AmplifyEventBus.$emit('authState', 'signedIn')
          }
        })
        .catch((e) => {
          if (e.code && e.code === 'UserNotConfirmedException') {
            this.$AmplifyEventBus.$emit('localUser', { username: this.username })
            this.$AmplifyEventBus.$emit('authState', 'confirmSignUp')
          } else {
            this.setError(e)
          }
        })
    },
    signUp () {
      this.$AmplifyEventBus.$emit('authState', 'signUp')
    },
    forgot () {
      this.$AmplifyEventBus.$emit('authState', 'forgotPassword')
    },
    setError: function (e) {
      this.error = this.$Amplify.I18n.get(e.message || e)
      this.$Logger.error(this.error)
    }
  }
}
</script>
  <style lang="sass" scoped>
  .btn-fixed-width
    min-width: 100px
  </style>
