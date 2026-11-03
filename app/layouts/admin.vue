<template>
  <TooltipProvider>
    <div class="min-h-screen bg-bg-canvas">
      <LayoutAdminSidebar />
      <div class="flex min-h-screen flex-col pl-[250px]">
        <LayoutAdminHeader />
        <main class="w-full flex-1 bg-bg-canvas pt-16">
          <slot />
        </main>
      </div>
    </div>
  </TooltipProvider>
</template>
