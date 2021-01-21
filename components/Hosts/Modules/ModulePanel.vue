<template>
  <v-expansion-panel-content
    :disabled="!!disabled"
    :hideActions="!isArr && !isObj"
  >
    <template #header>
      <v-layout row wrap>
        <v-flex
          sm12
          md4
          lg3
          v-if="!hideTitle"
        >
          <span class="caption font-weight-bold">
            <slot name="title"></slot>
            <template v-if="!!isArr || !!isObj">
              ({{ itemCount }})
            </template>
          </span>
        </v-flex>
        <v-flex
          sm12
          md8
          lg9
        >
          <span class="font-monospace">
            <slot name="description">
              <template v-if="!!isArr || !!isObj">
                <span class="grey--text text--darken-1">
                  [{{ $t('host.modules.expandToShowMore') }}]
                </span>
              </template>
              <template v-else>
                {{ value }}
              </template>
            </slot>
          </span>
        </v-flex>
      </v-layout>
    </template>
    <div
      v-if="!!isArr || !!isObj"
      class="pa-4 grey lighten-3"
    >
      <v-expansion-panel
        expand
      >
        <template v-if="!!isArr">
          <ModulePanel
            :value="keyValue.value"
            hide-title
            v-for="(keyValue, i) in arrToKeyValue"
            :key="`keyValue-${i}`"
          />
        </template>
        <template v-else-if="!!isObj">
          <ModulePanel
            :value="keyValue.value"
            v-for="(keyValue, i) in objToKeyValue"
            :key="`keyValue-${i}`"
          >
            <template v-slot:title>
              {{ keyValue.key }}
            </template>
          </ModulePanel>
        </template>
      </v-expansion-panel>
    </div>

  </v-expansion-panel-content>
</template>
<script>
  export default {
    name: 'ModulePanel',
    props: {
      value: {
        required: true,
      },
      hideTitle: {
        type: Boolean,
        required: false,
        default: false,
      },
      disabled: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    computed: {
      isObj() {
        return typeof this.value === 'object';
      },
      isArr() {
        return Array.isArray(this.value);
      },
      objToKeyValue() {
        const result = [];

        if(!!this.isObj) {
          Object.keys(this.value).forEach((key) => {
            result.push({
              key,
              value: this.value[key]
            });
          });
        }

        return result;
      },
      arrToKeyValue() {
        const result = [];

        if(!!this.isArr) {
          this.value.forEach((item) => {
            result.push({
              value: item
            });
          })
        }

        return result;
      },
      itemCount() {
        let result = 0;

        if(!!this.isArr)
          result = this.value.length;

        if(!!this.isObj)
          result = Object.keys(this.value).length;

        return result;
      }
    }
  }
</script>
<style lang="stylus" scoped>
  .v-expansion-panel__container--disabled .v-expansion-panel__header
    opacity: 1
</style>
