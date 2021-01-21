<template>
  <div ref="copyContainer">
    <template v-if="snippets">
      <v-layout
        align-center
        wrap
      >
        <v-flex
          md6
          sm10
          xs12
        >
          <v-alert
            :value="$vuetify.breakpoint.xs"
            class="mb-2"
            outline
            type="info"
          >
            {{ $t('install.biggerScreenHint') }}
          </v-alert>

          <v-select
            :items="snippets"
            :label="$t('form.field.chooseOperatingSystem') | capitalize"
            :value="value"
            item-text="display"
            item-value="id"
            return-object
            @input="onSelect"
          >
            <template #item="data">
              {{ data.item.display }}
              <v-spacer/>
              <div v-if="hasHelpVideo(data.item)">
                <PlayVideoButton
                  :duration="getVideo(data.item).duration"
                  :video="getVideo(data.item).id"
                />
              </div>
            </template>
          </v-select>
        </v-flex>

        <v-flex
          md6
          xs2
        >
          <div v-if="value && hasHelpVideo(value)">
            <PlayVideoButton
              :duration="getVideo(value).duration"
              :video="getVideo(value).id"
              icon
            />
          </div>
        </v-flex>
      </v-layout>

      <template v-if="value">
        <v-layout
          class="mt-3"
          row
        >
          <v-flex xs12>
            <p
              v-if="isManualMethod()"
              class="mb-2"
            >
              {{ $t('install.manualHint1') }}
              <a
                :href="kbUrl"
                target="_blank"
              >{{ $t('phrase.knowledgeBase') }}</a>
              {{ $t('install.manualHint2') }}
            </p>

            <p v-html="value.text"/>

            <template v-if="!isWindowsBrowserMethod()">
              <kbd class="code-display">{{ value.code }}</kbd>
              <div class="text-md-right">
                <v-btn
                  class="mx-0"
                  color="primary"
                  @click="copyCode(value.code)"
                >
                  {{ $t('button.copyToClipboard') }}
                  <v-icon
                    dark
                    right
                  >
                    file_copy
                  </v-icon>
                </v-btn>
              </div>
            </template>

            <div
              v-if="!!isWindowsBrowserMethod() || !!isManualMethod()"
              :class="{'mt-4' : !!isManualMethod()}"
            >
              <p
                v-if="isManualMethod()"
                class="mb-2"
              >
                {{ $t('install.manualHint3') }}
              </p>
              <v-card class="grey lighten-2">
                <v-card-text class="pt-4 pb-1">
                  <v-layout
                    v-for="item in windowsBrowserMethod"
                    :key="item.key"
                    align-top
                    row
                    wrap
                  >
                    <v-flex
                      md2
                      sm3
                      xs12
                    >
                      <v-subheader>{{ item.key }}</v-subheader>
                    </v-flex>
                    <v-flex
                      md8
                      sm9
                      xs12
                    >
                      <v-text-field
                        :value="item.data"
                        readonly
                        solo
                        @click="clickToCopy(item, $event)"
                      >
                        <template #append>
                          <v-tooltip top>
                            <v-btn
                              slot="activator"
                              class="mx-0"
                              color="primary"
                              flat
                              icon
                              @click="copyCode(item.data)"
                            >
                              <v-icon>file_copy</v-icon>
                            </v-btn>
                            {{ $t('button.copyToClipboard') }}
                          </v-tooltip>
                        </template>
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                </v-card-text>
              </v-card>
            </div>
          </v-flex>
        </v-layout>
      </template>
    </template>
    <template v-else>
      <div class="text-xs-center mt-2 mb-2">
        <v-progress-circular
          :size="18"
          color="primary"
          indeterminate
        />
      </div>
    </template>
  </div>
</template>

<script>
  import PlayVideoButton from '@/components/Videos/PlayVideoButton';
  import appMixins from '@/mixins/app';

  export default {
    components: {
      PlayVideoButton,
    },
    mixins: [appMixins],
    props: {
      value: {
        required: true,
      },
      snippets: {
        type: Array,
        required: true,
      },
      installEntity: {
        type: String,
        required: true,
      },
      parentEntity: {
        type: String,
        required: true,
      },
      kbUri: {
        type: String,
      },
    },
    data() {
      return {
        /**
         * Vimeo IDs
         */
        helpVideos: {
          cagent: {
            // windows_via_shell: '',
            windows_via_browser: {
              id: '316390476',
              duration: '0m 39s',
            },
            linux_ubuntu: {
              id: '318181183',
              duration: '0m 58s',
            },
            linux_centos: {
              id: '318181183',
              duration: '0m 58s',
            },
            // other_manual: '',
          },
          frontman: {
            // windows_via_shell: '',
            windows_via_browser: {
              id: '326617353',
              duration: '1m 18s',
            },
            // linux_ubuntu: '',
            // linux_centos: '',
            // other_manual: '',
          },
        },
      };
    },
    computed: {
      isCagentInstall() {
        return this.installEntity === 'cagent';
      },
      windowsBrowserMethod() {
        return this.parseCodeForWindowsBrowserMethod(this.value.code);
      },
      kbUrl() {
        return this.app_knowledgeBaseUrl + this.kbUri;
      },
    },
    methods: {
      onSelect(e) {
        this.$emit('input', e);
      },
      isWindows() {
        if (! this.value) {
          return false;
        }

        return this.value.display.toLowerCase().indexOf('windows') !== -1;
      },
      isWindowsBrowserMethod() {
        return this.value.key === 'windows_via_browser';
      },
      isManualMethod() {
        return this.value.key === 'other_manual';
      },
      hasHelpVideo(value) {
        return !! this.getVideo(value);
      },
      getVideo({ key }) {
        return this.helpVideos[this.installEntity][key];
      },
      clickToCopy({ data }, { target }) {
        if (! target.getAttribute('data-selected')) {
          target.setAttribute('data-selected', true);
          target.focus();
          target.select();
          this.copyCode(data);
        }
      },
      copyCode(code) {
        this.copyText(code,
          this.$t('message.success.installCodeCopy'),
          null,
          this.$refs.copyContainer);
      },
      parseCodeForWindowsBrowserMethod(code) {
        const params = {};
        code.split(/\r?\n/).forEach((item) => {
          if (item) {
            const data = item.split(/=/);
            const key = data[0].replace('_', ' ');
            const value = data[1].replace(/"/g, '').trim();

            params[key.split(/\s/)[1]] = {
              key: key.toUpperCase(),
              data: value,
            };
          }
        });

        return params;
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .code-display
    width: 100%
    padding: 15px
    font-size: 14px

    &:before
      content: none
</style>
