export default {
  data() {
    return {
      usePasswordField_passwordSuccessState: null,
      usePasswordField_passwordFieldType: 'password',
    };
  },
  computed: {
    usePasswordField_appendIcon() {
      return this.usePasswordField_passwordFieldType === 'password'
             ? 'visibility'
             : 'visibility_off';
    }
  },
  methods: {
    usePasswordField_onPasswordEnter() {
      setTimeout(() => {
        this.passwordSuccessState = ! this.validationErrors.has('password');
      }, 200);
    },
    usePasswordField_togglePasswordFieldType() {
      if (this.usePasswordField_passwordFieldType === 'password') {
        this.usePasswordField_passwordFieldType = 'text';
      } else {
        this.usePasswordField_passwordFieldType = 'password';
      }
    },
  },
};
