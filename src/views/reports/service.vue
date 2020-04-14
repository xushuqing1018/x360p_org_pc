<template>
	<div class="c-grid">
	    <Tabs v-model="current_tab">
	    	<TabPane label="系统内置服务" name="system">
	    		<by-system v-if="current_tab=='system'"></by-system>
	    	</TabPane>
	    	<TabPane label="自定义服务" name="custom">
	    		<by-custom v-if="current_tab=='custom'"></by-custom>
	    	</TabPane>
	    </Tabs>
	</div>
</template>
<script>
    import BySystem from './service/by-system.vue'
    import ByCustom from './service/by-custom.vue'
    import ByTrial from './service/by-trial.vue'
	import common from '@/libs/common.mixin'


	export default {
		mixins: [common],
		components: {
            BySystem,
            ByCustom,
            ByTrial
		},
		data() {
			return {
				current_tab: 'system'
			}
		}
	}
</script>