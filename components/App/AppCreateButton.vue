<template>
  <v-flex
    v-if="visible"
    align-center
    d-flex
    shrink
  >
    <v-flex
      v-if="upgrade"
      class="hidden-xs-only text-xs-right"
      shrink
      style="max-width: 230px"
    >
      <p class="caption grey--text text--lighten-1 mb-0">
        {{ upgradeMsg }}
      </p>
    </v-flex>
    <v-flex
      class="text-xs-right"
      shrink
    >
      <v-btn
        :disabled="$wait.is(waitKey)"
        class="tertiary"
        data-cy="createButton"
        @click="action()"
      >
        <v-icon left>
          {{ btnIcon }}
        </v-icon>
        {{ btnLabel }}
      </v-btn>
    </v-flex>
  </v-flex>
</template>

<script>
  import { isEmpty } from 'lodash-es';
  import { mapMutations, mapState } from 'vuex';
  import userMixins from '@/mixins/user';
  import useCheckout from '@/mixins/useCheckout';
  import Frontman from '@/models/Frontman';
  import SubUnit from '@/models/SubUnit';
  import Rule from '@/models/Rule';
  import StatusPage from '@/models/StatusPage';
  import TeamMember from '@/models/TeamMember';

  export default {
    mixins: [userMixins, useCheckout],
    props: {
      upgrade: {
        type: Boolean,
        required: false,
        default: false,
      },
      label: {
        type: String,
        required: false,
      },
      upgradeMsg: {
        type: String,
        required: false,
      },
    },
    computed: {
      ...mapState('app', ['currentRoute']),
      ...mapState('user', ['checkoutData']),
      btnLabel() {
        if (this.upgrade) {
          return this.$t('button.upgrade');
        }
        if (this.label) {
          return this.label;
        }
        return this.$t('button.create');
      },
      btnIcon() {
        if (this.upgrade) {
          return 'star';
        }
        return 'add';
      },
      visible() {
        return this.$auth.user.isNotReadOnly();
      },
      waitKey() {
        switch (true) {
          case this.currentRoute.includes('/api'):
            return this.$WAIT_FOR.API_TOKEN.GET;
          case this.upgrade:
            return this.$WAIT_FOR.USER.CHECKOUT_DATA
          default:
            return false;
        }
      }
    },
    methods: {
      ...mapMutations('api', ['toggleTokenDialog']),
      ...mapMutations('frontmen', ['setSelectedFrontman', 'toggleFrontmanDialog']),
      ...mapMutations('subUnits', ['setSelectedSubUnit', 'toggleSubUnitDialog']),
      ...mapMutations('recipients', ['toggleRecipientDialog', 'resetSelectedRecipient']),
      ...mapMutations('statusPages', ['setSelectedStatusPage', 'toggleStatusPageDialog']),
      ...mapMutations('teamMembers', ['setSelectedTeamMember', 'toggleTeamMemberDialog']),
      ...mapMutations('rules', ['setSelectedRule', 'toggleAddRuleDialog']),
      action() {
        switch (true) {
          case this.upgrade:
            if(isEmpty(this.checkoutData)) {
              this.useCheckout_getHandoverAndUpgrade(this.$auth.user);
            } else {
              this.useCheckout_open(this.checkoutData.handover.baseUrl, 'upgrade')
            }
            break;
          case this.currentRoute.includes('/hosts'):
            this.$router.push('/hosts/create');
            break;
          case this.currentRoute.includes('/team'):
            this.setSelectedTeamMember(new TeamMember({ ...TeamMember.attributes }));
            this.toggleTeamMemberDialog(true);
            break;
          case this.currentRoute.includes('/sub-units'):
            this.setSelectedSubUnit(new SubUnit({ ...SubUnit.attributes }));
            this.toggleSubUnitDialog();
            break;
          case this.currentRoute.includes('/recipients'):
            this.resetSelectedRecipient('email');
            this.toggleRecipientDialog(true);
            break;
          case this.currentRoute.includes('/rules'):
            this.setSelectedRule(new Rule({ ...Rule.customRuleAttributes }));
            this.toggleAddRuleDialog(true);
            break;
          case this.currentRoute.includes('/frontmen'):
            this.setSelectedFrontman(new Frontman({ ...Frontman.attributes }));
            this.toggleFrontmanDialog();
            break;
          case this.currentRoute.includes('/api'):
            this.toggleTokenDialog(true);
            break;
          case this.currentRoute.includes('/status-pages'):
            this.setSelectedStatusPage(
              new StatusPage(JSON.parse(JSON.stringify(StatusPage.attributes)))
            );
            this.toggleStatusPageDialog(true);
            break;
          default:
            this.$router.push('');
            break;
        }
      },
    },
  };
</script>
