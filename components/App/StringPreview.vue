<template>
  <v-tooltip
    bottom
    class="string-preview"
    max-width="350px"
  >
    <span
      slot="activator"
      :style="'max-width: ' + cutOff"
      class="d-inline-block text-no-wrap text-truncate"
      v-html="truncatable"
    />
    <div class="string-preview-full" v-html="value"/>
  </v-tooltip>
</template>

<script>
  export default {
    props: {
      value: {
        type: String,
        required: true,
      },
      cutOff: {
        type: String,
        required: true,
        default: '100%',
      },
      cutOffCharacters: {
        type: [Number, Boolean],
        required: false,
        default: false,
      }
    },
    data() {
      return {
        showFull: false,
      };
    },
    computed: {
      truncatable() {
        if (! this.cutOffCharacters || ! this.value.includes('data-truncate')) {
          return this.value;
        }

        const result = this.value.replace(/(<([^>]+)>)/ig, '');
        if (result.length <= this.cutOffCharacters) {
          return this.value;
        }

        const matches = this.value.match(/<span.*>(.*?)<\/span>/i);
        if (! matches) {
          return this.value;
        }

        let trimOffCount = result.length - this.cutOffCharacters;
        let stringToTrim = matches[1];
        let stringToTrimLength = stringToTrim.length;

        const separator = '...';
        let sepLen = separator.length;
        let charsToShow = stringToTrimLength - sepLen - trimOffCount;
        charsToShow = charsToShow > 4 ? charsToShow : 4;
        let frontChars = Math.ceil(charsToShow / 2);
        let backChars = Math.floor(charsToShow / 2);

        let string = stringToTrim.substr(0, frontChars) +
                     separator +
                     stringToTrim.substr(stringToTrimLength - backChars);

        return this.value.replace(new RegExp(`${stringToTrim}`), string);
      }
    },
  };
</script>

<style lang="stylus" scoped>
  .string-preview
    cursor: default
</style>
