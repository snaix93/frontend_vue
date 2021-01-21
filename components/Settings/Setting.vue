<template>
  <v-layout
    :class="{ 'setting-divider': divider }"
    class="setting"
    row
    wrap
  >
    <v-flex
      v-if="heading"
      class="pt-3 pb-0 font-weight-bold"
      xs12
    >
      {{ heading }}
    </v-flex>

    <v-flex
      v-if="twoCol"
      class="setting-label py-3 font-weight-bold"
      xs9
    >
      <slot name="label"/>
    </v-flex>

    <template
      v-else
    >
      <v-flex
        :xs2="wide"
        :xs4="!wide"
        class="setting-label py-3 align-self-start"
      >
        <slot name="label"/>
      </v-flex>
      <v-flex
        :xs6="!wide"
        :xs7="wide"
        class="setting-value py-3 font-weight-bold"
      >
        <slot name="static"/>
        {{ action }}
      </v-flex>
    </template>

    <v-flex
      :x3="twoCol || wide"
      :xs2="!twoCol && !wide"
      align-self-center
      class="text-xs-right"
    >
      <v-layout justify-end align-middle>
        <slot name="before-action-button"/>
        <v-flex
          v-if="onUpdate || action"
          flex-shrink
        >
          <slot name="action-button" :action="action" :toggle-edit-mode="toggleEditMode">
            <v-btn
              :title="$t('button.edit')"
              class="ma-0"
              color="secondary"
              flat
              icon
              @click.native.stop="action ? action() : toggleEditMode(true)"
            >
              <slot name="action-button-content">
                <v-icon>edit</v-icon>
              </slot>
            </v-btn>
          </slot>
        </v-flex>
        <template v-else-if="customButton">
          <slot name="action-button"/>
        </template>
        <slot name="after-action-button"/>
      </v-layout>
    </v-flex>

    <Modal
      :dialog="editMode"
      :on-cancel="cancel"
      :on-submit="submit"
      :wait-key="waitKey"
    >
      <template #title>
        <slot name="title">
          {{ $t('settings.updateSetting') | capitalize }}
        </slot>
      </template>
      <slot name="modal"/>
      <template #prebutton>
        <slot name="prebutton"/>
      </template>
      <template #button>
        {{ $t('button.save') }}
      </template>
    </Modal>
  </v-layout>
</template>

<script>
  import Modal from '@/components/App/Modal';

  export default {
    components: { Modal },
    props: {
      action: {
        type: Function,
        required: false,
      },
      user: {
        type: Object,
        required: false,
      },
      customButton: {
        type: Boolean,
        required: false,
        default: false,
      },
      divider: {
        type: Boolean,
        required: false,
        default: false,
      },
      heading: {
        type: String,
        required: false,
      },
      twoCol: {
        type: Boolean,
        required: false,
        default: false,
      },
      wide: {
        type: Boolean,
        required: false,
        default: false,
      },
      onUpdate: {
        type: Function,
        required: false,
      },
      waitKey: {
        type: String,
        required: false,
        default() {
          return this.$WAIT_FOR.SETTINGS.ALL;
        }
      }
    },
    data() {
      return {
        editMode: false,
      };
    },
    methods: {
      toggleEditMode(emit) {
        if (emit) {
          if (! this.editMode) {
            this.$emit('activate');
          }
        }
        this.editMode = emit;
      },
      async submit() {
        const updated = await this.onUpdate();
        if (updated) {
          this.editMode = false;
        }
      },
      cancel() {
        this.toggleEditMode(true);
        this.$emit('on-cancel');
        this.editMode = false;
      },
    },
  };
</script>
<style lang="stylus" scoped>
  .setting-icon
    display: inline-block

  .setting-divider
    border-bottom: 1px solid rgba(0, 0, 0, .12);
</style>
