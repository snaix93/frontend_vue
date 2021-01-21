<template>
  <v-dialog
    persistent
    scrollable
    :value="dialog"
    :max-width="maxWidth"
    :custom-cancel="customCancel"
    :content-class="contentClass"
  >
    <form
      data-cy="modalForm"
      class="v-card"
      :class="cardClass"
      @submit.prevent="onSubmit"
    >
      <v-card-title
        class="py-2"
        :class="titleClass"
      >
        <span class="headline">
          <slot name="title"/>
        </span>
        <v-spacer/>
        <v-btn
          data-cy="modalCancelButton"
          icon
          class="mr-0"
          :class="cancelClass"
          @click="onCancel"
          v-if="!hideCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-container
          grid-list-md
          pa-0
        >
          <slot/>
        </v-container>
      </v-card-text>

      <v-divider/>

      <v-card-actions>
        <slot
          v-if="customCancel"
          name="custom-cancel"
        />
        <v-btn
          v-else
          flat
          :color="cancelButtonColor"
          :disabled="waitKey && $wait.is(waitKey)"
          @click="onCancel"
        >
          {{ $t('button.cancel') }}
        </v-btn>
        <v-spacer/>
        <slot name="prebutton"/>
        <slot
          v-if="customSubmit"
          name="custom-submit"
        />
        <v-btn
          v-else
          :flat="!buttonOutline"
          :outline="!!buttonOutline"
          :color="buttonColor"
          :loading="waitKey && $wait.is(waitKey)"
          type="submit"
        >
          <slot name="button"/>
        </v-btn>
      </v-card-actions>
    </form>
  </v-dialog>
</template>

<script>
  export default {
    props: {
      dialog: {
        type: Boolean,
        required: true,
      },
      maxWidth: {
        type: String,
        required: false,
        default: '500px',
      },
      cardClass: {
        type: String,
        required: false,
        default: 'white',
      },
      titleClass: {
        type: String,
        required: false,
        default: 'grey lighten-3',
      },
      cancelClass: {
        type: String,
        required: false,
      },
      buttonOutline: {
        type: Boolean,
        required: false,
        default: false,
      },
      buttonColor: {
        type: String,
        required: false,
        default: 'primary',
      },
      cancelButtonColor: {
        type: String,
        required: false,
      },
      customCancel: {
        type: Boolean,
        required: false,
        default: false,
      },
      hideCancel: {
        type: Boolean,
        required: false,
        default: false,
      },
      customSubmit: {
        type: Boolean,
        required: false,
        default: false,
      },
      waitKey: {
        type: String,
        required: false,
      },
      onSubmit: {
        type: Function,
        required: false,
      },
      onCancel: {
        type: Function,
        required: true,
      },
      contentClass: {
        type: [Object, Array],
        required: false,
        default() {
          return [];
        },
      },
    },
  };
</script>
