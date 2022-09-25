import axios from 'axios'
import { defineStore } from 'pinia'

const endpoint = 'https://release-mto.herokuapp.com'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    token: '',
    avatar: '',
    email: '',
    id: ''
  }),
  getters: {
    //TODO
  },
  actions: {
    async login(userObject) {
      const url = `${endpoint}/api/sys_users/login_by_email`
      // const body = {
      //   firebaseToken: userObject.idToken
      // }

      const res = await axios.post(url, null, {
        params: {
          firebaseToken: userObject.idToken
        }
      })
      if (res.status === 200 && res.data.roleId === 3) {
        this.token = res.data.token
        this.name = userObject.name
        this.email = userObject.email
        this.avatar = userObject.avatar
        this.id = res.data.id
        sessionStorage.setItem('user', JSON.stringify({
          token: res.data.token,
          id: res.data.id,
          name: userObject.name,
          email: userObject.email,
          avatar: userObject.avatar,
        }))
        return true
      }
      return false
    },
  }
})