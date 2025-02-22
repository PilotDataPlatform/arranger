import { keycloak } from './config';
import moment from 'moment';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import workerTimer from './worker-timer';

class TokenTimer {
  listeners;
  constructor() {
    this.listeners = [];
    this.lastTimeRemain = null;
    const self = this;
    workerTimer.setInterval(() => {
      self._traverseListeners();
    }, 1000);
  }

  getRefreshRemainTime() {
    const remainTime =
      keycloak.refreshTokenParsed?.exp - (moment(Date.now()).unix() - keycloak.timeSkew);
    return isNaN(remainTime) ? -1 : remainTime;
  }

  getAccessRemainTime() {
    const remainTime = keycloak.tokenParsed?.exp - (moment(Date.now()).unix() - keycloak.timeSkew);
    return isNaN(remainTime) ? -1 : remainTime;
  }
  resetLastTimeRemain() {
    this.lastTimeRemain =
      keycloak.refreshTokenParsed?.exp - (keycloak.refreshTokenParsed?.iat - keycloak.timeSkew);
  }
  /**
   * execute all listener functions in this.listener
   */
  _traverseListeners() {
    const timeRemain = this.getRefreshRemainTime();
    const accessTimeRemain = this.getAccessRemainTime();
    this.listeners.forEach((item) => {
      const { func, condition } = item;
      if (condition(timeRemain, accessTimeRemain, this.lastTimeRemain)) {
        func();
      }
    });
    this.lastTimeRemain = timeRemain;
  }

  /**
   * do func() when condition can return a true with ${time}
   * @param {{func:()=>void,condition?:(timeRemain:number)=>boolean}} listener if condition is not specified, only return true when time === timeRemain
   * @returns {string} the id to cancel the listener, by calling tokenManager.removeListener(listenerId)
   */
  addListener(listener) {
    const listenerId = uuidv4();
    const { func, condition = (timeRemain) => false } = listener;
    if (!_.isFunction(func)) {
      throw new Error('the listener.func should be a function');
    }
    if (condition && !_.isFunction(condition)) {
      throw new Error('the listener.condition should be a function');
    }
    this.listeners.push({ func, condition, listenerId });
    return listenerId;
  }

  /**
   * remove a listener function from the token timeline
   * @param {string} listenerId the uuid of the listener function
   */
  removeListener(listenerId) {
    if (typeof listenerId !== 'string') {
      throw new Error('the listenerId should be an string');
    }
    _.remove(this.listeners, (item) => item.listenerId === listenerId);
  }
}

const tokenTimer = new TokenTimer();
export { tokenTimer };
