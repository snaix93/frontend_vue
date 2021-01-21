<template>
  <v-layout
    row
    wrap
  >
    <v-flex
      v-for="question in questions"
      :key="question.key"
      md12
      :lg6="!fullWidth"
    >
      <v-card
        :class="{
          'match-height' : !removeMatchHeight,
          'my-1' : !flat
        }"
        :flat="!!flat"
      >
        <v-subheader
          :class="{
            'pa-0' : !!flat
          }"
          class="grey--text text--darken-3"
        >
          {{ question.question }}
        </v-subheader>
        <v-card-text
          :class="{
            'pa-0' : !!flat
          }"
          class="pt-0"
        >
          <VeeFormGroup
            :validation-key="question.key"
            :error-bag="errorBag"
          >
            <template #default="prop">
              <v-radio-group
                v-if="question.type === 'radio'"
                v-model="question.answer"
                :class="{
                  'mt-0' : !!flat
                }"
                :error-messages="prop.firstErrorMessage"
                hide-details
              >
                <div
                  v-for="(option, i) in question.options"
                  :key="i"
                >
                  <v-radio
                    :label="option.label"
                    :value="option.value"
                    class="mb-2"
                  />
                </div>
              </v-radio-group>

              <div
                v-else-if="question.type === 'checkbox'"
                :class="{
                  'mt-0' : !!flat,
                  'mt-3' : !flat

                }"
              >
                <v-checkbox
                  v-for="(option, i) in question.options"
                  :key="i"
                  v-model="question.answers"
                  :label="option.label"
                  :value="option.value"
                  :error-messages="prop.firstErrorMessage"
                  class="mt-0 mb-1"
                  hide-details
                />
              </div>

              <template
                v-for="(option, i) in question.options"
              >
                <v-textarea
                  v-if="option.type === 'textbox' && (
                    question.answer === option.value ||
                    (question.answers && question.answers.indexOf(option.value) !== -1)
                  )"
                  :key="i"
                  v-model="option.textboxValue"
                  box
                  :label="option.textboxLabel"
                  class="mt-1"
                />
              </template>
            </template>
          </VeeFormGroup>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
export default {
    props: {
      questions: {
        type: Array,
        required: true,
      },
      errorBag: {
        type: Object,
        required: true,
      },
      fullWidth: {
        type: Boolean,
        required: false,
        default: false,
      },
      flat: {
        type: Boolean,
        required: false,
        default: false,
      },
      removeMatchHeight: {
        type: Boolean,
        required: false,
        default: false,
      }
    }
}
</script>
<style lang="stylus" scoped>
.match-height
  height: 100%
</style>
