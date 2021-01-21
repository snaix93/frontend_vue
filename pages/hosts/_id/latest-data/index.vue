<template>
  <v-layout column>
    <v-layout
      justify-center
      row
    >
      <PageToolbar
        v-if="!$fetchState.pending"
        class="hidden-print-only"
      >
        <v-tabs
          color="secondary"
          dark
        >
          <v-tabs-slider color="white"/>
          <AppBreadcrumbs :items="breadcrumbs"/>
          <v-divider
            class="ml-4 mr-2"
            vertical
          />
          <v-btn
            v-if="hasData"
            class="qa-btn-reload"
            color="primary"
            @click="reload()"
          >
            <v-icon
              small
            >
              autorenew
            </v-icon>
            <span class="hidden-sm-and-down ml-1">
              {{ $t('host.reloadData') | capitalize }}
            </span>
          </v-btn>
          <v-spacer/>
          <HostTabs :host-id="Host.id"/>
        </v-tabs>
      </PageToolbar>

      <AppWait :wait="$fetchState.pending || lockPanels"/>

      <v-flex
        v-if="!$fetchState.pending"
        class="hidden-print-only"
      >
        <v-alert
          :value="!hasData"
          class="text-xs-center mt-2 mb-2"
          color="primary"
          outline
        >
          <template
            v-if="Host.cagent || latestData.totalChecksCount > 0"
          >
            {{ $t('host.thisHostHasNoDataToShowAtThisMoment') | capitalize }}
          </template>

          <template v-else>
            <template v-if="$auth.user.isNotReadOnly()">
              {{ $t('host.youHaveNoChecks') | capitalize }}

              <v-btn
                :to="'/hosts/' + Host.id"
                color="primary"
                small
              >
                <v-icon
                  class="ml-1"
                  left
                  small
                >
                  add
                </v-icon>
                {{ $t('host.createCheck') | capitalize }}
              </v-btn>
            </template>
            <template v-else>
              {{ $t('host.noData') | capitalize }}
            </template>
          </template>
        </v-alert>

        <v-expansion-panel
          v-model="panels"
          expand
        >
          <!--TCP PORTS/SERVICE CHECKS-->
          <v-expansion-panel-content
            v-if="hasServiceChecksMeasurements"
            ref="serviceChecksMeasurements"
            :disabled="lockPanels"
            class="qa-service-checks-results"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.serviceChecksResults')"
                avatar-icon="settings_input_component"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                    v-html="getCheckStatsCount(latestData.serviceChecks)"
                  />
                </template>
              </ExpansionPanelHeader>
            </template>
            <div>
              <MeasurementsTable
                :graph-database="FRONTMAN_DB_NAME"
                :items="serviceCheckResultList"
                activate-charts
                @open-chart="showMeasurementChartDialog"
              />
            </div>
          </v-expansion-panel-content>

          <!--WEB CHECKS-->
          <v-expansion-panel-content
            v-if="hasWebChecksMeasurements"
            :disabled="lockPanels"
            class="qa-web-checks-results"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.webChecksResults')"
                avatar-icon="settings_system_daydream"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                    v-html="getCheckStatsCount(latestData.webChecks)"
                  />
                </template>
              </ExpansionPanelHeader>
            </template>
            <v-card flat>
              <v-card-text class="py-3 px-4">
                <v-expansion-panel>
                  <v-expansion-panel-content
                    v-for="(check, index) in latestData.webChecks"
                    :key="index"
                    :class="`qa-web-check${index}`"
                    class="grey lighten-4"
                  >
                    <template #header>
                      <div class="body-2">
                        {{ renderWebCheckHeader(check) }}
                      </div>
                    </template>
                    <MeasurementsTable
                      :graph-database="CAGENT_DB_NAME"
                      :items="check.measurements"
                      activate-charts
                      @open-chart="showMeasurementChartDialog"
                    />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <!--CUSTOM CHECKS-->
          <v-expansion-panel-content
            v-if="hasCustomChecksMeasurements"
            ref="customChecksMeasurements"
            :disabled="lockPanels"
            class="qa-custom-checks-results"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.customChecksResults')"
                avatar-icon="style"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                    v-html="getCheckStatsCount(latestData.customChecks)"
                  />
                </template>
              </ExpansionPanelHeader>
            </template>
            <div>
              <v-card flat>
                <v-card-text class="py-3 px-4">
                  <v-expansion-panel>
                    <v-expansion-panel-content
                      v-for="(check, index) in latestData.customChecks"
                      :key="index"
                      :class="`qa-custom-check-${check.check}`"
                      class="grey lighten-4"
                    >
                      <template #header>
                        <div class="body-2">
                          {{ check.check }}
                        </div>
                      </template>
                      <v-alert
                        :value="!!check.lastInfluxError"
                        class="my-0"
                        type="error"
                      >
                        <p class="subheading mt-0 mb-2">
                          {{ $t('host.errorStoringHistoricalData') | capitalize }}
                        </p>

                        <div class="font-monospace last-influx-error mb-2 pa-3">
                          {{ check.lastInfluxError }}
                        </div>

                        <p class="my-0">
                          {{ $t('host.changingDataTypesBetweenDataSubmissionsIsNotSupported') | capitalize }}
                        </p>
                      </v-alert>
                      <MeasurementsTable
                        :graph-database="CUSTOM_CHECK_DB_NAME"
                        :items="check.measurements"
                        :name-column="$tc('host.parameter', 1)"
                        :rule-wizard="{ checkType: ['customCheck'] }"
                        activate-charts
                        @open-chart="showMeasurementChartDialog"
                      />
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-card-text>
              </v-card>
            </div>
          </v-expansion-panel-content>

          <!--METRICS-->
          <v-expansion-panel-content
            v-if="hasCagentOsMetrics"
            ref="cagentMeasurements"
            :disabled="lockPanels"
            class="qa-metrics"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$tc('host.metric', 2)"
                avatar-icon="scatter_plot"
              >
                <template #default>
                  <v-flex xs12>
                    <v-layout
                      align-center
                      justify-start
                    >
                      <v-flex
                        class="qa-cpu caption text-uppercase font-weight-medium grey--text text--darken-1"
                        mr-1
                      >
                        {{ $t('host.cpuBusyTotal') | capitalize }}
                        <v-progress-linear
                          :color="
                            cpuUtilIdleTotal === null
                              ? 'grey lighten-2'
                              : 'error lighten-1'
                          "
                          :value="cpuUtilIdleTotal"
                          background-color="success"
                          class="check-value-graph ma-0"
                        />
                      </v-flex>
                      <v-flex
                        class="qa-memory caption text-uppercase font-weight-medium grey--text text--darken-1"
                      >
                        {{ $t('host.memoryAvailable') | capitalize }}
                        <v-progress-linear
                          :background-color="
                            memAvailable === null ? 'grey lighten-2' : 'success'
                          "
                          :color="
                            memAvailable === null ? 'grey lighten-2' : 'error lighten-1'
                          "
                          :value="memAvailable"
                          class="check-value-graph ma-0"
                        />
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </template>
              </ExpansionPanelHeader>
            </template>
            <div>
              <MeasurementsTable
                :graph-database="CAGENT_DB_NAME"
                :items="latestData.cagent.osMetrics"
                :rule-wizard="{ checkType: ['cagent'] }"
                activate-charts
                @open-chart="showMeasurementChartDialog"
              />
            </div>
          </v-expansion-panel-content>

          <!--GRAPHS (QUICK)-->
          <v-expansion-panel-content
            v-if="hasCagentMeasurements"
            ref="measurementQuickCharts"
            :disabled="lockPanels"
            class="qa-quick-graphs"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$tc('host.graphsQuickView')"
                avatar-icon="timeline"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                  >
                    {{ $tc('phrase.disk', 1) }}, {{ $t('phrase.memory') }},
                    {{ $t('phrase.cpu') }}, {{ $t('phrase.network') }}
                  </v-flex>
                </template>
              </ExpansionPanelHeader>
            </template>
            <template #default>
              <keep-alive>
                <v-card v-if="measurementsQuickChartPanelOpen">
                  <v-card-text class="pa-4">
                    <MeasurementsCharts
                      :Host="Host"
                      :actions="['period']"
                      :charts="chart_quickCharts"
                      :default-from="chart_quickChartDefaultFrom"
                      :default-to="chart_chartDefaultTo"
                      :timezone="timezone"
                      hide-legend
                      overwrite-view="full"
                      quick-view
                      sync-charts
                    />
                  </v-card-text>
                </v-card>
              </keep-alive>
            </template>
          </v-expansion-panel-content>

          <!--GRAPHS-->
          <v-expansion-panel-content
            v-if="hasCagentMeasurements"
            ref="measurementCharts"
            :disabled="lockPanels"
            class="qa-graphs"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$tc('host.graphsExpertView')"
                avatar-icon="timeline"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                  >
                    {{ $tc('phrase.disk', 1) }}, {{ $t('phrase.memory') }},
                    {{ $t('phrase.cpu') }}, {{ $t('phrase.network') }}
                  </v-flex>
                </template>
              </ExpansionPanelHeader>
            </template>
            <template #default>
              <keep-alive>
                <v-card v-if="measurementsChartPanelOpen">
                  <v-card-text class="pa-4">
                    <MeasurementsCharts
                      :Host="Host"
                      :charts="charts"
                      :default-from="chart_chartDefaultFrom"
                      :default-to="chart_chartDefaultTo"
                      :timezone="timezone"
                    />
                  </v-card-text>
                </v-card>
              </keep-alive>
            </template>
          </v-expansion-panel-content>

          <!--PROCESSES-->
          <v-expansion-panel-content
            v-if="hasCagentProcesses"
            :disabled="lockPanels"
            class="qa-processes"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$tc('host.process', 2)"
                avatar-icon="settings"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                  >
                    <div
                      v-for="(state, i) in processStates"
                      :key="state.state"
                      class="d-inline ma-0 pa-0"
                    >
                      <span v-if="i > 0">,</span>
                      {{ state.count }} {{ $t(`host.processStates.${state.state}`) }}
                    </div>
                  </v-flex>
                </template>
              </ExpansionPanelHeader>
            </template>
            <ProcessesTable
              :Host="Host"
              :items="latestData.cagent.processes"
            />
          </v-expansion-panel-content>

          <!--SERVICES (NEED TO UPGRADE AGENT)-->
          <v-expansion-panel-content
            v-if="
              cAgentVersion !== '0'
                && compareVersions(cAgentVersion, '1.0.4') === -1
            "
            class="qa-services-upgrade-required"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.services.name')"
                :upgrade-panel="true"
                avatar-icon="build"
              />
            </template>
            <v-card>
              <v-card-text>
                <div class="caption pa-3 grey lighten-2">
                  <v-layout
                    align-center
                    row
                    wrap
                  >
                    <v-flex
                      mr-2
                      shrink
                    >
                      <v-icon color="grey">
                        error
                      </v-icon>
                    </v-flex>
                    <v-flex
                      md5
                      xs12
                      v-html="$t('host.services.pleaseUpgradeYourAgent', {
                        url: 'https://docs.cloudradar.io/configuring-hosts/installing-agents/upgrading-the-agent'
                      })"
                    />
                  </v-layout>
                </div>
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <!--SERVICES-->
          <v-expansion-panel-content
            v-else-if="hasCagentServices"
            :disabled="lockPanels"
            class="qa-services"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.services.name')"
                avatar-icon="build"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                  >
                    <template v-for="(state, i) in serviceStates">
                      <span :key="state.state">
                        <template
                          v-if="i > 0"
                        >,
                        </template>
                        {{ state.count }} {{ $t(`host.serviceStates.${state.state.replace('-', '')}`) }}
                      </span>
                    </template>
                  </v-flex>
                </template>
              </ExpansionPanelHeader>
            </template>
            <ServicesTable
              :Host="Host"
              :items="latestData.cagent.services"
            />
          </v-expansion-panel-content>

          <!--LISTENING PORTS-->
          <v-expansion-panel-content
            v-if="hasListeningPorts"
            :disabled="lockPanels"
            class="qa-listening-ports"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.listeningPorts.title')"
                avatar-icon="settings_input_hdmi"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                  >
                    <template v-for="(protocol, i) in listeningPortProtocols">
                      <span :key="protocol.protocol">
                        <template
                          v-if="i > 0"
                        >,
                        </template>
                        {{ protocol.count }} {{ protocol.protocol }}
                      </span>
                    </template>
                  </v-flex>
                </template>
              </ExpansionPanelHeader>
            </template>
            <ListeningPortsTable
              :items="latestData.cagent.listeningports"
            />
          </v-expansion-panel-content>

          <!--LISTENING PORTS (NEED TO UPGRADE AGENT)-->
          <v-expansion-panel-content
            v-else-if="hasCagentMeasurements && !hasListeningPorts"
            :disabled="lockPanels"
            class="qa-listening-ports-upgrade-required"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.listeningPorts.title')"
                :upgrade-panel="true"
                avatar-icon="settings_input_hdmi"
              />
            </template>
            <div class="caption ma-2 pa-3 grey lighten-2">
              <v-layout
                align-center
                row
                wrap
              >
                <v-flex
                  mr-2
                  shrink
                >
                  <v-icon color="grey darken-1">
                    error
                  </v-icon>
                </v-flex>
                <v-flex
                  md5
                  xs12
                  v-html="$t('host.listeningPorts.pleaseUpgradeYourAgent', {
                    url: 'https://docs.cloudradar.io/configuring-hosts/installing-agents/upgrading-the-agent'
                  })"
                />
              </v-layout>
            </div>
          </v-expansion-panel-content>

          <!--HYPER V METRICS-->
          <v-expansion-panel-content
            v-if="hasHyperVMetrics"
            :disabled="lockPanels"
            class="qa-hyper-v-metrics"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.hyperVMetrics.name')"
                avatar-icon="storage"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                  >
                    <template v-for="(state, i) in hyperVStates">
                      <span
                        :key="state.state"
                        :class="
                          state.key === 'shutdown' && state.count > 0
                            ? 'error--text'
                            : ''
                        "
                      >
                        <template
                          v-if="i > 0"
                        >,
                        </template>
                        {{ state.count }} {{ state.state }}
                      </span>
                    </template>
                  </v-flex>
                </template>
              </ExpansionPanelHeader>
            </template>
            <HyperVMetricsTable
              :host="Host"
              :items="latestData.cagent.hyperv"
            />
          </v-expansion-panel-content>

          <!--DOCKER-->
          <v-expansion-panel-content
            v-if="hasDockerImages"
            :disabled="lockPanels"
            class="qa-docker"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.docker.name')"
                avatar-icon="fab fa-docker"
                icon-size="14px"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                    v-html="renderDockerStates"
                  />
                </template>
              </ExpansionPanelHeader>
            </template>
            <DockerTable
              :items="latestData.cagent.docker"
            />
          </v-expansion-panel-content>

          <!--TEMPS-->
          <v-expansion-panel-content
            v-if="hasTemperatures"
            ref="temperaturesChart"
            :disabled="lockPanels"
            class="qa-temperatures"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.temperatures.title')"
                avatar-icon="fa-thermometer-half"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                  >
                    <template v-for="(state, i) in temperatureStates">
                      <span :key="state.state">
                        <template
                          v-if="i > 0"
                        >,
                        </template>
                        {{ state.count }} {{ $t(`host.temperatures.states.${state.state}`) }}
                      </span>
                    </template>
                  </v-flex>
                </template>
              </ExpansionPanelHeader>
            </template>
            <template #default>
              <keep-alive>
                <v-card v-if="temperaturesChartPanelOpen">
                  <v-card-text class="pa-4">
                    <TemperatureCharts
                      :Host="Host"
                      :default-from="chart_chartDefaultFrom"
                      :default-to="chart_chartDefaultTo"
                      :temperatures="latestData.cagent.temperatures"
                      :timezone="timezone"
                    />
                  </v-card-text>
                </v-card>
              </keep-alive>
            </template>
          </v-expansion-panel-content>

          <!--CPU Utilization Snapshots-->
          <v-expansion-panel-content
            v-if="hasCPUSnapshots"
            ref="cpuSnapshots"
            :disabled="lockPanels"
            class="qa-cpu-snapshots"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.cpuSnapshots.title')"
                avatar-icon="photo_camera"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                  >
                    <div v-html="cpuSnapshotsSummary"/>
                  </v-flex>
                </template>
              </ExpansionPanelHeader>
            </template>

            <SnapshotsTable @on-fetch="renderCPUSnapshotsSummary"/>
          </v-expansion-panel-content>

          <!--CPU Utilization Snapshots (NEED TO UPGRADE AGENT)-->
          <v-expansion-panel-content
            v-else-if="cAgentVersion !== '0' && compareVersions(cAgentVersion, '1.1.0') === -1"
            class="qa-cpu-snapshots-upgrade-required"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.cpuSnapshots.title')"
                avatar-icon="photo_camera"
              />
            </template>
            <v-card>
              <v-card-text>
                <div class="caption pa-3 grey lighten-2">
                  <v-layout
                    align-center
                    row
                    wrap
                  >
                    <v-flex
                      mr-2
                      shrink
                    >
                      <v-icon color="grey">
                        error
                      </v-icon>
                    </v-flex>
                    <v-flex
                      v-html="$t('host.cpuSnapshots.pleaseUpgradeYourAgent', {
                        url: 'https://docs.cloudradar.io/configuring-hosts/installing-agents/upgrading-the-agent',
                      })"
                    />
                  </v-layout>
                </div>
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <!--Job Monitoring Results -->
          <v-expansion-panel-content
            v-if="hasJobmonResults"
            ref="jobmonResults"
            :disabled="lockPanels"
            class="qa-jobmon-results"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.jobmonResults.title')"
                avatar-icon="desktop_mac"
              >
                <template #default>
                  <v-flex
                    v-if="!!jobmonResultsSummary"
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                  >
                    <div v-html="jobmonResultsSummary"/>
                  </v-flex>
                  <v-flex v-else>
                    <v-progress-circular
                      :size="22"
                      :width="2"
                      color="secondary"
                      indeterminate
                    />
                  </v-flex>
                </template>
              </ExpansionPanelHeader>
            </template>
            <JobmonResultsTable
              @on-fetch="renderJobmonResultsSummary"
              @on-delete="onDeleteJobmonResult"
            />
          </v-expansion-panel-content>

          <!--SNMP CHECKS-->
          <v-expansion-panel-content
            v-if="hasSNMPChecksMeasurements"
            ref="snmpChecksMeasurements"
            :disabled="lockPanels"
            class="qa-snmp-check-results"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.SNMPCheckResults')"
                avatar-icon="settings_ethernet"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                    v-html="getCheckStatsCount(latestData.snmpChecks)"
                  />
                </template>
              </ExpansionPanelHeader>
            </template>
            <div>
              <v-card>
                <v-card-text class="pa-4">
                  <v-expansion-panel expand>
                    <v-expansion-panel-content
                      v-for="check in latestData.snmpChecks"
                      :key="check.preset"
                      :class="`qa-${check.preset}`"
                    >
                      <template #header>
                        <div>{{ check.preset | capitalize }}</div>
                      </template>
                      <template v-if="!check.hasSubItems">
                        <MeasurementsTable
                          :graph-database="FRONTMAN_DB_NAME"
                          :items="check.measurements"
                          disable-search
                        />
                      </template>
                      <template v-else>
                        <v-card>
                          <v-card-text>
                            <v-expansion-panel
                              expand
                              popout
                            >
                              <v-expansion-panel-content
                                v-for="measurement in check.measurements"
                                :key="measurement.name"
                              >
                                <template #header>
                                  <div>{{ measurement.name }}</div>
                                </template>
                                <!-- temporarily deactivate rule wizard as long as snmp rules processor is broken -->
                                <MeasurementsTable
                                  :graph-database="FRONTMAN_DB_NAME"
                                  :items="measurement.measurements"
                                  disable-search
                                  @open-chart="showMeasurementChartDialog"
                                />
                                <!--MeasurementsTable
                                  :graph-database="FRONTMAN_DB_NAME"
                                  :items="measurement.measurements"
                                  :rule-wizard="{ checkType: ['snmpCheck'], checkKeys: ['ifOut_Bps', 'ifIn_Bps', 'ifOutUtilization_percent', 'ifInUtilization_percent'] }"
                                  activate-charts
                                  disable-search
                                  @open-chart="showMeasurementChartDialog"
                                /-->
                              </v-expansion-panel-content>
                            </v-expansion-panel>
                          </v-card-text>
                        </v-card>
                      </template>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-card-text>
              </v-card>
            </div>
          </v-expansion-panel-content>

          <!--HARDWARE INVENTORY-->
          <v-expansion-panel-content
            v-if="hasHardwareInventory"
            :disabled="lockPanels"
            class="qa-hardware-inventory"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.hardwareInventory.title')"
                avatar-icon="fa-microchip"
                icon-size="14px"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                  >
                    <template v-for="(snippet, i) in hardwareInventorySnippets">
                      <span :key="snippet.name">
                        <template
                          v-if="i > 0"
                        >,
                        </template>
                        {{ snippet.value }} {{ $t(`host.hardwareInventory.${snippet.name}`) }}
                      </span>
                    </template>
                  </v-flex>
                </template>
              </ExpansionPanelHeader>
            </template>
            <v-card class="grey-gradient">
              <v-card-text class="pa-4">
                <HardwareInventory
                  :value="latestData.cagent.hwInventory.hwInventory"
                />
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <!--HARDWARE INVENTORY (NEED TO UPGRADE AGENT)-->
          <v-expansion-panel-content
            v-else-if="hasCagentMeasurements && !hasHardwareInventory"
            :disabled="lockPanels"
            class="qa-hardware-inventory-upgrade-required"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.hardwareInventory.title')"
                :upgrade-panel="true"
                avatar-icon="fa-microchip"
              />
            </template>
            <div class="caption ma-2 pa-3 grey lighten-2">
              <v-layout
                align-center
                row
                wrap
              >
                <v-flex
                  mr-2
                  shrink
                >
                  <v-icon color="grey darken-1">
                    error
                  </v-icon>
                </v-flex>
                <v-flex
                  md5
                  xs12
                  v-html="$t('host.hardwareInventory.pleaseUpgradeYourAgent', {
                    url: 'https://docs.cloudradar.io/configuring-hosts/installing-agents/upgrading-the-agent'
                  })"
                />
              </v-layout>
            </div>
          </v-expansion-panel-content>

          <!--SMART DISK HEALTH-->
          <v-expansion-panel-content
            v-if="hasSmartmon"
            :disabled="lockPanels"
            class="qa-smartmon"
          >
            <template #header>
              <ExpansionPanelHeader
                :title="$t('host.smartmon.title')"
                avatar-icon="fa-hdd"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                  >
                    <div v-html="renderDiskHealthSummary"/>
                  </v-flex>
                </template>
              </ExpansionPanelHeader>
            </template>
            <template #default>
              <v-card>
                <v-card-text class="pa-4">
                  <DiskHealthInventory
                    :disks="latestData.cagent.smartmon.disks"
                    :messages="latestData.cagent.smartmon.messages"
                  />
                </v-card-text>
              </v-card>
            </template>
          </v-expansion-panel-content>

          <!--MODULES-->
          <v-expansion-panel-content
            v-if="hasModules"
            :disabled="lockPanels"
            class="qa-modules"
          >
            <template #header>
              <ExpansionPanelHeader
                :icon-color="modulesSeverityColor"
                :title="$tc('host.modules.module', 2)"
                avatar-icon="widgets"
              >
                <template #default>
                  <v-flex
                    class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                    v-html="modulesStates"
                  />
                </template>
              </ExpansionPanelHeader>
            </template>
            <div class="pt-1 pb-4 px-4">
              <Modules
                :items="latestData.cagent.modules"
              />
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <HyperVMetricDialog :hyper-v-metric="selectedHyperVMetric"/>
        <JobmonResultDialog v-if="jobmonResultDialog"/>
      </v-flex>
    </v-layout>
    <AppPrintOutput>
      <portal-target
        multiple
        name="charts-print-output-header"
      />
      <portal-target
        class="layout d-flex row wrap"
        multiple
        name="charts-print-output"
      />
    </AppPrintOutput>

    <AddRuleForCustomKeyDialog
      v-if="addRuleForCustomKeyDialog"
      @on-create="onAddRuleForCustomKey"
    />
    <AddRuleForSNMPDialog
      v-if="addRuleForSNMPDialog"
      @on-create="onAddRuleForSNMP"
    />

    <MeasurementChartDialog
      v-if="Host && selectedMeasurement && selectedChart"
      :charts="[selectedChart]"
      :measurement="selectedMeasurement"
    />
  </v-layout>
