<!-- 文件名称：DashBoard.vue
     文件描述：仪表盘组件
     功能说明：
          -- 显示欢迎信息，快捷入门操作
          -- 核心数据统计，如：图书数量，用户数
          -- 图表展示（折线图、饼状图）
          -- 热门图书排行，最新公告、读者留言
-->

<script setup>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import welcomeImage from '@/assets/welcome.jpg'
import { fetchHotRank, fetchLastAnnouncement, fetchLastReaderMessage, fetchStatsData } from '@/api/dashboard/dashboard'
// 路由+状态管理
const router = useRouter()
const store = useStore()

// 统计数量
const statsData = ref({})
// 最新公告
const lastAnnouncements = ref([])
// 最新留言
const lastReaderMessages = ref([])
// 热门图书
const hotBooks = ref([])

// 欢迎信息相关
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) {
    return '早上好'
  } else if (hour < 18) {
    return '下午好'
  } else {
    return '晚上好'
  }
})
// 当前日期
const currentDate = ref(
  new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }),
)
// 欢迎图片
const url = 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'
// 快速跳转
const handleAction = (action) => {
  router.push(action)
}

// 加载统计数量
const loadStatsData = () => {
  fetchStatsData()
    .then((res) => {
      if (res.code === 200 && res.data) {
        statsData.value = res.data
      }
    })
    .catch((err) => console.log(err))
}
// 获取最新公告
const loadLastAnnouncement = () => {
  fetchLastAnnouncement()
    .then((res) => {
      if (res.code === 200 && res.data) {
        lastAnnouncements.value = res.data.list || []
      }
    })
    .catch((err) => console.log(err))
}
// 获取最新公告
const loadLastReaderMessage = () => {
  fetchLastReaderMessage()
    .then((res) => {
      if (res.code === 200 && res.data) {
        lastReaderMessages.value = res.data.list || []
      }
    })
    .catch((err) => console.log(err))
}

// 加载热门图书排行
const loadHotBookRank = () => {
  fetchHotRank()
    .then((res) => {
      if (res.code === 200 && res.data) {
        // console.log(res.data)
        hotBooks.value = res.data.map((hotBook, index) => ({
          rank: index + 1,
          name: hotBook.bookName,
          count: hotBook.borrowCount,
        }))
      }
    })
    .catch((err) => console.log(err))
}

