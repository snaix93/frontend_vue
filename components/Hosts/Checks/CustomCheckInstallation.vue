<template>
  <div
    class="custom-check--how-to-send-data mt-4"
  >
    <v-layout
      class="mb-3"
      row
      wrap
      align-center
    >
      <h3 class="subheading">
        {{ $t('checks.howToSendData') | capitalize }}
      </h3>
      <v-spacer />
      <v-flex xs5>
        <v-select
          v-model="selectedOption"
          :items="options"
          item-text="label"
          item-value="value"
          class="ma-0 pa-0"
          hide-details
        />
      </v-flex>
    </v-layout>

    <div class="custom-check--command-preview">
      <CopyField
        compact
        :to-copy="toCopy"
        :success="copySuccess"
        :custom-element="$el"
        @copy="onCopy"
      >
        {{ $t('checks.installation.copyCommand') }}
      </CopyField>

      <div
        class="custom-check--command-preview--content"
        ref="command-preview"
      >
        <pre
          class="mb-2"
          v-if="selectedOption === 'csender'"
        >
  csender -t {{check.token}} \
   -u {{hubUrl}}/cct/ \
   -n {{check.name}} \
   -s 1 \
   -a "This text triggers an alert. Optional" \
   -w "This text triggers a warning. Optional" \
   any_number=1 \
   any_float=0.1245 \
   any_string="Put your check result here"</pre>
      <pre
        class="mb-2"
        v-if="selectedOption === 'curl'"
        >
  curl -X POST \
    {{hubUrl}}/cct/ \
    -H 'X-CustomCheck-Token: {{check.token}}' \
    -d '{
      "{{check.name}}.success":1,
      "{{check.name}}.any_string":"Put your check result here as text",
      "{{check.name}}.any_number": 12345,
      "{{check.name}}.any_float": 0.1245,
      "{{check.name}}.alert": "This text triggers an alert. Optional.",
      "{{check.name}}.warning": "This text triggers a warning. Optional"
    }'</pre>
        <pre
          class="mb-2"
          v-else-if="selectedOption === 'powershell'"
        >
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -UseBasicParsing {{hubUrl}}/cct/ `
    -Headers @{'X-CustomCheck-Token' = '{{check.token}}'} `
    -Method POST `
    -Body '{
        "{{check.name}}.success":1,
        "{{check.name}}.any_string":"Put your check result here as text",
        "{{check.name}}.any_number": 12345,
        "{{check.name}}.any_float": 0.1245,
        "{{check.name}}.alert": "This text triggers an alert. Optional.",
        "{{check.name}}.warning": "This text triggers a warning. Optional"
        }'</pre>
        <pre
          class="mb-2"
          v-else-if="selectedOption === 'python'"
        >
  #!/usr/bin/env python
  import requests
  from sys import stderr,exit

  token = '{{check.token}}'
  url = "{{hubUrl}}/cct/"
  payload = {
    "{{check.name}}.success":1,
    "{{check.name}}.any_string":"Put your check result here as text",
    "{{check.name}}.any_number": 12345,
    "{{check.name}}.any_float": 0.1245,
    "{{check.name}}.alert": "This text triggers an alert. Optional.",
    "{{check.name}}.warning": "This text triggers a warning. Optional"
    }
  headers = { 'X-CustomCheck-Token': token }

  response = requests.request("POST", url, json=payload, headers=headers)
  if response.status_code != 204:
    stderr.write("Sending data failed. " + response.text + "\n" )
    exit(response.status_code)

  print("All data sent.")</pre>
      </div>

    </div>
    <v-alert
      :value="selectedOption === 'csender'"
      class="mt-3"
      type="info"
      outline
    >
      {{
        $t('checks.csenderHint') | capitalize
      }}
    </v-alert>
    <div class="mt-4">
      <a
        href="https://docs.cloudradar.io/configuring-hosts/managing-checks/custom-checks"
        class="custom-check--info-link"
        target="_blank"
      >{{
        $t('checks.learnMoreAboutCustomChecks') | capitalize
      }}</a>
    </div>
  </div>
</template>

<script>
  import appMixins from '@/mixins/app';

  import CopyField from '@/components/App/CopyField';

  export default {
    props: {
      check: {
        type: Object,
        required: true,
      },
    },
    mixins: [appMixins],
    components: {
      CopyField,
    },
    data() {
      return {
        selectedOption: 'csender',
        options: [
          {
            label: this.$t('checks.installation.csender'),
            value: 'csender',
          },
          {
            label: this.$t('checks.installation.curl'),
            value: 'curl',
          },
          {
            label: this.$t('checks.installation.powershell'),
            value: 'powershell',
          },
          {
            label: this.$t('checks.installation.python'),
            value: 'python',
          },
        ],
        toCopy: '',
        copySuccess: false,
      }
    },
    watch: {
      selectedOption() {
        this.$nextTick(() => {
          this.getCommandText();
        });
      },
    },
    mounted() {
      this.getCommandText();
    },
    methods: {
      getCommandText() {
        const el = this.$refs['command-preview'];

        if(!el)
          return;

        this.toCopy = el.querySelector('pre').innerHTML;
        this.copySuccess = false;
      },
      onCopy() {
        this.copySuccess = true;
      }
    },
  }
</script>

<style lang="stylus">
  .custom-check--command-preview
    position: relative;
    border: 1px solid black

    &--content {
      padding: 16px
      overflow: auto
    }

    .v-tooltip
      position: absolute;
      right: 0;
      bottom: 0;

      .v-chip
        border-top-right-radius: 0;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        margin: 0;

    pre
      font-size: 14px
      font-family: 'consolas', monospace
</style>
