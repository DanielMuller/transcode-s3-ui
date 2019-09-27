# transcode-s3-ui

UI for [transcode-s3](https://github.com/DanielMuller/transcode-s3)

## Install
This UI depends on [transcode-s3](https://github.com/DanielMuller/transcode-s3), [AWS-amplify](https://aws-amplify.github.io/) and [Quasar](https://quasar.dev/)

```bash
npm install -g @aws-amplify/cli
npm install -g @quasar/cli
git clone https://github.com/DanielMuller/transcode-s3
cd transcode-s3
vi stages/production.yml # Keep the upload folder to auto/ and output to out/
npm i
npm run deploy
cd ..
git clone https://github.com/DanielMuller/transcode-s3-ui
cd transcode-s3-ui
cp -a src/storage.sample.js src/storage.js
cp -a amplify/backend/existingStorage/s34f31abc7/parameters.sample.json amplify/backend/existingStorage/s34f31abc7/parameters.json
cp -a amplify/backend/hosting/S3AndCloudFront/parameters.sample.json amplify/backend/hosting/S3AndCloudFront/parameters.json
vi src/storage.js # Adapt the Bucket name
vi amplify/backend/existingStorage/s34f31abc7/parameters.json # Adapt the Bucket name
vi amplify/backend/hosting/S3AndCloudFront/parameters.json # Adapt the hosting Bucket name
npm i
amplify init # Choose an existing environment: prod
amplify env checkout prod
amplify publish
```

Login to your AWS console and open Cognito User Pools in the same region as your deployment. Add a new user manually.

Edit the created Cloudfront distribution and add a CNAME.
