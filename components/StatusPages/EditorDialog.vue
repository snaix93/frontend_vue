<template>
  <div class="tiptap-editor">
    <editor-menu-bubble
      v-slot="{ commands, isActive, getMarkAttrs, menu }"
      class="menububble"
      :editor="editor"
      @hide="hideLinkMenu"
    >
      <div
        class="menububble"
        :class="{ 'is-active': menu.isActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
      >
        <form
          v-if="linkMenuIsActive"
          class="menububble__form"
          @submit.prevent="setLinkUrl(commands.link, linkUrl)"
        >
          <input
            ref="linkInput"
            v-model="linkUrl"
            class="menububble__input"
            type="text"
            placeholder="https://"
            @keydown.esc="hideLinkMenu"
          >

          <v-btn
            small
            flat
            icon
            color="white"
            @click="setLinkUrl(commands.link, null)"
          >
            <v-icon small>
              close
            </v-icon>
          </v-btn>
        </form>

        <template v-else>
          <button
            class="mr-1"
            :class="{ 'is-active': isActive.bold() }"
            @click.stop.prevent="commands.bold"
          >
            <v-icon color="white">
              format_bold
            </v-icon>
          </button>

          <button
            class="mr-1"
            :class="{ 'is-active': isActive.italic() }"
            @click.stop.prevent="commands.italic"
          >
            <v-icon color="white">
              format_italic
            </v-icon>
          </button>

          <button
            class="mr-1"
            :class="{ 'is-active': isActive.bullet_list() }"
            @click.stop.prevent="commands.bullet_list"
          >
            <v-icon color="white">
              format_list_bulleted
            </v-icon>
          </button>

          <button
            class="mr-1"
            :class="{ 'is-active': isActive.ordered_list() }"
            @click.stop.prevent="commands.ordered_list"
          >
            <v-icon color="white">
              format_list_numbered
            </v-icon>
          </button>

          <button
            class="mr-1"
            :class="{ 'is-active': isActive.paragraph({ textAlign: 'left' }) }"
            @click.stop.prevent="commands.paragraph({ textAlign: 'left' })"
          >
            <v-icon color="white">
              format_align_left
            </v-icon>
          </button>

          <button
            class="mr-1"
            :class="{ 'is-active': isActive.paragraph({ textAlign: 'center' }) }"
            @click.stop.prevent="commands.paragraph({ textAlign: 'center' })"
          >
            <v-icon color="white">
              format_align_center
            </v-icon>
          </button>

          <button
            class="mr-1"
            :class="{ 'is-active': isActive.paragraph({ textAlign: 'right' }) }"
            @click.stop.prevent="commands.paragraph({ textAlign: 'right' })"
          >
            <v-icon color="white">
              format_align_right
            </v-icon>
          </button>

          <button
            :class="{ 'is-active': isActive.link() }"
            @click.stop.prevent="showLinkMenu(getMarkAttrs('link'))"
          >
            <v-icon color="white">
              insert_link
            </v-icon>
          </button>
        </template>
      </div>
    </editor-menu-bubble>

    <div
      class="mt-3 v-input v-textarea v-textarea--auto-grow v-textarea--no-resize v-text-field v-text-field--box v-text-field--enclosed theme--light"
      :class="{'error--text': !!errorMessages}"
    >
      <div class="v-input__control">
        <div class="v-input__slot pa-0">
          <label
            aria-hidden="true"
            class="v-label v-label--active theme--light pr-2"
            :class="{'error--text': !!errorMessages}"
            style="left: 10px; top: 15px; right: auto; position: absolute;"
          >
            {{ label }} <span
              v-if="!!isOptional"
              class="font-italic"
            >({{ $t('phrase.optional') }})</span>
          </label>
          <editor-content
            class="editor__content"
            :editor="editor"
          />
        </div>

        <v-layout
          align-start
          justify-space-between
          pt-0
          mt-0
        >
          <v-flex
            v-if="!!errorMessages"
            shrink
            pb-0
            class="v-text-field__details"
          >
            <div class="v-messages theme--light error--text">
              <div class="v-messages__wrapper">
                <div class="v-messages__message">
                  {{ errorMessages }}
                </div>
              </div>
            </div>
          </v-flex>
          <v-flex
            v-else-if="!!hint"
            shrink
            pb-0
            class="v-text-field__details text-xs-right"
          >
            <div class="v-messages theme--light">
              <div class="v-messages__wrapper">
                <div class="v-messages__message">
                  * {{ hint }}
                </div>
              </div>
            </div>
          </v-flex>
          <v-flex
            v-if="!!counter"
            shrink
            pb-0
            class="v-text-field__details text-xs-right"
          >
            <div
              class="v-messages theme--light"
              :class="{'error--text': isOverCounterMax }"
            >
              <div class="v-messages__wrapper">
                <div class="v-messages__message">
                  {{ counterNumerator }} / {{ counter }}
                </div>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </div>
    </div>
  </div>
