<template>
  <Modal
    :custom-submit="true"
    :dialog="dialog"
    :on-cancel="onCancel"
    :on-submit="onSubmit"
    max-width="900px"
  >
    <template #title>
      <template v-if="isUpdatingRecipient">
        {{
          $t('recipients.updateRecipient', {
            mediatype:
              $options.filters.capitalize(selectedRecipient.mediatype)
          }) | capitalize
        }}
      </template>

      <template v-else>
        {{ $t('recipients.addRecipient') }}
      </template>
    </template>

    <div :class="{'min-height-fix': !isBlockedMediaType}">
      <div class="mb-1">
        <VeeFormGroup
          :error-bag="err"
          :label="$t('form.field.mediatype') | capitalize"
          validation-key="mediatype"
        >
          <template #default="prop">
            <v-select
              v-model="selectedRecipient.mediatype"
              :disabled="isUpdatingRecipient"
              :error-messages="prop.firstErrorMessage"
              :items="mediatypes"
              :label="prop.label"
              :menu-props="{ maxHeight: '500px' }"
              data-cy="mediatype"
              item-disabled="disabled"
              item-text="label"
              item-value="value"
            >
              <template #selection="data">
                <v-list-tile-avatar>
                  <RecipientIcon
                    :mediatype="data.item.value"
                    :verified="true"
                  />
                </v-list-tile-avatar>
                <v-list-tile-content class="mediatype-label">
                  {{ data.item.label }}
                </v-list-tile-content>
              </template>
              <template #item="data">
                <v-list-tile-avatar>
                  <RecipientIcon
                    :mediatype="data.item.value"
                    :verified="true"
                  />
                </v-list-tile-avatar>
                <v-flex md8 sm6>
                  <v-layout
                    align-center
                    row
                    wrap
                  >
                    <v-flex
                      class="mediatype-label"
                      lg3 xs12
                    >
                      {{ data.item.label }}
                    </v-flex>
                    <v-flex
                      v-if="$vuetify.breakpoint.mdAndUp"
                      class="mediatype-price grey--text caption"
                      lg9 xs12
                    >
                      <template v-if="!!showPrice(data.item.value)">
                        {{ pricingMessage(data.item.value) }}
                      </template>
                    </v-flex>
                  </v-layout>
                </v-flex>
                <v-list-tile-content>
                  <template v-if="data.item.disabled">
                    <v-chip
                      v-if="data.item.comingSoon"
                      class="coming-soon-badge"
                      color="grey lighten-1"
                      small
                      text-color="white"
                    >
                      {{ $t('phrase.comingSoon') }}
                    </v-chip>

                    <v-chip
                      v-else
                      class="premium-badge"
                      color="orange"
                      small
                      text-color="white"
                    >
                      {{ $t('phrase.premium') }}
                    </v-chip>
                  </template>
                </v-list-tile-content>
              </template>
            </v-select>
          </template>
        </VeeFormGroup>

        <template v-if="isBlockedMediaType">
          <v-alert :value="true" mt-3 type="info">
            Adding new "{{ selectedRecipient.mediatype }}" recipients is temporary disabled. Please contact the support
            for more information.
          </v-alert>
        </template>
      </div>

      <template v-if="!isBlockedMediaType">
        <div class="mb-3">
          <template v-if="selectedRecipient.mediatype === 'email'">
            <VeeFormGroup
              :error-bag="err"
              :label="$t('form.field.email') | capitalize"
              data-cy="sendtoFormGroup"
              validation-key="sendto"
            >
              <template #default="prop">
                <v-text-field
                  v-model="selectedRecipient.sendto"
                  :disabled="isLocked"
                  :error-messages="prop.firstErrorMessage"
                  :label="prop.label"
                  data-cy="email-sendto"
                  single-line
                />
              </template>
            </VeeFormGroup>
          </template>

          <template v-if="selectedRecipient.mediatype === 'slack'">
            <VeeFormGroup
              :error-bag="err"
              :label="$t('form.field.slack_token') | capitalize"
              validation-key="sendto"
            >
              <template #default="prop">
                <v-text-field
                  v-model="selectedRecipient.sendto"
                  :disabled="isLocked"
                  :error-messages="prop.firstErrorMessage"
                  :label="prop.label"
                  class="v-text-field--auto-height-messages"
                  data-cy="slack-sendto"
                  single-line
                />
                <i18n
                  class="v-messages theme--light"
                  path="form.hint.slack_token"
                  tag="div"
                >
                  <template v-slot:url>
                    <a :href="`${$config.kbBasePath}sending-notifications/slack`" target="_blank">{{
                        $t('phrase.here')
                      }}</a>
                  </template>
                </i18n>
              </template>
            </VeeFormGroup>

            <VeeFormGroup
              :error-bag="err"
              :label="$t('form.field.slack_channel_or_username') | capitalize"
              validation-key="option1"
            >
              <template #default="prop">
                <v-text-field
                  v-model="selectedRecipient.option1"
                  :disabled="isLocked"
                  :error-messages="prop.firstErrorMessage"
                  :hint="$t('form.hint.slack_channel_or_username')"
                  :label="prop.label"
                  data-cy="slack-option1"
                  persistent-hint
                  single-line
                />
              </template>
            </VeeFormGroup>
          </template>

          <template v-if="selectedRecipient.mediatype === 'msteams'">
            <VeeFormGroup
              :error-bag="err"
              :label="$t('form.field.msteams_webhook_connector') | capitalize"
              validation-key="sendto"
            >
              <template #default="prop">
                <v-text-field
                  v-model="selectedRecipient.sendto"
                  :disabled="isLocked"
                  :error-messages="prop.firstErrorMessage"
                  :label="prop.label"
                  class="v-text-field--auto-height-messages"
                  data-cy="msteams-sendto"
                  single-line
                />
                <i18n class="v-messages theme--light" path="form.hint.msteams_webhook_connector" tag="div">
                  <template v-slot:url>
                    <a :href="`${$config.kbBasePath}sending-notifications/microsoft-teams`" target="_blank">{{
                        $t('phrase.here')
                      }}</a>
                  </template>
                </i18n>
              </template>
            </VeeFormGroup>
          </template>

          <template v-if="selectedRecipient.mediatype === 'telegram'">
            <VeeFormGroup
              :error-bag="err"
              :label="$t('form.field.telegram_user_id') | capitalize"
              validation-key="sendto"
            >
              <template #default="prop">
                <v-text-field
                  v-model="selectedRecipient.sendto"
                  :disabled="isLocked"
                  :error-messages="prop.firstErrorMessage"
                  :hint="$tc('form.hint.telegram_user_id')"
                  :label="prop.label"
                  data-cy="telegram-sendto"
                />
              </template>
            </VeeFormGroup>

            <VeeFormGroup
              :error-bag="err"
              :label="
              ($t('form.field.bot_access_token') +
                ' (' +
                $t('phrase.optional') +
                ')')
                | capitalize
            "
              validation-key="option1"
            >
              <template #default="prop">
                <v-text-field
                  v-model="selectedRecipient.option1"
                  :disabled="isLocked"
                  :error-messages="prop.firstErrorMessage"
                  :hint="
                  selectedRecipient.option1 ? '' : $tc('form.hint.bot_access_token')
                "
                  :label="prop.label"
                  data-cy="telegram-option1"
                  persistent-hint
                />
              </template>
            </VeeFormGroup>

            <div class="caption mt-2">
              <a
                :href="`${$config.kbBasePath}sending-notifications/telegram`"
                target="_blank"
              >
                {{ $t('recipients.knowledgeBaseLink') }}
              </a>
            </div>
          </template>

          <template
            v-if="
            selectedRecipient.mediatype === 'sms' || selectedRecipient.mediatype === 'phonecall'
          "
          >
            <v-layout
              v-if="isCreatingRecipient"
              row
              wrap
            >
              <v-flex xs12>
                <VeeFormGroup
                  :error-bag="err"
                  :label="$t('form.field.phone') | capitalize"
                  validation-key="sendto"
                >
                  <template #default="prop">
                    <PhoneNumberField
                      v-model="selectedRecipient.sendto"
                      :disabled="isLocked"
                      :placeholder="prop.label"
                      data-cy="phone-sendto"
                    />
                    <v-flex xs12>
                      <v-alert
                        :outline="true"
                        :value="prop.firstErrorMessage"
                        type="error"
                      >
                        {{ prop.firstErrorMessage }}
                      </v-alert>
                    </v-flex>
                  </template>
                </VeeFormGroup>
              </v-flex>
            </v-layout>

            <v-layout v-else>
              <v-flex xs12>
                <v-text-field
                  v-model="selectedRecipient.sendto"
                  :disabled="true"
                  :label="$t('form.field.phone') | capitalize"
                  data-cy="phone-sendto"
                />
              </v-flex>
            </v-layout>
          </template>

          <template v-if="selectedRecipient.mediatype === 'integromat'">
            <VeeFormGroup
              :error-bag="err"
              :label="$t('form.field.integromat') | capitalize"
              validation-key="sendto"
            >
              <template #default="prop">
                <v-text-field
                  v-model="selectedRecipient.sendto"
                  :disabled="isLocked"
                  :error-messages="prop.firstErrorMessage"
                  :label="prop.label"
                  data-cy="integromat-sendto"
                  single-line
                />
              </template>
            </VeeFormGroup>
          </template>

          <template v-if="selectedRecipient.mediatype === 'webhook'">
            <VeeFormGroup
              :error-bag="err"
              :label="$t('form.field.webhook') | capitalize"
              validation-key="sendto"
            >
              <template #default="prop">
                <v-text-field
                  v-model="selectedRecipient.sendto"
                  :disabled="isLocked"
                  :error-messages="prop.firstErrorMessage"
                  :label="prop.label"
                  data-cy="webhook-sendto"
                  single-line
                />
              </template>
            </VeeFormGroup>

            <VeeFormGroup
              :error-bag="err"
              :label="$t('form.field.messageFormat') | capitalize"
              data-cy="webhook-option1"
              validation-key="option1"
            >
              <template #default="prop">
                <v-select
                  v-model="selectedRecipient.option1"
                  :disabled="isLocked"
                  :error-messages="prop.firstErrorMessage"
                  :items="messageFormats"
                  :label="prop.label"
                  item-text="label"
                  item-value="value"
                />
              </template>
            </VeeFormGroup>
          </template>

          <template v-if="selectedRecipient.mediatype === 'pushover'">
            <VeeFormGroup
              :error-bag="err"
              :label="$t('form.field.pushover') | capitalize"
              validation-key="sendto"
            >
              <template #default="prop">
                <v-text-field
                  v-model="selectedRecipient.sendto"
                  :disabled="isLocked"
                  :error-messages="prop.firstErrorMessage"
                  :hint="$tc('form.hint.pushover')"
                  :label="prop.label"
                  data-cy="pushover-sendto"
                  single-line
                />
              </template>
            </VeeFormGroup>
          </template>

          <VeeFormGroup
            :error-bag="err"
            :label="`${$t('form.field.description')} (${$t('phrase.optional')})` | capitalize"
            validation-key="description"
          >
            <template #default="prop">
              <v-text-field
                v-model="selectedRecipient.description"
                :error-messages="prop.firstErrorMessage"
                :label="prop.label"
                data-cy="mediatype-description"
                single-line
              />
            </template>
          </VeeFormGroup>

          <RecipientExtraData
            v-if="!!dialog && selectedRecipient.mediatype === 'integromat'"
            v-model="selectedRecipient.extraData"
            :errors="err"
            class="mt-3"
          />

          <div
            v-if="!!showPrice(selectedRecipient.mediatype)"
            class="caption pa-3 grey lighten-2"
          >
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
                md8
                xs12
              >
                {{ pricingMessage(selectedRecipient.mediatype) }}
              </v-flex>
            </v-layout>
          </div>

          <v-alert
            :value="
            isUpdatingRecipient
              && (!selectedRecipient.isVerified()
                || !!selectedRecipient.administrativelyDisabled)
          "
            bottom
            class="mb-3"
            type="warning"
          >
            <v-layout align-top justify-between row>
              <v-flex xs8>
                <span v-html="recipient_verificationMessage(selectedRecipient)"/>
              </v-flex>
              <v-flex class="text-xs-right" grow>
                <ThrottledButton
                  :loading="$wait.is($WAIT_FOR.RECIPIENT.UPDATE_ID(selectedRecipient.id))"
                  :outline="true"
                  :small="true"
                  :urls="`recipients/${selectedRecipient.id}/resend-verification-email`"
                  color="white"
                  @click="resendVerificationEmail(selectedRecipient)"
                >
                  {{ $t('recipients.resendVerificationLink') | capitalize }}
                </ThrottledButton>
              </v-flex>
            </v-layout>
          </v-alert>
        </div>
        <template>
          <!--SEND TEST-->
          <div
            v-if="isTestMessageable"
            class="mb-3"
          >
            <v-layout
              align-center
              row
              wrap
            >
              <v-flex
                :class="
                  ($vuetify.breakpoint.smAndDown ? 'mb-4 ' : '') +
                    'text-xs-center text-md-left'
                "
                md7
                xs12
              >
                <v-fade-transition>
                  <span
                    v-show="testMessageResult"
                    :class="'caption ' + testMessageColor + '--text'"
                  >
                    <v-icon
                      :color="testMessageColor"
                      class="mr-1"
                      size="16"
                    >
                      {{
                        testMessageColor === 'success' ? 'check_circle' : 'error'
                      }}
                    </v-icon>
                    {{ testMessageResult | capitalize }}
                  </span>
                </v-fade-transition>
              </v-flex>

              <v-flex md5 xs12>
                <v-layout justify-end wrap>
                  <v-flex
                    v-if="selectedRecipient.hasLogs() && isUpdatingRecipient"
                    md5
                    xs12
                  >
                    <v-btn
                      block
                      class="ma-0"
                      color="primary"
                      flat
                      small
                      @click="recipient_showLogs(selectedRecipient)"
                    >
                      {{ $t('recipients.showLogs') }}
                    </v-btn>
                  </v-flex>

                  <v-flex
                    v-else-if="showTutorialButton"
                    md5 xs12
                  >
                    <PlayVideoButton
                      :video="videoIdByMediatype"
                      block
                    />
                  </v-flex>

                  <v-flex
                    :md7="
                      showTutorialButton
                        || selectedRecipient.hasLogs() && isUpdatingRecipient
                    "
                    xs12
                  >
                    <ThrottledButton
                      :disabled="!selectedRecipient.sendto"
                      :loading="$wait.is($WAIT_FOR.RECIPIENT.SEND_TEST_MESSAGE)"
                      :small="true"
                      btn-class="ma-0"
                      class="d-flex"
                      color="primary"
                      urls="recipients/send-test-message"
                      @click="sendTestMessage"
                    >
                      {{ $t('recipients.sendTest') }}
                    </ThrottledButton>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </div>

          <!--EVENTS TO SEND-->
          <div class="mb-3">
            <h5 class="subheading mb-2">
              {{ $t('recipients.eventsSendToThisRecipient') }}
            </h5>

            <v-layout
              row
              wrap
            >
              <v-flex
                md4
                sm6
                xs12
              >
                <VeeFormGroup
                  :error-bag="err"
                  :label="$t('form.field.alerts') | capitalize"
                  validation-key="alerts"
                >
                  <template #default="prop">
                    <v-checkbox
                      v-model="selectedRecipient.alerts"
                      :error-messages="prop.firstErrorMessage"
                      :label="prop.label"
                      data-cy="recipientAlertsCheckbox"
                      hide-details
                      @change="toggleReminders"
                    />
                  </template>
                </VeeFormGroup>

                <VeeFormGroup
                  :error-bag="err"
                  :label="$t('form.field.warnings') | capitalize"
                  validation-key="warnings"
                >
                  <template #default="prop">
                    <v-checkbox
                      v-model="selectedRecipient.warnings"
                      :error-messages="prop.firstErrorMessage"
                      :label="prop.label"
                      hide-details
                      @change="toggleReminders"
                    />
                  </template>
                </VeeFormGroup>

                <VeeFormGroup
                  :error-bag="err"
                  :label="$t('form.field.recoveries') | capitalize"
                  validation-key="recoveries"
                >
                  <template #default="prop">
                    <v-checkbox
                      v-model="selectedRecipient.recoveries"
                      :error-messages="prop.firstErrorMessage"
                      :label="prop.label"
                      hide-details
                    />
                  </template>
                </VeeFormGroup>

                <VeeFormGroup
                  :error-bag="err"
                  :label="$t('form.field.reminders') | capitalize"
                  validation-key="reminders"
                >
                  <template #default="prop">
                    <v-tooltip
                      :disabled="!hasNoAlertsOrWarnings"
                      bottom
                      max-width="230"
                      nudge-top="10"
                    >
                      <v-checkbox
                        slot="activator"
                        v-model="selectedRecipient.reminders"
                        :disabled="hasNoAlertsOrWarnings"
                        :error-messages="prop.firstErrorMessage"
                        :label="prop.label"
                        hide-details
                      />
                      <span>{{ $t('recipients.remindersReadonlyHint') }}</span>
                    </v-tooltip>
                  </template>
                </VeeFormGroup>

                <VeeFormGroup
                  v-if="showComments"
                  :error-bag="err"
                  :label="$t('form.field.comments') | capitalize"
                  validation-key="comments"
                >
                  <template #default="prop">
                    <v-checkbox
                      v-model="selectedRecipient.comments"
                      :disabled="isProdEnv"
                      :error-messages="prop.firstErrorMessage"
                      :label="prop.label"
                      hide-details
                    >
                      <template
                        v-if="isProdEnv"
                        #append
                      >
                        <v-chip
                          class="white--text"
                          color="success"
                          disabled
                          small
                        >
                          Coming soon
                        </v-chip>
                      </template>
                    </v-checkbox>
                  </template>
                </VeeFormGroup>

                <VeeFormGroup
                  v-if="selectedRecipient.mediatype === 'email'"
                  :error-bag="err"
                  :label="$t('form.field.appendEventIDToSubject') | capitalize"
                  validation-key="eventUuids"
                >
                  <template #default="prop">
                    <v-tooltip
                      :disabled="!hasNoEventSelected"
                      bottom
                      max-width="230"
                      nudge-top="10"
                    >
                      <v-checkbox
                        slot="activator"
                        v-model="selectedRecipient.eventUuids"
                        :disabled="hasNoEventSelected"
                        :error-messages="prop.firstErrorMessage"
                        :label="prop.label"
                        hide-details
                      />
                      <span>{{ $t('recipients.eventUuidsReadonlyHint') }}</span>
                    </v-tooltip>
                  </template>
                </VeeFormGroup>
              </v-flex>

              <v-flex
                md4
                sm6
                xs12
              >
                <template v-if="selectedRecipient.mediatype === 'email'">
                  <VeeFormGroup
                    :label="$t('form.field.dailySummary') | capitalize"
                  >
                    <template #default="prop">
                      <v-checkbox
                        v-model="selectedRecipient.dailySummary"
                        :label="prop.label"
                        hide-details
                      />
                    </template>
                  </VeeFormGroup>

                  <VeeFormGroup
                    :label="$t('form.field.dailyReports') | capitalize"
                  >
                    <template #default="prop">
                      <v-checkbox
                        v-model="selectedRecipient.dailyReports"
                        :label="prop.label"
                        hide-details
                      />
                    </template>
                  </VeeFormGroup>

                  <VeeFormGroup
                    :label="$t('form.field.weeklyReports') | capitalize"
                  >
                    <template #default="prop">
                      <v-checkbox
                        v-model="selectedRecipient.weeklyReports"
                        :label="prop.label"
                        hide-details
                      />
                    </template>
                  </VeeFormGroup>

                  <VeeFormGroup
                    :label="$t('form.field.monthlyReports') | capitalize"
                  >
                    <template #default="prop">
                      <v-checkbox
                        v-model="selectedRecipient.monthlyReports"
                        :label="prop.label"
                        hide-details
                      />
                    </template>
                  </VeeFormGroup>
                </template>
              </v-flex>
            </v-layout>

            <v-alert
              :value="notificationsError"
              color="error"
              outline
            >
              {{ $t('recipients.notificationsValidationError') }}
            </v-alert>

            <BackendValidationAlert/>
          </div>

          <!--CONFIGURE RULES-->
          <div class="my-4">
            <h5 class="subheading mb-3">
              {{ $tc('recipients.filters') }}<br>
              <span class="caption">
                <a
                  href="https://docs.cloudradar.io/sending-notifications/advanced-event-routing"
                  target="_blank"
                >
                  {{ $tc('recipients.learnMoreAboutAdvancedRouting') }}
                </a>
              </span>
            </h5>

            <v-layout
              v-if="!selectedRecipient.alerts && !selectedRecipient.warnings"
              class="mb-3"
              row
              wrap
            >
              <v-flex
                md11
                xs12
              >
                <v-alert
                  :value="true"
                  type="info"
                >
                  {{ $t('recipients.filtersDoNotApply') }}
                </v-alert>
              </v-flex>
            </v-layout>

            <RecipientFilters
              v-if="dialog"
              v-model="selectedRecipient.rules"
              :errors="err"
            />
          </div>

          <!--CONFIGURE REMINDERS-->
          <div
            v-if="selectedRecipient.reminders"
            class="mb-4"
          >
            <h5 class="subheading mb-2">
              {{ $tc('recipients.frequencyAndDelayOfReminders') }}
            </h5>

            <VeeFormGroup
              :error-bag="err"
              :label="$t('form.field.reminderDelay') | capitalize"
              validation-key="reminderDelay"
            >
              <template #default="prop">
                <v-select
                  v-model="selectedRecipient.reminderDelay"
                  :error-messages="prop.firstErrorMessage"
                  :hint="
                  $t('form.hint.reminderDelay', {
                    time:
                      selectedReminderDelay.smallLabel ||
                      selectedReminderDelay.label
                  }) | capitalize
                "
                  :items="reminderDelays"
                  :label="prop.label"
                  box
                  item-text="label"
                  item-value="value"
                  persistent-hint
                  @change="onReminderDelaySelect"
                />
              </template>
            </VeeFormGroup>

            <VeeFormGroup
              :error-bag="err"
              :label="$t('form.field.maximumReminders') | capitalize"
              validation-key="maximumReminders"
            >
              <template #default="prop">
                <v-text-field
                  v-model="selectedRecipient.maximumReminders"
                  :error-messages="prop.firstErrorMessage"
                  :hint="
                  $t('form.hint.maximumReminders', {
                    reminders: isNaN(selectedRecipient.maximumReminders)
                      ? 1
                      : selectedRecipient.maximumReminders,
                    maximumAllowedReminders
                  }) | capitalize
                "
                  :label="prop.label"
                  box
                  persistent-hint
                  single-line
                />
              </template>
            </VeeFormGroup>
          </div>
        </template>

      </template>
    </div>

    <!--FOOTER SECTION-->
    <template
      v-if="isUpdatingRecipient && !isBlockedMediaType"
      #prebutton
    >
      <v-switch
        v-model="selectedRecipient.active"
        :label="$t('form.field.active') | capitalize"
        class="shrink pt-0 my-0 mr-4"
        hide-details
      />
    </template>

    <template #custom-submit>
      <v-btn
        v-if="!isBlockedMediaType"
        color="primary"
        flat
        type="submit"
      >
        <template v-if="isUpdatingRecipient">
          {{ $t('recipients.buttonUpdateRecipient') }}
        </template>
        <template v-else>
          {{ $t('recipients.buttonAddRecipient') }}
        </template>
      </v-btn>
    </template>

    <VideoDialog/>
  </Modal>
