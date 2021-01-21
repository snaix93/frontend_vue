<template>
  <div @click="getHostSummaryList">
    <v-autocomplete
      :filter="filterHosts"
      :items="hostList"
      :label="$t('button.searchByHostNameOrConnect')"
      background-color="secondary"
      class="qa-global-search"
      flat
      hide-details
      item-text="name"
      return-object
      solo
      clearable
      :menu-props="{maxHeight:400, minWidth: '40vw', maxWidth: '80vw', right: true}"
      @change="goToLatestData"
    >
      <template #item="data">
        <v-layout justify-space-between>
          <v-flex
            xs9 md10
            class="text-truncate"
          >
            {{ data.item.name }}
            <div
              v-if="!!data.item.connect"
              class="caption grey--text text--darken-2 mt-1"
            >
              {{ data.item.connect }}
            </div>
          </v-flex>
          <v-flex shrink>
            <v-btn
              :title="$t('button.goToLatestData') | capitalize"
              class="my-0 qa-global-latest"
              color="secondary"
              icon
              outline
              small
              @click.stop="goToLatestData(data.item)"
            >
              <v-icon small>
                bar_chart
              </v-icon>
            </v-btn>
            <v-btn
              v-if="$auth.user.isNotReadOnly()"
              :title="$t('button.goToHostSettings') | capitalize"
              class="ma-0 qa-global-setting"
              color="secondary"
              icon
              outline
              small
              @click.stop="goToHost(data.item)"
            >
              <v-icon small>
                settings
              </v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </template>
      <template #no-data>
        <v-list-tile>
          <v-list-tile-content class="text-xs-center">
            <v-progress-circular
              v-if="$wait.is(waitKey)"
              indeterminate
              color="secondary"
              size="16"
              width="2"
            />
            <span v-else>
              {{ $t('message.error.noData') }}
            </span>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import hostMixins from '@/mixins/host';
  import userMixins from '@/mixins/user';
  import HostModel from '@/models/Host';

  export default {
    mixins: [
      hostMixins,
      userMixins,
    ],
    data() {
      return {
        hostList: [],
        waitKey: this.$WAIT_FOR.HOST.SUMMARY_LIST,
      };
    },
    computed: {
      ...mapState('hosts', ['hostSummaryList']),
    },
    watch: {
      hostSummaryList(list) {
        this.hostList = list;
      },
    },
    async created() {
      if (! this.hostSummaryList.length) {
        await this.getHostSummaryList();
      }
      this.hostList = this.hostSummaryList;
    },
    methods: {
      ...mapActions('hosts', {
        getHostSummaryAction: 'getHostSummaryList'
      }),
      goToLatestData(hostPartial) {
        this.host_goToLatestData(new HostModel(hostPartial));
      },
      goToHost(hostPartial) {
        this.host_goToHost(new HostModel(hostPartial));
      },
      async getHostSummaryList() {
        this.$wait.start(this.waitKey);
        try {
          await this.getHostSummaryAction();
        } finally {
          this.$wait.end(this.waitKey);
        }
      },
      filterHosts({ name, connect }, queryText) {
        const lowerCaseName = !! name ? name.toLowerCase() : '';
        const lowerCaseConnect = !! connect ? connect.toLowerCase() : '';
        const lowerCaseQueryText = !! queryText ? queryText.toLowerCase() : '';

        return lowerCaseName.indexOf(lowerCaseQueryText) !== -1
               || lowerCaseConnect.indexOf(lowerCaseQueryText) !== -1;
      },
    }
  };
</script>
