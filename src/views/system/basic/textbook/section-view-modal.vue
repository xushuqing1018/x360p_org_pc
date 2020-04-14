<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="450" :mask-closable="false">
        <Tree :data="treeData"></Tree>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import moment  		from 'moment'
	import util 		from '@/libs/util'
    import globals 		from '@/libs/globals.mixin'
    import common 		from '@/libs/common.mixin'
    import modal 		from '@/libs/modal.mixin'
	
	export default{
        mixins: [ common,modal,globals,modal ],
		data () {
            var vm = this;
			return {
                tb_id: 0,
                section: [],
                tb_name: ''
			}
		},
		watch: {
			'modal$.show': function (val) {
                this.getData();
            }
		},
		methods: {
            getData() {
                this.$http.get('textbook_sections',{
                    params: {
                        tb_id: this.tb_id,
                        pagesize: 100
                    }
                })
                .then(res => {
                    var list = res.body.data.list;
                    list.sort((a,b) => {
                        return a.sort - b.sort
                    })
                    this.section = list;
                },res => {
                    this.$Message.error(res.body.message)
                })
            }
        },
		computed:{
            treeData() {
                var children = [];
                if(this.section.length == 0) {
                    var obj = {
                        title: '暂无章节'
                    }
                    children.push(obj);
                }
                else {
                    for (let index = 0; index < this.section.length; index++) {
                        const item = this.section[index];
                        var obj = {};
                        obj.title = item.section_title
                        children.push(obj)
                    }
                }
                var vm =this;
                return [{
                    title: vm.tb_name,
                    expand: true,
                    children: children
                }]
            }
        }
	}
	
</script>

<style>
</style>