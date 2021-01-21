<template>
  <v-layout justify-center>
    <template v-if="!$fetchState.pending">
      <PageToolbar>
        <v-toolbar-items id="host-breadcrumbs">
          <AppBreadcrumbs :items="breadcrumbs"/>
          <v-divider
            class="mx-4"
            vertical
          />
        </v-toolbar-items>
        <v-spacer/>
        <v-toolbar-items id="host-tabs">
          <HostTabs :host-id="Host.id"/>
        </v-toolbar-items>
      </PageToolbar>
      <v-flex>
        <v-card class="qa-host">
          <v-card-title class="py-2 grey lighten-3">
            <v-layout align-center wrap>
              <v-flex lg8 md7 sm6 xs9>
                <span class="headline qa-host-name text-truncate d-block">{{ Host.name }}</span>
              </v-flex>
              <v-spacer/>
              <v-card-actions class="pa-0">
                <v-btn
                  v-if="Host.hasMonitoringAgent"
                  color="secondary"
                  flat
                  small
                  @click="toggleAgentDialog"
                >
                  <v-icon left small>
                    get_app
                  </v-icon>
                  {{ $t('button.installAgent') | capitalize }}
                </v-btn>
                <v-btn
                  :title="$t('button.edit') | capitalize"
                  color="secondary"
                  flat
                  icon
                  @click="editHost"
                >
                  <v-icon>edit</v-icon>
                </v-btn>
                <v-btn
                  :title="$t('button.delete') | capitalize"
                  color="error"
                  flat
                  icon
                  @click="deleteHostWithConfirmation"
                >
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-layout>
          </v-card-title>

          <v-divider/>

          <template
            v-if="Host.description || Host.tags.length > 0"
          >
            <v-card-text class="py-2">
              <v-layout align-center>
                <v-flex
                  v-if="Host.description"
                  class="text-no-wrap text-truncate"
                  shrink
                >
                  <span class="font-italic">{{ Host.description }}</span>
                </v-flex>
                <v-flex v-if="Host.tags.length > 0">
                  <AppChip
                    v-for="tag in Host.tags"
                    :key="tag"
                    class="v-chip--mini my-0"
                    color="grey"
                    label
                  >
                    {{ tag }}
                  </AppChip>
                </v-flex>
              </v-layout>
            </v-card-text>
            <v-divider/>
          </template>

          <v-card-text class="pa-0">
            <v-layout
              align-center
              ma-0
              row
              wrap
            >
              <v-flex
                :class="{ 'border-right': $vuetify.breakpoint.smAndUp }"
                pl-3
                py-3
              >
                <v-layout
                  align-start
                  mb-0
                  row
                  wrap
                >
                  <v-flex
                    :class="{
                      'xs6' : !!$vuetify.breakpoint.xsOnly,
                      'sm4' : !!$vuetify.breakpoint.mdAndDown,
                      'flex-shrink' : true,
                    }"
                    class="qa-connect"
                  >
                    <v-layout column>
                      <v-flex
                        class="caption font-weight-bold text-uppercase grey--text text--darken-1"
                        pb-0
                      >
                        {{ $t('phrase.connect') }}
                      </v-flex>
                      <v-flex pt-0>
                        <v-flex
                          v-if="Host.connect"
                          class="text-truncate"
                          px-0
                        >
                          {{ Host.connect }}
                        </v-flex>
                        <v-icon
                          v-else
                          class="text--primary"
                          small
                        >
                          remove
                        </v-icon>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex
                    :class="{
                      'xs6' : !!$vuetify.breakpoint.xsOnly,
                      'sm4' : !!$vuetify.breakpoint.mdAndDown,
                      'flex-shrink' : true,
                    }"
                    class="qa-location"
                  >
                    <v-layout column>
                      <v-flex
                        class="caption font-weight-bold text-uppercase grey--text text--darken-1"
                        pb-0
                      >
                        {{ $t('phrase.location') | capitalize }}
                      </v-flex>
                      <v-flex
                        class="text-no-wrap"
                        pl-0
                        pt-0
                      >
                        <HostLocationIcon
                          :Host="Host"
                          class="ml-1"
                          detailed
                        />
                        <v-icon
                          v-if="!Host.connect && Host.hasMonitoringAgent"
                          class="text--primary"
                          small
                        >
                          remove
                        </v-icon>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex
                    :class="{
                      'xs6' : !!$vuetify.breakpoint.xsOnly,
                      'sm4' : !!$vuetify.breakpoint.mdAndDown,
                      'flex-shrink' : true,
                    }"
                    class="qa-uses-agent"
                  >
                    <v-layout column>
                      <v-flex
                        class="caption font-weight-bold text-uppercase grey--text text--darken-1"
                        pb-0
                      >
                        {{ $t('phrase.agent') | capitalize }}
                      </v-flex>
                      <v-flex
                        class="text-no-wrap"
                        pl-0
                        pt-0
                      >
                        <HostCagentIcon
                          v-if="Host.hasMonitoringAgent"
                          :Host="Host"
                          check-for-update
                          detailed
                          @click="toggleInventoryDialog()"
                        />
                        <v-icon
                          v-else
                          class="text--primary"
                          small
                        >
                          remove
                        </v-icon>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex
                    v-if="Host.hasSubUnit"
                    :class="{
                      'xs6' : !!$vuetify.breakpoint.xsOnly,
                      'sm4' : !!$vuetify.breakpoint.mdAndDown,
                      'flex-shrink' : true,
                    }"
                    class="qa-uses-subUnit"
                  >
                    <v-layout column>
                      <v-flex
                        class="caption font-weight-bold text-uppercase grey--text text--darken-1"
                        pb-0
                      >
                        {{ $t('phrase.subUnit') | capitalize }}
                      </v-flex>
                      <v-flex
                        class="text-no-wrap"
                        pl-0 pt-0
                      >
                        <div class="text-truncate">
                          <SubUnitIcon :short-id="Host.subUnit.shortId"/>
                        </div>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex
                    v-if="Host.connect && snmpIsEnabled"
                    :class="{
                      'xs6' : !!$vuetify.breakpoint.xsOnly,
                      'sm4' : !!$vuetify.breakpoint.mdAndDown,
                      'flex-shrink' : true,
                    }"
                    class="qa-uses-snmp"
                  >
                    <v-layout column>
                      <v-flex
                        class="caption font-weight-bold text-uppercase grey--text text--darken-1"
                        pb-0
                      >
                        {{ $t('phrase.snmp') }}
                      </v-flex>
                      <v-flex
                        class="text-no-wrap"
                        pl-0
                        pt-0
                      >
                        <HostSnmpChip
                          v-if="Host.snmp.protocol"
                          :host="Host"
                          check-for-update
                        />
                        <v-icon
                          v-else
                          class="text--primary"
                          small
                        >
                          remove
                        </v-icon>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex
                    :class="{
                    'xs6' : !!$vuetify.breakpoint.xsOnly,
                    'sm4' : !!$vuetify.breakpoint.mdAndDown,
                    'flex-shrink' : true,
                  }"
                    class="qa-checks-count"
                  >
                    <v-layout column>
                      <v-flex
                        class="caption font-weight-bold text-uppercase grey--text text--darken-1"
                        pb-0
                      >
                        {{ $tc('phrase.check', 2) }}
                      </v-flex>
                      <v-flex pt-0>
                        {{ checksCount }}
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex
                    class="qa-last-check"
                  >
                    <v-layout column>
                      <v-flex
                        class="caption font-weight-bold text-uppercase grey--text text--darken-1"
                        pb-0
                      >
                        {{ $t('checks.lastCheck') }}
                      </v-flex>
                      <v-flex pt-0>
                        <template
                          v-if="Host.hasChecks && Host.lastCheckedAtDate && Host.lastCheckedAtDate.timestamp > 0"
                        >
                          {{ timeAgo(Host.lastCheckedAtDate.timestamp) }}
                        </template>
                        <v-icon
                          v-else
                          class="text--primary"
                          small
                        >
                          remove
                        </v-icon>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex
                v-if="$vuetify.breakpoint.xsOnly"
                :xs12="$vuetify.breakpoint.xsOnly"
              >
                <v-divider/>
              </v-flex>
              <v-flex
                :shrink="$vuetify.breakpoint.smAndUp" pb-2 pl-1 pr-3
                pt-1
              >
                <v-layout
                  :column="$vuetify.breakpoint.smAndUp"
                  justify-end
                >
                  <v-flex
                    :shrink="$vuetify.breakpoint.xsOnly"
                    class="qa-alerting"
                  >
                    <v-tooltip top>
                      <v-flex
                        slot="activator"
                        pa-0
                      >
                        <v-switch
                          v-model="Host.alerting"
                          class="qa-mute-alerts my-0 mx-2 py-0"
                          hide-details
                          @change="host_toggleAlerting(Host)"
                        >
                          <template #label>
                            <span class="caption font-weight-medium">
                              {{ $t('phrase.alerting') | capitalize }}
                            </span>
                          </template>
                        </v-switch>
                      </v-flex>
                      <div v-if="Host.alerting">
                        {{ $t('host.alertingIsActive') }}
                      </div>
                      <div v-else>
                        {{ $t('host.alertingIsMuted') }}
                      </div>
                    </v-tooltip>
                  </v-flex>
                  <v-flex
                    :shrink="$vuetify.breakpoint.xsOnly"
                    class="qa-dashboard-visibility"
                  >
                    <v-tooltip top>
                      <v-flex
                        slot="activator"
                        pa-0
                      >
                        <v-switch
                          v-model="Host.dashboard"
                          class="my-0 mx-2 py-0"
                          hide-details
                          @change="host_toggleDashboardVisibility(Host)"
                        >
                          <template #label>
                            <span class="caption font-weight-medium">
                              {{ $t('phrase.showOnDashboard') | capitalize }}
                            </span>
                          </template>
                        </v-switch>
                      </v-flex>
                      <div v-if="Host.dashboard">
                        {{ $t('host.isShownOnDashboard') }}
                      </div>
                      <div v-else>
                        {{ $t('host.isNotShownOnDashboard') }}
                      </div>
                    </v-tooltip>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
        <SetupAdvice
          :key="setupAdviceKey"
          :Host="Host"
          :requiresAgentInstallation="requiresAgentInstallation"
          :requiresFrontmanInstallation="requiresFrontmanInstallation"
          class="mt-3"
          @setup:agent-complete="agentSetupFinished()"
          @setup:frontman-complete="frontmanSetupFinished()"
          @setup:all-complete="allSetupFinished()"
          @setup:agent-skipped="agentSetupSkipped()"
          @setup:frontman-skipped="frontmanSetupSkipped()"
          @setup:all-skipped="allSetupSkipped()"
          @setup:all-complete-or-skipped="allSetupCompleteOrSkipped()"
        />

        <v-alert
          :value="
            !!Host.frontman
            && !hostLocation_isFrontmanConnected(Host.frontman)
          "
          class="mt-3 body-2"
          color="warning lighten-2 grey--text text--darken-4"
          type="warning"
        >
          {{ $t('host.youAssignedTheHostToAFrontmanWhichSeemsToBeDisconnected') | capitalize }}
        </v-alert>

        <template>
          <v-card
            v-if="showHostCheckCreationButtons"
            class="mt-3 qa-add-check"
          >
            <v-card-title class="grey lighten-3 py-2">
              <span class="title">{{ $t('host.addChecks') | capitalize }}</span>
            </v-card-title>
            <v-divider/>
            <v-card-text>
              <v-layout row wrap>
                <v-flex
                  v-for="(action, checkType) in actions"
                  :key="checkType"
                  :data-cy="checkType + 'AddButton'"
                  :style="checkStyles"
                  lg3 md4 sm6 xs12
                  @click="triggerAction(action)"
                >
                  <v-tooltip
                    :disabled="!action.tooltip || !action.tooltip()"
                    bottom
                    dark
                  >
                    <v-card
                      slot="activator"
                      :class="[
                        'add-check',
                        {
                          disabled: action.disableCondition ? action.disableCondition() : false,
                          'add-check--large': !Host.hasChecks
                        }
                      ]"
                      class="fill-height"
                      flat
                    >
                      <v-card-title
                        v-if="!Host.hasChecks"
                        class="pt-2 pb-0 body-2"
                      >
                        {{ $tc('host.' + checkType) }}
                        <v-spacer/>
                        <HelpTooltip
                          v-if="action.helpTooltipKey"
                          :tooltip="$tooltip(action.helpTooltipKey)"
                          class="ml-1"
                        />
                      </v-card-title>
                      <v-card-text
                        v-if="!Host.hasChecks"
                        class="pt-1 pb-2 line-height-dense"
                      >
                        <span class="caption">{{ $tc('host.' + checkType + 'Description') }}</span>
                      </v-card-text>
                      <v-card-actions class="pa-0">
                        <v-btn
                          :class="{
                            'animated infinite pulse slow':
                              (checkType === 'ICMPCheck' || checkType === 'serviceCheck') &&
                              !Host.hasChecks
                          }"
                          :disabled="action.disableCondition ? action.disableCondition() : false"
                          block
                          class="text-capitalize"
                          color="primary"
                        >
                          <v-icon
                            dark
                            left
                            small
                            v-text="actionIcon(action)"
                          />
                          {{ $tc('host.' + checkType + 'Button') }}
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                    <span v-if="!!action.tooltip">
                      {{ action.tooltip() }}
                    </span>
                  </v-tooltip>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>

          <v-card
            v-if="showCheckTables"
            class="selected-checks mt-3"
          >
            <v-card-title class="grey lighten-3 py-2">
              <span class="title">{{ $t('host.selectedChecks') | capitalize }}</span>
            </v-card-title>

            <v-card
              v-if="Host.hasServiceChecks"
              class="check-card position-relative"
            >
              <v-divider/>
              <v-card-title class="py-2 grey lighten-5">
                <span class="subheading">{{ $t('host.serviceChecks') | capitalize }}</span>
                <v-spacer/>
                <v-progress-circular
                  v-if="$wait.is(this.$WAIT_FOR.SERVICE_CHECK.GET)"
                  color="secondary"
                  indeterminate
                  size="22"
                  width="2"
                />
              </v-card-title>
              <v-divider/>
              <ServiceChecksTable
                :key="`ServiceChecksTable::${Host.id}`"
                class="qa-service-checks"
                @on-update="onUpdateServiceCheck"
                @on-delete="onDeleteServiceCheck"
              />
            </v-card>

            <v-card
              v-if="Host.hasWebChecks"
              class="check-card"
            >
              <v-divider/>
              <v-card-title class="py-2 grey lighten-5">
                <span class="subheading">{{ $t('host.webChecks') | capitalize }}</span>
                <v-spacer/>
                <v-progress-circular
                  v-if="$wait.is(this.$WAIT_FOR.WEB_CHECK.GET)"
                  color="secondary"
                  indeterminate
                  size="22"
                  width="2"
                />
              </v-card-title>
              <v-divider/>
              <WebChecksTable
                :key="`WebChecksTable::${Host.id}`"
                class="qa-website-checks"
                @on-update="onUpdateWebCheck"
                @on-delete="onDeleteWebCheck"
              />
            </v-card>

            <v-card
              v-if="Host.hasCustomChecks"
              class="check-card"
            >
              <v-divider/>
              <v-card-title class="py-2 grey lighten-5">
                <span class="subheading">{{ $t('host.customChecks') | titlecase }}</span>
                <v-spacer/>
                <v-progress-circular
                  v-if="$wait.is(this.$WAIT_FOR.CUSTOM_CHECK.GET)"
                  color="secondary"
                  indeterminate
                  size="22"
                  width="2"
                />
              </v-card-title>
              <v-divider/>
              <CustomChecksTable
                :key="`CustomChecksTable::${Host.id}`"
                class="qa-custom-checks"
                @on-update="onUpdateCustomCheck"
                @on-delete="onDeleteCustomCheck"
              />
            </v-card>

            <v-card
              v-if="Host.hasSnmpChecks"
              class="check-card"
            >
              <v-divider/>
              <v-card-title class="py-2 grey lighten-5">
                <span class="subheading">{{ $t('host.SNMPChecks') | titlecase }}</span>
                <v-spacer/>
                <v-progress-circular
                  v-if="$wait.is(this.$WAIT_FOR.SNMP_CHECK.GET)"
                  color="secondary"
                  indeterminate
                  size="22"
                  width="2"
                />
              </v-card-title>
              <v-divider/>
              <SNMPChecksTable
                :key="`SNMPChecksTable::${Host.id}`"
                class="qa-snmp-checks"
                @on-update="onUpdateSNMPCheck"
                @on-delete="onDeleteSNMPCheck"
              />
            </v-card>
          </v-card>
        </template>

        <UpdateHostForm
          @on-update="onHostUpdate"
          @on-cancel="onCancelHostUpdate"
        />

        <ICMPCheckDialog
          v-if="ICMPCheckDialog"
          :tooltip-key="actions.ICMPCheck ? actions.ICMPCheck.helpTooltipKey : ''"
          @on-create="onAddICMPCheck"
          @on-update="onUpdateICMPCheck"
        />

        <ServiceCheckDialog
          v-if="serviceCheckDialog"
          :tooltip-key="actions.serviceCheck ? actions.serviceCheck.helpTooltipKey : ''"
          @on-create="onAddServiceCheck"
          @on-update="onUpdateServiceCheck"
        />

        <WebCheckDialog
          v-if="webCheckDialog"
          :tooltip-key="actions.webCheck ? actions.webCheck.helpTooltipKey : ''"
          @on-create="onAddWebCheck"
          @on-update="onUpdateWebCheck"
        />

        <CustomCheckDialog
          v-if="customCheckDialog"
          :tooltip-key="actions.customCheck ? actions.customCheck.helpTooltipKey : ''"
          @on-create="onAddCustomCheck"
          @on-update="onUpdateCustomCheck"
        />

        <SNMPCheckDialog
          v-if="snmpCheckDialog"
          :tooltip-key="actions.SNMPCheck ? actions.SNMPCheck.helpTooltipKey : ''"
          @on-create="onAddSNMPCheck"
          @on-update="onUpdateSNMPCheck"
        />

        <JobmonInfoDialog/>

        <AgentInstallDialog v-if="Host"/>

        <HostInventoryDialog v-if="! Host.hasPendingAgentConnection"/>

        <HostDeleteConfirmDialog
          v-if="deleteDialog"
          @on-delete="onHostDelete"
        />

        <CheckSuccessDialog v-if="checkSuccessDialog"/>

        <AgentSetupFinishedHelp/>
      </v-flex>
    </template>
    <VideoDialog/>
    <AppWait :wait="$fetchState.pending"/>
  </v-layout>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import AppBreadcrumbs from '@/components/App/AppBreadcrumbs';
  import AppChip from '@/components/App/AppChip';
  import AppWait from '@/components/App/AppWait';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import HelpTooltip from '@/components/App/HelpTooltip';
  import HostLocationIcon from '@/components/Hosts/HostLocationIcon';
  import ServiceChecksTable from '@/components/Hosts/Checks/ServiceChecksTable';
  import WebChecksTable from '@/components/Hosts/Checks/WebChecksTable';
  import CustomChecksTable from '@/components/Hosts/Checks/CustomChecksTable';
  import SNMPChecksTable from '@/components/Hosts/Checks/SNMPChecksTable';
  import ICMPCheckDialog from '@/components/Hosts/Checks/ICMPCheckDialog';
  import ServiceCheckDialog from '@/components/Hosts/Checks/ServiceCheckDialog';
  import WebCheckDialog from '@/components/Hosts/Checks/WebCheckDialog';
  import CustomCheckDialog from '@/components/Hosts/Checks/CustomCheckDialog';
  import SNMPCheckDialog from '@/components/Hosts/Checks/SNMPCheckDialog';
  import JobmonInfoDialog from '@/components/Hosts/Checks/JobmonInfoDialog';
  import AgentInstallDialog from '@/components/Installation/AgentInstallDialog';
  import HostCagentIcon from '@/components/Hosts/HostCagentIcon';
  import HostSnmpChip from '@/components/Hosts/HostSnmpChip';
  import HostInventoryDialog from '@/components/Hosts/HostInventoryDialog';
  import HostTabs from '@/components/Hosts/HostTabs';
  import CheckSuccessDialog from '@/components/Hosts/Checks/CheckSuccessDialog';
  import HostDeleteConfirmDialog from '@/components/Hosts/HostDeleteConfirmDialog';
  import SetupAdvice from '@/components/Hosts/SetupAdvice';
  import AgentSetupFinishedHelp from '@/components/Hosts/AgentSetupFinishedHelp';
  import VideoDialog from '@/components/Videos/VideoDialog';
  import { useRefresher } from '@/use/useRefresher';
  import { HostDetailRefresherSymbol } from '@/constants/symbols';

  import appMixins from '@/mixins/app';
  import useDateTime from '@/mixins/useDateTime';
  import hostMixins from '@/mixins/host';
  import hostLocationMixins from '@/mixins/hostLocation';
  import useWebCheckHelpers from '@/mixins/useWebCheckHelpers';
  import recipientMixin from '@/mixins/recipient';
  import useValidationMixins from '@/mixins/useValidation';
  import serviceCheckMixin from '@/mixins/serviceCheckMixin';
  import SubUnitIcon from '@/components/SubUnits/SubUnitIcon';
  import UpdateHostForm from '@/components/Hosts/UpdateHostForm';

  const HostDetailRefresher = useRefresher(HostDetailRefresherSymbol);

  export default {
    name: 'hostDetail',
    layout: 'admin',
    middleware: 'canWrite',
    components: {
      UpdateHostForm,
      SubUnitIcon,
      AgentSetupFinishedHelp,
      SetupAdvice,
      AppBreadcrumbs,
      AppChip,
      AppWait,
      PageToolbar,
      HelpTooltip,
      HostLocationIcon,
      ServiceChecksTable,
      WebChecksTable,
      CustomChecksTable,
      SNMPChecksTable,
      ICMPCheckDialog,
      ServiceCheckDialog,
      WebCheckDialog,
      CustomCheckDialog,
      SNMPCheckDialog,
      JobmonInfoDialog,
      AgentInstallDialog,
      HostSnmpChip,
      HostCagentIcon,
      HostInventoryDialog,
      HostTabs,
      CheckSuccessDialog,
      HostDeleteConfirmDialog,
      VideoDialog,
    },
    mixins: [
      appMixins,
      useDateTime,
      hostMixins,
      hostLocationMixins,
      useWebCheckHelpers,
      recipientMixin,
      useValidationMixins,
      serviceCheckMixin,
    ],
    data() {
      return {
        editHostDialog: false,
        setupAdviceKey: 1,
        editableHost: null,
        showCheckCreationPanel: false,
      };
    },
    computed: {
      ...mapState('recipients', {
        recipients: 'recipients',
        Recipient: 'Recipient',
      }),
      ...mapState('hosts', [
        'Host', 'updateDialog', 'deleteDialog',
        'agentDialog', 'agentSetupHelpOverlay',
        'checkSuccessDialog'
      ]),
      ...mapState('serviceChecks', ['serviceChecks', 'serviceCheckDialog', 'ICMPCheckDialog']),
      ...mapState('webChecks', ['webChecks', 'webCheckDialog']),
      ...mapState('customChecks', ['customChecks', 'customCheckDialog']),
      ...mapState('SNMPChecks', ['snmpChecks', 'snmpCheckDialog']),
      actions() {
        const actions = {
          ICMPCheck: {
            action: () => {
              this.resetSelectedServiceCheckToICMP(this.Host);
              this.toggleICMPCheckDialog(true);
            },
            helpTooltipKey: 'HOST_CHECK_ICMP_PING',
            tooltip: () => {
              if (! this.activateServiceChecks)
                return this.$t('host.pleaseEnterAnIPOrFQDN');
            },
            isDeactivated: () => ! this.activateServiceChecks,
            disableCondition: () => !! this.disableICMPCheckButton || ! this.activateServiceChecks,
          },
          serviceCheck: {
            action: () => {
              this.resetSelectedServiceCheck(this.Host);
              this.toggleServiceCheckDialog(true);
            },
            helpTooltipKey: 'HOST_CHECK_SERVICE',
            tooltip: () => {
              if (! this.activateServiceChecks) {
                return this.$t('host.pleaseEnterAnIPOrFQDN');
              }
            },
            isDeactivated: () => ! this.activateServiceChecks,
            disableCondition: () => ! this.activateServiceChecks,
          },
          webCheck: {
            action: () => {
              this.resetSelectedWebCheck(this.Host);
              this.toggleWebCheckDialog(true);
            },
            helpTooltipKey: 'HOST_CHECK_WEBSITE',
            tooltip: () => {
              if (! this.activateWebChecks)
                return this.$t('host.pleaseEnterAnIPOrFQDN');
            },
            isDeactivated: () => ! this.activateWebChecks,
            disableCondition: () => ! this.activateWebChecks,
          },
          customCheck: {
            action: () => {
              this.resetSelectedCustomCheck(this.Host);
              this.toggleCustomCheckDialog(true);
            },
            helpTooltipKey: 'HOST_CHECK_CUSTOM',
            disableCondition: () => ! this.activateCustomChecks,
          },
          jobmon: {
            action: () => {
              this.toggleJobmonInfoDialog(true);
            },
            tooltip: () => {
              if (! this.Host.cagent)
                return this.$t('host.activateAgentBasedMonitoring');
            },
            isDeactivated: () => ! this.Host.cagent,
            disableCondition: () => ! this.Host.cagent,
          },
        };

        if (this.snmpIsEnabled) {
          actions.SNMPCheck = {
            action: () => {
              this.resetSelectedSnmpCheck(this.Host);
              this.toggleSnmpCheckDialog(true);
            },
            tooltip: () => {
              if (! this.activateSNMPChecks)
                return this.$t('host.enterSNMPCredentials');
            },
            isDeactivated: () => ! this.activateSNMPChecks,
            disableCondition: () => this.disableSNMPCheckButton || ! this.activateSNMPChecks,
          };
        }

        if (this.hostLocation_connectIsPublic) {
          actions.SSLCertificateCheck = {
            action: () => {
              this.resetSelectedServiceCheckToSSLCertificateCheck(this.Host);
              this.toggleServiceCheckDialog(true);
            },
          };
        }

        return Object.entries(actions)
                     .reduce((accum, [k, v]) => (accum[k] = v, accum), {});
      },
      checkStyles() {
        return {
          minWidth: '180px',
          maxWidth: Object.keys(this.actions).length === 1 ? '300px' : 'auto',
        };
      },
      checksCount() {
        return this.Host.totalCheckCount;
      },
      showCheckTables() {
        if (this.Host.hasMonitoringAgent) {
          return this.Host.hasChecks && this.Host.totalCheckCount > 1;
        }

        return this.Host.hasChecks;
      },
      hasICMPCheck() {
        return this.Host.hasIcmpCheck;
      },
      snmpIsEnabled() {
        return this.Host.hasSnmpData;
      },
      hasPrivateFrontman() {
        return this.Host.frontman.type === 'private';
      },
      activateServiceChecks() {
        if (this.useValidation_internalConnect(this.Host.connect) && ! this.hasPrivateFrontman) {
          return false;
        }

        return ! (this.Host.cagent && ! this.Host.connect);
      },
      activateWebChecks() {
        if (this.useValidation_internalConnect(this.Host.connect) && ! this.hasPrivateFrontman) {
          return false;
        }

        return ! (this.Host.cagent && ! this.Host.connect);
      },
      activateCustomChecks() {
        return true;
      },
      activateSNMPChecks() {
        if (! this.snmpIsEnabled) {
          return false;
        }
        return !! this.Host.snmp?.protocol;
      },
      disableICMPCheckButton() {
        return this.hasICMPCheck;
      },
      disableSNMPCheckButton() {
        return this.Host.snmpCheckCount === 2;
      },
      requiresAgentInstallation() {
        return this.Host.hasPendingAgentConnection;
      },
      requiresFrontmanInstallation() {
        return this.Host.frontman && this.Host.frontman.type === 'private' && ! this.Host.frontman.lastHeartbeatAt;
      },
      showHostCheckCreationButtons() {
        if (! this.requiresAgentInstallation && ! this.requiresFrontmanInstallation) {
          return true;
        }

        if (this.Host.totalCheckCount > 1) {
          return true;
        }

        return this.showCheckCreationPanel;
      }
    },
    async fetch() {
      await this.getHost();
      await this.getConnectType();
    },
    mounted() {
      HostDetailRefresher.refreshRate = 60;
      HostDetailRefresher.onRefresh(this.getHost);
      HostDetailRefresher.start();
    },
    beforeDestroy() {
      HostDetailRefresher.stop();
    },
    methods: {
      ...mapActions('serviceChecks', ['getServiceChecks']),
      ...mapActions('webChecks', ['getWebChecks']),
      ...mapActions('customChecks', ['getCustomChecks']),
      ...mapActions('SNMPChecks', ['getSnmpChecks']),
      ...mapActions('frontmen', ['getFrontmen']),
      ...mapActions('hosts', ['getHostById']),
      ...mapMutations('hosts', [
        'toggleUpdateDialog',
        'toggleDeleteDialog',
        'toggleAgentDialog',
        'toggleAgentSetupHelpOverlay',
        'toggleCheckSuccessDialog',
        'toggleInventoryDialog',
        'setSelectedHost',
      ]),
      ...mapMutations('serviceChecks', [
        'toggleICMPCheckDialog',
        'toggleServiceCheckDialog',
        'resetSelectedServiceCheck',
        'resetSelectedServiceCheckToICMP',
        'resetSelectedServiceCheckToSSLCertificateCheck',
      ]),
      ...mapMutations('webChecks', [
        'toggleWebCheckDialog',
        'resetSelectedWebCheck',
      ]),
      ...mapMutations('customChecks', [
        'toggleCustomCheckDialog',
        'resetSelectedCustomCheck',
      ]),
      ...mapMutations('SNMPChecks', [
        'toggleSnmpCheckDialog',
        'resetSelectedSnmpCheck',
      ]),
      ...mapMutations('jobmonResults', ['toggleJobmonInfoDialog']),
      async getHost() {
        await this.getHostById({ id: this.$route.params.id });
      },
      editHost() {
        this.$axios.defaults.progress = false;
        this.setSelectedHost(this.Host);
        HostDetailRefresher.stop();
        this.toggleUpdateDialog(true);
      },
      onHostUpdate() {
        this.reRenderSetupInstructions();
        this.getConnectType();
        this.$axios.defaults.progress = true;
        HostDetailRefresher.start();
      },
      onCancelHostUpdate() {
        this.$axios.defaults.progress = true;
        HostDetailRefresher.start();
      },
      deleteHostWithConfirmation() {
        this.setSelectedHost(this.Host);
        this.toggleDeleteDialog();
      },
      onHostDelete() {
        this.$router.replace('/hosts');
      },
      triggerAction(action) {
        if (! (action.disableCondition ? action.disableCondition() : false)) {
          action.action();
        }
      },
      changeURLToCheckAdded() {
        const pageUrl = `/hosts/${this.$route.params.id}/check-added`;
        window.history.pushState({}, document.title, pageUrl);

        this.triggerRoute(pageUrl);
      },
      reRenderSetupInstructions() {
        this.setupAdviceKey++;
      },
      agentSetupFinished() {
        this.toggleAgentSetupHelpOverlay();
      },
      frontmanSetupFinished() {
        //
      },
      allSetupFinished() {
        //
      },
      agentSetupSkipped() {
        this.toggleAgentSetupHelpOverlay();
      },
      frontmanSetupSkipped() {
        //
      },
      allSetupSkipped() {
        //
      },
      allSetupCompleteOrSkipped() {
        this.showCheckCreationPanel = true;
      },
      getServiceCheckName(ServiceCheck) {
        let name = this.$t('checks.serviceCheck');
        if (! ServiceCheck) return name;

        if (ServiceCheck.isIcmpCheck) {
          name = this.$t('checks.ICMPCheck');
        }

        if (ServiceCheck.port) {
          if (!! this.testForSSLCertificateCheck(ServiceCheck)) {
            name = this.$t('checks.SSLCertificateCheckForPort', { port: ServiceCheck.port });
          } else {
            name = this.$t('checks.serviceCheckForPort', { port: ServiceCheck.port });
          }
        }

        return name;
      },
      async getConnectType() {
        this.hostLocation_resetConnectType();
        await this.hostLocation_checkConnectType(this.Host);
      },
      actionIcon({ isDeactivated, disableCondition }) {
        if (isDeactivated && !! isDeactivated()) return 'block';
        if (disableCondition && !! disableCondition()) return 'check';
        return 'add';
      },
      onAddICMPCheck({ ServiceCheck, success = true }) {
        if (success) {
          this.toggleICMPCheckDialog(false);
          this.$flash.success(this.$t('message.success.ICMPCheckAdd'));
          this.toggleCheckSuccessDialog();
          this.changeURLToCheckAdded();
          this.getHost();
        } else {
          if (! ServiceCheck.preflight) {
            this.$flash.error(this.$t('message.error.ICMPCheckAdd'));
          }
        }
      },
      onUpdateICMPCheck({ ServiceCheck, success = true }) {
        if (success) {
          this.toggleICMPCheckDialog(false);
          this.$flash.success(this.$t('message.success.serviceCheckSaved', {
            check: this.getServiceCheckName(ServiceCheck),
          }));
        } else {
          this.$flash.error(this.$t('message.error.serviceCheckSaved', {
            check: this.getServiceCheckName(ServiceCheck),
          }));
        }
      },
      onAddServiceCheck({ ServiceCheck, success = true }) {
        if (success) {
          this.toggleServiceCheckDialog(false);
          this.$flash.success(this.$t('message.success.serviceCheckAdd', {
            check: this.getServiceCheckName(ServiceCheck),
          }));
          this.toggleCheckSuccessDialog();
          this.changeURLToCheckAdded();
          this.getHost();
        } else {
          if (! ServiceCheck.preflight) {
            this.$flash.error(this.$t('message.error.serviceCheckAdd', {
              check: this.getServiceCheckName(ServiceCheck),
            }));
          }
        }
      },
      onUpdateServiceCheck({ ServiceCheck, success = true }) {
        if (success) {
          this.toggleServiceCheckDialog(false);
          this.$flash.success(this.$t('message.success.serviceCheckSaved', {
            check: this.getServiceCheckName(ServiceCheck),
          }));
        } else {
          this.$flash.error(this.$t('message.error.serviceCheckSaved', {
            check: this.getServiceCheckName(ServiceCheck),
          }));
        }
      },
      onDeleteServiceCheck({ ServiceCheck, success = true }) {
        if (success) {
          this.getHost();
          this.$flash.success(this.$t('message.success.serviceCheckDelete', {
            check: this.getServiceCheckName(ServiceCheck),
          }));
        } else {
          this.$flash.error(this.$t('message.error.serviceCheckDelete', {
            check: this.getServiceCheckName(ServiceCheck),
          }));
        }
      },
      onAddWebCheck({ WebCheck, success = true }) {
        if (success) {
          this.toggleWebCheckDialog(false);
          this.$flash.success(this.$t('message.success.webCheckAdd', {
            check: this.useWebCheckHelpers_urlPreview(WebCheck, this.Host),
          }));
          this.toggleCheckSuccessDialog();
          this.changeURLToCheckAdded();
          this.getHost();
        } else {
          if (! WebCheck.preflight) {
            this.$flash.error(this.$t('message.error.webCheckAdd', {
              check: this.useWebCheckHelpers_urlPreview(WebCheck, this.Host),
            }));
          }
        }
      },
      onUpdateWebCheck({ WebCheck, success = true }) {
        if (success) {
          this.toggleWebCheckDialog(false);
          this.$flash.success(this.$t('message.success.webCheckSaved', {
            check: this.useWebCheckHelpers_urlPreview(WebCheck, this.Host),
          }));
        } else {
          this.$flash.error(this.$t('message.error.webCheckSaved', {
            check: this.useWebCheckHelpers_urlPreview(WebCheck, this.Host),
          }));
        }
      },
      onDeleteWebCheck({ WebCheck, success = true }) {
        if (success) {
          this.getHost();
          this.$flash.success(this.$t('message.success.webCheckDelete', {
            check: this.useWebCheckHelpers_urlPreview(WebCheck, this.Host),
          }));
        } else {
          this.$flash.error(this.$t('message.error.webCheckDelete', {
            check: this.useWebCheckHelpers_urlPreview(WebCheck, this.Host),
          }));
        }
      },
      onAddCustomCheck({ CustomCheck, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.customCheckAdd', {
            check: CustomCheck.name,
          }));
          this.toggleCheckSuccessDialog();
          this.changeURLToCheckAdded();
          this.getHost();
        } else {
          this.$flash.error(this.$t('message.error.customCheckAdd', {
            check: CustomCheck.name,
          }));
        }
      },
      onUpdateCustomCheck({ CustomCheck, success = true }) {
        if (success) {
          this.toggleCustomCheckDialog(false);
          this.$flash.success(this.$t('message.success.customCheckSaved', {
            check: CustomCheck.name,
          }));
        } else {
          this.$flash.error(this.$t('message.error.customCheckSaved', {
            check: CustomCheck.name,
          }));
        }
      },
      onDeleteCustomCheck({ CustomCheck, success = true }) {
        if (success) {
          this.getHost();
          this.$flash.success(this.$t('message.success.customCheckDelete', {
            check: CustomCheck.name,
          }));
        } else {
          this.$flash.error(this.$t('message.error.customCheckDelete', {
            check: CustomCheck.name,
          }));
        }
      },
      onAddSNMPCheck({ success = true }) {
        if (success) {
          this.toggleSnmpCheckDialog(false);
          this.$flash.success(this.$t('message.success.SNMPCheckAdd'));
          this.toggleCheckSuccessDialog();
          this.changeURLToCheckAdded();
          this.getHost();
        } else {
          this.$flash.error(this.$t('message.error.SNMPCheckAdd'));
        }
      },
      onUpdateSNMPCheck({ success = true }) {
        if (success) {
          this.toggleSnmpCheckDialog(false);
          this.$flash.success(this.$t('message.success.SNMPCheckSaved'));
        } else {
          this.$flash.error(this.$t('message.error.SNMPCheckSaved'));
        }
      },
      onDeleteSNMPCheck({ success = true }) {
        if (success) {
          this.getHost();
          this.$flash.success(this.$t('message.success.SNMPCheckDelete'));
        } else {
          this.$flash.error(this.$t('message.error.SNMPCheckDelete'));
        }
      },
      onHostDeleteError(Host) {
        this.$flash.error(this.$t('message.error.hostDelete', { name: Host.name }));
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .border-right
    border-right: 1px solid rgba(0, 0, 0, .12)

  .icon-slash
    position: absolute;
    text-shadow: 1px -1px 0 white;
    transform: rotate(10deg);

  .add-check
    cursor: pointer;
    transition: opacity 0.2s ease-out, background 0.2s ease-out;

    &.disabled
      cursor: default;

      &:hover
        background: transparent;

    &:hover
      background: rgba(0, 0, 0, .04)

      .animated
        animation-iteration-count: unset

    &--preview
      cursor: default

      .v-btn
        opacity: 0.5
        cursor: default

      &:hover
        opacity: 1;

      .v-chip
        margin: -2px 4px 0

    &--large
      padding-bottom: 50px
      border: 1px solid rgba(0, 0, 0, 0.12)

      .v-card__actions
        position: absolute
        width: 94%
        bottom: 0
        left: 3%
        padding: 8px !important

  .selected-checks
    .check-card
      border-bottom-left-radius: 0
      border-bottom-right-radius: 0
      box-shadow: none;

      &:last-child
        border-bottom-left-radius: 2px
        border-bottom-right-radius: 2px
</style>
