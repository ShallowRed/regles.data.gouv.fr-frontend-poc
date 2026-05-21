<script setup lang="ts">
defineProps<{
  demo: Demo
}>()
</script>

<template>
  <article
    class="fr-card fr-enlarge-link"
    :aria-labelledby="`demo-${demo.slug}-title`"
  >
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3
          :id="`demo-${demo.slug}-title`"
          class="fr-card__title"
        >
          <NuxtLink
            v-if="demo.route"
            :to="demo.route"
          >
            {{ demo.title }}
          </NuxtLink>
          <span v-else>{{ demo.title }}</span>
        </h3>

        <p class="fr-card__desc">
          {{ demo.hypothesis }}
        </p>
      </div>
    </div>
  </article>
</template>
