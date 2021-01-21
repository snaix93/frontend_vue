import { merge } from 'lodash-es';
import moment from 'moment';

const CACHE_TTL_IN_MINUTES = 5;
const URL_SINGLE_KEY = 'URL_SINGLE_KEY';
const URL_BATCH = 'URL_BATCH';
const URL_BATCH_METRICS = 'URL_BATCH_METRICS';
const URL_MINI_GRAPH_DATA = 'URL_MINI_GRAPH_DATA';

const buildUrl = (endpoint = null, hostId, db = null, type = null, filters = null, params = null) => {
  let paramString = '';
  if (filters?.from && filters?.to) {
    paramString += `&filter[from]=${filters.from}&filter[to]=${filters.to}`;
  }
  if(params?.append) {
    paramString += `&append=${params.append}`;
  }

  switch (type) {
    case URL_SINGLE_KEY:
      return `/graph-data?filter[host]=${hostId}&filter[database]=${db}&filter[metric]=${endpoint}${paramString}&sort=-time`;
    case URL_BATCH_METRICS:
      const metrics = endpoint.split(',')
                              .map(metric => encodeURIComponent(metric))
                              .join(',');
      return `/graph-data?filter[host]=${hostId}&filter[database]=${db}&filter[metric]=${metrics}${paramString}&sort=-time`;
    case URL_BATCH:
      // NOTE: batch not working yet with more than one host - backend needs to be adapted
      // only relevant for dashboard which is excluding graphs in v3 for now,
      // therefore it shouldn't cause any errors in frontend
      return `/graph-data?filter[host]=${hostId}&filter[database]=${db}&filter[metric]=${encodeURIComponent(endpoint)}${paramString}&sort=-time`;
    case URL_MINI_GRAPH_DATA:
      return `/graph-data?filter[alias]=mini-graph-data&filter[host]=${hostId}${paramString}&sort=-time`;
    default:
      return `/hosts/${hostId}/graph-data?filter[alias]=${endpoint}${paramString}&sort=-time`;
  }
};

const buildDataKey = (endpoint, params = {}) => {
  return `${endpoint}${(Object.entries(params).toString())}`.replace(/,/g, '_');
};

const fireUnlockEvent = (vue, endpoint, hostId) => {
  vue.$emit(`unlocked_${endpoint}_${hostId}`);
};

export const state = () => ({
  data: {},
  requestStateByEndpoint: {},
  bandwidthChartAvailable: false,
});

export const getters = {
  requestIsInProgress: (state) => (endpoint) => {
    return !! state.requestStateByEndpoint?.[endpoint];
  },
  getHostDataByEndpoint: (state) => ({ hostId, endpoint, params }) => {
    return state.data?.[hostId]?.[buildDataKey(endpoint, params)];
  },
  existsInLocalState: (state, getters) => ({ hostId, endpoint, params }) => {
    return !! getters.getHostDataByEndpoint({ hostId, endpoint, params });
  },
};

export const mutations = {
  set(state, { data, hostId, endpoint, params = {}, ttl = CACHE_TTL_IN_MINUTES }) {
    if (
      data.length > 0
      || typeof data === 'object'
    ) {
      const wrappedData = {
        data,
        ttl: moment.utc().add(ttl, 'minutes').unix(),
      };
      state.data[hostId] = merge(state.data[hostId], {
        [buildDataKey(endpoint, params)]: wrappedData,
      });
    }
  },
  setRequestStateByEndpoint(state, { endpoint, inProgress }) {
    state.requestStateByEndpoint = {
      ...state.requestStateByEndpoint,
      [endpoint]: inProgress,
    };
  },
  setBandwidthChartAvailable(state, bool) {
    state.bandwidthChartAvailable = bool;
  },
  purge(state, { hostId, key }) {
    delete state.data[hostId][key];
    if (Object.keys(state.data[hostId]).length === 0) {
      delete state.data[hostId];
    }
  },
};

