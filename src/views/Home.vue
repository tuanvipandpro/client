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
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; align-items: center">
              <el-avatar v-if="toUser.imagePath" :src="toUser.imagePath"/>
              <el-avatar v-else :size="30" icon="Avatar" />
              <strong style="margin-left: 6px">{{
                toUser.name || "None"
              }}</strong>
            </div>
          </template>
          <div ref="scrollbox" style="height: 74vh; overflow-y: auto">
            <template v-for="(msg, index) in msgBoard" :key="index">
              <div v-if="!msg.isYou" class="msgbox">{{ msg.message }}</div>
              <div v-else class="msgbox isRight">{{ msg.message }}</div>
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
            </template>
          </el-input>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import { ref, onBeforeMount, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "../stores/user";
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

    const route = useRoute();

    const user = JSON.parse(sessionStorage.getItem("user"));
    const toUser = ref({});
    const userBoard = ref([]);
    const msgBoard = ref([]);
    const chatData = ref("");
    const loading = ref(false)
    const containerLoading = ref(true)
    const scrollbox = ref(null)

    let initFlg = false;

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
          };
        });
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
      await init();
      containerLoading.value = false
    });
    
    return {
      chatData,
      msgBoard,
      userBoard,
      toUser,
      loading,
      scrollbox,
      containerLoading,
      sendMsg,
      handleEnter,
      chooseMsgBox,
    };
  },
};
</script>

<style scoped>
.main {
  padding: 5px;
}
.flex-board {
  display: flex;
  flex-direction: column;
}

.userboard {
  padding: 5px;
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
