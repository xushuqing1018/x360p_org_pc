<template>
	<Tabs v-model="tab">
		<TabPane label="加盟商" name='list'>
			<org-list v-if="tab=='list'"></org-list>
		</TabPane>
		<TabPane label="加盟商报表" name="report">
			<org-report v-if="tab=='report'"></org-report>
		</TabPane>
	</Tabs>
</template>
<script>
	import OrgList from './orgs/org-list.vue'
	import OrgReport from './orgs/org-report.vue'
	export default {
		components: {
			OrgList,
			OrgReport
		},
		data() {
			return {
				tab: 'list'
			}
		}
	}
</script>
