<!-- 
  文件名称：Sidebar.vue
  文件描述：侧边栏导航组件
  功能说明: 
      - 显示 LOGO 和 名称
      - 多级菜单导航(仪表盘、系统管理、用户管理)
      - 支持子父菜单折叠和展开，点击菜单激活路由，可以跳转对应页面
-->

<script setup>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

// 路由
const router = useRouter()
const route = useRoute()

// 状态管理
const store = useStore()

// 是否折叠
const isCollapse = ref(false)

// 切换折叠的标识
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>
<template>
  <el-aside class="sidebar-container" :width="isCollapse ? '64px' : '220px'">
    <!-- 系统logo -->
    <div class="logo-container">
      <div class="logo-icon">
        <el-icon :size="30" color="#fff">
          <Reading />
        </el-icon>
      </div>
      <div class="logo-text">海事图书馆</div>
    </div>
    <!-- 折叠面板 -->
    <div class="collapse-btn" @click="toggleCollapse">
      <el-icon :size="25">
        <Fold v-if="!isCollapse"></Fold>
        <Expand v-else></Expand>
      </el-icon>
    </div>

    <!-- 功能菜单 -->
    <el-menu class="sidebar-menu" :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="$route.path">
      <!-- 仪表盘 -->
      <el-menu-item index="/dashboard">
        <el-icon><Monitor /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>

      <!-- 图书管理 -->
      <el-sub-menu index="/book">
        <template #title>
          <el-icon><Reading /></el-icon>
          <span>图书管理</span>
        </template>

        <el-menu-item index="/book/manager" title="图书列表">图书列表</el-menu-item>
        <el-menu-item index="/book/category" title="图书分类">图书分类</el-menu-item>
        <el-menu-item index="/book/copy" title="图书副本">图书副本</el-menu-item>
      </el-sub-menu>
      <!-- 图书查阅 -->
      <el-menu-item index="/bookDisplay">
        <el-icon><Search /></el-icon>
        <template #title>图书查阅</template>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<style lang="scss" scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  background-color: #001529;
}
.logo-container {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  .logo-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 45px;
    height: 45px;
  }
  .logo-text {
    margin-left: 15px;
    color: #fff;
    font-size: 18px;
  }
}
.collapse-btn {
  display: flex;
  align-items: center;
  height: 40px;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: all 0.5s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.5);
  }
}
.sidebar-menu {
  border-right: none;
  // 按需显示滚动条
  overflow-y: auto;
  --el-menu-bg-color: #001529;
  --el-menu-text-color: #ffffff;

  :deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;
    font-size: 16px;
    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
    &.is-active {
      background-color: rgba(55, 145, 255, 0.9) !important;
      // background-color: #409eff;
      color: #ffffff;
    }
  }
  // 修改父菜单的样式
  :deep(.el-sub-menu__title) {
    height: 50px;
    line-height: 50px;
    border-radius: 6px;
    font-size: 16px;
    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
  }
}
</style>
