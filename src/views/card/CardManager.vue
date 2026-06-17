<template>
  <div class="main-container">
    <!-- 搜索条件区域 -->
    <el-card class="search-card" shadow="hover">
      <template #header>
        <span>读者证筛选</span>
      </template>

      <el-form :model="searchForm" inline class="">
        <el-form-item label="读者证号" prop="cardNo">
          <el-input v-model="searchForm.cardNo" placeholder="请输入读者证号" @keyup.enter="handleSearch" clearable />
        </el-form-item>
        <el-form-item label="用户编号" prop="userId">
          <el-input v-model="searchForm.userId" placeholder="请输入用户编号" @keyup.enter="handleSearch" clearable />
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
            <span>读者证列表</span>
            <el-tag type="info" size="small" style="margin-left: 10px">{{ `共${pagination.total}条记录` }} </el-tag>
          </div>
          <div>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              &nbsp;新增读者证
            </el-button>
            <el-button :disabled="selectedRows.length === 0" type="danger" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              &nbsp;批量删除
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
        <el-table-column prop="cardNo" label="读者证号" min-width="200" align="center" />
        <el-table-column prop="userId" label="用户ID" width="100" align="center" />
        <el-table-column prop="username" label="用户名" width="100" align="center" />
        <el-table-column prop="typeName" label="读者证类型" width="100" align="center" />
        <el-table-column prop="actualDeposit" label="实际押金" width="100" align="center"></el-table-column>
        <el-table-column prop="totalFine" label="累计罚金" width="80" align="center" />
        <el-table-column prop="currentBorrowed" label="已借阅量" width="80" align="center" />
        <el-table-column prop="issueDate" label="发证日期" width="200" align="center" />
        <el-table-column prop="expireDate" label="过期日期" width="200" align="center" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
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
      <el-form ref="cardRef" :model="cardForm" :rules="rules" label-width="auto">
        <el-form-item label="读者证号" prop="cardNo">
          <el-input v-model="cardForm.cardNo" disabled />
        </el-form-item>

        <el-form-item label="选择读者" prop="userId">
          <el-select
            v-model="cardForm.userId"
            placeholder="请选择读者"
            filterable
            :filter-method="filterUsers"
            clearable
            @change="handleUserSelect"
            :disabled="isEdit"
          >
            <el-option v-for="user in showUsers" :key="user.id" :value="user.id" :label="user.username"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="选择读者证类型" prop="typeId">
          <el-radio-group v-model="cardForm.typeId" @change="handleCardTypeChange">
            <el-radio v-for="cardType in cardTypeData" :key="cardType.id" :value="Number(cardType.id)" :label="cardType.name"></el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="实际押金" prop="actualDeposit">
          <el-input-number v-model="cardForm.actualDeposit" :min="0" :max="10000" :precision="2" style="width: 100%" />
        </el-form-item>

        <el-form-item label="累计欠费/罚金" prop="totalFine">
          <el-input-number v-model="cardForm.totalFine" :min="0" :max="10000" :precision="2" style="width: 100%" :disabled="!isEdit" />
        </el-form-item>

        <el-form-item label="有效期" prop="effectiveAge">
          <el-select v-model="cardForm.effectiveAge">
            <el-option :value="1" label="1年"></el-option>
            <el-option :value="2" label="2年"></el-option>
            <el-option :value="3" label="3年"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="类型状态" prop="status">
          <el-radio-group v-model="cardForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button type="info" @click="dialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { fetchCardPage, addCard, updateCard, deleteCard, deleteBatchCard } from '@/api/card/card'
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchCardTypeList } from '@/api/card/type'
import { fetchWithoutCardUsers } from '@/api/user/user'

const loading = ref(false)
// 读者证表格数据
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
  cardNo: '',
  userId: '',
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
const initCardForm = {
  id: '',
  cardNo: '',
  userId: '',
  username: '',
  typeId: 1,
  actualDeposit: 0.0,
  totalFine: 0.0,
  currentBorrowed: 0,
  status: 1,
  effectiveAge: 3,
}

const cardRef = ref() // 表单引用
const cardForm = reactive({ ...initCardForm })

// 读者证类型数据
const cardTypeData = ref([])

// 无读者证用户数据
const withoutCardUsers = ref([])

