<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="600">		
		<Tabs type="card" v-model="tab">
	        <TabPane :label="label_teacher_terminal" name="1"></TabPane>
	        <TabPane label="家长端" name="2"></TabPane>
	    </Tabs>
		
		<div class="link-container">
			<div class="row">
				<RadioGroup v-model="path">
				<div class="col-md-4" v-for="(item,index) in list" :key="index">					
			        <Radio :label="item.path">{{item.name}}</Radio>				    
				</div>
				</RadioGroup>
			</div>
		</div>
		
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import common from '@/libs/common.mixin'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	
	export default{
		mixins: [ common,modal ],
		data () {
			return {
				path: '',
				tab: '1',	//1:老师端，2：家长端(学习管家)
				org: [
					{ path: 'home/home', name: '首页' },
					{ path: 'home/rollcall', name: '点名' },
					{ path: 'home/comment', name: '课评' },
					{ path: 'home/schedule', name: '课表' },
					{ path: 'home/news', name: '通知' },
					
					{ path: 'class/class', name: '班级列表' },
					{ path: 'my/my', name: '我的' }
				],
				student: [
					{ path: 'home/home', name: '首页' },
					{ path: 'home/schedules', name: '课表' },
					{ path: 'home/attendances', name: '考勤' },
					{ path: 'home/reviews', name: '课评' },
					
					{ path: 'lesson/mylesson', name: '我的课程' },
					{ path: 'lesson/class', name: '我的班级' },
					{ path: 'my/my', name: '我的' }
				]
			}
		},
		methods: {
			ok () {
				let baseUrl = this.$store.state.user.info.base_url
				let type = this.tab==1?'m':'student'
				let url = util.sprintf('%s/%s/#/%s',baseUrl,type,this.path)
				
				if(this.path==''){
					this.$Message.error('请选择链接')
					return
				}
				
				this.$emit('on-ok',url)
				this.close()
			}
		},
		computed: {
			list () {
				if(this.tab==1){
					return this.org
				}else{
					return this.student
				}
			}
		}
	}
</script>

<style>
</style>