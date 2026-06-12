<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addBook, deleteBatchBook, deleteBook, fetchBookPage, updateBook } from '@/api/book/book'
import { fetchCategories } from '@/api/book/category'
// 路由+状态管理
const store = useStore()
const router = useRouter()

// 搜索表单数据
const searchForm = reactive({
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  category: '',
  status: '',
})
// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 分类数据
const categoryData = ref([])

// 获取分类名称
const getCategoryColor = (categoryId) => {
  // 根据返回的分类数据，查找颜色
  const category = categoryData.value.find((item) => item.id === categoryId)
  return category?.color || '#409EFF'
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  loadData()
}
// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = ''
  })
  // 重新搜索
  handleSearch()
}

// 图书详情
const bookDetail = ref({})
const detailDialog = ref(false) // 详情对话框显示和消失

// 查看
const handleView = (row) => {
  bookDetail.value = row
  detailDialog.value = true
}

// 新增/修改弹窗
const dialogVisible = ref(false) // 对话框显示和隐藏
const dialogTitle = ref('') // 对话框标题
const isEdit = ref(false) // 修改标识 -true表示编辑 -false表示新增

// 新增/修改表单
const bookFormRef = ref() // 表单引用
// 初始化对象
const initBookForm = {
  cover: '',
  isbn: '',
  title: '',
  author: '',
  publisher: '',
  publishDate: '',
  categoryId: '',
  status: 1,
  price: 0,
  totalCopies: 0,
  availableCopies: 0,
  borrowedCopies: 0,
  damagedCopies: 0,
  location: '',
  description: '',
}
// 图书表单
const bookForm = reactive({ ...initBookForm })
// 图片封面上传的地址
const uploadUrl = 'http://localhost:8080/api/book/uploadCover'
// 新增修改表单校验规则
const rules = reactive({
  isbn: { required: true, message: '请输入ISBN编码', trigger: 'blur' },
  title: { required: true, message: '请输入图书名称', trigger: 'blur' },
  author: { required: true, message: '请输入作者', trigger: 'blur' },
  publisher: { required: true, message: '请输入出版社', trigger: 'blur' },
  categoryId: { required: true, message: '请选择分类', trigger: 'blur' },
  price: { required: true, message: '请输入价格', trigger: 'blur' },
  totalCopies: { required: true, message: '请输入副本数量', trigger: 'blur' },
})

