<template>
  <div class="content-container">
    <el-card class="search-card" shadow="hover">
      <template #header> <span>图书查阅搜索</span> </template>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8">
          <el-input v-model="inputKeywords" placeholder="请输入搜索的图书标题、作者或者ISBN" prefix-icon="Search" clearable />
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-select v-model="searchForm.category" placeholder="请选择图书分类" clearable @change="handleCategoryChange">
            <el-option v-for="category in categoryData" :key="category.id" :label="category.name" :value="category.id"></el-option>
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-select v-model="searchForm.borrowStatus" placeholder="请选择图书状态" clearable @change="handleStatusChange">
            <el-option value="available" label="可借阅"></el-option>
            <el-option value="unavailable" label="已借完"></el-option>
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="4">
          <el-button type="default" icon="Refresh" @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="display-card">
      <template #header>
        <div class="card-header">
          <div>
            <span>图书展示</span>
          </div>

          <div>
            <el-radio-group size="small" v-model="viewModel">
              <el-radio-button value="card">卡片视图</el-radio-button>
              <el-radio-button value="list">列表视图</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="viewModel === 'card'" class="books-grid">
        <div v-if="tableData.length === 0">
          <!-- 无数据：展示 el-empty -->
          <el-empty description="未找到相关内容" :image-size="100">
            <!-- 可选：提供重试按钮或清空搜索建议 -->
            <el-button type="danger" @click="handleReset">清空搜索</el-button>
          </el-empty>
        </div>
        <div v-else v-for="book in tableData" :key="book.id" class="book-card" @click="handleView(book)">
          <div class="book-cover">
            <el-image v-if="book.cover" :src="book.cover" :title="book.description" :alt="book.title" fit="cover"></el-image>
            <div v-else>
              <el-icon size="30"><Picture /></el-icon><span>暂无封面</span>
            </div>
          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">{{ book.author }}</p>
            <p class="book-publisher">{{ book.publisher }}</p>
            <div class="book-meta">
              <el-tag size="small" effect="dark" style="border: none" :color="getCategoryColor(book.categoryId)">
                {{ book.categoryName }}
              </el-tag>
              <span class="book-price">￥{{ book.price.toFixed(2) }}</span>
            </div>
            <div class="book-status">
              <el-text size="small" :type="book.availableCopies > 0 ? 'success' : 'danger'">
                {{ book.availableCopies > 0 ? '可借阅' : '已借完' }}
              </el-text>
              <span class="copies-info">{{ book.availableCopies }} / {{ book.totalCopies }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 表格视图 -->
      <el-table v-else class="books-table" :data="tableData" stripe empty-text="暂无数据" @row-click="handleView" style="width: 100%">
        <el-table-column prop="id" label="编号" width="80" align="center" sortable />
        <el-table-column label="封面" width="200" align="center">
          <template #default="scope">
            <el-image
              v-if="scope.row.cover"
              :src="scope.row.cover"
              :preview-src-list="[scope.row.cover]"
              :preview-teleported="true"
              fit="cover"
              style="width: 40px; height: 50px"
            ></el-image>
            <div v-else style="font-size: 12px">
              <el-icon size="30"><Picture /></el-icon><br />
              <span>无封面</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="isbn" label="ISBN" width="180" align="center" show-overflow-tooltip />
        <el-table-column prop="title" label="书名" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" width="180" align="center" />
        <el-table-column prop="publisher" label="出版社" width="180" align="center" show-overflow-tooltip />
        <el-table-column label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small" effect="dark" :color="getCategoryColor(row.categoryId)" style="border: none">{{
              row.categoryName
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="150" align="center">
          <template #default="{ row }">
            <span>￥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="库存状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.availableCopies > 0 ? 'success' : 'danger'">{{ row.availableCopies > 0 ? '可借阅' : '已借完' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可借/总数" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.availableCopies > 0 ? 'success' : 'danger'">{{ row.availableCopies }}/{{ row.totalCopies }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status == 1 ? 'success' : 'danger'" size="small">{{ row.status == 1 ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" width="200" align="center" show-overflow-tooltip />
      </el-table>
    </el-card>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="detailDialog" title="图书详情">
      <div class="book-detail">
        <div class="detail-header">
          <div class="detail-cover">
            <el-image v-if="bookDetail.cover" :src="bookDetail.cover" fit="cover"></el-image>
            <div v-else class="detail-cover-error">
              <el-icon size="30"><Picture /></el-icon><span>暂无封面</span>
            </div>
          </div>
          <div class="detail-basic">
            <h3>{{ bookDetail.title }}</h3>
            <p>作者：{{ bookDetail.author }}</p>
            <p>出版社：{{ bookDetail.publisher }}</p>
            <p>出版日期：{{ bookDetail.publishDate }}</p>
            <p>分类：{{ bookDetail.categoryName }}</p>
            <p>ISBN：{{ bookDetail.isbn }}</p>
            <p>图书简介：{{ bookDetail.description || '暂无简介' }}</p>
          </div>
        </div>
        <el-divider />
        <el-descriptions :column="2" border>
          <el-descriptions-item label="价格">￥{{ bookDetail.price.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="总数量">{{ bookDetail.totalCopies }}</el-descriptions-item>
          <el-descriptions-item label="可借数量">
            <el-tag type="success">{{ bookDetail.availableCopies }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="已借数量">
            <el-tag type="warning">{{ bookDetail.borrowedCopies }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="损坏数量">
            <el-tag type="danger">{{ bookDetail.damagedCopies }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="图书状态">
            <el-tag :type="bookDetail.status == 1 ? 'success' : 'danger'" size="small">
              {{ bookDetail.status == 1 ? '上架' : '下架' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="图书位置" :span="2">{{ bookDetail.location || '暂无书架' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.pageNum"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; text-align: right"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { fetchCategories } from '@/api/book/category'
import { fetchDisplayPage } from '@/api/book/book'
import { useDebounce } from '@/hook/useDebounce'
// 路由+状态管理
const router = useRouter()
const store = useStore()

const inputKeywords = ref('')

// 搜索表单数据
const searchForm = reactive({
  keywords: '',
  category: '',
  borrowStatus: '',
})
// 展示模式： card或者table
const viewModel = ref('card')

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 12,
  total: 0,
})

// 图书详情
const bookDetail = ref({})
const detailDialog = ref(false) // 详情对话框显示和消失

// 分类数据
const categoryData = ref([])

// 获取分类获取颜色
const getCategoryColor = (categoryId) => {
  // 根据返回的分类数据，查找颜色
  const category = categoryData.value.find((item) => item.id === categoryId)
  return category?.color || '#409EFF'
}
// 获取防抖后的值，延时500ms
const keywords = useDebounce(inputKeywords, 500)

// 监听防抖值，查询数据
watch(keywords, (newVal) => {
  // 修改搜索表单关键字
  searchForm.keywords = newVal
  // 查询数据
  handleSearch()
})

const handleSearch = () => {
  pagination.pageNum = 1
  loadBooks()
}

// 重置
const handleReset = () => {
  if (inputKeywords.value) {
    inputKeywords.value = ''
  } else {
    handleSearch()
  }
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = ''
  })
}

// 选择图书分类
const handleCategoryChange = () => {
  pagination.pageNum = 1
  loadBooks()
}
// 选择图书状态
const handleStatusChange = () => {
  pagination.pageNum = 1
  loadBooks()
}

// 查看
const handleView = (row) => {
  bookDetail.value = row
  detailDialog.value = true
}

// 分页数量改变触发
const handleSizeChange = (value) => {
  pagination.pageNum = 1
  pagination.pageSize = value
  // console.log(pagination)
  loadBooks()
}
// 当前页码改变触发
const handleCurrentChange = (value) => {
  pagination.pageNum = value
  // console.log(pagination)
  loadBooks()
}

// 获取数据
const loadBooks = async () => {
  // 改为加载中
  loading.value = true
  // 请求后端接口，查询图书分页列表（合并查询参数）
  const queryParams = {
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
    ...searchForm,
  }

  fetchDisplayPage(queryParams)
    .then((res) => {
      tableData.value = res.data.list
      pagination.total = res.data.total
      loading.value = false
    })
    .catch((err) => console.log(err))
}

const loadCategories = () => {
  // 请求获取图书分类数据
  fetchCategories()
    .then((res) => {
      if (res.code === 200) {
        categoryData.value = res.data
      }
    })
    .catch((err) => console.log(err))
}

// 挂载完成加载初始数据
onMounted(() => {
  // // 加载初始化数据
  loadBooks()
  loadCategories()
})
</script>

<style lang="scss" scoped>
.content-container {
  margin-top: 5px;

  // 搜索条件卡片
  .search-card {
    margin-bottom: 15px;

    // 搜索表单
    .search-card-form {
      .el-input {
        --el-input-width: 220px;
      }
      .el-select {
        --el-select-width: 220px;
      }
    }
  }

  .display-card {
    margin-bottom: 15px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .el-pagination {
      margin-top: 15px;
      justify-content: flex-end;
    }
  }
}
.loading-container {
  padding: 20px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.book-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #409eff;
  }
}

.book-cover {
  text-align: center;
  color: #909399;
  height: 180px;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;

  .el-image,
  div {
    width: 100%;
    height: 100%;
  }

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
.book-info {
  margin-top: 15px;
  .book-title {
    color: #333;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .book-author {
    font-size: 14px;
    color: #666;
    margin: 0 0 5px 0;
  }

  .book-publisher {
    font-size: 12px;
    color: #999;
    margin: 0 0 10px 0;
  }

  .book-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .book-price {
      font-size: 14px;
      font-weight: 600;
      color: #f56c6c;
    }
  }

  .book-status {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .copies-info {
      font-size: 12px;
      color: #999;
    }
  }
}
/* 图书详情样式 */
.book-detail {
  padding: 10px 0px;
  .detail-header {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }

  .detail-cover {
    width: 160px;
    height: 220px;

    .el-image {
      width: 100%;
      height: 100%;
    }

    .detail-cover-error {
      width: 100%;
      height: 100%;
      color: #909399;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px solid #999;
    }
  }

  .detail-basic {
    display: flex;
    flex-direction: column;
    justify-content: start;
    gap: 10px;

    h3 {
      font-size: 22px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 15px 0;
      line-height: 1.4;
    }

    p {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
