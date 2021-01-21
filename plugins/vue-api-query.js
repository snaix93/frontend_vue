import { Model } from 'vue-api-query';

export default function ({ $axios }) {
  Model.$http = $axios;
}