// 新增
const handleAdd = () => {
  dialogVisible.value = true
  dialogTitle.value = '新增图书'
  // 等待DOM更新完毕，确保表单已经挂载
  isEdit.value = false
  nextTick(() => {
    // 清除之前的错误校验提示
    bookFormRef.value?.clearValidate()
    // 重置内部初始化
    bookFormRef.value.resetFields()
    // 初始化新增表单数据，保持响应式
    Object.assign(bookForm, initBookForm)
  })
}
// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除这${selectedRows.value.length}本书吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 执行确定
      // 获取所有选中记录的图书id
      const ids = selectedRows.value.map((item) => item.id)
      deleteBatchBook(ids)
        .then((res) => {
          ElMessage.success('批量删除成功')
          selectedRows.value = []
          loadData()
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}
// 编辑
const handleEdit = (row) => {
  dialogVisible.value = true
  dialogTitle.value = '编辑图书'
  isEdit.value = true
  nextTick(() => {
    Object.assign(bookForm, row)
  })
}
// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除《${row.title}》这本书吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteBook(`${row.id}`)
        .then((res) => {
          ElMessage.success('删除成功')
          loadData()
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

// 提交保存
const handleSave = async () => {
  await bookFormRef.value.validate()
  // 更新
  if (isEdit.value === true) {
    updateBook(bookForm)
      .then((res) => {
        if (res.code === 200) {
          dialogVisible.value = false
          ElMessage.success('更新图书成功！')
        }
      })
      .catch((err) => console.log(err))
    loadData()
    // 新增
  } else {
    addBook(bookForm)
      .then((res) => {
        if (res.code === 200) {
          dialogVisible.value = false
          ElMessage.success('新增图书成功！')
        }
      })
      .catch((err) => console.log(err))
    loadData()
  }
  loadData()
}
// 分页数量改变触发
const handleSizeChange = (value) => {
  pagination.pageNum = 1
  pagination.pageSize = value
  // console.log(pagination)
  loadData()
}
// 当前页码改变触发
const handleCurrentChange = (value) => {
  pagination.pageNum = value
  // console.log(pagination)
  loadData()
}
// 勾选数量发生变化
const handleSelectionChange = (selections) => {
  selectedRows.value = selections
}
// 上传封面校验
const handleBeforeUpload = (file) => {
  // 校验格式：是否是图片
  const isImage = file.type.startsWith('image/')

  if (!isImage) {
    ElMessage.error('只能上传图片格式文件')
    return false
  }

  // 校验大小
  const isLimit1M = file.size / 1024 / 1024 < 1
  // 校验大小： 是否小于1M
  if (!isLimit1M) {
    ElMessage.error('上传图片大小不能超过1MB！')
    return false
  }
  return true
}
// 上传成功处理
const handleUploadCover = (res) => {
  if (res.code === 200) {
    // 显示上传封面
    bookForm.cover = res.data
    ElMessage.success('封面上传成功！')
  } else {
    ElMessage.error(res.msg || '封面上传失败！')
  }
}
// 副本数量改变事件
// TODO
const handleTotalCopiesChange = (value) => {
  if (value && bookForm.availableCopies > value) {
    bookForm.availableCopies = value
  }
}
// 获取数据
const loadData = async () => {
  // 改为加载中
  loading.value = true
  // 请求后端接口，查询图书分页列表（合并查询参数）
  const queryParams = {
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
    ...searchForm,
  }
  // console.log(queryParams)
  // 请求获取图书分页数据
  await fetchBookPage(queryParams)
    .then((res) => {
      if (res.code === 200) {
        // 填充列表数据
        tableData.value = res.data.list
        pagination.total = res.data.total
        loading.value = false
      }
    })
    .catch((err) => ElMessage.error(err))

  // 取消加载
  loading.value = false
}
const loadCategories = async () => {
  // 请求获取图书分类数据
  await fetchCategories()
    .then((res) => {
      if (res.code === 200) {
        categoryData.value = res.data
      }
    })
    .catch((err) => console.log(err))
}

// 挂载完成加载初始数据
onMounted(() => {
  // 加载初始化数据
  loadData()
  loadCategories()
})
</script>

<template>
  <div class="main-container">
    <!-- 搜索条件 -->
    <el-card class="search-card" shadow="hover">
      <template #header>
        <span>图书筛选</span>
      </template>
      <el-form :model="searchForm" inline class="search-card-form">
        <el-form-item label="书名">
          <el-input v-model="searchForm.title" placeholder="请输入图书名称" @keyup.enter="handleSearch" clearable></el-input>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="searchForm.author" placeholder="请输入作者" @keyup.enter="handleSearch" clearable></el-input>
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="searchForm.isbn" placeholder="请输入ISBN号" @keyup.enter="handleSearch" clearable></el-input>
        </el-form-item>
        <el-form-item label="出版社">
          <el-input v-model="searchForm.publisher" placeholder="请输入出版社" @keyup.enter="handleSearch" clearable></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择图书分类" clearable>
            <el-option v-for="category in categoryData" :key="category.id" :label="category.name" :value="category.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="上架" value="1"></el-option>
            <el-option label="下架" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /> </el-icon>
            &nbsp;搜索
          </el-button>
          <el-button type="info" @click="handleReset">
            <el-icon><Refresh /></el-icon>
            &nbsp;重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图书列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div>
            <span>图书列表</span>
            <el-tag v-if="selectedRows.length > 0" type="danger" size="small" style="margin-left: 10px">
              已勾选 {{ selectedRows.length }} 条
            </el-tag>
          </div>
          <div>
            <el-button type="primary" @click="handleAdd">
              <el-icon> <Plus /> </el-icon>
              &nbsp;新增图书
            </el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
              <el-icon> <Delete /> </el-icon>
              &nbsp;删除图书
            </el-button>
          </div>
        </div>
      </template>

      <!-- 加载表格数据 -->
      <el-table
        :data="tableData"
        stripe
        v-loading="loading"
        empty-text="暂无数据"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="编号" width="80" align="center" sortable />
        <el-table-column label="封面" width="150" align="center">
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
        <el-table-column prop="price" label="价格" width="150" align="center" sortable>
          <template #default="{ row }">
            <span>￥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalCopies" label="总数量" width="100" align="center" sortable>
          <template #default="{ row }">
            <el-tag type="primary"> {{ row.totalCopies }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="availableCopies" label="可借数" width="100" align="center" sortable>
          <template #default="{ row }">
            <el-tag type="success">{{ row.availableCopies }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="borrowedCopies" label="已借数" width="100" align="center" sortable>
          <template #default="{ row }">
            <el-tag type="warning">{{ row.borrowedCopies }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="damagedCopies" label="损坏数" width="100" align="center" sortable>
          <template #default="{ row }">
            <el-tag type="danger">{{ row.damagedCopies }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status == 1 ? 'success' : 'danger'" size="small">{{ row.status == 1 ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" width="200" align="center" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="220" align="center">
          <template #default="scope">
            <el-button type="success" link icon="Document" @click="handleView(scope.row)">查看</el-button>
            <el-button type="primary" link icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="detailDialog" title="图书详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="封面" :span="2">
          <!-- TODO -->
          <img :src="bookDetail.cover" style="max-height: 300px" />
        </el-descriptions-item>
        <el-descriptions-item label="ISBN">{{ bookDetail.isbn }}</el-descriptions-item>
        <el-descriptions-item label="图书名称">{{ bookDetail.title }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ bookDetail.author }}</el-descriptions-item>
        <el-descriptions-item label="出版社">{{ bookDetail.publisher }}</el-descriptions-item>
        <el-descriptions-item label="出版日期">{{ bookDetail.publishDate }}</el-descriptions-item>
        <el-descriptions-item label="分类">
          <el-tag size="small" effect="dark" :color="getCategoryColor(bookDetail.categoryId)" style="border: none">{{
            bookDetail.categoryName
          }}</el-tag>
        </el-descriptions-item>
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
          <el-tag :type="bookDetail.status == 1 ? 'success' : 'danger'" size="small">{{ bookDetail.status == 1 ? '上架' : '下架' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="图书位置" :span="2">{{ bookDetail.location || '暂无书架' }}</el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ bookDetail.description || '暂无描述' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <!-- 新增/修改弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px" destroy-on-close>
      <el-form ref="bookFormRef" :model="bookForm" :rules="rules" label-width="auto">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="图书封面">
              <el-upload
                class="cover-uploader"
                drag
                :action="uploadUrl"
                :headers="{ 'Auth-Token': $store.state.token || '' }"
                :show-file-list="false"
                :before-upload="handleBeforeUpload"
                :on-success="handleUploadCover"
              >
                <div v-if="bookForm.cover" class="cover-preview">
                  <img :src="bookForm.cover" class="cover-image" />
                  <div class="cover-mask">点击或者拖拽图片更换头像</div>
                </div>
                <div v-else class="upload-placeholder">
                  <el-icon class="upload-icon"><upload-filled /></el-icon>
                  <div class="upload-text">拖拽图片到此处 或者 <em>点击上传</em></div>
                </div>
                <template #tip>
                  <div class="el-upload__tip">支持JPG、PNG等图片格式，大小不超过1MB</div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="ISBN" prop="isbn">
              <el-input v-model="bookForm.isbn" placeholder="请输入ISBN号"> </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="书名" prop="title">
              <el-input v-model="bookForm.title" placeholder="请输入图书名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input v-model="bookForm.author" placeholder="请输入作者"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出版社" prop="publisher">
              <el-input v-model="bookForm.publisher" placeholder="请输入出版社"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出版日期" prop="publishDate">
              <el-date-picker
                v-model="bookForm.publishDate"
                type="date"
                placeholder="请输入出版日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="bookForm.status" placeholder="请选择状态" clearable>
                <el-option label="上架" :value="1"></el-option>
                <el-option label="下架" :value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId">
              <el-select label="分类" v-model="bookForm.categoryId" placeholder="请输入图书分类">
                <el-option v-for="category in categoryData" :key="category.id" :label="category.name" :value="category.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number
                v-model="bookForm.price"
                placeholder="请输入价格"
                :min="0"
                :precision="2"
                style="width: 100%"
              ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="总副本数量" prop="totalCopies">
              <el-input-number
                v-model="bookForm.totalCopies"
                placeholder="请输入总副本数量"
                :min="1"
                @change="handleTotalCopiesChange"
                style="width: 100%"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可借副本数量" prop="availableCopies">
              <el-input-number
                v-model="bookForm.availableCopies"
                placeholder="请输入可借副本数量"
                :min="0"
                :max="bookForm.totalCopies || 999"
                style="width: 100%"
              ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="已借副本数量" prop="borrowedCopies">
              <el-input-number v-model="bookForm.borrowedCopies" :min="0" disabled style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="损坏副本数量" prop="damagedCopies">
              <el-input-number v-model="bookForm.damagedCopies" :min="0" disabled style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="图书所在位置" prop="location">
          <el-input v-model="bookForm.location" :min="0" style="width: 100%" placeholder="请输入图书存放书架位置，例：A区"></el-input>
        </el-form-item>

        <el-form-item label="图书简介" prop="description">
          <el-input type="textarea" v-model="bookForm.description" :row="3" placeholder="请输入图书简介" :min="0" :precision="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button type="info" @click="dialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  margin-top: 5px;
  .search-card {
    margin-bottom: 15px;
    .search-card-form {
      .el-input,
      .el-select {
        width: 220px;
      }
    }
  }
  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .el-pagination {
      margin-top: 15px;
      justify-content: flex-end;
    }
  }
}
/* 封面上传样式 - 支持拖拽，参考官网 */
.cover-uploader {
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  :deep(.el-upload:hover) {
    border-color: var(--el-color-primary);
  }

  // 拖拽模式（即设置 drag 属性为 true）时，内部生成的核心容器类名
  :deep(.el-upload-dragger) {
    padding: 0;
    width: 100%;
    height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #d9d9d9;
    border-radius: 6px;
    transition: all 0.3s;
  }
}

/* 上传样式 */
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.upload-icon {
  font-size: 48px;
  width: 350px;
  color: #c0c0c0;
  margin-bottom: 15px;
}

.upload-text {
  p {
    font-size: 14px;
    color: #606266;
  }
  em {
    color: #409eff;
    font-style: normal;
  }
}

/* 封面预览 */
.cover-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover .cover-mask {
    opacity: 1;
  }
}

.cover-image {
  max-width: 100%;
  max-height: 350px;
  display: block;
}

.cover-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  font-size: 14px;
}
</style>
