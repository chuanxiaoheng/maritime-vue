<!-- 
  文件名称：Layout.vue
  文件描述：主布局容器组件
  功能说明: 
      - 提供整个应用的基础布局框架
      - 包含header(顶部导航) 和 Sidebar(侧边栏) + content(内容展示区域)
-->

<script setup>
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
</script>

<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <Sidebar></Sidebar>
    <!-- 内容区域 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <Header></Header>
      <el-main class="main-content">
        <!-- 路由展示 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}
.main-content {
  flex: 1;
  padding: 20px;
}
</style>
