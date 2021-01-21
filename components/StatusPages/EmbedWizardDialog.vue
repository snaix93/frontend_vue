<template>
  <v-dialog
    :value="dialog"
    lazy
    max-width="960px"
    persistent
    scrollable
  >
    <v-card
      v-if="dialog"
      ref="copyContainer"
      class="embed-status-badges-dialog"
    >
      <v-card-title class="py-2 grey lighten-3">
        <v-flex items-baseline>
          <span class="headline">
            {{ $t('statusPages.embedDialog.title') | capitalize }}:
          </span>
          <span class="ml-2 subheading">
            "{{ selectedStatusPage.title }}"
          </span>
        </v-flex>
        <v-spacer/>
        <v-btn
          icon
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider/>
      <v-card-text class="pa-0">
        <template>
          <v-layout
            mb-0
            mt-2
            pa-3
          >
            <v-flex
              class="body-1"
              xs12
            >
              <p v-html="$t('statusPages.embedDialog.intro')"/>
              <p
                class="caption font-italic"
                v-html="$t('statusPages.embedDialog.introNote')"
              />
            </v-flex>
          </v-layout>
          <v-divider/>
          <v-layout
            align-center
            wrap
          >
            <v-flex
              class="grey lighten-4 subheading"
              px-3
              py-2
              xs12
            >
              {{ $t('statusPages.embedDialog.liveBadge.title') | capitalize }}
            </v-flex>
          </v-layout>
          <v-divider/>
          <v-layout
            pa-3
            style="min-height: 130px;"
            wrap
          >
            <v-flex
              md6
              xs12
            >
              {{ $t('statusPages.embedDialog.liveBadge.intro') | capitalize }}
            </v-flex>
            <v-flex
              id="iframePlacementNode"
              class="text-md-right text-xs-center"
              md6
              xs12
            />
          </v-layout>
          <v-fade-transition>
            <v-divider v-show="panelIsOpen(IFRAME)"/>
          </v-fade-transition>
          <v-layout
            :class="{'grey lighten-5': panelIsOpen(IFRAME)}"
            align-baseline
            justify-space-between
            px-3
          >
            <v-flex>
              <v-btn
                class="ml-0"
                color="primary"
                small
                @click="copyEmbedCode(IFRAME)"
              >
                {{ $t('statusPages.embedDialog.copyEmbedCode') }}
              </v-btn>
              <v-btn
                small
                @click.stop="toggleCustomisePanel(IFRAME)"
              >
                {{ $t('statusPages.embedDialog.customizeBadge') }}
              </v-btn>
              <v-fade-transition>
                <v-btn
                  v-if="panelIsOpen(IFRAME)"
                  :title="$t('button.reset') | capitalize"
                  small
                  @click.stop="resetCustomisationSettings(IFRAME)"
                >
                  {{ $t('statusPages.embedDialog.reset') }}
                </v-btn>
              </v-fade-transition>
            </v-flex>
            <v-flex shrink>
              <v-select
                v-model="settings.iframe.forceState"
                :items="previewOptions"
                :label="$t('statusPages.embedDialog.preview')"
              />
            </v-flex>
          </v-layout>
          <v-expansion-panel
            v-model="iframeCustomisePanel"
            expand
          >
            <v-expansion-panel-content>
              <v-card>
                <v-card-text class="grey lighten-5">
                  <v-layout
                    v-if="settings.iframe.showText"
                    justify-space-between
                    wrap
                  >
                    <v-flex mr-3>
                      <v-text-field
                        v-model="settings.iframe.textSuccess"
                        :label="$options.filters.capitalize($t('statusPages.embedDialog.fullyOperationalText'))"
                        counter="35"
                      />
                    </v-flex>
                    <v-flex mr-3>
                      <v-text-field
                        v-model="settings.iframe.textWarning"
                        :label="$options.filters.capitalize($t('statusPages.embedDialog.operationalWithWarningsText'))"
                        counter="35"
                      />
                    </v-flex>
                    <v-flex mr-3>
                      <v-text-field
                        v-model="settings.iframe.textError"
                        :label="$options.filters.capitalize($t('statusPages.embedDialog.nonOperationalText'))"
                        counter="35"
                      />
                    </v-flex>
                  </v-layout>

                  <v-layout
                    justify-space-between
                    wrap
                  >
                    <v-flex mr-3>
                      <v-text-field
                        v-model="settings.iframe.width"
                        :label="$options.filters.capitalize($t('statusPages.embedDialog.width'))"
                      />
                    </v-flex>
                    <v-flex mr-3>
                      <v-text-field
                        v-model="settings.iframe.height"
                        :label="$options.filters.capitalize($t('statusPages.embedDialog.height'))"
                      />
                    </v-flex>
                    <v-flex
                      mr-3
                      shrink
                    >
                      <v-switch
                        v-model="settings.iframe.showIcon"
                        :label="$options.filters.capitalize($t('statusPages.embedDialog.showIcon'))"
                        @change="!settings.iframe.showIcon && !settings.iframe.showText ? settings.iframe.showText = true : null"
                      />
                    </v-flex>
                    <v-flex
                      mr-3
                      shrink
                    >
                      <v-switch
                        v-model="settings.iframe.showText"
                        :label="$options.filters.capitalize($t('statusPages.embedDialog.showText'))"
                        @change="!settings.iframe.showText && !settings.iframe.showIcon ? settings.iframe.showIcon = true : null"
                      />
                    </v-flex>
                  </v-layout>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </template>

        <v-divider/>

        <template>
          <v-layout
            align-center
            wrap
          >
            <v-flex
              class="grey lighten-4 subheading"
              px-3
              py-2
              xs12
            >
              {{ $t('statusPages.embedDialog.miniBadge.title') }}
            </v-flex>
          </v-layout>
          <v-divider/>
          <v-layout
            pa-3
            style="min-height: 130px;"
            wrap
          >
            <v-flex
              md6
              xs12
            >
              {{ $t('statusPages.embedDialog.miniBadge.intro') | capitalize }}
            </v-flex>
            <v-flex
              id="shieldPlacementNode"
              class="text-md-right text-xs-center"
              md6
              xs12
            />
          </v-layout>
          <v-fade-transition>
            <v-divider v-show="panelIsOpen(SHIELD)"/>
          </v-fade-transition>
          <v-layout
            :class="{'grey lighten-5': panelIsOpen(SHIELD)}"
            align-baseline
            justify-space-between
            px-3
          >
            <v-flex>
              <v-btn
                class="ml-0"
                color="primary"
                small
                @click="copyEmbedCode(SHIELD)"
              >
                {{ $t('statusPages.embedDialog.copyEmbedCode') }}
              </v-btn>
              <v-btn
                small
                @click.stop="toggleCustomisePanel(SHIELD)"
              >
                {{ $t('statusPages.embedDialog.customizeBadge') }}
              </v-btn>
              <v-fade-transition>
                <v-btn
                  v-if="panelIsOpen(SHIELD)"
                  :title="$t('button.reset') | capitalize"
                  small
                  @click.stop="resetCustomisationSettings(SHIELD)"
                >
                  {{ $t('statusPages.embedDialog.reset') }}
                </v-btn>
              </v-fade-transition>
            </v-flex>
            <v-flex shrink>
              <v-select
                v-model="settings.shield.forceState"
                :items="previewOptions"
                :label="$t('statusPages.embedDialog.preview')"
              />
            </v-flex>
          </v-layout>
          <v-expansion-panel
            v-model="shieldCustomisePanel"
            expand
          >
            <v-expansion-panel-content>
              <v-card>
                <v-card-text class="grey lighten-5">
                  <v-layout
                    justify-space-between
                    wrap
                  >
                    <v-flex mr-3>
                      <v-text-field
                        v-model="settings.shield.textSuccess"
                        :label="$options.filters.capitalize($t('statusPages.embedDialog.fullyOperationalText'))"
                        counter="25"
                      >
                        <template #append>
                          <v-icon
                            v-if="showColorPickers"
                            :color="settings.shield.colorSuccess"
                            @click="openColorPicker('success')"
                          >
                            color_lens
                          </v-icon>
                        </template>
                      </v-text-field>
                      <ColorPickerDialog
                        v-model="settings.shield.colorSuccess"
                        :dialog="colorPickerDialog.success"
                        @on-close="colorPickerDialog.success = false"
                      />
                    </v-flex>
                    <v-flex mr-3>
                      <v-text-field
                        v-model="settings.shield.textWarning"
                        :label="$options.filters.capitalize($t('statusPages.embedDialog.operationalWithWarningsText'))"
                        counter="25"
                      >
                        <template #append>
                          <v-icon
                            v-if="showColorPickers"
                            :color="settings.shield.colorWarning"
                            @click="openColorPicker('warning')"
                          >
                            color_lens
                          </v-icon>
                        </template>
                      </v-text-field>
                      <ColorPickerDialog
                        v-model="settings.shield.colorWarning"
                        :dialog="colorPickerDialog.warning"
                        @on-close="closeColorPicker('warning')"
                      />
                    </v-flex>
                    <v-flex mr-3>
                      <v-text-field
                        v-model="settings.shield.textError"
                        :label="$options.filters.capitalize($t('statusPages.embedDialog.nonOperationalText'))"
                        counter="25"
                      >
                        <template #append>
                          <v-icon
                            v-if="showColorPickers"
                            :color="settings.shield.colorError"
                            @click="openColorPicker('error')"
                          >
                            color_lens
                          </v-icon>
                        </template>
                      </v-text-field>
                      <ColorPickerDialog
                        v-model="settings.shield.colorError"
                        :dialog="colorPickerDialog.error"
                        @on-close="closeColorPicker('error')"
                      />
                    </v-flex>
                  </v-layout>

                  <v-layout
                    justify-space-between
                    wrap
                  >
                    <v-flex mr-3>
                      <v-text-field
                        v-model="settings.shield.label"
                        :label="$options.filters.capitalize($t('statusPages.embedDialog.leftSideLabel'))"
                        counter="25"
                      >
                        <template #append>
                          <v-icon
                            v-if="showColorPickers"
                            :color="settings.shield.labelColor"
                            @click="openColorPicker('label')"
                          >
                            color_lens
                          </v-icon>
                        </template>
                      </v-text-field>
                      <ColorPickerDialog
                        v-model="settings.shield.labelColor"
                        :dialog="colorPickerDialog.label"
                        @on-close="closeColorPicker('label')"
                      />
                    </v-flex>
                    <v-flex mr-3>
                      <v-select
                        v-model="settings.shield.style"
                        :items="shieldStyleOptions"
                        :label="$options.filters.capitalize($t('statusPages.embedDialog.badgeStyle'))"
                      />
                    </v-flex>
                  </v-layout>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </template>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          color="primary"
          flat
          @click="onCancel"
        >
          {{ $t('button.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import debounce from 'tiny-debounce';
  import { isEmpty, merge } from 'lodash-es';
  import AppMixin from '@/mixins/app';
  import ColorPickerDialog from '@/components/StatusPages/ColorPickerDialog';

  export default {
    components: { ColorPickerDialog },
    mixins: [AppMixin],
    data: () => ({
      savePermitted: true,
      iframeCustomisePanel: [false],
      shieldCustomisePanel: [false],
      previewOptions: [
        { text: 'Live', value: null },
        { text: 'Fully operational', value: 'success' },
        { text: 'Operational with warnings', value: 'warning' },
        { text: 'Non-operational', value: 'error' },
      ],
      shieldStyleOptions: [
        { text: 'Plastic', value: 'plastic' },
        { text: 'Flat', value: 'flat' },
        { text: 'Flat Square', value: 'flat-square' },
        { text: 'For the Badge', value: 'for-the-badge' },
        { text: 'Popout', value: 'popout' },
        { text: 'Popout Square', value: 'popout-square' },
        { text: 'Social', value: 'social' },
      ],
      colorPickerDialog: {
        success: false,
        warning: false,
        error: false,
        label: false,
      },
      settings: {
        iframe: {
          forceState: null, // defaults to live preview and is removed when copying embed code.
          textSuccess: 'All systems operational',
          textWarning: 'Systems operational with warnings',
          textError: 'Systems not operational',
          showIcon: true,
          showText: true,
          width: '350',
          height: '80',
        },
        shield: {
          forceState: null, // defaults to live preview and is removed when copying embed code.
          textSuccess: 'All OK',
          colorSuccess: '#4caf50',
          textWarning: 'OK With Warnings',
          colorWarning: '#ffa000',
          textError: 'Non-Operational',
          colorError: '#c62828',
          style: 'for-the-badge',
          label: 'System Status',
          labelColor: '#555555',
        },
      },
    }),
    computed: {
      ...mapState('statusPages', { dialog: 'embedCodeDialog' }),
      ...mapState('statusPages', ['selectedStatusPage']),
      token() {
        return this.selectedStatusPage.token;
      },
      storedSettings() {
        return this.selectedStatusPage.meta?.settings;
      },
      showColorPickers() {
        return ! ['social'].includes(this.settings.shield.style);
      },
    },
    watch: {
      settings: {
        handler: debounce(function () {
          this.persistSettings();
        }, 2000),
        deep: true,
      },
      'settings.iframe': {
        handler: debounce(function () {
          this.insertNode(this.IFRAME);
        }, 250),
        deep: true,
      },
      'settings.shield': {
        handler: debounce(function () {
          this.insertNode(this.SHIELD);
        }, 250),
        deep: true,
      },
      dialog(value) {
        if (value) {
          this.savePermitted = true;
          if (this.storedSettings) {
            merge(this.settings, this.storedSettings);
          }
          this.$nextTick(() => {
            this.insertNode(this.IFRAME);
            this.insertNode(this.SHIELD);
          });
        }
      },
    },
    created() {
      this.IFRAME = 'iframe';
      this.SHIELD = 'shield';

      this.settings.defaults = {
        iframe: { ...this.settings.iframe },
        shield: { ...this.settings.shield },
      };
    },
    methods: {
      ...mapActions('statusPages', ['updateStatusPage']),
      ...mapMutations('statusPages', ['toggleEmbedCodeDialog']),
      toggleCustomisePanel(badgeType) {
        return this[`${badgeType}CustomisePanel`] = [! this[`${badgeType}CustomisePanel`][0]];
      },
      resetCustomisationSettings(badgeType) {
        this.settings[badgeType] = { ...this.settings.defaults[badgeType] };
      },
      panelIsOpen(badgeType) {
        return !! this[`${badgeType}CustomisePanel`][0];
      },
      iframeEmbed(isCopyCmd = false) {
        const src = this.selectedStatusPage.url
          // .replace('https:', '')
          // .replace('dev.serverstate.info/', 'localhost:8082/')
                        .replace(`/${this.token}`, '/badge.min.js');

        const script = document.createElement('script');
        script.async = true;
        script.src = src;
        script.setAttribute('data-token', this.token);

        this.cleanSettings({ ...this.settings.iframe }, this.IFRAME, isCopyCmd)
            .filter(([key]) => ! (key.includes('text') && ! this.settings.iframe.showText))
            .forEach(([key, value]) => {
              key = key.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`);
              script.setAttribute(`data-${key}`, value);
            });
        return script.outerHTML;
      },
      cleanSettings(settings, badgeType, noForcedState) {
        return Object.entries(settings)
                     .filter(([key, value]) => ! (value === null
                                                  || value === this.settings.defaults[badgeType][key]
                                                  || (key === 'forceState' && noForcedState)));
      },
      shieldEmbed(isCopyCmd = false) {
        const encodeData = data => Object.keys(data)
                                         .filter(key => data[key] !== null)
                                         .map(key => [key, data[key]].map(encodeURIComponent)
                                                                     .join('='))
                                         .join('&');

        const settings = this.cleanSettings({ ...this.settings.shield }, this.SHIELD, isCopyCmd)
                             .filter(([key]) => ! (key.includes('color') && ! this.showColorPickers))
                             .reduce((accum, [k, v]) => (accum[k] = v, accum), {});
        const url = this.selectedStatusPage.url
                        .replace(`/${this.token}`,
                          `/backend/${this.token}/shield?${encodeData(settings)}`);

        const img = document.createElement('img');
        img.alt = this.settings.shield.label;
        img.src = `https://img.shields.io/endpoint.svg?${encodeData({ url })}`;
        const a = document.createElement('a');
        a.href = this.selectedStatusPage.url;
        a.target = '_blank';
        a.title = this.settings.shield.label;
        a.appendChild(img);
        return a.outerHTML;
      },
      copyEmbedCode(badgeType) {
        this.copyText(
          this[`${badgeType}Embed`](true),
          undefined,
          undefined,
          this.$refs.copyContainer.$el,
        );
      },
      insertNode(badgeType) {
        const html = this[`${badgeType}Embed`]();
        const fragment = document.createRange().createContextualFragment(html);
        const ele = document.getElementById(`${badgeType}PlacementNode`);
        if (ele) {
          ele.innerHTML = '';
          ele.appendChild(fragment);
        }
      },
      persistSettings() {
        if (! this.savePermitted) return;

        const settings = {
          [this.IFRAME]: this.cleanSettings({ ...this.settings[this.IFRAME] }, this.IFRAME, true)
                             .reduce((accum, [k, v]) => (accum[k] = v, accum), {}),
          [this.SHIELD]: this.cleanSettings({ ...this.settings[this.SHIELD] }, this.SHIELD, true)
                             .reduce((accum, [k, v]) => (accum[k] = v, accum), {}),
        };

        if (isEmpty(settings[this.IFRAME])) {
          delete settings[this.IFRAME];
        }
        if (isEmpty(settings[this.SHIELD])) {
          delete settings[this.SHIELD];
        }

        const StatusPage = this.selectedStatusPage;

        if (! isEmpty(settings)) {
          StatusPage.meta.settings = settings;
          this.updateStatusPage({ StatusPage });
        } else if (StatusPage.meta?.settings) {
          delete StatusPage.meta.settings;
          this.updateStatusPage({ StatusPage });
        }
      },
      openColorPicker(type) {
        Object.entries(this.colorPickerDialog).map(([key]) => this.colorPickerDialog[key] = false);
        this.colorPickerDialog[type] = true;
      },
      closeColorPicker(type) {
        this.colorPickerDialog[type] = false;
      },
      onCancel() {
        // final save before closing just in case debounce didn't trigger
        this.persistSettings();
        this.toggleEmbedCodeDialog();
        // need to reset settings back to the defaults without persisting state
        // the watcher will pick up the change and will trigger the persist method
        // but this flag will prevent that method from running. When dialog is
        // reopened the flag is toggled back to true.
        this.savePermitted = false;
        this.resetCustomisationSettings(this.IFRAME);
        this.resetCustomisationSettings(this.SHIELD);
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .embed-status-badges-dialog >>>
  .v-expansion-panel
    box-shadow none !important
</style>
