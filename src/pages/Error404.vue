<template lang="pug">
  .fixed-center.text-center
    p
      img(
        src="~assets/sad.svg"
        style="width:30vw;max-width:150px;"
      )
    p.text-faded Sorry, nothing here...<strong>(404)</strong>
    q-btn(
      color="secondary"
      style="width:200px;"
      @click="$router.push('/')"
    ) Go back
</template>

<script>
export default {
  name: 'Error404'
}
</script>
