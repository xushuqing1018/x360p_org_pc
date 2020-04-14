<style lang="less">
@import '~@/style/mixin.less';
.arrange-object{
	position:absolute;
	width:300px;
	right:10px;
	top:70px;
	z-index:1001;
	background:#fff;
	.drop-shadow(2px,4px,10px,0.6);
	.arrange-object-header{
		height:30px;
		line-height:30px;
		position:relative;
		border-bottom:1px solid #ccc;
		padding-left:5px;
		color:#000;
		font-weight:bold;
		.switch{
			position:absolute;
			display:block;
			top:0;
			right:5px;
			height:20px;
			width:80px;
			text-align:right;
			cursor:pointer;
		}
	}
	.arrange-object-tab{
		padding:5px;
		border-bottom:1px solid #ccc;
	}
	.arrange-object-body{
		padding:5px;
		.list-wrap{
			margin-top:5px;
			min-height:400px;
			max-height:460px;
			overflow-y:auto;
			.list-item{
				border-bottom:1px solid #f2f2f2;
				padding-top:5px;
				padding-bottom:5px;
				.drag {
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
			}
		}
	}
}
</style>
<template>
	<div class="arrange-object" v-drag="'.arrange-object-header'">
		<div class="arrange-object-header" @dblclick="toggleExpand">
			<Icon type="android-people"></Icon>排课对象
			<span class="switch" @click.stop="toggleExpand">
				<Icon type="chevron-down" v-if="isExpand"></Icon>
				<Icon type="chevron-right" v-else></Icon>
			</span>
		</div>
		<div class="arrange-object-tab" v-show="isExpand">
			<RadioGroup v-model="type" type="button" size="small">
		        <Radio :label="1" :disabled="disabled1">1对1</Radio>
		        <Radio :label="2" :disabled="disabled2">1对多</Radio>
		        <Radio :label="0" :disabled="disabled0">班级</Radio>
		    </RadioGroup>
		</div>
		<div v-show="isExpand">
			<div class="arrange-object-body">
				<template v-if="type == 1">
					<div class="list-filter">
		            	<Input size="small" v-model="data1.key" icon="search" placeholder="输入学员名称过滤"></Input>
		            </div>
		            <div class="list-wrap">
		            	<div class="list-item" v-for="item in data1.data">
		            	<drag 
		            	class="drag" 
		            	@dragstart="dragStart('object',item,1)"
		            	@dragend="dragEnd"
		            	:transferData="{field:'object',value:item,lesson_type:1}">
				          <Tag
		            	  v-if="isStudentSelect(item)"
		            	  closable
		            	  color="blue"
		            	  @on-close="clearSelect">
		            	  {{item.student.student_name}}-{{item.lid|lesson_name}}
		            	  </Tag>
				          <Tag 
						  v-else
				          type="border" 
				          color="blue"
				          @click="selectStudentLesson(item)"
				          >{{item.student.student_name}}-{{item.lid|lesson_name}}
				          </Tag>
				          <a
				          	v-if="enable_tbs&&item.last_tbs" 
				          	:title="last_tbs_title(item)"
				          	@click="getLprogress(item)"
				          	style="margin-left: 15px;"
				          	>
				          	<Icon type="pound"></Icon>
				          	{{item.last_tbs.section_title}}
				          </a>
				        </drag>
				        <template v-if="item.price_type==3">
				        	<span>{{item.expire_time_text}}：{{item.expire_time}}</span>
				        </template>
				        <Progress 
				        	v-else
				        	:percent="studentLessonArrangePercent(item)" 
				        	:stroke-width="5"
				        	>
				        	{{item.lesson_hours-item.remain_arrange_hours}}/{{Number(item.lesson_hours)}}
				        </Progress>
				        </div>
				        <p class="empty" v-if="filterList1.length == 0">没有搜索到匹配的学员</p>
		            </div>
				</template>
				<template v-if="type == 2">
					<div class="list-filter">
		            	<Input size="small" v-model="data2.key" icon="search" placeholder="输入学员名称过滤"></Input>
		            	<div style="margin-top: 6px;" v-if="enable_tbs">
			            	<select-textbook 
								size="small"	
								clearable
								v-model="tb.tb_id" 
								placeholder="请选择教材过滤" 
								@selected="selectTb"
								@on-clear="clearTb"
								style="width:143px;"
								>
							</select-textbook>
							<Select 
								v-model="tb.tbs_id" 
								size="small" 
								clearable 
								placeholder="请选择章节过滤" 
								@on-change="selectTbs"
								@on-clear="clearTbs" 
								style="width:143px;">
								<Option 
									:value="item.tbs_id" 
									v-for="item in tb.sectionData" 
									:key="item.sort"
									>
									第{{item.sort}}章 {{item.section_title}}
								</Option>
							</Select>
						</div>
		            </div>
		            <div class="list-wrap">
		            	<div class="list-item" v-for="item in data2.data">
		            	<drag 
		            	class="drag" 
		            	@dragstart="dragStart('object',item,2)"
		            	@dragend="dragEnd"
		            	:transferData="{field:'object',value:item,lesson_type:2}">
		            	  <Tag
		            	  v-if="isStudentSelect(item)"
		            	  closable
		            	  color="blue"
		            	  @on-close="clearSelect"
		            	  >
		            	  {{item.student.student_name}}-{{item.lid|lesson_name}}
		            	  </Tag>
				          <Tag 
						  v-else
				          type="border" 
				          color="blue"
				          @click="selectStudentLesson(item)"
				          >{{item.student.student_name}}-{{item.lid|lesson_name}}
				          </Tag>
				          <a
				          	v-if="enable_tbs&&item.last_tbs" 
				          	:title="last_tbs_title(item)"
				          	@click="getLprogress(item)"
				          	style="margin-left: 15px;"
				          	>
				          	<Icon type="pound"></Icon>
				          	{{item.last_tbs.section_title}}
				          </a>
				        </drag>
				        <template v-if="item.price_type==3">
				        	<span>{{item.expire_time_text}}：{{item.expire_time}}</span>
				        </template>
				        <Progress 
				          v-else
				          :percent="studentLessonArrangePercent(item)" 
				          :stroke-width="5"
				          >
				          {{item.lesson_hours-item.remain_arrange_hours}}/{{Number(item.lesson_hours)}}
				      	</Progress>
				        </div>
				        <p class="empty" v-if="filterList2.length == 0">没有搜索到匹配的学员</p>
		            </div>
				</template>
				<template v-if="type == 0">
					<div class="list-filter">
		            	<Input size="small" v-model="data0.key" icon="search" placeholder="输入班级名称过滤"></Input>
		            </div>
		            <div class="list-wrap">
		            	<div class="list-item" v-for="item in data0.data">
		            	<drag 
		            	class="drag" 
		            	@dragstart="dragStart('object',item,0)"
		            	@dragend="dragEnd"
		            	:transferData="{field:'object',value:item,lesson_type:0}">
				          <Tag 
				          v-if="isClassSelect(item)"
				          closable
				          color="blue"
				          @on-close="clearSelect"
				          >
				          {{item.class_name}}
				          </Tag>
				          <Tag
				          v-else
				          type="border"
				          color="blue"
				          @click="selectClass(item)"
				          >
				          {{item.class_name}}
				          </Tag>
				        </drag>
				          <Progress :percent="classArrangePercent(item)" :stroke-width="5">{{item.arrange_times}}/{{item.lesson_times}}</Progress>
				        </div>
				        <p class="empty" v-if="filterList0.length == 0">没有搜索到匹配的班级</p>
		            </div>
				</template>
			</div>
			<Page 
				class="m-2 text-right"
				size="small"
				show-total
	            :total="total" 
	            :current="pageIndex" 
	            @on-change="pagenation"
	            >
            </Page>
		</div>
	</div>
</template>
<script>
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import SelectTextbook from 'c%/SelectTextbook.vue'

export default {
	name:'arrangeObject',
	mixins:[common,globals],
	components: {
		SelectTextbook
	},
	props:{
		expand:{
			type: Boolean,
            default: true
		},
		conditions:{
			type:Object,
			default(){
				return {
					lessons:{
						current:{
							id:0
						}
					}
				}
			}
		}
	},
	data(){
		return {
			pageSize: 10,
			pageIndex: 1,
			total: 0,
			isExpand:this.expand,
			type:1,
			lid:0,
			data0:{
				url:'classes?class_type=0&status=[In,0,1]&arrange_times=[Exp,< `lesson_times`]&pagesize=10000',
				key:'',
				total:0,
				list:[],
				data: []
			},
			data1:{
//				&remain_arrange_times=[>,0]
				url:'student_lessons?lesson_status=[in,1,0]&is_package=[OR,EQ,1]&lesson_type=1&with=student&pagesize=10000&last_tbs=1',
				key:'',
				total:0,
				list:[],
				data: []
			},
			data2:{
//				&remain_arrange_times=[>,0]
				url:'student_lessons?lesson_status=[in,1,0]&is_package=[OR,EQ,1]&lesson_type=2&with=student&pagesize=10000&last_tbs=1',
				key:'',
				key2: '',
				key3: '',
				total:0,
				list:[],
				data: []
			},
			select:{
				type:-1,
				id:0,
				lid:0
			},
			condition_lesson_type:-1,
			tb: {
				tb_id: 0,
				tbs_id: 0,
				sectionData: []
			}
		}
	},
	watch:{
		type(val){
			this.get_data_list(val)
		},
		'conditions.lessons.current.id':function(val,oldval){
			if(val > 0){
				this.type = this.conditions.lessons.current.lesson_type
				this.condition_lesson_type = this.conditions.lessons.current.lesson_type
			}else{
				this.condition_lesson_type = -1
			}
		},
		//校区更换时 ，更新排课对象信息
		'$store.state.branch.id': function (val) {
			this.refreshDataList()
		},
		'data0.key':function() {
			this.$nextTick(() => {
				this.init_data(this.type)
			})
		},
		'data1.key':function() {
			this.$nextTick(() => {
				this.init_data(this.type)
			})
		},
		'data2.key':function() {
			this.$nextTick(() => {
				this.init_data(this.type)
			})
		},
		'data2.key2':function() {
			this.$nextTick(() => {
				this.init_data(this.type)
			})
		},
		'data2.key3':function() {
			this.$nextTick(() => {
				this.init_data(this.type)
			})
		}
	},
	mounted(){
		this.get_data_list(1)
	},
	methods:{
		getLprogress(item) {
			this.$Modal.open('business/arrange/learning-progress.vue@modal',{
				props: {
					'sl-id': item.sl_id 
				}
			})
			.then(modal => {
				modal.show(util.sprintf('【%s】【%s】学习进度',item.student.student_name,this.$filter('lesson_name')(item.lid)))
			})
		},
		last_tbs_title(item) {
			let result = ''
			if(item.last_tbs) {
				result = `${item.last_tbs.tb_name}第${item.last_tbs.sort}章`
			}
			return result
		},
		pagenation(page) {
			this.pageIndex = page
			this.$nextTick(() => {
				this.init_data(this.type)
			})
		},
		toggleExpand(){
			this.isExpand = !this.isExpand
		},
		get_data_list(type){
			let k = 'data'+type
			let url = this[k].url
			this.dr().refreshData(url)
			.then(response=>{
				this[k].list = response.list
				this[k].total = response.total
				this.total = response.total
				this.$nextTick(() => {
					this.init_data(type)
				})
			})
		},
		init_data(type) {
			let ret = [],
				index = 0,
				start = 0,
				end   = 0
			start = (this.pageIndex - 1) * this.pageSize
			end   = start + this.pageSize
			this['filterList'+type].forEach(l => {
				if(index>=start && index<end) {
					ret.push(util.copy(l))
				}
				index++
			})
			this.total = this['filterList'+type].length
			this['data'+type].data = ret
		},
		studentLessonArrangePercent(item){
			return (item.lesson_hours - item.remain_arrange_hours)*100/item.lesson_hours
		},
		classArrangePercent(item){
			return item.arrange_times * 100 / item.lesson_times
		},
		isStudentSelect(item){
			if(item.lesson_type == this.select.type && item.sid == this.select.id && item.lid == this.select.lid){
				return true
			}
			return false
		},
		isClassSelect(item){
			if(this.select.type == 0 && item.cid == this.select.id){
				return true
			}
			return false
		},
		setLid(lid){
			this.lid = lid
		},
		selectStudentLesson(item){	
			this.select.type = item.lesson_type
			this.select.id   = item.sid
			this.select.lid  = item.lid
			this.$emit('on-select-object',this.select)
		},
		selectClass(item){
			this.select.type = 0
			this.select.id   = item.cid
			this.$emit('on-select-object',this.select)
		},
		clearSelect(){
			this.select.id = 0
			this.select.type = -1
			this.$emit('on-select-clear')
		},
		dragStart(field,item,lesson_type){
			
			if(lesson_type>0&&item.remain_arrange_times==0){
				this.$Message.error('该学员排课已满，请选择其他学员！')
				return 
			}
			
			let data = util.copy(item)
			data.lesson_type = lesson_type
			this.$store.commit('startDrag',{field,data})
		},
		dragEnd(){
			this.$store.commit('endDrag')
		},
		refreshDataList(){
			let k = 'data'+this.type
			let url = this[k].url
			this.dr().refreshData(url)
			.then(response=>{
				this[k].list = response.list
				this[k].total = response.total
				this.total = response.total
				this.$nextTick(() => {
					this.init_data(this.type)
				})
			})
		},
		selectTb(selected) {
			this.tb.tbs_id = 0
			this.tb.sectionData = []
			this.data2.key2 = selected.tb_name
			this.get_textbook_section()
		},
		clearTb() {
			this.data2.key2 = ''
		},
		selectTbs(id) {
			this.data2.key3 = this.tb.sectionData.find(s => s.tbs_id==id).section_title
		},
		clearTbs() {
			this.data2.key3 = ''
		},
		get_textbook_section() {
			this.$http.get('textbook_sections',{
				params: {
					tb_id: this.tb.tb_id,
					pagesize:1000
				}
			})
			.then(res => {
				var list = res.body.data.list;
				list.sort((a,b) => {
                    return a.sort - b.sort
                })
				this.tb.sectionData = list;
			},res => {
				this.$Message.error(res.body.message)
			})
		}
	},
	computed:{
		disabled0(){
			if(this.condition_lesson_type === -1 || this.condition_lesson_type === 0){
				return false
			}
			return true
		},
		disabled1(){
			if(this.condition_lesson_type === -1 || this.condition_lesson_type === 1){
				return false
			}
			return true
		},
		disabled2(){
			if(this.condition_lesson_type === -1 || this.condition_lesson_type === 2){
				return false
			}
			return true
		},
		filterList0(){
			let list = this.data0.list
			if(this.lid > 0){
				list = list.filter(item=>item.lid == this.lid)
			}
			if(!/^\s*$/.test(this.data0.key)){
				list = list.filter(item=>item.class_name.indexOf(this.data0.key) !== -1)
			}
			return list
		},
		filterList1(){
			let list = this.data1.list
			if(this.lid > 0){
				list = list.filter(item=>item.lid == this.lid)
			}
			if(!/^\s*$/.test(this.data1.key)){
				list = list.filter(item=>item.student.student_name.indexOf(this.data1.key) !== -1)
			}
			return list
		},
		filterList2(){
			let list = this.data2.list
			if(this.lid > 0){
				list = list.filter(item=>item.lid == this.lid)
			}
			if(!/^\s*$/.test(this.data2.key)){
				list = list.filter(item=>item.student.student_name.indexOf(this.data2.key) !== -1)
			}
			if(!/^\s*$/.test(this.data2.key2)){
				list = list.filter(item=>item.last_tbs&&item.last_tbs.tb_name==this.data2.key2)
			}
			if(!/^\s*$/.test(this.data2.key3)){
				list = list.filter(item=>item.last_tbs&&item.last_tbs.section_title==this.data2.key3)
			}
			return list
		}
	}
}
</script>