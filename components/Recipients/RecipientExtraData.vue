<template>
  <div>
    <v-layout>
      <v-flex>
        <v-fade-transition mode="out-in">
          <h5
            v-if="expand"
            class="subheading mb-1"
          >
            {{ $tc('recipients.extraData.title') | capitalize }}
          </h5>
          <v-btn
            v-else
            small
            flat
            color="primary"
            class="ma-0"
            @click.prevent="togglePanel"
          >
            <v-icon
              small
              left
            >
              add_circle
            </v-icon>
            {{ $tc('recipients.extraData.add') }}
          </v-btn>
        </v-fade-transition>
      </v-flex>
    </v-layout>

    <v-expand-transition>
      <v-card
        v-show="expand"
        flat
        class="grey lighten-5"
      >
        <v-card-text>
          <v-data-iterator
            :items="internalValue"
            no-data-text=""
            hide-actions
          >
            <template #item="props">
              <v-layout row wrap>
                <v-flex>
                  <VeeFormGroup
                    :validation-key="`extradata_key_${props.index}`"
                    :error-bag="errors"
                    :label="$t('phrase.key') | capitalize"
                  >
                    <template #default="validationProp">
                      <v-text-field
                        v-model="props.item.key"
                        box
                        :label="validationProp.label"
                        :error-messages="validationProp.firstErrorMessage"
                        class="monospace-text-field"
                      />
                    </template>
                  </VeeFormGroup>
                </v-flex>
                <v-flex>
                  <VeeFormGroup
                    :validation-key="`extradata_value_${props.index}`"
                    :error-bag="errors"
                    :label="$t('phrase.value') | capitalize"
                  >
                    <template #default="validationProp">
                      <v-text-field
                        v-model="props.item.value"
                        box
                        :label="validationProp.label"
                        :error-messages="validationProp.firstErrorMessage"
                        class="monospace-text-field"
                      >
                        <template #append-outer>
                          <div style="width: 76px;">
                            <v-btn
                              flat
                              icon
                              class="ma-0"
                              :title="$t('recipients.extraData.deleteItem')"
                              @click="deleteItem(props.index)"
                            >
                              <v-icon color="error">
                                delete
                              </v-icon>
                            </v-btn>
                            <v-fade-transition>
                              <v-btn
                                v-if="props.index === internalValue.length - 1"
                                flat
                                icon
                                color="primary"
                                class="ma-0"
                                :title="$t('recipients.extraData.addItem')"
                                @click="addItem"
                              >
                                <v-icon>
                                  add_circle
                                </v-icon>
                              </v-btn>
                            </v-fade-transition>
                          </div>
                        </template>
                      </v-text-field>
                    </template>
                  </VeeFormGroup>
                </v-flex>
              </v-layout>
            </template>
          </v-data-iterator>
        </v-card-text>
      </v-card>
    </v-expand-transition>
  </div>
</template>

<script>

export default {
  props: {
    value: {
      required: true,
    },
    errors: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      internalValue: this.value ? this.value : [],
      expand: false,
    };
  },
  watch: {
    internalValue: {
      handler() {
        this.$emit('input', this.internalValue);
      },
      deep: true,
    },
  },
  created() {
    if(this.internalValue.length > 0) {
      this.expand = true;
    }
  },
  methods: {
    addItem() {
      this.internalValue.push({
        key: '',
        value: '',
      });
    },
    deleteItem(key) {
      this.internalValue.splice(key, 1);
      if(this.internalValue.length === 0) {
        this.expand = false;
      }
    },
    togglePanel() {
      this.expand = !this.expand;
      if(this.expand) {
        this.addItem();
      } else {
        this.resetItems();
      }
    },
    resetItems() {
      this.internalValue = [];
    },
  }
}
</script>
