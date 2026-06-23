<script setup>
import { addCategory, deleteBatchCategory, deleteCategory, fetchCategories, fetchCategoryPage, updateCategory } from '@/api/book/category'
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const loading = ref(false)
// 图书分类表格数据
const tableData = ref([])
const selectedRows = ref([])
// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 搜索表单数据
const searchForm = reactive({
  name: '',
  code: '',
})
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

// 新增/修改弹窗
const dialogVisible = ref(false) // 对话框显示和隐藏
const dialogTitle = ref('') // 对话框标题
const isEdit = ref(false) // 修改标识 -true表示编辑 -false表示新增

// 初始化对象
const initCategoryForm = {
  id: '',
  name: '',
  color: '#409EFF',
  code: '',
  sortOrder: 0,
  parentId: 0,
  description: '',
}
const categoryFormRef = ref() // 表单引用
const categoryForm = reactive({ ...initCategoryForm })

// 新增修改表单校验规则
const rules = reactive({
  name: { required: true, message: '请输入分类名称', trigger: 'blur' },
  code: { required: true, message: '请输入分类编码', trigger: 'blur' },
  sortOrder: { required: true, message: '请输入排序序号', trigger: 'blur' },
  description: { required: true, message: '请输入描述', trigger: 'blur' },
})

const handleAdd = () => {
  dialogTitle.value = '新增图书分类'
  dialogVisible.value = true
  // 等待DOM更新完毕，确保表单已经挂载
  isEdit.value = false
  nextTick(() => {
    // 初始化新增表单数据，保持响应式
    Object.assign(categoryForm, initCategoryForm)
    // 清除之前的错误校验提示
    categoryFormRef.value?.clearValidate()
  })
}
const handleEdit = (row) => {
  dialogVisible.value = true
  dialogTitle.value = '编辑图书分类'
  isEdit.value = true
  nextTick(() => {
    Object.assign(categoryForm, row)
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除“${row.name}”这个分类吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteCategory(`${row.id}`)
        .then((res) => {
          ElMessage.success('删除成功')
          loadData()
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除这些分类吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 执行确定
      // 获取所有选中记录的图书id
      const ids = selectedRows.value.map((item) => item.id)
      deleteBatchCategory(ids)
        .then((res) => {
          ElMessage.success('批量删除成功')
          selectedRows.value = []
          loadData()
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

const handleSave = async () => {
  try {
    await categoryFormRef.value.validate()
    // 更新
    if (isEdit.value) {
      updateCategory(categoryForm).then((res) => {
        if (res.code === 200) {
          dialogVisible.value = false
          ElMessage.success('更新图书成功！')
          loadData()
        }
      })
      // 新增
    } else {
      addCategory(categoryForm).then((res) => {
        if (res.code === 200) {
          dialogVisible.value = false
          ElMessage.success('新增图书分类成功！')
          loadData()
        }
      })
    }
    loadData()
  } catch (err) {
    console.log(err)
  }
}
const handleSelectionChange = (selections) => {
  selectedRows.value = selections
}

const handleSizeChange = (value) => {
  pagination.pageNum = 1
  pagination.pageSize = value
  loadData()
}

const handleCurrentChange = (value) => {
  pagination.pageNum = value
  loadData()
}

// 获取分类表格数据
const loadData = async () => {
  loading.value = true

  const queryParams = {
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
    ...searchForm,
  }
  // 请求分页条件查询
  fetchCategoryPage(queryParams)
    .then((res) => {
      if (res.code === 200) {
        tableData.value = res.data.list
        pagination.total = res.data.total
        loading.value = false
      }
    })
    .catch((err) => console.log(err))
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="main-container">
    <!-- 搜索条件区域 -->
    <el-card class="search-card" shadow="hover">
      <template #header>
        <span>图书分类筛选</span>
      </template>

      <el-form :model="searchForm" inline class="search-card-form">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入分类名称" @keyup.enter="handleSearch" clearable />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="searchForm.code" placeholder="请输入分类编码" @keyup.enter="handleSearch" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            &nbsp;搜索
          </el-button>
          <el-button type="info" @click="handleReset">
            <el-icon><Refresh /></el-icon>
            &nbsp;重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据展示区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div>
            <span>图书分类列表</span>
            <el-tag type="info" size="small" style="margin-left: 10px">{{ `共${pagination.total}条记录` }} </el-tag>
          </div>
          <div>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              &nbsp;新增图书分类
            </el-button>
            <el-button :disabled="selectedRows.length === 0" type="danger" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              &nbsp;批量删除
            </el-button>
            <el-button type="info">
              <el-icon><Upload /></el-icon>
              &nbsp;批量导入
            </el-button>
            <el-button type="success">
              <el-icon><Download /></el-icon>
              &nbsp;批量导出
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
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="分类名称" width="80" align="center" />
        <el-table-column prop="color" label="分类颜色" width="100" align="center">
          <template #default="{ row }">
            <el-tag effect="dark" :color="row.color" style="border: none">{{ row.color }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="分类编码" width="100" align="center" />
        <el-table-column prop="description" label="描述" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序序号" width="100" align="center" />
        <el-table-column prop="parentId" label="父级编号" width="100" align="center"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200" align="center" />
        <el-table-column prop="updateTime" label="更新时间" width="200" align="center" />
        <el-table-column label="操作" fixed="right" width="300" align="center">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
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

    <!-- 新增修改弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px" destroy-on-close>
      <el-form ref="categoryFormRef" :model="categoryForm" :rules="rules" label-width="auto">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="分类颜色" prop="color" line>
          <el-color-picker v-model="categoryForm.color" color-format="hex"></el-color-picker>
          <p>{{ categoryForm.color.toUpperCase() }}</p>
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="categoryForm.code" placeholder="请输入分类编码" />
        </el-form-item>
        <el-form-item label="排序序号" prop="sortOrder">
          <el-input v-model="categoryForm.sortOrder" placeholder="请输入排序序号" />
        </el-form-item>
        <el-form-item label="父级编号" prop="parentId">
          <el-input v-model="categoryForm.parentId" placeholder="请输入父级编号" disabled />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input v-model="categoryForm.description" type="textarea" :row="3" placeholder="请输入描述" />
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
.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
  .card-header {
    display: flex;
    justify-content: space-between;
  }
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
