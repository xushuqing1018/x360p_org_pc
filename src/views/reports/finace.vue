<template>
	<div class="c-grid">
	    <Tabs v-model="current_tab">
	    	<TabPane label="收支汇总表" name="iae">
	    		<finace-iae v-if="current_tab=='iae'"></finace-iae>
	    	</TabPane>
	    	<TabPane label="确实收入表" name="ai">
	    		<finace-ai v-if="current_tab=='ai'"></finace-ai>
	    	</TabPane>
			<TabPane label="收入明细+汇总表" name="info">
	    		<finace-info v-if="current_tab=='info'"></finace-info>
	    	</TabPane>
	    </Tabs>
	</div>
</template>
<script>

    import finaceIae from './finace/iae.vue'
    import finaceAi from './finace/ai.vue'
    import finaceInfo from './finace/info.vue'

	export default {
		components: {
            finaceIae,
			finaceAi,
			finaceInfo
		},
		data() {
			return {
				current_tab: 'iae'
			}
		}
	}
</script>