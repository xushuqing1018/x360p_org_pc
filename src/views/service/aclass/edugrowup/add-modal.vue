<template>
  <Modal v-drag-modal :mask-closable="false" width="750" v-model="modal$.show" :title="modal$.title">
    <Form :label-width="80" ref="form" v-if="modal$.show">
      <Form-item label="班级"> 
				<Row>
          <i-col span="11">
            <Select style="width:200px" placeholder="班级" v-model="growth.cid">
          		<Option v-for="item in classes" :value="item.value" :key="item.value">{{item.name}}</Option>
        		</Select>
          </i-col>
          <i-col span="2" style="text-align: center">姓名</i-col>
          <i-col span="11">
            <Select style="width:200px" placeholder="姓名" v-model="growth.sid">
          		<Option v-for="item in students" :value="item.value" :key="item.value">{{item.name}}</Option>
        		</Select>
          </i-col>
        </Row> 
			</Form-item>
      <Form-item label="标题">
				<Row>
          <i-col span="11">
						<Input placeholder="请输入标题"  v-model="growth.title" style="width: 69% !important;"/> 
          </i-col>
          <i-col span="2" style="text-align: center">对比简介</i-col>
          <i-col span="11">
						<i-input v-model="growth.content" type="textarea" placeholder="对比简介..." :rows=1 style="max-width: 69%;"></i-input>
          </i-col>
        </Row>  
			</Form-item>
    </Form>
    <div slot="footer">
			<Button type="ghost" @click.native="close">关闭</Button>
			<Button type="primary" :loading="saving" @click.native="submit_growth">提交</Button>
		</div>
  </Modal>
</template>

<script>
  import util from '@/libs/util'
	import globals from '@/libs/globals.mixin'
  import common from '@/libs/common.mixin'
  import grid from '@/libs/grid.mixin'
  import modal from '@/libs/modal.mixin'
  export default {
    mixins: [globals,grid,common,modal],
    name: 'AddModal',
    data () {
      return {
        students: [],
        classes: [],
				growth: {
					bid: 0,
					cid: 0,
					sid: 0,
					title: '',
					content: ''
				}
      }
    },
    mounted () {
      this.get_classes()
    },
    watch: {
			'growth.cid': function (val) {
        this.growth.sid = 0
				this.get_students(val)	
			}
		},
    methods: {
      get_classes () {
				let uri = util.sprintf('classes?teach_eid=%s&my=true',this.eid$) 	
				this.$rest(uri).get()
				.success(data=>{
					let list = data.list					
					if(list.length > 0) {
						this.classes = []
						list.forEach(c=>{
							this.classes.push({
								value: c.cid,
								name: c.class_name
							})
						})
					}				
				}).error(response=>{
					this.$Message.error(response.body.message||'text')
				})
      },
      get_students (cid) {
				this.$rest('classes').add_url_param(cid,'students').get()
				.success(data=>{
					let list = data.list		
					this.students = []
					if(list.length > 0){						
						list.forEach(s=>{
							this.students.push({
								name: s.student.student_name,
								value: parseInt(s.sid)
							})
						})
					}else{
						this.$Message.info('该班级没有学员','text')
					}
				}).error(response=>{
					this.$Message.error(response.body.message||'text')
				})
      },
      submit_growth () {
				if(this.growth.title == ""){
					this.$Message.info("标题不能为空")
					return false 
				}
				if(this.growth.content == ""){
					this.$Message.info("对比简介不能为空")
					return false 
				}
				let params = util.copy(this.growth)
				params.bid = this.bid$[0]
				this.$rest('edu_growups').post(params)
				.success(response=>{					
          this.$Message.success('添加成功')
          this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.$Message.error(response.body.message||'text')
				})
			},
    }

  }
</script>

<style  scoped>
	.ivu-input {
		width: 69% !important;
	}
</style>