<!-- 文件名称：PersonalCenter.vue
     文件描述：个人中心组件
     功能说明：
      - 显示当前登录用户的个人资料
      - 提供完善个人资料功能（如：绑定，手机邮箱，更换头像等）

-->

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { calculateAge, formatLocalDate } from '@/utils/common'
import { updateUser, uploadAvatar } from '@/api/user/user'
// 路由+状态管理
const store = useStore()
const router = useRouter()
// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const isEditing = ref(false) // 控制是否在编辑状态
const saving = ref(false) // 点击保存状态，防止多次点击
const formRef = ref() // 绑定form表单
const userInfo = ref({})
// 表单数据
const formData = reactive({
  id: null, // 主键id
  username: '', // 用户名
  nickname: '', // 昵称（登录）
  sex: 0, // 性别
  birthday: '', // 出生日期
  phone: '', // 手机号
  email: '', // 邮箱
  address: '', // 联系地址
  intro: '', // 个人简介
})

// 表单校验规则
const rules = reactive({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 3, max: 20, message: '昵称长度在3-20个字符之间', trigger: 'blur' },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确手机号',
      trigger: 'blur',
    },
  ],
  email: [
    { type: 'email', message: '请输入正确邮箱账号', trigger: 'blur' },
    { max: 50, message: '邮箱长度不能超过50个字符', trigger: 'blur' },
  ],
})

// 编辑资料
const handleEdit = () => {
  isEditing.value = true
}
// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  Object.assign(formData, userInfo.value)
}
// 保存资料，不退出
const handleSave = async () => {
  // ElMessage.success('保存资料开发中...')

  await formRef.value.validate((valid) => {
    if (!valid) return

    // 保存中
    saving.value = true
    // 更新用户基本信息
    updateUser(formData)
      .then((res) => {
        // 更新成功
        if (res.code == 200) {
          ElMessage.success('保存用户资料成功')
          isEditing.value = false

          // 更新用户显示数据
          userInfo.value.birthday = formData.birthday

          // 更新store中用户数据
          const user = store.state.user
          Object.assign(user, formData)

          // 提交状态管理，更改用户数据（登录状态保持，不退出）
          store.commit('SET_LOGIN_USER', user)
        }
      })
      .catch(() => {})
      .finally(() => {
        saving.value = false
      })
  })
}

// 计算年龄
const userAge = computed(() => {
  return calculateAge(userInfo.value.birthday)
})

// 上传头像前进行参数校验
const beforeUploadAvatar = (file) => {
  // 只能上传图片
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片')
    return false
  }

  // 限制大小，不能超过1024kb
  const isLimit1M = file.size / 1024 / 1024 <= 1
  if (!isLimit1M) {
    ElMessage.error('图片大小不能超过1M')
    return false
  }
  return true
}

// 执行用户头像上传
const handleUploadAvatar = (options) => {
  // 构建上传头像的表单信息
  const formData = new FormData()
  formData.append('file', options.file)
  formData.append('userId', userInfo.value.id)

  // 执行更新用户头像
  uploadAvatar(formData)
    .then((res) => {
      if (res.code === 200) {
        // 更换个人中心的当前头像
        userInfo.value.avatar = res.data
        store.commit('SET_AVATAR', res.data)
        // 更换全局的用户头像
        ElMessage.success('头像上传成功')
      }
    })
    .catch((err) => {
      ElMessage.error('头像上传失败')
    })
}

// 初始化表单数据,从store里面获取已经登录的用户数据
const initData = () => {
  const user = store.state.user
  // 确保用户存在
  if (!user) return

  // 解构用户数据
  const {
    id,
    username,
    nickname,
    realName,
    sex,
    birthday,
    avatar,
    roleId,
    roleName,
    creditScore,
    phone,
    email,
    address,
    intro,
    createTime,
    lastLoginTime,
  } = store.state.user
  // 映射表单数据
  Object.assign(formData, {
    id: id,
    username: username || '',
    nickname: nickname || '',
    sex: sex ?? 0, // 性别0为女，不可以被处理为'',不可以用||
    birthday: birthday || '',
    phone: phone || '',
    email: email || '',
    address: address || '',
    intro: intro || '',
  })
  // 同步用户展示数据（备份表单原始数据，取消编辑）
  userInfo.value = {
    id,
    username,
    nickname,
    realName,
    sex,
    birthday,
    avatar,
    roleId,
    roleName,
    creditScore,
    phone,
    email,
    address,
    intro,
    createTime,
    lastLoginTime,
  }
}
// 加载用户数据
const loadData = () => {
  if (!store.state.user) {
    ElMessage.error('无用户数据，重新查询数据')
    // TODO 请求数据
  }
  // 初始化用户表单数据
  initData()
}
onMounted(() => {
  loadData() // 加载用户数据
})
</script>

