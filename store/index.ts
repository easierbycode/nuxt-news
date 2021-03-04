import { saveUserData, clearUserData } from '~/utils';
import db from '~/plugins/firestore';
import Vuex from 'vuex';
import md5 from 'md5';
import slugify from 'slugify';


const createStore = () => {
    return new Vuex.Store({
        state: {
            headlines: [],
            category: '',
            loading: false,
            country: 'us',
            token: '',
            user: null,
            feed: [],
            headline: null
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
            clearFeed: state => (state.feed = []),
            // payload is headline
            setHeadline(state, payload) {
                state.headline = payload;
            }
        },
        actions: {
            // payload is apiUrl
            async loadHeadlines(context, payload) {
                let { commit } = context;
                commit('setLoading', true);
                const { articles } = await this.$axios.$get(payload);
                const headlines = articles.map(article => {
                    const slug = slugify(article.title, {
                        replacement: '-',
                        remove: /[^a-zA-Z0-9 -]/g,
                        lower: true
                    })
                    const headline = { ...article, slug };
                    return headline;
                });
                commit('setLoading', false);
                commit('setHeadlines', headlines);
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
                        });

                        if (querySnapshot.empty) {
                            headlines = [];
                            commit('setFeed', headlines);
                        }
                    })
                }
            },
            // payload is headline object
            async removeHeadlineFromFeed(context, payload) {
                let { state } = context;
                const headlineRef = db.collection(`users/${state.user.email}/feed`).doc(payload.title);

                await headlineRef.delete();
            },
            // payload is headline object
            async saveHeadline(context, payload) {
                const headlineRef = db.collection('headlines').doc(payload.slug);

                let headlineId;
                await headlineRef.get().then(doc => {
                    if (doc.exists) {
                        headlineId = doc.id;
                    }
                })

                if (!headlineId) {
                    await headlineRef.set(payload);
                }
            },
            // payload is headlineSlug
            async loadHeadline(context, payload) {
                let { commit } = context;
                const headlineRef = db.collection('headlines').doc(payload);

                await headlineRef.get().then(doc => {
                    if (doc.exists) {
                        const headline = doc.data();
                        commit('setHeadline', headline);
                    }
                })
            },
            // payload is comment
            async sendComment(context, payload) {
                let { state, commit } = context;
                const commentsRef = db.collection(`headlines/${state.headline.slug}/comments`);

                commit('setLoading', true);
                await commentsRef.doc(payload.id).set(payload);
                await commentsRef.get().then(querySnapshot => {
                    let comments = [];
                    querySnapshot.forEach(doc => {
                        comments.push(doc.data());
                        const updatedHeadline = { ...state.headline, comments };
                        commit('setHeadline', updatedHeadline);
                    });
                });
                commit('setLoading', false);
            }
        },
        getters: {
            headlines: state => state.headlines,
            category: state => state.category,
            loading: state => state.loading,
            country: state => state.country,
            isAuthenticated: state => !!state.token,
            user: state => state.user,
            feed: state => state.feed,
            headline: state => state.headline
        }
    })
}

export default createStore;