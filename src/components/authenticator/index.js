import Vue from 'vue'

import SignIn from './SignIn.vue'
// import SignUp from 'aws-amplify-vue/src/components/authenticator/SignUp.vue'
// import SignOut from 'aws-amplify-vue/src/components/authenticator/SignOut.vue'
// import ConfirmSignUp from 'aws-amplify-vue/src/components/authenticator/ConfirmSignUp.vue'
// import ConfirmSignIn from 'aws-amplify-vue/src/components/authenticator/ConfirmSignIn.vue'
// import ForgotPassword from 'aws-amplify-vue/src/components/authenticator/ForgotPassword.vue'
import Authenticator from './Authenticator.vue'
// import SetMfa from 'aws-amplify-vue/src/components/authenticator/SetMFA.vue'
// import RequireNewPassword from 'aws-amplify-vue/src/components/authenticator/RequireNewPassword.vue'

Vue.component('q-amplify-authenticator', Authenticator)
Vue.component('q-amplify-sign-in', SignIn)
// Vue.component('amplify-sign-up', SignUp)
// Vue.component('amplify-sign-out', SignOut)
// Vue.component('amplify-confirm-sign-up', ConfirmSignUp)
// Vue.component('amplify-confirm-sign-in', ConfirmSignIn)
// Vue.component('amplify-forgot-password', ForgotPassword)
// Vue.component('amplify-set-mfa', SetMfa)
// Vue.component('amplify-require-new-password', RequireNewPassword)

export {
  Authenticator,
  SignIn
  // SignUp,
  // SignOut,
  // ConfirmSignUp,
  // ConfirmSignIn,
  // ForgotPassword,
  // SetMfa,
  // RequireNewPassword
}