</template>

<script>
  /* eslint-disable global-require */
  import { ErrorBag, Validator } from 'vee-validate';

  import AppWait from '@/components/App/AppWait';
  import Modal from '@/components/App/Modal';
  import PhoneNumberField from '@/components/Recipients/PhoneNumberField';
  import RecipientIcon from '@/components/Recipients/RecipientIcon';
  import RecipientExtraData from '@/components/Recipients/RecipientExtraData';
  import RecipientFilters from '@/components/Recipients/RecipientFilters';
  import PlayVideoButton from '@/components/Videos/PlayVideoButton';
  import VideoDialog from '@/components/Videos/VideoDialog';

  import AppMixin from '@/mixins/app';
  import recipientMixins from '@/mixins/recipient';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import ThrottledButton from '@/components/App/ThrottledButton';

  export default {
    components: {
      ThrottledButton,
      AppWait,
      Modal,
      PhoneNumberField,
      RecipientIcon,
      RecipientExtraData,
      RecipientFilters,
      PlayVideoButton,
      VideoDialog,
    },
    mixins: [
      AppMixin,
      recipientMixins,
      useBackendValidation,
    ],
    data() {
      return {
        err: new ErrorBag(),
        phone: '',
        notificationsError: false,
        testMessageResult: '',
        testMessageColor: 'success',
        telegramBotHandle: null,
        messageFormats: [
          {
            label: this.$options.filters.capitalize(
              this.$t('recipients.messageFormats.multipart'),
            ),
            value: 'multipart-form-data',
          },
          {
            label: this.$options.filters.capitalize(
              this.$t('recipients.messageFormats.jsonRaw'),
            ),
            value: 'json-raw',
          },
        ],
      };
    },
    computed: {
      ...mapState('recipients', {
        dialog: 'recipientDialog',
      }),
      ...mapState('recipients', [
        'recipients',
        'selectedRecipient',
      ]),
      isBlockedMediaType() {
        if (! this.isProdEnv) return false;
        if (this.isUpdatingRecipient) return false;
        return ['sms', 'phonecall'].includes(this.selectedRecipient.mediatype);
      },
      isTestMessageable() {
        const isVerifiedEmail = this.selectedRecipient.mediatype === 'email' && this.selectedRecipient.verified;
        const isTestableMediatype = [
          'slack', 'msteams', 'telegram', 'pushover', 'sms', 'phonecall', 'integromat', 'webhook',
        ].includes(this.selectedRecipient.mediatype);

        return isVerifiedEmail || isTestableMediatype;
      },
      mediatypes() {
        const mediatypes = [
          'email',
          'integromat',
          'msteams',
          'pushover',
          'slack',
          'telegram',
          'webhook',
          'phonecall',
          'sms',
        ];
        return mediatypes.map(mt => ({
          value: mt,
          icon: require(`~/assets/icons/${mt}.png`),
          label: this.$options.filters.capitalize(
            this.$t(`recipients.mediatypes.${mt}`),
          ),
          disabled: ! this.$auth.user.onPaygPlan() && (mt === 'sms' || mt === 'phonecall'),
        }));
      },
      isCreatingRecipient() {
        return ! this.isUpdatingRecipient;
      },
      isUpdatingRecipient() {
        return this.selectedRecipient.hasId();
      },
      showTutorialButton() {
        return ['telegram'].includes(this.selectedRecipient.mediatype);
      },
      videoIdByMediatype() {
        const videosByMediatype = {
          telegram: '388662836'
        };

        return videosByMediatype[this.selectedRecipient.mediatype];
      },
      reminderDelays() {
        const result = [
          {
            smallLabel: this.$options.filters.capitalize(
              this.$t('recipients.reminderDelays.30minutes'),
            ),
            label: this.$options.filters.capitalize(
              `${this.$t('recipients.reminderDelays.30minutes')
              } (${
                this.$t('phrase.notRecommended')
              })`,
            ),
            value: 30 * 60,
          },
          {
            label: this.$options.filters.capitalize(
              this.$t('recipients.reminderDelays.1hour'),
            ),
            value: 60 * 60,
          },
          {
            label: this.$options.filters.capitalize(
              this.$t('recipients.reminderDelays.2hours'),
            ),
            value: 120 * 60,
          },
          {
            smallLabel: this.$options.filters.capitalize(
              this.$t('recipients.reminderDelays.4hours'),
            ),
            label: this.$options.filters.capitalize(
              `${this.$t('recipients.reminderDelays.4hours')
              } (${
                this.$t('phrase.recommended')
              })`,
            ),
            value: 240 * 60,
          },
          {
            label: this.$options.filters.capitalize(
              this.$t('recipients.reminderDelays.12hours'),
            ),
            value: 720 * 60,
          },
          {
            label: this.$options.filters.capitalize(
              this.$t('recipients.reminderDelays.16hours'),
            ),
            value: 960 * 60,
          },
          {
            label: this.$options.filters.capitalize(
              this.$t('recipients.reminderDelays.24hours'),
            ),
            value: 1440 * 60,
          },
        ];

        // This part adds a custom option to the result array
        // to support legacy input (which was not restricted to a select box)
        if (
          this.selectedRecipient.reminderDelay
          && ! isNaN(this.selectedRecipient.reminderDelay)
          && ! result.find(rD => rD.value === this.selectedRecipient.reminderDelay)
        ) {
          result.push({
            label: this.$options.filters.capitalize(
              this.$t('recipients.reminderDelays.XMinutes', {
                minutes: this.selectedRecipient.reminderDelay / 60,
              }),
            ),
            value: parseInt(this.selectedRecipient.reminderDelay),
          });
        }

        return result;
      },
      selectedReminderDelay() {
        return this.reminderDelays.find(
          rD => this.selectedRecipient.reminderDelay === rD.value,
        );
      },
      hasNoAlertsOrWarnings() {
        return ! this.selectedRecipient.alerts && ! this.selectedRecipient.warnings;
      },
      hasNoEventSelected() {
        return ! this.selectedRecipient.warnings
               && ! this.selectedRecipient.reminders
               && ! this.selectedRecipient.alerts
               && ! this.selectedRecipient.recoveries
               && ! this.selectedRecipient.comments;
      },
      showComments() {
        return ! ['sms', 'phonecall'].includes(this.selectedRecipient.mediatype);
      },
      maximumAllowedReminders() {
        const reminderDelay = this.selectedRecipient.reminderDelay
                              ? this.selectedRecipient.reminderDelay / 60
                              : 240;

        if (reminderDelay >= 7200) return 1;

        return Math.round(7200 / reminderDelay);
      },
      validationRules() {
        const result = {
          mediatype: {
            required: true,
          },
          sendto: {
            required: true,
            min: 6,
            max: 100,
          },
          option1: {},
          description: {
            max: 100,
          },
        };

        if (this.isCreatingRecipient) {
          result.sendto.uniqueSendTo = true;
        }

        if (['sms', 'phonecall'].includes(this.selectedRecipient.mediatype)) {
          result.sendto.required = true;
          result.sendto.min = 3;
          result.sendto.phoneNumber = true;
        }

        if (this.selectedRecipient.mediatype === 'email') {
          result.sendto.email = true;
        }

        if (['webhook', 'msteams', 'integromat'].includes(this.selectedRecipient.mediatype)) {
          result.sendto.url = true;
          result.sendto.max = 200;
        }

        if (this.selectedRecipient.mediatype === 'telegram') {
          result.sendto.telegramUserId = true;
          result.sendto.max = 16;
        }

        if (this.selectedRecipient.mediatype === 'pushover') {
          result.sendto.length = 30;
        }

        if (this.selectedRecipient.mediatype === 'slack') {
          result.sendto.min = 42;
          result.sendto.max = 200;
        }

        if (this.selectedRecipient.mediatype === 'webhook') {
          result.option1.required = true;
        }

        if (['slack', 'telegram', 'webhook'].includes(this.selectedRecipient.mediatype)) {
          result.option1.min = 2;
        }

        if (this.selectedRecipient.mediatype === 'slack') {
          result.option1.slackUsername = true;
        }

        if (this.selectedRecipient.mediatype === 'telegram') {
          result.option1.telegramAPIToken = true;
        }

        if (this.selectedRecipient.reminders) {
          result.maximumReminders = {
            required: true,
            integer: true,
            min_value: 1,
            max_value: this.maximumAllowedReminders,
          };

          result.reminderDelay = {
            required: true,
            integer: true,
            min_value: 10,
            max_value: 2147483647,
          };
        }

        if (this.selectedRecipient.extraData?.length) {
          this.selectedRecipient.extraData.forEach((item, i) => {
            result[`extradata_key_${i}`] = {
              required: true,
            };
            result[`extradata_value_-${i}`] = {
              required: true,
              min: 1,
            };
          });
        }

        if (this.selectedRecipient.rules?.data?.length) {
          this.selectedRecipient.rules.data.forEach((rule, i) => {
            result[`filter_${i}`] = {
              uniqueFilter: true,
            };

            result[`filter_field_${i}`] = {
              required: true,
            };

            result[`filter_value_${i}`] = {
              required: true,
              min: 1,
            };
          });
        }

        Object.keys(result).forEach((key) => {
          const config = Object.keys(result[key]).map((configKey) => {
            if (result[key][configKey] === true) {
              return configKey;
            }
            return `${configKey}:${result[key][configKey]}`;
          });

          result[key] = config.join('|');
        });

        return result;
      },
      isLocked() {
        if (this.isCreatingRecipient) return false;

        return ['email', 'sms', 'phonecall', 'pushover'].includes(this.selectedRecipient.mediatype);
      },
    },
    watch: {
      'selectedRecipient.mediatype'(mediaType) {
        if (this.isUpdatingRecipient) {
          return;
        }

        this.reset(mediaType);

        if (this.selectedRecipient.mediatype === 'webhook') {
          this.selectedRecipient.option1 = 'multipart-form-data';
        }
      },
      'selectedRecipient.option1'() {
        if (!! this.telegramBotHandle) {
          this.telegramBotHandle = null;
        }
      },
      selectedRecipient: {
        handler(recipient) {
          [
            'alerts',
            'warnings',
            'reminders',
            'comments',
            'dailySummary',
            'dailyReports',
            'weeklyReports',
            'monthlyReports',
          ].forEach((check) => {
            if (this.notificationsError) {
              this.notificationsError = ! recipient[check];
            }
          });
        },
        deep: true,
      },
      hasNoEventSelected() {
        if (!! this.hasNoEventSelected)
          // check if uuid valid here
          this.selectedRecipient.eventUuids = false;
      }
    },
    methods: {
      ...mapActions('recipients', {
        updateRecipientAction: 'updateRecipient',
        createRecipientAction: 'createRecipient',
        resendVerificationEmailAction: 'resendVerificationEmail',
      }),
      ...mapMutations('recipients', ['setSelectedRecipient', 'resetSelectedRecipient', 'toggleRecipientDialog']),
      createValidator() {
        Validator.extend('uniqueSendTo', {
          getMessage: field => this.$t('validation.uniqueSendTo', { attribute: field }),
          validate: (value) => {
            if (value) {
              const combine = (sendTo, mediaType) => sendTo.toLowerCase() + mediaType.toLowerCase();

              return (
                this.recipients
                    .map(({ sendto, mediatype }) => combine(sendto, mediatype))
                    .indexOf(combine(value, this.selectedRecipient.mediatype)) === -1
              );
            }

            return true;
          },
        });

        Validator.extend('phoneNumber', {
          validate(value) {
            if (! value) return false;

            return /^\+[0-9]+$/.test(value);
          },
        });

        Validator.extend('telegramUserId', {
          validate: value => value && /^[0-9]+$/.test(value),
        });

        Validator.extend('telegramAPIToken', {
          validate: value => /^[0-9]+:./.test(value),
        });

        Validator.extend('slackUsername', {
          validate: value => /^(@|#).+$/.test(value),
        });

        Validator.extend('uniqueFilter', {
          validate: (value) => {
            if (value && this.selectedRecipient.rules?.data?.length) {
              value = value.toLowerCase();
              let combine = (field, value) => {
                let result = field + value;
                result = result.toLowerCase();

                return result;
              };

              return (
                this.selectedRecipient.rules.data
                    .map(({ field, value }) => combine(field, value))
                    .filter(fieldValue => fieldValue === value)
                  .length < 2
              );
            }

            return true;
          },
        });

        const validator = new Validator();
        let sendToName;
        let option1Name;

        switch (this.selectedRecipient.mediatype) {
          case 'slack':
            sendToName = this.$t('form.field.slack_token');
            option1Name = this.$t('form.field.slack_channel_or_username');
            break;
          case 'msteams':
            sendToName = this.$t('form.field.msteams_webhook_connector');
            option1Name = 'option1';
            break;
          case 'telegram':
            sendToName = this.$t('form.field.telegram_user_id');
            option1Name = this.$t('form.field.bot_access_token');
            break;
          case 'email':
            sendToName = this.$t('form.field.email');
            option1Name = 'option1';
            break;
          case 'integromat':
            sendToName = this.$t('form.field.integromat');
            option1Name = 'option1';
            break;
          case 'webhook':
            sendToName = this.$t('form.field.webhook');
            option1Name = this.$t('form.field.messageFormat');
            break;
          case 'pushover':
            sendToName = this.$t('form.field.pushover');
            option1Name = 'option1';
            break;
          case 'sms':
          case 'phonecall':
            sendToName = this.$t('form.field.phone');
            option1Name = 'option1';
            break;
          default:
            sendToName = 'sendto';
            option1Name = 'option1';
        }

        validator.attach({
          alias: this.$t('form.field.mediatype'),
          name: 'mediatype',
          rules: this.validationRules.mediatype,
          getter: () => this.selectedRecipient.mediatype,
        });

        validator.attach({
          alias: sendToName,
          name: 'sendto',
          rules: this.validationRules.sendto,
          getter: () => this.selectedRecipient.sendto,
        });

        validator.attach({
          alias: option1Name,
          name: 'option1',
          rules: this.validationRules.option1,
          getter: () => this.selectedRecipient.option1,
        });

        validator.attach({
          alias: this.$t('form.field.description'),
          name: 'description',
          rules: this.validationRules.description,
          getter: () => this.selectedRecipient.description,
        });

        validator.attach({
          alias: this.$t('form.field.maximumReminders'),
          name: 'maximumReminders',
          rules: this.validationRules.maximumReminders,
          getter: () => this.selectedRecipient.maximumReminders,
        });

        validator.attach({
          alias: this.$t('form.field.reminderDelay'),
          name: 'reminderDelay',
          rules: this.validationRules.reminderDelay,
          getter: () => this.selectedRecipient.reminderDelay,
        });

        if (this.selectedRecipient.extraData?.length) {
          this.selectedRecipient.extraData.forEach((rule, i) => {
            const itemKey = `extradata_key_${i}`;
            const itemValue = `extradata_value_${i}`;

            validator.attach({
              alias: this.$t('form.field.field'),
              name: itemKey,
              rules: this.validationRules[itemKey],
              getter: () => this.selectedRecipient.extraData[i].key,
            });

            validator.attach({
              alias: this.$t('phrase.value'),
              name: itemValue,
              rules: this.validationRules[itemValue],
              getter: () => this.selectedRecipient.extraData[i].value,
            });
          });
        }

        if (this.selectedRecipient.rules?.data?.length) {
          this.selectedRecipient.rules.data.forEach((rule, i) => {
            const filter_name = `filter_${i}`;
            const filter_field = `filter_field_${i}`;
            const filter_value = `filter_value_${i}`;

            validator.attach({
              alias: this.$t('phrase.rule'),
              name: filter_name,
              rules: this.validationRules[filter_name],
              getter: () => this.selectedRecipient.rules.data[i].field + this.selectedRecipient.rules.data[i].value,
            });

            validator.attach({
              alias: this.$t('form.field.field'),
              name: filter_field,
              rules: this.validationRules[filter_field],
              getter: () => this.selectedRecipient.rules.data[i].field,
            });

            validator.attach({
              alias: this.$t('phrase.value'),
              name: filter_value,
              rules: this.validationRules[filter_value],
              getter: () => this.selectedRecipient.rules.data[i].value,
            });
          });
        }

        return validator;
      },
      toggleReminders() {
        if (! this.selectedRecipient.alerts && ! this.selectedRecipient.warnings) {
          this.selectedRecipient.reminders = false;
        }
      },
      async sendTestMessage() {
        this.useBackendValidation_reset();
        this.testMessageResult = '';
        this.err = new ErrorBag();

        this.$wait.start(this.$WAIT_FOR.RECIPIENT.SEND_TEST_MESSAGE);

        const validator = this.createValidator();
        const result = await validator.validateAll();
        if (! result) {
          this.err = validator.errors;
          this.$wait.end(this.$WAIT_FOR.RECIPIENT.SEND_TEST_MESSAGE);
          return;
        }

        if (this.selectedRecipient.mediatype === 'telegram') {
          // TELEGRAM: Look up bot handle
          let telegramConfirmMessage = this.$t('recipients.confirmTelegramConversationDefaultBot');
          if (!! this.selectedRecipient.option1) {
            const handle = await this.fetchTelegramBotHandle();
            if (! handle) return false;
            telegramConfirmMessage = this.$t('recipients.confirmTelegramConversation', { handle });
          }

          // eslint-disable-next-line
          if (! confirm(telegramConfirmMessage)) {
            this.$wait.end(this.$WAIT_FOR.RECIPIENT.SEND_TEST_MESSAGE);
            return false;
          }
        }

        this.$axios
            .$post('/recipients/send-test-message', this.selectedRecipient)
            .then(() => {
              this.testMessageColor = 'success';
              this.testMessageResult = this.$t('recipients.testMessageSent');
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              const errorMessage = `${this.$t('recipients.testMessageSentError')}`;
              this.showError(errorMessage);
            })
            .finally(() => {
              this.$wait.end(this.$WAIT_FOR.RECIPIENT.SEND_TEST_MESSAGE);
            });
      },
      async fetchTelegramBotHandle() {
        if (this.telegramBotHandle) {
          return this.telegramBotHandle;
        }
        try {

          const botToken = this.selectedRecipient.option1 || process.env.TELEGRAM_DEFAULT_BOT;
          const { data } = await this.$axios.get(`https://api.telegram.org/bot${botToken}/getMe`);
          this.telegramBotHandle = data.result.username;
          return this.telegramBotHandle;
        } catch (e) {
          this.$wait.end(this.$WAIT_FOR.RECIPIENT.SEND_TEST_MESSAGE);
          this.showError(this.$t('recipients.botCouldNotBeFound'));
          return false;
        }
      },
      showError(errorMessage) {
        this.testMessageColor = 'error';
        this.testMessageResult = errorMessage;
      },
      onReminderDelaySelect() {
        this.err = new ErrorBag();
      },
      showPrice(value) {
        return ['sms', 'phonecall'].includes(value);
      },
      pricingMessage(value) {
        let result;

        switch (value) {
          case 'sms':
            result = this.$t('recipients.smsPricing');
            break;
          case 'phonecall':
            result = this.$t('recipients.phoneCallPricing');
            break;
        }

        return result;
      },
      async onSubmit() {
        this.err = new ErrorBag();
        this.notificationsError = false;
        this.useBackendValidation_reset();

        // check if user selected at least one event
        if (
          (this.selectedRecipient.mediatype === 'email'
           && (! this.selectedRecipient.warnings
           && ! this.selectedRecipient.reminders
           && ! this.selectedRecipient.alerts
           && ! this.selectedRecipient.comments
           && ! this.selectedRecipient.recoveries
           && ! this.selectedRecipient.dailySummary
           && ! this.selectedRecipient.dailyReports
           && ! this.selectedRecipient.weeklyReports
           && ! this.selectedRecipient.monthlyReports))
          || (this.selectedRecipient.mediatype !== 'email'
              && (! this.selectedRecipient.warnings
              && ! this.selectedRecipient.reminders
              && ! this.selectedRecipient.alerts
              && ! this.selectedRecipient.recoveries
              && ! this.selectedRecipient.comments))
        ) {
          this.notificationsError = true;
        }

        /*
          input fields such as comboboxes originating from the RecipientFilters
          update only on blur, the validator fires too fast so that the model can not
          be updated in time.

          nextTick is too fast here as well, so we have to rely on setTimeout.
        */
        setTimeout(async () => {
          const validator = this.createValidator();
          const result = await validator.validateAll();

          if (result && ! this.notificationsError) {
            if (this.isUpdatingRecipient) {
              this.updateRecipient(this.selectedRecipient);
            } else {
              this.createRecipient(this.selectedRecipient);
            }
          } else {
            this.err = validator.errors;
          }
        }, 200);

      },
      createRecipient(Recipient) {
        this.createRecipientAction({ Recipient })
            .then(() => {
              this.$emit('on-create', { success: true, Recipient });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-create', { success: false, Recipient });
            });
      },
      updateRecipient(Recipient) {
        this.updateRecipientAction({ Recipient })
            .then(() => {
              this.$emit('on-update', { success: true, Recipient });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-update', { success: false, Recipient });
            });
      },
      async resendVerificationEmail(Recipient) {
        try {
          await this.resendVerificationEmailAction({ Recipient });
          this.$emit('on-verify', { success: true, Recipient });
        } catch ({ response }) {
          if (response.status === 429) {
            this.$flash.error(this.$t('message.general.tooManyAttempts'));
          } else {
            this.$emit('on-verify', { success: false, Recipient });
          }
        }
      },
      onCancel() {
        this.toggleRecipientDialog(false);
        this.reset();
      },
      onConfirm() {
        this.toggleRecipientDialog(false);
        this.$emit('confirm');
      },
      reset(toMediaType = 'email') {
        this.phone = '';
        this.resetSelectedRecipient(toMediaType);
        this.notificationsError = false;
        this.useBackendValidation_reset();
        this.testMessageResult = null;
        this.err = new ErrorBag();
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .min-height-fix
    min-height 400px

  .premium-badge,
  .coming-soon-badge,
  .by-request-badge
    width: 102px
    justify-content: center
    -ms-flex-pack: center
    margin-left: auto

  .mediatype-icon
    width: 36px
    height: 36px

  .mediatype-icon.disabled
    opacity: 0.75

  .mediatype-price
    letter-spacing: -0.5px;

  .telegram-guide
    max-height: 500px
</style>

<style lang="stylus">
  .vue-tel-input
    flex 1 1 auto
    line-height 20px
    max-width 100%
    min-width 0
    width 100%

    &:focus
      outline none

    .dropdown
      ul
        border-bottom-left-radius 8px
        border-bottom-right-radius 8px
        margin-top 12px
        margin-bottom 10px

      &:hover, &.open
        background-color none

      &:focus
        outline none

    input
      padding 12px 0 12px 7px
</style>