<template>
  <div class="personal-container">
    <!-- 个人中心标题 -->
    <div class="personal-header">
      <h2>个人资料</h2>
      <p>请完善您的个人资料和信息</p>
    </div>
    <!-- 个人资料 -->
    <!-- 说明 :span是指栅格占据的列数，最大24, :gutter是栅格间距 -->
    <el-row :gutter="20">
      <!-- 左侧卡片 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="6">
        <!-- 头像和个人信息 -->
        <el-card shadow="hover">
          <div class="avatar-item">
            <el-avatar :src="userInfo.avatar || defaultAvatar" :size="120" class="user-avatar" />
            <el-upload class="upload-avatar" :show-file-list="false" :before-upload="beforeUploadAvatar" :http-request="handleUploadAvatar">
              <el-button type="primary">更换头像</el-button>
              <template #tip>
                <div class="el-upload__tip">avatar size less than 1024KB.</div>
              </template>
            </el-upload>
          </div>
          <div class="username-item">
            <h2>{{ userInfo.realName || '未设置' }}</h2>
            <p>
              <el-tag type="primary">{{ userInfo.roleName }}</el-tag>
            </p>
          </div>

          <el-divider></el-divider>

          <div class="data-item">
            <div class="data-info">
              <h3>{{ userAge }}</h3>
              <h4>年龄</h4>
            </div>
            <div class="data-info">
              <h3>0</h3>
              <h4>余额</h4>
            </div>
            <div class="data-info">
              <h3>{{ userInfo.creditScore }}</h3>
              <h4>信用</h4>
            </div>
          </div>
        </el-card>
      </el-col>
      <!-- 右侧卡片 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="18">
        <!-- 个人详细资料 -->
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>
                <el-icon>
                  <User />
                </el-icon>
                基本信息
              </span>
              <el-button type="primary" icon="Edit" v-if="!isEditing" @click="handleEdit">编辑资料 </el-button>
              <div v-else>
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleSave" :loading="saving"> 保存 </el-button>
              </div>
            </div>
          </template>
          <el-form ref="formRef" :rules="rules" :model="formData" label-width="auto">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="账号" prop="username">
                  <el-input
                    v-model="formData.username"
                    :disabled="!isEditing || userInfo.roleId !== 1"
                    :placeholder="userInfo.roleId === 1 ? '请输入账号' : '仅管理员可修改'"
                  >
                    <template #prefix>
                      <el-icon>
                        <User />
                      </el-icon>
                    </template>
                  </el-input>
                  <div class="admin-tip" v-if="userInfo.roleId !== 1">
                    <el-icon>
                      <InfoFilled />
                    </el-icon>
                    仅管理员可以修改账号
                  </div>
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="12">
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="formData.nickname" :disabled="!isEditing" placeholder="请输入昵称">
                    <template #prefix>
                      <el-icon>
                        <User />
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="性别" prop="sex">
                  <el-select v-model="formData.sex" :disabled="!isEditing" placeholder="请选择性别">
                    <template #prefix>
                      <el-icon>
                        <Male />
                      </el-icon>
                    </template>
                    <el-option label="男" :value="1">
                      <template #default>
                        <el-icon>
                          <Male />
                        </el-icon>
                        <span>男</span>
                      </template>
                    </el-option>

                    <el-option label="女" :value="0">
                      <template #default>
                        <el-icon>
                          <Female />
                        </el-icon>
                        <span>女</span>
                      </template>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="12">
                <el-form-item label="出生日期" prop="birthday">
                  <el-date-picker
                    v-model="formData.birthday"
                    type="date"
                    :disabled="!isEditing"
                    placeholder="请选择日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="formData.phone" :disabled="!isEditing" placeholder="请输入手机号">
                    <template #prefix>
                      <el-icon>
                        <Phone />
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="formData.email" :disabled="!isEditing" placeholder="请输入邮箱">
                    <template #prefix>
                      <el-icon>
                        <Message />
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="地址" prop="address">
                  <el-input v-model="formData.address" :disabled="!isEditing" placeholder="请输入联系地址">
                    <template #prefix>
                      <el-icon>
                        <Location />
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="个人简介" prop="intro">
                  <el-input
                    v-model="formData.intro"
                    :disabled="!isEditing"
                    placeholder="请输入个人简介..."
                    type="textarea"
                    maxlength="200"
                    :rows="4"
                    show-word-limit
                  >
                    <template #prefix>
                      <el-icon>
                        <Document />
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left"> 账号信息 </el-divider>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="注册时间">
                  <el-input :value="formatLocalDate(userInfo.createTime)" disabled>
                    <template #prefix>
                      <el-icon>
                        <Clock />
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="12">
                <el-form-item label="最后一次登录">
                  <el-input :value="formatLocalDate(userInfo.lastLoginTime)" disabled>
                    <template #prefix>
                      <el-icon>
                        <Clock />
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.personal-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

// 头部信息
.personal-header {
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

// 左侧个人信息

// 头像
.avatar-item {
  text-align: center;
  padding: 20px;
}

.user-avatar {
  margin-bottom: 20px;
  border: 3px solid #f0f2f5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

// 昵称
.username-item {
  text-align: center;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }
}

// 数据
.data-item {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px 0;

  .data-info {
    text-align: center;

    h3 {
      font-size: 24px;
      color: #409eff;
      margin-bottom: 4px;
    }

    h4 {
      font-size: 12px;
      color: #999999;
    }
  }
}

// 右侧基本信息
// 卡片头部
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

// 管理员提示
.admin-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}
</style>
