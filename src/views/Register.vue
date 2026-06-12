<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { Lock, User } from '@element-plus/icons-vue'
// import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { register } from '@/api/auth/auth.js'
// 路由
const router = useRouter()

// 表单组件引用
const regFormRef = ref()
// 表单数据
const regForm = reactive({
  username: '', // 用户名
  password: '', // 密码
  confirmPassword: '', // 确认密码(不用传递后端，前端校验即可)
  roleId: '', // 角色Id(普通读者)
})
// 加载中
const loading = ref(false)

// 自定义校验规则-再次确认密码，要先定义
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== regForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}
// 表单校验规则
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '用户名只能包含字母、数字、下划线',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
  roleId: { required: true, message: '请选择用户角色', trigger: 'change' },
})

// 执行注册
const handleRegister = async () => {
  // 防止在DOM元素未成功挂载或者引用失效时执行后续逻辑，避免出错
  if (!regFormRef.value) return
  try {
    // 执行表单校验
    await regFormRef.value.validate()
    // 加载中
    loading.value = true

    const res = await register(regForm)
    // console.log(res)

    if (res.code === 200) {
      loading.value = false
      // 提示注册成功
      ElMessage.success('注册成功，请登录！')
      setTimeout(() => {
        router.push('/login')
      }, 500)
    } else {
      ElMessage.error(res.msg || '注册失败，请重试！')
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
const handleToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <!-- 父容器 -->
  <div class="auth-container">
    <!-- 中间盒子 -->
    <div class="auth-card">
      <!-- 左侧装饰 -->
      <div class="auth-left">
        <div class="auth-section">
          <el-icon :size="60" color="#ffffff">
            <Reading></Reading>
          </el-icon>
          <h1>海事图书管理系统</h1>
          <p>Maritime Library Manager System</p>
          <p class="auth-text">加入我们,开启阅读之旅</p>
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h1>创建账号</h1>
          <p>请填写以下信息完成注册</p>
          <el-form ref="regFormRef" :model="regForm" :rules="rules" label-width="auto" label-position="top" class="auth-form">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="regForm.username" placeholder="请输入注册用户名(用于登录)" size="large" clearable :prefix-icon="User" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                type="password"
                v-model="regForm.password"
                placeholder="请输入密码(6-20位字符)"
                size="large"
                clearable
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                type="password"
                v-model="regForm.confirmPassword"
                placeholder="请再次输入密码(6-20位字符)"
                size="large"
                clearable
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            <el-form-item label="注册角色" prop="roleId">
              <el-select v-model="regForm.roleId" placeholder="请选择角色" size="large">
                <template #prefix>
                  <el-icon><Menu></Menu></el-icon>
                </template>
                <el-option label="普通读者" value="3" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" @click="handleRegister" :loading="loading" style="width: 100%">
                <span v-if="!loading">注 册</span>
                <span v-else>注 册 中...</span>
              </el-button>
            </el-form-item>

            <div class="auth-form-footer">
              <span>已有账号?</span>
              <el-link underline="never" type="primary" @click="handleToLogin" class="auth-form-link">立即登录</el-link>
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <!-- 底部版权信息 -->
    <div class="auth-copyright">
      <span>&copy;&nbsp;2026 海事图书管理系统. All Rights Reserved.</span>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
