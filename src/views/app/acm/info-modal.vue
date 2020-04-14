<style lang="less">

</style>
<template>
	<Modal v-drag-modal :mask-closable="false" width="400" v-model="modal$.show" :title="modal$.title">
    <Form :model="acm" label-position="right" :label-width="100">
        <FormItem label="上级分类：" prop="act_ids" v-if="action_type">
             <Cascader :data="type_array" v-model="act_ids" style="width:200px" change-on-select></Cascader>
        </FormItem>
        <FormItem label="分类名称：" prop="cate_name">
            <Input v-model="acm.cate_name" style="width:200px"/>
        </FormItem>
        <FormItem label="分类类型：" prop="content_type" v-if="action_type">
            <Select v-model="acm.content_type" style="width:200px">
                <Option :value="0" :disabled="is_disabled==1">资讯</Option>
                <Option :value="1" :disabled="is_disabled==0">视频</Option>
            </Select>
        </FormItem>
        <FormItem label="分类状态：" prop="status">
            <Select v-model="acm.status" style="width:200px">
                <Option :value="1">启用</Option>
                <Option :value="0">禁用</Option>
            </Select>
        </FormItem>
        <FormItem label="排序：" prop="sort">
          <InputNumber  :min="0" v-model="acm.sort"></InputNumber>
        </FormItem>
    </Form>
    <div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="save()">确定</Button>
		</div>
	</Modal>
</template>                      
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
  import common from '@/libs/common.mixin'

	export default {
    mixins: [grid,modal,common],
    components: {
    },
		data() {
			return {
        acm:{
          cate_name: '',
          content_type: 0,
          parent_acc_id: 0,
          status: 1,
          sort: 0
        },
        item: {},
        is_disabled: -1,
        type_array: [],
        act_ids: [],
        cate_name_list: []
			}
    },
    watch:{
      'modal$.action': function (val) {
        if(val == 'edit'){
          this.acm.cate_name = this.item.cate_name
          this.acm.content_type = this.item.content_type
          this.acm.parent_acc_id = this.item.parent_acc_id
          this.acm.status = this.item.status
          this.acm.sort = this.item.sort
        }
      },
      'act_ids': function (val) {
        let value = val.slice(-1)[0]
        if(value !== 0){
          let empArray = []
          this.cate_name_list.forEach(i => {
            empArray.push(i)
          })
          this.cate_name_list.forEach(i => {
            if(i.length !== 0){
              i.children_level.forEach(l => {
                empArray.push(l)
              })              
            }
          })
          empArray.forEach(item => {
            if(item.act_id == val){
               this.acm.content_type = item.content_type
               this.is_disabled = item.content_type
            }
          })
        }else {
          this.is_disabled = -1
        }
      }
    },
		mounted() {
      this.init_cate_name()
    },
    methods: {
      init_cate_name () {
        this.$rest("acm_cates")
          .get()
          .success((response)=>{
            this.cate_name_list = response.list
            let type_array = this.type_array,
                data = response.list
            if(data.length != 0){
              data.forEach(i => {
                type_array.push({
                  value: i.act_id,
                  label: i.cate_name,                
                })
              })  
            }
            type_array.unshift({
              value: 0,
              label: '顶级'
            })
          })
          .error((response)=>{
            this.error(response.body.message)
        })
      },
      save () {
        this.acm.parent_acc_id = this.act_ids.reverse()[0]
				if(this.acm.cate_name == ""){
					this.$Message.info("分类名称不能为空")
					return false 
        }
	      let method = this.modal$.action == 'add'?'post':'put'
				let action = this.modal$.action == 'add'?'添加':'编辑'
				let $rest = this.$rest("acm_cates")
	      if(this.modal$.action == 'edit') {
						$rest.add_url_param(this.item.act_id)
				}
	      $rest[method](this.acm)
	        .success(response=>{
	          this.$Message.success(util.sprintf('%s成功!',action))
	          this.$emit('on-success')
	          this.close()
	      	})
	        .error(response=>{
	          this.error(response.body.message)
	        })        
      },
    },
    computed: {
      action_type () {
        return this.modal$.action == 'add'
      }
    }
	}
</script>