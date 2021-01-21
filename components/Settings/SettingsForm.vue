<template>
  <div class="settings-form">
    <v-layout
      row
      wrap
    >
      <!-- PROFILE GROUP -->
      <SettingsGroup
        :title="$t('settings.group.profile') | capitalize"
        class="qa-settings-profile"
        data-cy="settingsGroupProfile"
      >
        <template #settings>
          <!-- E-MAIL -->
          <Setting
            class="qa-email"
            data-cy="emailSetting"
            divider
          >
            <template #label>
              {{ $t('settings.email') | capitalize }}
            </template>
            <template #static>
              {{ user.email }}
            </template>
          </Setting>

          <!-- PASSWORD -->
          <Setting
            :on-update="updateUserPassword"
            :wait-key="$WAIT_FOR.USER.UPDATE"
            class="qa-password"
            data-cy="passwordSetting"
            divider
            @on-cancel="reset(SETTINGS.USER)"
          >
            <template #label>
              {{ $t('settings.password') | capitalize }}
            </template>
            <template #static>
              ••••••••
            </template>
            <template #title>
              {{ $t('settings.updatePassword') | capitalize }}
            </template>
            <template #modal>
              <BackendValidationAlert/>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.password') | capitalize"
                :rules="validationRules.oldPassword"
                validation-key="password"
              >
                <template #default="prop">
                  <v-text-field
                    v-model="oldPassword"
                    v-validate="prop.rules"
                    :data-vv-name="prop.validationKey"
                    :error-messages="prop.firstErrorMessage"
                    :label="prop.label"
                    :placeholder="$t('settings.enterYourOldPassword') | capitalize"
                    data-vv-validate-on="blur"
                    persistent-hint
                    type="password"
                  />
                </template>
              </VeeFormGroup>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.password') | capitalize"
                :rules="validationRules.password"
                validation-key="password"
              >
                <template #default="prop">
                  <v-text-field
                    ref="password"
                    v-model="password"
                    v-validate="prop.rules"
                    :data-vv-name="prop.validationKey"
                    :error-messages="prop.firstErrorMessage"
                    :label="prop.label"
                    :placeholder="$t('settings.enterYourPassword') | capitalize"
                    data-vv-validate-on="blur"
                    name="password"
                    type="password"
                  />
                </template>
              </VeeFormGroup>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.password') | capitalize"
                :rules="validationRules.confirmPassword"
                validation-key="confirmPassword"
              >
                <template #default="prop">
                  <v-text-field
                    v-model="confirmPassword"
                    v-validate="prop.rules"
                    :data-vv-name="prop.validationKey"
                    :error-messages="validationErrors.first('confirmPassword')"
                    :label="$t('form.field.repeatPassword') | capitalize"
                    :placeholder="$t('settings.confirmYourPassword') | capitalize"
                    class="mt-4"
                    data-vv-as="password"
                    data-vv-validate-on="blur"
                    name="password_confirmation"
                    type="password"
                  />
                </template>
              </VeeFormGroup>
            </template>
          </Setting>

          <!-- NAME -->
          <Setting
            :on-update="updateName"
            :wait-key="$WAIT_FOR.USER.UPDATE"
            class="qa-name"
            data-cy="nameSetting"
            divider
            @on-cancel="reset(SETTINGS.USER)"
          >
            <template #label>
              {{ $t('settings.userName') | capitalize }}
            </template>
            <template #static>
              <span
                :class="{'grey--text text--lighten-1': !user.name}"
              >
                {{ user.name ? user.name : $t('settings.noUserName') }}
              </span>
            </template>
            <template #title>
              {{ $t('settings.updateName') | capitalize }}
            </template>
            <template #modal>
              <BackendValidationAlert/>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.name') | capitalize"
                :rules="validationRules.name"
                data-cy="setNameFormGroup"
                validation-key="settings-name.name"
              >
                <template #default="prop">
                  <v-text-field
                    v-model="selectedUser.name"
                    v-validate="prop.rules"
                    :error-messages="prop.firstErrorMessage"
                    :label="prop.label"
                    data-vv-scope="settings-name"
                    data-vv-validate-on="blur"
                    name="name"
                  />
                </template>
              </VeeFormGroup>
            </template>
          </Setting>

          <!-- NICKNAME -->
          <Setting
            :on-update="updateNickname"
            :wait-key="$WAIT_FOR.USER.UPDATE"
            class="qa-nickname"
            data-cy="nicknameSetting"
            divider
            @on-cancel="reset(SETTINGS.USER)"
          >
            <template #label>
              {{ $t('settings.nickname') | capitalize }}
            </template>
            <template #static>
              <span
                :class="{'grey--text text--lighten-1': !user.nickname}"
              >
                {{ user.nickname ? user.nickname : $t('settings.noNickname') }}
              </span>
            </template>
            <template #title>
              {{ $t('settings.updateNickname') | capitalize }}
            </template>
            <template #modal>
              <BackendValidationAlert/>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.nickname') | capitalize"
                :rules="validationRules.nickname"
                data-cy="setNicknameFormGroup"
                validation-key="settings-nickname.nickname"
              >
                <template #default="prop">
                  <v-text-field
                    v-model="selectedUser.nickname"
                    v-validate="prop.rules"
                    :error-messages="prop.firstErrorMessage"
                    :label="prop.label"
                    data-vv-scope="settings-nickname"
                    data-vv-validate-on="blur"
                    name="nickname"
                  />
                </template>
              </VeeFormGroup>
            </template>
          </Setting>

          <!-- PRODUCT NEWS -->
          <Setting
            class="qa-product-news"
            custom-button
            data-cy="productNewsSetting"
            two-col
          >
            <template #label>
              <div class="body-2">
                {{ $t('settings.productNews.title') | capitalize }}
              </div>
              <span class="caption body-1">
                {{ $t('settings.productNews.description') | capitalize }}
              </span>
            </template>
            <template #action-button>
              <v-switch
                v-model="selectedUser.productNews"
                class="mt-0 pt-0 justify-end"
                hide-details
                @change="updateProductNews"
              />
            </template>
          </Setting>
        </template>
      </SettingsGroup>

      <!-- REGIONAL GROUP -->
      <SettingsGroup
        :title="$t('settings.group.regionalSettings') | capitalize"
        class="qa-settings-regional"
        data-cy="settingsGroupRegional"
      >
        <template #settings>
          <!-- TIME ZONE -->
          <Setting
            :on-update="selectedUser.isAdmin() ? updateTimezone : null"
            :wait-key="$WAIT_FOR.TEAM.UPDATE"
            class="qa-timezone"
            data-cy="timezoneSetting"
            divider
            @on-cancel="reset(SETTINGS.TEAM)"
          >
            <template #label>
              {{ $t('settings.timezone') | capitalize }}
            </template>
            <template #static>
              {{ team.timezone ? formatRegion(team.timezone) : $t('settings.noTimezone') }}
            </template>
            <template #title>
              {{ $t('settings.updateTimezone') | capitalize }}
            </template>
            <template #modal>
              <BackendValidationAlert/>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.timezone') | capitalize"
                :rules="validationRules.timezone"
                validation-key="settings-timezone.timezone"
              >
                <template #default="prop">
                  <v-autocomplete
                    v-model="mainTimezoneFromTeamRegion"
                    v-validate="prop.rules"
                    :error-messages="prop.firstErrorMessage"
                    :items="timezones"
                    :label="prop.label"
                    data-vv-scope="settings-timezone"
                    data-vv-validate-on="blur"
                    item-text="text"
                    item-value="value"
                    name="timezone"
                    @change="selectedTimezone = null"
                  />
                </template>
              </VeeFormGroup>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.region') | capitalize"
                :rules="validationRules.region"
                validation-key="settings-timezone.region"
              >
                <template #default="prop">
                  <v-autocomplete
                    v-model="selectedTimezone"
                    v-validate="prop.rules"
                    :error-messages="prop.firstErrorMessage"
                    :items="regionsOptions"
                    :label="prop.label"
                    data-vv-scope="settings-timezone"
                    data-vv-validate-on="blur"
                    name="region"
                  >
                    <template #selection="item">
                      {{ formatRegion(item.item) }}
                    </template>
                    <template #item="item">
                      {{ formatRegion(item.item) }}
                    </template>
                  </v-autocomplete>
                </template>
              </VeeFormGroup>
            </template>
          </Setting>

          <!-- LANGUAGE / LOCALE -->
          <Setting
            :on-update="updateLanguage"
            :wait-key="$WAIT_FOR.USER.UPDATE"
            class="qa-locale"
            data-cy="languageSetting"
            divider
            @on-cancel="reset(SETTINGS.USER)"
          >
            <template #label>
              {{ $t('settings.language') | capitalize }}
            </template>
            <template #static>
              {{ localeName }}
            </template>
            <template #title>
              {{ $t('settings.setLanguage') | capitalize }}
            </template>
            <template #modal>
              <BackendValidationAlert/>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.language') | capitalize"
                :rules="validationRules.locale"
                validation-key="settings-language.locale"
              >
                <template #default="prop">
                  <v-select
                    v-model="selectedUser.lang"
                    v-validate="prop.rules"
                    :error-messages="prop.firstErrorMessage"
                    :items="$i18n.locales"
                    :label="prop.label"
                    data-vv-scope="settings-language"
                    data-vv-validate-on="blur"
                    item-text="name"
                    item-value="code"
                    name="locale"
                  >
                    <template #selection="item">
                      {{ item.item.name }}
                    </template>
                    <template #item="item">
                      {{ item.item.name }}
                    </template>
                  </v-select>
                </template>
              </VeeFormGroup>
            </template>
          </Setting>

          <!-- DATE FORMAT -->
          <Setting
            :on-update="selectedUser.isAdmin() ? updateDateFormat : null"
            :wait-key="$WAIT_FOR.TEAM.UPDATE"
            class="qa-dateFormat"
            data-cy="dateFormatSetting"
            divider
            @on-cancel="reset(SETTINGS.TEAM)"
          >
            <template #label>
              {{ $t('settings.dateFormat') | capitalize }}
            </template>
            <template #static>
              <div>{{ parseEndianFormatFromMoment() }}</div>
              <span class="caption">{{ getFormatForEndian().localizedFormat }}</span>
            </template>
            <template #title>
              {{ $t('settings.updateDateFormat') | capitalize }}
            </template>
            <template #modal>
              <BackendValidationAlert/>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.dateFormat') | capitalize"
                :rules="validationRules.dateFormat"
                validation-key="settings-dateformat.dateFormat"
              >
                <template #default="prop">
                  <v-select
                    v-model="selectedTeam.dateFormat"
                    :error-messages="prop.firstErrorMessage"
                    :items="dateFormatOptions"
                    :label="prop.label"
                    data-vv-scope="settings-dateformat"
                    data-vv-validate-on="blur"
                    item-text="text"
                    item-value="value"
                    name="dateFormat"
                  />
                </template>
              </VeeFormGroup>
            </template>
          </Setting>

          <!-- CHECK LOCATION -->
          <Setting
            :on-update="selectedUser.isAdmin() ? updateCheckLocation : null"
            :wait-key="$WAIT_FOR.TEAM.UPDATE"
            class="qa-default-check-location"
            data-cy="checkLocationSetting"
            @on-cancel="reset(SETTINGS.TEAM)"
          >
            <template #label>
              <div>
                {{ $t('settings.defaultCheckLocation') | capitalize }}
              </div>
            </template>
            <template #static>
              <div>
                {{ selectedLocation }}
              </div>
            </template>
            <template #title>
              {{ $t('settings.updateDefaultCheckLocation') | capitalize }}
            </template>
            <template #modal>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.defaultCheckLocation') | capitalize"
                :rules="validationRules.defaultFrontman"
                validation-key="settings-check-location.defaultFrontman"
              >
                <template #default="prop">
                  <v-select
                    v-model="selectedTeam.defaultFrontman"
                    v-validate="prop.rules"
                    :error-messages="prop.firstErrorMessage"
                    :items="frontmen"
                    :label="prop.label"
                    data-vv-scope="settings-check-location"
                    data-vv-validate-on="blur"
                    item-text="location"
                    item-value="id"
                    name="defaultFrontman"
                  />
                </template>
              </VeeFormGroup>
            </template>
          </Setting>
        </template>
      </SettingsGroup>

      <!-- TEAM -->
      <SettingsGroup
        :loading="$wait.is($WAIT_FOR.TEAM.ALL)"
        :title="$t('settings.group.team') | capitalize"
        class="qa-settings-team"
        data-cy="settingsGroupTeam"
      >
        <template #settings>
          <!-- TEAM NAME -->
          <Setting
            :on-update="$auth.user.isAdmin() ? updateTeamName : null"
            :wait-key="$WAIT_FOR.TEAM.UPDATE"
            class="qa-team-name"
            data-cy="teamNameSetting"
            divider
            @on-cancel="reset(SETTINGS.TEAM)"
          >
            <template #label>
              {{ $t('settings.teamName') | capitalize }}
            </template>
            <template #static>
              <span
                :class="{'grey--text text--lighten-1': !selectedTeam.name}"
              >
                {{ team.name ? team.name : $t('settings.noTeamname') }}
              </span>
            </template>
            <template #title>
              {{ $t('settings.updateTeamname') | capitalize }}
            </template>
            <template #modal>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.teamName') | capitalize"
                :rules="validationRules.teamname"
                validation-key="settings-teamname.teamname"
              >
                <template #default="prop">
                  <v-text-field
                    v-model="selectedTeam.name"
                    v-validate="prop.rules"
                    :error-messages="prop.firstErrorMessage"
                    :label="prop.label"
                    data-vv-name="teamname"
                    data-vv-scope="settings-teamname"
                    data-vv-validate-on="blur"
                  />
                </template>
              </VeeFormGroup>
            </template>
          </Setting>

          <!-- TEAM MEMBERS -->
          <Setting
            class="qa-team-members"
            custom-button
            divider
          >
            <template #label>
              <span class="body-2">
                {{ $t('settings.teamMembers') | capitalize }}
              </span>
            </template>
            <template #static>
              <div style="min-height: 24px;">
                <div class="d-inline-flex align-center">
                  <v-chip
                    class="ml-0 my-0 mr-2"
                    small
                  >
                    {{ $auth.team.counts.members }}
                  </v-chip>
                  <span
                    v-if="$auth.team.counts.members <= $auth.team.maxMembers"
                    class="font-weight-regular"
                  >
                    {{ $t('settings.ofCountMax', { count: $auth.team.maxMembers }) }}
                  </span>
                </div>
              </div>
            </template>
          </Setting>

          <!-- HOSTS -->
          <Setting class="qa-hosts">
            <template #label>
              {{ $t('settings.hosts') | capitalize }}
            </template>
            <template #static>
              <div style="min-height: 24px;">
                <div class="d-inline-flex align-center">
                  <v-chip
                    class="ml-0 my-0 mr-2"
                    small
                  >
                    {{ $auth.team.counts.hosts }}
                  </v-chip>
                </div>
              </div>
            </template>
          </Setting>
        </template>
      </SettingsGroup>

      <!-- MSP -->
      <SettingsGroup
        :title="$t('settings.group.msp')"
        class="qa-settings-msp"
        data-cy="settingsGroupMSP"
      >
        <template #settings>
          <!-- SUB UNIT MANAGEMENT -->
          <Setting
            class="qa-customer-mgmt"
            custom-button
            data-cy="customerManagementSetting"
            two-col
          >
            <template #label>
              <div class="body-2">
                {{ $t('settings.subUnitManagement') | capitalize }}
              </div>
              <span v-if="selectedUser.isAdmin()" class="font-weight-regular body-1">
                {{ $t('settings.subUnitManagementDescription') }}
              </span>
            </template>
            <template #action-button>
              <v-btn
                v-if="selectedUser.isAdmin()"
                :outline="!! $teamSettings.get('subUnitManagementEnabled')"
                class="ma-0"
                color="primary"
                small
                @click.native.stop="toggleSubUnitManagement"
              >
                <template v-if="! $teamSettings.get('subUnitManagementEnabled')">
                  {{ $t('button.enable') }}
                </template>
                <template v-else>
                  {{ $t('button.disable') }}
                </template>
              </v-btn>
              <v-chip
                v-else
                :color="$teamSettings.get('subUnitManagementEnabled') ? 'success' : 'grey'"
                class="white--text"
                small
              >
                {{ $teamSettings.get('subUnitManagementEnabled') ? $t('phrase.enabled') : $t('phrase.disabled') }}
              </v-chip>
            </template>
          </Setting>
        </template>
      </SettingsGroup>

      <!-- RULES / HEARTBEATS -->
      <SettingsGroup
        :fill-row="true"
        :title="$t('settings.group.rulesAndHeartbeats') | capitalize"
        class="qa-settings-rules"
        data-cy="settingsGroupProfile"
        data-qa="settings:group:rules"
      >
        <template #settings>
          <!-- Agent Heartbeat -->
          <Setting
            :on-update="updateAgentHeartbeat"
            :two-col="true"
            :wait-key="$WAIT_FOR.SETTINGS.HEARTBEAT.AGENT"
            data-qa="settings:rules:agent-heartbeat"
            divider
            @on-cancel="reset(SETTINGS.AGENT_HEARTBEAT)"
          >
            <template #label>
              <div class="body-2">
                {{ $t('settings.rules.agentHeartbeat.title') | capitalize }}
              </div>
              <span class="font-weight-regular body-1">
                {{
                  $t('settings.rules.agentHeartbeat.description',
                    {
                      threshold: agentHeartbeatSettings.threshold,
                      severity: agentHeartbeatSettings.severity
                    }) | capitalize
                }}
              </span>
            </template>
            <template #before-action-button>
              <v-flex flex-shrink>
                <v-switch
                  v-model="$teamSettings.heartbeats.agent.active"
                  :readonly="! selectedUser.isAdmin()"
                  class="ma-0 mt-1 pt-0 justify-end"
                  hide-details
                  @change="updateAgentHeartbeat"
                />
              </v-flex>
            </template>
            <template #action-button="{ toggleEditMode }">
              <v-flex shrink>
                <v-btn
                  v-if="selectedUser.isAdmin()"
                  class="ma-0"
                  color="primary"
                  outline
                  small
                  @click.native.stop="toggleEditMode(true)"
                >
                  Edit heartbeat
                </v-btn>
              </v-flex>
            </template>
            <template #modal>
              <v-flex>
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :label="$t('form.field.threshold') | capitalize"
                  :rules="validationRules.heartbeats.agent.threshold"
                  validation-key="settings-heartbeat-agent.threshold"
                >
                  <template #default="prop">
                    <v-text-field
                      v-model="agentHeartbeatSettings.threshold"
                      v-validate="prop.rules"
                      :error-messages="prop.firstErrorMessage"
                      :label="prop.label"
                      :suffix="$t('form.field.seconds') | capitalize"
                      data-vv-name="threshold"
                      data-vv-scope="settings-heartbeat-agent"
                      data-vv-validate-on="blur"
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>
              <v-flex>
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :label="$t('form.field.action') | capitalize"
                  :rules="validationRules.heartbeats.agent.severity"
                  validation-key="settings-heartbeat-agent.severity"
                >
                  <template #default="prop">
                    <v-select
                      v-model="agentHeartbeatSettings.severity"
                      v-validate="prop.rules"
                      :error-messages="prop.firstErrorMessage"
                      :items="severityActions"
                      :label="prop.label"
                      data-vv-name="severity"
                      data-vv-scope="settings-heartbeat-agent"
                      item-text="display"
                      item-value="value"
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>
            </template>
            <template #prebutton>
              <v-switch
                v-model="$teamSettings.heartbeats.agent.active"
                :label="$t('form.field.active') | capitalize"
                class="shrink mt-0 mr-4 pt-0"
                hide-details
                @change="updateAgentHeartbeat"
              />
            </template>
          </Setting>

          <!-- Frontman Heartbeat -->
          <Setting
            :on-update="updateFrontmanHeartbeat"
            :two-col="true"
            :wait-key="$WAIT_FOR.SETTINGS.HEARTBEAT.FRONTMAN"
            data-qa="settings:rules:frontman-heartbeat"
            divider
            @on-cancel="reset(SETTINGS.FRONTMAN_HEARTBEAT)"
          >
            <template #label>
              <div class="body-2">
                {{ $t('settings.rules.frontmanHeartbeat.title') | capitalize }}
              </div>
              <span class="font-weight-regular body-1">
                {{
                  $t('settings.rules.frontmanHeartbeat.description',
                    {
                      threshold: frontmanHeartbeatSettings.threshold,
                      severity: frontmanHeartbeatSettings.severity
                    }) | capitalize
                }}
              </span>
            </template>
            <template #before-action-button>
              <v-flex flex-shrink>
                <v-switch
                  v-model="$teamSettings.heartbeats.frontman.active"
                  :readonly="! selectedUser.isAdmin()"
                  class="ma-0 mt-1 pt-0 justify-end"
                  hide-details
                  @change="updateFrontmanHeartbeat"
                />
              </v-flex>
            </template>
            <template #action-button="{ toggleEditMode }">
              <v-flex flex-shrink>
                <v-btn
                  v-if="selectedUser.isAdmin()"
                  class="ma-0"
                  color="primary"
                  outline
                  small
                  @click.native.stop="toggleEditMode(true)"
                >
                  Edit heartbeat
                </v-btn>
              </v-flex>
            </template>
            <template #modal>
              <v-flex>
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :label="$t('form.field.threshold') | capitalize"
                  :rules="validationRules.heartbeats.frontman.threshold"
                  validation-key="settings-heartbeat-frontman.threshold"
                >
                  <template #default="prop">
                    <v-text-field
                      v-model="frontmanHeartbeatSettings.threshold"
                      v-validate="prop.rules"
                      :error-messages="prop.firstErrorMessage"
                      :label="prop.label"
                      :suffix="$t('form.field.seconds') | capitalize"
                      data-vv-name="threshold"
                      data-vv-scope="settings-heartbeat-frontman"
                      data-vv-validate-on="blur"
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>
              <v-flex>
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :label="$t('form.field.action') | capitalize"
                  :rules="validationRules.heartbeats.frontman.severity"
                  validation-key="settings-heartbeat-frontman.severity"
                >
                  <template #default="prop">
                    <v-select
                      v-model="frontmanHeartbeatSettings.severity"
                      v-validate="prop.rules"
                      :error-messages="prop.firstErrorMessage"
                      :items="severityActions"
                      :label="prop.label"
                      data-vv-name="severity"
                      item-text="display"
                      item-value="value"
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>
            </template>
            <template #prebutton>
              <v-switch
                v-model="$teamSettings.heartbeats.frontman.active"
                :label="$t('form.field.active') | capitalize"
                class="shrink mt-0 mr-4 pt-0"
                hide-details
                @change="updateFrontmanHeartbeat"
              />
            </template>
          </Setting>
          <Setting
            :on-update="updateCustomCheckHeartbeat"
            :two-col="true"
            :wait-key="$WAIT_FOR.SETTINGS.HEARTBEAT.CUSTOM"
            data-qa="settings:rules:custom-check-heartbeat"
            divider
            @on-cancel="reset(SETTINGS.CUSTOM_CHECK_HEARTBEAT)"
          >
            <template #label>
              <div class="body-2">
                {{ $t('settings.rules.customHeartbeat.title') | capitalize }}
              </div>
              <span class="font-weight-regular body-1">
                {{
                  $t('settings.rules.customHeartbeat.description',
                    { severity: customCheckHeartbeatSettings.severity }) | capitalize
                }}
              </span>
            </template>
            <template #before-action-button>
              <v-flex flex-shrink>
                <v-switch
                  v-model="$teamSettings.heartbeats.custom.active"
                  :readonly="! selectedUser.isAdmin()"
                  class="ma-0 mt-1 pt-0 justify-end"
                  hide-details
                  @change="toggleCustomHeartbeatDeactivateWarningDialog"
                />
              </v-flex>
            </template>
            <template #action-button="{ toggleEditMode }">
              <v-flex flex-shrink>
                <v-btn
                  v-if="selectedUser.isAdmin()"
                  class="ma-0"
                  color="primary"
                  outline
                  small
                  @click.native.stop="toggleEditMode(true)"
                >
                  Edit severity
                </v-btn>
              </v-flex>
            </template>
            <template #modal>
              <v-flex mb-4>
                <v-alert :value="true" type="info">
                  {{ $t('settings.rules.customHeartbeat.noThreshold') | capitalize }}
                </v-alert>
              </v-flex>
              <v-flex>
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :label="$t('form.field.action') | capitalize"
                  :rules="validationRules.heartbeats.custom.severity"
                  validation-key="settings-heartbeat-custom.severity"
                >
                  <template #default="prop">
                    <v-select
                      v-model="customCheckHeartbeatSettings.severity"
                      v-validate="prop.rules"
                      :error-messages="prop.firstErrorMessage"
                      :items="severityActions"
                      :label="prop.label"
                      data-vv-name="severity"
                      data-vv-scope="settings-heartbeat-custom"
                      item-text="display"
                      item-value="value"
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>
            </template>
            <template #prebutton>
              <v-switch
                v-model="$teamSettings.heartbeats.custom.active"
                :label="$t('form.field.active') | capitalize"
                class="shrink mt-0 mr-4 pt-0"
                hide-details
                @change="toggleCustomHeartbeatDeactivateWarningDialog"
              />
            </template>
          </Setting>
        </template>
      </SettingsGroup>
    </v-layout>
    <DeactivateCustomHeartbeatWarningDialog
      v-if="customHeartbeatDeactivateWarningDialog"
      @on-confirm="updateCustomCheckHeartbeat(true)"
      @on-cancel="updateCustomCheckHeartbeat(false)"
    />
  </div>
