<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="500" :mask-closable="false">
        <Button type="primary" size="small" icon="plus" @click="batchAddOp">批量添加</Button>
        <Table size="small" height="300" :columns="sectionColumns" :data="sectionData" style="margin-top: 5px;"></Table>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :disabled="noEditItem">保存</Button>
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
    
    
    var sectionDataTemp = [];
	export default{
        mixins: [ common,modal,globals,modal ],
		data () {
            var vm = this;
			return {
                tb_id: 0,
                last_sort: 0,
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
                        key: 'section_title',
                        render: (h,params) => {
                            if(params.row.edit) {
                                let input = h('Input', {
                                    props: {
                                        value: params.row.section_title
                                    },
                                    on: {
                                        input: (val) => {
                                            sectionDataTemp[params.index].section_title = val
                                        }
                                    },
                                    style: {
                                        marginRight: '5px',
                                        width: '150px'
                                    }
                                })
                                let ok = h('Icon',{
                                    style: {
                                        color: '#39f',
                                        cursor: 'pointer',
                                        marginRight: '10px',
                                        position: 'relative',
                                        top: '2px'
                                    },
                                    on: {
                                        click: function() {
                                            vm.edit(params.index)
                                        }
                                    },
                                    props: {
                                        type: 'checkmark-round',
                                        size: '14'
                                    }
                                })
                                let close = h('Icon',{
                                    style: {
                                        color: '#39f',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        top: '2px'
                                    },
                                    on: {
                                        click: function() {
                                            vm.sectionData[params.index].edit = false
                                        }
                                    },
                                    props: {
                                        type: 'close',
                                        size: '14'
                                    }
                                })
                                if(!params.row.batch) {
                                    return h('span',[input, ok, close])
                                }
                                else {
                                    return h('span',[input])
                                }
                            }
                            else {
                                return h('span',params.row.section_title)
                            }
                        }
                    },
                    {
                        title: ' ',
                        key: 'op',
                        width: 80,
                        render: (h,params) => {
                            if(!params.row.addRow) {
                                let deleteElement = h('Icon',{
                                    style: {
                                        color: '#39f',
                                        cursor: 'pointer'
                                    },
                                    on: {
                                        click: function() {
                                            if(params.row.batch) {
                                                vm.sectionData.splice(params.index,1)
                                            }
                                            else {
                                                vm.deleteSection(params.row.tbs_id)
                                            }
                                        }
                                    },
                                    props: {
                                        type: 'android-delete',
                                        size: '14'
                                    }
                                })
                                let editElement = h('Icon',{
                                    style: {
                                        color: '#39f',
                                        cursor: 'pointer',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: function() {
                                            vm.sectionData[params.index].edit = true
                                        }
                                    },
                                    props: {
                                        type: 'edit',
                                        size: '14'
                                    }
                                })
                                if(params.row.batch) {
                                    return h('span', [deleteElement])
                                }
                                if(params.row.edit) {
                                    return h('span', [deleteElement])
                                }
                                else {
                                    return h('span', [editElement, deleteElement])
                                }
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
				this.getSectionData();
            }
		},
		methods: {
            ok() {
                let copyData = sectionDataTemp.slice(0, sectionDataTemp.length-1);
                let postList = copyData.filter(item => {
                    return (item.edit == true)&&(item.batch == true)
                })
                let hasEmpty = postList.some(item => {
                    return item.section_title == ''
                })
                if(hasEmpty) {
                    this.$Message.error('所有章节标题不能为空')
                    return
                }
                this.$http.post('textbook_sections', postList)
                .then(res => {
                    this.$Message.success('保存成功')
                    this.getSectionData()
                },res => {
                    this.error(res.body.message)
                })
            },
            edit(index) {
                this.$http.put('textbook_sections', sectionDataTemp[index])
                .then(res => {
                    this.$Message.success('编辑成功')
                    this.getSectionData()
                },res => {
                    this.error(res.body.message)
                })
            },
            batchAddOp() {
                this.$Modal.open('system/basic/textbook/batch-add-modal.vue',{
                    on: {
                        add: (num) => {
                            this.batchAdd(num)
                        }
                    }
                })
                .then(modal => {
                    modal.show('批量添加')
                })
            },
            batchAdd(num) {
                let sectionData = this.sectionData;
                sectionData.splice(sectionData.length-1,1);
                sectionDataTemp.splice(sectionData.length-1,1);
                let start_sort = 1;
                if(sectionData.length != 0) {
                    start_sort = sectionData[sectionData.length-1].sort+1;
                }
                for (let i = 0; i < num; i++) {
                    sectionData.push({
                        sort: start_sort+i,
                        section_title: '',
                        tb_id: this.tb_id,
                        edit: true,
                        batch: true
                    })
                }
                for (let i = 0; i < num; i++) {
                    sectionDataTemp.push({
                        sort: start_sort+i,
                        section_title: '',
                        tb_id: this.tb_id,
                        edit: true,
                        batch: true
                    })
                }
                this.last_sort = start_sort+num-1;
                sectionData.push({
                    addRow: true
                })
                sectionDataTemp.push({
                    addRow: true
                })
            },
            getSectionData() {
                this.$http.get('textbook_sections',{
                    params: {
                        tb_id: this.tb_id,
                        pagesize: 200
                    }
                })
                .then(res => {
                    var list = res.body.data.list;
                    list.forEach(item => {
                        item.edit = false;
                    })
                    list.sort((a,b) => {
                        return a.sort - b.sort
                    })
                    if(list.length) {
                        this.last_sort = list[list.length-1].sort
                    }
                    list.push({addRow: true});
                    this.sectionData = list;
                    sectionDataTemp = util.copy(list);
                },res => {
                    this.$Message.error(res.body.message)
                })
            },
            openSectionModal() {
                var vm = this;
                this.$Modal.open('system/basic/textbook/section-modal.vue',{
                    on: {
                        'on-ok': data => {
                            this.getSectionData();
                        }
                    }
                })
                .then(modal => {
                    modal
                    // .set('data',this.sectionData)
                    .set('last_sort',this.last_sort)
                    .set('tb_id',this.tb_id)
                    .show('添加章节')
                })
            },
            deleteSection(tbs_id) {
                this.$http.delete('textbook_sections/'+tbs_id)
                .then(res => {
                    this.$Message.success('删除成功')
                    this.getSectionData();
                },res => {
                    this.error(res.body.message)
                })
            }
        },
        computed: {
            noEditItem() {
                let sectionData = this.sectionData;
                let hasEditItem = sectionData.some(item => {
                    return item.edit == true
                })
                return !hasEditItem
            }
        }
		
	}
	
</script>

<style>
</style>