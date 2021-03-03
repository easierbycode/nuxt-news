import Vuex from 'vuex';
import md5 from 'md5';
import db from '~/plugins/firestore';


const createStore = () => {
    return new Vuex.Store({
        state: {
            headlines: [],
            category: '',
            loading: false,
            country: 'us',
            token: '',
            user: null
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
            },
            // payload is token
            setToken(state, payload) {
                state.token = payload;
            },
            // payload is user object
            setUser(state, payload) {
                state.user = payload;
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
            },
            // payload is userPayload
            async authenticateUser(context, payload) {
                let { commit } = context;
                try {
                    commit('setLoading', true);
                    const authUserData = await this.$axios.$post(
                        `/${payload.action}/`, 
                        {
                            email: payload.email,
                            password: payload.password,
                            returnSecureToken: payload.returnSecureToken
                        }
                    );
                    
                    let user;
                    if (payload.action === 'register') {
                        const avatar = `http://gravatar.com/avatar/${md5(authUserData.email)}?d=identicon`;
                        const user = { email: authUserData.email, avatar };
                        await db.collection('users').doc(payload.email).set(user);
                    } else {
                        const loginRef = db.collection('users').doc(payload.email);
                        const loggedInUser = await loginRef.get()
                        user = loggedInUser.data();
                    }
                    
                    commit('setUser', user);
                    commit('setToken', authUserData.idToken);
                    commit('setLoading', false);
                } catch(err) {
                    console.error(err);
                    commit('setLoading', false);
                }
            }
        },
        getters: {
            headlines: state => state.headlines,
            category: state => state.category,
            loading: state => state.loading,
            country: state => state.country,
            isAuthenticated: state => !!state.token,
            user: state => state.user
        }
    })
}

export default createStore;