<template lang="pug">
  .fit(style="max-width:460px")
    div(v-if="fileList.length>0")
      .text-right
        q-btn(ref="refresh" size="12px" icon="refresh" flat dense round @click="fetchKeys")
      q-list.fit(bordered separator)
        q-item(v-for="file in fileList" :key="file.Key")
          q-item-section
            q-item-label(overline) {{file.dimensions}}
            q-item-label {{file.displayName}}
            q-item-label(caption) {{file.sizeLabel}} {{file.source}}
            q-item-label(caption) {{file.modDate}}
          q-item-section(side top)
            .column.text-grey-8.q-gutter-xs
              q-btn.col(size="12px" icon="play_circle_outline" flat dense round @click="playSrc=signedUrl(file)")
              q-btn.col(type="a" :href="signedUrl(file, true)" size="12px" icon="cloud_download" flat dense round)
              q-btn.col(size="12px" icon="delete" flat dense round @click="confirmDelete(file)")
      .fullscreen.bg-grey-10(v-if="playSrc")
        q-video.fit(:src="playSrc")
        q-btn.absolute-top-right(flat dense round color="white" icon="close" @click="playSrc=null")
    div.flex.flex-center(v-else)
      img(alt="Transcode S3 logo" src="~assets/transcode-s3-full.svg")
</template>
<script>
import S3 from 'aws-sdk/clients/s3'
import { format, date } from 'quasar'
const { humanStorageSize } = format
import storage from '../../storage.js'
const path = require('path')

export default {
  name: 'FileList',
  props: ['fileListConfig'],
  data () {
    return {
      fileList: [],
      s3: null,
      playSrc: null,
      userId: null
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
        this.userId = credentials.identityId
        this.s3 = new S3({ credentials: this.credentials })
        this.fetchKeys()
      })
  },
  computed: {
    options () {
      const defaults = {
        path: 'out/',
        storageOptions: {
          maxKeys: 1000
        }
      }
      return Object.assign(defaults, this.filePickerConfig || {})
    },
    userIdPath () {
      let path = this.userId
      if (this.userId.substr(this.userId.length - 1) !== '/') {
        path = this.userId + '/'
      }
      return path
    }
  },
  methods: {
    delete (file) {
      let params = {
        Bucket: storage.bucket,
        Key: file.Key
      }
      this.s3.deleteObject(params).promise().then(res => {
        this.fileList = this.fileList.filter(val => {
          return val.Key !== file.Key
        })
      }).catch(err => {
        this.$Logger.error(err)
      })
    },
    listAllKeys (params, out = []) {
      return new Promise((resolve, reject) => {
        this.s3.listObjectsV2(params).promise()
          .then(({ Contents, IsTruncated, NextContinuationToken }) => {
            out.push(...Contents)
            !IsTruncated ? resolve(out) : resolve(this.listAllKeys(Object.assign(params, { ContinuationToken: NextContinuationToken }), out))
          })
          .catch(reject)
      })
    },
    signedUrl (file, download) {
      let params = {
        Bucket: storage.bucket,
        Key: file.Key,
        Expires: 20
      }
      if (download) {
        let filename = path.basename(file.Key)
        params.ResponseContentDisposition = 'attachment; filename="' + filename + '"'
      }
      return this.s3.getSignedUrl('getObject', params)
    },
    fetchKeys () {
      let prefix = `${this.options.path}${this.userIdPath}`
      let params = {
        Bucket: storage.bucket,
        MaxKeys: this.options.storageOptions.maxKeys,
        Prefix: prefix
      }
      return this.listAllKeys(params).then(res => {
        res.forEach(item => {
          item.displayName = item.Key.replace(prefix, '')
          item.source = item.displayName.split('/')[0]
          item.sizeLabel = humanStorageSize(item.Size)
          item.dimensions = item.displayName.match(/.*-(\d+p)\.mp4/)[1]
          item.modDate = date.formatDate(item.LastModified, 'YYYY-MM-DD HH:mm:ss Z')
        })
        this.fileList = res.sort((a, b) => (a.source > b.source) ? 1 : (a.source === b.source) ? ((a.Size < b.Size) ? 1 : -1) : -1)
      })
    },
    confirmDelete (file) {
      this.$q.dialog({
        title: 'Delete Confirmation',
        message: 'Do you want to delete ' + file.displayName + ' ?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.delete(file)
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }
  }
}
</script>
