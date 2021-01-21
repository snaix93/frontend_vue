export default {
  methods: {
    useValidation_internalConnect(connect) {
      return /(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)|(\.local$)/i.test(
        connect,
      );
    },
    useValidation_tag(tag) {
      return /^[\w\d-_.:\s]+$/i.test(tag.trim());
    },
    useValidation_extendUniqueHostName(validatedHost) {
      this.$validator.extend('uniqueHostName', {
        getMessage: () => this.$t('validation.host.nameMustBeUnique'),
        validate: (value) => {
          return this.$axios
                     .post('validate/host', {
                       name: value,
                       ignore: validatedHost?.id ?? null,
                     })
                     .then(({ data }) => data.data.name);
        }
      });
    },
    useValidation_extendTags() {
      this.$validator.extend('tags', {
        getMessage: field => `The ${field} value contains invalid characters.`,
        validate: tags => tags.every(tag => {
          return ! tags.length || this.useValidation_tag(tag);
        }),
      });
    },
    useValidation_extendFrontman() {
      this.$validator.extend('frontman', {
        paramNames: ['frontmanType'],
        getMessage: (field, [requiredType]) => {
          if (requiredType === 'private') {
            return this.$t('validation.frontman.frontmanMustBePrivate');
          }
          return this.$t('validation.frontman.frontmanMustBePublic');
        },
        validate: (frontman, { frontmanType }) => frontman.type === frontmanType,
      });
    },
  },
};
