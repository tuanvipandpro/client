import axios from 'axios'
import { defineStore } from 'pinia'

const endpoint = ''

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
      return true
    },
  }
})