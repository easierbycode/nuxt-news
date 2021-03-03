export default {
  // provides a direct configuration bridge for the Vue.config
  vue: {
    config: {
      errorHandler: function(err, vm, info) {
        if (process.env.NODE_ENV !== 'production') {
          // show any error but this one
          if (err.message.indexOf("Cannot read property 'badInput' of undefined") === -1) {
            return console.error(err);
          } else {
            console.log(`!!! 'badInput' ERROR !!!`);
            return true;
          }
        }
      }
    }
  },

  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'nuxt-news',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons' }
    ]
  },

  // customize loading bar
  loading: { color: '#facd00', height: '10px' },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    { src: 'vue-material/dist/vue-material.min.css', lang: 'css' },
    { src: '~/assets/theme.scss', lang: 'scss' }

  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/vue-material' },
    { src: '~/plugins/axios' },
    { src: '~/plugins/firestore' }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/proxy'
  ],

  // Axios config - headers, etc
  axios: {
    credentials: true,
    proxy: true
  },
  proxy: {
    '/api/': {
      target: 'https://newsapi.org/v2/',
      pathRewrite: {
        '^/api/': ''
      }
    },
    '/register/': {
      target: 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDShrAeyOZW-5V0fCmT2B_sTWnW-mysSqg',
      pathRewrite: {
        '^/register/': ''
      }
    },
    '/login/': {
      target: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDShrAeyOZW-5V0fCmT2B_sTWnW-mysSqg',
      pathRewrite: {
        '^/login/': ''
      }
    }
  },

  // ENV variables
  env: {
    NEWS_API_KEY: '86b54e4c0b3a44e9a0143bf967524e4a'
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