// 当前的读者证类型
const currentCardType = ref('')
// 无读者证用户数
const allUsers = ref([])
const showUsers = ref([])

// 新增修改表单校验规则
const rules = reactive({
  cardNo: { required: true, message: '请输入读者证号', trigger: 'blur' },
  userId: { required: true, message: '请选择用户编号', trigger: 'blur' },
  typeId: { required: true, message: '请输入读者证类型', trigger: 'blur' },
})

const handleAdd = () => {
  dialogTitle.value = '新增读者证分类'
  dialogVisible.value = true
  // 等待DOM更新完毕，确保表单已经挂载
  isEdit.value = false
  nextTick(() => {
    // 初始化新增表单数据，保持响应式
    Object.assign(cardForm, initCardForm)
    // 清除之前的错误校验提示
    cardRef.value?.clearValidate()
    // 模拟生成读者证号
    cardForm.cardNo = generateCardNo()
    //
    loadWithoutCardUsers()
  })
}
// 生成随机的读者证号码,规则：LC+多位随机数（推荐使用算法生成必须唯一，或基于Redis生成自增）
const generateCardNo = () => {
  let prefix = 'LCrj242301'
  let randSuffix = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, '0')

  return `${prefix}${randSuffix}`
}

// 根据输入的用户名筛选用户
const filterUsers = (query) => {
  // 根据输入关键词，筛选数据
  const matchUser = allUsers.value.filter((item) => item.username.includes(query))
  // 如果匹配的结果集超出10条记录，只截取前10条
  showUsers.value = matchUser.length > 10 ? matchUser.slice(0, 10) : matchUser
}

// 选择用户
const handleUserSelect = (val) => {
  // console.log(val)
  const selectedUser = allUsers.value.find((item) => item.id === val)
  // console.log(selectedUser)
  if (selectedUser) {
    cardForm.username = selectedUser.username
  } else {
    cardForm.username = ''
  }
}

// 选择读者证类型
const handleCardTypeChange = (val) => {
  // 根据选中读者证类型，获取读者证对象
  currentCardType.value = cardTypeData.value.find((item) => item.id == val)
  cardForm.actualDeposit = currentCardType.value.depositAmount
}

// 编辑
const handleEdit = (row) => {
  dialogVisible.value = true
  dialogTitle.value = '编辑读者证'
  isEdit.value = true

  // console.log(row)
  // 解决：只赋值同名属性
  nextTick(() => {
    Object.keys(cardForm).forEach((key) => {
      // 只有存在key才赋值
      if (row.hasOwnProperty(key)) {
        cardForm[key] = row[key]
      }
    })
    const currentUser = {
      id: cardForm.userId,
      username: cardForm.username,
    }
    showUsers.value = [currentUser]
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除“${row.name}”读者证吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteCard(`${row.id}`)
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
      // 获取所有选中记录的读者证id
      const ids = selectedRows.value.map((item) => item.id)
      deleteBatchCard(ids)
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
    await cardRef.value.validate()
    // 更新
    if (isEdit.value) {
      updateCard(cardForm).then((res) => {
        if (res.code === 200) {
          dialogVisible.value = false
          ElMessage.success('更新读者证成功！')
          loadData()
        }
      })
      // 新增
    } else {
      console.log(cardForm)
      addCard(cardForm).then((res) => {
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
  fetchCardPage(queryParams)
    .then((res) => {
      if (res.code === 200) {
        tableData.value = res.data.list
        pagination.total = res.data.total
        loading.value = false
      }
    })
    .catch((err) => console.log(err))
}
const loadCardTypes = () => {
  // 获取读者证类型数据
  fetchCardTypeList()
    .then((res) => {
      if (res.code === 200) {
        cardTypeData.value = res.data
      }
    })
    .catch((err) => console.log(err))
}

const loadWithoutCardUsers = () => {
  // 获取无读者证用户数据
  fetchWithoutCardUsers()
    .then((res) => {
      // 保存所有无读者证用户数据
      console.log(res.data)
      allUsers.value = res.data
      // 初始默认只显示部分数据，如：10条
      showUsers.value = allUsers.value.slice(0, 10)
    })
    .catch((err) => console.log(err))
}

onMounted(() => {
  loadData()
  loadCardTypes()
})
</script>

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
