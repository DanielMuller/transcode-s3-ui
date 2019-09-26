<template lang="pug">
  q-page(padding).row.justify-center
    file-list(path="out/")
</template>

<script>
import fileList from 'components/storage/FileList'
export default {
  name: 'PageIndex',
  components: {
    fileList
  }
}
</script>
