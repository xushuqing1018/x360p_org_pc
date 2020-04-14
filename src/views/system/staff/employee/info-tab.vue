<template>
	<Form :label-width="100" ref="form_employee_1" class="x-ivu-form row" :model="info.employee">
        <Form-item label="姓名" class="col-md-6 pr-4 custom-form-item-required" prop="ename">
        	<Input type="text" v-model="info.employee.ename" placeholder="请输入姓名"></Input>
        </Form-item>
        <Form-item label="昵称" class="col-md-6 pr-4" prop="nick_name">
        	<Input type="text" v-model="info.employee.nick_name" placeholder="请输入昵称"></Input>
        </Form-item>
        <Form-item label="性别" class="col-md-6 pr-4" prop="sex">
        	<Radio-group v-model="info.employee.sex">
                <Radio label="1">男</Radio>
                <Radio label="2">女</Radio>
            </Radio-group>	
        </Form-item>
        <Form-item label="手机号码" class="col-md-6 pr-4 custom-form-item-required" prop="mobile">
        	<Input type="text" v-model="info.employee.mobile" placeholder="请输入手机号"></Input>
        </Form-item>
        <Form-item label="部门/ 职位" class="col-md-12 pr-4" prop="departments">
    	<select-department-jobtitle
    		v-model="info.employee.departments">
    	</select-department-jobtitle>
    	</Form-item>
        <FormItem label="教师星级" class="col-md-12 pr-4" prop="teacher_level" v-if="enable_teacher_level && isTeacher">
            <Select v-model="info.employee.teacher_level" :clearable="true" style="width: 300px">
                <Option v-for="(item,index) in teacher_levels" :value="index">{{item.name}}</Option>
            </Select>
        </FormItem>
        <Form-item label="Email" class="col-md-6 pr-4" prop="email" v-if="isEF('email','employee')">
        	<Input type="text" v-model="info.employee.email" placeholder="请输入邮箱号"></Input>
        </Form-item>
        <Form-item label="出生日期" class="col-md-6 pr-4" prop="birth_time">
        	<Date-picker 
            	type="date" 
            	:value="employee_birth_time" 
            	style="width:210px"
            	:transfer="true"
                :options="options"
            	@on-change="info.employee.birth_time = $event"
            	placeholder="请选择出生日期">
            </Date-picker>
        </Form-item>
        <Form-item label="身份证号码" class="col-md-6 pr-4" prop="id_card_no" v-if="isEF('id_card_no','employee')">
        	<Input type="text" v-model="info.employee.id_card_no" placeholder="请输入身份证号码"></Input>
        </Form-item>
        <Form-item label="银行账号" class="col-md-6 pr-4" prop="bank_card_no" v-if="isEF('bank_card_no','employee')">
        	<Input type="text" v-model="info.employee.bank_card_no" placeholder="请输入银行账号"></Input>
        </Form-item>
        <Form-item label="入职日期" class="col-md-6 pr-4" prop="join_int_day" v-if="isEF('join_int_day','employee')">
        	<Date-picker 
            	type="date" 
            	:value="format_day(info.employee.join_int_day)" 
            	style="width:210px"
            	:transfer="true"
            	@on-change="info.employee.join_int_day = $event"
            	placeholder="请选择入职日期">
            </Date-picker>
        </Form-item>
        <Form-item label="转正日期" class="col-md-6 pr-4" prop="official_int_day" v-if="isEF('official_int_day','employee')">
        	<Date-picker 
            	type="date" 
            	:value="format_day(info.employee.official_int_day)" 
            	style="width:210px"
            	:transfer="true"
            	@on-change="info.employee.official_int_day = $event"
            	placeholder="请选择转正日期">
            </Date-picker>
        </Form-item>
        <Form-item label="是否兼职" class="col-md-6 pr-4" prop="is_part_job">
        	<Radio-group v-model="info.employee.is_part_job">
                <Radio :label="1">是</Radio>
                <Radio :label="0">否</Radio>
            </Radio-group>	
        </Form-item>
        <Form-item label="是否在职" class="col-md-6 pr-4" prop="is_on_job">
        	<Radio-group v-model="info.employee.is_on_job">
                <Radio :label="1">是</Radio>
                <Radio :label="0">否</Radio>
            </Radio-group>	
        </Form-item>

       

        <Form-item label="备注" class="col-md-12 pr-4" prop="remark" v-if="isEF('remark','employee')">
        	<Input type="text" v-model="info.employee.remark" placeholder=""></Input>
        </Form-item>

        <Form-item label="加盟商账号" class="col-md-6 pr-4 custom-form-item-required" prop="is_fsys" v-if="hasFc">
        	<Radio-group v-model="info.employee.is_fsys">
                <Radio :label="0">关闭</Radio>
                <Radio :label="1">开启</Radio>
            </Radio-group>
        </Form-item>

        <Form-item label="毕业院校" class="col-md-6 pr-4" prop="college_did" v-if="isEF('college_did','employee')">
        	<Select v-model="info.employee.college_did" style="width: 100%" transfer>
                <Option v-for="item in dicts('college')" :value="item.did" :key="item.did">{{ item.title }}</Option>
            </Select>
        </Form-item>

        <Form-item label="专业" class="col-md-6 pr-4" prop="major_did" v-if="isEF('major_did','employee')">
        	<Select v-model="info.employee.major_did" style="width: 100%" transfer>
                <Option v-for="item in dicts('major')" :value="item.did" :key="item.did">{{ item.title }}</Option>
            </Select>
        </Form-item>
        
        <Form-item label="学历" class="col-md-6 pr-4" prop="degree_did" v-if="isEF('degree_did','employee')">
        	<Select v-model="info.employee.degree_did" style="width: 100%" transfer>
                <Option v-for="item in dicts('degree')" :value="item.did" :key="item.did">{{ item.title }}</Option>
            </Select>
        </Form-item>

        <Form-item label="教师资格证" class="col-md-6 pr-4" prop="have_cert" v-if="isEF('have_cert','employee')">
        	<Radio-group v-model="info.employee.have_cert">
                <Radio :label="0">无</Radio>
                <Radio :label="1">有</Radio>
            </Radio-group>
        </Form-item>

        <template v-for="item in optionFormItems">
            <Form-item :label="item.label" class="col-md-6" v-if="item.type == 'text'">
                <Input v-model="item.value" :placeholder="'请输入'+item.label"></Input>
            </Form-item>
            <Form-item :label="item.label" class="col-md-6" v-if="item.type=='date'">
                <DatePicker 
                    type="date" 
                    :value="item.value"
                    @on-change="item.value = $event" 
                    format="yyyy-MM-dd"
                    placeholder="选择日期" 
                    style="width:100%">
                </DatePicker>
            </Form-item>
            <Form-item :label="item.label" class="col-md-6" v-if="item.type=='number'">
                <InputNumber v-model="item.value"></InputNumber>
            </Form-item>
            <Form-item :label="item.label" class="col-md-12" v-if="item.type == 'textarea'">
                <Input v-model="item.value" type="textarea" :placeholder="'请输入'+item.label"></Input>
            </Form-item>
            <Form-item :label="item.label" class="col-sm-6" v-if="item.type =='select'">
                <Select v-model="item.value" transfer>
                    <Option v-for="option in item.options" :value="option">{{option}}</Option>
                </Select>
            </Form-item>
        </template> 
    </Form>
</template>
<script>
    import common from '@/libs/common.mixin' 
    import globals from '@/libs/globals.mixin' 
	import SelectDepartmentJobtitle from 'c%/SelectDepartmentJobtitle.vue'
	export default {
        mixins: [common,globals],
		components: {SelectDepartmentJobtitle},
		props: {
			info: {
				type: Object,
				default() {
					return {}
				}
			},
            optionFormItems:{
                type:Array,
                default(){
                    return []
                }
            }
		},
        data() {
            return {
                options: {
                    disabledDate(date) {
                        return date && date.valueOf() > Date.now()
                    }
                }
            }
        },
        computed:{
            employee_birth_time(){
                if(!this.info.employee.birth_time){
                    return ''
                }
                return this.info.employee.birth_time
            },
            hasFc() {
                return this.$store.state.client.is_org_open == 1
            },
            isTeacher(){
                return this.info && this.info.employee && this.info.employee.rids.indexOf(1) !== -1
            }
        }
	}
</script>