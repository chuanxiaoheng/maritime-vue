<template>
  <div class="content-container">
    <!-- 读者信息卡片 -->
    <el-card class="reader-card" shadow="hover">
      <template #header>
        <span>读者信息</span>
      </template>

      <!-- 读者查询 -->
      <el-form inline>
        <el-form-item label="读者或读者证号">
          <el-input v-model="readerForm.keywords" placeholder="请输入关键字">
            <template #append>
              <el-button @click="handleSearchReader">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <!-- 基本信息 -->
      <div class="reader-info" v-if="readerInfo.id">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="姓名">小明</el-descriptions-item>
          <el-descriptions-item label="性别">男</el-descriptions-item>
          <el-descriptions-item label="手机号">18565422547</el-descriptions-item>
          <el-descriptions-item label="读者证号">454887878787888</el-descriptions-item>
          <el-descriptions-item label="读者证类型">普通</el-descriptions-item>
          <el-descriptions-item label="用户类型">
            <el-tag>普通读者</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag type="success">正常</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="可借数量">
            <el-tag type="info">8 / 10</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="借阅中">
            <el-tag type="success">2本</el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="已归还">
            <el-tag type="primary">1本</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="逾期">
            <el-tag type="danger">0本</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="赔偿">
            <el-tag type="warning">0本</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 最近借阅列表 -->
        <div class="reader-books">
          <h4>最近借阅图书</h4>
          <el-table size="small" empty-text="暂无数据">
            <el-table-column label="图书编号" />
            <el-table-column label="图书名称" />
            <el-table-column label="副本编号" />
            <el-table-column label="借阅日期" />
            <el-table-column label="应还日期" />
            <el-table-column label="借阅日期" />
            <el-table-column label="当前状态" />
          </el-table>
        </div>
      </div>

      <el-empty v-else description="没有查询到相关信息"></el-empty>
    </el-card>

    <!-- 借书卡片 -->
    <el-card class="borrow-card">
      <template #header>
        <span>选择借阅图书</span>
      </template>

      <!-- 借阅查询 -->
      <el-form inline :model="borrowForm">
        <el-form-item label="图书ISBN、条形码">
          <el-input v-model="borrowForm.barcode" placeholder="请扫描或者输入图书条码">
            <template #append>
              <el-button>
                <el-icon><Plus /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button>
            <el-icon><Search /></el-icon>浏览图书
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 待借阅图书列表 -->
      <el-table size="small" empty-text="暂无数据">
        <el-table-column label="序号" />
        <el-table-column label="ISBN" />
        <el-table-column label="图书名称" />
        <el-table-column label="作者" />
        <el-table-column label="出版社" />
        <el-table-column label="借阅天数" />
        <el-table-column label="操作" />
      </el-table>

      <div class="borrow-info">
        <el-row>
          <el-col>
            <el-form-item label="备注">
              <el-input v-model="borrowInfo.remark" placeholder="填写借书备注信息"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 借阅按钮 -->
    <el-card class="button-card">
      <el-row justify="center">
        <el-button size="large" type="primary">
          <el-icon><CircleCheck /></el-icon>&nbsp;确认借阅
        </el-button>
        <el-button size="large">
          <el-icon><Delete /></el-icon>&nbsp;清空列表
        </el-button>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

// 读者相关
// 读者信息查询表单
const readerForm = reactive({
  keywords: '',
})

// 读者详情
const readerInfo = ref({})

// 查询读者
const handleSearchReader = () => {
  readerInfo.value.id = 1
  ElMessage.error('功能开发中')
}

// 借阅图书相关
const borrowForm = reactive({
  barcode: '',
})
const borrowInfo = reactive({
  remark: '',
})
</script>

<style lang="scss" scoped>
.content-container {
  margin-top: 5px;
  // 卡片
  .reader-card,
  .borrow-card {
    margin-bottom: 15px;
  }
  // 读者
  .reader-info {
    margin-top: 10px;
  }
  .reader-books {
    margin-top: 20px;
    h4 {
      color: #666;
      margin-bottom: 10px;
    }
  }
  .borrow-info {
    margin-top: 20px;
  }
}
</style>
