<style lang="less">
@import '~@/style/mixin.less';
.arrange-modal{
	position:absolute;
	z-index:21;
	top:90px;
	width:600px;
	background:#fff;
	.rounded(5px);
	.drop-shadow(2px,4px,10px,0.6);

	.drop{
		margin-right:10px;
		margin-left:10px;
		padding:2px 5px;
		border:1px dotted #eee;
		&.allowed{
			border-color:#000;
		}
	}
}
table.class-list{
	margin-top:10px;
}
.table-list-wrap{
	max-height:400px;
	overflow-y:auto;
}
</style>
<template>
<div class="arrange-modal" v-show="modal$.show" v-drag-modal="{hs:'.modal-header'}">
	<div class="modal-header">
		<strong>{{headerText}}</strong>
		<span style="color:#19be6b" v-if="info.is_attendance>0">已考勤</span>
		<span style="color:#f00" v-if="info.is_cancel==1">已取消</span>
	</div>
	<template v-if="modal$.show">
		<template v-if="modal$.action == 'add'">
			<arrange-form 
	    	ref="form" 
	    	:label-width="80" 
	    	:mode="mode"
	    	:data="info" 
	    	:refs="refs"
	    	>
	    	</arrange-form>
			
			<div class="modal-footer">
				<Button type="ghost" :disabled="saving" @click="cancel">取消</Button>
				<Button type="primary" :loading="saving" :disabled="!isValid" @click="save">确定</Button>
			</div>
		</template>
		<template v-else>
			<arrange-form 
	    	ref="form" 
	    	mode="edit"
	    	:action="modal$.action"
	    	:label-width="80" 
	    	:data="info"
	    	:refs="refs"
	    	>
	    	</arrange-form>

			<div class="modal-footer">
				<Poptip
			        confirm
			        title="您确认删除这条排课信息吗？"
			        :transfer="true"
			        @on-ok="del"
			        >
			        <Button type="error" :disabled="saving">删除排课</Button>
			    </Poptip>
				<Button type="default" :disabled="saving||info.is_cancel==1" @click="cancelArrange">取消排课</Button>
				<Button type="ghost" :disabled="saving" @click="cancel">关闭</Button>
				<Button type="primary" :loading="saving" :disabled="!isValid" @click="save">确定</Button>
			</div>
		</template>

	</template>
</div>

</template>
<script>
import {oneOf} from '@/libs/util'
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import modal  from '@/libs/modal.mixin'
import arrangeForm from './form.vue'


const CACHE = {}
const emptyObject = {
				ca_id:0,
				lesson_type:0,
				is_trial:0,
				name:'',
				cid:0,
				name:'',
				_class_name:'',
				sj_id:0,
				int_day:'',
				int_start_hour:'',
				int_end_hour: '',
				teach_eid:0,
				second_eid:0,
				second_eids:[],
				chapter_index:0,
				cr_id:0,
				isloop:0,
				loop_times:1,
				loop_arranges:[
				],
				students:[
				],
				tb_id: 0,
				tbs_id: 0
			}
