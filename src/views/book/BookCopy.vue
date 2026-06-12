<template>
  <div class="content-container">
    <!-- 搜索条件 -->
    <el-card class="search-card" shadow="hover">
      <template #header><span>图书副本筛选</span></template>
      <el-form :inline="true" class="search-card-form">
        <el-form-item label="图书名称">
          <el-input v-model="searchForm.bookTitle" placeholder="请输入图书名称" clearable @clear="loadData" @keyup.enter="handleSearch" />
        </el-form-item>

        <el-form-item label="副本编号">
          <el-input v-model="searchForm.copyNo" placeholder="请输入副本编号" clearable @keyup.enter="handleSearch" />
        </el-form-item>

        <el-form-item label="条形码">
          <el-input v-model="searchForm.barcode" placeholder="请输入条形码" clearable @keyup.enter="handleSearch" />
        </el-form-item>

        <el-form-item label="图书状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="可借阅" value="1" />
            <el-option label="已借出" value="2" />
            <el-option label="已损坏" value="3" />
            <el-option label="已丢失" value="4" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="Search"> 查询 </el-button>
          <el-button type="default" @click="handleReset" icon="Refresh"> 重置 </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图书列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div>
            <span>图书副本列表</span>
            <el-tag v-if="selectedRows.length > 0" type="danger" size="small" style="margin-left: 10px">
              已勾选 {{ selectedRows.length }} 条
            </el-tag>
          </div>

          <div>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增副本
            </el-button>
          </div>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="副本ID" width="80" align="center" />
        <el-table-column prop="bookId" label="图书编号" width="80" align="center" />
        <el-table-column prop="bookTitle" label="图书名称" min-width="180" show-overflow-tooltip align="center" />
        <el-table-column prop="copyNo" label="副本编号" width="120" sortable align="center" />
        <el-table-column prop="barcode" label="条形码" width="150" sortable align="center" />
        <el-table-column prop="location" label="索书号" width="140" sortable align="center" />
        <el-table-column prop="status" label="状态" width="100" sortable align="center">
          <template #default="scope">
            <el-tag :type="statusMap[scope.row.status].type" size="small">
              {{ statusMap[scope.row.status].text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="borrowCount" label="借阅次数" width="100" align="center" />
        <el-table-column prop="remark" label="状态备注" min-width="150" show-overflow-tooltip align="center" />
        <el-table-column prop="createTime" label="创建时间" width="220" align="center" />
        <el-table-column prop="lastBorrowedTime" label="最近借阅时间" width="220" align="center" />
        <el-table-column prop="lastReturnedTime" label="最近归还时间" width="220" align="center" />
        <el-table-column label="操作" width="300" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)" icon="Edit">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)" icon="Delete">删除</el-button>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="图书ID" prop="bookId">
              <el-input v-model="form.bookId" :min="1" placeholder="请输入图书ID" style="width: 100%" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="副本编号" prop="copyNo">
              <el-input v-model="form.copyNo" placeholder="如: 001, 002" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="条形码" prop="barcode">
              <el-input v-model="form.barcode" placeholder="请输入条形码（全局唯一）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="索书号" prop="location">
              <el-input v-model="form.location" placeholder="如: I210/L510.21" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%" :disabled="!isEdit">
                <el-option label="可借阅" :value="1" />
                <el-option label="已借出" :value="2" />
                <el-option label="已损坏" :value="3" />
                <el-option label="已丢失" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="借阅次数" prop="borrowCount">
              <el-input-number v-model="form.borrowCount" :min="0" style="width: 100%" :disabled="!isEdit" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="状态备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入状态备注（如损坏情况、丢失说明等）" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最后借出时间">
              <el-date-picker
                v-model="form.lastBorrowedTime"
                type="datetime"
                placeholder="选择日期时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                :disabled="!isEdit"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最后归还时间">
              <el-date-picker
                v-model="form.lastReturnedTime"
                type="datetime"
                placeholder="选择日期时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                :disabled="!isEdit"
              />
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addBookCopy, deleteBookCopy, fetchBookCopyPage, updateBookCopy } from '@/api/book/copy'

