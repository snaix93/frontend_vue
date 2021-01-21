export default {
  data() {
    return {
      trialPeriods: [
        {
          days: 30,
          savings: {
            USD: 80.00,
            EUR: 80.00,
          },
        },
        {
          days: 45,
          savings: {
            USD: 120.00,
            EUR: 120.00,
          },
        },
        {
          days: 60,
          savings: {
            USD: 160.00,
            EUR: 160.00,
          },
        },
        {
          days: 75,
          savings: {
            USD: 200.00,
            EUR: 200.00,
          },
        },
        {
          days: 90,
          savings: {
            USD: 240.00,
            EUR: 240.00,
          },
        },
      ],
    };
  },
  computed: {
    codeExp() {
      return /^[a-z]{2}(0|5)[a-z]([1-9])(ap|ht|qp|bk|et)$/i;
    },
  },
  methods: {
    fieldStateIcon(bool) {
      if (bool === true) {
        return 'check_circle';
      }
      if (bool === false) {
        return 'remove_circle';
      }

      return null;
    },
    getTrialPeriodFromCode(code) {
      const extractedDays = code.match(this.codeExp);

      if (extractedDays?.length) {
        const [, ones, tenths] = extractedDays;

        const days = parseInt(`${tenths}${ones}`);

        return this.trialPeriods.find(trialPeriod => trialPeriod.days === days);
      }
      return this.trialPeriods[0];
    },
  },
};