export const actions = {
  // Used in dashboard, needs to be adjusted when v3 dashboard is using graphs again
  async batchFetchMiniGraphData({ getters, commit }, { hostIds, db = null, memParams = {}, cpuParams = {} }) {
    const endpoints = [
      {
        endpoint: 'mem.available_percent',
        params: memParams
      },
      {
        endpoint: 'cpu.util.idle.1.total',
        params: cpuParams
      },
    ];


    endpoints.forEach(({ endpoint }) => {
      commit('setRequestStateByEndpoint', { endpoint, inProgress: true });
    });

    // Data could exist in store even with a new request as we are using
    // a VueX plugin to persist certain state in localstorage.
    // filter out hosts where we have a fresh set of data in state.
    // any hosts left will be batch fetched and cached.
    hostIds = hostIds.filter((hostId) => {
      let result = true;

      for (let { endpoint, params } of endpoints) {
        let dataPackage = { hostId, endpoint, params };
        if (! getters.existsInLocalState(dataPackage)) {
          continue;
        }

        // it exists... but is it fresh?
        const { ttl } = getters.getHostDataByEndpoint(dataPackage);
        commit('purge', { hostId, key: buildDataKey(endpoint, params) });
        continue;

        if (ttl < moment.utc().unix()) {
          // stale...
          commit('purge', { hostId, key: buildDataKey(endpoint, params) });
          continue;
        }
        fireUnlockEvent(this._vm, endpoint, hostId);
        result = false;
        break;
      }

      return result;
    });

    (() => {
      return new Promise((resolve, reject) => {
        // do we have hosts to fetch updated chart data for?
        if (hostIds.length > 0) {
          resolve();
        } else {
          reject();
        }
      });
    })().then(async () => {
      // batch fetch fresh chart data...
      return await this.$axios.$get(
        buildUrl(null, hostIds, db, URL_MINI_GRAPH_DATA), {},
      );
    }).then((data) => {
      Object.entries(data).forEach(([hostId, data]) => {
        endpoints.forEach(({ endpoint, params }) => {
          commit('set', { data: data[endpoint], hostId, endpoint, params });
          // fire 'unlocked' event to release single chart requests which will
          // getHosts this batched data from store and setup Charts...
          fireUnlockEvent(this._vm, endpoint, hostId);
        });
      });
    }).catch((e) => {
      // fire 'unlocked' event so single chart requests can continue after this failure.
      hostIds.forEach((hostId) => {
        endpoints.forEach(({ endpoint }) => {
          fireUnlockEvent(this._vm, endpoint, hostId);
        });
      });
    }).finally(() => {
      endpoints.forEach(({ endpoint }) => {
        commit('setRequestStateByEndpoint', { endpoint, inProgress: false });
      });
    });
  },

  async get({ commit, getters }, { singleKey, endpoint, hostId, params = {}, db = null, batch = false, group = null, }) {
    const key = group || endpoint;

    if (getters.requestIsInProgress(key)) {
      // stop & wait here until 'unlocked' event is fired...
      await new Promise(resolve => this._vm.$once(`unlocked_${key}_${hostId}`, resolve));
    }

    let dataPackage = { hostId, endpoint, params };

    if (getters.existsInLocalState(dataPackage)) {
      // it exists but is it fresh?
      let { ttl, data: storedData } = getters.getHostDataByEndpoint(dataPackage);

      if (ttl >= moment.utc().unix()) {
        // it's fresh
        return storedData;
      }

      // exists but stale...
      commit('purge', { hostId, key: buildDataKey(endpoint, params) });
    }

    if (group) {
      if (group === 'quick-view') {
        await this.dispatch('hostCharts/getQuickViewCharts', { hostId, params });
        let { data: storedData } = getters.getHostDataByEndpoint(dataPackage);

        return storedData;
      }
    } else {
      let data;
      let type = null;

      if (singleKey) {
        type = URL_SINGLE_KEY;
      }

      if (batch) {
        type = URL_BATCH_METRICS;
      }

      const response = await this.$axios.$get(
        buildUrl(endpoint, hostId, db, type, { from: params.from, to: params.to }, { append: params.append }),
      );

      if (batch) {
        data = Object.keys(response).map(key => response[key]).flat();
      } else {
        data = response.data;
      }

      commit('set', { data, hostId, endpoint, params });

      return data;
    }
  },
  async getQuickViewCharts({ commit }, { hostId, params }) {
    const group = 'quick-view';

    commit('setRequestStateByEndpoint', { endpoint: group, inProgress: true });

    try {
      const { data } = await this.$axios.$get(
        buildUrl('quick-view-graph-data', hostId, null, null, { from: params.from, to: params.to }), { ttl: 1 }
      );

      // Disk I/O Chart
      const diskIOData = [];

      if (!! data['fs.total_read_B_per_s'][0]) {
        diskIOData.push(data['fs.total_read_B_per_s'][0]);
      }

      if (!! data['fs.total_write_B_per_s'][0]) {
        diskIOData.push(data['fs.total_write_B_per_s'][0]);
      }

      commit('set', {
        data: diskIOData,
        hostId,
        endpoint: 'fs.total_read_B_per_s,fs.total_write_B_per_s',
        params,
        ttl: 1
      });

      // Memory Used Chart
      const memoryUsedData = [];

      if (!! data['mem.available_percent'][0]) {
        memoryUsedData.push(data['mem.available_percent'][0]);
      }

      commit('set', { data: memoryUsedData, hostId, endpoint: 'mem.available_percent', params });

      // CPU Utilization Chart
      const cpuUtilChart = [];

      if (!! data['cpu.util.user.1.total'][0]) {
        cpuUtilChart.push(data['cpu.util.user.1.total'][0]);
      }

      if (!! data['cpu.util.system.1.total'][0]) {
        cpuUtilChart.push(data['cpu.util.system.1.total'][0]);
      }

      commit('set',
        { data: cpuUtilChart, hostId, endpoint: 'cpu.util.user.1.total,cpu.util.system.1.total', params, ttl: 1 });


      // Bandwidth Chart
      const bandwidthData = [];

      if (!! data['net.total_in_B_per_s'][0]) {
        bandwidthData.push(data['net.total_in_B_per_s'][0]);
      }

      if (!! data['net.total_out_B_per_s'][0]) {
        bandwidthData.push(data['net.total_out_B_per_s'][0]);
      }

      commit('setBandwidthChartAvailable', !! bandwidthData.length);

      commit('set',
        { data: bandwidthData, hostId, endpoint: 'net.total_in_B_per_s,net.total_out_B_per_s', params, ttl: 1 });
    } catch (e) {
      console.error(e);
    } finally {
      fireUnlockEvent(this._vm, 'quick-view', hostId);
      commit('setRequestStateByEndpoint', { endpoint: group, inProgress: false });
    }
  },
};
