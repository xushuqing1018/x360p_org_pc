<template>
	<table class="table-free-inner">
		<tbody>
			<tr v-for="num in tr_length_arr">
				<td width="118px" v-for="item in sort_data">
					<template v-if="type=='teacher_free'&&item.list.length == 0">&nbsp;</template>
					<template v-if="type=='teacher_free_available'&&item.time.length == 0">&nbsp;</template>
					<template v-else>
						<Tooltip placement="right">
							<span class="cursor">
								{{getTimeSection(item,num)}}
							</span>
							<div slot="content" v-if="getTimeSection(item,num)!==''&&type=='teacher_free'">
								<p>授课对象：{{getClassName(item,num)}}</p>
								<p>授课教室：{{getClassRoom(item,num)}}</p>
							</div>
							<div slot="content" v-if="type=='teacher_free_available'">
								<p>可用</p>
							</div>
						</Tooltip>
					</template>
				</td>
			</tr>
		</tbody>
	</table>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	function compare(property) {
		return function(a,b) {
			let value1 = a[property],value2 = b[property]
			return value1 - value2
		}
	}

	export default {
		mixins: [common,globals],
		props: {
			data: {
				type: Array,
				default:() => {
					return []
				}
			},
			type: {
				type: String,
				default:''
			}
		},
		data() {
			return {
			}
		},
		methods: {
			getTimeSection(item,num) {
				if(this.type == 'teacher_free') {
					if(item.list.length < num) {
						return '' 
					}else{
						return this.$filter('int_hour')(item.list[num-1].int_start_hour)+
						' ~ '+this.$filter('int_hour')(item.list[num-1].int_end_hour)
					}
				}
				else {
					if(item.time.length < num) {
						return '' 
					}else{
						return item.time[num-1].int_start_hour+
						' ~ '+item.time[num-1].int_end_hour
					}
				}
			},
			getClassName(item,num) {
				if(item.list.length < num) {
					return '' 
				}else{
					let lesson_type = item.list[num-1].lesson_type,
						one_class = item.list[num-1].one_class
					if(lesson_type == 0) {
						if(one_class) {
							return one_class.class_name + '(班课)'
						}
						return ''
					}else{
						return this.$filter('lesson_type')(lesson_type)
					}
				}
			},
			getClassRoom(item,num) {
				if(item.list.length < num) {
					return ''
				}else{
					return this.$filter('classroom_name')(item.list[num-1].cr_id)
				}
			},
			loopPush(arr,num) {
				arr.push(num)
				num -- 
				if(num > 0) {
					this.loopPush(arr,num)
				}
			}
		},
		computed: {
			tr_length_arr() {
				let maxLength = 0,maxLengthArr = []
				let type = this.type;
				this.data.forEach(i => {
					let iLength = 0;
					if(type == 'teacher_free') {
						iLength = i.list.length
					}
					else {
						iLength = i.time.length
					}
					if(iLength > maxLength) {
						maxLength = iLength
					}
				})
				if(maxLength == 0) {
					maxLengthArr.push(1)
				}else{
					this.loopPush(maxLengthArr,maxLength)
				}
				return maxLengthArr.reverse()
			},
			sort_data() {
				let copyData = util.copy(this.data)
				copyData.forEach(item => {
					if(item.list.length > 0) {
						// item.list = item.list.sort(compare('int_start_hour'))
						item.list = this.orderBy(item.list,'int_start_hour')
					}
					if(item.time.length > 0) {
						// item.list = item.list.sort(compare('int_start_hour'))
						item.time = this.orderBy(item.time,'int_start_hour')
					}
				})
				return copyData
			}
		},
	}
</script>