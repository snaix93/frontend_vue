export default {
  methods: {
    isUpdatingCheck(ServiceCheck) {
      return ServiceCheck.hasId();
    },
    isCreatingCheck(ServiceCheck) {
      return !this.isUpdatingCheck(ServiceCheck);
    },
    testForSSLCertificateCheck(ServiceCheck) {
      return ServiceCheck.isSslCheck;
    },
  },
};
