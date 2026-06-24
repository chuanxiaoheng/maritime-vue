<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchBorrowRecordPage, updateBorrowRecord } from '@/api/borrow/borrow'
import { borrowStatusMap } from '@/utils/common'
import { useRouter } from 'vue-router'
const router = useRouter()

const loading = ref(false)

// 搜索表单数据
const searchForm = reactive({
  userId: '',
  bookName: '',
  status: '',
})

// 图书表格数据
const tableData = ref([])

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 新增/修改弹窗
const dialogVisible = ref(false) // 对话框显示和隐藏
const dialogTitle = ref('') // 对话框标题
const isEdit = ref(false) // 修改标识 -true表示编辑 -false表示新增

const recordForm = reactive({})
const dialogRef = ref(null)

const rules = reactive({
  dueTime: [{ required: true, message: '请填写内容', trigger: 'blur' }],
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

const handleEdit = (row) => {
  dialogVisible.value = true
  dialogTitle.value = '编辑借阅记录'
  isEdit.value = true
  nextTick(() => {
    Object.assign(recordForm, row)
  })
}

const handleSave = async () => {
  await dialogRef.value.validate()
  updateBorrowRecord(recordForm)
    .then((res) => {
      dialogVisible.value = false
      ElMessage.success('更新图书成功！')
      loadData()
    })
    .catch((err) => console.log(err))

  loadData()
}

const handleReturn = (row) => {
  router.push({
    path: '/borrow/return',
    query: {
      keywords: row.userName,
    },
  })
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
  fetchBorrowRecordPage(queryParams)
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
        <span>借阅记录筛选</span>
      </template>

      <el-form :model="searchForm" inline class="search-card-form">
        <el-form-item label="借阅用户" prop="userId">
          <el-input v-model="searchForm.userId" placeholder="请输入用户ID" @keyup.enter="handleSearch" clearable />
        </el-form-item>
        <el-form-item label="借阅图书" prop="bookName">
          <el-input v-model="searchForm.bookName" placeholder="请输入图书名称" @keyup.enter="handleSearch" clearable />
        </el-form-item>
        <el-form-item label="借阅状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择借阅状态" style="width: 200px" clearable>
            <el-option label="借阅中" :value="0"></el-option>
            <el-option label="已归还" :value="1"></el-option>
            <el-option label="已逾期" :value="2"></el-option>
            <el-option label="已损坏" :value="3"></el-option>
            <el-option label="已遗失" :value="4"></el-option>
            <el-option label="已赔偿" :value="5"></el-option>
          </el-select>
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
        <span>借阅记录列表</span>
      </template>

      <!-- 加载表格数据 -->
      <el-table :data="tableData" stripe v-loading="loading" empty-text="暂无数据" style="width: 100%">
        <el-table-column prop="id" label="编号" width="80" align="center" />
        <el-table-column prop="recordNo" label="借阅记录" width="180" align="center" />
        <el-table-column prop="userId" label="用户ID" width="120" align="center" />
        <el-table-column prop="bookId" label="图书ID" width="120" align="center" />
        <el-table-column prop="bookName" label="图书名称" min-width="100" align="center" />
        <el-table-column prop="bookCopyId" label="副本编号" width="100" align="center" />
        <el-table-column prop="borrowTime" label="借阅时间" width="100" align="center" />
        <el-table-column prop="dueTime" label="应还时间" width="100" align="center" />
        <el-table-column prop="returnTime" label="归还时间" width="100" align="center">
          <template #default="scope">
            <span v-if="scope.row.returnTime">{{ scope.row.returnTime }}</span>
            <el-tag type="info" v-else>未归还</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="借阅状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="borrowStatusMap[scope.row.status].type">{{ borrowStatusMap[scope.row.status].text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="借阅备注" width="200" align="center" />
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <el-button type="success" link icon="Refresh" @click="handleReturn(scope.row)" v-if="scope.row.status === 0">归还</el-button>
            <el-button type="primary" link icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
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

    <!-- 修改弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px" destroy-on-close>
      <el-form ref="dialogRef" :model="recordForm" :rules="rules" label-width="auto">
        <el-form-item label="用户编号">
          {{ recordForm.userId }}
        </el-form-item>
        <el-form-item label="图书编号">
          {{ recordForm.bookId }}
        </el-form-item>
        <el-form-item label="图书名称">
          {{ recordForm.bookName }}
        </el-form-item>
        <el-form-item label="副本编号">
          {{ recordForm.bookCopyId }}
        </el-form-item>
        <el-form-item label="应还时间" prop="dueTime">
          <el-date-picker
            v-model="recordForm.dueTime"
            type="datetime"
            placeholder="请选择应还时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="借阅状态" prop="status">
          <el-select v-model="recordForm.status" style="width: 100%">
            <el-option label="借阅中" :value="0"></el-option>
            <el-option label="已损失" :value="3"></el-option>
            <el-option label="已遗失" :value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="借阅备注" prop="remark">
          <el-input
            v-model="recordForm.remark"
            type="textarea"
            :row="3"
            maxlength="200"
            placeholder="请输入借阅备注"
            show-word-limit
          ></el-input>
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
.search-card-form {
  width: 100%;
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