</template>

<script>
  import { Editor, EditorContent, EditorMenuBubble } from 'tiptap';
  import {
    Bold,
    BulletList,
    HardBreak,
    Italic,
    Link,
    ListItem,
    OrderedList,
  } from 'tiptap-extensions';
  import Paragraph from '@/components/StatusPages/Paragraph';

  export default {
    components: { EditorContent, EditorMenuBubble },
    props: {
      value: {
        type: String,
        required: false,
        default() {
          return '';
        },
      },
      active: {
        type: Boolean,
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
      counter: {
        type: [Number, Boolean],
        required: false,
        default() {
          return false;
        },
      },
      isOptional: {
        type: Boolean,
        required: false,
        default() {
          return false;
        },
      },
      hint: {
        type: String,
        required: false,
        default() {
          return '';
        },
      },
      errorMessages: {
        type: String,
        required: false,
        default() {
          return '';
        },
      },
    },
    data() {
      return {
        editor: null,
        linkUrl: null,
        linkMenuIsActive: false,
        counterNumerator: 0,
      };
    },
    computed: {
      isOverCounterMax() {
        return this.counterNumerator > this.counter;
      },
    },
    watch: {
      active: {
        handler(isActive) {
          if (isActive && this.editor != null) {
            this.editor.setContent(this.value);
            this.setCounterNumerator(this.value ? this.value : '');
          }
        },
        immediate: true,
      },
    },
    mounted() {
      this.editor = new Editor({
        extensions: [
          new BulletList(),
          new ListItem(),
          new OrderedList(),
          new Link(),
          new Bold(),
          new Italic(),
          new HardBreak(),
          new Paragraph(),
        ],
        onUpdate: (content) => {
          this.setCounterNumerator(content.getHTML());
          if (+this.counterNumerator === 0) {
            this.$emit('input', '');
          } else {
            this.$emit('input', content.getHTML());
          }
        },
      });
      this.editor.setContent(this.value);
    },
    beforeDestroy() {
      this.editor.destroy();
    },
    methods: {
      setCounterNumerator(string = '') {
        this.counterNumerator = this.stripHTML(string).length;
      },
      stripHTML(string = '') {
        if (string) {
          string = string.replace(/(<([^>]+)>)/ig, '');
        }
        return string;
      },
      showLinkMenu(attrs) {
        this.linkUrl = attrs.href;
        this.linkMenuIsActive = true;
        this.$nextTick(() => {
          this.$refs.linkInput.focus();
        });
      },
      hideLinkMenu() {
        this.linkUrl = null;
        this.linkMenuIsActive = false;
      },
      setLinkUrl(command, url) {
        command({ href: url });
        this.hideLinkMenu();
        this.editor.focus();
      },
    },
  };
</script>

<style lang="stylus">
  .tiptap-editor
    .v-input.error--text
      .v-input__slot
        &:before
          border-color inherit
    .v-input__slot
      margin-bottom: 0 !important

    .ProseMirror
      outline: none !important
      margin 0 !important
      padding 0 12px !important
      height 100% !important

    .editor__content
      margin-top 24px !important
      width 100% !important
      font-family 'consolas', monospace

    .menububble
      position: absolute;
      display: flex;
      z-index: 20;
      background: #000;
      border-radius: 5px;
      padding 5px
      margin-bottom: 5px;
      transform: translateX(-50%);
      visibility: hidden;
      opacity: 0;
      transition: opacity .2s, visibility .2s;

      &.is-active
        opacity: 1;
        visibility: visible;

      .menububble__form
        display: flex;
        align-items: center;

        .menububble__input
          font: inherit;
          border: none;
          background: #F0F0F0;
          border-radius 3px
          padding: 5px
</style>
