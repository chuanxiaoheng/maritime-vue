<template>
  <div class="content-container">
    <!-- 读者信息卡片 -->
    <el-card class="reader-card" shadow="hover">
      <template #header>
        <span>读者信息</span>
      </template>

      <!-- 读者查询 -->
      <el-form inline @submit.prevent>
        <el-form-item label="读者或读者证号">
          <el-input v-model="readerForm.keywords" @keyup.enter="handleSearchReader" placeholder="请输入关键字">
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
          <el-descriptions-item label="姓名">{{ readerInfo.username || readerInfo.nickName }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ readerInfo.sex == 1 ? '男' : '女' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ readerInfo.phone }}</el-descriptions-item>
          <el-descriptions-item label="读者证号">{{ readerInfo.cardNo }}</el-descriptions-item>
          <el-descriptions-item label="读者证类型">{{ readerInfo.cardType }}</el-descriptions-item>
          <el-descriptions-item label="用户类型">
            <el-tag>{{ readerInfo.roleName }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="readerInfo.cardStatus === 1 ? 'success' : 'danger'">{{ readerInfo.cardStatus === 1 ? '正常' : '禁用' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="可借数量">
            <el-tag type="info">{{ readerInfo.maxBorrowBooks - readerInfo.borrowingCount }}/{{ readerInfo.maxBorrowBooks }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="借阅中">
            <el-tag type="success">{{ readerInfo.borrowingCount }}本</el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="已归还">
            <el-tag type="primary">{{ readerInfo.returnedCount }}本</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="逾期数量">
            <el-tag type="danger">{{ readerInfo.overdueCount }}本</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="赔偿">
            <el-tag type="warning">{{ readerInfo.compensateCount }}本</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 最近借阅列表 -->
        <div class="reader-books">
          <h4>最近借阅图书</h4>
          <el-table :data="readerInfo.borrowRecords" size="small" empty-text="暂无数据">
            <el-table-column prop="bookId" label="图书编号" align="center" />
            <el-table-column prop="bookName" label="图书名称" align="center" min-width="200" />
            <el-table-column prop="bookCopyId" label="副本编号" align="center" />
            <el-table-column prop="borrowTime" label="借阅日期" align="center" />
            <el-table-column prop="dueTime" label="应还日期" align="center" />
            <el-table-column prop="" label="当前状态" align="center">
              <template #default="{ row }">
                <el-tag :type="isOverdue(row.dueTime) ? 'danger' : 'success'">{{ isOverdue(row.dueTime) ? '已逾期' : '借阅中' }}</el-tag>
              </template>
            </el-table-column>
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
        <el-form-item label="图书ISBN/条形码">
          <el-input v-model="borrowForm.barcode" placeholder="请扫描或者输入图书条码">
            <template #append>
              <el-button @click="addBorrowBook">
                <el-icon><Plus /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleShowSelector">
            <el-icon><Search /></el-icon>浏览图书
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 待借阅图书列表 -->
      <el-table size="small" :data="borrowList" empty-text="暂无数据">
        <el-table-column type="index" label="序号" width="50" />
        <el-table-column prop="isbn" label="ISBN" />
        <el-table-column prop="title" label="图书名称" />
        <el-table-column prop="author" label="作者" />
        <el-table-column prop="publisher" label="出版社" />
        <el-table-column label="借阅天数">
          <template #default="{ row }">
            <el-input-number v-model="row.maxBorrowDays" :min="1" :max="readerInfo.maxBorrowDays" size="small"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="danger" link icon="Delete" @click="removeBorrowBook(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
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
        <el-button size="large" type="primary" @click="handleConfirmBorrow" :disabled="borrowList.length === 0">
          <el-icon><CircleCheck /></el-icon>&nbsp;确认借阅
        </el-button>
        <el-button size="large" @click="handleDeleteBorrowList">
          <el-icon><Delete /></el-icon>&nbsp;清空列表
        </el-button>
      </el-row>
    </el-card>

    <!-- 浏览图书对话框 -->
    <el-dialog title="浏览图书" v-model="selectBookDialog" width="70%">
      <el-form :model="selectBookForm" inline>
        <el-form-item label="图书名称">
          <el-input v-model="selectBookForm.title" placeholder="请输入图书名称" @keyup.enter="getSelectBooks" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="selectBookForm.author" placeholder="请输入图书作者" @keyup.enter="getSelectBooks" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getSelectBooks">搜索</el-button>
        </el-form-item>
      </el-form>

      <!-- 可借阅图书列表 -->
      <el-table
        :data="selectBooks"
        v-loading="selectBookLoading"
        empty-text="暂无数据"
        @row-click="handleSelectBook"
        style="cursor: pointer"
      >
        <el-table-column prop="isbn" label="ISBN" />
        <el-table-column prop="title" label="图书名称" />
        <el-table-column prop="author" label="作者" />
        <el-table-column prop="publisher" label="出版社" />
        <el-table-column label="可借数量">
          <template #default="{ row }">
            <el-tag :type="row.availableCopies >= 1 ? 'success' : 'danger'">{{ row.availableCopies }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchBorrowUser } from '@/api/user/user'
import { fetchBookPage } from '@/api/book/book'
import { addBorrowRecords } from '@/api/borrow/borrow'

// 读者相关
// 读者信息查询表单
const readerForm = reactive({
  keywords: '',
})

// 读者详情
const readerInfo = ref({})

// 查询读者
const handleSearchReader = () => {
  // 关键词非空校验
  if (!readerForm.keywords) {
    ElMessage.warning('请输入用户名或者读者证号')
    return
  }
  // 根据关键词，获取借阅用户详情
  fetchBorrowUser(readerForm.keywords).then((res) => {
    // 判断读者是否存在
    if (res.code === 200 && res.data) {
      console.log(res)
      readerInfo.value = res.data
    } else {
      ElMessage.error('未找到该用户或读者证号')
    }
  })
}

// 借阅图书相关
const borrowForm = reactive({
  barcode: '',
})
const borrowInfo = reactive({
  remark: '',
})

// 借阅列表
const borrowList = ref([])
const selectBooks = ref([])
const selectBookLoading = ref(false)

// 添加借阅的图书
const addBorrowBook = async () => {
  // 输入条形码或者ISBN
  if (!borrowForm.barcode) {
    ElMessage.warning('请输入图书条形码或者ISBN')
    return
  }
  // 如果没有读者信息，不允许添加
  if (!readerInfo.value.id) {
    ElMessage.warning('请先查询借阅者的信息')
    return
  }
  // 检查图书是否已添加
  if (borrowList.value.find((item) => item.isbn === borrowForm.barcode)) {
    ElMessage.warning('该图书在借阅列表已经存在，不能重复添加')
    return
  }
  // 检查借阅图书数量不能超过最大借阅数量
  if (borrowList.value.length + readerInfo.value.borrowingCount >= readerInfo.value.maxBorrowBooks) {
    ElMessage.warning(`该读者最多可借${readerInfo.value.maxBorrowBooks}本，已经超出数量限制，无法添加该图书`)
    return
  }
  try {
    // 查询图书
    const res = await fetchBookPage({ isbn: borrowForm.barcode, pageNum: 1, pageSize: 1 })
    console.log(res)

    // 判断结果
    if (res.code === 200 && res.data.list) {
      // 获取图书
      const book = res.data.list[0]
      // 判断当前图书副本是否有剩余的可借副本
      if (book.availableCopies <= 0) {
        ElMessage.warning('该图书无可借副本，无法借阅')
        return
      }
      borrowList.value.push({
        id: book.id,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        maxBorrowDays: readerInfo.value.maxBorrowDays || 30,
      })

      // 清空添加图书条码
      borrowForm.barcode = ''
      ElMessage.success('图书添加成功')
    }
  } catch (err) {
    console.log(err)
  } finally {
  }
}
// 删除将要借阅的图书
const removeBorrowBook = (index) => {
  ElMessageBox.confirm(`确定要删除这本书吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      borrowList.value.splice(index, 1)
      ElMessage.success('删除成功')
    })
    .catch((err) => console.log(err))
}
// 清空所有将要借阅的图书
const handleDeleteBorrowList = () => {
  ElMessageBox.confirm(`确定要清空借阅图书列表吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      borrowList.value.splice(0)
      ElMessage.success('删除成功')
    })
    .catch((err) => console.log(err))
}

// 浏览图书对话框
const selectBookDialog = ref(false)
const selectBookForm = reactive({
  title: '',
  author: '',
})

// 显示浏览图书选择器
const handleShowSelector = () => {
  if (!readerInfo.value.id) {
    ElMessage.error('请输入读者或者读者证号')
    return
  }

  // 打开弹窗
  selectBookDialog.value = true

  // 获取可借图书列表
  getSelectBooks()
}

// 获取浏览图书列表
const getSelectBooks = async () => {
  try {
    selectBookLoading.value = true
    const queryParams = {
      pageNum: 1,
      pageSize: 20,
      ...selectBookForm,
    }

    const res = await fetchBookPage(queryParams)
    if (res.code === 200 && res.data) {
      selectBooks.value = res.data.list.map((book) => ({
        id: book.id,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        availableCopies: book.availableCopies || 0,
      }))
    } else {
      selectBooks.value = []
    }
  } catch (error) {
    console.log(error)
  } finally {
    selectBookLoading.value = false
  }
}

// 浏览选择图书
const handleSelectBook = (row) => {
  // 打开loading效果
  selectBookDialog.value = true
  // 判断当前图书副本是否有剩余的可借副本
  if (row.availableCopies <= 0) {
    ElMessage.warning('该图书无可借副本，无法借阅')
    return
  }

  // 检查图书是否已添加
  if (borrowList.value.find((item) => item.isbn === row.isbn)) {
    ElMessage.warning('该图书在借阅列表已经存在，不能重复添加')
    return
  }

  // 检查借阅图书数量不能超过最大借阅数量
  if (borrowList.value.length + readerInfo.value.borrowingCount >= readerInfo.value.maxBorrowBooks) {
    ElMessage.warning(`该读者最多可借${readerInfo.value.maxBorrowBooks}本，已经超出数量限制，无法添加该图书`)
    return
  }
  // 当前图书添加到待借阅列表
  borrowList.value.push({
    ...row,
    maxBorrowDays: readerInfo.value.maxBorrowDays,
  })
  // 关闭loading效果
  selectBookDialog.value = false
  ElMessage.success('图书添加成功')
}

// 确认借阅图书
const handleConfirmBorrow = () => {
  // 判断当前图书是否有剩余可借阅副本
  if (borrowList.value.length === 0) {
    ElMessage.warning('借阅图书列表为空，请添加图书！')
    return
  }

  // TODO 如果有逾期图书，先归还，才可以继续借阅
  if (readerInfo.value.overdueCount > 0) {
    ElMessage.error('您有逾期的图书未归还，请先归还后，才能继续借阅')
    return
  }
  // 执行借阅图书
  processBorrowBook()
}
// 执行借阅图书
const processBorrowBook = async () => {
  try {
    // 借阅图书请求
    const borrowBooks = borrowList.value.map((book) => ({
      userId: readerInfo.value.id,
      userName: readerInfo.value.username,
      bookId: book.id,
      remark: borrowInfo.remark || '',
      borrowDays: book.maxBorrowDays,
    }))

    const res = await addBorrowRecords(borrowBooks)
    if (res.code === 200) {
      ElMessage.success('借书成功')
      borrowList.value = []
      selectBooks.value = []
      borrowInfo.remark = ''
    }
  } catch (err) {
    console.log(err)
  }
}

const isOverdue = (dueDate) => {
  return new Date() >= new Date(dueDate)
}
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
