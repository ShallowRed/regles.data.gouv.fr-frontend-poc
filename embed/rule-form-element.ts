import { defineCustomElement } from 'vue'
import RuleForm from '../app/components/RuleForm.vue'
import '@gouvminint/vue-dsfr/styles'

// Rendered in the light DOM so that the DSFR stylesheet of the host page applies
customElements.define('regle-formulaire', defineCustomElement(RuleForm, { shadowRoot: false }))
