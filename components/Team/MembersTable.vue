<template>
  <div class="teamMembersList">
    <BackendValidationAlert/>
    <v-card>
      <v-card-text class="pt-1">
        <v-layout
          align-end justify-end pb-3
          wrap
        >
          <SearchBox
            v-model="filters.search"
            :search-by="['member email']"
          />
        </v-layout>
      </v-card-text>
      <v-divider/>
      <div class="position-relative">
        <v-data-table
          :headers="headers"
          :items="teamMembers"
          :pagination.sync="pagination"
          :rows-per-page-items="rowsPerPage"
          :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
          :total-items="totalCount"
          data-cy="teamMembersList"
          disable-initial-sort
          item-key="id"
        >
          <template #items="{ item: TeamMember}">
            <td>
              <v-tooltip top>
                <div slot="activator">
                  <Avatar :status="TeamMember.teamStatus"/>
                </div>
                {{ $tc('team.status.' + TeamMember.teamStatus.toLowerCase()) | capitalize }}
              </v-tooltip>
            </td>
            <td>
              {{ TeamMember.email }}
            </td>
            <td>
              <RoleSelect
                v-if="!TeamMember.isCloudRadarSupport"
                v-model="TeamMember.role"
                :disabled="readOnly || isAuthUser(TeamMember)"
                dense
                validation-key="role"
                @input="syncRole(TeamMember)"
              />
              <span v-else>
                {{ $t('team.roles.support') | capitalize }}
              </span>
            </td>
            <td>
              <TagLimitSelect
                v-if="!$fetchState.pending && !TeamMember.isCloudRadarSupport && isGuestUser(TeamMember)"
                v-model="TeamMember.hostTag"
                :disabled="readOnly || isAuthUser(TeamMember)"
                :tags="loadedTags"
                dense
                @input="syncTag(TeamMember)"
              />
            </td>
            <td v-if="$teamSettings.get('subUnitManagementEnabled')">
              <SubUnitSelect
                v-if="!TeamMember.isCloudRadarSupport && isGuestUser(TeamMember)"
                v-model="TeamMember.subUnit"
                :disabled="readOnly || isAuthUser(TeamMember)"
                :sub-units="subUnits"
                dense
                @input="syncSubUnit(TeamMember)"
              />
            </td>
            <td
              v-if="!readOnly"
              class="text-no-wrap text-xs-right"
            >
              <v-layout v-if="!isAuthUser(TeamMember)" align-center justify-end>
                <ThrottledButton
                  v-if="TeamMember.teamStatus.toLowerCase() === 'invited' && !readOnly"
                  :loading="$wait.is($WAIT_FOR.TEAM_MEMBER.UPDATE_ID(TeamMember.id))"
                  :outline="true"
                  :small="true"
                  :urls="`team-members/${TeamMember.id}/resend-invitation`"
                  class="qa-resend-invitation"
                  color="secondary"
                  data-cy="resendInvitationButton"
                  @click="resendInvitation(TeamMember)"
                >
                  {{ $t('team.resendInvitation') }}
                </ThrottledButton>
                <v-menu
                  bottom
                  left
                >
                  <v-btn
                    slot="activator"
                    class="mx-0 my-0"
                    data-cy="memberActionsButton"
                    icon
                    transition="scale-transition"
                  >
                    <v-icon>more_vert</v-icon>
                  </v-btn>
                  <v-list dense>
                    <v-list-tile
                      class="qa-delete"
                      data-cy="deleteMemberButton"
                      @click="deleteWithConfirmation(TeamMember)"
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
          </template>
          <template #no-data>
            <TableNoData :is-loading="$fetchState.pending"/>
          </template>
          <template #no-results>
            <div class="text-xs-center">
              {{ $t('message.error.noSearchResults', { term: search }) }}
            </div>
          </template>
          <template #page-text="props">
            {{
              $t('paging.count', {
                pageStart: props.pageStart,
                pageStop: props.pageStop,
                itemsLength: props.itemsLength,
              })
            }}
          </template>
        </v-data-table>
        <AppWait
          :hide-message="true"
          :wait="useFilters_initialLoadComplete && $fetchState.pending"
          height="100%"
        />
      </div>
    </v-card>

    <TeamMemberDeleteConfirmDialog
      v-if="deleteDialog"
      @on-delete="onDelete"
    />
  </div>
</template>

