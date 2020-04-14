<template>
	<div>
		<cs-list v-if="type=='list'" @changeType="changeType"/>
		<cs-view v-if="type=='view'" @changeType="changeType"/>
	</div>
</template>

<script>
import CsList from './course-standard-file/list.vue'
import CsView from './course-standard-file/view.vue'

export default{
	components: {
		CsList,
		CsView
	},
	data () {
		return {
			type: 'list'
		}
	},
	methods: {
		changeType() {
			if(this.type == 'list') {
				this.type = 'view'
			} else {
				this.type = 'list'
			}
		}
	}
}
</script>