// 路由+状态管理
const router = useRouter()
const store = useStore()

// 搜索表单数据
const searchForm = reactive({
  bookTitle: '', // 搜索条件：图书名称
  copyNo: '', // 搜索条件：副本编号
  barcode: '', // 搜索条件：条形码
  status: '', // 搜索条件：状态
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 新增修改对话框
const dialogVisible = ref(false) // 对话框显示和隐藏
const dialogTitle = ref('') // 对话框标题
const isEdit = ref(false) // 修改标识：true-编辑，false-新增

// 新增/修改表单相关
// 表单引用
const formRef = ref()

// 初始化表单数据
const initForm = {
  bookId: '',
  copyNo: '',
  barcode: '',
  location: '',
  status: 1,
  borrowCount: 0,
  remark: '',
  lastBorrowedTime: '',
  lastReturnedTime: '',
}

// 分类表单
const form = reactive({ ...initForm })

// 新增/修改表单校验规则
const rules = reactive({
  bookId: [{ required: true, message: '请输入图书ID', trigger: 'blur' }],
  copyNo: [{ required: true, message: '请输入副本编号', trigger: 'blur' }],
  barcode: [{ required: true, message: '请输入条形码', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
})

// 根据状态码获取状态文字说明和标签类型
const statusMap = {
  1: {
    text: '可借阅',
    type: 'success',
  },
  2: {
    text: '已借出',
    type: 'primary',
  },
  3: {
    text: '已损坏',
    type: 'warning',
  },
  4: {
    text: '已丢失',
    type: 'danger',
  },
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
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

// 新增
const handleAdd = () => {
  dialogVisible.value = true
  dialogTitle.value = '新增图书副本'
  isEdit.value = false
  nextTick(() => {
    formRef.value?.clearValidate()
    formRef.value?.resetFields()
    Object.assign(form, initForm)
  })
}

// 编辑
const handleEdit = (row) => {
  dialogVisible.value = true
  dialogTitle.value = '编辑图书副本'
  isEdit.value = true
  nextTick(() => {
    Object.assign(form, row)
  })
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除图书副本《${row.bookTitle}》吗?`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 执行确定
      deleteBookCopy(`${row.id}`)
        .then((res) => {
          ElMessage.success('删除成功！')
          loadData()
        })
        .catch((err) => console.log(err))
    })
    .catch(() => {})
}

// 提交保存
const handleSave = async () => {
  await formRef.value.validate()

  // 更新
  if (isEdit.value) {
    updateBookCopy(form)
      .then((res) => {
        dialogVisible.value = false
        ElMessage.success('更新图书副本成功！')
        // 重新加载数据
        loadData()
      })
      .catch((err) => console.log(err))
  } else {
    addBookCopy(form)
      .then((res) => {
        dialogVisible.value = false
        ElMessage.success('新增图书副本成功！')
        // 重新加载数据
        loadData()
      })
      .catch((err) => console.log(err))
  }
}

// 分页数量改变触发
const handleSizeChange = (val) => {
  pagination.currentPage = 1
  pagination.pageSize = val
  loadData()
}

// 当前页码改变触发
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadData()
}

// 勾选发生变化触发
const handleSelectionChange = (selections) => {
  selectedRows.value = selections
}

// 获取数据
const loadData = async () => {
  // 加载中
  loading.value = true

  // 查询参数
  const queryParams = {
    pageNum: pagination.currentPage,
    pageSize: pagination.pageSize,
    ...searchForm, // 展开查询条件
  }

  fetchBookCopyPage(queryParams)
    .then((res) => {
      if (res.code === 200) {
        tableData.value = res.data.list || []
        pagination.total = res.data.total || 0
      } else {
        ElMessage.error(res.msg || '查询失败')
      }
    })
    .catch((err) => {
      console.error('查询副本失败:', err)
      ElMessage.error('查询失败，请稍后重试')
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  // 初始化加载数据
  loadData()
})
</script>

<style lang="scss" scoped>
/* 主容器 */
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

  .table-card {
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
</style>