export default {
	name:'arrangeInfo',
	mixins:[common,globals,modal],
	components:{
		arrangeForm
	},
	props:{
		arranges:{
			type:Array,
			default(){
				return []
			}
		},
		mode:{
			type:String,
			default:'view',
			validator (value) {
                return oneOf(value, ['view','edit','list']);
            }
		},
		refs:{
			type: Object,
			default(){
				return {}
			}
		}
	},
	data(){
		return {
			ts:{
				int_day:'',
				week_day:0,
				int_start_hour:'',
				int_end_hour:''
			},
			info:util.copy(emptyObject)
		}
	},
	methods:{
		//添加时调用
		setTs(ts){
			this.ts = ts
			this.info.int_day        = ts.int_day
			this.info.week_day 		 = ts.week_day
			this.info.int_start_hour = ts.int_start_hour
			this.info.int_end_hour   = ts.int_end_hour
			return this
		},
		initInfo(){
			this.info = util.copy(emptyObject)
			return this
		},
		setInfo(arrange){
			this.info = arrange
			return this
		},
		setInfoData(key,value){
			this.info[key] = value
			return this
		},
		setAddField(data){
			if(!data.field){
				return this
			}
			if(data.field == 'object'){
				return this.setTeachObject(data)
			}
			return this.setInfoData(data.field,data.value)
		},
		setTeachObject(d){
			let data = d.value
			this.info.lesson_type = d.lesson_type
			if(this.info.students.length > 0){
				this.info.students.splice(0,this.info.students.length)
			}
			if(d.lesson_type == 0){
				this.info.cid         = data.cid
				this.info._class_name = data.class_name
				this.info.sj_id       = data.sj_id
				this.info.is_trial    = 0
				this.info.lid         = data.lid
				this.info._lesson_times = data.lesson_times
				this.info._arrange_times = data.arrange_times
				this.info._remain_arrange_times = util.div(data.lesson_times,data.arrange_times)

			}else if(d.lesson_type == 1){
				this.info.cid         = 0
				this.info.is_trial    = 0
				this.info.lid         = data.lid
				this.info.students.push({
					sid:data.sid,
					lid:data.lid,
					student_name:data.student.student_name,
					int_day:this.info.int_day,
					int_start_hour:this.info.int_start_hour,
					int_end_hour:this.info.int_end_hour,
					_lesson_times:data.lesson_times,
					_remain_arrange_times:data.remain_arrange_times,
					_arrange_times:util.div(data.lesson_times,data.remain_arrange_times)
				})
			}else{
				this.info.cid         = 0
				this.info.is_trial    = 0
				this.info.lid         = data.lid
				this.info.students.push({
					sid:data.sid,
					lid:data.lid,
					student_name:data.student.student_name,
					int_day:this.info.int_day,
					int_start_hour:this.info.int_start_hour,
					int_end_hour:this.info.int_end_hour,
					_lesson_times:data.lesson_times,
					_remain_arrange_times:data.remain_arrange_times,
					_arrange_times:util.div(data.lesson_times,data.remain_arrange_times)
				})
			}
			return this
		},
		updateStore(){
			this.$store.commit('setArrange',this.info)
			return this
		},
		save(){
			let action = this.modal$.action,
				[method,uri,msg] = action=='add'?['post','course_arranges','排课成功']:['put','course_arranges/'+this.info.ca_id,'编辑成功']
			
			this.$rest(uri)
			[method](this.info)
			.success(response=>{
				this.$emit('on-save-success')
				this.$Message.success(msg)
				this.cancel()
			})
			.error(response=>{
				this.error(response.body.message)
			})
		},
		cancel () {
			this.$emit('on-close')
			this.close()
		},
		del(){
			this.$rest('course_arranges')
			.delete(this.info.ca_id)
			.success(response=>{
				this.$emit('on-save-success')
				this.cancel()
			})
			.error(response=>{
				this.error(response.body.message)
			})
		},
		cancelArrange(arrange){
            this.$Modal.open('business/arrange/cancel-arrange-modal.vue',{
                on:{
                    'on-success':()=>{
                        this.$emit('on-save-success')
                        this.cancel()
                    }
                }
            })
            .then(modal=>{
                modal.set('info',this.info)
                .show('取消排课','add')
            })
        },
	
		
	},
	computed:{
		headerText(){
			let ts = this.ts
			if(this.mode=='list'&&this.modal$.action=='add'){
				return this.modal$.title
			}
			
			return util.sprintf("%s %s %s %s ~ %s",
				this.modal$.title,
				this.$filter('int_date')(ts.int_day),
				this.$filter('week_day_text')(ts.week_day),
				ts.int_start_hour,
				ts.int_end_hour
			)
		},
		isValid(){
			if(this.info.teach_eid == 0){
				return false
			}
			if(this.info.cr_id == 0 && this.info.lesson_type != 1){
				return false
			}
			if(this.info.lesson_type == 0 ){
				if(this.info.cid == 0){
					return false
				}
			}else{
				if(this.info.students.length == 0){
					return false
				}
			}
			if(this.enable_tbs) {
				if(this.info.tb_id > 0 && this.info.loop_times > 1) {
					return false
				}
				if(this.info.tb_id > 0 && this.info.tbs_id == 0) {
					return false
				}
			}
			return true
		}
	},
	watch:{
		
	}
}
</script>