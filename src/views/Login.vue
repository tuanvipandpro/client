<template>
  <div class="login_view">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header" style="text-align: center;">
          <span style="font-weight: bolder; font-size: larger;">Login</span>
          <!-- <el-button class="button" text>Operation button</el-button> -->
        </div>
      </template>
      <div class="flex">
        <!-- <el-input v-model="username" size="large" placeholder="Input your name" style="margin-bottom: 10px;"/> -->
        <el-button :icon="Message" @click="googleLogin" color="#626aef" class="button" size="large" plain>
           Login by gmail
        </el-button>
      </div>
    </el-card>
    <el-image style="width: 25vw; height: 50vh; margin-left: 5vw;" :src="'https://firebasestorage.googleapis.com/v0/b/personalstrength-83af0.appspot.com/o/huy%20doan%2Fbackground_img_1.png?alt=media&token=5e7eeb0e-da8c-4eed-b159-faaa86ded152'" fit="fit" />
  </div>
</template>
<script setup>
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@element-plus/icons-vue';
import { useUserStore } from '../stores/user'
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth'

sessionStorage.removeItem('user')

const username = ref('')
const router = useRouter()

const handleClick = () => {
  if (username.value) {
    router.push({name: 'Home', params: {name: username.value}})
  } else {
    ElMessage.error('You must input your name !!!')
  }
}

const googleLogin = async () => {
  signInWithPopup(getAuth(), new GoogleAuthProvider()).then(async res => {
    const userObj = {
      email: res.user.email,
      avatar: res.user.photoURL,
      name: res.user.displayName,
      idToken: await res.user.getIdToken(true)
    }

    try {
      if(await useUserStore().login(userObj)) {
        router.push({name: 'Home'})
      } else {
        ElMessage.error('The user is invalid !!')
      }
      
    } catch (e) {
      ElMessage.error('The user is invalid !!!')
      console.error(e)
    }
  }).catch(err => {
    console.log(err)
  })
}

</script>
<style scoped>

.login_view {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.box-card {
  width: 25vw;
}

.button {
  width: 100%;
}
</style>
