<!-- 
  文件名称：Header.vue
  文件描述：头部导航组件
  功能说明: 
      - 显示当前菜单，用户头像
      - 用户昵称可以点击，弹出下拉菜单，查看个人信息，退出登录
-->

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

// 路由
const router = useRouter()
const route = useRoute()

// 状态管理
const store = useStore()

// 头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确认要执行退出登录吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 删除用户数据
    store.dispatch('logout')
    ElMessage.success('退出成功')
    // 跳转到登录页
    router.push('/login')
  })
}

const handleUserCenter = () => {
  // ElMessage('个人中心开发中')
  router.push('/user/personal')
}

const handleSetting = () => {
  // ElMessage('账户设置开发中')
  router.push('/user/settings')
}

// 显示当前页名称，从路由配置中获取属性pageName的值，展示
const currentRouteTitle = computed(() => {
  return route.meta.pageName || '首页'
})
</script>

<template>
  <el-header class="header-container" height="70px">
    <!-- 面包屑 -->
    <div class="header-left">
      <el-icon :size="20">
        <Menu />
      </el-icon>
      <el-icon>
        <ArrowRight />
      </el-icon>
      <span class="breadcrumb-text">{{ currentRouteTitle }}</span>
    </div>
    <!-- 头部右侧内容 -->
    <div class="header-right">
      <el-tooltip content="全局搜索" placement="bottom">
        <el-icon class="tooltip-icon">
          <Search />
        </el-icon>
      </el-tooltip>
      <el-tooltip content="系统设置" placement="bottom">
        <el-icon class="tooltip-icon">
          <Setting />
        </el-icon>
      </el-tooltip>
      <!-- 用户中心下拉菜单 -->
      <el-dropdown trigger="click">
        <span class="user-center">
          <el-avatar :size="20" :src="store.state.user.avatar || defaultAvatar" />
          {{ store.state.user.username }}
          <el-icon>
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleUserCenter">
              <el-icon><User /></el-icon>个人中心
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleSetting">
              <el-icon><Setting /></el-icon>账户设置
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<style lang="scss" scoped>
.header-container {
  height: 70px;
  background: linear-gradient(180deg, #1a1f2e 100%, #242b3d 0%);
  padding: 0 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  .tooltip-icon {
    cursor: pointer;
    color: #fff;
  }
  &:hover {
    color: #409eff;
  }
}
.user-center {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 20px;
  padding: 10px 12px;
  color: #fff;
  border-radius: 5px;
  transition: all 0.3s;
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  .user-name {
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
