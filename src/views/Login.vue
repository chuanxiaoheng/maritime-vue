<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { User, Lock, Reading } from '@element-plus/icons-vue'
// import request from '@/utils/request'
import { login } from '@/api/auth/auth.js'
const router = useRouter()

const store = useStore()

// 表单组件引用
const loginFormRef = ref(null)

// 加载中
const loading = ref(false)

// 表单数据
const loginForm = reactive({
  username: '', // 用户名
  password: '', // 密码
  roleId: '3', // 角色Id(普通读者)
})

// 表单校验规则
const rules = reactive({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' },
  ],
  roleId: { required: true, message: '请选择登录角色', trigger: 'change' },
})

// 执行登录
const handleLogin = async () => {
  // 防止在DOM元素未成功挂载或者引用失效时执行后续逻辑，避免出错
  if (!loginFormRef.value) return

  // 验证表单数据
  await loginFormRef.value.validate((valid) => {
    // 校验不通过，不执行后续操作
    if (!valid) return
    // 加载中
    loading.value = true

    // 请求登录
    // 可以使用链式调用
    login(loginForm)
      .then((res) => {
        // console.log(res)
        // 根据状态码判断是否登录成功
        // if (res.data.code == 200) {
        // 优化：axios 响应拦截器处理后，返回的响应就是结果，无需res.data.code
        if (res.code == 200) {
          // TODO 保存用户数据-基于vuex状态管理
          store.dispatch('login', {
            user: res.data,
          })
          // 提示登录成功
          ElMessage.success('登录成功')

          // 跳转主页
          router.push('/')
          // 优化: 响应拦截后，统一处理非200响应码的请求，无需重复处理
        }
        //  else {
        //   ElMessage.error(res.msg || '登录失败!')
        // }
      })
      .catch((error) => {
        console.log(`登录失败：${error}`)
      })
      .finally(() => {
        loading.value = false
      })
  })
}
// 跳转登录
const handleToRegister = () => {
  router.push('/register')
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
          <p class="auth-text">让阅读成为一种习惯，让知识改变人生</p>
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h1>欢迎登录</h1>
          <p>请正确填写登录账号</p>
          <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="auth-form">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="请输入账号" size="large" clearable :prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                type="password"
                v-model="loginForm.password"
                placeholder="请输入密码(6-20位字符)"
                size="large"
                clearable
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item prop="roleId">
              <el-select v-model="loginForm.roleId" placeholder="请选择角色" size="large">
                <template #prefix>
                  <el-icon><Menu></Menu></el-icon>
                </template>
                <el-option label="普通读者" value="3" />
                <el-option label="图书管理员" value="2" />
                <el-option label="系统管理员" value="1" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" size="large" @click="handleLogin" :loading="loading" class="auth-form-btn">
                <span v-if="!loading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
            </el-form-item>

            <div class="auth-form-footer">
              <span>还没有账号?</span>
              <el-link underline="never" type="primary" @click="handleToRegister" class="auth-form-link">立即注册</el-link>
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
