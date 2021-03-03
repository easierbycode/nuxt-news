import Vuex from 'vuex';
import md5 from 'md5';
import db from '~/plugins/firestore';
import { saveUserData, clearUserData } from '~/utils';


const createStore = () => {
    return new Vuex.Store({
        state: {
            headlines: [],
            category: '',
            loading: false,
            country: 'us',
            token: '',
            user: null,
            feed: []
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
            },
            clearToken: state => (state.token = ''),
            clearUser: state => (state.user = null),
            // payload is headlines array
            setFeed(state, payload) {
                state.feed = payload;
            },
            clearFeed: state => (state.feed = [])
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
                    saveUserData(authUserData, user);
                } catch(err) {
                    console.error(err);
                    commit('setLoading', false);
                }
            },
            // payload is interval
            setLogoutTimer(context, payload) {
                let { dispatch } = context;
                setTimeout(() => dispatch('logoutUser'), payload);
            },
            logoutUser(context) {
                let { commit } = context;
                commit('clearToken');
                commit('clearUser');
                commit('clearFeed');
                clearUserData();
            },
            // payload is headline
            async addHeadlineToFeed(context, payload) {
                let { state } = context;
                const feedRef = db.collection(`users/${state.user.email}/feed`).doc(payload.title);

                await feedRef.set(payload);
            },
            async loadUserFeed(context) {
                let { state, commit } = context;

                if (state.user) {
                    const feedRef = db.collection(`users/${state.user.email}/feed`);

                    await feedRef.onSnapshot(querySnapshot => {
                        let headlines = [];
                        querySnapshot.forEach(doc => {
                            headlines.push(doc.data());
                            commit('setFeed', headlines);
                        })
                    })
                }
            }
        },
        getters: {
            headlines: state => state.headlines,
            category: state => state.category,
            loading: state => state.loading,
            country: state => state.country,
            isAuthenticated: state => !!state.token,
            user: state => state.user,
            feed: state => state.feed
        }
    })
}

export default createStore;