<template>
  <div id="cm-menu">
    <el-menu
        active-text-color="#ffd04b"
        background-color="#545c64"
        class="el-menu-vertical-demo"
        default-active="1"
        text-color="#fff"
        style="min-height: 100vh;"
      >
        <el-menu-item index="1">
          <el-icon><icon-menu /></el-icon>
          <span>Quản lý nhân viên</span>
        </el-menu-item>
        <el-sub-menu index="2">
          <template #title>
            <el-icon><setting /></el-icon>
            <span>Cài đặt</span>
          </template>
          <el-menu-item index="2-2" @click="transitTo('/')">Đăng xuất</el-menu-item>
        </el-sub-menu>
      </el-menu>
  </div>
</template>
<script setup>
  import {
    Document,
    Menu as IconMenu,
    Location,
    Setting,
  } from '@element-plus/icons-vue'
  import { useRouter } from 'vue-router';
  
  const router = useRouter()

  const transitTo = (screen) => {
    router.push(screen)
  }

</script>
<style scoped>
  #cm-menu{
    position: fixed;
    left: 0;
    z-index: 1;
    width: 18%;
  }
</style>