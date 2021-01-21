<template>
  <Modal
    :dialog="dialog"
    :on-cancel="onCancel"
    :on-submit="inviteTeamMember"
    :wait-key="$WAIT_FOR.TEAM_MEMBER.CREATE"
  >
    <template #title>
      {{ $t('team.inviteTeamMember') | capitalize }}
    </template>

    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.email') | capitalize"
      :rules="validationRules.email"
      data-cy="emailFormGroup"
      validation-key="email"
    >
      <template #default="prop">
        <v-text-field
          v-model="TeamMember.email"
          v-validate="prop.rules"
          :data-vv-name="prop.validationKey"
          :error-messages="prop.firstErrorMessage"
          :placeholder="prop.label"
          data-vv-validate-on="blur"
          single-line
        />
      </template>
    </VeeFormGroup>

    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.role') | capitalize"
      :rules="validationRules.role"
      validation-key="role"
    >
      <template #default="prop">
        <RoleSelect
          v-model="TeamMember.role"
          v-validate="prop.rules"
          :error-messages="prop.firstErrorMessage"
          :label="prop.label"
          :validation-key="prop.validationKey"
        />
      </template>
    </VeeFormGroup>

    <VeeFormGroup
      :label="$t('form.field.teamMemberRecipient') | capitalize"
      :rules="validationRules.createRecipient"
      validation-key="createRecipient"
    >
      <template #default="prop">
        <v-checkbox
          v-model="TeamMember.createRecipient"
          v-validate="prop.rules"
          :data-vv-name="prop.validationKey"
          :label="prop.label"
          hide-details
        />
      </template>
    </VeeFormGroup>

    <p class="caption mt-4">
      {{ $t('team.inviteTeamMemberCaption') }}
    </p>
    <p class="caption">
      {{ $t('team.inviteTeamMemberCaption2') }}
    </p>
    <template #button>
      {{ $t('team.buttonInviteTeamMember') }}
    </template>
  </Modal>
</template>

<script>
  import Modal from '@/components/App/Modal';
  import RoleSelect from '@/components/Team/RoleSelect';
  import TeamMember from '@/models/TeamMember';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import useBackendValidation from '@/mixins/useBackendValidation';

  export default {
    mixins: [
      useBackendValidation,
    ],
    components: {
      Modal,
      RoleSelect,
    },
    data() {
      return {
        role: [
          {
            label: this.$options.filters.capitalize(this.$t('team.roles.admin')),
            value: 'ROLE_TEAM_ADMIN',
          },
          {
            label: this.$options.filters.capitalize(this.$t('team.roles.member')),
            value: 'ROLE_TEAM_MEMBER',
          },
          {
            label: this.$options.filters.capitalize(this.$t('team.roles.guest')),
            value: 'ROLE_READ_ONLY',
          },
        ],
        validationRules: TeamMember.validationRules,
      };
    },
    computed: {
      ...mapState('teamMembers', {
        teamMembers: 'teamMembers',
        TeamMember: 'selectedTeamMember',
        dialog: 'inviteTeamMemberDialog',
      }),
    },
    created() {
      this.$validator.extend('uniqueTeamEmail', {
        getMessage: () => this.$t('validation.uniqueTeamEmail'),
        validate: (value) => {
          return this.$axios
                     .post('validate/user', {
                       email: value,
                       ignore: this.TeamMember?.id ?? null,
                     })
                     .then(({ data }) => data.data.email);
        }
      });
    },
    methods: {
      ...mapActions('teamMembers', {
        inviteTeamMemberAction: 'inviteTeamMember',
      }),
      ...mapMutations('teamMembers', ['toggleTeamMemberDialog']),
      async inviteTeamMember() {
        this.useBackendValidation_reset();
        this.$wait.start(this.$WAIT_FOR.TEAM_MEMBER.CREATE);
        const result = await this.$validator.validateAll();
        if (! result) {
          this.$wait.end(this.$WAIT_FOR.TEAM_MEMBER.CREATE);
          return;
        }
        await this
          .inviteTeamMemberAction({ TeamMember: this.TeamMember })
          .then(() => {
            this.$emit('on-create', { success: true, TeamMember: this.TeamMember });
          })
          .catch(({ response }) => {
            this.useBackendValidation_renderAnyErrors(response, {
              429: this.$t('message.general.tooManyAttempts'),
            });
            this.$emit('on-create', { success: false, TeamMember: this.TeamMember });
          });
      },
      onCancel() {
        this.toggleTeamMemberDialog();
      },
    },
  };
</script>