</template>

<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
  import { sortBy, take, } from 'lodash-es';
  import compareVersions from 'compare-versions';

  import AppBreadcrumbs from '@/components/App/AppBreadcrumbs';
  import AppPrintOutput from '@/components/App/AppPrintOutput';
  import AppWait from '@/components/App/AppWait';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import MeasurementsTable from '@/components/Hosts/Measurements/MeasurementsTable';
  import MeasurementsCharts from '@/components/Hosts/Measurements/MeasurementsCharts';
  import HyperVMetricsTable from '@/components/Hosts/Measurements/HyperVMetricsTable';
  import HyperVMetricDialog from '@/components/Hosts/Measurements/HyperVMetricDialog';
  import DockerTable from '@/components/Hosts/Measurements/DockerTable';
  import ProcessesTable from '@/components/Hosts/Processes/ProcessesTable';
  import ServicesTable from '@/components/Hosts/Services/ServicesTable';
  import ListeningPortsTable from '@/components/Hosts/ListeningPorts/ListeningPortsTable';
  import TemperatureCharts from '@/components/Hosts/Temperatures/TemperatureCharts';
  import HardwareInventory from '@/components/Hosts/Hardware/Inventory';
  import DiskHealthInventory from '@/components/Hosts/Hardware/DiskHealthInventory';
  import SnapshotsTable from '@/components/Hosts/CPUSnapshots/SnapshotsTable';
  import Modules from '@/components/Hosts/Modules/Modules';
  import HostTabs from '@/components/Hosts/HostTabs';
  import ExpansionPanelHeader from '@/components/Hosts/ExpansionPanelHeader';
  import AddRuleForCustomKeyDialog from '@/components/Hosts/Measurements/AddRuleForCustomKeyDialog';
  import AddRuleForSNMPDialog from '@/components/Hosts/Measurements/AddRuleForSNMPDialog';
  import MeasurementChartDialog from '@/components/Hosts/Measurements/MeasurementChartDialog';
  import JobmonResultsTable from '@/components/Hosts/JobmonResults/JobmonResultsTable';
  import JobmonResultDialog from '@/components/Hosts/JobmonResults/JobmonResultDialog';

  import appMixins from '@/mixins/app';
  import hostMixins from '@/mixins/host';
  import chartMixins from '@/mixins/chart';
  import userMixins from '@/mixins/user';
  import hyperVMetricsMixins from '@/mixins/hyperVMetrics';
  import inventoryMixins from '@/mixins/inventory';
  import moduleMixins from '@/mixins/module';

  export default {
    layout: 'admin',
    components: {
      AppBreadcrumbs,
      AppPrintOutput,
      AppWait,
      PageToolbar,
      MeasurementsTable,
      MeasurementsCharts,
      HyperVMetricsTable,
      HyperVMetricDialog,
      DockerTable,
      ProcessesTable,
      ServicesTable,
      ListeningPortsTable,
      TemperatureCharts,
      HardwareInventory,
      DiskHealthInventory,
      SnapshotsTable,
      Modules,
      HostTabs,
      ExpansionPanelHeader,
      AddRuleForCustomKeyDialog,
      AddRuleForSNMPDialog,
      MeasurementChartDialog,
      JobmonResultsTable,
      JobmonResultDialog,
    },
    mixins: [
      appMixins,
      hostMixins,
      chartMixins,
      userMixins,
      hyperVMetricsMixins,
      inventoryMixins,
      moduleMixins,
    ],
    async fetch() {
      await this.getHost();
      await this.getLatestData({ Host: this.Host });

      this.panelPreset = this.panelCount;
      this.chart_setChartPeriodDefaults(true);
      this.lockPanels = false;
    },
    data() {
      return {
        panels: [],
        charts: [
          {
            endpoint: 'fs_percent',
            options: {
              tooltips: {
                callbacks: {
                  label: (tooltipItem, data) => `${
                    data.datasets[tooltipItem.datasetIndex].label
                  }: ${this.chart_formatPercent(tooltipItem.yLabel)}`,
                },
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      callback: value => this.chart_formatPercent(value),
                    },
                  },
                ],
              },
            },
            dataset: {
              global: {
                fill: false,
              },
            },
          },
          {
            endpoint: 'fs_total_bytes',
            options: {
              tooltips: {
                callbacks: {
                  label: (tooltipItem, data) => `${
                    data.datasets[tooltipItem.datasetIndex].label
                  }: ${this.chart_formatBytes(tooltipItem.yLabel)}`,
                },
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      callback: value => this.chart_formatBytes(value),
                    },
                  },
                ],
              },
            },
            dataset: {
              global: {
                fill: false,
              },
            },
          },
          {
            endpoint: 'memory_usage_percent',
            options: {
              tooltips: {
                callbacks: {
                  label: (tooltipItem, data) => `${
                    data.datasets[tooltipItem.datasetIndex].label
                  }: ${this.chart_formatPercent(tooltipItem.yLabel)}`,
                },
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      callback: value => this.chart_formatPercent(value),
                    },
                  },
                ],
              },
            },
            dataset: {
              global: {
                fill: false,
              },
              single: 'freeSpaceColoring',
            },
          },
          {
            endpoint: 'memory_bytes',
            options: {
              tooltips: {
                callbacks: {
                  label: (tooltipItem, data) => `${
                    data.datasets[tooltipItem.datasetIndex].label
                  }: ${this.chart_formatBytes(tooltipItem.yLabel)}`,
                },
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      callback: value => this.chart_formatBytes(value),
                    },
                  },
                ],
              },
            },
            dataset: {
              global: {
                fill: false,
              },
              single: 'freeSpaceColoring',
            },
          },
          {
            endpoint: 'cpu_utilization_total_percent',
            options: {
              legend: {
                tooltip: {
                  preprocessor: this.chart_cpuTooltipPreprocessor,
                },
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      callback: value => this.chart_formatPercent(value),
                    },
                  },
                ],
              },
            },
            dataset: {
              global: {
                fill: false,
              },
              single: 'freeSpaceColoring',
            },
          },
          {
            endpoint: 'net_per_s',
            options: {
              tooltips: {
                callbacks: {
                  label: (tooltipItem, data) => `${
                    data.datasets[tooltipItem.datasetIndex].label
                  }: ${this.chart_formatBytesPerSecond(tooltipItem.yLabel)}`,
                },
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      callback: value => this.chart_formatBytesPerSecond(value),
                    },
                  },
                ],
              },
            },
          },
        ],
        selectedChart: null,
        measurementsChartPanelOpen: false,
        measurementsQuickChartPanelOpen: false,
        temperaturesChartPanelOpen: false,
        lockPanels: true,
        cpuSnapshotsSummary: '',
        jobmonResultsSummary: '',
      };
    },
    computed: {
      ...mapState('hosts', [
        'Host',
        'cpuUtilizationSnapshots',
        'selectedHyperVMetric',
        'selectedMeasurement',
        'addRuleForCustomKeyDialog', 'addRuleForSNMPDialog'
      ]),
      ...mapState('jobmonResults', ['jobmonResultDialog']),
      ...mapGetters('hosts', ['latestData']),
      timezone() {
        return this.$auth.team.timezone;
      },
      hasData() {
        return this.hasCagentMeasurements
               || this.hasServiceChecksMeasurements
               || this.hasWebChecksMeasurements
               || this.hasCustomChecksMeasurements
               || this.hasSNMPChecksMeasurements;
      },
      hasCagentMeasurements() {
        return !! this.latestData.cagent.dataUpdatedAt;
      },
      hasServiceChecksMeasurements() {
        return this.latestData.hasOwnProperty('serviceChecks');
      },
      hasWebChecksMeasurements() {
        return !! this.latestData.webChecks?.length;
      },
      hasCustomChecksMeasurements() {
        return !! this.latestData.customChecks?.length;
      },
      hasSNMPChecksMeasurements() {
        return !! this.latestData.snmpChecks?.length;
      },
      hasCagentOsMetrics() {
        return this.latestData.cagent.osMetrics?.length;
      },
      hasCagentProcesses() {
        return !! this.latestData.cagent.processes?.length;
      },
      hasCagentServices() {
        return !! this.latestData.cagent.services?.length;
      },
      hasListeningPorts() {
        return !! this.latestData.cagent.listeningports?.length;
      },
      hasTemperatures() {
        return !! this.latestData.cagent.temperatures?.length;
      },
      hasCPUSnapshots() {
        return this.latestData.cagent.cpuUtilisationSnapshots.available > 0;
      },
      hasJobmonResults() {
        return this.latestData.cagent.jobmonResults.available > 0;
      },
      hasHardwareInventory() {
        return !! this.latestData.cagent.hwInventory?.hwInventory?.length;
      },
      hasSmartmon() {
        return 'smartmon' in this.latestData.cagent;
      },
      hasHyperVMetrics() {
        return !! this.latestData.cagent.hyperv?.length;
      },
      hasDockerImages() {
        return !! this.latestData.cagent.docker?.length;
      },
      hasModules() {
        return !! this.latestData.cagent.modules?.length;
      },
      panelPreset: {
        get() {
          return this.panels;
        },
        set(newValue) {
          if (newValue === 1) {
            this.panels = [...Array(newValue).keys()].map(() => true);
          } else if (newValue > 1) {
            this.panels = [...Array(newValue).keys()].map(() => false);
          } else {
            this.panels = [];
          }
        },
      },
      panelCount() {
        let panelCount = 0;
        if (this.hasCagentMeasurements) {
          panelCount += 2; // panels for measurements table and graphs
        }
        if (this.hasCagentProcesses) {
          panelCount++;
        }
        if (this.hasServiceChecksMeasurements) {
          panelCount++;
        }
        if (this.hasWebChecksMeasurements) {
          panelCount++;
        }
        if (this.hasCustomChecksMeasurements) {
          panelCount++;
        }
        if (this.hasSNMPChecksMeasurements) {
          panelCount++;
        }
        if (this.hasCagentServices) {
          panelCount++;
        }
        if (this.hasListeningPorts) {
          panelCount++;
        }
        if (this.hasTemperatures) {
          panelCount++;
        }
        if (this.hasCPUSnapshots) {
          panelCount++;
        }
        if (this.hasHardwareInventory) {
          panelCount++;
        }
        if (this.hasHyperVMetrics) {
          panelCount++;
        }
        if (this.hasDockerImages) {
          panelCount++;
        }
        if (this.hasModules) {
          panelCount++;
        }
        return panelCount;
      },
      processStates() {
        const processStates = [];
        const possibleStates = [
          'blocked',
          'zombie',
          'stopped',
          'running',
          'sleeping',
          'dead',
          'paging',
          'idle',
          'suspended',
        ];
        if (this.hasCagentProcesses) {
          possibleStates.forEach((state) => {
            const filteredProcesses = this.latestData.cagent.processes.filter(
              process => process.State === state || process.state === state,
            );
            const processStateObj = {
              state,
              count: filteredProcesses.length,
            };
            processStates.push(processStateObj);
          });
        }
        return processStates;
      },
      serviceStates() {
        const serviceStates = [];
        const possibleStates = ['exited', 'dead', 'failed', 'running', 'auto-restart'];

        if (this.hasCagentServices) {
          possibleStates.forEach((state) => {
            const filteredServices = this.latestData.cagent.services.filter(
              service => service.state && service.state.toLowerCase() === state,
            );
            const serviceStateObj = {
              state,
              count: filteredServices.length,
            };
            serviceStates.push(serviceStateObj);
          });
        }
        return serviceStates;
      },
      listeningPortProtocols() {
        const protocols = {};

        if (this.hasListeningPorts) {
          this.latestData.cagent.listeningports.forEach((listeningPort) => {
            if (! listeningPort.proto) return;

            if (! protocols[listeningPort.proto]) {
              protocols[listeningPort.proto] = {
                count: 1,
                protocol: listeningPort.proto,
              };
            } else {
              protocols[listeningPort.proto].count++;
            }
          });
        }

        const result = sortBy(Object.values(protocols), 'count').reverse();

        return take(result, 8);
      },
      temperatureStates() {
        const states = {
          critical: 0,
          warm: 0,
          ok: 0,
          cold: 0,
        };

        if (this.hasTemperatures) {
          this.latestData.cagent.temperatures.forEach((temperature) => {
            if (temperature.critical_threshold === 0) return;

            const base = temperature.critical_threshold / 4;

            if (temperature.temperature >= (base * 4)) {
              states.critical++;
            } else if (temperature.temperature >= (base * 3)) {
              states.warm++;
            } else if (temperature.temperature >= (base * 2)) {
              states.ok++;
            } else {
              states.cold++;
            }
          });
        }

        return Object.keys(states)
                     .map(state => ({ state, count: states[state] }))
                     .filter(state => !! state.count);
      },
      hardwareInventorySnippets() {
        const snippets = {
          cpu_total: 0,
          cpu_cores: 0,
          threads: 0,
          ram_size: 0,
          pci_devices: 0,
          usb_devices: 0,
        };

        if (this.hasHardwareInventory) {
          for (let agentInventory of this.latestData.cagent.hwInventory.hwInventory) {
            let agentCpuData = this.inventory_cpuData(agentInventory);

            snippets.cpu_total += agentCpuData.cpu_total;
            snippets.cpu_cores += agentCpuData.cpu_cores;
            snippets.threads += agentCpuData.threads;

            let i = 0;

            while (i < 1000) {
              if (agentInventory.hasOwnProperty(`ram.${i}.size_B`)) {
                snippets.ram_size += Number(agentInventory[`ram.${i}.size_B`]);
              } else {
                break;
              }
              i++;
            }

            if (agentInventory.hasOwnProperty('pci.list') && agentInventory['pci.list'].length)
              snippets.pci_devices += agentInventory['pci.list'].length;

            if (agentInventory.hasOwnProperty('usb.list') && agentInventory['usb.list'].length)
              snippets.usb_devices += agentInventory['usb.list'].length;
          }
        }

        return Object.keys(snippets).map((snippet) => {
          let value;
          if (snippet === 'ram_size') {
            value = this.filesize(snippets[snippet]);
          } else {
            value = parseInt(snippets[snippet]);
          }
          return { name: snippet, value };
        }).filter(snippet => !! snippet.value);
      },
      hyperVStates() {
        const result = [
          {
            count: 0,
            key: 'total',
            state: this.$t('host.hyperVMetrics.VMsTotal'),
          },
          {
            count: 0,
            key: 'running',
            state: this.$t('phrase.running'),
          },
          {
            count: 0,
            key: 'shutdown',
            state: this.$t('phrase.shutdown'),
          },
        ];

        if (this.hasHyperVMetrics) {
          this.latestData.cagent.hyperv.forEach((m) => {
            result[0].count++;

            if (m.health_state && m.enabled_state.toLowerCase() === 'running') {
              result[1].count++;
            } else if (
              m.health_state
              && m.enabled_state.toLowerCase() === 'shutdown'
            ) {
              result[2].count++;
            }
          });
        }

        return result;
      },
      renderDockerStates() {
        const container = this.latestData.cagent.docker;
        const containerCount = container.length;

        const successCount = container.filter(
          ({ state }) => (state.toLowerCase() === 'running')
        ).length;
        const errorCount = container.filter(
          ({ state }) => (state.toLowerCase() === 'stopped')
        ).length;

        const result = [
          `${containerCount} ${this.$tc('host.docker.container', containerCount)}`,
        ];

        if (successCount > 0)
          result.push(`<span
            class="success--text font-weight-bold">
              ${successCount} ${this.$tc('phrase.running', successCount)}
          </span>`);

        if (errorCount > 0)
          result.push(`<span
            class="error--text font-weight-bold">
              ${errorCount} ${this.$tc('phrase.stopped', errorCount)}
          </span>`);

        return result.join(', ');
      },
      serviceCheckResultList() {
        return this.latestData.serviceChecks.reduce(
          (acc, value) => [...acc, ...value.measurements],
          [],
        );
      },
      cpuUtilIdleTotal() {
        let result = null;

        if (this.hasCagentOsMetrics) {
          this.latestData.cagent.osMetrics.forEach((item) => {
            if (
              item.key === 'cpu.util.idle.1.total'
              && ! isNaN(item.value)
              && item.value !== null
            ) {
              result = 100 - item.value;
            }
          });
        }

        return result;
      },
      memAvailable() {
        let result = null;

        if (this.hasCagentOsMetrics) {
          this.latestData.cagent.osMetrics.forEach((item) => {
            if (item.key === 'mem.available_percent' && ! isNaN(item.value)) {
              result = 100 - item.value;
            }
          });
        }

        return result;
      },
      renderDiskHealthSummary() {
        const disks = this.latestData.cagent.smartmon.disks;
        const diskCount = disks.length;
        const messages = this.latestData.cagent.smartmon.messages;
        const messageCount = messages.length;
        const acceptableStates = ['passed', 'not available'];
        const errorCount = disks.filter(
          disk => ! disk.smart_status
                  || acceptableStates.indexOf(disk.smart_status.toLowerCase()) === -1
        ).length;

        const result = [
          `${diskCount} ${this.$tc('phrase.disk', diskCount)}`,
        ];

        if (messageCount > 0)
          result.push(`${messageCount} ${this.$tc('phrase.message', messageCount)}`,);

        result.push(`<span
          class="${errorCount ? 'error--text font-weight-bold' : 'success--text'}">
            ${errorCount} ${this.$tc('phrase.error', errorCount)}
        </span>`);

        return result.join(', ');
      },
      mergedModules() {
        const result = {
          alerts: [],
          warnings: [],
          measurements: {},
          modulesCount: 0
        };

        this.latestData.cagent.modules.forEach(({ alerts, warnings }) => {
          result.alerts.push(...alerts);
          result.warnings.push(...warnings);
          result.modulesCount++;
        });

        return result;
      },
      modulesStates() {
        return this.severityCounter(this.mergedModules, true);
      },
      modulesSeverityColor() {
        return this.severityColor(this.mergedModules);
      }
    },
    watch: {
      panels() {
        setTimeout(async () => {
          if (this.$refs.measurementCharts && this.$refs.measurementCharts.$el) {
            this.measurementsChartPanelOpen = this.$refs.measurementCharts.$el.getAttribute(
              'aria-expanded',
            ) !== null;
          }

          if (this.$refs.measurementQuickCharts && this.$refs.measurementQuickCharts.$el) {
            this.measurementsQuickChartPanelOpen = this.$refs.measurementQuickCharts.$el.getAttribute(
              'aria-expanded',
            ) !== null;
          }

          if (this.$refs.temperaturesChart && this.$refs.temperaturesChart.$el) {
            this.temperaturesChartPanelOpen = this.$refs.temperaturesChart.$el.getAttribute(
              'aria-expanded',
            ) !== null;
          }
        }, 50);
      },
    },
    methods: {
      compareVersions,
      ...mapMutations('hosts', [
        'setSelectedMeasurement',
        'toggleGraphDialog', 'toggleAddRuleForCustomKeyDialog', 'toggleAddRuleForSNMPDialog'
      ]),
      ...mapActions('hosts', ['getHostById', 'getLatestData']),
      async getHost() {
        await this.getHostById({ id: this.$route.params.id });
      },
      async reload(lockPanels = true) {
        this.$bus.$emit('reloadData');
        let panels;

        if (lockPanels) {
          this.lockPanels = true;

          panels = JSON.parse(JSON.stringify(this.panels));
          this.panels = [];
        }

        await this.getLatestData({ Host: this.Host });
        this.chart_setChartPeriodDefaults(true);

        if (lockPanels) {
          this.panels = panels;
          this.lockPanels = false;
        }

        this.$bus.$emit('reloadDataComplete');
      },
      renderCPUSnapshotsSummary({ summary }) {
        this.cpuSnapshotsSummary = summary;
      },
      renderJobmonResultsSummary({ summary }) {
        this.jobmonResultsSummary = summary;
      },
      showMeasurementChartDialog({ measurement, graphDatabase }) {
        const endpoint = measurement.key,
          db = graphDatabase;

        this.selectedChart = {
          endpoint,
          db,
          singleKey: true,
          options: {
            tooltips: {
              callbacks: {
                label: (tooltipItem, data) => `${
                  data.datasets[tooltipItem.datasetIndex].label
                }: ${this.chart_formatValuesByUnit(tooltipItem.yLabel, measurement.unit)}`,
              },
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    callback: value => this.chart_formatValuesByUnit(value, measurement.unit),
                  },
                },
              ],
            },
          },
        };

        this.setSelectedMeasurement(measurement);
        this.toggleGraphDialog(true);
      },
      renderWebCheckHeader({ check }) {
        const expected = check.expectedPattern ?
                         `(${check.expectedHttpStatus}) (${check.expectedPattern})` :
                         `(${check.expectedHttpStatus})`;

        return `${check.method.toUpperCase()} ${check.url} ${expected}`;
      },
      getCheckStatsCount(measurements, includeErrors = true) {
        const result = [];

        const checksCountObj = this.getChecksCount(measurements.length);
        const errorsCountObj = this.getErrorsCount(measurements);

        const checks = `${checksCountObj.count} ${checksCountObj.phrase}`;

        result.push(checks);

        if (includeErrors) {
          const errors = `<span class="${
            errorsCountObj.count ? 'error--text font-weight-bold' : 'success--text'
          }">${errorsCountObj.count} ${errorsCountObj.phrase}</span>`;

          result.push(errors);
        }


        return result.join(', ');
      },
      getChecksCount(count) {
        return {
          count,
          phrase: this.$tc('phrase.check', count),
        };
      },
      getErrorsCount(measurements) {
        let count = 0;

        if (measurements.length) {
          measurements.forEach((check) => {
            if (check.hasOwnProperty('success')) {
              if (check.success === 0) {
                count++;
              }
            } else {
              count += check.measurements.filter(
                m => ((
                        m.key?.toLowerCase() === 'success'
                        || m.key.includes('.success')
                      ) && m.value === 0)
                     || ((
                           !! m.key.match(/\..*alert/i)
                           || !! m.key.match(/\..*warning$/i)
                         )
                         && !! m.value
                         && m.value !== 0
                         && m.value !== '0'
                         && m.value !== 'null'),
              ).length;
            }
          });
        }

        return {
          count,
          phrase: this.$tc('phrase.error', count),
        };
      },
      onDeleteJobmonResult({ JobmonResult, success = true }) {
        if (success) {
          this.reload(false);
          this.$flash.success(this.$t('message.success.jobDelete', {
            key: JobmonResult.jobId,
          }));
        } else {
          this.$flash.error(this.$t('message.error.jobDelete', {
            key: JobmonResult.jobId,
          }));
        }
      },
      onAddRuleForCustomKey({ success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.ruleAddFromWizardSuccess'));
          this.toggleAddRuleForCustomKeyDialog();
        } else {
          this.$flash.error(this.$t('message.error.ruleAdd'));
        }
      },
      onAddRuleForSNMP({ success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.ruleAddFromWizardSuccess'));
          this.toggleAddRuleForSNMPDialog();
        } else {
          this.$flash.error(this.$t('message.error.ruleAdd'));
        }
      },
    },
  };
</script>

<style lang="stylus" scoped>
  a
    color: white

  .check-value-graph
    max-width: 180%

  .v-expansion-panel__container--active
    background-color: #eeeeee !important

  .grey-gradient
    background: linear-gradient(to bottom, #cfd8dc 0%, #eceff1 100%);

  .last-influx-error
    background: rgba(0, 0, 0, 0.2);
</style>
