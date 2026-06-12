<script setup>
import { ref, reactive, computed, toRefs } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { changePassword, updateNotification, updatePrivacy, updateUserOff } from '@/api/user/user'
import { ElMessage, ElMessageBox } from 'element-plus'
const store = useStore()
const router = useRouter()

// 激活菜单
const activeMenu = ref('security')

const handleMenuSelected = (index) => {
  activeMenu.value = index
}

// 密码修改相关
const passwordFormRef = ref()
const passwordSaving = ref(false)
const passwordForm = reactive({
  password: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordRules = reactive({
  password: [
    { required: true, message: '请输入当前旧密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请输入确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value != passwordForm.newPassword) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      },
    },
  ],
})
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    // 校验不通过，暂停
    if (!valid) return

    // 修改中
    passwordSaving.value = true

    // 请求
    changePassword(passwordForm)
      .then((res) => {
        if (res.code === 200) {
          // 密码修改成功
          // 清除当前登录信息
          store.dispatch('logout')
          ElMessage.success('密码修改成功，请重新登录！')
          setTimeout(() => {
            router.push('/login')
          }, 1000)
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        passwordSaving.value = false
      })
  })
}

// 通知设置相关
const { receiveDue, receiveNotice, receiveEmail } = store.state.user
const notificationSettings = reactive({
  receiveDue: receiveDue,
  receiveNotice: receiveNotice,
  receiveEmail: receiveEmail,
})
const notificationSaving = ref(false)
// 保存通知设置
const handleSaveNotification = async () => {
  notificationSaving.value = true
  // 更新用户的通知设置
  await updateNotification(notificationSettings)
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success('通知设置已保存！')
        // 更新state状态中，保存用户信息的参数值
        store.commit('SET_NOTIFICATION', notificationSettings)
      }
    })
    .catch((err) => console.log(err))
    .finally(() => {
      notificationSaving.value = false
    })
}
// 隐私设置相关
const { profileVisible, borrowHisVisible } = store.state.user
const privacySettings = reactive({
  profileVisible: profileVisible,
  borrowHisVisible: borrowHisVisible,
})
const privacySaving = ref(false)
// 保存隐私设置
const handleSavePrivacy = async () => {
  privacySaving.value = true
  // 更新用户的隐私设置
  await updatePrivacy(privacySettings)
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success('隐私设置已保存！')
        store.commit('SET_PRIVACY', privacySettings)
      }
    })
    .catch((err) => console.log(err))
    .finally(() => {
      privacySaving.value = false
    })
}

// 账号管理相关
const handleAccountOff = () => {
  ElMessageBox.confirm('注销账号后，您的账号所有数据都会被清除，确定要继续吗?', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'error',
  })
    .then(() => {
      // 执行确定
      updateUserOff().then((res) => {
        if (res.code === 200) {
          // 清除用户缓存信息
          store.dispatch('logout')
          ElMessage.success('注销账号成功')
          // 跳转到登录页
          router.push('/login')
        } else {
          ElMessage.error('注销账号失败')
        }
      })
    })
    .catch((err) => console.log(err))
}
</script>