<script>
  import { mapActions, mapState, mapMutations } from 'vuex';
  import TeamMemberDeleteConfirmDialog from '@/components/Team/TeamMemberDeleteConfirmDialog';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import usePersistableFilters from '@/mixins/usePersistableFilters';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import AppConfirmDialog from '@/components/App/AppConfirmDialog';
  import SubUnitSelect from '@/components/SubUnits/SubUnitSelect';
  import ThrottledButton from '@/components/App/ThrottledButton';
  import TagLimitSelect from '@/components/Team/TagLimitSelect';
  import TableNoData from '@/components/App/TableNoData';
  import RoleSelect from '@/components/Team/RoleSelect';
  import SearchBox from '@/components/Form/SearchBox';
  import AppWait from '@/components/App/AppWait';
  import Avatar from '@/components/Team/Avatar';
  import TeamMember from '@/models/TeamMember';
  import useFilters from '@/mixins/useFilters';
  import userMixins from '@/mixins/user';
  import Host from '@/models/Host';
  import User from '@/models/User';

  export default {
    components: {
      TeamMemberDeleteConfirmDialog,
      AppConfirmDialog,
      ThrottledButton,
      TagLimitSelect,
      SubUnitSelect,
      TableNoData,
      RoleSelect,
      SearchBox,
      AppWait,
      Avatar,
    },
    mixins: [
      userMixins,
      useFilters,
      useBackendValidation,
      usePersistableFilters,
      useFilterablePagination
    ],
    async fetch() {
      await this.filter();
    },
    data() {
      return {
        filters: TeamMember.filters,
        persistableFilterKey: TeamMember.persistableFilterKey,
        loadedTags: [],
        search: '',
        searchColumns: ['email'],
        readOnly: ! this.$auth.user.isAdmin()
      };
    },
    computed: {
      ...mapState('teamMembers', [
        'totalCount',
        'teamMembers',
        'deleteDialog',
        'selectedTeamMember',
      ]),
      ...mapState('subUnits', [
        'subUnits'
      ]),
      headers() {
        const headers = [
          {
            text: null,
            value: null,
            sortable: false,
            width: '50px',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.email')),
            align: 'left',
            value: 'email',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.role', 1)),
            align: 'left',
            value: 'roles',
            sortable: false,
            width: '360px',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.acl')),
            align: 'left',
            value: 'acl',
            sortable: false,
            width: '360px',
          },
        ];

        if (this.$teamSettings.get('subUnitManagementEnabled'))
          headers.push({
            text: this.$options.filters.capitalize(this.$t('phrase.subUnit')),
            align: 'left',
            value: 'id',
            sortable: false,
            width: '360px',
          });

        // Add header for action column if not in read only mode
        if (! this.readOnly) {
          headers.push({
            text: null,
            align: 'right',
            value: null,
            sortable: false,
            width: '1%',
          });
        }

        return headers;
      },
    },
    async created() {
      this.loadedTags = await Host.fetchActiveTags();
      if (this.$teamSettings.get('subUnitManagementEnabled')) {
        await this.getSubUnits();
      }
    },
    methods: {
      ...mapMutations('teamMembers', [
        'toggleDeleteDialog',
        'setSelectedTeamMember'
      ]),
      ...mapActions('subUnits', [
        'getSubUnits'
      ]),
      ...mapActions('teamMembers', {
        getTeamMembersAction: 'getTeamMembers',
        deleteTeamMemberAction: 'deleteTeamMember',
        updateTeamMemberRoleAction: 'updateTeamMemberRole',
        updateTeamMemberSubUnitAction: 'updateTeamMemberSubUnit',
        updateTeamMemberLimitTagAction: 'updateTeamMemberLimitTag',
        resendTeamMemberInvitationAction: 'resendTeamMemberInvitation'
      }),
      ...mapActions('team', {
        hideSupportButtonAction: 'hideSupportButton',
      }),
      async filter() {
        await this.getTeamMembersAction({
          TeamMember: TeamMember.filter(this.filters)
        });
        this.useFilters_initialLoadCompleted();
      },
      isGuestUser(TeamMember) {
        return TeamMember.role === User.userRoles.READ_ONLY;
      },
      isAuthUser(TeamMember) {
        return TeamMember.id === this.$auth.user.id;
      },
      syncRole(TeamMember) {
        if (this.readOnly || this.isAuthUser(TeamMember)) return false;

        this.useBackendValidation_reset();
        return this.updateTeamMemberRoleAction({ TeamMember })
                   .then(() => {
                     this.$emit('on-update', { success: true, TeamMember });
                     return true;
                   })
                   .catch(({ response }) => {
                     this.useBackendValidation_renderAnyErrors(response);
                     this.$emit('on-update', { success: false, TeamMember });
                     return false;
                   });
      },
      syncTag(TeamMember) {
        // Abort when in read only mode
        if (this.readOnly || this.isAuthUser(TeamMember)) return false;
        if (TeamMember.hostTag === undefined) TeamMember.hostTag = null;

        this.useBackendValidation_reset();
        return this.updateTeamMemberLimitTagAction({ TeamMember })
                   .then(() => {
                     this.$emit('on-update', { success: true, TeamMember });
                     return true;
                   })
                   .catch(({ response }) => {
                     this.useBackendValidation_renderAnyErrors(response);
                     this.$emit('on-update', { success: false, TeamMember });
                     return false;
                   });
      },
      syncSubUnit(TeamMember) {
        // Abort when in read only mode
        if (this.readOnly || this.isAuthUser(TeamMember)) return false;
        this.useBackendValidation_reset();
        return this.updateTeamMemberSubUnitAction({ TeamMember })
                   .then(() => {
                     this.$emit('on-update', { success: true, TeamMember });
                     return true;
                   })
                   .catch(({ response }) => {
                     this.useBackendValidation_renderAnyErrors(response);
                     this.$emit('on-update', { success: false, TeamMember });
                     return false;
                   });
      },
      deleteWithConfirmation(TeamMember) {
        if (this.readOnly || this.isAuthUser(TeamMember)) return false;

        this.setSelectedTeamMember(TeamMember);
        this.toggleDeleteDialog(true);
      },
      onDelete({ TeamMember, success = true }) {
        this.toggleDeleteDialog();
        if (TeamMember.isCloudRadarSupport) {
          this.hideSupportButtonAction(false);
        }
        this.reload();
        this.$emit('on-delete', { TeamMember, success });
      },
      reload() {
        this.filter();
      },
      resendInvitation(TeamMember) {
        // Abort when in read only mode
        if (this.readOnly || this.isAuthUser(TeamMember)) return false;
        this.useBackendValidation_reset();
        return this.resendTeamMemberInvitationAction({ TeamMember })
                   .then(() => {
                     this.$emit('on-resend', { success: true, TeamMember });
                     return true;
                   })
                   .catch(({ response }) => {
                     if (response.status === 429) {
                       this.$flash.error(this.$t('message.general.tooManyAttempts'));
                     } else {
                       this.useBackendValidation_renderAnyErrors(response);
                       this.$emit('on-resend', { success: false, TeamMember });
                     }
                   });
      },
    },
  };
</script>
