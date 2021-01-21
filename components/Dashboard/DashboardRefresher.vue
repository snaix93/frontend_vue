<template>
  <v-toolbar-items>
    <v-hover>
      <v-flex
        slot-scope="{ hover }"
        class="refresh-timer align-self-center text-truncate"
        grow px-3
        style="width: 138px;"
      >
        <v-layout
          v-if="hover"
          align-center
          justify-center
        >
          <v-flex shrink>
            <v-btn
              class="refresh-button"
              icon
              @click="refresh"
            >
              <v-icon>refresh</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
        <v-flex v-else class="text-xs-center">
          <span class="caption font-weight-bold text-uppercase refresh-timer__heading">
            {{ $t('dashboard.nextRefreshIn') }}
          </span>
          <br>
          <template v-if="!isActive">
            <span class="caption font-italic">SWITCHED OFF</span>
          </template>
          <template v-else-if="timeRemaining > 0">
            <v-icon dark small>
              timer
            </v-icon>
            <span
              :data-cy-val="timeRemaining"
              class="caption qa-refresher-time"
              data-cy="refresherTimeRemaining"
            >
              {{ $t('dashboard.secValue', { sec: timeRemaining }) }}
            </span>
          </template>
          <template v-else>
            <v-icon
              dark
              small
            >
              autorenew
            </v-icon>
            <span class="caption">{{ $t('dashboard.updateInProgress') }}</span>
          </template>
        </v-flex>
      </v-flex>
    </v-hover>
  </v-toolbar-items>
</template>

<script>
  import { DashboardRefresherSymbol } from '@/constants/symbols';
  import { useRefresher } from '@/use/useRefresher';

  const DashboardRefresher = useRefresher(DashboardRefresherSymbol);

  export default {
    computed: {
      timeRemaining() {
        return DashboardRefresher.remaining;
      },
      isActive() {
        return DashboardRefresher.running;
      }
    },
    methods: {
      refresh() {
        DashboardRefresher.reset();
        this.$bus.$emit('dashboard:refresh');
      }
    },
  };
</script>