<template>
  <div class="account-container">
    <div class="account-header">
      <h2>账号设置</h2>
      <p>管理您的账号安全和系统偏好设置</p>
    </div>
    <!-- 账号设置 -->
    <el-row :gutter="20">
      <!-- 左侧卡片 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="6">
        <!-- 设置菜单 -->
        <el-card shadow="hover">
          <el-menu style="border: none" :default-active="activeMenu" @select="handleMenuSelected">
            <el-menu-item index="security">
              <el-icon>
                <Lock />
              </el-icon>
              <span>安全设置</span>
            </el-menu-item>
            <el-menu-item index="notification">
              <el-icon>
                <Bell />
              </el-icon>
              <span>通知设置</span>
            </el-menu-item>
            <el-menu-item index="privacy">
              <el-icon>
                <View />
              </el-icon>
              <span>隐私设置</span>
            </el-menu-item>
            <el-menu-item index="account">
              <el-icon>
                <Setting />
              </el-icon>
              <span>账号设置</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      <!-- 右侧卡片 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="18">
        <!-- 安全设置 -->
        <el-card v-show="activeMenu === 'security'" class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon> <Lock /> </el-icon>安全设置</span
              >
            </div>
          </template>

          <div class="setting-section">
            <!-- 警告提示框 -->
            <el-alert
              title="警告"
              type="warning"
              description="修改密码必须是6-20位，为了安全，请使用大小写字母，数字，特殊字符组合，并牢记密码"
              :closable="false"
              style="margin-bottom: 20px"
            />
            <!-- 修改密码表单 -->
            <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="auto" style="max-width: 550px">
              <el-form-item label="旧密码" prop="password">
                <el-input type="password" v-model="passwordForm.password" placeholder="请输入原密码" show-password>
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input type="password" v-model="passwordForm.newPassword" label="新密码" placeholder="请输入新密码" show-password>
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input type="password" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" show-password>
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleChangePassword" :loading="passwordSaving">修改密码</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
        <!-- 通知设置 -->
        <el-card v-show="activeMenu === 'notification'" class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon> <Bell /> </el-icon>通知设置</span
              >
            </div>
          </template>

          <div class="setting-section">
            <div class="setting-item">
              <div class="setting-item-text">
                <h4>到期提醒</h4>
                <p>当借阅图书即将到期时发出提醒</p>
              </div>
              <el-switch v-model="notificationSettings.receiveDue" :active-value="1" :inactive-value="0"></el-switch>
            </div>

            <el-divider></el-divider>

            <div class="setting-item">
              <div class="setting-item-text">
                <h4>系统公告</h4>
                <p>接收重要的系统公告和维护通知</p>
              </div>
              <el-switch v-model="notificationSettings.receiveNotice" :active-value="1" :inactive-value="0"></el-switch>
            </div>

            <el-divider></el-divider>

            <div class="setting-item">
              <div class="setting-item-text">
                <h4>邮件通知</h4>
                <p>允许系统发送重要通知邮件</p>
              </div>
              <el-switch v-model="notificationSettings.receiveEmail" :active-value="1" :inactive-value="0"></el-switch>
            </div>

            <div style="margin-top: 20px">
              <el-button type="primary" :loading="notificationSaving" @click="handleSaveNotification">保存通知设置</el-button>
            </div>
          </div>
        </el-card>
        <!-- 隐私设置 -->
        <el-card v-show="activeMenu === 'privacy'" class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon> <View /> </el-icon>隐私设置</span
              >
            </div>
          </template>

          <div class="setting-section">
            <div class="setting-item">
              <div class="setting-item-text">
                <h4>个人信息可见性</h4>
                <p>其他用户是否可以查看您的个人信息</p>
              </div>
              <el-switch v-model="privacySettings.profileVisible" :active-value="1" :inactive-value="0"></el-switch>
            </div>

            <el-divider></el-divider>

            <div class="setting-item">
              <div class="setting-item-text">
                <h4>显示个人借阅历史</h4>
                <p>是否允许其他用户查看您的借阅历史</p>
              </div>
              <el-switch v-model="privacySettings.borrowHisVisible" :active-value="1" :inactive-value="0"></el-switch>
            </div>

            <div style="margin-top: 20px">
              <el-button type="primary" :loading="privacySaving" @click="handleSavePrivacy">保存隐私设置</el-button>
            </div>
          </div>
        </el-card>
        <!-- 账号设置 -->
        <el-card v-show="activeMenu === 'account'" class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon> <Setting /> </el-icon>账号设置</span
              >
            </div>
          </template>
          <!-- 警告提示框 -->
          <el-alert
            title="警告"
            type="warning"
            description="注销操作将对您的账号产生重大影响，请谨慎操作！"
            :closable="false"
            style="margin-bottom: 20px"
          />
          <div class="account-section">
            <div class="account-item">
              <div class="account-item-text">
                <h4>注销账号</h4>
                <p>永久删除您的账号和所有数据，此操作不可逆</p>
              </div>
              <el-button type="danger" @click="handleAccountOff"> 注销账号 </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.account-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

// 头部信息
.account-header {
  margin-bottom: 20px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #999;
  }
}

// 右侧卡片信息
.content-card {
  padding: 10px;
  .card-header {
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
.setting-section {
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
  }
}
.setting-item-text {
  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 5px;
  }
  p {
    font-size: 12px;
    color: #999;
  }
}
// 账号设置
.account-section {
  margin-top: 10px;
  .account-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background-color: #fef0f0;
    border-radius: 5px;
    border: 1px solid #f1e2e2;
  }
  .account-item-text {
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #f56161;
      margin-bottom: 5px;
    }
    p {
      font-size: 14px;
      color: #999;
    }
  }
}
</style>
