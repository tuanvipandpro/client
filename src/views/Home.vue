<template>
  <div class="common-layout max-height">
    <el-container v-loading="containerLoading">
      <el-aside class="max-height userboard">
        <Userbox
          v-for="(userbox, i) in userBoard"
          :key="i"
          :username="userbox.name"
          :last-message="userbox.lastMessage"
          :chatting="userbox.isChatting"
          :hidden-badge="!userbox.newChat"
          :avatar="userbox.imagePath"
          @click="chooseMsgBox(userbox)"
        />
      </el-aside>
      <el-main class="main">
        <el-card shadow="never" class="header-chat">
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center;">
                <el-avatar v-if="toUser.imagePath" :src="toUser.imagePath"/>
                <el-avatar v-else :size="30" icon="Avatar" />
                <strong style="margin-left: 6px">{{
                  toUser.name || "None"
                }}</strong>
              </div>
              <el-popover placement="left" trigger="click" @before-enter="showPopover">
                <template #reference>
                  <el-button :icon="InfoFilled" text round style="font-size: 28px;"></el-button>
                </template>
                <el-avatar
                  :size="30"
                  :src="popoverData.image"
                  style="margin-bottom: 8px"
                />
                <p>Name: {{popoverData.name || "None"}}</p>
                <p>Status : {{ popoverData.isActive ? 'Online' : 'Offline' }}</p>
              </el-popover>
            </div>
          </template>
          <div ref="scrollbox" style="height: 74vh; overflow-y: auto">
            <template v-for="(msg, index) in msgBoard" :key="index">
              <div v-if="msg.image" :class="!msg.isYou ? 'msgbox' : 'msgbox isRight' ">
                <el-image style="width: 100px; height: 100px" :src="msg.image" :preview-src-list="[msg.image]" fit="fill" />
              </div>
              <div v-else-if="!msg.isYou" class="msgbox">
                {{ msg.message }} 
                <div style="font-size: 8.2px; font-weight: 700;">{{ convertDate(msg.createdAt) }}</div>
              </div>
              <div v-else class="msgbox isRight">
                {{ msg.message }}
                <div style="font-size: 8.2px; font-weight: 700;">{{ convertDate(msg.createdAt) }}</div>
              </div>
            </template>
          </div>
        </el-card>
        <div style="margin-top: 0.5vh">
          <el-input
            @keypress="handleEnter"
            v-model="chatData"
            size="large"
            placeholder="Please input ..."
          >
            <template #prepend>
              <el-button icon="Position" @click="sendMsg" :loading="loading"/>
              <!-- <el-button icon="Position" @click="sendMsg" :loading="loading"/> -->
            </template>
            <template #append>
              <el-upload
                ref="upload"
                list-type="picture"
                accept="image/*,.jpg,.png"
                :limit="1"
                :auto-upload="false"
                :show-file-list="false"
                :on-exceed="handleExceed"
                :on-change="onSucessUploadImg"
              >
                <template #trigger>
                  <el-button :icon="PictureFilled" />
                </template>
              </el-upload>
            </template>
          </el-input>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, genFileId } from "element-plus";
import moment from "moment"
import { PictureFilled, InfoFilled } from "@element-plus/icons-vue";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  onSnapshot,
  where,
} from "firebase/firestore";
import axios from "axios";
import Userbox from "../components/Userbox.vue";

