<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="500" :mask-closable="false">
        <Form :label-width="80" :model="info" :rules="rules" ref="form">
            <FormItem label="章节序号" prop="sort" class="col-10"> 
                <InputNumber :min="1" v-model="info.sort"></InputNumber>
            </FormItem>
            <FormItem label="章节名" prop="section_title" class="col-10">
                <Input v-model="info.section_title" placeholder="请输入章节名"></Input>
            </FormItem>
        </Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
			<Button type="primary" @click="hold">继续添加</Button>
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
    
	const emptyObject = {
        section_title: '',
        sort: 1
	}
	
	export default{
        mixins: [ common,modal,globals,modal ],
		data () {
            var vm = this;
			return {
                data: [],
                tb_id: 0,
                last_sort: 0,
				info: util.copy(emptyObject),
				rules: {
					section_title: [
						{ required: true, message: '请选择章节名', trigger:'change' } 
					],
					sort: [
						{ required: true, min: 1, type: 'number', message: '请输入章节序号', trigger:'change' } 
					]
                }
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val){
                    this.info = util.copy(emptyObject)
                    this.info.sort = this.last_sort + 1
                }
            }
		},
		methods: {
			ok () {
                var vm = this;
				this.$form('form').check().then(() => {
                    this.info.tb_id = this.tb_id;
                    this.$http.post('textbook_sections',[this.info])
                    .then(res => {
                        this.$Message.success('添加章节成功')
                        this.$emit('on-ok');
                        this.close()
                    },res => {
                        this.error(res.body.message)
                    })
                })
            },
            hold() {
                var vm = this;
				this.$form('form').check().then(() => {
                    this.info.tb_id = this.tb_id;
                    this.$http.post('textbook_sections',[this.info])
                    .then(res => {
                        this.$Message.success('添加章节成功')
                        this.$emit('on-ok');
                        this.info.sort += 1;
                        this.info.section_title = '';
                    },res => {
                        this.error(res.body.message)
                    })
                })
            }
        },
        computed: {
        }
		
	}
	
</script>

<style>
</style>