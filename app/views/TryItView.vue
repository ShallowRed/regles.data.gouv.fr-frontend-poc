<script setup lang="ts">
import { recordPath } from '#layers/web/routes'

const route = useRoute()
const identifier = String(route.params.identifier)
const { datapiUrl } = useRuntimeConfig().public

const { data: detail } = await useFetch(`/api/records/${identifier}`)
if (!detail.value) {
  throw createError({ statusCode: 404, statusMessage: 'Règle introuvable', fatal: true })
}
useHead({ title: `Essayer : ${detail.value.title}` })
</script>

<template>
  <article>
    <UiPageHeader
      :title="detail!.title"
      :lead="detail!.description"
      :breadcrumb="{ links: [{ label: 'Accueil', to: '/' }, { label: detail!.title, to: recordPath(identifier) }], current: 'Essayer' }"
    />
    <UiPageBody>
      <div class="fr-grid-row">
        <div class="fr-col-12 fr-col-md-8">
          <h2>Vos informations</h2>
          <ClientOnly>
            <RuleForm
              :rule="identifier"
              :service="datapiUrl"
            />
          </ClientOnly>
        </div>
      </div>
    </UiPageBody>
  </article>
</template>
