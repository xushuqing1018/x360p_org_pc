<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="500" :mask-closable="false">
        <Table :columns="cols" :data="table_data" highlight-row @on-row-click="onRowClick"></Table>
		
		<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>	
			<Button type="primary" @click="ok">选择</Button>
		</div>
	</Modal>
</template>

<script>
	import moment  		from 'moment'
	import util 		from '@/libs/util'
    import common 		from '@/libs/common.mixin'
    import modal 		from '@/libs/modal.mixin'
	
	export default{
		mixins: [ common,modal],
		props: ['type', 'data'],
		data () {
			return {
				cols: [
					{
                        title: '模板名',
						key: 'name',
						width: 100
                    },
                    {
                        title: '模板内容',
                        key: 'content'
                    }
				],
				table_data: [],
				content: ''
			}
		},
		mounted() {
			this.table_data = this.data
		},
		watch: {
			'modal$.show': function (val) {
            }
		},
		methods: {
			onRowClick(row) {
				this.content = row.content;
			},
			ok () {
				this.$emit('change-content', this.content, this.type)
                this.close();
            }
        },
        computed: {
        }
		
	}
	
</script>

<style>
</style>