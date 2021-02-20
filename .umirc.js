// ref: https://umijs.org/config/
import { resolve } from 'path';

export default {
  treeShaking: true,
  history: 'hash',
  hash: true,
  routes: [
    {
      path: '/',
      component: '../layouts/BasicLayout',
      routes: [
        // { path: '/', redirect: '/scan' },
        { path: '/scan', component: '../pages/scanAndLogin/index' },
        { path: '/measurement', component: '../pages/measurement/index' },
        { path: '/result', component: '../pages/result/index' },
      ],
    },
  ],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: {
          webpackChunkName: true,
          loadingComponent: './components/Loader.js',
        },
        hd: true,
        fastClick: true,
        title: '自助血压测量(SBPM)',
        dll: true,
        locale: {
          enable: true,
          default: 'zh-CN', // en-US
        },
        routes: {
          exclude: [
            /models\//,
            /services\//,
            /model\.(t|j)sx?$/,
            /service\.(t|j)sx?$/,
            /components\//,
          ],
        },
        metas: [
          { charset: 'utf-8' },
          {
            name: 'viewport',
            content:
              'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no',
          },
        ],
        links: [{ rel: 'icon', href: '/favicon.png', type: 'image/x-icon' }],
        headScripts: [{ src: `<%= PUBLIC_PATH %>config.js?timestamp=${new Date().getTime()}` }],
      },
    ],
  ],
  theme: {
    '@brand-primary': '#1DA57A',
    '@brand-primary-tap': '#00C982',
  },
  alias: {
    '@': resolve(__dirname, './src'),
  },
  proxy: {
    '/api': {
      target: 'http://192.168.16.102:9988/',
      changeOrigin: false,
      // pathRewrite: { '^/api': '' },
    },
  },
};
