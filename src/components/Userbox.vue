<template>
  <el-card v-if="chatting" shadow="hover" style="background-color: #e8e9ff;">
    <div class="userbox">
      <el-avatar :size="50" icon="Avatar" />
      <div class="userinfo">
        <span style="font-weight: bolder; font-size: medium">{{username}}</span>
        <span
          style="
            display: block;
            font-size: small;
            font-weight: bold;
            color: #95a5a6;
          "
          >{{lastMessage}}
        </span>
      </div>
    </div>
  </el-card>
  <el-card v-else shadow="hover">
    <div class="userbox">
      <el-avatar :size="50" icon="Avatar" />
      <div class="userinfo">
        <span style="font-weight: bolder; font-size: medium">{{username}}</span>
        <span
          style="
            display: block;
            font-size: small;
            /* font-weight: bold; */
            color: #95a5a6;
          "
          >{{lastMessage}}
        </span>
      </div>
    </div>
  </el-card>
</template>
<script setup>
import { ElMessage } from "element-plus";

defineProps({
  lastMessage: String,
  username: String,
  imageSrc: String,
  chatting: Boolean
})

// const handleClick = () => {
//   ElMessage.success("Click");
// }

</script>
<style scoped>
.userbox {
  display: flex;
  align-items: center;
}

.userinfo {
  margin-left: 10px;
}
</style>