<template>
	<div class="box box-condition">
		<div class="condition-head">
			<p>课程 / 班级</p>				
		</div>
		<div class="filter-input">
			<Input 
				v-model="key" 
				size="small" 
				icon="search" 
				clearable
				placeholder="请输入课程名称过滤">
			</Input>
		</div>
		<div class="lesson-class" :style="{height:maxHeight+'px',overflow:'auto'}">
			<ul class="lessons">
				<li class="lesson-item" v-for="item in filterLessonClass">
					<div 
						:class="['lesson-name',{'active': current.lid==item.lid}]" 
						@click="clickLessonNode(item)"
						>
						<Icon :type="item.classes.length>0?'android-document':'document'"></Icon>
						<span>{{item.lesson_name}}</span>
						<Icon 
							v-if="item.classes.length>0"
							:type="item.expand$?'ios-minus':'ios-plus'" 
							class="cursor" 
							@click.native.stop="item.expand$=!item.expand$">
						</Icon>
					</div>
					<ul class="classes" v-if="item.classes.length>0&&item.expand$">
						<li class="class-item" v-for="c in item.classes">
							<i class="tree-icon tree-ocl"></i>
							<div 
								:class="['class-name',{'active': current.cid==c.cid}]" 
								@click="clickClassNode(c,item)"
								>
								<Icon type="home"></Icon>
								<span>{{c.class_name}}</span>
							</div>
						</li>
					</ul>
				</li>
				<li v-if="filterLessonClass.length==0" class="text-center">没有数据</li>
			</ul>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'

	export default {
		mixins: [grid,common],
		data() {
			return {
				lessonClass: [],
				key: '',
				current: {
					lid: 0,
					cid: 0,
					class_name: ''
				}
			}
		},
		mounted() {
			this.getLessonClass()
		},
		methods: {
			getLessonClass() {
				this.$rest('lessons').add_url_param(0,'classes')
				.get()
				.success(res => {
					res.list.forEach(item => {
						this.$set(item,'expand$',false)
						this.lessonClass.push(item)
					})
					if(this.lessonClass.length > 0) {
						this.current.lid = this.lessonClass[0].lid
						this.selectEmit()
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			clickLessonNode(item) {
				this.current.lid = item.lid
				this.current.cid = 0
				this.current.class_name = ''
				this.selectEmit()
			},
			clickClassNode(c,item) {
				this.current.cid  = c.cid
				this.current.class_name = c.class_name
				this.current.lid = item.lid
				this.selectEmit()
			},
			selectEmit() {
				this.$emit('on-change',{
					lid: this.current.lid,
					cid: this.current.cid,
					class_name: this.current.class_name
				})
			}
		},
		computed: {
			maxHeight() {
				return util.get_client_height() - 320
			},
			filterLessonClass() {
				if(!/^\s*$/.test(this.key)) {
					return this.lessonClass.filter(l => l.lesson_name.indexOf(this.key) > -1)
				}
				return this.lessonClass
			}
		}
	}
</script>