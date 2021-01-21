<template>
  <div id="recipients-table">
    <BackendValidationAlert/>
    <v-card>
      <v-card-text class="pt-1">
        <v-layout
          align-end justify-end pb-3
          wrap
        >
          <SearchBox
            v-model="filters.search"
            :search-by="['send to', 'description']"
          />
        </v-layout>
      </v-card-text>
      <v-divider/>
      <div class="position-relative">
        <v-data-table
          :headers="headers"
          :items="recipients"
          :pagination.sync="pagination"
          :rows-per-page-items="rowsPerPage"
          :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
          :total-items="totalCount"
          data-cy="recipientsList"
          item-key="id"
        >
          <template #items="{ item: Recipient }">
            <tr :class="!Recipient.active ? 'inactive' : null">
              <td>
                <v-tooltip
                  bottom
                  class="v-tooltip--hint"
                >
                  <RecipientIcon
                    slot="activator"
                    :mediatype="Recipient.mediatype"
                    :verified="Recipient.isVerified()"
                  />
                  <span
                    v-if="!Recipient.isVerified() || !!Recipient.administrativelyDisabled"
                    v-html="recipient_verificationMessage(Recipient)"
                  />
                  <span v-else>{{ $t(`recipients.mediatypes.${Recipient.mediatype}`) }}</span>
                </v-tooltip>
              </td>
              <td style="max-width:200px">
                <v-tooltip bottom>
                  <div
                    slot="activator"
                    class="text-truncate pointer"
                  >
                    {{ Recipient.sendto }}
                  </div>
                  <span>{{ Recipient.sendto }}</span>
                </v-tooltip>
              </td>
              <td
                style="max-width:200px"
              >
                <v-tooltip bottom>
                  <div
                    slot="activator"
                    class="text-truncate pointer"
                  >
                    {{ Recipient.description }}
                  </div>
                  <span>{{ Recipient.description }}</span>
                </v-tooltip>
              </td>
              <td
                class="text-truncate"
                style="max-width:200px"
              >
                <v-tooltip bottom>
                  <div
                    slot="activator"
                    class="text-truncate pointer"
                  >
                    {{ generateNotificationList(Recipient) }}
                  </div>
                  <span>{{ generateNotificationList(Recipient) }}</span>
                </v-tooltip>

              </td>
              <td>
                {{ Recipient.permanentFailuresLast24h }}
              </td>
              <td class="text-no-wrap text-xs-right">
                <v-layout
                  v-if="shouldShowActions"
                  align-center
                >
                  <v-switch
                    v-model="Recipient.active"
                    class="pt-0"
                    data-cy="recipientActiveToggle"
                    hide-details
                    @change="toggleActiveFlag(Recipient)"
                  />
                  <ThrottledButton
                    v-if="!Recipient.isVerified()"
                    :loading="$wait.is($WAIT_FOR.RECIPIENT.UPDATE_ID(Recipient.id))"
                    :outline="true"
                    :small="true"
                    :urls="`recipients/${Recipient.id}/resend-verification-email`"
                    class="qa-resend-verfication-link"
                    color="secondary"
                    data-cy="resendVerificationLinkButton"
                    @click="resendVerificationEmail(Recipient)"
                  >
                    {{ $t('recipients.resendVerificationLink') | capitalize }}
                  </ThrottledButton>
                  <v-menu
                    left
                    nudge-left="4px"
                    nudge-top="6px"
                    offset-x
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        class="qa-recipient-menu"
                        data-cy="recipientActionsButton"
                        icon
                        small
                        @click="onMenuOpen(Recipient)"
                      >
                        <v-icon>more_vert</v-icon>
                      </v-btn>
                    </template>
                    <v-list dense>
                      <v-list-tile
                        v-if="!!hasFilters(Recipient)"
                        class="qa-recipient-filters"
                        @click="onMenuEditClick(Recipient)"
                      >
                        <v-list-tile-action>
                          <v-icon color="grey darken-3">
                            filter_list
                          </v-icon>
                        </v-list-tile-action>
                        <v-list-tile-title>
                          {{ $tc('recipients.filtersApplied', Recipient.rules.data.length) }}
                        </v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile
                        v-if="Recipient.hasLogs()"
                        class="qa-logs"
                        @click="recipient_showLogs(Recipient)"
                      >
                        <v-list-tile-action>
                          <v-icon color="grey darken-3">
                            notes
                          </v-icon>
                        </v-list-tile-action>
                        <v-list-tile-title>
                          {{ $t('button.goToLogs') | capitalize }}
                        </v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile
                        class="qa-edit"
                        data-cy="editRecipientButton"
                        @click="onMenuEditClick(Recipient)"
                      >
                        <v-list-tile-action>
                          <v-icon color="grey darken-3">
                            edit
                          </v-icon>
                        </v-list-tile-action>
                        <v-list-tile-title>
                          {{ $t('button.edit') | capitalize }}
                        </v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile
                        class="qa-delete"
                        data-cy="deleteRecipientButton"
                        @click="onMenuDeleteClick(Recipient)"
                      >
                        <v-list-tile-action>
                          <v-icon color="error">
                            delete
                          </v-icon>
                        </v-list-tile-action>
                        <v-list-tile-title>
                          {{ $t('button.delete') | capitalize }}
                        </v-list-tile-title>
                      </v-list-tile>
                    </v-list>
                  </v-menu>
                </v-layout>
              </td>
            </tr>
          </template>
          <template #no-data>
            <TableNoData :is-loading="$fetchState.pending"/>
          </template>
          <template #no-results>
            <div class="text-xs-center">
              {{ $t('message.error.noSearchResults', { term: search }) }}
            </div>
          </template>
          <template #page-text="{ pageStart, pageStop, itemsLength }">
            {{ $t('paging.count', { pageStart, pageStop, itemsLength }) }}
          </template>
        </v-data-table>
        <AppWait
          :hide-message="true"
          :wait="useFilters_initialLoadComplete && $fetchState.pending"
          height="100%"
        />
      </div>
    </v-card>
  </div>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import RecipientIcon from '@/components/Recipients/RecipientIcon';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import TableNoData from '@/components/App/TableNoData';
  import SearchBox from '@/components/Form/SearchBox';
  import recipientMixins from '@/mixins/recipient';
  import AppWait from '@/components/App/AppWait';
  import useFilters from '@/mixins/useFilters';
  import RecipientModel from '@/models/Recipient';
  import ThrottledButton from '@/components/App/ThrottledButton';
  import usePersistableFilters from '@/mixins/usePersistableFilters';

  export default {
    components: {
      ThrottledButton,
      RecipientIcon,
      TableNoData,
      SearchBox,
      AppWait,
    },
    mixins: [
      useFilters,
      recipientMixins,
      useBackendValidation,
      useBackendValidation,
      usePersistableFilters,
      useFilterablePagination,
    ],
    async fetch() {
      await this.filter();
    },
    data() {
      return {
        filters: RecipientModel.filters,
        persistableFilterKey: RecipientModel.persistableFilterKey,
        searchColumns: ['sendto'],
        headers: [
          {
            text: this.$options.filters.capitalize(this.$t('phrase.type')),
            value: 'media-type',
            width: '40px',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.send_to')),
            align: 'left',
            value: 'send-to',
          },
          {
            text: this.$options.filters.capitalize(
              this.$tc('phrase.description'),
            ),
            value: 'description',
            align: 'left',
          },
          {
            text: this.$options.filters.capitalize(
              this.$tc('phrase.notificationsAndReports'),
            ),
            align: 'left',
            value: null,
            sortable: false,
          },
          {
            text: this.$options.filters.capitalize(this.$t('recipients.failuresInTheLast24h')),
            align: 'left',
            value: 'permanent-failures-last-24h',
          },
          {
            text: null, align: 'right', sortable: false, width: '120px',
          },
        ],
      };
    },
    computed: {
      ...mapState('recipients', [
        'recipients',
        'totalCount',
        'selectedRecipient',
      ]),
      shouldShowActions() {
        return ! (this.$auth.user.isAdmin() && ! this.$auth.user.emailVerified);
      },
      hasUnverifiedRecipient() {
        return this.recipients.some((Recipient) => ! Recipient.isVerified());
      }
    },
    created() {
      this.$bus.$on('visibility-change:visible', () => {
        if (this.hasUnverifiedRecipient) this.$fetch();
      });
    },
    beforeDestroy() {
      this.$bus.$off('visibility-change:visible');
    },
    methods: {
      ...mapMutations('recipients', [
        'toggleRecipientDialog',
        'toggleDeleteDialog',
        'setSelectedRecipient',
      ]),
      ...mapActions('recipients', ['getRecipients', 'updateRecipient']),
      ...mapActions('recipients', {
        deleteRecipientAction: 'deleteRecipient',
        resendVerificationEmailAction: 'resendVerificationEmail',
      }),
      async filter() {
        await this.getRecipients({
          Recipient: RecipientModel.filter(this.filters),
        });
        this.useFilters_initialLoadCompleted();
      },
      async toggleActiveFlag(Recipient) {
        this.useBackendValidation_reset();
        try {
          await this.updateRecipient({ Recipient });
          this.$emit('on-update', { success: true, Recipient });
        } catch ({ response }) {
          Recipient.active = ! Recipient.active;
          this.useBackendValidation_renderAnyErrors(response);
          this.$emit('on-update', { success: false, Recipient });
        }
      },
      onMenuOpen(Recipient) {
        this.setSelectedRecipient(Recipient);
      },
      onMenuEditClick(Recipient) {
        this.setSelectedRecipient(Recipient);
        this.toggleRecipientDialog(true);
      },
      onMenuDeleteClick(Recipient) {
        this.setSelectedRecipient(Recipient);
        this.toggleDeleteDialog();
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
      generateNotificationList(recipient) {
        const notifications = [];

        if (recipient.alerts) {
          notifications.push(
            this.$options.filters.capitalize(
              this.$tc('recipients.notifications.alerts'),
            ),
          );
        }

        if (recipient.reminders) {
          notifications.push(
            this.$options.filters.capitalize(
              this.$tc('recipients.notifications.reminders'),
            ),
          );
        }

        if (recipient.warnings) {
          notifications.push(
            this.$options.filters.capitalize(
              this.$tc('recipients.notifications.warnings'),
            ),
          );
        }

        if (recipient.comments) {
          notifications.push(
            this.$options.filters.capitalize(
              this.$tc('form.field.comments'),
            ),
          );
        }

        if (recipient.recoveries) {
          notifications.push(
            this.$options.filters.capitalize(
              this.$tc('form.field.recoveries'),
            ),
          );
        }

        if (recipient.dailySummary) {
          notifications.push(
            this.$options.filters.capitalize(
              this.$tc('recipients.reports.summary'),
            ),
          );
        }

        if (recipient.dailyReports) {
          notifications.push(
            this.$options.filters.capitalize(this.$tc('recipients.reports.daily')),
          );
        }

        if (recipient.weeklyReports) {
          notifications.push(
            this.$options.filters.capitalize(
              this.$tc('recipients.reports.weekly'),
            ),
          );
        }

        if (recipient.monthlyReports) {
          notifications.push(
            this.$options.filters.capitalize(
              this.$tc('recipients.reports.monthly'),
            ),
          );
        }

        return notifications.join(', ');
      },
      hasFilters({ rules }) {
        return rules?.data?.length > 0;
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .inactive td
    opacity: 0.7;
    transition: opacity 0.2s ease-out;

  .inactive:hover td
    opacity: 1;
</style>
