export default {
  methods: {
    inventory_OS(OSKernel, OSFamily, OSArch) {
      return (
        `${this.$options.filters.capitalize(
          OSKernel,
        )
        } ${
          this.$options.filters.capitalize(
            OSFamily,
          )
        } (${
          OSArch
        })`
      );
    },
    inventory_OSIcon(value) {
      let icon = null;
      if (
        value !== 'linux'
        && value !== 'windows'
      ) {
        icon = 'OS';
      } else {
        icon = `fab fa-${value} fa-lg`;
      }
      return icon;
    },
    inventory_cpuData(inventory) {
      const result = {
        cpu_total: 0,
        cpus: [],
        cpu_cores: 0,
        threads: 0,
      };

      let i = 0;

      while (i < 32) {
        if (inventory.hasOwnProperty(`cpu.${i}.core_count`)) {
          let cpu = {};

          result.cpu_total++;

          result.cpu_cores += Number(inventory[`cpu.${i}.core_count`]);
          cpu.core_count = Number(inventory[`cpu.${i}.core_count`]);

          if (inventory.hasOwnProperty(`cpu.${i}.thread_count`)) {
            result.threads += Number(inventory[`cpu.${i}.thread_count`]);
            cpu.thread_count = Number(inventory[`cpu.${i}.thread_count`]);
          }

          if (inventory.hasOwnProperty(`cpu.${i}.manufacturer`))
            cpu.manufacturer = inventory[`cpu.${i}.manufacturer`];

          if (inventory.hasOwnProperty(`cpu.${i}.manufacturer_info`))
            cpu.manufacturer_info = inventory[`cpu.${i}.manufacturer_info`];

          if (inventory.hasOwnProperty(`cpu.${i}.description`))
            cpu.description = inventory[`cpu.${i}.description`];

          result.cpus.push(cpu);
        }

        i++;
      }

      return result;
    },
  },
};
