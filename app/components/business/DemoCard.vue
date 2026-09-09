<script setup lang="ts">
defineProps<{
  demo: Demo
}>()

const localePath = useLocalePath()
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
            :to="localePath(demo.route)"
          >
            {{ $t(`demos.${demo.slug}.title`) }}
          </NuxtLink>
          <span v-else>{{ $t(`demos.${demo.slug}.title`) }}</span>
        </h3>

        <p class="fr-card__desc">
          {{ $t(`demos.${demo.slug}.hypothesis`) }}
        </p>
      </div>
    </div>
  </article>
</template>
