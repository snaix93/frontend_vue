<template>
  <div class="recipient-filters position-relative">
    <AppWait
      :wait="$fetchState.pending"
      hide-message
      small
      height="100%"
      opacity="0"
    />
    <template v-if="!$fetchState.pending">
      <v-layout
        v-if="!internalValue.data || !internalValue.data.length"
        align-center
        class="grey--text"
        justify-center
        row
      >
        <v-chip
          class="grey--text text--darken-3 ma-0"
          color="grey lighten-2"
          small
        >
          {{ $tc('recipients.sendEventForAllHosts') | capitalize }}
        </v-chip>
        <span class="caption font-weight-medium mx-3">
          {{ $t('phrase.or') }}
        </span>

        <v-btn
          class="ma-0"
          color="primary"
          outline
          @click="addFilter"
        >
          <v-icon left>
            filter_list
          </v-icon>
          {{ $t('button.addFilter') }}
        </v-btn>
      </v-layout>
      <template v-else>
        <v-layout
          align-center
          class="mb-3"
          row
          wrap
        >
          <template v-if="internalValue.data.length > 1">
            <v-flex
              lg3
              xs12
            >
              <span class="caption font-weight-medium grey--text text--darken-2">
                {{ $tc('recipients.combineFiltersBy') | capitalize }}
              </span>
            </v-flex>
            <v-flex
              lg4
              md11
              xs12
            >
              <v-select
                v-model="internalValue.operator"
                :items="operators"
                class="ma-0 pa-0"
                hide-details
                single-line
                small
              />
            </v-flex>
          </template>
          <v-flex
            v-else
            lg7
            xs12
          />
          <v-flex
            v-if="hasWildcardFilters"
            class="text-lg-right"
            lg4
            xs12
          >
            <span class="caption grey--text text--darken-2">
              {{ $tc('recipients.useWildcard') | capitalize }}
            </span>
          </v-flex>
        </v-layout>

        <v-data-iterator
          :items="internalValue.data"
          column
          hide-actions
        >
          <template #item="props">
            <v-card
              class="mb-2"
              color="grey lighten-4"
              flat
            >
              <v-card-text>
                <v-layout
                  align-top
                  row
                  wrap
                >
                  <v-flex
                    class="pt-0 pb-3"
                    md5
                    xs12
                  >
                    <VeeFormGroup
                      :error-bag="errors"
                      :validation-key="`filter_field_${props.index}`"
                    >
                      <template #default="validationProp">
                        <v-select
                          v-model="props.item.field"
                          :error-messages="validationProp.firstErrorMessage"
                          :hide-details="!validationProp.hasError"
                          :items="fieldOptions"
                          box
                          single-line
                          @change="updateValueType(props.item)"
                        >
                          <template #selection="data">
                            {{ data.item.text | capitalize }}
                          </template>
                          <template #item="data">
                            {{ data.item.text | capitalize }}
                          </template>
                        </v-select>
                      </template>
                    </VeeFormGroup>
                  </v-flex>
                  <v-flex
                    class="pt-0 pb-3"
                    md6
                    xs12
                  >
                    <VeeFormGroup
                      :error-bag="errors"
                      :validation-key="`filter_value_${props.index}`"
                    >
                      <template #default="validationProp">
                        <v-autocomplete
                          v-if="['hostUuid'].indexOf(props.item.field) !== -1"
                          v-model="props.item.value"
                          :append-icon="showDropdown(props.item)"
                          :error-messages="validationProp.firstErrorMessage || errors.first(`filter_${props.index}`)"
                          :hide-details="!validationProp.hasError && !errors.has(`filter_${props.index}`)"
                          :items="hosts"
                          :placeholder="$tc('recipients.hostName', 1) | capitalize"
                          box
                          hide-no-data
                          item-text="name"
                          item-value="id"
                          single-line
                        />
                        <template v-else-if="['customerUuid'].indexOf(props.item.field) !== -1">
                          <v-autocomplete
                            v-if="subUnitManagementEnabled"
                            v-model="props.item.value"
                            :append-icon="showDropdown(props.item)"
                            :error-messages="validationProp.firstErrorMessage || errors.first(`filter_${props.index}`)"
                            :hide-details="!validationProp.hasError && !errors.has(`filter_${props.index}`)"
                            :items="subUnits"
                            :placeholder="$tc('recipients.subUnit', 1) | capitalize"
                            box
                            hide-no-data
                            item-text="name"
                            item-value="id"
                            single-line
                          />
                          <v-text-field
                            v-else
                            v-model="props.item.value"
                            :error-messages="validationProp.firstErrorMessage"
                            :hide-details="!validationProp.hasError && !errors.has(`filter_${props.index}`)"
                            :placeholder="$t('recipients.eventMessage')"
                            box
                            disabled
                            single-line
                          />
                        </template>
                        <v-combobox
                          v-else-if="['host','connect','tags'].indexOf(props.item.field) !== -1"
                          v-model="props.item.value"
                          :append-icon="showDropdown(props.item)"
                          :deletable-chips="props.item.field === 'tags'"
                          :error-messages="validationProp.firstErrorMessage || errors.first(`filter_${props.index}`)"
                          :hide-details="!validationProp.hasError && !errors.has(`filter_${props.index}`)"
                          :items="valueItems(props.item)"
                          :multiple="props.item.field === 'tags'"
                          :placeholder="valuePlaceholder(props.item) | capitalize"
                          :small-chips="props.item.field === 'tags'"
                          box
                          hide-no-data
                          single-line
                        />
                        <v-text-field
                          v-else
                          v-model="props.item.value"
                          :error-messages="validationProp.firstErrorMessage"
                          :hide-details="!validationProp.hasError && !errors.has(`filter_${props.index}`)"
                          :placeholder="$t('recipients.eventMessage')"
                          box
                          single-line
                        />
                      </template>
                    </VeeFormGroup>
                  </v-flex>
                  <v-flex
                    :class="{
                      'reorder' : $vuetify.breakpoint.smAndDown
                    }"
                    xs1
                  >
                    <v-btn
                      class="mx-0 d-inline-block"
                      icon
                      @click.stop="deleteFilter(props.item)"
                    >
                      <v-icon color="error">
                        delete
                      </v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-card-text>
            </v-card>
          </template>
        </v-data-iterator>

        <v-card flat>
          <v-card-text>
            <v-layout
              align-center
              row
              wrap
            >
              <v-flex
                md11
                xs12
              >
                <v-btn
                  block
                  class="ma-0"
                  color="primary"
                  large
                  outline
                  @click="addFilter"
                >
                  <v-icon left>
                    filter_list
                  </v-icon>
                  {{ $t('button.addFilter') }}
                </v-btn>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </template>
    </template>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import Host from '@/models/Host';
  import AppWait from "@/components/App/AppWait";

  export default {
    components: {AppWait},
    props: {
      value: {
        required: true,
      },
      errors: {
        type: Object,
        required: true,
      },
    },
    async fetch() {
      this.tags = await Host.fetchActiveTags();
      this.hosts = await Host.fetchHostSummaryList();
      if (this.subUnitManagementEnabled) {
        await this.getSubUnits();
      }
    },
    data() {
      return {
        hosts: [],
        internalValue: (this.value && this.value.data) ? this.value : {
          operator: 'or',
          data: [],
        },
        operators: [
          {
            value: 'or',
            text: this.$t('phrase.or'),
          },
          {
            value: 'and',
            text: this.$t('phrase.and'),
          },
        ],
      };
    },
    computed: {
      ...mapState('subUnits', ['subUnits']),
      subUnitManagementEnabled() {
        return this.$teamSettings.get('subUnitManagementEnabled');
      },
      hostNames() {
        return this.hosts.map(host => host.name);
      },
      hostConnects() {
        return this.hosts.map(host => host.connect)
                   .filter(hostConnect => !! hostConnect);
      },
      hostTags() {
        return this.tags;
      },
      hasFilterWithCustomer() {
        const customerFilter = this.internalValue.data.find(({ field }) => field === 'customerUuid');

        return !! customerFilter;
      },
      fieldOptions() {
        let options = [
          {
            value: 'host',
            text: this.$t('recipients.fieldOptions.hostNameMatches'),
          },
          {
            value: 'connect',
            text: this.$t('recipients.fieldOptions.hostConnectMatches'),
          },
          {
            value: 'tags',
            text: this.$t('recipients.fieldOptions.hostTagsMatch'),
          },
          {
            value: 'message',
            text: this.$t('recipients.fieldOptions.eventMessageMatches'),
          },
        ];

        if (
          this.subUnitManagementEnabled
          || !! this.hasFilterWithCustomer
        )
          options.splice(1, 0, {
            value: 'customerUuid',
            text: this.$t('recipients.fieldOptions.subUnitIs'),
          });

        if (
          !! this.hosts?.length
          || !! this.internalValue.data.find(({ field }) => field === 'hostUuid')
        )
          options.splice(1, 0, {
            value: 'hostUuid',
            text: this.$t('recipients.fieldOptions.hostNameIs'),
          });

        return options;
      },
      hasWildcardFilters() {
        return this.internalValue.data.filter(({ field }) => {
          return field !== 'hostUuid';
        }).length > 0;
      }
    },
    watch: {
      internalValue: {
        handler() {
          this.$emit('input', this.internalValue);
        },
        deep: true,
      },
    },
    methods: {
      ...mapActions('hosts', ['getHosts']),
      ...mapActions('subUnits', ['getSubUnits']),
      addFilter() {
        this.internalValue.data.push({
          field: 'host',
          value: '',
        });
      },
      deleteFilter(filter) {
        const i = this.internalValue.data.indexOf(filter);
        this.internalValue.data.splice(i, 1);
      },
      valuePlaceholder(filter) {
        let result;

        switch (filter.field) {
          case 'host':
            result = this.$t('recipients.hostName');
            break;
          case 'connect':
            result = this.$t('recipients.hostConnect');
            break;
          case 'tags':
            result = this.$t('recipients.hostTags');
            break;
        }

        return result;
      },
      valueItems(filter) {
        let result;

        switch (filter.field) {
          case 'host':
            result = this.hostNames;
            break;
          case 'connect':
            result = this.hostConnects;
            break;
          case 'tags':
            result = this.hostTags;
            break;
        }

        return result;
      },
      updateValueType(filter) {
        if (filter.field === 'tags') {
          filter.value = [];
        } else {
          filter.value = '';
        }
      },
      showDropdown({ field }) {
        if (
          field === 'host'
          && ! this.hostNames.length
        ) return null;

        if (
          field === 'connect'
          && ! this.hostConnects.length
        ) return null;

        if (
          field === 'tags'
          && ! this.hostTags.length
        ) return null;

        return this.$vuetify.icons.dropdown;
      },
    },
  };
</script>
<style lang="stylus" scoped>
  .recipient-filters
    min-height: 40px
  .reorder
    order: 1;
</style>
