<template>
  <div class="min-h-screen flex flex-col overflow-x-clip">
    <PocShellHeader />

    <main class="flex-1 fr-container">
      <slot />
    </main>

    <PocShellFooter />
  </div>
</template>