</template>

<script>
  import { SETTINGS } from '@/constants/settings';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import DeactivateCustomHeartbeatWarningDialog from '@/components/Settings/DeactivateCustomHeartbeatWarningDialog';
  import SettingsGroup from '@/components/Settings/SettingsGroup';
  import Setting from '@/components/Settings/Setting';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import useDateTime from '@/mixins/useDateTime';
  import userMixins from '@/mixins/user';
  import appMixins from '@/mixins/app';
  import Host from '@/models/Host';

  export default {
    components: {
      DeactivateCustomHeartbeatWarningDialog,
      SettingsGroup,
      Setting,
    },
    mixins: [
      useBackendValidation,
      useDateTime,
      userMixins,
      appMixins,
    ],
    props: {
      user: {
        type: Object,
        required: true,
      },
      team: {
        type: Object,
        required: true,
      },
      timezones: {
        type: Array,
        required: true,
      },
      dateFormats: {
        type: Array,
        required: true,
      },
      regions: {
        type: Array,
        required: true,
      },
      frontmen: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        SETTINGS,
        hosts: [],
        oldPassword: '',
        password: '',
        confirmPassword: '',
        mainTimezone: '',
        selectedTimezone: null,
        dateFormatOptions: this.dateFormats,
        subUnitManagementUpdateWaitKey: this.$WAIT_FOR.TEAM_SETTING.SUB_UNIT_MANAGEMENT.UPDATE,
        productNewsWaitKey: 'settings.updateProductNews',
        severityActions: [
          {
            display: this.$t('rule.actions.sendAnAlert'),
            value: 'alert',
          },
          {
            display: this.$t('rule.actions.sendAWarning'),
            value: 'warning',
          },
        ],
        customHeartbeatDeactivateWarningDialog: false,
        agentHeartbeatSettings: {},
        frontmanHeartbeatSettings: {},
        customCheckHeartbeatSettings: {},
      };
    },
    computed: {
      ...mapState('user', ['selectedUser']),
      ...mapState('team', ['selectedTeam']),
      validationRules() {
        return {
          nickname: 'min:3|max:100',
          name: 'min:3|max:100',
          teamname: 'min:3',
          oldPassword: 'required',
          password: 'required|min:7',
          confirmPassword: 'required|matchingPasswords',
          timezone: 'required',
          region: 'required',
          locale: `required|included:${this.$i18n.locales.map(({ code }) => code).join(',')}`,
          dateFormat: 'required',
          defaultFrontman: 'required',
          frontmanLocation: '',
          heartbeats: {
            agent: {
              severity: 'required',
              threshold: 'required|integer|min_value:300',
            },
            frontman: {
              severity: 'required',
              threshold: 'required|integer|min_value:300',
            },
            custom: {
              severity: 'required',
            }
          }
        };
      },
      localeName() {
        const { name } = this.$i18n.locales.find(({ code }) => code === this.selectedUser.lang);
        return name || this.selectedUser.lang;
      },
      mainTimezoneFromTeamRegion: {
        get() {
          const mainTimezoneObj = this.timezones.filter(
            el => el.utc.indexOf(this.selectedTeam.timezone) > -1,
          );
          return mainTimezoneObj[0];
        },
        set(value) {
          this.mainTimezone = value;
        }
      },
      regionsOptions() {
        if (this.mainTimezone === undefined || ! this.regions.length) {
          return this.regions;
        }
        const mainTimezone = this.getMainTimezone(this.mainTimezone);
        return mainTimezone?.utc ?? this.regions;
      },
      maxHosts() {
        const { maxHosts } = this.selectedTeam;
        return maxHosts < 999 ? +maxHosts : Infinity;
      },
      selectedLocation() {
        const frontman = this.frontmen.find(
          ({ id }) => id === this.selectedTeam.defaultFrontman,
        );
        return frontman ? frontman.location : this.$t('phrase.notAvailable');
      },
    },
    async fetch() {
      await this.setSelectedUser(this.user);
      await this.setSelectedTeam(this.team);
      this.selectedTimezone = this.selectedTeam.timezone;
    },
    created() {
      this.$validator.extend('regionInSelection', {
        validate: value => this.regionsOptions.indexOf(value) !== -1,
      });
      this.$validator.extend('matchingPasswords', {
        getMessage: () => this.$t('validation.passwordsMatch'),
        validate: value => this.password === this.confirmPassword,
      });

      this.resetAgentHeartbeatSettings();
      this.resetFrontmanHeartbeatSettings();
      this.resetCustomCheckHeartbeatSettings();
    },
    methods: {
      ...mapMutations('team', ['setSelectedTeam']),
      ...mapMutations('user', ['setSelectedUser']),
      ...mapActions('team', { updateTeamAction: 'updateTeam' }),
      ...mapActions('user', {
        unsubscribeMarketingAction: 'unsubscribeMarketing',
        updateUserAction: 'updateUser',
      }),
      getMainTimezone(timezone) {
        return this.timezones.find(obj => obj.value === timezone);
      },
      toggleSubUnitManagement() {
        if (this.$teamSettings.get('subUnitManagementEnabled')) {
          this.disableSubUnitManagement();
        } else {
          this.enableSubUnitManagement();
        }
      },
      enableSubUnitManagement() {
        this.$wait.start(this.subUnitManagementUpdateWaitKey);
        try {
          this.$teamSettings.set('subUnitManagementEnabled', true).save();
          this.$flash.success(this.$t('message.success.subUnitManagementEnabled'));
        } catch (e) {
          this.$flash.error(this.$t('message.error.subUnitManagement'));
        } finally {
          this.$wait.end(this.subUnitManagementUpdateWaitKey);
        }
      },
      disableSubUnitManagement() {
        this.$wait.start(this.subUnitManagementUpdateWaitKey);
        try {
          this.$teamSettings.set('subUnitManagementEnabled', false).save();
          this.$flash.success(this.$t('message.success.subUnitManagementDisabled'));
        } catch (e) {
          this.$flash.error(this.$t('message.error.subUnitManagement'));
        } finally {
          this.$wait.end(this.subUnitManagementUpdateWaitKey);
        }
      },
      updateProductNews() {
        this.useBackendValidation_reset();
        this.unsubscribeMarketingAction({ User: this.selectedUser })
            .then(() => {
              if (!! this.selectedUser.productNews) {
                this.$flash.success(this.$t('message.success.productNewsSubcribed'));
              } else {
                this.$flash.success(this.$t('message.success.productNewsUnsubcribed'));
              }
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$flash.error(this.$t('message.error.productNews'));
            });
      },
      async updateTimezone() {
        const result = await this.$validator.validateAll('settings-timezone');
        if (! result) return;
        this.selectedTeam.timezone = this.selectedTimezone;
        return await this.updateTeam();
      },
      async updateTeamName() {
        const result = await this.$validator.validateAll('settings-teamname');
        if (! result) return;
        return await this.updateTeam();
      },
      async updateDateFormat() {
        const result = await this.$validator.validateAll('settings-dateformat');
        if (! result) return;
        return await this.updateTeam();
      },
      async updateCheckLocation() {
        const result = await this.$validator.validateAll('settings-check-location');
        if (! result) return;
        return await this.updateTeam();
      },
      async updateTeam() {
        if (! this.selectedUser.isAdmin()) return;
        this.useBackendValidation_reset();
        return await this.updateTeamAction({ Team: this.selectedTeam })
                         .then(() => {
                           this.$emit('on-update', { success: true });
                           return true;
                         })
                         .catch(({ response }) => {
                           this.useBackendValidation_renderAnyErrors(response);
                           this.$emit('on-update', { success: false });
                           return false;
                         });
      },
      async updateName() {
        const result = await this.$validator.validateAll('settings-name');
        if (! result) return;
        return await this.updateUser();
      },
      async updateNickname() {
        const result = await this.$validator.validateAll('settings-nickname');
        if (! result) return;
        return await this.updateUser();
      },
      async updateUserPassword() {
        this.useBackendValidation_reset();
        const result = await this.$validator.validate();
        if (! result) return;

        this.$wait.start(this.$WAIT_FOR.USER.UPDATE);
        return this.selectedUser.changePassword({
                     oldPassword: this.oldPassword,
                     password: this.password,
                     passwordConfirmation: this.confirmPassword,
                   })
                   .then(() => {
                     this.$emit('on-update', { success: true });
                     this.resetUser();
                     return true;
                   })
                   .catch(({ response }) => {
                     this.useBackendValidation_renderAnyErrors(response);
                     this.$emit('on-update', { success: false });
                     return false;
                   })
                   .finally(() => {
                     this.$wait.end(this.$WAIT_FOR.USER.UPDATE);
                   });
      },
      async updateLanguage() {
        const result = await this.$validator.validateAll('settings-language');
        if (! result) return;
        const languageIsBeingSwitched = this.selectedUser.lang !== this.$auth.user.lang;
        if (languageIsBeingSwitched) {
          this.$wait.start(this.$WAIT_FOR.USER.UPDATE_LANGUAGE);
        }
        const updateResult = await this.updateUser();
        if (! languageIsBeingSwitched) {
          return updateResult;
        }

        window.location.href = '/settings';
      },
      async updateUser() {
        this.useBackendValidation_reset();
        return this.updateUserAction({ User: this.selectedUser })
                   .then(() => {
                     this.$emit('on-update', { success: true });
                     return true;
                   })
                   .catch(({ response }) => {
                     this.useBackendValidation_renderAnyErrors(response);
                     this.$emit('on-update', { success: false });
                     return false;
                   });
      },
      toggleCustomHeartbeatDeactivateWarningDialog() {
        if (! this.$teamSettings.heartbeats.custom.active) {
          this.customHeartbeatDeactivateWarningDialog = ! this.customHeartbeatDeactivateWarningDialog;
        } else {
          this.updateCustomCheckHeartbeat();
        }
      },
      async updateAgentHeartbeat() {
        const result = await this.$validator.validateAll('settings-heartbeat-agent');
        if (! result) return false;

        this.$wait.start(this.$WAIT_FOR.SETTINGS.HEARTBEAT.AGENT);
        const settings = { ...this.agentHeartbeatSettings };
        settings.active = this.$teamSettings.heartbeats.agent.active;
        await this.$teamSettings.set('heartbeats.agent', settings).save();
        this.$emit('on-update', { success: true });
        this.$wait.end(this.$WAIT_FOR.SETTINGS.HEARTBEAT.AGENT);
        return true;
      },
      async updateFrontmanHeartbeat() {
        const result = await this.$validator.validateAll('settings-heartbeat-frontman');
        if (! result) return false;

        this.$wait.start(this.$WAIT_FOR.SETTINGS.HEARTBEAT.FRONTMAN);
        const settings = { ...this.frontmanHeartbeatSettings };
        settings.active = this.$teamSettings.heartbeats.frontman.active;
        await this.$teamSettings.set('heartbeats.frontman', settings).save();
        this.$emit('on-update', { success: true });
        this.$wait.end(this.$WAIT_FOR.SETTINGS.HEARTBEAT.FRONTMAN);
        return true;
      },
      async updateCustomCheckHeartbeat(shouldPerformUpdate = true) {
        const result = await this.$validator.validateAll('settings-heartbeat-custom');
        if (! result) return false;

        this.customHeartbeatDeactivateWarningDialog = false;

        if (shouldPerformUpdate) {
          this.$wait.start(this.$WAIT_FOR.SETTINGS.HEARTBEAT.CUSTOM);
          const settings = { ...this.customCheckHeartbeatSettings };
          settings.active = this.$teamSettings.heartbeats.custom.active;
          await this.$teamSettings.set('heartbeats.custom', settings).save();
          this.$emit('on-update', { success: true });
          this.$wait.end(this.$WAIT_FOR.SETTINGS.HEARTBEAT.CUSTOM);
          return true;
        } else {
          this.$teamSettings.heartbeats.custom.active = ! this.$teamSettings.heartbeats.custom.active;
        }
      },
      resetValidation() {
        this.validationErrors.clear();
      },
      resetUser() {
        this.setSelectedUser(this.user);
        this.oldPassword = '';
        this.password = '';
        this.confirmPassword = '';
      },
      resetTeam() {
        this.setSelectedTeam(this.team);
        this.dateFormatOptions = this.dateFormats;
      },
      resetAgentHeartbeatSettings() {
        this.agentHeartbeatSettings = { ...this.$teamSettings.get('heartbeats.agent') };
      },
      resetFrontmanHeartbeatSettings() {
        this.frontmanHeartbeatSettings = { ...this.$teamSettings.get('heartbeats.frontman') };
      },
      resetCustomCheckHeartbeatSettings() {
        this.customCheckHeartbeatSettings = { ...this.$teamSettings.get('heartbeats.custom') };
      },
      reset(setting) {
        this.resetValidation();

        switch (setting) {
          case this.SETTINGS.USER:
            this.resetUser();
            break;
          case this.SETTINGS.TEAM:
            this.resetTeam();
            break;
          case this.SETTINGS.AGENT_HEARTBEAT:
            this.resetAgentHeartbeatSettings();
            break;
          case this.SETTINGS.FRONTMAN_HEARTBEAT:
            this.resetFrontmanHeartbeatSettings();
            break;
          case this.SETTINGS.CUSTOM_CHECK_HEARTBEAT:
            this.resetCustomCheckHeartbeatSettings();
            break;
          default:
            console.error(`unknown ${setting}`);
        }
      },
      formatRegion(rawRegion) {
        if (! rawRegion) return '';

        return rawRegion.replace(/_/g, ' ');
      },
    },
  };
</script>
<style lang="stylus" scoped>
  .Setting .input-group
    padding: 0
</style>
