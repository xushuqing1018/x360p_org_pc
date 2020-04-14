<template>
	<Tabs type="card" v-model="current_tab">
		<TabPane label="按来源" name="from">
			<from-did v-if="current_tab=='from'"></from-did>
		</TabPane>
		<TabPane label="按意向" name="level">
			<intention-level v-if="current_tab=='level'"></intention-level>
		</TabPane>
	</Tabs>
</template>
<script>
	import FromDid from './customerstats/from-did.vue'
	import IntentionLevel from './customerstats/intention-level.vue'
	export default {
		components: {
			FromDid,
			IntentionLevel
		},
		data() {
			return {
				current_tab: 'from'
			}
		}
	}
</script>