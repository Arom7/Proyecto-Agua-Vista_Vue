import { createApp } from 'vue';
import { createStore } from 'vuex';

const store = createStore({
  state: {
    token: null,
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    CLEAR_TOKEN(state) {
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  actions: {
    setToken({ commit }, token) {
      commit('SET_TOKEN', token);
    },
    clearToken({ commit }) {
      commit('CLEAR_TOKEN');
    },
  },
  getters: {
    token: state => state.token,
    isAuthenticated: state => !!state.token,
  },
});

export default store;
