<template>
  <div>
    <v-btn
      :class="btnClass"
      :color="$attrs.color ? $attrs.color : 'white'"
      :disabled="$attrs.disabled || throttled"
      :loading="$attrs.loading"
      :outline="!!$attrs.outline"
      :small="!!$attrs.small"
      @click="execute"
    >
      <template v-if="throttled">
        {{ $t('message.general.tryAgainIn', { seconds: countdownToEnable }) }}
      </template>
      <template v-else>
        <slot/>
      </template>
    </v-btn>
  </div>
</template>

<script>
  export default {
    inheritAttrs: false,
    name: 'ThrottledButton',
    props: {
      urls: {
        type: [String, Array],
        required: false,
        default: '*',
      },
      throttleWaitPeriod: {
        type: Number,
        required: false,
        default: 60,
      },
      btnClass: {
        type: [Array, String],
        required: false,
        default: () => ([]),
      }
    },
    data() {
      return {
        interceptor: undefined,
        throttled: false,
        countdownToEnable: 0,
      };
    },
    created() {
      this.initInterceptor();
    },
    beforeDestroy() {
      this.$axios.interceptors.response.eject(this.interceptor);
    },
    methods: {
      initInterceptor() {
        if (this.interceptor) return;
        this.interceptor = this.$axios.interceptors.response.use(
          response => response,
          (error) => {
            const url = error?.response?.config?.url;
            const status = error?.response?.status === 429;
            if (url && status && this.isMatchingUrl(url) && ! this.throttled) {
              this.throttled = true;
              this.beginCountdown(error.response.headers?.['retry-after']);
            }

            return Promise.reject(error);
          }
        );
      },
      isMatchingUrl(url) {
        if (this.urls === '*') return true;
        url = url.replace(/^\/+/g, '');
        const urlPatterns = Array.isArray(this.urls) ? this.urls : [this.urls];
        return urlPatterns.some((urlPattern) => {
          urlPattern = urlPattern.replace(/^\/+/g, '');
          return url === urlPattern;
        });
      },
      beginCountdown(throttleWaitPeriod = null) {
        if (throttleWaitPeriod !== null) +throttleWaitPeriod++;
        this.countdownToEnable = throttleWaitPeriod ?? this.throttleWaitPeriod;
        const interval = setInterval(() => {
          this.countdownToEnable--;
          if (this.countdownToEnable === 0) {
            clearInterval(interval);
            this.throttled = false;
          }
        }, 1000);
      },
      execute() {
        this.$emit('click');
      }
    },
  };
</script>
