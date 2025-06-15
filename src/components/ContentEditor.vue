<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  maxLength?: number
  showCharCount?: boolean
  autoResize?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容...',
  maxLength: 1000,
  showCharCount: true,
  autoResize: true,
  disabled: false
})

const emit = defineEmits<Emits>()

const textareaRef = ref<HTMLTextAreaElement>()
const isFocused = ref(false)

// 字符计数
const charCount = ref(0)

// 自动调整高度
const autoResizeTextarea = async () => {
  if (!props.autoResize || !textareaRef.value) return
  
  await nextTick()
  const textarea = textareaRef.value
  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
}

// 监听内容变化
watch(() => props.modelValue, (newValue) => {
  charCount.value = newValue.length
  autoResizeTextarea()
}, { immediate: true })

// 输入处理
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const value = target.value
  
  if (value.length <= props.maxLength) {
    emit('update:modelValue', value)
    charCount.value = value.length
  } else {
    // 截断到最大长度
    const truncated = value.substring(0, props.maxLength)
    target.value = truncated
    emit('update:modelValue', truncated)
    charCount.value = truncated.length
  }
  
  autoResizeTextarea()
}

// 焦点处理
const handleFocus = () => {
  isFocused.value = true
  emit('focus')
}

const handleBlur = () => {
  isFocused.value = false
  emit('blur')
}

// 插入文本
const insertText = (text: string, cursorPosition?: number) => {
  if (!textareaRef.value) return
  
  const textarea = textareaRef.value
  const start = cursorPosition ?? textarea.selectionStart
  const end = cursorPosition ?? textarea.selectionEnd
  const currentValue = props.modelValue
  
  const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
  
  if (newValue.length <= props.maxLength) {
    emit('update:modelValue', newValue)
    
    nextTick(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    })
  }
}

// 暴露方法给父组件
defineExpose({
  insertText,
  focus: () => textareaRef.value?.focus()
})
</script>

<template>
  <div class="content-editor">
    <div 
      class="relative border rounded-lg transition-all duration-200"
      :class="[
        isFocused 
          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' 
          : 'border-gray-300 dark:border-gray-600',
        disabled ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'
      ]"
    >
      <textarea
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxLength"
        class="w-full p-4 bg-transparent border-none outline-none resize-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        :class="autoResize ? 'min-h-[120px]' : 'h-32'"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <!-- 字符计数 -->
      <div 
        v-if="showCharCount"
        class="absolute bottom-2 right-2 text-xs transition-colors duration-200"
        :class="charCount > maxLength * 0.9 
          ? 'text-red-500' 
          : charCount > maxLength * 0.7 
            ? 'text-yellow-500' 
            : 'text-gray-400 dark:text-gray-500'"
      >
        {{ charCount }}/{{ maxLength }}
      </div>
    </div>
    
    <!-- 工具栏 -->
    <div class="flex items-center justify-between mt-2">
      <div class="flex space-x-2">
        <button
          @click="insertText('😊')"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
          title="插入表情"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        <button
          @click="insertText('#')"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
          title="插入标签"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        </button>
        
        <button
          @click="insertText('@')"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
          title="提及用户"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
      
      <div class="text-xs text-gray-400 dark:text-gray-500">
        {{ autoResize ? '自动调整高度' : '' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-editor textarea {
  font-family: inherit;
  line-height: 1.5;
}

.content-editor textarea::-webkit-scrollbar {
  width: 4px;
}

.content-editor textarea::-webkit-scrollbar-track {
  background: transparent;
}

.content-editor textarea::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.content-editor textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>