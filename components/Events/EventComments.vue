<template>
  <v-card
    class="grey lighten-2"
    flat
  >
    <v-card-title class="grey lighten-1">
      <h4 class="subheading">
        <v-chip
          class="grey--text text--darken-1 font-weight-bold"
          color="white"
          small
        >
          <v-progress-circular
            v-if="$fetchState.pending"
            :size="12"
            :width="2"
            color="primary"
            indeterminate
          />
          <template v-else>{{ commentCount }}</template>
        </v-chip>
        {{ $tc('phrase.comment', commentCount) | capitalize }}
      </h4>
    </v-card-title>
    <v-card-text class="px-4 pt-0 pb-4">
      <v-card v-if="$fetchState.pending" class="mt-4 pa-4">
        <SkeletonLoader
          :item-count="4"
          :item-height="15"
          display="card"
        />
      </v-card>
      <template v-else>
        <v-timeline dense>
          <v-data-iterator
            :hide-actions="commentCount <= rowsPerPage[0]"
            :items="comments"
            :pagination.sync="pagination"
            :rows-per-page-items="rowsPerPage"
            :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
            :total-items="commentCount"
            item-key="id"
            row wrap
          >
            <template #item="{ item: EventComment }">
              <v-timeline-item
                color="primary"
                fill-dot
                icon="speaker_notes"
                icon-color="white"
                small
              >
                <v-card>
                  <v-card-title class="pb-2">
                    <span class="black--text body-2">
                      {{ EventComment.nickname }}
                    </span>
                    <v-spacer/>
                    <span class="caption grey--text">
                      {{ timeAgo(EventComment.dates.createdAt.timestamp) }}
                    </span>
                  </v-card-title>
                  <v-card-text
                    class="grey--text text--darken-2 pt-0"
                  >
                    {{ EventComment.text }}
                  </v-card-text>
                  <v-card-text
                    v-if="commentHasActiveProps(EventComment)"
                    :class="{ 'text-xs-right' : $vuetify.breakpoint.lgAndUp }"
                    class="grey--text text--darken-2 pt-0"
                  >
                    <template v-for="(commentProp, i) in commentProps">
                      <span
                        v-show="!!EventComment.actions[commentProp]"
                        :class="{
                          'ml-2' : i !== 0,
                        }"
                        :key="`comment-${EventComment.id}-prop-${commentProp}`"
                        class="grey--text caption"
                      >
                        <v-icon
                          color="grey"
                          small
                        >
                          {{ !! EventComment.actions[commentProp] ? 'check' : 'clear' }}
                        </v-icon>
                        {{ $t(`events.comments.props.${commentProp}`) }}
                      </span>
                    </template>
                  </v-card-text>
                </v-card>
              </v-timeline-item>
            </template>
            <template #no-data>
              <v-timeline-item
                v-if="$wait.is($WAIT_FOR.EVENT.COMMENT)"
                color="primary"
                fill-dot
                icon="cached"
                icon-color="white"
                small
              >
                <v-card>
                  <v-card-text>
                    <v-progress-circular
                      :size="20"
                      :width="2"
                      class="d-block mx-auto"
                      color="primary"
                      indeterminate
                    />
                  </v-card-text>
                </v-card>
              </v-timeline-item>
              <v-timeline-item
                v-else
                color="warning"
                fill-dot
                icon="speaker_notes_off"
                icon-color="white"
                small
              >
                <v-card>
                  <v-card-text class="grey--text text--darken-2">
                    {{ $t('events.comments.noComments') | capitalize }}
                  </v-card-text>
                </v-card>
              </v-timeline-item>
            </template>
          </v-data-iterator>
        </v-timeline>
        <v-flex
          v-if="$auth.user.isNotReadOnly()"
        >
          <VeeFormGroup
            v-if="userHasNickname"
            :error-bag="validationErrors"
            :label="$t('form.field.addComment') | capitalize"
            :rules="validationRules.text"
            validation-key="text"
          >
            <template #default="prop">
              <v-card>
                <v-card-text class="pb-0">
                  <v-textarea
                    v-model="EventComment.text"
                    v-validate="prop.rules"
                    :data-vv-as="$tc('phrase.comment', 1)"
                    :data-vv-name="prop.validationKey"
                    :error-messages="prop.firstErrorMessage"
                    :hide-details="!prop.hasError"
                    :label="prop.label"
                    auto-grow
                    flat
                    solo
                  />
                </v-card-text>
                <v-card-actions
                  :class="{
                    'row align-end justify-around' : $vuetify.breakpoint.lgAndUp,
                    'column reverse align-start' : $vuetify.breakpoint.mdAndDown,
                  }"
                  class="pa-3 pt-0 layout "
                >
                  <v-flex
                    :style="$vuetify.breakpoint.mdAndDown ? 'width:100%' : ''"
                    lg3
                    md12
                  >
                    <v-btn
                      :block="$vuetify.breakpoint.mdAndDown"
                      class="qa-btn-add-comment"
                      color="primary"
                      small
                      @click="addComment"
                    >
                      <v-icon
                        class="mr-1"
                        small
                      >
                        send
                      </v-icon>
                      {{ $t('events.comments.addComment') }}
                    </v-btn>
                  </v-flex>
                  <v-flex
                    :class="{
                      'mb-2' : $vuetify.breakpoint.mdAndDown,
                      'text-xs-right' : $vuetify.breakpoint.lgAndUp
                    }"
                    lg9
                    md12
                  >
                    <v-btn
                      v-for="commentProp in commentProps"
                      :class="`qa-btn-${commentProp}`"
                      :color="!!EventComment[commentProp] ? 'primary lighten-1' : 'grey'"
                      :key="`prop-${commentProp}`"
                      flat
                      small
                      @click="toggleCommentProp(commentProp)"
                    >
                      <v-icon
                        class="mr-1"
                        small
                      >
                        {{ !! EventComment[commentProp] ? 'check' : 'clear' }}
                      </v-icon>
                      {{ $t(`events.comments.props.${commentProp}`) }}
                    </v-btn>
                  </v-flex>
                </v-card-actions>
              </v-card>
            </template>
          </VeeFormGroup>
          <v-alert
            v-else
            :value="true"
            type="info"
          >
            <span v-html="$options.filters.capitalize($t('events.comments.pleaseSetANicknameFirst'))"/>:
            <nuxt-link
              class="white--text"
              to="/settings"
            >
              {{ $t('button.settings') | capitalize }}
            </nuxt-link>
          </v-alert>
        </v-flex>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import SkeletonLoader from '@/components/App/SkeletonLoader';
  import EventCommentModel from '@/models/EventComment';
  import useDateTime from '@/mixins/useDateTime';
  import useFilters from '@/mixins/useFilters';
  import eventMixins from '@/mixins/event';
  import Event from '@/models/Event';

  export default {
    components: { SkeletonLoader },
    mixins: [
      useFilterablePagination,
      useDateTime,
      eventMixins,
      useFilters
    ],
    props: {
      Event: {
        type: Event,
        required: true,
      },
    },
    data() {
      return {
        filters: EventCommentModel.filters,
        totalCount: 0,
        rowsPerPage: [5, 10, 25, 50],
        comments: [],
        commentProps: [
          'visibleToGuests',
          'forward',
        ],
        EventComment: this.Event.eventComments(EventCommentModel.attributes),
        validationRules: {
          text: 'required|max:1000',
        },
      };
    },
    async fetch() {
      await this.filter();
    },
    computed: {
      commentCount() {
        return this.totalCount;
      },
      userHasNickname() {
        return !! this.$auth.user.nickname && this.$auth.user.nickname.length > 0;
      },
    },
    methods: {
      async filter() {
        const { data, meta } = await this.Event.eventComments()
                                         .page(this.filters.page)
                                         .limit(this.filters.limit)
                                         .get();

        this.comments = data;
        this.totalCount = meta.pagination.total;
      },
      async addComment() {
        if (! await this.$validator.validateAll()) return;

        this.$wait.start(this.$WAIT_FOR.EVENT.COMMENT);

        try {
          const EventComment = await this.EventComment.save();
          this.comments.unshift(EventComment);
          this.EventComment = this.Event.eventComments(EventCommentModel.attributes);
          this.$flash.success(this.$t('message.success.comment'));
        } catch (e) {
          this.$flash.error(this.$t('message.error.comment'));
        } finally {
          this.$wait.end(this.$WAIT_FOR.EVENT.COMMENT);
          await this.$validator.reset();
        }
      },
      toggleCommentProp(prop) {
        this.EventComment[prop] = ! this.EventComment[prop];
      },
      commentHasActiveProps(EventComment) {
        return this.commentProps.some(prop => !! EventComment?.actions?.[prop]);
      },
    },
  };
</script>
