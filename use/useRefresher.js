import Visibility from 'visibilityjs';
import Vue from 'vue';

const refresherInstances = new Map();
const DEBUG = false;
const MIN_INTERVAL = 30;

const debuggerOutput = (primary, secondary) => {
  if (! DEBUG) return;
  console.log(`%c${primary.toString()}: %c${secondary.toString()}`,
    'color: #6c9ddf; font-weight: bold; font-size: 12px;',
    'color: #00c37c; font-style: italic; font-size: 12px;');
};

class Refresher {
  #visibilityChangeCollection = [];
  #visibleState = 'visible';
  #intervalCollection = [];
  #onRefreshCallback;
  #instanceName;
  #reactive;

  constructor(instanceName) {
    return this.initInstance(instanceName);
  }

  get tick() {
    return this.#reactive.tick;
  }

  get remaining() {
    return this.#reactive.refreshRate - this.#reactive.tick;
  }

  get inProgress() {
    return this.#reactive.requestInProgress;
  }

  get running() {
    return this.#reactive.running;
  }

  set refreshRate(rate) {
    this.#reactive.refreshRate = Math.max(rate, MIN_INTERVAL);
    this.reset();
  }

  set refreshWhenHidden(value) {
    this.#reactive.refreshWhenHidden = value;
  }

  initInstance(name) {
    if (! refresherInstances.has(name)) {
      this.#instanceName = name;
      refresherInstances.set(name, this);

      this.#reactive = Vue.observable({
        running: false,
        tick: 0,
        requestInProgress: false,
        refreshRate: MIN_INTERVAL,
        refreshWhenHidden: false,
      });

      debuggerOutput('🛠 NEW REFRESHER:', this.#instanceName);
    }

    return refresherInstances.get(name);
  }

  start() {
    debuggerOutput('🧀 START:', this.#instanceName);
    this.#reactive.running = true;
    this.#clearInternals();

    this.#intervalCollection.push(setInterval(() => {
      if (! Visibility.hidden() || this.#reactive.refreshWhenHidden) {
        this.#reactive.tick++;

        this.#reactive.tick % 2
        ? debuggerOutput('⏲ TICK', `${this.#reactive.tick} ${this.#instanceName.toString()}`)
        : debuggerOutput('⏲ TOCK', `${this.#reactive.tick} ${this.#instanceName.toString()}`);

        if (this.#reactive.tick === this.#reactive.refreshRate) {
          this.#refresh();
        }
      }
    }, 1000));

    this.#visibilityChangeCollection.push(Visibility.change(() => {
      if (! Visibility.hidden()) {
        this.#visibleState = 'visible';
        this.#refresh();
      } else {
        this.#visibleState = 'hidden';
      }
    }));
  }

  #refresh() {
    if (this.#reactive.requestInProgress) return;
    this.#reactive.requestInProgress = true;
    this.#executeRefresh()
        .catch(() => this.#clearInternals())
        .finally(() => this.reset());
  }

  stop() {
    if (! this.#reactive.running) return;
    debuggerOutput('🐭 STOP:', this.#instanceName);
    this.#clearInternals();
    this.reset();
    this.#reactive.running = false;
  }

  async #executeRefresh() {
    debuggerOutput('⏰🔄 REFRESH', this.#instanceName);
    await this.#onRefreshCallback ? this.#onRefreshCallback() : true;
  }

  onRefresh(callback) {
    this.#onRefreshCallback = callback;
    return this;
  }

  #clearInternals() {
    this.#intervalCollection.forEach(id => clearInterval(id));
    this.#visibilityChangeCollection.forEach(id => Visibility.unbind(id));
    this.#intervalCollection = [];
    this.#visibilityChangeCollection = [];
  }

  reset() {
    if (! this.#reactive.running) return;
    debuggerOutput('⏪ RESET', this.#instanceName);
    this.#reactive.requestInProgress = false;
    this.#reactive.tick = 0;
    return this;
  }
}

export function useRefresher(instanceName = 'default') {
  return new Refresher(instanceName);
}
