<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// 路由+状态管理
const store = useStore()
const router = useRouter()

// 搜索表单数据
const searchForm = reactive({
  bookName: '',
  author: '',
  isbn: '',
  publisher: '',
  categoryId: '',
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
// 获取分类名称
const getCategory = (category) => {
  const categories = {
    1: '计算机',
    2: '经济',
    3: '文学',
  }
  return categories[category] || category
}
// 获取状态类型和文字
const statusMap = {
  1: {
    text: '可借阅',
    type: 'success',
  },
  2: {
    text: '已借出',
    type: 'danger',
  },
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
const isEdit = ref(false) // 修改标识 -true表示编辑 -false表示表示心怎

// 新增/修改表单
const bookFormRef = ref() // 表单引用
// 初始化对象
const initBookForm = {
  isbn: '',
  bookName: '',
  author: '',
  publisher: '',
  publishDate: '',
  category: '',
  price: 0,
  totalCopies: 1,
  description: '',
}
// 图书表单
const bookForm = reactive({ ...initBookForm })

// 新增修改表单校验规则
const rules = reactive({
  isbn: { required: true, message: '请输入ISBN编码', trigger: 'blur' },
  bookName: { required: true, message: '请输入图书名称', trigger: 'blur' },
  author: { required: true, message: '请输入作者', trigger: 'blur' },
  publisher: { required: true, message: '请输入出版社', trigger: 'blur' },
  category: { required: true, message: '请选择分类', trigger: 'blur' },
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
// 删除
const handleBatchDelete = () => {
  ElMessage.info('功能开发中')
  console.log(selectedRows.value)
}
// 导入
const handleImport = () => {
  ElMessage.info('功能开发中')
}
// 导出
const handleExport = () => {
  ElMessage.info('功能开发中')
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
  ElMessageBox.confirm(`确定要删除《${row.bookName}》这本书吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('删除成功')
    })
    .catch((err) => console.log(err))
}

// 提交保存
const handleSave = async () => {
  await bookFormRef.value.validate()
  ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
  dialogVisible.value = false
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
// 获取数据
const loadData = () => {
  // 改为加载中
  loading.value = true
  // 模拟数据
  setTimeout(() => {
    tableData.value = [
      {
        id: 1,
        isbn: '9787111544265',
        bookName: '深入理解计算机系统',
        author: 'Randal E.Bryant',
        publisher: '机械工业出版社',
        publishDate: '2016-11-01',
        category: 1,
        price: 139.0,
        totalCopies: 10,
        availableCopies: 3,
        status: 1,
        description: '本书从程序员的视角详细阐述计算机系统的本质概念',
      },
      {
        id: 2,
        isbn: '9787115546081',
        bookName: 'JavaScript高级程序设计（第4版）',
        author: 'Matt Frisbie',
        publisher: '人民邮电出版社',
        publishDate: '2020-09-01',
        category: 1,
        price: 129.0,
        totalCopies: 8,
        availableCopies: 0,
        status: 2,
        description: 'JavaScript经典教程，前端开发必读',
      },
      {
        id: 3,
        isbn: '9787111407010',
        bookName: '算法导论',
        author: 'Thomas H.Cormen',
        publisher: '机械工业出版社',
        publishDate: '2013-01-01',
        category: 2,
        price: 128.0,
        totalCopies: 5,
        availableCopies: 2,
        status: 1,
        description: '算法领域的经典教材',
      },
      {
        id: 4,
        isbn: '9787020002207',
        bookName: '红楼梦',
        author: '曹雪芹',
        publisher: '人民文学出版社',
        publishDate: '2018-01-01',
        category: 3,
        price: 59.0,
        totalCopies: 15,
        availableCopies: 8,
        status: 1,
        description: '中国古典四大名著之一',
      },
      {
        id: 5,
        isbn: '9787544291163',
        bookName: '百年孤独',
        author: '加西亚·马尔克斯',
        publisher: '南海出版公司',
        publishDate: '2017-08-01',
        category: 3,
        price: 55.0,
        totalCopies: 6,
        availableCopies: 1,
        status: 1,
        description: '魔幻现实主义文学代表作',
      },
    ]
    pagination.total = 50
    loading.value = false
  }, 1000)
}
// 挂载完成加载初始数据
onMounted(() => {
  // 加载初始化数据
  loadData()
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
          <el-input v-model="searchForm.bookName" placeholder="请输入图书名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="searchForm.author" placeholder="请输入作者" clearable></el-input>
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="searchForm.isbn" placeholder="请输入ISBN号" clearable></el-input>
        </el-form-item>
        <el-form-item label="出版社">
          <el-input v-model="searchForm.publisher" placeholder="请输入出版社" clearable></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.categoryId" placeholder="请选择图书分类" clearable>
            <el-option label="计算机" value="1"></el-option>
            <el-option label="经济" value="2"></el-option>
            <el-option label="文学" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="可借" value="1"></el-option>
            <el-option label="已借出" value="2"></el-option>
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
            <el-button type="danger" @click="handleBatchDelete">
              <el-icon> <Delete /> </el-icon>
              &nbsp;删除图书
            </el-button>
            <el-button type="success" @click="handleImport">
              <el-icon> <Download /> </el-icon>
              &nbsp;导入数据
            </el-button>
            <el-button type="info" @click="handleExport">
              <el-icon> <Upload /> </el-icon>
              &nbsp;导出数据
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
        <el-table-column type="selection" width="55" />
        <el-table-column prop="isbn" label="ISBN" width="180" show-overflow-tooltip />
        <el-table-column prop="bookName" label="书名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" width="180" />
        <el-table-column prop="publisher" label="出版社" width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="180">
          <template #default="{ row }">
            <el-tag>{{ getCategory(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="180">
          <template #default="{ row }">
            <span>￥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalCopies" label="总数量" width="180" />
        <el-table-column prop="availableCopies" label="可借数量" width="180">
          <template #default="{ row }">
            <el-tag :type="row.availableCopies > 0 ? 'success' : 'danger'">{{ row.availableCopies }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="180">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status].type || 'info'">{{ statusMap[row.status].text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" width="200" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="220">
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
        <el-descriptions-item label="ISBN">{{ bookDetail.isbn }}</el-descriptions-item>
        <el-descriptions-item label="图书名称">{{ bookDetail.bookName }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ bookDetail.author }}</el-descriptions-item>
        <el-descriptions-item label="出版社">{{ bookDetail.publisher }}</el-descriptions-item>
        <el-descriptions-item label="出版日期">{{ bookDetail.publishDate }}</el-descriptions-item>
        <el-descriptions-item label="分类">
          <el-tag>{{ getCategory(bookDetail.category) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="价格">￥{{ bookDetail.price }}</el-descriptions-item>
        <el-descriptions-item label="总数量">{{ bookDetail.totalCopies }}</el-descriptions-item>
        <el-descriptions-item label="可借数量">
          <el-tag :type="bookDetail.availableCopies > 0 ? 'success' : 'danger'">{{ bookDetail.availableCopies }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusMap[bookDetail.status].type || 'info'">{{ statusMap[bookDetail.status].text }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述">{{ bookDetail.description }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <!-- 新增/修改弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="bookFormRef" :model="bookForm" :rules="rules" label-width="auto">
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="bookForm.isbn" placeholder="请输入ISBN号"></el-input>
        </el-form-item>
        <el-form-item label="书名" prop="bookName">
          <el-input v-model="bookForm.bookName" placeholder="请输入图书名称"></el-input>
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="bookForm.author" placeholder="请输入作者"></el-input>
        </el-form-item>
        <el-form-item label="出版社" prop="publisher">
          <el-input v-model="bookForm.publisher" placeholder="请输入出版社"></el-input>
        </el-form-item>
        <el-form-item label="出版日期" prop="publishDate">
          <el-date-picker
            v-model="bookForm.publishDate"
            type="date"
            placeholder="请输入出版日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select label="分类" v-model="bookForm.category" placeholder="请输入图书分类">
            <el-option label="计算机" value="1" />
            <el-option label="经济" value="2" />
            <el-option label="文学" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="bookForm.price" placeholder="请输入价格" :min="0" :precision="2"></el-input-number>
        </el-form-item>
        <el-form-item label="副本数量" prop="totalCopies">
          <el-input-number v-model="bookForm.totalCopies" placeholder="请输入副本数量" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="图书简介" prop="description">
          <el-input type="textarea" v-model="bookForm.description" :row="3" placeholder="请输入图书简介" :min="0" :precision="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="info" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
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
</style>
