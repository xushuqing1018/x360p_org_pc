<template>
	<div>
		<customer :tagId="tagId" :tagName="tagName" :tagColor="tagColor" v-if="tagType==3"/>
		<student :tagId="tagId" :tagName="tagName" :tagColor="tagColor" v-if="tagType==1"/>
		<class :tagId="tagId" :tagName="tagName" :tagColor="tagColor" v-if="tagType==2"/>
		<arrange :tagId="tagId" :tagName="tagName" v-if="tagType==4"/>
	</div>
</template>

<script>
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import Customer from './tag/customer.vue'
import Student from './tag/student.vue'
import Class from './tag/class.vue'
import Arrange from './tag/arrange.vue'

export default {
	mixins: [common],
	components: {
		Customer,
		Student,
		Class,
		Arrange
	},
	data () {
		return {
			tagType: 1,
			tagId: 0,
			tagName: '',
			tagColor: ''
		}
	},
	created() {
		this.tagType = Number(this.$route.query.type);
		this.tagId = Number(this.$route.query.id);
		this.tagName = this.$route.query.name;
		this.tagColor = this.$route.query.color;
	},
	methods: {
	},
	beforeRouteUpdate (to, from, next) {
		this.tagType = Number(to.query.type);
		this.tagId = Number(to.query.id);
		this.tagName = to.query.name;
		this.tagColor = to.query.color;
		next();
	},
}
</script>