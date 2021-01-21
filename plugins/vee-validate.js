import Vue from 'vue';
import VeeValidate from 'vee-validate';
import VeeFormGroup from '@/components/Plugins/VeeValidate/VeeFormGroup.vue';

import en from '@/lang/vee-validate/en-GB';
import de from '@/lang/vee-validate/de-DE';
import es from '@/lang/vee-validate/es-ES';
import pt from '@/lang/vee-validate/pt-PT';

Vue.use(VeeValidate, {
  errorBagName: 'validationErrors',
  fieldsBagName: 'veeFields',
  dictionary: {
    en,
    de,
    es,
    pt,
  },
});

Vue.component('VeeFormGroup', VeeFormGroup);
