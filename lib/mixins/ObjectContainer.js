export default {
  data() {
    return {
      folded: true
    }
  },
  computed: {
    foldable() {
      return this.options.autoFoldObjects && this.parentKey && this.fullSchema.title
    }
  },
  methods: {
    renderObjectContainer(h) {
      if (this.fullSchema.type !== 'object') return
      const children = []

      // title block
      if (this.fullSchema.title) {
        children.push(h('v-subheader', {
          style: this.foldable ? 'cursor:pointer;' : '',
          class: 'mt-2',
          on: { click: () => { this.folded = !this.folded } }
        }, [
          `${this.fullSchema.title}\xa0`,
          this.foldable && this.folded && h('v-icon', this.options.icons.dropdown),
          this.foldable && !this.folded && h('v-icon', this.options.icons.dropup)
        ]))
      }

      const transmitOn = {
        error: e => this.$emit('error', e),
        input: err => this.$emit('input', err),
        change: err => this.$emit('change', err)
      }

      // all sub properties in a foldable container below the title
      children.push(h('v-slide-y-transition', [
        h('v-layout', {
          attrs: { row: true, wrap: true },
          class: 'ma-0',
          style: this.foldable && this.folded && 'display: none;'
        }, [this.fullSchema.description && h('p', { domProps: { innerHTML: this.htmlDescription } })]
          .concat(this.fullSchema.properties.map(childProp => h('property', {
            props: {
              schema: childProp,
              modelWrapper: this.modelWrapper[this.modelKey],
              modelRoot: this.modelRoot,
              modelKey: childProp.key,
              parentKey: `${this.fullKey}.`,
              required: !!(this.fullSchema.required && this.fullSchema.required.includes(childProp.key)),
              options: this.options
            },
            scopedSlots: this.childScopedSlots(childProp.key),
            on: transmitOn
          }, this.childSlots(h, childProp.key))))
        )
        // TODO propagate slots to children
      ]))

      return h('div', children)
    },
    // pass an  extract of $slots from current container to a child by matching then removing the prefix
    childSlots(h, childKey) {
      return Object.keys(this.$slots)
        .filter(slot => slot.startsWith(`${childKey}.`) || slot.startsWith(`${childKey}-`))
        .map(slot => {
          const childSlot = slot.startsWith(`${childKey}.`) ? slot.replace(`${childKey}.`, '') : slot.replace(`${childKey}-`, '')
          return h('template', { slot: childSlot }, this.$slots[slot])
        })
    },
    childScopedSlots(childKey) {
      return Object.keys(this.$scopedSlots)
        .filter(slot => slot.startsWith(`${childKey}.`) || slot.startsWith(`${childKey}-`) || slot === childKey)
        .reduce((a, slot) => {
          let childSlot = 'default'
          if (slot.startsWith(`${childKey}.`)) childSlot = slot.replace(`${childKey}.`, '')
          if (slot.startsWith(`${childKey}-`)) childSlot = slot.replace(`${childKey}-`, '')
          a[childSlot] = this.$scopedSlots[slot]
          return a
        }, {})
    }
  }
}