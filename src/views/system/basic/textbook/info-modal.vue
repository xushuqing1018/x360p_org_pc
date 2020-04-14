<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="500" :mask-closable="false">
        <Form :label-width="70" :model="info" :rules="rules" ref="form">
            <FormItem label="教材名" prop="tb_name" class="col-12"> 
                <Input v-model="info.tb_name" placeholder="请输入教材名"></Input>
            </FormItem>
            <FormItem label="出版机构" prop="tb_org_name" class="col-12">
                <Input v-model="info.tb_org_name" placeholder="请输入出版机构"></Input>
            </FormItem>
            <FormItem prop="is_public" class="col-12">
                <Checkbox v-model="info.is_public" :true-value="1" :false-value="0">适用所有校区</Checkbox>
            </FormItem>
            <FormItem label="适用校区" prop="suit_bids" class="col-12">
                <select-branch v-model="info.suit_bids" :disabled="!!info.is_public"></select-branch>
            </FormItem>
        </Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment  		from 'moment'
	import util 		from '@/libs/util'
    import globals 		from '@/libs/globals.mixin'
    import common 		from '@/libs/common.mixin'
    import modal 		from '@/libs/modal.mixin'
    import SelectBranch from 'c%/SelectBranch.vue'
    
	const emptyObject = {
        tb_name: '',
        tb_org_name: '',
        is_public: 1,
        suit_bids: []
	}
	
	export default{
        mixins: [ common,modal,globals ],
        components: {
            SelectBranch
        },
		data () {
            var vm = this;
			return {
				info: util.copy(emptyObject),
				rules: {
					tb_name: [
						{ required: true, message: '请输入教材名', trigger:'change' } 
					],
					tb_org_name: [
						{ required: true, message: '请输入出版机构名', trigger:'change' } 
					]
                },
                sectionColumns: [
                    {
                        title: '章节序号',
                        key: 'sort',
                        width: 100,
                        render: (h,params) => {
                            if(params.row.addRow) {
                                return h('a',{
                                    on: {
                                        click: function() {
                                            vm.openSectionModal()
                                        }
                                    },
                                    style: {
                                        color: '#39f'
                                    }
                                },'＋添加')
                            }
                            else {
                                return h('span',params.row.sort)
                            }
                        }
                    },
                    {
                        title: '章节名',
                        key: 'section_title'
                    },
                    {
                        title: ' ',
                        key: 'op',
                        width: 80,
                        render: (h,params) => {
                            if(!params.row.addRow) {
                                return h('Icon',{
                                    style: {
                                        color: '#39f',
                                        cursor: 'pointer'
                                    },
                                    on: {
                                        click: function() {
                                            vm.deleteSection(params.index)
                                        }
                                    },
                                    props: {
                                        type: 'android-delete',
                                        size: '14'
                                    }
                                })
                            }
                            return h('span','')
                        }
                    }
                ],
                sectionData: [
                    // {
                    //     sort: 2,
                    //     section_title: '第二章'
                    // },
                    // {
                    //     sort: 1,
                    //     section_title: '第一章'
                    // },
                    {
                        addRow: true
                    }
                ]
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
                if(this.info.suit_bids.length == 0&&this.info.is_public == 0) {
                    this.$Message.success('请选择校区')
                    return false
                }
				this.$form('form').check().then(()=>{
					let [uri,method,msg] = this.modal$.action=='add'?['textbooks','post','添加成功']:['textbooks/'+this.info.tb_id,'put','编辑成功']
					
					this.$rest(uri)[method](this.info)
					.success(data=>{
                        this.$Message.success(msg);
                        this.$emit('on-success');
                        this.close()
					}).error(response=>{
						this.error(response.body.message||'添加失败！')
					})
				})
            },
            openSectionModal() {
                var vm = this;
                this.$Modal.open('system/basic/textbook/section-modal.vue',{
                    on: {
                        'on-ok': data => {
                            this.sectionData = data;
                        }
                    }
                })
                .then(modal => {
                    modal
                    .set('data',this.sectionData)
                    .show('添加章节')
                })
            },
            deleteSection(index) {
                var data = this.sectionData;
                data.splice(index,1);
                this.sectionData = data;
            }
        },
        computed: {
        }
		
	}
	
</script>

<style>
</style>