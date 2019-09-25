<template lang="pug">
  q-card.fit(style="max-width:460px")
    q-card-section.text-h6 {{options.header}}
    q-card-section(@dragover="__onDragOver" @dragenter="__onDragEnter" @dragleave="__onDragLeave" @drop="__onDrop" @click="pickFile")
      input.filePicker__input(ref="filePickerInput" type="file" title="" @change="pick" :accept="options.accept")
      div.rounded-borders.filePicker__active(v-if="!file")
        q-icon.fit(name="cloud_upload" style="font-size: 6em")
      q-list(v-if="file")
        q-item(dense)
          q-item-section.cursor-pointer(v-if="file.__status=='uploaded'" avatar @click="completeFileUpload")
            q-icon(name="check" color="positive")
          q-item-section
            q-item-label.full-width.ellipsis {{ file.name }}
            q-item-label.ellipsis(caption) {{ s3ImagePath }}
            q-item-label.q-pt-sm(caption) {{ getSizeLabel(file.__uploaded) }}/{{ getSizeLabel(file.size) }} ({{ getProgressLabel(file.__progress) }})
            q-item-label
              q-linear-progress(
                size="md"
                :value="file.__progress"
                color="primary"
              )
      q-banner.bg-negative.text-white(v-if="error") {{error}}
    q-card-actions(align="right")
      q-btn(v-if="file && !uploadDisabled" :label="options.title" color="primary" @click="upload" :disabled="uploadDisabled")
</template>

<script>
import { stopAndPrevent } from 'quasar/src/utils/event.js'
import { format } from 'quasar'
import S3 from 'aws-sdk/clients/s3'
const { humanStorageSize } = format
import storage from '../../storage.js'

export default {
  name: 'FilePicker',
  props: ['filePickerConfig'],
  data () {
    return {
      file: null,
      s3ImagePath: '',
      error: '',
      editable: true,
      credentials: null,
      prefix: null,
      uploadDisabled: true,
      clearClick: false
    }
  },
  mounted () {
    if (!this.options.path) {
      return this.setError('File path not provided.')
    }
    if (this.options.path.substr(this.options.path.length - 1) !== '/') {
      this.options.path = this.options.path + '/'
    }
    this.$Auth.currentCredentials()
      .then(credentials => {
        this.credentials = this.$Auth.essentialCredentials(credentials)
      })
  },
  computed: {
    options () {
      const defaults = {
        header: this.$Amplify.I18n.get('File Upload'),
        title: this.$Amplify.I18n.get('Upload'),
        accept: '*/*',
        storageOptions: {}
      }
      return Object.assign(defaults, this.filePickerConfig || {})
    }
  },
  methods: {
    pickFile (e) {
      if (this.clearClick) {
        this.clearClick = false
        return
      }
      if (this.editable) {
        const input = this.__getFileInput()
        input && input.click(e)
      }
    },
    __getFileInput () {
      return this.$refs.filePickerInput ||
        this.$el.getElementsByClassName('filePicker__input')[0]
    },
    __onDragEnter (e) {
      const el = this.$el.getElementsByClassName('filePicker__active')[0]
      el.classList.add('filePicker__hover')
      stopAndPrevent(e)
    },
    __onDragOver (e) {
      const el = this.$el.getElementsByClassName('filePicker__active')[0]
      el.classList.add('filePicker__hover')
      stopAndPrevent(e)
    },
    __onDragLeave (e) {
      const el = this.$el.getElementsByClassName('filePicker__active')[0]
      el.classList.remove('filePicker__hover')
      stopAndPrevent(e)
    },
    __onDrop (e) {
      stopAndPrevent(e)
      let files = e.dataTransfer.files

      if (files.length > 0) {
        this.pick(null, files)
      }
    },
    __updateFile (file, status, uploadedSize) {
      file.__status = status

      if (status === 'idle') {
        file.__uploaded = 0
        file.__progress = 0
        return
      }
      if (status === 'failed') {
        this.$forceUpdate()
        return
      }

      file.__uploaded = status === 'uploaded'
        ? file.size
        : uploadedSize

      file.__progress = status === 'uploaded'
        ? 1
        : Math.min(0.9999, file.__uploaded / file.size)
      this.$forceUpdate()
    },
    upload: function () {
      this.uploadDisabled = true
      const s3 = new S3({ credentials: this.credentials, useAccelerateEndpoint: storage.useAccelerateEndpoint })

      let options = null
      const uploader = s3.upload({
        Bucket: storage.bucket,
        Key: this.s3ImagePath,
        Body: this.file,
        ContentType: this.file.type
      },
      options)
      uploader.on('httpUploadProgress', e => {
        let uploaded = e.loaded > this.file.size
        if (uploaded) {
          this.__updateFile(this.file, 'uploading', this.file.size)
        } else {
          this.__updateFile(this.file, 'uploading', e.loaded)
        }
      })
      this.__updateFile(this.file, 'uploading', 0)
      this.file.uploader = uploader
      this.file.__abort = uploader.abort.bind(uploader)

      this.$emit('uploading', { file: this.file, uploader })

      uploader.send((err, data) => {
        if (err) {
          this.$Logger.error(err.message)
          this.__updateFile(this.file, 'failed')
          this.$emit('failed', { file: this.file, uploader })
        } else {
          this.__updateFile(this.file, 'uploaded')
          this.$emit('uploaded', { file: this.file, uploader })
          this.$AmplifyEventBus.$emit('fileUpload', data.Key)
        }
      })
    },
    pick: function (evt, file) {
      if (evt) {
        this.file = evt.target.files[0]
      } else {
        this.file = file[0]
      }
      if (!this.file) { return }
      if (!this.options.storageOptions.contentType) {
        this.options.storageOptions.contentType = this.file.type
      }
      const name = this.options.defaultName ? this.options.defaultName : this.file.name
      this.s3ImagePath = `${this.options.path}${name}`
      this.file.__progress = 0
      this.file.__uploaded = 0
      this.file.__status = 'idle'
      this.uploadDisabled = false
    },
    completeFileUpload: function () {
      this.clearClick = true
      this.file = null
      this.s3ImageFile = null
      this.$refs.filePickerInput.value = null
    },
    setError: function (e) {
      this.error = this.$Amplify.I18n.get(e.message || e)
    },
    getSizeLabel (size) {
      size = size || 0
      return humanStorageSize(size)
    },
    getProgressLabel (p) {
      p = p || 0
      return (p * 100).toFixed(2) + '%'
    }
  }
}
</script>
<style lang="sass" scoped>
  .filePicker
    &__input
      opacity: 0
      width: 100%
      height: 100%
      cursor: pointer !important
    &__active
      margin-left: 1em
      margin-right: 1em
      border: 1px
      border-style: dashed
      border-color: $grey-7
      color: $grey-7
    &__hover
      border-color: $primary
      color: $primary

</style>
