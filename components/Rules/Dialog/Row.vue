<template>
  <v-layout
    row
    wrap
    class="pt-4 mt-0"
  >
    <v-flex
      xs12
      md2
      class="pr-3"
    >
      <div class="section-subheaders mb-2 grey lighten-2 pa-3">
        <span class="font-weight-medium subheading text-capitalize">
          <slot name="title"/>
        </span>
      </div>
    </v-flex>

    <v-flex
      xs12
      md10
    >
      <slot/>
    </v-flex>
  </v-layout>
</template>
