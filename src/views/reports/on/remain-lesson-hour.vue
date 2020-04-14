<template>
	<div>
		<by-remain-detail v-if="type=='detail'" @on-change="type='summary'"></by-remain-detail>
		<by-remain-summary v-else @on-change="type='detail'"></by-remain-summary>
	</div>
</template>
<script>
	import ByRemainDetail from './by-remain-detail.vue'
	import ByRemainSummary from './by-remain-summary.vue'
	export default {
		components: {
			ByRemainSummary,
			ByRemainDetail
		},
		data() {
			return {
				type: 'detail'
			}
		}
	}
</script>