<template>
  <div v-if="requiresInstallation">
    <v-hover>
      <template #default="{ hover }">
        <v-expansion-panel
          :class="[`elevation-${hover ? 4 : 2}`]"
          :value="[openPanel]"
          class="mb-4"
          expand
          @input="fixExpansionPanelState"
        >
          <v-expansion-panel-content>
            <template #header>
              <v-layout
                align-center
                justify-start
                ma-0
                pa-0
              >
                <v-flex
                  ma-0
                  pa-0
                  shrink
                >
                  <v-layout
                    align-center
                    class="side-bar"
                    justify-center
                    ma-0
                    pa-0
                  >
                    <v-progress-circular
                      v-if="!renderingComplete"
                      color="primary"
                      indeterminate
                    />
                    <v-avatar
                      v-else-if="!allComplete"
                      color="warning"
                      size="55"
                    >
                      <v-icon dark>
                        fas fa-wrench
                      </v-icon>
                    </v-avatar>
                    <v-avatar
                      v-else
                      color="success"
                      size="55"
                    >
                      <v-icon dark>
                        far fa-hourglass
                      </v-icon>
                    </v-avatar>
                  </v-layout>
                </v-flex>
                <v-flex
                  v-if="!allComplete"
                  class="border-left"
                  pl-4
                  py-3
                >
                  <div class="font-weight-bold title mb-2">
                    {{ $t('hostSetupGuide.incomplete.title') | titlecase }}
                  </div>
                  <div>
                    {{ $t('hostSetupGuide.incomplete.text', { toBeInstalledString }) | capitalize }}
                  </div>
                  <div class="mt-2 font-italic caption">
                    {{ $t('hostSetupGuide.incomplete.footer') | capitalize }}
                  </div>
                </v-flex>
                <v-flex
                  v-else
                  class="border-left"
                  pl-4
                  py-3
                >
                  <div class="font-weight-bold title mb-2">
                    {{ $t('hostSetupGuide.complete.title') | titlecase }}
                  </div>
                  <div>
                    {{ $t('hostSetupGuide.complete.text') | capitalize }}
                  </div>
                  <div class="mt-2 font-italic caption">
                    {{ $t('hostSetupGuide.complete.footer') | capitalize }}
                  </div>
                </v-flex>
              </v-layout>
            </template>
            <v-divider/>
            <v-stepper
              :value="stepper"
              class="default-stepper elevation-0"
              vertical
            >
              <template v-for="(todo, key, index) in setupData">
                <v-stepper-step
                  :class="{ complete: todo.complete, skipped: todo.skipped }"
                  :complete="todo.complete"
                  :step="++index"
                  edit-icon="fas fa-check"
                  editable
                  @click="markAsNotComplete(key)"
                >
                  <v-layout
                    align-center
                    justify-start
                  >
                    <v-flex>
                      <div class="font-weight-medium subheading">
                        <span
                          class="mr-2"
                          v-html="todo.title.icon"
                        />
                        <span v-if="!todo.complete">{{ todo.title.text | capitalize }}</span>
                        <span
                          v-else
                          class="font-italic"
                        >{{ $t('hostSetupGuide.waiting', { key }) | capitalize }}</span>
                      </div>
                    </v-flex>
                    <v-flex>
                      <v-btn
                        v-if="todo.complete"
                        color="grey lighten-2"
                        icon
                        small
                        style="cursor:pointer"
                        @click="markAsNotComplete(key)"
                      >
                        <v-icon small>
                          fas fa-redo
                        </v-icon>
                      </v-btn>
                    </v-flex>
                    <v-flex v-if="todo.skipped">
                      <v-chip color="grey" small text-color="white">
                        {{ $t('phrase.skipped') | capitalize }}
                      </v-chip>
                    </v-flex>
                  </v-layout>
                </v-stepper-step>
                <v-stepper-content
                  :class="{ complete: todo.complete, skipped: todo.skipped }"
                  :step="index"
                >
                  <v-card
                    v-if="!todo.complete"
                    class="elevation-0 mb-1 pa-3"
                  >
                    <InstallInstructions
                      v-model="selectedInstallationSnippet"
                      :install-entity="todo.installInstructions.installEntity"
                      :kb-uri="todo.installInstructions.kbUri"
                      :parent-entity="todo.installInstructions.parentEntity"
                      :snippets="key === 'agent' ? agentSnippets : frontmanSnippets"
                    />
                  </v-card>
                  <v-flex>
                    <v-layout
                      align-center
                      justify-around
                      row
                      wrap
                    >
                      <v-flex>
                        <v-btn
                          flat
                          small
                          @click="skipStep(key)"
                        >
                          {{ $t('button.skipForNow') | capitalize }}
                        </v-btn>
                        <v-btn
                          color="primary"
                          small
                          @click="completeStep(key)"
                        >
                          {{ $t('button.done') | capitalize }}
                        </v-btn>
                      </v-flex>
                      <v-flex
                        v-if="!!selectedInstallationSnippet"
                        shrink
                      >
                        <InstallWarning
                          :location="todo.installInstructions.parentEntity"
                        />
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-stepper-content>
                <v-divider/>
              </template>
            </v-stepper>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </template>
    </v-hover>
  </div>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import InstallInstructions from '@/components/Installation/InstallInstructions';
  import InstallWarning from '@/components/Installation/InstallWarning';

  export default {
    components: {
      InstallInstructions,
      InstallWarning,
    },
    props: {
      Host: {
        type: Object,
        required: true,
      },
      requiresAgentInstallation: {
        type: Boolean,
        required: true,
      },
      requiresFrontmanInstallation: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        stepper: 1,
        panel: true,
        expiryTimestamp: 604800, // seconds = 1 week
        localStorageKey: 'hostInstallInstructions',
        renderingComplete: false,
        selectedInstallationSnippet: null,
        setupData: {
          agent: {
            title: {
              text: this.$t('hostSetupGuide.installAgentInstructions'),
              icon: '<i class="fas fa-user-secret"></i>',
            },
            installInstructions: {
              installEntity: 'cagent',
              parentEntity: this.Host.name,
              kbUri: 'configuring-hosts/installing-agents',
            },
            complete: false,
            skipped: false,
          },
          frontman: {
            title: {
              text: 'install frontman instructions:',
              icon: '<i class="fas fa-globe"></i>',
            },
            installInstructions: {
              installEntity: 'frontman',
              parentEntity: this.Host.frontman.location,
              kbUri: 'managing-frontman/installing-a-frontman',
            },
            complete: false,
            skipped: false,
          },
        },
      };
    },
    computed: {
      ...mapState('frontmen', ['frontmen', 'Frontman']),
      ...mapState('frontmen', {
        frontmanInstallSnippets: 'installSnippets',
      }),
      ...mapState('hosts', ['agentInstallSnippets']),
      requiresInstallation() {
        return this.requiresAgentInstallation || this.requiresFrontmanInstallation;
      },
      openPanel: {
        get() {
          return ! this.renderingComplete ? false : (! this.allComplete && this.panel);
        },
        set(val) {
          this.panel = val;
        },
      },
      agentSetupComplete() {
        return this.setupData.agent?.complete;
      },
      frontmanSetupComplete() {
        return this.setupData.frontman?.complete;
      },
      agentSetupSkipped() {
        return this.setupData.agent?.skipped;
      },
      frontmanSetupSkipped() {
        return this.setupData.frontman?.skipped;
      },
      allComplete() {
        return Object.values(this.setupData).every(({ complete }) => complete);
      },
      allSkipped() {
        return Object.values(this.setupData).every(({ skipped }) => skipped);
      },
      allCompleteOrSkipped() {
        if (this.allComplete || this.allSkipped) return true;

        if (
          (this.agentSetupComplete || this.agentSetupSkipped) &&
          (this.frontmanSetupComplete || this.frontmanSetupSkipped)
        ) {
          return true;
        }

        return false;
      },
      agentSnippets() {
        return this.agentInstallSnippets?.[this.Host?.id] ?? [];
      },
      frontmanSnippets() {
        return this.frontmanInstallSnippets?.[this.Frontman?.id] ?? [];
      },
      toBeInstalledString() {
        const agent = this.$options.filters.capitalize(this.$t('phrase.agent'));
        const frontman = this.$options.filters.capitalize(this.$tc('phrase.frontman', 1));

        if (this.requiresFrontmanInstallation && this.requiresAgentInstallation) {
          return `${agent} ${this.$t('phrase.or')} ${frontman}`;
        }

        return this.requiresAgentInstallation ? agent : frontman;
      },
    },
    async fetch() {
      if (this.requiresAgentInstallation && ! this.agentInstallSnippets[this.Host.id]) {
        await this.getAgentInstallSnippets({ Host: this.Host });
      }

      if (this.requiresFrontmanInstallation && ! this.frontmanInstallSnippets[this.Frontman?.id]) {
        this.setFrontman(this.Host.frontman);
        await this.getFrontmanInstallSnippets({ Frontman: this.Frontman });
      }
    },
    mounted() {
      if (! this.requiresInstallation) {
        this.deleteFromStorageById(this.Host.id);
        return;
      }

      if (! this.requiresAgentInstallation) {
        this.deleteFromStorageById(this.Host.id, 'agent');
      }
      if (! this.requiresFrontmanInstallation) {
        this.deleteFromStorageById(this.Host.id, 'frontman');
      }

      this.prepInstructionsToShow();
      this.editStepperMarkup();
      this.openFirstIncompleteStep();
      this.renderingComplete = true;
    },
    methods: {
      ...mapActions('frontmen', ['getFrontmen', 'getFrontmanInstallSnippets']),
      ...mapMutations('frontmen', ['setFrontman']),
      ...mapActions('hosts', ['getAgentInstallSnippets']),
      prepInstructionsToShow() {
        if (! this.requiresAgentInstallation) {
          this.$delete(this.setupData, 'agent');
        }
        if (! this.requiresFrontmanInstallation) {
          this.$delete(this.setupData, 'frontman');
        }
        this.checkForAlreadyCompletedSteps();
      },
      checkForAlreadyCompletedSteps() {
        const storedSettings = this.getAllFromStorage();
        if (! storedSettings.hasOwnProperty(this.Host.id)) return;

        Object.entries(storedSettings[this.Host.id])
              .forEach(([key, { timestamp, complete, skipped }]) => {
                if ((this.getNowTimestamp() - timestamp) < this.expiryTimestamp
                    && this.setupData.hasOwnProperty(key)) {
                  this.setupData[key].complete = complete;
                  this.setupData[key].skipped = skipped;
                }
              });

        if (this.agentSetupComplete && this.frontmanSetupComplete) {
          this.triggerEvent('all', 'complete');
        }
        if (this.allCompleteOrSkipped) {
          this.triggerEvent('all', 'complete-or-skipped');
        }

        if (this.agentSetupSkipped && this.frontmanSetupSkipped) {
          this.triggerEvent('all', 'skipped');
        }
        if (this.allCompleteOrSkipped) {
          this.triggerEvent('all', 'complete-or-skipped');
        }
      },
      openFirstIncompleteStep() {
        const item = Object.entries(this.setupData)
                           .find(([, { complete, skipped }]) => ! complete && ! skipped);
        if (item) {
          const [key] = item;
          this.stepper = Object.keys(this.setupData).indexOf(key) + 1;
        } else {
          this.stepper = -1;
        }
      },
      fixExpansionPanelState([value]) {
        this.openPanel = value;
      },
      triggerEvent(step, action) {
        this.$emit(`setup:${step}-${action}`);
      },
      completeStep(step) {
        this.setupData[step].complete = true;
        this.stepper++;
        this.storeUpdate(step);
        this.triggerEvent(step, 'complete');
        if (this.agentSetupComplete && this.frontmanSetupComplete) {
          this.triggerEvent('all', 'complete');
        }
        if (this.allCompleteOrSkipped) {
          this.triggerEvent('all', 'complete-or-skipped');
        }
      },
      skipStep(step) {
        this.setupData[step].skipped = true;
        this.stepper++;
        this.storeUpdate(step);
        this.triggerEvent(step, 'skipped');
        if (this.agentSetupSkipped && this.frontmanSetupSkipped) {
          this.triggerEvent('all', 'skipped');
        }
        if (this.allCompleteOrSkipped) {
          this.triggerEvent('all', 'complete-or-skipped');
        }
      },
      markAsNotComplete(step) {
        this.setupData[step].complete = false;
        this.setupData[step].skipped = false;
        this.storeUpdate(step);
      },
      storeUpdate(step) {
        let thisHostSettings = {
          [step]: {
            complete: this.setupData[step].complete,
            skipped: this.setupData[step].skipped,
            timestamp: this.getNowTimestamp(),
          },
        };

        const storedSettings = this.getAllFromStorage();

        if (storedSettings.hasOwnProperty(this.Host.id)) {
          thisHostSettings = {
            ...storedSettings[this.Host.id],
            ...thisHostSettings,
          };
        }

        const fullSettings = {
          ...storedSettings,
          [this.Host.id]: thisHostSettings,
        };

        this.saveAllToStorage(fullSettings);
      },
      getNowTimestamp() {
        return Math.round((new Date()).getTime() / 1000);
      },
      getAllFromStorage() {
        if (localStorage.getItem(this.localStorageKey)) {
          try {
            return JSON.parse(localStorage.getItem(this.localStorageKey));
          } catch (e) {
            localStorage.removeItem(this.localStorageKey);
          }
        }
        return {};
      },
      saveAllToStorage(settings) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(settings));
      },
      deleteFromStorageById(id, key = null) {
        const storeSettings = this.getAllFromStorage();
        // Do we have install settings stored for this host?
        if (storeSettings.hasOwnProperty(id)) {
          if (! key) {
            delete storeSettings[id];
          } else if (storeSettings[id].hasOwnProperty(key)) {
            delete storeSettings[id][key];
          }
          this.saveAllToStorage(storeSettings);
        }
      },
      editStepperMarkup() {
        const stepper__step = document.querySelectorAll('.v-stepper__step');
        stepper__step.forEach((node) => {
          node.classList.add('layout', 'justify-start', 'align-center', 'pa-0', 'ma-0');
        });

        const stepper__step__step = document.querySelectorAll('.v-stepper__step__step');
        stepper__step__step.forEach((node) => {
          const div = document.createElement('div');
          div.setAttribute('class',
            'side-bar flex shrink pa-0 ma-0 layout justify-center align-center');
          this.wrapAll([node], div);
        });

        const stepper__label = document.querySelectorAll('.v-stepper__label');
        stepper__label.forEach((node) => {
          node.classList.add('flex', 'border-left', 'py-3', 'pl-4');
        });

        const stepper__content = document.querySelectorAll('.v-stepper__content');
        stepper__content.forEach((node) => {
          // add child node inside content, but BEFORE the v-stepper__wrapper element
          const div = document.createElement('div');
          div.setAttribute('class', 'side-bar');
          div.appendChild(document.createTextNode(' '));
          node.insertBefore(div, node.childNodes[0]);
          // add classes to content div
          node.classList.add('layout', 'justify-start', 'align-center', 'pa-0', 'ma-0');
        });

        const stepper__wrapper = document.querySelectorAll('.v-stepper__wrapper');
        stepper__wrapper.forEach((node) => {
          node.classList.add('flex', 'border-left', 'pt-2', 'pb-3', 'pl-2');
        });
      },
      wrapAll(nodes, wrapper) {
        const parent = nodes[0].parentNode;
        const { previousSibling } = nodes[0];

        for (let i = 0; nodes.length - i; wrapper.firstChild === nodes[0] && i++) {
          wrapper.appendChild(nodes[i]);
        }

        const nextSibling = previousSibling ? previousSibling.nextSibling : parent.firstChild;
        parent.insertBefore(wrapper, nextSibling);

        return wrapper;
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .v-expansion-panel__container
    & >>> .side-bar
      width 100px
      max-width 100px
      min-width 100px

      @media (max-width: 959px)
        width 75px
        max-width 75px
        min-width 75px

    & >>> .v-expansion-panel__header
      padding-left 0
      padding-top 0
      padding-bottom 0

    & >>> .v-stepper
      padding-bottom 0

      .v-stepper__step
        padding 0

        &.skipped
          .v-stepper__label
            &:after
              content: " ";
              display: block;
              position: absolute;
              top: 0;
              left: 0;
              background url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAALElEQVQYV2NkwA3SGHHIpTEwMMzCJgmWAGlCl4RLoEuiSCBLYkjAJLFKgCQBSF8GbnKTsi8AAAAASUVORK5CYII=") repeat !important
              width: 100%;
              height: 100%;
              opacity: 0.4;

        .v-stepper__step__step
          margin-right 0
          width 30px
          height 30px
          font-size 16px

      .v-stepper__step--editable
        &:hover {
          background-color: white !important
        }

      .v-stepper__step--complete

        .v-stepper__label
          position relative
          opacity 0.9

          &:after {
            content: " ";
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            //background url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAALElEQVQYV2NkwA3SGHHIpTEwMMzCJgmWAGlCl4RLoEuiSCBLYkjAJLFKgCQBSF8GbnKTsi8AAAAASUVORK5CYII=") repeat !important
            width: 100%;
            height: 100%;
            opacity: 0.4;
          }

        .v-stepper__step__step
          background-color #4caf50 !important
          border-color #4caf50 !important

        .v-stepper__label
          border-left 1px solid #e3e3e3

      .v-stepper__content
        border-left none
        padding 0 0 !important
        margin 0 0 !important
        justify-content flex-start
        align-items center
        display flex
        flex-wrap nowrap
        min-width 0
        border-left: none !important

        &.complete, &.skipped
          margin-top -16px
          overflow hidden

          .v-stepper__wrapper
            display none

    & >>> .border-left
      border-left 1px solid #e3e3e3

    & >>> .border-right
      border-right 1px solid #e3e3e3
</style>