// 加载数据
onMounted(() => {
  // 统计数量
  loadStatsData()
  // 最新公告
  loadLastAnnouncement()
  // 最新留言
  loadLastReaderMessage()
  // 热门图书排行
  loadHotBookRank()
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 欢迎信息+快捷入口 -->
    <div class="welcome-header">
      <!-- 左侧欢迎信息 -->
      <div class="welcome-text">
        <h2>👋{{ greeting }} {{ store.state.user.roleName }}</h2>
        <p>当前日期：{{ currentDate }}</p>
        <el-image style="width: 350px; height: 120px" :src="welcomeImage || url" fit="fill" />
      </div>
      <!-- 右侧快捷入口 -->
      <div class="quick-shortcuts">
        <div class="shortcuts-title">快捷操作</div>
        <div class="shortcuts-grid">
          <div class="shortcuts-item" @click="handleAction('/bookDisplay')">
            <el-icon> <Search :size="24" /> </el-icon>
            <span>图书查询</span>
          </div>
          <div class="shortcuts-item" @click="handleAction('/book/manager')">
            <el-icon> <Tools :size="24" /> </el-icon>
            <span>图书管理</span>
          </div>
          <div class="shortcuts-item" @click="handleAction('/borrow/record')">
            <el-icon> <User :size="24" /> </el-icon>
            <span>借阅记录</span>
          </div>
          <div class="shortcuts-item" @click="handleAction('/borrow/borrow')">
            <el-icon> <Notebook :size="24" /> </el-icon>
            <span>借书办理</span>
          </div>
          <div class="shortcuts-item" @click="handleAction('/borrow/return')">
            <el-icon> <Postcard :size="24" /> </el-icon>
            <span>还书办理</span>
          </div>
          <div class="shortcuts-item" @click="handleAction('/card/manager')">
            <el-icon> <Message :size="24" /> </el-icon>
            <span>读者证</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 数据统计卡片 -->
    <el-row :gutter="15" class="stats-row">
      <el-col :span="6">
        <div class="stats-card">
          <div class="stats-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <el-icon :size="28"> <Reading /> </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">线上总图书数</div>
            <div class="stat-value">
              {{ statsData.bookCount }}
              <el-icon> <CaretTop></CaretTop> </el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card">
          <div class="stats-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <el-icon :size="28"> <User /> </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">线上总读者数</div>
            <div class="stat-value">
              {{ statsData.readerCount }}
              <el-icon> <CaretTop></CaretTop> </el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card">
          <div class="stats-icon" style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)">
            <el-icon :size="28"> <Notebook /> </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">当前借阅数</div>
            <div class="stat-value">
              {{ statsData.borrowCount }}
              <el-icon> <CaretTop></CaretTop> </el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6" :size="28">
        <div class="stats-card">
          <div class="stats-icon" style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)">
            <el-icon :size="28"> <Postcard /> </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">当前归还数</div>
            <div class="stat-value">
              {{ statsData.returnCount }}
              <el-icon> <CaretTop></CaretTop> </el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 数据内容 -->
    <el-row :gutter="15" class="content-row">
      <!-- 趋势折线图 -->
      <el-col :span="16">
        <el-card class="charts-card">
          <template #header>
            <div class="card-header">
              <span>借阅数据（近7日）</span>
              <el-link type="primary" underline="hover">查看更多</el-link>
            </div>
          </template>
          <div class="charts-content">
            <!-- 折线图 -->
          </div>
        </el-card>
      </el-col>
      <!-- 最新公告 -->
      <el-col :span="8">
        <el-card class="notice-card">
          <template #header>
            <div class="card-header">
              <span>最新系统公告</span>
              <el-link type="primary" underline="hover" disabled>查看更多</el-link>
            </div>
          </template>
          <div class="notice-list">
            <!-- 列表数据 -->
            <div v-for="announcement in lastAnnouncements" :key="announcement.id" class="notice-item">
              <el-tag size="small" :type="announcement.top === 1 ? 'danger' : 'primary'">{{ announcement.tag }}</el-tag>
              <div class="notice-content">{{ announcement.content }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 尾部内容 -->
    <el-row :gutter="15" class="footer-row">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>线上热门图书</span>
              <el-link type="primary" underline="hover" disabled>查看更多</el-link>
            </div>
          </template>
          <!-- 列表数据 -->
          <el-table :data="hotBooks" stripe style="width: 100%">
            <el-table-column prop="rank" label="排名" width="80" align="center"></el-table-column>
            <el-table-column prop="name" label="图书" min-width="100" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="count" label="借阅次数" width="100" align="center"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>图书分类占比</span>
              <el-link type="primary" underline="hover" disabled>查看更多</el-link>
            </div>
          </template>
          <div>
            <!-- 列表数据 -->
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新读者留言</span>
              <el-link type="primary" underline="hover" disabled>查看更多</el-link>
            </div>
          </template>
          <div class="message-list">
            <!-- 列表数据 -->
            <div v-for="message in lastReaderMessages" :key="message.id" class="message-item">
              <el-tag size="small">{{ message.createTime }}</el-tag>
              <div class="message-content">读者：{{ message.username }}的留言：{{ message.content }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
// 主容器
.dashboard-container {
  padding: 10px 0;
}
// 欢迎头
.welcome-header {
  display: flex;
  margin-bottom: 15px;
  padding: 20px;
  background-color: #fff;
  border-radius: 6px;
  justify-content: space-between;
  box-shadow: #e1e1e1 2px 2px 5px;
}
.welcome-text {
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }
  p {
    font-size: 14px;
    color: #999;
    margin-bottom: 10px;
  }
}
.quick-shortcuts {
  color: #797979;
  .shortcuts-title {
    font-size: 15px;
    margin-bottom: 10px;
  }
  .shortcuts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    .shortcuts-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 10px;
      background-color: #f8f8f8;
      border-radius: 6px;
      box-shadow: #ffffff 1px 1px 5px;
      cursor: pointer;
      &:hover {
        background-color: #e8e8e8;
        transform: translateY(-2px);
        transition: all 0.3s;
      }
      span {
        font-size: 14px;
        color: #555;
      }
    }
  }
}

// 数据统计卡片
.stats-row {
  margin-bottom: 15px;
  .stats-card {
    width: 100%;
    background: #fff;
    border-radius: 6px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      transition: all 0.3s;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    .stats-icon {
      width: 55px;
      height: 55px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .stat-info {
      flex: 1;
      .stat-label {
        font-size: 14px;
        color: #808080;
        margin-bottom: 8px;
      }
      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #363636;
        .el-icon {
          font-size: 16px;
          color: #999;
        }
      }
    }
  }
}
// 数据内容区
.content-row {
  margin-bottom: 15px;
  .charts-card,
  .notice-card {
    width: 100%;
    height: 400px;
    display: flex;
    flex-direction: column;
    :deep(.el-card__body) {
      flex: 1;
      overflow: hidden;
    }
  }
  .notice-list {
    display: flex;
    gap: 10px;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    .notice-item {
      display: flex;
      gap: 8px;
      padding: 10px;
      background-color: #f7f8f9;
      cursor: pointer;
      border-radius: 5px;
      transition: all 0.3s;
      &:hover {
        transform: translateY(-2px);
      }
    }
    .notice-content {
      flex: 1;
      font-size: 14px;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    font-weight: 600;
    color: #121212;
  }
}
// 尾部内容
.footer-row {
  .el-card {
    width: 100%;
    height: 400px;
    display: flex;
    flex-direction: column;
    :deep(.el-card__body) {
      flex: 1;
      overflow: hidden;
    }
  }
  .message-list {
    display: flex;
    gap: 10px;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    .message-item {
      display: flex;
      gap: 8px;
      padding: 10px;
      background-color: #f7f8f9;
      cursor: pointer;
      border-radius: 5px;
      transition: all 0.3s;
      &:hover {
        transform: translateY(-2px);
      }
    }
    .message-content {
      flex: 1;
      font-size: 14px;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
