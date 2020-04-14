<template>
	<div class="my-arrange c-grid">
		<stu-and-class @on-change="changeList" @on-select="selectObject"></stu-and-class>
		<div class="my-arrange-list">
			<my-hour-list @on-check="checkAll" :extra-info="data"></my-hour-list>
		</div>
	</div>
</template>
<script>
	import StuAndClass from './my/student-and-class.vue'
	import MyHourList from './my/list.vue' 
	export default {
		components: {
			StuAndClass,
			MyHourList
		},
		data() {
			return {
				type: 'stu',
				data: Object.create(null)
			}
		},
		methods: {
			changeList(value) {
				this.type = value==1?'stu':'class'
			},
			selectObject(data) {
				this.data = data
				if(data.type==1) {
					this.data.param = 'sid'
				}else if(this.type==2){
					this.data.param = 'cid'
				}
			},
			checkAll(type) {
				this.$emit('on-check',type)
			}
		}
	}
</script>