<template>
  <div class="content-container">
    <!--  -->
    <el-card class="search-card" shadow="hover">
      <template #header>
        <span>查询借阅信息</span>
      </template>

      <!-- 读者信息卡片 -->
      <el-form :model="readerForm" inline @submit.prevent>
        <el-form-item label="查询方式">
          <el-radio-group v-model="readerForm.searchType">
            <el-radio-button value="reader">用户名或者读者证</el-radio-button>
            <el-radio-button value="barcode">图书条码</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="readerForm.searchType === 'reader' ? '读者证号' : '图书条码'">
          <el-input
            v-model="readerForm.keywords"
            :placeholder="`请输入${readerForm.searchType === 'reader' ? '读者证号' : '图书条码'}`"
            @keyup.enter="handleSearchReaderRecord"
          >
            <template #append>
              <el-button @click="handleSearchReaderRecord">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 读者信息卡片 -->
    <el-card class="reader-card" v-if="readerInfo.id">
      <template #header>
        <span>借阅读者详情</span>
      </template>

      <!-- 基本信息 -->
      <div class="reader-info">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="姓名">{{ readerInfo.userName || readerInfo.nickName }}</el-descriptions-item>
          <el-descriptions-item label="读者证号">{{ readerInfo.cardNo }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ readerInfo.phone }}</el-descriptions-item>
          <el-descriptions-item label="当前借阅">
            <el-tag type="primary">{{ readerInfo.borrowingCount }}本</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前逾期">
            <el-tag type="danger">{{ totalOverdueCount }}本</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="逾期费用">
            <el-tag type="warning">{{ totalFineAmount }}元</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 借阅记录卡片 -->
    <el-card class="record-card" v-if="borrowRecords.length > 0">
      <template #header>
        <div class="card-header">
          <div>
            <span>借阅图书记录</span>
            <el-tag type="danger" size="small" style="margin-left: 10px" v-if="selectedRows.length > 0">
              已勾选{{ selectedRows.length }}条
            </el-tag>
          </div>
          <div>
            <el-button type="success" @click="returnBatch" :disabled="selectedRows.length === 0">
              <el-icon> <Refresh /> </el-icon>
              &nbsp;批量归还
            </el-button>
          </div>
        </div>
      </template>
      <!-- 加载表格数据 -->
      <el-table :data="borrowRecords" stripe empty-text="暂无数据" @selection-change="handleSelectionChange" style="width: 100%">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="bookName" label="图书名称" min-width="200" align="center" />
        <el-table-column prop="borrowTime" label="借阅日期" width="250" align="center" />
        <el-table-column prop="dueTime" label="应还日期" width="250" align="center" />
        <el-table-column prop="status" label="借阅状态" width="150" align="center">
          <template #default="scope">
            <el-tag :type="borrowStatusMap[scope.row.status].type">{{ borrowStatusMap[scope.row.status].text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="逾期状态" width="150" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.expirationStatus.type">{{ scope.row.expirationStatus.text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="逾期天数" width="150" align="center">
          <template #default="scope">
            <el-text v-if="scope.row.expirationStatus.isExpired" type="danger">{{ scope.row.expirationStatus.dueDays }}天</el-text>
            <el-text v-else>-</el-text>
          </template>
        </el-table-column>
        <el-table-column label="剩余天数" width="150" align="center">
          <template #default="scope">
            <el-text v-if="scope.row.expirationStatus.isExpired">-</el-text>
            <el-text v-else type="info">{{ Math.abs(scope.row.expirationStatus.dueDays) }}天</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="overdueFine" label="逾期罚金" width="150" align="center">
          <template #default="scope">
            <el-text v-if="scope.row.expirationStatus.fineAmount" type="danger">￥{{ scope.row.expirationStatus.fineAmount }}</el-text>
            <el-text v-else>-</el-text>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="{ row }">
            <el-button type="success" link icon="Refresh" @click="returnSingle(row)">归还</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-else>
      <el-empty description="暂无借阅记录" />
    </el-card>

    <!-- 归还弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px" destroy-on-close>
      <!-- 归还信息 -->
      <el-descriptions :column="2" border>
        <el-descriptions-item label="归还数量">{{ returnRecords.length }}本</el-descriptions-item>
        <el-descriptions-item label="逾期数量">{{ returnOverdueCount }}本</el-descriptions-item>
        <el-descriptions-item label="罚款总额">
          <el-text v-if="returnFineAmount > 0" type="danger">￥{{ returnFineAmount.toFixed(2) }}元</el-text>
          <el-text v-else>￥{{ returnFineAmount.toFixed(2) }}元</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="归还日期">{{ returnDate }}</el-descriptions-item>
      </el-descriptions>

      <div class="return-table">
        <h4>归还图书列表</h4>
        <el-table :data="returnRecords" size="small" style="width: 100%" empty-text="暂无数据">
          <el-table-column prop="bookName" label="图书名称" />
          <el-table-column prop="borrowTime" label="借阅日期" />
          <el-table-column prop="dueTime" label="应还日期" />
          <el-table-column label="逾期天数">
            <template #default="scope">
              <el-text v-if="scope.row.expirationStatus.isExpired" type="danger">{{ scope.row.expirationStatus.dueDays }}天</el-text>
              <el-text v-else>-</el-text>
            </template>
          </el-table-column>
          <el-table-column label="逾期罚金">
            <template #default="scope">
              <el-text v-if="scope.row.expirationStatus.fineAmount" type="warning">￥{{ scope.row.expirationStatus.fineAmount }}</el-text>
              <el-text v-else>-</el-text>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-form ref="returnFormRef" :model="returnForm" class="return-form">
        <el-form-item label="归还类型">
          <el-radio-group v-model="returnForm.returnType">
            <el-radio value="returning">归还</el-radio>
            <el-radio value="damaged" disabled>损坏</el-radio>
            <el-radio value="lost" disabled>遗失</el-radio>
          </el-radio-group>
        </el-form-item>
        <div v-if="returnFineAmount > 0">
          <el-form-item label="缴纳罚金">
            <el-radio-group v-model="returnForm.paymentMethod">
              <el-radio value="cash">现金缴纳</el-radio>
              <el-radio value="online">在线缴纳</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="returnForm.paymentMethod === 'cash'" label="缴纳罚金">
            <el-input v-model="returnForm.overdueFine" placeholder="请输入缴纳罚金" disabled></el-input>
          </el-form-item>
        </div>
        <el-form-item label="还书备注">
          <el-input
            v-model="returnForm.returnRemark"
            type="textarea"
            :rows="2"
            placeholder="可填写还书备注"
            maxlength="200"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="confirmReturn">确认归还</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { borrowStatusMap } from '@/utils/common'
import { fetchBorrowUser } from '@/api/user/user'
import { returnBorrowRecords } from '@/api/borrow/borrow'

// 路由
const route = useRoute()
// 读者相关
// 读者信息查询表单
const readerForm = reactive({
  keywords: route.query.keywords || '',
  searchType: 'reader',
})

// 表格数据
const borrowRecords = ref([])
const selectedRows = ref([])

// 读者详情
const readerInfo = ref({})

// 归还弹窗
const dialogVisible = ref(false) // 对话框显示和隐藏
const dialogTitle = ref('') // 对话框标题

// 归还数据
const returnFormRef = ref(null)
const returnRecords = ref([]) // 归还图书的列表
const returnForm = ref({
  returnType: 'returning',
  paymentMethod: 'cash',
  overdueFine: 0.0,
  returnRemark: '',
})

const returnDate = ref(new Date().toLocaleDateString('zh-CN'))
const returnOverdueCount = ref(0)
const returnFineAmount = ref(0.0)

// 查询读者和借阅记录
const handleSearchReaderRecord = () => {
  // 关键词非空校验
  if (!readerForm.keywords) {
    ElMessage.warning(`请输入${readerForm.searchType === 'reader' ? '读者证号' : '图书条码'}`)
    return
  }
  // 根据关键词，查询数据
  if (readerForm.searchType === 'reader') {
    fetchBorrowUser(readerForm.keywords).then((res) => {
      // 判断读者是否存在
      if (res.code === 200 && res.data) {
        readerInfo.value = res.data
        borrowRecords.value = readerInfo.value.borrowRecords.map((item) => ({
          ...item,
          // 注意：每条记录，执行计算，结果挂载到当前行数据上（增加附加数据）
          expirationStatus: calcExpiration(item.dueTime, readerInfo.value.overdueFee),
        }))
        console.log(borrowRecords.value)
      } else {
        ElMessage.error('未找到读者信息！')
      }
    })
  } else {
    ElMessage.warning('功能开发中')
  }
}
//
function calcExpiration(dueTime, overdueFee) {
  if (!dueTime) return { text: '-', dueDays: 0, isExpired: false, type: '', fineAmount: 0.0 }
  // 获取当前时间的零点
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 获取目标日期的零点
  const dueDay = new Date(dueTime)
  dueDay.setHours(0, 0, 0, 0)
  // 计算时间差
  const diffTime = today.getTime() - dueDay.getTime()
  // 转换为天数(floor向下取整，只要没有超过当前24点，都不算逾期)
  const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000))

  // 计算逾期费用
  const fineAmount = diffDays <= 0 ? 0 : diffDays * overdueFee

  // 创建逾期状态对象
  let status = {}
  if (diffDays > 0) {
    status = { text: '已逾期', dueDays: diffDays, isExpired: true, type: 'danger', fineAmount: fineAmount }
  } else if (diffDays == 0) {
    status = { text: '今天到期', dueDays: 0, isExpired: false, type: 'warning', fineAmount: 0 }
  } else {
    status = { text: '未到期', dueDays: diffDays, isExpired: false, type: 'success', fineAmount: 0 }
  }
  return status
}