export default {
  components: {
    Userbox: Userbox,
  },

  setup() {
    const COLLECTION = "chats";

    const router = useRouter();

    const user = JSON.parse(sessionStorage.getItem("user"));
    const toUser = ref({});
    const userBoard = ref([]);
    const msgBoard = ref([]);
    const chatData = ref("");
    const loading = ref(false)
    const containerLoading = ref(true)
    const scrollbox = ref(null)
    const upload = ref()
    const popoverData = ref({})

    let initFlg = false;
    let image = undefined

    const handleExceed = (files) => {
      const file = files[0]
      file.uid = genFileId()
      upload.value.handleStart(file)
      console.log('sdsd')
    }

    const convertToBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })

    const convertDate = (date) => {
      return moment(date).format('DD/MM HH:mm')
    }

    const onSucessUploadImg = async (file, files) => {
      loading.value = true
      try {
        const base64 = await convertToBase64(file.raw)
        const res = await addDoc(collection(db, "chats"), {
          createdAt: new Date(),
          roomId: toUser.value.roomId,
          image: base64,
          user: {
            _id: user.email,
            name: user.name,
            avatar: user.avatar,
          },
        });
        scrollbox.value.scrollTop = scrollbox.value.scrollHeight        
      }
      catch(e) {
        console.error(e)
      } 
      finally {
        loading.value = false
      }
    }

    const checkTimestamp = (a, b) => {
      if (a.data().createdAt > b.data().createdAt) {
        return 1;
      }
      if (a.data().createdAt < b.data().createdAt) {
        return -1;
      }
      return 0;
    };

    const getMsgBoardByRoomId = async () => {
      const chatQuery = query(
        collection(db, COLLECTION),
        where("roomId", "==", toUser.value.roomId)
      );
      const chatBoardData = await getDocs(chatQuery);
      msgBoard.value = chatBoardData.docs
        .sort((a, b) => checkTimestamp(a, b))
        .map((e) => {
          return {
            id: e.id,
            isYou: e.data().user._id === user.email,
            username: e.data().user.name,
            avatar: e.data().user.avatar,
            message: e.data().text,
            createdAt: e.data().createdAt.toDate(),
            roomId: e.data().roomId,
            image: e.data().image
          };
        });

      // msgBoard.value[0].imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAgCAMAAACvkzHFAAABblBMVEUAAAAAAP+AgP9VVf9AQP9mM8xVVdVJSdtAQN9VOeNNTeZGRuhVQOpOTutJSe1VRN1VR+NNQOZVSedMQuNSSeRQSOdTROlQSeJRQ+ROSOVNRuZRRuhPRONQReROROVNR+ZQRuZQR+NPRuNOReVRRedQSONORuVQReZPROZPReNNR+VQR+ROReZPR+RPReZOR+ZQRuZQRuRPReVQRuVPRuZOReZQR+ZQR+RORuVQReVOR+ZQRuRPRuVQR+RPRuVPR+VORuRORuVPRuZPReRPRuVOR+VPRuVOReVQR+ZPRuZPRuRPRuVPRuVQRuVPR+VPRuVORuVORuRQRuVPR+VPRuVPRuVPRuVPRuVQRuVPRuVPRuVQRuVPRuVPRuZORuRPRuVPReVPRuZPRuVPRuVORuVPR+VPRuVPRuVPRuVPRuVPRuZPRuVPRuVPRuVPRuVPRuVPRuVPRuVPRuVPRuVPRuVPRuVPRuVPRuVPRuX////xVqGrAAAAeHRSTlMAAQIDBAUGBwgJCgsMDQ4PEhQVGxwgIiMmJygsLTAxMjM2Nzs/QEVGR0pPVlxeZGVmaWttbm9wc3V2goaKkJKUmZyhoqSmp6mqq6yur7CxsrO2urzFxsfLzdbX2tvc3d7g5ufp6uvs7e7v8PHy8/T19vf4+fv8/f4WzLQ2AAAAAWJLR0R5odzU0AAAAYlJREFUGBmVwfdbklEcxuGPJmWWVGbGaJctWpYRlU1HDlAkW1aWNHgVscSU58/ve8756cXsurxv9uLI02rzzRWC7PjHt8P7aXPwvcx2Dufqhsx8J3H35VUTwL6v8m4SV1ZwBjit4BVxZQXXgHMKZokrKLgF9ETyHhLXuyhvFHNPzlKSNn0VOVESc2dZW6Xj7ND1TM4jvP5D/NOYzJ9L/E/yi0x0gZ0ypcbmfBZzV87GbYJMuflrNoNJ1WTqA0CyIW8EJ1WXqaWAKXlTmIq8VhZTlDcJRPIizHMFeUxd3k8gkvcD80JBHrMmbxWYlDeBqchrZTEz8qaBgUimlgYOrMsbwUnXZFZSmJPTK41iCnNDzuYQQWZmdb2YJqbnk8z3i+yuY1Rma5DdJV7KeYzT2X+Unfpey2kewwx9U6tygja9i/ImMHk5nw8TV1DwAOhek1cgbk7BdeC8ghJxcwrOAlkF48QNy6smgI4leTniut/JbOdwBn/LlLtok3yy3Fy4THBq7MNCPsEe/AWSl71coHcZgwAAAABJRU5ErkJggg=='
    };

    const sendMsg = async () => {
      loading.value = true
      try {
        const chatMsg = chatData.value;
        // chatData.value = "";
        const res = await addDoc(collection(db, "chats"), {
          createdAt: new Date(),
          roomId: toUser.value.roomId,
          text: chatMsg,
          // image: image ? image : undefined,
          user: {
            _id: user.email,
            name: user.name,
            avatar: user.avatar,
          },
        });
        scrollbox.value.scrollTop = scrollbox.value.scrollHeight
      } catch (err) {
        console.log(err);
        ElMessage.error("Can't send your msg");
      } finally {
        chatData.value = "";
        loading.value = false
      }
    };

    const handleEnter = (e) => {
      if (e.keyCode === 13) sendMsg();
    };

    const chooseMsgBox = async (userbox) => {
      containerLoading.value = true
      toUser.value = userbox;
      userBoard.value.map((userMsg) => {
        userMsg.isChatting = userbox.studentId === userMsg.studentId;
        userMsg.newChat = false;
        return userMsg;
      });
      await getMsgBoardByRoomId();
      chatData.value = "";
      containerLoading.value = false
    };

    const getRoomByConnectorId = async () => {
      const res = await axios.get(
        `https://release-mto.herokuapp.com/api/sys_users/ChatRoom?
        PageNumber=${1}&
        PageSize=${1000}
        `,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      return res.data;
    };

    const getStatusForUser = async () => {
      const res = await axios.get(
        `https://release-mto.herokuapp.com/api/sys_users/${user.id}/chat_info
        `,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      return res.data;
    };

    const showPopover = async () => {
      const status = await getStatusForUser()
      popoverData.value = status
    }

    const init = async () => {
      const res = await getRoomByConnectorId();
      // roomId.value = res.data[0].roomId;
      toUser.value = res.data[0];
      userBoard.value = res.data.map(e => {
        return {
          ...e,
          newChat: false,
          isChatting: false,
        }
      });
      userBoard.value[0].isChatting = true;
      // const q = query(collection(db, COLLECTION),where("roomId", "==", toUser.value.roomId));
      onSnapshot(query(collection(db, COLLECTION)), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && initFlg) {
            if (toUser.value.roomId === change.doc.data().roomId) {
              if (!msgBoard.value.find((e) => e.id === change.doc.id)) {
                msgBoard.value.push({
                  id: change.doc.id,
                  isYou: change.doc.data().user._id === user.email,
                  username: change.doc.data().user.name,
                  avatar: change.doc.data().user.avatar,
                  message: change.doc.data().text,
                  createdAt: change.doc.data().createdAt.toDate(),
                  roomId: change.doc.data().roomId,
                  image: change.doc.data().image
                });
                
              }
            } else {
              userBoard.value[userBoard.value.findIndex(e => e.roomId === change.doc.data().roomId)].newChat = true
            }
          }
          if (change.type === "modified") {
            console.log("Modified: ", change.doc.data());
          }
          if (change.type === "removed") {
            msgBoard.value = msgBoard.value.filter(
              (item) => item.id !== change.doc.id
            );
          }
        });
      });
      await getMsgBoardByRoomId();
      initFlg = true;
    };

    onMounted(async () => {
      if (sessionStorage.getItem('user')) {
        await init();
        containerLoading.value = false
      } else {
        router.push('/')
        // containerLoading.value = false
      }
    });
    
    return {
      chatData,
      msgBoard,
      userBoard,
      toUser,
      loading,
      scrollbox,
      containerLoading,
      popoverData,
      PictureFilled,
      InfoFilled,
      convertDate,
      showPopover,
      sendMsg,
      handleEnter,
      chooseMsgBox,
      onSucessUploadImg,
      handleExceed
    };
  },
};
</script>

<style lang="scss">
.main {
  padding: 5px !important;
}
.flex-board {
  display: flex !important;
  flex-direction: column !important;
}

.header-chat{
  .el-card__header {
    background: #ABD9FF;
  }
}

.userboard {
  padding: 5px !important;
}

.msgbox {
  width: fit-content;
  max-width: 40vw;
  border: 1px solid whitesmoke;
  border-radius: 10px;
  padding: 12px;
}

.isRight {
  margin-left: auto;
  margin-right: 0;
}

.max-height {
  height: 100vh;
}

.border {
  border: 1px solid rgb(94, 94, 94);
}
</style>
