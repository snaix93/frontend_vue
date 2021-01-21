<template>
  <div class="sub-guide">
    <v-stepper
      v-model="step"
    >
      <v-stepper-header>
        <v-stepper-step :complete="step > 1" step="1">
          <div
            v-if="step === 1"
            class="subheading font-weight-bold"
          >
            <slot name="questionnaire-title"></slot>
          </div>
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="step > 2" step="2">
          <div
            v-if="step === 2"
            class="subheading font-weight-bold"
          >
            {{ $t('host.guide.pleaseSpecify') }}
          </div>
        </v-stepper-step>

      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <slot name="questionnaire">
          </slot>
          <v-divider class="my-3"/>
          <v-layout
            align-end
            justify-space-between
            wrap
          >
            <v-flex>
              <v-btn
                class="caption mx-0"
                color="grey darken-2"
                flat
                @click="$emit('on-cancel')"
              >
                <span class="ml-1">
                  {{ $t('button.cancel') }}
                </span>
              </v-btn>
            </v-flex>
            <v-flex shrink>
              <v-btn
                :disabled="disabled"
                class="caption mx-0"
                color="primary"
                @click="nextStep"
              >
                <v-icon
                  left
                  small
                >
                  fas fa-forward
                </v-icon>
                <span class="ml-1">
                  {{ $t('button.next') }}
                </span>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-stepper-content>

        <v-stepper-content step="2">
          <slot name="form">
          </slot>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>

<script>
  export default {
    props: {
      disabled: {
        type: Boolean,
        default: false
      },
      step: {
        type: Number,
        required: false,
        default: 1,
      },
    },
    methods: {
      nextStep() {
        const newStep = this.step + 1;

        this.$emit('update:step', newStep);
      },
    }
  };
</script>

<style lang="stylus">
  .sub-guide .v-stepper:not(.default-stepper) .v-stepper__items {
    background-color: #eeeeee;
  }
</style>
