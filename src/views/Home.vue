<template>
  <div>
    <el-container>
      <el-aside style="width: 18vw">
        <Menu></Menu>
      </el-aside>
      <el-container>
        <el-main>
          <el-table
            :data="tableData"
            border
            highlight-current-row
            style="width: 100%; height: 37vh"
          >
            <el-table-column prop="id" label="ID" width="180" />
            <el-table-column prop="name" label="Họ & Tên" width="500" />
            <el-table-column prop="role" label="Chức vụ" />
          </el-table>
          <!-- <el-divider>Details</el-divider> -->
          <el-card shadow="never" style="margin-top: 8px; height: 55vh">
            <!-- <template #header>
              <div class="card-header" style="text-align: center;">
                <span style="font-weight: 600; font-size: 18;">Details</span>
              </div>
            </template> -->
            <div style="display: flex">
              <el-avatar
                shape="square"
                :size="280"
                :src="'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'"
              />
              <div style="margin-left: 8px">
                <div style="padding-left: 5px">
                  <span style="font-weight: 600; font-size: larger"
                    >Lê Minh Tuấn</span
                  >
                </div>
                <div style="margin-top: 3px">
                  <el-tag class="ml-2">Văn Phòng Thống Kê</el-tag>
                  <el-tag class="ml-2" type="success">CNTT</el-tag>
                  <el-tag class="ml-2" type="error">Quân Sự</el-tag>
                </div>
                <div>
                  <el-card
                    shadow="never"
                    style="
                      margin-top: 10px;
                      width: 55vw;
                      height: 33vh;
                      overflow-y: auto;
                    "
                  >
                    <template #header>
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 600;">Chứng Thực Điện Tử</span>
                        <el-button class="button" text :icon="Plus"><span style="font-weight: 600;">Thêm</span></el-button>
                      </div>
                    </template>
                    <div><el-link type="primary">CCCD.pdf</el-link></div>
                    <div><el-link type="primary">SYLL.pdf</el-link></div>
                    <!-- <div><el-link type="primary">SYLL.pdf</el-link></div>
                    <div><el-link type="primary">SYLL.pdf</el-link></div>
                    <div><el-link type="primary">SYLL.pdf</el-link></div>
                    <div><el-link type="primary">SYLL.pdf</el-link></div> -->
                  </el-card>
                </div>
              </div>
            </div>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script setup>
import Menu from "../components/Menu.vue";
import {
  Plus
  } from '@element-plus/icons-vue'

const tableData = [
  {
    id: "01",
    name: "Lê Minh Tuấn",
    role: "CNTT",
  },
  {
    id: "02",
    name: "Trương Thị Tuyền",
    role: "VPTK",
  },
  {
    id: "03",
    name: "Tống Thụy Thảo Trang",
    role: "Tư Pháp",
  },
  {
    id: "04",
    name: "Huỳnh Văn Ngọc Thanh",
    role: "Tư Pháp",
  },
  {
    id: "05",
    name: "Nguyễn Thị Hoài Phương",
    role: "CBHĐ",
  },
  {
    id: "06",
    name: "Lê Ngọc Trinh",
    role: "CBHĐ",
  },
];
</script>
<style scoped>
.ml-2 {
  margin-left: 2px;
}
</style>