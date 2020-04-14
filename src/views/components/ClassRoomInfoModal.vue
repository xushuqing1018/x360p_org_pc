<template>
	<Modal v-drag-modal :mask-closable="false" width="480" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<template v-if="modal$.show">
	        <Form :label-width="140" class="mt-3" ref="form" :model="info" :rules="rules">
	        	<Form-item prop="room_name" label="教室名">
	        		<Input v-model="info.room_name" placeholder="请输入教室名"></Input>
	        	</Form-item>
	        	<Form-item prop="seat_nums" label="面积">
	        		<InputNumber v-model="info.area"></InputNumber> ㎡
	        	</Form-item>
	        	<Form-item prop="seat_nums" label="座位数">
	        		<InputNumber v-model="info.seat_nums"></InputNumber>
	        	</Form-item>
	        	<Form-item prop="listen_nums_limit" label="可容纳家长旁听人数">
	        		<InputNumber v-model="info.listen_nums_limit"></InputNumber>
	        	</Form-item>            		
	        </Form>            
	    </template>
	    <div slot="footer">
            <Button type="text" :disabled="saving" @click="close">取消</Button>
            <Button type="primary" :loading="saving" @click="save">确定</Button>
        </div>
	</Modal>
</template>
<script>
const INFO_NAME  = '教室'
const INFO_PK_ID = 'cr_id'
const INFO_URL   = 'classrooms'

	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	export default {
		name:'ClassRoomInfoModal',
		mixins:[common,modal],
		props:{
			bid:{
				type:Number,
				default:0
			}
		},
		data(){
			return {
				info:{
					bid:0,
					area: 0,
					room_name:'',
					seat_nums:16,
					listen_nums_limit:0
				},
				rules: {
					room_name: [
						{ required: true,message:'请输入教室名称', trigger: 'blur' }
					],	
					seat_nums: [
						{ required: true, type: 'number', message: '请输入座位数', trigger: 'blur' },
						{ type: 'number', min: 1, message: '教室座位数最少为0' , trigger: 'blur'}
					],
					listen_nums_limit:[
						{required:true,type:'number',message:'请输入课容纳旁听人数',trigger:'blur'}
					]
				}
			}
		},
		computed:{
			info_url$(){
	            return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        }
		},
		methods:{
			
		}
	}
</script>