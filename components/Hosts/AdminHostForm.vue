<template>
  <form
    class="v-card white position-relative"
    data-cy="hostForm"
    @submit.prevent="onSubmit"
  >
    <v-card>
      <v-card-title
        v-if="isCreatingHost"
        class="py-2 grey lighten-3"
      >
        <v-toolbar-title>
          {{ formTitle | capitalize }}
        </v-toolbar-title>
        <v-spacer/>
        <v-btn
          :disabled="waitConditionSubmit"
          class="titlecase"
          flat
          @click="showAddHostGuide"
        >
          <v-icon left>
            live_help
          </v-icon>
          {{ $t('button.showGuide') }}
        </v-btn>
      </v-card-title>
      <v-card-title
        v-if="isUpdatingHost"
        class="py-2 grey lighten-3"
      >
        <span class="headline">
          {{ formTitle | capitalize }}
        </span>
        <v-spacer/>
        <v-btn
          class="mr-0"
          icon
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider/>

      <v-card-text
        :style="isUpdatingHost ? 'max-height: 75vh': ''"
        class="pa-0"
      >
        <v-container
          fluid
          grid-list-md
          pa-3
        >
          <BackendValidationAlert/>
          <v-alert
            :value="isCreatingPrivateHostWithoutAvailableFrontman"
            class="mb-4"
            type="warning"
          >
            {{ $t('host.pleaseEnterAValidPublicIPAddress') | capitalize }}
          </v-alert>

          <v-layout row wrap>
            <v-flex sm6 xs12>
              <VeeFormGroup
                key="name"
                :error-bag="validationErrors"
                :label="formFieldLabels('name') | capitalize"
                :rules="validationRules.name"
                validation-key="name"
              >
                <template #default="prop">
                  <v-text-field
                    v-model="Host.name"
                    v-validate="prop.rules"
                    :data-vv-name="prop.validationKey"
                    :error-messages="prop.firstErrorMessage"
                    :hint="$t('form.field.hostNameHint')"
                    :label="prop.label"
                    data-cy="addHostName"
                    data-vv-validate-on="change"
                    persistent-hint
                  >
                    <template #prepend-inner>
                      <GuideLabel
                        v-if="guide.fetch('active')"
                        :is-required="guide.fetch('name.required')"
                      />
                    </template>
                  </v-text-field>
                </template>
              </VeeFormGroup>
            </v-flex>
            <v-flex sm6 xs12>
              <VeeFormGroup
                key="connect"
                :error-bag="validationErrors"
                :label="formFieldLabels('connect') | capitalize"
                :rules="validationRules.connect"
                validation-key="connect"
              >
                <template #default="prop">
                  <v-text-field
                    v-model="Host.connect"
                    v-validate="prop.rules"
                    :data-vv-name="prop.validationKey"
                    :error-messages="prop.firstErrorMessage"
                    :hint="showCagentHint"
                    :label="prop.label"
                    :persistent-hint="Host.cagent"
                    data-cy="connect"
                    data-vv-validate-on="blur"
                    @change="getConnectType"
                    @keydown="hostLocation_resetConnectType"
                    @keydown.enter.stop.prevent="getConnectTypeThenSubmit"
                  >
                    <template #prepend-inner>
                      <GuideLabel
                        v-if="guide.fetch('active')"
                        :is-required="guide.fetch('connect.required')"
                      />
                    </template>
                    <template #append>
                      <ConnectChip
                        :connect-type="hostLocation_connectType"
                        :loading="isUpdatingHost && (waitConditionConnect || initiating)"
                      />
                    </template>
                  </v-text-field>
                </template>
              </VeeFormGroup>
            </v-flex>
          </v-layout>

          <v-layout
            align-end
            row wrap
          >
            <v-flex sm6 xs12>
              <VeeFormGroup
                key="description"
                :error-bag="validationErrors"
                :label="formFieldLabels('description') | capitalize"
                :rules="validationRules.description"
                validation-key="description"
              >
                <template #default="prop">
                  <v-text-field
                    v-model="Host.description"
                    v-validate="prop.rules"
                    :data-vv-name="prop.validationKey"
                    :error-messages="prop.firstErrorMessage"
                    :label="prop.label"
                    data-vv-validate-on="blur"
                    hint=" "
                    persistent-hint
                  >
                    <template #prepend-inner>
                      <GuideLabel
                        v-if="guide.fetch('active')"
                        :is-required="guide.fetch('description.required')"
                      />
                    </template>
                  </v-text-field>
                </template>
              </VeeFormGroup>
            </v-flex>
            <v-flex sm6 xs12>
              <VeeFormGroup
                key="tags"
                #default="prop"
                :error-bag="validationErrors"
                :label="formFieldLabels('tags') | capitalize"
                :rules="validationRules.tags"
                data-cy="addTag"
                validation-key="tags"
              >
                <v-combobox
                  ref="formInputTags"
                  v-model="Host.tags"
                  v-validate="prop.rules"
                  :data-vv-name="prop.validationKey"
                  :error-messages="prop.firstErrorMessage"
                  :hint="$t('form.hint.tags')"
                  :items="existingTags"
                  :search-input.sync="tagsSearch"
                  append-icon=""
                  clearable
                  data-vv-validate-on="change|blur"
                  deletable-chips
                  hide-selected
                  multiple
                  persistent-hint
                  small-chips
                  @change="tagsInput"
                >
                  <template #label>
                    {{ prop.label }}
                  </template>
                  <template #selection="data">
                    <v-chip
                      v-if="data.item"
                      :key="JSON.stringify(data.item)"
                      :color="useValidation_tag(data.item) ? 'primary' : 'error'"
                      :disabled="data.disabled"
                      :selected="data.selected"
                      class="pb-0 mb-0"
                      close
                      small
                      text-color="white"
                      @input="removeTag(data.item)"
                    >
                      {{ data.item }}
                    </v-chip>
                  </template>
                  <template #prepend-inner>
                    <GuideLabel
                      v-if="guide.fetch('active')"
                      :is-required="guide.fetch('tags.required')"
                    />
                  </template>
                </v-combobox>
              </VeeFormGroup>
            </v-flex>
          </v-layout>

          <v-layout
            v-if="showFrontmanSection"
            align-baseline
          >
            <v-flex
              v-if="isCreatingHost && initiating"
              sm6 xs12
            >
              <v-text-field>
                <template #prepend-inner>
                  <v-progress-circular
                    color="grey lighten-2"
                    indeterminate
                    size="20"
                  />
                </template>
              </v-text-field>
            </v-flex>
            <template v-else>
              <template v-if="showMonitoringLocationDropdown">
                <v-flex sm6 xs12>
                  <VeeFormGroup
                    key="frontman"
                    :error-bag="validationErrors"
                    :label="formFieldLabels('monitoringLocation') | capitalize"
                    :rules="validationRules.frontman"
                    data-cy="frontman"
                    validation-key="frontman"
                  >
                    <template #default="prop">
                      <v-select
                        v-model="Host.frontman"
                        v-validate="prop.rules"
                        :data-vv-name="prop.validationKey"
                        :error-messages="prop.firstErrorMessage"
                        :hint="monitoringLocationsHint"
                        :items="monitoringLocations"
                        :label="prop.label"
                        data-cy="test"
                        data-vv-validate-on="blur"
                        item-text="location"
                        item-value="id"
                        persistent-hint
                        return-object
                      >
                        <template #selection="{ item }">
                          <v-layout align-center class="w-full" ma-0 pa-0>
                            <v-flex>{{ item.location }}</v-flex>
                            <v-flex shrink>
                              <v-chip
                                v-if="frontmanIsTeamDefault(item)"
                                :disabled="true"
                                class="ma-0"
                                color="green"
                                small
                                text-color="white"
                              >
                                {{ $t('frontman.teamDefault') | titlecase }}
                              </v-chip>
                            </v-flex>
                          </v-layout>
                        </template>
                        <template #prepend-inner>
                          <GuideLabel
                            v-if="guide.fetch('active')"
                            :is-required="guide.fetch('frontman.required')"
                          />
                        </template>
                        <template #append-outer>
                          <HelpTooltip :tooltip="$tooltip('HOST_FORM_FRONTMAN')"/>
                        </template>
                        <template #item="{ item }">
                          <v-icon
                            color="secondary"
                            left
                            small
                          >
                            {{ item.type === 'private' ? 'vpn_lock' : 'public' }}
                          </v-icon>
                          <v-chip
                            v-if="item.type === 'private'"
                            class="mr-2"
                            color="grey lighten-2"
                            label
                            small
                            text-color="grey darken-3"
                          >
                            {{ $t('phrase.private') | capitalize }}
                          </v-chip>
                          <v-flex grow>
                            {{ item.location }}
                          </v-flex>
                          <v-chip
                            v-if="frontmanIsTeamDefault(item)"
                            :disabled="true"
                            class="mt-0"
                            color="green"
                            small
                            text-color="white"
                          >
                            {{ $t('frontman.teamDefault') | titlecase }}
                          </v-chip>
                        </template>
                      </v-select>
                    </template>
                  </VeeFormGroup>
                </v-flex>
                <v-flex shrink>
                  <v-btn
                    color="secondary"
                    flat
                    small
                    @click="createFrontman"
                  >
                    {{ $t('phrase.orCreateNew') }}
                  </v-btn>
                </v-flex>
              </template>
              <v-flex
                v-if="!showMonitoringLocationDropdown"
                sm6 xs12
              >
                <VeeFormGroup
                  key="frontman"
                  :error-bag="validationErrors"
                  :label="formFieldLabels('frontmanDescription') | capitalize"
                  :rules="validationRules.frontman"
                  validation-key="frontman"
                >
                  <template #default="prop">
                    <v-text-field
                      v-model="Host.frontman.location"
                      v-validate="prop.rules"
                      :data-vv-name="prop.validationKey"
                      :error-messages="prop.firstErrorMessage"
                      :hint="monitoringLocationsHint"
                      :label="prop.label"
                      data-vv-validate-on="blur"
                      persistent-hint
                    >
                      <template #append-outer>
                        <HelpTooltip :tooltip="$tooltip('HOST_FORM_FRONTMAN')"/>
                      </template>
                      <template #prepend-inner>
                        <GuideLabel
                          v-if="guide.fetch('active')"
                          :is-required="guide.fetch('frontman.required')"
                        />
                      </template>
                    </v-text-field>
                  </template>
                </VeeFormGroup>
              </v-flex>
            </template>
          </v-layout>

          <v-layout
            v-if="showSubUnitSection"
            align-baseline
          >
            <v-flex
              v-if="isCreatingHost && initiating"
              sm6 xs12
            >
              <v-text-field>
                <template #prepend-inner>
                  <v-progress-circular
                    color="grey lighten-2"
                    indeterminate
                    size="20"
                  />
                </template>
              </v-text-field>
            </v-flex>
            <template v-else>
              <v-flex sm6 xs12>
                <VeeFormGroup
                  key="subUnit"
                  :error-bag="validationErrors"
                  :label="formFieldLabels('subUnit') | capitalize"
                  :rules="validationRules.subUnit"
                  data-cy="subUnit"
                  validation-key="subUnit"
                >
                  <template #default="prop">
                    <v-select
                      v-model="Host.subUnit"
                      v-validate="prop.rules"
                      :data-vv-name="prop.validationKey"
                      :error-messages="prop.firstErrorMessage"
                      :items="subUnits"
                      :label="prop.label"
                      clearable
                      data-vv-validate-on="blur"
                      item-text="shortId"
                      item-value="id"
                      persistent-hint
                      return-object
                    >
                      <template #selection="{item}">
                        <div class="layout align-baseline ma-0">
                          <span class="body-2 d-inline-block mr-2">
                            {{ item.shortId }}
                          </span>
                          <span class="text-truncate caption d-inline-block">
                            ({{ item.name }})
                          </span>
                        </div>
                      </template>
                      <template #item="{item}">
                        <div class="layout align-baseline ma-0">
                          <span class="body-2 d-inline-block mr-2">
                            {{ item.shortId }}
                          </span>
                          <span class="text-truncate caption d-inline-block">
                            ({{ item.name }})
                          </span>
                        </div>
                      </template>
                    </v-select>
                  </template>
                </VeeFormGroup>
              </v-flex>
              <v-flex shrink>
                <v-btn
                  color="secondary"
                  flat
                  small
                  @click="createSubUnit"
                >
                  {{ $t('phrase.orCreateNew') }}
                </v-btn>
              </v-flex>
            </template>
          </v-layout>

          <v-layout
            v-if="isUpdatingHost || guide.fetch('agent.show')"
            align-content-center
            fill-height
            row
            wrap
          >
            <v-flex
              sm6
              xs12
            >
              <v-checkbox
                v-model="Host.cagent"
                :hide-details="!guide.fetch('agent.hint')"
                :hint="guide.fetch('agent.hint')"
                :label="$t('host.osMonitoringWithCagent') | capitalize"
                :persistent-hint="!!guide.fetch('agent.hint')"
              >
                <template #prepend>
                  <GuideLabel
                    v-if="guide.fetch('active')"
                    :is-required="guide.fetch('agent.required')"
                  />
                </template>
                <template #append>
                  <HelpTooltip
                    :tooltip="$tooltip('HOST_FORM_AGENT')"
                  />
                </template>
              </v-checkbox>
            </v-flex>
          </v-layout>

          <v-layout
            align-center
            row
            wrap
          >
            <v-flex
              sm6
              xs12
            >
              <VeeFormGroup
                key="muted"
                :error-bag="validationErrors"
                :label="$t('host.enableAlerting') | capitalize"
                :rules="validationRules.muted"
                validation-key="muted"
              >
                <template #default="prop">
                  <v-checkbox
                    v-model="enableAlerting"
                    v-validate="prop.rules"
                    :data-vv-name="prop.validationKey"
                    :error-messages="prop.firstErrorMessage"
                    :label="prop.label"
                    data-vv-validate-on="input"
                    hide-details
                  >
                    <template #append>
                      <HelpTooltip :tooltip="$tooltip('HOST_FORM_MUTED')"/>
                    </template>
                  </v-checkbox>
                </template>
              </VeeFormGroup>
            </v-flex>
            <v-flex
              sm6
              xs12
            >
              <VeeFormGroup
                key="dashboard"
                :error-bag="validationErrors"
                :label="$t('host.showOnDashboard') | capitalize"
                :rules="validationRules.dashboard"
                validation-key="dashboard"
              >
                <template #default="prop">
                  <v-checkbox
                    v-model="Host.dashboard"
                    v-validate="prop.rules"
                    :data-vv-name="prop.validationKey"
                    :error-messages="prop.firstErrorMessage"
                    :label="prop.label"
                    data-vv-validate-on="input"
                    hide-details
                  />
                </template>
              </VeeFormGroup>
            </v-flex>
          </v-layout>
        </v-container>

        <v-expand-transition>
          <div
            v-show="Host.connect && snmpIsEnabled"
            class="snmp-panel"
          >
            <v-fade-transition>
              <div v-show="snmp">
                <v-divider/>
                <div class="snmp-panel__help">
                  <v-icon
                    color="grey"
                    small
                  >
                    info
                  </v-icon>
                  <a
                    href="https://docs.cloudradar.io/configuring-hosts/adding-hosts#activate-snmp"
                    target="_blank"
                  >
                    {{ $t('host.snmp.helpLink') }}
                  </a>
                </div>
              </div>
            </v-fade-transition>
            <v-expansion-panel
              :value="snmpPanel"
              class="elevation-0"
              expand
            >
              <v-expansion-panel-content
                :key="0"
                :class="{ 'grey lighten-5': snmp }"
                hide-actions
              >
                <template #header>
                  <v-checkbox
                    :input-value="snmp"
                    :label="$t('host.snmp.enable')"
                    class="ma-0"
                    hide-details
                    @click.stop.prevent="snmp = !snmp"
                  />
                </template>

                <v-card class="grey lighten-5">
                  <v-card-text class="pt-0">
                    <v-container grid-list-md pa-0>
                      <v-layout row>
                        <v-flex sm6 xs12>
                          <v-layout row>
                            <v-flex sm6 xs12>
                              <VeeFormGroup
                                key="snmpProtocol"
                                :error-bag="validationErrors"
                                :label="$t('host.snmp.protocol')"
                                :rules="validationRules.snmpProtocol"
                                validation-key="snmpProtocol"
                              >
                                <template #default="prop">
                                  <v-select
                                    v-model="Host.snmp.protocol"
                                    v-validate="prop.rules"
                                    :data-vv-as="$t('host.snmp.protocol')"
                                    :data-vv-name="prop.validationKey"
                                    :error-messages="prop.firstErrorMessage"
                                    :items="snmpSettings.protocols"
                                    :label="prop.label"
                                    data-vv-validate-on="blur"
                                  />
                                </template>
                              </VeeFormGroup>
                            </v-flex>
                            <v-flex sm6 xs12>
                              <VeeFormGroup
                                v-if="snmpV3"
                                key="snmpSecurityLevel"
                                :error-bag="validationErrors"
                                :label="$t('host.snmp.securityLevel')"
                                :rules="validationRules.snmpSecurityLevel"
                                validation-key="snmpSecurityLevel"
                              >
                                <template #default="prop">
                                  <v-select
                                    v-model="Host.snmp.securityLevel"
                                    v-validate="prop.rules"
                                    :data-vv-as="$t('host.snmp.securityLevel')"
                                    :data-vv-name="prop.validationKey"
                                    :error-messages="prop.firstErrorMessage"
                                    :items="snmpSettings.securityLevels"
                                    :label="prop.label"
                                    data-vv-validate-on="blur"
                                  />
                                </template>
                              </VeeFormGroup>
                            </v-flex>
                          </v-layout>
                        </v-flex>
                        <v-flex sm6 xs12>
                          <VeeFormGroup
                            v-if="snmpV2"
                            key="snmpCommunity"
                            :error-bag="validationErrors"
                            :label="$t('host.snmp.communityString')"
                            :rules="validationRules.snmpCommunity"
                            validation-key="snmpCommunity"
                          >
                            <template #default="prop">
                              <v-text-field
                                v-model="Host.snmp.community"
                                v-validate="prop.rules"
                                :data-vv-as="$t('host.snmp.communityString')"
                                :data-vv-name="prop.validationKey"
                                :error-messages="prop.firstErrorMessage"
                                :label="prop.label"
                                data-vv-validate-on="blur"
                                hint=" "
                                persistent-hint
                              />
                            </template>
                          </VeeFormGroup>

                          <VeeFormGroup
                            v-if="snmpV3Auth"
                            key="snmpUsername"
                            :error-bag="validationErrors"
                            :label="$t('host.snmp.username')"
                            :rules="validationRules.snmpUsername"
                            validation-key="snmpUsername"
                          >
                            <template #default="prop">
                              <v-text-field
                                v-model="Host.snmp.username"
                                v-validate="prop.rules"
                                :data-vv-as="$t('host.snmp.username')"
                                :data-vv-name="prop.validationKey"
                                :error-messages="prop.firstErrorMessage"
                                :label="prop.label"
                                data-vv-validate-on="blur"
                                hint=" "
                                persistent-hint
                              />
                            </template>
                          </VeeFormGroup>
                        </v-flex>
                      </v-layout>
                      <v-layout v-if="snmpV3Auth">
                        <v-flex sm6 xs12>
                          <v-layout>
                            <v-flex sm6 xs12>
                              <VeeFormGroup
                                v-if="snmpV3Auth"
                                key="snmpAuthenticationProtocol"
                                :error-bag="validationErrors"
                                :label="$t('host.snmp.authenticationProtocol')"
                                :rules="validationRules.snmpAuthenticationProtocol"
                                validation-key="snmpAuthenticationProtocol"
                              >
                                <template #default="prop">
                                  <v-select
                                    v-model="Host.snmp.authenticationProtocol"
                                    v-validate="prop.rules"
                                    :data-vv-as="$t('host.snmp.authenticationProtocol')"
                                    :data-vv-name="prop.validationKey"
                                    :error-messages="prop.firstErrorMessage"
                                    :items="snmpSettings.authenticationProtocols"
                                    :label="prop.label"
                                    data-vv-validate-on="blur"
                                  />
                                </template>
                              </VeeFormGroup>
                            </v-flex>
                            <v-flex sm6 xs12>
                              <VeeFormGroup
                                v-if="snmpV3Auth"
                                key="snmpAuthenticationPassword"
                                :error-bag="validationErrors"
                                :label="$t('host.snmp.authenticationPassword')"
                                :rules="validationRules.snmpAuthenticationPassword"
                                validation-key="snmpAuthenticationPassword"
                              >
                                <template #default="prop">
                                  <v-text-field
                                    v-model="Host.snmp.authenticationPassword"
                                    v-validate="prop.rules"
                                    :data-vv-as="$t('host.snmp.authenticationPassword')"
                                    :data-vv-name="prop.validationKey"
                                    :error-messages="prop.firstErrorMessage"
                                    :label="prop.label"
                                    data-vv-validate-on="blur"
                                    hint=" "
                                    persistent-hint
                                  />
                                </template>
                              </VeeFormGroup>
                            </v-flex>
                          </v-layout>
                        </v-flex>
                        <v-flex sm6 xs12>
                          <v-layout v-if="snmpV3Priv">
                            <v-flex sm6 xs12>
                              <VeeFormGroup
                                v-if="snmpV3Priv"
                                key="snmpPrivacyProtocol"
                                :error-bag="validationErrors"
                                :label="$t('host.snmp.privacyProtocol')"
                                :rules="validationRules.snmpPrivacyProtocol"
                                validation-key="snmpPrivacyProtocol"
                              >
                                <template #default="prop">
                                  <v-select
                                    v-model="Host.snmp.privacyProtocol"
                                    v-validate="prop.rules"
                                    :data-vv-as="$t('host.snmp.privacyProtocol')"
                                    :data-vv-name="prop.validationKey"
                                    :error-messages="prop.firstErrorMessage"
                                    :items="snmpSettings.privacyProtocols"
                                    :label="prop.label"
                                    data-vv-validate-on="blur"
                                  />
                                </template>
                              </VeeFormGroup>
                            </v-flex>
                            <v-flex sm6 xs12>
                              <VeeFormGroup
                                v-if="snmpV3Priv"
                                key="snmpPrivacyPassword"
                                :error-bag="validationErrors"
                                :label="$t('host.snmp.privacyPassword')"
                                :rules="validationRules.snmpPrivacyPassword"
                                validation-key="snmpPrivacyPassword"
                              >
                                <template #default="prop">
                                  <v-text-field
                                    v-model="Host.snmp.privacyPassword"
                                    v-validate="prop.rules"
                                    :data-vv-as="$t('host.snmp.privacyPassword')"
                                    :data-vv-name="prop.validationKey"
                                    :error-messages="prop.firstErrorMessage"
                                    :label="prop.label"
                                    data-vv-validate-on="blur"
                                    hint=" "
                                    persistent-hint
                                  />
                                </template>
                              </VeeFormGroup>
                            </v-flex>
                          </v-layout>
                        </v-flex>
                      </v-layout>
                      <v-layout row>
                        <v-flex sm6 xs12>
                          <VeeFormGroup
                            v-if="snmp"
                            key="snmpTimeout"
                            :error-bag="validationErrors"
                            :label="$t('host.snmp.timeout')"
                            :rules="validationRules.snmpTimeout"
                            validation-key="snmpTimeout"
                          >
                            <template #default="prop">
                              <v-text-field
                                v-model="Host.snmp.timeout"
                                v-validate="prop.rules"
                                :data-vv-as="$t('host.snmp.timeout')"
                                :data-vv-name="prop.validationKey"
                                :error-messages="prop.firstErrorMessage"
                                :label="prop.label"
                                data-vv-validate-on="blur"
                                hint=" "
                                persistent-hint
                              />
                            </template>
                          </VeeFormGroup>
                        </v-flex>
                        <v-flex sm6 xs12>
                          <VeeFormGroup
                            v-if="snmp"
                            key="snmpPort"
                            :error-bag="validationErrors"
                            :label="$t('host.snmp.port')"
                            :rules="validationRules.snmpPort"
                            validation-key="snmpPort"
                          >
                            <template #default="prop">
                              <v-text-field
                                v-model="Host.snmp.port"
                                v-validate="prop.rules"
                                :data-vv-as="$t('host.snmp.port')"
                                :data-vv-name="prop.validationKey"
                                :error-messages="prop.firstErrorMessage"
                                :label="prop.label"
                                data-vv-validate-on="blur"
                                hint=" "
                                persistent-hint
                              />
                            </template>
                          </VeeFormGroup>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-divider/>

      <v-card-actions>
        <v-btn
          :disabled="waitConditionSubmit || waitConditionConnect"
          flat
          @click="onCancel"
        >
          {{ $t('button.cancel') }}
        </v-btn>
        <v-spacer/>
        <v-btn
          :depressed="isCreatingHost"
          :disabled="waitConditionSubmit || waitConditionConnect || isCreatingPrivateHostWithoutAvailableFrontman"
          :flat="isUpdatingHost"
          color="primary"
          data-cy="submit"
          type="submit"
          @mousedown="submitFlag = true"
          @mouseup="submitFlag = false"
        >
          <v-progress-circular
            v-if="waitConditionSubmit || waitConditionConnect"
            :size="20"
            :width="2"
            color="secondary"
            indeterminate
          />
          <template v-else>
            {{ $t('button.save') }}
          </template>
        </v-btn>
      </v-card-actions>
    </v-card>

    <AddHostGuideDialog
      v-if="isCreatingHost"
      :hide="hideGuideDialog"
      data-cy="hostDialog"
      @host-guide:add-public-host="guideForPublicHost"
      @host-guide:add-private-agent-host="guideForAgentHost"
      @host-guide:add-private-frontman-host="guideForFrontmanHost"
    />
    <SubUnitDialog
      v-if="subUnitDialog"
      @on-create="onCreateSubUnit"
    />
    <FrontmanDialog
      v-if="frontmanDialog"
      @on-create="onCreateFrontman"
    />

    <AppWait
      :wait="$wait.is([$WAIT_FOR.HOST.CREATE, $WAIT_FOR.HOST.UPDATE])"
    >
      <template v-if="isCreatingHost">
        {{ $t('message.wait.hostAdd') | capitalize }}
      </template>
      <template v-else>
        {{ $t('message.wait.hostUpdate') | capitalize }}
      </template>
    </AppWait>
  </form>
