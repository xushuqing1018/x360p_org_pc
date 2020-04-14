<template>
	<Modal v-drag-modal :mask-closable="false" width="450" v-model="modal$.show" :title="modal$.title">
		<template v-if="modal$.show">
			<Form :label-width="100" class="px-4" ref="form" :model="info">
				<Form-item label="所属课程" prop="lid">
        			<select-lesson 
	        			v-model="info.lid" 
	        			clearable
	        			:condition="{lesson_type:[0]}" 
	        			:allow-type="[0]"
	        			@selected="lessonSelected">
        			</select-lesson>
        		</Form-item>
        		<Form-item label="课时单价" prop="unit_price">
        			<InputNumber v-model="info.unit_price"></InputNumber>&nbsp;元/课时
        		</Form-item>
        		<Form-item label="单课时分钟" prop="per_lesson_hour_minutes" >
        			<Input-number v-model="info.per_lesson_hour_minutes" :min="0" style="width:50px;"></Input-number>&nbsp;分钟
        		</Form-item>
        		<!--<Form-item label="单次消耗课时数" prop="consume_lesson_hour">
					<Input-number v-model="info.consume_lesson_hour"></Input-number>
				</Form-item>-->
			</Form>
	    </template>
    	<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" @click="save">确定</Button>
        </div>
    </Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'

	import SelectLesson from 'c%/SelectLesson'
	
	const INFO_NAME = '班级'
	const INFO_PK_ID = 'cid'
	const INFO_URL   = 'classes'

	const emptyObject = {
		lid: 0,
		unit_price:0.00,
		per_lesson_hour_minutes:0,
//		consume_lesson_hour:1.00
	}

	export default{
		name:'classChargeModal',
		mixins:[globals,modal,common],
		components: {
			SelectLesson
		},
		data () {
			return {
				info: util.copy(emptyObject)
			}
		},
		watch: {
			'modal$.show':{
	            handler:function(val){
	            	if(val&&this.modal$.action=='edit'){
	            		this.init_edit()
					}
	            }
	        }
        },
		mounted () {
			
		},
		methods: {
			init_edit(){
				this.info.unit_price = util.float(this.info.unit_price)
//				this.info.consume_lesson_hour = util.float(this.info.consume_lesson_hour)
			},
			lessonSelected(lesson) {
				this.info.unit_price = util.float(lesson.unit_price)
//				this.info.consume_lesson_hour = util.float(lesson.unit_lesson_hours)
				this.info.per_lesson_hour_minutes = lesson.per_lesson_hour_minutes
			}
		},
		computed: {
			info_url$(){
            	return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        }

		}
	}
</script>
