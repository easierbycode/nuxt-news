import Vuex from 'vuex';


const createStore = () => {
    return new Vuex.Store({
        state: {
            headlines: [],
            category: '',
            loading: false,
            country: 'us'
        },
        mutations: {
            // payload is headlines
            setHeadlines(state, payload) {
                state.headlines = payload;
            },
            // payload is category
            setCategory(state, payload) {
                state.category = payload;
            },
            // payload is loading
            setLoading(state, payload) {
                state.loading = payload;
            },
            // payload is country
            setCountry(state, payload) {
                state.country = payload;
            }
        },
        actions: {
            // payload is apiUrl
            async loadHeadlines(context, payload) {
                let { commit } = context;
                commit('setLoading', true);
                const { articles } = await this.$axios.$get(payload);
                commit('setLoading', false);
                commit('setHeadlines', articles);
            }
        },
        getters: {
            headlines: state => state.headlines,
            category: state => state.category,
            loading: state => state.loading,
            country: state => state.country
        }
    })
}

export default createStore;