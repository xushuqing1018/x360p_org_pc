<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="500" :mask-closable="false">
        <Form :label-width="80" :model="info" :rules="rules" ref="form">
            <FormItem label="评估老师" prop="eid" class="col-10">
                <select-employee v-model="info.eid"></select-employee>
            </FormItem>
            <FormItem label="待评估对象" class="col-10">
                <RadioGroup v-model="evaluateObj" @on-change="typeChange">
                    <Radio :label="1">学员</Radio>
                    <Radio :label="2">客户</Radio>
                </RadioGroup>
            </FormItem>
            <FormItem label="评估学员" prop="sid" class="col-10" v-if="evaluateObj == 1">
                <select-student v-model="info.sid"></select-student>
            </FormItem>
            <FormItem label="评估客户" prop="cu_id" class="col-10" v-if="evaluateObj == 2">
                <select-customer v-model="info.cu_id"></select-customer>
            </FormItem>
            <FormItem label="评估日期" prop="int_day" class="col-10">
                <date-picker
                    style="width: 280px"
                    :show-week-numbers="true"
                    :value="info.int_day"
                    @on-change="info.int_day=$event"
                    placeholder="选择评估日期"
                    >
                </date-picker>
            </FormItem>
            <FormItem label="评估时间" prop="int_start_hour" class="col-10">
                <select-time-section
                    clearable
                    :value="ts_array"
					:date="info.int_day"
                    placeholder="请选择评估时间"
                    @on-change="changeTimeSection"
                    >
                </select-time-section>
            </FormItem>
        </Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" v-if="!isAgain">确定</Button>
			<Button type="primary" @click="ok" v-if="isAgain">继续添加</Button>
		</div>
	</Modal>
</template>

<script>
	import moment  		from 'moment'
	import util 		from '@/libs/util'
    import grid 		from '@/libs/grid.mixin'
    import globals 		from '@/libs/globals.mixin'
    import common 		from '@/libs/common.mixin'
    import modal 		from '@/libs/modal.mixin'
    import DateRangePicker from 'c%/DateRangePicker.vue'
    import SelectEmployee  from 'c%/SelectEmployee.vue' 
    import SelectStudent  from 'c%/SelectStudent.vue'
    import SelectCustomer  from 'c%/SelectCustomer.vue'
    import ExportButton from 'c%/ExportButton.vue'
    import SelectTimeSection from 'c%/SelectTimeSection.vue'
    
	const emptyObject = {
        eid: 0,
        sid: 0,
        cu_id: 0,
        int_start_hour: '',
        int_end_hour: '',
        int_day: ''
	}
	
	export default{
		mixins: [ common,modal,globals,modal ],
		components: {
			DateRangePicker,
            SelectEmployee,
            ExportButton,
            SelectStudent,
            SelectTimeSection,
            SelectCustomer
        },
        props: ['id'],
		data () {
			return {
                evaluateObj: 1,
                isAgain: false,
				info: util.copy(emptyObject),
				rules: {
					eid: [
						{ required: true, min: 1, type: 'number', message: '请选择评估老师', trigger:'change' } 
					],
					sid: [
						{ required: true, min: 1, type: 'number', message: '请选择待评估学员', trigger:'change' } 
					],
					cu_id: [
						{ required: true, min: 1, type: 'number', message: '请选择待评估客户', trigger:'change' } 
					],
					int_day: [
						{ required: true, message: '请选择评估日期', trigger:'change' }
					],
					int_start_hour: [
						{ required: true, message: '请选择评估时间', trigger:'change' }
					]
                }
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(!val){
					this.info = util.copy(emptyObject)					
                }
            }
		},
		methods: {
			ok () {
				this.$form('form').check().then(()=>{
					let [uri,method,msg] = this.modal$.action=='add'?['evaluates','post','添加成功']:['evaluates/'+this.info.eva_id,'put','编辑成功']
					
					this.$rest(uri)[method](this.info)
					.success(data=>{
                        this.$Message.success(msg);
                        this.isAgain = true;
						this.$emit('on-success');
					}).error(response=>{
						this.error(response.body.message||'添加失败！')
					})
				})
            },
            changeTimeSection(event) {
                if(event.length) {
                    this.info.int_start_hour = event[0]
                    this.info.int_end_hour   = event[1]
                }else{
                    this.info.int_start_hour = ''
                    this.info.int_end_hour   = ''
                }
            },
            typeChange(val) {
                if(val == 1) {
                    this.info.cu_id = 0;
                }
                else {
                    this.info.sid = 0;
                }
            }
        },
        computed: {
            ts_array() {
                var arr = [];
                if(this.info.int_start_hour != '') {
                    arr = [this.info.int_start_hour,this.info.int_end_hour];
                }
                return arr;
            }
        }
		
	}
	
</script>

<style>
</style>