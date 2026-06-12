<template>
  <div class="content-container">
    <el-card class="search-card" shadow="hover">
      <template #header> <span>读者证类型筛选</span> </template>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8">
          <el-input v-model="searchForm.name" placeholder="请输入读者证名称" prefix-icon="Search" clearable />
        </el-col>
        <el-col :xs="24" :sm="4">
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button type="default" icon="Refresh" @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="display-card">
      <template #header>
        <div class="card-header">
          <div>
            <span>图书分类列表</span>
            <el-tag type="info" size="small" style="margin-left: 10px">{{ `共${pagination.total}条记录` }} </el-tag>
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

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange" empty-text="暂无数据">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="类型名称" width="120" />
        <el-table-column prop="maxBooks" label="最大借阅数量" width="120" show-overflow-tooltip />
        <el-table-column prop="maxDays" label="最大借阅天数" width="120" />
        <el-table-column prop="renewCount" label="续借次数" width="120" />
        <el-table-column prop="renewDays" label="续借天数" width="120" />
        <el-table-column prop="overdueFee" label="超期费用" width="120" />
        <el-table-column prop="depositAmount" label="押金" width="120" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === 1 ? 'success' : 'danger'">
              <span>{{ row.status === 1 ? '启用' : '禁用' }}</span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="120" show-overflow-tooltip></el-table-column>

        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)" icon="Edit" style="margin-left: 0">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)" icon="Delete" style="margin-left: 0">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/修改弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" destroy-on-close label-width="auto">
      <el-form ref="cardFormRef" :model="cardForm" :rules="rules" label-width="auto">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="类型名称" prop="name">
              <el-input v-model="cardForm.name" placeholder="请输入类型名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大借阅数量" prop="maxBooks">
              <el-input-number v-model="cardForm.maxBooks" :min="1" :max="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大借阅天数" prop="maxDays">
              <el-input-number v-model="cardForm.maxDays" :min="1" :max="365" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="续借次数" prop="renewCount">
              <el-input-number v-model="cardForm.renewCount" :min="1" :max="5" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="续借天数" prop="renewDays">
              <el-input-number v-model="cardForm.renewDays" :min="1" :max="365" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="逾期费用" prop="overdueFee">
              <el-input-number v-model="cardForm.overdueFee" :min="1" :max="1000" :precision="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="押金" prop="depositAmount">
              <el-input-number v-model="cardForm.depositAmount" :min="1" :max="10000" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="类型描述" prop="description">
              <el-input
                v-model="cardForm.description"
                type="textarea"
                :rows="4"
                maxlength="200"
                placeholder="请输入读者证类型描述"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="类型状态" prop="status">
              <el-radio-group v-model="cardForm.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button type="info" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addCardType, deleteBatchCardType, deleteCardType, fetchCardTypePage, updateCardType } from '@/api/card/type'
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
const initCardType = {
  id: '',
  name: '',
  maxBooks: 0,
  maxDays: 0,
  renewCount: 0,
  renewDays: 0,
  overdueFee: 0.0,
  depositAmount: 0,
  status: 1,
  description: '',
}
const cardFormRef = ref() // 表单引用
const cardForm = reactive({ ...initCardType })

// 新增修改表单校验规则
const rules = reactive({
  name: { required: true, message: '请输入类型名称', trigger: 'blur' },
  maxBooks: { required: true, message: '请输入最大借阅数量', trigger: 'blur' },
  maxDays: { required: true, message: '请输入最大借阅天数', trigger: 'blur' },
  renewCount: { required: true, message: '请输入续借次数', trigger: 'blur' },
  renewDays: { required: true, message: '请输入续借天数', trigger: 'blur' },
  overdueFee: { required: true, message: '', trigger: 'blur' },
  depositAmount: { required: true, message: '请输入超期费用', trigger: 'blur' },
  description: { required: true, message: '请输入描述', trigger: 'blur' },
})

const handleAdd = () => {
  dialogTitle.value = '新增图书分类'
  dialogVisible.value = true
  // 等待DOM更新完毕，确保表单已经挂载
  isEdit.value = false
  nextTick(() => {
    // 初始化新增表单数据，保持响应式
    Object.assign(cardForm, initCardType)
    // 清除之前的错误校验提示
    cardFormRef.value?.clearValidate()
  })
}
const handleEdit = (row) => {
  dialogVisible.value = true
  dialogTitle.value = '编辑图书分类'
  isEdit.value = true
  nextTick(() => {
    Object.assign(cardForm, row)
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除${row.name}这类读者证吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteCardType(`${row.id}`)
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
      deleteBatchCardType(ids)
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
    await cardFormRef.value.validate()
    // 更新
    if (isEdit.value) {
      updateCardType(cardForm).then((res) => {
        if (res.code === 200) {
          dialogVisible.value = false
          ElMessage.success('更新成功！')
          loadData()
        }
      })
      // 新增
    } else {
      addCardType(cardForm).then((res) => {
        if (res.code === 200) {
          dialogVisible.value = false
          ElMessage.success('新增读者证成功！')
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
  fetchCardTypePage(queryParams)
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

<style scoped>
.search-card {
  margin-bottom: 20px;
}

.display-card {
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
