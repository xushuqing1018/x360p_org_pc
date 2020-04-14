<template>
	<div class="my-arrange">
		<stu-and-class @on-change="changeList" @on-select="selectObject"></stu-and-class>
		<div class="my-arrange-list">
			<stu-arrange-list 
				v-if="type=='stu'" 
				:info="data1"
				@on-check="checkAll">
			</stu-arrange-list>
			<class-arrange-list 
				v-else 
				:info="data2"
				@on-check="checkAll">
			</class-arrange-list>
		</div>
	</div>
</template>
<script>
	import StuAndClass from './my-list/stu-and-class.vue'
	import ClassArrangeList from './my-list/class-arrange-list.vue'
	import StuArrangeList from './my-list/stu-arrange-list.vue'

	export default {
		components: {
			StuAndClass,
			ClassArrangeList,
			StuArrangeList
		},
		data() {
			return {
				type: 'stu',
				data1:{
					id: 0,
					name: '',
					lid:0
				},
				data2:{
					id: 0,
					name:'',
					lid:0
				}
			}
		},
		methods: {
			changeList(value) {
				this.type = value==1?'stu':'class'
			},
			selectObject(data) {
				if(data.type==1) {
					this.data1 = data
				}else{
					this.data2 = data
				}
			},
			checkAll(type) {
				this.$emit('on-check',type)
			}
		}
	}
</script>