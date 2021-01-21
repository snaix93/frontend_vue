<template>
  <div data-cy="frontmenList">
    <v-card class="position-relative">
      <v-card-text>
        <template v-if="!$fetchState.pending">
          <v-alert
            :value="trialEnded"
            class="mt-4 mb-4"
            color="primary"
            outline
          >
            {{ $t('frontman.trialPeriodEnded') | capitalize }}
          </v-alert>
          <v-alert
            :value="(!$auth.user.onTrial() || user_trialRemaining > 0) && frontmen_frontmenExceeded"
            class="pointer mt-4 mb-4"
            color="primary"
            outline
            @click="$router.push('/settings')"
          >
            {{ $t('frontman.upgradeYourPlan') | capitalize }}
          </v-alert>
          <v-layout wrap>
            <v-flex
              v-for="Frontman in frontmen"
              :key="Frontman.id"
              lg4 md6 xs12
            >
              <v-card
                :class="{
                'disabled' : trialEnded || $wait.is($WAIT_FOR.FRONTMAN.ALL_ID(Frontman.id)),
              }"
                class="position-relative flexcard frontman"
              >
                <v-card-title class="frontman--location pa-2 qa-location ">
                  <div class="headline text-truncate">
                    {{ Frontman.location }}
                  </div>
                </v-card-title>
                <v-divider/>
                <v-card-text class="pa-3 grey lighten-3 grow frontman--hosts-monitored qa-monitored">
                  <div :class="{ 'mb-3' : Frontman.hostCount }">
                    <span class="frontman--host-count value mr-1">
                      {{ Frontman.hostCount }}
                    </span>
                    <span class="body-2 metric">
                      {{ $tc('frontman.frontmanHostsMonitored', Frontman.hostCount) }}
                    </span>
                  </div>
                  <div
                    v-for="(host, i) in Frontman.hosts"
                    :key="host.id"
                    :class="{
                    'frontman--hosts' : true,
                    'text-truncate' : true,
                    'mb-1' : (i+1) !== Frontman.hostCount
                  }"
                  >
                    <span class="body-1 value mr-1">
                      <nuxt-link :to="`/hosts/${host.id}`">{{ host.name }}</nuxt-link>
                    </span>
                    <span class="caption metric grey--text text--darken-1">
                      ({{ host.connect }})
                    </span>
                  </div>
                </v-card-text>
                <v-card-text class="pb-2 qa-status">
                  <v-layout>
                    <v-flex xs12>
                      <AppChip
                        v-if="Frontman.dates.lastHeartbeatAt === null"
                        class="mt-0 ml-0"
                        color="grey"
                        label
                      >
                        {{ $t('frontman.pending') | capitalize }}
                      </AppChip>

                      <AppChip
                        v-else-if="isConnected(Frontman)"
                        class="font-weight-medium ml-0"
                        color="success"
                      >
                        {{ $t('frontman.connected') | capitalize }}
                      </AppChip>

                      <AppChip
                        v-else
                        class="font-weight-medium ml-0"
                        color="error"
                      >
                        {{ $t('frontman.disconnected') | capitalize }}
                      </AppChip>
                    </v-flex>
                  </v-layout>
                  <v-layout
                    align-center
                    justify-space-between
                  >
                    <v-flex class="caption">
                      {{ $t('frontman.lastHeartbeat') | capitalize }}: {{ lastHeartBeat(Frontman) }}
                    </v-flex>
                    <v-flex
                      shrink
                      @click="showHostInfoDialog(Frontman)"
                    >
                      <FrontmanConnectionIcon :Frontman="Frontman"/>
                    </v-flex>
                  </v-layout>
                </v-card-text>
                <v-divider/>
                <v-card-actions class="pa-2">
                  <v-btn
                    :disabled="trialEnded"
                    color="primary ma-0"
                    flat
                    small
                    @click.native.stop="showInstallDialog(Frontman)"
                  >
                    {{ $tc('frontman.installFrontman') }}
                  </v-btn>

                  <v-spacer/>

                  <v-btn
                    :disabled="trialEnded"
                    :title="$t('button.edit') | capitalize"
                    class="ma-0"
                    icon
                    @click.native.stop="editFrontman(Frontman)"
                  >
                    <v-icon>edit</v-icon>
                  </v-btn>

                  <HelpTooltip
                    v-if="Frontman.hostCount > 0"
                    #default="{ on }"
                    :tooltip="$tooltip('FRONTMAN_DISCONNECT')"
                  >
                    <v-btn
                      v-on="on"
                      class="ma-0"
                      icon
                      @click.prevent.stop=""
                    >
                      <v-icon color="grey">
                        delete
                      </v-icon>
                    </v-btn>
                  </HelpTooltip>

                  <v-btn
                    v-else
                    :disabled="trialEnded"
                    :title="$t('button.delete') | capitalize"
                    class="ma-0"
                    icon
                    @click.native.stop="deleteWithConfirmation(Frontman)"
                  >
                    <v-icon color="error">
                      delete
                    </v-icon>
                  </v-btn>
                </v-card-actions>
                <AppWait :wait="$wait.is($WAIT_FOR.FRONTMAN.DELETE_ID(Frontman.id))" height="100%">
                  {{ $t('message.wait.frontmanDelete') }}
                </AppWait>
              </v-card>
            </v-flex>
            <v-alert
              :value="!frontmen.length"
              class="mt-4"
              color="primary"
              outline
            >
              {{ $t('frontman.noFrontmen') | capitalize }}
            </v-alert>
            <v-flex
              class="caption grey lighten-2" mt-4
              pa-4
            >
              <p v-html="$t('frontman.frontmanExplanation')"/>
              <p
                class="mb-0"
                v-html="$t('frontman.frontmanExplanation2')"
              />
            </v-flex>
          </v-layout>
        </template>
        <v-flex v-else class="my-3">
          <TableNoData :is-loading="$fetchState.pending"/>
        </v-flex>
      </v-card-text>
    </v-card>

    <FrontmanInstallDialog v-if="installDialog"/>
    <FrontmanHostInfoDialog v-if="hostInfoDialog"/>

    <FrontmanDeleteDialog
      v-if="deleteDialog"
      @on-delete="onDelete"
    />

    <VideoDialog/>
  </div>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import FrontmanInstallDialog from '@/components/Installation/FrontmanInstallDialog';
  import FrontmanConnectionIcon from '@/components/Frontmen/FrontmanConnectionIcon';
  import FrontmanHostInfoDialog from '@/components/Frontmen/FrontmanHostInfoDialog';
  import FrontmanDeleteDialog from '@/components/Frontmen/FrontmanDeleteDialog';
  import AppConfirmDialog from '@/components/App/AppConfirmDialog';
  import VideoDialog from '@/components/Videos/VideoDialog';
  import HelpTooltip from '@/components/App/HelpTooltip';
  import AppChip from '@/components/App/AppChip';
  import frontmenMixins from '@/mixins/frontmen';
  import useDateTime from '@/mixins/useDateTime';
  import AppWait from '@/components/App/AppWait';
  import userMixins from '@/mixins/user';
  import appMixins from '@/mixins/app';

  import { useRefresher } from '@/use/useRefresher';
  import { FrontmenTableRefresherSymbol } from '@/constants/symbols';
  import TableNoData from '@/components/App/TableNoData';

  const FrontmenTableRefresher = useRefresher(FrontmenTableRefresherSymbol);

  export default {
    components: {
      TableNoData,
      FrontmanConnectionIcon,
      FrontmanHostInfoDialog,
      FrontmanInstallDialog,
      FrontmanDeleteDialog,
      AppConfirmDialog,
      HelpTooltip,
      VideoDialog,
      AppWait,
      AppChip,
    },
    mixins: [appMixins, userMixins, frontmenMixins, useDateTime],
    data() {
      return {
        consideredConnectedInSecs: 300,
      };
    },
    computed: {
      ...mapState('frontmen', [
        'frontmen', 'Frontman', 'selectedFrontman',
        'frontmanDialog', 'hostInfoDialog', 'installDialog', 'deleteDialog',
      ]),
      trialEnded() {
        return this.$auth.user.onTrial() && this.user_trialRemaining === 0;
      },
    },
    async fetch() {
      await this.getFrontmen();
    },
    mounted() {
      FrontmenTableRefresher.refreshRate = 60;
      FrontmenTableRefresher.onRefresh(this.$fetch);
      FrontmenTableRefresher.start();
    },
    beforeDestroy() {
      FrontmenTableRefresher.stop();
    },
    methods: {
      ...mapActions('frontmen', ['getFrontmen']),
      ...mapMutations('frontmen', [
        'toggleFrontmanDialog',
        'toggleHostInfoDialog',
        'toggleInstallDialog',
        'toggleDeleteDialog',
        'setSelectedFrontman',
        'setFrontman',
      ]),
      showInstallDialog(Frontman) {
        this.setFrontman(Frontman);
        this.toggleInstallDialog();
      },
      showHostInfoDialog(Frontman) {
        this.setFrontman(Frontman);
        this.toggleHostInfoDialog();
      },
      editFrontman(Frontman) {
        this.setSelectedFrontman(Frontman);
        this.toggleFrontmanDialog();
      },
      deleteWithConfirmation(Frontman) {
        this.setSelectedFrontman(Frontman);
        this.toggleDeleteDialog();
      },
      onDelete({ Frontman, success = true }) {
        this.$emit('on-delete', { Frontman, success });
      },
      isConnected({ dates }) {
        return (
          this.getTimeDiffFromNow(dates.lastHeartbeatAt.timestamp, 'seconds')
          <= this.consideredConnectedInSecs
        );
      },
      lastHeartBeat({ dates }) {
        if (dates.lastHeartbeatAt === null) {
          return this.$t('phrase.never');
        }

        return this.timeAgo(dates.lastHeartbeatAt.timestamp);
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .disabled
    opacity: 0.6

  .flexcard
    display: flex
    flex-direction: column

  .frontman
    max-width: 100%
    height: 100%

  .frontman--host-count
    display: inline-flex
    width: 20px
    height: 20px
    background: #3d4a63
    color: white
    font-size: 12px
    font-weight: bold
    align-items: center
    justify-content: center
    border-radius: 50%
</style>
