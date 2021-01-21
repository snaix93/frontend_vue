<template>
  <div
    class="form-group"
    :class="{'has-error':errorBag && validationKey ? errorBag.has(validationKey) : false}"
  >
    <slot
      :error="errorBag && validationKey ? errorBag.has(validationKey) : false"
      :rules="rules ? rules : null"
      :first-error-message="errorBag && validationKey ? errorBag.first(validationKey) : null"
      :has-error="errorBag && validationKey ? errorBag.has(validationKey) : false"
      :validationKey="validationKey ? validationKey : null"
      :label="label"
    />
  </div>
</template>

<script>
  export default {
    props: {
      validationKey: {
        type: String,
        required: false,
      },
      rules: {
        type: [String, Object],
        required: false,
      },
      errorBag: {
        required: false,
      },
      label: {
        type: String,
        required: false,
      },
    },
  };
</script>