</template>

<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
  import AddHostGuideDialog from '@/components/Hosts/Guide/GuideDialog';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import FrontmanDialog from '@/components/Frontmen/FrontmanDialog';
  import SubUnitDialog from '@/components/SubUnits/SubUnitDialog';
  import GuideLabel from '@/components/Hosts/Guide/GuideLabel';
  import useValidationMixins from '@/mixins/useValidation';
  import ConnectChip from '@/components/Hosts/ConnectChip';
  import hostLocationMixins from '@/mixins/hostLocation';
  import HelpTooltip from '@/components/App/HelpTooltip';
  import Guide from '@/components/Hosts/Guide/Guide';
  import AppWait from '@/components/App/AppWait';
  import Frontman from '@/models/Frontman';
  import SubUnit from '@/models/SubUnit';
  import userMixins from '@/mixins/user';
  import appMixins from '@/mixins/app';
  import Host from '@/models/Host';

  export default {
    components: {
      AddHostGuideDialog,
      FrontmanDialog,
      SubUnitDialog,
      ConnectChip,
      HelpTooltip,
      GuideLabel,
      AppWait,
    },
    mixins: [
      useBackendValidation,
      useValidationMixins,
      hostLocationMixins,
      userMixins,
      appMixins,
    ],
    props: {
      Host: {
        type: Host,
        required: true,
      },
    },
    data() {
      return {
        initiating: true,
        tags: [],
        guide: new Guide(this),
        tagsSearch: null,
        snmpPanel: [],
        snmpSettings: {
          protocols: [
            { text: 'SNMP v2', value: 'v2' },
            { text: 'SNMP v3', value: 'v3' },
          ],
          securityLevels: [
            { text: 'no auth', value: 'noAuthNoPriv' },
            { text: 'auth no priv', value: 'authNoPriv' },
            { text: 'auth priv', value: 'authPriv' },
          ],
          authenticationProtocols: ['sha', 'md5'],
          privacyProtocols: ['des', 'aes'],
          defaultTimeout: 5,
          defaultPort: 161,
        },
        submitFlag: false,
        hideGuideDialog: false,
      };
    },
    mounted() {
      let { guide } = this.$route.query;

      if (guide) {
        guide = guide.toLowerCase();
        const lookup = {
          'public-host': this.guideForPublicHost,
          'private-agent-host': this.guideForAgentHost,
          'private-frontman-host': this.guideForFrontmanHost,
        };

        if (lookup[guide] !== undefined) {
          this.hideGuideDialog = true;
          lookup[guide]();
        }

      }
    },
    computed: {
      ...mapState('frontmen', ['frontmen', 'frontmanDialog']),
      ...mapState('subUnits', ['subUnits', 'subUnitDialog']),
      ...mapState('refData', ['publicFrontmen']),
      ...mapGetters('frontmen', ['lastCreatedFrontman']),
      ...mapGetters('subUnits', ['lastCreatedSubUnit']),
      monitoringLocations() {
        const locations = [];
        if (this.accountHasFrontmen) {
          locations.push(...this.frontmen);
        }
        locations.push(...this.publicFrontmen);

        return locations
          .map(({ id, location, type }) => ({ id, location, type }))
          .filter(({ type }) => {
            return (this.hostLocation_connectIsPrivate && type === 'private')
                   || ! this.hostLocation_connectIsPrivate;
          });
      },
      showFrontmanSection() {
        if (this.isCreatingHost && this.guide.fetch('active')) {
          return this.guide.fetch('frontman.show');
        }

        return ! (this.Host.hasMonitoringAgent && ! this.Host.connect);
      },
      showMonitoringLocationDropdown() {
        return this.monitoringLocations.length > 0;
      },
      accountHasFrontmen() {
        return this.frontmen.length > 0;
      },
      defaultPublicFrontman() {
        return this.publicFrontmen
                   .find(({ id }) => id === this.$auth.team.defaultFrontman);
      },
      connectIsPrivateWithAgent() {
        return this.hostLocation_connectIsPrivate && this.Host.hasMonitoringAgent;
      },
      isCreatingInlineFrontman() {
        return !! this.Host.frontman?.location && ! this.Host.frontman?.id;
      },
      showSubUnitSection() {
        return this.$teamSettings.get('subUnitManagementEnabled');
      },
      snmpIsEnabled() {
        if (this.isCreatingHost) return false;
        return this.Host.hasSnmpData;
      },
      snmp: {
        get() {
          return !! this.snmpPanel?.[0];
        },
        set(value) {
          if (! value) {
            this.snmpPanel = [];
            this.resetSnmp();
          } else {
            this.snmpPanel = [true];
          }
        }
      },
      snmpV2() {
        return this.snmp && this.Host.snmp?.protocol === 'v2';
      },
      snmpV3() {
        return this.snmp && this.Host.snmp?.protocol === 'v3';
      },
      snmpV3Auth() {
        return this.snmpV3
               && ['authNoPriv', 'authPriv'].includes(this.Host.snmp?.securityLevel);
      },
      snmpV3Priv() {
        return this.snmpV3 && this.Host.snmp?.securityLevel === 'authPriv';
      },
      connectIsRequiredField() {
        return ! this.Host.hasMonitoringAgent
               || (this.isUpdatingHost && this.Host.hasChecks && this.Host.connect);
      },
      validationRules() {
        const options = {
          connectIsRequiredField: this.connectIsRequiredField,
          hasMonitoringAgent: this.Host.hasMonitoringAgent,
          connectIsPrivate: this.hostLocation_connectIsPrivate,
          accountHasFrontmen: this.accountHasFrontmen,
          hasConnect: this.Host.connect !== null && this.Host.connect !== '',
          snmp: this.snmp,
          snmpV2: this.snmpV2,
          snmpV3: this.snmpV3,
          snmpV3Auth: this.snmpV3Auth,
          snmpV3Priv: this.snmpV3Priv,
        };

        return Host.validationRules(options);
      },
      waitConditionConnect() {
        return this.$wait.is(this.$WAIT_FOR.CONNECT_VALIDATION);
      },
      waitConditionSubmit() {
        return this.$wait.is(this.$WAIT_FOR.HOST.ALL);
      },
      showCagentHint() {
        if (! this.Host.hasMonitoringAgent) return '';
        if (this.isUpdatingHost && this.Host.hasChecks && this.Host.connect) return '';
        return this.$t('host.cagentHint');
      },
      formTitle() {
        let title = this.isUpdatingHost ? this.$t('host.editSettings') : this.$t('host.create');
        return this.guide.fetch('title') || title;
      },
      existingTags() {
        if (this.tags.length === 0) {
          return [
            { header: this.$t('form.field.tagDropdownHeaderNew') },
          ];
        }
        return [
          { header: this.$t('form.field.tagDropdownHeader') },
          ...Object.values(this.tags),
        ];
      },
      isCreatingHost() {
        return ! this.isUpdatingHost;
      },
      isUpdatingHost() {
        return this.Host.hasId();
      },
      isCreatingPrivateHostWithoutAvailableFrontman() {
        return this.hostLocation_connectIsPrivate
               && this.isCreatingHost
               && ! this.isCreatingInlineFrontman
               && ! this.accountHasFrontmen
               && ! this.Host.hasMonitoringAgent;
      },
      monitoringLocationsHint() {
        if (this.showMonitoringLocationDropdown) return '';
        return this.$t('form.field.frontmanHint');
      },
      enableAlerting: {
        set() {
          this.Host.muted = ! this.Host.muted;
        },
        get() {
          return ! this.Host.muted;
        },
      },
    },
    watch: {
      showFrontmanSection(show) {
        if (show) return;
        this.Host.frontman = this.defaultPublicFrontman;
      },
      hostLocation_connectIsPrivate(value) {
        if (! value || this.isCreatingHost || this.accountHasFrontmen) return;
        this.Host.frontman = this.defaultPublicFrontman;
      },
      monitoringLocations(locations) {
        if (locations.length === 0 && this.frontmen.length === 0) {
          this.Host.frontman = Host.attributes.frontman;
        } else if (this.isCreatingHost) {
          this.Host.frontman = this.defaultPublicFrontman;
        }
      },
    },
    async created() {
      this.initiating = true;
      this.initValidation();
      this.tags = await Host.fetchActiveTags();
      await Promise.all([
        this.getPublicFrontmen(),
        this.getFrontmen(),
      ]);
      if (this.showSubUnitSection) {
        await this.getSubUnits();
      }
      if (this.isCreatingHost) {
        this.Host.frontman = this.defaultPublicFrontman;
      }
      setTimeout(() => {
        // Make async to not block page load.
        this.getConnectType();
      }, 0);

      if (this.isUpdatingHost) {
        this.snmp = this.Host.hasSnmpData;
      }
      this.initiating = false;
    },
    beforeDestroy() {
      this.useBackendValidation_reset();
    },
    methods: {
      ...mapMutations('hosts', ['toggleGuideDialog']),
      ...mapMutations('subUnits', ['toggleSubUnitDialog', 'setSelectedSubUnit']),
      ...mapMutations('frontmen', ['toggleFrontmanDialog', 'setSelectedFrontman']),
      ...mapActions('refData', ['getPublicFrontmen']),
      ...mapActions('frontmen', ['getFrontmen']),
      ...mapActions('frontmen', {
        createFrontmanAction: 'createFrontman'
      }),
      ...mapActions('subUnits', ['getSubUnits']),
      ...mapActions('hosts', {
        createHostAction: 'createHost',
        updateHostAction: 'updateHost',
      }),
      async getConnectTypeThenSubmit() {
        await this.getConnectType();
        await this.onSubmit();
      },
      async getConnectType() {
        this.hostLocation_resetConnectType();
        this.$nextTick(() => {
          this.useBackendValidation_reset();
          this.$validator.errors.remove('connect');
        });
        if (! this.Host.connect) return;
        await this.hostLocation_checkConnectType(this.Host);
        if (this.submitFlag) {
          await this.onSubmit();
        }
      },
      async onSubmit() {
        this.$wait.start(this.$WAIT_FOR.HOST.ALL);
        this.useBackendValidation_reset();

        // Ensure tag field is blurred before validating to ensure tags are
        // in the right place ready to be validated.
        await this.$refs.formInputTags.blur();

        const result = await this.$validator.validateAll();
        if (! result || this.isCreatingPrivateHostWithoutAvailableFrontman) {
          this.$wait.end(this.$WAIT_FOR.HOST.ALL);
          return;
        }

        if (
          this.isCreatingInlineFrontman
          && this.hostLocation_connectIsPrivate
          && ! this.accountHasFrontmen
        ) {
          await this.createFrontmanAction({
            Frontman: new Frontman({ location: this.Host.frontman.location }),
          });
          this.Host.frontman = this.lastCreatedFrontman;
        }

        this.Host.frontmanId = null;
        if (!! this.Host.frontman?.id) {
          this.Host.frontmanId = this.Host.frontman.id;
        }

        this.Host.subUnitId = null;
        if (!! this.Host.subUnit?.id) {
          this.Host.subUnitId = this.Host.subUnit.id;
        }

        this.$wait.end(this.$WAIT_FOR.HOST.ALL);

        if (this.Host.hasId()) {
          this.updateHost(this.Host);
        } else {
          this.createHost(this.Host);
        }
      },
      updateHost(Host) {
        this.updateHostAction({ Host })
            .then(() => {
              this.$emit('on-update', { success: true, Host });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-update', { success: false, Host });
            });
      },
      createHost(Host) {
        this.createHostAction({ Host })
            .then(() => {
              this.$emit('on-create', { success: true, Host });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-create', { success: false, Host });
            });
      },
      frontmanIsTeamDefault({ id }) {
        return this.$auth.team.defaultFrontman === id;
      },
      tagsInput() {
        this.tagsSearch = '';
      },
      removeTag(tag) {
        if (this.isUpdatingHost) {
          const stopDelete = !! this.Host.extendedTags
                             && !! this.Host.extendedTags.filter((extendedTag) => {
                return extendedTag.name === tag
                       && (extendedTag.usedForEventRouting
                           || extendedTag.usedForGuestAccessLimiting);
              }
            ).length;

          if (stopDelete) {
            return this.$flash.error(this.$t('host.noDeleteTag'));
          }
        }

        const i = this.Host.tags.indexOf(tag);
        this.Host.tags.splice(i, 1);
        return true;
      },
      isValidTag(tag) {
        return /^[\w\d-_.:\s]+$/i.test(tag?.trim() ?? '');
      },
      onCancel() {
        this.useBackendValidation_reset();
        this.$emit('on-cancel', { Host: this.Host });
      },
      resetSnmp() {
        Object.entries({ ...Host.attributes.snmp }).forEach(([key, value]) => {
          this.$set(this.Host.snmp, key, value);
        });
      },
      resetForm() {
        this.useBackendValidation_reset();
        this.Host.reset();
        if (this.isCreatingHost) {
          this.Host.frontman = this.defaultPublicFrontman;
        }
        this.$validator.reset();
      },
      createFrontman() {
        this.setSelectedFrontman(new Frontman({ ...Frontman.attributes }));
        this.toggleFrontmanDialog(true);
      },
      onCreateFrontman({ success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.frontmanAdd'));
          this.toggleFrontmanDialog();
          this.Host.frontman = this.lastCreatedFrontman;
        } else {
          this.$flash.error(this.$t('message.error.frontmanAdd'));
        }
      },
      createSubUnit() {
        this.setSelectedSubUnit(new SubUnit({ ...SubUnit.attributes }));
        this.toggleSubUnitDialog(true);
      },
      onCreateSubUnit({ success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.subUnitAdd'));
          this.toggleSubUnitDialog();
          this.Host.subUnit = this.lastCreatedSubUnit;
        } else {
          this.$flash.error(this.$t('message.error.subUnitAdd'));
        }
      },
      initValidation() {
        this.useValidation_extendUniqueHostName(this.Host);
        this.useValidation_extendTags();
        this.useValidation_extendFrontman();
      },
      formFieldLabels(field, defaultLabel = null) {
        if (this.isUpdatingHost) {
          return defaultLabel || this.$t(`form.field.${field}`);
        }
        return this.guide.fetch(`${field}.label`)
               || defaultLabel
               || this.$t(`form.field.${field}`);
      },
      showAddHostGuide() {
        this.guide.reset();
        this.resetForm();
        this.toggleGuideDialog(true);
      },
      guideForAgentHost() {
        if (this.isUpdatingHost) return;
        this.guide
            .active()
            .title(this.$t('host.guide.agent.form.title'))
            .labels({ connect: this.$t('host.guide.labels.connect') })
            .required('agent')
            .checked('agent')
            .hide('agent', 'frontman')
            .watchers([
              {
                watch: 'guide.settings.agent.checked',
                callback(val) {
                  this.Host.cagent = val;
                },
              },
              {
                watch: 'hostLocation_connectIsPrivate',
                callback() {
                  this.guide.settings.frontman.required = this.hostLocation_connectIsPrivate;
                },
              },
            ]);
      },
      guideForFrontmanHost() {
        if (this.isUpdatingHost) return;
        this.guide
            .active()
            .title(this.$t('host.guide.frontman.form.title'))
            .hints({ agent: this.$t('host.guide.hints.agent') })
            .required('connect', 'frontman')
            .hide('agent')
            .watchers([
              {
                watch: 'hostLocation_connectIsPublic',
                callback() {
                  this.guide.settings.frontman.show = ! this.hostLocation_connectIsPublic;
                  if (this.hostLocation_connectIsPublic) {
                    this.guide.settings.frontman.required = false;
                  }
                },
              },
            ]);
      },
      guideForPublicHost() {
        if (this.isUpdatingHost) return;
        this.guide
            .active()
            .title(this.$t('host.guide.public.form.title'))
            .hints({ agent: this.$t('host.guide.hints.agent') })
            .required('connect')
            .watchers([
              {
                watch: 'Host.cagent',
                callback(val) {
                  this.guide.settings.connect.required = ! val;
                },
              }]);
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .v-select.v-select--chips >>> .v-select__selections
    padding: 0 !important

  .snmp-panel
    position: relative

    &__help
      position: absolute
      right: 16px
      top: 16px;

    >>> .v-expansion-panel__header
      padding-left: 16px
      padding-right: 16px
      cursor: default
      pointer-events: none

      .v-input--selection-controls__input,
      .v-label
        pointer-events: auto
</style>
