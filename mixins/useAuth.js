export default {
  methods: {
    useAuth_logout() {
      this.$wait.start(this.$WAIT_FOR.AUTH.LOGOUT);
      setTimeout(async () => {
        await this.$auth.logout();
        this.$wait.end(this.$WAIT_FOR.AUTH.LOGOUT);
      }, 250);
    },
    useAuth_login({ email, password }, redirectTo = '/dashboard') {
      this.$wait.start(this.$WAIT_FOR.AUTH.LOGIN);
      return this.$auth.loginWith('laravelJWT', { data: { email, password } })
                 .then(() => {
                   window.location = redirectTo;
                 })
                 .catch((error) => {
                   this.$wait.end(this.$WAIT_FOR.AUTH.LOGIN);
                   throw error;
                 });
    }
  },
};
