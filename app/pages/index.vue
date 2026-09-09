<script setup lang="ts">
const localePath = useLocalePath()
await navigateTo(localePath('/mvp'), { redirectCode: 302 })
</script>

<template>
  <p class="sr-only">
    {{ $t('redirect.toCatalogue') }}
  </p>
</template>
