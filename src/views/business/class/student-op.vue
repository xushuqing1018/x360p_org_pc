<template>
    <div>
        <Dropdown trigger="click">
            <Button type="ghost" icon="gear-a" size="small"> 操作</Button>
            <DropdownMenu slot="list">
                <DropdownItem @click.native="deleteAssignStudent"><Icon type="log-out"></Icon> 退班</DropdownItem>
                <DropdownItem @click.native="resetInTime"><Icon type="ios-loop"></Icon> 重置入班日期</DropdownItem>
            </DropdownMenu>
        </Dropdown>
        <Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="400" :mask-closable="false">
			<Form :label-width="80">
				<Form-item label="入班日期">
					<DatePicker 
						type="date" 
						:value="in_time" 
						@on-change="in_time=$event" 
						format="yyyy-MM-dd" 
						placeholder="请选择入班日期">
					</DatePicker>
				</Form-item>
			</Form>
			
			<div slot="footer">				
				<Button type="ghost" @click="close">关闭</Button>
				<Button type="primary" @click="ok">确定</Button>
			</div>
		</Modal>
    </div>
</template>

<script>
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import modal from '@/libs/modal.mixin'

export default {
    mixins:[common,globals,modal],
    props: ['item'],
    data() {
        return {
            in_time: '',
        }
    },
    mounted() {

    },
    methods: {
        deleteAssignStudent(){
            var item = this.item;
			let tip = util.sprintf('您确认对【%s】进行退班操作吗？',item.student.student_name)
			
			this.confirm(tip)
			.then(() => {
				this.$rest('classes').add_url_param(item.cid,'students')
				.delete(item.sid)
				.success(response=>{
					this.$emit('on-student-delete-success')
					this.$Message.success('退班成功')
				})
				.error(response=>{
					this.$Notice.error({
						title:'退班操作失败',
						desc:response.body.message
					})
				})
			})
        },
        resetInTime () {
            var item = this.item;
			let title = '重置入班日期'
			if(item){
				title = util.sprintf('重置【%s】入班日期',item.student.student_name)
				this.in_time = item.in_time				
			}
			this.show(title,'add')
        },
        ok () {
            var item = this.item;
			let params = {
				in_time: this.in_time
			}
			
			if(this.in_time==''){
				this.$Message.error('请选择入班日期')
				return false
			}
			else{
				this.$rest('class_students/'+item.cs_id)
				.put(params)
				.success(data=>{
                    this.$Message.success('重置成功！')
                    this.$emit('on-student-update-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'重置失败！')
				})
			}
        },
    },
    computed: {
        disabledOptions () {
            //学员入班日期必须大于开课日期小于当前日期
            var item = this.item;
			let start_lesson_time = new Date(item.start_lesson_time).getTime()			
            return { 
            	disabledDate (date) {
                	return date && date.valueOf() > Date.now() || date.valueOf() < start_lesson_time - 86400000
            	}
        	}
        },
    }
}
</script>

<style>

</style>