// 勾选数量发生变化
const handleSelectionChange = (selections) => {
  selectedRows.value = selections
}

// 计算逾期图书总数量
const totalOverdueCount = computed(() => {
  let overdueCount = 0
  borrowRecords.value.forEach((record) => {
    if (record.expirationStatus.isExpired) {
      overdueCount++
    }
  })
  return overdueCount
})

// 计算逾期总费用
const totalFineAmount = computed(() => {
  return borrowRecords.value.reduce((total, record) => {
    return total + record.expirationStatus.fineAmount
  }, 0)
})
// 单本归还
const returnSingle = (row) => {
  dialogVisible.value = true
  dialogTitle.value = '归还图书'

  // 添加归还记录
  returnRecords.value = [row]
  returnForm.value.returnType = 'returning'
  returnForm.value.returnRemark = ''

  prepareReturn()
}
// 批量归还
const returnBatch = (row) => {
  // 如果存在逾期记录，无法批量操作
  if (selectedRows.value.some((record) => record.expirationStatus.isExpired)) {
    ElMessage.error('批量操作存在逾期记录，无法批量归还')
    return
  }
  dialogVisible.value = true
  dialogTitle.value = '批量归还图书'

  returnRecords.value = [...selectedRows.value]

  prepareReturn()
}

// 准备归还数据
const prepareReturn = () => {
  // 计算数量和金额
  returnOverdueCount.value = 0
  returnFineAmount.value = 0

  // 根据归还记录，遍历数据
  returnRecords.value.forEach((record) => {
    // 计算逾期数量和金额
    if (record.expirationStatus.isExpired) {
      // 增加逾期书本数量
      returnOverdueCount.value++
      // 累加罚金
      returnFineAmount.value += record.expirationStatus.fineAmount
    }
  })
  // 初始数据
  returnForm.value.returnType = 'returning'
  returnForm.value.returnRemark = ''
  returnForm.value.paymentMethod = 'cash'
  returnForm.value.overdueFine = returnFineAmount.value
}

// 确认归还
const confirmReturn = () => {
  const returnRequests = returnRecords.value.map((record) => ({
    id: record.id,
    userId: readerInfo.value.id,
    userName: readerInfo.value.username,
    remark: returnForm.value.returnRemark,
    overdueFine: returnForm.value.overdueFine,
  }))
  // 提交归还请求
  returnBorrowRecords(returnRequests)
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success('归还成功！')
        // 清空数据
        selectedRows.value = []
        // 借阅列表清除已经归还图书
        handleSearchReaderRecord()
        // 关闭弹窗
        dialogVisible.value = false
      }
    })
    .catch((err) => console.log(err))
}
</script>

<style lang="scss" scoped>
.content-container {
  margin-top: 5px;
  // 卡片
  .reader-card,
  .search-card,
  .record-card {
    margin-bottom: 15px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .return-table {
    margin-top: 20px;
    h4 {
      color: #666;
      margin-bottom: 10px;
    }
  }
  .return-form {
    margin-top: 20px;
  }
}
</style>
