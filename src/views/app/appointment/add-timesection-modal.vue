<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<div style="max-height: 500px;overflow: auto;">
			<table class="modal-table">
				<thead>
					<tr>
						<th><div class="ivu-table-cell">日期</div></th>
						<th><div class="ivu-table-cell">时间段</div></th>
                        <th><div class="ivu-table-cell">限制人数</div></th>
                        <th><div class="ivu-table-cell">操作</div></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item,index) in info.appointment_time_section" :key="index">
						<td>
                            <DatePicker type="date" placeholder="请选择日期" :value="item.int_day" @on-change="item.int_day=$event"></DatePicker>
                        </td>
						<td>
                            <TimePicker format="HH:mm" type="timerange" placeholder="请选择时间段" :value="item.int_hour" @on-change="item.int_hour=$event"></TimePicker>
                        </td>
                        <td>
                            <InputNumber :min="1" v-model="item.limit_nums"></InputNumber>
                        </td>
                        <td>
                            <div class="ivu-table-cell">
								<Button type="text" icon="ios-trash" @click="deleteTimesection(item,index)"></Button>
	        				</div>
                        </td>
					</tr>
				</tbody>
			</table>
		</div>
        <div style="text-align:center;margin-top: 10px;">
            <p><i class="ivu-icon ivu-icon-plus" style="cursor: pointer" @click="add_timesection">&nbsp;添加时段</i></p>
        </div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin' 
	import common from '@/libs/common.mixin'

	export default {
        mixins: [modal,common],
        props:{
            as_id:{
                type:Number,
                default:0
            }
        },
		data() {
			return {
                info:{
                    appointment_time_section:[
                        {
                            as_id:this.as_id,
                            ats_id:0,
                            int_day:'',
                            int_hour:['',''],
					        int_start_hour:'',
					        int_end_hour:'',
					        limit_nums:1
                        }
                    ]
                }
			}
		},
		methods: {
			deleteTimesection(item,index) {
                this.info.appointment_time_section.splice(index,1)
			},
			add_timesection (){
                let item = {
                    as_id:this.as_id,
                    ats_id:0,
                    int_day:'',
                    int_hour:['',''],
					int_start_hour:'',
					int_end_hour:'',
					limit_nums:1
				}
                this.info.appointment_time_section.push(item)
            },
			ok() {
                if(this.info.appointment_time_section.length == 0){
                    this.$Message.error('请添加预约时段')
					return
                }

                try {
					this.info.appointment_time_section.forEach(data=>{
                        data.int_start_hour = data.int_hour[0]
                        data.int_end_hour = data.int_hour[1]

                    	if(data.int_day == '' || data.int_start_hour == '' || data.int_end_hour == ''){
                    	    throw new Error("预约时段信息填写不完整")
						}
                	})
				} catch (e) {
					this.$Message.error(e.message)
					return
				}
				this.save()
			},
			save() {
                this.$rest('appointment_time_sections')
                .post(this.info)
				.success(response=>{
                    this.$Message.success('保存成功')
                    this.$emit('on-success')
                    this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~')
				})
			}
		}
	}
</script>