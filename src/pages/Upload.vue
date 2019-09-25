<template lang="pug">
  q-page(padding).row.justify-center
    file-picker(:filePickerConfig="filePickerConfig")
</template>

<script>
import FilePicker from 'components/storage/FilePicker'
export default {
  name: 'Upload',
  components: {
    FilePicker
  },
  data () {
    return {
      filePickerConfig: {
        path: 'auto/',
        accept: 'video/*'
      }
    }
  }
}
</script>
